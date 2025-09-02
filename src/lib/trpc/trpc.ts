// ============================================================================
// tRPC CONFIGURATION - Type-safe API client and server setup
// ============================================================================
// Establishes end-to-end type safety between frontend and backend,
// with superjson serialization, error handling, and authentication context

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";

// ============================================================================
// 1. INTERFACES & TYPE DEFINITIONS - Context and middleware types
// ============================================================================

export interface Context {
  userId?: string;
  userEmail?: string;
  req?: CreateNextContextOptions["req"];
  res?: CreateNextContextOptions["res"];
}

// ============================================================================
// 2. CORE FUNCTIONS - tRPC instance creation and configuration
// ============================================================================

// WHY: Initialize tRPC with superjson for Date/Map/Set serialization support
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// ============================================================================
// 3. STATE MANAGEMENT - Context creation and authentication
// ============================================================================

// WHY: Create context with user authentication and request/response objects
export const createTRPCContext = async (
  opts: CreateNextContextOptions
): Promise<Context> => {
  const { req, res } = opts;

  // TODO: Implement proper authentication
  // For now, mock user authentication for demonstration
  const mockUserId = (req.headers["x-user-id"] as string) || "user_demo";
  const mockUserEmail =
    (req.headers["x-user-email"] as string) || "demo@taskflow.ai";

  return {
    userId: mockUserId,
    userEmail: mockUserEmail,
    req,
    res,
  };
};

// ============================================================================
// 4. EVENT HANDLERS - Middleware for authentication and logging
// ============================================================================

// WHY: Authentication middleware to protect endpoints
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId || !ctx.userEmail) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User must be authenticated to access this resource",
    });
  }
  return next({
    ctx: {
      ...ctx,
      // Ensure userId and userEmail are defined
      userId: ctx.userId,
      userEmail: ctx.userEmail,
    },
  });
});

// WHY: Logging middleware for API performance monitoring
const loggingMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;

  console.log(`[tRPC] ${type} ${path} - ${duration}ms`);

  return result;
});

// ============================================================================
// 5. REACT COMPONENT LOGIC - Procedure builders and exports
// ============================================================================

// WHY: Base router for creating API endpoints
export const createTRPCRouter = t.router;

// WHY: Public procedure (no authentication required)
export const publicProcedure = t.procedure.use(loggingMiddleware);

// WHY: Protected procedure (authentication required)
export const protectedProcedure = t.procedure
  .use(loggingMiddleware)
  .use(enforceUserIsAuthed);

// ============================================================================
// 6. CLEANUP & MEMORY MANAGEMENT - Error handling utilities
// ============================================================================

// WHY: Standardized error creation for consistent API responses
export const createTRPCError = (
  code: TRPCError["code"],
  message: string,
  cause?: unknown
): TRPCError => {
  return new TRPCError({ code, message, cause });
};

// ============================================================================
// 7. RENDER LOGIC - Type inference helpers
// ============================================================================

// WHY: Type inference for router and API types
export type CreateTRPCRouter = typeof createTRPCRouter;
export type ProtectedProcedure = typeof protectedProcedure;
export type PublicProcedure = typeof publicProcedure;

// ============================================================================
// 8. MOBILE-OPTIMIZED STYLES - Export utilities for client-side usage
// ============================================================================

// WHY: Export tRPC instance for use in other parts of the application
export { t };

// WHY: Type-safe context access in procedures
export type TRPCContext = Context;
