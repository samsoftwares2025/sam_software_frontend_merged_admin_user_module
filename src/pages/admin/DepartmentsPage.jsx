// src/pages/admin/DepartmentsPage.jsx
import React, { useState, useMemo, useEffect } from "react";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";

import LoaderOverlay from "../../components/common/LoaderOverlay";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

import "../../assets/styles/admin.css";

import {
  getDepartments as apiGetDepartments,
  deleteDepartment as apiDeleteDepartment,
} from "../../api/admin/departments";

function DepartmentsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [searchTerm, setSearchTerm] = useState("");
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);

  // Global error modal
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ===========================
     FETCH DEPARTMENTS
  ============================ */
  const fetchDepartments = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const resp = await apiGetDepartments();

      let list = [];
      if (Array.isArray(resp?.departments)) list = resp.departments;
      else if (Array.isArray(resp)) list = resp;
      else if (Array.isArray(resp?.results)) list = resp.results;
      else if (Array.isArray(resp?.data)) list = resp.data;

      setDepartments(Array.isArray(list) ? list : []);
    } catch (err) {
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Unable to load departments.";

      setErrorMessage(backendMsg);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  /* ===========================
     FILTER SEARCH
  ============================ */
  const filteredDepartments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return departments;
    return departments.filter((d) =>
      (d.name || "").toLowerCase().includes(term)
    );
  }, [searchTerm, departments]);

  /* ===========================
     DELETE MODAL ACTIONS
  ============================ */
  const openDeleteModal = (dept) => {
    setDeptToDelete(dept);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setShowDeleteModal(false);
    setDeptToDelete(null);
  };

  const confirmDelete = async () => {
    if (!deptToDelete) return;

    setDeleting(true);

    try {
      await apiDeleteDepartment(deptToDelete.id);

      // Remove deleted department
      setDepartments((prev) => prev.filter((d) => d.id !== deptToDelete.id));

      setDeleting(false);
      closeDeleteModal();

      setSuccessMessage("Department deleted successfully.");
      setShowSuccessModal(true);
    } catch (err) {
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Unable to delete department.";

      setDeleting(false);
      closeDeleteModal();
      setErrorMessage(backendMsg);
      setShowErrorModal(true);
    }
  };

  /* ===========================
     UI
  ============================ */
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
          <Header onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />


          <div className="page-title">
            <h3>Departments</h3>
            <p className="subtitle">Manage company departments easily.</p>
          </div>

          <div className="filters-container">
            <div className="filters-left">
              <div className="search-input">
                <i className="fa-solid fa-magnifying-glass" />
                <input
                  type="text"
                  placeholder="Search by department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {loading && <div style={{ marginLeft: 12 }}>Loading...</div>}
            </div>

            <div className="filters-right">
              <button className="btn" onClick={fetchDepartments}>
                <i className="fa-solid fa-rotate" /> Refresh
              </button>

              <button
                className="btn btn-primary"
                onClick={() =>
                  (window.location.href = "/admin/add-department")
                }
              >
                <i className="fa-solid fa-plus" /> Add Department
              </button>
            </div>
          </div>

          <div className="table-container">
            <div className="table-header-bar">
              <h4>
                Departments{" "}
                <span className="badge-pill">
                  Total: {filteredDepartments.length}
                </span>
              </h4>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "8%" }}>Order No</th>
                    <th style={{ width: "70%" }}>Department Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDepartments.length === 0 && !loading && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center" }}>
                        No departments found.
                      </td>
                    </tr>
                  )}

                  {filteredDepartments.map((row, index) => (
                    <tr key={row.id}>
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td>{row.name}</td>

                      <td>
                        <div className="table-actions">
                          <button
                            className="icon-btn edit"
                            onClick={() =>
                              (window.location.href =
                                `/admin/update-department?id=${row.id}`)
                            }
                          >
                            <i className="fa-solid fa-pen" />
                          </button>

                          <button
                            className="icon-btn delete"
                            onClick={() => openDeleteModal(row)}
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <div
          className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          title="Delete Department"
          message={`Are you sure you want to delete "${deptToDelete?.name}"?`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={closeDeleteModal}
        />
      )}
    </>
  );
}

export default DepartmentsPage;
