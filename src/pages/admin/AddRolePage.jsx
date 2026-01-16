import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";

import { list_Permission_modules } from "../../api/admin/permission";
import { createRole } from "../../api/admin/roles";
import { useAuth } from "../../context/AuthContext";

/* ================= SUCCESS MODAL ================= */
const SuccessModal = ({ onOk }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="success-icon">
        <i className="fa-solid fa-circle-check"></i>
      </div>
      <h2>Role Added Successfully</h2>
      <p>The role has been added to the system.</p>
      <button className="btn btn-primary" onClick={onOk}>
        OK
      </button>
    </div>
  </div>
);

function AddRolePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [roleName, setRoleName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [modules, setModules] = useState([]); // ["Employee", "Department", ...]
  const [permissions, setPermissions] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  const permissionTypes = ["view", "add", "update", "delete"];

  /* ================= FETCH MODULES FROM API ================= */
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await list_Permission_modules();

        // API returns: { success: true, module_list: [ {id, name}, ... ] }
        const list = data.module_list || [];

        // Convert objects → string names
        const names = list.map((m) => m.name);

        setModules(names); // Now modules = ["Employee", "Department", ...]
      } catch (err) {
        console.error("Failed to load modules", err);
      }
    };

    fetchModules();
  }, []);

  /* ========== BUILD PERMISSIONS STRUCTURE WHEN MODULES LOAD ========== */
  useEffect(() => {
    if (modules.length === 0) return;

    const initial = modules.reduce((acc, name) => {
      acc[name] = { view: false, add: false, update: false, delete: false };
      return acc;
    }, {});

    setPermissions(initial);
  }, [modules]);

  /* =====================================================
       UPDATED PERMISSION LOGIC WITH DEPENDENCIES
     ===================================================== */
  const handlePermissionChange = (module, action) => {
    const current = permissions[module];
    let updated = { ...current };

    const isSupport = module === "Supporting Tickets";

    if (action === "view") {
      updated.view = !updated.view;
    }

    if (action === "add") {
      const newValue = !current.add;
      updated.add = newValue;

      // ❗ NO auto-select rules for Supporting Tickets
      if (!isSupport && newValue) {
        updated.view = true;
        updated.update = true;
        updated.delete = true;
      }
    }

    if (action === "update") {
      const newValue = !current.update;
      updated.update = newValue;

      if (!isSupport && newValue) {
        updated.view = true;
      }
    }

    if (action === "delete") {
      const newValue = !current.delete;
      updated.delete = newValue;

      if (!isSupport && newValue) {
        updated.view = true;
      }
    }

    setPermissions((prev) => ({
      ...prev,
      [module]: updated,
    }));
  };

  /* ===================== COLUMN TICK ALL ===================== */
  const toggleColumn = (action) => {
    const allChecked = modules.every((m) => permissions[m][action]);

    const updated = modules.reduce((acc, module) => {
      const isSupport = module === "Supporting Tickets";
      let state = { ...permissions[module] };

      state[action] = !allChecked;

      if (!isSupport && !allChecked) {
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
    modules.every((m) => permissions[m]?.[action] === true);

  /* ===================== GLOBAL TICK ALL ===================== */
  const tickAllPermissions = () => {
    const updated = modules.reduce((acc, module) => {
      const isSupport = module === "Supporting Tickets";

      acc[module] = isSupport
        ? { view: false, add: false, update: false, delete: false } // must tick manually
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

  /* ================= SUBMIT FORM ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) {
      setError("Please enter a role name.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createRole(roleName.trim(), permissions);

      setShowSuccessModal(true);
    } catch (err) {
      const status = err?.response?.status;
      const resp = err?.response?.data;

      if (status === 401 || status === 403) {
        logout();
        navigate("/", { replace: true });
        return;
      }

      setError(resp?.message || resp?.detail || "Failed to add role.");
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
            <h3>Add Role</h3>
            <p className="subtitle">Create a new user role.</p>
          </div>

          <div className="card">
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

              {/* GLOBAL TICK ALL */}
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

              {/* MODULE LIST */}
              {modules.length === 0 ? (
                <p>Loading permission modules...</p>
              ) : (
                <>
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
                            onChange={() =>
                              handlePermissionChange(module, action)
                            }
                          />
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </label>
                      ))}
                    </div>
                  ))}
                </>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button type="submit" className="btn btn-primary">
                  {saving ? "Saving..." : "Add Role"}
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
          </div>
        </main>
      </div>

      {showSuccessModal && (
        <SuccessModal onOk={() => navigate("/admin/roles-permissions")} />
      )}
    </>
  );
}

export default AddRolePage;
