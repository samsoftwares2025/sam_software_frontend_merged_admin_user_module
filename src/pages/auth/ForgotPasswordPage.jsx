import React, { useState } from "react";
import "../../assets/styles/CompanyRegistrationPage.css";
import {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
} from "../../api/forgotPassword";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState("email"); // email | otp | reset | success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* ================= SEND OTP ================= */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your registered email address.");
      return;
    }

    try {
      setLoading(true);
      await sendForgotPasswordOtp(email);
      setStep("otp");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("Please enter the OTP sent to your email.");
      return;
    }

    try {
      setLoading(true);
      await verifyForgotPasswordOtp(email, otp);
      setStep("reset");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESET PASSWORD ================= */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email, newPassword, confirmPassword);

      setSuccessMessage(
        "Password reset successful. You can now login with your new credentials."
      );
      setStep("success");

      // Auto redirect to login after 2.5 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 2500);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="login-container">
        {/* LEFT PANEL */}
        <div className="login-left">
          <h1>
            Forgot your
            <br />
            password?
          </h1>
          <p>
            No worries. Enter your registered work email, verify with OTP, and
            we&apos;ll help you securely reset your password.
          </p>

          <div className="features">
            {[
              "Secure verification using OTP",
              "No password sharing with anyone",
              "Works for admin & employees",
            ].map((text, index) => (
              <div className="feature-item" key={index}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="login-right">
          <div className="login-header">
            <h2>Forgot Password</h2>
            <p>Enter your linked work email to receive an OTP</p>
          </div>

          {step !== "success" && (
            <form
              onSubmit={
                step === "email"
                  ? handleSendOtp
                  : step === "otp"
                  ? handleVerifyOtp
                  : handleResetPassword
              }
            >
              <div className="section-title">
                {step === "email"
                  ? "Verify Email"
                  : step === "otp"
                  ? "Enter OTP"
                  : "Reset Password"}
              </div>

              {/* EMAIL */}
              <div className="input-group">
                <label>Registered Work Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={step !== "email"}
                    required
                  />
                </div>

                {step === "otp" && (
                  <p className="hint-text">
                    OTP has been sent to <strong>{email}</strong>.
                  </p>
                )}
              </div>

              {/* OTP */}
              {step === "otp" && (
                <div className="input-group">
                  <label>OTP</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>

                  <p className="hint-text">
                    Didn&apos;t receive OTP?{" "}
                    <button
                      type="button"
                      className="link-button"
                      onClick={handleSendOtp}
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  </p>
                </div>
              )}

              {/* RESET PASSWORD */}
              {step === "reset" && (
                <>
                  <div className="input-group">
                    <label>New Password</label>
                    <div
                      className="input-wrapper"
                      style={{ position: "relative" }}
                    >
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: "12px",
                          color: "var(--accent)",
                        }}
                      >
                        {showNewPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Confirm Password</label>
                    <div
                      className="input-wrapper"
                      style={{ position: "relative" }}
                    >
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: "12px",
                          color: "var(--accent)",
                        }}
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {error && <p className="error-text">{error}</p>}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading
                  ? "Please wait..."
                  : step === "email"
                  ? "Send OTP"
                  : step === "otp"
                  ? "Verify OTP"
                  : "Reset Password"}
              </button>

              <div className="signup-link">
                Remember your password? <a href="/">Back to login</a>
              </div>
            </form>
          )}

          {/* SUCCESS */}
          {step === "success" && (
            <div>
              <div className="section-title">Success</div>
              <p className="success-text">{successMessage}</p>
              <p className="info-text">Redirecting you to login page…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
