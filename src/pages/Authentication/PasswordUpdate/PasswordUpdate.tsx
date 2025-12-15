import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  usePasswordRequestUpdateMutation,
  usePasswordUpdateMutation,
} from "@store/slices/users";

interface PasswordUpdateProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PasswordUpdate: React.FC<PasswordUpdateProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<"current" | "verify" | "new">("current");
  const [currentPassword, setCurrentPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [requestUpdate, { isLoading: isRequesting }] =
    usePasswordRequestUpdateMutation();
  const [updatePassword, { isLoading: isUpdating }] =
    usePasswordUpdateMutation();

  const handleRequestUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error(t("current_password_required") || "Current password is required");
      return;
    }

    try {
      const response = await requestUpdate({
        current_password: currentPassword,
      }).unwrap() as { success: boolean; message?: string; error?: string };

      if (response.success) {
        toast.success(
          response.message || t("verification_code_sent") || "Verification code sent to your email"
        );
        setStep("verify");
      } else {
        toast.error(response.error || t("error_requesting_update") || "Error requesting password update");
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.error ||
        error?.data?.message ||
        t("error_requesting_update") ||
        "Error requesting password update";
      toast.error(errorMessage);
    }
  };

  const handleVerifyAndUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!verificationCode) {
      toast.error(t("verification_code_required") || "Verification code is required");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error(t("password_required") || "Password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t("passwords_do_not_match") || "Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t("password_min_length") || "Password must be at least 8 characters");
      return;
    }

    if (newPassword === currentPassword) {
      toast.error(t("new_password_same") || "New password must be different from current password");
      return;
    }

    try {
      const response = await updatePassword({
        verification_code: verificationCode,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }).unwrap() as { success: boolean; message?: string; error?: string };

      if (response.success) {
        toast.success(
          response.message || t("password_update_success") || "Password updated successfully"
        );
        if (onSuccess) {
          onSuccess();
        }
        // Reset form
        setCurrentPassword("");
        setVerificationCode("");
        setNewPassword("");
        setConfirmPassword("");
        setStep("current");
      } else {
        toast.error(response.error || t("password_update_error") || "Password update failed");
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.error ||
        error?.data?.message ||
        t("password_update_error") ||
        "Password update failed";
      toast.error(errorMessage);
    }
  };

  const handleVerificationCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(value);
    // Auto-advance to new password step when 6 digits are entered
    if (value.length === 6) {
      setStep("new");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        {t("update_password") || "Update Password"}
      </h2>

      {step === "current" && (
        <form onSubmit={handleRequestUpdate} className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("current_password") || "Current Password"}
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t("enter_current_password") || "Enter current password"}
                className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {t("cancel") || "Cancel"}
              </button>
            )}
            <button
              type="submit"
              disabled={isRequesting || !currentPassword}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium text-white ${
                isRequesting || !currentPassword
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isRequesting
                ? t("sending...") || "Sending..."
                : t("send_verification_code") || "Send Verification Code"}
            </button>
          </div>
        </form>
      )}

      {step === "verify" && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="verificationCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("verification_code") || "Verification Code"}
            </label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={handleVerificationCodeChange}
              placeholder={t("enter_verification_code") || "Enter 6-digit code"}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center text-2xl tracking-widest"
              maxLength={6}
              autoFocus
            />
            <p className="mt-1 text-xs text-gray-500 text-center">
              {t("enter_code_to_continue") || "Enter the code sent to your email to continue"}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setStep("current");
                setVerificationCode("");
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {t("back") || "Back"}
            </button>
            <button
              type="button"
              onClick={() => setStep("new")}
              disabled={verificationCode.length !== 6}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium text-white ${
                verificationCode.length !== 6
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {t("continue") || "Continue"}
            </button>
          </div>
        </div>
      )}

      {step === "new" && (
        <form onSubmit={handleVerifyAndUpdate} className="space-y-4">
          <div>
            <label
              htmlFor="verificationCodeDisplay"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("verification_code") || "Verification Code"}
            </label>
            <input
              type="text"
              id="verificationCodeDisplay"
              value={verificationCode}
              onChange={handleVerificationCodeChange}
              placeholder={t("enter_verification_code") || "Enter 6-digit code"}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center text-2xl tracking-widest"
              maxLength={6}
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("new_password") || "New Password"}
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("enter_new_password") || "Enter new password"}
                className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("confirm_password") || "Confirm Password"}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("confirm_new_password") || "Confirm new password"}
                className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setStep("verify");
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {t("back") || "Back"}
            </button>
            <button
              type="submit"
              disabled={
                isUpdating ||
                !verificationCode ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword
              }
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium text-white ${
                isUpdating ||
                !verificationCode ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isUpdating
                ? t("updating...") || "Updating..."
                : t("update_password") || "Update Password"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PasswordUpdate;

