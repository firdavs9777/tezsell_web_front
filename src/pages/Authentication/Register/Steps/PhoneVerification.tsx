import React, { useEffect, useState } from "react";
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

interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

const PhoneNumberVerification: React.FC<PhoneNumberVerificationProps> = ({
  onVerify,
  phoneNumber,
  setPhoneNumber,
}) => {
  const { t } = useTranslation();
  const [verificationCode, setVerificationCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendCodeToUser, { isLoading }] = useSendSmsUserMutation();
  const [verifyUser, { isLoading: isLoading_two }] =
    useVerifyCodeUserMutation();
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  // Country code options
  const countryCodes: CountryCode[] = [
    { code: "+998", country: "Uzbekistan", flag: "🇺🇿" },
    { code: "+82", country: "Korea", flag: "🇰🇷" },
    { code: "+1", country: "USA", flag: "🇺🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+49", country: "Germany", flag: "🇩🇪" },
    { code: "+33", country: "France", flag: "🇫🇷" },
    { code: "+81", country: "Japan", flag: "🇯🇵" },
    { code: "+86", country: "China", flag: "🇨🇳" },
    { code: "+91", country: "India", flag: "🇮🇳" },
  ];

  const [selectedCountryCode, setSelectedCountryCode] = useState("+998");
  const selectedCountry = countryCodes.find(
    (c) => c.code === selectedCountryCode
  );
  useEffect(() => {
    if (isFirstVisit) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsFirstVisit(false);
      
      // Store in localStorage that user has visited
      localStorage.setItem("hasVisitedPhoneVerification", "true");
    }
  }, [isFirstVisit]);
  const handleCountryCodeChange = (code: string) => {
    setSelectedCountryCode(code);
    setShowCountryDropdown(false);

    // If there's already a phone number, update it with the new country code
    if (phoneNumber) {
      const numberWithoutCode = phoneNumber.replace(/^\+\d+/, "");
      setPhoneNumber(code + numberWithoutCode);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Only allow digits and + at the start
    if (/^\+?\d*$/.test(value)) {
      // If the value starts with a country code from our list, auto-select that country
      const matchedCountry = countryCodes.find((country) =>
        value.startsWith(country.code)
      );

      if (matchedCountry) {
        setSelectedCountryCode(matchedCountry.code);
        setPhoneNumber(value);
      } else if (value === "" || value.startsWith("+")) {
        // Allow empty or new country code input
        setPhoneNumber(value);
      } else {
        // Otherwise prepend the selected country code
        setPhoneNumber(selectedCountryCode + value);
      }
    }
  };

  const handleVerificationCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setVerificationCode(e.target.value);
  };

  const sendOTP = async (): Promise<void> => {
    // Validate phone number based on selected country code
    const minLength = selectedCountryCode === "+998" ? 12 : 11; // Different length requirements

    if (phoneNumber.length >= minLength) {
      setOtpSent(true);
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

  // Display value for the input field
  const displayPhoneNumber = phoneNumber.startsWith(selectedCountryCode)
    ? phoneNumber.slice(selectedCountryCode.length)
    : phoneNumber.startsWith("+")
    ? phoneNumber
    : phoneNumber;

  return (
    <div className="w-full max-w-md mx-auto p-5 space-y-4">
      <label
        htmlFor="phoneNumber"
        className="block text-sm font-medium text-gray-700"
      >
        {t("phone_number")}
      </label>

      <div className="flex flex-col sm:flex-row gap-2 w-full">
        {/* Country code selector */}
        <div className="relative w-full sm:w-auto">
          <button
            type="button"
            className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{selectedCountry?.flag}</span>
              <span className="font-medium">{selectedCountryCode}</span>
            </div>
            <span className="text-xs text-gray-500">
              {showCountryDropdown ? "▲" : "▼"}
            </span>
          </button>

          {showCountryDropdown && (
            <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg">
              {countryCodes.map((country) => (
                <div
                  key={country.code}
                  className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-50 ${
                    selectedCountryCode === country.code ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleCountryCodeChange(country.code)}
                >
                  <span className="text-lg mr-2">{country.flag}</span>
                  <span className="font-medium mr-2">{country.code}</span>
                  <span className="text-gray-600 truncate">
                    {country.country}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          type="tel"
          id="phoneNumber"
          className="flex-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          value={displayPhoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder={
            selectedCountryCode === "+998" ? "941234567" : "1082773725"
          }
        />
      </div>

      {!otpSent ? (
        <button
          onClick={sendOTP}
          className={`w-full px-4 py-3 rounded-lg font-medium text-white ${
            isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          } transition-colors`}
          disabled={isLoading}
        >
          {isLoading ? t("sending...") : t("send_otp")}
        </button>
      ) : (
        <>
          <input
            type="text"
            placeholder={t("enter_verification_code")}
            value={verificationCode}
            onChange={handleVerificationCodeChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={sendOTP}
              className={`flex-1 px-4 py-3 rounded-lg font-medium ${
                isLoading ? "bg-gray-200" : "bg-gray-100 hover:bg-gray-200"
              } text-gray-800 transition-colors`}
              type="button"
              disabled={isLoading}
            >
              {isLoading ? t("sending...") : t("send_again")}
            </button>
            <button
              onClick={verifyOTP}
              className={`flex-1 px-4 py-3 rounded-lg font-medium text-white ${
                isLoading_two
                  ? "bg-green-400"
                  : "bg-green-600 hover:bg-green-700"
              } transition-colors`}
              type="button"
              disabled={isLoading_two}
            >
              {isLoading_two ? t("verifying...") : t("verify")}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PhoneNumberVerification;
