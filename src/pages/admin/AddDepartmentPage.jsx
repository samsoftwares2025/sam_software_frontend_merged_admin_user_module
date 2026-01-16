// src/pages/admin/AddDepartmentPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";
import { createDepartment } from "../../api/admin/departments";
import { useAuth } from "../../context/AuthContext";

/* ================= SUCCESS MODAL ================= */
const SuccessModal = ({ onOk }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="success-icon">
        <i className="fa-solid fa-circle-check"></i>
      </div>
      <h2>Department Added Successfully</h2>
      <p>The department has been added to the system.</p>
      <button className="btn btn-primary" onClick={onOk}>
        OK
      </button>
    </div>
  </div>
);

function AddDepartmentPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection,setOpenSection] = useState("organization");

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a department name.");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      await createDepartment(trimmed);

      // ✅ SHOW SUCCESS MODAL (NO NAVIGATION YET)
      setShowSuccessModal(true);
    } catch (err) {
      console.error("CREATE DEPARTMENT FAILED:", err);

      const status = err?.response?.status;
      const respData = err?.response?.data;

      // 🔐 Session expired / unauthorized
      if (status === 401 || status === 403) {
        setError(
          respData?.detail || "Session expired. Please sign in again."
        );
        logout();
        navigate("/", { replace: true });
        return;
      }

      const message =
        respData?.message ||
        respData?.detail ||
        "Failed to add department. Please try again.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

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
            <h3>Add Department</h3>
            <p className="subtitle">Create a new department.</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
              {error && (
                <div style={{ color: "red", marginBottom: "10px" }}>
                  {error}
                </div>
              )}

              <div className="designation-page-form-row">
                <label>Department Name</label>
                <input
                  className="designation-page-form-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marketing"
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

      {/* ✅ SUCCESS MODAL */}
      {showSuccessModal && (
        <SuccessModal
          onOk={() => navigate("/admin/departments")}
        />
      )}
    </>
  );
}

export default AddDepartmentPage;
