import React, { useEffect, useState } from "react";
import "../../../assets/styles/admin.css";
import Select from "react-select";
import { selectStyles } from "../../../utils/selectStyles";

import { checkUserFieldExists } from "../../../api/admin/checkUserField";

import {
  listUserRoles_employee_mgmnt,
  createRole,
} from "../../../api/admin/roles";
import {
  getDepartments_employee_mgmnt,
  createDepartment,
} from "../../../api/admin/departments";
import {
  getDesignations_employee_mgmnt,
  createDesignation,
} from "../../../api/admin/designations";
import {
  getEmployementTypes_employee_mgmnt,
  createEmployementType,
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
  /* ================= ERRORS ================= */
  const [errors, setErrors] = useState({
    employee_id: "",
    official_email: "",
  });

  /* ================= EMPLOYEES ================= */
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    (async () => {
      const list = await getEmployeesList_employee_mgmnt();
      setEmployees(list);
      if (initialValues.parent_id) {
        setSelectedParentId(initialValues.parent_id);
      }
    })();
  }, []);

  const employeeOptions = employees.map((emp) => ({
    value: emp.id,
    label: `${emp.name} (${emp.employee_id})`,
  }));

  /* ================= EMPLOYMENT TYPE ================= */
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [isAddingEmploymentType, setIsAddingEmploymentType] = useState(false);
  const [newEmploymentTypeName, setNewEmploymentTypeName] = useState("");

  const fetchEmploymentTypes = async () => {
    const resp = await getEmployementTypes_employee_mgmnt();
    const list = resp?.employment_types || resp || [];
    setEmploymentTypes(list);
  };

  useEffect(() => {
    fetchEmploymentTypes();
    if (initialValues.employment_type_id) {
      setSelectedEmploymentType(initialValues.employment_type_id.toString());
    }
  }, []);

  /* ================= ROLES ================= */
  const [roles, setRoles] = useState([]);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  const fetchRoles = async () => {
    const res = await listUserRoles_employee_mgmnt();
    if (res?.success) setRoles(res.user_roles || []);
  };

  useEffect(() => {
    fetchRoles();
    if (initialValues.user_role_id) {
      setSelectedRoleId(initialValues.user_role_id.toString());
    }
  }, []);

  /* ================= DEPARTMENTS ================= */
  const [departments, setDepartments] = useState([]);
  const [isAddingDept, setIsAddingDept] = useState(false);
  const [newDeptLabel, setNewDeptLabel] = useState("");

  const fetchDepartments = async () => {
    const res = await getDepartments_employee_mgmnt();
    const list = res?.departments || res || [];
    setDepartments(
      list.map((d) => ({
        value: d.id.toString(),
        label: d.name,
      }))
    );
  };

  const handleDepartmentRefresh = async () => {
    await fetchDepartments();
    setSelectedDepartment(""); // 👈 force visible refresh
    setSelectedDesignation("");
  };

  useEffect(() => {
    fetchDepartments();
    if (initialValues.department_id) {
      setSelectedDepartment(initialValues.department_id.toString());
    }
  }, []);

  /* ================= DESIGNATIONS ================= */
  const [designationsByDept, setDesignationsByDept] = useState({});
  const [isAddingDesig, setIsAddingDesig] = useState(false);
  const [newDesigLabel, setNewDesigLabel] = useState("");

  const fetchDesignations = async () => {
    const res = await getDesignations_employee_mgmnt();
    const list = res?.designations || res || [];

    const grouped = {};
    list.forEach((d) => {
      const deptId = d.department_id.toString();
      if (!grouped[deptId]) grouped[deptId] = [];
      grouped[deptId].push({
        value: d.id.toString(),
        label: d.name,
      });
    });

    setDesignationsByDept(grouped);
  };

  useEffect(() => {
    fetchDesignations();
    if (initialValues.designation_id) {
      setSelectedDesignation(initialValues.designation_id.toString());
    }
  }, []);

  /* ================= DUPLICATION CHECK ================= */
  const updateErrorState = (field, value) => {
    setErrors((p) => ({ ...p, [field]: value }));
    setFormErrors((p) => ({ ...p, [field]: value }));
  };

  /* ================= RENDER ================= */
  return (
    <div className="form-section">
      <h2 className="section-title">
        <i className="fa-solid fa-briefcase" /> Employment Details
      </h2>

      <div className="form-grid">

        {/* EMPLOYEE ID */}
        <div className={`form-group ${errors.employee_id ? "has-error" : ""}`}>
          <label className="form-label required">Employee ID</label>
          <input
            className="form-input"
            defaultValue={initialValues.employee_id || ""}
            onChange={async (e) => {
              const v = e.target.value.trim();
              if (v.length > 2) {
                const res = await checkUserFieldExists(
                  "employee_id",
                  v,
                  initialValues.id || ""
                );
                updateErrorState("employee_id", res.success ? "" : "Already exists");
              }
            }}
            required
          />
        </div>

        {/* COMPANY EMAIL */}
        <div className={`form-group ${errors.official_email ? "has-error" : ""}`}>
          <label className="form-label required">Company Email</label>
          <input
            type="email"
            className="form-input"
            defaultValue={initialValues.official_email || ""}
            onChange={async (e) => {
              const v = e.target.value.trim();
              if (v.length > 3) {
                const res = await checkUserFieldExists(
                  "official_email",
                  v,
                  initialValues.id || ""
                );
                updateErrorState("official_email", res.success ? "" : "Already exists");
              }
            }}
            required
          />
        </div>

        {/* DEPARTMENT */}
        <div className="form-group">
          <label className="form-label required">Department</label>

          <div className="select-with-action">
            <Select
              styles={selectStyles}
              value={departments.find(d => d.value === selectedDepartment) || null}
              options={[
                ...departments,
                { label: "+ Add Department", value: "__add__" },
              ]}
              onChange={(opt) => {
                if (!opt) return;
                if (opt.value === "__add__") setIsAddingDept(true);
                else setSelectedDepartment(opt.value);
              }}
            />

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDepartmentRefresh}
            >
              <i className="fa-solid fa-rotate-right" />
            </button>
          </div>
        </div>

        {/* DESIGNATION */}
        <div className="form-group">
          <label className="form-label required">Designation</label>

          <Select
            styles={selectStyles}
            isDisabled={!selectedDepartment}
            value={
              (designationsByDept[selectedDepartment] || []).find(
                d => d.value === selectedDesignation
              ) || null
            }
            options={[
              ...(designationsByDept[selectedDepartment] || []),
              ...(selectedDepartment ? [{ label: "+ Add Designation", value: "__add__" }] : [])
            ]}
            onChange={(opt) => {
              if (!opt) return;
              if (opt.value === "__add__") setIsAddingDesig(true);
              else setSelectedDesignation(opt.value);
            }}
          />
        </div>

      </div>
    </div>
  );
}
