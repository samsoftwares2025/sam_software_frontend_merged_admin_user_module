import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import Header from "../../../components/common/Header";
import LoaderOverlay from "../../../components/common/LoaderOverlay";
import ErrorModal from "../../../components/common/ErrorModal";
import { getVaccancyById } from "../../../api/admin/recruitment/job";

function ViewVacancyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const jobId = queryParams.get("id");

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchDetails = async () => {
      if (!jobId) {
        setErrorMsg("Invalid Vacancy ID");
        return;
      }
      try {
        const resp = await getVaccancyById(jobId);
        // Ensure we are getting the 'job' object from the response
        const jobData = resp.job || resp;
        setJob(jobData);
      } catch (err) {
        setErrorMsg("Failed to load vacancy details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [jobId]);

  /* ================= HELPERS ================= */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopyLink = () => {
    const domain = window.location.origin;

    if (!job?.company_slug || !job?.slug) {
      alert("Error: Company Slug or Job Slug is missing from the database.");
      return;
    }

    // Constructs: http://localhost:5173/google/jobs/wdw-e5a7f80e
    const publicUrl = `${domain}/${job.company_slug}/jobs/${job.slug}`;
    
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {loading && <LoaderOverlay />}
      {errorMsg && <ErrorModal message={errorMsg} onClose={() => navigate(-1)} />}

      <div className="container">
        <Sidebar openSection="recruitment" />
        <main className="main">
          <Header />
          <div className="page-title">
            <div className="title-left">
              <h3>Vacancy Details</h3>
              <p className="subtitle">Detailed view of the posted job opening.</p>
            </div>
            <button className="btn btn-ghost" onClick={() => navigate(-1)}>
              <i className="fa-solid fa-arrow-left" /> Back to List
            </button>
          </div>

          {job && (
            <div className="card view-card" style={{ padding: "2.5rem" }}>
              <div className="view-header" style={{ marginBottom: "2rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ color: "#0f172a", marginBottom: "0.5rem", fontSize: "1.75rem" }}>{job.title}</h2>
                    <span className={`status-pill ${job.is_active ? "active" : "inactive"}`} style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
                       {job.is_active ? "● Active Posting" : "● Closed"}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>POSTED ON</p>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{formatDate(job.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* ✅ Public Link Section */}
              <div style={{ 
                background: "#f0f9ff", 
                border: "1px dashed #7dd3fc", 
                padding: "1rem", 
                borderRadius: "8px", 
                marginBottom: "2.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div style={{ overflow: "hidden" }}>
                  <label style={{ ...labelStyle, color: "#0369a1" }}>Public Application Link</label>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0c4a6e", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {job.company_slug && job.slug ? (
                        `${window.location.origin}/${job.company_slug}/jobs/${job.slug}`
                    ) : (
                        <span style={{ color: "#ef4444" }}>Missing URL Data (Check backend slugs)</span>
                    )}
                  </p>
                </div>
                <button 
                  className={`btn ${copied ? "btn-success" : "btn-primary"}`} 
                  style={{ padding: "8px 16px", fontSize: "12px", minWidth: "110px", marginLeft: "10px" }}
                  onClick={handleCopyLink}
                  disabled={!job.company_slug || !job.slug}
                >
                  <i className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`} /> {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", marginBottom: "2.5rem" }}>
                <div className="view-group">
                  <label style={labelStyle}>Category</label>
                  <p className="category-tag" style={{ width: "fit-content", marginTop: "8px" }}>{job.category_name || "General"}</p>
                </div>
                <div className="view-group">
                  <label style={labelStyle}>Employment Type</label>
                  <p style={textStyle}>{job.job_type_name || job.job_type}</p>
                </div>
                <div className="view-group">
                  <label style={labelStyle}>Location</label>
                  <p style={textStyle}><i className="fa-solid fa-location-dot" style={{ color: "#64748b", marginRight: "6px" }} /> {job.location}</p>
                </div>
                <div className="view-group">
                  <label style={labelStyle}>Last Updated</label>
                  <p style={{ ...textStyle, fontSize: "14px", color: "#64748b" }}>{formatDate(job.updated_at) || "Not modified yet"}</p>
                </div>
              </div>

              <div className="view-group" style={{ marginBottom: "2.5rem" }}>
                <label style={labelStyle}>Required Skills</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "12px" }}>
                  {job.skills && job.skills.length > 0 ? (
                    job.skills.map((skill, index) => (
                      <span key={index} className="skill-badge-mini" style={skillStyle}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-muted small">No specific skills listed.</p>
                  )}
                </div>
              </div>

              <div className="view-group">
                <label style={labelStyle}>Job Description</label>
                <div style={{ 
                  background: "#f8fafc", 
                  padding: "1.5rem", 
                  borderRadius: "12px", 
                  marginTop: "12px", 
                  lineHeight: "1.7", 
                  color: "#334155",
                  whiteSpace: "pre-wrap",
                  border: "1px solid #e2e8f0"
                }}>
                  {job.description}
                </div>
              </div>

              <div style={{ marginTop: "3rem", display: "flex", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "2rem" }}>
                <button className="btn btn-primary" onClick={() => navigate(`/recruitment/vacancy-update?id=${job.id}`)}>
                  <i className="fa-solid fa-pen" /> Edit Vacancy
                </button>
                <button className="btn btn-ghost" onClick={() => navigate(-1)}>
                   Close View
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

const labelStyle = {
  fontSize: "11px",
  fontWeight: "700",
  textTransform: "uppercase",
  color: "#94a3b8",
  letterSpacing: "1px"
};

const textStyle = {
  fontSize: "16px",
  color: "#334155",
  marginTop: "8px",
  fontWeight: "600"
};

const skillStyle = {
  background: "#eff6ff",
  color: "#2563eb",
  padding: "8px 16px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: "600",
  border: "1px solid #dbeafe"
};

export default ViewVacancyPage;