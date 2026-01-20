// src/pages/admin/AddDesignationPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";

import LoaderOverlay from "../../components/common/LoaderOverlay";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

import "../../assets/styles/admin.css";

import { createDesignation } from "../../api/admin/designations";
import { getDepartments } from "../../api/admin/departments";

function AddDesignationPage() {
  const navigate = useNavigate();

  /* ================= LAYOUT ================= */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  /* ================= FORM STATE ================= */
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  const [saving, setSaving] = useState(false);

  /* ================= MODALS ================= */
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ================= FETCH DEPARTMENTS ================= */
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await getDepartments();
        const deptArray = Array.isArray(res)
          ? res
          : res?.departments || [];

        setDepartments(deptArray);
      } catch (err) {
        const backendError =
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          "Failed to load departments.";

        setErrorMessage(backendError);
        setShowErrorModal(true);
      } finally {
        setLoadingDepts(false);
      }
    };

    fetchDepartments();
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = name.trim();

    if (!trimmed) {
      setErrorMessage("Please enter a designation name.");
      setShowErrorModal(true);
      return;
    }

    if (!departmentId) {
      setErrorMessage("Please select a department.");
      setShowErrorModal(true);
      return;
    }

    setSaving(true);

    try {
      await createDesignation({
        name: trimmed,
        department_id: departmentId,
      });

      setShowSuccessModal(true);
    } catch (err) {
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to add designation. Please try again.";

      setErrorMessage(backendMsg);
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <>
      {saving && <LoaderOverlay />}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <SuccessModal
          message="Designation added successfully."
          onClose={() => navigate("/admin/designations")}
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
            <h3>Add Designation</h3>
            <p className="subtitle">Create a new designation.</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
              {/* Department */}
              <div className="designation-page-form-row">
                <label>Department</label>
                <select
                  className="designation-page-form-input"
                  value={departmentId ?? ""}
                  onChange={(e) =>
                    setDepartmentId(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  disabled={loadingDepts || saving}
                >
                  <option value="">
                    {loadingDepts
                      ? "Loading departments..."
                      : "Select Department"}
                  </option>

                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div className="designation-page-form-row">
                <label>Designation Name</label>
                <input
                  className="designation-page-form-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Manager"
                  disabled={saving}
                />
              </div>

              {/* Action Buttons */}
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
                  {saving ? "Saving..." : "Add Designation"}
                </button>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate("/admin/designations")}
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

export default AddDesignationPage;
