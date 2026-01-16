// src/pages/admin/CompanyRulesPage.jsx
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";
import {
  getCompanyRules as apiGetCompanyRules,
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

  // delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

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
      console.error("Download failed:", err);
      alert("Unable to download file.");
    }
  };

  /* ===============================
     LOAD RULES
  ================================ */
  const fetchRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await apiGetCompanyRules();

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
            : "Unable to load company rules.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===============================
     FRONTEND SEARCH
  ================================ */
  const filteredRules = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return rules;
    return rules.filter((r) => (r.title || "").toLowerCase().includes(term));
  }, [searchTerm, rules]);

  const totalCount = rules.length;
  const visibleCount = filteredRules.length;

  /* ===============================
     DELETE
  ================================ */
  const openDeleteModal = (rule) => {
    setRuleToDelete(rule);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setRuleToDelete(null);
    setDeleting(false);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!ruleToDelete) return;
    setDeleting(true);

    try {
      await apiDeleteCompanyRule(ruleToDelete.id);
      setRules((prev) => prev.filter((r) => r.id !== ruleToDelete.id));
      closeDeleteModal();
    } catch (err) {
      setDeleteError("Unable to delete company rule.");
      setDeleting(false);
    }
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
        <Header onMenuClick={() => setIsSidebarOpen((p) => !p)} />

        <div className="the_line" />

        <div className="page-title">
          <h3>Company Rules</h3>
          <p className="subtitle">Manage company rules easily.</p>
        </div>

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

            {loading && (
              <div style={{ marginLeft: 12, fontSize: 13 }}>Loading...</div>
            )}
            {error && (
              <div style={{ marginLeft: 12, fontSize: 13, color: "orange" }}>
                {error}
              </div>
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
                  <th style={{ width: "5%" }}>Order No</th>
                  <th style={{ width: "15%" }}>Title</th>
                  <th style={{ width: "15%" }}>Short Description</th>
                  <th style={{ width: "30%" }}>Description</th>
                  <th style={{ width: "5%" }}>File</th>
                  <th style={{ width: "10%" }}>Created</th>
                  <th style={{ width: "10%" }}>Updated</th>
                  <th style={{ width: "10%" }}>Actions</th>
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
                      <td className="wrap">{row.title}</td>
                      <td className="wrap">{row.short_description || "-"}</td>
                      <td className="wrap">{row.description || "-"}</td>

                      <td>
                        {file ? (
                          <div style={{ display: "flex", gap: 8 }}>
                            {/* VIEW */}
                            <button
                              className="icon-btn"
                              title="View"
                              onClick={() =>
                                isImage
                                  ? setPreviewImage(file)
                                  : window.open(file, "_blank")
                              }
                            >
                              <i className="fa-solid fa-eye" />
                            </button>

                            {/* DOWNLOAD */}
                            <button
                              className="icon-btn"
                              title="Download"
                              onClick={() =>
                                downloadFile(file, row.title || "company-rule")
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
                            title="Edit Rule"
                          >
                            <i className="fa-solid fa-pen" />
                          </ProtectedAction>

                          <ProtectedAction
                            module="company rules"
                            action="delete"
                            onAllowed={() => openDeleteModal(row)}
                            className="icon-btn delete"
                            title="Delete Rule"
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
                      colSpan={7}
                      style={{ textAlign: "center", padding: "1.5rem" }}
                    >
                      {loading
                        ? "Loading company rules..."
                        : "No company rules found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            Showing {visibleCount} of {totalCount} company rules
          </div>
        </div>
      </main>

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div className="modal-backdrop" style={backdropStyle}>
          <div style={previewModalStyle}>
            <img
              src={previewImage}
              alt="Rule preview"
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 12,
              }}
            >
              <button
                className="icon-btn"
                title="Download"
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

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="modal-backdrop" style={backdropStyle}>
          <div style={modalStyle}>
            <h3>Confirm delete</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong className="modal-title-wrap">
                {ruleToDelete?.title}
              </strong>
              ?
            </p>

            {deleteError && (
              <div style={{ color: "orange", marginBottom: 8 }}>
                {deleteError}
              </div>
            )}

            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button className="btn" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===============================
   STYLES
================================ */
const backdropStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
};

const previewModalStyle = {
  background: "#fff",
  padding: 16,
  borderRadius: 8,
  maxWidth: "95%",
};

const modalStyle = {
  background: "#fff",
  padding: "1.25rem",
  borderRadius: 8,
  width: 420,
};

export default CompanyRulesPage;
