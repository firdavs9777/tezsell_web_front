import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  useSendVerificationCodeMutation,
  useVerifyEmailCodeMutation,
} from "@store/slices/users";

interface EmailVerificationProps {
  email: string;
  setEmail: (email: string) => void;
  onVerify: (status: boolean, verificationCode?: string) => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  onVerify,
  email,
  setEmail,
}) => {
  const { t } = useTranslation();
  const [verificationCode, setVerificationCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendVerificationCode, { isLoading: isSending }] = useSendVerificationCodeMutation();
  const [verifyEmailCode, { isLoading: isVerifying }] = useVerifyEmailCodeMutation();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const sendOTP = async (): Promise<void> => {
    if (!email) {
      toast.error(t("email_required") || "Email is required");
      return;
    }

    if (!validateEmail(email)) {
      toast.error(t("invalid_email") || "Invalid email format");
      return;
    }

    try {
      const response = await sendVerificationCode({ email }).unwrap();
      
      if (response.success) {
        setOtpSent(true);
        toast.success(
          response.message || t("otp_sent_to_email") || `Verification code sent to ${email}`,
          { autoClose: 3000 }
        );
      } else {
        toast.error(response.error || t("error_sending_otp") || "Error sending verification code");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.data?.message || t("error_sending_otp") || "Error sending verification code";
      toast.error(errorMessage, {
        autoClose: 3000,
      });
    }
  };

  const verifyOTP = async () => {
    if (!verificationCode) {
      toast.error(t("verification_code_required") || "Verification code is required");
      return;
    }

    if (verificationCode.length !== 6) {
      toast.error(t("verification_code_length") || "Verification code must be 6 digits");
      return;
    }

    try {
      const response = await verifyEmailCode({ email, code: verificationCode }).unwrap();
      
      if (response.success && response.verified) {
        onVerify(true, verificationCode);
        toast.success(response.message || t("verification_success") || "Email verified successfully", {
          autoClose: 3000,
        });
      } else {
        toast.error(response.error || t("verification_error") || "Verification failed");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.data?.message || t("verification_error") || "Invalid or expired verification code";
      toast.error(errorMessage, {
        autoClose: 3000,
      });
    }
  };

  const handleVerificationCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(value);
  };

  return (
    <div className="w-full max-w-md mx-auto p-5 space-y-4">
      <label
        htmlFor="email"
        className="block text-sm font-medium text-gray-700"
      >
        {t("email") || "Email"}
      </label>

      <input
        type="email"
        id="email"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("enter_email") || "Enter your email"}
        disabled={otpSent}
      />

      {!otpSent ? (
        <button
          onClick={sendOTP}
          className={`w-full px-4 py-3 rounded-lg font-medium text-white ${
            isSending || !email || !validateEmail(email)
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } transition-colors`}
          disabled={isSending || !email || !validateEmail(email)}
          type="button"
        >
          {isSending ? t("sending...") || "Sending..." : t("send_verification_code") || "Send Verification Code"}
        </button>
      ) : (
        <>
          <div className="space-y-2">
            <label
              htmlFor="verificationCode"
              className="block text-sm font-medium text-gray-700"
            >
              {t("verification_code") || "Verification Code"}
            </label>
            <input
              type="text"
              id="verificationCode"
              placeholder={t("enter_verification_code") || "Enter 6-digit code"}
              value={verificationCode}
              onChange={handleVerificationCodeChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
              maxLength={6}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={sendOTP}
              className={`flex-1 px-4 py-3 rounded-lg font-medium ${
                isSending
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200"
              } text-gray-800 transition-colors`}
              type="button"
              disabled={isSending}
            >
              {isSending ? t("sending...") || "Sending..." : t("send_again") || "Send Again"}
            </button>
            <button
              onClick={verifyOTP}
              className={`flex-1 px-4 py-3 rounded-lg font-medium text-white ${
                isVerifying || !verificationCode
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } transition-colors`}
              type="button"
              disabled={isVerifying || !verificationCode}
            >
              {isVerifying ? t("verifying...") || "Verifying..." : t("verify") || "Verify"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EmailVerification;

