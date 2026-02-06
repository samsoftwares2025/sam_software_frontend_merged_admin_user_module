import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/common/Sidebar";
import Header from "../../../components/common/Header";
import LoaderOverlay from "../../../components/common/LoaderOverlay";
import SuccessModal from "../../../components/common/SuccessModal";
import ErrorModal from "../../../components/common/ErrorModal";

import "../../../assets/styles/admin.css";

import {
  getAssignedTickets,
  filterSupportTickets,
  updateAssignedTicketStatus,
} from "../../../api/user/supportTickets";

/* ================= STATUS MAP ================= */
const STATUS_TO_DB = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "completed",
  cancelled: "cancelled",
};

const UI_STATUS_LABEL = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

/* ================= CONFIRM MODAL ================= */
const ConfirmModal = ({ message, onConfirm, onClose }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <h3>Confirm Status Change</h3>
      <p>{message}</p>
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={onConfirm}>
          Yes, Update
        </button>
      </div>
    </div>
  </div>
);

const AssignedTickets = () => {
  /* ===== SIDEBAR ===== */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);

  /* ===== DATA ===== */
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  /* ===== FILTERS ===== */
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  /* ===== UI ===== */
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ===== STATUS UPDATE ===== */
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const userId =
    localStorage.getItem("user_id") ||
    localStorage.getItem("id") ||
    localStorage.getItem("userId");

  /* ================= FETCH ================= */
  const fetchTickets = async () => {
    try {
      setLoading(true);

      const hasFilters =
        statusFilter !== "all" ||
        typeFilter !== "all" ||
        search.trim() !== "";

      const res = hasFilters
        ? await filterSupportTickets({
            page,
            assigned_to: userId,
            status:
              statusFilter !== "all"
                ? STATUS_TO_DB[statusFilter]
                : null,
            search: search.trim() || null,
          })
        : await getAssignedTickets(page);

      if (!res?.success) {
        throw new Error("Failed to load assigned tickets");
      }

      let data = res.support_tickets || [];

      if (typeFilter !== "all") {
        data = data.filter((t) => t.ticket_type === typeFilter);
      }

      setAssignedTickets(res.support_tickets || []);
      setTickets(data);
      setPagination(res.pagination || {});
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter, typeFilter, search]);

  /* ================= TYPES ================= */
  const ticketTypes = [
    ...new Set(assignedTickets.map((t) => t.ticket_type).filter(Boolean)),
  ];

  /* ================= STATUS UPDATE ================= */
  const confirmStatusChange = (ticket, status) => {
    setSelectedTicket(ticket);
    setNewStatus(status);
    setShowConfirm(true);
  };

  const handleStatusUpdate = async () => {
    try {
      setLoading(true);

      await updateAssignedTicketStatus({
        ticketId: selectedTicket.id,
        status: STATUS_TO_DB[newStatus],
      });

      setShowConfirm(false);
      setShowSuccess(true);
      fetchTickets();
    } catch {
      setErrorMessage("Failed to update ticket status");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setSearch("");
    setPage(1);
  };

  /* ================= PAGINATION ================= */
  const currentPage = pagination.current_page || 1;
  const pageSize = pagination.page_size || 10;
  const totalRecords = pagination.total_records || 0;

  const start =
    totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalRecords);

  return (
    <>
      {loading && <LoaderOverlay />}

      {showError && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowError(false)}
        />
      )}

      {showSuccess && (
        <SuccessModal
          message="Ticket status updated successfully."
          onClose={() => setShowSuccess(false)}
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
          <Header onMenuClick={() => setIsSidebarOpen((p) => !p)} />

          <div className="page-title">
            <h3>Assigned Support Tickets</h3>
            <p className="subtitle">
              Manage and update tickets assigned to you.
            </p>
          </div>

          {/* FILTERS */}
          <div className="filters-container">
            <div className="filters-left">
              <input
                className="filter-input"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />

              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                className="filter-select"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Ticket Types</option>
                {ticketTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="filters-right">
              <button className="btn btn-ghost" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tracking ID</th>
                  <th>Submitted By</th>
                  <th>Type</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Action</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center" }}>
                      No assigned tickets found
                    </td>
                  </tr>
                ) : (
                  tickets.map((t, i) => {
                    const uiStatus = Object.keys(STATUS_TO_DB).find(
                      (k) => STATUS_TO_DB[k] === t.status
                    );

                    return (
                      <tr key={t.id}>
                        <td>{start + i}</td>
                        <td>{t.tracking_id}</td>
                        <td>{t.submitted_by_name}</td>
                        <td>{t.ticket_type}</td>
                        <td>{t.subject}</td>

                        <td>
                          <span
                            className={`status-pill status-${uiStatus.replace(
                              "_",
                              "-"
                            )}`}
                          >
                            ● {UI_STATUS_LABEL[uiStatus]}
                          </span>
                        </td>

                        <td>
                          <select
                            className="status-select"
                            value={uiStatus}
                            onChange={(e) =>
                              confirmStatusChange(t, e.target.value)
                            }
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">
                              In Progress
                            </option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td>
                          {new Date(
                            t.created_at
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <div className="table-footer">
              <div>
                Showing {start} to {end} of {totalRecords} tickets
              </div>

              <div className="pagination">
                <button
                  disabled={!pagination.has_previous}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ‹
                </button>
                <button className="active-page">
                  {currentPage}
                </button>
                <button
                  disabled={!pagination.has_next}
                  onClick={() => setPage((p) => p + 1)}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </main>

        {isSidebarOpen && (
          <div
            className="sidebar-overlay show"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {showConfirm && (
          <ConfirmModal
            message={`Change status to "${UI_STATUS_LABEL[newStatus]}"?`}
            onConfirm={handleStatusUpdate}
            onClose={() => setShowConfirm(false)}
          />
        )}
      </div>
    </>
  );
};

export default AssignedTickets;
