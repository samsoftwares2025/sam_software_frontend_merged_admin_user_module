import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";

import {
  listSuperAdminTickets,
  filterSuperAdminTickets,
  cancelSuperAdminTicket,
} from "../../api/admin/supportadmin";

/* ================= FORMAT STATUS ================= */
const formatStatus = (status) => {
  if (!status) return "Pending";
  switch (status.toLowerCase()) {
    case "in_progress":
    case "in progress":
      return "In Progress";
    case "pending":
      return "Pending";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
};

/* ================= SUCCESS MODAL ================= */
const SuccessModal = ({ title, message, onClose }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="success-icon">
        <i className="fa-solid fa-circle-check" />
      </div>
      <h2>{title}</h2>
      <p>{message}</p>
      <button className="btn btn-primary" onClick={onClose}>
        OK
      </button>
    </div>
  </div>
);

/* ================= CONFIRM MODAL ================= */
const ConfirmModal = ({ title, message, onConfirm, onClose }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="success-icon warning">
        <i className="fa-solid fa-triangle-exclamation" />
      </div>
      <h2>{title}</h2>
      <p>{message}</p>
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
        <button className="btn btn-danger" onClick={onConfirm}>
          Yes, Cancel
        </button>
      </div>
    </div>
  </div>
);

const SupportAdminMyTicketsPage = () => {
  const navigate = useNavigate();

  /* ===== SIDEBAR STATE (FIXED) ===== */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
      const [openSection, setOpenSection] = useState(null);
  

  const [tickets, setTickets] = useState([]);
  const [ticketTypeList, setTicketTypeList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [ticketType, setTicketType] = useState("");

  const [pagination, setPagination] = useState({
    current_page: 1,
    page_size: 10,
    total_records: 0,
    has_next: false,
    has_previous: false,
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  /* ================= LOAD DATA ================= */
  const loadTickets = () => {
    setLoading(true);
    listSuperAdminTickets(page)
      .then((res) => {
        if (res?.success) {
          setTickets(res.support_tickets || []);
          setPagination(res.pagination || {});
          extractTicketTypes(res.support_tickets || []);
        }
      })
      .finally(() => setLoading(false));
  };

  const loadFilteredTickets = () => {
    setLoading(true);
    filterSuperAdminTickets(page, 10, status, search, ticketType)
      .then((res) => {
        if (res?.success) {
          setTickets(res.support_tickets || []);
          setPagination(res.pagination || {});
          extractTicketTypes(res.support_tickets || []);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (search || status || ticketType) {
      loadFilteredTickets();
    } else {
      loadTickets();
    }
  }, [page, search, status, ticketType]);

  /* ================= HELPERS ================= */
  const extractTicketTypes = (data = []) => {
    const unique = [];
    data.forEach((t) => {
      if (t.ticket_type_id && !unique.find((x) => x.id === t.ticket_type_id)) {
        unique.push({ id: t.ticket_type_id, title: t.ticket_type });
      }
    });
    setTicketTypeList(unique);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setTicketType("");
    setPage(1);
  };

  const handleCancelConfirm = async () => {
    const res = await cancelSuperAdminTicket(selectedTicketId);
    if (res?.success) {
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      loadTickets();
    }
  };

  const { current_page = 1, page_size = 10, total_records = 0 } = pagination;
  const start = total_records === 0 ? 0 : (current_page - 1) * page_size + 1;
  const end = Math.min(current_page * page_size, total_records);

  return (
    <div className="container">
     



          
           <Sidebar
          isMobileOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          openSection={openSection}
          setOpenSection={setOpenSection}
        />

        {/* ===== MAIN ===== */}
        <main className="main">
          {/* ===== HEADER (FIXED) ===== */}
          <Header
            onMenuClick={() => setIsSidebarOpen((p) => !p)}
          />


        {/* PAGE TITLE */}
        <div className="page-title">
          <h3>Super Admin Support Tickets</h3>
          <p className="subtitle">Manage & review all raised tickets.</p>
        </div>

        {/* FILTERS */}
        <div className="filters-container">
          <div className="filters-left">
            <div className="search-input">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>

            <select
              className="filter-select"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              className="filter-select"
              value={ticketType}
              onChange={(e) => {
                setPage(1);
                setTicketType(e.target.value);
              }}
            >
              <option value="">All Ticket Types</option>
              {ticketTypeList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="filters-right">
            <button className="btn btn-ghost" onClick={handleClearFilters}>
              <i className="fa-solid fa-filter-circle-xmark" /> Clear Filters
            </button>

            <button
              className="btn btn-primary"
              onClick={() => navigate("/admin/add-support-ticket")}
            >
              + Add Ticket
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-container">
          <div className="table-header-bar">
            <h4>
              Support Tickets{" "}
              <span className="badge-pill">Total: {total_records}</span>
            </h4>
          </div>

          {loading ? (
            <div style={{ padding: "1rem" }}>Loading tickets...</div>
          ) : (
            <>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Subject</th>
                      <th>Message</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tickets.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center" }}>
                          No tickets found.
                        </td>
                      </tr>
                    ) : (
                      tickets.map((t, i) => {
                        const statusLabel = formatStatus(t.status);
                        const statusClass =
                          "status-" +
                          statusLabel.toLowerCase().replace(" ", "-");

                        return (
                          <tr key={t.id}>
                            <td>{start + i}</td>
                            <td>{t.tracking_id}</td>
                            <td>{t.ticket_type}</td>
                            <td>
                              {t.created_at
                                ? new Date(t.created_at).toLocaleDateString()
                                : "-"}
                            </td>
                            <td>{t.subject}</td>
                            <td>{t.content}</td>
                            <td>
                              <span className={`status-pill ${statusClass}`}>
                                ● {statusLabel}
                              </span>
                            </td>
                            <td>
                              {statusLabel === "Pending" ? (
                                <button
                                  className="btn-cancel-red"
                                  onClick={() => {
                                    setSelectedTicketId(t.id);
                                    setShowConfirmModal(true);
                                  }}
                                >
                                  Cancel
                                </button>
                              ) : (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  disabled
                                >
                                  {statusLabel}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="table-footer">
                <div id="tableInfo">
                  Showing {start} to {end} of {total_records} tickets
                </div>

                <div className="pagination">
                  <button
                    disabled={!pagination.has_previous}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <i className="fa-solid fa-angle-left" />
                  </button>

                  <button className="active-page">{current_page}</button>

                  <button
                    disabled={!pagination.has_next}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <i className="fa-solid fa-angle-right" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ===== MODALS ===== */}
      {showConfirmModal && (
        <ConfirmModal
          title="Cancel Ticket"
          message="Are you sure you want to cancel this ticket?"
          onConfirm={handleCancelConfirm}
          onClose={() => setShowConfirmModal(false)}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          title="Ticket Cancelled"
          message="This ticket has been successfully cancelled."
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {/* ===== OVERLAY ===== */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay show"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default SupportAdminMyTicketsPage;
