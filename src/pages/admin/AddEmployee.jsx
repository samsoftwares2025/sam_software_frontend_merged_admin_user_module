// src/pages/admin/AddEmployeePage.jsx

import React, { useState, useEffect } from "react";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import AddEmployeeForm from "../../components/admin/employee/AddEmployeeForm";
import "../../assets/styles/admin.css";
import Select from "react-select";

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
      console.error("Failed to load managers", err);
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

    const response = await importEmployees(formData);

    if (response?.success) {
      onSuccess(response.message); // summary text
    } else {
      onError(response?.message || "Import failed. Please try again.");
    }

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card import-modal-wide">
        <h2 className="modal-title">📥 Import Employees</h2>

        {/* Manager dropdown */}
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

        {/* File upload */}
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
    SUCCESS MODAL (SUMMARY ONLY)
====================================================== */
function ImportSuccessModal({ message, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card success">
        <h2>✅ Import Completed</h2>

        <p style={{ marginTop: "10px" }}>{message}</p>

        <button className="btn btn-primary" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

/* ======================================================
    ERROR MODAL FOR IMPORT FAILURE
====================================================== */
function ImportErrorModal({ message, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card error">
        <h2>❌ Import Failed</h2>
        <p>{message}</p>

        <button className="btn btn-primary" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

/* ======================================================
    EMPLOYEE CREATE FAILURE MODAL
====================================================== */
function FailureModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card error">
        <h2>❌ Failed to Add Employee</h2>
        <p>Something went wrong while creating the employee.</p>
        <button className="btn btn-primary" onClick={onClose}>OK</button>
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

  const [showFailureModal, setShowFailureModal] = useState(false);

  // Import summary states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [importSummaryMessage, setImportSummaryMessage] = useState("");

  const [showImportErrorModal, setShowImportErrorModal] = useState(false);
  const [importErrorMessage, setImportErrorMessage] = useState("");

  const [showImportModal, setShowImportModal] = useState(false);

  /* Handle employee form submission */
  const handleFormSubmit = async (formData) => {
    try {
      const userId = localStorage.getItem("userId");
      formData.append("user_id", userId);

      const response = await createEmploye(formData);

      if (!response?.success) {
        setShowFailureModal(true);
      }

      return response;
    } catch (error) {
      setShowFailureModal(true);
      return { success: false };
    }
  };

  return (
    <div className="container">
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

        <AddEmployeeForm mode="create" onSubmit={handleFormSubmit} />
      </main>

      <div
        id="sidebarOverlay"
        className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Employee create failure */}
      {showFailureModal && (
        <FailureModal onClose={() => setShowFailureModal(false)} />
      )}

      {/* Import success (summary only) */}
      {showSuccessModal && (
        <ImportSuccessModal
          message={importSummaryMessage}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {/* Import global error */}
      {showImportErrorModal && (
        <ImportErrorModal
          message={importErrorMessage}
          onClose={() => setShowImportErrorModal(false)}
        />
      )}

      {/* Import modal */}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={(summary) => {
            setImportSummaryMessage(summary);
            setShowSuccessModal(true);
          }}
          onError={(msg) => {
            setImportErrorMessage(msg);
            setShowImportErrorModal(true);
          }}
        />
      )}
    </div>
  );
}

export default AddEmployeePage;
