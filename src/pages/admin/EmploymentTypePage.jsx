// src/pages/admin/EmploymentTypesPage.jsx
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
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

  // delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

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
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        (status
          ? `Unable to load employment types (status ${status})`
          : "Unable to load employment types.");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmploymentTypes();
  }, []);

  const filteredEmploymentTypes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return employmentTypes;
    return employmentTypes.filter((row) =>
      (row.name || "").toLowerCase().includes(term)
    );
  }, [searchTerm, employmentTypes]);

  const openDeleteModal = (row) => {
    setTypeToDelete(row);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTypeToDelete(null);
    setDeleting(false);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!typeToDelete) return;
    setDeleting(true);
    try {
      await apiDeleteEmploymentType(typeToDelete.id);
      setEmploymentTypes((prev) =>
        prev.filter((t) => t.id !== typeToDelete.id)
      );
      closeDeleteModal();
    } catch (err) {
      setDeleteError("Unable to delete Employment Type.");
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
          <h3>Employment Types</h3>
          <p className="subtitle">Manage employment types easily.</p>
        </div>

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
            {error && (
              <div style={{ marginLeft: 12, color: "orange" }}>{error}</div>
            )}
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
                          title="Edit Employment Type"
                        >
                          <i className="fa-solid fa-pen" />
                        </ProtectedAction>

                        <ProtectedAction
                          module="employment type"
                          action="delete"
                          onAllowed={() => openDeleteModal(row)}
                          className="icon-btn delete"
                          title="Delete Employment Type"
                        >
                          <i className="fa-solid fa-trash" />
                        </ProtectedAction>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredEmploymentTypes.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center" }}>
                      No Employment Types found.
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
              Delete Employment Type <strong>{typeToDelete?.name}</strong>?
            </p>

            {deleteError && (
              <div style={{ color: "orange" }}>{deleteError}</div>
            )}

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
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
};

export default EmploymentTypesPage;
