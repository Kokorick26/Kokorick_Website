import { useAuth, Permission } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requireSuperAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requiredPermission,
  requireSuperAdmin = false
}: ProtectedRouteProps) {
  const { user, hasPermission, isSuperAdmin, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    // Use window.location to redirect instead of Navigate to avoid router dependency
    window.location.href = "/admin";
    return null;
  }

  // Check for super admin requirement
  if (requireSuperAdmin && !isSuperAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-zinc-400 mb-6">This section requires Super Admin privileges.</p>
          <a
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Check for specific permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Permission Required</h2>
          <p className="text-zinc-400 mb-6">
            You don't have the required permission to access this section.
          </p>
          <a
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
