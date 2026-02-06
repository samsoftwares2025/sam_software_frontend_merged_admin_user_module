import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import Header from "../../../components/common/Header";
import LoaderOverlay from "../../../components/common/LoaderOverlay";
import SuccessModal from "../../../components/common/SuccessModal";
import ErrorModal from "../../../components/common/ErrorModal";
import { toSentenceCase } from "../../../utils/textFormatters";
import "../../../assets/styles/admin.css";


import {
  getCompanyDocumentById,
  updateCompanyDocument,
} from "../../../api/admin/company_documents";

function UpdateCompanyDocumentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const docId = searchParams.get("id");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    issue_date: "",
    expiry_date: "",
    document_files: [],
  });

  const [existingFiles, setExistingFiles] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]); // Track IDs to delete
  const [previewUrls, setPreviewUrls] = useState([]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ==========================================================
        FETCH EXISTING DATA
  =========================================================== */
  useEffect(() => {
    if (!docId) {
      setErrorMessage("No document ID provided.");
      setShowError(true);
      return;
    }

    const fetchDetails = async () => {
      try {
        const resp = await getCompanyDocumentById(docId);
        if (resp.success) {
          const doc = resp.data;
          setFormData({
            title: doc.title || "",
            description: doc.description || "",
            issue_date: doc.issue_date || "",
            expiry_date: doc.expiry_date || "",
            document_files: [],
          });
          if (doc.images && Array.isArray(doc.images)) {
            setExistingFiles(doc.images);
          }
        } else {
          setErrorMessage(resp.message || "Failed to fetch details.");
          setShowError(true);
        }
      } catch (err) {
        setErrorMessage("Error loading document data.");
        setShowError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [docId]);

  /* ==========================================================
        HANDLERS
  =========================================================== */
  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    const newPreviews = [];

    // Note: Re-using your magic byte validation here is recommended
    for (const file of selectedFiles) {
      validFiles.push(file);
      if (file.type.startsWith("image")) {
        newPreviews.push(URL.createObjectURL(file));
      }
    }

    setFormData((prev) => ({
      ...prev,
      document_files: [...prev.document_files, ...validFiles],
    }));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  // Remove a file that was JUST selected (not yet saved)
  const removeNewFile = (index) => {
    const fileToRemove = formData.document_files[index];
    setFormData((prev) => ({
      ...prev,
      document_files: prev.document_files.filter((_, i) => i !== index),
    }));
    if (fileToRemove.type.startsWith("image")) {
      setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Remove an ALREADY SAVED file (marks for deletion in BE)
  const handleRemoveExisting = (imgId) => {
    setRemovedImageIds((prev) => [...prev, imgId]);
    setExistingFiles((prev) => prev.filter((item) => item.image_id !== imgId));
  };

  /* ==========================================================
        SUBMIT HANDLER
  =========================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      data.append("document_id", docId); // Required by your BE
      data.append("title", formData.title.trim());
      data.append("description", formData.description.trim());
      data.append("issue_date", formData.issue_date);
      data.append("expiry_date", formData.expiry_date);

      // Send the list of IDs to be removed as a JSON string
      data.append("remove_image_ids", JSON.stringify(removedImageIds));

      formData.document_files.forEach((file) => {
        data.append("images", file);
      });

      const resp = await updateCompanyDocument(docId, data);

      if (resp.success) {
        setShowSuccess(true);
      } else {
        setErrorMessage(resp.message || "Failed to update document.");
        setShowError(true);
      }
    } catch (err) {
      setErrorMessage("An error occurred during update.");
      setShowError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {(loading || saving) && <LoaderOverlay />}
      {showSuccess && (
        <SuccessModal
          message="Document updated successfully!"
          onClose={() => navigate("/admin/company-documents")}
        />
      )}
      {showError && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowError(false)}
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
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <div className="page-title">
            <h3>Update Company Document</h3>
          </div>

          <div className="card">
            {!loading && (
              <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label required">
                      Document Title
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      onBlur={() =>
                        setFormData((p) => ({
                          ...p,
                          title: toSentenceCase(formData.title),
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      onBlur={() =>
                        setFormData((p) => ({
                          ...p,
                          description: toSentenceCase(formData.description),
                        }))
                      }
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Issue Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.issue_date}
                      onChange={(e) =>
                        setFormData({ ...formData, issue_date: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Expiry Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.expiry_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expiry_date: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  {/* EXISTING FILES SECTION */}
                  <div className="form-group full-width">
                    <label className="form-label">
                      Current Documents (Click × to remove)
                    </label>
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginTop: "8px",
                      }}
                    >
                      {existingFiles.map((img) => (
                        <div
                          key={img.image_id}
                          style={{ position: "relative" }}
                        >
                          <img
                            src={img.image_url}
                            alt="Existing"
                            style={{
                              width: 100,
                              height: 100,
                              objectFit: "cover",
                              borderRadius: 8,
                              border: "1px solid #ddd",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExisting(img.image_id)}
                            style={{
                              position: "absolute",
                              top: -5,
                              right: -5,
                              background: "#ff4d4d",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: 20,
                              height: 20,
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ADD NEW FILES SECTION */}
                  <div className="form-group full-width">
                    <label className="form-label">Add More Documents</label>
                    <input
                      type="file"
                      className="form-input"
                      onChange={handleFileChange}
                      accept=".pdf, .jpg, .jpeg, .png, .webp"
                      multiple
                    />

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        marginTop: "10px",
                      }}
                    >
                      {formData.document_files.map((file, idx) => (
                        <div key={idx} style={{ position: "relative" }}>
                          {file.type.startsWith("image") ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt="New"
                              style={{
                                width: 100,
                                height: 100,
                                objectFit: "cover",
                                borderRadius: 8,
                                border: "2px solid #3b82f6",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 100,
                                height: 100,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#f0f0f0",
                                borderRadius: 8,
                                border: "2px solid #3b82f6",
                                fontSize: "10px",
                                textAlign: "center",
                                padding: "5px",
                              }}
                            >
                              <i
                                className="fa-solid fa-file-pdf"
                                style={{ color: "red", fontSize: "20px" }}
                              ></i>
                              <br />
                              {file.name}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeNewFile(idx)}
                            style={{
                              position: "absolute",
                              top: -5,
                              right: -5,
                              background: "red",
                              color: "white",
                              borderRadius: "50%",
                              border: "none",
                              width: 20,
                              height: 20,
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className="form-actions"
                  style={{ display: "flex", gap: 12, marginTop: 16 }}
                >
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Updating..." : "Update Document"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => navigate(-1)}
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

export default UpdateCompanyDocumentPage;
