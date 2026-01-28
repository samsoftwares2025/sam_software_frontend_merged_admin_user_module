import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";
import ProtectedAction from "../../components/admin/ProtectedAction";

import { getDepartments_employee_mgmnt } from "../../api/admin/departments";
import { getEmployementTypes_employee_mgmnt } from "../../api/admin/employement_type";
import {
  getEmployeeHistoryData,
  filterEmployeeHistoryData,
} from "../../api/admin/employees";

function EmploymentHistoryPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("employees");

  const [history, setHistory] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const getStatusClassName = (isActive) =>
    isActive ? "status-pill status-active" : "status-pill status-inactive";

  /* ===============================
     LOAD MASTER DATA
  ================================ */
  useEffect(() => {
    getDepartments_employee_mgmnt().then((resp) => {
      setDepartments(resp?.departments || []);
    });

    getEmployementTypes_employee_mgmnt().then((resp) => {
      setEmploymentTypes(resp?.employment_types || []);
    });
  }, []);

  /* ===============================
     LOAD EMPLOYMENT HISTORY
  ================================ */
  const loadHistory = (pageNo = 1) => {
    setLoading(true);
    setError(null);

    const normalizedStatus =
      filterStatus === ""
        ? ""
        : filterStatus === "true"
        ? true
        : false;

    const payload = {
      search: searchTerm || "",
      department_id: filterDepartment || "",
      employment_type_id: filterType || "",
      is_active: normalizedStatus,
      page: pageNo,
      page_size: pageSize,
    };

    const hasFilters =
      searchTerm || filterDepartment || filterType || filterStatus;

    const apiCall = hasFilters
      ? filterEmployeeHistoryData(payload)
      : getEmployeeHistoryData({
          page: pageNo,
          page_size: pageSize,
        });

    apiCall
      .then((resp) => {
        setHistory(resp?.users_data || []);
        setTotalCount(resp?.total_count || 0);
        setTotalPages(resp?.total_pages || 1);
      })
      .catch(() => {
        setError("Unable to load employment history.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  /* ===============================
     LOAD ON FILTER CHANGE
  ================================ */
  useEffect(() => {
    setPage(1);
    loadHistory(1);
  }, [searchTerm, filterDepartment, filterType, filterStatus]);

  /* ===============================
     PAGINATION
  ================================ */
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    loadHistory(newPage);
  };

  /* ===============================
     HELPERS
  ================================ */
  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterType("");
    setFilterStatus("");
    setPage(1);
    loadHistory(1);
  };

  const startRow = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, totalCount);

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

        <div className="page-title" >
          <h3>Employee Employment History</h3>
          <p className="subtitle">
            View and manage employment history records.
          </p>
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

            {/* Department */}
            <select
              className="filter-select"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            {/* Employment Type */}
            <select
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Employment Types</option>
              {employmentTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Status */}
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
        </div>

        {/* TABLE */}
        <div className="table-container">
          <div className="table-header-bar">
            <h4>
              Employment History{" "}
              <span className="badge-pill">Total: {totalCount}</span>
            </h4>
          </div>

          {loading ? (
            <div style={{ padding: "1rem" }}>
              Loading employment history...
            </div>
          ) : error ? (
            <div style={{ padding: "1rem", color: "orange" }}>{error}</div>
          ) : (
            <>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order No</th>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Employment Type</th>
                      <th>Status</th>
                      <th>Joining Date</th>
                      <th>Last Working Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {history.map((row, index) => (
                      <tr key={row.id}>
                        <td>{(page - 1) * pageSize + index + 1}</td>
                        <td>{row.employee_id}</td>
                        <td>{row.name}</td>
                        <td>{row.employment_type}</td>
                        <td>
                          <span
                            className={getStatusClassName(row.is_active)}
                          >
                            ● {row.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          {row.joining_date
                            ? new Date(
                                row.joining_date
                              ).toLocaleDateString("en-GB")
                            : "-"}
                        </td>
                        <td>
                          {row.last_working_date
                            ? new Date(
                                row.last_working_date
                              ).toLocaleDateString("en-GB")
                            : "-"}
                        </td>
                        <td>
                          <ProtectedAction
                            module="employee"
                            action="view"
                            to={`/admin/view-employment-history/${row.id}`}
                            className="icon-btn view"
                            title="View Employment History"
                          >
                            <i className="fa-solid fa-eye" />
                          </ProtectedAction>
                        </td>
                      </tr>
                    ))}

                    {history.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center" }}>
                          No employment records found.
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
                  <button
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    <i className="fa-solid fa-angle-left" />
                  </button>

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

                  <button
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    <i className="fa-solid fa-angle-right" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        
      <div
        id="sidebarOverlay"
        className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      </main>
    </div>
  );
}

export default EmploymentHistoryPage;
