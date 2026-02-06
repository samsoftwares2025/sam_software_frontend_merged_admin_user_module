import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* CONTEXT */
import { AuthProvider } from "./context/AuthContext";
import { LoaderProvider, useLoader } from "./context/LoaderContext";
import { registerLoader } from "./api/loaderRegistry";
/* PUBLIC PAGES */
import Coming_soon from "./pages/home/Coming_soon";
import Home from "./pages/home/Home";
import LandingLayout from "./layouts/LandingLayout";

import NotFound from "./pages/auth/NotFound";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";

/* PROTECTED ROUTE */
import ProtectedRoute from "./components/admin/ProtectedRoute";

/* ADMIN PAGES */
import DashboardPage from "./pages/admin/DashboardPage";
import DepartmentsPage from "./pages/admin/departments/DepartmentsPage";
import DesignationPage from "./pages/admin/designation/DesignationPage";
import AddDesignationPage from "./pages/admin/designation/AddDesignationPage";
import UpdateDesignationPage from "./pages/admin/designation/UpdateDesignationPage";
import AddDepartmentPage from "./pages/admin/departments/AddDepartmentPage";
import UpdateDepartmentPage from "./pages/admin/departments/UpdateDepartmentPage";
import EmploymentTypePage from "./pages/admin/employmenttype/EmploymentTypePage";
import AddEmploymentTypePage from "./pages/admin/employmenttype/AddEmploymentTypePage";
import UpdateEmploymentTypePage from "./pages/admin/employmenttype/UpdateEmploymentTypePage";
import CompanyRegistrationPage from "./pages/auth/CompanyRegistrationPage";
import AddEmployeePage from "./pages/admin/employee/AddEmployee";
import EmployeeMasterDataPage from "./pages/admin/employee/EmployeeMasterDataPage";
import EmploymentHistoryPage from "./pages/admin/employee/EmploymentHistoryPage";
import EmployeeDocumentsPage from "./pages/admin/employee/EmployeeDocumentsPage";
import AddEmployeeDocumentsPage from "./pages/admin/employee/AddEmployeeDocumentsPage";
import UpdateEmployeDocumentPage from "./pages/admin/employee/UpdateEmployeDocumentPage";
import EmployeeDocumentsView from "./components/admin/EmployeeDocumentsView";
import MyProfile from "./pages/admin/MyProfile";
import EmployeeProfile from "./pages/admin/employee/EmployeeProfile";
import UpdateEmployeePage from "./pages/admin/employee/UpdateEmployeePage";
import UpdateMyProfileDataPage from "./pages/admin/UpdateMyProfileDataPage";
import PoliciesPage from "./pages/admin/policy/PoliciesPage";
import AddPolicyPage from "./pages/admin/policy/AddPolicyPage";
import UpdatePolicyPage from "./pages/admin/policy/UpdatePolicyPage";
import CompanyRulesPage from "./pages/admin/companyrules/CompanyRulesPage";
import CompanyDocumentsPage from "./pages/admin/companydocuments/CompanyDocumentsPage";
import AddCompanyDocumentPage from "./pages/admin/companydocuments/AddCompanyDocumentPage";
import ViewCompanyDocumentPage from "./pages/admin/companydocuments/ViewCompanyDocumentPage";
import UpdateCompanyDocumentPage from "./pages/admin/companydocuments/UpdateCompanyDocumentPage";
import AddCompanyRulePage from "./pages/admin/companyrules/AddCompanyRulePage";
import UpdateCompanyRulePage from "./pages/admin/companyrules/UpdateCompanyRulePage";
import RolesPermissions from "./pages/admin/rolesandpermission/RolesAndPermission";
import AddRolePage from "./pages/admin/rolesandpermission/AddRolePage";
import UpdateRolePage from "./pages/admin/rolesandpermission/UpdateRolePage";
import AssignRole from "./pages/admin/rolesandpermission/AssignRole";
import PersonalEmploymentHistoryPage from "./pages/admin/PersonalEmploymentHistoryPage";
import ComplianceDocumentationPage from "./pages/admin/tickets/ComplianceDocumentationPage";
import ComplianceTicketDetails from "./pages/admin/tickets/ComplianceTicketDetails";
import UpdateComplianceTicketDetails from "./pages/admin/tickets/UpdateComplianceTicketDetails";
import AddTicketTypePage from "./pages/admin/tickets/AddTicketTypePage";
import TicketTypesPage from "./pages/admin/tickets/TicketTypesPage";
import UpdateTicketTypePage from "./pages/admin/tickets/UpdateTicketTypePage";
import AddTicketAdminPage from "./pages/admin/tickets/AddTicketAdminPage";
import SupportAdminMyTicketsPage from "./pages/admin/tickets/SupportAdminMyTicketsPage";
import AddShiftPage from "./pages/admin/shift/AddShiftPage";
import ShiftsPage from "./pages/admin/shift/ShiftsPage";
import UpdateShiftPage from "./pages/admin/shift/UpdateShiftPage";

