// ============================================================================
// tRPC SERVER UTILITIES - Server-side API calls and SSR support
// ============================================================================
// Provides server-side tRPC client for SSR, API route integration, and
// server component data fetching. Enables consistent API access patterns
// between client and server environments.

import "server-only";

import { appRouter } from "./root";
import { createTRPCContext } from "./trpc";

// ============================================================================
// 1. INTERFACES & TYPE DEFINITIONS - Server-side client configuration
// ============================================================================

interface CreateCallerOptions {
  userId?: string;
  userEmail?: string;
}

// ============================================================================
// 2. CORE FUNCTIONS - Server-side tRPC client creation
// ============================================================================

// WHY: Create server-side tRPC caller with proper context
export const createCaller = async (options: CreateCallerOptions = {}) => {
  const context = await createTRPCContext({
    req: {
      headers: {
        "x-user-id": options.userId || "server_user",
        "x-user-email": options.userEmail || "server@taskflow.ai",
      },
    } as Record<string, unknown>,
    res: {} as Record<string, unknown>,
  });

  return appRouter.createCaller(context);
};

// ============================================================================
// 3. STATE MANAGEMENT - Server-side data fetching utilities
// ============================================================================

// WHY: Simplified server-side API access for common operations
export const serverAPI = {
  // WHY: Fetch tasks for server-side rendering
  async getTasks(
    userId: string,
    filter?: { status?: string; priority?: string; search?: string }
  ) {
    const caller = await createCaller({ userId });
    return caller.tasks.list(filter);
  },

  // WHY: Get task statistics for dashboard SSR
  async getTaskStats(userId: string) {
    const caller = await createCaller({ userId });
    return caller.tasks.getStats();
  },

  // WHY: Server-side task creation (useful for API routes)
  async createTask(
    userId: string,
    data: {
      title: string;
      description?: string;
      priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
      dueDate?: Date;
      tags?: string[];
    }
  ) {
    const caller = await createCaller({ userId });
    return caller.tasks.create(data);
  },

  // WHY: Server-side task updates (useful for webhooks, etc.)
  async updateTask(
    userId: string,
    taskId: string,
    data: {
      title?: string;
      description?: string;
      status?: "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
      priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
      dueDate?: Date;
      tags?: string[];
    }
  ) {
    const caller = await createCaller({ userId });
    return caller.tasks.update({ id: taskId, ...data });
  },

  // WHY: Server-side task deletion (useful for cleanup jobs)
  async deleteTask(userId: string, taskId: string) {
    const caller = await createCaller({ userId });
    return caller.tasks.delete({ id: taskId });
  },
};

// ============================================================================
// 4. EVENT HANDLERS - Server-side batch operations
// ============================================================================

// WHY: Efficient bulk operations for server-side processing
export const bulkOperations = {
  // WHY: Bulk status updates for administrative operations
  async bulkUpdateStatus(
    userId: string,
    taskIds: string[],
    status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  ) {
    const caller = await createCaller({ userId });
    return caller.tasks.bulkUpdateStatus({ taskIds, status });
  },

  // WHY: Bulk task creation for data import/seeding
  async bulkCreateTasks(
    userId: string,
    tasks: Array<{
      title: string;
      description?: string;
      priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
      dueDate?: Date;
      tags?: string[];
    }>
  ) {
    const caller = await createCaller({ userId });
    const results = [];

    for (const taskData of tasks) {
      try {
        const result = await caller.tasks.create(taskData);
        results.push(result);
      } catch (error) {
        console.error(`Failed to create task: ${taskData.title}`, error);
      }
    }

    return results;
  },
};

// ============================================================================
// 5. REACT COMPONENT LOGIC - SSR helpers and utilities
// ============================================================================

// WHY: Server-side data prefetching for SSR pages
export const ssrHelpers = {
  // WHY: Prefetch user tasks for homepage SSR
  async prefetchUserTasks(userId: string) {
    const tasks = await serverAPI.getTasks(userId);
    const stats = await serverAPI.getTaskStats(userId);

    return {
      tasks: tasks.data || [],
      stats: stats.data || { total: 0, byStatus: {}, byPriority: {} },
      meta: {
        prefetchedAt: new Date(),
        userId,
      },
    };
  },

  // WHY: Generate static props for task pages
  async getTaskPageProps(userId: string, taskId: string) {
    try {
      const caller = await createCaller({ userId });
      const task = await caller.tasks.getById({ id: taskId });

      if (!task.success || !task.data) {
        return { notFound: true };
      }

      return {
        props: {
          task: task.data,
          meta: {
            userId,
            taskId,
            fetchedAt: new Date().toISOString(),
          },
        },
      };
    } catch (error) {
      console.error("Failed to fetch task for SSR:", error);
      return { notFound: true };
    }
  },
};

// ============================================================================
// 6. CLEANUP & MEMORY MANAGEMENT - Server-side error handling
// ============================================================================

// WHY: Centralized error handling for server-side operations
export const handleServerError = (error: unknown, context: string) => {
  console.error(`[Server API Error] ${context}:`, error);

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      context,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    success: false,
    error: "Unknown server error",
    context,
    timestamp: new Date().toISOString(),
  };
};

// ============================================================================
// 7. RENDER LOGIC - Server-side performance monitoring
// ============================================================================

// WHY: Monitor server-side API performance
export const serverMetrics = {
  async measureAPICall<T>(
    operation: string,
    apiCall: () => Promise<T>
  ): Promise<{ result: T; metrics: { duration: number; timestamp: Date } }> {
    const start = Date.now();

    try {
      const result = await apiCall();
      const duration = Date.now() - start;

      console.log(`[Server Metrics] ${operation}: ${duration}ms`);

      return {
        result,
        metrics: {
          duration,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      const duration = Date.now() - start;
      console.error(
        `[Server Metrics] ${operation} failed after ${duration}ms:`,
        error
      );
      throw error;
    }
  },
};

// ============================================================================
// 8. MOBILE-OPTIMIZED STYLES - Export server API and types
// ============================================================================

// WHY: Export appRouter for external server-side usage
export { appRouter };

// WHY: Export context creator for custom server integrations
export { createTRPCContext };
