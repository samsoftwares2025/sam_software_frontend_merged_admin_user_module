// src/pages/admin/PoliciesPage.jsx
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";
import {
  getPolicies as apiGetPolicies,
  deletePolicy as apiDeletePolicy,
} from "../../api/admin/policies";
import ProtectedAction from "../../components/admin/ProtectedAction";

function PoliciesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [searchTerm, setSearchTerm] = useState("");
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [previewImage, setPreviewImage] = useState(null);

  // delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  /* ===============================
     DOWNLOAD HELPER
  ================================ */
  const downloadFile = async (fileUrl, fileName = "policy") => {
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
     LOAD POLICIES
  ================================ */
  const fetchPolicies = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await apiGetPolicies();

      let list = [];
      if (resp && Array.isArray(resp.policies)) list = resp.policies;
      else if (Array.isArray(resp)) list = resp;
      else if (Array.isArray(resp.results)) list = resp.results;
      else if (Array.isArray(resp.data)) list = resp.data;
      else if (resp && typeof resp === "object")
        list = resp.policies || resp.results || resp.items || resp.data || [];

      setPolicies(Array.isArray(list) ? list : []);
    } catch (err) {
      const status = err?.response?.status;
      const respData = err?.response?.data;
      setError(
        respData?.message ||
          respData?.detail ||
          (status
            ? `Unable to load policies (status ${status})`
            : "Unable to load policies.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===============================
     FILTERING
  ================================ */
  const filteredPolicies = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return policies;
    return policies.filter((p) => (p.title || "").toLowerCase().includes(term));
  }, [searchTerm, policies]);

  const totalCount = policies.length;
  const visibleCount = filteredPolicies.length;

  /* ===============================
     DELETE
  ================================ */
  const openDeleteModal = (policy) => {
    setPolicyToDelete(policy);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPolicyToDelete(null);
    setDeleting(false);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!policyToDelete) return;
    setDeleting(true);

    try {
      await apiDeletePolicy(policyToDelete.id);
      setPolicies((prev) => prev.filter((p) => p.id !== policyToDelete.id));
      closeDeleteModal();
    } catch (err) {
      setDeleteError("Unable to delete policy.");
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
          <h3>Policies</h3>
          <p className="subtitle">Manage company policies easily.</p>
        </div>

        <div className="filters-container">
          <div className="filters-left">
            <div className="search-input">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                type="text"
                placeholder="Search by policy..."
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
            <button className="btn" onClick={fetchPolicies} disabled={loading}>
              <i className="fa-solid fa-rotate" /> Refresh
            </button>

            <ProtectedAction
              module="policies"
              action="add"
              to="/admin/add-policy"
              className="btn btn-primary"
            >
              <i className="fa-solid fa-plus" /> Add Policy
            </ProtectedAction>
          </div>
        </div>

        <div className="table-container">
          <div className="table-header-bar">
            <h4>
              Policies <span className="badge-pill">Total: {visibleCount}</span>
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
                {filteredPolicies.map((row, index) => {
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
                                downloadFile(file, row.title || "policy")
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
                            module="policies"
                            action="update"
                            to={`/admin/update-policy?id=${row.id}`}
                            className="icon-btn edit"
                            title="Edit Policy"
                          >
                            <i className="fa-solid fa-pen" />
                          </ProtectedAction>

                          <ProtectedAction
                            module="policies"
                            action="delete"
                            onAllowed={(e) => {
                              e.stopPropagation();
                              openDeleteModal(row);
                            }}
                            className="icon-btn delete"
                            title="Delete Policy"
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
                      {loading ? "Loading policies..." : "No policies found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            Showing {visibleCount} of {totalCount} policies
          </div>
        </div>
      </main>

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div className="modal-backdrop" style={backdropStyle}>
          <div style={previewModalStyle}>
            <img
              src={previewImage}
              alt="Policy preview"
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
                onClick={() => downloadFile(previewImage, "policy-image")}
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
              <strong>{policyToDelete?.title}</strong>?
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

export default PoliciesPage;
