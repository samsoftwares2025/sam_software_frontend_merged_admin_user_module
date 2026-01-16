import React, { useState } from "react";
import { logoutUser } from "../../api/auth";
import { NavLink, useNavigate } from "react-router-dom";
import { refreshUserPermissions } from "../../api/auth";
// 🔥 ADDED
import { useAuth } from "../../context/AuthContext";

/* ================= PERMISSION MODAL ================= */
const NoPermissionModal = ({ onClose }) => (
  <div className="modal-overlay small-modal">
    <div className="modal-card">
      <h3>No Permission</h3>
      <p>You do not have permission to access this module.</p>
      <button className="btn btn-primary" onClick={onClose}>
        OK
      </button>
    </div>
  </div>
);

function Sidebar({ isMobileOpen, onClose, openSection, setOpenSection }) {
  const navigate = useNavigate();

  // 🔥 ADDED
  const { setLoginData, isClientAdmin } = useAuth();

  /* ================= PERMISSIONS ================= */
  const permissions = JSON.parse(localStorage.getItem("permissions") || "{}");

  const canView = (module) => {
    if (isClientAdmin) return true;
    const clean = module.trim().toLowerCase();
    return permissions?.[clean]?.view === true;
  };

  /* ================= NO PERMISSION MODAL ================= */
  const [showNoPermission, setShowNoPermission] = useState(false);
  const openNoPermission = () => setShowNoPermission(true);

  /* ================= USER DATA ================= */
  const userName = localStorage.getItem("userName") || "User";
  const userImage = localStorage.getItem("userImage");
  const companyName = localStorage.getItem("companyName") || "Company";
  const companyLogo = localStorage.getItem("companyLogo");
  const userRole = localStorage.getItem("user_role") ;

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  /* ================= HANDLERS ================= */
  const navHasSubmenu = (id) =>
    `nav-item nav-has-submenu ${openSection === id ? "open" : ""}`;

  const submenuHidden = (id) => String(openSection !== id);

  const handleSectionToggle = (sectionId) => {
    setOpenSection((prev) => (prev === sectionId ? null : sectionId));
  };

  /* ================= WRAPPER FOR LINKS ================= */
  // 🔥 FULLY UPDATED LINK CHECKER — WITHOUT REMOVING ANY OLD CODE
  const ProtectedLink = ({ required, to, children }) => {
    const cleanModule = required.trim().toLowerCase();

    const handleClick = async (e) => {
      e.preventDefault(); // stop default navigation

      // 🔥 Client Admin always bypasses
      if (isClientAdmin) {
        navigate(to);
        return;
      }

      // 🔥 LIVE refresh permissions before navigating
      const newPermissions = await refreshUserPermissions();

      if (newPermissions) {
        localStorage.setItem("permissions", JSON.stringify(newPermissions));
        setLoginData(); // update React state
      }

      const hasAccess = newPermissions?.[cleanModule]?.view === true;

      if (hasAccess) {
        navigate(to);
      } else {
        setShowNoPermission(true);
      }
    };

    return (
      <NavLink
        to={to}
        onClick={handleClick} // 🔥 ADDED
        className={({ isActive }) =>
          `submenu-link ${isActive ? "active-submenu" : ""}`
        }
      >
        {children}
      </NavLink>
    );
  };

  return (
    <aside
      className={`sidebar ${isMobileOpen ? "mobile-open mobile-visible" : ""}`}
      id="sidebar"
    >
      {/* COMPANY LOGO */}
      <div className="logo-container">
        <a className="logo">
          <div className="logo-icon">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                style={{ width: 36, height: 36, objectFit: "contain" }}
              />
            ) : (
              initials
            )}
          </div>
          <div className="logo-text">{companyName}</div>
        </a>
      </div>

      <ul className="nav-menu">

        {/* ================= DASHBOARD ================= */}
        <li className="nav-item">
          <a href="/admin" className="nav-link">
            <span className="nav-icon">
              <i className="fa-solid fa-chart-line" />
            </span>
            Dashboard
          </a>
        </li>

        {/* ================= EMPLOYEES ================= */}
        <li className={navHasSubmenu("employees")}>
          <button
            className="nav-toggle"
            aria-expanded={openSection === "employees"}
            onClick={() => handleSectionToggle("employees")}
          >
            <span className="nav-icon">
              <i className="fa-solid fa-users" />
            </span>
            <span className="nav-text">Employees</span>
            <span className="nav-caret">▸</span>
          </button>

          <ul className="submenu" aria-hidden={submenuHidden("employees")}>
            <li>
              <ProtectedLink required="employee" to="/admin/employee-master">
                Master Data
              </ProtectedLink>
            </li>

            <li>
              <ProtectedLink
                required="employee"
                to="/admin/employment-history"
              >
                History
              </ProtectedLink>
            </li>

            <li>
              <ProtectedLink
                required="employee"
                to="/admin/employee-documents"
              >
                Documents
              </ProtectedLink>
            </li>
          </ul>
        </li>

        {/* ================= ORGANIZATION ================= */}
        <li className={navHasSubmenu("organization")}>
          <button
            className="nav-toggle"
            aria-expanded={openSection === "organization"}
            onClick={() => handleSectionToggle("organization")}
          >
            <span className="nav-icon">
              <i className="fa-solid fa-building" />
            </span>
            <span className="nav-text">Organization</span>
            <span className="nav-caret">▸</span>
          </button>

          <ul className="submenu" aria-hidden={submenuHidden("organization")}>
            <li>
              <ProtectedLink required="department" to="/admin/departments">
                Departments
              </ProtectedLink>
            </li>

            <li>
              <ProtectedLink required="designation" to="/admin/designations">
                Designations
              </ProtectedLink>
            </li>

            <li>
              <ProtectedLink
                required="employment type"
                to="/admin/employment-type"
              >
                Employment Type
              </ProtectedLink>
            </li>

            <li>
              <ProtectedLink
                required="roles & permissions"
                to="/admin/roles-permissions"
              >
                Roles & Permissions
              </ProtectedLink>
            </li>

            <li>
              <ProtectedLink required="policies" to="/admin/policies">
                Policies
              </ProtectedLink>
            </li>

            <li>
              <ProtectedLink
                required="company rules"
                to="/admin/company-rules"
              >
                Company Rules
              </ProtectedLink>
            </li>
          </ul>
        </li>

        {/* ================= SUPPORT TICKETS ================= */}
        <li className={navHasSubmenu("tickets")}>
          <button
            className="nav-toggle"
            aria-expanded={openSection === "tickets"}
            onClick={() => handleSectionToggle("tickets")}
          >
            <span className="nav-icon">
              <i className="fa-solid fa-ticket" />
            </span>
            <span className="nav-text">Supporting Tickets</span>
            <span className="nav-caret">▸</span>
          </button>

          <ul className="submenu" aria-hidden={submenuHidden("tickets")}>
            <li>
              <ProtectedLink required="ticket type" to="/admin/ticket-types">
                Types
              </ProtectedLink>
            </li>

            <li>
              <ProtectedLink
                required="supporting tickets"
                to="/admin/compliance-documentation"
              >
                Compliance Documentation
              </ProtectedLink>
            </li>
          </ul>
        </li>

        {/* ================= RECRUITMENT ================= */}
        <li className={navHasSubmenu("recruitment")}>
          <button
            className="nav-toggle"
            aria-expanded={openSection === "recruitment"}
            onClick={() => handleSectionToggle("recruitment")}
          >
            <span className="nav-icon">
              <i className="fa-solid fa-user-tie" />
            </span>
            <span className="nav-text">Recruitment & ATS</span>
            <span className="nav-caret">▸</span>
          </button>

          <ul className="submenu" aria-hidden={submenuHidden("recruitment")}>
            <li><button className="submenu-link no-permission" onClick={openNoPermission}>Job Management</button></li>
            <li><button className="submenu-link no-permission" onClick={openNoPermission}>Candidate Management</button></li>
            <li><button className="submenu-link no-permission" onClick={openNoPermission}>Interview Management</button></li>
            <li><button className="submenu-link no-permission" onClick={openNoPermission}>Offer & Hiring</button></li>
            <li><button className="submenu-link no-permission" onClick={openNoPermission}>Onboarding</button></li>
            <li><button className="submenu-link no-permission" onClick={openNoPermission}>Offboarding</button></li>
          </ul>
        </li>

        {/* ================= ATTENDANCE ================= */}
        <li className={navHasSubmenu("attendance")}>
          <button
            className="nav-toggle"
            aria-expanded={openSection === "attendance"}
            onClick={() => handleSectionToggle("attendance")}
          >
            <span className="nav-icon">
              <i className="fa-solid fa-clock" />
            </span>
            <span className="nav-text">Attendance</span>
            <span className="nav-caret">▸</span>
          </button>
          <ul className="submenu" aria-hidden={submenuHidden("attendance")}>
            <li><button className="submenu-link">Attendance</button></li>
            <li><button className="submenu-link">Leave</button></li>
            <li><button className="submenu-link">Timesheets</button></li>
            <li><button className="submenu-link">Shift Management</button></li>
          </ul>
        </li>

        {/* ================= PAYROLL ================= */}
        <li className={navHasSubmenu("payroll")}>
          <button
            className="nav-toggle"
            aria-expanded={openSection === "payroll"}
            onClick={() => handleSectionToggle("payroll")}
          >
            <span className="nav-icon">
              <i className="fa-solid fa-money-check-dollar" />
            </span>
            <span className="nav-text">Payroll Management</span>
            <span className="nav-caret">▸</span>
          </button>
          <ul className="submenu" aria-hidden={submenuHidden("payroll")}>
            <li><button className="submenu-link">Payroll Setup</button></li>
            <li><button className="submenu-link">Payroll Processing</button></li>
            <li><button className="submenu-link">Payroll Output</button></li>
            <li><button className="submenu-link">Compliance</button></li>
          </ul>
        </li>

        {/* ================= PERFORMANCE ================= */}
        <li className={navHasSubmenu("performance")}>
          <button
            className="nav-toggle"
            aria-expanded={openSection === "performance"}
            onClick={() => handleSectionToggle("performance")}
          >
            <span className="nav-icon">
              <i className="fa-solid fa-chart-pie" />
            </span>
            <span className="nav-text">Performance & Appraisals</span>
            <span className="nav-caret">▸</span>
          </button>
          <ul className="submenu" aria-hidden={submenuHidden("performance")}>
            <li><button className="submenu-link">Goal & KPI Management</button></li>
            <li><button className="submenu-link">Assessment</button></li>
            <li><button className="submenu-link">Appraisal Cycles</button></li>
          </ul>
        </li>

        {/* ================= LEARNING ================= */}
        <li className={navHasSubmenu("learning")}>
          <button
            className="nav-toggle"
            aria-expanded={openSection === "learning"}
            onClick={() => handleSectionToggle("learning")}
          >
            <span className="nav-icon">
              <i className="fa-solid fa-graduation-cap" />
            </span>
            <span className="nav-text">Learning & Development</span>
            <span className="nav-caret">▸</span>
          </button>
          <ul className="submenu" aria-hidden={submenuHidden("learning")}>
            <li><button className="submenu-link">Training Management</button></li>
            <li><button className="submenu-link">e-Learning</button></li>
            <li><button className="submenu-link">Skill Development</button></li>
          </ul>
        </li>

        {/* ================= ENGAGEMENT ================= */}
        <li className={navHasSubmenu("engagement")}>
          <button
            className="nav-toggle"
            aria-expanded={openSection === "engagement"}
            onClick={() => handleSectionToggle("engagement")}
          >
            <span className="nav-icon">
              <i className="fa-solid fa-heart" />
            </span>
            <span className="nav-text">Employee Engagement</span>
            <span className="nav-caret">▸</span>
          </button>
          <ul className="submenu" aria-hidden={submenuHidden("engagement")}>
            <li><button className="submenu-link">Surveys & Feedback</button></li>
            <li><button className="submenu-link">Recognition</button></li>
            <li><button className="submenu-link">Communication</button></li>
          </ul>
        </li>

        {/* ================= TALENT ================= */}
        <li className={navHasSubmenu("talent")}>
          <button
            className="nav-toggle"
            aria-expanded={openSection === "talent"}
            onClick={() => handleSectionToggle("talent")}
          >
            <span className="nav-icon">
              <i className="fa-solid fa-sitemap" />
            </span>
            <span className="nav-text">Talent & Succession Planning</span>
            <span className="nav-caret">▸</span>
          </button>
          <ul className="submenu" aria-hidden={submenuHidden("talent")}>
            <li><button className="submenu-link">Competency Framework</button></li>
            <li><button className="submenu-link">Succession Planning</button></li>
          </ul>
        </li>

        {/* ================= BENEFITS ================= */}
        <li className={navHasSubmenu("benefits")}>
          <button
            className="nav-toggle"
            aria-expanded={openSection === "benefits"}
            onClick={() => handleSectionToggle("benefits")}
          >
            <span className="nav-icon">
              <i className="fa-solid fa-gift" />
            </span>
            <span className="nav-text">Benefits & Compensation</span>
            <span className="nav-caret">▸</span>
          </button>
          <ul className="submenu" aria-hidden={submenuHidden("benefits")}>
            <li><button className="submenu-link">Health & Insurance Plans</button></li>
            <li><button className="submenu-link">Allowance Policies</button></li>
            <li><button className="submenu-link">Bonus Planning</button></li>
            <li><button className="submenu-link">Increment Budgeting</button></li>
          </ul>
        </li>

        {/* ================= EXPENSE ================= */}
        <li className={navHasSubmenu("expense")}>
          <button
            className="nav-toggle"
            aria-expanded={openSection === "expense"}
            onClick={() => handleSectionToggle("expense")}
          >
            <span className="nav-icon">
              <i className="fa-solid fa-file-invoice-dollar" />
            </span>
            <span className="nav-text">Expense</span>
            <span className="nav-caret">▸</span>
          </button>
          <ul className="submenu" aria-hidden={submenuHidden("expense")}>
            <li><button className="submenu-link">Expense Category</button></li>
            <li><button className="submenu-link">Expenses</button></li>
            <li><button className="submenu-link">Expense Claims</button></li>
          </ul>
        </li>

        {/* ================= ASSET ================= */}
        <li className={navHasSubmenu("asset")}>
          <button
            className="nav-toggle"
            aria-expanded={openSection === "asset"}
            onClick={() => handleSectionToggle("asset")}
          >
            <span className="nav-icon">
              <i className="fa-solid fa-boxes-stacked" />
            </span>
            <span className="nav-text">Asset Management</span>
            <span className="nav-caret">▸</span>
          </button>
          <ul className="submenu" aria-hidden={submenuHidden("asset")}>
            <li><button className="submenu-link">Fixed Assets</button></li>
            <li><button className="submenu-link">Depreciation</button></li>
          </ul>
        </li>

        {/* ================= REPORTING ================= */}
        <li className={navHasSubmenu("reporting")}>
          <button
            className="nav-toggle"
            aria-expanded={openSection === "reporting"}
            onClick={() => handleSectionToggle("reporting")}
          >
            <span className="nav-icon">
              <i className="fa-solid fa-chart-bar" />
            </span>
            <span className="nav-text">Reporting & Analytics</span>
            <span className="nav-caret">▸</span>
          </button>
          <ul className="submenu" aria-hidden={submenuHidden("reporting")}>
            <li><button className="submenu-link">Attendance Reports</button></li>
            <li><button className="submenu-link">Leave Trends</button></li>
            <li><button className="submenu-link">Payroll Summary</button></li>
            <li><button className="submenu-link">Employee Analytics</button></li>
            <li><button className="submenu-link">Custom Reports</button></li>
          </ul>
        </li>

        {/* ================= CUSTOMER ================= */}
        <li className="nav-item">
          <a className="nav-link">
            <span className="nav-icon">
              <i className="fa-solid fa-users-gear" />
            </span>
            Customer Management
          </a>
        </li>

        {/* ================= LOAN ================= */}
        <li className={navHasSubmenu("loan")}>
          <button
            className="nav-toggle"
            aria-expanded={openSection === "loan"}
            onClick={() => handleSectionToggle("loan")}
          >
            <span className="nav-icon">
              <i className="fa-solid fa-hand-holding-dollar" />
            </span>
            <span className="nav-text">Loan / EMI / Advance Module</span>
            <span className="nav-caret">▸</span>
          </button>
          <ul className="submenu" aria-hidden={submenuHidden("loan")}>
            <li><button className="submenu-link">Employee Loan Request</button></li>
            <li><button className="submenu-link">EMI Calculation</button></li>
            <li><button className="submenu-link">EMI Auto Deduction</button></li>
            <li><button className="submenu-link">Loan Balance Status</button></li>
          </ul>
        </li>

        {/* ================= SETTINGS ================= */}
        <li className="nav-item">
          <a className="nav-link">
            <span className="nav-icon">
              <i className="fa-solid fa-gear" />
            </span>
            Settings
          </a>
        </li>

        {/* ================= LOGOUT ================= */}
        <button
          className="nav-link logout-btn-mob"
          type="button"
          onClick={async () => {
            try {
              await logoutUser();
            } finally {
              onClose();
              window.location.href = "/";
            }
          }}
        >
          <span className="nav-icon">
            <i className="fa-solid fa-right-from-bracket" />
          </span>
          Logout
        </button>
      </ul>

      {/* ================= USER PROFILE ================= */}
      <div
        className="user-profile"
        onClick={() => navigate("/admin/my-profile")}
        style={{ cursor: "pointer" }}
      >
        <div className="user-avatar">
          {userImage ? (
            <img
              src={userImage}
              alt={userName}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            initials
          )}
        </div>

        <div className="user-info">
          <h4>{userName}</h4>
          <p>{isClientAdmin ? "Client Admin" : userRole}</p>

        </div>
      </div>

      {showNoPermission && (
        <NoPermissionModal onClose={() => setShowNoPermission(false)} />
      )}
    </aside>
  );
}

export default Sidebar;
