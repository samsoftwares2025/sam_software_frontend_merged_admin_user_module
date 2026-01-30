import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";

import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";
import LoaderOverlay from "../../components/common/LoaderOverlay";
import { toSentenceCase } from "../../utils/textFormatters";

import "../../assets/styles/admin.css";

import { createCompanyRule } from "../../api/admin/company_rules";
import { useAuth } from "../../context/AuthContext";

function AddCompanyRulePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");
 
  const [priorityOrder, setPriorityOrder] = useState("");
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  /* ==========================================================
        SECURE FILE VALIDATION
  =========================================================== */
  const allowedExtensions = [
    "pdf",
    "doc",
    "docx",
    "jpg",
    "jpeg",
    "png",
    "webp",
  ];
  const allowedMimes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];
  const magicSignatures = {
    pdf: ["25504446"],
    jpg: ["FFD8FF"],
    jpeg: ["FFD8FF"],
    png: ["89504E47"],
    webp: ["52494646"],
    docx: ["504B0304"],
    doc: ["D0CF11E0A1B11AE1"],
  };
  const MAX_SIZE_MB = 10;

  const readMagicBytes = (file, length = 8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      const blob = file.slice(0, length);
      reader.onloadend = () => {
        const arr = new Uint8Array(reader.result);
        resolve(
          [...arr]
            .map((x) => x.toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase(),
        );
      };
      reader.readAsArrayBuffer(blob);
    });
  };

  const validateFile = async (file) => {
    setErrorMessage("");

    if (!file) return false;

    const ext = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      setErrorMessage("Invalid file type.");
      setShowErrorModal(true);
      return false;
    }

    if (!allowedMimes.includes(file.type)) {
      setErrorMessage("Invalid file format.");
      setShowErrorModal(true);
      return false;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`File must be under ${MAX_SIZE_MB}MB.`);
      setShowErrorModal(true);
      return false;
    }

    const magic = await readMagicBytes(file);
    const validMagicList = magicSignatures[ext] || [];

    if (!validMagicList.some((sig) => magic.startsWith(sig))) {
      setErrorMessage("File signature does not match its type.");
      setShowErrorModal(true);
      return false;
    }

    if (file.type.startsWith("image")) {
      setPreviewUrl(URL.createObjectURL(file));
    }

    return true;
  };

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

  /* ==========================================================
        SUBMIT HANDLER
  =========================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Please enter a rule title.");
      setShowErrorModal(true);
      return;
    }

    setSaving(true);
    setProcessing(true);

    try {
      const formData = new FormData();
      formData.append("priority_order", priorityOrder);
      formData.append("title", title.trim());
      formData.append("short_description", shortDescription.trim());
      formData.append("description", description.trim());
      if (file) formData.append("image", file);

      const resp = await createCompanyRule(formData);

      setSuccessMessage(resp?.message || "Company rule added successfully");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("CREATE COMPANY RULE FAILED:", err);

      const status = err?.response?.status;
      const respData = err?.response?.data;

      if (status === 401 || status === 403) {
        setErrorMessage(
          respData?.detail || "Session expired. Please sign in again.",
        );
        setShowErrorModal(true);
        logout();
        navigate("/", { replace: true });
        return;
      }

      setErrorMessage(
        respData?.message ||
          respData?.detail ||
          respData?.error ||
          "Failed to add company rule.",
      );
      setShowErrorModal(true);
    } finally {
      setSaving(false);
      setProcessing(false);
    }
  };

  /* ==========================================================
        RENDER
  =========================================================== */
  return (
    <>
      {processing && <LoaderOverlay />}

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
            <h3>Add Company Rule</h3>
            <p className="subtitle">Create a new company rule.</p>
          </div>

          <div className="card">
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
                  placeholder="e.g. 1 (Highest Importance)"
                  disabled={saving}
                />
                <small style={{ color: "#666", fontSize: "11px" }}>
                  Lower numbers appear first in the policy list.
                </small>
              </div>
              {/* TITLE */}
              <div className="designation-page-form-row">
                <label>Rule Title</label>
                <input
                  className="designation-page-form-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setTitle(toSentenceCase(title))}
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
                  onBlur={() =>
                  setShortDescription(toSentenceCase(shortDescription))}
                  disabled={saving}
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
                  onBlur={() =>
                  setDescription(toSentenceCase(description))}
                  disabled={saving}
                />
              </div>

              {/* FILE UPLOAD */}
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

              {/* ACTION BUTTONS */}
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
    </>
  );
}

export default AddCompanyRulePage;
