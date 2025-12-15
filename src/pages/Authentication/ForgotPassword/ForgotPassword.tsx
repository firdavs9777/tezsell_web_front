import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  useForgotPasswordSendOtpMutation,
  useForgotPasswordResetMutation,
} from "@store/slices/users";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [sendOtp, { isLoading: isSendingOtp }] = useForgotPasswordSendOtpMutation();
  const [resetPassword, { isLoading: isResetting }] = useForgotPasswordResetMutation();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email) {
      toast.error(t("email_required") || "Email is required");
      return;
    }

    if (!validateEmail(email)) {
      toast.error(t("invalid_email") || "Invalid email format");
      return;
    }

    try {
      const data: { email: string; phone_number?: string } = { email };
      if (phoneNumber) {
        data.phone_number = phoneNumber;
      }

      const response = await sendOtp(data).unwrap();
      
      if (response.success) {
        toast.success(response.message || t("otp_sent_successfully") || "OTP sent successfully");
        setStep("reset");
      } else {
        toast.error(response.error || t("error_sending_otp") || "Error sending OTP");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.data?.message || t("error_sending_otp") || "Error sending OTP";
      toast.error(errorMessage);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!otp) {
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

    try {
      const data: {
        email: string;
        verification_code: string;
        new_password: string;
        confirm_password: string;
        phone_number?: string;
      } = {
        email,
        verification_code: otp,
        new_password: newPassword,
        confirm_password: confirmPassword,
      };

      if (phoneNumber) {
        data.phone_number = phoneNumber;
      }

      const response = await resetPassword(data).unwrap();

      if (response.success) {
        toast.success(response.message || t("password_reset_success") || "Password reset successful");
        navigate("/login");
      } else {
        toast.error(response.error || t("password_reset_error") || "Password reset failed");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.data?.message || t("password_reset_error") || "Password reset failed";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t("forgot_password") || "Forgot Password"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === "email"
              ? t("forgot_password_description") || "Enter your email to receive a password reset code"
              : t("enter_otp_and_new_password") || "Enter the OTP and your new password"}
          </p>
        </div>

        {step === "email" ? (
          <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("email") || "Email"}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("enter_email") || "Enter your email"}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("phone_number") || "Phone Number"} ({t("optional") || "Optional"})
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t("enter_phone_number") || "Enter phone number (optional)"}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t("phone_number_otp_note") || "If provided, OTP will be sent via SMS instead of email"}
                </p>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSendingOtp || !email}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSendingOtp || !email ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isSendingOtp ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("sending...") || "Sending..."}
                  </>
                ) : (
                  t("send_otp") || "Send OTP"
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {t("back_to_login") || "Back to Login"}
              </Link>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("verification_code") || "Verification Code"}
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder={t("enter_verification_code") || "Enter 6-digit code"}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
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
                    type={showPassword ? "text" : "password"}
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
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
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
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={isResetting || !otp || !newPassword || !confirmPassword}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  isResetting || !otp || !newPassword || !confirmPassword
                    ? "opacity-75 cursor-not-allowed"
                    : ""
                }`}
              >
                {isResetting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("resetting...") || "Resetting..."}
                  </>
                ) : (
                  t("reset_password") || "Reset Password"
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {t("back") || "Back"}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {t("back_to_login") || "Back to Login"}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

