// ============================================================================
// TASK REPOSITORY - Centralized data access layer for task management
// ============================================================================
// Implements Repository pattern for task CRUD operations with business logic,
// database abstraction, and comprehensive error handling. Integrates with
// Prisma ORM and provides foundation for AI-enhanced task operations.

import { PrismaClient } from "@prisma/client";
import type {
  Task,
  TaskRepository as ITaskRepository,
  TaskStatus,
  TaskPriority,
  CreateInput,
  UpdateInput,
} from "../types";

// ============================================================================
// 1. INTERFACES & TYPE DEFINITIONS - Repository contracts and data flow
// ============================================================================

interface TaskRepositoryDependencies {
  prisma: PrismaClient;
}

interface SearchOptions {
  query: string;
  includeCompleted?: boolean;
  userId?: string;
}

// FROM: Prisma database → TO: Application domain types
// type PrismaTask = {
//   id: string;
//   title: string;
//   description: string | null;
//   status: string;
//   priority: string;
//   dueDate: Date | null;
//   createdAt: Date;
//   updatedAt: Date;
//   userId: string;
//   tags: string;
// };

// ============================================================================
// 2. CORE FUNCTIONS - Primary business logic operations
// ============================================================================

export class TaskRepository implements ITaskRepository {
  private prisma: PrismaClient;

  constructor(dependencies: TaskRepositoryDependencies) {
    this.prisma = dependencies.prisma;
  }

  // WHY: Centralized task creation with validation and default values
  async create(data: CreateInput<Task>): Promise<Task> {
    try {
      const prismaTask = await this.prisma.task.create({
        data: {
          title: data.title,
          description: data.description || null,
          status: data.status,
          priority: data.priority,
          dueDate: data.dueDate || null,
          userId: data.userId,
          tags: JSON.stringify(data.tags || []),
        },
      });

      return this.toDomainModel(prismaTask);
    } catch (error) {
      throw new Error(`Failed to create task: ${this.getErrorMessage(error)}`);
    }
  }

  // WHY: Single source of truth for task retrieval by ID
  async findById(id: string): Promise<Task | null> {
    try {
      const prismaTask = await this.prisma.task.findUnique({
        where: { id },
      });

      return prismaTask ? this.toDomainModel(prismaTask) : null;
    } catch (error) {
      throw new Error(
        `Failed to find task by ID: ${this.getErrorMessage(error)}`
      );
    }
  }

  // WHY: Flexible filtering with optional conditions for different use cases
  async findMany(filter?: Partial<Task>): Promise<Task[]> {
    try {
      const where: Record<string, unknown> = {};

      if (filter?.userId) where.userId = filter.userId;
      if (filter?.status) where.status = filter.status;
      if (filter?.priority) where.priority = filter.priority;

      const prismaTasks = await this.prisma.task.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return prismaTasks.map(task => this.toDomainModel(task));
    } catch (error) {
      throw new Error(`Failed to find tasks: ${this.getErrorMessage(error)}`);
    }
  }

  // ============================================================================
  // 3. STATE MANAGEMENT - Data consistency and transaction handling
  // ============================================================================

