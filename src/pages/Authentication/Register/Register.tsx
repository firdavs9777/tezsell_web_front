import React, { useState } from "react";
import "./Register.css";
import PhoneNumberVerification from "./Steps/PhoneVerification";
import RegionSelect from "./Steps/RegionSelect";
import DistrictSelect from "./Steps/DistrictSelect";
import { toast } from "react-toastify";
import SummaryRegister from "./Steps/SummaryRegister";
import { useRegisterUserMutation } from "../../../store/slices/users";
import { useLocation, useNavigate } from "react-router-dom";
import { RegisterInfo } from "../../../store/type";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../../store/slices/authSlice";
import { useTranslation } from "react-i18next";
const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("+821082773725");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [regionName, setRegionName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [userName, setUserName] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const { t, i18n } = useTranslation();
  const redirect = sp.get("redirect") || "/";
  const handlePhoneVerification = (status: boolean) => {
    setIsPhoneVerified(status);
    if (status) {
      toast.success(`${t("register_phone_number_success")}`);
    }
    setCurrentStep((prevStep) => prevStep + 1);
  };
  const handleRegionSelect = (status: boolean, region: string) => {
    if (status) {
      toast.success(`${t("region_selected_message")} ${region} `, {
        autoClose: 3000,
      });
    }
    setRegionName(region);
    setCurrentStep((prevStep) => prevStep + 1);
  };
  const handleSelectDistrict = (district: string) => {
    if (district) {
      setDistrictName(district);
      toast.success(`${t("district_select_message")}, ${district}`, {
        autoClose: 3000,
      });
    }
    setCurrentStep((prevStep) => prevStep + 1);
  };
  const nextStep = () => {
    if (currentStep === 1 && !isPhoneVerified) {
      toast.error(`${t("phone_number_emtpy_message")}`, {
        autoClose: 3000,
      });
      return;
    }
    if (currentStep === 2 && regionName === "") {
      toast.error(`${t("region_emtpy_message")}`, { autoClose: 3000 });
      return;
    }
    if (currentStep === 3 && districtName === "") {
      toast.error(`${t("district_emtpy_message")}`, { autoClose: 3000 });
      return;
    }
    if (currentStep === 4 && userName === "" && userPassword === "") {
      toast.error(`${t("username_password_emtpy_message")}`, {
        autoClose: 3000,
      });
      return;
    }
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const prevStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const submitRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const registerInput: RegisterInfo = {
      username: userName,
      password: userPassword,
      phone_number: phoneNumber,
      user_type: "regular",
      location: {
        country: "Uzbekistan",
        region: regionName,
        district: districtName,
      },
    };
    try {
      const registerInfo: RegisterInfo | unknown = await registerUser(
        registerInput
      ).unwrap();
      const ActionPayload: Response | any = registerInfo;
      dispatch(setCredentials({ ...ActionPayload }));
      toast.success("Successfully registered", { autoClose: 3000 });
      navigate(redirect);
    } catch {
      toast.error("Error occured, please double check infomation", {
        autoClose: 3000,
      });
    }
  };
  return (
    <form onSubmit={submitRegister}>
      <div className="register-container">
        <h1 className="login-header">{t("register_title")}</h1>
        <div className="step-container">
          <p>{t("step_indicator", { currentStep })}</p>
        </div>
        {currentStep === 1 && (
          <>
            <PhoneNumberVerification
              onVerify={handlePhoneVerification}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
            />
          </>
        )}
        {currentStep === 2 && (
          <div className="register-step-two">
            <RegionSelect onSelect={handleRegionSelect} region={regionName} />
          </div>
        )}
        {currentStep === 3 && (
          <div className="register-step-three">
            <DistrictSelect
              regionName={regionName}
              district={districtName}
              onSelect={handleSelectDistrict}
            />
          </div>
        )}
        {currentStep === 4 && (
          <div className="register-step-four">
            <SummaryRegister
              userName={userName}
              userPassword={userPassword}
              setUserName={setUserName}
              setUserPassword={setUserPassword}
            />
          </div>
        )}
        <div className="button-container">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="register-cancel"
              type="button"
            >
              {t("previous_button")}
            </button>
          )}
          {currentStep < 4 && (
            <button onClick={nextStep} className="register-next" type="button">
              {t("next_button")}
            </button>
          )}
          {currentStep == 4 && (
            <button className="register-complete" type="submit">
              {t("complete_button")}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default Register;
