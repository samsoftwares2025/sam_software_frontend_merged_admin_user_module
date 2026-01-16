import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import "../../assets/styles/user.css";
import { getMyTickets, cancelTicket } from "../../api/user/supportTickets";

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
          Cancel
        </button>
        <button className="btn btn-danger" onClick={onConfirm}>
          Yes, Cancel
        </button>
      </div>
    </div>
  </div>
);

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

const MyTickets = ({ sidebarOpen, onToggleSidebar }) => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    page_size: 10,
    total_pages: 1,
    total_records: 0,
    has_next: false,
    has_previous: false,
  });

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  /* ================= FETCH PAGINATED TICKETS ================= */
  useEffect(() => {
    setLoading(true);
    setError("");

    getMyTickets(page)
      .then((res) => {
        if (!res?.success) {
          throw new Error(res?.message || "Failed to load tickets");
        }

        setTickets(res.support_tickets ?? []);
        setPagination(res.pagination ?? {});
      })
      .catch((err) => setError(err.message || "Something went wrong"))
      .finally(() => setLoading(false));
  }, [page]);

  /* ================= CONFIRM CANCEL ================= */
  const handleCancelConfirm = async () => {
    if (!selectedTicketId) return;

    try {
      const res = await cancelTicket(selectedTicketId);
      if (!res?.success) throw new Error("Cancel failed");

      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicketId ? { ...t, status: "cancelled" } : t
        )
      );

      setShowConfirmModal(false);
      setSelectedTicketId(null);
      setShowSuccessModal(true);
    } catch (err) {
      alert(err.message || "Something went wrong");
    }
  };

  /* ================= PAGINATION INFO ================= */
  const currentPage = pagination.current_page || 1;
  const pageSize = pagination.page_size || 10;
  const totalRecords = pagination.total_records || 0;

  const start = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalRecords);

  if (loading) return <main className="main">Loading tickets...</main>;
  if (error) return <main className="main">{error}</main>;

  return (
    <>
      {sidebarOpen && (
        <div className="sidebar-overlay show" onClick={onToggleSidebar} />
      )}

      <main className="main">
        <Header sidebarOpen={sidebarOpen} onToggleSidebar={onToggleSidebar} />

        {/* ================= TABLE ================= */}
        <section className="card history-card">
          <div className="doc-header">
            <div>
              <h3 className="info-title">My Support Tickets</h3>
              <p className="doc-subtitle">
                View and track your submitted support requests.
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/user/support/add")}
            >
              + Raise Ticket
            </button>
          </div>

          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tracking ID</th>
                  <th>Ticket Type</th> {/* ⭐ ADDED */}
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {tickets.map((ticket, index) => (
                  <tr key={ticket.id}>
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>

                    {/* TRACKING ID */}
                    <td>{ticket.tracking_id || "—"}</td>

                    {/* ⭐ ADDED TICKET TYPE */}
                    <td>{ticket.ticket_type || "—"}</td>

                    <td>
                      {ticket.created_at
                        ? new Date(ticket.created_at).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>{ticket.subject}</td>
                    <td>{ticket.content}</td>

                    {/* STATUS */}
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
                ))}
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

      {showConfirmModal && (
        <ConfirmModal
          title="Cancel Support Ticket"
          message="Are you sure you want to cancel this ticket?"
          onConfirm={handleCancelConfirm}
          onClose={() => setShowConfirmModal(false)}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          title="Ticket Cancelled"
          message="Your support ticket has been cancelled successfully."
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </>
  );
};

export default MyTickets;
