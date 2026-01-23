import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";
import "../../assets/styles/admin.css";

import LoaderOverlay from "../../components/common/LoaderOverlay";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

import { resetPassword } from "../../api/user/myprofile";

const ResetPassword = () => {
  const navigate = useNavigate();

  /* ===== SIDEBAR ===== */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);

  /* ===== FORM STATE ===== */
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* ===== UI STATE ===== */
  const [loading, setLoading] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* ===== SUBMIT ===== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      setErrorMessage("Current password is required.");
      setShowErrorModal(true);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Password and confirm password do not match.");
      setShowErrorModal(true);
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword({
        currentPassword,
        password,
        confirmPassword,
      });

      if (res?.success) {
        setCurrentPassword("");
        setPassword("");
        setConfirmPassword("");
        setShowSuccessModal(true);
      } else {
        setErrorMessage(res?.message || "Failed to reset password.");
        setShowErrorModal(true);
      }
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message || "Something went wrong."
      );
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ===== LOADER ===== */}
      {loading && <LoaderOverlay />}

      {/* ===== ERROR MODAL ===== */}
      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}

      {/* ===== SUCCESS MODAL ===== */}
      {showSuccessModal && (
        <SuccessModal
          message="Your password has been updated successfully."
          onClose={() => navigate("/profile")}
        />
      )}

      <div className="container">
        {/* ===== SIDEBAR (FIXED) ===== */}
        <Sidebar
          isMobileOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          openSection={openSection}
          setOpenSection={setOpenSection}
        />

        {/* ===== MAIN ===== */}
        <main className="main add-ticket-page">
          {/* ===== HEADER (FIXED) ===== */}
          <Header
            onMenuClick={() => setIsSidebarOpen((p) => !p)}
          />

          {/* ===== PAGE HEADER ===== */}
          <div className="page-header">
            <div className="page-title">
              <h3>Reset Password</h3>
              <p>Update your account password</p>
            </div>
          </div>

          {/* ===== FORM ===== */}
          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* CURRENT PASSWORD */}
                <div className="form-group full-width">
                  <label className="form-label required">
                    Current Password
                  </label>
                  <div className="password-wrapper">
                    <input
                      className="form-input"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) =>
                        setCurrentPassword(e.target.value)
                      }
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowCurrentPassword((p) => !p)
                      }
                    >
                      {showCurrentPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* NEW PASSWORD */}
                <div className="form-group full-width">
                  <label className="form-label required">
                    New Password
                  </label>
                  <div className="password-wrapper">
                    <input
                      className="form-input"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((p) => !p)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="form-group full-width">
                  <label className="form-label required">
                    Confirm Password
                  </label>
                  <div className="password-wrapper">
                    <input
                      className="form-input"
                      type={
                        showConfirmPassword ? "text" : "password"
                      }
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword((p) => !p)
                      }
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              {/* ===== ACTIONS ===== */}
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
                  onClick={() => navigate("/profile/reset-password")}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>

        {/* ===== OVERLAY ===== */}
        {isSidebarOpen && (
          <div
            className="sidebar-overlay show"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default ResetPassword;
