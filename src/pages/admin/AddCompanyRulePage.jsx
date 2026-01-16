import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";
import { createCompanyRule } from "../../api/admin/company_rules";
import Sidebar from "../../components/common/Sidebar";

import { useAuth } from "../../context/AuthContext";

/* ================= SUCCESS MODAL ================= */
const SuccessModal = ({ onOk }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="success-icon">
        <i className="fa-solid fa-circle-check"></i>
      </div>
      <h2>Company Rule Added Successfully</h2>
      <p>The company rule has been added to the system.</p>
      <button className="btn btn-primary" onClick={onOk}>
        OK
      </button>
    </div>
  </div>
);

function AddCompanyRulePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  /* ======================================================
        SECURE FILE VALIDATION
  ====================================================== */

  const allowedExtensions = ["pdf", "doc", "docx", "jpg", "jpeg", "png", "webp"];

  const allowedMimes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  const magicSignatures = {
    pdf: ["25504446"],
    jpg: ["FFD8FF"],
    jpeg: ["FFD8FF"],
    png: ["89504E47"],
    webp: ["52494646"],
    docx: ["504B0304"],
    doc: ["D0CF11E0A1B11AE1"]
  };

  const MAX_SIZE_MB = 10;

  const readMagicBytes = (file, length = 8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      const blob = file.slice(0, length);
      reader.onloadend = () => {
        const arr = new Uint8Array(reader.result);
        resolve(
          [...arr].map(x => x.toString(16).padStart(2, "0")).join("").toUpperCase()
        );
      };
      reader.readAsArrayBuffer(blob);
    });
  };

  const validateFile = async (file) => {
    setError("");
    setPreviewUrl(null);

    if (!file) return false;

    const ext = file.name.split(".").pop().toLowerCase();

    // EXTENSION CHECK
    if (!allowedExtensions.includes(ext)) {
      setError("Invalid file type.");
      return false;
    }

    // MIME CHECK
    if (!allowedMimes.includes(file.type)) {
      setError("Invalid file format.");
      return false;
    }

    // SIZE CHECK
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SIZE_MB}MB.`);
      return false;
    }

    // MAGIC BYTE CHECK
    const magic = await readMagicBytes(file, 8);
    const validMagicList = magicSignatures[ext] || [];
    const validMagic = validMagicList.some(sig => magic.startsWith(sig));

    if (!validMagic) {
      setError("File signature does not match its type.");
      return false;
    }

    // SAFE PREVIEW
    if (file.type.startsWith("image")) {
      setPreviewUrl(URL.createObjectURL(file));
    }

    return true;
  };

  /* ======================================================
        FILE INPUT HANDLER
  ====================================================== */

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];

    const valid = await validateFile(selectedFile);

    if (!valid) {
      e.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  /* ======================================================
        SUBMIT HANDLER
  ====================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a rule title.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("short_description", shortDescription.trim());
      formData.append("description", description.trim());
      if (file) formData.append("image", file);

      await createCompanyRule(formData);

      setShowSuccessModal(true);

    } catch (err) {
      console.error("CREATE COMPANY RULE FAILED:", err);

      const status = err?.response?.status;
      const respData = err?.response?.data;

      if (status === 401 || status === 403) {
        setError(respData?.detail || "Session expired. Please sign in again.");
        logout();
        navigate("/", { replace: true });
        return;
      }

      setError(
        respData?.message ||
        respData?.detail ||
        respData?.error ||
        "Failed to add company rule."
      );

    } finally {
      setSaving(false);
    }
  };

  /* ======================================================
        RENDER
  ====================================================== */

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
            <h3>Add Company Rule</h3>
            <p className="subtitle">Create a new company rule.</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
              {error && (
                <div style={{ color: "red", marginBottom: 10 }}>
                  {error}
                </div>
              )}

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

              <div className="designation-page-form-row">
                <label>Short Description</label>
                <textarea
                  className="designation-page-form-input"
                  rows={3}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Brief summary of the rule..."
                  disabled={saving}
                />
              </div>

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

              <div className="designation-page-form-row">
                <label>Document / Image</label>
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

                {!previewUrl && file && (
                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    Selected: <strong>{file.name}</strong>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Add Rule"}
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
          </div>
        </main>

        <div
          className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        />
      </div>

      {showSuccessModal && (
        <SuccessModal onOk={() => navigate("/admin/company-rules")} />
      )}
    </>
  );
}

export default AddCompanyRulePage;
