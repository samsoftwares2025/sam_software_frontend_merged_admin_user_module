// src/pages/admin/DashboardPage.jsx
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";
import Chart from "chart.js/auto"; // make sure `chart.js` is installed

function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("dashboard"); // or whatever key you use

  const miniDonutRef = useRef(null);
  const headCountRef = useRef(null);
  const ctcRef = useRef(null);

  const miniDonutChartRef = useRef(null);
  const headCountChartRef = useRef(null);
  const ctcChartRef = useRef(null);

  const handleMenuClick = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleOverlayClick = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const colors = {
      blueDark: "#2d78b5",
      blueLight: "#8fc3e8",
      accent1: "#58a3d7",
      accent2: "#3b83b7",
      muted: "#e9eef5",
    };

    // Clean up any previous charts before creating new ones
    if (miniDonutChartRef.current) {
      miniDonutChartRef.current.destroy();
    }
    if (headCountChartRef.current) {
      headCountChartRef.current.destroy();
    }
    if (ctcChartRef.current) {
      ctcChartRef.current.destroy();
    }

    // Mini Donut
    if (miniDonutRef.current) {
      miniDonutChartRef.current = new Chart(miniDonutRef.current, {
        type: "doughnut",
        data: {
          labels: ["Engineering", "Marketing", "HR"],
          datasets: [
            {
              data: [120, 65, 60],
              backgroundColor: [colors.blueDark, colors.blueLight, "#dfe9f3"],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: "70%",
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
        },
      });
    }

    // Employee Head Count
    if (headCountRef.current) {
      headCountChartRef.current = new Chart(headCountRef.current, {
        type: "bar",
        data: {
          labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
          datasets: [
            {
              label: "Active",
              data: [550, 152, 155, 158, 160, 162],
              backgroundColor: colors.blueDark,
              borderRadius: 6,
            },
            {
              label: "Inactive",
              data: [12, 10, 9, 8, 7, 5],
              backgroundColor: "#B0BEC5",
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "rgba(0,0,0,0.05)" },
            },
            x: { grid: { display: false } },
          },
          plugins: {
            legend: { display: true, position: "bottom" },
          },
        },
      });
    }

    // CTC Payout
    if (ctcRef.current) {
      ctcChartRef.current = new Chart(ctcRef.current, {
        type: "bar",
        data: {
          labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
          datasets: [
            {
              type: "bar",
              label: "CTC",
              data: [70, 75, 72, 78, 76, 80],
              backgroundColor: "#D3D3D3",
              borderRadius: 6,
            },
            {
              type: "line",
              label: "Net Salary",
              data: [60, 62, 58, 63, 61, 65],
              borderColor: "#FFCA28",
              borderWidth: 3,
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: "#FFCA28",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "rgba(0,0,0,0.05)" },
            },
            x: { grid: { display: false } },
          },
          plugins: {
            legend: { display: true, position: "bottom" },
          },
        },
      });
    }

    // Cleanup on unmount
    return () => {
      if (miniDonutChartRef.current) miniDonutChartRef.current.destroy();
      if (headCountChartRef.current) headCountChartRef.current.destroy();
      if (ctcChartRef.current) ctcChartRef.current.destroy();
    };
  }, []);

  return (
    <div className="container">
      {/* Shared Sidebar */}
      <Sidebar
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        openSection={openSection}
        setOpenSection={setOpenSection}
      />

      <main className="main">
        {/* Shared Header */}
        <Header onMenuClick={handleMenuClick} />

        {/* DASHBOARD CONTENT STARTS HERE */}

        {/* Top row: 3 cards */}
        <div className="top-grid">
          {/* Card 1: Total Employees */}
          <div className="card">
            <div className="card-amount-row">
              <div>
                <div className="small">Total Employees</div>
                <div className="big">245</div>
                <div className="sub">Company-wide headcount</div>
              </div>
              <div className="mini-wrap">
                <canvas ref={miniDonutRef} width="100" height="100" />
              </div>
            </div>
            <div className="card-legend">
              <div className="legend-title">DEPARTMENTS</div>
              <div className="legend-items">
                • Engineering — 120
                <br />
                • Marketing — 65
                <br />
                • HR — 40
                <br />
                • Sales — 20
              </div>
            </div>
          </div>

          {/* Card 2: Employee Head Count */}
          <div className="card">
            <h3>Employee Head Count</h3>
            <div className="chart-wrap">
              <canvas ref={headCountRef} />
            </div>
          </div>

          {/* Card 3: CTC Payout */}
          <div className="card">
            <h3>CTC Payout (Last 6 months)</h3>
            <div className="chart-wrap">
              <canvas ref={ctcRef} />
            </div>
          </div>
        </div>

        {/* Quick Buttons */}
        <section className="quick-row">
          <div className="quick green">
            <span className="notification-badge">5</span>
            Pending Requests
          </div>
          <div className="quick red">Compliance Checks</div>
          <div className="quick yellow">
            <span className="notification-badge">3</span>
            Today&apos;s Events
          </div>
          <div className="quick blue">
            <span className="notification-badge">3</span>
            Leave Requests
          </div>
        </section>

        {/* Bottom row: Projects */}
        <div className="bottom-grid">
          <div className="card">
            <div className="card-heading">
              <div className="stats-title">Company Projects Overview</div>
            </div>

            <div className="projects-grid">
              {/* Project 1 */}
              <div className="project-card">
                <div className="project-header">
                  <div style={{ flex: 1 }}>
                    <h4 className="project-title">HR Portal Redesign</h4>
                    <p className="project-description">
                      Modernizing the employee portal with improved UX and mobile
                      responsiveness
                    </p>
                  </div>
                  <span className="project-status status-active">Active</span>
                </div>
                <div className="project-meta">
                  <span className="project-meta-item">👥 8 Members</span>
                  <span className="project-meta-item">📅 Due: Dec 15, 2025</span>
                  <span className="project-meta-item">💼 HR Department</span>
                </div>
                <div className="project-progress">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span className="progress-percentage">75%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: "75%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Project 2 */}
              <div className="project-card">
                <div className="project-header">
                  <div style={{ flex: 1 }}>
                    <h4 className="project-title">Payroll System Upgrade</h4>
                    <p className="project-description">
                      Integration of new payroll automation features and
                      compliance updates
                    </p>
                  </div>
                  <span className="project-status status-pending">Pending</span>
                </div>
                <div className="project-meta">
                  <span className="project-meta-item">👥 5 Members</span>
                  <span className="project-meta-item">📅 Due: Jan 30, 2026</span>
                  <span className="project-meta-item">💼 Finance</span>
                </div>
                <div className="project-progress">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span className="progress-percentage">45%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: "45%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Project 3 */}
              <div className="project-card">
                <div className="project-header">
                  <div style={{ flex: 1 }}>
                    <h4 className="project-title">Employee Training Program</h4>
                    <p className="project-description">
                      Comprehensive onboarding and skill development initiative
                      for Q4
                    </p>
                  </div>
                  <span className="project-status status-completed">
                    Completed
                  </span>
                </div>
                <div className="project-meta">
                  <span className="project-meta-item">👥 12 Members</span>
                  <span className="project-meta-item">
                    📅 Completed: Nov 25, 2025
                  </span>
                  <span className="project-meta-item">💼 L&amp;D</span>
                </div>
                <div className="project-progress">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span className="progress-percentage">100%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Project 4 */}
              <div className="project-card">
                <div className="project-header">
                  <div style={{ flex: 1 }}>
                    <h4 className="project-title">
                      Performance Review System
                    </h4>
                    <p className="project-description">
                      Digital transformation of annual performance evaluation
                      process
                    </p>
                  </div>
                  <span className="project-status status-active">Active</span>
                </div>
                <div className="project-meta">
                  <span className="project-meta-item">👥 6 Members</span>
                  <span className="project-meta-item">📅 Due: Feb 10, 2026</span>
                  <span className="project-meta-item">💼 HR Department</span>
                </div>
                <div className="project-progress">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span className="progress-percentage">60%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: "60%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Project 5 */}
              <div className="project-card">
                <div className="project-header">
                  <div style={{ flex: 1 }}>
                    <h4 className="project-title">
                      Office Expansion Planning
                    </h4>
                    <p className="project-description">
                      Strategic planning for new regional office setup and
                      infrastructure
                    </p>
                  </div>
                  <span className="project-status status-planning">
                    Planning
                  </span>
                </div>
                <div className="project-meta">
                  <span className="project-meta-item">👥 10 Members</span>
                  <span className="project-meta-item">📅 Due: Mar 30, 2026</span>
                  <span className="project-meta-item">💼 Operations</span>
                </div>
                <div className="project-progress">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span className="progress-percentage">20%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: "20%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Project 6 */}
              <div className="project-card">
                <div className="project-header">
                  <div style={{ flex: 1 }}>
                    <h4 className="project-title">
                      Benefits Package Review
                    </h4>
                    <p className="project-description">
                      Annual review and optimization of employee benefits and
                      wellness programs
                    </p>
                  </div>
                  <span className="project-status status-active">Active</span>
                </div>
                <div className="project-meta">
                  <span className="project-meta-item">👥 4 Members</span>
                  <span className="project-meta-item">📅 Due: Jan 15, 2026</span>
                  <span className="project-meta-item">💼 HR Department</span>
                </div>
                <div className="project-progress">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span className="progress-percentage">85%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: "85%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* mobile sidebar overlay */}
      <div
        id="sidebarOverlay"
        className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
        tabIndex={-1}
        aria-hidden={!isSidebarOpen}
        onClick={handleOverlayClick}
      />
    </div>
  );
}

export default DashboardPage;
