import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import "../../assets/styles/user.css";

import {
  addSuperAdminTicket,
  getSuperAdminTicketTypes,
} from "../../api/admin/supportadmin";

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
        Go to Tickets
      </button>
    </div>
  </div>
);

const AddTicketAdminPage = ({ sidebarOpen, onToggleSidebar }) => {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [ticketTypeId, setTicketTypeId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();

  /* ================= LOAD TICKET TYPES ================= */
  useEffect(() => {
    const userId =
      localStorage.getItem("user_id") ||
      localStorage.getItem("id") ||
      localStorage.getItem("userId");

    if (!userId) {
      setMessage("User session missing. Please login again.");
      return;
    }

    getSuperAdminTicketTypes()
      .then((res) => {
        console.log("SuperAdmin Ticket Types:", res);

        if (res.success) {
          setTicketTypes(res.types || []);
        } else {
          setMessage(res.message || "Failed to load ticket types");
        }
      })
      .catch((err) => {
        console.error("TYPE LOAD ERROR:", err);
        setMessage("Failed to load ticket types");
      });
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const userId =
      localStorage.getItem("user_id") ||
      localStorage.getItem("id") ||
      localStorage.getItem("userId");

    if (!userId) {
      setMessage("User session missing. Please login again.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("subject", subject);
    formData.append("content", content);
    formData.append("ticket_type_id", ticketTypeId);
    if (attachment) formData.append("attachment", attachment);

    addSuperAdminTicket(formData)
      .then((res) => {
        console.log("ADD TICKET RESPONSE:", res);

        if (res.success) {
          setShowSuccessModal(true);

          setTimeout(() => {
            setShowSuccessModal(false);
            navigate("/user/superadmin/support");
          }, 1500);
        } else {
          setMessage(res.message || "Failed to create ticket");
        }
      })
      .catch((err) => {
        console.error("ADD TICKET ERROR:", err);
        setMessage("Something went wrong");
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      {/* ================= SUCCESS MODAL ================= */}
      {showSuccessModal && (
        <SuccessModal
          title="Ticket Created Successfully"
          message="Your super admin ticket has been submitted."
          onClose={() => navigate("/user/superadmin/support")}
        />
      )}

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay show"
          onClick={onToggleSidebar}
          aria-hidden="true"
        />
      )}

      <main className="main add-ticket-page">
        <Header sidebarOpen={sidebarOpen} onToggleSidebar={onToggleSidebar} />

        <section className="card">
          <h3 className="info-title">Add Super Admin Support Ticket</h3>

          {message && <p className="small error-text">{message}</p>}

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* ================= TICKET TYPE ================= */}
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

            {/* ================= SUBJECT ================= */}
            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            {/* ================= MESSAGE ================= */}
            <div className="form-group">
              <label>Message</label>
              <textarea
                rows="5"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            {/* ================= ATTACHMENT ================= */}
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

            {/* ================= BUTTON ACTIONS ================= */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Ticket"}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/user/superadmin/support")}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
};

export default AddTicketAdminPage;
