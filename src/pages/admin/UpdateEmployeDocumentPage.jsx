// src/pages/admin/UpdateEmployeeDocumentsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import UpdateEmployeDocumentForm from "../../components/admin/employee/UpdateEmployeDocumentForm";

import "../../assets/styles/admin.css";
import { getEmployeeById, updateEmployeeDoc } from "../../api/admin/employees";

function UpdateEmployeeDocumentsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("employees");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialValues, setInitialValues] = useState(null);

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

        const documents = resp?.documents || [];

        setInitialValues({
          id,
          documents, // ✅ ONLY DOCUMENTS
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
    try {
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        alert("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      // REQUIRED BY BACKEND
      formData.append("employee_id", id);
      formData.append("user_id", userId);

      await updateEmployeeDoc(formData);

      navigate("/admin/employee-documents");
    } catch (err) {
      console.error("❌ Failed to update employee documents:", err);
      alert("Failed to update documents. Please try again.");
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

        {loading && (
          <div style={{ padding: "2rem" }}>
            Loading documents...
          </div>
        )}

        {!loading && error && (
          <div style={{ padding: "2rem", color: "orange" }}>
            {error}
          </div>
        )}

        {!loading && !error && initialValues && (
          <UpdateEmployeDocumentForm
            initialValues={initialValues}
            onSubmit={handleFormSubmit}
          />
        )}
      </main>
    </div>
  );
}

export default UpdateEmployeeDocumentsPage;
