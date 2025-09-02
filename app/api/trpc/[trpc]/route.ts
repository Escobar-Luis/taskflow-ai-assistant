// ============================================================================
// tRPC API ROUTE HANDLER - Next.js App Router integration
// ============================================================================
// Handles all tRPC requests in Next.js 13+ App Router architecture.
// Provides seamless integration between tRPC server and Next.js API routes
// with proper error handling and context management.

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/lib/trpc/root";
import { createTRPCContext } from "@/lib/trpc/trpc";

// ============================================================================
// 1. INTERFACES & TYPE DEFINITIONS - Request handling configuration
// ============================================================================

// WHY: Configure tRPC request handler for Next.js App Router
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      // WHY: Create context from Next.js Request object
      const headers = Object.fromEntries(req.headers.entries());

      return createTRPCContext({
        req: {
          headers,
          url: req.url,
          method: req.method,
        } as Record<string, unknown>,
        res: {} as Record<string, unknown>, // Not available in App Router
      });
    },
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

// ============================================================================
// 2. CORE FUNCTIONS - HTTP method exports for App Router
// ============================================================================

// WHY: Export all HTTP methods that tRPC supports
export { handler as GET, handler as POST };

// ============================================================================
// 3. STATE MANAGEMENT - Route configuration
// ============================================================================

// WHY: Configure route segment for dynamic tRPC paths
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================================
// 4. EVENT HANDLERS - Error handling and monitoring
// ============================================================================

// WHY: Custom error boundary for tRPC route failures
export async function OPTIONS(_request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
