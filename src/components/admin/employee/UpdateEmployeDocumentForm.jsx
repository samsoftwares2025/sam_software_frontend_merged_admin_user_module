import React, { useRef, useState, useEffect } from "react";

import DocumentsSection from "./DocumentsSection";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";
import "../../../assets/styles/admin.css";

import { listEmployementTypes } from "../../../api/admin/employement_type";
import { listDepartments } from "../../../api/admin/departments";
import { listDesignations } from "../../../api/admin/designations";
import { deleteEmployeedata } from "../../../api/admin/employees";

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

  /* ================= DOCUMENTS ================= */
  const [documents, setDocuments] = useState([]);

  /* ================= DELETE MODAL ================= */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toDateInput = (value) => {
    if (!value) return "";
    return value.split("T")[0];
  };

  /* ================= SYNC INITIAL VALUES ================= */
  useEffect(() => {
    if (initialValues?.image) {
      setPhotoPreview(initialValues.image);
    }

    setSelectedEmploymentType(initialValues?.employment_type_id || "");
    setSelectedDepartment(initialValues?.department_id || "");
    setSelectedDesignation(initialValues?.designation_id || "");

    if (Array.isArray(initialValues?.documents) && initialValues.documents.length) {
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
  }, [initialValues]);

  /* ================= FETCH DROPDOWNS ================= */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const etRes = await listEmployementTypes();
        setEmploymentTypes(
          Array.isArray(etRes?.employment_types)
            ? etRes.employment_types
            : etRes || []
        );

        const deptRes = await listDepartments();
        const deptList = Array.isArray(deptRes)
          ? deptRes
          : deptRes?.departments || [];

        setDepartments(deptList.map((d) => ({ value: d.id, label: d.name })));

        const desigRes = await listDesignations();
        const desigList = Array.isArray(desigRes)
          ? desigRes
          : desigRes?.designations || [];

        const grouped = {};
        desigList.forEach((d) => {
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
    setDocuments((prev) => [...prev, { number: "", files: [], previews: [] }]);
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

  /* ================= DELETE DOCUMENT ================= */
  const handleRemoveDocument = (index, documentId) => {
    if (!documentId) {
      setDocuments((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    setDeleteTarget({ index, documentId });
    setShowDeleteModal(true);
  };

  const confirmDeleteDocument = async () => {
    if (!deleteTarget) return;

    const user_id = localStorage.getItem("user_id");

    if (!user_id) {
      alert("Session expired. Please login again.");
      return;
    }

    try {
      setDeleting(true);

      await deleteEmployeedata({
        user_id,
        document_id: deleteTarget.documentId,
      });

      setDocuments((prev) =>
        prev.filter((_, i) => i !== deleteTarget.index)
      );

      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("❌ Failed to delete document:", err);
      alert("Failed to delete document. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
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
      doc.files.forEach((file) => {
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

      {showDeleteModal && (
        <DeleteConfirmModal
          title="Delete Document"
          message="Are you sure you want to delete this document?"
          loading={deleting}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteTarget(null);
          }}
          onConfirm={confirmDeleteDocument}
        />
      )}
    </form>
  );
}
