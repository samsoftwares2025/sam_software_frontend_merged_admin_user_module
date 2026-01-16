// src/pages/admin/DesignationsPage.jsx
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";
import {
  getDesignations as apiGetDesignations,
  deleteDesignation as apiDeleteDesignation,
} from "../../api/admin/designations";

function DesignationsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [searchTerm, setSearchTerm] = useState("");
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [designationToDelete, setDesignationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchDesignations = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await apiGetDesignations();

      let list = [];
      if (Array.isArray(resp?.designations)) list = resp.designations;
      else if (Array.isArray(resp?.results)) list = resp.results;
      else if (Array.isArray(resp)) list = resp;

      setDesignations(list);
    } catch (err) {
      const status = err?.response?.status;
      const respData = err?.response?.data;
      const message =
        respData?.message ||
        respData?.detail ||
        (status
          ? `Unable to load designations (status ${status})`
          : "Unable to load designations.");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredDesignations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return designations;
    return designations.filter((d) =>
      (d.name || "").toLowerCase().includes(term)
    );
  }, [searchTerm, designations]);

  const openDeleteModal = (row) => {
    setDesignationToDelete(row);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDesignationToDelete(null);
    setDeleting(false);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!designationToDelete) return;
    setDeleting(true);
    try {
      await apiDeleteDesignation(designationToDelete.id);
      setDesignations((prev) =>
        prev.filter((d) => d.id !== designationToDelete.id)
      );
      closeDeleteModal();
    } catch (err) {
      const status = err?.response?.status;
      const respData = err?.response?.data;
      const message =
        respData?.message ||
        respData?.detail ||
        (status
          ? `Unable to delete (status ${status})`
          : "Unable to delete designation.");
      setDeleteError(message);
      setDeleting(false);
    }
  };

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
          <h3>Designations</h3>
          <p className="subtitle">Manage company designations easily.</p>
        </div>

        <div className="filters-container">
          <div className="filters-left">
            <div className="search-input">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                type="text"
                placeholder="Search by Designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading && <div style={{ marginLeft: 12 }}>Loading...</div>}
            {error && (
              <div style={{ marginLeft: 12, color: "orange" }}>{error}</div>
            )}
          </div>

          <div className="filters-right">
            <button
              className="btn"
              onClick={fetchDesignations}
              disabled={loading}
            >
              <i className="fa-solid fa-rotate" /> Refresh
            </button>

            <button
              className="btn btn-primary"
              onClick={() => (window.location.href = "/admin/add-Designation")}
            >
              <i className="fa-solid fa-plus" /> Add Designation
            </button>
          </div>
        </div>

        <div className="table-container">
          <div className="table-header-bar">
            <h4>
              Designations{" "}
              <span className="badge-pill">
                Total: {filteredDesignations.length}
              </span>
            </h4>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "5%" }}>Order No</th>
                  <th style={{ width: "40%" }}>Designation</th>
                  <th style={{ width: "40%" }}>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredDesignations.map((row, index) => (
                  <tr key={row.id}>
                    <td style={{ textAlign: "center" }}>{index + 1}</td>

                    <td>
                      <div className="wrap">{row.name}</div>
                    </td>

                    <td>
                      <div className="wrap">
                        {row.department_name || "—"}
                      </div>
                    </td>

                    <td>
                      <div className="table-actions">
                       

                        <button
                          className="icon-btn edit"
                          title="Edit"
                          onClick={() =>
                            (window.location.href = `/admin/update-Designation?id=${row.id}`)
                          }
                        >
                          <i className="fa-solid fa-pen" />
                        </button>

                        <button
                          className="icon-btn delete"
                          title="Delete"
                          onClick={() => openDeleteModal(row)}
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filteredDesignations.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      style={{ textAlign: "center", padding: 16 }}
                    >
                      No designations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <div className="modal-backdrop" style={backdropStyle}>
          <div className="modal" style={modalStyle}>
            <h3>Confirm delete</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{designationToDelete?.name}</strong>?
            </p>

            {deleteError && (
              <div style={{ color: "orange", marginBottom: 8 }}>
                {deleteError}
              </div>
            )}

            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                className="btn"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
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

const backdropStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
};

const modalStyle = {
  width: 420,
  background: "#fff",
  padding: "1.25rem",
  borderRadius: 8,
  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
};

export default DesignationsPage;
