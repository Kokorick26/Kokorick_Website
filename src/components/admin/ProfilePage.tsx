import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Camera,
  Save,
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { useAuth, PERMISSION_LABELS } from "../../contexts/AuthContext";

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

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || "");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/profile`);
      if (res.ok) {
        const data = await res.json();
        setFullName(data.user.fullName || "");
        setEmail(data.user.email || "");
        setPhone(data.user.phone || "");
        setProfilePicture(data.user.profilePicture || "");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetchWithAuth(`${API_BASE}/profile`, {
        method: "PATCH",
        body: JSON.stringify({
          fullName: fullName || null,
          email,
          phone: phone || null,
          profilePicture: profilePicture || null
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Profile updated successfully");
        updateUser(data.user);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setPasswordError("Password must contain at least one lowercase letter");
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setPasswordError("Password must contain at least one number");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetchWithAuth(`${API_BASE}/profile/change-password`, {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordSuccess("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordSection(false);
        setTimeout(() => setPasswordSuccess(""), 3000);
      } else {
        setPasswordError(data.error || "Failed to change password");
      }
    } catch (err) {
      setPasswordError("Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setLoading(true);
    try {
      // Get presigned URL
      const presignedRes = await fetchWithAuth(
        `${API_BASE}/upload/presigned-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}`
      );

      if (!presignedRes.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, fileUrl } = await presignedRes.json();

      // Upload to S3
      await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type
        },
        body: file
      });

      setProfilePicture(fileUrl);
      setError("");
    } catch (err) {
      setError("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-zinc-500">Loading profile...</div>
      </div>
    );
  }

  // Password strength checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword !== "";

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
        <p className="text-zinc-400 mt-1">Manage your account information and preferences</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          {success}
        </motion.div>
      )}

      {passwordSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          {passwordSuccess}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Profile Picture</h3>
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center overflow-hidden">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-zinc-500">
                    {user?.username?.substring(0, 2).toUpperCase() || "AD"}
                  </span>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera className="w-8 h-8 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-zinc-500 mt-4 text-center">
              Click to upload a new photo
              <br />
              <span className="text-xs">Max 5MB, JPG or PNG</span>
            </p>
          </div>

          {/* Role & Permissions */}
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-500">Role</p>
                <p className="text-white font-medium capitalize">
                  {user?.role?.replace(/_/g, " ") || "Admin"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Permissions</p>
              <div className="flex flex-wrap gap-1.5">
                {user?.permissions?.slice(0, 5).map((permission) => (
                  <span
                    key={permission}
                    className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-lg"
                  >
                    {PERMISSION_LABELS[permission] || permission}
                  </span>
                ))}
                {user?.permissions && user.permissions.length > 5 && (
                  <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-lg">
                    +{user.permissions.length - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <form onSubmit={handleSaveProfile} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Personal Information</h3>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="text"
                      value={user?.username || ""}
                      disabled
                      className="w-full pl-12 pr-4 py-3 bg-zinc-800/30 border border-zinc-700 rounded-xl text-zinc-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-zinc-500">Username cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>

          {/* Change Password */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Change Password</h3>
                <p className="text-sm text-zinc-500 mt-1">Update your account password</p>
              </div>
              <button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="px-4 py-2 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors"
              >
                {showPasswordSection ? "Cancel" : "Change"}
              </button>
            </div>

            {showPasswordSection && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                onSubmit={handleChangePassword}
                className="space-y-5 border-t border-zinc-800 pt-6"
              >
                {passwordError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {passwordError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password Strength Indicators */}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className={`flex items-center gap-2 text-xs ${hasMinLength ? 'text-green-400' : 'text-zinc-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-green-400' : 'bg-zinc-600'}`} />
                      8+ characters
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${hasUppercase ? 'text-green-400' : 'text-zinc-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${hasUppercase ? 'bg-green-400' : 'bg-zinc-600'}`} />
                      Uppercase letter
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${hasLowercase ? 'text-green-400' : 'text-zinc-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${hasLowercase ? 'bg-green-400' : 'bg-zinc-600'}`} />
                      Lowercase letter
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${hasNumber ? 'text-green-400' : 'text-zinc-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${hasNumber ? 'bg-green-400' : 'bg-zinc-600'}`} />
                      Number
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 bg-zinc-800/50 border rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 transition-colors ${
                        confirmPassword !== ""
                          ? passwordsMatch
                            ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                            : "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-zinc-700 focus:border-blue-500 focus:ring-blue-500"
                      }`}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                  {confirmPassword !== "" && !passwordsMatch && (
                    <p className="text-xs text-red-400">Passwords do not match</p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={passwordLoading || !passwordsMatch || !hasMinLength || !hasUppercase || !hasLowercase || !hasNumber}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Lock className="w-5 h-5" />
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </motion.form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
