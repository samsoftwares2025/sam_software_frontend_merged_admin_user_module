import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";

import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";
import LoaderOverlay from "../../components/common/LoaderOverlay";

import "../../assets/styles/admin.css";

import {
  getCompanyRules as apiGetCompanyRules,
  updateCompanyRule,
} from "../../api/admin/company_rules";

function UpdateCompanyRulePage() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const ruleId = params.get("id");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false); // Preloader when saving

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [existingFileUrl, setExistingFileUrl] = useState(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  /* ======================================================
        LOAD RULE
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

    apiGetCompanyRules()
      .then((resp) => {
        if (!mounted) return;

        let list = [];

        if (resp?.rules) list = resp.rules;
        else if (Array.isArray(resp)) list = resp;
        else if (Array.isArray(resp?.data)) list = resp.data;
        else if (Array.isArray(resp?.results)) list = resp.results;

        const found = list.find((r) => String(r.id) === String(ruleId));

        if (!found) {
          setErrorMessage("Company rule not found.");
          setShowErrorModal(true);
          return;
        }

        setTitle(found.title || "");
        setShortDescription(found.short_description || "");
        setDescription(found.description || "");
        setExistingFileUrl(found.image || null);
      })
      .catch((err) => {
        console.error("LOAD FAILED:", err);
        setErrorMessage("Failed to load company rule.");
        setShowErrorModal(true);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [ruleId]);

  /* ======================================================
        FILE HANDLER
  ====================================================== */
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreviewUrl(null);

    if (selected?.type?.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

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
      console.error("UPDATE FAILED:", err);

      const backendMsg = err?.response?.data?.message;

      setErrorMessage(backendMsg || "Failed to update company rule.");
      setShowErrorModal(true);

    } finally {
      setProcessing(false);
    }
  };

  /* ======================================================
        UI
  ====================================================== */
  return (
    <>
      {/* GLOBAL LOADER */}
      {processing && <LoaderOverlay />}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => navigate("/admin/company-rules")}
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
            <h3>Update Company Rule</h3>
            <p className="subtitle">Modify the existing rule.</p>
          </div>

          <div className="card">
            {loading ? (
              <div style={{ padding: "1.25rem" }}>Loading rule...</div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
                {/* TITLE */}
                <div className="designation-page-form-row">
                  <label>Rule Title</label>
                  <input
                    className="designation-page-form-input"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                        alt="Current"
                        style={{
                          width: 120,
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: "1px solid #ccc",
                        }}
                      />
                    ) : (
                      <a href={existingFileUrl} target="_blank" rel="noreferrer">
                        View current file
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
                        border: "1px solid #ddd",
                      }}
                    />
                  )}
                </div>

                {/* ACTION BUTTONS */}
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
