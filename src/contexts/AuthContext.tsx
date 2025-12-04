import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Types
export type Permission =
  | 'analytics'
  | 'testimonials'
  | 'projects'
  | 'blogs'
  | 'team'
  | 'whitepapers'
  | 'newsletter'
  | 'requests'
  | 'user_management'
  | 'role_management'
  | 'audit_logs'
  | 'admin_panel_access';

export type RoleType = 'system' | 'custom';

export interface User {
  username: string;
  email: string;
  role: string;
  roleType: RoleType;
  permissions: Permission[];
  isFirstLogin: boolean;
  fullName?: string;
  profilePicture?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; isFirstLogin?: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (...permissions: Permission[]) => boolean;
  hasAllPermissions: (...permissions: Permission[]) => boolean;
  isSuperAdmin: () => boolean;
  refreshUser: () => Promise<void>;
  resetPassword: (currentPassword: string | null, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = '/api';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('adminToken');
      const storedUser = localStorage.getItem('adminUser');

      if (storedToken && storedUser) {
        try {
          // Verify token is still valid
          const res = await fetch(`${API_BASE}/auth/verify`, {
            headers: { Authorization: `Bearer ${storedToken}` }
          });

          if (res.ok) {
            const data = await res.json();
            setToken(storedToken);
            setUser({
              ...JSON.parse(storedUser),
              ...data.user
            });
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Login failed'
        };
      }

      // Store token and user
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      return {
        success: true,
        isFirstLogin: data.user.isFirstLogin
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('adminUser', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, [token, updateUser]);

  const hasPermission = useCallback((permission: Permission) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return user.permissions?.includes(permission) ?? false;
  }, [user]);

  const hasAnyPermission = useCallback((...permissions: Permission[]) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return permissions.some(p => user.permissions?.includes(p) ?? false);
  }, [user]);

  const hasAllPermissions = useCallback((...permissions: Permission[]) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return permissions.every(p => user.permissions?.includes(p) ?? false);
  }, [user]);

  const isSuperAdmin = useCallback(() => {
    return user?.role === 'super_admin';
  }, [user]);

  const resetPassword = useCallback(async (currentPassword: string | null, newPassword: string) => {
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle non-JSON responses
      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        return { success: false, error: 'Server returned an invalid response' };
      }

      if (!res.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Password reset failed'
        };
      }

      // Update user to clear isFirstLogin flag
      if (user?.isFirstLogin) {
        updateUser({ isFirstLogin: false });
      }

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, error: 'Request timed out. Please try again.' };
      }
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }, [token, user, updateUser]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    updateUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
    refreshUser,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export all permissions for reference
export const ALL_PERMISSIONS: Permission[] = [
  'analytics',
  'testimonials',
  'projects',
  'blogs',
  'team',
  'whitepapers',
  'newsletter',
  'requests',
  'user_management',
  'role_management',
  'audit_logs',
  'admin_panel_access'
];

// Permission display names
export const PERMISSION_LABELS: Record<Permission, string> = {
  analytics: 'Analytics',
  testimonials: 'Testimonials',
  projects: 'Projects',
  blogs: 'Blog Posts',
  team: 'Team Management',
  whitepapers: 'Whitepapers',
  newsletter: 'Newsletter',
  requests: 'Contact Requests',
  user_management: 'User Management',
  role_management: 'Role Management',
  audit_logs: 'Audit Logs',
  admin_panel_access: 'Admin Panel Access'
};
