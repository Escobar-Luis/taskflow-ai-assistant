// ============================================================================
// AUTHENTICATION ERROR PAGE - Error handling for OAuth failures
// ============================================================================
// Displays user-friendly error messages for authentication failures
// with Linear-inspired minimal design and recovery options

"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

// ============================================================================
// 1. INTERFACES & TYPE DEFINITIONS - Error types and states
// ============================================================================

// ============================================================================
// 2. CORE FUNCTIONS - Error page component
// ============================================================================

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // ============================================================================
  // 3. STATE MANAGEMENT - Error message mapping
  // ============================================================================

  // WHY: Map error codes to user-friendly messages
  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return {
          title: "Server Configuration Error",
          description:
            "There is a problem with the server configuration. Please contact support.",
          action: "Contact Support",
        };
      case "AccessDenied":
        return {
          title: "Access Denied",
          description:
            "You do not have permission to sign in. Please contact your administrator.",
          action: "Try Again",
        };
      case "Verification":
        return {
          title: "Verification Failed",
          description:
            "The verification token has expired or is invalid. Please try signing in again.",
          action: "Sign In",
        };
      case "Default":
      default:
        return {
          title: "Authentication Error",
          description:
            "An error occurred during authentication. Please try signing in again.",
          action: "Try Again",
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  // ============================================================================
  // 4. EVENT HANDLERS - Navigation and retry actions
  // ============================================================================

  // ============================================================================
  // 5. REACT COMPONENT LOGIC - Error state display
  // ============================================================================

  // ============================================================================
  // 6. CLEANUP & MEMORY MANAGEMENT - Component cleanup
  // ============================================================================

  // ============================================================================
  // 7. RENDER LOGIC - Linear-inspired error page
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Error icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {errorInfo.title}
          </h1>
          <p className="text-gray-600 mb-8 max-w-sm mx-auto">
            {errorInfo.description}
          </p>

          {/* Action buttons */}
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {errorInfo.action}
            </Link>

            <Link
              href="/"
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Back to Home
            </Link>
          </div>

          {/* Debug info in development */}
          {process.env.NODE_ENV === "development" && error && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Debug Information
              </h3>
              <code className="text-xs text-gray-600">Error Code: {error}</code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 7. RENDER LOGIC - Suspense wrapper for useSearchParams
// ============================================================================

export default function AuthError() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <svg
                  className="animate-spin h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Loading...
              </h1>
            </div>
          </div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}

// ============================================================================
// 8. MOBILE-OPTIMIZED STYLES - Error page mobile considerations
// ============================================================================

// Mobile optimizations:
// - Centered layout works well on all screen sizes
// - Touch-friendly button sizes
// - Proper spacing and readability
// - Accessible color contrast ratios
