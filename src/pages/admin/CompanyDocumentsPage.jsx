import React, { useState, useEffect } from "react";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import LoaderOverlay from "../../components/common/LoaderOverlay";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";
import "../../assets/styles/admin.css";

// Assuming these API helpers exist in your project
import {
  listCompanyDocuments,
  deleteCompanyDocument,
} from "../../api/admin/company_documents";

import ProtectedAction from "../../components/admin/ProtectedAction";

function CompanyDocumentsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [expiredOnly, setExpiredOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ===============================
      LOAD DOCUMENTS
  ================================ */
  const fetchDocuments = async (pageNo = 1) => {
    setLoading(true);
    setError(null);
    const userId = localStorage.getItem("user_id");

    try {
      const payload = {
        user_id: userId,
        page: pageNo,
        page_size: 10,
        search: searchTerm,
        expired_only: expiredOnly,
      };

      const resp = await listCompanyDocuments(payload);

      if (resp.success) {
        setDocuments(resp.data || []);
        setPagination(resp.pagination || {});
        setPage(pageNo);
      } else {
        setError(resp.message || "Failed to load documents.");
      }
    } catch (err) {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(1);
  }, [searchTerm, expiredOnly]); // Re-fetch when search or filter changes

  /* ===============================
      DELETE DOCUMENT
  ================================ */
  const handleDeleteClick = (doc) => {
    setDocToDelete(doc);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteCompanyDocument(docToDelete.document_id);
      setSuccessMessage("Document deleted successfully.");
      setShowSuccessModal(true);
      fetchDocuments(page);
    } catch (err) {
      setErrorMessage("Failed to delete document.");
      setShowErrorModal(true);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      {deleting && <LoaderOverlay />}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
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
            <h3>Company Documents</h3>
            <p className="subtitle">
              Track and manage official company documents and their expiry.
            </p>
          </div>

          <div className="filters-container">
            <div className="filters-left">
              <div className="search-input">
                <i className="fa-solid fa-magnifying-glass" />
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <label
                className="filter-checkbox"
                style={{
                  marginLeft: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <input
                  type="checkbox"
                  checked={expiredOnly}
                  onChange={(e) => setExpiredOnly(e.target.checked)}
                />
                <span style={{ fontSize: "14px" }}>Expired Only</span>
              </label>
            </div>

            <div className="filters-right">
              <ProtectedAction
                module="company documents"
                action="add"
                to="/admin/add-company-document"
                className="btn btn-primary"
              >
                <i className="fa-solid fa-plus" /> Add Document
              </ProtectedAction>
            </div>
          </div>

          <div className="table-container">
            <div className="table-header-bar">
              <h4>
                Document List{" "}
                <span className="badge-pill">
                  Total: {pagination.total_records || 0}
                </span>
              </h4>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order No</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Issue Date</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                {/* ... inside your table body mapping ... */}
                <tbody>
                  {documents.map((doc, index) => {
                    // Calculate the continuous order number
                    const orderNumber =
                      (pagination.current_page - 1) * pagination.page_size +
                      index +
                      1;

                    const isExpired =
                      doc.expiry_date && new Date(doc.expiry_date) < new Date();

                    return (
                      <tr key={doc.document_id}>
                        {/* Display the calculated Order Number instead of document_id */}
                        <td>{orderNumber}</td>

                        <td className="wrap">
                          <strong>{doc.title}</strong>
                        </td>
                        <td className="wrap">{doc.description || "-"}</td>
                        <td>{doc.issue_date || "-"}</td>
                        <td>
                          <span
                            style={{
                              color: isExpired ? "red" : "inherit",
                              fontWeight: isExpired ? "bold" : "normal",
                            }}
                          >
                            {doc.expiry_date || "-"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-pill ${isExpired ? "status-inactive" : "status-active"}`}
                          >
                            {isExpired ? "Expired" : "Valid"}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <ProtectedAction
                              module="company documents"
                              action="view"
                              to={`/admin/view-company-document?id=${doc.document_id}`}
                              className="icon-btn view"
                            >
                              <i className="fa-solid fa-eye" />
                            </ProtectedAction>
                            <ProtectedAction
                              module="company documents"
                              action="update"
                              to={`/admin/update-company-document?id=${doc.document_id}`}
                              className="icon-btn edit"
                            >
                              <i className="fa-solid fa-pen" />
                            </ProtectedAction>
                            <ProtectedAction
                              module="company documents"
                              action="delete"
                              onAllowed={() => handleDeleteClick(doc)}
                              className="icon-btn delete"
                            >
                              <i className="fa-solid fa-trash" />
                            </ProtectedAction>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {!loading && documents.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        No documents found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION UI */}
            {/* ... inside the return statement ... */}

            {/* TABLE FOOTER */}
            <div className="table-footer">
              <div id="tableInfo">
                Showing{" "}
                {pagination.total_records === 0
                  ? 0
                  : (pagination.current_page - 1) * pagination.page_size +
                    1}{" "}
                to{" "}
                {Math.min(
                  pagination.current_page * pagination.page_size,
                  pagination.total_records,
                )}{" "}
                of {pagination.total_records} documents
              </div>

              <div className="pagination">
                {/* Previous */}
                <button
                  disabled={!pagination.has_previous}
                  title="Previous page"
                  onClick={() => fetchDocuments(page - 1)}
                >
                  <i className="fa-solid fa-angle-left"></i>
                </button>

                {/* Page numbers */}
                {Array.from(
                  { length: pagination.total_pages || 0 },
                  (_, i) => i + 1,
                ).map((p) => (
                  <button
                    key={p}
                    className={
                      p === pagination.current_page ? "active-page" : ""
                    }
                    onClick={() => fetchDocuments(p)}
                    disabled={p === pagination.current_page}
                  >
                    {p}
                  </button>
                ))}

                {/* Next */}
                <button
                  disabled={!pagination.has_next}
                  title="Next page"
                  onClick={() => fetchDocuments(page + 1)}
                >
                  <i className="fa-solid fa-angle-right"></i>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showDeleteModal && (
        <DeleteConfirmModal
          title="Delete Document"
          message={`Are you sure you want to delete "${docToDelete?.title}"?`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}

export default CompanyDocumentsPage;
