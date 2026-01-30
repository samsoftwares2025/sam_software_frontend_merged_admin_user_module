import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";

import LoaderOverlay from "../../components/common/LoaderOverlay";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";
import { toSentenceCase } from "../../utils/textFormatters";

import "../../assets/styles/admin.css";

import { list_Permission_modules } from "../../api/admin/permission";
import { createRole } from "../../api/admin/roles";
import { useAuth } from "../../context/AuthContext";

function AddRolePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("organization");

  const [roleName, setRoleName] = useState("");
  const [modules, setModules] = useState([]);
  const [permissions, setPermissions] = useState({});

  const permissionTypes = ["view", "add", "update", "delete"];

  // Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  /* ================= FETCH MODULES ================= */
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await list_Permission_modules();
        const names = (data?.module_list || []).map((m) => m.name);
        setModules(names);
      } catch (err) {
        setErrorMessage("Failed to load permission modules.");
        setShowErrorModal(true);
      }
    };

    fetchModules();
  }, []);

  /* ================= INIT PERMISSIONS ================= */
  useEffect(() => {
    if (modules.length === 0) return;

    const initial = modules.reduce((acc, name) => {
      acc[name] = { view: false, add: false, update: false, delete: false };
      return acc;
    }, {});

    setPermissions(initial);
  }, [modules]);

  /* ================= PERMISSION LOGIC ================= */
  const handlePermissionChange = (module, action) => {
    const current = permissions[module];
    const isSupport = module === "Supporting Tickets";

    let updated = { ...current };

    // BASE CLICK
    updated[action] = !current[action];

    if (!isSupport) {
      // dependencies
      if (action === "add" && updated.add) {
        updated.view = true;
        updated.update = true;
        updated.delete = true;
      }

      if ((action === "update" || action === "delete") && updated[action]) {
        updated.view = true;
      }
    }

    setPermissions((prev) => ({
      ...prev,
      [module]: updated,
    }));
  };

  /* ================= COLUMN CHECK ================= */
  const isColumnChecked = (action) =>
    modules.every((m) => permissions[m]?.[action] === true);

  const toggleColumn = (action) => {
    const allChecked = isColumnChecked(action);

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

  /* ================= GLOBAL TICK ALL ================= */
  const isAllChecked = modules.every(
    (m) =>
      permissions[m]?.view &&
      permissions[m]?.add &&
      permissions[m]?.update &&
      permissions[m]?.delete
  );

  const tickAllPermissions = () => {
    const updated = modules.reduce((acc, module) => {
      const isSupport = module === "Supporting Tickets";

      acc[module] = isSupport
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

  /* ================= SUBMIT FORM ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) {
      setErrorMessage("Please enter a role name.");
      setShowErrorModal(true);
      return;
    }

    setSaving(true);
    setProcessing(true);

    try {
      const resp = await createRole(roleName.trim(), permissions);

      setShowSuccessModal(true);
    } catch (err) {
      const status = err?.response?.status;
      const resp = err?.response?.data;

      if (status === 401 || status === 403) {
        logout();
        navigate("/", { replace: true });
        return;
      }

      setErrorMessage(resp?.message || "Failed to create role.");
      setShowErrorModal(true);
    } finally {
      setSaving(false);
      setProcessing(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <>
      {processing && <LoaderOverlay />}

      {showSuccessModal && (
        <SuccessModal
          message="Role created successfully!"
          onClose={() => navigate("/admin/roles-permissions")}
        />
      )}

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

          <div className="page-title">
            <h3>Add Role</h3>
            <p className="subtitle">Create a new user role.</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
              {/* ROLE NAME */}
              <div className="designation-page-form-row">
                <label>Role Name</label>
                <input
                  className="designation-page-form-input"
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  onBlur={() => setRoleName(toSentenceCase(roleName))}
                  placeholder="Enter role name"
                />
              </div>

              <h4 style={{ marginTop: 20 }}>Permissions</h4>

              {/* GLOBAL TICK ALL */}
              <label style={{ fontWeight: 600 }}>
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

              {modules.length === 0 ? (
                <p style={{ marginTop: 10 }}>Loading permission modules...</p>
              ) : (
                <>
                  {/* COLUMN HEADERS */}
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

                  {/* MODULE PERMISSIONS */}
                  {modules.map((module) => (
                    <div className="permission-grid" key={module}>
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
        
      <div
        id="sidebarOverlay"
        className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      </div>
    </>
  );
}

export default AddRolePage;
