import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useLoginUserMutation } from "@store/slices/users";
import { setCredentials } from "@store/slices/authSlice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

const Login = () => {
  const { t } = useTranslation();
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { userInfo } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const dispatch = useDispatch();

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

  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo?.token) {
      navigate(redirect);
    }
  }, [userInfo, redirect, navigate]);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) || value === "") {
      setPhoneNumber(value);
    }
  };

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
  };

  const clickHandler = () => {
    setShowPass((prev) => !prev);
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const fullPhoneNumber = selectedCountry.code + phoneNumber;
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
      toast.error(error?.error || t("login_error"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t("login")}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{t("welcome_message")}</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Phone Number Input */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("phone_number")}
              </label>
              <div className="flex rounded-md shadow-sm">
                <div className="relative flex-shrink-0">
                  <button
                    type="button"
                    className="relative w-32 h-full flex items-center justify-between py-2 pl-3 pr-2 border border-r-0 border-gray-300 rounded-l-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  >
                    <div className="flex items-center">
                      <span className="mr-2">{selectedCountry.flag}</span>
                      <span>{selectedCountry.code}</span>
                    </div>
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {showCountryDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {countryCodes.map((country) => (
                        <div
                          key={country.code}
                          className={`flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                            selectedCountry.code === country.code
                              ? "bg-blue-50"
                              : ""
                          }`}
                          onClick={() => handleCountrySelect(country)}
                        >
                          <span className="mr-2">{country.flag}</span>
                          <span className="font-medium mr-2">
                            {country.code}
                          </span>
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
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  placeholder={t("enter_phone_number_without_code")}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("password")}
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type={showPass ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("enter_password")}
                  className="block w-full pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={clickHandler}
                  >
                    {showPass ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {t("forgot_password")}
              </Link>
            </div>
            <div className="text-sm">
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {t("no_account")}
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
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
                  {t("logging_in")}
                </>
              ) : (
                t("login")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
