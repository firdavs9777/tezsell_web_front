import React, { useEffect, useState } from "react";
import "./Login.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useLoginUserMutation } from "../../../store/slices/users";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../../store/slices/authSlice";
import { toast } from "react-toastify";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("+82");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { userInfo } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const dispatch = useDispatch();

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, redirect, navigate]);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 13 && value.startsWith("+82")) {
      setPhoneNumber(value);
    } else if (value === "") {
      setPhoneNumber("");
    } else {
      setPhoneNumber("+82");
    }
  };
  const clickHandler = () => {
    setShowPass((prev) => !prev);
  };
  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userInfo = await loginUser({
        phone_number: phoneNumber,
        password,
      }).unwrap();
      const ActionPayload: Response | any = userInfo;
      dispatch(setCredentials({ ...ActionPayload }));
      toast.success("Successfully logged");
      navigate(redirect);
    } catch (error: any) {
      toast.error(error?.error);
    }
  };
  if (isLoading) {
    return <p>Loading....</p>;
  }
  return (
    <form className="login-container" onSubmit={submitHandler}>
      <h1 className="login-header">Login</h1>
      <p>
        Tezsellga hush kelibsiz, <br />
        telefon orqali mavjud hisobingizga kiring
      </p>
      <div className="form-group">
        <label htmlFor="phoneNumber">Phone Number</label>
        <input
          className="mobile-number"
          type="tel"
          id="phoneNumber"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder="Enter your phone number: 941234567"
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>

        <div className="password-container">
          <input
            type={showPass ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="password"
          />
          {showPass ? (
            <FaEyeSlash onClick={clickHandler} className="eye-icon" />
          ) : (
            <FaEye onClick={clickHandler} className="eye-icon" />
          )}
        </div>
      </div>
      <button className="login-button" type="submit">
        Login
      </button>

      <div className="additional-links">
        <p>
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
        <p>
          <Link to="/register">No registered yet, register here</Link>
        </p>
      </div>
    </form>
  );
};

export default Login;
