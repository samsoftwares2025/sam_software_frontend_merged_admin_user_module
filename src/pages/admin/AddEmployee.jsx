// src/pages/admin/AddEmployeePage.jsx

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import AddEmployeeForm from "../../components/admin/employee/AddEmployeeForm";
import "../../assets/styles/admin.css";
import Select from "react-select";

import LoaderOverlay from "../../components/common/LoaderOverlay";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

import {
  createEmploye,
  getEmployeesList,
  importEmployees,
} from "../../api/admin/employees";

/* ======================================================
    IMPORT EXCEL MODAL
====================================================== */
function ImportModal({ onClose, onSuccess, onError }) {
  const [employees, setEmployees] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [excelFile, setExcelFile] = useState(null);

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    try {
      const res = await getEmployeesList();
      setEmployees(res || []);
    } catch (err) {
      onError("Failed to load managers.");
    }
  };

  const managerOptions = employees.map((emp) => ({
    value: emp.id,
    label: `${emp.name} (${emp.employee_id})`,
  }));

  const handleImport = async () => {
    if (!excelFile) return onError("Please select an Excel file.");

    const userId = localStorage.getItem("userId");
    const formData = new FormData();

    formData.append("file", excelFile);
    formData.append("user_id", userId);

    if (selectedManager) {
      formData.append("parent_id", selectedManager.value);
    }

    try {
      const response = await importEmployees(formData);

      if (response?.success) {
        onSuccess(response.message);
      } else {
        onError(response?.message || "Import failed. Please try again.");
      }
    } catch (err) {
      onError("Import failed. Please try again.");
    }

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card import-modal-wide">
        <h2 className="modal-title">📥 Import Employees</h2>

        <div className="modal-field">
          <label className="modal-label">(Optional) Select Reporting Manager</label>
          <Select
            options={managerOptions}
            isClearable
            placeholder="Search & select manager..."
            value={selectedManager}
            onChange={setSelectedManager}
          />
        </div>

        <div className="modal-field">
          <label className="modal-label">Choose Excel File</label>

          <div className="file-upload-container">
            <label className="file-upload-btn">
              <i className="fa-solid fa-upload"></i> Choose File
              <input
                type="file"
                accept=".xls,.xlsx"
                onChange={(e) => setExcelFile(e.target.files[0])}
              />
            </label>

            <span className="file-upload-name">
              {excelFile ? excelFile.name : "No file selected"}
            </span>
          </div>
        </div>

        <div className="modal-actions mt-3">
          <button className="btn btn-primary" onClick={handleImport}>Import</button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ======================================================
    MAIN PAGE
====================================================== */
function AddEmployeePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("employees");

  const [loading, setLoading] = useState(false);

  // GLOBAL SUCCESS & ERROR MODALS
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);

  // 🔥 Reference to the child form (to trigger reset)
  const formRef = useRef(null);

  /* ======================================================
      EMPLOYEE FORM SUBMIT
  ======================================================= */
  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);

      const userId = localStorage.getItem("userId");
      formData.append("user_id", userId);

      const response = await createEmploye(formData);

      setLoading(false);

      if (!response?.success) {
        setErrorMessage(response?.message || "Failed to create employee.");
        setShowErrorModal(true);
        return response;
      }

      // ✅ CLEAR FORM ON SUCCESS
      if (formRef.current?.handleReset) {
        formRef.current.handleReset();
      }

      setSuccessMessage("Employee created successfully.");
      setShowSuccessModal(true);

      return response;
    } catch (err) {
      setLoading(false);
      setErrorMessage("Something went wrong while creating the employee.");
      setShowErrorModal(true);
      return { success: false };
    }
  };

  return (
    <div className="container">
      {loading && <LoaderOverlay />}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {/* ERROR MODAL */}
      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}

      <Sidebar
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        openSection={openSection}
        setOpenSection={setOpenSection}
      />

      <main className="main">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="page-header">
          <div className="page-title">
            <h3>Add New Employee</h3>
            <p>Fill in the employee details to create a new profile</p>
          </div>

          <button
            id="addEmployeeBtn"
            type="button"
            onClick={() => setShowImportModal(true)}
          >
            <i className="fa-solid fa-file-import" /> Import Excel
          </button>
        </div>

        {/* Pass the ref to the form */}
        <AddEmployeeForm ref={formRef} mode="create" onSubmit={handleFormSubmit} />
      </main>

      <div
        id="sidebarOverlay"
        className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* IMPORT MODAL */}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={(summary) => {
            setSuccessMessage(summary);
            setShowSuccessModal(true);
          }}
          onError={(msg) => {
            setErrorMessage(msg);
            setShowErrorModal(true);
          }}
        />
      )}
    </div>
  );
}

export default AddEmployeePage;
