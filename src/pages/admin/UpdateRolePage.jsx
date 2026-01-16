import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";

import { getUserRoleById, updateRole } from "../../api/admin/roles";
import { list_Permission_modules } from "../../api/admin/permission";
import { useAuth } from "../../context/AuthContext";

/* ================= SUCCESS MODAL ================= */
const SuccessModal = ({ onOk }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="success-icon">
        <i className="fa-solid fa-circle-check"></i>
      </div>
      <h2>Role Updated</h2>
      <p>The user role has been updated successfully.</p>
      <button className="btn btn-primary" onClick={onOk}>
        OK
      </button>
    </div>
  </div>
);

function UpdateRolePage() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [roleName, setRoleName] = useState("");

  const [modules, setModules] = useState([]);
  const [permissions, setPermissions] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const permissionTypes = ["view", "add", "update", "delete"];

  /* ================= FETCH MODULE LIST FIRST ================= */
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await list_Permission_modules();
        const names = (res.module_list || []).map((m) => m.name);
        setModules(names);
      } catch (err) {
        console.error("Module Load Failed", err);
      }
    };

    fetchModules();
  }, []);

  /* ================= FETCH ROLE DATA AFTER MODULES READY ================= */
  useEffect(() => {
    if (modules.length === 0) return;

    const loadRole = async () => {
      try {
        const res = await getUserRoleById(roleId);

        if (!res.success) {
          setError("Failed to load role.");
          setLoading(false);
          return;
        }

        const role = res.user_role;
        setRoleName(role.role);

        const emptyPermissions = modules.reduce((acc, m) => {
          acc[m] = { view: false, add: false, update: false, delete: false };
          return acc;
        }, {});

        const formatted = { ...emptyPermissions };

        if (Array.isArray(role.permissions)) {
          role.permissions.forEach((p) => {
            formatted[p.module_name] = {
              view: p.view,
              add: p.add,
              update: p.update,
              delete: p.delete,
            };
          });
        }

        setPermissions(formatted);
      } catch (err) {
        console.error("LOAD ROLE FAILED:", err);
        setError("Failed to load role.");
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, [modules, roleId]);

  /* ================= PERMISSION CHANGE ================= */
  const handlePermissionChange = (module, action) => {
    const current = permissions[module];
    let updated = { ...current };
    const isSupport = module === "Supporting Tickets";

    if (action === "view") updated.view = !updated.view;

    if (action === "add") {
      const v = !current.add;
      updated.add = v;
      if (!isSupport && v) {
        updated.view = true;
        updated.update = true;
        updated.delete = true;
      }
    }

    if (action === "update") {
      const v = !current.update;
      updated.update = v;
      if (!isSupport && v) updated.view = true;
    }

    if (action === "delete") {
      const v = !current.delete;
      updated.delete = v;
      if (!isSupport && v) updated.view = true;
    }

    setPermissions((prev) => ({ ...prev, [module]: updated }));
  };

  /* ================= COLUMN TICK ALL ================= */
  const toggleColumn = (action) => {
    const allChecked = modules.every((m) => permissions[m][action] === true);

    const updated = modules.reduce((acc, module) => {
      const isSupport = module === "Supporting Tickets";
      let state = { ...permissions[module] };

      state[action] = !allChecked;

      if (!allChecked && !isSupport) {
        if (action === "add") {
          state.view = true;
          state.update = true;
          state.delete = true;
        }
        if (action === "update" || action === "delete") {
          state.view = true;
        }
      }

      acc[module] = state;
      return acc;
    }, {});

    setPermissions(updated);
  };

  const isColumnChecked = (action) =>
    modules.every((m) => permissions[m]?.[action]);

  /* ================= GLOBAL TICK ALL ================= */
  const tickAllPermissions = () => {
    const updated = modules.reduce((acc, m) => {
      const isSupport = m === "Supporting Tickets";
      acc[m] = isSupport
        ? { view: false, add: false, update: false, delete: false }
        : { view: true, add: true, update: true, delete: true };
      return acc;
    }, {});
    setPermissions(updated);
  };

  const unTickAllPermissions = () => {
    const updated = modules.reduce((acc, m) => {
      acc[m] = { view: false, add: false, update: false, delete: false };
      return acc;
    }, {});
    setPermissions(updated);
  };

  const isAllChecked = modules.every(
    (m) =>
      permissions[m]?.view &&
      permissions[m]?.add &&
      permissions[m]?.update &&
      permissions[m]?.delete
  );

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const resp = await updateRole(roleId, {
        roleName,
        permissions,
      });

      if (!resp.success) {
        setError(resp.message || "Failed to update role.");
        return;
      }

      setShowSuccessModal(true);
    } catch (err) {
      const backendMessage =
        err?.response?.data?.message || "Failed to update role.";
      setError(backendMessage);
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <div className="container">
        <Sidebar
          isMobileOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          openSection="organization"
        />

        <main className="main">
          <Header onMenuClick={() => setIsSidebarOpen((p) => !p)} />
          <div className="the_line" />

          <div className="page-title">
            <h3>Update Role</h3>
            <p className="subtitle">Modify existing user role.</p>
          </div>

          <div className="card">
            {loading ? (
              <div style={{ padding: "1.25rem" }}>Loading role...</div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
                {error && (
                  <div style={{ color: "red", marginBottom: 10 }}>{error}</div>
                )}

                {/* ROLE NAME */}
                <div className="designation-page-form-row">
                  <label>Role Name</label>
                  <input
                    className="designation-page-form-input"
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="Enter role name"
                  />
                </div>

                {/* PERMISSIONS TITLE */}
                <h4 style={{ marginTop: 20 }}>Permissions</h4>

                {/* TICK ALL */}
                <div style={{ marginBottom: 15 }}>
                  <label style={{ fontWeight: "600" }}>
                    <input
                      type="checkbox"
                      checked={isAllChecked}
                      onChange={(e) =>
                        e.target.checked
                          ? tickAllPermissions()
                          : unTickAllPermissions()
                      }
                      style={{ marginRight: 8 }}
                    />
                    Tick All Permissions
                  </label>
                </div>

                {/* COLUMN TICK ALL */}
                <div className="permission-grid permission-grid-header">
                  <div></div>

                  {permissionTypes.map((action) => (
                    <label key={action}>
                      <input
                        type="checkbox"
                        checked={isColumnChecked(action)}
                        onChange={() => toggleColumn(action)}
                      />
                      {action.charAt(0).toUpperCase() + action.slice(1)} (All)
                    </label>
                  ))}
                </div>

                {/* MODULE ROWS */}
                {modules.map((module) => (
                  <div key={module} className="permission-grid">
                    <strong>{module}</strong>

                    {permissionTypes.map((action) => (
                      <label key={action}>
                        <input
                          type="checkbox"
                          checked={permissions[module]?.[action] || false}
                          onChange={() => handlePermissionChange(module, action)}
                        />
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </label>
                    ))}
                  </div>
                ))}

                {/* BUTTONS */}
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Updating..." : "Update Role"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => navigate("/admin/roles-permissions")}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>

      {showSuccessModal && (
        <SuccessModal onOk={() => navigate("/admin/roles-permissions")} />
      )}
    </>
  );
}

export default UpdateRolePage;
