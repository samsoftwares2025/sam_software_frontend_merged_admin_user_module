// src/pages/admin/PoliciesPage.jsx
import React, { useState, useMemo, useEffect } from "react";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";

import LoaderOverlay from "../../components/common/LoaderOverlay";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

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

  // delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // error modal
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      setErrorMessage("Unable to download file.");
      setShowErrorModal(true);
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

      if (resp.policies) list = resp.policies;
      else if (Array.isArray(resp)) list = resp;
      else if (resp.data) list = resp.data;
      else if (resp.results) list = resp.results;

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
  }, []);

  /* ===============================
      FILTERED POLICIES
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
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setShowDeleteModal(false);
    setPolicyToDelete(null);
  };

  const confirmDelete = async () => {
    if (!policyToDelete) return;

    setDeleting(true);

    try {
      await apiDeletePolicy(policyToDelete.id);

      setPolicies((prev) => prev.filter((p) => p.id !== policyToDelete.id));

      closeDeleteModal();

      setSuccessMessage("Policy deleted successfully.");
      setShowSuccessModal(true);
    } catch (err) {
      const respMsg = err?.response?.data?.message;
      setErrorMessage(respMsg || "Unable to delete policy.");
      setShowErrorModal(true);
      setDeleting(false);
    }
  };

  /* ===============================
      RENDER
  ================================ */
  return (
    <>
      {/* Loader while deleting */}
      {deleting && <LoaderOverlay />}

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {/* Error Modal */}
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
            <h3>Policies</h3>
            <p className="subtitle">Manage company policies easily.</p>
          </div>

          {/* Search + actions */}
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

          {/* TABLE */}
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
                    const isImage = file && /\.(jpg|jpeg|png|gif|webp)$/i.test(file);

                    return (
                      <tr key={row.id}>
                        <td style={{ textAlign: "center" }}>{index + 1}</td>
                        <td className="wrap">{row.title}</td>
                        <td className="wrap">{row.short_description || "-"}</td>
                        <td className="wrap">{row.description || "-"}</td>

                        <td>
                          {file ? (
                            <div style={{ display: "flex", gap: 8 }}>
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
                            >
                              <i className="fa-solid fa-pen" />
                            </ProtectedAction>

                            <ProtectedAction
                              module="policies"
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
                      <td colSpan={8} style={{ textAlign: "center", padding: "1.5rem" }}>
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
      </div>

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div className="modal-overlay">
          <div className="modal-card">
            <img
              src={previewImage}
              alt="Policy preview"
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
        <DeleteConfirmModal
          title="Delete Policy"
          message={`Are you sure you want to delete "${policyToDelete?.title}"?`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={closeDeleteModal}
        />
      )}
    </>
  );
}

export default PoliciesPage;
