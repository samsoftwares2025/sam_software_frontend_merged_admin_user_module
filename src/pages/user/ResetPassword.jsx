import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/user.css";
import { resetPassword } from "../../api/user/myprofile";

/* ================= SUCCESS MODAL ================= */
const SuccessModal = ({ title, message, onClose }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="success-icon">
        <i className="fa-solid fa-circle-check" />
      </div>

      <h2>{title}</h2>
      <p>{message}</p>

      <button className="btn btn-primary" onClick={onClose}>
        Go to Profile
      </button>
    </div>
  </div>
);

const ResetPassword = () => {
  /* ===== SIDEBAR STATE ===== */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    if (!currentPassword) {
      setMessage("Current password is required");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Password and confirm password do not match");
      return;
    }

    setLoading(true);

    resetPassword({
      currentPassword,
      password,
      confirmPassword,
    })
      .then((res) => {
        if (res.success) {
          setCurrentPassword("");
          setPassword("");
          setConfirmPassword("");
          setShowSuccessModal(true);
        } else {
          setMessage(res.message || "Failed to reset password");
        }
      })
      .catch((err) => {
        const backendMessage =
          err?.response?.data?.message || "Something went wrong";
        setMessage(backendMessage);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="container">
      {/* ===== SIDEBAR ===== */}
      <Sidebar
        sidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(false)}
      />

      {/* ===== MAIN ===== */}
      <main className="main add-ticket-page" role="main">
        <Header
          sidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((p) => !p)}
        />

        <section className="card">
          <h3 className="info-title">Reset Password</h3>

          {message && <p className="small error-text">{message}</p>}

          <form onSubmit={handleSubmit}>
           <div className="form-group" style={{ position: "relative" }}>
  <label>Current Password</label>
   <div className="password-wrapper">
  <input
    type={showCurrentPassword ? "text" : "password"}
    value={currentPassword}
    onChange={(e) => setCurrentPassword(e.target.value)}
    required
    style={{ paddingRight: "60px" }}
  />
  <button
    type="button"
    onClick={() => setShowCurrentPassword((prev) => !prev)}
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
    {showCurrentPassword ? "Hide" : "Show"}
  </button>
</div>
</div>

<div className="form-group" style={{ position: "relative" }}>
  <label>New Password</label>
   <div className="password-wrapper">
  <input
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    style={{ paddingRight: "60px" }}
  />
  <button
    type="button"
    onClick={() => setShowPassword((prev) => !prev)}
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
    {showPassword ? "Hide" : "Show"}
  </button>
</div>
</div>

<div className="form-group" style={{ position: "relative" }}>
  <label>Confirm Password</label>
   <div className="password-wrapper">
  <input
    type={showConfirmPassword ? "text" : "password"}
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
    style={{ paddingRight: "60px" }}
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

<div className="form-actions">
  <button
    type="submit"
    className="btn btn-primary"
    disabled={loading}
  >
    {loading ? "Updating..." : "Reset Password"}
  </button>

  <button
    type="button"
    className="btn btn-secondary"
    onClick={() => navigate("/profile")}
    disabled={loading}
  >
    Cancel
  </button>
</div>


          </form>
        </section>
      </main>

      {/* ===== OVERLAY ===== */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay show"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ===== SUCCESS MODAL ===== */}
      {showSuccessModal && (
        <SuccessModal
          title="Password Reset Successful"
          message="Your password has been updated successfully."
          onClose={() => navigate("/profile")}
        />
      )}
    </div>
  );
};

export default ResetPassword;
