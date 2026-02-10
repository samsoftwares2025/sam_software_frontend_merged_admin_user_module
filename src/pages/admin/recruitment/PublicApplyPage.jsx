import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoaderOverlay from "../../../components/common/LoaderOverlay";
// ✅ Import the new helper
import { submitPublicApplication } from "../../../api/admin/recruitment/job"; 

function PublicApplyPage() {
  const { company_slug, job_slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    cover_letter: "",
    cv: null,
  });

  /* ================= SUBMIT HANDLER ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cv) {
      alert("Please upload your CV.");
      return;
    }

    setLoading(true);

    // Prepare FormData for the API helper
    const data = new FormData();
    data.append("full_name", formData.full_name);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("cover_letter", formData.cover_letter);
    data.append("cv", formData.cv);

    try {
      // ✅ Use the helper instead of axios.post
      const resp = await submitPublicApplication(company_slug, job_slug, data);
      
      if (resp.success) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert(err.response?.data?.message || "Submission failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="public-portal-root">
        <div className="inner-wrapper" style={{textAlign: 'center'}}>
          <div className="glass-card">
            <i className="fa-solid fa-circle-check" style={{fontSize: '4rem', color: '#10b981', marginBottom: '20px'}} />
            <h1 style={{fontWeight: '900', color: '#1e293b'}}>Application Sent!</h1>
            <p style={{color: '#64748b', marginBottom: '30px', fontSize: '1.1rem'}}>
              Thank you for applying. We have received your profile and will be in touch shortly.
            </p>
            <button 
              className="apply-btn-hover" 
              style={backToJobsBtn} 
              onClick={() => navigate(`/${company_slug}/jobs`)}
            >
              Return to Careers Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-portal-root">
      {loading && <LoaderOverlay />}
      <style>{`
        .public-portal-root { 
            background: #f8fafc; 
            height: 100vh; 
            width: 100vw; 
            overflow-y: auto; 
            position: fixed; 
            top: 0; left: 0; 
            font-family: 'Inter', sans-serif; 
        }
        .inner-wrapper { max-width: 700px; margin: 0 auto; padding: 60px 20px; }
        .glass-card { 
            background: white; 
            border-radius: 30px; 
            padding: 45px; 
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05); 
            border: 1px solid #e2e8f0; 
        }
        .form-group { margin-bottom: 24px; }
        .form-label { display: block; font-weight: 700; font-size: 14px; margin-bottom: 10px; color: #334155; }
        .form-input { 
            width: 100%; 
            padding: 14px 18px; 
            border-radius: 12px; 
            border: 1px solid #e2e8f0; 
            outline: none; 
            font-size: 15px; 
            transition: 0.3s;
        }
        .form-input:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
        .apply-btn-hover:hover { background-color: #1d4ed8 !important; transform: translateY(-2px); }
      `}</style>

      <div className="inner-wrapper">
        <button onClick={() => navigate(-1)} style={cancelBtnStyle}>
          <i className="fa-solid fa-arrow-left" /> Cancel Application
        </button>

        <div className="glass-card">
          <h2 style={{fontWeight: '900', color: '#0f172a', marginBottom: '10px'}}>Join the Team</h2>
          <p style={{color: '#64748b', marginBottom: '35px'}}>Tell us a bit about yourself and upload your latest CV.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-input" placeholder="Enter your full name" required 
                onChange={e => setFormData({...formData, full_name: e.target.value})} />
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
               <div className="form-group">
                 <label className="form-label">Email Address *</label>
                 <input type="email" className="form-input" placeholder="email@example.com" required 
                   onChange={e => setFormData({...formData, email: e.target.value})} />
               </div>
               <div className="form-group">
                 <label className="form-label">Phone Number *</label>
                 <input type="tel" className="form-input" placeholder="+1 234 567 890" required 
                   onChange={e => setFormData({...formData, phone: e.target.value})} />
               </div>
            </div>

            <div className="form-group">
              <label className="form-label">Upload CV (PDF preferred) *</label>
              <input type="file" className="form-input" required accept=".pdf,.doc,.docx"
                onChange={e => setFormData({...formData, cv: e.target.files[0]})} 
                style={{padding: '10px'}}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cover Letter (Optional)</label>
              <textarea className="form-input" style={{height: '140px', resize: 'none'}} 
                placeholder="Briefly describe why you are a good fit..."
                onChange={e => setFormData({...formData, cover_letter: e.target.value})} />
            </div>

            <button type="submit" className="apply-btn-hover" style={submitBtnStyle}>
              Submit My Application
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ================= INLINE STYLES ================= */
const cancelBtnStyle = { 
    background: "none", border: "none", color: "#64748b", 
    cursor: "pointer", fontWeight: "700", marginBottom: "25px",
    fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px'
};

const submitBtnStyle = { 
    width: '100%', padding: '18px', background: '#2563eb', color: '#fff', 
    border: 'none', borderRadius: '15px', fontWeight: '800', fontSize: '16px', 
    cursor: 'pointer', marginTop: '10px', transition: '0.3s',
    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
};

const backToJobsBtn = {
    padding: '14px 30px', background: '#2563eb', color: '#fff',
    border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer'
};

export default PublicApplyPage;