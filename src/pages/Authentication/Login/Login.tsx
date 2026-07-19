import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useSelector, useDispatch } from "react-redux";
import { useLoginUserMutation } from "@store/slices/users";
import { useGoogleSignInMutation } from "@store/slices/socialAuthSlice";
import { setCredentials } from "@store/slices/authSlice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logo.jpg";

// Google OAuth Client ID - should be in environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              width?: number;
              type?: string;
              text?: string;
              shape?: string;
              logo_alignment?: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const { userInfo } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [googleSignIn] = useGoogleSignInMutation();
  const dispatch = useDispatch();

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  // Load Google Sign-In script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn("Google Client ID not configured");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleScriptLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  // Handle Google Sign-In callback
  const handleGoogleCallback = useCallback(
    async (response: { credential: string }) => {
      setIsGoogleLoading(true);
      try {
        const result = await googleSignIn({
          id_token: response.credential,
        }).unwrap();

        if (result.success || result.token || result.access_token) {
          dispatch(setCredentials({ ...result }));
          toast.success(t("success_login"), { autoClose: 2000 });

          // New accounts still need to pick their region
          if (result.is_new_user) {
            navigate("/register?step=region");
          } else {
            navigate(redirect);
          }
        } else {
          toast.error(result.error || t("login_error"));
        }
      } catch (error: any) {
        console.error("Google Sign-In error:", error);
        toast.error(error?.data?.error || t("google_signin_error") || "Google sign-in failed");
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [googleSignIn, dispatch, navigate, redirect, t]
  );

  // Initialize Google Sign-In button
  useEffect(() => {
    if (googleScriptLoaded && window.google && GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });

      const buttonDiv = document.getElementById("google-signin-button");
      if (buttonDiv) {
        window.google.accounts.id.renderButton(buttonDiv, {
          theme: "outline",
          size: "large",
          width: 400,
          type: "standard",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
        });
      }
    }
  }, [googleScriptLoaded, handleGoogleCallback]);

  useEffect(() => {
    if (userInfo?.token || userInfo?.access_token) {
      navigate(redirect);
    }
  }, [userInfo, redirect, navigate]);

  const clickHandler = () => {
    setShowPass((prev) => !prev);
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t("email_password_required") || "Email and password are required");
      return;
    }
    try {
      const userInfo = await loginUser({
        email,
        password,
      }).unwrap();
      if (userInfo && typeof userInfo === "object") {
        dispatch(setCredentials({ ...userInfo }));
      }
      toast.success(t("success_login"), { autoClose: 2000 });
      navigate(redirect);
    } catch (error: any) {
      toast.error(error?.error || error?.data?.error || t("login_error"));
    }
  };

  // Custom Google Sign-In button handler (fallback if native button fails)
  const handleCustomGoogleSignIn = () => {
    if (window.google && GOOGLE_CLIENT_ID) {
      window.google.accounts.id.prompt();
    } else {
      toast.error(t("google_signin_unavailable") || "Google Sign-In is not available");
    }
  };

  if (isLoading || isGoogleLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg bg-white p-1">
            <img
              src={logo}
              alt="TezSell Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* Header */}
        <div className="text-center">
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            {t("login")}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{t("welcome_message")}</p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("email") || "Email"}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("enter_email") || "Enter your email"}
                className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                required
              />
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
                  className="block w-full px-3 py-3 pr-10 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
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

          {/* Login Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-all ${
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

        {/* Divider */}
        {GOOGLE_CLIENT_ID && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">
                  {t("or") || "OR"}
                </span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <div className="space-y-3">
              {/* Native Google Button (rendered by Google SDK) */}
              <div
                id="google-signin-button"
                className="flex justify-center"
              ></div>

              {/* Fallback Custom Google Button */}
              {!googleScriptLoaded && (
                <button
                  type="button"
                  onClick={handleCustomGoogleSignIn}
                  disabled={isGoogleLoading || !GOOGLE_CLIENT_ID}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGoogleLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-600"></div>
                  ) : (
                    <>
                      <FcGoogle className="h-5 w-5" />
                      <span className="font-medium">
                        {t("continue_with_google") || "Continue with Google"}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
