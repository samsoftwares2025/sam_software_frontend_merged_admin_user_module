import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoaderOverlay from "../../../components/common/LoaderOverlay";
import { getPublicJobDetail } from "../../../api/admin/recruitment/job";

function PublicJobDetailPage() {
  const { company_slug, job_slug } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await getPublicJobDetail(company_slug, job_slug);
        if (data.success) {
          setJob(data.job);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        navigate(`/${company_slug}/jobs`);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [company_slug, job_slug, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  if (loading) return <LoaderOverlay />;

  return (
    <div className="public-portal-root">
      <style>{`
        .public-portal-root {
          background: #f8fafc;
          height: 100vh;
          width: 100vw;
          overflow-y: auto !important;
          overflow-x: hidden;
          scroll-behavior: smooth;
          position: fixed;
          top: 0; left: 0;
          font-family: 'Inter', sans-serif;
          color: #1e293b;
        }

        .inner-wrapper {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px 100px 20px;
        }

        .glass-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 30px;
          padding: 50px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
        }

        .job-title-hero {
          font-size: 2.8rem;
          line-height: 1.2;
          margin-bottom: 20px;
          color: #0f172a;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .badge-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 30px;
        }

        .info-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #f1f5f9;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 14px;
          color: #475569;
          font-weight: 600;
        }

        .description-box {
          line-height: 1.8;
          white-space: pre-wrap;
          color: #334155;
          font-size: 16px;
          background: #f8fafc;
          padding: 30px;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
        }

        .skills-tag {
          background: #eff6ff;
          color: #2563eb;
          padding: 8px 18px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 700;
          border: 1px solid #dbeafe;
        }

        .apply-btn-hover:hover {
          background-color: #1d4ed8 !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(37, 99, 235, 0.3) !important;
        }

        .apply-btn-hover:active {
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .glass-card { padding: 30px 20px; border-radius: 20px; }
          .job-title-hero { font-size: 1.8rem; }
          .inner-wrapper { padding: 20px 15px 100px 15px; }
        }
      `}</style>

      <div className="inner-wrapper">
        <button 
          onClick={() => navigate(`/${company_slug}/jobs`)} 
          style={backBtnStyle}
        >
          <i className="fa-solid fa-arrow-left" /> Back to All Jobs
        </button>

        {job && (
          <div className="glass-card">
            <header style={{ marginBottom: "40px" }}>
              <h1 className="job-title-hero">{job.title}</h1>
              <div className="badge-group">
                <div className="info-badge">
                  <i className="fa-solid fa-location-dot" style={{color: '#3b82f6'}}/> {job.location}
                </div>
                <div className="info-badge">
                  <i className="fa-solid fa-briefcase" style={{color: '#10b981'}}/> {job.type || "Full Time"}
                </div>
                <div className="info-badge" style={{background: '#fff7ed', color: '#c2410c'}}>
                  <i className="fa-solid fa-calendar" /> Posted on {formatDate(job.posted)}
                </div>
              </div>
            </header>

            <section style={{ marginBottom: "40px" }}>
              <h4 style={sectionHeadingStyle}>Required Expertise</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {job.skills && job.skills.length > 0 ? (
                  job.skills.map((s, i) => (
                    <span key={i} className="skills-tag">{s}</span>
                  ))
                ) : (
                  <span style={{color: '#94a3b8', fontSize: '14px'}}>General skills applied.</span>
                )}
              </div>
            </section>

            <section style={{ marginBottom: "40px" }}>
              <h4 style={sectionHeadingStyle}>The Role & Responsibilities</h4>
              <div className="description-box">
                {job.description}
              </div>
            </section>

            <div style={footerActionStyle}>
              <button 
                style={applyBtnStyle} 
                className="apply-btn-hover"
                // ✅ UPDATED LINK HERE
                onClick={() => navigate(`/${company_slug}/jobs/${job_slug}/apply`)}
              >
                Apply for this Position
              </button>
            </div>
          </div>
        )}

        <footer style={footerCopyrightStyle}>
          <p>© 2026 {company_slug.replace(/-/g, ' ').toUpperCase()} • Powered by Sam Softwares HRMS</p>
        </footer>
      </div>
    </div>
  );
}

const backBtnStyle = {
  background: "white", border: "1px solid #e2e8f0", color: "#475569",
  padding: "10px 20px", borderRadius: "12px", cursor: "pointer",
  fontSize: "14px", fontWeight: "700", marginBottom: "25px",
  display: "inline-flex", alignItems: "center", gap: "10px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
};

const sectionHeadingStyle = {
  fontSize: "13px", textTransform: "uppercase", letterSpacing: "1.5px",
  color: "#94a3b8", marginBottom: "20px", fontWeight: "800"
};

const footerActionStyle = {
  marginTop: "50px", paddingTop: "30px", borderTop: "1px solid #f1f5f9",
  display: "flex", justifyContent: "center"
};

const applyBtnStyle = {
  padding: "14px 40px", background: "#2563eb", color: "#fff",
  border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "700",
  cursor: "pointer", transition: "all 0.3s ease",
  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)", display: "inline-block"
};

const footerCopyrightStyle = {
  textAlign: 'center', marginTop: '60px', color: '#94a3b8', fontSize: '13px'
};

export default PublicJobDetailPage;