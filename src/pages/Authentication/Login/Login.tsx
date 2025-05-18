import React, { useEffect, useState } from "react";
// No need to import CSS as we're using Tailwind
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useLoginUserMutation } from "@store/slices/users";
import { setCredentials } from "@store/slices/authSlice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();
  const [countryCode, setCountryCode] = useState("+82");
  const [phoneNumber, setPhoneNumber] = useState("");
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
    // Allow only numbers in the phone input
    if (/^\d*$/.test(value) || value === "") {
      setPhoneNumber(value);
    }
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountryCode(e.target.value);
  };

  const clickHandler = () => {
    setShowPass((prev) => !prev);
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const fullPhoneNumber = countryCode + phoneNumber;
      const userInfo = await loginUser({
        phone_number: fullPhoneNumber,
        password,
      }).unwrap();
      if (userInfo && typeof userInfo === "object") {
        dispatch(setCredentials({ ...userInfo }));
      }
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
    <form
      className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"
      onSubmit={submitHandler}
    >
      <h1 className="text-2xl font-bold mb-4 text-center">{t("login")}</h1>
      <p className="text-gray-600 mb-6 text-center">{t("welcome_message")}</p>
      <div className="mb-4">
        <label
          htmlFor="phoneNumber"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          {t("phone_number")}
        </label>
        <div className="flex">
          <select
            value={countryCode}
            onChange={handleCountryCodeChange}
            className="w-24 border border-gray-300 p-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="+82">🇰🇷 +82</option>
            <option value="+998">🇺🇿 +998</option>
          </select>
          <input
            className="flex-1 border border-gray-300 p-2 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder={t("enter_phone_number_without_code")}
          />
        </div>
      </div>
      <div className="mb-6">
        <label
          htmlFor="password"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          {t("password")}
        </label>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("enter_password")}
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          />
          <div
            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
            onClick={clickHandler}
          >
            {showPass ? (
              <FaEyeSlash className="text-gray-500" />
            ) : (
              <FaEye className="text-gray-500" />
            )}
          </div>
        </div>
      </div>
      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        type="submit"
      >
        {t("login")}
      </button>
      <div className="mt-4 text-center text-sm">
        <p className="mb-2">
          <Link
            to="/forgot-password"
            className="text-blue-600 hover:text-blue-800"
          >
            {t("forgot_password")}
          </Link>
        </p>
        <p>
          <Link to="/register" className="text-blue-600 hover:text-blue-800">
            {t("no_account")}
          </Link>
        </p>
      </div>
    </form>
  );
};

export default Login;
