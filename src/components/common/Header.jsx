// Header.jsx
import React from "react";
import { logoutUser } from "../../api/auth";

function Header({ onMenuClick }) {
  /* ================= USER NAME ================= */
  const userName = localStorage.getItem("userName") || " ";

  /* ================= DATE ================= */
  const today = new Date();

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(today);

  return (
    <>
      <div className="header">
        <button className="menu-btn" onClick={onMenuClick}>
          <i className="fa-solid fa-bars" />
        </button>

        <div className="page-title">
          <h1>Welcome {userName}</h1>
        </div>

        <div className="header-actions">
          <button className="notification-btn" title="Notifications">
            🔔
            <span className="notification-badge">2</span>
          </button>

          <div className="current-date">{formattedDate}</div>

          <button
            className="logout-btn"
            onClick={async () => {
              await logoutUser();
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="the_line" />
    </>
  );
}

export default Header;
