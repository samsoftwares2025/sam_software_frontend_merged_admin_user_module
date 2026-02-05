import React, { useEffect, useState } from "react";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";
import ProtectedAction from "../../components/admin/ProtectedAction";
import Pagination from "../../components/common/Pagination";

import {
  getSupportTickets,
  filterSupportTickets,
  getEmployeesList_filter,
} from "../../api/admin/support_tickets";

import Select from "react-select";

/* ================= FILE URL NORMALIZER ================= */
const getFileUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${window.location.origin}${url}`;
};

function ComplianceDocumentationPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("tickets");

  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* Preview modal */
  const [previewImage, setPreviewImage] = useState(null);

  /* ================= FILTER STATES ================= */
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  /* ================= PAGINATION ================= */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  /* ================= DOWNLOAD FILE ================= */
  const downloadFile = async (fileUrl, fileName = "attachment") => {
    try {
      const res = await fetch(fileUrl, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName; // default name
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Unable to download file");
      console.error(err);
    }
  };

  /* ================= EMPLOYEE DROPDOWN OPTIONS ================= */
  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.name} (${e.employee_id})`,
  }));

  /* ================= FETCH EMPLOYEES ================= */
  const fetchEmployees = async () => {
    try {
      const list = await getEmployeesList_filter();
      setEmployees(list);
    } catch (err) {
      console.error("Employee list error:", err);
    }
  };

  const isFilterApplied = () => {
    return (
      searchTerm.trim() !== "" ||
      status !== "" ||
      submittedBy !== "" ||
      assignedTo !== ""
    );
  };

  /* ================= FETCH TICKETS ================= */
  const fetchTickets = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await filterSupportTickets({
        search: searchTerm,
        status,
        submitted_by: submittedBy,
        assigned_to: assignedTo,
        page,
        page_size: pageSize,
      });

      const normalized = res.support_tickets.map((t) => ({
        ...t,
        submitted_by: t.submitted_by
          ? { id: t.submitted_by, name: t.submitted_by_name }
          : null,
        assigned_to: t.assigned_to
          ? { id: t.assigned_to, name: t.assigned_to_name }
          : null,
      }));

      setTickets(normalized);
      setTotalCount(res.pagination.total_records);
      setTotalPages(res.pagination.total_pages);
    } catch {
      setError("Failed to load compliance tickets.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
    fetchTickets();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [searchTerm, status, submittedBy, assignedTo, page, pageSize]);

  /* ================= HELPERS ================= */
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatus("");
    setSubmittedBy("");
    setAssignedTo("");
    setPage(1);
    fetchTickets();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };
  const startRow = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, totalCount);

  /* ================= RENDER ================= */
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
          <h3>Compliance Documentation</h3>
          <p className="subtitle">View, filter and manage support tickets.</p>
        </div>

        {/* ================= FILTERS ================= */}
        <div className="filters-container">
          <div className="filters-left">
            {/* SEARCH INPUT */}
            <div className="search-input">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                placeholder="Search by Tracking id,subject,content..."
                value={searchTerm}
                onChange={(e) => {
                  setPage(1);
                  setSearchTerm(e.target.value);
                }}
              />
            </div>

            {/* STATUS */}
            <select
              className="filter-select"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Hold">Hold</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* SUBMITTED BY - SEARCHABLE */}
            <div className="filter-item">
              <Select
                options={employeeOptions}
                placeholder="Submitted By"
                isClearable
                classNamePrefix="react-select"
                value={
                  employeeOptions.find(
                    (o) => o.value === Number(submittedBy),
                  ) || null
                }
                onChange={(opt) => {
                  setPage(1);
                  setSubmittedBy(opt ? opt.value : "");
                }}
              />
            </div>

            {/* ASSIGNED TO - SEARCHABLE */}
            <div className="filter-item">
              <Select
                options={employeeOptions}
                placeholder="Assigned To"
                isClearable
                classNamePrefix="react-select"
                value={
                  employeeOptions.find((o) => o.value === Number(assignedTo)) ||
                  null
                }
                onChange={(opt) => {
                  setPage(1);
                  setAssignedTo(opt ? opt.value : "");
                }}
              />
            </div>
          </div>

          <button className="btn btn-ghost" onClick={handleClearFilters}>
            <i className="fa-solid fa-filter-circle-xmark" /> Clear Filters
          </button>
        </div>

        {/* ================= TABLE ================= */}
        <div className="table-container">
          <div className="table-header-bar">
            <h4>
              Compliance Tickets{" "}
              <span className="badge-pill">Total: {totalCount}</span>
            </h4>
          </div>

          {loading ? (
            <div style={{ padding: "1rem" }}>Loading tickets...</div>
          ) : error ? (
            <div style={{ padding: "1rem", color: "orange" }}>{error}</div>
          ) : (
            <>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: "5%" }}>Order No</th>
                      <th style={{ width: "5%" }}>Date</th>
                      <th style={{ width: "10%" }}>Tracking ID</th>
                      <th style={{ width: "30%" }}>Subject</th>
                      <th style={{ width: "15%" }}>Submitted By</th>
                      <th style={{ width: "15%" }}>Assigned To</th>
                      <th style={{ width: "5%" }}>Status</th>
                      <th style={{ width: "5%" }}>Attachment</th>
                      <th style={{ width: "10%" }}>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tickets.map((t, index) => {
                      const file = getFileUrl(t.attachment?.url);
                      const fileName = t.attachment?.name || "attachment";
                      const isImage =
                        file && /\.(jpg|jpeg|png|gif|webp)$/i.test(file);

                      return (
                        <tr key={t.id}>
                          <td>{startRow + index}</td>

                          <td>
                            {new Date(t.created_at).toLocaleDateString("en-GB")}
                          </td>

                          <td>{t.tracking_id}</td>
                          <td className="wrap">{t.subject}</td>

                          <td className="wrap">
                            {t.submitted_by?.name || "-"}
                          </td>

                          <td className="wrap">{t.assigned_to?.name || "-"}</td>

                          <td>
                            <span
                              className={`status-pill status-${t.status
                                .replace(/\s+/g, "-")
                                .toLowerCase()}`}
                            >
                              ● {t.status}
                            </span>
                          </td>

                          <td>
                            {file ? (
                              <div style={{ display: "flex", gap: 8 }}>
                                <button
                                  className="icon-btn"
                                  title="View"
                                  onClick={() =>
                                    isImage
                                      ? setPreviewImage(file)
                                      : window.open(file, "_blank")
                                  }
                                >
                                  <i className="fa-solid fa-eye" />
                                </button>

                                <button
                                  className="icon-btn"
                                  title="Download"
                                  onClick={() => downloadFile(file, fileName)}
                                >
                                  <i className="fa-solid fa-download" />
                                </button>
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td>
                            <div className="table-actions">
                              <button
                                className="icon-btn view"
                                onClick={() =>
                                  (window.location.href = `/admin/compliance-ticket/${t.id}`)
                                }
                              >
                                <i className="fa-solid fa-eye" />
                              </button>
                              <ProtectedAction
                                module="supporting tickets"
                                action="update"
                                to={`/admin/update/compliance-ticket/${t.id}`}
                                className="icon-btn edit"
                              >
                                <i className="fa-solid fa-pen" />
                              </ProtectedAction>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {tickets.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center" }}>
                          No tickets found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ================= PAGINATION FOOTER ================= */}
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

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div className="modal-backdrop" style={backdropStyle}>
          <div style={previewModalStyle}>
            <img
              src={previewImage}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 12,
              }}
            >
              <button
                className="icon-btn"
                title="Download"
                onClick={() => downloadFile(previewImage)}
              >
                <i className="fa-solid fa-download" />
              </button>

              <button className="btn" onClick={() => setPreviewImage(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}

/* ================= MODAL STYLES ================= */
const backdropStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
};

const previewModalStyle = {
  background: "#fff",
  padding: 16,
  borderRadius: 8,
  maxWidth: "95%",
};

export default ComplianceDocumentationPage;
