// src/components/Header.jsx
import React from "react";

import { logoutUser } from "../../api/auth"; // ✅ FIXED PATH



const Header = ({
  sidebarOpen,
  onToggleSidebar,
  title = "Employee Dashboard",
  subtitle = "Welcome back, John — here's a simple overview of your key metrics.",
  notificationCount = 3,
}) => {
  // ================= Today's Date =================
  const todayDate = new Date().toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="header" aria-label="Page header">
      {/* Mobile menu button */}
      <button
        className="menu-btn"
        id="menuBtn"
        aria-label="Toggle menu"
        aria-expanded={sidebarOpen}
        onClick={onToggleSidebar}
        type="button"
      >
        <i className={`fa-solid ${sidebarOpen ? "fa-times" : "fa-bars"}`} />
      </button>

      {/* Page title + subtitle */}
      <div className="page-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {/* Notifications + date */}
      <div className="header-actions">
        <button
          className="notification-btn"
          aria-label={`You have ${notificationCount} notifications`}
          type="button"
        >
          <i className="fa-regular fa-bell" aria-hidden="true" />
          {notificationCount > 0 && (
            <div className="notification-badge" aria-hidden="true">
              {notificationCount}
            </div>
          )}
        </button>

        {/* ✅ Today's Date */}
        <div className="current-date" aria-hidden="true">
          {todayDate}
        </div>
          <button
  className="logout-btn"
  onClick={async () => {
    await logoutUser();
    window.location.href = "/";
  }}
>
  Logout
</button>


      </div>
    </header>
  );
};

export default Header;
