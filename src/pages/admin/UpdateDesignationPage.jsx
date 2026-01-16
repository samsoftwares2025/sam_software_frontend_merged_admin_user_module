// src/pages/admin/UpdateDesignationPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";

import LoaderOverlay from "../../components/common/LoaderOverlay";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

import "../../assets/styles/admin.css";

import {
  getDesignations as apiGetDesignations,
  updateDesignation,
} from "../../api/admin/designations";

import { getDepartments } from "../../api/admin/departments";

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

  /* ============================= */
  /* Layout */
  /* ============================= */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  /* ============================= */
  /* Form State */
  /* ============================= */
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ============================= */
  /* Modals */
  /* ============================= */
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* =============================================================== */
  /* LOAD DEPARTMENTS                                                */
  /* =============================================================== */
  useEffect(() => {
    const loadDepts = async () => {
      try {
        const res = await getDepartments();
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

  /* =============================================================== */
  /* LOAD DESIGNATION                                                */
  /* =============================================================== */
  useEffect(() => {
    if (!desgId) {
      setErrorMessage("No designation ID provided.");
      setShowErrorModal(true);
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadDesignation = async () => {
      try {
        const resp = await apiGetDesignations();

        let list = [];
        if (Array.isArray(resp)) list = resp;
        else if (Array.isArray(resp.designations)) list = resp.designations;
        else if (Array.isArray(resp.results)) list = resp.results;
        else if (Array.isArray(resp.data)) list = resp.data;

        const found = list.find((d) => String(d.id) === String(desgId));

        if (!found) {
          setErrorMessage("Designation not found.");
          setShowErrorModal(true);
          return;
        }

        const extractedName = extractDesignationName(found.name);
        setName(extractedName);
        setOriginalName(extractedName);
        setDepartmentId(found.department_id || "");
      } catch (err) {
        setErrorMessage("Failed to load designation details.");
        setShowErrorModal(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDesignation();
    return () => (mounted = false);
  }, [desgId]);

  /* =============================================================== */
  /* SUBMIT HANDLER                                                  */
  /* =============================================================== */
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

    // If unchanged, simply navigate away
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
        setSaving(false);
        return;
      }

      // SUCCESS
      setShowSuccessModal(true);
    } catch (err) {
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to update designation.";

      setErrorMessage(backendMsg);
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  /* =============================================================== */
  /* RENDER                                                          */
  /* =============================================================== */
  return (
    <>
      {saving && <LoaderOverlay />}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <SuccessModal
          message="Designation updated successfully."
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
          <div className="the_line" />

          <div className="page-title">
            <h3>Update Designation</h3>
            <p className="subtitle">Update designation details.</p>
          </div>

          <div className="card">
            {loading ? (
              <div style={{ padding: "1.25rem" }}>
                Loading designation details...
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
                {/* Department */}
                <div className="designation-page-form-row">
                  <label>Department</label>
                  <select
                    className="designation-page-form-input"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    disabled={loadingDepts}
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
                  />
                </div>

                {/* Actions */}
                <div
                  style={{
                    marginTop: "1rem",
                    display: "flex",
                    gap: "0.75rem",
                  }}
                >
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

        <div
          className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        />
      </div>
    </>
  );
}

export default UpdateDesignationPage;