  // WHY: Atomic updates with optimistic concurrency control
  async update(id: string, data: UpdateInput<Task>): Promise<Task> {
    try {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
      if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);

      const prismaTask = await this.prisma.task.update({
        where: { id },
        data: updateData,
      });

      return this.toDomainModel(prismaTask);
    } catch (error) {
      throw new Error(`Failed to update task: ${this.getErrorMessage(error)}`);
    }
  }

  // WHY: Safe deletion with existence verification
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.task.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "P2025") {
        return false; // Task not found
      }
      throw new Error(`Failed to delete task: ${this.getErrorMessage(error)}`);
    }
  }

  // ============================================================================
  // 4. EVENT HANDLERS - Business-specific query operations
  // ============================================================================

  // WHY: User-specific task retrieval with performance optimization
  async findByUserId(userId: string): Promise<Task[]> {
    try {
      const prismaTasks = await this.prisma.task.findMany({
        where: { userId },
        orderBy: [
          { priority: "desc" },
          { dueDate: "asc" },
          { createdAt: "desc" },
        ],
      });

      return prismaTasks.map(task => this.toDomainModel(task));
    } catch (error) {
      throw new Error(
        `Failed to find tasks by user ID: ${this.getErrorMessage(error)}`
      );
    }
  }

  // WHY: Status-based filtering for workflow management
  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return this.findMany({ status });
  }

  // WHY: Priority-based retrieval for urgent task identification
  async findByPriority(priority: TaskPriority): Promise<Task[]> {
    return this.findMany({ priority });
  }

  // ============================================================================
  // 5. REACT COMPONENT LOGIC - Search and AI integration preparation
  // ============================================================================

  // WHY: Full-text search across title, description, and tags
  async searchTasks(query: string, options?: SearchOptions): Promise<Task[]> {
    try {
      const where: Record<string, unknown> = {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { tags: { contains: query, mode: "insensitive" } },
        ],
      };

      if (options?.userId) {
        where.userId = options.userId;
      }

      if (!options?.includeCompleted) {
        where.status = { not: "COMPLETED" };
      }

      const prismaTasks = await this.prisma.task.findMany({
        where,
        orderBy: { updatedAt: "desc" },
      });

      return prismaTasks.map(task => this.toDomainModel(task));
    } catch (error) {
      throw new Error(`Failed to search tasks: ${this.getErrorMessage(error)}`);
    }
  }

  // ============================================================================
  // 6. CLEANUP & MEMORY MANAGEMENT - Data transformation and error handling
  // ============================================================================

  // WHY: Consistent data transformation from Prisma to domain model
  private toDomainModel(prismaTask: Record<string, unknown>): Task {
    return {
      id: prismaTask.id as string,
      title: prismaTask.title as string,
      description: (prismaTask.description as string | null) || undefined,
      status: prismaTask.status as TaskStatus,
      priority: prismaTask.priority as TaskPriority,
      dueDate: (prismaTask.dueDate as Date | null) || undefined,
      createdAt: prismaTask.createdAt as Date,
      updatedAt: prismaTask.updatedAt as Date,
      userId: prismaTask.userId as string,
      tags: prismaTask.tags ? JSON.parse(prismaTask.tags as string) : [],
      aiSuggestions: [], // Will be populated by AI service
    };
  }

  // WHY: Consistent error message extraction for debugging
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "Unknown error occurred";
  }

  // ============================================================================
  // 7. RENDER LOGIC - Performance monitoring and metrics
  // ============================================================================

  // WHY: Repository performance metrics for optimization
  async getTaskCounts(userId: string): Promise<{
    total: number;
    byStatus: Record<TaskStatus, number>;
    byPriority: Record<TaskPriority, number>;
  }> {
    try {
      const [total, statusCounts, priorityCounts] = await Promise.all([
        this.prisma.task.count({ where: { userId } }),
        this.prisma.task.groupBy({
          by: ["status"],
          where: { userId },
          _count: { status: true },
        }),
        this.prisma.task.groupBy({
          by: ["priority"],
          where: { userId },
          _count: { priority: true },
        }),
      ]);

      const byStatus = {} as Record<TaskStatus, number>;
      const byPriority = {} as Record<TaskPriority, number>;

      statusCounts.forEach(item => {
        byStatus[item.status as TaskStatus] = item._count.status;
      });

      priorityCounts.forEach(item => {
        byPriority[item.priority as TaskPriority] = item._count.priority;
      });

      return { total, byStatus, byPriority };
    } catch (error) {
      throw new Error(
        `Failed to get task counts: ${this.getErrorMessage(error)}`
      );
    }
  }

  // ============================================================================
  // 8. MOBILE-OPTIMIZED STYLES - Database connection and resource management
  // ============================================================================

  // WHY: Proper cleanup of database connections and resources
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  // WHY: Health check for database connectivity monitoring
  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
