import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { loginGoogle, sendOtp, verifyOtp } from "./api";
import { useNavigate } from "react-router-dom";
import "./StudentSignup.css"; // Reuse the css for consistency

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await loginGoogle(credentialResponse.credential);
      console.log("Google Auth Success", res);
      alert("Login logic successful via Google.");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to authenticate with Google");
    }
  };

  const handleGoogleError = () => {
    console.error("Google Login Failed");
    alert("Google Login Failed");
  };

  const handleSendOtp = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }
    try {
      await sendOtp(email);
      setOtpSent(true);
      alert("OTP Sent! Check your email (or console in dev mode).");
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      alert("Please enter the OTP");
      return;
    }
    try {
      const res = await verifyOtp(email, otp);
      console.log("OTP Login Success", res);
      alert("Login successful via OTP.");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Invalid OTP");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>
        <p>Sign in to your AlmaMatters account</p>

        <div style={{ margin: "20px 0" }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </div>

        <div style={{ margin: "20px 0" }}>
          <strong>OR</strong>
        </div>

        <div className="otp-section">
          <input
            type="email"
            placeholder="Enter your Gmail address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={otpSent}
          />

          {!otpSent ? (
            <button onClick={handleSendOtp}>Send OTP</button>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button onClick={handleVerifyOtp}>Sign In</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}