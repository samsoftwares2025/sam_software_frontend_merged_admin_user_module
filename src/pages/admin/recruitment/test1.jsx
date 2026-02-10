import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // ✅ Import Link
import Sidebar from "../../../components/common/Sidebar";
import Header from "../../../components/common/Header";
import LoaderOverlay from "../../../components/common/LoaderOverlay";
import Pagination from "../../../components/common/Pagination";
import ErrorModal from "../../../components/common/ErrorModal";
import {
  listJobApplications,
  updateJobApplication,
} from "../../../api/admin/recruitment/job";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://hr.samsoftwares.com";

function JobApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState({});
  
  const [previewImage, setPreviewImage] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const downloadFile = async (fileUrl, fileName = "resume") => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMessage("Unable to download file.");
      setShowErrorModal(true);
    }
  };

  const isImageFile = (url) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

  const fetchApps = async (pageNo = 1, search = searchTerm, size = pageSize) => {
    setLoading(true);
    try {
      const user_id = localStorage.getItem("user_id");
      const resp = await listJobApplications({
        user_id,
        page: pageNo,
        search,
        page_size: size,
      });

      if (resp.success) {
        setApps(resp.applications);
        setPagination(resp.pagination);
        setPage(pageNo);
      }
    } catch (err) {
      console.error("Failed to load applications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchApps(1, searchTerm, pageSize);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, pageSize]);

  const handleUpdate = async (id, field, value) => {
    try {
      const res = await updateJobApplication(id, { [field]: value });
      if (res.success) {
        setApps((prev) =>
          prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
        );
      }
    } catch (err) {
      console.error(`Failed to update ${field}`, err);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });

  const getStatusStyle = (status) => {
    switch (status) {
      case "Shortlisted": return { bg: "#ecfdf5", color: "#059669" };
      case "Rejected": return { bg: "#fef2f2", color: "#dc2626" };
      default: return { bg: "#fffbeb", color: "#d97706" };
    }
  };

  return (
    <div className="container">
      <style>{`
        .custom-status-select {
          appearance: none;
          padding: 6px 30px 6px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
          outline: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          background-size: 14px;
        }
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.6); display: flex; align-items: center;
          justify-content: center; z-index: 1000;
        }
        .modal-card {
          background: white; padding: 20px; border-radius: 12px;
          max-width: 600px; width: 90%;
        }
        .job-link {
          text-decoration: none;
          color: #2563eb;
          font-weight: 600;
          transition: color 0.2s;
        }
        .job-link:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }
      `}</style>

      <Sidebar openSection="recruitment" />
      <main className="main">
        <Header />
        {loading && <LoaderOverlay />}
        
        {showErrorModal && (
          <ErrorModal message={errorMessage} onClose={() => setShowErrorModal(false)} />
        )}

        <div className="page-title">
          <div className="title-left">
            <h3>Candidate Applications</h3>
            <p className="subtitle">Review resumes and manage candidates.</p>
          </div>
        </div>

        <div className="filters-container">
          <div className="search-input">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Applied Date</th>
                  <th>Candidate</th>
                  <th>Phone</th>
                  <th>Job Position</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Contacted</th>
                  <th style={{ textAlign: "right" }}>Resume</th>
                </tr>
              </thead>

              <tbody>
                {apps.length > 0 ? (
                  apps.map((app) => {
                    const fileUrl = app.cv_url ? `${BASE_URL}${app.cv_url}` : null;
                    const style = getStatusStyle(app.status);
                    const isImage = fileUrl && isImageFile(fileUrl);
                    
                    return (
                      <tr key={app.id}>
                        <td style={{ fontSize: '13px' }}>{formatDate(app.applied_at)}</td>
                        <td>
                          <div style={{ fontWeight: '700' }}>{app.candidate_name}</div>
                          <div className="small text-muted">{app.email}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '700' }}>{app.phone}</div>
                        </td>
                        <td>
                          {/* ✅ Linked to Vacancy View Page */}
                          <Link 
                            to={`/recruitment/vacancy-view?id=${app.job_id || app.job?.id}`} 
                            className="job-link"
                          >
                            {app.job_title}
                          </Link>
                        </td>
                        <td>
                          <select
                            className="custom-status-select"
                            style={{ backgroundColor: style.bg, color: style.color }}
                            value={app.status}
                            onChange={(e) => handleUpdate(app.id, "status", e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div onClick={() => handleUpdate(app.id, "is_contact", !app.is_contact)} style={{ cursor: 'pointer' }}>
                            {app.is_contact ? (
                                <i className="fa-solid fa-circle-check" style={{color: '#10b981', fontSize: '1.2rem'}} />
                            ) : (
                                <i className="fa-solid fa-circle-xmark" style={{color: '#cbd5e1', fontSize: '1.2rem'}} />
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {fileUrl ? (
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                              <button 
                                className="icon-btn" 
                                title="View"
                                onClick={() => isImage ? setPreviewImage(fileUrl) : window.open(fileUrl, "_blank")}
                              >
                                <i className="fa-solid fa-eye" />
                              </button>
                              <button 
                                className="icon-btn" 
                                title="Download"
                                onClick={() => downloadFile(fileUrl, `${app.candidate_name}_CV`)}
                              >
                                <i className="fa-solid fa-download" />
                              </button>
                            </div>
                          ) : "-"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="6" style={{ textAlign: "center", padding: '40px' }}>No applications found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={page}
            totalCount={pagination.total_records || 0}
            pageSize={pageSize}
            onPageChange={(p) => fetchApps(p)}
          />
        </div>

        {/* IMAGE PREVIEW MODAL */}
        {previewImage && (
          <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <img src={previewImage} alt="CV Preview" style={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }} />
              <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                <button className="icon-btn" onClick={() => downloadFile(previewImage, "cv-preview")}>
                  <i className="fa-solid fa-download" />
                </button>
                <button className="btn" onClick={() => setPreviewImage(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default JobApplicationsPage;