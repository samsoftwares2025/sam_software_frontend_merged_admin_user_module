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

import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";
import LoaderOverlay from "../../components/common/LoaderOverlay";

function UpdateComplianceTicketDetails() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("tickets");

  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("");

  /* ===== MODALS ===== */
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

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
    } catch {
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
      setSubmitting(true);

      const payload = {
        ticket_id: id,
        assigned_to: assignedTo,
        status,
      };

      const res = await updateSupportTicket(payload);

      if (res?.success) {
        setModalMessage("The support ticket has been updated successfully.");
        setShowSuccess(true);
      } else {
        setModalMessage(res?.message || "Could not update the ticket.");
        setShowError(true);
      }
    } catch {
      setModalMessage("A server error occurred while updating the ticket.");
      setShowError(true);
    } finally {
      setSubmitting(false);
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

            <div style={{ textAlign: "right", marginTop: 20 }}>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                Save Changes
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* LOADER */}
      {submitting && <LoaderOverlay />}

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <SuccessModal
          message={modalMessage}
          onClose={() => {
            setShowSuccess(false);
            navigate("/admin/compliance-documentation");
          }}
        />
      )}

      {/* ERROR MODAL */}
      {showError && (
        <ErrorModal
          message={modalMessage}
          onClose={() => setShowError(false)}
        />
      )}
    </>
  );
}

export default UpdateComplianceTicketDetails;
