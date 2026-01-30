// src/pages/admin/UpdateDesignationPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import { toSentenceCase } from "../../utils/textFormatters";

import LoaderOverlay from "../../components/common/LoaderOverlay";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

import "../../assets/styles/admin.css";

// Import the specific get helper
import {
  getDesignationById, 
  updateDesignation,
} from "../../api/admin/designations";

import { listDepartments } from "../../api/admin/departments";

/* =============================================================== */
/* SAFELY EXTRACT NAME                                             */
/* =============================================================== */
const extractDesignationName = (value) => {
  if (!value) return "";
  if (typeof value === "string" && !value.trim().startsWith("{")) return value;

  try {
    const fixed = value.replace(/'/g, '"');
    const parsed = JSON.parse(fixed);
    return parsed?.name || "";
  } catch {
    return value;
  }
};

function UpdateDesignationPage() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const desgId = params.get("id");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ================= LOAD DEPARTMENTS ================= */
  useEffect(() => {
    const loadDepts = async () => {
      try {
        const res = await listDepartments();
        const list = Array.isArray(res) ? res : res?.departments || [];
        setDepartments(list);
      } catch (err) {
        setErrorMessage("Failed to load departments.");
        setShowErrorModal(true);
      } finally {
        setLoadingDepts(false);
      }
    };
    loadDepts();
  }, []);

  /* ================= LOAD DESIGNATION (Optimized) ================= */
  useEffect(() => {
    if (!desgId) {
      setErrorMessage("No designation ID provided.");
      setShowErrorModal(true);
      setLoading(false);
      return;
    }

    let mounted = true;
    const fetchDesignation = async () => {
      try {
        // Use the specific ID fetcher instead of listDesignations
        const resp = await getDesignationById(desgId);
        
        // Backend usually returns the object directly or inside a 'designation' key
        const found = resp?.designation || resp?.data || resp;

        if (!found) {
          setErrorMessage("Designation not found.");
          setShowErrorModal(true);
          return;
        }

        const extractedName = extractDesignationName(found.name);
        if (mounted) {
          setName(extractedName);
          setOriginalName(extractedName);
          setDepartmentId(found.department_id || "");
        }
      } catch (err) {
        if (mounted) {
          setErrorMessage("Failed to load designation details.");
          setShowErrorModal(true);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDesignation();
    return () => (mounted = false);
  }, [desgId]);

  /* ================= SUBMIT HANDLER ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setErrorMessage("Designation name is required.");
      setShowErrorModal(true);
      return;
    }

    if (!departmentId) {
      setErrorMessage("Please select a department.");
      setShowErrorModal(true);
      return;
    }

    if (trimmed === originalName.trim()) {
      navigate("/admin/designations", { replace: true });
      return;
    }

    setSaving(true);
    try {
      const resp = await updateDesignation(desgId, trimmed, departmentId);

      if (resp?.success === false) {
        setErrorMessage(resp.message || "Failed to update designation.");
        setShowErrorModal(true);
        return;
      }
      setShowSuccessModal(true);
    } catch (err) {
      const backendMsg = err?.response?.data?.message || "Failed to update designation.";
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
          message="Designation updated successfully."
          onClose={() => navigate("/admin/designations")}
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
            <h3>Update Designation</h3>
            <p className="subtitle">Update designation details.</p>
          </div>

          <div className="card">
            {loading ? (
              <div style={{ padding: "1.25rem" }}>Loading designation details...</div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
                <div className="designation-page-form-row">
                  <label>Department</label>
                  <select
                    className="designation-page-form-input"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    disabled={loadingDepts}
                  >
                    <option value="">
                      {loadingDepts ? "Loading departments..." : "Select Department"}
                    </option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="designation-page-form-row">
                  <label>Designation Name</label>
                  <input
                    className="designation-page-form-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setName(toSentenceCase(name))}
                    placeholder="e.g. Manager"
                  />
                </div>

                <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
                  <button className="btn btn-primary" type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => navigate("/admin/designations")}
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

export default UpdateDesignationPage;