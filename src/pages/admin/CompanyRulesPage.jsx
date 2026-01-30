// src/pages/admin/CompanyRulesPage.jsx
import React, { useState, useMemo, useEffect } from "react";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";

import LoaderOverlay from "../../components/common/LoaderOverlay";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

import "../../assets/styles/admin.css";

import {
  listCompanyRules ,
  deleteCompanyRule as apiDeleteCompanyRule,
} from "../../api/admin/company_rules";

import ProtectedAction from "../../components/admin/ProtectedAction";

function CompanyRulesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [searchTerm, setSearchTerm] = useState("");
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [previewImage, setPreviewImage] = useState(null);

  // delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Error modal
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ===============================
      DOWNLOAD HELPER
  ================================ */
  const downloadFile = async (fileUrl, fileName = "company-rule") => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMessage("Unable to download file.");
      setShowErrorModal(true);
    }
  };

  /* ===============================
      LOAD RULES
  ================================ */
  const fetchRules = async () => {
    setLoading(true);
    setError(null);

    try {
      const resp = await listCompanyRules();

      let list = [];

      if (resp && Array.isArray(resp.rules)) list = resp.rules;
      else if (Array.isArray(resp)) list = resp;
      else if (Array.isArray(resp.results)) list = resp.results;
      else if (Array.isArray(resp.data)) list = resp.data;
      else if (resp && typeof resp === "object")
        list = resp.rules || resp.results || resp.items || resp.data || [];

      setRules(Array.isArray(list) ? list : []);
    } catch (err) {
      const status = err?.response?.status;
      const respData = err?.response?.data;

      setError(
        respData?.message ||
          respData?.detail ||
          (status
            ? `Unable to load company rules (status ${status})`
            : "Unable to load company rules."),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  /* ===============================
      FILTER RULES
  ================================ */
  const filteredRules = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return rules;
    return rules.filter((r) => (r.title || "").toLowerCase().includes(term));
  }, [searchTerm, rules]);

  const totalCount = rules.length;
  const visibleCount = filteredRules.length;

  /* ===============================
      DELETE RULE
  ================================ */
  const openDeleteModal = (rule) => {
    setRuleToDelete(rule);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setShowDeleteModal(false);
    setRuleToDelete(null);
    setDeleting(false);
  };

  const confirmDelete = async () => {
    if (!ruleToDelete) return;

    setDeleting(true);

    try {
      await apiDeleteCompanyRule(ruleToDelete.id);

      setRules((prev) => prev.filter((r) => r.id !== ruleToDelete.id));
      closeDeleteModal();

      // Show success modal
      setSuccessMessage("Company rule deleted successfully.");
      setShowSuccessModal(true);
    } catch (err) {
      setDeleting(false);

      const backendMsg = err?.response?.data?.message;
      setErrorMessage(backendMsg || "Unable to delete company rule.");
      setShowErrorModal(true);
    }
  };

  /* ===============================
      UI
  ================================ */
  return (
    <>
      {/* DELETE LOADER */}
      {deleting && <LoaderOverlay />}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
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

          {/* TITLE */}
          <div className="page-title">
            <h3>Company Rules</h3>
            <p className="subtitle">Manage company rules easily.</p>
          </div>

          {/* FILTERS */}
          <div className="filters-container">
            <div className="filters-left">
              <div className="search-input">
                <i className="fa-solid fa-magnifying-glass" />
                <input
                  type="text"
                  placeholder="Search by rule..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {loading && <span style={{ marginLeft: 12 }}>Loading...</span>}
              {error && (
                <span style={{ marginLeft: 12, color: "orange" }}>{error}</span>
              )}
            </div>

            <div className="filters-right" style={{ display: "flex", gap: 8 }}>
              <button className="btn" onClick={fetchRules} disabled={loading}>
                <i className="fa-solid fa-rotate" /> Refresh
              </button>

              <ProtectedAction
                module="company rules"
                action="add"
                to="/admin/add-company-rule"
                className="btn btn-primary"
              >
                <i className="fa-solid fa-plus" /> Add Rule
              </ProtectedAction>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-container">
            <div className="table-header-bar">
              <h4>
                Company Rules{" "}
                <span className="badge-pill">Total: {visibleCount}</span>
              </h4>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Priority Order</th>
                    <th>Title</th>
                    <th>Short Description</th>
                    <th>Description</th>
                    <th>File</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRules.map((row, index) => {
                    const file = row.image;
                    const isImage =
                      file && /\.(jpg|jpeg|png|gif|webp)$/i.test(file);

                    return (
                      <tr key={row.id}>
                        <td style={{ textAlign: "center" }}>{index + 1}</td>
                        <td className="wrap">{row.priority_order}</td>
                        <td className="wrap">{row.title}</td>
                        <td className="wrap">{row.short_description || "-"}</td>
                        <td className="wrap">{row.description || "-"}</td>

                        <td>
                          {file ? (
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                className="icon-btn"
                                onClick={() =>
                                  isImage
                                    ? setPreviewImage(file)
                                    : window.open(file, "_blank")
                                }
                              >
                                <i className="fa-solid fa-eye" />
                              </button>

                              <button
                                className="icon-btn"
                                onClick={() =>
                                  downloadFile(
                                    file,
                                    row.title || "company-rule",
                                  )
                                }
                              >
                                <i className="fa-solid fa-download" />
                              </button>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td>
                          {row.created_at
                            ? new Date(row.created_at).toLocaleDateString()
                            : "-"}
                        </td>

                        <td>
                          {row.updated_at
                            ? new Date(row.updated_at).toLocaleDateString()
                            : "-"}
                        </td>

                        <td>
                          <div className="table-actions">
                            <ProtectedAction
                              module="company rules"
                              action="update"
                              to={`/admin/update-company-rule?id=${row.id}`}
                              className="icon-btn edit"
                            >
                              <i className="fa-solid fa-pen" />
                            </ProtectedAction>

                            <ProtectedAction
                              module="company rules"
                              action="delete"
                              onAllowed={() => openDeleteModal(row)}
                              className="icon-btn delete"
                            >
                              <i className="fa-solid fa-trash" />
                            </ProtectedAction>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {visibleCount === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        style={{ textAlign: "center", padding: 20 }}
                      >
                        {loading ? "Loading rules..." : "No rules found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              Showing {visibleCount} of {totalCount} rules
            </div>
          </div>
        </main>
      </div>

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div className="modal-overlay">
          <div className="modal-card">
            <img
              src={previewImage}
              alt="Preview"
              style={{
                width: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: 8,
              }}
            />

            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 12,
                justifyContent: "flex-end",
              }}
            >
              <button
                className="icon-btn"
                onClick={() => downloadFile(previewImage, "company-rule")}
              >
                <i className="fa-solid fa-download" />
              </button>

              <button className="btn" onClick={() => setPreviewImage(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        id="sidebarOverlay"
        className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      {/* DELETE MODAL */}
      {showDeleteModal && (
        <DeleteConfirmModal
          title="Delete Company Rule"
          message={`Are you sure you want to delete "${ruleToDelete?.title}"?`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={closeDeleteModal}
        />
      )}
    </>
  );
}

export default CompanyRulesPage;