/* USER MODULE */
import Dashboard from "./pages/user/Dashboard";
import Myprofile from "./pages/user/Myprofile";
import MyDocument from "./pages/user/MyDocument";
import Myhistory from "./pages/user/Myhistory";
import ResetPassword from "./pages/user/ResetPassword";
import MyTickets from "./pages/user/Supportpage";
import AddTicket from "./pages/user/AddTicket";
import AssignedTickets from "./pages/admin/tickets/Userassighnticket";
import MyCompanyRules from "./pages/user/Companyrulesview";

import "./App.css";

/* 🔹 Loader Initializer (connects http.js ↔ Loader) */
function LoaderInitializer({ children }) {
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    registerLoader(showLoader, hideLoader);
  }, [showLoader, hideLoader]);

  return children;
}

function App() {
  console.log("MODE:", import.meta.env.MODE);
  console.log("API:", import.meta.env.VITE_API_BASE_URL);

  return (
    <AuthProvider>
      <LoaderProvider>
        <LoaderInitializer>
          <BrowserRouter>
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="*" element={<NotFound />} />
              <Route path="/" element={<Coming_soon />} />

              <Route element={<LandingLayout />}>
                <Route path="/hr/software" element={<Home />} />
              </Route>

              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/company/registration"
                element={<CompanyRegistrationPage />}
              />
              <Route
                path="/admin/forget-password"
                element={<ForgotPasswordPage />}
              />

              {/* ADMIN DASHBOARD */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute noPermissionCheck>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* EMPLOYEE MODULE */}
              <Route
                path="/admin/add-employee"
                element={
                  <ProtectedRoute module="employee" action="add">
                    <AddEmployeePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/employee-master"
                element={
                  <ProtectedRoute module="employee">
                    <EmployeeMasterDataPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/employment-history"
                element={
                  <ProtectedRoute module="employee">
                    <EmploymentHistoryPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/employee-documents"
                element={
                  <ProtectedRoute module="employee">
                    <EmployeeDocumentsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/add-employee-documents"
                element={
                  <ProtectedRoute module="employee">
                    <AddEmployeeDocumentsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/update-employee-documents/:id"
                element={
                  <ProtectedRoute module="employee" action="update">
                    <UpdateEmployeDocumentPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/employee-documents-view/:userId"
                element={
                  <ProtectedRoute module="employee">
                    <EmployeeDocumentsView />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/employee-profile/:id"
                element={
                  <ProtectedRoute module="employee">
                    <EmployeeProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/update-employee-profile/:id"
                element={
                  <ProtectedRoute module="employee" action="update">
                    <UpdateEmployeePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/update-my-profile/:id"
                element={
                  <ProtectedRoute
                    noPermissionCheck
                    module="employee"
                    action="update"
                  >
                    <UpdateMyProfileDataPage />
                  </ProtectedRoute>
                }
              />

              {/* DEPARTMENT MODULE */}
              <Route
                path="/admin/departments"
                element={
                  <ProtectedRoute module="department">
                    <DepartmentsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/add-department"
                element={
                  <ProtectedRoute module="department" action="add">
                    <AddDepartmentPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/update-department"
                element={
                  <ProtectedRoute module="department" action="update">
                    <UpdateDepartmentPage />
                  </ProtectedRoute>
                }
              />

              {/* DESIGNATION MODULE */}
              <Route
                path="/admin/designations"
                element={
                  <ProtectedRoute module="designation">
                    <DesignationPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/my-profile"
                element={
                  <ProtectedRoute noPermissionCheck>
                    <MyProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/view-employment-history/:id"
                element={
                  <ProtectedRoute noPermissionCheck>
                    <PersonalEmploymentHistoryPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/add-designation"
                element={
                  <ProtectedRoute module="designation" action="add">
                    <AddDesignationPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/update-designation"
                element={
                  <ProtectedRoute module="designation" action="update">
                    <UpdateDesignationPage />
                  </ProtectedRoute>
                }
              />

              {/* EMPLOYMENT TYPE MODULE */}
              <Route
                path="/admin/employment-type"
                element={
                  <ProtectedRoute module="employment type">
                    <EmploymentTypePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/add-employment-type"
                element={
                  <ProtectedRoute module="employment type" action="add">
                    <AddEmploymentTypePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/update-employment-type"
                element={
                  <ProtectedRoute module="employment type" action="update">
                    <UpdateEmploymentTypePage />
                  </ProtectedRoute>
                }
              />

              {/* POLICIES MODULE */}
              <Route
                path="/admin/policies"
                element={
                  <ProtectedRoute module="policies">
                    <PoliciesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/add-policy"
                element={
                  <ProtectedRoute module="policies" action="add">
                    <AddPolicyPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/update-policy"
                element={
                  <ProtectedRoute module="policies" action="update">
                    <UpdatePolicyPage />
                  </ProtectedRoute>
                }
              />

              {/* COMPANY RULES MODULE */}
              <Route
                path="/admin/company-rules"
                element={
                  <ProtectedRoute module="company rules">
                    <CompanyRulesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/add-company-rule"
                element={
                  <ProtectedRoute module="company rules" action="add">
                    <AddCompanyRulePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/update-company-rule"
                element={
                  <ProtectedRoute module="company rules" action="update">
                    <UpdateCompanyRulePage />
                  </ProtectedRoute>
                }
              />
              {/* company documents*/}

              <Route
                path="/admin/company-documents"
                element={
                  <ProtectedRoute module="company rules">
                    <CompanyDocumentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/add-company-document"
                element={
                  <ProtectedRoute module="company rules">
                    <AddCompanyDocumentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/view-company-document"
                element={
                  <ProtectedRoute module="company rules">
                    <ViewCompanyDocumentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/update-company-document"
                element={
                  <ProtectedRoute module="company rules">
                    <UpdateCompanyDocumentPage />
                  </ProtectedRoute>
                }
              />
              {/* ROLES & PERMISSIONS MODULE */}
              <Route
                path="/admin/roles-permissions"
                element={
                  <ProtectedRoute module="roles & permissions">
                    <RolesPermissions />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/add-role"
                element={
                  <ProtectedRoute module="roles & permissions" action="add">
                    <AddRolePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/update-role/:roleId"
                element={
                  <ProtectedRoute module="roles & permissions" action="update">
                    <UpdateRolePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/assign-role/:roleId"
                element={
                  <ProtectedRoute module="roles & permissions">
                    <AssignRole />
                  </ProtectedRoute>
                }
              />

              {/* SUPPORTING TICKETS MODULE */}
              <Route
                path="/admin/compliance-documentation"
                element={
                  <ProtectedRoute module="supporting tickets">
                    <ComplianceDocumentationPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/compliance-ticket/:id"
                element={
                  <ProtectedRoute module="supporting tickets">
                    <ComplianceTicketDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/update/compliance-ticket/:id"
                element={
                  <ProtectedRoute module="supporting tickets" action="update">
                    <UpdateComplianceTicketDetails />
                  </ProtectedRoute>
                }
              />

              {/* TICKET TYPE MODULE */}
              <Route
                path="/admin/ticket-types"
                element={
                  <ProtectedRoute module="ticket type">
                    <TicketTypesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/add-ticket-type"
                element={
                  <ProtectedRoute module="ticket type" action="add">
                    <AddTicketTypePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/update-ticket-type/:id"
                element={
                  <ProtectedRoute module="ticket type" action="update">
                    <UpdateTicketTypePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/add-support-ticket"
                element={
                  <ProtectedRoute noPermissionCheck>
                    <AddTicketAdminPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/list-support-ticket"
                element={
                  <ProtectedRoute noPermissionCheck>
                    <SupportAdminMyTicketsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/add-shift"
                element={
                  <ProtectedRoute module="shift" action="add">
                    <AddShiftPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/shifts"
                element={
                  <ProtectedRoute module="shift" action="view">
                    <ShiftsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/update-shift"
                element={
                  <ProtectedRoute module="shift" action="update">
                    <UpdateShiftPage />
                  </ProtectedRoute>
                }
              />
              {/* USER MODULE */}
              <Route path="/user/dashboard" element={<Dashboard />} />
              <Route path="/user/myprofile" element={<Myprofile />} />
              <Route path="/profile/documents" element={<MyDocument />} />
              <Route path="/profile/history" element={<Myhistory />} />
              <Route
                path="/profile/reset-password"
                element={<ResetPassword />}
              />
              <Route path="/user/support" element={<MyTickets />} />
              <Route path="/user/support/add" element={<AddTicket />} />
              <Route
                path="/admin/support/assigned"
                element={<AssignedTickets />}
              />
              <Route
                path="/profile/company-rules"
                element={
                  <ProtectedRoute noPermissionCheck>
                    <MyCompanyRules />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </LoaderInitializer>
      </LoaderProvider>
    </AuthProvider>
  );
}

export default App;
