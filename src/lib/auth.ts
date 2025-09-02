// ============================================================================
// NEXTAUTH CONFIGURATION - OAuth 2.0 authentication for TaskFlow AI Assistant
// ============================================================================
// Implements NextAuth.js with Google OAuth provider, Prisma adapter integration,
// and session management for tRPC authentication context

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

// ============================================================================
// 1. INTERFACES & TYPE DEFINITIONS - Session and user types
// ============================================================================

// Extend NextAuth session to include user ID for tRPC context
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
  }
}

// ============================================================================
// 2. CORE FUNCTIONS - Prisma client and adapter setup
// ============================================================================

// WHY: Singleton Prisma client for NextAuth adapter
const prisma = new PrismaClient();

// ============================================================================
// 3. STATE MANAGEMENT - NextAuth configuration
// ============================================================================

export const authOptions: NextAuthOptions = {
  // WHY: Prisma adapter for database session storage
  adapter: PrismaAdapter(prisma),

  // WHY: OAuth providers for enterprise-grade authentication
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],

  // WHY: Database sessions for production reliability
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // WHY: Custom pages for branded authentication flow
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  // ============================================================================
  // 4. EVENT HANDLERS - Session and JWT callbacks
  // ============================================================================

  callbacks: {
    // WHY: Include user ID in session for tRPC context
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },

    // WHY: Include user ID in JWT for session management
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },

    // WHY: Control sign-in authorization (can add custom logic)
    async signIn() {
      // Allow all Google OAuth sign-ins by default
      // Add custom authorization logic here if needed
      return true;
    },
  },

  // ============================================================================
  // 5. REACT COMPONENT LOGIC - Event handlers for debugging
  // ============================================================================

  events: {
    async signIn({ user }) {
      console.log("User signed in:", { userId: user.id, email: user.email });
    },
    async signOut({ session }) {
      console.log("User signed out:", { userId: session?.user?.id });
    },
    async createUser({ user }) {
      console.log("New user created:", { userId: user.id, email: user.email });
    },
  },

  // ============================================================================
  // 6. CLEANUP & MEMORY MANAGEMENT - Security and debugging configuration
  // ============================================================================

  // WHY: Enable debugging in development environment
  debug: process.env.NODE_ENV === "development",

  // WHY: Custom secret for JWT signing (production security)
  secret: process.env.NEXTAUTH_SECRET,
};

// ============================================================================
// 7. RENDER LOGIC - Utility functions for authentication
// ============================================================================

// WHY: Helper function to get current user session
export async function getCurrentUser(_req: Request) {
  // This will be implemented when we set up the auth handlers
  return null;
}

// ============================================================================
// 8. MOBILE-OPTIMIZED STYLES - Export configuration and types
// ============================================================================

export { prisma };
export default authOptions;
