import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";
import ProtectedAction from "../../components/admin/ProtectedAction";

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

  // delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  /* ==============================
        LOAD TICKET TYPES
  =============================== */
  const fetchTicketTypes = async () => {
    setLoading(true);
    setError(null);

    try {
      const resp = await apiGetTicketTypes();

      let list = [];
      if (resp && Array.isArray(resp.types)) list = resp.types;
      else if (Array.isArray(resp)) list = resp;
      else if (Array.isArray(resp.results)) list = resp.results;
      else if (Array.isArray(resp.data)) list = resp.data;
      else if (resp && typeof resp === "object")
        list = resp.types || resp.results || resp.data || [];

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

  /* ==============================
         FRONTEND SEARCH
  =============================== */
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return ticketTypes;
    return ticketTypes.filter((t) =>
      (t.title || "").toLowerCase().includes(term)
    );
  }, [searchTerm, ticketTypes]);

  const totalCount = ticketTypes.length;
  const visibleCount = filtered.length;

  /* ==============================
            DELETE
  =============================== */
  const openDeleteModal = (item) => {
    setTypeToDelete(item);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTypeToDelete(null);
    setDeleting(false);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!typeToDelete) return;

    setDeleting(true);
    try {
      await apiDeleteTicketType(typeToDelete.id);

      setTicketTypes((prev) => prev.filter((t) => t.id !== typeToDelete.id));

      closeDeleteModal();
    } catch {
      setDeleteError("Unable to delete ticket type.");
      setDeleting(false);
    }
  };

  /* ==============================
              RENDER
  =============================== */
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

        <div className="the_line" />

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
                    <td
                      colSpan={5}
                      style={{ textAlign: "center", padding: "1.5rem" }}
                    >
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

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="modal-backdrop" style={backdropStyle}>
          <div style={modalStyle}>
            <h3>Confirm delete</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{typeToDelete?.title}</strong>?
            </p>

            {deleteError && (
              <div style={{ color: "orange", marginBottom: 8 }}>
                {deleteError}
              </div>
            )}

            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button className="btn" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* BACKDROP STYLE */
const backdropStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
};

/* MODAL STYLE */
const modalStyle = {
  background: "#fff",
  padding: "1.25rem",
  borderRadius: 8,
  width: 420,
};

export default TicketTypesPage;
