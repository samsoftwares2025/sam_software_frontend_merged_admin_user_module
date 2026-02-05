import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import Pagination from "../../components/common/Pagination";
import "../../assets/styles/admin.css";
import ProtectedAction from "../../components/admin/ProtectedAction";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { getDepartments_employee_mgmnt } from "../../api/admin/departments";
import { getAllCountries } from "../../api/admin/locationApi";
import { selectStyles } from "../../utils/selectStyles";

import {
  getEmployeeDocuments,
  deleteEmployeeAllDocs,
  filterEmployeeDocuments,
} from "../../api/admin/employees";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function EmployeeDocumentsPage() {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [statuses] = useState(["Active", "Inactive"]);
  const [docTypes] = useState([
    { label: "Visa", value: "Visa" },
    { label: "License", value: "License" },
    { label: "Passport", value: "Passport" },
    { label: "National ID", value: "National Id" },
    { label: "Other", value: "other" },
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDocType, setFilterDocType] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20); 
  const [totalCount, setTotalCount] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load static lists once
  useEffect(() => {
    getDepartments_employee_mgmnt()
      .then((resp) => setDepartments(resp?.departments || []))
      .catch(() => console.error("Failed to load departments"));

    getAllCountries()
      .then((resp) => {
        const countriesArray = Array.isArray(resp) ? resp : resp?.countries || [];
        const formatted = countriesArray.map((c) => ({
          label: c.country_name,
          value: c.country_name,
        }));
        setCountryList(formatted);
      })
      .catch((err) => console.error("Failed to load countries", err));
  }, []);

  // Main Data Fetcher
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = userData.id;
    const NATIONAL_ID_TYPE_KEY = "id";

    try {
      let resp;
      const hasActiveFilters = 
        searchTerm || filterDepartment || filterStatus || 
        filterDocType || filterCountry || sortOrder;

      // Ensure we always pass the current pageSize to avoid backend defaults
      const payload = {
        page: page,
        page_size: pageSize, 
        national_id_type: NATIONAL_ID_TYPE_KEY,
      };

      if (hasActiveFilters) {
        resp = await filterEmployeeDocuments({
          page_size: pageSize, 
          
          user_id: currentUserId,
          search: searchTerm,
          status: filterStatus,
          department_id: filterDepartment,
          document_type: filterDocType,
          country: filterCountry,
          sort_by: sortOrder,
        });
      } else {
        resp = await getEmployeeDocuments(payload);
      }

      setEmployees(resp?.users || []);
      setTotalCount(resp?.total_count || 0);
    } catch (err) {
      setError("Unable to load document records.");
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterDepartment, filterStatus, filterDocType, filterCountry, sortOrder, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* HANDLERS */
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1); // Crucial: Reset to page 1 when size changes
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterStatus("");
    setFilterDocType("");
    setFilterCountry("");
    setSortOrder("");
    setPage(1);
    // Note: We do NOT reset pageSize here so the user's preference is kept
  };

  const toggleSort = () => {
    if (sortOrder === "") setSortOrder("asc");
    else if (sortOrder === "asc") setSortOrder("desc");
    else setSortOrder("");
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      setDeleting(true);
      await deleteEmployeeAllDocs(employeeToDelete.user_id);
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
      setPage(1);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete documents.");
    } finally {
      setDeleting(false);
    }
  };

  const getRowStyle = (expiryDateString) => {
    if (!expiryDateString) return {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(expiryDateString);
    expiryDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    if (expiryDate < today) return { color: "#d32f2f", fontWeight: "600" };
    if (diffDays <= 7) return { color: "#ed6c02", fontWeight: "600" };
    return {};
  };

  const getStatusStyle = (status) => ({
    color: status === "Active" ? "var(--success)" : "#dc2626",
    fontWeight: 600
  });

  const showDateColumns = filterDocType !== "";

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
          <h3>Employee Document Records</h3>
          <p className="subtitle">Track and manage visa, work permit and professional authorization.</p>
        </div>

        {/* FILTERS SECTION */}
        <div className="filters-container">
          <div className="filters-left">
            <div className="search-input">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              />
            </div>

            <div style={{ width: "220px", maxWidth: "100%" }}>
              <Select
                options={countryList}
                value={countryList.find((c) => c.value === filterCountry) || null}
                onChange={(opt) => { setFilterCountry(opt ? opt.value : ""); setPage(1); }}
                styles={selectStyles}
                placeholder="Nationality..."
                isClearable
                isSearchable
              />
            </div>

            <div style={{ width: "220px" }}>
              <select
                className="filter-select"
                value={filterDepartment}
                onChange={(e) => { setFilterDepartment(e.target.value); setPage(1); }}
                style={{ width: "100%", textOverflow: "ellipsis" }}
              >
                <option value="">All Departments</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <select className="filter-select" value={filterDocType} onChange={(e) => { setFilterDocType(e.target.value); setPage(1); }}>
              <option value="">All Document Types</option>
              {docTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            <select className="filter-select" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="filters-right">
            <button className="btn btn-ghost" onClick={handleClearFilters}>Clear Filters</button>
            <ProtectedAction
              module="employee" action="add"
              onAllowed={() => navigate("/admin/add-employee-documents")}
              className="btn btn-primary"
            >
              <i className="fa-solid fa-user-plus" /> Add Document
            </ProtectedAction>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="table-container">
          <div className="table-header-bar">
            <h4>Employee Document Records <span className="badge-pill">Total: {totalCount}</span></h4>
          </div>

          {loading ? (
            <div style={{ padding: "1rem" }}>Loading documents...</div>
          ) : error ? (
            <div style={{ padding: "1rem", color: "orange" }}>{error}</div>
          ) : (
            <>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Employee ID</th>
                      <th>National ID No</th>
                      <th onClick={toggleSort} style={{ cursor: "pointer", userSelect: "none", minWidth: "120px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          Name
                          {sortOrder === "asc" && <i className="fa-solid fa-arrow-down-a-z" style={{color: "var(--primary)"}}></i>}
                          {sortOrder === "desc" && <i className="fa-solid fa-arrow-down-z-a" style={{color: "var(--primary)"}}></i>}
                          {sortOrder === "" && <i className="fa-solid fa-sort" style={{ color: "#ccc" }}></i>}
                        </div>
                      </th>
                      <th>Nationality</th>
                      <th>Department</th>
                      <th>Designation</th>
                      {showDateColumns && <th>Document Type</th>}
                      {showDateColumns && <th>Issue Date</th>}
                      {showDateColumns && <th>Expiry Date</th>}
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, index) => (
                      <tr key={emp.user_id} style={showDateColumns ? getRowStyle(emp.expiry_date) : {}}>
                        <td>{(page - 1) * pageSize + index + 1}</td>
                        <td>{emp.employee_id}</td>
                        <td>{emp.national_id || "-"}</td>
                        <td>{emp.name}</td>
                        <td>{emp.nationality || "-"}</td>
                        <td>{emp.department}</td>
                        <td>{emp.designation}</td>
                        {showDateColumns && <td>{emp.document_type || "-"}</td>}
                        {showDateColumns && <td>{formatDate(emp.issue_date)}</td>}
                        {showDateColumns && <td>{formatDate(emp.expiry_date)}</td>}
                        <td><span style={getStatusStyle(emp.status)}>{emp.status}</span></td>
                        <td>
                          <div className="table-actions">
                            <ProtectedAction module="employee" action="view" to={`/admin/employee-documents-view/${emp.user_id}?type=${filterDocType}`} className="icon-btn view">
                              <i className="fa-solid fa-eye" />
                            </ProtectedAction>
                            <ProtectedAction module="employee" action="update" to={`/admin/update-employee-documents/${emp.user_id}`} className="icon-btn edit">
                              <i className="fa-solid fa-pen" />
                            </ProtectedAction>
                            <ProtectedAction module="employee" action="delete" onAllowed={() => { setEmployeeToDelete(emp); setShowDeleteModal(true); }} className="icon-btn delete">
                              <i className="fa-solid fa-trash" />
                            </ProtectedAction>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {employees.length === 0 && (
                      <tr><td colSpan={showDateColumns ? 12 : 9} style={{ textAlign: "center", padding: "2rem" }}>No records found.</td></tr>
                    )}
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

        {showDeleteModal && (
          <DeleteConfirmModal
            title="Delete Employee Documents"
            message={`Are you sure you want to delete ALL documents for ${employeeToDelete?.name}?`}
            loading={deleting}
            onConfirm={confirmDelete}
            onClose={() => setShowDeleteModal(false)}
          />
        )}
      </main>
      <div className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`} onClick={() => setIsSidebarOpen(false)} />
    </div>
  );
}

export default EmployeeDocumentsPage;