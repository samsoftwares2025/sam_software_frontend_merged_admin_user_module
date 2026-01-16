import React, { useRef, useState, useEffect } from "react";


import DocumentsSection from "./DocumentsSection";

import "../../../assets/styles/admin.css";

import { getEmployementTypes } from "../../../api/admin/employement_type";
import { getDepartments } from "../../../api/admin/departments";
import { getDesignations } from "../../../api/admin/designations";

export default function UpdateEmployeeForm({ initialValues = {}, onSubmit }) {
  const formRef = useRef(null);

  /* ================= PHOTO ================= */
  const [photoPreview, setPhotoPreview] = useState(null);

  /* ================= EMPLOYMENT ================= */
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designationsByDept, setDesignationsByDept] = useState({});

  const [selectedEmploymentType, setSelectedEmploymentType] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const toDateInput = (value) => {
  if (!value) return "";
  return value.split("T")[0]; // ✅ YYYY-MM-DD
};

  /* ================= DOCUMENTS ================= */
  const [documents, setDocuments] = useState([]);

  /* ================= SYNC INITIAL VALUES ================= */
  useEffect(() => {
    // ✅ PROFILE PHOTO
    if (initialValues?.image) {
      setPhotoPreview(initialValues.image);
    }

    // ✅ EMPLOYMENT
    setSelectedEmploymentType(initialValues?.employment_type_id || "");
    setSelectedDepartment(initialValues?.department_id || "");
    setSelectedDesignation(initialValues?.designation_id || "");

    // ✅ DOCUMENTS (FIXED IMAGE MAPPING)
    if (Array.isArray(initialValues?.documents) && initialValues.documents.length) {
      setDocuments(
        initialValues.documents.map(doc => ({
          id: doc.document_id,
          type: doc.document_type || "",
          number: doc.document_number || "",
          country: doc.country || "",
          issue_date: toDateInput(doc.issue_date),     // ✅ FIX
          expiry_date: toDateInput(doc.expiry_date),   // ✅ FIX
          status: doc.status || "",
          notes: doc.note || "",
          files: [],
          previews: (doc.images || []).map(img => ({
            url: img.url,               // ✅ FIX
            image_id: img.image_id,
            existing: true,
          })),
        }))
      );
    } else {
      setDocuments([{ number: "", files: [], previews: [] }]);
    }
  }, [initialValues]);

  /* ================= FETCH DROPDOWNS ================= */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const etRes = await getEmployementTypes();
        setEmploymentTypes(
          Array.isArray(etRes?.employment_types)
            ? etRes.employment_types
            : etRes || []
        );

        const deptRes = await getDepartments();
        const deptList = Array.isArray(deptRes)
          ? deptRes
          : deptRes?.departments || [];

        setDepartments(deptList.map(d => ({ value: d.id, label: d.name })));

        const desigRes = await getDesignations();
        const desigList = Array.isArray(desigRes)
          ? desigRes
          : desigRes?.designations || [];

        const grouped = {};
        desigList.forEach(d => {
          if (!grouped[d.department_id]) grouped[d.department_id] = [];
          grouped[d.department_id].push(d);
        });

        setDesignationsByDept(grouped);
      } catch (err) {
        console.error("Failed to load dropdown data", err);
      }
    };

    fetchAll();
  }, []);

  /* ================= DOCUMENT HANDLERS ================= */
  const handleAddDocument = () => {
    setDocuments(prev => [...prev, { number: "", files: [], previews: [] }]);
  };

  const handleDocumentChange = (index, field, value) => {
    setDocuments(prev =>
      prev.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc))
    );
  };

  const handleDocumentFilesChange = (index, files) => {
    const arr = Array.from(files);
    setDocuments(prev =>
      prev.map((doc, i) =>
        i === index
          ? {
              ...doc,
              files: [...doc.files, ...arr],
              previews: [
                ...doc.previews,
                ...arr.map(f => ({ url: URL.createObjectURL(f) })),
              ],
            }
          : doc
      )
    );
  };

  const handleRemoveDocumentFile = (docIdx, fileIdx) => {
    setDocuments(prev =>
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

  const handleRemoveDocument = index => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async e => {
    e.preventDefault();

    const formData = new FormData(e.target);


    const mappedDocs = documents.map((doc, idx) => ({
      document_id: doc.id || null,
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

    documents.forEach((doc, idx) => {
      doc.files.forEach(file => {
        formData.append(`document_files_${idx}`, file);
      });
    });

    await onSubmit(formData);
  };

  /* ================= RENDER ================= */
  return (
    <form className="form-container" ref={formRef} onSubmit={handleSubmit}>
    

      <DocumentsSection
        documents={documents}
        onAdd={handleAddDocument}
        onChange={handleDocumentChange}
        onFilesChange={handleDocumentFilesChange}
        onRemoveFile={handleRemoveDocumentFile}
        onRemoveDocument={handleRemoveDocument}
      />

     

      <div className="form-actions" style={{ justifyContent: "flex-end" }}>
        <button type="submit" className="btn btn-primary">
          <i className="fa-solid fa-save" /> Update Employee
        </button>
      </div>
    </form>
  );
}
