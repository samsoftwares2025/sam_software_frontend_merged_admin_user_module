// src/pages/admin/AddDepartmentPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";

import LoaderOverlay from "../../components/common/LoaderOverlay";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";
import { toSentenceCase } from "../../utils/textFormatters";

import { createDepartment } from "../../api/admin/departments";
import { useAuth } from "../../context/AuthContext";

function AddDepartmentPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");
 
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  // Global error modal
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  /* ===========================
     SUBMIT
  ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage("Please enter a department name.");
      setShowErrorModal(true);
      return;
    }

    setSaving(true);

    try {
      await createDepartment(trimmed);

      setShowSuccessModal(true);
    } catch (err) {
      console.error("CREATE DEPARTMENT FAILED:", err);

      const status = err?.response?.status;
      const respData = err?.response?.data;

      // Auth issue → logout
      if (status === 401 || status === 403) {
        setErrorMessage(respData?.detail || "Session expired. Please sign in again.");
        setShowErrorModal(true);

        logout();
        navigate("/", { replace: true });
        return;
      }

      const message =
        respData?.message ||
        respData?.detail ||
        "Failed to add department. Please try again.";

      setErrorMessage(message);
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Saving overlay */}
      {saving && <LoaderOverlay />}

      {/* Error Modal */}
      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          message="Department added successfully."
          onClose={() => navigate("/admin/departments")}
        />
      )}

      <div className="container">
        <Sidebar
          isMobileOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          openSection={openSection}
          setOpenSection={setOpenSection}
        />

        <main className="main">
          <Header onMenuClick={() => setIsSidebarOpen((p) => !p)} />

          <div className="page-title">
            <h3>Add Department</h3>
            <p className="subtitle">Create a new department.</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
              <div className="designation-page-form-row">
                <label>Department Name</label>
                <input
                  className="designation-page-form-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marketing"
                  disabled={saving}
                  onBlur={() => setName(toSentenceCase(name))}
                />
              </div>

              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  gap: "0.75rem",
                }}
              >
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Add Department"}
                </button>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate("/admin/departments")}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>

        <div
          className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        />
      </div>
    </>
  );
}

export default AddDepartmentPage;
