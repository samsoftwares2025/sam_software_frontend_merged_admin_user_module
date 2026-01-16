// src/components/admin/EmployeeForm.jsx
import React, { useState, useRef, useEffect } from "react";
import { getDepartments, createDepartment } from "../../api/admin/departments";
import {
  getDesignations,
  createDesignation,
} from "../../api/admin/designations";
import {
  getEmployementTypes,
  createEmployementType,
} from "../../api/admin/employement_type";

function EmployeeForm({
  onSubmit,
  onSuccess,
  initialValues = {},
  mode = "create",
}) {
  const formRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  /* ================= EMPLOYMENT TYPE ================= */
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [selectedEmploymentType, setSelectedEmploymentType] = useState("");

  const [isAddingEmploymentType, setIsAddingEmploymentType] = useState(false);
  const [newEmploymentTypeName, setNewEmploymentTypeName] = useState("");

  const handleEmploymentTypeChange = (e) => {
    const value = e.target.value;

    if (value === "__add_employment_type__") {
      setIsAddingEmploymentType(true);
      return;
    }

    setSelectedEmploymentType(value);
  };

  const handleConfirmAddEmploymentType = async () => {
    if (!newEmploymentTypeName.trim()) return;

    try {
      const res = await createEmployementType(newEmploymentTypeName.trim());

      // refresh list
      const resp = await getEmployementTypes();
      const list = Array.isArray(resp?.employment_types)
        ? resp.employment_types
        : Array.isArray(resp)
        ? resp
        : [];

      setEmploymentTypes(list);

      // auto-select newly created
      setSelectedEmploymentType(String(res.id));

      setIsAddingEmploymentType(false);
      setNewEmploymentTypeName("");
    } catch (err) {
      console.error("Failed to add employment type", err);
    }
  };

  const handleCancelAddEmploymentType = () => {
    setIsAddingEmploymentType(false);
    setNewEmploymentTypeName("");
  };

  useEffect(() => {
    const fetchEmploymentTypes = async () => {
      try {
        const resp = await getEmployementTypes();

        let list = [];
        if (Array.isArray(resp?.employment_types)) list = resp.employment_types;
        else if (Array.isArray(resp)) list = resp;
        else if (Array.isArray(resp?.results)) list = resp.results;
        else if (Array.isArray(resp?.data)) list = resp.data;

        setEmploymentTypes(list);
      } catch (err) {
        console.error("Failed to load employment types", err);
        setEmploymentTypes([]);
      }
    };

    fetchEmploymentTypes();
  }, []);
  const refreshEmploymentTypes = async () => {
    try {
      const resp = await getEmployementTypes();

      let list = [];
      if (Array.isArray(resp?.employment_types)) list = resp.employment_types;
      else if (Array.isArray(resp)) list = resp;
      else if (Array.isArray(resp?.results)) list = resp.results;
      else if (Array.isArray(resp?.data)) list = resp.data;

      setEmploymentTypes(list);
      setSelectedEmploymentType("");
    } catch (err) {
      console.error("Failed to refresh employment types", err);
    }
  };

  /* ================= DEPARTMENT / DESIGNATION ================= */
  const [departments, setDepartments] = useState([]);
  const [designationsByDept, setDesignationsByDept] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("");

  const [isAddingDept, setIsAddingDept] = useState(false);
  const [newDeptLabel, setNewDeptLabel] = useState("");

  const [isAddingDesig, setIsAddingDesig] = useState(false);
  const [newDesigLabel, setNewDesigLabel] = useState("");

  const fetchDepartments = async () => {
    const res = await getDepartments();
    const list = Array.isArray(res) ? res : res?.departments || [];
    setDepartments(list.map((d) => ({ value: d.id, label: d.name })));
  };

  const fetchDesignations = async () => {
    const res = await getDesignations();
    const list = Array.isArray(res) ? res : res?.designations || [];
    const grouped = {};
    list.forEach((d) => {
      if (!grouped[d.department_id]) grouped[d.department_id] = [];
      grouped[d.department_id].push(d);
    });
    setDesignationsByDept(grouped);
  };

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
  }, []);

  /* ================= HANDLERS ================= */
  const handleDepartmentChange = (e) => {
    const val = e.target.value;
    if (val === "__add_dept__") return setIsAddingDept(true);
    setSelectedDepartment(val);
    setSelectedDesignation("");
  };

  const handleDesignationChange = (e) => {
    const val = e.target.value;
    if (val === "__add_desig__") return setIsAddingDesig(true);
    setSelectedDesignation(val);
  };

  const refreshDepartments = async () => {
    await fetchDepartments();
    setSelectedDepartment("");
    setSelectedDesignation("");
  };

  const refreshDesignations = async () => {
    await fetchDesignations();
    setSelectedDesignation("");
  };

  const handleConfirmAddDepartment = async () => {
    if (!newDeptLabel.trim()) return;
    const res = await createDepartment(newDeptLabel.trim());
    await fetchDepartments();
    setSelectedDepartment(String(res.id));
    setIsAddingDept(false);
    setNewDeptLabel("");
  };

  const handleCancelAddDepartment = () => {
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

  const handleCancelAddDesignation = () => {
    setIsAddingDesig(false);
    setNewDesigLabel("");
  };

  /* ================= PHOTO ================= */
  const [photoFile, setPhotoFile] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      setPhotoFile(file); // ✔ store file
    }
  };

  /* ================= DOCUMENTS ================= */
  const [documents, setDocuments] = useState([
    {
      type: "visa",
      number: "",
      country: "",
      issue_date: "",
      expiry_date: "",
      status: "valid",
      notes: "",
      files: [],
      previews: [],
    },
  ]);

  const handleAddDocument = () => {
    setDocuments((prev) => [...prev, { ...prev[0], files: [], previews: [] }]);
  };

  const handleDocumentChange = (index, field, value) => {
    setDocuments((prev) =>
      prev.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc))
    );
  };

  const handleDocumentFilesChange = (index, files) => {
    const arr = Array.from(files);
    setDocuments((prev) =>
      prev.map((doc, i) =>
        i === index
          ? {
              ...doc,
              files: [...doc.files, ...arr],
              previews: [
                ...doc.previews,
                ...arr.map((f) => ({ url: URL.createObjectURL(f) })),
              ],
            }
          : doc
      )
    );
  };

  const handleRemoveDocumentFile = (docIdx, fileIdx) => {
    setDocuments((prev) =>
      prev.map((doc, i) =>
        i === docIdx
          ? {
              ...doc,
              files: doc.files.filter((_, fi) => fi !== fileIdx),
              previews: doc.previews.filter((_, fi) => fi !== fileIdx),
            }
          : doc
      )
    );
  };

  // ✅ MISSING FUNCTION (THIS FIXES THE CRASH)
  const handleRemoveDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    formRef.current?.reset();
    setPhotoPreview(null);
    setSelectedDepartment("");
    setSelectedDesignation("");
    setSelectedEmploymentType("");
    setDocuments([
      {
        type: "visa",
        number: "",
        country: "",
        issue_date: "",
        expiry_date: "",
        status: "valid",
        notes: "",
        files: [],
        previews: [],
      },
    ]);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(); // ✅ CREATE FIRST

    // ✅ THEN append image
    if (photoFile) {
      formData.append("image", photoFile);
    }

    formData.append("user_id", localStorage.getItem("userId"));
    formData.append("name", e.target.full_name.value);
    formData.append("date_of_birth", e.target.dob.value);
    formData.append("gender", e.target.gender.value);
    formData.append("personal_email", e.target.personal_email.value);
    formData.append("phone", e.target.phone.value);
    formData.append("qualification", e.target.qualification.value);
    formData.append("address", e.target.address.value);

    formData.append("employee_id", e.target.employee_id.value);
    formData.append("official_email", e.target.company_email.value);
    formData.append("joining_date", e.target.joining_date.value);

    // ✅ FK IDs (SAFE PARSING)
    formData.append("employment_type_id", parseInt(selectedEmploymentType, 10));
    formData.append("department_id", parseInt(selectedDepartment, 10));
    formData.append("designation_id", parseInt(selectedDesignation, 10));

    formData.append("work_location", e.target.location.value);

    formData.append("annual_ctc", e.target.ctc.value);
    formData.append("basic_salary", e.target.basic_salary.value);
    formData.append("variable_pay", e.target.variable_pay.value);

    const mappedDocuments = documents.map((doc, idx) => ({
      document_type: doc.type,
      document_number: doc.number,
      country: doc.country,
      issue_date: doc.issue_date,
      expiry_date: doc.expiry_date,
      status: doc.status,
      note: doc.notes,
      image_field: `document_images_${idx}`,
    }));

    formData.append("documents", JSON.stringify(mappedDocuments));

    // 🔥 THIS IS REQUIRED FOR FILE UPLOAD
    documents.forEach((doc, idx) => {
      doc.files.forEach((file) => {
        formData.append(`document_images_${idx}`, file);
      });
    });

    // 🔍 PRINT EVERYTHING (DEBUG)
    console.log("===== FORM DATA PAYLOAD =====");
    for (let [key, value] of formData.entries()) {
      console.log(key, value, typeof value);
    }
    console.log("===== END FORM DATA =====");

    // 🚀 SEND TO BACKEND
    onSubmit(formData);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    onSuccess?.();
  };

  /* ================= RENDER ================= */
  return (
    <>
      <div className={`success-message ${showSuccess ? "show" : ""}`}>
        <i className="fa-solid fa-check-circle" />
        {mode === "edit"
          ? "Employee updated successfully!"
          : "Employee added successfully!"}
      </div>

      <form
        className="form-container"
        id="employeeForm"
        onSubmit={handleSubmit}
        ref={formRef}
      >
        {/* Personal Information */}
        <div className="form-section">
          <h2 className="section-title">
            <i className="fa-solid fa-user" />
            Personal Information
          </h2>

          <div className="form-group full-width">
            <div className="photo-upload">
              <div className="photo-preview" id="photoPreview">
                {photoPreview ? (
                  <img src={photoPreview} alt="Employee" />
                ) : (
                  <i className="fa-solid fa-user" />
                )}
              </div>
              <div>
                <label htmlFor="photoUpload" className="upload-btn">
                  <i className="fa-solid fa-upload" /> Upload Photo
                </label>
                <input
                  type="file"
                  id="photoUpload"
                  className="file-input"
                  accept="image/*"
                  name="image"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: 20 }}>
            <div className="form-group">
              <label className="form-label required">Full Name</label>
              <input
                type="text"
                className="form-input"
                name="full_name"
                required
                defaultValue={initialValues.first_name || ""}
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Date of Birth</label>
              <input
                type="date"
                className="form-input"
                name="dob"
                required
                defaultValue={initialValues.dob || ""}
              />
            </div>
            <div className="form-group">
              <label className="form-label required">Gender</label>
              <select
                className="form-select"
                name="gender"
                required
                defaultValue={initialValues.gender || ""}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label required">Personal Email</label>
              <input
                type="email"
                className="form-input"
                name="personal_email"
                required
                defaultValue={initialValues.personal_email || ""}
              />
            </div>
            <div className="form-group">
              <label className="form-label required">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                name="phone"
                required
                defaultValue={initialValues.phone || ""}
              />
            </div>
            <div className="form-group">
              <label className="form-label required">Qualification</label>
              <input
                type="text"
                className="form-input"
                name="qualification"
                required
                defaultValue={initialValues.last_name || ""}
              />
            </div>
          </div>

          <div className="form-group full-width" style={{ marginTop: 20 }}>
            <label className="form-label required">Address</label>
            <textarea
              className="form-textarea"
              name="address"
              required
              defaultValue={initialValues.address || ""}
            ></textarea>
          </div>
        </div>

        {/* Employment Details */}
        <div className="form-section">
          <h2 className="section-title">
            <i className="fa-solid fa-briefcase" />
            Employment Details
          </h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Employee ID</label>
              <input
                type="text"
                className="form-input"
                name="employee_id"
                required
                defaultValue={initialValues.employee_id || ""}
              />
            </div>
            <div className="form-group">
              <label className="form-label required">Company Email</label>
              <input
                type="email"
                className="form-input"
                name="company_email"
                required
                defaultValue={initialValues.company_email || ""}
              />
            </div>
            <div className="form-group">
              <label className="form-label required">Joining Date</label>
              <input
                type="date"
                className="form-input"
                name="joining_date"
                required
                defaultValue={initialValues.joining_date || ""}
              />
            </div>
            {/* Employment Type (DYNAMIC) */}
            <div className="form-group">
              <label className="form-label required">Employment Type</label>

              {/* Select + Refresh (same layout as Department) */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <select
                  className="form-select"
                  value={selectedEmploymentType}
                  onChange={handleEmploymentTypeChange}
                  required
                  style={{ flex: 1 }}
                >
                  <option value="">Select Employment Type</option>

                  {employmentTypes.map((et) => (
                    <option key={et.id} value={String(et.id)}>
                      {et.name}
                    </option>
                  ))}

                  <option value="__add_employment_type__">
                    + Add Employment Type
                  </option>
                </select>

                {/* Refresh Button */}
                <button
                  type="button"
                  className="btn btn-icon"
                  onClick={refreshEmploymentTypes}
                  title="Refresh Employment Type List"
                  style={{
                    background: "#f1f1f1",
                    border: "1px solid #ccc",
                    padding: "0 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="fa-solid fa-rotate-right"></i>
                </button>
              </div>

              {/* Inline add UI — SAME STYLE AS DEPARTMENT */}
              {isAddingEmploymentType && (
                <div className="inline-add-group" style={{ marginTop: 8 }}>
                  <input
                    type="text"
                    className="form-select"
                    placeholder="Enter new employment type"
                    value={newEmploymentTypeName}
                    onChange={(e) => setNewEmploymentTypeName(e.target.value)}
                    style={{ width: "100%" }}
                  />

                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleConfirmAddEmploymentType}
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancelAddEmploymentType}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Department with "Add Department" option + Refresh button */}
            <div className="form-group">
              <label className="form-label required">Department</label>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <select
                  className="form-select"
                  name="department"
                  value={selectedDepartment}
                  onChange={handleDepartmentChange}
                  required
                  style={{ flex: 1 }}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                  <option value="__add_dept__">+ Add Department</option>
                </select>

                <button
                  type="button"
                  className="btn btn-icon"
                  onClick={refreshDepartments}
                  title="Refresh Department List"
                  style={{
                    background: "#f1f1f1",
                    border: "1px solid #ccc",
                    padding: "0 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="fa-solid fa-rotate-right"></i>
                </button>
              </div>

              {isAddingDept && (
                <div className="inline-add-group" style={{ marginTop: 8 }}>
                  <input
                    type="text"
                    className="form-select"
                    placeholder="Enter new department"
                    value={newDeptLabel}
                    onChange={(e) => setNewDeptLabel(e.target.value)}
                    style={{ width: "100%" }}
                  />

                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleConfirmAddDepartment}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancelAddDepartment}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Designation with "Add Designation" option + Refresh button */}
            <div className="form-group">
              <label className="form-label required">Designation</label>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <select
                  className="form-select"
                  name="designation"
                  required
                  value={selectedDesignation}
                  onChange={handleDesignationChange}
                  disabled={!selectedDepartment}
                  style={{ flex: 1 }}
                >
                  <option value="">
                    {selectedDepartment
                      ? "Select Designation"
                      : "Select Department first"}
                  </option>
                  {(designationsByDept[selectedDepartment] || []).map(
                    (desig) => (
                      <option key={desig.id} value={desig.id}>
                        {desig.name}
                      </option>
                    )
                  )}

                  {selectedDepartment && (
                    <option value="__add_desig__">+ Add Designation</option>
                  )}
                </select>

                <button
                  type="button"
                  className="btn btn-icon"
                  onClick={refreshDesignations}
                  title="Refresh Designation List"
                  style={{
                    background: "#f1f1f1",
                    border: "1px solid #ccc",
                    padding: "0 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="fa-solid fa-rotate-right"></i>
                </button>
              </div>

              {isAddingDesig && (
                <div className="inline-add-group" style={{ marginTop: 8 }}>
                  <input
                    type="text"
                    className="form-select"
                    placeholder="Enter new designation"
                    value={newDesigLabel}
                    onChange={(e) => setNewDesigLabel(e.target.value)}
                    style={{ width: "100%" }}
                  />

                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleConfirmAddDesignation}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancelAddDesignation}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required">Work Location</label>
              <select
                className="form-select"
                name="location"
                defaultValue={initialValues.location || ""}
                required
              >
                <option value="">Select Location</option>
                <option value="hq">Head Office - New York</option>
                <option value="remote">Remote</option>
                <option value="branch1">Branch Office - California</option>
                <option value="branch2">Branch Office - Texas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents (dynamic) */}
        <div className="form-section">
          <h2 className="section-title">
            <i className="fa-solid fa-passport"></i>
            Visa / License / Passport Documents
          </h2>

          {(documents || []).map((doc, index) => (
            <div
              key={index}
              className="exp-block"
              style={{
                border: "1px solid #ddd",
                padding: 15,
                borderRadius: 8,
                marginBottom: 15,
                background: "#fafafa",
              }}
            >
              <h3 style={{ marginBottom: 10 }}>Document {index + 1}</h3>

              <div className="form-grid">
                {/* Document Type */}
                <div className="form-group">
                  <label className="form-label required">Document Type</label>
                  <select
                    className="form-select"
                    value={doc.type}
                    onChange={(e) =>
                      handleDocumentChange(index, "type", e.target.value)
                    }
                    required
                  >
                    <option value="visa">Visa</option>
                    <option value="license">License</option>
                    <option value="passport">Passport</option>
                    <option value="id">National ID</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Document Number */}
                <div className="form-group">
                  <label className="form-label required">Document Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={doc.number}
                    onChange={(e) =>
                      handleDocumentChange(index, "number", e.target.value)
                    }
                    required
                  />
                </div>

                {/* Country */}
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <select
                    className="form-select"
                    value={doc.country}
                    onChange={(e) =>
                      handleDocumentChange(index, "country", e.target.value)
                    }
                  >
                    <option value="">Select Country</option>
                    <option value="usa">United States</option>
                    <option value="india">India</option>
                    <option value="uk">United Kingdom</option>
                    <option value="canada">Canada</option>
                    <option value="germany">Germany</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Issue Date */}
                <div className="form-group">
                  <label className="form-label">Issue Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={doc.issue_date}
                    onChange={(e) =>
                      handleDocumentChange(index, "issue_date", e.target.value)
                    }
                  />
                </div>

                {/* Expiry Date */}
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={doc.expiry_date}
                    onChange={(e) =>
                      handleDocumentChange(index, "expiry_date", e.target.value)
                    }
                  />
                </div>

                {/* Status */}
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={doc.status}
                    onChange={(e) =>
                      handleDocumentChange(index, "status", e.target.value)
                    }
                  >
                    <option value="valid">Valid</option>
                    <option value="expiring_soon">Expiring Soon</option>
                    <option value="expired">Expired</option>
                    <option value="applied">Applied</option>
                    <option value="not_required">Not Required</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="form-group full-width" style={{ marginTop: 12 }}>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={doc.notes}
                  onChange={(e) =>
                    handleDocumentChange(index, "notes", e.target.value)
                  }
                ></textarea>
              </div>

              {/* File upload (multiple) */}
              <div className="form-group full-width" style={{ marginTop: 12 }}>
                <label className="form-label">Upload Scans / Images</label>

                <input
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={(e) =>
                    handleDocumentFilesChange(index, e.target.files)
                  }
                  className="form-input"
                  style={{ marginTop: 8 }}
                />

                {/* previews */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 8,
                  }}
                >
                  {(doc.previews || []).map((p, fi) => {
                    const isPdf =
                      doc.files &&
                      doc.files[fi] &&
                      doc.files[fi].type === "application/pdf";
                    return (
                      <div
                        key={fi}
                        style={{
                          width: 110,
                          border: "1px solid #ddd",
                          borderRadius: 6,
                          padding: 6,
                          background: "#fff",
                          position: "relative",
                        }}
                      >
                        {isPdf ? (
                          <div
                            style={{
                              fontSize: 12,
                              wordBreak: "break-word",
                              height: 64,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {doc.files[fi]?.name}
                          </div>
                        ) : (
                          <img
                            src={p.url}
                            alt={doc.files[fi]?.name || "preview"}
                            style={{
                              width: "100%",
                              height: 64,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveDocumentFile(index, fi)}
                          style={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            background: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            padding: "2px 6px",
                            cursor: "pointer",
                          }}
                          title="Remove image"
                        >
                          ✕
                        </button>

                        <div
                          style={{
                            fontSize: 11,
                            marginTop: 6,
                            textAlign: "center",
                            maxWidth: 100,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {doc.files[fi]?.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Remove Button */}
              {documents.length > 1 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleRemoveDocument(index)}
                >
                  <i className="fa-solid fa-trash"></i> Remove Document
                </button>
              )}
            </div>
          ))}

          {/* Add Button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddDocument}
          >
            <i className="fa-solid fa-plus"></i> Add Document
          </button>
        </div>

        {/* Compensation */}
        <div className="form-section">
          <h2 className="section-title">
            <i className="fa-solid fa-money-bill-wave" />
            Compensation Details
          </h2>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label required">Annual CTC</label>
              <input
                type="number"
                className="form-input"
                name="ctc"
                required
                placeholder="$"
                defaultValue={initialValues.ctc || ""}
              />
            </div>
            <div className="form-group">
              <label className="form-label required">Basic Salary</label>
              <input
                type="number"
                className="form-input"
                name="basic_salary"
                required
                placeholder="$"
                defaultValue={initialValues.basic_salary || ""}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Variable Pay</label>
              <input
                type="number"
                className="form-input"
                name="variable_pay"
                placeholder="$"
                defaultValue={initialValues.variable_pay || ""}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bank Name</label>
              <input
                type="text"
                className="form-input"
                name="bank_name"
                defaultValue={initialValues.bank_name || ""}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Account Number</label>
              <input
                type="text"
                className="form-input"
                name="account_number"
                defaultValue={initialValues.account_number || ""}
              />
            </div>
            <div className="form-group">
              <label className="form-label">IFSC Code</label>
              <input
                type="text"
                className="form-input"
                name="ifsc_code"
                defaultValue={initialValues.ifsc_code || ""}
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="form-section">
          <h2 className="section-title">
            <i className="fa-solid fa-phone" />
            Emergency Contact
          </h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Contact Name</label>
              <input
                type="text"
                className="form-input"
                name="emergency_name"
                required
                defaultValue={initialValues.emergency_name || ""}
              />
            </div>
            <div className="form-group">
              <label className="form-label required">Relationship</label>
              <input
                type="text"
                className="form-input"
                name="emergency_relation"
                required
                defaultValue={initialValues.emergency_relation || ""}
              />
            </div>
            <div className="form-group">
              <label className="form-label required">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                name="emergency_phone"
                required
                defaultValue={initialValues.emergency_phone || ""}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                name="emergency_email"
                defaultValue={initialValues.emergency_email || ""}
              />
            </div>
          </div>
        </div>

        {/* Form actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
          >
            <i className="fa-solid fa-rotate-left" />
            Reset
          </button>
          <button type="submit" className="btn btn-primary">
            <i className="fa-solid fa-check" />
            {mode === "edit" ? "Update Employee" : "Add Employee"}
          </button>
        </div>
      </form>
    </>
  );
}

export default EmployeeForm;
