import DistrictSelect from "@pages/Authentication/Register/Steps/DistrictSelect";
import EmailVerification from "@pages/Authentication/Register/Steps/EmailVerification";
import RegionSelect from "@pages/Authentication/Register/Steps/RegionSelect";
import SummaryRegister from "@pages/Authentication/Register/Steps/SummaryRegister";
import { setCredentials } from "@store/slices/authSlice";
import { useRegisterUserMutation } from "@store/slices/users";
import { RegisterInfo } from "@store/type";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [phoneNumber] = useState(""); // Optional - no UI to set it currently
  const [regionName, setRegionName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [userName, setUserName] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const [locationId, setLocationId] = useState<number>(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const { t } = useTranslation();
  const redirect = sp.get("redirect") || "/";
    useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const handleEmailVerification = (status: boolean, code?: string) => {
    setIsEmailVerified(status);
    if (status && code) {
      setVerificationCode(code);
      toast.success(t("register_email_success") || "Email verified successfully");
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleRegionSelect = (status: boolean, region: string) => {
    if (status) {
      toast.success(`${t("region_selected_message")} ${region}`, {
        autoClose: 3000,
      });
    }
    setRegionName(region);
    setCurrentStep((prev) => prev + 1);
  };

  const handleSelectDistrict = (district: string, id: number) => {
    if (district && id) {
      setDistrictName(district);
      setLocationId(id);
      toast.success(`${t("district_select_message")}, ${district}`, {
        autoClose: 3000,
      });
    }

    setCurrentStep((prev) => prev + 1);
  };

  const nextStep = () => {
    if (currentStep === 1 && !isEmailVerified)
      return toast.error(t("email_not_verified") || "Please verify your email");
    if (currentStep === 2 && !regionName)
      return toast.error(t("region_emtpy_message"));
    if (currentStep === 3 && !districtName)
      return toast.error(t("district_emtpy_message"));
    if (currentStep === 4 && (!userName || !userPassword))
      return toast.error(t("username_password_emtpy_message"));

    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const submitRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!verificationCode) {
      toast.error(t("verification_code_required") || "Verification code is required");
      return;
    }
    const registerInput: RegisterInfo = {
      email,
      password: userPassword,
      verification_code: verificationCode,
      username: userName || undefined,
      phone_number: phoneNumber || undefined,
      user_type: "regular",
      location_id: locationId || undefined,
    };
    try {
      const registerInfo = await registerUser(registerInput).unwrap();
      dispatch(setCredentials({ ...(registerInfo as any) }));
      toast.success(t("register_success"), { autoClose: 3000 });
      navigate(redirect);
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.data?.message || t("register_error");
      toast.error(errorMessage, {
        autoClose: 3000,
      });
    }
  };
  if (isLoading) return <div>{t("loading.loading")}</div>;
  return (
    <form
      onSubmit={submitRegister}
      className="min-h-screen bg-gray-50 py-10 px-4"
    >
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          {t("register_title")}
        </h1>
        <div className="text-sm text-gray-500 text-center mb-6">
          {t("step_indicator", { currentStep })}
        </div>

        {currentStep === 1 && (
          <EmailVerification
            onVerify={handleEmailVerification}
            email={email}
            setEmail={setEmail}
          />
        )}
        {currentStep === 2 && (
          <RegionSelect onSelect={handleRegionSelect} region={regionName} />
        )}
        {currentStep === 3 && (
          <DistrictSelect
            regionName={regionName}
            district={districtName}
            onSelect={handleSelectDistrict}
          />
        )}
        {currentStep === 4 && (
          <SummaryRegister
            userName={userName}
            userPassword={userPassword}
            setUserName={setUserName}
            setUserPassword={setUserPassword}
          />
        )}

        <div className="flex justify-between mt-6">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              {t("previous_button")}
            </button>
          )}
          {currentStep < 4 && (
            <button
              type="button"
              onClick={nextStep}
              className="ml-auto px-4 py-2 bg-blue-700 text-[#fff] rounded-md font-bold hover:bg-blue-700 transition disabled:opacity-50"
              disabled={
                (currentStep === 1 && !isEmailVerified) ||
                (currentStep === 2 && regionName === "") ||
                (currentStep === 3 && districtName === "") ||
                (currentStep === 4 && (!userName || !userPassword))
              }
            >
              {t("next_button")}
            </button>
          )}
          {currentStep === 4 && (
            <button
              type="submit"
              className="ml-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              {t("complete_button")}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default Register;
