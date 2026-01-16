import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";
import { getDepartments_employee_mgmnt } from "../../api/admin/departments";
import ProtectedAction from "../../components/admin/ProtectedAction";

import {
  getEmployeeMasterData,
  filterEmployeeMasterData,
  deleteEmployee,
  updateEmployee,
  exportEmployeesToExcel,
} from "../../api/admin/employees";

function EmployeeMasterDataPage() {
  const [addedBy, setAddedBy] = useState("");
  const [parentId, setParentId] = useState("");

  const handleExportExcel = async () => {
    try {
      const formData = new FormData();
      const userId = localStorage.getItem("user_id");

      formData.append("user_id", userId);

      if (addedBy) formData.append("added_by", addedBy);
      if (parentId) formData.append("parent_id", parentId);

      const blob = await exportEmployeesToExcel(formData);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "employees_export.xlsx";
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Excel export failed", err);
      alert("Failed to export Excel.");
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("employees");

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  /* ==============================
     LOAD DEPARTMENTS (MASTER DATA)
  ============================== */
  useEffect(() => {
    getDepartments_employee_mgmnt()
      .then((resp) => {
        // backend usually returns { departments: [...] }
        setDepartments(resp?.departments || []);
      })
      .catch(() => {
        console.error("Failed to load departments");
      });
  }, []);

  /* ==============================
     LOAD EMPLOYEES (INITIAL)
  ============================== */
  const loadEmployeeList = (pageNo = 1) => {
    setLoading(true);
    setError(null);

    getEmployeeMasterData({
      page: pageNo,
      page_size: pageSize,
    })
      .then((resp) => {
        setEmployees(resp?.users_data || []);
        setTotalCount(resp?.total_count || 0);
        setTotalPages(resp?.total_pages || 1);
      })
      .catch(() => {
        setError("Unable to load employee master data.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEmployeeList(1);
  }, []);

  /* ==============================
     FILTERING
  ============================== */
  useEffect(() => {
    setPage(1);

    if (!searchTerm && !filterDepartment && !filterStatus) {
      loadEmployeeList(1);
      return;
    }

    setLoading(true);

    filterEmployeeMasterData({
      search: searchTerm,
      department: filterDepartment,
      is_active: filterStatus,
      page: 1,
      page_size: pageSize,
    })
      .then((resp) => {
        setEmployees(resp?.users_data || []);
        setTotalCount(resp?.total_count || 0);
        setTotalPages(resp?.total_pages || 1);
      })
      .catch(() => {
        setError("Unable to filter employee data.");
      })
      .finally(() => setLoading(false));
  }, [searchTerm, filterDepartment, filterStatus]);

  /* ==============================
     PAGINATION
  ============================== */
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;

    setPage(newPage);
    setLoading(true);

    const payload = {
      search: searchTerm,
      department: filterDepartment,
      is_active: filterStatus,
      page: newPage,
      page_size: pageSize,
    };

    const apiCall =
      !searchTerm && !filterDepartment && !filterStatus
        ? getEmployeeMasterData(payload)
        : filterEmployeeMasterData(payload);

    apiCall
      .then((resp) => {
        setEmployees(resp?.users_data || []);
        setTotalCount(resp?.total_count || 0);
        setTotalPages(resp?.total_pages || 1);
      })
      .finally(() => setLoading(false));
  };

  /* ==============================
     HELPERS
  ============================== */
  const getStatusClassName = (isActive) =>
    isActive ? "status-pill status-active" : "status-pill status-inactive";

  const handleAddEmployee = () => {
    navigate("/admin/add-employee");
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterStatus("");
    setPage(1);
    loadEmployeeList(1);
  };

  const startRow = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, totalCount);

  /* ==============================
     RENDER
  ============================== */
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setEmployeeToDelete(null);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError("");

    try {
      await deleteEmployee(employeeToDelete.id);
      closeDeleteModal();
      loadEmployeeList(page);
    } catch (err) {
      setDeleteError("Failed to delete employee.");
    } finally {
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

        <div
          className="page-title"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3>Employee Master Data</h3>
            <p className="subtitle">
              View, filter and manage all employee records.
            </p>
          </div>

          <button className="btn btn-success" onClick={handleExportExcel}>
            <i className="fa-solid fa-file-excel"></i> Export Excel
          </button>
        </div>

        {/* FILTERS */}
        <div className="filters-container">
          <div className="filters-left">
            <div className="search-input">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* ✅ ALL DEPARTMENTS */}
            <select
              className="filter-select"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <button className="btn btn-ghost" onClick={handleClearFilters}>
            <i className="fa-solid fa-filter-circle-xmark" /> Clear Filters
          </button>

          <ProtectedAction
            module="employee"
            action="add"
            onAllowed={handleAddEmployee}
            className="btn btn-primary"
          >
            <i className="fa-solid fa-user-plus" /> Add Employee
          </ProtectedAction>
        </div>

        {/* TABLE */}
        <div className="table-container">
          <div className="table-header-bar">
            <h4>
              Employee List{" "}
              <span className="badge-pill">Total: {totalCount}</span>
            </h4>
          </div>

          {loading ? (
            <div style={{ padding: "1rem" }}>Loading employees...</div>
          ) : error ? (
            <div style={{ padding: "1rem", color: "orange" }}>{error}</div>
          ) : (
            <>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: "5%" }}>Order No</th>
                      <th style={{ width: "5%" }}>Employee ID</th>
                      <th style={{ width: "15%" }}>Name</th>
                      <th style={{ width: "10%" }}>Email</th>
                      <th style={{ width: "10%" }}>Department</th>
                      <th style={{ width: "10%" }}>Designation</th>
                      <th style={{ width: "15%" }}>Location</th>
                      <th style={{ width: "5%" }}>Status</th>
                      <th style={{ width: "10%" }}>Joining Date</th>
                      <th style={{ width: "10%" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, index) => (
                      <tr key={emp.id}>
                        <td>{(page - 1) * pageSize + index + 1}</td>
                        <td>{emp.employee_id}</td>
                        <td>{emp.name}</td>
                        <td>{emp.official_email}</td>
                        <td>{emp.department || "-"}</td>
                        <td>{emp.designation || "-"}</td>
                        <td>{emp.work_location || "-"}</td>
                        <td>
                          <span className={getStatusClassName(emp.is_active)}>
                            ● {emp.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td>
                          {" "}
                          {emp.joining_date
                            ? new Date(emp.joining_date).toLocaleDateString(
                                "en-GB"
                              )
                            : "-"}{" "}
                        </td>
                        <td>
                          {" "}
                          <div class="table-actions">
                           <ProtectedAction
  module="employee"
  action="view"
  to={`/admin/employee-profile/${emp.id}`}
  className="icon-btn view"
  title="View Details"
>
  <i className="fa-solid fa-eye"></i>
</ProtectedAction>


                            <ProtectedAction
                              module="employee"
                              action="update"
                              to={`/admin/update-employee-profile/${emp.id}`}
                              className="icon-btn edit"
                              title="Edit Employment"
                            >
                              <i className="fa-solid fa-pen"></i>
                            </ProtectedAction>

                            <ProtectedAction
                              module="employee"
                              action="delete"
                              onAllowed={() => {
                                setEmployeeToDelete(emp);
                                setShowDeleteModal(true);
                              }}
                              className="icon-btn delete"
                              title="Delete Employment Record"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </ProtectedAction>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {employees.length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ textAlign: "center" }}>
                          No employees found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="table-footer">
                <div id="tableInfo">
                  Showing {startRow} to {endRow} of {totalCount} employees
                </div>

                <div className="pagination">
                  {/* Previous */}
                  <button
                    disabled={page === 1}
                    title="Previous page"
                    onClick={() => handlePageChange(page - 1)}
                  >
                    <i className="fa-solid fa-angle-left"></i>
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        className={p === page ? "active-page" : ""}
                        onClick={() => handlePageChange(p)}
                        disabled={p === page}
                      >
                        {p}
                      </button>
                    )
                  )}

                  {/* Next */}
                  <button
                    disabled={page === totalPages}
                    title="Next page"
                    onClick={() => handlePageChange(page + 1)}
                  >
                    <i className="fa-solid fa-angle-right"></i>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      {showDeleteModal && (
        <div className="modal-backdrop" style={backdropStyle}>
          <div className="modal" style={modalStyle}>
            <h3>Confirm delete</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{employeeToDelete?.name}</strong>?
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

export default EmployeeMasterDataPage;
