import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import DocumentsSection from "../../components/admin/employee/DocumentsSection";
import "../../assets/styles/admin.css";

import {
  getEmployeesList,
  getEmployeeById,
  Add_New_Employee_Doc,
} from "../../api/admin/employees";

function AddEmployeeDocumentsPage() {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);

  /* ===============================
     EMPLOYEE DROPDOWN
  ================================ */
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const employeeOptions = employees.map((emp) => ({
    value: emp.id,
    label: `${emp.name} (${emp.employee_id})`,
  }));

  /* ===============================
     DOCUMENTS STATE
  ================================ */
  const emptyDoc = {
    id: null,
    type: "",
    number: "",
    country: "",
    issue_date: "",
    expiry_date: "",
    status: "valid",
    notes: "",
    previews: [],
    files: [],
    manualCountry: false,
  };

  const [documents, setDocuments] = useState([emptyDoc]);

  const toDateInput = (value) => {
    if (!value) return "";
    return value.split("T")[0]; // YYYY-MM-DD
  };

  /* ===============================
     LOAD EMPLOYEES
  ================================ */
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const list = await getEmployeesList();
        setEmployees(list || []);
      } catch (err) {
        console.error("Failed to fetch employees", err);
      }
    };

    fetchEmployees();
  }, []);

  /* ===============================
     LOAD DOCUMENTS ON EMPLOYEE SELECT
  ================================ */
  useEffect(() => {
    if (!selectedEmployeeId) {
      setDocuments([{ ...emptyDoc }]);
      return;
    }

    const fetchEmployeeDocuments = async () => {
      try {
        const res = await getEmployeeById(selectedEmployeeId);

        if (Array.isArray(res?.documents) && res.documents.length) {
          setDocuments(
            res.documents.map((doc) => ({
              id: doc.document_id,
              type: doc.document_type || "",
              number: doc.document_number || "",
              country: doc.country || "",
              issue_date: toDateInput(doc.issue_date),
              expiry_date: toDateInput(doc.expiry_date),
              status: doc.status || "valid",
              notes: doc.note || "",
              manualCountry: false,
              files: [],
              previews: (doc.images || []).map((img) => ({
                url: img.url,
                image_id: img.image_id,
                existing: true,
              })),
            })),
          );
        } else {
          setDocuments([{ ...emptyDoc }]);
        }
      } catch (err) {
        console.error("Failed to load employee documents", err);
        setDocuments([{ ...emptyDoc }]);
      }
    };

    fetchEmployeeDocuments();
  }, [selectedEmployeeId]);

  /* ===============================
     DOCUMENT HANDLERS
  ================================ */
  const handleAddDocument = () => {
    setDocuments((prev) => [...prev, { ...emptyDoc }]);
  };

  const handleChange = (index, field, value) => {
    setDocuments((prev) =>
      prev.map((doc, i) =>
        i === index ? { ...doc, [field]: value } : doc,
      ),
    );
  };

  const handleFilesChange = (index, files) => {
    const fileArr = Array.from(files || []);

    const previews = fileArr.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      type: f.type,
    }));

    setDocuments((prev) =>
      prev.map((doc, i) =>
        i === index
          ? {
              ...doc,
              files: [...doc.files, ...fileArr],
              previews: [...doc.previews, ...previews],
            }
          : doc,
      ),
    );
  };

  const handleRemoveFile = (docIndex, fileIndex) => {
    setDocuments((prev) =>
      prev.map((doc, i) => {
        if (i !== docIndex) return doc;

        const preview = doc.previews[fileIndex];
        if (preview?.url?.startsWith("blob:")) {
          URL.revokeObjectURL(preview.url);
        }

        return {
          ...doc,
          previews: doc.previews.filter((_, fi) => fi !== fileIndex),
          files: doc.files.filter((_, fi) => fi !== fileIndex),
        };
      }),
    );
  };

  const handleRemoveDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  /* ===============================
     SUBMIT (SAME AS UPDATE PAGE)
  ================================ */
  const handleSubmit = async () => {
    try {
      if (!selectedEmployeeId) {
        alert("Please select an employee");
        return;
      }

      const userId = localStorage.getItem("user_id");

      if (!userId) {
        alert("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const formData = new FormData();

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

      formData.append("employee_id", selectedEmployeeId);

      formData.append("user_id", userId);
      formData.append("documents", JSON.stringify(mappedDocs));

      documents.forEach((doc, idx) => {
        doc.files.forEach((file) => {
          formData.append(`document_files_${idx}`, file);
        });
      });

      await Add_New_Employee_Doc(formData);

      navigate("/admin/employee-documents");
    } catch (err) {
      console.error("❌ Failed to save employee documents:", err);
      alert("Failed to save documents. Please try again.");
    }
  };

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className="container">
      <Sidebar
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        openSection={openSection}
        setOpenSection={setOpenSection}
      />

      <main className="main">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}/>

        <div className="page-title">
          <h3>Add Employee Documents</h3>
          <p className="subtitle">Select employee and upload documents</p>
        </div>

        <form
          className="form-card unified-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/* EMPLOYEE */}
          <div className="form-section">
            <h2 className="section-title">
              <i className="fa-solid fa-user"></i>
              Employee
            </h2>

            <div className="form-group">
              <label className="form-label required">Select Employee</label>
              <Select
                options={employeeOptions}
                isClearable
                placeholder="Search & select employee..."
                value={
                  employeeOptions.find(
                    (opt) => opt.value === Number(selectedEmployeeId),
                  ) || null
                }
                onChange={(opt) =>
                  setSelectedEmployeeId(opt ? opt.value : "")
                }
              />
            </div>
          </div>

          {/* DOCUMENTS */}
          <DocumentsSection
            documents={documents}
            onAdd={handleAddDocument}
            onChange={handleChange}
            onFilesChange={handleFilesChange}
            onRemoveFile={handleRemoveFile}
            onRemoveDocument={handleRemoveDocument}
          />

          {/* ACTIONS */}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Save Documents
            </button>
          </div>
        </form>
      </main>
      
      <div
        id="sidebarOverlay"
        className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}

export default AddEmployeeDocumentsPage;
