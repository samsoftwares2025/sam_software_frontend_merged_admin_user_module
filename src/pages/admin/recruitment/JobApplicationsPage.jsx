import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import Sidebar from "../../../components/common/Sidebar";
import Header from "../../../components/common/Header";
import LoaderOverlay from "../../../components/common/LoaderOverlay";
import Pagination from "../../../components/common/Pagination";
import ErrorModal from "../../../components/common/ErrorModal";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal"; // ✅ Import the modal
import {
  listJobApplications,
  updateJobApplication,
  listActiveVacancies,
  deleteJobApplications,
} from "../../../api/admin/recruitment/job";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://admin.samsoftwares.com";

const selectStyles = {
  control: (base) => ({
    ...base,
    borderRadius: "10px",
    minHeight: "45px",
    border: "1px solid #e2e8f0",
    boxShadow: "none",
    "&:hover": { border: "1px solid #cbd5e1" },
  }),
};

function JobApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [jobOptions, setJobOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJob, setFilterJob] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);

  // Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal States ✅
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState([]);
  const [deleting, setDeleting] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        const resp = await listActiveVacancies();
        if (resp.success) {
          setJobOptions(
            resp.jobs.map((j) => ({ value: j.id, label: j.title })),
          );
        }
      } catch (err) {
        console.error("Failed to load vacancy list", err);
      }
    };
    fetchVacancies();
  }, []);

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

  const fetchApps = async (pageNo = 1, currentSize = pageSize) => {
    setLoading(true);
    try {
      const resp = await listJobApplications({
        page: pageNo,
        search: searchTerm,
        job_id: filterJob ? filterJob.value : "",
        from_date: fromDate,
        to_date: toDate,
        status: filterStatus ? filterStatus.value : "",
        page_size: currentSize,
      });

      if (resp.success) {
        setApps(resp.applications);
        setPagination(resp.pagination);
        setPage(pageNo);
        setSelectedIds([]);
      }
    } catch (err) {
      console.error("Failed to load applications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchApps(1, pageSize);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, filterJob, filterStatus, fromDate, toDate, pageSize]);

  // Selection Logic
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === apps.length && apps.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(apps.map((app) => app.id));
    }
  };

  // ✅ New Delete Logic using Modal
  const openDeleteModal = (ids) => {
    setIdsToDelete(ids);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      const res = await deleteJobApplications(idsToDelete);
      if (res.success) {
        setShowDeleteModal(false);
        fetchApps(page, pageSize);
      } else {
        setErrorMessage(res.message || "Failed to delete.");
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error("Delete failed", err);
      setErrorMessage("An error occurred during deletion.");
      setShowErrorModal(true);
    } finally {
      setDeleting(false);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterJob(null);
    setFilterStatus(null);
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const handleUpdate = async (id, field, value) => {
    try {
      const res = await updateJobApplication(id, { [field]: value });
      if (res.success) {
        setApps((prev) =>
          prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
        );
      }
    } catch (err) {
      console.error(`Failed to update ${field}`, err);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getStatusStyle = (status) => {
    switch (status) {
      case "Shortlisted":
        return { bg: "#ecfdf5", color: "#059669" };
      case "Rejected":
        return { bg: "#fef2f2", color: "#dc2626" };
      default:
        return { bg: "#fffbeb", color: "#d97706" };
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
        .job-link { text-decoration: none; color: #2563eb; font-weight: 600; }
        .job-link:hover { text-decoration: underline; }
        .filter-date-input {
          height: 45px;
          padding: 0 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          outline: none;
          font-size: 14px;
          color: #475569;
          width: 160px;
        }
        .bulk-actions-bar {
          background: #fff1f2;
          border: 1px solid #fecaca;
          padding: 12px 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          animation: slideDown 0.3s ease-out;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Sidebar openSection="recruitment" />
      <main className="main">
        <Header />
        {loading && <LoaderOverlay />}

        {showErrorModal && (
          <ErrorModal
            message={errorMessage}
            onClose={() => setShowErrorModal(false)}
          />
        )}

        {/* ✅ Delete Confirmation Modal */}
        {showDeleteModal && (
          <DeleteConfirmModal
            title="Delete Application(s)"
            message={`Are you sure you want to delete ${idsToDelete.length} application(s)? This action cannot be undone.`}
            onConfirm={handleConfirmDelete}
            onClose={() => setShowDeleteModal(false)}
            loading={deleting}
          />
        )}

        <div className="page-title">
          <div className="title-left">
            <h3>Candidate Applications</h3>
            <p className="subtitle">
              Review and manage incoming resumes efficiently.
            </p>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="bulk-actions-bar">
            <div style={{ color: "#991b1b", fontWeight: "600" }}>
              <i
                className="fa-solid fa-circle-info"
                style={{ marginRight: "8px" }}
              />
              {selectedIds.length} items selected
            </div>
            <button
              className="btn"
              style={{ background: "#ef4444", color: "white", border: "none" }}
              onClick={() => openDeleteModal(selectedIds)} // ✅ Changed to open modal
            >
              <i
                className="fa-solid fa-trash-can"
                style={{ marginRight: "8px" }}
              />
              Delete Selected
            </button>
          </div>
        )}

        <div className="filters-container">
          <div
            className="filters-left"
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
              flex: 1,
            }}
          >
            {/* Search Input */}
            <div
              className="search-input"
              style={{ minWidth: "220px", margin: 0 }}
            >
              <i className="fa-solid fa-magnifying-glass" />
              <input
                placeholder="Name, email or phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Vacancy Select */}
            <div style={{ width: "220px", maxWidth: "100%" }}>
              <Select
                options={jobOptions}
                value={filterJob}
                onChange={(opt) => {
                  setFilterJob(opt);
                  setPage(1);
                }}
                styles={selectStyles}
                placeholder="All Vacancies"
                isClearable
                isSearchable
              />
            </div>

            {/* Status Select */}
            <div style={{ width: "180px", maxWidth: "100%" }}>
              <Select
                options={[
                  { value: "Pending", label: "Pending" },
                  { value: "Shortlisted", label: "Shortlisted" },
                  { value: "Rejected", label: "Rejected" },
                ]}
                value={filterStatus}
                onChange={(opt) => {
                  setFilterStatus(opt);
                  setPage(1);
                }}
                styles={selectStyles}
                placeholder="All Statuses"
                isClearable
                isSearchable={false}
              />
            </div>

            {/* Responsive Date Group */}
            <div className="date-filter-group">
              {/* From Date Input */}
              <div className="date-input-container">
                <input
                  type={fromDate ? "date" : "text"}
                  placeholder="From Date"
                  className="filter-date-input"
                  value={fromDate}
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => !fromDate && (e.target.type = "text")}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {/* To Date Input */}
              <div className="date-input-container">
                <input
                  type={toDate ? "date" : "text"}
                  placeholder="To Date"
                  className="filter-date-input"
                  value={toDate}
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => !toDate && (e.target.type = "text")}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="filters-right">
            <button className="btn btn-ghost" onClick={clearFilters}>
              <i className="fa-solid fa-filter-circle-xmark" /> Clear Filters
            </button>
          </div>
        </div>

        <div className="table-container">
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={
                        apps.length > 0 && selectedIds.length === apps.length
                      }
                    />
                  </th>
                  <th>Applied Date</th>
                  <th>Candidate</th>
                  <th>Phone</th>
                  <th>Job Position</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Contacted</th>
                  <th style={{ textAlign: "right" }}>Resume</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.length > 0 ? (
                  apps.map((app) => {
                    const fileUrl = app.cv_url
                      ? `${BASE_URL}${app.cv_url}`
                      : null;
                    const style = getStatusStyle(app.status);
                    const isImage = fileUrl && isImageFile(fileUrl);
                    return (
                      <tr key={app.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(app.id)}
                            onChange={() => toggleSelect(app.id)}
                          />
                        </td>
                        <td style={{ fontSize: "13px" }}>
                          {formatDate(app.applied_at)}
                        </td>
                        <td>
                          <div style={{ fontWeight: "700" }}>
                            {app.candidate_name}
                          </div>
                          <div className="small text-muted">{app.email}</div>
                        </td>
                        <td style={{ fontWeight: "600", fontSize: "13px" }}>
                          {app.phone}
                        </td>
                        <td>
                          <Link
                            to={`/recruitment/vacancy-view?id=${app.job_id}`}
                            className="job-link"
                          >
                            {app.job_title}
                          </Link>
                        </td>
                        <td>
                          <select
                            className="custom-status-select"
                            style={{
                              backgroundColor: style.bg,
                              color: style.color,
                            }}
                            value={app.status}
                            onChange={(e) =>
                              handleUpdate(app.id, "status", e.target.value)
                            }
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div
                            onClick={() =>
                              handleUpdate(
                                app.id,
                                "is_contact",
                                !app.is_contact,
                              )
                            }
                            style={{ cursor: "pointer" }}
                          >
                            <i
                              className={`fa-solid ${app.is_contact ? "fa-circle-check" : "fa-circle-xmark"}`}
                              style={{
                                color: app.is_contact ? "#10b981" : "#cbd5e1",
                                fontSize: "1.2rem",
                              }}
                            />
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {fileUrl ? (
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                justifyContent: "flex-end",
                              }}
                            >
                              <button
                                className="icon-btn"
                                title="View"
                                onClick={() =>
                                  isImage
                                    ? setPreviewImage(fileUrl)
                                    : window.open(fileUrl, "_blank")
                                }
                              >
                                <i className="fa-solid fa-eye" />
                              </button>
                              <button
                                className="icon-btn"
                                title="Download"
                                onClick={() =>
                                  downloadFile(
                                    fileUrl,
                                    `${app.candidate_name}_CV`,
                                  )
                                }
                              >
                                <i className="fa-solid fa-download" />
                              </button>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="icon-btn"
                            style={{ color: "#ef4444" }}
                            title="Delete"
                            onClick={() => openDeleteModal([app.id])} // ✅ Changed to open modal
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      No applications found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalCount={pagination.total_records || 0}
            pageSize={pageSize}
            onPageChange={(p) => fetchApps(p, pageSize)}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>

        {/* IMAGE PREVIEW MODAL */}
        {previewImage && (
          <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <img
                src={previewImage}
                alt="CV Preview"
                style={{
                  width: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                }}
              />
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 12,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  className="icon-btn"
                  onClick={() => downloadFile(previewImage, "cv-preview")}
                >
                  <i className="fa-solid fa-download" />
                </button>
                <button className="btn" onClick={() => setPreviewImage(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default JobApplicationsPage;
