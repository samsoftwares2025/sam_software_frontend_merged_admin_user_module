import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/user.css";

import { getMyProfile, getMyHistory } from "../../api/user/myprofile";

const MyHistory = () => {
  /* ===== SIDEBAR STATE ===== */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [employee, setEmployee] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ===== DATE FILTER STATE ===== */
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ===== PAGINATION STATE ===== */
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    page_size: 10,
    total_pages: 1,
    total_records: 0,
    has_next: false,
    has_previous: false,
  });

  /* =====================
     FETCH PROFILE + HISTORY
  ===================== */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        /* ========= PROFILE ========= */
        const profileRes = await getMyProfile();
        if (!profileRes?.employee) {
          throw new Error("Failed to load profile");
        }

        const emp = profileRes.employee;
        setEmployee(emp);

        /* ========= HISTORY ========= */
        const historyRes = await getMyHistory(page, pagination.page_size);
        if (!historyRes?.success) {
          throw new Error("Failed to load history");
        }

        /* ✅ MAP BACKEND RESPONSE → FRONTEND PAGINATION */
        const totalRecords = historyRes.total_count || 0;
        const pageSize = historyRes.page_size || pagination.page_size;
        const totalPages = historyRes.total_pages || 1;

        setPagination({
          current_page: historyRes.page || page,
          page_size: pageSize,
          total_pages: totalPages,
          total_records: totalRecords,
          has_previous: page > 1,
          has_next: page < totalPages,
        });

        const events = [];

        /* JOINING EVENT */
        if (emp.joining_date) {
          events.push({
            date: emp.joining_date,
            details: `Joined company as ${emp.designation || "Employee"}${
              emp.department ? ` in ${emp.department} department` : ""
            }.`,
          });
        }

        /* BACKEND HISTORY */
        historyRes.users_data.forEach((item) => {
          events.push({
            date:
              item.confirmation_date ||
              item.last_working_date ||
              item.joining_date ||
              null,
            details: buildHistoryDetails(item),
          });
        });

        /* CURRENT POSITION */
        events.push({
          date: emp.updated_at || emp.joining_date,
          details: `Current position: ${emp.designation || "—"}${
            emp.department ? ` (${emp.department})` : ""
          }.`,
        });

        /* SORT DESC */
        events.sort(
          (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
        );

        setHistory(events);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [page]);

  /* =====================
     FILTERED HISTORY
  ===================== */
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (!item.date) return false;

      const itemDate = new Date(item.date);

      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (itemDate < from) return false;
      }

      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (itemDate > to) return false;
      }

      return true;
    });
  }, [history, fromDate, toDate]);

  /* =====================
     HELPERS
  ===================== */
  const buildHistoryDetails = (item) => {
    const parts = [];
    if (item.designation) parts.push(`Designation: ${item.designation}`);
    if (item.department) parts.push(`Department: ${item.department}`);
    if (item.employment_type) parts.push(`Type: ${item.employment_type}`);
    if (item.work_location) parts.push(`Location: ${item.work_location}`);
    if (item.annual_ctc) parts.push(`CTC: ₹${item.annual_ctc}`);
    if (item.reporting_manager) parts.push(`Manager: ${item.reporting_manager}`);
    if (item.status) parts.push(`Status: ${item.status}`);

    return parts.length
      ? parts.join(" | ")
      : "Profile information updated";
  };

  const getTenure = () => {
    if (!employee?.joining_date) return "—";

    const join = new Date(employee.joining_date);
    const today = new Date();
    const days = Math.floor((today - join) / (1000 * 60 * 60 * 24));

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
     PAGINATION INFO
  ===================== */
  const currentPage = pagination.current_page;
  const pageSize = pagination.page_size;
  const totalRecords = pagination.total_records;

  const start =
    totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalRecords);

  if (loading) return <main className="main">Loading history...</main>;
  if (error) return <main className="main">{error}</main>;

  return (
    <div className="container">
      <Sidebar
        sidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(false)}
      />

      <main className="main">
        <Header
          sidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((p) => !p)}
        />

        {/* ===== TOP CARDS ===== */}
        <section className="top-grid">
          <div className="card">
            <h3>TENURE</h3>
            <div className="big">{getTenure()}</div>
          </div>

          <div className="card">
            <h3>PROFILE COMPLETION</h3>
            <div className="big">{getProfileCompletion()}%</div>
          </div>
        </section>

        {/* ===== DATE FILTER ===== */}
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

        {/* ===== HISTORY TABLE ===== */}
        <section className="card history-card">
          <h3>My History</h3>

          {filteredHistory.length === 0 ? (
            <p className="small">No history available.</p>
          ) : (
            <>
              <div className="history-table-wrapper">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((item, index) => (
                      <tr key={index}>
                        <td>
                          {item.date
                            ? new Date(item.date).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>{item.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="table-footer">
                <div id="tableInfo">
                  Showing {start} to {end} of {totalRecords} records
                </div>

                <div className="pagination">
                  <button
                    disabled={!pagination.has_previous}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <i className="fa-solid fa-angle-left" />
                  </button>

                  <button className="active-page">{currentPage}</button>

                  <button
                    disabled={!pagination.has_next}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <i className="fa-solid fa-angle-right" />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      {isSidebarOpen && (
        <div
          className="sidebar-overlay show"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MyHistory;
