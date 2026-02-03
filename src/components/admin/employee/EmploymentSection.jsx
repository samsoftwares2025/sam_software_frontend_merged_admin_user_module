import React, { useEffect, useState } from "react";
import "../../../assets/styles/admin.css";
import Select from "react-select";
import { selectStyles } from "../../../utils/selectStyles";
import { toSentenceCase } from "../../../utils/textFormatters";

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
      } catch (err) {
        console.error("Failed to fetch employees", err);
      }
    };
    fetchEmployees();
  }, []);

  /* ================= NEW: SYNC FOR PRE-SELECTION (FIXES EDIT MODE) ================= */
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      // We convert to String to ensure matching with dropdown options
      if (initialValues.employment_type_id)
        setSelectedEmploymentType(String(initialValues.employment_type_id));
      if (initialValues.department_id)
        setSelectedDepartment(String(initialValues.department_id));
      if (initialValues.designation_id)
        setSelectedDesignation(String(initialValues.designation_id));
      if (initialValues.user_role_id)
        setSelectedRoleId(String(initialValues.user_role_id));
      if (initialValues.parent_id)
        setSelectedParentId(String(initialValues.parent_id));

      if (initialValues.is_active !== undefined)
        setSelectedIsActive(
          initialValues.is_active === true || initialValues.is_active === "True"
            ? "True"
            : "False",
        );

      if (initialValues.is_department_head !== undefined)
        setSelectedIsDepartmentHead(
          initialValues.is_department_head === true ||
            initialValues.is_department_head === "True"
            ? "True"
            : "False",
        );
    }
  }, [initialValues]);

  /* ================= EMPLOYMENT TYPE ================= */
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [isAddingEmploymentType, setIsAddingEmploymentType] = useState(false);
  const [newEmploymentTypeName, setNewEmploymentTypeName] = useState("");

  const fetchEmploymentTypes = async () => {
    const resp = await getEmployementTypes_employee_mgmnt();
    const list = Array.isArray(resp?.employment_types)
      ? resp.employment_types
      : Array.isArray(resp)
        ? resp
        : [];
    setEmploymentTypes(list);
  };

  useEffect(() => {
    fetchEmploymentTypes();
  }, []);

  /* ================= ROLES ================= */
  const [roles, setRoles] = useState([]);

  const fetchRoles = async () => {
    try {
      const res = await listUserRoles_employee_mgmnt();
      if (res?.success) setRoles(res.user_roles || []);
    } catch (err) {
      console.error("Failed to load roles", err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  /* ================= DEPARTMENTS / DESIGNATIONS ================= */
  const [departments, setDepartments] = useState([]);
  const [deptMenuOpen, setDeptMenuOpen] = useState(false);
  const [designationsByDept, setDesignationsByDept] = useState({});

  const fetchDepartments = async () => {
    const res = await getDepartments_employee_mgmnt();
    const list = Array.isArray(res) ? res : res?.departments || [];
    setDepartments(list.map((d) => ({ value: String(d.id), label: d.name })));
  };

  const fetchDesignations = async () => {
    const res = await getDesignations_employee_mgmnt();
    const list = Array.isArray(res) ? res : res?.designations || [];
    const grouped = {};
    list.forEach((d) => {
      const dID = String(d.department_id);
      if (!grouped[dID]) grouped[dID] = [];
      grouped[dID].push(d);
    });
    setDesignationsByDept(grouped);
  };

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
  }, []);

  const departmentId = String(selectedDepartment);
  const designationOptions =
    departmentId && designationsByDept[departmentId]
      ? designationsByDept[departmentId].map((d) => ({
          value: String(d.id),
          label: d.name,
        }))
      : [];

  /* ================= DUPLICATION CHECK ================= */
  const updateErrorState = (field, value) => {
    setErrors((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="form-section">
      <h2 className="section-title">
        <i className="fa-solid fa-briefcase" /> Employment Details
      </h2>

      <div className="form-grid">
        {/* EMPLOYEE ID */}
        <div className={`form-group ${errors.employee_id ? "has-error" : ""}`}>
          <label className="form-label required">
            Employee ID{" "}
            {errors.employee_id && (
              <span className="inline-error">{errors.employee_id}</span>
            )}
          </label>
          <input
            className="form-input"
            name="employee_id"
            defaultValue={initialValues.employee_id || ""}
            onChange={async (e) => {
              const empId = e.target.value.trim();
              if (empId.length > 2) {
                const res = await checkUserFieldExists(
                  "employee_id",
                  empId,
                  initialValues?.id || "",
                );
                updateErrorState(
                  "employee_id",
                  res.success ? "" : "already exists!",
                );
              } else updateErrorState("employee_id", "");
            }}
            required
          />
        </div>

        {/* OFFICIAL EMAIL */}
        <div
          className={`form-group ${errors.official_email ? "has-error" : ""}`}
        >
          <label className="form-label required">
            Company Email{" "}
            {errors.official_email && (
              <span className="inline-error">{errors.official_email}</span>
            )}
          </label>
          <input
            type="email"
            className="form-input"
            name="official_email"
            defaultValue={initialValues.official_email || ""}
            onChange={async (e) => {
              const email = e.target.value.trim();
              if (email.length > 3) {
                const res = await checkUserFieldExists(
                  "official_email",
                  email,
                  initialValues?.id || "",
                );
                updateErrorState(
                  "official_email",
                  res.success ? "" : "already exists!",
                );
              } else updateErrorState("official_email", "");
            }}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label required">Confirmation Date</label>
          <input
            type="date"
            className="form-input"
            name="confirmation_date"
               style={{ textTransform: "uppercase" }} 
            defaultValue={initialValues.confirmation_date?.slice(0, 10) || ""}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label required">Joining Date</label>
          <input
            type="date"
            className="form-input"
            name="joining_date"
               style={{ textTransform: "uppercase" }} 
            defaultValue={initialValues.joining_date?.slice(0, 10) || ""}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label required">Work Location</label>
          <input
            type="text"
            className="form-input"
            name="work_location"
            defaultValue={initialValues.work_location || ""}
            onBlur={(e) => (e.target.value = toSentenceCase(e.target.value))}
            required
          />
        </div>

        {/* EMPLOYMENT TYPE */}
        <div className="form-group">
          <label className="form-label required">Employment Type</label>
          <EditableSelect
            styles={selectStyles}
            onRefresh={fetchEmploymentTypes}
            placeholder="Select Employment Type"
            value={selectedEmploymentType}
            options={employmentTypes.map((et) => ({
              value: String(et.id),
              label: et.name,
            }))}
            onChange={(val) => setSelectedEmploymentType(val)}
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

        {/* DEPARTMENT */}
        <div className="form-group">
          <label className="form-label required">Department</label>
          <EditableSelect
            styles={selectStyles}
            onRefresh={fetchDepartments}
            placeholder="Select Department"
            value={selectedDepartment}
            options={departments}
            onChange={(val) => {
              setSelectedDepartment(val);
              setSelectedDesignation("");
            }}
            onCreate={async (name) => {
              try {
                const res = await createDepartment(name.trim());
                await fetchDepartments();
                setSelectedDepartment(String(res.id));
                setSuccessMsg(
                  res?.message || "Department created successfully",
                );
              } catch (err) {
                setErrorMsg(
                  err?.response?.data?.message || "Failed to create department",
                );
              }
            }}
            onUpdate={async (id, name) => {
              try {
                const res = await updateDepartment(id, name.trim());
                await fetchDepartments();
                setSelectedDepartment(String(id));
                setSuccessMsg(
                  res?.message || "Department updated successfully",
                );
              } catch (err) {
                setErrorMsg(
                  err?.response?.data?.message || "Failed to update department",
                );
              }
            }}
          />
        </div>

        {/* DESIGNATION */}
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
            onChange={(val) => setSelectedDesignation(val)}
            onCreate={async (name) => {
              try {
                const res = await createDesignation({
                  name: name.trim(),
                  department_id: Number(selectedDepartment),
                });
                await fetchDesignations();
                setSelectedDesignation(String(res.id));
                setSuccessMsg(
                  res?.message || "Designation created successfully",
                );
              } catch (err) {
                setErrorMsg(
                  err?.response?.data?.message ||
                    "Failed to create designation",
                );
              }
            }}
            onUpdate={async (id, name) => {
              try {
                const res = await updateDesignation(
                  id,
                  name.trim(),
                  Number(selectedDepartment),
                );
                await fetchDesignations();
                setSelectedDesignation(String(id));
                setSuccessMsg(
                  res?.message || "Designation updated successfully",
                );
              } catch (err) {
                setErrorMsg(
                  err?.response?.data?.message ||
                    "Failed to update designation",
                );
              }
            }}
          />
        </div>

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

        <div className="form-group">
          <label className="form-label">Reporting Manager</label>
          <Select
            styles={selectStyles}
            options={employeeOptions}
            isClearable
            placeholder="Search manager..."
            value={
              employeeOptions.find(
                (opt) => String(opt.value) === String(selectedParentId),
              ) || null
            }
            onChange={(option) =>
              setSelectedParentId(option ? String(option.value) : "")
            }
          />
        </div>

        {/* ROLE */}
        <div className="form-group">
          <label className="form-label required">Role</label>
          <EditableSelect
            styles={selectStyles}
            onRefresh={fetchRoles}
            placeholder="Select Role"
            value={selectedRoleId}
            options={roles.map((r) => ({ value: String(r.id), label: r.role }))}
            onChange={(val) => setSelectedRoleId(val)}
            onCreate={async (name) => {
              try {
                const res = await createRole(name.trim());
                await fetchRoles();
                setSelectedRoleId(String(res.id));
                setSuccessMsg(res?.message || "Role created successfully");
              } catch (err) {
                setErrorMsg(
                  err?.response?.data?.message || "Failed to create role",
                );
              }
            }}
            onUpdate={async (id, name) => {
              try {
                const res = await updateRole(id, { roleName: name.trim() });
                await fetchRoles();
                setSelectedRoleId(String(id));
                setSuccessMsg(res?.message || "Role updated successfully");
              } catch (err) {
                setErrorMsg(
                  err?.response?.data?.message || "Failed to update role",
                );
              }
            }}
          />
        </div>

        {mode === "edit" && (
          <>
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
            <div className="form-group">
              <label className="form-label">Last Working Date</label>
              <input
                type="date"
                className="form-input"
                name="last_working_date"
                defaultValue={
                  initialValues.last_working_date?.slice(0, 10) || ""
                }
              />
            </div>
          </>
        )}
      </div>

      {/* RENDER MODALS AT BOTTOM */}
      {successMsg && (
        <SuccessModal message={successMsg} onClose={() => setSuccessMsg("")} />
      )}
      {errorMsg && (
        <ErrorModal message={errorMsg} onClose={() => setErrorMsg("")} />
      )}
    </div>
  );
}
