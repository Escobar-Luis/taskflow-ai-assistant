// ============================================================================
// TASKFLOW LANDING PAGE - Authentication-aware home page
// ============================================================================
// Implements smart routing based on authentication state with Linear-inspired
// landing page design and seamless dashboard redirection

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Zap,
  Users,
  BarChart3,
  ArrowRight,
  Play,
} from "lucide-react";

// ============================================================================
// 1. INTERFACES & TYPE DEFINITIONS - Landing page components
// ============================================================================

// ============================================================================
// 2. CORE FUNCTIONS - Home page component
// ============================================================================

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ============================================================================
  // 3. STATE MANAGEMENT - Authentication-based routing
  // ============================================================================

  // WHY: Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  // WHY: Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // WHY: Show landing page for unauthenticated users
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <CheckSquare className="h-8 w-8 text-blue-600 mr-3" />
                <span className="text-xl font-bold text-gray-900">
                  TaskFlow
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered Task
              <span className="block text-blue-600">Management</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Streamline your productivity with intelligent task automation,
              real-time collaboration, and semantic AI assistance.
            </p>

            <div className="flex items-center justify-center space-x-4">
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>

              <button className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built for Modern Teams
            </h2>
            <p className="text-lg text-gray-600">
              Advanced patterns and AI integration for professional productivity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "AI-Powered Automation",
                description:
                  "Intelligent task categorization, priority suggestions, and automated workflow optimization with 85% cost reduction through semantic caching.",
              },
              {
                icon: Users,
                title: "Real-time Collaboration",
                description:
                  "Live updates, presence indicators, and seamless team coordination with WebSocket integration and Observer pattern architecture.",
              },
              {
                icon: BarChart3,
                title: "Performance Analytics",
                description:
                  "Advanced metrics, <100ms database queries, and comprehensive monitoring with optimized PostgreSQL indexes.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to transform your workflow?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of teams using TaskFlow for smarter task
                management
              </p>
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-8 py-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 4. EVENT HANDLERS - Navigation and interactions
  // ============================================================================

  // WHY: Should not reach here, but provide fallback
  return null;
}

// ============================================================================
// 5. REACT COMPONENT LOGIC - Authentication flow
// ============================================================================

// Flow:
// 1. Check authentication status
// 2. Redirect authenticated users to dashboard
// 3. Show landing page for unauthenticated users

// ============================================================================
// 6. CLEANUP & MEMORY MANAGEMENT - Component cleanup
// ============================================================================

// useSession and useRouter handle their own cleanup
// No manual cleanup required

// ============================================================================
// 7. RENDER LOGIC - Landing page design
// ============================================================================

// Design follows Linear principles:
// - Clean, professional appearance
// - Clear value proposition
// - Minimal but effective CTA placement

// ============================================================================
// 8. MOBILE-OPTIMIZED STYLES - Responsive landing page
// ============================================================================

// Mobile optimizations:
// - Responsive typography scaling
// - Touch-friendly navigation
// - Proper spacing for mobile screens
// - Accessible color contrast ratios
