import React, { useEffect, useState } from "react";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";
import { useParams } from "react-router-dom";
import { getSupportTicketById } from "../../api/admin/support_tickets";

/* Convert /media/... to full URL */
const getFileUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${window.location.origin}${url}`;
};

function ComplianceTicketDetails() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const downloadFile = async (fileUrl, fileName = "attachment") => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Unable to download file.");
    }
  };

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await getSupportTicketById(id);
      if (res?.support_ticket) setTicket(res.support_ticket);
      else setError("Ticket not found");
    } catch (err) {
      setError("Failed to load ticket details.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  if (loading)
    return (
      <div style={{ padding: "2rem", fontSize: 18 }}>Loading ticket...</div>
    );
  if (error)
    return <div style={{ padding: "2rem", color: "red" }}>{error}</div>;
  if (!ticket) return null;

  const file = getFileUrl(ticket.attachment?.url);
  const isImage = file && /\.(png|jpg|jpeg|gif|webp)$/i.test(file);

  return (
    <div className="container">
      <Sidebar
      isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        openSection={openSection}
        setOpenSection={setOpenSection} />
      <main className="main">
        <Header onMenuClick={() => setIsSidebarOpen((p) => !p)} />

        <div className="page-title">
          <h3>Ticket Details</h3>
          <p className="subtitle">A clean overview of this support ticket.</p>
        </div>

        {/* MAIN CARD */}
        <div className="ticket-box">
          {/* Row */}
          <div className="ticket-row">
            <label>Date</label>
            <span>
              {new Date(ticket.created_at).toLocaleDateString("en-GB")}
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
              className={`status-pill status-${ticket.status?.toLowerCase()}`}
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
                  onClick={() => downloadFile(file, ticket.attachment?.name)}
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
