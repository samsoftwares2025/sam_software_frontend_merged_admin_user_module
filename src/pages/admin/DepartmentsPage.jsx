  // src/pages/admin/DepartmentsPage.jsx
  import React, { useState, useMemo, useEffect } from "react";
  import Sidebar from "../../components/common/Sidebar";
  import Header from "../../components/common/Header";
  import "../../assets/styles/admin.css";
  import {
    getDepartments as apiGetDepartments,
    deleteDepartment as apiDeleteDepartment,
  } from "../../api/admin/departments";

  /**
   * DepartmentsPage (API-only)
   * - Loads departments from API /companies/list-departments/ (POST with user_id)
   * - Provides delete with confirmation modal and server call
   */

  function DepartmentsPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [openSection, setOpenSection] = useState("organization");

    const [searchTerm, setSearchTerm] = useState("");
    const [departments, setDepartments] = useState([]); // empty initial list
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deptToDelete, setDeptToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    const fetchDepartments = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await apiGetDepartments();

        // Backend returns { success: true, departments: [...] }
        let list = [];
        if (resp && Array.isArray(resp.departments)) {
          list = resp.departments;
        } else if (Array.isArray(resp)) {
          // fallback if backend ever returns direct array
          list = resp;
        } else if (Array.isArray(resp.results)) {
          list = resp.results;
        } else if (Array.isArray(resp.data)) {
          list = resp.data;
        } else if (resp && typeof resp === "object") {
          list = resp.departments || resp.results || resp.items || resp.data || [];
        }

        if (!Array.isArray(list)) list = [];
        setDepartments(list);
      } catch (err) {
        console.error("Failed to load departments from API:", err);
        const status = err?.response?.status;
        const respData = err?.response?.data;
        const message =
          respData?.message ||
          respData?.detail ||
          (status ? `Unable to load departments (status ${status})` : "Unable to load departments from server.");
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchDepartments();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleMenuClick = () => setIsSidebarOpen((prev) => !prev);
    const handleOverlayClick = () => setIsSidebarOpen(false);

    const filteredDepartments = useMemo(() => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) return departments;
      return departments.filter((row) => (row.name || "").toLowerCase().includes(term));
    }, [searchTerm, departments]);

    const totalCount = departments.length;
    const visibleCount = filteredDepartments.length;

    // -> show modal and set selected dept
    const openDeleteModal = (dept) => {
      setDeptToDelete(dept);
      setDeleteError(null);
      setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
      setShowDeleteModal(false);
      setDeptToDelete(null);
      setDeleting(false);
      setDeleteError(null);
    };

    // -> perform delete network call
    const confirmDelete = async () => {
      if (!deptToDelete) return;
      setDeleting(true);
      setDeleteError(null);

      try {
        await apiDeleteDepartment(deptToDelete.id);

        // optimistically update local list (remove deleted department)
        setDepartments((prev) => prev.filter((d) => d.id !== deptToDelete.id));

        closeDeleteModal();
      } catch (err) {
        console.error("Delete failed:", err);
        const status = err?.response?.status;
        const respData = err?.response?.data;
        const message =
          respData?.message ||
          respData?.detail ||
          (status ? `Unable to delete (status ${status})` : "Unable to delete department.");
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
          <Header onMenuClick={handleMenuClick} />

          <div className="the_line" />

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

              {loading && <div style={{ marginLeft: 12, fontSize: 13 }}>Loading...</div>}
              {error && (
                <div style={{ marginLeft: 12, fontSize: 13, color: "orange" }}>{error}</div>
              )}
            </div>

            <div className="filters-right" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                className="btn"
                onClick={() => fetchDepartments()}
                disabled={loading}
                title="Refresh departments"
              >
                <i className="fa-solid fa-rotate" /> Refresh
              </button>

              <button
                className="btn btn-primary"
                id="addDeptBtn"
                onClick={() => (window.location.href = "/admin/add-department")}
              >
                <i className="fa-solid fa-plus" />
                Add Department
              </button>
            </div>
          </div>

          <div className="table-container">
            <div className="table-header-bar">
              <h4>
                Departments <span className="badge-pill">Total: {visibleCount}</span>
              </h4>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table" id="deptTable">
                <thead>
                  <tr>
                    <th style={{ width: "7%" }}>Order No</th>
                    <th style={{ width: "75%" }}>Department</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDepartments.map((row, index) => (
                    <tr key={row.id}>
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td>
                        <div className="wrap">{row.name}</div>
                      </td>

                      <td>
                        <div className="table-actions">
                        

                          <button
                            className="icon-btn edit"
                            title="Edit Department"
                            onClick={() =>
                              (window.location.href = `/admin/update-department?id=${row.id}`)
                            }
                          >
                            <i className="fa-solid fa-pen" />
                          </button>

                          <button
                            className="icon-btn delete"
                            title="Delete Department"
                            onClick={() => openDeleteModal(row)}
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {visibleCount === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", padding: "1.5rem" }}>
                        {loading ? "Loading departments..." : "No departments found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <div>
                Showing {visibleCount} of {totalCount} departments
              </div>
            </div>
          </div>
        </main>

        <div
          className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
          onClick={handleOverlayClick}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-backdrop" style={backdropStyle}>
            <div className="modal" style={modalStyle}>
              <h3>Confirm delete</h3>
              <p>
                Are you sure you want to delete the department{" "}
                <strong>{deptToDelete?.name}</strong>? This action cannot be undone.
              </p>

              {deleteError && <div style={{ color: "orange", marginBottom: 8 }}>{deleteError}</div>}

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                <button className="btn" onClick={closeDeleteModal} disabled={deleting}>
                  Cancel
                </button>

                <button
                  className="btn btn-danger"
                  onClick={confirmDelete}
                  disabled={deleting}
                  title="Delete permanently"
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

  /* simple inline styles for the modal: you can move to CSS file if you prefer */
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

  export default DepartmentsPage;
