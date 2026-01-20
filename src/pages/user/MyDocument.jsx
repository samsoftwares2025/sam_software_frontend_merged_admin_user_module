import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/user.css";
import { getMyDocuments } from "../../api/user/mydocument";

/* ✅ STATIC DOCUMENT TYPES */
const DOCUMENT_TYPES = [
  "All",
  "Passport",
  "National ID",
  "Driving License",
  "Visa",
  "Work Permit",
  "Contract",
  "Offer Letter",
  "Other",
];

const MyDocument = () => {
  /* ===== SIDEBAR STATE ===== */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [selectedType, setSelectedType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetched = useRef(false);

  /* ✅ FETCH DOCUMENTS */
  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const fetchDocuments = async () => {
      try {
        const res = await getMyDocuments();

        if (!res || res.success !== true) {
          throw new Error(res?.message || "Failed to load documents");
        }

        setDocuments(Array.isArray(res.documents) ? res.documents : []);
      } catch (err) {
        setError(err?.message || "Something went wrong while loading documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  /* ✅ DOWNLOAD HELPER */
  const downloadFile = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const filename = url.split("/").pop() || "document";

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      alert("Unable to download file");
    }
  };

  /* ✅ FILTER LOGIC */
  const filteredDocuments =
    selectedType === "All"
      ? documents
      : documents.filter(
          (doc) =>
            doc.document_type?.toLowerCase() ===
            selectedType.toLowerCase()
        );

  const verifiedCount = documents.filter(
    (doc) => doc.status === "Verified"
  ).length;

  if (loading) return <main className="main">Loading documents...</main>;
  if (error) return <main className="main">{error}</main>;

  return (
    <div className="container">
      {/* ===== SIDEBAR ===== */}
      <Sidebar
        sidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(false)}
      />

      {/* ===== MAIN ===== */}
      <main className="main" role="main">
        <Header
          sidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((p) => !p)}
        />

        {/* SUMMARY */}
        <section className="top-grid">
          <div className="card">
            <h3>DOCUMENTS</h3>
            <div className="card-amount-row">
              <div>
                <div className="small">Total documents</div>
                <div className="big">{documents.length}</div>
                <div className="sub">HR, KYC, Payroll & Legal</div>
              </div>
              <div className="mini-wrap">
                <i className="fa-solid fa-folder-open fa-2x" />
              </div>
            </div>
          </div>

          <div className="card">
            <h3>STATUS</h3>
            <div className="card-amount-row">
              <div>
                <div className="small">Verified</div>
                <div className="big">{verifiedCount}</div>
                <div className="sub">Approved documents</div>
              </div>
              <div className="mini-wrap">
                <i className="fa-solid fa-circle-check fa-2x" />
              </div>
            </div>
          </div>
        </section>

        {/* DOCUMENT LIST */}
        <section className="card doc-section">
          <div className="doc-header">
            <div>
              <h3 className="info-title">My Documents</h3>
              <p className="doc-subtitle">
                These documents are securely stored by HR.
              </p>
            </div>
          </div>

          {/* FILTER */}
          <div className="doc-filter">
            <label className="small">Filter by document type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="doc-filter-select"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {filteredDocuments.length === 0 ? (
            <p className="small">No documents found.</p>
          ) : (
            <div className="doc-table">
              <div className="doc-row doc-row-head">
                <div className="doc-col name">Document</div>
                <div className="doc-col number">Document No</div>
                <div className="doc-col type">Country</div>
                <div className="doc-col date">Issue Date</div>
                <div className="doc-col date">Expiry Date</div>
                <div className="doc-col status">Status</div>
                <div className="doc-col note">Note</div>
                <div className="doc-col actions">Actions</div>
              </div>

              {filteredDocuments.map((doc) => {
                const fileUrl = doc?.images?.[0]?.url;

                return (
                  <div className="doc-row" key={doc.document_id || doc.id}>
                    <div className="doc-col name">
                      <span className="doc-name">
                        {doc.document_type || "-"}
                      </span>
                    </div>

                    <div className="doc-col number">
                      {doc.document_number || "-"}
                    </div>

                    <div className="doc-col type">
                      {doc.country || "-"}
                    </div>

                    <div className="doc-col date">
                      {doc.issue_date
                        ? new Date(doc.issue_date).toLocaleDateString()
                        : "-"}
                    </div>

                    <div className="doc-col date">
                      {doc.expiry_date
                        ? new Date(doc.expiry_date).toLocaleDateString()
                        : "-"}
                    </div>

                    <div className="doc-col status">
                      <span
                        className={`doc-status ${
                          doc.status === "Verified"
                            ? "verified"
                            : doc.status === "Active"
                            ? "active"
                            : "pending"
                        }`}
                      >
                        {doc.status || "Pending"}
                      </span>
                    </div>

                    <div className="doc-col note">
                      {doc.note || "-"}
                    </div>

                    <div className="doc-col actions">
                      {fileUrl ? (
                        <>
                          <button
                            type="button"
                            className="doc-action-btn"
                            onClick={() => window.open(fileUrl, "_blank")}
                          >
                            <i className="fa-regular fa-eye" /> View
                          </button>

                          <button
                            type="button"
                            className="doc-action-btn"
                            onClick={() => downloadFile(fileUrl)}
                          >
                            <i className="fa-solid fa-download" /> Download
                          </button>
                        </>
                      ) : (
                        <span className="small">No file</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ===== OVERLAY ===== */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay show"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MyDocument;
