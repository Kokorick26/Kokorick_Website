import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Key,
  Shield,
  ShieldCheck,
  Pen,
  AlertCircle,
  CheckCircle2,
  X,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { useAuth, Permission, ALL_PERMISSIONS, PERMISSION_LABELS } from "../../contexts/AuthContext";

// Types
interface AdminUser {
  username: string;
  email: string;
  role: string;
  roleType: string;
  permissions: Permission[];
  isFirstLogin: boolean;
  isActive: boolean;
  fullName?: string;
  profilePicture?: string;
  phone?: string;
  lastLogin?: string;
  createdAt?: string;
  createdBy?: string;
}

interface Role {
  roleId: string;
  roleName: string;
  displayName: string;
  permissions: Permission[];
  isSystemRole: boolean;
  userCount?: number;
}

const API_BASE = "/api";

// Helper function to fetch with auth
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("adminToken");
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });
}

// View modes for the page
type ViewMode = "list" | "create" | "edit";

// Cache keys
const USER_CACHE_KEYS = {
  users: 'admin_users_cache',
  usersTimestamp: 'admin_users_timestamp',
  searchTerm: 'admin_users_search',
  roleFilter: 'admin_users_roleFilter',
  statusFilter: 'admin_users_statusFilter',
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function UserManagementPage() {
  const { isSuperAdmin } = useAuth();

  // Initialize from cache
  const [users, setUsers] = useState<AdminUser[]>(() => {
    try {
      const cached = localStorage.getItem(USER_CACHE_KEYS.users);
      const timestamp = localStorage.getItem(USER_CACHE_KEYS.usersTimestamp);
      if (cached && timestamp && (Date.now() - parseInt(timestamp)) < CACHE_DURATION) {
        return JSON.parse(cached);
      }
    } catch { }
    return [];
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem(USER_CACHE_KEYS.searchTerm) || "");
  const [roleFilter, setRoleFilter] = useState(() => localStorage.getItem(USER_CACHE_KEYS.roleFilter) || "");
  const [statusFilter, setStatusFilter] = useState(() => localStorage.getItem(USER_CACHE_KEYS.statusFilter) || "");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  // Cache users when they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem(USER_CACHE_KEYS.users, JSON.stringify(users));
      localStorage.setItem(USER_CACHE_KEYS.usersTimestamp, Date.now().toString());
    }
  }, [users]);

  // Cache filters
  useEffect(() => {
    localStorage.setItem(USER_CACHE_KEYS.searchTerm, searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    localStorage.setItem(USER_CACHE_KEYS.roleFilter, roleFilter);
  }, [roleFilter]);

  useEffect(() => {
    localStorage.setItem(USER_CACHE_KEYS.statusFilter, statusFilter);
  }, [statusFilter]);

  // Load users and roles
  useEffect(() => {
    if (isSuperAdmin()) {
      loadUsers();
      loadRoles();
    }
  }, [isSuperAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (roleFilter) params.append("role", roleFilter);
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetchWithAuth(`${API_BASE}/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      showToast("error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/roles`);
      if (res.ok) {
        const data = await res.json();
        setRoles(data.roles);
      }
    } catch (error) {
      console.error("Failed to load roles:", error);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetchWithAuth(`${API_BASE}/users/${selectedUser.username}`, {
        method: "DELETE"
      });

      if (res.ok) {
        showToast("success", "User deleted successfully");
        loadUsers();
        setShowDeleteConfirm(false);
        setSelectedUser(null);
      } else {
        const data = await res.json();
        showToast("error", data.error || "Failed to delete user");
      }
    } catch (error) {
      showToast("error", "Failed to delete user");
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/users/${user.username}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !user.isActive })
      });

      if (res.ok) {
        showToast("success", `User ${user.isActive ? "deactivated" : "activated"} successfully`);
        loadUsers();
      } else {
        const data = await res.json();
        showToast("error", data.error || "Failed to update user");
      }
    } catch (error) {
      showToast("error", "Failed to update user");
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus =
      !statusFilter || (statusFilter === "active" ? user.isActive : !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (!isSuperAdmin()) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-zinc-400">Only Super Admins can access user management.</p>
        </div>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return <ShieldCheck className="w-4 h-4 text-yellow-500" />;
      case "admin":
        return <Shield className="w-4 h-4 text-blue-500" />;
      case "content_writer":
        return <Pen className="w-4 h-4 text-green-500" />;
      default:
        return <Shield className="w-4 h-4 text-purple-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "admin":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "content_writer":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    }
  };

  // If in create mode, show the create form as a full page
  if (viewMode === "create") {
    return (
      <CreateUserForm
        roles={roles}
        onBack={() => setViewMode("list")}
        onCreated={() => {
          loadUsers();
          setViewMode("list");
          showToast("success", "User created successfully");
        }}
      />
    );
  }

  // If in edit mode, show the edit form as a full page
  if (viewMode === "edit" && selectedUser) {
    return (
      <EditUserForm
        user={selectedUser}
        roles={roles}
        onBack={() => {
          setViewMode("list");
          setSelectedUser(null);
        }}
        onUpdated={() => {
          loadUsers();
          setViewMode("list");
          setSelectedUser(null);
          showToast("success", "User updated successfully");
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-zinc-400 mt-1">Manage admin users and their permissions</p>
        </div>
        <button
          onClick={() => setViewMode("create")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-lg shadow-white/10"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, username, or email..."
              className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">All Roles</option>
            {roles.map((role) => (
              <option key={role.roleId} value={role.roleId}>
                {role.displayName}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900">
                <th className="text-left text-sm font-bold text-zinc-400 px-6 py-4">User</th>
                <th className="text-left text-sm font-bold text-zinc-400 px-6 py-4">Role</th>
                <th className="text-left text-sm font-bold text-zinc-400 px-6 py-4">Status</th>
                <th className="text-left text-sm font-bold text-zinc-400 px-6 py-4">Last Login</th>
                <th className="text-right text-sm font-bold text-zinc-400 px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-zinc-500">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400 font-medium">No users found</p>
                    <p className="text-zinc-500 text-sm mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.username}
                    className="hover:bg-zinc-800/50 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-white border border-zinc-700">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            user.username.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {user.fullName || user.username}
                          </p>
                          <p className="text-sm text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {getRoleIcon(user.role)}
                        {roles.find((r) => r.roleId === user.role)?.displayName ||
                          user.role.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${user.isActive
                          ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-500"
                            }`}
                        />
                        {user.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-sm text-zinc-400">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })
                        : "Never"}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setViewMode("edit");
                          }}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowResetPasswordModal(true);
                          }}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Reset password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900 text-sm text-zinc-500">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Reset Password Modal - Keep as modal since it's a quick action */}
      <AnimatePresence>
        {showResetPasswordModal && selectedUser && (
          <ResetPasswordModal
            user={selectedUser}
            onClose={() => {
              setShowResetPasswordModal(false);
              setSelectedUser(null);
            }}
            onReset={() => {
              setShowResetPasswordModal(false);
              setSelectedUser(null);
              showToast("success", "Password reset successfully");
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal - Keep as modal since it's a confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => {
                setShowDeleteConfirm(false);
                setSelectedUser(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Delete User</h3>
                <p className="text-zinc-400 mb-6">
                  Are you sure you want to delete <strong>{selectedUser.username}</strong>? This
                  action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-4 py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    className="flex-1 px-4 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Create User Form Component (Full Page)
function CreateUserForm({
  roles,
  onBack,
  onCreated
}: {
  roles: Role[];
  onBack: () => void;
  onCreated: () => void;
}) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [role, setRole] = useState("admin");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Update permissions when role changes
  useEffect(() => {
    const selectedRole = roles.find((r) => r.roleId === role);
    if (selectedRole) {
      setPermissions(selectedRole.permissions as Permission[]);
    }
  }, [role, roles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetchWithAuth(`${API_BASE}/users`, {
        method: "POST",
        body: JSON.stringify({
          username,
          email,
          fullName: fullName || undefined,
          phone: phone || undefined,
          isActive,
          role,
          permissions
        })
      });

      const data = await res.json();

      if (res.ok) {
        setGeneratedPassword(data.generatedPassword);
      } else {
        setError(data.error || "Failed to create user");
      }
    } catch (err) {
      setError("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = async () => {
    await navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePermission = (permission: Permission) => {
    setPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">Create New User</h2>
          <p className="text-zinc-400 mt-1">Add a new admin user to the system</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        {generatedPassword ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">User Created!</h4>
            <p className="text-zinc-400 mb-6">
              Share these credentials securely with the user.
            </p>

            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-6 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="text-left">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Username</p>
                  <p className="text-white font-medium">{username}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-left flex-1">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                    Temporary Password
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-mono">
                      {showPassword ? generatedPassword : "•".repeat(16)}
                    </p>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 hover:bg-zinc-700 rounded transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-zinc-500" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  onClick={copyPassword}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${copied
                    ? "bg-green-500/20 text-green-500"
                    : "bg-zinc-700 text-white hover:bg-zinc-600"
                    }`}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <p className="text-xs text-zinc-500 mb-6">
              The user will be required to change their password on first login.
            </p>

            <button
              onClick={onCreated}
              className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="username"
                  required
                  pattern="[a-z0-9_]{3,30}"
                  title="3-30 lowercase characters, numbers, or underscores"
                />
                <p className="text-xs text-zinc-500">Username cannot be changed</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="user@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required
                >
                  {roles.map((r) => (
                    <option key={r.roleId} value={r.roleId}>
                      {r.displayName} {r.isSystemRole ? "(System)" : "(Custom)"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Status</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsActive(true)}
                    className={`flex-1 py-3 rounded-xl font-medium transition-colors ${isActive
                      ? "bg-green-500/20 text-green-500 border border-green-500/30"
                      : "bg-zinc-800/50 text-zinc-400 border border-zinc-700 hover:border-zinc-600"
                      }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsActive(false)}
                    className={`flex-1 py-3 rounded-xl font-medium transition-colors ${!isActive
                      ? "bg-red-500/20 text-red-500 border border-red-500/30"
                      : "bg-zinc-800/50 text-zinc-400 border border-zinc-700 hover:border-zinc-600"
                      }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-300">Permissions</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {ALL_PERMISSIONS.map((permission) => (
                  <label
                    key={permission}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${permissions.includes(permission)
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={permissions.includes(permission)}
                      onChange={() => togglePermission(permission)}
                      className="w-4 h-4 rounded border-zinc-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-zinc-800"
                    />
                    <span className="text-sm text-white">{PERMISSION_LABELS[permission]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Edit User Form Component (Full Page)
function EditUserForm({
  user,
  roles,
  onBack,
  onUpdated
}: {
  user: AdminUser;
  roles: Role[];
  onBack: () => void;
  onUpdated: () => void;
}) {
  const [email, setEmail] = useState(user.email);
  const [fullName, setFullName] = useState(user.fullName || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [role, setRole] = useState(user.role);
  const [permissions, setPermissions] = useState<Permission[]>(user.permissions);
  const [isActive, setIsActive] = useState(user.isActive);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetchWithAuth(`${API_BASE}/users/${user.username}`, {
        method: "PATCH",
        body: JSON.stringify({
          email,
          fullName: fullName || undefined,
          phone: phone || undefined,
          role,
          permissions,
          isActive
        })
      });

      if (res.ok) {
        onUpdated();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update user");
      }
    } catch (err) {
      setError("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permission: Permission) => {
    setPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">Edit User</h2>
          <p className="text-zinc-400 mt-1">Update {user.username}'s account</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Username</label>
              <input
                type="text"
                value={user.username}
                disabled
                className="w-full px-4 py-3 bg-zinc-800/30 border border-zinc-700 rounded-xl text-zinc-500 cursor-not-allowed"
              />
              <p className="text-xs text-zinc-500">Username cannot be changed</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Role</label>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  const selectedRole = roles.find((r) => r.roleId === e.target.value);
                  if (selectedRole) {
                    setPermissions(selectedRole.permissions as Permission[]);
                  }
                }}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {roles.map((r) => (
                  <option key={r.roleId} value={r.roleId}>
                    {r.displayName} {r.isSystemRole ? "(System)" : "(Custom)"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Status</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsActive(true)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${isActive
                    ? "bg-green-500/20 text-green-500 border border-green-500/30"
                    : "bg-zinc-800/50 text-zinc-400 border border-zinc-700 hover:border-zinc-600"
                    }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setIsActive(false)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${!isActive
                    ? "bg-red-500/20 text-red-500 border border-red-500/30"
                    : "bg-zinc-800/50 text-zinc-400 border border-zinc-700 hover:border-zinc-600"
                    }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-zinc-300">Permissions</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ALL_PERMISSIONS.map((permission) => (
                <label
                  key={permission}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${permissions.includes(permission)
                    ? "bg-blue-500/10 border-blue-500/30"
                    : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                    className="w-4 h-4 rounded border-zinc-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-zinc-800"
                  />
                  <span className="text-sm text-white">{PERMISSION_LABELS[permission]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reset Password Modal Component
function ResetPasswordModal({
  user,
  onClose,
  onReset
}: {
  user: AdminUser;
  onClose: () => void;
  onReset: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReset = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetchWithAuth(`${API_BASE}/users/${user.username}/reset-password`, {
        method: "POST"
      });

      const data = await res.json();

      if (res.ok) {
        setGeneratedPassword(data.generatedPassword);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = async () => {
    await navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6"
      >
        {generatedPassword ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Key className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Password Reset!</h3>
            <p className="text-zinc-400 mb-6">New password for {user.username}</p>

            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-left flex-1">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                    New Password
                  </p>
                  <p className="text-white font-mono">
                    {showPassword ? generatedPassword : "•".repeat(16)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-zinc-500" />
                    )}
                  </button>
                  <button
                    onClick={copyPassword}
                    className={`p-2 rounded-lg transition-colors ${copied ? "bg-green-500/20 text-green-500" : "hover:bg-zinc-700 text-zinc-500"
                      }`}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-500 mb-6">
              The user will be required to change their password on next login.
            </p>

            <button
              onClick={onReset}
              className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
              <Key className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Reset Password</h3>
            <p className="text-zinc-400 mb-6">
              Generate a new password for <strong>{user.username}</strong>?
            </p>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2 mb-6">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
