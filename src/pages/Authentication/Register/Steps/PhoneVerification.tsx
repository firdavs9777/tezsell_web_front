import React, { useState } from "react";
import './PhoneNumberVerification.css';
import { useSendSmsUserMutation, useVerifyCodeUserMutation } from "../../../../store/slices/users";
import { toast } from "react-toastify";


interface PhoneNumberVerificationProps {
  phoneNumber: string;
  setPhoneNumber: (name: string) => void;
  onVerify: (status: boolean) => void; // Callback prop
}
interface ResponseSendCode  {
      result: boolean;
      message: string;
      sid: string
};
interface ResponseVerification {
  result: boolean; 
  verification_code: number;
  message: string;
}



const PhoneNumberVerification: React.FC<PhoneNumberVerificationProps> = ({onVerify, phoneNumber,setPhoneNumber}) => {

  const [verificationCode, setVerificationCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendCodeToUser, { isLoading }] = useSendSmsUserMutation()
  const [verifyUser, { isLoading: isLoading_two }] = useVerifyCodeUserMutation()
  

  // Handle phone number change
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.startsWith("+998") && value.length <= 13) {
      setPhoneNumber(value);
    } else if (value === "") {
      setPhoneNumber(""); 
    } else {
      setPhoneNumber("+821082773725");
    }
  };

  // Handle verification code change
  const handleVerificationCodeChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
  };


  const sendOTP = async (): Promise<void> => {
  setOtpSent(true);
  if (phoneNumber.length === 13) {
    try {
      const response: ResponseSendCode | unknown = await sendCodeToUser({ phone_number: phoneNumber }).unwrap();    
      const data = response as ResponseSendCode;
      if (data) {
        if (data.result) {
          setOtpSent(true);
          alert(data.message + " to " + phoneNumber);
        } else {
          alert("Failed to send OTP. Server returned false.");
        }
      } 
    } catch (error) {
      console.error("Error during sendOTP:", error);
      alert("An error occurred while sending OTP.");
    }
  } else {
    alert("Please enter a valid phone number.");
  }
};

  // Simulate verifying OTP
  const verifyOTP = async () => {
  try {
    const response: ResponseVerification | unknown = await verifyUser( {phone_number: phoneNumber,otp: verificationCode} ).unwrap();

    // Ensure response.data exists before processing
    const data = response as ResponseVerification;
    if (data && data.result) {
      onVerify(true);
      toast.success('Success')
    }
  } catch (error ) {
    console.error("Error verifying code:", error);
    toast.error("An error occurred. Please try again later.");
  }
  };

  return (
    <div className="register-step-one">
      <label htmlFor="phoneNumber">Phone Number</label>
      <input
        type="tel"
        id="phoneNumber"
        className="register-mobile-number"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        placeholder="941234567"
      />

      {!otpSent ? (
        <button onClick={sendOTP} className="register-button">Send OTP</button>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={handleVerificationCodeChange}
            />
          <button onClick={sendOTP} className="register-button" type="button">Send again</button>            
          <button onClick={verifyOTP} className="register-button" type="button">Verify</button>
        </>
      )}
    </div>
  );
};

export default PhoneNumberVerification;
