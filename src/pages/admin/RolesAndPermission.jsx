import React, { useEffect, useState } from "react";
import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";
import "../../assets/styles/admin.css";
import { Link } from "react-router-dom";

import {
  listUserRoles,
  deleteUserRole
} from "../../api/admin/roles";

import ProtectedAction from "../../components/admin/ProtectedAction";

// NEW COMPONENTS
import LoaderOverlay from "../../components/common/LoaderOverlay";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

const RolesPermissions = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  // DELETE MODAL STATE
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // SUCCESS & ERROR MODALS
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setShowDeleteModal(false);
    setRoleToDelete(null);
    setDeleting(false);
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

      setSuccessMessage("Role deleted successfully.");
      setShowSuccessModal(true);
    } catch (err) {
      const backendMsg = err?.response?.data?.message;
      setErrorMessage(backendMsg || "Failed to delete role.");
      setShowErrorModal(true);
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
    <>
      {/* GLOBAL DELETING LOADER */}
      {deleting && <LoaderOverlay />}

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
              {error && <div style={{ marginLeft: 12, color: "orange" }}>{error}</div>}
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
            {loading ? (
              <div style={{ padding: "1.5rem" }}>Loading roles...</div>
            ) : error ? (
              <div style={{ padding: "1.5rem", color: "red" }}>{error}</div>
            ) : (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order No</th>
                      <th>Role Name</th>
                      <th>Modules</th>
                      <th>Permissions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRoles.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty-state">
                          No roles match your search
                        </td>
                      </tr>
                    ) : (
                      filteredRoles.map((role, index) => (
                        <tr key={role.id}>
                          <td style={{ textAlign: "center" }}>{index + 1}</td>
                          <td>{role.role}</td>

                          <td>{renderModules(role.permissions_list)}</td>

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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* DELETE CONFIRM MODAL */}
      {showDeleteModal && (
        <DeleteConfirmModal
          title="Delete Role"
          message={`Are you sure you want to delete "${roleToDelete?.role}"?`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={closeDeleteModal}
        />
      )}

      <div
        className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />
    </>
  );
};

export default RolesPermissions;
