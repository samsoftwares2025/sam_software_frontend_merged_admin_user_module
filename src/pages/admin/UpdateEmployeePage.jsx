// src/pages/admin/UpdateEmployeePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import UpdateEmployeeForm from "../../components/admin/employee/UpdateEmployeeForm";
import LoaderOverlay from "../../components/common/LoaderOverlay";

import "../../assets/styles/admin.css";
import { getEmployeeById, updateEmployee } from "../../api/admin/employees";

/* SUCCESS MODAL */
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

function UpdateEmployeePage() {
  const [failureMessage, setFailureMessage] = useState("Failed to update employee.");
  const [processing, setProcessing] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);

 const FailureModal = ({ onClose, message }) => (
  <div className="modal-overlay">
    <div className="modal-card error">
      <h2>❌ Update Failed</h2>
      <p>{message}</p>  {/* SHOW BACKEND ERROR HERE */}

      <button className="btn btn-primary" onClick={onClose}>
        OK
      </button>
    </div>
  </div>
);


  const { id } = useParams();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("employees");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialValues, setInitialValues] = useState(null);

  /* FETCH EMPLOYEE DATA */
  useEffect(() => {
    if (!id) {
      setError("Invalid employee id");
      setLoading(false);
      return;
    }

    const fetchEmployee = async () => {
      try {
        const resp = await getEmployeeById(id);

        const emp = resp?.employee;
        const documents = resp?.documents || [];
        const experiences = resp?.experiences || [];

        if (!emp) throw new Error("Employee not found");

        setInitialValues({
          id: emp.id,
          name: emp.name ?? "",
          date_of_birth: emp.date_of_birth ?? "",
          gender: emp.gender ?? "",
          personal_email: emp.personal_email ?? "",
          phone: emp.phone ?? "",
          qualification: emp.qualification ?? "",
          address: emp.address ?? "",
          country: emp.country ?? "",
          state: emp.state ?? "",
          city: emp.city ?? "",
          postal_code: emp.postal_code ?? "",
          image: emp.image ?? null,

          employee_id: emp.employee_id ?? "",
          official_email: emp.official_email ?? "",
          joining_date: emp.joining_date ? emp.joining_date.split("T")[0] : "",
          last_working_date: emp.last_working_date
            ? emp.last_working_date.split("T")[0]
            : "",

          employment_type_id: String(emp.employment_type_id ?? ""),
          department_id: String(emp.department_id ?? ""),
          designation_id: String(emp.designation_id ?? ""),
          parent_id: emp.parent_id ? String(emp.parent_id) : "",
          user_role_id: emp.user_role_id ? String(emp.user_role_id) : "",

          work_location: emp.work_location ?? "",
          confirmation_date: emp.confirmation_date ?? "",
          is_active: emp.is_active,
          is_department_head: emp.is_department_head,

          annual_ctc: emp.annual_ctc ?? "",
          basic_salary: emp.basic_salary ?? "",
          variable_pay: emp.variable_pay ?? "",
          bank_name: emp.bank_name ?? "",
          account_number: emp.account_number ?? "",
          ifsc_code: emp.ifsc_code ?? "",

          emergency_contact_name: emp.emergency_contact_name ?? "",
          emergency_contact_relationship:
            emp.emergency_contact_relationship ?? "",
          emergency_contact_number: emp.emergency_contact_number ?? "",
          emergency_contact_email: emp.emergency_contact_email ?? "",

          documents,
          experiences,
        });
      } catch (err) {
        console.error("❌ UpdateEmployeePage error:", err);
        setError("Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  /* SUBMIT HANDLER */
  const handleFormSubmit = async (formData) => {
  try {
        setProcessing(true); // <-- start loader

    const userId = localStorage.getItem("user_id");

    if (!userId) {
      setFailureMessage("User authentication failed.");
      setShowFailureModal(true);
      return;
    }

    formData.append("id", Number(id));
    formData.append("user_id", userId);

    const response = await updateEmployee(formData);

    if (!response?.success) {
       setProcessing(false); // stop loader
      setFailureMessage(response?.message || "Failed to update employee.");
      setShowFailureModal(true);
      return;
    }

    setShowSuccessModal(true);
  } catch (err) {
      setProcessing(false);
    console.error("❌ Failed to update employee:", err);

    const backendMsg = err?.response?.data?.message || "Failed to update employee.";

    setFailureMessage(backendMsg);
    setShowFailureModal(true);
  }
};

  return (
    <div className="container">
      {processing && <LoaderOverlay />}

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
            <h3>Update Employee</h3>
            <p>Update employee profile</p>
          </div>
        </div>

        {loading && (
          <div style={{ padding: "2rem" }}>Loading employee data...</div>
        )}
        {!loading && error && (
          <div style={{ padding: "2rem", color: "orange" }}>{error}</div>
        )}

        {!loading && !error && initialValues && (
          <UpdateEmployeeForm
            initialValues={initialValues}
            onSubmit={handleFormSubmit}
          />
        )}
      </main>

      {/* FAILURE MODAL */}
     {showFailureModal && (
  <FailureModal 
    onClose={() => setShowFailureModal(false)}
    message={failureMessage} 
  />
)}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <SuccessModal
          onClose={() => {
            setShowSuccessModal(false);
            navigate("/admin/employee-master");
          }}
        />
      )}
    </div>
  );
}

export default UpdateEmployeePage;
