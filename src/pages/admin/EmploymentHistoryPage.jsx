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

/* ===============================
   Client-side filters
================================ */
const applyClientSideFilters = (rows, search, department, type, status) => {
  return rows.filter((r) => {
    if (search) {
      const term = search.toLowerCase();
      const matches =
        r.name?.toLowerCase().includes(term) ||
        r.employee_id?.toLowerCase().includes(term) ||
        r.phone?.toLowerCase().includes(term);

      if (!matches) return false;
    }

    if (department && r.department !== department) return false;
    if (type && r.employment_type !== type) return false;
    if (status !== "" && String(r.is_active) !== status) return false;
    return true;
  });
};

function EmploymentHistoryPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("employees");

  const [masterHistory, setMasterHistory] = useState([]); // FULL DATA
  const [history, setHistory] = useState([]); // PAGINATED DATA
  const getStatusClassName = (isActive) =>
    isActive ? "status-pill status-active" : "status-pill status-inactive";
  const handleAddEmployee = () => {
    navigate("/admin/add-employee");
  };
  // master data
  const [departments, setDepartments] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);

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
  const activeFilter =
    filterStatus === "" ? "" : filterStatus === "true" ? true : false;

  const navigate = useNavigate();

  /* ===============================
     LOAD MASTER DATA
  ================================ */
  useEffect(() => {
    getDepartments_employee_mgmnt().then((resp) =>
      setDepartments(resp?.departments || [])
    );
    getEmployementTypes_employee_mgmnt().then((resp) =>
      setEmploymentTypes(resp?.employment_types || resp || [])
    );
  }, []);

  /* ===============================
     LOAD EMPLOYEE HISTORY (Full Data)
  ================================ */
  const loadAllData = () => {
    setLoading(true);
    setError(null);

    const filtersApplied =
      searchTerm || filterDepartment || filterType || filterStatus;

    const apiCall = filtersApplied
      ? filterEmployeeHistoryData({
          search: searchTerm,
          status: activeFilter,
          department: filterDepartment,
          employment_type: filterType,
          is_active: activeFilter,
          page: 1,
          page_size: 99999,
        })
      : getEmployeeHistoryData({
          page: 1,
          page_size: 99999,
        });

    Promise.resolve(apiCall)
      .then((resp) => {
        const allRows = resp?.users_data || [];
        setMasterHistory(allRows);
      })
      .catch(() => setError("Unable to load employment history."))
      .finally(() => setLoading(false));
  };

  // load full data once AND whenever filters change
  useEffect(() => {
    loadAllData();
  }, [searchTerm, filterDepartment, filterType, filterStatus]);

  /* ===============================
     FILTER + PAGINATE CLIENT-SIDE
  ================================ */
  useEffect(() => {
    let filtered = applyClientSideFilters(
      masterHistory,
      searchTerm,
      filterDepartment,
      filterType,
      filterStatus
    );

    setStatuses([...new Set(filtered.map((r) => r.status).filter(Boolean))]);

    setTotalCount(filtered.length);

    const pages = Math.ceil(filtered.length / pageSize);
    setTotalPages(pages || 1);

    if (page > pages) setPage(1);

    const start = (page - 1) * pageSize;
    setHistory(filtered.slice(start, start + pageSize));
  }, [
    masterHistory,
    searchTerm,
    filterDepartment,
    filterType,
    filterStatus,
    page,
  ]);

  /* ===============================
     PAGINATION
  ================================ */
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
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

        <div className="page-title">
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Employment Types</option>
              {employmentTypes.map((t, idx) => (
                <option key={t.id ?? idx} value={t.name ?? t}>
                  {t.name ?? t}
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

          <div className="filters-right">
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
            <div style={{ padding: "1rem" }}>Loading employment history...</div>
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
                    {history.map((row, index) => {
                      const orderNo = (page - 1) * pageSize + index + 1;

                      return (
                        <tr key={row.id}>
                          <td>{orderNo}</td>
                          <td>{row.employee_id}</td>
                          <td>{row.name}</td>
                          <td>{row.employment_type}</td>
                          <td>
                            <span className={getStatusClassName(row.is_active)}>
                              ● {row.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>{" "}
                          <td>
                            {row.joining_date
                              ? new Date(row.joining_date).toLocaleDateString(
                                  "en-GB"
                                )
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
                            <div className="table-actions">
                              <ProtectedAction
                                module="employee"
                                action="view"
                                to={`/admin/view-employment-history/${row.id}`}
                                className="icon-btn view"
                                title="View Employment History"
                              >
                                <i className="fa-solid fa-eye" />
                              </ProtectedAction>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {history.length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ textAlign: "center" }}>
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
      </main>
    </div>
  );
}

export default EmploymentHistoryPage;
