import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";
import ProtectedAction from "../../components/admin/ProtectedAction";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";


import {
  getTicketTypes as apiGetTicketTypes,
  deleteTicketType as apiDeleteTicketType,
} from "../../api/admin/ticket_type";

function TicketTypesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("tickets");

  const [searchTerm, setSearchTerm] = useState("");
  const [ticketTypes, setTicketTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ================= Success MODAL ================= */
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  /* ================= DELETE MODAL ================= */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ================= LOAD DATA ================= */
  const fetchTicketTypes = async () => {
    setLoading(true);
    setError(null);

    try {
      const resp = await apiGetTicketTypes();

      let list = [];
      if (Array.isArray(resp?.types)) list = resp.types;
      else if (Array.isArray(resp)) list = resp;
      else if (Array.isArray(resp?.results)) list = resp.results;
      else if (Array.isArray(resp?.data)) list = resp.data;

      setTicketTypes(Array.isArray(list) ? list : []);
    } catch (err) {
      const status = err?.response?.status;
      const respData = err?.response?.data;

      setError(
        respData?.message ||
          respData?.detail ||
          (status
            ? `Unable to load ticket types (status ${status})`
            : "Unable to load ticket types.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketTypes();
  }, []);

  /* ================= SEARCH ================= */
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return ticketTypes;
    return ticketTypes.filter((t) =>
      (t.title || "").toLowerCase().includes(term)
    );
  }, [searchTerm, ticketTypes]);

  const totalCount = ticketTypes.length;
  const visibleCount = filtered.length;

  /* ================= DELETE HANDLERS ================= */
const openDeleteModal = (item) => {
  setTypeToDelete(item);
  setShowDeleteModal(true);
};


  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTypeToDelete(null);
    setDeleting(false);
  };

 const confirmDelete = async () => {
  if (!typeToDelete) return;

  setDeleting(true);
  try {
    await apiDeleteTicketType(typeToDelete.id);

    setTicketTypes((prev) =>
      prev.filter((t) => t.id !== typeToDelete.id)
    );

    closeDeleteModal();

    setSuccessMessage("Ticket type deleted successfully.");
    setShowSuccessModal(true);
  } catch {
    setDeleting(false);

    setErrorMessage("Failed to delete ticket type.");
    setShowErrorModal(true);
  }
};


  /* ================= RENDER ================= */
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
          <h3>Ticket Types</h3>
          <p className="subtitle">Manage your support ticket types.</p>
        </div>

        <div className="filters-container">
          <div className="filters-left">
            <div className="search-input">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                type="text"
                placeholder="Search ticket type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading && <div style={{ marginLeft: 12 }}>Loading...</div>}
            {error && (
              <div style={{ marginLeft: 12, color: "orange" }}>{error}</div>
            )}
          </div>

          <div className="filters-right" style={{ display: "flex", gap: 8 }}>
            <button
              className="btn"
              onClick={fetchTicketTypes}
              disabled={loading}
            >
              <i className="fa-solid fa-rotate" /> Refresh
            </button>

            <ProtectedAction
              module="ticket type"
              action="add"
              to="/admin/add-ticket-type"
              className="btn btn-primary"
            >
              <i className="fa-solid fa-plus" /> Add Type
            </ProtectedAction>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-container">
          <div className="table-header-bar">
            <h4>
              Ticket Types{" "}
              <span className="badge-pill">Total: {visibleCount}</span>
            </h4>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "8%" }}>Order No</th>
                  <th style={{ width: "20%" }}>Title</th>
                  <th style={{ width: "55%" }}>Description</th>
                  <th style={{ width: "17%" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((row, index) => (
                  <tr key={row.id}>
                    <td style={{ textAlign: "center" }}>{index + 1}</td>
                    <td className="wrap">{row.title}</td>
                    <td className="wrap">{row.description || "-"}</td>
                    <td>
                      <div className="table-actions">
                        <ProtectedAction
                          module="ticket type"
                          action="update"
                          to={`/admin/update-ticket-type/${row.id}`}
                          className="icon-btn edit"
                          title="Edit Ticket Type"
                        >
                          <i className="fa-solid fa-pen" />
                        </ProtectedAction>

                        <ProtectedAction
                          module="ticket type"
                          action="delete"
                          onAllowed={() => openDeleteModal(row)}
                          className="icon-btn delete"
                          title="Delete Ticket Type"
                        >
                          <i className="fa-solid fa-trash" />
                        </ProtectedAction>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "1.5rem" }}>
                      No ticket types found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            Showing {visibleCount} of {totalCount} ticket types
          </div>
        </div>
      </main>
 {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {/* ERROR MODAL */}
{showErrorModal && (
  <ErrorModal
    message={errorMessage}
    onClose={() => setShowErrorModal(false)}
  />
)}

      {/* COMMON DELETE MODAL */}
      {showDeleteModal && (
        <DeleteConfirmModal
          title="Confirm delete"
          message={`Are you sure you want to delete "${typeToDelete?.title}"?`}
          loading={deleting}
          onClose={closeDeleteModal}

          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

export default TicketTypesPage;
