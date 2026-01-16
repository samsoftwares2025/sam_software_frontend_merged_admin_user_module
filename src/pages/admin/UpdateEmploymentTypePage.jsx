import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";

import {
  getEmployementTypes as apiGetEmployementTypes,
  updateEmployementType,
} from "../../api/admin/employement_type";

function UpdateEmployementTypePage() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const empTypeId = params.get("id");

  // ===============================
  // Layout
  // ===============================
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection,setOpenSection] = useState("organization");

  // ===============================
  // Form State
  // ===============================
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // ===============================
  // Load Employment Type
  // ===============================
  useEffect(() => {
    if (!empTypeId) {
      setError("No Employment Type id provided.");
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    apiGetEmployementTypes()
      .then((resp) => {
        if (!mounted) return;

        let list = [];
        if (Array.isArray(resp)) list = resp;
        else if (Array.isArray(resp.employment_types)) list = resp.employment_types;
        else if (Array.isArray(resp.results)) list = resp.results;
        else if (Array.isArray(resp.data)) list = resp.data;

        const found = list.find(
          (item) => String(item.id) === String(empTypeId)
        );

        if (!found) {
          setError("Employment Type not found.");
        } else {
          setName(found.name || "");
          setOriginalName(found.name || "");
        }
      })
      .catch((err) => {
        console.error("Failed to load Employment Type:", err);
        setError("Failed to load Employment Type details.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [empTypeId]);

  // ===============================
  // Submit
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();

    if (!trimmed) {
      setError("Employment Type name is required.");
      return;
    }

    // Nothing changed → go back
    if (trimmed === originalName.trim()) {
      navigate("/admin/employment-type", { replace: true });
      return;
    }

    setSaving(true);
    try {
      await updateEmployementType(empTypeId, trimmed);
      navigate("/admin/employment-type", { replace: true });
    } catch (err) {
      console.error("Update failed:", err);

      const respData = err?.response?.data;
      const message =
        respData?.message ||
        respData?.detail ||
        "Failed to update Employment Type.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // ===============================
  // Render
  // ===============================
  return (
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
              {error && (
                <div style={{ color: "red", marginBottom: 10 }}>
                  {error}
                </div>
              )}

              {/* Employment Type Name */}
              <div className="designation-page-form-row">
                <label>Employment Type Name</label>
                <input
                  className="designation-page-form-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Full Time"
                  autoFocus
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
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate("/admin/employment-type")}
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
  );
}

export default UpdateEmployementTypePage;
