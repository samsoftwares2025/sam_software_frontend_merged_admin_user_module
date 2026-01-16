import React, { useEffect, useState } from "react";
import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";
import "../../assets/styles/admin.css";
import { Link } from "react-router-dom";

import { listUserRoles, deleteUserRole } from "../../api/admin/roles";
import ProtectedAction from "../../components/admin/ProtectedAction";


const RolesPermissions = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  /* ================= FETCH ROLES ================= */
  const fetchRoles = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await listUserRoles();

      if (res?.success) {
        setRoles(res.user_roles || []);
        setFilteredRoles(res.user_roles || []);
      } else {
        setError(res?.message || "Failed to load roles");
      }
    } catch (err) {
      console.error("GET ROLES FAILED:", err);
      setError("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  /* ================= SEARCH FILTER ================= */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRoles(roles);
      return;
    }

    const term = searchTerm.toLowerCase();

    setFilteredRoles(
      roles.filter((role) => role.role.toLowerCase().includes(term))
    );
  }, [searchTerm, roles]);

  /* ================= DELETE HANDLING ================= */
  const openDeleteModal = (role) => {
    setRoleToDelete(role);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setRoleToDelete(null);
    setDeleting(false);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;
    setDeleting(true);

    try {
      await deleteUserRole(roleToDelete.id);

      setRoles((prev) => prev.filter((r) => r.id !== roleToDelete.id));
      setFilteredRoles((prev) =>
        prev.filter((r) => r.id !== roleToDelete.id)
      );

      closeDeleteModal();
    } catch (err) {
      console.error("DELETE ROLE FAILED:", err);
      setDeleteError(err?.response?.data?.message || "Failed to delete role");
      setDeleting(false);
    }
  };

  /* ================= MULTILINE DISPLAY ================= */
  const renderModules = (permissions) => {
    if (!permissions || permissions.length === 0) return "—";

    return (
      <div style={{ whiteSpace: "pre-line" }}>
        {permissions.map((p) => p.module_name).join("\n")}
      </div>
    );
  };

 const renderPermissionSummary = (permissions) => {
  if (!permissions || permissions.length === 0) return "—";

  return (
    <div style={{ whiteSpace: "pre-line" }}>
      {permissions
        .map((p) => {
          const perms = [];
          if (p.view) perms.push("View");
          if (p.add) perms.push("Add");
          if (p.update) perms.push("Update");
          if (p.delete) perms.push("Delete");

          return perms.length > 0 ? perms.join(", ") : "—";
        })
        .join("\n")}
    </div>
  );
};


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

        <div className="header">
          <div className="page-title">
            <h1>Roles and Permissions</h1>
            <p className="subtitle">Manage user roles dynamically.</p>
          </div>
        </div>

        <div className="filters-container">
          <div className="filters-left">
            <div className="search-input">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                type="text"
                placeholder="Search by Role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading && <div style={{ marginLeft: 12 }}>Loading...</div>}
            {error && (
              <div style={{ marginLeft: 12, color: "orange" }}>{error}</div>
            )}
          </div>

          <div className="filters-right">
            <button className="btn" onClick={fetchRoles}>
              <i className="fa-solid fa-rotate" /> Refresh
            </button>

            <ProtectedAction
  module="roles & permissions"
  action="add"
  to="/admin/add-role"
  className="btn btn-primary"
>
  <i className="fa-solid fa-plus" /> Create New Role
</ProtectedAction>

          </div>
        </div>

        {/* ================= TABLE ================= */}
        <section className="table-container">
          {loading && <div style={{ padding: "1.5rem" }}>Loading roles...</div>}

          {!loading && error && (
            <div style={{ padding: "1.5rem", color: "red" }}>{error}</div>
          )}

          {!loading && !error && (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "5%" }}>#</th>
                    <th>Role Name</th>
                    <th>Modules</th>
                    <th>Permissions</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRoles.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        No roles match your search
                      </td>
                    </tr>
                  )}

                  {filteredRoles.map((role, index) => (
                    <tr key={role.id}>
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td>{role.role}</td>

                      {/* MULTILINE MODULES */}
                      <td>{renderModules(role.permissions_list)}</td>

                      {/* MULTILINE PERMISSIONS */}
                      <td>{renderPermissionSummary(role.permissions_list)}</td>

                      <td>
                        <div className="table-actions">
                      

                         <ProtectedAction
  module="roles & permissions"
  action="update"
  to={`/admin/update-role/${role.id}`}
  className="icon-btn edit"
>
  <i className="fa-solid fa-pen" />
</ProtectedAction>


                        <ProtectedAction
  module="roles & permissions"
  action="delete"
  onAllowed={() => openDeleteModal(role)}
  className="icon-btn delete"
>
  <i className="fa-solid fa-trash" />
</ProtectedAction>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="modal-backdrop" style={backdropStyle}>
          <div className="modal" style={modalStyle}>
            <h3>Confirm delete</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{roleToDelete?.role}</strong>?
            </p>

            {deleteError && (
              <div style={{ color: "orange", marginBottom: 8 }}>
                {deleteError}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
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

      <div
        className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />
    </div>
  );
};

/* ================= MODAL STYLES ================= */
const backdropStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
};

const modalStyle = {
  width: 420,
  background: "#fff",
  padding: "1.25rem",
  borderRadius: 8,
  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
};

export default RolesPermissions;
