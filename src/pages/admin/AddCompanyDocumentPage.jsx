import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import LoaderOverlay from "../../components/common/LoaderOverlay";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";
import { toSentenceCase } from "../../utils/textFormatters";
import "../../assets/styles/admin.css";

import { createCompanyDocument } from "../../api/admin/company_documents";

function AddCompanyDocumentPage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    issue_date: "",
    expiry_date: "",
    document_files: [], 
  });

  const [previewUrls, setPreviewUrls] = useState([]); 

  // UI Modals
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ==========================================================
        SECURE FILE VALIDATION (Magic Bytes)
  =========================================================== */
  const magicSignatures = {
    pdf: ["25504446"],
    jpg: ["FFD8FF"],
    jpeg: ["FFD8FF"],
    png: ["89504E47"],
    webp: ["52494646"],
  };

  const readMagicBytes = (file, length = 8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      const blob = file.slice(0, length);
      reader.onloadend = () => {
        const arr = new Uint8Array(reader.result);
        resolve([...arr].map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase());
      };
      reader.readAsArrayBuffer(blob);
    });
  };

  const validateFile = async (file) => {
    if (!file) return false;
    const ext = file.name.split(".").pop().toLowerCase();
    const MAX_SIZE_MB = 5;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`File "${file.name}" exceeds ${MAX_SIZE_MB}MB.`);
      setShowError(true);
      return false;
    }

    const magic = await readMagicBytes(file);
    const validMagicList = magicSignatures[ext] || [];
    if (!validMagicList.some((sig) => magic.startsWith(sig))) {
      setErrorMessage(`File "${file.name}" content mismatch.`);
      setShowError(true);
      return false;
    }
    return true;
  };

  /* ==========================================================
        HANDLERS
  =========================================================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    const newPreviews = [];

    for (const file of selectedFiles) {
      const isValid = await validateFile(file);
      if (isValid) {
        validFiles.push(file);
        if (file.type.startsWith("image")) {
          newPreviews.push({
            url: URL.createObjectURL(file),
            fileName: file.name // Tracking by name to help removal
          });
        }
      }
    }

    // MERGE: Keep old files + add new ones
    setFormData((prev) => ({
      ...prev,
      document_files: [...prev.document_files, ...validFiles]
    }));
    
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    
    // Clear input so same file can be re-selected if removed
    e.target.value = "";
  };

  const removeFile = (index) => {
    const fileToRemove = formData.document_files[index];
    
    // Remove from files array
    setFormData(prev => ({
      ...prev,
      document_files: prev.document_files.filter((_, i) => i !== index)
    }));

    // Remove from previews if it was an image
    if (fileToRemove.type.startsWith("image")) {
      setPreviewUrls(prev => prev.filter(p => p.fileName !== fileToRemove.name));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.document_files.length === 0) {
      setErrorMessage("Please select at least one document.");
      setShowError(true);
      return;
    }
    setLoading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title.trim());
      data.append("description", formData.description.trim());
      data.append("issue_date", formData.issue_date);
      data.append("expiry_date", formData.expiry_date);
      
      formData.document_files.forEach((file) => {
        data.append("images", file);
      });

      const resp = await createCompanyDocument(data);
      if (resp.success) {
        setShowSuccess(true);
      } else {
        setErrorMessage(resp.message || "Failed to add document.");
        setShowError(true);
      }
    } catch (err) {
      setErrorMessage("An error occurred while uploading.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoaderOverlay />}
      {showSuccess && (
        <SuccessModal
          message="Company document added successfully!"
          onClose={() => navigate("/admin/company-documents")}
        />
      )}
      {showError && <ErrorModal message={errorMessage} onClose={() => setShowError(false)} />}

      <div className="container">
        <Sidebar isMobileOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} openSection="organization" />
        <main className="main">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />

          <div className="page-title">
            <h3>Add Company Document</h3>
            <p className="subtitle">Securely upload official company paperwork.</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label required">Document Title</label>
                  <input
                    type="text" name="title" className="form-input"
                    value={formData.title} onChange={handleChange}
                    onBlur={() => setFormData(p => ({...p, title: toSentenceCase(formData.title)}))}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description" className="form-textarea"
                    value={formData.description} onChange={handleChange}
                    onBlur={() => setFormData(p => ({...p, description: toSentenceCase(formData.description)}))}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Issue Date</label>
                  <input type="date" name="issue_date" className="form-input" value={formData.issue_date} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label required">Expiry Date</label>
                  <input type="date" name="expiry_date" className="form-input" value={formData.expiry_date} onChange={handleChange} required />
                </div>

                <div className="form-group full-width">
                  <label className="form-label required">Upload Documents (Click to add more)</label>
                  <input
                    type="file" className="form-input"
                    onChange={handleFileChange}
                    accept=".pdf, .jpg, .jpeg, .png, .webp"
                    multiple
                  />
                  
                  {/* File List / Previews */}
                  <div style={{ display: "flex", gap: 15, flexWrap: "wrap", marginTop: 15 }}>
                    {formData.document_files.map((file, idx) => {
                      const isImg = file.type.startsWith("image");
                      const previewObj = isImg ? previewUrls.find(p => p.fileName === file.name) : null;

                      return (
                        <div key={idx} className="file-preview-item" style={{ position: "relative", width: 100 }}>
                          {isImg ? (
                            <img 
                              src={previewObj?.url} 
                              alt="Preview" 
                              style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 6, border: "1px solid #ddd" }} 
                            />
                          ) : (
                            <div style={{ width: 100, height: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8f9fa", borderRadius: 6, border: "1px solid #ddd", textAlign: "center", padding: 5 }}>
                              <i className="fa-solid fa-file-pdf" style={{ fontSize: 24, color: "#e74c3c" }}></i>
                              <span style={{ fontSize: 10, wordBreak: "break-all", marginTop: 5 }}>{file.name}</span>
                            </div>
                          )}
                          <button 
                            type="button" 
                            onClick={() => removeFile(idx)}
                            style={{ position: "absolute", top: -8, right: -8, background: "#ff4d4d", color: "white", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
                          >
                            <i className="fa-solid fa-xmark" style={{fontSize: 12}}></i>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="form-actions" style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : "Save Document"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

export default AddCompanyDocumentPage;