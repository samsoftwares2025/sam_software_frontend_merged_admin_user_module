import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import Header from "../../../components/common/Header";
import LoaderOverlay from "../../../components/common/LoaderOverlay";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";
import SuccessModal from "../../../components/common/SuccessModal";
import ErrorModal from "../../../components/common/ErrorModal";
import Pagination from "../../../components/common/Pagination";
import ProtectedAction from "../../../components/admin/ProtectedAction";

import "../../../assets/styles/admin.css";

import {
  listJobVacancies,
  deleteJobVacancy as apiDeleteJob,
} from "../../../api/admin/recruitment/job";

function JobVacanciesPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  // ✅ New State for Company Slug
  const [companySlug, setCompanySlug] = useState("");

  // Pagination & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState({});

  // Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  /* ================= FETCH DATA ================= */
  const fetchJobs = async (pageNo = 1, currentSize = pageSize) => {
    setLoading(true);
    try {
      const payload = {
        page: pageNo,
        page_size: currentSize,
        search: searchTerm,
      };
      const resp = await listJobVacancies(payload);

      if (resp.success) {
        setJobs(resp.jobs || []);
        setPagination(resp.pagination || {});
        setPage(pageNo);
        // ✅ Capture Company Slug from response
        if (resp.company_slug) setCompanySlug(resp.company_slug);
      }
    } catch (err) {
      setErrorMessage("Unable to load vacancies.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchJobs(1, pageSize);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pageSize]);

  /* ================= HELPERS ================= */
  const handleCopyPortalLink = () => {
    if (!companySlug) {
      alert("Company details not loaded yet.");
      return;
    }
    const publicUrl = `${window.location.origin}/${companySlug}/jobs`;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePageChange = (newPage) => fetchJobs(newPage, pageSize);
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    setDeleting(true);
    try {
      await apiDeleteJob(jobToDelete.id);
      fetchJobs(page, pageSize);
      setShowDeleteModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage("Failed to delete vacancy.");
      setShowErrorModal(true);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const truncateDescription = (text, maxLength = 40) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const renderTruncatedSkills = (skills) => {
    if (!skills || skills.length === 0)
      return <span className="text-muted small">No skills listed</span>;
    const maxVisible = 2;
    const visibleSkills = skills.slice(0, maxVisible);
    const hasMore = skills.length > maxVisible;

    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "4px",
          alignItems: "center",
          lineHeight: "1.8",
        }}
        title={skills.join(", ")}
      >
        {visibleSkills.map((s, i) => (
          <React.Fragment key={i}>
            <span className="skill-badge-mini">{s}</span>
            {(i < visibleSkills.length - 1 || hasMore) && (
              <span style={{ color: "#000", fontWeight: "900", fontSize: "16px", marginRight: "4px" }}>,</span>
            )}
          </React.Fragment>
        ))}
        {hasMore && <span style={{ fontWeight: "900", color: "#666" }}>...</span>}
      </div>
    );
  };

  return (
    <>
      {(loading || deleting) && <LoaderOverlay />}
      {showSuccessModal && (
        <SuccessModal
          message="Vacancy deleted successfully."
          onClose={() => setShowSuccessModal(false)}
        />
      )}
      {showErrorModal && (
        <ErrorModal message={errorMessage} onClose={() => setShowErrorModal(false)} />
      )}

      <div className="container">
        <Sidebar openSection="recruitment" />
        <main className="main">
          <Header />

          <div className="page-title">
            <div className="title-left">
              <h3>Job Vacancies</h3>
              <p className="subtitle">Manage and track company job openings.</p>
            </div>
          </div>

          <div className="filters-container">
            <div className="filters-left">
              <div className="search-input">
                <i className="fa-solid fa-magnifying-glass" />
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="filters-right" style={{ display: "flex", gap: "10px" }}>
              {/* ✅ NEW: Share Portal Link Button */}
              <button 
                className={`btn ${copied ? "btn-success" : "btn-ghost"}`}
                onClick={handleCopyPortalLink}
                title="Copy Public Careers Link"
              >
                <i className={`fa-solid ${copied ? "fa-check" : "fa-share-nodes"}`} /> 
                {copied ? " Copied!" : " Share Portal"}
              </button>

              <ProtectedAction
                module="Job"
                action="add"
                to="/recruitment/add-job"
                className="btn btn-primary"
              >
                <i className="fa-solid fa-plus" /> Post Vacancy
              </ProtectedAction>
            </div>
          </div>

          <div className="table-container">
            <div className="table-header-bar">
              <h4>
                Active Postings{" "}
                <span className="badge-pill">
                  Total: {pagination.total_records || 0}
                </span>
              </h4>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "5%" }}>#</th>
                    <th style={{ width: "10%" }}>Posted Date</th>
                    <th style={{ width: "20%" }}>Job Title</th>
                    <th style={{ width: "15%" }}>Description</th>
                    <th style={{ width: "15%" }}>Category & Type</th>
                    <th style={{ width: "20%" }}>Skills Required</th>
                    <th style={{ width: "5%", textAlign: "center" }}>Status</th>
                    <th style={{ width: "10%", textAlign: "right", paddingRight: "20px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((row, index) => (
                    <tr key={row.id}>
                      <td>{(pagination.current_page - 1) * pagination.page_size + index + 1}</td>
                      <td style={{ fontSize: "13px", color: "#64748b" }}>{formatDate(row.created_at)}</td>
                      <td><strong>{row.title}</strong></td>
                      <td title={row.description}>
                        <span className="small">{truncateDescription(row.description)}</span>
                      </td>
                      <td>
                        <div className="category-tag">{row.category_name}</div>
                        <div className="small text-muted">{row.job_type}</div>
                      </td>
                      <td>{renderTruncatedSkills(row.skills)}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`status-dot ${row.is_active ? "active" : "inactive"}`}>
                          {row.is_active ? "Active" : "Closed"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "20px" }}>
                        <div className="table-actions" style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button className="icon-btn view" onClick={() => navigate(`/recruitment/vacancy-view?id=${row.id}`)} title="View Details">
                            <i className="fa-solid fa-eye" />
                          </button>
                          <ProtectedAction module="Job" action="update" to={`/recruitment/vacancy-update?id=${row.id}`} className="icon-btn edit">
                            <i className="fa-solid fa-pen" />
                          </ProtectedAction>
                          <ProtectedAction module="Job" action="delete" onAllowed={() => { setJobToDelete(row); setShowDeleteModal(true); }} className="icon-btn delete">
                            <i className="fa-solid fa-trash" />
                          </ProtectedAction>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={page}
              totalCount={pagination.total_records || 0}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </main>
      </div>

      {showDeleteModal && (
        <DeleteConfirmModal
          title="Delete Vacancy"
          message={`Are you sure you want to permanently delete "${jobToDelete?.title}"?`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}

export default JobVacanciesPage;