import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface SummaryInputInfo {
  userName: string;
  userPassword: string;
  setUserName: (value: string) => void;
  setUserPassword: (value: string) => void;
}

const SummaryRegister: React.FC<SummaryInputInfo> = ({
  userName,
  userPassword,
  setUserName,
  setUserPassword,
}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="w-full max-h-screen overflow-y-auto p-4 bg-gray-10">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
       
        <div className="space-y-4">
          <div className="space-y-2">
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-700"
            >
              {t("username")}
            </label>
            <input
              type="text"
              id="username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t("enter_username")}
            />
          </div>
          <div className="space-y-2">
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              {t("password")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                placeholder={t("enter_password")}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span className="text-gray-500 text-lg">
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  
  );
};

export default SummaryRegister;
