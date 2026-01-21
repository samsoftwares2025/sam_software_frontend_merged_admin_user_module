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
        <i className="fa-solid fa-circle-check"></i>
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
        <i className="fa-solid fa-triangle-exclamation"></i>
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

  /* ===== SIDEBAR STATE ===== */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [ticketTypeList, setTicketTypeList] = useState([]);

  const [pagination, setPagination] = useState({
    current_page: 1,
    page_size: 10,
    total_pages: 1,
    total_records: 0,
    has_next: false,
    has_previous: false,
  });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [ticketType, setTicketType] = useState("");

  const [loading, setLoading] = useState(true);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  /* ================= EXTRACT UNIQUE TICKET TYPES ================= */
  const extractTicketTypes = (data = []) => {
    const list = [];
    data.forEach((t) => {
      if (t.ticket_type_id && t.ticket_type) {
        list.push({ id: t.ticket_type_id, title: t.ticket_type });
      }
    });
    const unique = list.filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id) === i
    );
    setTicketTypeList(unique);
  };

  /* ================= LOAD NORMAL LIST ================= */
  const loadTickets = () => {
    setLoading(true);
    listSuperAdminTickets(page)
      .then((res) => {
        if (!res?.success) throw new Error(res.message);
        setTickets(res.support_tickets || []);
        setPagination(res.pagination || {});
        extractTicketTypes(res.support_tickets || []);
      })
      .finally(() => setLoading(false));
  };

  /* ================= LOAD FILTERED LIST ================= */
  const loadFilteredTickets = () => {
    setLoading(true);

    filterSuperAdminTickets(page, 10, status, search, ticketType)
      .then((res) => {
        if (res.success) {
          let filtered = res.support_tickets || [];
          extractTicketTypes(res.support_tickets || []);

          const s = search.trim().toLowerCase();

          if (s !== "") {
            filtered = filtered.filter((t) => {
              const tracking = (t.tracking_id || "").toLowerCase();
              const subject = (t.subject || "").toLowerCase();
              const content = (t.content || "").toLowerCase();
              const rawStatus = (t.status || "").toLowerCase();
              const type = (t.ticket_type || "").toLowerCase();

              return (
                tracking.includes(s) ||
                subject.includes(s) ||
                content.includes(s) ||
                type.includes(s) ||
                rawStatus.includes(s)
              );
            });
          }

          setTickets(filtered);
          setPagination(res.pagination || {});
        }
      })
      .finally(() => setLoading(false));
  };

  /* ================= AUTO FILTER OR NORMAL ================= */
  useEffect(() => {
    if (search !== "" || status !== "" || ticketType !== "") {
      loadFilteredTickets();
    } else {
      loadTickets();
    }
  }, [page, search, status, ticketType]);

  useEffect(() => {
    loadTickets();
  }, []);

  /* ================= CLEAR FILTERS ================= */
  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setTicketType("");
    setPage(1);
  };

  /* ================= CANCEL ACTION ================= */
  const handleCancelConfirm = async () => {
    const res = await cancelSuperAdminTicket(selectedTicketId);
    if (res.success) {
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      loadTickets();
    }
  };

  /* ================= PAGINATION INFO ================= */
  const currentPage = pagination.current_page || 1;
  const pageSize = pagination.page_size || 10;
  const totalRecords = pagination.total_records || 0;

  const start = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="container">
      {/* ===== SIDEBAR ===== */}
      <Sidebar
        sidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(false)}
      />

      {/* ===== MAIN ===== */}
      <main className="main">
        <Header
          sidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((p) => !p)}
        />

        <section className="card history-card">
          <div className="doc-header">
            <div>
              <h3 className="info-title">Super Admin Support Tickets</h3>
              <p className="doc-subtitle">
                Manage & review all raised tickets.
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={() =>
                navigate("/user/superadmin/support/add")
              }
            >
              + Add Ticket
            </button>
          </div>

          {/* ================= FILTER ROW ================= */}
          <div className="filter-row">
            <input
              type="text"
              placeholder="Search (tracking ID, subject, message, ticket type, status)"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />

            <select
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

            <button className="btn btn-ghost" onClick={handleClearFilters}>
              <i className="fa-solid fa-filter-circle-xmark"></i> Clear
            </button>
          </div>

          {/* ================= TABLE ================= */}
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tracking ID</th>
                  <th>Ticket Type</th>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center" }}>
                      Loading…
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center" }}>
                      No tickets found
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket, index) => (
                    <tr key={ticket.id}>
                      <td>{(currentPage - 1) * pageSize + index + 1}</td>
                      <td>{ticket.tracking_id || "—"}</td>
                      <td>{ticket.ticket_type || "—"}</td>
                      <td>
                        {ticket.created_at
                          ? new Date(ticket.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>{ticket.subject}</td>
                      <td>{ticket.content}</td>
                      <td>
                        <span
                          className={`status-badge status-${formatStatus(
                            ticket.status
                          )
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {formatStatus(ticket.status)}
                        </span>
                      </td>
                      <td>
                        {formatStatus(ticket.status) === "Pending" ? (
                          <button
                            className="btn-cancel-red"
                            onClick={() => {
                              setSelectedTicketId(ticket.id);
                              setShowConfirmModal(true);
                            }}
                          >
                            Cancel
                          </button>
                        ) : (
                          <button className="btn btn-secondary btn-sm" disabled>
                            {formatStatus(ticket.status)}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ================= PAGINATION ================= */}
          <div className="table-footer">
            <div id="tableInfo">
              Showing {start} to {end} of {totalRecords} tickets
            </div>

            <div className="pagination">
              <button
                disabled={!pagination.has_previous}
                onClick={() => setPage((p) => p - 1)}
              >
                <i className="fa-solid fa-angle-left" />
              </button>

              <button className="active-page">{currentPage}</button>

              <button
                disabled={!pagination.has_next}
                onClick={() => setPage((p) => p + 1)}
              >
                <i className="fa-solid fa-angle-right" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ===== SIDEBAR OVERLAY ===== */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay show"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

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
    </div>
  );
};

export default SupportAdminMyTicketsPage;