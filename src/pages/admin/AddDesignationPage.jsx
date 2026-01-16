// src/pages/admin/AddDesignationPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";

import { createDesignation } from "../../api/admin/designations";
import { getDepartments } from "../../api/admin/departments";

/* ================= SUCCESS MODAL ================= */
const SuccessModal = ({ onOk }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="success-icon">
        <i className="fa-solid fa-circle-check"></i>
      </div>
      <h2>Designation Added Successfully</h2>
      <p>The designation has been added to the system.</p>
      <button className="btn btn-primary" onClick={onOk}>
        OK
      </button>
    </div>
  </div>
);

function AddDesignationPage() {
  const navigate = useNavigate();

  /* ================= LAYOUT ================= */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection,setOpenSection] = useState("organization");

  /* ================= FORM STATE ================= */
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
        console.error("Failed to load departments", err);
        setError("Failed to load departments.");
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
      setError("Please enter a designation name.");
      return;
    }

    if (!departmentId) {
      setError("Please select a department.");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      await createDesignation({
        name: trimmed,
        department_id: departmentId,
      });

      // ✅ SHOW SUCCESS MODAL
      setShowSuccessModal(true);
    } catch (err) {
      console.error("CREATE DESIGNATION FAILED:", err);

      const status = err?.response?.status;
      const respData = err?.response?.data;

      let message =
        respData?.message ||
        respData?.detail ||
        "Failed to add designation. Please try again.";

      if (status === 401 || status === 403) {
        message = "Session expired. Please sign in again.";
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <>
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
            <h3>Add Designation</h3>
            <p className="subtitle">Create a new designation.</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
              {error && (
                <div style={{ color: "red", marginBottom: "10px" }}>
                  {error}
                </div>
              )}

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

              {/* Designation Name */}
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

      {/* ✅ SUCCESS MODAL */}
      {showSuccessModal && (
        <SuccessModal
          onOk={() => navigate("/admin/designations")}
        />
      )}
    </>
  );
}

export default AddDesignationPage;
