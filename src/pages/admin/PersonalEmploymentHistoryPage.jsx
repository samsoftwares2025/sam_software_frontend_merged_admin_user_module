import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";

import { PersonalEmploymentHistory } from "../../api/admin/employees";

const PersonalEmploymentHistoryPage = () => {
  const { id: userId } = useParams();

  /* =====================
     SIDEBAR STATE
  ===================== */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("employees");

  /* =====================
     DATA STATE
  ===================== */
  const [employee, setEmployee] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================
     IMAGE MODAL STATE
  ===================== */
  const [isImageOpen, setIsImageOpen] = useState(false);

  /* =====================
     FILTER STATE
  ===================== */
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* =====================
     FETCH HISTORY
  ===================== */
  useEffect(() => {
    const authUserId = localStorage.getItem("userId");
    if (!userId || !authUserId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await PersonalEmploymentHistory({
          auth_user_id: authUserId,
          employee_id: userId,
          page: 1,
          page_size: 50,
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to load history");
        }

        const emp = res.users_data?.[0] || null;
        setEmployee(emp);

        const events = res.users_data.map((item) => ({
          date: item.updated_at || null,
          item,
        }));

        events.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        setHistory(events);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  /* =====================
     FILTERED HISTORY
  ===================== */
  const filteredHistory = useMemo(() => {
    return history.filter(({ date }) => {
      if (!date) return false;

      const d = new Date(date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      if (from && d < from) return false;
      if (to && d > to) return false;

      return true;
    });
  }, [history, fromDate, toDate]);

  /* =====================
     HELPERS
  ===================== */
  const getTenure = () => {
    if (!employee?.joining_date) return "0 days";

    const join = new Date(employee.joining_date);
    const today = new Date();

    let days = Math.floor((today - join) / (1000 * 60 * 60 * 24));

    // ✅ Prevent negative tenure
    if (days < 0) days = 0;

    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);

    if (years > 0) return `${years} yrs ${months} mos`;
    if (months > 0) return `${months} mos`;
    return `${days} days`;
  };

  const getProfileCompletion = () => {
    let score = 0;
    const total = 6;

    if (employee?.name) score++;
    if (employee?.designation) score++;
    if (employee?.department) score++;
    if (employee?.joining_date) score++;
    if (employee?.annual_ctc) score++;
    if (history.length > 0) score++;

    return Math.round((score / total) * 100);
  };

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
  };

  /* =====================
     STATES
  ===================== */
  if (loading) return <main className="main">Loading history...</main>;
  if (error) return <main className="main">{error}</main>;

  /* =====================
     RENDER
  ===================== */
  return (
    <div className="container">
      <Sidebar
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        openSection={openSection}
        setOpenSection={setOpenSection}
      />

      <main className="main">
        <Header onMenuClick={() => setIsSidebarOpen((p) => !p)} />

        {/* ===== SUMMARY ===== */}
        <section className="summary-grid">
          <div className="summary-box">
            <span className="summary-label">TENURE</span>
            <strong className="summary-value">{getTenure()}</strong>
          </div>

          <div className="summary-box">
            <span className="summary-label">PROFILE COMPLETION</span>
            <strong className="summary-value">{getProfileCompletion()}%</strong>
          </div>
        </section>

        {/* ===== FILTERS ===== */}
        <section className="filter-section">
          <div className="filter-group">
            <label>From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className="filter-actions">
            <button className="btn btn-ghost" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </section>
        {/* ===== EMPLOYEE INFO ===== */}
        <section className="info-section">
          {/* <h3 className="section-title">Employee Information</h3> */}

          <div className="employee-header">
            {/* Profile Photo */}
            <div
              className="profile-photo"
              onClick={() => employee?.image && setIsImageOpen(true)}
              style={{ cursor: employee?.image ? "pointer" : "default" }}
            >
              {employee?.image ? (
                <img
                  src={employee.image}
                  alt={employee.name || "Employee"}
                  className="profile-photo-img"
                />
              ) : (
                <span className="profile-initial">
                  {employee?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>

            {/* Info Grid */}
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Employee ID:</span>
                <Link
                  to={`/admin/employee-profile/${employee.id}`}
                  className="value employee-link"
                >
                  {employee?.employee_id || "—"}
                </Link>
              </div>

              <div className="info-item">
                <span className="label">Phone:</span>
                <span className="value">{employee?.phone || "—"}</span>
              </div>

              <div className="info-item">
                <span className="label">Official Email:</span>
                <span className="value">{employee?.official_email || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">Name:</span>
                <Link
                  to={`/admin/employee-profile/${employee.id}`}
                  className="value employee-link"
                >
                  {employee?.name || "—"}
                </Link>
              </div>
              <div className="info-item">
                <span className="label">Personal Email:</span>
                <span className="value">{employee?.personal_email || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">Joining Date:</span>
                <span className="value">
                  {" "}
                  {employee?.joining_date
                    ? new Date(employee?.joining_date).toLocaleDateString(
                        "en-GB",
                      )
                    : "-"}{" "}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== IMAGE MODAL ===== */}
        {isImageOpen && (
          <div className="image-modal" onClick={() => setIsImageOpen(false)}>
            <div
              className="image-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="image-modal-close"
                onClick={() => setIsImageOpen(false)}
              >
                ✕
              </button>

              <img src={employee.image} alt={employee.name} />
            </div>
          </div>
        )}

        {/* ===== HISTORY ===== */}
        <section className="history-section">
          <h3 className="section-title">Employment History</h3>

          {filteredHistory.length === 0 ? (
            <p className="small">No history available.</p>
          ) : (
            <div className="timeline-clean">
              {filteredHistory.map(({ date, item }, index) => (
                <div className="history-card" key={index}>
                  {/* LEFT TIMELINE BAR */}
                  <div className="timeline-line"></div>

                  {/* CARD CONTENT */}
                  <div className="history-content">
                    {/* Top Row: Order + Date */}
                    <div className="history-header">
                      <span className="history-order">Order No{index + 1}</span>
                      <span className="history-date">
                        {date
                          ? new Date(date).toLocaleDateString("en-GB")
                          : "—"}
                      </span>
                    </div>

                    {/* Position / Dept */}
                    <div className="history-title">
                      <span className="title-designation">
                        {item.designation || "—"}
                      </span>
                      <span className="title-department">
                        ({item.department || "—"})
                      </span>
                    </div>

                    {/* Meta Row */}
                    <div className="history-meta">
                      {item.employment_type && (
                        <div>
                          <strong>Type:</strong> {item.employment_type}
                        </div>
                      )}
                      {item.work_location && (
                        <div>
                          <strong>Location:</strong> {item.work_location}
                        </div>
                      )}
                      {item.user_role && (
                        <div>
                          <strong>Role:</strong> {item.user_role}
                        </div>
                      )}
                    </div>

                    {/* Salary Info */}
                    <div className="history-salary">
                      {item.annual_ctc && <span>CTC: ₹{item.annual_ctc}</span>}
                      {item.basic_salary && (
                        <span>Basic: ₹{item.basic_salary}</span>
                      )}
                      {item.variable_pay && (
                        <span>Variable: ₹{item.variable_pay}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
      <div
        id="sidebarOverlay"
        className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      </main>
    </div>
  );
};

export default PersonalEmploymentHistoryPage;
