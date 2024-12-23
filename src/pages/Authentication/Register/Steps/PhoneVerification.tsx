import React, { useState } from "react";
import './PhoneNumberVerification.css';
import { useSendSmsUserMutation, useVerifyCodeUserMutation } from "../../../../store/slices/users";


interface PhoneNumberVerificationProps {
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


interface ErrorCode {
  error: string
}

const PhoneNumberVerification: React.FC<PhoneNumberVerificationProps> = ({onVerify}) => {
  const [phoneNumber, setPhoneNumber] = useState("+821082773725");
  const [verificationCode, setVerificationCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  // const [sendCodeToUser, { isLoading }] = useSendSmsUserMutation()
  // const [verifyUser, { isLoading: isLoading_two }] = useVerifyCodeUserMutation()
  

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
  // if (phoneNumber.length === 13) {
  //   try {
  //     const response = await sendCodeToUser({ phone_number: phoneNumber });    
  //     const data = response.data as ResponseSendCode;
  //     if (data) {
  //       if (data.result) {
  //         setOtpSent(true);
  //         alert(data.message + " to " + phoneNumber);
  //       } else {
  //         alert("Failed to send OTP. Server returned false.");
  //       }
  //     } else {
  //       const error = response.data as ErrorCode;
  //       alert(error.error);
  //     }
  //   } catch (error) {
  //     console.error("Error during sendOTP:", error);
  //     alert("An error occurred while sending OTP.");
  //   }
  // } else {
  //   alert("Please enter a valid phone number.");
  // }
};

  // Simulate verifying OTP
  const verifyOTP = async () => {
    onVerify(true);
  // try {
  //   const response = await verifyUser(verificationCode);
  //   console.log(response);

  //   // Ensure response.data exists before processing
  //   // const data = response.data as ResponseVerification;
  //   // if (data?.result) {
  //   //   alert(data.message);
  //   //   onVerify(true);  // Call the onVerify callback with 'true'
  //   // } else {
  //   //   alert("Invalid verification code.");
  //   //   onVerify(false);  // Call the onVerify callback with 'false'
  //   // }
  // } catch (error ) {
  //   console.error("Error verifying code:", error);
  //   alert("An error occurred. Please try again later.");
  // }
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
          <button onClick={sendOTP} className="register-button">Send again</button>            
          <button onClick={verifyOTP} className="register-button">Verify</button>
        </>
      )}
    </div>
  );
};

export default PhoneNumberVerification;
