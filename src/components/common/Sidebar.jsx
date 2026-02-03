import React, { useState } from "react";
import { logoutUser } from "../../api/auth";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { refreshUserPermissions } from "../../api/auth";
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
  const location = useLocation();

  const { setLoginData, isClientAdmin } = useAuth();
  const permissions = JSON.parse(localStorage.getItem("permissions") || "{}");

  const canView = (module) => {
    if (isClientAdmin) return true;
    return permissions?.[module.trim().toLowerCase()]?.view === true;
  };

  const [showNoPermission, setShowNoPermission] = useState(false);

  /* ================= USER DATA ================= */
  const userName = localStorage.getItem("userName") || "User";
  const userImage = localStorage.getItem("userImage");
  const companyName = localStorage.getItem("companyName") || "Company";
  const companyLogo = localStorage.getItem("companyLogo");
  const userRole = localStorage.getItem("user_role");

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  /* ================= HELPERS ================= */
  const isActive = (path) => location.pathname === path;

  const handleLinkClick = () => {
    if (isMobileOpen) onClose();
  };

  const navHasSubmenu = (id) =>
    `nav-item nav-has-submenu ${openSection === id ? "open" : ""}`;

  const submenuHidden = (id) => String(openSection !== id);

  const handleSectionToggle = (sectionId) => {
    setOpenSection((prev) => (prev === sectionId ? null : sectionId));
  };

  /* ================= PROTECTED LINK ================= */
  const ProtectedLink = ({ required, to, children }) => {
    const cleanModule = required.trim().toLowerCase();

    const handleClick = async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (isClientAdmin) {
        navigate(to);
        handleLinkClick();
        return;
      }

      const newPermissions = await refreshUserPermissions();

      if (newPermissions) {
        localStorage.setItem("permissions", JSON.stringify(newPermissions));
        setLoginData();
      }

      const hasAccess = newPermissions?.[cleanModule]?.view === true;

      if (hasAccess) {
        navigate(to);
        handleLinkClick();
      } else {
        setShowNoPermission(true);
      }
    };

    return (
      <a
        href={to}
        className={`submenu-link ${location.pathname === to ? "active" : ""}`}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  };

  /* ================= FILTER MODULES ================= */
  const filterAllowed = (items) => {
    if (isClientAdmin) return items;
    return items.filter((item) => canView(item.permission));
  };

  const recruitmentModules = filterAllowed([
    {
      permission: "vacancy listing",
      label: "Vacancy Listing",
      to: "/admin/recruitment/vacancies",
    },
    {
      permission: "view applications",
      label: "View Applications",
      to: "/admin/recruitment/applications",
    },
  ]);

  const employeeModules = filterAllowed([
    {
      permission: "employee",
      label: "Master Data",
      to: "/admin/employee-master",
    },
    {
      permission: "employee",
      label: "History",
      to: "/admin/employment-history",
    },
    {
      permission: "employee",
      label: "Documents",
      to: "/admin/employee-documents",
    },
  ]);

  const attendanceModules = filterAllowed([
    {
      permission: "attendance register",
      label: "Attendance Register",
      to: "/admin/attendance/register",
    },
    {
      permission: "shifts",
      label: "Shifts",
      to: "/admin/attendance/shifts",
    },
  ]);

  const payrollModules = filterAllowed([
    {
      permission: "Records",
      label: "Records",
      to: "/admin/payroll/records",
    },
    {
      permission: "payslips",
      label: "Payslips",
      to: "/admin/payroll/payslips",
    },
    {
      permission: "tax & compliance",
      label: "Tax & Compliance",
      to: "/admin/payroll/tax-compliance",
    },
    {
      permission: "pf & esi",
      label: "PF / ESI",
      to: "/admin/payroll/pf-esi",
    },
    {
      permission: "bonuses",
      label: "Bonuses & Incentives",
      to: "/admin/payroll/bonuses",
    },

    {
      permission: "full & final",
      label: "Full & Final Settlement",
      to: "/admin/payroll/full-final",
    },
  ]);

  const reminderModules = filterAllowed([
 
    {
      permission: "employee document expiry",
      label: "Employee Document Expiry",
      to: "/admin/reminders/employee-expiry",
    },
   
    {
      permission: "company document expiry",
      label: "Company Document Expiry",
      to: "/admin/reminders/company-expiry",
    },

  
  ]);

  const clientModules = filterAllowed([
    {
      permission: "clients",
      label: "Clients",
      to: "/admin/clients",
    },
    {
      permission: "client work",
      label: "Work / Services",
      to: "/admin/clients/work",
    },
    {
      permission: "client finance",
      label: "Finance",
      to: "/admin/clients/finance",
    },
    {
      permission: "client follow up",
      label: "Follow-Ups",
      to: "/admin/clients/follow-ups",
    },
  ]);

  const organizationModules = filterAllowed([
    {
      permission: "department",
      label: "Departments",
      to: "/admin/departments",
    },
    {
      permission: "designation",
      label: "Designations",
      to: "/admin/designations",
    },
    {
      permission: "employment type",
      label: "Employment Type",
      to: "/admin/employment-type",
    },
    {
      permission: "roles & permissions",
      label: "Roles & Permissions",
      to: "/admin/roles-permissions",
    },
    { permission: "policies", label: "Policies", to: "/admin/policies" },
    {
      permission: "company rules",
      label: "Company Rules",
      to: "/admin/company-rules",
    },
        {
      permission: "company documents",
      label: "Company Documents",
      to: "/admin/company-documents",
    },
  ]);

  const ticketModules = filterAllowed([
    { permission: "ticket type", label: "Types", to: "/admin/ticket-types" },
    {
      permission: "supporting tickets",
      label: "Compliance Documentation",
      to: "/admin/compliance-documentation",
    },
  ]);

  return (
    <aside
      className={`sidebar ${isMobileOpen ? "mobile-open mobile-visible" : ""}`}
      id="sidebar"
    >
      {/* ================= LOGO ================= */}
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
          {isClientAdmin ? (
            <a href="/admin/dashboard" className="nav-link">
              <span className="nav-icon">
                <i className="fa-solid fa-chart-line" />
              </span>
              Dashboard
            </a>
          ) : (
            <Link
              to="/user/dashboard"
              className={`nav-link ${isActive("/user/dashboard") ? "active" : ""}`}
              onClick={handleLinkClick}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-chart-line" />
              </span>
              Dashboard
            </Link>
          )}
        </li>

        {/* ================= ORGANIZATION ================= */}
        {organizationModules.length > 0 && (
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
              {organizationModules.map((item, index) => (
                <li key={index}>
                  <ProtectedLink required={item.permission} to={item.to}>
                    {item.label}
                  </ProtectedLink>
                </li>
              ))}
            </ul>
          </li>
        )}

        {/* ================= Recruitment ================= */}
        {recruitmentModules.length > 0 && (
          <li className={navHasSubmenu("recruitment")}>
            <button
              className="nav-toggle"
              aria-expanded={openSection === "recruitment"}
              onClick={() => handleSectionToggle("recruitment")}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-user-tie" />
              </span>
              <span className="nav-text">Recruitment</span>
              <span className="nav-caret">▸</span>
            </button>

            <ul className="submenu" aria-hidden={submenuHidden("recruitment")}>
              {recruitmentModules.map((item, index) => (
                <li key={index}>
                  <ProtectedLink required={item.permission} to={item.to}>
                    {item.label}
                  </ProtectedLink>
                </li>
              ))}
            </ul>
          </li>
        )}
        {/* ================= EMPLOYEES ================= */}
        {employeeModules.length > 0 && (
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
              {employeeModules.map((item, index) => (
                <li key={index}>
                  <ProtectedLink required={item.permission} to={item.to}>
                    {item.label}
                  </ProtectedLink>
                </li>
              ))}
            </ul>
          </li>
        )}
        {/* ================= Attendance ================= */}
        {attendanceModules.length > 0 && (
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
              {attendanceModules.map((item, index) => (
                <li key={index}>
                  <ProtectedLink required={item.permission} to={item.to}>
                    {item.label}
                  </ProtectedLink>
                </li>
              ))}
            </ul>
          </li>
        )}
        {/* ================= Payroll ================= */}
        {payrollModules.length > 0 && (
          <li className={navHasSubmenu("payroll")}>
            <button
              className="nav-toggle"
              aria-expanded={openSection === "payroll"}
              onClick={() => handleSectionToggle("payroll")}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-money-bill-wave" />
              </span>
              <span className="nav-text">Payroll</span>
              <span className="nav-caret">▸</span>
            </button>

            <ul className="submenu" aria-hidden={submenuHidden("payroll")}>
              {payrollModules.map((item, index) => (
                <li key={index}>
                  <ProtectedLink required={item.permission} to={item.to}>
                    {item.label}
                  </ProtectedLink>
                </li>
              ))}
            </ul>
          </li>
        )}
        {/* ================= Reminders ================= */}
        {reminderModules.length > 0 && (
          <li className={navHasSubmenu("reminders")}>
            <button
              className="nav-toggle"
              aria-expanded={openSection === "reminders"}
              onClick={() => handleSectionToggle("reminders")}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-bell" />
              </span>
              <span className="nav-text">Reminders</span>
              <span className="nav-caret">▸</span>
            </button>

            <ul className="submenu" aria-hidden={submenuHidden("reminders")}>
              {reminderModules.map((item, index) => (
                <li key={index}>
                  <ProtectedLink required={item.permission} to={item.to}>
                    {item.label}
                  </ProtectedLink>
                </li>
              ))}
            </ul>
          </li>
        )}
        {/* ================= Client Management ================= */}
        {clientModules.length > 0 && (
          <li className={navHasSubmenu("clients")}>
            <button
              className="nav-toggle"
              aria-expanded={openSection === "clients"}
              onClick={() => handleSectionToggle("clients")}
            >
              <span className="nav-icon">
               <i className="fa-solid fa-handshake" />

              </span>
              <span className="nav-text">Clients</span>
              <span className="nav-caret">▸</span>
            </button>

            <ul className="submenu" aria-hidden={submenuHidden("clients")}>
              {clientModules.map((item, index) => (
                <li key={index}>
                  <ProtectedLink required={item.permission} to={item.to}>
                    {item.label}
                  </ProtectedLink>
                </li>
              ))}
            </ul>
          </li>
        )}

        {/* ================= SUPPORT ================= */}
        {ticketModules.length > 0 && (
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
              {ticketModules.map((item, index) => (
                <li key={index}>
                  <ProtectedLink required={item.permission} to={item.to}>
                    {item.label}
                  </ProtectedLink>
                </li>
              ))}
            </ul>
          </li>
        )}

        {/* ================= MY PROFILE (Always visible) ================= */}
        {/* ================= MY PROFILE (Hide for Client Admin) ================= */}
        {!isClientAdmin && (
          <li className={navHasSubmenu("profile")}>
            <button
              className="nav-toggle"
              aria-expanded={openSection === "profile"}
              onClick={() => handleSectionToggle("profile")}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-user" />
              </span>
              <span className="nav-text">My Profile</span>
              <span className="nav-caret">▸</span>
            </button>

            <ul className="submenu" aria-hidden={submenuHidden("profile")}>
              <li>
                <Link
                  to="/user/myprofile"
                  className={`submenu-link ${
                    isActive("/user/myprofile") ? "active" : ""
                  }`}
                  onClick={handleLinkClick}
                >
                  Personal Details
                </Link>
              </li>

              <li>
                <Link
                  to="/profile/documents"
                  className={`submenu-link ${
                    isActive("/profile/documents") ? "active" : ""
                  }`}
                  onClick={handleLinkClick}
                >
                  My Documents
                </Link>
              </li>

              <li>
                <Link
                  to="/profile/history"
                  className={`submenu-link ${
                    isActive("/profile/history") ? "active" : ""
                  }`}
                  onClick={handleLinkClick}
                >
                  My History
                </Link>
              </li>

              <li>
                <Link
                  to="/profile/reset-password"
                  className={`submenu-link ${
                    isActive("/profile/reset-password") ? "active" : ""
                  }`}
                  onClick={handleLinkClick}
                >
                  Reset Password
                </Link>
              </li>
            </ul>
          </li>
        )}

        {/* ================= USER HELP & SUPPORT ================= */}
        {!isClientAdmin && (
          <li className="nav-item">
            <Link
              to="/user/support"
              className={`nav-link ${isActive("/user/support") ? "active" : ""}`}
              onClick={handleLinkClick}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-circle-question" />
              </span>
              Help & Support
            </Link>
          </li>
        )}

        {isClientAdmin && (
          <li className={navHasSubmenu("support")}>
            <button
              className="nav-toggle"
              aria-expanded={openSection === "support"}
              onClick={() => handleSectionToggle("support")}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-circle-question" />
              </span>
              <span className="nav-text">Help & Support</span>
              <span className="nav-caret">▸</span>
            </button>

            <ul className="submenu" aria-hidden={submenuHidden("support")}>
              <li>
                <Link
                  to="/admin/add-support-ticket"
                  className={`submenu-link ${
                    isActive("/admin/add-support-ticket") ? "active" : ""
                  }`}
                  onClick={handleLinkClick}
                >
                  Create Support Ticket
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/list-support-ticket"
                  className={`submenu-link ${
                    isActive("/admin/list-support-ticket") ? "active" : ""
                  }`}
                  onClick={handleLinkClick}
                >
                  My Support Tickets
                </Link>
              </li>
            </ul>
          </li>
        )}

        {/* ================= LOGOUT ================= */}
        <button
          className="nav-link logout-btn-mob"
          type="button"
          onClick={async () => {
            try {
              await logoutUser();
            } finally {
              onClose();
              window.location.href = "/login";
            }
          }}
        >
          <span className="nav-icon">
            <i className="fa-solid fa-right-from-bracket" />
          </span>
          Logout
        </button>
      </ul>

      {/* ================= BOTTOM PROFILE ================= */}
      <div
        className="user-profile"
        onClick={() =>
          navigate(isClientAdmin ? "/admin/my-profile" : "/user/myprofile")
        }
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
