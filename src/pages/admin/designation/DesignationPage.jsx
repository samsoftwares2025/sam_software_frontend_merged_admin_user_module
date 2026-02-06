// src/pages/admin/DesignationsPage.jsx
import React, { useState, useMemo, useEffect } from "react";

import Sidebar from "../../../components/common/Sidebar";
import Header from "../../../components/common/Header";
import ProtectedAction from "../../../components/admin/ProtectedAction";

import LoaderOverlay from "../../../components/common/LoaderOverlay";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";
import SuccessModal from "../../../components/common/SuccessModal";
import ErrorModal from "../../../components/common/ErrorModal";

import "../../../assets/styles/admin.css";


import {
  listDesignations as listDesignations,
  deleteDesignation as apiDeleteDesignation,
} from "../../../api/admin/designations";

function DesignationsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [searchTerm, setSearchTerm] = useState("");
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Global error modal
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // DELETE modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [designationToDelete, setDesignationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  /* ==================== FETCH DESIGNATIONS ==================== */
  const fetchDesignations = async () => {
    setLoading(true);

    try {
      const resp = await listDesignations();

      let list = [];

      if (Array.isArray(resp?.designations)) list = resp.designations;
      else if (Array.isArray(resp?.results)) list = resp.results;
      else if (Array.isArray(resp)) list = resp;

      setDesignations(list);
    } catch (err) {
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Unable to load designations.";

      setErrorMessage(backendMsg);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  /* ==================== SEARCH FILTER ==================== */
  const filteredDesignations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return designations;

    return designations.filter((d) =>
      (d.name || "").toLowerCase().includes(term),
    );
  }, [searchTerm, designations]);

  /* ==================== DELETE ACTION ==================== */
  const openDeleteModal = (row) => {
    setDesignationToDelete(row);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setShowDeleteModal(false);
    setDesignationToDelete(null);
  };

  const confirmDelete = async () => {
    if (!designationToDelete) return;

    setDeleting(true);

    try {
      await apiDeleteDesignation(designationToDelete.id);

      setDesignations((prev) =>
        prev.filter((item) => item.id !== designationToDelete.id),
      );

      setDeleting(false);
      closeDeleteModal();

      setSuccessMessage("Designation deleted successfully.");
      setShowSuccessModal(true);
    } catch (err) {
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Unable to delete designation.";

      closeDeleteModal(); // close delete modal on failure
      setErrorMessage(backendMsg);
      setShowErrorModal(true);

      setDeleting(false);
    }
  };

  /* ==================== UI ==================== */
  return (
    <>
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

          <div className="page-title">
            <h3>Designations</h3>
            <p className="subtitle">Manage company designations easily.</p>
          </div>

          {/* SEARCH + ACTIONS */}
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
            </div>

            <div className="filters-right">
              <button className="btn" onClick={fetchDesignations}>
                <i className="fa-solid fa-rotate" /> Refresh
              </button>

              <ProtectedAction
                module="designation"
                action="add"
                to="/admin/add-Designation"
                className="btn btn-primary"
              >
                <i className="fa-solid fa-plus" /> Add Designation
              </ProtectedAction>
            </div>
          </div>

          {/* TABLE */}
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
                  {filteredDesignations.map((row, idx) => (
                    <tr key={row.id}>
                      <td style={{ textAlign: "center" }}>{idx + 1}</td>

                      <td>
                        <div className="wrap">{row.name}</div>
                      </td>

                      <td>
                        <div className="wrap">{row.department_name || "—"}</div>
                      </td>

                      <td>
                        <div className="table-actions">
                          <ProtectedAction
                            module="designation"
                            action="update"
                            to={`/admin/update-Designation?id=${row.id}`}
                            className="icon-btn edit"
                          >
                            <i className="fa-solid fa-pen" />
                          </ProtectedAction>
                          <ProtectedAction
                            module="designation"
                            action="delete"
                            onAllowed={() => openDeleteModal(row)}
                            className="icon-btn delete"
                          >
                            <i className="fa-solid fa-trash" />
                          </ProtectedAction>
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
      </div>
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      {/* DELETE CONFIRM MODAL */}
      {showDeleteModal && (
        <DeleteConfirmModal
          title="Delete Designation"
          message={`Are you sure you want to delete "${designationToDelete?.name}"?`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={closeDeleteModal}
        />
      )}
    </>
  );
}

export default DesignationsPage;
