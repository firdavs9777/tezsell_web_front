import React from "react";
import './Register.css'
const Register = () => {
  return (
    <div className="register-container">
      <h1 className="login-header">Register</h1>
      <div className="step-container">
        <button>Previous</button>
      <p>Step 1 out of 4</p>
      <button>Next</button>
      </div>
      <div className="register-step-one">
        <label htmlFor="phoneNumber">Phone Number</label>
        <input type="tel" id="" className="register-mobile-number" />
        <button>Verify</button>
        <input type="text" placeholder="Verification Code" />
        <button className="Next">Next</button>
      </div>
        <div className="register-step-two">
        <label htmlFor="phoneNumber">Select the region</label>
        <button className="Next">Next</button>
      </div>
      <div className="register-step-three">
        <label htmlFor="phoneNumber">Select the district</label>
        <button className="Next">Next</button>
      </div>
    </div>
  )
}
export default Register;