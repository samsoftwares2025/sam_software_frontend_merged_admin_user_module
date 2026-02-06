// src/pages/admin/UpdateDepartmentPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../../components/common/Sidebar";
import Header from "../../../components/common/Header";
import "../../../assets/styles/admin.css";

import { toSentenceCase } from "../../../utils/textFormatters";

import LoaderOverlay from "../../../components/common/LoaderOverlay";
import SuccessModal from "../../../components/common/SuccessModal";
import ErrorModal from "../../../components/common/ErrorModal";

// Updated imports
import {
  getDepartmentById,
  updateDepartment,
} from "../../../api/admin/departments";

function UpdateDepartmentPage() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const deptId = params.get("id");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");

  /* ===============================
     LOAD DEPARTMENT (Optimized)
  ================================ */
  useEffect(() => {
    if (!deptId) {
      setErrorMessage("No department id provided.");
      setShowErrorModal(true);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    // Using the specific ID fetcher instead of listDepartments
    getDepartmentById(deptId)
      .then((resp) => {
        if (!mounted) return;

        // Backend usually returns the object inside 'department', 'data', or directly
        const found = resp?.department || resp?.data || resp;

        if (!found) {
          setErrorMessage("Department not found.");
          setShowErrorModal(true);
        } else {
          setName(found.name || "");
          setOriginalName(found.name || "");
        }
      })
      .catch((err) => {
        console.error("Failed to load department:", err);
        setErrorMessage("Failed to load department details.");
        setShowErrorModal(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [deptId]);

  /* ===============================
     SUBMIT HANDLER
  ================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = (name || "").trim();

    if (!trimmed) {
      setErrorMessage("Department name is required.");
      setShowErrorModal(true);
      return;
    }

    if (trimmed === (originalName || "").trim()) {
      navigate("/admin/departments", { replace: true });
      return;
    }

    setSaving(true);
    try {
      const resp = await updateDepartment(deptId, trimmed);

      if (resp?.success === false) {
        setErrorMessage(resp.message || "Failed to update department.");
        setShowErrorModal(true);
        setSaving(false);
        return;
      }
      setShowSuccessModal(true);
    } catch (err) {
      const data = err?.response?.data;
      setErrorMessage(data?.message || data?.detail || "Failed to update department.");
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {(loading || saving) && <LoaderOverlay />}

      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          message="Department updated successfully."
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
            <h3>Edit Department</h3>
            <p className="subtitle">Update department name.</p>
          </div>

          <div className="card">
            {loading ? (
              <div style={{ padding: "1.25rem" }}>
                Loading department details...
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
                <div className="designation-page-form-row">
                  <label>Department Name</label>
                  <input
                    className="designation-page-form-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setName(toSentenceCase(name))}
                    placeholder="Department name"
                  />
                </div>

               

                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => navigate("/admin/departments")}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default UpdateDepartmentPage;