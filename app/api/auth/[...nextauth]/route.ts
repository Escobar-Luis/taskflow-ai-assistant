// ============================================================================
// NEXTAUTH API ROUTE HANDLERS - App Router authentication endpoints
// ============================================================================
// Implements NextAuth.js API routes for Next.js App Router with OAuth 2.0
// authentication flow and session management

import NextAuth from "next-auth";
import { authOptions } from "@/src/lib/auth";

// ============================================================================
// 1. INTERFACES & TYPE DEFINITIONS - NextAuth handler setup
// ============================================================================

// WHY: Create NextAuth handlers for App Router
const handler = NextAuth(authOptions);

// ============================================================================
// 2. CORE FUNCTIONS - HTTP method exports for App Router
// ============================================================================

// WHY: Export GET and POST handlers for NextAuth API routes
export { handler as GET, handler as POST };
