import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";

import {
  getCompanyRules as apiGetCompanyRules,
  updateCompanyRule,
} from "../../api/admin/company_rules";

/* ================= SUCCESS MODAL ================= */
const SuccessModal = ({ onOk }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="success-icon">
        <i className="fa-solid fa-circle-check"></i>
      </div>
      <h2>Company Rule Updated</h2>
      <p>The rule has been updated successfully.</p>

      <button className="btn btn-primary" onClick={onOk}>
        OK
      </button>
    </div>
  </div>
);

function UpdateCompanyRulePage() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const ruleId = params.get("id");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection,setOpenSection] = useState("organization");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [originalRule, setOriginalRule] = useState(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [existingFileUrl, setExistingFileUrl] = useState(null);

  /* ===============================
     LOAD RULE
  ================================ */
  useEffect(() => {
    if (!ruleId) {
      setError("No rule ID provided.");
      setLoading(false);
      return;
    }

    let mounted = true;
    setError(null);
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
          setError("Company rule not found.");
          return;
        }

        setTitle(found.title || "");
        setShortDescription(found.short_description || "");
        setDescription(found.description || "");
        setExistingFileUrl(found.image || null);
        setOriginalRule(found);
      })
      .catch((err) => {
        console.error("LOAD FAILED:", err);
        setError("Failed to load company rule.");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [ruleId]);

  /* ===============================
     FILE HANDLER
  ================================ */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreviewUrl(null);

    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  /* ===============================
     SUBMIT
  ================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Rule title is required.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("short_description", shortDescription.trim());
      formData.append("description", description.trim());
      if (file) formData.append("image", file);

      const resp = await updateCompanyRule(ruleId, formData);

      // 🔥 EXACT BACKEND DUPLICATION ERROR SUPPORT
      if (resp?.success === false) {
        setError(resp.message || "Failed to update company rule.");
        setSaving(false);
        return;
      }

      setShowSuccessModal(true);
    } catch (err) {
      console.error("UPDATE FAILED:", err);

      const respData = err?.response?.data;

      // 🔥 show backend validation / duplication message
      if (respData?.message) {
        setError(respData.message);
        setSaving(false);
        return;
      }

      setError("Failed to update company rule.");
    } finally {
      setSaving(false);
    }
  };

  /* ===============================
     UI
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
            <h3>Update Company Rule</h3>
            <p className="subtitle">Modify the existing rule.</p>
          </div>

          <div className="card">
            {loading ? (
              <div style={{ padding: "1.25rem" }}>Loading rule...</div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
                {error && (
                  <div style={{ color: "red", marginBottom: 10 }}>{error}</div>
                )}

                {/* Title */}
                <div className="designation-page-form-row">
                  <label>Rule Title</label>
                  <input
                    className="designation-page-form-input"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={saving}
                  />
                </div>

                {/* Short Description */}
                <div className="designation-page-form-row">
                  <label>Short Description</label>
                  <textarea
                    className="designation-page-form-input"
                    rows={3}
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    disabled={saving}
                  />
                </div>

                {/* Description */}
                <div className="designation-page-form-row">
                  <label>Description</label>
                  <textarea
                    className="designation-page-form-input"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={saving}
                  />
                </div>

                {/* Current File */}
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

                {/* New File */}
                <div className="designation-page-form-row">
                  <label>Replace File (optional)</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileChange}
                    disabled={saving}
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

                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => navigate("/admin/company-rules")}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <SuccessModal onOk={() => navigate("/admin/company-rules")} />
      )}
    </>
  );
}

export default UpdateCompanyRulePage;
