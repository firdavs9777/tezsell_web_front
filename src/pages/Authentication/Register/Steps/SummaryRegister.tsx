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
    <div className="register-form">
      <div className="form-group">
        <label htmlFor="username">{t("username")}</label>
        <input
          type="text"
          id="username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="register-username"
          placeholder={t("enter_username")}
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">{t("password")}</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            className="register-password"
            placeholder={t("enter_password")}
          />
          <span
            className="toggle-password"
            onClick={togglePasswordVisibility}
            style={{ cursor: "pointer", fontSize: "20px" }}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryRegister;
