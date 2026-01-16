import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import "../../assets/styles/admin.css";

import { getEmployeeById } from "../../api/admin/employees";

function EmployeeDocumentsView() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);

  const { userId } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);

  /* ===============================
     LOAD EMPLOYEE + DOCUMENTS
  ================================ */
  useEffect(() => {
    if (!userId) {
      setError("Invalid employee reference.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    getEmployeeById(userId)
      .then((resp) => {
        setEmployee(resp?.employee || null);
        setDocuments(resp?.documents || []);
      })
      .catch(() => {
        setError("Unable to load employee documents");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  /* ===============================
     HELPERS
  ================================ */
  const getStatusStyle = (status) => {
    if (status === "Valid") return "status valid";
    if (status === "Expiring Soon") return "status warning";
    if (status === "Applied") return "status info";
    return "status muted";
  };

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className="container">
      <Sidebar
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        openSection={openSection}
        setOpenSection={setOpenSection}
      />

      <main className="main">
        <Header />

        <div className="page-title">
          <h3>Employee Documents</h3>
          <p className="subtitle">
            {employee
              ? `${employee.name} (${employee.employee_id})`
              : "Employee Details"}
          </p>
        </div>

        {/* STATES */}
        {loading && (
          <div className="loader" style={{ padding: "1rem" }}>
            Loading documents...
          </div>
        )}

        {!loading && error && (
          <div className="error" style={{ padding: "1rem", color: "orange" }}>
            {error}
          </div>
        )}

        {!loading && !error && documents.length === 0 && (
          <div className="empty-state" style={{ padding: "1rem" }}>
            No documents found.
          </div>
        )}

        {/* DOCUMENT CARDS */}
        {!loading && !error && documents.length > 0 && (
          <div className="documents-grid">
            {documents.map((doc) => (
              <div key={doc.document_id} className="document-card">
                <div className="doc-header">
                  <h4>{doc.document_type}</h4>
                  <span className={getStatusStyle(doc.status)}>
                    {doc.status || "N/A"}
                  </span>
                </div>

                <div className="doc-details">
                  <p>
                    <strong>Document No:</strong> {doc.document_number || "-"}
                  </p>
                  <p>
                    <strong>Country:</strong> {doc.country || "-"}
                  </p>
                  <p>
                    <strong>Issue Date:</strong>{" "}
                    {doc.issue_date
                      ? new Date(doc.issue_date).toLocaleDateString("en-GB")
                      : "-"}
                  </p>
                  <p>
                    <strong>Expiry Date:</strong>{" "}
                    {doc.expiry_date
                      ? new Date(doc.expiry_date).toLocaleDateString("en-GB")
                      : "-"}
                  </p>

                  {doc.note && (
                    <p className="doc-note">
                      <strong>Note:</strong> {doc.note}
                    </p>
                  )}
                </div>

                <div className="doc-images">
                  {doc.images && doc.images.length > 0 ? (
                    doc.images.map((img) => (
                      <div key={img.image_id} className="doc-image-wrapper">
                        <img src={img.url} alt="Document" />

                        <div className="doc-image-overlay">
                          <button
                            className="doc-image-btn"
                            title="View"
                            onClick={() => window.open(img.url, "_blank")}
                          >
                            <i className="fa-solid fa-eye" />
                          </button>

                          <button
                            className="doc-image-btn"
                            title="Download"
                            onClick={async () => {
                              const response = await fetch(img.url);
                              const blob = await response.blob();

                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.href = url;
                              link.download = img.file_name || "document";
                              document.body.appendChild(link);
                              link.click();

                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(url);
                            }}
                          >
                            <i className="fa-solid fa-download" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-images">No images uploaded</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default EmployeeDocumentsView;
