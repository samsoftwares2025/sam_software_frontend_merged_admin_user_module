import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import Sidebar from "../../../components/common/Sidebar";
import Header from "../../../components/common/Header";
import LoaderOverlay from "../../../components/common/LoaderOverlay";
import SuccessModal from "../../../components/common/SuccessModal";
import ErrorModal from "../../../components/common/ErrorModal";
import EditableSelect from "../../../components/admin/employee/EditableSelect";
import { selectStyles } from "../../../utils/selectStyles";
import { toSentenceCase } from "../../../utils/textFormatters";

import {
  getSkillSuggestions,
  fetchCategories,
  getVaccancyById,
  updateVaccancy,
} from "../../../api/admin/recruitment/job";
import {
  getEmployementTypes_employee_mgmnt,
  createEmployementType,
} from "../../../api/admin/employement_type";

function UpdateVaccancyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const jobId = queryParams.get("id");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    job_type: "",
    category_name: "",
    skills: [], // Existing skills should land here
    is_active: true,
  });

  const [categoriesList, setCategoriesList] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [currentSkillInput, setCurrentSkillInput] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState([]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  /* ================= FETCH DATA ================= */
  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const loadData = async () => {
      if (!jobId) return;

      setLoading(true);
      try {
        const [cats, types, jobDetails] = await Promise.all([
          fetchCategories(),
          getEmployementTypes_employee_mgmnt(),
          getVaccancyById(jobId)
        ]);

        setCategoriesList(cats || []);
        setEmploymentTypes(types?.employment_types || types || []);

        setFormData({
          title: jobDetails.title || "",
          description: jobDetails.description || "",
          location: jobDetails.location || "",
          job_type: String(jobDetails.job_type_id || jobDetails.job_type),
          category_name: jobDetails.category_name || "",
          // ✅ Map the skills from the API response
          skills: Array.isArray(jobDetails.skills) ? jobDetails.skills : [], 
          is_active: jobDetails.is_active,
        });
      } catch (err) {
        setErrorMsg("Failed to load vacancy details.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [jobId]);

  /* ================= SKILL HANDLERS ================= */
  const addSkill = (skillString) => {
    if (!skillString) return;

    const newSkills = skillString
      .split(",")
      .map(s => s.trim())
      .filter(s => s !== "" && !formData.skills.includes(s));

    if (newSkills.length > 0) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, ...newSkills],
      }));
    }
    
    setCurrentSkillInput("");
    setSkillSuggestions([]);
  };

  const handleSkillInputChange = async (e) => {
    const value = e.target.value;
    if (value.includes(",")) {
      addSkill(value);
      return;
    }
    setCurrentSkillInput(value);

    if (value.length > 0) {
      try {
        const suggestions = await getSkillSuggestions(value);
        setSkillSuggestions(suggestions || []);
      } catch (err) { console.error(err); }
    } else {
      setSkillSuggestions([]);
    }
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(currentSkillInput);
    }
  };

  const removeSkill = (index) => {
    const newSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: newSkills });
  };

  /* ================= FORM SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let finalSkills = [...formData.skills];
      const leftoverText = currentSkillInput.replace(/,/g, "").trim();
      if (leftoverText && !finalSkills.includes(leftoverText)) {
        finalSkills.push(leftoverText);
      }

      const finalPayload = { ...formData, skills: finalSkills };
      const res = await updateVaccancy(jobId, finalPayload);
      setSuccessMsg(res.message || "Vacancy updated successfully!");
      setShowSuccess(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update vacancy.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {(loading || saving) && <LoaderOverlay />}
      {errorMsg && <ErrorModal message={errorMsg} onClose={() => setErrorMsg("")} />}
      {showSuccess && <SuccessModal message={successMsg} onClose={() => navigate("/recruitment/vacancies")} />}

      <div className="container">
        <Sidebar />
        <main className="main">
          <Header />
          <div className="page-title"><h3>Update Vacancy</h3></div>

          <div className="card">
            <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
              
              {/* Job Title */}
              <div className="designation-page-form-row">
                <label className="required">Job Title</label>
                <input type="text" className="designation-page-form-input" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>

              {/* Category & Job Type */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="designation-page-form-row">
                  <label className="required">Category</label>
                  <CreatableSelect isClearable styles={selectStyles} options={categoriesList.map(cat => ({ value: cat.job_category, label: cat.job_category }))} value={formData.category_name ? { label: formData.category_name, value: formData.category_name } : null} onChange={(opt) => setFormData({ ...formData, category_name: opt ? opt.value : "" })} />
                </div>
                <div className="designation-page-form-row">
                  <label className="required">Job Type</label>
                  <EditableSelect styles={selectStyles} value={formData.job_type} options={employmentTypes.map(et => ({ value: String(et.id), label: et.name }))} onChange={(val) => setFormData({ ...formData, job_type: val })} onCreate={async (name) => {
                      const res = await createEmployementType(name.trim());
                      setFormData({ ...formData, job_type: String(res.id) });
                    }}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="designation-page-form-row">
                <label className="required">Location</label>
                <input type="text" className="designation-page-form-input" required value={formData.location} onBlur={(e) => setFormData({ ...formData, location: toSentenceCase(e.target.value) })} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>

              {/* Status */}
              <div className="designation-page-form-row">
                <label>Status</label>
                <select className="designation-page-form-input" value={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.value === "true"})}>
                  <option value="true">Active</option>
                  <option value="false">Closed / Inactive</option>
                </select>
              </div>

              {/* Required Skills - Screenshot Match */}
              <div className="designation-page-form-row">
                <label>Required Skills (Press Enter or use comma to add)</label>
                <div className="skill-input-container">
                  <input
                    type="text"
                    className="designation-page-form-input"
                    placeholder="Type skill and press Enter..."
                    value={currentSkillInput}
                    onChange={handleSkillInputChange}
                    onKeyDown={handleSkillKeyDown}
                  />
                </div>

                {/* ✅ This section maps the skills into the blue bubbles from your screenshot */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "12px" }}>
                  {formData.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      style={{
                        background: "#e8edff", // Light blue background
                        color: "#4d5ce6",      // Blue text
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontWeight: "500",
                        border: "1px solid #d0d7ff"
                      }}
                    >
                      {skill}
                      <button 
                        type="button" 
                        onClick={() => removeSkill(index)} 
                        style={{ border: "none", background: "none", cursor: "pointer", color: "#4d5ce6", fontSize: "18px", padding: 0, lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Job Description */}
              <div className="designation-page-form-row">
                <label className="required">Job Description</label>
                <textarea className="designation-page-form-input" required style={{ minHeight: "150px" }} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>Save Changes</button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

export default UpdateVaccancyPage;