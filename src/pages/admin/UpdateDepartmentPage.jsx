// src/pages/admin/UpdateDepartmentPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";

import LoaderOverlay from "../../components/common/LoaderOverlay";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

import {
  getDepartments as apiGetDepartments,
  updateDepartment,
} from "../../api/admin/departments";

function UpdateDepartmentPage() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const deptId = params.get("id");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  // Loading state (fetch + saving)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Global error modal
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form values
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");

  /* ===============================
     LOAD DEPARTMENT
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

    apiGetDepartments()
      .then((resp) => {
        if (!mounted) return;

        let list = [];
        if (resp && Array.isArray(resp.departments)) list = resp.departments;
        else if (Array.isArray(resp)) list = resp;
        else if (Array.isArray(resp.results)) list = resp.results;
        else if (Array.isArray(resp.data)) list = resp.data;

        const found = list.find((d) => String(d.id) === String(deptId));

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

    // Nothing changed → navigate back
    if (trimmed === (originalName || "").trim()) {
      navigate("/admin/departments", { replace: true });
      return;
    }

    setSaving(true);

    try {
      const resp = await updateDepartment(deptId, trimmed);

      // Backend error (duplicate, validation, etc.)
      if (resp?.success === false) {
        setErrorMessage(resp.message || "Failed to update department.");
        setShowErrorModal(true);
        setSaving(false);
        return;
      }

      // SUCCESS – show modal
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Update failed:", err);

      const data = err?.response?.data;
      const message =
        data?.message ||
        data?.detail ||
        "Failed to update department.";

      setErrorMessage(message);
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  /* ===============================
     RENDER
  ================================ */
  return (
    <>
      {/* Loader overlay */}
      {(loading || saving) && <LoaderOverlay />}

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
          <div className="the_line" />

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
                    placeholder="Department name"
                  />
                </div>

                <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                  Original: <strong>{originalName}</strong>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
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

        <div
          className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      </div>
    </>
  );
}

export default UpdateDepartmentPage;
