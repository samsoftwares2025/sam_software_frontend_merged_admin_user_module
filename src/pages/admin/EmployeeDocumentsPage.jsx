import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";
import ProtectedAction from "../../components/admin/ProtectedAction";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { getDepartments_employee_mgmnt } from "../../api/admin/departments";
import {
  getEmployeeDocuments,
  deleteEmployeeAllDocs,
  filterEmployeeDocuments,
} from "../../api/admin/employees";

// Helper to format dates
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

  /* ===============================
      STATE MANAGEMENT
  ================================ */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("employees");

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [statuses] = useState(["Active", "Inactive"]);
  const [docTypes] = useState([
    { label: "Visa", value: "visa" },
    { label: "License", value: "license" },
    { label: "Passport", value: "passport" },
    { label: "National ID", value: "id" },
    { label: "Other", value: "other" },
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDocType, setFilterDocType] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ===============================
      INITIAL LOAD
  ================================ */
  useEffect(() => {
    getDepartments_employee_mgmnt()
      .then((resp) => setDepartments(resp?.departments || []))
      .catch(() => console.error("Failed to load departments"));
  }, []);

  /* ===============================
      MASTER DATA FETCHING
  ================================ */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const currentUserId = userData.id;

      try {
        let resp;
        const hasActiveFilters = searchTerm || filterDepartment || filterStatus || filterDocType;

        if (hasActiveFilters) {
          resp = await filterEmployeeDocuments({
            user_id: currentUserId,
            search: searchTerm,
            status: filterStatus,
            department_id: filterDepartment,
            document_type: filterDocType,
            page: page,
            page_size: pageSize,
          });
        } else {
          resp = await getEmployeeDocuments({ 
            page: page, 
            page_size: pageSize 
          });
        }

        setEmployees(resp?.users || []);
        setTotalCount(resp?.total_count || 0);
        setTotalPages(resp?.total_pages || 1);
      } catch (err) {
        setError("Unable to load document records.");
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm, filterDepartment, filterStatus, filterDocType, page]);

  /* ===============================
      EVENT HANDLERS & HELPERS
  ================================ */
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage); 
    window.scrollTo(0, 0); 
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterStatus("");
    setFilterDocType("");
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
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete documents.");
    } finally {
      setDeleting(false);
    }
  };

  // Logic for Row Color based on Expiry Date
  const getRowStyle = (expiryDateString) => {
    if (!expiryDateString) return {}; // No date, default style

    const today = new Date();
    // Reset time to midnight for accurate day comparison
    today.setHours(0, 0, 0, 0);
    
    const expiryDate = new Date(expiryDateString);
    expiryDate.setHours(0, 0, 0, 0);

    // Calculate difference in time (ms)
    const diffTime = expiryDate - today;
    // Calculate difference in days
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 1. If Expired (Date is in the past)
    if (diffTime < 0) {
      return { color: "#dc2626", fontWeight: "600" }; // Red
    }
    
    // 2. If Expiring in 7 days or less (and not expired)
    if (diffDays <= 7) {
      return { color: "#d97706", fontWeight: "600" }; // Warning Orange/Dark Yellow
    }

    return {}; // Default style
  };

  const getStatusStyle = (status) => {
    return status === "Active" 
      ? { color: "var(--success)", fontWeight: 600 } 
      : { color: "#dc2626", fontWeight: 600 };
  };

  const startRow = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, totalCount);

  // Show extra columns only if document filter is active
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
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <select
              className="filter-select"
              value={filterDocType}
              onChange={(e) => {
                setFilterDocType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Document Types</option>
              {docTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
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
              {statuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="filters-right">
            <button className="btn btn-ghost" onClick={handleClearFilters}>Clear Filters</button>
            <ProtectedAction
              module="employee"
              action="add"
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
            <h4>
              Employee Document Records{" "}
              <span className="badge-pill">Total: {totalCount}</span>
            </h4>
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
                      <th>Order No</th>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Designation</th>
                      
                      {/* CONDITIONAL HEADERS */}
                      {showDateColumns && <th>Document Type</th>}
                      {showDateColumns && <th>Issue Date</th>}
                      {showDateColumns && <th>Expiry Date</th>}

                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, index) => {
                      // Calculate row style based on expiry date
                      const rowStyle = showDateColumns ? getRowStyle(emp.expiry_date) : {};

                      return (
                        <tr key={emp.user_id} style={rowStyle}>
                            <td>{(page - 1) * pageSize + index + 1}</td>
                            <td>{emp.employee_id}</td>
                            <td>{emp.name}</td>
                            <td>{emp.department}</td>
                            <td>{emp.designation}</td>

                            {/* CONDITIONAL DATA CELLS */}
                            {showDateColumns && (
                                <td>{emp.document_type || "-"}</td>
                            )}
                            {showDateColumns && (
                                <td>{formatDate(emp.issue_date)}</td>
                            )}
                            {showDateColumns && (
                                <td>{formatDate(emp.expiry_date)}</td>
                            )}

                            <td>
                            {/* Note: We keep status color logic independent of row color logic unless row color overrides it */}
                            <span style={getStatusStyle(emp.status)}>{emp.status}</span>
                            </td>
                            <td>
                            <div className="table-actions">
                                <ProtectedAction
                                module="employee"
                                action="view"
                                to={`/admin/employee-documents-view/${emp.user_id}`}
                                className="icon-btn view"
                                >
                                <i className="fa-solid fa-eye" />
                                </ProtectedAction>

                                <ProtectedAction
                                module="employee"
                                action="update"
                                to={`/admin/update-employee-documents/${emp.user_id}`}
                                className="icon-btn edit"
                                >
                                <i className="fa-solid fa-pen" />
                                </ProtectedAction>

                                <ProtectedAction
                                module="employee"
                                action="delete"
                                onAllowed={() => {
                                    setEmployeeToDelete(emp);
                                    setShowDeleteModal(true);
                                }}
                                className="icon-btn delete"
                                >
                                <i className="fa-solid fa-trash" />
                                </ProtectedAction>
                            </div>
                            </td>
                        </tr>
                      );
                    })}
                    {employees.length === 0 && (
                      <tr>
                        {/* Adjust colspan to match total column count */}
                        <td colSpan={showDateColumns ? 10 : 7} style={{ textAlign: "center", padding: "2rem" }}>
                            No records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="table-footer">
                <div id="tableInfo">Showing {startRow} to {endRow} of {totalCount} employees</div>
                <div className="pagination">
                  <button disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
                    <i className="fa-solid fa-angle-left"></i>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button 
                      key={p} 
                      className={p === page ? "active-page" : ""} 
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button disabled={page === totalPages} onClick={() => handlePageChange(page + 1)}>
                    <i className="fa-solid fa-angle-right"></i>
                  </button>
                </div>
              </div>
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