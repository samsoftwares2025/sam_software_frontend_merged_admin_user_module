import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/user.css";
import { addSupportTicket, getTicketTypes } from "../../api/user/supportTickets";

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
        Go to My Tickets
      </button>
    </div>
  </div>
);

const AddTicket = () => {
  /* ===== SIDEBAR STATE (ADMIN STYLE) ===== */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* ===== FORM STATE ===== */
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [ticketTypeId, setTicketTypeId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();

  /* ===== LOAD TICKET TYPES ===== */
  useEffect(() => {
    getTicketTypes()
      .then((res) => res.success && setTicketTypes(res.types))
      .catch(() => setMessage("Failed to load ticket types"));
  }, []);

  /* ===== SUBMIT ===== */
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("content", content);
    formData.append("ticket_type_id", ticketTypeId);
    if (attachment) formData.append("attachment", attachment);

    addSupportTicket(formData)
      .then((res) => {
        if (res.success) {
          setShowSuccessModal(true);
          setTimeout(() => navigate("/user/support"), 1500);
        } else {
          setMessage(res.message || "Failed to create ticket");
        }
      })
      .catch(() => setMessage("Something went wrong"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="container">
      {/* ===== SIDEBAR (ADMIN SIDEBAR) ===== */}
     <Sidebar
  sidebarOpen={isSidebarOpen}
  onToggleSidebar={() => setIsSidebarOpen(false)}
/>


      {/* ===== MAIN ===== */}
      <main className="main add-ticket-page">
<Header
  sidebarOpen={isSidebarOpen}
  onToggleSidebar={() => setIsSidebarOpen(p => !p)}
/>

        <section className="card">
          <h3 className="info-title">Add Support Ticket</h3>

          {message && <p className="small error-text">{message}</p>}

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="form-group">
              <label>Ticket Type</label>
              <select
                value={ticketTypeId}
                onChange={(e) => setTicketTypeId(e.target.value)}
                required
              >
                <option value="">Select Ticket Type</option>
                {ticketTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea
                rows="5"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Attachment <span className="small">(optional)</span>
              </label>
              <input
                type="file"
                onChange={(e) => setAttachment(e.target.files[0])}
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Submitting..." : "Submit Ticket"}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/user/support")}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </main>


      {/* OVERLAY */}
  {isSidebarOpen && (
    <div
      className="sidebar-overlay show"
      onClick={() => setIsSidebarOpen(false)}
    />
  )}

      {showSuccessModal && (
        <SuccessModal
          title="Ticket Created Successfully"
          message="Your support ticket has been submitted."
          onClose={() => navigate("/user/support")}
        />
      )}
    </div>
  );
};

export default AddTicket;
