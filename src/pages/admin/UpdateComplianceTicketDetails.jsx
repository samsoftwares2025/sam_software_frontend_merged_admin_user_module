import React, { useEffect, useState } from "react";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSupportTicketById,
  updateSupportTicket,
} from "../../api/admin/support_tickets";
import { getEmployeesList } from "../../api/admin/employees";
import Select from "react-select";

/* ================= SHARED MODAL (Same UI) ================= */
const InfoModal = ({ title, message, onOk, isError }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div
        className="success-icon"
        style={{ color: isError ? "#dc3545" : "#28a745" }}
      >
        <i
          className={`fa-solid ${
            isError ? "fa-circle-exclamation" : "fa-circle-check"
          }`}
        ></i>
      </div>

      <h2>{title}</h2>
      <p>{message}</p>

      <button className="btn btn-primary" onClick={onOk}>
        OK
      </button>
    </div>
  </div>
);

function UpdateComplianceTicketDetails() {
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalError, setModalError] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("tickets");

  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("");

  /* ========== Fetch Ticket ========== */
  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await getSupportTicketById(id);

      if (res?.support_ticket) {
        const t = res.support_ticket;
        setTicket(t);
        setAssignedTo(t.assigned_to || "");
        setStatus(t.status || "");
      } else {
        setError("Ticket not found");
      }
    } catch (err) {
      setError("Failed to load ticket details.");
    }
    setLoading(false);
  };

  /* ========== Fetch Employees ========== */
  const fetchEmployees = async () => {
    try {
      const list = await getEmployeesList();
      setEmployees(list);
    } catch (err) {
      console.log("Employee list error:", err);
    }
  };

  /* ========== Submit Update ========== */
  const handleSubmit = async () => {
    try {
      const payload = {
        ticket_id: id,
        assigned_to: assignedTo,
        status,
      };

      const res = await updateSupportTicket(payload);

      if (res.success) {
        setModalTitle("Ticket Updated Successfully");
        setModalMessage("The support ticket has been updated in the system.");
        setModalError(false);
        setShowModal(true);
      } else {
        setModalTitle("Update Failed");
        setModalMessage(res.message || "Could not update the ticket.");
        setModalError(true);
        setShowModal(true);
      }
    } catch (err) {
      setModalTitle("Error");
      setModalMessage("A server error occurred while updating the ticket.");
      setModalError(true);
      setShowModal(true);
    }
  };

  useEffect(() => {
    fetchTicket();
    fetchEmployees();
  }, [id]);

  if (loading) return <div style={{ padding: "2rem" }}>Loading ticket...</div>;
  if (error)
    return <div style={{ padding: "2rem", color: "red" }}>{error}</div>;
  if (!ticket) return null;

  const employeeOptions = employees.map((emp) => ({
    value: emp.id,
    label: `${emp.name} (${emp.employee_id})`,
  }));

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
            <h3>Update Ticket</h3>
            <p className="subtitle">Modify only allowed fields.</p>
          </div>

          <div className="ticket-box">
            <div className="ticket-row">
              <label>Date</label>
              <span>
                {ticket.created_on || ticket.created_at
                  ? new Date(
                      ticket.created_on || ticket.created_at
                    ).toLocaleDateString("en-GB")
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
              <span style={{ whiteSpace: "pre-line" }}>
                {ticket.content}
              </span>
            </div>

            <div className="ticket-row">
              <label>Submitted By</label>
              <span>{ticket.submitted_by_name || "-"}</span>
            </div>

            {/* Assigned To */}
            <div className="ticket-row">
              <label>Assigned To</label>
              <div style={{ width: "300px" }}>
                <Select
                  classNamePrefix="react-select"
                  options={employeeOptions}
                  isClearable
                  placeholder="Search & select employee..."
                  value={employeeOptions.find(
                    (opt) => opt.value === Number(assignedTo)
                  )}
                  onChange={(option) =>
                    setAssignedTo(option ? option.value : "")
                  }
                />
              </div>
            </div>

            {/* Status */}
            <div className="ticket-row">
              <label>Status</label>
              <div style={{ width: "300px" }}>
                <select
                  className="input-select same-size-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Hold">Hold</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <div style={{ textAlign: "right", marginTop: 20 }}>
              <button className="btn btn-primary" onClick={handleSubmit}>
                Save Changes
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* SHARED MODAL */}
      {showModal && (
        <InfoModal
          title={modalTitle}
          message={modalMessage}
          isError={modalError}
          onOk={() => {
            if (!modalError) {
              navigate("/admin/compliance-documentation");
            }
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}

export default UpdateComplianceTicketDetails;
