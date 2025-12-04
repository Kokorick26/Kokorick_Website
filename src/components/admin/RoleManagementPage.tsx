import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  ShieldCheck,
  Pen,
  Plus,
  Edit2,
  Trash2,
  Users,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { useAuth, Permission, ALL_PERMISSIONS, PERMISSION_LABELS } from "../../contexts/AuthContext";

// Types
interface Role {
  roleId: string;
  roleName: string;
  displayName: string;
  permissions: Permission[];
  isSystemRole: boolean;
  userCount?: number;
  createdAt?: string;
  createdBy?: string;
}

type ViewMode = "list" | "create" | "edit" | "view";

const API_BASE = "/api";

// Cache keys
const CACHE_KEYS = {
  roles: "admin_roles",
  rolesTimestamp: "admin_roles_timestamp"
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

export default function RoleManagementPage() {
  const { isSuperAdmin } = useAuth();
  const [roles, setRoles] = useState<Role[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.roles);
      const timestamp = localStorage.getItem(CACHE_KEYS.rolesTimestamp);
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age < CACHE_DURATION) {
          return JSON.parse(cached);
        }
      }
    } catch { }
    return [];
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load roles
  useEffect(() => {
    if (isSuperAdmin()) {
      loadRoles();
    }
  }, [isSuperAdmin]);

  // Cache roles
  useEffect(() => {
    if (roles.length > 0) {
      localStorage.setItem(CACHE_KEYS.roles, JSON.stringify(roles));
      localStorage.setItem(CACHE_KEYS.rolesTimestamp, Date.now().toString());
    }
  }, [roles]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/roles`);
      if (res.ok) {
        const data = await res.json();
        setRoles(data.roles);
      }
    } catch (error) {
      console.error("Failed to load roles:", error);
      showToast("error", "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      const res = await fetchWithAuth(`${API_BASE}/roles/${selectedRole.roleId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        showToast("success", "Role deleted successfully");
        loadRoles();
        setShowDeleteConfirm(false);
        setSelectedRole(null);
      } else {
        const data = await res.json();
        showToast("error", data.error || "Failed to delete role");
      }
    } catch (error) {
      showToast("error", "Failed to delete role");
    }
  };

  if (!isSuperAdmin()) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-zinc-400">Only Super Admins can access role management.</p>
        </div>
      </div>
    );
  }

  const getRoleIcon = (role: Role) => {
    if (role.roleId === "super_admin") return <ShieldCheck className="w-5 h-5 text-yellow-500" />;
    if (role.roleId === "admin") return <Shield className="w-5 h-5 text-blue-500" />;
    if (role.roleId === "content_writer") return <Pen className="w-5 h-5 text-green-500" />;
    return <Shield className="w-5 h-5 text-purple-500" />;
  };

  const getRoleBgColor = (role: Role) => {
    if (role.roleId === "super_admin") return "bg-yellow-500/10 border-yellow-500/20";
    if (role.roleId === "admin") return "bg-blue-500/10 border-blue-500/20";
    if (role.roleId === "content_writer") return "bg-green-500/10 border-green-500/20";
    return "bg-purple-500/10 border-purple-500/20";
  };

  // Show Create Role Form as full page
  if (viewMode === "create") {
    return (
      <CreateRoleForm
        roles={roles}
        onBack={() => setViewMode("list")}
        onCreated={() => {
          loadRoles();
          setViewMode("list");
          showToast("success", "Role created successfully");
        }}
      />
    );
  }

  // Show Edit Role Form as full page
  if (viewMode === "edit" && selectedRole) {
    return (
      <EditRoleForm
        role={selectedRole}
        onBack={() => {
          setViewMode("list");
          setSelectedRole(null);
        }}
        onUpdated={() => {
          loadRoles();
          setViewMode("list");
          setSelectedRole(null);
          showToast("success", "Role updated successfully");
        }}
      />
    );
  }

  // Show View Role Details as full page
  if (viewMode === "view" && selectedRole) {
    return (
      <ViewRoleDetails
        role={selectedRole}
        onBack={() => {
          setViewMode("list");
          setSelectedRole(null);
        }}
        onEdit={() => {
          setViewMode("edit");
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Role Management</h2>
          <p className="text-zinc-400 mt-1">Create and manage custom roles with specific permissions</p>
        </div>
        <button
          onClick={() => setViewMode("create")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-lg shadow-white/10"
        >
          <Plus className="w-5 h-5" />
          Create Role
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-16 text-zinc-500">Loading roles...</div>
        ) : (
          roles.map((role) => (
            <motion.div
              key={role.roleId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-all hover:border-zinc-700 ${role.isSystemRole ? "border-zinc-800" : "border-purple-500/30"
                }`}
            >
              {/* Role Header */}
              <div className={`p-5 border-b border-zinc-800 ${getRoleBgColor(role)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900/50 flex items-center justify-center">
                      {getRoleIcon(role)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{role.displayName}</h3>
                      <p className="text-xs text-zinc-500">
                        {role.isSystemRole ? "System Role" : "Custom Role"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setSelectedRole(role);
                        setViewMode("edit");
                      }}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Edit role"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!role.isSystemRole && (
                      <button
                        onClick={() => {
                          setSelectedRole(role);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete role"
                        disabled={(role.userCount || 0) > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Role Content */}
              <div className="p-5 space-y-4">
                {/* User Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Users with this role</span>
                  </div>
                  <span className="text-white font-medium">{role.userCount || 0}</span>
                </div>

                {/* Permissions Preview */}
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Permissions ({role.permissions.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.slice(0, 4).map((permission) => (
                      <span
                        key={permission}
                        className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-lg"
                      >
                        {PERMISSION_LABELS[permission] || permission}
                      </span>
                    ))}
                    {role.permissions.length > 4 && (
                      <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-lg">
                        +{role.permissions.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* View Details */}
                <button
                  onClick={() => {
                    setSelectedRole(role);
                    setViewMode("view");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal - keeping as modal since it's a quick action */}
      <AnimatePresence>
        {showDeleteConfirm && selectedRole && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => {
                setShowDeleteConfirm(false);
                setSelectedRole(null);
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
                <h3 className="text-lg font-bold text-white mb-2">Delete Role</h3>
                <p className="text-zinc-400 mb-6">
                  Are you sure you want to delete <strong>{selectedRole.displayName}</strong>? This
                  action cannot be undone.
                </p>
                {(selectedRole.userCount || 0) > 0 && (
                  <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    This role has {selectedRole.userCount} user(s) assigned. Reassign them before deleting.
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setSelectedRole(null);
                    }}
                    className="flex-1 px-4 py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteRole}
                    disabled={(selectedRole.userCount || 0) > 0}
                    className="flex-1 px-4 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete Role
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

// Create Role Form Component (Full Page)
function CreateRoleForm({
  roles,
  onBack,
  onCreated
}: {
  roles: Role[];
  onBack: () => void;
  onCreated: () => void;
}) {
  const [roleName, setRoleName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (permissions.length === 0) {
      setError("At least one permission is required");
      return;
    }

    // Check for duplicate role name
    const roleId = roleName.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    if (roles.some(r => r.roleId === roleId)) {
      setError("A role with this ID already exists");
      return;
    }

    setLoading(true);

    try {
      const res = await fetchWithAuth(`${API_BASE}/roles`, {
        method: "POST",
        body: JSON.stringify({
          roleName: roleId,
          displayName: displayName || roleName,
          permissions
        })
      });

      if (res.ok) {
        onCreated();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create role");
      }
    } catch (err) {
      setError("Failed to create role");
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
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">Create New Role</h2>
          <p className="text-zinc-400 mt-1">Create a custom role with specific permissions</p>
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
              <label className="block text-sm font-medium text-zinc-300">
                Role ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="custom_role"
                required
                pattern="[a-z0-9_]{3,30}"
                title="3-30 lowercase characters, numbers, or underscores"
              />
              <p className="text-xs text-zinc-500">Lowercase letters, numbers, and underscores only</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Custom Role"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-zinc-300">
                Permissions <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPermissions([...ALL_PERMISSIONS])}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Select All
                </button>
                <span className="text-zinc-600">|</span>
                <button
                  type="button"
                  onClick={() => setPermissions([])}
                  className="text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
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
              {loading ? "Creating..." : "Create Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Role Form Component (Full Page) - Now allows editing system roles
function EditRoleForm({
  role,
  onBack,
  onUpdated
}: {
  role: Role;
  onBack: () => void;
  onUpdated: () => void;
}) {
  const [displayName, setDisplayName] = useState(role.displayName);
  const [permissions, setPermissions] = useState<Permission[]>(role.permissions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (permissions.length === 0) {
      setError("At least one permission is required");
      return;
    }

    // Prevent removing critical permissions from super_admin
    if (role.roleId === "super_admin") {
      const requiredPermissions: Permission[] = ["user_management", "role_management", "admin_panel_access"];
      const missingRequired = requiredPermissions.filter(p => !permissions.includes(p));
      if (missingRequired.length > 0) {
        setError(`Super Admin must have: ${missingRequired.map(p => PERMISSION_LABELS[p]).join(", ")}`);
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetchWithAuth(`${API_BASE}/roles/${role.roleId}`, {
        method: "PATCH",
        body: JSON.stringify({
          displayName,
          permissions
        })
      });

      if (res.ok) {
        onUpdated();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update role");
      }
    } catch (err) {
      setError("Failed to update role");
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
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">Edit Role</h2>
          <p className="text-zinc-400 mt-1">
            Update permissions for {role.displayName}
            {role.isSystemRole && <span className="text-yellow-500 ml-2">(System Role)</span>}
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        {role.isSystemRole && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Editing System Role</p>
              <p className="mt-1 text-yellow-400/80">
                Be careful when modifying system roles. Changes will affect all users with this role.
                {role.roleId === "super_admin" && " Super Admin must retain user management, role management, and admin panel access."}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Role ID</label>
              <input
                type="text"
                value={role.roleId}
                disabled
                className="w-full px-4 py-3 bg-zinc-800/30 border border-zinc-700 rounded-xl text-zinc-500 cursor-not-allowed"
              />
              <p className="text-xs text-zinc-500">Role ID cannot be changed</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Role Name"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-zinc-300">
                Permissions <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPermissions([...ALL_PERMISSIONS])}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Select All
                </button>
                <span className="text-zinc-600">|</span>
                <button
                  type="button"
                  onClick={() => setPermissions([])}
                  className="text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ALL_PERMISSIONS.map((permission) => {
                // Mark required permissions for super_admin
                const isRequiredForSuperAdmin =
                  role.roleId === "super_admin" &&
                  ["user_management", "role_management", "admin_panel_access"].includes(permission);

                return (
                  <label
                    key={permission}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${permissions.includes(permission)
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
                      } ${isRequiredForSuperAdmin ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <input
                      type="checkbox"
                      checked={permissions.includes(permission)}
                      onChange={() => !isRequiredForSuperAdmin && togglePermission(permission)}
                      disabled={isRequiredForSuperAdmin}
                      className="w-4 h-4 rounded border-zinc-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-zinc-800 disabled:opacity-50"
                    />
                    <span className="text-sm text-white flex-1">{PERMISSION_LABELS[permission]}</span>
                    {isRequiredForSuperAdmin && (
                      <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded">Required</span>
                    )}
                  </label>
                );
              })}
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

// View Role Details Component (Full Page)
function ViewRoleDetails({
  role,
  onBack,
  onEdit
}: {
  role: Role;
  onBack: () => void;
  onEdit: () => void;
}) {
  const getRoleIcon = (role: Role) => {
    if (role.roleId === "super_admin") return <ShieldCheck className="w-8 h-8 text-yellow-500" />;
    if (role.roleId === "admin") return <Shield className="w-8 h-8 text-blue-500" />;
    if (role.roleId === "content_writer") return <Pen className="w-8 h-8 text-green-500" />;
    return <Shield className="w-8 h-8 text-purple-500" />;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">Role Details</h2>
            <p className="text-zinc-400 mt-1">View role configuration and permissions</p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all"
        >
          <Edit2 className="w-4 h-4" />
          Edit Role
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {/* Role Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center">
            {getRoleIcon(role)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{role.displayName}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-zinc-500">ID: {role.roleId}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${role.isSystemRole
                ? "bg-blue-500/10 text-blue-400"
                : "bg-purple-500/10 text-purple-400"
                }`}>
                {role.isSystemRole ? "System Role" : "Custom Role"}
              </span>
            </div>
          </div>
        </div>

        {/* Role Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b border-zinc-800">
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">Users Assigned</span>
            </div>
            <p className="text-2xl font-bold text-white">{role.userCount || 0}</p>
          </div>
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Total Permissions</span>
            </div>
            <p className="text-2xl font-bold text-white">{role.permissions.length}</p>
          </div>
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">Status</span>
            </div>
            <p className="text-lg font-bold text-green-500">Active</p>
          </div>
        </div>

        {/* Permissions List */}
        <div className="p-6">
          <h4 className="text-sm font-medium text-zinc-300 uppercase tracking-wider mb-4">
            Granted Permissions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {ALL_PERMISSIONS.map((permission) => (
              <div
                key={permission}
                className={`flex items-center gap-3 p-3 rounded-xl border ${role.permissions.includes(permission)
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-zinc-800/30 border-zinc-700"
                  }`}
              >
                {role.permissions.includes(permission) ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <X className="w-5 h-5 text-zinc-600" />
                )}
                <span className={`text-sm ${role.permissions.includes(permission) ? "text-white" : "text-zinc-500"
                  }`}>
                  {PERMISSION_LABELS[permission]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
