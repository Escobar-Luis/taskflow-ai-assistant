// ============================================================================
// SIGN IN PAGE - OAuth 2.0 authentication with Linear-inspired design
// ============================================================================
// Implements clean, minimal sign-in interface using NextAuth.js providers
// with Google OAuth integration and professional styling

"use client";

import { signIn, getProviders } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// ============================================================================
// 1. INTERFACES & TYPE DEFINITIONS - Authentication provider types
// ============================================================================

type Provider = {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
};

type Providers = Record<string, Provider>;

// ============================================================================
// 2. CORE FUNCTIONS - Provider loading and authentication
// ============================================================================

export default function SignIn() {
  const [providers, setProviders] = useState<Providers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // ============================================================================
  // 3. STATE MANAGEMENT - Load authentication providers
  // ============================================================================

  // WHY: Load available OAuth providers on component mount
  useEffect(() => {
    const loadProviders = async () => {
      const availableProviders = await getProviders();
      setProviders(availableProviders);
      setIsLoading(false);
    };
    loadProviders();
  }, []);

  // ============================================================================
  // 4. EVENT HANDLERS - OAuth sign-in handling
  // ============================================================================

  // WHY: Handle OAuth provider sign-in with proper redirect
  const handleSignIn = async (providerId: string) => {
    setIsLoading(true);
    await signIn(providerId, {
      callbackUrl: "/dashboard",
    });
  };

  // WHY: Get error message for display
  const getErrorMessage = (error: string) => {
    switch (error) {
      case "OAuthSignin":
        return "Error occurred during sign-in. Please try again.";
      case "OAuthCallback":
        return "Error occurred during authentication. Please try again.";
      case "OAuthCreateAccount":
        return "Could not create account. Please contact support.";
      case "EmailCreateAccount":
        return "Could not create account with that email.";
      case "Callback":
        return "Authentication callback error. Please try again.";
      default:
        return "An unknown error occurred. Please try again.";
    }
  };

  // ============================================================================
  // 5. REACT COMPONENT LOGIC - Loading and error states
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ============================================================================
  // 6. CLEANUP & MEMORY MANAGEMENT - Error handling
  // ============================================================================

  if (!providers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Error
          </h1>
          <p className="text-gray-600">
            Could not load authentication providers. Please refresh the page.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 7. RENDER LOGIC - Linear-inspired authentication UI
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and branding */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TaskFlow</h1>
          <p className="text-gray-600 text-sm">
            AI-powered task management platform
          </p>
        </div>

        {/* Authentication card */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10 border border-gray-200">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Sign in to TaskFlow
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Continue with your preferred authentication method
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                  <div className="text-sm text-red-800">
                    {getErrorMessage(error)}
                  </div>
                </div>
              )}

              {/* Provider buttons */}
              <div className="space-y-3">
                {Object.values(providers).map(provider => (
                  <button
                    key={provider.name}
                    onClick={() => handleSignIn(provider.id)}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {provider.name === "Google" && (
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path
                          fill="#4285f4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34a853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#fbbc05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#ea4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    Continue with {provider.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 8. MOBILE-OPTIMIZED STYLES - Responsive design considerations
// ============================================================================

// Mobile optimizations:
// - Responsive padding and spacing for small screens
// - Touch-friendly button sizes (min 44px height)
// - Proper contrast ratios for accessibility
// - Simplified layout for mobile viewports
