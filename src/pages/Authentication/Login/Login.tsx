import React, { useEffect, useState } from "react";
import "@pages/Authentication/Login/Login.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useLoginUserMutation } from "@store/slices/users";
import { setCredentials } from "@store/slices/authSlice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState("+82");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { userInfo } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const dispatch = useDispatch();

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/login";

  useEffect(() => {
    if (userInfo?.token) {
      navigate("/");
    }
  }, [userInfo, redirect, navigate]);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 13 && value.startsWith("+82")) {
      setPhoneNumber(value);
    } else if (value === "") {
      setPhoneNumber("");
    } else {
      setPhoneNumber("+82");
    }
  };

  const clickHandler = () => {
    setShowPass((prev) => !prev);
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userInfo = await loginUser({
        phone_number: phoneNumber,
        password,
      }).unwrap();
      dispatch(setCredentials({ ...userInfo }));
      toast.success(t("success_login"), { autoClose: 2000 });
      navigate(redirect);
    } catch (error: any) {
      toast.error(error?.error);
    }
  };

  if (isLoading) {
    return <p>Loading....</p>;
  }

  return (
    <form className="login-container" onSubmit={submitHandler}>
      <h1 className="login-header">{t("login")}</h1>
      <p>{t("welcome_message")}</p>
      <div className="form-group">
        <label htmlFor="phoneNumber">{t("phone_number")}</label>
        <input
          className="mobile-number"
          type="tel"
          id="phoneNumber"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder={t("enter_phone_number")}
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">{t("password")}</label>
        <div className="password-container">
          <input
            type={showPass ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("enter_password")}
            className="password"
          />
          {showPass ? (
            <FaEyeSlash onClick={clickHandler} className="eye-icon" />
          ) : (
            <FaEye onClick={clickHandler} className="eye-icon" />
          )}
        </div>
      </div>
      <button className="login-button" type="submit">
        {t("login")}
      </button>
      <div className="additional-links">
        <p>
          <Link to="/forgot-password">{t("forgot_password")}</Link>
        </p>
        <p>
          <Link to="/register">{t("no_account")}</Link>
        </p>
      </div>
    </form>
  );
};

export default Login;
