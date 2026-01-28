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

function EmployeeDocumentsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("employees");
  const [isFilterActive, setIsFilterActive] = useState(false);
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;

    setPage(newPage);

    if (isFilterActive) {
      setLoading(true);
      filterEmployeeDocuments({
        search: searchTerm,
        status: filterStatus,
        department_id: filterDepartment,
        page: newPage,
        page_size: pageSize,
      })
        .then((resp) => {
          setEmployees(resp?.users_documents || []);
          setTotalCount(resp?.total_count || 0);
          setTotalPages(resp?.total_pages || 1);
        })
        .catch(() => setError("Unable to filter documents."))
        .finally(() => setLoading(false));
    } else {
      loadDocuments(newPage);
    }
  };

  // delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [employees, setEmployees] = useState([]);

  const AddEmployeeDocument = () => {
    navigate("/admin/add-employee-documents");
  };
  // master data
  const [departments, setDepartments] = useState([]);
  const [statuses, setStatuses] = useState([]);

  // ui state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      setDeleting(true);

      await deleteEmployeeAllDocs(employeeToDelete.user_id);
      // or employeeToDelete.id depending on backend

      setShowDeleteModal(false);
      setEmployeeToDelete(null);
      loadDocuments(page);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete documents.");
    } finally {
      setDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setEmployeeToDelete(null);
  };

  /* ===============================
     LOAD MASTER DATA
  ================================ */
  useEffect(() => {
    getDepartments_employee_mgmnt()
      .then((resp) => setDepartments(resp?.departments || []))
      .catch(() => console.error("Failed to load departments"));
  }, []);

  /* ===============================
     LOAD DOCUMENTS (INITIAL)
  ================================ */
  useEffect(() => {
    loadDocuments(1);
  }, []);

  const loadDocuments = (pageNo) => {
    setLoading(true);
    setError(null);

    getEmployeeDocuments({ page: pageNo, page_size: pageSize })
      .then((resp) => {
        setEmployees(resp?.users_documents || []);
        setTotalCount(resp?.total_count || 0);
        setTotalPages(resp?.total_pages || 1);

        const allStatuses = resp?.users_documents
          ?.flatMap((e) => e.documents || [])
          ?.map((d) => d.status)
          .filter(Boolean);

        setStatuses([...new Set(allStatuses)]);
      })

      .catch(() => setError("Unable to load employee documents."))
      .finally(() => setLoading(false));
  };

  /* ===============================
     FILTERING
  ================================ */
  useEffect(() => {
    if (!isFilterActive) return; // 🔑 STOP initial call

    setPage(1);
    setLoading(true);

    filterEmployeeDocuments({
      search: searchTerm,
      status: filterStatus,
      department_id: filterDepartment,
      page: 1,
      page_size: pageSize,
    })
      .then((resp) => {
        setEmployees(resp?.users_documents || []);

        setTotalCount(resp?.total_count || 0);
        setTotalPages(resp?.total_pages || 1);
      })
      .catch(() => setError("Unable to filter documents."))
      .finally(() => setLoading(false));
  }, [searchTerm, filterDepartment, filterStatus, isFilterActive]);

  /* ===============================
     HELPERS
  ================================ */
  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterStatus("");
    setIsFilterActive(false);
    setPage(1);
    loadDocuments(1);
  };

  const getStatusStyle = (status) => {
    if (status === "Active") {
      return { color: "var(--success)", fontWeight: 600 };
    }
    if (status === "Inactive") {
      return { color: "#dc2626", fontWeight: 600 }; // red
    }
    return { color: "#6b7280", fontWeight: 600 };
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
          <h3>Employee Document Records</h3>
          <p className="subtitle">
            Track and manage visa, work permit and professional authorization.
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsFilterActive(true);
                }}
              />
            </div>

            <select
              className="filter-select"
              value={filterDepartment}
              onChange={(e) => {
                setFilterDepartment(e.target.value);
                setIsFilterActive(true);
              }}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setIsFilterActive(true);
              }}
            >
              <option value="">All Status</option>
              {statuses.filter(Boolean).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="filters-right">
            <button className="btn btn-ghost" onClick={handleClearFilters}>
              Clear Filters
            </button>
            <ProtectedAction
              module="employee"
              action="add"
              onAllowed={AddEmployeeDocument}
              className="btn btn-primary"
            >
              <i className="fa-solid fa-user-plus" /> Add Document
            </ProtectedAction>
          </div>
        </div>

        {/* TABLE */}
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
                      <th style={{ width: "5%" }}>Order No</th>
                      <th style={{ width: "5%" }}>Employee ID</th>
                      <th style={{ width: "15%" }}>Name</th>
                      <th style={{ width: "10%" }}>Document Type</th>
                      <th style={{ width: "10%" }}>Document No.</th>
                      <th style={{ width: "10%" }}>Country</th>
                      <th style={{ width: "15%" }}>Issue Date</th>
                      <th style={{ width: "15%" }}>Expiry Date</th>
                      <th style={{ width: "5%" }}>Status</th>
                      <th style={{ width: "10%" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, empIndex) =>
                      (emp.documents || []).map((doc, docIndex) => {
                        const orderNo = (page - 1) * pageSize + empIndex + 1;

                        return (
                          <tr key={doc.id}>
                            {/* SERIAL NO */}
                            {docIndex === 0 && (
                              <td rowSpan={emp.documents.length}>{orderNo}</td>
                            )}

                            {/* EMPLOYEE ID */}
                            {docIndex === 0 && (
                              <td rowSpan={emp.documents.length}>
                                {emp.employee_id}
                              </td>
                            )}

                            {/* EMPLOYEE NAME */}
                            {docIndex === 0 && (
                              <td rowSpan={emp.documents.length}>{emp.name}</td>
                            )}

                            {/* DOCUMENT FIELDS */}
                            <td>{doc.document_type}</td>
                            <td>{doc.document_number}</td>
                            <td>{doc.country}</td>
                            <td>
                              {doc.issue_date
                                ? new Date(doc.issue_date).toLocaleDateString(
                                    "en-GB",
                                  )
                                : "-"}
                            </td>
                            <td>
                              {doc.expiry_date
                                ? new Date(doc.expiry_date).toLocaleDateString(
                                    "en-GB",
                                  )
                                : "-"}
                            </td>
                            <td>
                              <span style={getStatusStyle(doc.status)}>
                                {doc.status || "-"}
                              </span>
                            </td>

                            {/* ACTIONS */}
                            {docIndex === 0 && (
                              <td rowSpan={emp.documents.length}>
                                <div className="table-actions">
                                  <ProtectedAction
                                    module="employee"
                                    action="view"
                                    to={`/admin/employee-documents-view/${emp.user_id}`}
                                    className="icon-btn view"
                                    title="View Details"
                                  >
                                    <i className="fa-solid fa-eye" />
                                  </ProtectedAction>

                                  <ProtectedAction
                                    module="employee"
                                    action="update"
                                    to={`/admin/update-employee-documents/${emp.user_id}`}
                                    className="icon-btn view"
                                    title="Edit Employee"
                                  >
                                    <i className="fa-solid fa-pen" />
                                  </ProtectedAction>

                                  <ProtectedAction                   
                                    module="employee"
                                    action="delete"
                                    onAllowed={() => {
                                      const payload = {
                                        user_id: emp.user_id,
                                     
                                        name: emp.name,
                                      };

                                      console.log(
                                        "CLICK DELETE → payload:",
                                        payload,
                                      );

                                      setEmployeeToDelete(payload);
                                      setShowDeleteModal(true);
                                    }}
                                    className="icon-btn delete"
                                    title="Delete Employment Record"
                                  >
                                    <i className="fa-solid fa-trash" />
                                  </ProtectedAction>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      }),
                    )}

                    {employees.length === 0 && (
                      <tr>
                        <td colSpan={10} style={{ textAlign: "center" }}>
                          No records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

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
                    ),
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
        {showDeleteModal && (
          <DeleteConfirmModal
            title="Delete Employee Documents"
            message={`Are you sure you want to delete ALL documents for ${employeeToDelete?.name}?`}
            loading={deleting}
            onConfirm={confirmDelete}
            onClose={closeDeleteModal}
          />
        )}
      </main>
      
      <div
        id="sidebarOverlay"
        className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}

export default EmployeeDocumentsPage;
