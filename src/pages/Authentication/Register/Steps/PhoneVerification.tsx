import React, { useState } from "react";
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
  const [countryCode, setCountryCode] = useState("+82");
  const [sendCodeToUser] = useSendSmsUserMutation();
  const [verifyUser] = useVerifyCodeUserMutation();

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountryCode(e.target.value);
    // Reset the phone number when country code changes
    setPhoneNumber("");
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Validate based on country code
    if (countryCode === "+82" && value.length <= 11) {
      setPhoneNumber(value);
    } else if (countryCode === "+998" && value.length <= 9) {
      setPhoneNumber(value);
    } else if (value === "") {
      setPhoneNumber("");
    }
  };

  const handleVerificationCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setVerificationCode(e.target.value);
  };

  const sendOTP = async (): Promise<void> => {
    if (!phoneNumber) {
      toast.error(t("phone_number_required"), { autoClose: 3000 });
      return;
    }

    // Validate length based on country code
    if (
      (countryCode === "+82" && phoneNumber.length !== 11) ||
      (countryCode === "+998" && phoneNumber.length !== 9)
    ) {
      toast.error(t("invalid_phone_number_length"), { autoClose: 3000 });
      return;
    }

    setOtpSent(true);
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    try {
      const response: ResponseSendCode | unknown = await sendCodeToUser({
        phone_number: fullPhoneNumber,
      }).unwrap();
      const data = response as ResponseSendCode;
      if (data) {
        if (data.result) {
          setOtpSent(true);
          toast.success(`${data.message} ${t("to")} ${fullPhoneNumber}`, {
            autoClose: 3000,
          });
        } else {
          toast.error(t("failed_to_send_otp"), { autoClose: 3000 });
        }
      }
    } catch {
      toast.error(t("error_sending_otp"), { autoClose: 3000 });
    }
  };

  const verifyOTP = async () => {
    if (!verificationCode) {
      toast.error(t("verification_code_required"), { autoClose: 3000 });
      return;
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    try {
      const response: ResponseVerification | unknown = await verifyUser({
        phone_number: fullPhoneNumber,
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
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {t("phone_number")}
        </label>

        <div className="flex gap-2">
          <select
            value={countryCode}
            onChange={handleCountryCodeChange}
            className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="+82">South Korea (+82)</option>
            <option value="+998">Uzbekistan (+998)</option>
          </select>

          <input
            type="tel"
            className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder={countryCode === "+82" ? "1012345678" : "901234567"}
          />
        </div>
      </div>

      {!otpSent ? (
        <button
          onClick={sendOTP}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {t("send_otp")}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("verification_code")}
            </label>
            <input
              type="text"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder={t("enter_verification_code")}
              value={verificationCode}
              onChange={handleVerificationCodeChange}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={sendOTP}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              type="button"
            >
              {t("send_again")}
            </button>
            <button
              onClick={verifyOTP}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              type="button"
            >
              {t("verify")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneNumberVerification;
