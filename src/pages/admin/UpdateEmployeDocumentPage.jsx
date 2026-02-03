// src/pages/admin/UpdateEmployeeDocumentsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import UpdateEmployeDocumentForm from "../../components/admin/employee/UpdateEmployeDocumentForm";

import LoaderOverlay from "../../components/common/LoaderOverlay";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

import "../../assets/styles/admin.css";
import { getEmployeeById, updateEmployeeDoc } from "../../api/admin/employees";

function UpdateEmployeeDocumentsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("employees");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleRequestDeleteDocument = ({ index, documentId }) => {
    setDeleteTarget({ index, documentId });
    setShowDeleteModal(true);
  };

  /* ===== MODALS ===== */
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ============================
     FETCH EMPLOYEE DOCUMENTS
  ============================ */
  useEffect(() => {
    if (!id) {
      setError("Invalid employee id");
      setLoading(false);
      return;
    }

    const fetchEmployeeDocuments = async () => {
      try {
        const resp = await getEmployeeById(id);

        setInitialValues({
          id,
          documents: resp?.documents || [],
        });
      } catch (err) {
        console.error("❌ Failed to load employee documents:", err);
        setError("Failed to load employee documents");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDocuments();
  }, [id]);

  /* ============================
     SUBMIT HANDLER
  ============================ */
  const handleFormSubmit = async (formData) => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      setErrorMessage("Session expired. Please login again.");
      setShowError(true);
      return;
    }

    try {
      setSubmitting(true);

      formData.append("employee_id", id);
      formData.append("user_id", userId);

      await updateEmployeeDoc(formData);

      setShowSuccess(true);
    } catch (err) {
      console.error("❌ Failed to update employee documents:", err);
      setErrorMessage("Failed to update documents. Please try again.");
      setShowError(true);
    } finally {
      setSubmitting(false);
    }
  };

  /* ============================
     RENDER
  ============================ */
  return (
    <div className="container">
      <Sidebar
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        openSection={openSection}
        setOpenSection={setOpenSection}
      />

      <main className="main">
        <Header onMenuClick={() => setIsSidebarOpen((p) => !p)} />

        <div className="page-header">
          <div className="page-title">
            <h3>Update Employee Documents</h3>
            <p>Manage employee document records</p>
          </div>
        </div>

        {loading && <div style={{ padding: "2rem" }}>Loading documents...</div>}

        {!loading && error && (
          <div style={{ padding: "2rem", color: "orange" }}>{error}</div>
        )}

        {!loading && !error && initialValues && (
          <UpdateEmployeDocumentForm
            initialValues={initialValues}
            onSubmit={handleFormSubmit}
            onRequestDelete={handleRequestDeleteDocument}
          />
        )}
      </main>

      {/* ===== GLOBAL LOADER ===== */}
      {submitting && <LoaderOverlay />}

      {/* ===== SUCCESS MODAL ===== */}
      {showSuccess && (
        <SuccessModal
          title="Documents Updated"
          message="Employee documents have been updated successfully."
          onClose={() => {
            setShowSuccess(false);
            navigate("/admin/employee-documents");
          }}
        />
      )}

      {/* ===== ERROR MODAL ===== */}
      {showError && (
        <ErrorModal
          title="Update Failed"
          message={errorMessage}
          onClose={() => setShowError(false)}
        />
      )}

      {/* ===== DELETE CONFIRM MODAL (reserved if needed later) ===== */}
      {/* 
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

      */}
    </div>
  );
}

export default UpdateEmployeeDocumentsPage;
