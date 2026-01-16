import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getMyProfile } from "../../api/user/myprofile";
import { logoutUser } from "../../api/auth";

const Sidebar = ({ sidebarOpen, onToggleSidebar, onNavClick }) => {
  const [openSection, setOpenSection] = useState(null);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // User state
  const [user, setUser] = useState({
    name: "",
    designation: "",
    employeeId: "",
    company: "",
    initials: "U",
    avatar: "",
  });

  // Company state
  const [company, setCompany] = useState({
    name: "",
    logo: "",
  });

  // ================= Fetch Profile & Company Data =================
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getMyProfile();
        if (!res?.success) return;

        const emp = res.employee;

        // Get initials from user name
        const initials = emp?.name
          ? emp.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
          : "U";

        // Set user data
        setUser({
          name: emp.name || "",
          employeeId: emp.employee_id || "",
          designation: emp.designation || "",
          company: emp.company || "",
          initials,
          avatar: emp.image || "",
        });

        // Set company data from response or localStorage
        setCompany({
          name: emp.company_name || localStorage.getItem("companyName") || "",
          logo: emp.company_logo || localStorage.getItem("companyLogo") || "",
        });

        // Sync with localStorage (optional, for other components)
        if (emp.company_name) {
          localStorage.setItem("companyName", emp.company_name);
        }
        if (emp.company_logo) {
          localStorage.setItem("companyLogo", emp.company_logo);
        }
      } catch (err) {
        console.error("Sidebar profile load error:", err.message);
        // Fallback to localStorage if API fails
        setCompany({
          name: localStorage.getItem("companyName") || "",
          logo: localStorage.getItem("companyLogo") || "",
        });
      }
    };

    loadProfile();
  }, []);

  // ================= Sidebar Logic =================
  const handleSectionToggle = (sectionId) => {
    setOpenSection((prev) => (prev === sectionId ? null : sectionId));
  };

  const navHasSubmenu = (id) =>
    `nav-item nav-has-submenu ${openSection === id ? "open" : ""}`;

  const submenuHidden = (id) => String(openSection !== id);

  // Responsive sidebar handling
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 992;
      setIsMobile(mobile);

      if (!mobile && sidebarOpen && onToggleSidebar) {
        onToggleSidebar();
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen, onToggleSidebar]);

  const handleLinkClick = () => {
    if (onNavClick) onNavClick();
  };

  const isActive = (path) => location.pathname === path;

  // Render logo based on available data
  const renderLogo = () => {
    // Priority 1: Company logo
    if (company.logo) {
      return (
        <img
          src={company.logo}
          alt={company.name || "Company Logo"}
          className="logo-image"
        />
      );
    }

    // Priority 2: Company initial
    if (company.name) {
      return (
        <div className="company-initial">
          {company.name.charAt(0).toUpperCase()}
        </div>
      );
    }

    // Priority 3: User avatar
    if (user.avatar) {
      return <img src={user.avatar} alt="User" className="avatar-img" />;
    }

    // Fallback: User initial
    return <div className="company-initial">{user.initials}</div>;
  };

  return (
    <aside
      className={`sidebar ${sidebarOpen && isMobile ? "mobile-open" : ""}`}
      id="sidebar"
      aria-label="Main navigation"
    >
      {/* ================= LOGO ================= */}
      <div className="logo-container">
        <Link to="/user/dashboard" className="logo" onClick={handleLinkClick}>
          <div className="logo-icon">{renderLogo()}</div>
          <div className="logo-text">
            {company.name || user.company || "Company"}
          </div>
        </Link>
      </div>

      {/* ================= NAVIGATION MENU ================= */}
      <nav>
        <ul className="nav-menu">
          {/* Dashboard */}
          <li className="nav-item">
            <Link
              to="/user/dashboard"
              className={`nav-link ${
                isActive("/user/dashboard") ? "active" : ""
              }`}
              onClick={handleLinkClick}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-chart-line" />
              </span>
              Dashboard
            </Link>
          </li>

          {/* My Profile Section */}
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

          {/* Roles & Permissions */}
          <li className="nav-item">
            <Link
              to="/user/roles-permissions"
              className={`nav-link ${
                isActive("/user/roles-permissions") ? "active" : ""
              }`}
              onClick={handleLinkClick}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-user-shield" />
              </span>
              Roles & Permissions
            </Link>
          </li>

          {/* Attendance Section */}
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
              <li>
                <Link
                  to="/attendance/mark"
                  className="submenu-link"
                  onClick={handleLinkClick}
                >
                  Mark Attendance
                </Link>
              </li>
              <li>
                <Link
                  to="/attendance/history"
                  className="submenu-link"
                  onClick={handleLinkClick}
                >
                  Attendance History
                </Link>
              </li>
              <li>
                <Link
                  to="/attendance/monthly-report"
                  className="submenu-link"
                  onClick={handleLinkClick}
                >
                  Monthly Report
                </Link>
              </li>
              <li>
                <Link
                  to="/attendance/late-absent"
                  className="submenu-link"
                  onClick={handleLinkClick}
                >
                  Late / Absent
                </Link>
              </li>
            </ul>
          </li>

          {/* Leave Section */}
          <li className={navHasSubmenu("leave")}>
            <button
              className="nav-toggle"
              aria-expanded={openSection === "leave"}
              onClick={() => handleSectionToggle("leave")}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-calendar-days" />
              </span>
              <span className="nav-text">Leave</span>
              <span className="nav-caret">▸</span>
            </button>
            <ul className="submenu" aria-hidden={submenuHidden("leave")}>
              <li>
                <Link
                  to="/leave/apply"
                  className="submenu-link"
                  onClick={handleLinkClick}
                >
                  Apply Leave
                </Link>
              </li>
              <li>
                <Link
                  to="/leave/history"
                  className="submenu-link"
                  onClick={handleLinkClick}
                >
                  Leave History
                </Link>
              </li>
              <li>
                <Link
                  to="/leave/balance"
                  className="submenu-link"
                  onClick={handleLinkClick}
                >
                  Leave Balance
                </Link>
              </li>
            </ul>
          </li>

          {/* Payroll */}
          <li className="nav-item">
            <Link
              to="/payroll"
              className={`nav-link ${isActive("/payroll") ? "active" : ""}`}
              onClick={handleLinkClick}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-money-check-dollar" />
              </span>
              Payroll
            </Link>
          </li>
          {/* ================= SUPER ADMIN SUPPORT (TEST) ================= */}
          <li className={navHasSubmenu("superadminsupport")}>
            <button
              className="nav-toggle"
              aria-expanded={openSection === "superadminsupport"}
              onClick={() => handleSectionToggle("superadminsupport")}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-toolbox" />
              </span>
              <span className="nav-text">Super Admin Support</span>
              <span className="nav-caret">▸</span>
            </button>

            <ul
              className="submenu"
              aria-hidden={submenuHidden("superadminsupport")}
            >
              <li>
                <Link
                  to="/user/superadmin/support"
                  className={`submenu-link ${
                    isActive("/user/superadmin/support") ? "active" : ""
                  }`}
                  onClick={handleLinkClick}
                >
                  Ticket List
                </Link>
              </li>

              <li>
                <Link
                  to="/user/superadmin/support/add"
                  className={`submenu-link ${
                    isActive("/user/superadmin/support/add") ? "active" : ""
                  }`}
                  onClick={handleLinkClick}
                >
                  Add Ticket
                </Link>
              </li>
            </ul>
          </li>

          {/* Tasks */}
          <li className="nav-item">
            <Link
              to="/tasks"
              className={`nav-link ${isActive("/tasks") ? "active" : ""}`}
              onClick={handleLinkClick}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-list-check" />
              </span>
              Tasks
            </Link>
          </li>

          {/* Notifications */}
          <li className="nav-item">
            <Link
              to="/notifications"
              className={`nav-link ${
                isActive("/notifications") ? "active" : ""
              }`}
              onClick={handleLinkClick}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-bell" />
              </span>
              Notifications
            </Link>
          </li>

          {/* Help & Support */}
          <li className="nav-item">
            <Link
              to="/user/support"
              className={`nav-link ${
                isActive("/user/support") ? "active" : ""
              }`}
              onClick={handleLinkClick}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-circle-question" />
              </span>
              Help & Support
            </Link>
          </li>

          {/* Logout Button */}
          <li className="nav-item">
            <button
              className="nav-link logout-btn-mob"
              type="button"
              onClick={async () => {
                try {
                  await logoutUser();
                } catch (error) {
                  console.error("Logout error:", error);
                } finally {
                  // Clear localStorage
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("userId");
                  localStorage.removeItem("companyName");
                  localStorage.removeItem("companyLogo");
                  localStorage.removeItem("companyId");
                  localStorage.removeItem("userName");

                  // Close sidebar if open
                  if (onToggleSidebar) onToggleSidebar();

                  // Redirect to login
                  window.location.href = "/";
                }
              }}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-right-from-bracket" />
              </span>
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* ================= USER PROFILE SECTION ================= */}
      <div className="user-profile">
        <div className="user-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt="User" className="avatar-img" />
          ) : (
            <div className="avatar-initials">{user.initials}</div>
          )}
        </div>
        <div className="user-info">
          <h4>{user.name || "Loading..."}</h4>
          <p>{user.designation || "Employee"}</p>
          {user.employeeId && (
            <small className="employee-id">ID: {user.employeeId}</small>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
