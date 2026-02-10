import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import LoaderOverlay from "../../../components/common/LoaderOverlay";
import { getPublicCompanyJobs } from "../../../api/admin/recruitment/job";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://hr.samsoftwares.com";

function PublicJobListPage() {
  const { company_slug } = useParams();
  const [data, setData] = useState({ company_name: "", logo: "", jobs: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Search and Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  /* ================= FETCH DATA FROM BE ================= */
  const fetchJobs = async () => {
    // We don't use full LoaderOverlay for search to prevent flickering, 
    // but you can if you prefer.
    try {
      const resp = await getPublicCompanyJobs(company_slug, searchTerm, sortOrder);
      if (resp.success) {
        setData(resp);
        setError(false);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Effect for initial load and Sort change
  useEffect(() => {
    fetchJobs();
  }, [company_slug, sortOrder]);

  // Effect for Search with Debounce (Wait 500ms after typing stops)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchJobs();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  if (loading && !data.company_name) return <LoaderOverlay />;

  return (
    <div className="public-portal-root">
      <style>{`
        .public-portal-root {
          background: #f8fafc;
          height: 100vh;
          width: 100vw;
          overflow-y: auto;
          overflow-x: hidden;
          position: fixed;
          top: 0; left: 0;
          font-family: 'Inter', sans-serif;
        }
        .inner-wrapper { max-width: 900px; margin: 0 auto; padding: 60px 20px 100px 20px; }
        .glass-header {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 30px;
          padding: 50px 30px;
          text-align: center;
          margin-bottom: 40px;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
        }
        .search-row {
          display: flex;
          gap: 15px;
          margin-bottom: 40px;
        }
        .search-container { position: relative; flex: 1; }
        .search-input {
          width: 100%;
          padding: 15px 15px 15px 50px;
          border-radius: 15px;
          border: 1px solid #e2e8f0;
          font-size: 16px;
          outline: none;
          transition: 0.3s;
        }
        .search-input:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
        .search-icon { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        
        .sort-select {
          padding: 0 20px;
          border-radius: 15px;
          border: 1px solid #e2e8f0;
          background: white;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
        }
        .job-card {
          display: flex;
          background: white;
          padding: 25px;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          text-decoration: none;
          color: inherit;
          margin-bottom: 15px;
          transition: 0.3s;
          align-items: center;
        }
        .job-card:hover { transform: translateY(-3px); border-color: #2563eb; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .badge { background: #f1f5f9; padding: 6px 12px; border-radius: 8px; font-size: 13px; color: #475569; font-weight: 500; display: flex; align-items: center; gap: 6px; }
        
        @media (max-width: 768px) {
          .search-row { flex-direction: column; }
          .sort-select { padding: 15px; }
          .job-card { flex-direction: column; align-items: flex-start; }
          .arrow-icon { display: none; }
        }
      `}</style>

      <div className="inner-wrapper">
        <header className="glass-header">
          {data.logo ? (
            <img src={data.logo.startsWith('http') ? data.logo : `${BASE_URL}${data.logo}`} alt="logo" style={logoStyle} />
          ) : (
            <div style={logoPlaceholder}>{data.company_name?.charAt(0)}</div>
          )}
          <h1 style={companyNameStyle}>{data.company_name}</h1>
          <p style={subtitleStyle}>Explore our current openings and join our team.</p>
        </header>

        <div className="search-row">
          <div className="search-container">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input 
              className="search-input"
              type="text" 
              placeholder="Search job title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="sort-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <div style={listContainer}>
          <h3 style={{ marginBottom: '20px', fontWeight: '800' }}>
            Open Positions ({data.jobs.length})
          </h3>

          {data.jobs.length === 0 ? (
            <div style={emptyState}>
              <p>No jobs found for "{searchTerm}"</p>
            </div>
          ) : (
            data.jobs.map((job) => (
              <Link key={job.slug} to={`/${company_slug}/jobs/${job.slug}`} className="job-card">
                <div style={{ flex: 1 }}>
                  <h4 style={jobTitleStyle}>{job.title}</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <div className="badge"><i className="fa-solid fa-location-dot" /> {job.location}</div>
                    <div className="badge"><i className="fa-solid fa-briefcase" /> {job.type}</div>
                    <div className="badge" style={{ background: '#ecfdf5', color: '#059669' }}>
                      <i className="fa-solid fa-calendar" /> {formatDate(job.posted)}
                    </div>
                  </div>
                </div>
                <div className="arrow-icon" style={arrowCircle}>
                  <i className="fa-solid fa-chevron-right" />
                </div>
              </Link>
            ))
          )}
        </div>

        <footer style={footerStyle}>
          <p>Powered by <strong>Sam Softwares HRMS</strong></p>
        </footer>
      </div>
    </div>
  );
}

/* ================= THEME STYLES ================= */
const logoStyle = { height: "65px", width: "auto", borderRadius: "12px", marginBottom: "15px" };
const logoPlaceholder = { width: "70px", height: "70px", background: "#2563eb", color: "#fff", borderRadius: "15px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: "800", margin: "0 auto 15px" };
const companyNameStyle = { color: "#0f172a", fontSize: "2.2rem", fontWeight: "900", margin: "0" };
const subtitleStyle = { color: "#64748b", marginTop: "8px", fontSize: "1.1rem" };
const listContainer = { marginTop: "10px" };
const jobTitleStyle = { fontSize: "1.3rem", fontWeight: "700", color: "#1e293b", margin: "0 0 12px 0" };
const arrowCircle = { width: "40px", height: "40px", borderRadius: "50%", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" };
const emptyState = { textAlign: "center", padding: "50px", background: "white", borderRadius: "20px", color: "#94a3b8", border: "1px dashed #e2e8f0" };
const footerStyle = { textAlign: "center", marginTop: "80px", color: "#94a3b8", fontSize: "0.9rem", borderTop: "1px solid #e2e8f0", paddingTop: "30px" };

export default PublicJobListPage;