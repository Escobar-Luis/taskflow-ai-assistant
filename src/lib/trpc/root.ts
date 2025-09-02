// ============================================================================
// ROOT tRPC ROUTER - Main API router combining all sub-routers
// ============================================================================
// Centralizes all tRPC routers for type-safe API access across the application.
// Provides single entry point for frontend-backend communication with
// end-to-end type safety and optimized bundle splitting.

import { createTRPCRouter } from "./trpc";
import { tasksRouter } from "./routers/tasks";

// ============================================================================
// 1. INTERFACES & TYPE DEFINITIONS - Root API structure
// ============================================================================

// WHY: Single source of truth for all API endpoints
export const appRouter = createTRPCRouter({
  tasks: tasksRouter,
  // TODO: Add additional routers as the app grows
  // ai: aiRouter,
  // users: usersRouter,
  // realtime: realtimeRouter,
});

// ============================================================================
// 2. CORE FUNCTIONS - Type inference and exports
// ============================================================================

// WHY: Export router type for client-side type inference
export type AppRouter = typeof appRouter;

// ============================================================================
// 3. STATE MANAGEMENT - Router configuration and middleware
// ============================================================================

// WHY: Centralized router configuration for consistent behavior
export const createAppRouter = () => appRouter;

// ============================================================================
// 4. EVENT HANDLERS - Router health check and diagnostics
// ============================================================================

// WHY: Monitor router performance and availability
export const getRouterInfo = () => ({
  totalRouters: Object.keys(appRouter._def.router).length,
  availableRouters: Object.keys(appRouter._def.router),
  version: "1.0.0",
  timestamp: new Date().toISOString(),
});
