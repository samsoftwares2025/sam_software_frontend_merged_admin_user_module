// src/pages/admin/UpdateCompanyRulePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toSentenceCase } from "../../../utils/textFormatters";

import Sidebar from "../../../components/common/Sidebar";
import Header from "../../../components/common/Header";
import SuccessModal from "../../../components/common/SuccessModal";
import ErrorModal from "../../../components/common/ErrorModal";
import LoaderOverlay from "../../../components/common/LoaderOverlay";

import "../../../assets/styles/admin.css";


// Using the correct Get-By-ID API
import {
  getRuleById, 
  updateCompanyRule,
} from "../../../api/admin/company_rules";

function UpdateCompanyRulePage() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const ruleId = params.get("id");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Form fields
  const [priorityOrder, setPriorityOrder] = useState("");
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [existingFileUrl, setExistingFileUrl] = useState(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  /* ======================================================
        LOAD RULE (Using getRuleById for full data)
  ====================================================== */
  useEffect(() => {
    if (!ruleId) {
      setErrorMessage("No rule ID provided.");
      setShowErrorModal(true);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    getRuleById(ruleId)
      .then((resp) => {
        if (!mounted) return;

        // Handle nested response structure
        const found = resp?.rule || resp?.data || resp;

        if (!found) {
          setErrorMessage("Company rule details not found.");
          setShowErrorModal(true);
          return;
        }

        // Prefill all fields correctly
        setPriorityOrder(found.priority_order || ""); 
        setTitle(found.title || "");
        setShortDescription(found.short_description || "");
        setDescription(found.description || "");
        setExistingFileUrl(found.image || null);
      })
      .catch((err) => {
        console.error("LOAD FAILED:", err);
        setErrorMessage("Failed to load company rule details.");
        setShowErrorModal(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [ruleId]);

  /* ======================================================
        SUBMIT HANDLER
  ====================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Rule title is required.");
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

      const resp = await updateCompanyRule(ruleId, formData);

      if (resp?.success === false) {
        setErrorMessage(resp.message || "Failed to update company rule.");
        setShowErrorModal(true);
        return;
      }

      setSuccessMessage(resp?.message || "Company rule updated successfully.");
      setShowSuccessModal(true);
    } catch (err) {
      const backendMsg = err?.response?.data?.message;
      setErrorMessage(backendMsg || "Failed to update company rule.");
      setShowErrorModal(true);
    } finally {
      setProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected?.type?.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <>
      {processing && <LoaderOverlay />}
      
      {/* FIXED SUCCESS MODAL: 
         Using 'onClose' here because your old code proved it works. 
      */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => navigate("/admin/company-rules")} 
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
            <h3>Update Company Rule</h3>
            <p className="subtitle">Modify the existing rule.</p>
          </div>

          <div className="card">
            {loading ? (
              <div style={{ padding: "1.25rem" }}>Loading rule...</div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
                
                {/* PRIORITY ORDER FIELD */}
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

                <div className="designation-page-form-row">
                  <label>Rule Title</label>
                  <input
                    className="designation-page-form-input"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => setTitle(toSentenceCase(title))}
                    disabled={processing}
                  />
                </div>

                <div className="designation-page-form-row">
                  <label>Short Description</label>
                  <textarea
                    className="designation-page-form-input"
                    rows={3}
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    onBlur={() => setShortDescription(toSentenceCase(shortDescription))}
                    disabled={processing}
                  />
                </div>

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

                {existingFileUrl && !previewUrl && (
                  <div className="designation-page-form-row">
                    <label>Current File</label>
                    {/\.(jpg|jpeg|png|gif|webp)$/i.test(existingFileUrl) ? (
                      <img
                        src={existingFileUrl}
                        alt="Current"
                        style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 6, border: "1px solid #ccc" }}
                      />
                    ) : (
                      <a href={existingFileUrl} target="_blank" rel="noreferrer">
                        View current file
                      </a>
                    )}
                  </div>
                )}

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
                      style={{ width: 120, height: 120, objectFit: "cover", marginTop: 10, borderRadius: 6, border: "1px solid #ddd" }}
                    />
                  )}
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button type="submit" className="btn btn-primary" disabled={processing}>
                    {processing ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => navigate("/admin/company-rules")}
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
    </>
  );
}

export default UpdateCompanyRulePage;