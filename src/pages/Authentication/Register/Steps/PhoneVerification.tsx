import React, { useState } from "react";
import './PhoneNumberVerification.css'
const PhoneNumberVerification = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 13 && value.startsWith("+998")) {
      setPhoneNumber(value);
    } else if (value === "") {
      setPhoneNumber(""); 
    } else {
      setPhoneNumber("+998");
    }
};

  // Function to handle verification code change
  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  
    setVerificationCode(e.target.value);
 
  };

  // Send OTP API call
  const sendOTP = async () => {
    // if (!phoneNumber) {
    //   setError("Please enter a valid phone number.");
    //   return;
    // }

    // setIsSendingOTP(true);
    // setError("");

    // try {
    //   // Assuming you have an API for sending OTP
    //   const response = await fetch("/api/send-otp", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ phoneNumber }),
    //   });
    //   const data = await response.json();

    //   if (data.success) {
    //     setOtpSent(true);
    //     setIsSendingOTP(false);
    //   } else {
    //     setError("Failed to send OTP. Please try again.");
    //     setIsSendingOTP(false);
    //   }
    // } catch (error) {
    //   setError("Error sending OTP. Please try again later.");
    //   setIsSendingOTP(false);
    // }
  };

  // Verify OTP API call
  const verifyOTP = async () => {
    alert('Done')
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
        placeholder="Enter your phone number"
      />

      {!otpSent ? (
        <button onClick={sendOTP} disabled={isSendingOTP}>
          {isSendingOTP ? "Sending OTP..." : "Send OTP"}
        </button>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={handleVerificationCodeChange}
          />
          <button onClick={verifyOTP} disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Verify"}
          </button>
        </>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default PhoneNumberVerification;
