// src/pages/admin/ComplianceTicketDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import Header from "../../../components/common/Header";
import "../../../assets/styles/admin.css";
import { getSupportTicketById } from "../../../api/admin/support_tickets";
import { API_BASE_URL } from "../../../api/config";

const getFileUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};



function ComplianceTicketDetails() {
  const { id } = useParams(); // same as EmployeeProfile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchTicket = async () => {
      try {
        const res = await getSupportTicketById(id);

        if (!res?.support_ticket) {
          throw new Error("Ticket not found");
        }

        if (mounted) setTicket(res.support_ticket);
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load ticket details.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTicket();
    return () => (mounted = false);
  }, [id]);

  if (loading) {
    return <main className="main">Loading ticket...</main>;
  }

  if (error) {
    return <main className="main">{error}</main>;
  }

  if (!ticket) {
    return <main className="main">No ticket data found.</main>;
  }

  const file = getFileUrl(ticket.attachment?.url);
  const isImage = file && /\.(png|jpg|jpeg|gif|webp)$/i.test(file);

  return (
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
          <h3>Ticket Details</h3>
          <p className="subtitle">A clean overview of this support ticket.</p>
        </div>

        <div className="ticket-box">
          <div className="ticket-row">
            <label>Date</label>
            <span>
              {ticket.created_at
                ? new Date(ticket.created_at).toLocaleDateString("en-GB")
                : "-"}
            </span>
          </div>

          <div className="ticket-row">
            <label>Tracking ID</label>
            <span>{ticket.tracking_id}</span>
          </div>

          <div className="ticket-row">
            <label>Subject</label>
            <span>{ticket.subject}</span>
          </div>

          <div className="ticket-row">
            <label>Content</label>
            <span style={{ whiteSpace: "pre-line" }}>{ticket.content}</span>
          </div>

          <div className="ticket-row">
            <label>Submitted By</label>
            <span>{ticket.submitted_by_name || "-"}</span>
          </div>

          <div className="ticket-row">
            <label>Assigned To</label>
            <span>{ticket.assigned_to_name || "-"}</span>
          </div>

          <div className="ticket-row">
            <label>Status</label>
            <span
              className={`status-pill status-${ticket.status
                ?.toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              {ticket.status}
            </span>
          </div>

          <div className="ticket-row">
            <label>Attachment</label>

            {file ? (
              <div className="file-actions">
                <button
                  className="btn view-btn"
                  onClick={() =>
                    isImage ? setPreview(file) : window.open(file, "_blank")
                  }
                >
                  View
                </button>

                <button
                  className="btn download-btn"
                  onClick={async () => {
                    const response = await fetch(file);
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = ticket.attachment?.name || "attachment";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download
                </button>
              </div>
            ) : (
              <span>No Attachment</span>
            )}
          </div>
        </div>
      </main>

      <div
        id="sidebarOverlay"
        className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      {/* IMAGE PREVIEW */}
      {preview && (
        <div className="modal-backdrop" onClick={() => setPreview(null)}>
          <div className="image-modal">
            <img src={preview} alt="Preview" />
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplianceTicketDetails;
