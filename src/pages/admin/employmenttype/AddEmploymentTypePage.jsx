// src/pages/admin/AddEmploymentTypePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../../components/common/Sidebar";
import Header from "../../../components/common/Header";
import { toSentenceCase } from "../../../utils/textFormatters";

import LoaderOverlay from "../../../components/common/LoaderOverlay";
import SuccessModal from "../../../components/common/SuccessModal";
import ErrorModal from "../../../components/common/ErrorModal";

import "../../../assets/styles/admin.css";


import {
  createEmployementType as createEmploymentType,
} from "../../../api/admin/employement_type";

function AddEmploymentTypePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  // Error modal
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage("Please enter an employment type name.");
      setShowErrorModal(true);
      return;
    }

    setSaving(true);

    try {
      await createEmploymentType(trimmed);

      // Show success modal
      setShowSuccessModal(true);
    } catch (err) {
      console.error("CREATE EMPLOYMENT TYPE FAILED:", err);

      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to add employment type. Please try again.";

      setErrorMessage(backendMsg);
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* GLOBAL LOADER */}
      {saving && <LoaderOverlay />}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <SuccessModal
          message="Employment Type created successfully."
          onClose={() => navigate("/admin/employment-type")}
        />
      )}

      {/* ERROR MODAL */}
      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
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
            <h3>Add Employment Type</h3>
            <p className="subtitle">Create a new employment type.</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
              <div className="designation-page-form-row">
                <label>Employment Type Name</label>
                <input
                  className="designation-page-form-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setName(toSentenceCase(name))}
                  placeholder="e.g. Full Time"
                  disabled={saving}
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
                  {saving ? "Saving..." : "Add Employment Type"}
                </button>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate("/admin/employment-type")}
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

export default AddEmploymentTypePage;
