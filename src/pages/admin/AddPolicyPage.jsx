import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";

import LoaderOverlay from "../../components/common/LoaderOverlay";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

import "../../assets/styles/admin.css";

import { createPolicy } from "../../api/admin/policies";
import { useAuth } from "../../context/AuthContext";

function AddPolicyPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const { logout } = useAuth();

  /* ======================================
      FILE HANDLER
  ====================================== */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreviewUrl(null);

    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  /* ======================================
      FORM SUBMIT
  ====================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Please enter a policy title.");
      setShowErrorModal(true);
      return;
    }

    setSaving(true);
    setProcessing(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("short_description", shortDescription.trim());
      formData.append("description", description.trim());
      if (file) formData.append("image", file);

      const resp = await createPolicy(formData);

      setSuccessMessage(resp?.message || "Policy added successfully.");
      setShowSuccessModal(true);

    } catch (err) {
      console.error("CREATE POLICY FAILED:", err);

      const status = err?.response?.status;
      const respData = err?.response?.data;

      // Auth fail → Logout
      if (status === 401 || status === 403) {
        setErrorMessage(respData?.detail || "Session expired. Please sign in again.");
        setShowErrorModal(true);
        logout();
        navigate("/", { replace: true });
        return;
      }

      setErrorMessage(
        respData?.message ||
          respData?.detail ||
          respData?.error ||
          "Failed to add policy. Please try again."
      );
      setShowErrorModal(true);

    } finally {
      setSaving(false);
      setProcessing(false);
    }
  };

  /* ======================================
      UI
  ====================================== */
  return (
    <>
      {/* Loading Overlay */}
      {processing && <LoaderOverlay />}

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => navigate("/admin/policies")}
        />
      )}

      {/* Error Modal */}
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
            <h3>Add Policy</h3>
            <p className="subtitle">Create a new company policy.</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>

              {/* TITLE */}
              <div className="designation-page-form-row">
                <label>Policy Title</label>
                <input
                  className="designation-page-form-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Leave Policy"
                  disabled={saving}
                />
              </div>

              {/* SHORT DESCRIPTION */}
              <div className="designation-page-form-row">
                <label>Short Description</label>
                <textarea
                  className="designation-page-form-input"
                  rows={3}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Brief summary of the policy..."
                  disabled={saving}
                />
              </div>

              {/* DESCRIPTION */}
              <div className="designation-page-form-row">
                <label>Description</label>
                <textarea
                  className="designation-page-form-input"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Full policy description..."
                  disabled={saving}
                />
              </div>

              {/* FILE UPLOAD */}
              <div className="designation-page-form-row">
                <label>Policy Document / Image</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  disabled={saving}
                />

                {previewUrl && (
                  <div style={{ marginTop: 10 }}>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        width: 120,
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 6,
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                )}

                {!previewUrl && file && (
                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    Selected file: <strong>{file.name}</strong>
                  </div>
                )}
              </div>

              {/* BUTTONS */}
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Add Policy"}
                </button>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate("/admin/policies")}
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

export default AddPolicyPage;
