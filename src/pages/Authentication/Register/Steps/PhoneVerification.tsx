import React, { useState } from "react";
import "./PhoneNumberVerification.css";
import {
  useSendSmsUserMutation,
  useVerifyCodeUserMutation,
} from "@store/slices/users";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface PhoneNumberVerificationProps {
  phoneNumber: string;
  setPhoneNumber: (name: string) => void;
  onVerify: (status: boolean) => void;
}

interface ResponseSendCode {
  result: boolean;
  message: string;
  sid: string;
}

interface ResponseVerification {
  result: boolean;
  verification_code: number;
  message: string;
}

const PhoneNumberVerification: React.FC<PhoneNumberVerificationProps> = ({
  onVerify,
  phoneNumber,
  setPhoneNumber,
}) => {
  const { t } = useTranslation();
  const [verificationCode, setVerificationCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendCodeToUser] = useSendSmsUserMutation();
  const [verifyUser] = useVerifyCodeUserMutation();

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.startsWith("+998") && value.length <= 13) {
      setPhoneNumber(value);
    } else if (value === "") {
      setPhoneNumber("");
    } else {
      setPhoneNumber("+821082773725");
    }
  };

  const handleVerificationCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setVerificationCode(e.target.value);
  };

  const sendOTP = async (): Promise<void> => {
    setOtpSent(true);
    if (phoneNumber.length === 13) {
      try {
        const response: ResponseSendCode | unknown = await sendCodeToUser({
          phone_number: phoneNumber,
        }).unwrap();
        const data = response as ResponseSendCode;
        if (data) {
          if (data.result) {
            setOtpSent(true);
            toast.success(`${data.message} ${t("to")} ${phoneNumber}`, {
              autoClose: 3000,
            });
          } else {
            toast.error(t("failed_to_send_otp"), { autoClose: 3000 });
          }
        }
      } catch {
        toast.error(t("error_sending_otp"), { autoClose: 3000 });
      }
    } else {
      toast.error(t("invalid_phone_number"), { autoClose: 3000 });
    }
  };

  const verifyOTP = async () => {
    try {
      const response: ResponseVerification | unknown = await verifyUser({
        phone_number: phoneNumber,
        otp: verificationCode,
      }).unwrap();
      const data = response as ResponseVerification;
      if (data && data.result) {
        onVerify(true);
        toast.success(t("verification_success"), { autoClose: 3000 });
      }
    } catch {
      toast.error(t("verification_error"), { autoClose: 3000 });
    }
  };

  return (
    <div className="register-step-one">
      <label htmlFor="phoneNumber">{t("phone_number")}</label>
      <input
        type="tel"
        id="phoneNumber"
        className="register-mobile-number"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        placeholder="941234567"
      />

      {!otpSent ? (
        <button onClick={sendOTP} className="register-button">
          {t("send_otp")}
        </button>
      ) : (
        <>
          <input
            type="text"
            placeholder={t("enter_verification_code")}
            value={verificationCode}
            onChange={handleVerificationCodeChange}
          />
          <button onClick={sendOTP} className="register-button" type="button">
            {t("send_again")}
          </button>
          <button onClick={verifyOTP} className="register-verify" type="button">
            {t("verify")}
          </button>
        </>
      )}
    </div>
  );
};

export default PhoneNumberVerification;
