import React, { useState } from "react";
import './Register.css';
import PhoneNumberVerification from "./Steps/PhoneVerification";
import RegionSelect from "./Steps/RegionSelect";
import DistrictSelect from "./Steps/DistrictSelect";
import { toast } from "react-toastify";
import SummaryRegister from "./Steps/SummaryRegister";
import { useRegisterUserMutation } from "../../../store/slices/users";
import { useLocation, useNavigate } from "react-router-dom";
import { RegisterInfo } from '../../../store/type';
import { useDispatch } from "react-redux";
import { setCredentials } from "../../../store/slices/authSlice";
const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);  
  const [phoneNumber, setPhoneNumber] = useState('+821082773725')
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [regionName, setRegionName] = useState('')
  const [districtName, setDistrictName] = useState('')
  const [userName, setUserName] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [registerUser, { isLoading }] = useRegisterUserMutation()
  const navigate = useNavigate();
  const dispatch = useDispatch();
    const { search } = useLocation();
   const sp = new URLSearchParams(search);
   const redirect = sp.get('redirect') || '/';
  const handlePhoneVerification = (status: boolean) => {
    setIsPhoneVerified(status);
    if (status) {
      toast.success("Phone number verified! You can proceed to the next step.");
    }
    setCurrentStep(prevStep => prevStep + 1);
  };
  const handleRegionSelect = (status: boolean, region: string) => {
    if (status) {
      toast.success(`Region Selected: ${region} `, {autoClose: 3000})
    }
      setRegionName(region);
     setCurrentStep(prevStep => prevStep + 1);
  }
  const handleSelectDistrict = (district: string) => {
    if (district) 
    {
      setDistrictName(district);
      toast.success(`District Selected', ${district}`, {autoClose: 3000} );
    }
    setCurrentStep(prevStep => prevStep + 1);
  }
  const nextStep = () => {
    console.log(isPhoneVerified)
    if (currentStep === 1 && !isPhoneVerified) {
      
      toast.error('Please verify your phone number before proceeding', {autoClose: 3000});
      return 
    }
    if(currentStep === 2 && regionName === '')
    {
      toast.error('Please select the region first', {autoClose: 3000});
      return
    }
    if (currentStep === 3 && districtName === '')
    {
      toast.error('Please select the district', {autoClose: 3000})
      return
    }
    if (currentStep === 4 && userName === '' && userPassword === '')
    {
      toast.error('Please input username and password', {autoClose: 3000})
      return
    }
      setCurrentStep(prevStep => prevStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(prevStep => prevStep - 1);
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
          district: districtName
        }
      }
    try {

      const registerInfo: RegisterInfo | unknown = await registerUser(registerInput).unwrap();
        const ActionPayload: Response | any = registerInfo;
      dispatch(setCredentials({ ...ActionPayload }));
            toast.success('Successfully registered')
            navigate(redirect)
    }
    catch (error: any) {
            toast.error(error?.error)
    }
  }
  return (
    <form onSubmit={submitRegister}>
    <div className="register-container">
      <h1 className="login-header">Register</h1>
      <div className="step-container">
        <p>Step {currentStep} out of 4</p>
      </div>
      {currentStep === 1 && (
        <>
          <PhoneNumberVerification onVerify={handlePhoneVerification} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} />
        </>
      )}
      {currentStep === 2 && (
        <div className="register-step-two">
          <RegionSelect onSelect={handleRegionSelect } region={regionName} />
        </div>
      )}
      {currentStep === 3 && (
        <div className="register-step-three">
          <DistrictSelect regionName={regionName} district={districtName} onSelect={handleSelectDistrict} />
        </div>
      )}
      {currentStep === 4 && (
        <div className="register-step-four">
          <SummaryRegister userName={userName} userPassword={userPassword} setUserName={setUserName} setUserPassword={setUserPassword} />
        </div>
      )}
      <div className="button-container">
         {currentStep > 1 && <button onClick={prevStep} className="register-cancel" type="button">Previous</button>}            
         {currentStep < 4 &&  <button onClick={nextStep} className="register-next" type="button">Next</button>}
         { currentStep == 4 &&  <button className="register-complete" type="submit">Complete</button> }
      </div>
      </div>
    </form>
  );
};

export default Register;
