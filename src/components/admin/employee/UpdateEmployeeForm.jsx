import React, { useRef, useState, useEffect } from "react";

import PersonalInfoSection from "./PersonalInfoSection";
import EmploymentSection from "./EmploymentSection";
import DocumentsSection from "./DocumentsSection";
import CompensationSection from "./CompensationSection";
import EmergencyContactSection from "./EmergencyContactSection";
import PreviousExperienceSection from "./PreviousExperienceSection";

import "../../../assets/styles/admin.css";

/* ===========================================================
   SUCCESS MODAL (for update)
=========================================================== */
const SuccessModal = ({ onClose }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="success-icon">
        <i className="fa-solid fa-circle-check"></i>
      </div>
      <h2>Employee Updated Successfully</h2>
      <p>The employee profile has been updated.</p>
      <button className="btn btn-primary" onClick={onClose}>
        OK
      </button>
    </div>
  </div>
);

/* ===========================================================
   ERROR MODAL
=========================================================== */
const ErrorModal = ({ onClose }) => (
  <div className="modal-overlay">
    <div className="modal-card error">
      <div className="error-icon">
        <i className="fa-solid fa-triangle-exclamation"></i>
      </div>
      <h2>⚠️ Validation Error</h2>
      <p>Fix the highlighted duplicate fields before submitting.</p>
      <button className="btn btn-primary" onClick={onClose}>
        OK
      </button>
    </div>
  </div>
);

/* ===========================================================
   GLOBAL DUPLICATE ERROR STRUCTURE
=========================================================== */
const initialErrorState = {
  personal_email: "",
  phone: "",
  official_email: "",
  employee_id: "",
  emergency_contact_number: "",
  emergency_contact_email: "",
  account_number: "",
};

