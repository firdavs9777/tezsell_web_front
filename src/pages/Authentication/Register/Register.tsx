import React, { useState } from "react";
import './Register.css';
import PhoneNumberVerification from "./Steps/PhoneVerification";
import { useGetRegionsListQuery } from "../../../store/slices/productsApiSlice";
import RegionSelect from "./Steps/RegionSelect";
import DistrictSelect from "./Steps/DistrictSelect";
import { toast } from "react-toastify";
const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);  
  const [isPhoneVerified, setIsPhoneVerified] = useState(true);
  const [regionName, setRegionName] = useState('')
const [districtName, setDistrictName] = useState('')


  const handlePhoneVerification = (status: boolean) => {
    setIsPhoneVerified(status);
    if (status) {
      toast.success("Phone number verified! You can proceed to the next step.");
    }
    setCurrentStep(prevStep => prevStep + 1);
  };
  const handleRegionSelect = (status: boolean, region: string) => {
    if (status) {
      toast.success(`Region Selected: ${region} `)
    }
      setRegionName(region);
     setCurrentStep(prevStep => prevStep + 1);
  }
  const handleSelectDistrict = (district: string) => {
    alert(district);
    if (district) 
    {
      setDistrictName(district);
      toast.success(`District Selected', ${district}` );
    }
    setCurrentStep(prevStep => prevStep + 1);
  }
  const nextStep = () => {
    if (currentStep === 1 && !isPhoneVerified) {
    
      alert('Please verify your phone number before proceeding');
      return 
    }
    setCurrentStep(prevStep => prevStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(prevStep => prevStep - 1);
  };

  return (
    <div className="register-container">
      <h1 className="login-header">Register</h1>
      
      <div className="step-container">
        <p>Step {currentStep} out of 4</p>
      </div>

      {currentStep === 1 && (
        <>
          <PhoneNumberVerification onVerify={handlePhoneVerification} />
        </>
      )}
      {currentStep === 2 && (
        <div className="register-step-two">
          <RegionSelect onSelect={handleRegionSelect } region={regionName} />
        </div>
      )}
      {regionName}
      {currentStep === 3 && (
        <div className="register-step-three">
          <DistrictSelect regionName={regionName} district={districtName} onSelect={handleSelectDistrict} />
        </div>
      )}
      {currentStep === 4 && (
        <div className="register-step-four">
          <label htmlFor="username">Username</label>
          <input type="text" className="register-username" />
          <label htmlFor="password">Password</label>
          <input type="password" className="register-password" />
          <input type="text" placeholder="Verification Code" />
        </div>
      )}
      <div className="button-container">
         {currentStep > 1 && <button onClick={prevStep}>Previous</button>}            
         {currentStep < 4 &&  <button onClick={nextStep}>Next</button>}
         { currentStep == 4 &&  <button className="Next">Complete</button> }
        </div>
    </div>
  );
};

export default Register;
