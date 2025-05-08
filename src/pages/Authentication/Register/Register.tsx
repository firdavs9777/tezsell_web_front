import React, { useState } from "react";
import PhoneNumberVerification from "@pages/Authentication/Register/Steps/PhoneVerification";
import RegionSelect from "@pages/Authentication/Register/Steps/RegionSelect";
import DistrictSelect from "@pages/Authentication/Register/Steps/DistrictSelect";
import SummaryRegister from "@pages/Authentication/Register/Steps/SummaryRegister";
import { toast } from "react-toastify";
import { useRegisterUserMutation } from "@store/slices/users";
import { useLocation, useNavigate } from "react-router-dom";
import { RegisterInfo } from "@store/type";
import { useDispatch } from "react-redux";
import { setCredentials } from "@store/slices/authSlice";
import { useTranslation } from "react-i18next";

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("+82");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
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

  const handlePhoneVerification = (status: boolean) => {
    setIsPhoneVerified(status);
    if (status) toast.success(t("register_phone_number_success"));
    setCurrentStep((prev) => prev + 1);
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
    if (currentStep === 1 && !isPhoneVerified)
      return toast.error(t("phone_number_emtpy_message"));
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
    const registerInput: RegisterInfo = {
      username: userName,
      password: userPassword,
      phone_number: phoneNumber,
      user_type: "regular",
      location_id: locationId,
    };
    try {
      const registerInfo = await registerUser(registerInput).unwrap();
      dispatch(setCredentials({ ...(registerInfo as any) }));
      toast.success(t("register_success"), { autoClose: 3000 });
      navigate(redirect);
    } catch {
      toast.error(t("register_error"), {
        autoClose: 3000,
      });
    }
  };
  if (isLoading) return <div>{t("loading")}</div>;
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
          <PhoneNumberVerification
            onVerify={handlePhoneVerification}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
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
                (currentStep === 1 && !isPhoneVerified) ||
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
