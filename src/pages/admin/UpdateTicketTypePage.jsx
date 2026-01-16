import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";

import {
  getTicketTypeById,
  updateTicketType,
} from "../../api/admin/ticket_type";

import { useAuth } from "../../context/AuthContext";

/* ================= SUCCESS MODAL ================= */
const SuccessModal = ({ onOk, message }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="success-icon">
        <i className="fa-solid fa-circle-check"></i>
      </div>
      <h2>Success</h2>
      <p>{message}</p>

      <button className="btn btn-primary" onClick={onOk}>
        OK
      </button>
    </div>
  </div>
);

function UpdateTicketTypePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("tickets");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const { logout } = useAuth();
  const { id } = useParams();
  const typeId = id;

  /* ================== LOAD DATA =================== */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const resp = await getTicketTypeById(Number(typeId));
        const t = resp?.ticket_type;

        setTitle(t?.title || "");
        setDescription(t?.description || "");
      } catch (err) {
        console.error("LOAD FAILED:", err);
        setError("Unable to load ticket type.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [typeId]);

  /* ================== HANDLE UPDATE =================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const resp = await updateTicketType({
        type_id: Number(typeId),
        title: title.trim(),
        description: description.trim(),
      });

      if (resp?.success === false) {
        setError(resp.message || "Failed to update ticket type.");
        setSaving(false);
        return;
      }

      // SUCCESS → show modal with backend message
      setSuccessMessage(resp.message || "Updated successfully");
      setShowSuccessModal(true);

    } catch (err) {
      console.error("UPDATE FAILED:", err);

      const status = err?.response?.status;
      const respData = err?.response?.data;

      if (status === 401 || status === 403) {
        setError(respData?.message || "Session expired. Please log in again.");
        logout();
        navigate("/", { replace: true });
        return;
      }

      setError(
        respData?.message ||
          respData?.detail ||
          respData?.error ||
          "Failed to update ticket type."
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

          <div className="the_line" />

          <div className="page-title">
            <h3>Update Ticket Type</h3>
            <p className="subtitle">Modify the existing ticket type.</p>
          </div>

          <div className="card">
            {loading ? (
              <div style={{ padding: "1.25rem" }}>Loading...</div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
                {error && (
                  <div style={{ color: "red", marginBottom: 10 }}>{error}</div>
                )}

                <div className="designation-page-form-row">
                  <label>Ticket Type Title</label>
                  <input
                    className="designation-page-form-input"
                    maxLength={"100"}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter ticket type title"
                    disabled={saving}
                  />
                </div>

                <div className="designation-page-form-row">
                  <label>Description</label>
                  <textarea
                    className="designation-page-form-input"
                    style={{ height: "150px", resize: "none" }}
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
                    {saving ? "Saving..." : "Update Ticket Type"}
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
            )}
          </div>
        </main>

        <div
          className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onOk={() => navigate("/admin/ticket-types")}
        />
      )}
    </>
  );
}

export default UpdateTicketTypePage;
