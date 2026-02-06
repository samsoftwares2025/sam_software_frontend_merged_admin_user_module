import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../../../components/common/Sidebar";
import Header from "../../../components/common/Header";
import LoaderOverlay from "../../../components/common/LoaderOverlay";
import SuccessModal from "../../../components/common/SuccessModal";
import ErrorModal from "../../../components/common/ErrorModal";
import { toSentenceCase } from "../../../utils/textFormatters";

import "../../../assets/styles/admin.css";


import { getUserRoleById, updateRole } from "../../../api/admin/roles";
import { list_Permission_modules } from "../../../api/admin/permission";
import { useAuth } from "../../../context/AuthContext";

function UpdateRolePage() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [roleName, setRoleName] = useState("");
  const [modules, setModules] = useState([]);
  const [permissions, setPermissions] = useState({});

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const permissionTypes = ["view", "add", "update", "delete"];

  /* ================= LOAD PERMISSION MODULES ================= */
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await list_Permission_modules();
        const names = (res.module_list || []).map((m) => m.name);
        setModules(names);
      } catch (err) {
        setErrorMessage("Failed to load permission modules.");
        setShowErrorModal(true);
      }
    };

    fetchModules();
  }, []);

  /* ================= LOAD ROLE DATA AFTER MODULES ================= */
  useEffect(() => {
    if (modules.length === 0) return;

    const loadRole = async () => {
      try {
        const res = await getUserRoleById(roleId);

        if (!res.success) {
          setErrorMessage("Failed to load role.");
          setShowErrorModal(true);
          setLoading(false);
          return;
        }

        const role = res.user_role;
        setRoleName(role.role);

        const initialPermissions = modules.reduce((acc, m) => {
          acc[m] = { view: false, add: false, update: false, delete: false };
          return acc;
        }, {});

        if (Array.isArray(role.permissions)) {
          role.permissions.forEach((p) => {
            initialPermissions[p.module_name] = {
              view: p.view,
              add: p.add,
              update: p.update,
              delete: p.delete,
            };
          });
        }

        setPermissions(initialPermissions);
      } catch (err) {
        setErrorMessage("Failed to load role.");
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, [modules, roleId]);

  /* ================= PERMISSION CHANGE LOGIC ================= */
  const handlePermissionChange = (module, action) => {
    const current = permissions[module];
    const updated = { ...current };
    const isSupport = module === "Supporting Tickets";

    updated[action] = !current[action];

    if (!isSupport && updated[action]) {
      if (action === "add") {
        updated.view = true;
        updated.update = true;
        updated.delete = true;
      }
      if (action === "update" || action === "delete") {
        updated.view = true;
      }
    }

    setPermissions((prev) => ({ ...prev, [module]: updated }));
  };

  /* ================= COLUMN TICK ALL ================= */
  const isColumnChecked = (action) =>
    modules.every((m) => permissions[m]?.[action]);

  const toggleColumn = (action) => {
    const allChecked = isColumnChecked(action);
    const updated = modules.reduce((acc, module) => {
      const isSupport = module === "Supporting Tickets";
      const state = { ...permissions[module] };

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

  /* ================= GLOBAL TICK ALL ================= */
  const isAllChecked = modules.every(
    (m) =>
      permissions[m]?.view &&
      permissions[m]?.add &&
      permissions[m]?.update &&
      permissions[m]?.delete
  );

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

  /* ================= SUBMIT FORM ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const resp = await updateRole(roleId, {
        roleName,
        permissions,
      });

      if (!resp.success) {
        setErrorMessage(resp.message || "Failed to update role.");
        setShowErrorModal(true);
        setProcessing(false);
        return;
      }

      setShowSuccessModal(true);
    } catch (err) {
      const backendMsg =
        err?.response?.data?.message || "Failed to update role.";
      setErrorMessage(backendMsg);
      setShowErrorModal(true);
    } finally {
      setProcessing(false);
    }
  };

  /* ================= UI ================= */
  return (
    <>
      {processing && <LoaderOverlay />}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <SuccessModal
          message="Role updated successfully."
          onClose={() => navigate("/admin/roles-permissions")}
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
          openSection="organization"
        />

        <main className="main">
          <Header onMenuClick={() => setIsSidebarOpen((p) => !p)} />

          <div className="page-title">
            <h3>Update Role</h3>
            <p className="subtitle">Modify existing user role.</p>
          </div>

          <div className="card">
            {loading ? (
              <div style={{ padding: "1.25rem" }}>Loading role...</div>
            ) : (
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

                {/* BUTTONS */}
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={processing}
                  >
                    {processing ? "Updating..." : "Update Role"}
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
    </>
  );
}

export default UpdateRolePage;
