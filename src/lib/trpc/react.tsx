// ============================================================================
// tRPC REACT CLIENT - Frontend integration with React Query
// ============================================================================
// Provides type-safe client-side API access with React Query integration,
// optimistic updates, background refetching, and error handling.
// Enables end-to-end type safety from database to UI components.

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import superjson from "superjson";

import type { AppRouter } from "./root";

// ============================================================================
// 1. INTERFACES & TYPE DEFINITIONS - Client configuration
// ============================================================================

interface TRPCReactProviderProps {
  children: React.ReactNode;
}

// ============================================================================
// 2. CORE FUNCTIONS - tRPC React client initialization
// ============================================================================

// WHY: Create tRPC React hooks with type inference from AppRouter
export const api = createTRPCReact<AppRouter>();

// WHY: Get base URL for tRPC endpoints with environment detection
function getBaseUrl() {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
}

// ============================================================================
// 3. STATE MANAGEMENT - React Query client configuration
// ============================================================================

// WHY: Optimized React Query configuration for task management
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // WHY: Cache queries for 1 minute to reduce API calls
        staleTime: 60 * 1000,
        // WHY: Keep data for 5 minutes after component unmounts
        gcTime: 5 * 60 * 1000,
        // WHY: Retry failed queries 3 times with exponential backoff
        retry: 3,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        // WHY: Refetch on window focus for real-time feel
        refetchOnWindowFocus: true,
        // WHY: Enable background refetching for fresh data
        refetchOnMount: true,
      },
      mutations: {
        // WHY: Retry mutations once for network hiccups
        retry: 1,
        // WHY: Show error notifications for failed mutations
        onError: error => {
          console.error("Mutation failed:", error);
          // TODO: Integrate with toast notification system
        },
      },
    },
  });
}

// ============================================================================
// 4. EVENT HANDLERS - tRPC client configuration
// ============================================================================

// WHY: Configure tRPC client with optimized settings
function createTRPCClient() {
  return api.createClient({
    transformer: superjson,
    links: [
      // WHY: Enable detailed logging in development
      loggerLink({
        enabled: opts =>
          process.env.NODE_ENV === "development" ||
          (opts.direction === "down" && opts.result instanceof Error),
      }),
      // WHY: HTTP batch streaming for optimal performance
      unstable_httpBatchStreamLink({
        url: `${getBaseUrl()}/api/trpc`,
        headers() {
          return {
            // TODO: Add authentication headers
            "Content-Type": "application/json",
          };
        },
        // WHY: Batch multiple requests within 20ms window
        maxURLLength: 2083,
        // WHY: Enable request batching for performance
        maxBatchSize: 10,
      }),
    ],
  });
}

// ============================================================================
// 5. REACT COMPONENT LOGIC - Provider component for app-wide access
// ============================================================================

// WHY: Provide tRPC and React Query to entire application
export function TRPCReactProvider({ children }: TRPCReactProviderProps) {
  const [queryClient] = useState(() => createQueryClient());
  const [trpcClient] = useState(() => createTRPCClient());

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
        {/* WHY: Show React Query devtools in development */}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </api.Provider>
    </QueryClientProvider>
  );
}

// ============================================================================
// 6. CLEANUP & MEMORY MANAGEMENT - Client utilities and helpers
// ============================================================================

// WHY: Utility to invalidate all queries (useful for logout, etc.)
export function useInvalidateAll() {
  const utils = api.useUtils();

  return () => {
    utils.invalidate();
  };
}

// WHY: Utility to prefetch data for better UX
export function usePrefetchTasks() {
  const utils = api.useUtils();

  return () => {
    utils.tasks.list.prefetch();
  };
}

// ============================================================================
// 7. RENDER LOGIC - Performance monitoring and diagnostics
// ============================================================================

// WHY: Monitor tRPC client performance and connection health
export function useAPIHealth() {
  const [health, setHealth] = useState<{
    status: "healthy" | "unhealthy" | "checking";
    lastCheck: Date | null;
    responseTime: number | null;
  }>({
    status: "checking",
    lastCheck: null,
    responseTime: null,
  });

  const checkHealth = async () => {
    const start = Date.now();
    setHealth(prev => ({ ...prev, status: "checking" }));

    try {
      // Simple health check using task count query
      await api.tasks.getStats.fetch();
      const responseTime = Date.now() - start;

      setHealth({
        status: "healthy",
        lastCheck: new Date(),
        responseTime,
      });
    } catch {
      setHealth({
        status: "unhealthy",
        lastCheck: new Date(),
        responseTime: Date.now() - start,
      });
    }
  };

  return { ...health, checkHealth };
}

// ============================================================================
// 8. MOBILE-OPTIMIZED STYLES - Export utilities and types
// ============================================================================

// WHY: Export type-safe API utilities for components
export type APIUtils = ReturnType<typeof api.useUtils>;

// WHY: Export router type for external type checking
export type { AppRouter } from "./root";
