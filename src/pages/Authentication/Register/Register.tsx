import React, { useState } from "react";
import './Register.css';
import PhoneNumberVerification from "./Steps/PhoneVerification";
import { useGetRegionsListQuery } from "../../../store/slices/productsApiSlice";

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { data, isLoading, error} = useGetRegionsListQuery({});
  console.log(data)
  if (isLoading) {
    return <h1>Loading ...</h1>;
  }
  if (error) {
    return <p>Error</p>
  }
  const nextStep = () => {
    setCurrentStep(prevStep => prevStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(prevStep => prevStep - 1);
  };

  return (
    <div className="register-container">
      <h1 className="login-header">Register</h1>
      
      <div className="step-container">
        {currentStep > 1 && <button onClick={prevStep}>Previous</button>}
        <p>Step {currentStep} out of 4</p>
        {currentStep < 4 && <button onClick={nextStep}>Next</button>}
      </div>

      {currentStep === 1 && (
        <>
          <PhoneNumberVerification />
          <button onClick={prevStep}>Previous</button>
          <button onClick={nextStep}>Next</button>
        </>
      )}

      {currentStep === 2 && (
        <div className="register-step-two">
          <label htmlFor="region">Select the region</label>
          <button className="Next" onClick={prevStep}>Previous</button>
          <button className="Next" onClick={nextStep}>Next</button>
        </div>
      )}

      {currentStep === 3 && (
        <div className="register-step-three">
          <label htmlFor="district">Select the district</label>
          <button className="Next" onClick={prevStep}>Previous</button>
          <button className="Next" onClick={nextStep}>Next</button>
        </div>
      )}

      {currentStep === 4 && (
        <div className="register-step-four">
          <label htmlFor="username">Username</label>
          <input type="text" className="register-username" />
          <label htmlFor="password">Password</label>
          <input type="password" className="register-password" />
          <input type="text" placeholder="Verification Code" />
          <button className="Next" onClick={prevStep}>Previous</button>
          <button className="Next">Complete</button>
        </div>
      )}
    </div>
  );
};

export default Register;
