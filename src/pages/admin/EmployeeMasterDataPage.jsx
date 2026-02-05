import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";
import { getDepartments_employee_mgmnt } from "../../api/admin/departments";
import ProtectedAction from "../../components/admin/ProtectedAction";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import Pagination from "../../components/common/Pagination";

import {
  getEmployeeMasterData,
  filterEmployeeMasterData,
  deleteEmployee,
  exportEmployeesToExcel,
} from "../../api/admin/employees";

function EmployeeMasterDataPage() {
  const navigate = useNavigate();

  const [addedBy, setAddedBy] = useState("");
  const [parentId, setParentId] = useState("");

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
  const [pageSize, setPageSize] = useState(20);

  const [totalCount, setTotalCount] = useState(0);

  /* ==============================
     LOAD DEPARTMENTS
  ============================== */
  useEffect(() => {
    getDepartments_employee_mgmnt()
      .then((resp) => setDepartments(resp?.departments || []))
      .catch(() => console.error("Failed to load departments"));
  }, []);

  /* ==============================
     MAIN DATA FETCH (FIXED)
  ============================== */
  useEffect(() => {
    setLoading(true);
    setError(null);

    const payload = {
      search: searchTerm,
      department: filterDepartment,
      is_active: filterStatus,
      page,
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
      })
      .catch(() => setError("Unable to load employee data."))
      .finally(() => setLoading(false));
  }, [searchTerm, filterDepartment, filterStatus, page, pageSize]);

  /* ==============================
     HANDLERS (LOGIC ONLY)
  ============================== */
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterStatus("");
    setPage(1);
  };

  const handleAddEmployee = () => {
    navigate("/admin/add-employee");
  };

  const handleExportExcel = async () => {
    try {
      const formData = new FormData();
      formData.append("user_id", localStorage.getItem("user_id"));
      if (addedBy) formData.append("added_by", addedBy);
      if (parentId) formData.append("parent_id", parentId);

      const blob = await exportEmployeesToExcel(formData);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "employees_export.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to export Excel.");
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteEmployee(employeeToDelete.id);
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
      setPage(1);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusClassName = (isActive) =>
    isActive ? "status-pill status-active" : "status-pill status-inactive";

  /* ==============================
     RENDER (UNCHANGED)
  ============================== */
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

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3>Employee Master Data</h3>
            <p className="subtitle-master">
              View, filter and manage all employee records.
            </p>
          </div>

          {employees.length > 0 && (
            <button className="excel-btn" onClick={handleExportExcel}>
              <i className="fa-solid fa-file-excel"></i> Export Excel
            </button>
          )}
        </div>

        {/* FILTERS */}
        <div className="filters-container">
          <div className="filters-left">
            <div className="search-input">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <select
              className="filter-select"
              value={filterDepartment}
              onChange={(e) => {
                setFilterDepartment(e.target.value);
                setPage(1);
              }}
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
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
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
              Employee List <span className="badge-pill">Total: {totalCount}</span>
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
                  {/* 🔴 table markup unchanged */}
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
                          {emp.joining_date
                            ? new Date(emp.joining_date).toLocaleDateString("en-GB")
                            : "-"}
                        </td>
                        <td>
                          <div className="table-actions">
                            <ProtectedAction
                              module="employee"
                              action="view"
                              to={`/admin/employee-profile/${emp.id}`}
                              className="icon-btn view"
                            >
                              <i className="fa-solid fa-eye" />
                            </ProtectedAction>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={page}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </div>
      </main>

      {showDeleteModal && (
        <DeleteConfirmModal
          title="Delete Employee"
          message={`Are you sure you want to delete ${employeeToDelete?.name}?`}
          loading={deleting}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

export default EmployeeMasterDataPage;
