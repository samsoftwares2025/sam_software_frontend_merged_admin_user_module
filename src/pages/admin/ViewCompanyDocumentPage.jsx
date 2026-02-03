import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import LoaderOverlay from "../../components/common/LoaderOverlay";
import ErrorModal from "../../components/common/ErrorModal";
import "../../assets/styles/admin.css";

import { getCompanyDocumentById } from "../../api/admin/company_documents";

function ViewCompanyDocumentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const docId = searchParams.get("id");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState(null);

  // Modal State
  const [selectedImg, setSelectedImg] = useState(null);

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ==========================================================
        FETCH DATA
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
          setDocument(resp.data);
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
        DOWNLOAD HELPER
  =========================================================== */
  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "document";
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert("Failed to download file.");
    }
  };

  if (loading) return <LoaderOverlay />;

  return (
    <>
      {showError && (
        <ErrorModal
          message={errorMessage}
          onClose={() => {
            setShowError(false);
            navigate("/admin/company-documents");
          }}
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
            <h3>View Document Details</h3>
            <p className="subtitle">
              Review official company document information.
            </p>
          </div>

          <div className="card">
            {document && (
              <div
                className="view-details-container"
                style={{ padding: "1.5rem" }}
              >
                {/* INFO GRID */}
                <div className="form-grid" style={{ marginBottom: "2rem" }}>
                  <div className="form-group full-width">
                    <label
                      className="view-label"
                      style={{
                        fontWeight: "bold",
                        color: "#666",
                        fontSize: "12px",
                      }}
                    >
                      TITLE
                    </label>
                    <p style={{ fontSize: "18px", fontWeight: "600" }}>
                      {document.title}
                    </p>
                  </div>

                  <div className="form-group full-width">
                    <label
                      className="view-label"
                      style={{
                        fontWeight: "bold",
                        color: "#666",
                        fontSize: "12px",
                      }}
                    >
                      DESCRIPTION
                    </label>
                    <p style={{ color: "#444" }}>
                      {document.description || "No description provided."}
                    </p>
                  </div>

                  <div className="form-group">
                    <label
                      className="view-label"
                      style={{
                        fontWeight: "bold",
                        color: "#666",
                        fontSize: "12px",
                      }}
                    >
                      ISSUE DATE
                    </label>
                    <p>{document.issue_date || "N/A"}</p>
                  </div>

                  <div className="form-group">
                    <label
                      className="view-label"
                      style={{
                        fontWeight: "bold",
                        color: "#666",
                        fontSize: "12px",
                      }}
                    >
                      EXPIRY DATE
                    </label>
                    <p
                      style={{
                        color:
                          new Date(document.expiry_date) < new Date()
                            ? "red"
                            : "inherit",
                        fontWeight:
                          new Date(document.expiry_date) < new Date()
                            ? "bold"
                            : "normal",
                      }}
                    >
                      {document.expiry_date || "N/A"}
                      {new Date(document.expiry_date) < new Date() &&
                        " (Expired)"}
                    </p>
                  </div>
                </div>

                <hr
                  style={{
                    border: "0",
                    borderTop: "1px solid #eee",
                    marginBottom: "1.5rem",
                  }}
                />

                {/* ATTACHMENTS SECTION */}
                <div className="attachments-section">
                  <h4 style={{ marginBottom: "1rem" }}>
                    Attached Files ({document.images?.length || 0})
                  </h4>
                  <div
                    className="documents-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: "20px",
                    }}
                  >
                    {document.images && document.images.length > 0 ? (
                      document.images.map((img) => {
                        const isPdf = img.image_url
                          .toLowerCase()
                          .endsWith(".pdf");
                        return (
                          <div
                            key={img.image_id}
                            className="document-card"
                            style={{
                              border: "1px solid #ddd",
                              borderRadius: "8px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              className="doc-image-wrapper"
                              style={{
                                height: "140px",
                                position: "relative",
                                background: "#f5f5f5",
                              }}
                            >
                              {isPdf ? (
                                <div
                                  style={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <i
                                    className="fa-solid fa-file-pdf"
                                    style={{
                                      fontSize: "40px",
                                      color: "#e74c3c",
                                    }}
                                  ></i>
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      marginTop: "10px",
                                    }}
                                  >
                                    PDF Document
                                  </span>
                                </div>
                              ) : (
                                <img
                                  src={img.image_url}
                                  alt="Attachment"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              )}

                              {/* OVERLAY BUTTONS */}
                              <div className="doc-image-overlay">
                                <button
                                  className="doc-image-btn"
                                  title="View"
                                  onClick={() =>
                                    isPdf
                                      ? window.open(img.image_url, "_blank")
                                      : setSelectedImg(img.image_url)
                                  }
                                >
                                  <i className="fa-solid fa-eye" />
                                </button>
                                <button
                                  className="doc-image-btn"
                                  title="Download"
                                  onClick={() =>
                                    handleDownload(
                                      img.image_url,
                                      `${document.title}_file`,
                                    )
                                  }
                                >
                                  <i className="fa-solid fa-download" />
                                </button>
                              </div>
                            </div>
                            <div
                              style={{
                                padding: "10px",
                                fontSize: "12px",
                                textAlign: "center",
                                backgroundColor: "#fff",
                              }}
                            >
                              {isPdf ? "Company_Doc.pdf" : "Company_Image.png"}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p style={{ color: "#999", fontStyle: "italic" }}>
                        No files attached.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* IMAGE PREVIEW MODAL */}
      {selectedImg && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedImg(null)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.8)",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{ position: "relative", maxWidth: "90%", maxHeight: "90%" }}
          >
            <button
              onClick={() => setSelectedImg(null)}
              style={{
                position: "absolute",
                top: "-40px",
                right: "0",
                background: "none",
                border: "none",
                color: "white",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <img
              src={selectedImg}
              alt="Full Preview"
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "8px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default ViewCompanyDocumentPage;
