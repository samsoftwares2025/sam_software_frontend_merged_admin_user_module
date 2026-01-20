import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";

import { createTicketType } from "../../api/admin/ticket_type"; // <-- UPDATED
import { useAuth } from "../../context/AuthContext";

/* ================= SUCCESS MODAL ================= */
const SuccessModal = ({ onOk }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="success-icon">
        <i className="fa-solid fa-circle-check"></i>
      </div>
      <h2>Ticket Type Added</h2>
      <p>The ticket type has been added successfully.</p>
      <button className="btn btn-primary" onClick={onOk}>
        OK
      </button>
    </div>
  </div>
);

function AddTicketTypePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection,setOpenSection] = useState("tickets");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  /* ================== HANDLE SUBMIT =================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createTicketType({
        title: title.trim(),
        description: description.trim(),
      });

      setShowSuccessModal(true);
    } catch (err) {
      console.error("ADD TICKET TYPE FAILED:", err);

      const status = err?.response?.status;
      const respData = err?.response?.data;

      if (status === 401 || status === 403) {
        setError(respData?.detail || "Session expired. Please log in again.");
        logout();
        navigate("/", { replace: true });
        return;
      }

      setError(
        respData?.message ||
          respData?.detail ||
          respData?.error ||
          "Failed to add ticket type."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
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
            <h3>Add Ticket Type</h3>
            <p className="subtitle">Create a new ticket type for your helpdesk.</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
              {error && (
                <div style={{ color: "red", marginBottom: 10 }}>{error}</div>
              )}

              {/* TITLE FIELD */}
              <div className="designation-page-form-row">
                <label>Ticket Type Title</label>
                <input
                  className="designation-page-form-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter ticket type title"
                  disabled={saving}
                />
              </div>

              {/* DESCRIPTION FIELD */}
              <div className="designation-page-form-row">
                <label>Description</label>
                <textarea
                  className="designation-page-form-input"
                  style={{ height: "90px", resize: "none" }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  disabled={saving}
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Add Ticket Type"}
                </button>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate("/admin/ticket-types")}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>

        {/* FIXED overlay must NOT be self-closing */}
        <div
          className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <SuccessModal onOk={() => navigate("/admin/ticket-types/")} />
      )}
    </>
  );
}

export default AddTicketTypePage;
