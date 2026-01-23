import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";

import LoaderOverlay from "../../components/common/LoaderOverlay";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

import {
  cancelTicket,
  filterMyTickets,
  getMyTickets,
} from "../../api/user/supportTickets";

/* ================= STATUS → DB MAP ================= */
const STATUS_TO_DB = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "completed",
  cancelled: "cancelled",
};

/* ================= FORMAT STATUS ================= */
const formatStatus = (status) => status || "Pending";

/* ================= CONFIRM MODAL ================= */
const ConfirmModal = ({ onConfirm, onClose }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <h3>Cancel Ticket</h3>
      <p>Are you sure you want to cancel this ticket?</p>
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          No
        </button>
        <button className="btn btn-danger" onClick={onConfirm}>
          Yes, Cancel
        </button>
      </div>
    </div>
  </div>
);

const MyTickets = () => {
  const navigate = useNavigate();

  /* ===== SIDEBAR ===== */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);

  const [loading, setLoading] = useState(true);

  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchSubject, setSearchSubject] = useState("");

  const [selectedTicketId, setSelectedTicketId] = useState(null);

  /* ===== MODALS ===== */
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ================= FETCH ================= */
  const fetchTickets = async () => {
    try {
      setLoading(true);

      const hasFilters =
        statusFilter !== "all" || searchSubject.trim() !== "";

      const res = hasFilters
        ? await filterMyTickets({
            page,
            status:
              statusFilter !== "all"
                ? STATUS_TO_DB[statusFilter]
                : null,
            search: searchSubject.trim() || null,
          })
        : await getMyTickets(page);

      if (!res?.success) {
        throw new Error(res?.message || "Failed to load tickets.");
      }

      setTickets(res.support_tickets || []);
      setPagination(res.pagination || {});
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter, searchSubject]);

  /* ================= CANCEL ================= */
  const openCancelConfirm = (ticketId) => {
    setSelectedTicketId(ticketId);
    setShowConfirm(true);
  };

  const handleCancelTicket = async () => {
    try {
      setLoading(true);

      const res = await cancelTicket(selectedTicketId);

      if (!res?.success) {
        throw new Error(res?.message || "Unable to cancel ticket.");
      }

      setShowConfirm(false);
      setShowSuccessModal(true);
      fetchTickets();
    } catch (err) {
      setErrorMessage(err.message || "Unable to cancel ticket.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  /* ================= HELPERS ================= */
  const ticketTypes = [
    ...new Set(tickets.map((t) => t.ticket_type).filter(Boolean)),
  ];

  const displayedTickets =
    typeFilter === "all"
      ? tickets
      : tickets.filter((t) => t.ticket_type === typeFilter);

  const clearFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setSearchSubject("");
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
      {/* ===== LOADER ===== */}
      {loading && <LoaderOverlay />}

      {/* ===== ERROR MODAL ===== */}
      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}

      {/* ===== SUCCESS MODAL ===== */}
      {showSuccessModal && (
        <SuccessModal
          message="Your ticket has been cancelled successfully."
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      <div className="container">
        {/* ===== SIDEBAR (FIXED) ===== */}
        <Sidebar
          isMobileOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          openSection={openSection}
          setOpenSection={setOpenSection}
        />

        <main className="main">
          {/* ===== HEADER (FIXED) ===== */}
          <Header
            onMenuClick={() => setIsSidebarOpen((p) => !p)}
          />

          {/* PAGE TITLE */}
          <div className="page-title">
            <h3>My Support Tickets</h3>
            <p className="subtitle">
              Track and manage your raised tickets.
            </p>
          </div>

          {/* FILTERS */}
          <div className="filters-container">
            <div className="filters-left">
              <div className="search-input">
                <i className="fa-solid fa-magnifying-glass" />
                <input
                  placeholder="Search tickets..."
                  value={searchSubject}
                  onChange={(e) => {
                    setSearchSubject(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

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
                {ticketTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="filters-right">
              <button className="btn btn-ghost" onClick={clearFilters}>
                <i className="fa-solid fa-filter-circle-xmark" /> Clear Filters
              </button>

               <button
                className="btn btn-secondary"
                onClick={() => navigate("/admin/support/assigned")}
              >
                View Assigned Tickets
              </button>

              <button
                className="btn btn-primary"
                onClick={() => navigate("/user/support/add")}
              >
                + Raise Ticket
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-container">
            <div className="table-header-bar">
              <h4>
                My Tickets{" "}
                <span className="badge-pill">
                  Total: {totalRecords}
                </span>
              </h4>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tracking ID</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {displayedTickets.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center" }}>
                        No tickets found
                      </td>
                    </tr>
                  ) : (
                    displayedTickets.map((t, i) => {
                      const statusClass =
                        "status-" +
                        t.status.replace(" ", "-").toLowerCase();

                      return (
                        <tr key={t.id}>
                          <td>{start + i}</td>
                          <td>{t.tracking_id}</td>
                          <td>{t.ticket_type}</td>
                          <td>
                            {new Date(
                              t.created_at
                            ).toLocaleDateString()}
                          </td>
                          <td>{t.subject}</td>
                          <td>{t.content}</td>
                          <td>
                            <span
                              className={`status-pill ${statusClass}`}
                            >
                              ● {formatStatus(t.status)}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              disabled={t.status !== "Pending"}
                              onClick={() =>
                                openCancelConfirm(t.id)
                              }
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER */}
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
                <button className="active-page">{currentPage}</button>
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

        {/* OVERLAY */}
        {isSidebarOpen && (
          <div
            className="sidebar-overlay show"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {showConfirm && (
          <ConfirmModal
            onConfirm={handleCancelTicket}
            onClose={() => setShowConfirm(false)}
          />
        )}
      </div>
    </>
  );
};

export default MyTickets;
