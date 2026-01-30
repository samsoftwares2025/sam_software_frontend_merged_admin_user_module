import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toSentenceCase } from "../../utils/textFormatters";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";

import LoaderOverlay from "../../components/common/LoaderOverlay";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

import {
  addSupportTicket,
  getTicketTypes,
} from "../../api/user/supportTickets";

const AddTicket = () => {
  const navigate = useNavigate();

  /* ===== SIDEBAR ===== */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);

  /* ===== FORM STATE ===== */
  const [ticketTypes, setTicketTypes] = useState([]);
  const [ticketTypeId, setTicketTypeId] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState(null);

  /* ===== UI STATE ===== */
  const [loading, setLoading] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ===== LOAD TICKET TYPES ===== */
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await getTicketTypes();

        if (!res?.success) {
          throw new Error(res?.message || "Failed to load ticket types.");
        }

        setTicketTypes(res.types || []);
      } catch (err) {
        setErrorMessage(err.message || "Failed to load ticket types.");
        setShowErrorModal(true);
      }
    };

    fetchTypes();
  }, []);

  /* ===== SUBMIT ===== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ticketTypeId) {
      setErrorMessage("Please select a ticket type.");
      setShowErrorModal(true);
      return;
    }

    if (!subject.trim() || !content.trim()) {
      setErrorMessage("Subject and message are required.");
      setShowErrorModal(true);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("ticket_type_id", ticketTypeId);
    formData.append("subject", subject.trim());
    formData.append("content", content.trim());
    if (attachment) formData.append("attachment", attachment);

    try {
      const res = await addSupportTicket(formData);

      if (!res?.success) {
        throw new Error(res?.message || "Failed to create ticket.");
      }

      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage(
        err.message || "Something went wrong. Please try again."
      );
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

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
          message="Your support ticket has been submitted successfully."
          onClose={() => navigate("/user/support")}
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

        {/* ===== MAIN ===== */}
        <main className="main add-ticket-page">
          {/* ✅ SAME HEADER TOGGLE AS OTHER PAGES */}
          <Header
            onMenuClick={() => setIsSidebarOpen((p) => !p)}
          />

          <div className="page-header">
            <div className="page-title">
              <h3>Add Support Ticket</h3>
              <p>Raise a new support ticket</p>
            </div>
          </div>

          <div className="form-container">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label required">
                    Ticket Type
                  </label>
                  <select
                    className="form-select"
                    value={ticketTypeId}
                    onChange={(e) =>
                      setTicketTypeId(e.target.value)
                    }
                    disabled={loading}
                  >
                    <option value="">Select Ticket Type</option>
                    {ticketTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.title}
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
                    onBlur={(e) => setSubject(toSentenceCase(e.target.value))}
                    disabled={loading}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label required">Message</label>
                  <textarea
                    className="form-textarea"
                    rows="5"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={(e) => setContent(toSentenceCase(e.target.value))}
                    disabled={loading}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    Attachment{" "}
                    <span className="small">(optional)</span>
                  </label>
                  <input
                    className="form-input"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    onChange={(e) =>
                      setAttachment(e.target.files[0])
                    }
                    disabled={loading}
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
                  onClick={() => navigate("/user/support")}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>

        {/* ===== OVERLAY ===== */}
        {isSidebarOpen && (
          <div
            className="sidebar-overlay show"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default AddTicket;
