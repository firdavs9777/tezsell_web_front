import React, { useState } from "react";


interface SummaryInputInfo {
  userName: string;
  userPassword: string,
  setUserName: (value: string) => void;
  setUserPassword: (value: string)=> void;
}

const SummaryRegister: React.FC<SummaryInputInfo> = ({userName,userPassword, setUserName, setUserPassword}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="register-form">
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="register-username"
          placeholder="Enter your username"
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            className="register-password"
            placeholder="Enter your password"
          />
          <span
            className="toggle-password"
            onClick={togglePasswordVisibility}
            style={{ cursor: "pointer" }}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryRegister;
