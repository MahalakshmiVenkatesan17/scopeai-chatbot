"use client";

import { useEffect, useState } from "react";
import { Edit3, Info, Lock, Mail, Save, Shield, Users, RotateCw } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { format } from "date-fns";
import { User } from "@/types";
import { Eye, EyeOff } from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { showToast, ToastComponent } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  //   const [lastLogin, setLastLogin] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""); // if needed
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setFirstName(user?.first_name || "");
      setLastName(user?.last_name || "");
      setEmail(user?.email || "");
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const handleSave = async () => {
    // Validate first and last name
    if (!firstName.trim() || !lastName.trim()) {
      showToast("Please enter both first and last name", "error");
      return;
    }

    try {
      setLoading(true);

      // Only send firstName and lastName
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      };

      await apiClient.updateProfile(payload);

      // Update local user state
      setUser({
        ...user,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      } as User);

      showToast("Profile updated successfully", "success");
    } catch (error) {
      console.error("Profile update failed:", error);
      showToast("Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      showToast("Please enter a new password", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New password and confirm password do not match", "error");
      return;
    }
    try {
      setLoading(true);
      await apiClient.updatePassword({
        currentPassword, // optional if your backend requires it
        newPassword,
        confirmPassword,
      });
      showToast("Password updated successfully", "success");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Password update failed:", error);
      showToast("Failed to update password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-background transition-colors p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-3xl border border-gray-200 bg-white px-6 py-5 shadow-sm dark:border-white/[0.06] dark:bg-[#0F172A] dark:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-colors">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5856d6] shadow-lg dark:bg-[#635BDF] dark:shadow-[0_0_24px_rgba(99,91,223,0.25)]">
                  <Shield className="w-7 h-7 text-white" />
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Profile Information
                  </h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                    Update your personal details and manage your account security
                  </p>
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={() => fetchProfile()}
                className="rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.05]"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Profile Card */}
          <Card className="border-gray-200 bg-white dark:border-white/[0.06] dark:bg-[#0F172A] transition-colors">
            <CardContent className="p-6 md:p-8 space-y-8">
              {/* Profile Section Title */}
              <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-white/[0.06]">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Personal Details
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Edit your basic profile information
                  </p>
                </div>
              </div>

              {/* First Name */}
              <div>
                <label className="flex gap-2 items-center text-sm font-medium text-gray-700 dark:text-slate-300 transition-colors mb-2">
                  <Users className="w-4 h-4" />
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-[#5856d6] focus:outline-none focus:ring-2 focus:ring-[#5856d6]/20 transition-colors"
                  placeholder="Enter first name"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="flex gap-2 items-center text-sm font-medium text-gray-700 dark:text-slate-300 transition-colors mb-2">
                  <Users className="w-4 h-4" />
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-[#5856d6] focus:outline-none focus:ring-2 focus:ring-[#5856d6]/20 transition-colors"
                  placeholder="Enter last name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex gap-2 items-center text-sm font-medium text-gray-700 dark:text-slate-300 transition-colors mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>

                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02] px-4 py-3 pr-12 text-sm text-gray-500 dark:text-slate-400 cursor-not-allowed transition-colors"
                  />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                </div>

                <p className="flex gap-2 items-center text-xs text-gray-500 dark:text-slate-400 mt-2">
                  <Info className="w-4 h-4" />
                  Email cannot be changed.
                </p>
              </div>

              {/* Last Login */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 transition-colors mb-2">
                  Last Login
                </label>
                <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02] px-4 py-3 text-sm text-gray-600 dark:text-slate-400 transition-colors">
                  <span className="font-medium">
                    {user?.last_login
                      ? format(
                        new Date(user.last_login),
                        "MMM d, yyyy HH:mm",
                      )
                      : "Never"}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
                <Button
                  variant="secondary"
                  onClick={() => setShowPasswordModal(true)}
                  className="rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.05]"
                >
                  Change Password
                </Button>

                <Button
                  variant="primary"
                  className="rounded-2xl bg-[#5856d6] hover:bg-[#4f46e5] text-white shadow-lg dark:bg-[#635BDF] dark:hover:bg-[#5856d6]"
                  isLoading={loading}
                  onClick={handleSave}
                >
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Modal */}

      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Enter your current password and new password below.
          </p>

          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] px-4 py-3 pr-12 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-[#5856d6] focus:outline-none focus:ring-2 focus:ring-[#5856d6]/20 transition-colors"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white cursor-pointer transition-colors"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] px-4 py-3 pr-12 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-[#5856d6] focus:outline-none focus:ring-2 focus:ring-[#5856d6]/20 transition-colors"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white cursor-pointer transition-colors"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] px-4 py-3 pr-12 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-[#5856d6] focus:outline-none focus:ring-2 focus:ring-[#5856d6]/20 transition-colors"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white cursor-pointer transition-colors"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-100 dark:border-white/[0.06] pt-5">
            <Button
              variant="secondary"
              onClick={() => setShowPasswordModal(false)}
              className="rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.05]"
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              className="rounded-2xl bg-[#5856d6] hover:bg-[#4f46e5] text-white shadow-lg dark:bg-[#635BDF] dark:hover:bg-[#5856d6]"
              isLoading={loading}
              onClick={handleChangePassword}
            >
              Update Password
            </Button>
          </div>
        </div>
      </Modal>

      {ToastComponent}
    </DashboardLayout>
  );
}