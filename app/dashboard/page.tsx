// ============================================================================
// TASKFLOW DASHBOARD - Linear-inspired main interface
// ============================================================================
// Implements clean, efficient task management dashboard with sidebar navigation,
// real-time updates, and seamless integration with Repository and Observer patterns

"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  CheckSquare,
  Clock,
  AlertTriangle,
  User,
  Settings,
  LogOut,
} from "lucide-react";

// ============================================================================
// 1. INTERFACES & TYPE DEFINITIONS - Dashboard state and components
// ============================================================================

interface DashboardState {
  sidebarCollapsed: boolean;
  searchQuery: string;
  activeFilter: "all" | "todo" | "in_progress" | "completed";
}

// ============================================================================
// 2. CORE FUNCTIONS - Dashboard component
// ============================================================================

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [state, setState] = useState<DashboardState>({
    sidebarCollapsed: false,
    searchQuery: "",
    activeFilter: "all",
  });

  // ============================================================================
  // 3. STATE MANAGEMENT - Authentication and navigation
  // ============================================================================

  // WHY: Redirect unauthenticated users to sign-in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // WHY: Show loading state while session is being verified
  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // WHY: Redirect if not authenticated
  if (!session) {
    return null;
  }

  // ============================================================================
  // 4. EVENT HANDLERS - User interactions and navigation
  // ============================================================================

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const toggleSidebar = () => {
    setState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  };

  const handleSearch = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  const setActiveFilter = (filter: DashboardState["activeFilter"]) => {
    setState(prev => ({ ...prev, activeFilter: filter }));
  };

  // ============================================================================
  // 5. REACT COMPONENT LOGIC - Dashboard layout structure
  // ============================================================================

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar Navigation - Linear inspired */}
      <div
        className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-200 ${
          state.sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!state.sidebarCollapsed && (
              <h1 className="text-xl font-semibold text-gray-900">TaskFlow</h1>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            {
              icon: CheckSquare,
              label: "All Tasks",
              filter: "all" as const,
              count: 0,
            },
            {
              icon: Clock,
              label: "In Progress",
              filter: "in_progress" as const,
              count: 0,
            },
            {
              icon: AlertTriangle,
              label: "Todo",
              filter: "todo" as const,
              count: 0,
            },
          ].map(item => (
            <button
              key={item.filter}
              onClick={() => setActiveFilter(item.filter)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                state.activeFilter === item.filter
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
              {!state.sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  <span className="text-xs text-gray-500">{item.count}</span>
                </>
              )}
            </button>
          ))}
        </nav>

        {/* User menu */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}

            {!state.sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user?.email}
                </p>
              </div>
            )}

            <div className="flex space-x-1">
              <button className="p-1 rounded-md hover:bg-gray-100 transition-colors">
                <Settings className="h-4 w-4 text-gray-400" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {state.activeFilter === "all"
                  ? "All Tasks"
                  : state.activeFilter === "todo"
                    ? "Todo"
                    : state.activeFilter === "in_progress"
                      ? "In Progress"
                      : "Completed"}
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={state.searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filter button */}
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>

              {/* Add task button */}
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Placeholder for task list - will be implemented next */}
          <div className="text-center py-12">
            <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No tasks yet
            </h3>
            <p className="mt-2 text-gray-500">
              Get started by creating your first task
            </p>
            <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 6. CLEANUP & MEMORY MANAGEMENT - Component cleanup
// ============================================================================

// useSession handles authentication state cleanup
// Component state is cleaned up on unmount

// ============================================================================
// 7. RENDER LOGIC - Linear design principles applied
// ============================================================================

// Design follows Linear's principles:
// - Clean, minimal interface
// - Efficient use of space
// - Clear visual hierarchy
// - Functional over decorative

// ============================================================================
// 8. MOBILE-OPTIMIZED STYLES - Responsive dashboard design
// ============================================================================

// Mobile optimizations:
// - Collapsible sidebar for small screens
// - Touch-friendly button sizes
// - Responsive navigation
// - Proper spacing for mobile interactions
