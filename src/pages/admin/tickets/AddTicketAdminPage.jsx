import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../../components/common/Sidebar";
import Header from "../../../components/common/Header";
import "../../../assets/styles/admin.css";

import {
  addSuperAdminTicket,
  getSuperAdminTicketTypes,
} from "../../../api/admin/supportadmin";

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

const AddTicketAdminPage = () => {
  const navigate = useNavigate();

  /* ===== SIDEBAR STATE (FIXED) ===== */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [openSection, setOpenSection] = useState(null);
  

  const [ticketTypes, setTicketTypes] = useState([]);
  const [ticketTypeId, setTicketTypeId] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  /* ================= LOAD TICKET TYPES ================= */
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await getSuperAdminTicketTypes();
        if (res?.success) setTicketTypes(res.types || []);
        else setMessage(res?.message || "Failed to load ticket types");
      } catch {
        setMessage("Failed to load ticket types");
      }
    };
    fetchTypes();
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!ticketTypeId) return setMessage("Please select a ticket type");
    if (!subject.trim() || !content.trim())
      return setMessage("Subject and message are required");

    const userId =
      localStorage.getItem("user_id") ||
      localStorage.getItem("id") ||
      localStorage.getItem("userId");

    if (!userId) return setMessage("Session expired. Please login again.");

    setLoading(true);
    try {
      const res = await addSuperAdminTicket({
        user_id: userId,
        ticket_type_id: ticketTypeId,
        subject: subject.trim(),
        content: content.trim(),
        attachment,
      });

      if (res?.success) setShowSuccessModal(true);
      else setMessage(res?.message || "Failed to create ticket");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* ===== SIDEBAR (FIXED PROPS) ===== */}
   

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

        {/* ===== PAGE HEADER ===== */}
        <div className="page-header">
          <div className="page-title">
            <h3>Add Super Admin Support Ticket</h3>
            <p>Raise a new support ticket for super admin</p>
          </div>
        </div>

        {/* ===== FORM CONTAINER ===== */}
        <div className="form-container">
          {message && <p className="small error-text">{message}</p>}

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label required">Ticket Type</label>
                <select
                  className="form-select"
                  value={ticketTypeId}
                  onChange={(e) => setTicketTypeId(e.target.value)}
                >
                  <option value="">Select Ticket Type</option>
                  {ticketTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label required">Subject</label>
                <input
                  className="form-input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label required">Message</label>
                <textarea
                  className="form-textarea"
                  rows="5"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  Attachment <span className="small">(optional)</span>
                </label>
                <input
                  className="form-input"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  onChange={(e) => setAttachment(e.target.files[0])}
                />
              </div>
            </div>

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
                onClick={() => navigate("/admin/list-support-ticket")}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* ===== SIDEBAR OVERLAY ===== */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay show"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ===== SUCCESS MODAL ===== */}
      {showSuccessModal && (
        <SuccessModal
          title="Ticket Created Successfully"
          message="Your super admin ticket has been submitted."
          onClose={() => navigate("/admin/list-support-ticket")}
        />
      )}
    </div>
  );
};

export default AddTicketAdminPage;
