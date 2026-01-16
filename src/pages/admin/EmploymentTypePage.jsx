// src/pages/admin/EmploymentTypesPage.jsx
import React, { useState, useMemo, useEffect } from "react";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";

import LoaderOverlay from "../../components/common/LoaderOverlay";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

import "../../assets/styles/admin.css";

import {
  getEmployementTypes as apiGetEmploymentTypes,
  deleteEmployementType as apiDeleteEmploymentType,
} from "../../api/admin/employement_type";

import ProtectedAction from "../../components/admin/ProtectedAction";

function EmploymentTypesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [searchTerm, setSearchTerm] = useState("");
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  /* ================= LOAD LIST ================= */
  const fetchEmploymentTypes = async () => {
    setLoading(true);
    setError(null);

    try {
      const resp = await apiGetEmploymentTypes();

      let list = [];
      if (Array.isArray(resp?.employment_types)) list = resp.employment_types;
      else if (Array.isArray(resp)) list = resp;
      else if (Array.isArray(resp?.results)) list = resp.results;
      else if (Array.isArray(resp?.data)) list = resp.data;

      setEmploymentTypes(Array.isArray(list) ? list : []);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Unable to load employment types.";

      setError(message);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmploymentTypes();
  }, []);

  /* ================= FILTER ================= */
  const filteredEmploymentTypes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return employmentTypes;
    return employmentTypes.filter((row) =>
      (row.name || "").toLowerCase().includes(term)
    );
  }, [searchTerm, employmentTypes]);

  /* ================= DELETE ================= */
  const openDeleteModal = (row) => {
    setTypeToDelete(row);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTypeToDelete(null);
  };

  const confirmDelete = async () => {
    if (!typeToDelete) return;

    setDeleting(true);

    try {
      const resp = await apiDeleteEmploymentType(typeToDelete.id);

      // Update list
      setEmploymentTypes((prev) =>
        prev.filter((t) => t.id !== typeToDelete.id)
      );

      setDeleting(false);
      closeDeleteModal();

      setSuccessMessage("Employment Type deleted successfully.");
      setShowSuccessModal(true);
    } catch (err) {
      const backendMsg = err?.response?.data?.message;

      // stop loader
      setDeleting(false);

      // close delete modal
      closeDeleteModal();

      // show global error modal
      setError(backendMsg || "Unable to delete Employment Type.");
      setShowErrorModal(true);
    }
  };

  /* ================= UI ================= */
  return (
    <>
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
          message={error}
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

          <div className="the_line" />

          <div className="page-title">
            <h3>Employment Types</h3>
            <p className="subtitle">Manage employment types easily.</p>
          </div>

          {/* SEARCH + ACTIONS */}
          <div className="filters-container">
            <div className="filters-left">
              <div className="search-input">
                <i className="fa-solid fa-magnifying-glass" />
                <input
                  type="text"
                  placeholder="Search by Employment Type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {loading && <div style={{ marginLeft: 12 }}>Loading...</div>}
            </div>

            <div className="filters-right">
              <button className="btn" onClick={fetchEmploymentTypes}>
                <i className="fa-solid fa-rotate" /> Refresh
              </button>

              <ProtectedAction
                module="employment type"
                action="add"
                to="/admin/add-employment-type"
                className="btn btn-primary"
              >
                <i className="fa-solid fa-plus" /> Add Employment Type
              </ProtectedAction>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-container">
            <div className="table-header-bar">
              <h4>
                Employment Types{" "}
                <span className="badge-pill">
                  Total: {filteredEmploymentTypes.length}
                </span>
              </h4>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "10%" }}>Order No</th>
                    <th style={{ width: "50%" }}>Employment Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmploymentTypes.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center" }}>
                        No Employment Types found.
                      </td>
                    </tr>
                  )}

                  {filteredEmploymentTypes.map((row, index) => (
                    <tr key={row.id}>
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td className="wrap">{row.name}</td>

                      <td>
                        <div className="table-actions">
                          <ProtectedAction
                            module="employment type"
                            action="update"
                            to={`/admin/update-employment-type?id=${row.id}`}
                            className="icon-btn edit"
                          >
                            <i className="fa-solid fa-pen" />
                          </ProtectedAction>

                          <ProtectedAction
                            module="employment type"
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
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* DELETE CONFIRM MODAL */}
      {showDeleteModal && (
        <DeleteConfirmModal
          title="Delete Employment Type"
          message={`Are you sure you want to delete "${typeToDelete?.name}"?`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={closeDeleteModal}
        />
      )}
    </>
  );
}

export default EmploymentTypesPage;
