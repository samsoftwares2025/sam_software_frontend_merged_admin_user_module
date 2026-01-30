// src/pages/admin/UpdatePolicyPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import LoaderOverlay from "../../components/common/LoaderOverlay";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";
import { toSentenceCase } from "../../utils/textFormatters";

import "../../assets/styles/admin.css";
import {
  getPolicyById ,
  updatePolicy,
} from "../../api/admin/policies";

function UpdatePolicyPage() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const policyId = params.get("id");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [loading, setLoading] = useState(true); // loading existing policy
  const [processing, setProcessing] = useState(false); // saving update

  // Error & success modals
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // form fields
  const [priorityOrder, setPriorityOrder] = useState("");
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [existingFileUrl, setExistingFileUrl] = useState(null);

  /* ===============================
        LOAD POLICY
  ================================ */
  /* ===============================
        LOAD POLICY
================================ */
useEffect(() => {
  if (!policyId) return;

  let mounted = true;
  setLoading(true);

  // Use the new, specific function
  getPolicyById(policyId)
    .then((resp) => {
      if (!mounted) return;

      // The backend usually returns the object directly or inside a key
      const found = resp?.policy || resp?.data || resp;

      if (!found) {
        setErrorMessage("Policy details not found.");
        setShowErrorModal(true);
        return;
      }

      // Prefill the states with the full data
      setPriorityOrder(found.priority_order || ""); 
      setTitle(found.title || "");
      setShortDescription(found.short_description || "");
      setDescription(found.description || "");
      setExistingFileUrl(found.image || null);
    })
    .catch((err) => {
      console.error("LOAD ERROR:", err);
      setErrorMessage("Failed to load policy details.");
      setShowErrorModal(true);
    })
    .finally(() => {
      if (mounted) setLoading(false);
    });

  return () => (mounted = false);
}, [policyId]);
  /* ===============================
        FILE HANDLER
  ================================ */
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  };

  /* ===============================
        SUBMIT HANDLER
  ================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Policy title is required.");
      setShowErrorModal(true);
      return;
    }

    setProcessing(true);

    try {
      const formData = new FormData();
      formData.append("priority_order", priorityOrder);
      formData.append("title", title.trim());
      formData.append("short_description", shortDescription.trim());
      formData.append("description", description.trim());
      if (file) formData.append("image", file);

      const resp = await updatePolicy(policyId, formData);

      // backend validation failed
      if (resp?.success === false) {
        setErrorMessage(resp.message || "Failed to update policy.");
        setShowErrorModal(true);
        setProcessing(false);
        return;
      }

      setSuccessMessage(resp.message || "Policy updated successfully.");
      setShowSuccessModal(true);
    } catch (err) {
      const backendMsg = err?.response?.data?.message;
      setErrorMessage(backendMsg || "Failed to update policy.");
      setShowErrorModal(true);
    } finally {
      setProcessing(false);
    }
  };

  /* ===============================
        UI
  ================================ */
  return (
    <div className="container">
      {/* Loader Overlay */}
      {processing && <LoaderOverlay />}

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => {
            setShowSuccessModal(false);
            navigate("/admin/policies");
          }}
        />
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}

      <Sidebar
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        openSection={openSection}
        setOpenSection={setOpenSection}
      />

      <main className="main">
        <Header onMenuClick={() => setIsSidebarOpen((p) => !p)} />

        <div className="page-title">
          <h3>Update Policy</h3>
          <p className="subtitle">Update policy details.</p>
        </div>

        <div className="card">
          {loading ? (
            <div>Loading policy...</div>
          ) : (
            <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
              {/* PRIORITY ORDER */}
              <div className="designation-page-form-row">
                <label>Priority Order</label>
                <input
                  className="designation-page-form-input"
                  type="number"
                  min="1"
                  value={priorityOrder}
                  onChange={(e) => setPriorityOrder(e.target.value)}
                  disabled={processing}
                />
              </div>
              {/* TITLE */}
              <div className="designation-page-form-row">
                <label>Policy Title</label>
                <input
                  className="designation-page-form-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setTitle(toSentenceCase(title))}
                  disabled={processing}
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
                  onBlur={() =>
                    setShortDescription(toSentenceCase(shortDescription))
                  }
                  disabled={processing}
                />
              </div>

              {/* DESCRIPTION */}
              <div className="designation-page-form-row">
                <label>Description</label>
                <textarea
                  className="designation-page-form-input"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => setDescription(toSentenceCase(description))}
                  disabled={processing}
                />
              </div>

              {/* EXISTING FILE */}
              {existingFileUrl && !previewUrl && (
                <div className="designation-page-form-row">
                  <label>Current File</label>

                  {/\.(jpg|jpeg|png|gif|webp)$/i.test(existingFileUrl) ? (
                    <img
                      src={existingFileUrl}
                      alt="Current Policy"
                      style={{
                        width: 120,
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                  ) : (
                    <a href={existingFileUrl} target="_blank" rel="noreferrer">
                      View current document
                    </a>
                  )}
                </div>
              )}

              {/* NEW FILE */}
              <div className="designation-page-form-row">
                <label>Replace File (optional)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  disabled={processing}
                />

                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      width: 120,
                      height: 120,
                      objectFit: "cover",
                      marginTop: 10,
                      borderRadius: 6,
                    }}
                  />
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={processing}
                >
                  {processing ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate("/admin/policies")}
                  disabled={processing}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default UpdatePolicyPage;
