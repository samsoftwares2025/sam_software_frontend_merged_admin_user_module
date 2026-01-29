import React, { useEffect, useState } from "react";
import "../../../assets/styles/admin.css";
import Select from "react-select";
import { selectStyles } from "../../../utils/selectStyles";

import { checkUserFieldExists } from "../../../api/admin/checkUserField";
import EditableSelect from "./EditableSelect";
import SuccessModal from "../../common/SuccessModal";
import ErrorModal from "../../common/ErrorModal";

import {
  listUserRoles_employee_mgmnt,
  createRole,
  updateRole,
} from "../../../api/admin/roles";
import {
  getDepartments_employee_mgmnt,
  createDepartment,
  updateDepartment,
} from "../../../api/admin/departments";
import {
  getDesignations_employee_mgmnt,
  updateDesignation,
  createDesignation,
} from "../../../api/admin/designations";
import {
  getEmployementTypes_employee_mgmnt,
  createEmployementType,
  updateEmployementType,
} from "../../../api/admin/employement_type";
import { getEmployeesList_employee_mgmnt } from "../../../api/admin/employees";

export default function EmploymentSection({
  initialValues = {},
  mode = "add",

  selectedEmploymentType,
  setSelectedEmploymentType,

  selectedDepartment,
  setSelectedDepartment,

  selectedDesignation,
  setSelectedDesignation,

  selectedRoleId,
  setSelectedRoleId,

  selectedParentId,
  setSelectedParentId,

  selectedIsActive,
  setSelectedIsActive,

  selectedIsDepartmentHead,
  setSelectedIsDepartmentHead,

  setFormErrors,
}) {
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState({
    employee_id: "",
    official_email: "",
  });

  /* ================= EMPLOYEE LIST (Reporting Manager) ================= */
  const [employees, setEmployees] = useState([]);
  const employeeOptions = employees.map((emp) => ({
    value: emp.id,
    label: `${emp.name} (${emp.employee_id})`,
  }));

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const list = await getEmployeesList_employee_mgmnt();
        setEmployees(list);

        if (initialValues.parent_id) {
          setSelectedParentId(initialValues.parent_id);
        }
      } catch (err) {
        console.error("Failed to fetch employees", err);
      }
    };

    fetchEmployees();
  }, []);

  /* ================= EMPLOYMENT TYPE ================= */
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [isAddingEmploymentType, setIsAddingEmploymentType] = useState(false);
  const [newEmploymentTypeName, setNewEmploymentTypeName] = useState("");
  const [isEditingDept, setIsEditingDept] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState(null);
  const [editingDeptLabel, setEditingDeptLabel] = useState("");
  const fetchEmploymentTypes = async () => {
    const resp = await getEmployementTypes_employee_mgmnt();
    const list = Array.isArray(resp?.employment_types)
      ? resp.employment_types
      : Array.isArray(resp)
        ? resp
        : [];

    setEmploymentTypes(list);

    if (initialValues?.employment_type_id) {
      setSelectedEmploymentType(initialValues.employment_type_id.toString());
    }
  };

  useEffect(() => {
    fetchEmploymentTypes();
  }, []);

  const handleEmploymentTypeChange = (e) => {
    const val = e.target.value;

    if (val === "__add_employment_type__") {
      setIsAddingEmploymentType(true);
      return;
    }

    setSelectedEmploymentType(val);
  };

  const handleConfirmAddEmploymentType = async () => {
    if (!newEmploymentTypeName.trim()) return;

    const res = await createEmployementType(newEmploymentTypeName.trim());
    await fetchEmploymentTypes();

    setSelectedEmploymentType(String(res.id));
    setIsAddingEmploymentType(false);
    setNewEmploymentTypeName("");
  };

  /* ================= ROLES ================= */
  const [roles, setRoles] = useState([]);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await listUserRoles_employee_mgmnt();
        if (res?.success) {
          setRoles(res.user_roles || []);

          if (initialValues?.user_role_id) {
            setSelectedRoleId(initialValues.user_role_id.toString());
          }
        }
      } catch (err) {
        console.error("Failed to load roles", err);
      }
    };

    fetchRoles();
  }, []);

  const handleRoleChange = (e) => {
    const val = e.target.value;

    if (val === "__add_role__") {
      setIsAddingRole(true);
      return;
    }

    setSelectedRoleId(val);
  };

  const handleConfirmAddRole = async () => {
    if (!newRoleName.trim()) return;

    const res = await createRole(newRoleName.trim());

    const refreshed = await listUserRoles_employee_mgmnt();
    if (refreshed?.success) {
      setRoles(refreshed.user_roles || []);
    }

    setSelectedRoleId(String(res.id));
    setIsAddingRole(false);
    setNewRoleName("");
  };

  /* ================= DEPARTMENTS / DESIGNATIONS ================= */
  const [departments, setDepartments] = useState([]);
  const [deptMenuOpen, setDeptMenuOpen] = useState(false);

  const [designationsByDept, setDesignationsByDept] = useState({});

  const [isAddingDept, setIsAddingDept] = useState(false);
  const [newDeptLabel, setNewDeptLabel] = useState("");

  const [isAddingDesig, setIsAddingDesig] = useState(false);
  const [newDesigLabel, setNewDesigLabel] = useState("");

  const fetchDepartments = async () => {
    const res = await getDepartments_employee_mgmnt();
    const list = Array.isArray(res) ? res : res?.departments || [];

    const mapped = list.map((d) => ({ value: d.id, label: d.name }));
    setDepartments(mapped);

    if (initialValues?.department_id) {
      setSelectedDepartment(initialValues.department_id.toString());
    }
  };

  const fetchDesignations = async () => {
    const res = await getDesignations_employee_mgmnt();
    const list = Array.isArray(res) ? res : res?.designations || [];

    const grouped = {};
    list.forEach((d) => {
      if (!grouped[d.department_id]) grouped[d.department_id] = [];
      grouped[d.department_id].push(d);
    });

    setDesignationsByDept(grouped);

    if (initialValues?.designation_id) {
      setSelectedDesignation(initialValues.designation_id.toString());
    }
  };

  const departmentId = Number(selectedDepartment);

  const designationOptions =
    departmentId && designationsByDept[departmentId]
      ? designationsByDept[departmentId].map((d) => ({
          value: d.id,
          label: d.name,
        }))
      : [];

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
  }, []);

  const handleDepartmentChange = (e) => {
    const val = e.target.value;

    if (val === "__add_dept__") {
      setIsAddingDept(true);
      return;
    }

    setSelectedDepartment(val);
    setSelectedDesignation("");
  };

  const handleDesignationChange = (e) => {
    const val = e.target.value;

    if (val === "__add_desig__") {
      setIsAddingDesig(true);
      return;
    }

    setSelectedDesignation(val);
  };

  const handleConfirmAddDepartment = async () => {
    if (!newDeptLabel.trim()) return;

    const res = await createDepartment(newDeptLabel.trim());
    await fetchDepartments();

    setSelectedDepartment(String(res.id));
    setIsAddingDept(false);
    setNewDeptLabel("");
  };

  const handleConfirmAddDesignation = async () => {
    if (!newDesigLabel.trim() || !selectedDepartment) return;

    const res = await createDesignation({
      name: newDesigLabel.trim(),
      department_id: Number(selectedDepartment),
    });

    await fetchDesignations();
    setSelectedDesignation(String(res.id));
    setIsAddingDesig(false);
    setNewDesigLabel("");
  };

  /* ================= DUPLICATION CHECK (forward to parent) ================= */
  const updateErrorState = (field, value) => {
    setErrors((prev) => ({ ...prev, [field]: value }));

    setFormErrors((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="form-section">
      <h2 className="section-title">
        <i className="fa-solid fa-briefcase" /> Employment Details
      </h2>

      <div className="form-grid">
        {/* =================== EMPLOYEE ID =================== */}
        <div className={`form-group ${errors.employee_id ? "has-error" : ""}`}>
          <div className="label-row">
            <label className="form-label required">
              Employee ID{" "}
              {errors.employee_id && (
                <span className="inline-error">{errors.employee_id}</span>
              )}
            </label>
          </div>

          <input
            className={`form-input ${errors.employee_id ? "input-error" : ""}`}
            name="employee_id"
            defaultValue={initialValues.employee_id || ""}
            onChange={async (e) => {
              const empId = e.target.value.trim();

              if (empId.length > 2) {
                try {
                  const res = await checkUserFieldExists(
                    "employee_id",
                    empId,
                    initialValues?.id || "",
                  );

                  updateErrorState(
                    "employee_id",
                    res.success ? "" : "already exists!",
                  );
                } catch (err) {
                  console.error("Employee ID duplicate check failed:", err);
                }
              } else {
                updateErrorState("employee_id", "");
              }
            }}
            required
          />
        </div>

        {/* =================== OFFICIAL EMAIL =================== */}
        <div
          className={`form-group ${errors.official_email ? "has-error" : ""}`}
        >
          <div className="label-row">
            <label className="form-label required">
              Company Email{" "}
              {errors.official_email && (
                <span className="inline-error">{errors.official_email}</span>
              )}
            </label>
          </div>

          <input
            type="email"
            className={`form-input ${
              errors.official_email ? "input-error" : ""
            }`}
            name="official_email"
            defaultValue={initialValues.official_email || ""}
            onChange={async (e) => {
              const email = e.target.value.trim();

              if (email.length > 3) {
                try {
                  const res = await checkUserFieldExists(
                    "official_email",
                    email,
                    initialValues?.id || "",
                  );

                  updateErrorState(
                    "official_email",
                    res.success ? "" : "already exists!",
                  );
                } catch (err) {
                  console.error("Official email duplicate check failed:", err);
                }
              } else {
                updateErrorState("official_email", "");
              }
            }}
            required
          />
        </div>
        {/* =================== Confirmation Date =================== */}
        <div className="form-group">
          <label className="form-label required">Confirmation Date</label>
          <input
            type="date"
            className="form-input"
            name="confirmation_date"
            defaultValue={
              initialValues.confirmation_date
                ? initialValues.confirmation_date.slice(0, 10)
                : ""
            }
            required
          />
        </div>
        {/* Joining Date */}
        <div className="form-group">
          <label className="form-label required">Joining Date</label>
          <input
            type="date"
            className="form-input"
            name="joining_date"
            defaultValue={
              initialValues.joining_date
                ? initialValues.joining_date.slice(0, 10)
                : ""
            }
            required
          />
        </div>

        {/* =================== Work Location =================== */}
        <div className="form-group">
          <label className="form-label required">Work Location</label>
          <input
            type="text"
            className="form-input"
            name="work_location"
            defaultValue={initialValues.work_location || ""}
            required
          />
        </div>

        {/* =================== EMPLOYMENT TYPE =================== */}
        <div className="form-group">
          <label className="form-label required">Employment Type</label>

          <EditableSelect
            styles={selectStyles}
            onRefresh={fetchEmploymentTypes}
            placeholder="Select Employment Type"
            value={selectedEmploymentType}
            options={employmentTypes.map((et) => ({
              value: et.id,
              label: et.name,
            }))}
            onChange={(val) => {
              setSelectedEmploymentType(val);
            }}
            onCreate={async (name) => {
              try {
                const res = await createEmployementType(name.trim());

                await fetchEmploymentTypes();
                setSelectedEmploymentType(String(res.id));

                setSuccessMsg(
                  res?.message ||
                    res?.detail ||
                    "Employment type created successfully",
                );
              } catch (err) {
                setErrorMsg(
                  err?.response?.data?.message ||
                    err?.response?.data?.detail ||
                    "Failed to create employment type",
                );
              }
            }}
            onUpdate={async (id, name) => {
              try {
                // ✅ FIXED CALL
                const res = await updateEmployementType(id, name.trim());

                await fetchEmploymentTypes();
                setSelectedEmploymentType(String(id));

                setSuccessMsg(
                  res?.message ||
                    res?.detail ||
                    "Employment type updated successfully",
                );
              } catch (err) {
                setErrorMsg(
                  err?.response?.data?.message ||
                    err?.response?.data?.detail ||
                    "Failed to update employment type",
                );
              }
            }}
          />
        </div>

        {/* =================== DEPARTMENT =================== */}
        <div className="form-group">
          <label className="form-label required">Department</label>

          <EditableSelect
            styles={selectStyles}
            onRefresh={fetchDepartments}
            placeholder="Select Department"
            value={selectedDepartment}
            options={departments}
            menuIsOpen={deptMenuOpen}
            onMenuOpen={() => setDeptMenuOpen(true)}
            onMenuClose={() => setDeptMenuOpen(false)}
            onChange={(val) => {
              setSelectedDepartment(val);
              setSelectedDesignation("");
            }}
            onCreate={async (name) => {
              try {
                const res = await createDepartment(name);

                await fetchDepartments();
                setSelectedDepartment(res.id);

                setSuccessMsg(res.message || "Department created successfully");
              } catch (err) {
                setErrorMsg(
                  err?.response?.data?.message || "Failed to create department",
                );
              }
            }}
            onUpdate={async (id, name) => {
              try {
                const res = await updateDepartment(id, name);

                await fetchDepartments();
                setSelectedDepartment(id);

                setSuccessMsg(res.message || "Department updated successfully");
              } catch (err) {
                setErrorMsg(
                  err?.response?.data?.message || "Failed to update department",
                );
              }
            }}
          />
        </div>

        {/* =================== DESIGNATION =================== */}
        <div className="form-group">
          <label className="form-label required">Designation</label>

          <EditableSelect
            styles={selectStyles}
            onRefresh={fetchDesignations}
            isDisabled={!selectedDepartment}
            placeholder={
              selectedDepartment
                ? "Select Designation"
                : "Select Department first"
            }
            value={selectedDesignation}
            options={designationOptions}
            onChange={(val) => {
              setSelectedDesignation(val);
            }}
            /* ✅ ONLY ENABLE ADD / EDIT WHEN DEPARTMENT IS SELECTED */
            onCreate={
              selectedDepartment
                ? async (name) => {
                    try {
                      const res = await createDesignation({
                        name,
                        department_id: Number(selectedDepartment),
                      });

                      await fetchDesignations();
                      setSelectedDesignation(res.id);

                      setSuccessMsg(
                        res?.message ||
                          res?.detail ||
                          "Designation created successfully",
                      );
                    } catch (err) {
                      setErrorMsg(
                        err?.response?.data?.message ||
                          err?.response?.data?.detail ||
                          "Failed to create designation",
                      );
                    }
                  }
                : undefined
            }
            onUpdate={
              selectedDepartment
                ? async (id, name) => {
                    try {
                      const res = await updateDesignation(
                        id,
                        name,
                        Number(selectedDepartment),
                      );

                      await fetchDesignations();
                      setSelectedDesignation(String(id));

                      setSuccessMsg(
                        res?.message ||
                          res?.detail ||
                          "Designation updated successfully",
                      );
                    } catch (err) {
                      setErrorMsg(
                        err?.response?.data?.message ||
                          err?.response?.data?.detail ||
                          "Failed to update designation",
                      );
                    }
                  }
                : undefined
            }
          />
        </div>

        {/* =================== Is Department Head =================== */}
        <div className="form-group">
          <label className="form-label required">Is Department Head</label>

          <select
            className="form-select"
            value={selectedIsDepartmentHead}
            onChange={(e) => setSelectedIsDepartmentHead(e.target.value)}
            required
          >
            <option value="">Select Option</option>
            <option value="True">Yes</option>
            <option value="False">No</option>
          </select>
        </div>

        {/* =================== REPORTING MANAGER (parent_id) =================== */}
        <div className="form-group">
          <label className="form-label">Reporting Manager</label>

          <Select
            styles={selectStyles}
            options={employeeOptions}
            isClearable
            placeholder="Search & select manager..."
            value={
              employeeOptions.find(
                (opt) => opt.value === Number(selectedParentId),
              ) || null
            }
            onChange={(option) =>
              setSelectedParentId(option ? option.value : "")
            }
          />
        </div>

        {/* =================== ROLE =================== */}
        <div className="form-group">
          <label className="form-label required">Role</label>

          <EditableSelect
            styles={selectStyles}
            onRefresh={async () => {
              const res = await listUserRoles_employee_mgmnt();
              if (res?.success) setRoles(res.user_roles || []);
            }}
            placeholder="Select Role"
            value={selectedRoleId}
            options={roles.map((r) => ({
              value: r.id,
              label: r.role,
            }))}
            onChange={(val) => {
              setSelectedRoleId(val);
            }}
            onCreate={async (name) => {
              try {
                const res = await createRole(name.trim());

                const refreshed = await listUserRoles_employee_mgmnt();
                if (refreshed?.success) setRoles(refreshed.user_roles || []);

                setSelectedRoleId(String(res.id));

                setSuccessMsg(
                  res?.message || res?.detail || "Role created successfully",
                );
              } catch (err) {
                setErrorMsg(
                  err?.response?.data?.message ||
                    err?.response?.data?.detail ||
                    "Failed to create role",
                );
              }
            }}
            onUpdate={async (id, name) => {
              try {
                const res = await updateRole(id, {
                  roleName: name.trim(),
                  permissions: undefined, // or [] if backend requires
                });

                const refreshed = await listUserRoles_employee_mgmnt();
                if (refreshed?.success) setRoles(refreshed.user_roles || []);

                setSelectedRoleId(String(id));

                setSuccessMsg(
                  res?.message || res?.detail || "Role updated successfully",
                );
              } catch (err) {
                setErrorMsg(
                  err?.response?.data?.message ||
                    err?.response?.data?.detail ||
                    "Failed to update role",
                );
              }
            }}
          />
        </div>

        {/* =================== STATUS (EDIT ONLY) =================== */}
        {mode === "edit" && (
          <div className="form-group">
            <label className="form-label required">Status</label>

            <select
              className="form-select"
              value={selectedIsActive}
              onChange={(e) => setSelectedIsActive(e.target.value)}
              required
            >
              <option value="">Select Status</option>
              <option value="True">Active</option>
              <option value="False">Inactive</option>
            </select>
          </div>
        )}

        {/* =================== Last Working Date (EDIT ONLY) =================== */}
        {mode === "edit" && (
          <div className="form-group">
            <label className="form-label">Last Working Date</label>
            <input
              type="date"
              className="form-input"
              name="last_working_date"
              defaultValue={
                initialValues.last_working_date
                  ? initialValues.last_working_date.slice(0, 10)
                  : ""
              }
            />
          </div>
        )}
        {successMsg && (
          <SuccessModal
            message={successMsg}
            onClose={() => setSuccessMsg("")}
          />
        )}

        {errorMsg && (
          <ErrorModal message={errorMsg} onClose={() => setErrorMsg("")} />
        )}
      </div>
    </div>
  );
}
