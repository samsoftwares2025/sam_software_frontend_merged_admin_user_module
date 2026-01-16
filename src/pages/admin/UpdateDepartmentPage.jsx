// src/pages/admin/UpdateDepartmentPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";
import {
  getDepartments as apiGetDepartments,
  updateDepartment,
} from "../../api/admin/departments";

/* ================= SUCCESS MODAL ================= */
const SuccessModal = ({ onOk }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="success-icon">
        <i className="fa-solid fa-circle-check"></i>
      </div>
      <h2>Department Updated</h2>
      <p>The department has been updated successfully.</p>
      <button className="btn btn-primary" onClick={onOk}>
        OK
      </button>
    </div>
  </div>
);

function UpdateDepartmentPage() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const deptId = params.get("id");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection,setOpenSection] = useState("organization");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  /* ===============================
     LOAD DEPARTMENT
  ================================ */
  useEffect(() => {
    if (!deptId) {
      setError("No department id provided.");
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
          setError("Department not found.");
        } else {
          setName(found.name || "");
          setOriginalName(found.name || "");
        }
      })
      .catch((err) => {
        console.error("Failed to load department:", err);
        setError("Failed to load department.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [deptId]);

  /* ===============================
     SUBMIT
  ================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmed = (name || "").trim();

    if (!trimmed) {
      setError("Department name is required.");
      return;
    }

    // If nothing changed, skip update
    if (trimmed === (originalName || "").trim()) {
      navigate("/admin/departments", { replace: true });
      return;
    }

    setSaving(true);

    try {
      const resp = await updateDepartment(deptId, trimmed);

      // Backend returned an error (including duplicate check)
      if (resp?.success === false) {
        setError(resp.message || "Failed to update department.");
        setSaving(false);
        return;
      }

      // SUCCESS → show modal
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Update failed:", err);

      const data = err?.response?.data;
      const message =
        data?.message ||
        data?.detail ||
        "Failed to update department.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  /* ===============================
     RENDER
  ================================ */
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
            <h3>Edit Department</h3>
            <p className="subtitle">Update department name.</p>
          </div>

          <div className="card">
            {loading ? (
              <div>Loading department details...</div>
            ) : (
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
                    placeholder="Department name"
                  />
                </div>

                <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                  Original: <strong>{originalName}</strong>
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

        <div
          className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <SuccessModal onOk={() => navigate("/admin/departments")} />
      )}
    </>
  );
}

export default UpdateDepartmentPage;