export default function UpdateEmployeeForm({ initialValues = {}, onSubmit }) {
  const formRef = useRef(null);
  const [photoFile, setPhotoFile] = useState(null);

  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  const [deletedExperienceIds, setDeletedExperienceIds] = useState([]);
  const [deletedDocumentIds, setDeletedDocumentIds] = useState([]);

  const [selectedEmploymentType, setSelectedEmploymentType] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedIsActive, setSelectedIsActive] = useState("");
  const [selectedIsDepartmentHead, setSelectedIsDepartmentHead] = useState("");


  const [documents, setDocuments] = useState([]);
  const [experiences, setExperiences] = useState([]);

  const toDateInput = (value) => (value ? value.split("T")[0] : "");

  /* ===========================================================
     LOAD PERSONAL INFO
  ============================================================ */
  useEffect(() => {
    const emp = initialValues?.employee ?? initialValues;
    if (!emp) return;

    setPersonalInfo({
      name: emp.name ?? "",
      date_of_birth: toDateInput(emp.date_of_birth),
      gender: emp.gender ?? "",
      personal_email: emp.personal_email ?? "",
      phone: emp.phone ?? "",
      qualification: emp.qualification ?? "",
      address: emp.address ?? "",
      country: emp.country ?? "",
      state: emp.state ?? "",
      city: emp.city ?? "",
      postal_code: emp.postal_code ?? "",
    });
  }, [initialValues]);

  /* ===========================================================
     LOAD OTHER EMPLOYEE DATA
  ============================================================ */
  useEffect(() => {
    if (initialValues?.image) setPhotoPreview(initialValues.image);

    setSelectedEmploymentType(initialValues?.employment_type_id || "");
    setSelectedDepartment(initialValues?.department_id || "");
    setSelectedDesignation(initialValues?.designation_id || "");
    setSelectedRoleId(initialValues?.user_role_id || "");
    setSelectedParentId(initialValues?.parent_id || "");
    setSelectedIsActive(initialValues?.is_active === true ? "True" : "False");
    setSelectedIsDepartmentHead(initialValues?.is_department_head === true ? "True" : "False");


    /* ------------------- DOCUMENTS ------------------- */
    if (Array.isArray(initialValues?.documents)) {
      setDocuments(
        initialValues.documents.map((doc) => ({
          id: doc.document_id,
          type: doc.document_type || "",
          number: doc.document_number || "",
          country: doc.country || "",
          issue_date: toDateInput(doc.issue_date),
          expiry_date: toDateInput(doc.expiry_date),
          status: doc.status || "",
          notes: doc.note || "",
          files: [],
          previews: (doc.images || []).map((img) => ({
            url: img.url,
            image_id: img.image_id,
            existing: true,
          })),
        }))
      );
    } else {
      setDocuments([{ number: "", files: [], previews: [] }]);
    }

    /* ------------------- EXPERIENCE ------------------- */
    if (Array.isArray(initialValues?.experiences)) {
      setExperiences(
        initialValues.experiences.map((exp) => ({
          _key: exp.experience_id ?? exp.id ?? crypto.randomUUID(),
          experience_id: exp.experience_id ?? exp.id ?? null,
          company_name: exp.company_name || "",
          job_title: exp.job_title || "",
          start_date: toDateInput(exp.start_date),
          end_date: toDateInput(exp.end_date),
          responsibilities: exp.responsibilities || "",
        }))
      );
    } else {
      setExperiences([
        {
          _key: crypto.randomUUID(),
          experience_id: null,
          company_name: "",
          job_title: "",
          start_date: "",
          end_date: "",
          responsibilities: "",
        },
      ]);
    }
  }, [initialValues]);

  /* ===========================================================
     DOC HANDLERS
  ============================================================ */
  const handleAddDocument = () => {
    setDocuments((prev) => [...prev, { number: "", files: [], previews: [] }]);
  };

  const handleDocumentChange = (idx, field, value) => {
    setDocuments((prev) =>
      prev.map((doc, i) => (i === idx ? { ...doc, [field]: value } : doc))
    );
  };

  const handleDocumentFilesChange = (idx, files) => {
    const arr = Array.from(files);
    setDocuments((prev) =>
      prev.map((doc, i) =>
        i === idx
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

  const handleRemoveDocument = (index) => {
    setDocuments((prev) => {
      const doc = prev[index];

      if (doc?.id) {
        setDeletedDocumentIds((ids) =>
          ids.includes(doc.id) ? ids : [...ids, doc.id]
        );
      }

      return prev.filter((_, i) => i !== index);
    });
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

  /* ===========================================================
     EXPERIENCE HANDLERS
  ============================================================ */
  const handleAddExperience = () => {
    setExperiences((prev) => [
      ...prev,
      {
        _key: crypto.randomUUID(),
        experience_id: null,
        company_name: "",
        job_title: "",
        start_date: "",
        end_date: "",
        responsibilities: "",
      },
    ]);
  };

  const handleExperienceChange = (key, field, value) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp._key === key ? { ...exp, [field]: value } : exp))
    );
  };

  const handleRemoveExperience = (key) => {
    setExperiences((prev) => {
      const removed = prev.find((e) => e._key === key);

      if (removed?.experience_id) {
        setDeletedExperienceIds((ids) =>
          ids.includes(removed.experience_id)
            ? ids
            : [...ids, removed.experience_id]
        );
      }

      return prev.filter((e) => e._key !== key);
    });
  };

  /* ===========================================================
     SUBMIT HANDLER
  ============================================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ❌ BLOCK IF ANY DUPLICATE ERRORS
    const hasErrors = Object.values(formErrors).some((err) => err !== "");
    if (hasErrors) {
      setShowErrorModal(true);
      return;
    }

    const formData = new FormData(e.target);
    // append profile image if uploaded
 const fileInput = formRef.current.querySelector('input[name="image"]');
  if (fileInput?.files?.[0]) {
    formData.append("image", fileInput.files[0]);
  }

    formData.append("parent_id", selectedParentId || "");
    formData.append("employment_type_id", selectedEmploymentType);
    formData.append("department_id", selectedDepartment || "");
    formData.append("designation_id", selectedDesignation || "");
    formData.append("user_role_id", selectedRoleId || "");
    formData.append("is_active", selectedIsActive || "");
    formData.append("is_department_head", selectedIsDepartmentHead || "");

    /* ----- DOCS ----- */
    const mappedDocs = documents.map((doc, idx) => ({
      document_id: doc.id,
      document_type: doc.type,
      document_number: doc.number,
      country: doc.country,
      issue_date: doc.issue_date,
      expiry_date: doc.expiry_date,
      status: doc.status,
      note: doc.notes,
      image_field: `document_files_${idx}`,
    }));

    formData.append("documents", JSON.stringify(mappedDocs));

    documents.forEach((doc, idx) =>
      doc.files.forEach((f) => formData.append(`document_files_${idx}`, f))
    );

    /* ----- EXPERIENCE ----- */
    const cleaned = experiences.map(({ _key, ...rest }) => rest);
    formData.append("experience", JSON.stringify(cleaned));

    deletedExperienceIds.forEach((id) =>
      formData.append("deleted_experience_ids", id)
    );
    deletedDocumentIds.forEach((id) =>
      formData.append("deleted_document_ids", id)
    );

    const res = await onSubmit(formData);
    console.log("RES:", res); // ← CHECK THIS
    if (res?.success) {
      setShowSuccessModal(true);
    }
  };

  /* ===========================================================
     RENDER
  ============================================================ */
  return (
    <>
      <form className="form-container" ref={formRef} onSubmit={handleSubmit}>
        <PersonalInfoSection
          personalInfo={personalInfo}
          setPersonalInfo={setPersonalInfo}
          photoPreview={photoPreview}
          onPhotoChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setPhotoPreview(URL.createObjectURL(file));
              setPersonalInfo((prev) => ({ ...prev, image: file })); // <— store file here
            }
          }}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
          mode="edit"
        />
        <EmploymentSection
          mode="edit"
          initialValues={initialValues}
          selectedEmploymentType={selectedEmploymentType}
          setSelectedEmploymentType={setSelectedEmploymentType}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          selectedDesignation={selectedDesignation}
          setSelectedDesignation={setSelectedDesignation}
          selectedRoleId={selectedRoleId}
          setSelectedRoleId={setSelectedRoleId}
          selectedParentId={selectedParentId}
          setSelectedParentId={setSelectedParentId}
          selectedIsActive={selectedIsActive}
          setSelectedIsActive={setSelectedIsActive}
          selectedIsDepartmentHead={selectedIsDepartmentHead}
          setSelectedIsDepartmentHead={setSelectedIsDepartmentHead}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
        />

        <PreviousExperienceSection
          experiences={experiences}
          onAdd={handleAddExperience}
          onChange={handleExperienceChange}
          onRemove={handleRemoveExperience}
        />

        <DocumentsSection
          documents={documents}
          onAdd={handleAddDocument}
          onChange={handleDocumentChange}
          onFilesChange={handleDocumentFilesChange}
          onRemoveFile={handleRemoveDocumentFile}
          onRemoveDocument={handleRemoveDocument}
        />

        <CompensationSection
          initialValues={initialValues}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
        />

        <EmergencyContactSection
          initialValues={initialValues}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
        />

        <div className="form-actions" style={{ justifyContent: "flex-end" }}>
          <button type="submit" className="btn btn-primary">
            <i className="fa-solid fa-save" /> Update Employee
          </button>
        </div>
      </form>

      {/* MODALS */}
      {showErrorModal && (
        <ErrorModal onClose={() => setShowErrorModal(false)} />
      )}

      {showSuccessModal && (
        <SuccessModal onClose={() => setShowSuccessModal(false)} />
      )}
    </>
  );
}
