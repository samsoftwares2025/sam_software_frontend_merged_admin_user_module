// src/pages/user/Dashboard.jsx
import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import "../../assets/styles/user.css";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";

const Dashboard = () => {
  /* ================= SIDEBAR CONTROL ================= */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("dashboard");

  /* ================= CHART REFS ================= */
  const attendanceRef = useRef(null);
  const taskRef = useRef(null);
  const attendanceChartInstance = useRef(null);
  const taskChartInstance = useRef(null);

  /* ================= TASK LIST ================= */
  const [tasks, setTasks] = useState([
    { id: 1, title: "Complete compliance training", date: "Due: Nov 30, 2025", priority: "high", done: false },
    { id: 2, title: "Submit monthly report", date: "Completed: Nov 10, 2025", priority: "medium", done: true },
    { id: 3, title: "Team meeting preparation", date: "Due: Nov 15, 2025", priority: "low", done: false },
    { id: 4, title: "Update project documentation", date: "Due: Nov 20, 2025", priority: "medium", done: false },
  ]);

  const toggleTask = (id) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const handleQuickAction = (label) => alert(`Action triggered: ${label}`);

  /* ================= CHART INITIALIZATION ================= */
  useEffect(() => {
    if (attendanceChartInstance.current) attendanceChartInstance.current.destroy();
    if (taskChartInstance.current) taskChartInstance.current.destroy();

    if (attendanceRef.current) {
      attendanceChartInstance.current = new Chart(attendanceRef.current, {
        type: "line",
        data: {
          labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
          datasets: [
            {
              label: "Days Present",
              data: [20, 22, 21, 22, 21, 20],
              borderColor: "#2d78b5",
              backgroundColor: "rgba(45,120,181,0.1)",
              borderWidth: 3,
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { min: 15, max: 25 }, x: { grid: { display: false } } },
        },
      });
    }

    if (taskRef.current) {
      taskChartInstance.current = new Chart(taskRef.current, {
        type: "bar",
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [
            { label: "Completed Tasks", data: [12, 8, 15, 10], backgroundColor: "#2d78b5", borderRadius: 6 },
            { label: "Pending Tasks", data: [3, 5, 2, 4], backgroundColor: "#B0BEC5", borderRadius: 6 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true, position: "bottom" } },
          scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
        },
      });
    }

    return () => {
      if (attendanceChartInstance.current) attendanceChartInstance.current.destroy();
      if (taskChartInstance.current) taskChartInstance.current.destroy();
    };
  }, []);

  /* ================= PAGE UI ================= */
  return (
    <>
      <div className="container">
        {/* SIDEBAR */}
        <Sidebar
          isMobileOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          openSection={openSection}
          setOpenSection={setOpenSection}
        />

        {/* MAIN CONTENT */}
        <main className="main">
          <Header onMenuClick={() => setIsSidebarOpen((p) => !p)} />


          {/* ================= TOP CARDS ================= */}
          <section className="top-grid">
            <div className="card">
              <h3>Attendance</h3>
              <div className="card-amount-row">
                <div>
                  <div className="small">This month</div>
                  <div className="big">
                    20 <span className="sub">days</span>
                  </div>
                  <div className="sub">Leaves left: <strong>4</strong></div>
                </div>
                <div className="mini-wrap"><i className="fa-solid fa-calendar-check fa-2x" /></div>
              </div>
            </div>

            <div className="card">
              <h3>My Tasks</h3>
              <div className="card-amount-row">
                <div>
                  <div className="small">Open tasks</div>
                  <div className="big">7</div>
                  <div className="sub">Overdue: <strong>2</strong></div>
                </div>
                <div className="mini-wrap"><i className="fa-solid fa-tasks fa-2x" /></div>
              </div>
            </div>

            <div className="card">
              <h3>Compensation</h3>
              <div className="card-amount-row">
                <div>
                  <div className="small">Latest payslip</div>
                  <div className="big">₹65,000</div>
                  <div className="sub">Net (Oct)</div>
                </div>
                <div className="mini-wrap"><i className="fa-solid fa-money-bill-wave fa-2x" /></div>
              </div>
            </div>

            <div className="card">
              <h3>Performance</h3>
              <div className="card-amount-row">
                <div>
                  <div className="small">Current rating</div>
                  <div className="big">4.2<span className="sub">/5.0</span></div>
                  <div className="sub">Team avg: 3.9</div>
                </div>
                <div className="mini-wrap"><i className="fa-solid fa-chart-line fa-2x" /></div>
              </div>
            </div>
          </section>

          {/* ================= QUICK ACTIONS ================= */}
          <section className="quick-row">
            <button className="quick blue" onClick={() => handleQuickAction("Apply for leave")}>Apply for Leave</button>
            <button className="quick green" onClick={() => handleQuickAction("Expense Reimbursement")}>Expense Reimbursement</button>
            <button className="quick yellow" onClick={() => handleQuickAction("Submit Timesheet")}>Submit Timesheet</button>
            <button className="quick red" onClick={() => handleQuickAction("Report an Issue")}>Report an Issue</button>
          </section>

          {/* ================= CHARTS ================= */}
          <section className="charts-section">
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Attendance Trend</h3>
                <div className="chart-container"><canvas ref={attendanceRef} /></div>
              </div>
              <div className="chart-card">
                <h3>Task Completion</h3>
                <div className="chart-container"><canvas ref={taskRef} /></div>
              </div>
            </div>
          </section>

          {/* ================= TASK LIST ================= */}
          <section className="simple-tasks">
            <h3>My Tasks</h3>

            {tasks.map((task) => (
              <div className="task-item" key={task.id}>
                <div className={`task-checkbox ${task.done ? "checked" : ""}`} onClick={() => toggleTask(task.id)}>
                  <i className="fa-solid fa-check" />
                </div>

                <div className="task-details">
                  <div className="task-title">{task.title}</div>
                  <div className="task-date">{task.date}</div>
                </div>

                <div className={`task-priority priority-${task.priority}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </div>
              </div>
            ))}
          </section>

          {/* ================= EVENTS ================= */}
          <section className="simple-events">
            <h3>Upcoming Events</h3>

            <div className="event-simple">
              <div className="event-icon"><i className="fa-solid fa-users" /></div>
              <div className="event-text"><h4>Team Building Workshop</h4><p>Nov 15, 2025 • 10:00 AM</p></div>
            </div>

            <div className="event-simple">
              <div className="event-icon"><i className="fa-solid fa-chart-line" /></div>
              <div className="event-text"><h4>Quarterly Review Meeting</h4><p>Nov 22, 2025 • 3:00 PM</p></div>
            </div>

            <div className="event-simple">
              <div className="event-icon"><i className="fa-solid fa-money-bill-wave" /></div>
              <div className="event-text"><h4>Salary Credit Day</h4><p>Nov 30, 2025</p></div>
            </div>

            <div className="event-simple">
              <div className="event-icon"><i className="fa-solid fa-heart" /></div>
              <div className="event-text"><h4>Health & Wellness Session</h4><p>Dec 5, 2025 • 2:00 PM</p></div>
            </div>
          </section>

          {/* ================= FOOTER QUICK LINKS ================= */}
          <footer className="footer-actions">
            <a className="quick blue" href="#">View All Tasks</a>
            <a className="quick green" href="#">Download Payslip</a>
            <a className="quick yellow" href="#">Open HR Support</a>
            <a className="quick red" href="#">Emergency Contact</a>
          </footer>
        </main>

        {/* Sidebar overlay */}
        <div
          className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        />
      </div>
    </>
  );
};

export default Dashboard;