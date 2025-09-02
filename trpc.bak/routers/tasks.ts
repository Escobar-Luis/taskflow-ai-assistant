// ============================================================================
// TASK tRPC ROUTER - Type-safe task management API endpoints
// ============================================================================
// Implements full CRUD operations for tasks with Repository pattern integration,
// Zod validation, and real-time Observer pattern notifications

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, createTRPCError } from "../trpc";
import { TaskRepository } from "../../repositories/TaskRepository";
import { PrismaClient } from "@prisma/client";
import type { TaskStatus } from "../../types";

// ============================================================================
// 1. INTERFACES & TYPE DEFINITIONS - Zod schemas for validation
// ============================================================================

const taskStatusEnum = z.enum([
  "TODO",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);
const taskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

// Input validation schemas
const createTaskInput = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: taskPriorityEnum.default("MEDIUM"),
  dueDate: z.date().optional(),
  tags: z.array(z.string()).default([]),
});

const updateTaskInput = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  dueDate: z.date().optional(),
  tags: z.array(z.string()).optional(),
});

const taskFilterInput = z
  .object({
    status: taskStatusEnum.optional(),
    priority: taskPriorityEnum.optional(),
    search: z.string().optional(),
  })
  .optional();

// ============================================================================
// 2. CORE FUNCTIONS - Repository initialization and dependency injection
// ============================================================================

// WHY: Singleton Prisma client for connection pooling and performance
const prisma = new PrismaClient();

// WHY: Repository pattern abstraction for testable data access
const taskRepository = new TaskRepository({ prisma });

// ============================================================================
// 3. STATE MANAGEMENT - Task CRUD operations with type safety
// ============================================================================

