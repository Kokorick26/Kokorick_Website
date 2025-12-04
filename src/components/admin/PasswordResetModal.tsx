import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, Lock, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

interface PasswordResetModalProps {
  isOpen: boolean;
  onComplete: () => void;
  isFirstLogin: boolean;
}

export default function PasswordResetModal({ isOpen, onComplete, isFirstLogin }: PasswordResetModalProps) {
  const { resetPassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password strength checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword !== "";

  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;
  const canSubmit = isPasswordValid && passwordsMatch && (!isFirstLogin ? currentPassword !== "" : true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error("Password does not meet requirements");
      return;
    }

    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Updating password...");

    const result = await resetPassword(
      isFirstLogin ? null : currentPassword,
      newPassword
    );

    setLoading(false);
    toast.dismiss(loadingToast);

    if (result.success) {
      setSuccess(true);
      toast.success("Password updated successfully!");
      setTimeout(() => {
        onComplete();
      }, 1500);
    } else {
      toast.error(result.error || "Failed to reset password");
    }
  };

  const handleClose = () => {
    if (!isFirstLogin && !success) {
      onComplete();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isFirstLogin ? "Set Your Password" : "Change Password"}
                </h3>
                <p className="text-sm text-zinc-400">
                  {isFirstLogin
                    ? "Create a secure password for your account"
                    : "Update your account password"}
                </p>
              </div>
            </div>
            {!isFirstLogin && (
              <button
                onClick={handleClose}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Password Updated!</h4>
                <p className="text-zinc-400">Redirecting you to the dashboard...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {isFirstLogin && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <p className="text-sm text-yellow-400">
                      <strong>First login detected:</strong> For security, you must set a new password before continuing.
                    </p>
                  </div>
                )}

                {/* Current Password (not required for first login) */}
                {!isFirstLogin && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-300">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-12 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="Enter current password"
                        required={!isFirstLogin}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* New Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-4 py-3 pr-12 bg-zinc-800/50 border rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 transition-all ${confirmPassword !== ""
                        ? passwordsMatch
                          ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                          : "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-zinc-700 focus:border-blue-500 focus:ring-blue-500"
                        }`}
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword !== "" && !passwordsMatch && (
                    <p className="text-xs text-red-400">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/10 mt-4"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
