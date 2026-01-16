import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const ResetPassword = ({ sidebarOpen, onToggleSidebar }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
    <>
      {/* ================= SUCCESS MODAL ================= */}
      {showSuccessModal && (
        <SuccessModal
          title="Password Reset Successful"
          message="Your password has been updated successfully."
          onClose={() => navigate("/profile")}
        />
      )}

      {/* ================= SIDEBAR OVERLAY (SAME AS MY HISTORY) ================= */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay show"
          onClick={onToggleSidebar}
          aria-hidden="true"
        />
      )}

      <main className="main add-ticket-page" role="main">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={onToggleSidebar}
        />

        <section className="card">
          <h3 className="info-title">Reset Password</h3>

          {message && <p className="small error-text">{message}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
              />
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
    </>
  );
};

export default ResetPassword;