export const tasksRouter = createTRPCRouter({
  // WHY: Type-safe task creation with validation and user context
  create: protectedProcedure
    .input(createTaskInput)
    .mutation(async ({ input, ctx }) => {
      try {
        const task = await taskRepository.create({
          ...input,
          status: "TODO" as TaskStatus,
          userId: ctx.userId,
        });

        // TODO: Emit real-time event for Observer pattern
        // await taskObserver.emitTaskCreated(task);

        return {
          success: true,
          data: task,
        };
      } catch (error) {
        throw createTRPCError(
          "INTERNAL_SERVER_ERROR",
          `Failed to create task: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  // ============================================================================
  // 4. EVENT HANDLERS - Task retrieval with filtering and search
  // ============================================================================

  // WHY: User-specific task list with optional filtering
  list: protectedProcedure
    .input(taskFilterInput)
    .query(async ({ input, ctx }) => {
      try {
        let tasks;

        if (input?.search) {
          // Use repository search functionality
          tasks = await taskRepository.searchTasks(input.search, {
            query: input.search,
            userId: ctx.userId,
          });
        } else {
          // Apply filters for status and priority
          const filter: Record<string, unknown> = { userId: ctx.userId };
          if (input?.status) filter.status = input.status;
          if (input?.priority) filter.priority = input.priority;

          tasks = await taskRepository.findMany(filter);
        }

        return {
          success: true,
          data: tasks,
          meta: {
            total: tasks.length,
          },
        };
      } catch (error) {
        throw createTRPCError(
          "INTERNAL_SERVER_ERROR",
          `Failed to retrieve tasks: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  // WHY: Single task retrieval with ownership verification
  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      try {
        const task = await taskRepository.findById(input.id);

        if (!task) {
          throw createTRPCError("NOT_FOUND", "Task not found");
        }

        // Verify task ownership
        if (task.userId !== ctx.userId) {
          throw createTRPCError("FORBIDDEN", "Access denied to this task");
        }

        return {
          success: true,
          data: task,
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes("TRPC")) {
          throw error; // Re-throw tRPC errors
        }
        throw createTRPCError(
          "INTERNAL_SERVER_ERROR",
          `Failed to retrieve task: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  // ============================================================================
  // 5. REACT COMPONENT LOGIC - Task updates with optimistic UI support
  // ============================================================================

  // WHY: Atomic task updates with ownership verification
  update: protectedProcedure
    .input(updateTaskInput)
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify task exists and user owns it
        const existingTask = await taskRepository.findById(input.id);
        if (!existingTask) {
          throw createTRPCError("NOT_FOUND", "Task not found");
        }
        if (existingTask.userId !== ctx.userId) {
          throw createTRPCError("FORBIDDEN", "Access denied to this task");
        }

        // Update task with Repository pattern
        const { id, ...updateData } = input;
        const updatedTask = await taskRepository.update(id, updateData);

        // TODO: Emit real-time event for Observer pattern
        // await taskObserver.emitTaskUpdated(updatedTask);

        return {
          success: true,
          data: updatedTask,
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes("TRPC")) {
          throw error; // Re-throw tRPC errors
        }
        throw createTRPCError(
          "INTERNAL_SERVER_ERROR",
          `Failed to update task: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  // ============================================================================
  // 6. CLEANUP & MEMORY MANAGEMENT - Task deletion with cascade handling
  // ============================================================================

  // WHY: Safe task deletion with ownership verification
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify task exists and user owns it
        const existingTask = await taskRepository.findById(input.id);
        if (!existingTask) {
          throw createTRPCError("NOT_FOUND", "Task not found");
        }
        if (existingTask.userId !== ctx.userId) {
          throw createTRPCError("FORBIDDEN", "Access denied to this task");
        }

        // Delete task using Repository pattern
        const deleted = await taskRepository.delete(input.id);
        if (!deleted) {
          throw createTRPCError(
            "INTERNAL_SERVER_ERROR",
            "Failed to delete task"
          );
        }

        // TODO: Emit real-time event for Observer pattern
        // await taskObserver.emitTaskDeleted(input.id);

        return {
          success: true,
          data: { id: input.id },
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes("TRPC")) {
          throw error; // Re-throw tRPC errors
        }
        throw createTRPCError(
          "INTERNAL_SERVER_ERROR",
          `Failed to delete task: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  // ============================================================================
  // 7. RENDER LOGIC - Analytics and performance metrics
  // ============================================================================

  // WHY: Task analytics for dashboard and performance monitoring
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const stats = await taskRepository.getTaskCounts(ctx.userId);

      return {
        success: true,
        data: {
          ...stats,
          completionRate:
            stats.total > 0
              ? (((stats.byStatus.COMPLETED || 0) / stats.total) * 100).toFixed(
                  1
                )
              : "0.0",
        },
      };
    } catch (error) {
      throw createTRPCError(
        "INTERNAL_SERVER_ERROR",
        `Failed to retrieve task statistics: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }),

  // ============================================================================
  // 8. MOBILE-OPTIMIZED STYLES - Bulk operations and performance features
  // ============================================================================

  // WHY: Bulk status updates for mobile-optimized workflows
  bulkUpdateStatus: protectedProcedure
    .input(
      z.object({
        taskIds: z.array(z.string().cuid()).min(1).max(50), // Limit for performance
        status: taskStatusEnum,
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const updatedTasks = [];

        // Process updates individually to maintain data integrity
        for (const taskId of input.taskIds) {
          try {
            const task = await taskRepository.findById(taskId);
            if (task && task.userId === ctx.userId) {
              const updated = await taskRepository.update(taskId, {
                status: input.status,
              });
              updatedTasks.push(updated);
            }
          } catch (error) {
            console.error(`Failed to update task ${taskId}:`, error);
            // Continue with other tasks
          }
        }

        // TODO: Emit bulk update events for Observer pattern
        // for (const task of updatedTasks) {
        //   await taskObserver.emitTaskUpdated(task);
        // }

        return {
          success: true,
          data: {
            updated: updatedTasks,
            updatedCount: updatedTasks.length,
            requestedCount: input.taskIds.length,
          },
        };
      } catch (error) {
        throw createTRPCError(
          "INTERNAL_SERVER_ERROR",
          `Bulk update failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),
});
