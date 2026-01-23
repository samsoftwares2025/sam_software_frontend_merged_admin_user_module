import React, { useEffect, useState, useMemo } from "react";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";

import LoaderOverlay from "../../components/common/LoaderOverlay";
import ErrorModal from "../../components/common/ErrorModal";

import { getMyProfile, getMyHistory } from "../../api/user/myprofile";

const MyHistory = () => {
  /* ===== SIDEBAR STATE ===== */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);

  const [employee, setEmployee] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== MODALS ===== */
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ===== DATE FILTER STATE ===== */
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ===== PAGINATION STATE ===== */
  const [page, setPage] = useState(1);
  const [pagination] = useState({
    page_size: 10,
  });

  /* =====================
     FETCH PROFILE + HISTORY
  ===================== */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const profileRes = await getMyProfile();
        if (!profileRes?.employee) {
          throw new Error("Failed to load profile.");
        }

        const emp = profileRes.employee;
        setEmployee(emp);

        const historyRes = await getMyHistory(page, pagination.page_size);
        if (!historyRes?.success) {
          throw new Error("Failed to load history.");
        }

        const events = [];

        if (emp.joining_date) {
          events.push({
            date: emp.joining_date,
            details: `Joined company as ${emp.designation || "Employee"}${
              emp.department ? ` (${emp.department})` : ""
            }`,
          });
        }

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

        events.push({
          date: emp.updated_at || emp.joining_date,
          details: `Current position: ${emp.designation || "—"}${
            emp.department ? ` (${emp.department})` : ""
          }`,
        });

        events.sort(
          (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
        );

        setHistory(events);
      } catch (err) {
        setErrorMessage(err.message || "Something went wrong.");
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [page, pagination.page_size]);

  /* =====================
     FILTERED HISTORY
  ===================== */
  const filteredHistory = useMemo(() => {
    return history.filter(({ date }) => {
      if (!date) return false;

      const d = new Date(date);
      if (fromDate && d < new Date(fromDate)) return false;
      if (toDate && d > new Date(toDate)) return false;

      return true;
    });
  }, [history, fromDate, toDate]);

  /* =====================
     HELPERS
  ===================== */
  const buildHistoryDetails = (item) => {
    const parts = [];
    if (item.designation) parts.push(item.designation);
    if (item.department) parts.push(item.department);
    if (item.employment_type) parts.push(item.employment_type);
    if (item.work_location) parts.push(item.work_location);
    if (item.annual_ctc) parts.push(`CTC ₹${item.annual_ctc}`);

    return parts.length ? parts.join(" • ") : "Profile updated";
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

  return (
    <>
      {/* ===== LOADER ===== */}
      {loading && <LoaderOverlay />}

      {/* ===== ERROR MODAL ===== */}
      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}

      <div className="container">
        {/* ===== SIDEBAR (FIXED) ===== */}
        <Sidebar
          isMobileOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          openSection={openSection}
          setOpenSection={setOpenSection}
        />

        <main className="main">
          {/* ===== HEADER (FIXED) ===== */}
          <Header
            onMenuClick={() => setIsSidebarOpen((p) => !p)}
          />

          {/* ===== SUMMARY ===== */}
          <section className="summary-grid">
            <div className="summary-box">
              <span className="summary-label">TENURE</span>
              <strong className="summary-value">{getTenure()}</strong>
            </div>

            <div className="summary-box">
              <span className="summary-label">
                PROFILE COMPLETION
              </span>
              <strong className="summary-value">
                {getProfileCompletion()}%
              </strong>
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

          {/* ===== HISTORY ===== */}
          <section className="history-section">
            <h3 className="section-title">My Employment History</h3>

            {filteredHistory.length === 0 ? (
              <p className="small">No history available.</p>
            ) : (
              <div className="timeline-clean">
                {filteredHistory.map((item, index) => (
                  <div className="history-card" key={index}>
                    <div className="timeline-line" />

                    <div className="history-content">
                      <div className="history-header">
                        <span className="history-order">
                          Order No{index + 1}
                        </span>
                        <span className="history-date">
                          {item.date
                            ? new Date(item.date).toLocaleDateString(
                                "en-GB"
                              )
                            : "—"}
                        </span>
                      </div>

                      <div className="history-title">
                        {item.details}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* ===== OVERLAY ===== */}
        {isSidebarOpen && (
          <div
            className="sidebar-overlay show"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default MyHistory;
