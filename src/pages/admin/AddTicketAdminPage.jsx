import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/user.css";
import { addSuperAdminTicket, getSuperAdminTicketTypes } from "../../api/admin/supportadmin";

// Success Modal Component
const SuccessModal = ({ title, message, onClose }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="success-icon">
        <i className="fa-solid fa-circle-check" />
      </div>
      <h2>{title}</h2>
      <p>{message}</p>
      <button className="btn btn-primary" onClick={onClose}>Go to Tickets</button>
    </div>
  </div>
);

const AddTicketAdminPage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [ticketTypeId, setTicketTypeId] = useState(""); 
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch ticket types on mount
  useEffect(() => {
    const fetchTicketTypes = async () => {
      try {
        const res = await getSuperAdminTicketTypes();
        if (res?.success) setTicketTypes(res.types || []);
        else setMessage(res?.message || "Failed to load ticket types");
      } catch (err) {
        console.error(err);
        setMessage("Failed to load ticket types");
      }
    };
    fetchTicketTypes();
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!ticketTypeId) return setMessage("Please select a ticket type");
    if (!subject.trim() || !content.trim()) return setMessage("Subject and message are required");

    const userId = localStorage.getItem("user_id") || localStorage.getItem("id") || localStorage.getItem("userId");
    if (!userId) return setMessage("Session expired. Please login again.");

    setLoading(true);
    try {
      const data = await addSuperAdminTicket({
        user_id: userId,          // ✅ ensures user_id is sent
        ticket_type_id: ticketTypeId, // ✅ send as string
        subject: subject.trim(),
        content: content.trim(),
        attachment,               // optional file
      });

      if (data?.success) setShowSuccessModal(true);
      else setMessage(data?.message || "Failed to create ticket. Please check ticket type.");
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Sidebar sidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(false)} />
      <main className="main add-ticket-page">
        <Header sidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(p => !p)} />
        <section className="card">
          <h3 className="info-title">Add Super Admin Support Ticket</h3>
          {message && <p className="small error-text">{message}</p>}

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="form-group">
              <label>Ticket Type</label>
              <select
                value={ticketTypeId}
                onChange={e => setTicketTypeId(e.target.value)} // send as string
              >
                <option value="">Select Ticket Type</option>
                {ticketTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subject</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea rows="5" value={content} onChange={e => setContent(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Attachment <span className="small">(optional)</span></label>
              <input type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" onChange={e => setAttachment(e.target.files[0])} />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Submitting..." : "Submit Ticket"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate("/user/superadmin/support")} disabled={loading}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      </main>

      {isSidebarOpen && <div className="sidebar-overlay show" onClick={() => setIsSidebarOpen(false)} />}

      {showSuccessModal && (
        <SuccessModal 
          title="Ticket Created Successfully" 
          message="Your super admin ticket has been submitted." 
          onClose={() => navigate("/user/superadmin/support")} 
        />
      )}
    </div>
  );
};

export default AddTicketAdminPage;
