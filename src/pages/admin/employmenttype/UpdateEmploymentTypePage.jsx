// src/pages/admin/UpdateEmployementTypePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../../components/common/Sidebar";
import Header from "../../../components/common/Header";
import LoaderOverlay from "../../../components/common/LoaderOverlay";
import SuccessModal from "../../../components/common/SuccessModal";
import ErrorModal from "../../../components/common/ErrorModal";
import { toSentenceCase } from "../../../utils/textFormatters";

import "../../../assets/styles/admin.css";


// Import the new specific helper
import {
  getEmploymentTypeById, 
  updateEmployementType,
} from "../../../api/admin/employement_type";

function UpdateEmployementTypePage() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const empTypeId = params.get("id");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  /* ================= LOAD EMPLOYMENT TYPE (Using getById) ================= */
  useEffect(() => {
    if (!empTypeId) {
      setErrorMessage("No Employment Type ID provided.");
      setShowErrorModal(true);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    getEmploymentTypeById(empTypeId)
      .then((resp) => {
        if (!mounted) return;

        // Backend typically returns data inside an object key or directly
        const found = resp?.employment_type || resp?.data || resp;

        if (!found) {
          setErrorMessage("Employment Type not found.");
          setShowErrorModal(true);
        } else {
          setName(found.name || "");
          setOriginalName(found.name || "");
        }
      })
      .catch((err) => {
        console.error("LOAD ERROR:", err);
        setErrorMessage("Failed to load Employment Type details.");
        setShowErrorModal(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [empTypeId]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage("Employment Type name is required.");
      setShowErrorModal(true);
      return;
    }

    // If no changes were made, just go back
    if (trimmed === originalName.trim()) {
      navigate("/admin/employment-type");
      return;
    }

    setSaving(true);

    try {
      const resp = await updateEmployementType(empTypeId, trimmed);
      
      if (resp?.success === false) {
        setErrorMessage(resp.message || "Failed to update Employment Type.");
        setShowErrorModal(true);
        return;
      }

      setShowSuccessModal(true);
    } catch (err) {
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to update Employment Type.";

      setErrorMessage(backendMsg);
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {(loading || saving) && <LoaderOverlay />}

      {showSuccessModal && (
        <SuccessModal
          message="Employment Type updated successfully."
          onClose={() => navigate("/admin/employment-type")}
        />
      )}

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
            <h3>Update Employment Type</h3>
            <p className="subtitle">Update employment type details.</p>
          </div>

          <div className="card">
            {loading ? (
              <div style={{ padding: "1.25rem" }}>
                Loading employment type details...
              </div>
            ) : (
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
                    autoFocus
                    disabled={saving}
                  />
                </div>

                <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
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
            )}
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

export default UpdateEmployementTypePage;