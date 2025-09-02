// ============================================================================
// DATABASE CONNECTION - Singleton Prisma client for optimal performance
// ============================================================================
// Provides centralized database access with connection pooling, error handling,
// and development-optimized singleton pattern to prevent connection issues
// during hot reloads in Next.js development environment.

import { PrismaClient } from "@prisma/client";

// ============================================================================
// 1. INTERFACES & TYPE DEFINITIONS - Database connection configuration
// ============================================================================

declare global {
  var cachedPrisma: PrismaClient | undefined;
}

// WHY: Extended Prisma client with custom error handling and logging
interface ExtendedPrismaClient extends PrismaClient {
  isConnected(): Promise<boolean>;
  getConnectionInfo(): {
    url: string | undefined;
    provider: string;
    database: string | undefined;
  };
}

// ============================================================================
// 2. CORE FUNCTIONS - Prisma client initialization and configuration
// ============================================================================

// WHY: Optimized Prisma client with logging and error handling
function createPrismaClient(): ExtendedPrismaClient {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    errorFormat: "pretty",
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  }) as ExtendedPrismaClient;

  // WHY: Add custom methods for connection monitoring
  client.isConnected = async function (): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error("Database connection failed:", error);
      return false;
    }
  };

  client.getConnectionInfo = function () {
    return {
      url: process.env.DATABASE_URL?.replace(/:[^:]*@/, ":****@"), // Hide password
      provider: "postgresql",
      database: process.env.DATABASE_URL?.split("/").pop()?.split("?")[0],
    };
  };

  return client;
}

// ============================================================================
// 3. STATE MANAGEMENT - Singleton pattern for development optimization
// ============================================================================

// WHY: Prevent multiple Prisma instances during development hot reloads
let prisma: ExtendedPrismaClient;

if (process.env.NODE_ENV === "production") {
  // WHY: Create new instance for each serverless function in production
  prisma = createPrismaClient();
} else {
  // WHY: Reuse existing instance during development to prevent connection exhaustion
  if (!global.cachedPrisma) {
    global.cachedPrisma = createPrismaClient();
  }
  prisma = global.cachedPrisma as ExtendedPrismaClient;
}

// ============================================================================
// 4. EVENT HANDLERS - Connection lifecycle and error handling
// ============================================================================

// WHY: Graceful shutdown handling for production deployments
process.on("beforeExit", async () => {
  console.log("Disconnecting from database...");
  await prisma.$disconnect();
});

// WHY: Handle uncaught errors to prevent connection leaks
process.on("SIGINT", async () => {
  console.log("Received SIGINT, disconnecting from database...");
  await prisma.$disconnect();
  process.exit(0);
});

// ============================================================================
// 5. REACT COMPONENT LOGIC - Database health monitoring
// ============================================================================

// WHY: Monitor database connection health for application diagnostics
export async function checkDatabaseHealth(): Promise<{
  status: "healthy" | "unhealthy";
  responseTime: number;
  connectionInfo: ReturnType<ExtendedPrismaClient["getConnectionInfo"]>;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    const isConnected = await prisma.isConnected();
    const responseTime = Date.now() - startTime;

    return {
      status: isConnected ? "healthy" : "unhealthy",
      responseTime,
      connectionInfo: prisma.getConnectionInfo(),
      error: isConnected ? undefined : "Connection test failed",
    };
  } catch (error) {
    return {
      status: "unhealthy",
      responseTime: Date.now() - startTime,
      connectionInfo: prisma.getConnectionInfo(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// 6. CLEANUP & MEMORY MANAGEMENT - Connection utilities
// ============================================================================

// WHY: Manual connection management for testing and maintenance
export async function connectToDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("✅ Connected to database successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log("✅ Disconnected from database successfully");
  } catch (error) {
    console.error("❌ Database disconnection failed:", error);
    throw error;
  }
}

// ============================================================================
// 7. RENDER LOGIC - Database performance monitoring
// ============================================================================

// WHY: Performance metrics for database operation optimization
export async function getDatabaseMetrics(): Promise<{
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };
  performance: {
    averageQueryTime: number;
    slowQueries: number;
  };
  health: Awaited<ReturnType<typeof checkDatabaseHealth>>;
}> {
  // Note: This is a simplified implementation
  // In production, you would integrate with actual Prisma metrics
  const health = await checkDatabaseHealth();

  return {
    connectionPool: {
      active: 1, // Simplified for demo
      idle: 0,
      total: 1,
    },
    performance: {
      averageQueryTime: health.responseTime,
      slowQueries: 0,
    },
    health,
  };
}

// ============================================================================
// 8. MOBILE-OPTIMIZED STYLES - Export singleton instance
// ============================================================================

// WHY: Single source of truth for database access across the application
export default prisma;

// WHY: Named export for explicit imports
export { prisma };
