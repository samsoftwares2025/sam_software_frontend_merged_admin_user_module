import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import Sidebar from "../../../components/common/Sidebar";
import Header from "../../../components/common/Header";
import LoaderOverlay from "../../../components/common/LoaderOverlay";
import SuccessModal from "../../../components/common/SuccessModal";
import ErrorModal from "../../../components/common/ErrorModal";
import EditableSelect from "../../../components/admin/employee/EditableSelect";
import { selectStyles } from "../../../utils/selectStyles";
import { toSentenceCase } from "../../../utils/textFormatters"; // ✅ Used for formatting

import {
  getSkillSuggestions,
  fetchCategories,
  createJob,
  getCompanyDefaultLocation,
} from "../../../api/admin/recruitment/job";
import {
  getEmployementTypes_employee_mgmnt,
  createEmployementType,
} from "../../../api/admin/employement_type";

function AddJobPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "", 
    job_type: "",
    category_name: "",
    skills: [],
  });

  const [categoriesList, setCategoriesList] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [currentSkillInput, setCurrentSkillInput] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState([]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [cats, types, defaultLoc] = await Promise.all([
          fetchCategories(),
          getEmployementTypes_employee_mgmnt(),
          getCompanyDefaultLocation()
        ]);

        setCategoriesList(cats || []);
        setEmploymentTypes(types?.employment_types || types || []);
        
        // Pre-fill location
        setFormData(prev => ({
            ...prev,
            location: defaultLoc || ""
        }));

      } catch (err) {
        setErrorMsg("Failed to load form options.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  /* ================= SKILL HANDLERS ================= */
  const addSkill = (skillString) => {
    if (!skillString) return;
    const newSkills = skillString.split(",").map(s => s.trim()).filter(s => s !== "" && !formData.skills.includes(s));
    if (newSkills.length > 0) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, ...newSkills] }));
    }
    setCurrentSkillInput("");
    setSkillSuggestions([]);
  };

  const handleSkillInputChange = async (e) => {
    const value = e.target.value;
    if (value.includes(",")) { addSkill(value); return; }
    setCurrentSkillInput(value);
    if (value.length > 0) {
      try {
        const suggestions = await getSkillSuggestions(value);
        setSkillSuggestions(suggestions || []);
      } catch (err) { console.error(err); }
    } else { setSkillSuggestions([]); }
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
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
    if (!formData.category_name || !formData.job_type) {
      setErrorMsg("Please select both a category and a job type.");
      return;
    }
    setSaving(true);
    try {
      let finalSkills = [...formData.skills];
      const leftoverText = currentSkillInput.replace(/,/g, "").trim();
      if (leftoverText && !finalSkills.includes(leftoverText)) {
        finalSkills.push(leftoverText);
      }
      const finalPayload = { ...formData, skills: finalSkills };
      const res = await createJob(finalPayload);
      setSuccessMsg(res.message || "Job vacancy posted successfully!");
      setShowSuccess(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create job.");
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
          <div className="page-title"><h3>Post New Vacancy</h3></div>

          <div className="card">
            <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
              
              {/* Job Title with Sentence Case */}
              <div className="designation-page-form-row">
                <label className="required">Job Title</label>
                <input
                  type="text"
                  className="designation-page-form-input"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  onBlur={(e) => setFormData({ ...formData, title: toSentenceCase(e.target.value) })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="designation-page-form-row">
                  <label className="required">Category</label>
                  <CreatableSelect
                    isClearable
                    styles={selectStyles}
                    options={categoriesList.map(cat => ({ value: cat.job_category, label: cat.job_category }))}
                    value={formData.category_name ? { label: formData.category_name, value: formData.category_name } : null}
                    onChange={(opt) => setFormData({ ...formData, category_name: opt ? opt.value : "" })}
                  />
                </div>

                <div className="designation-page-form-row">
                  <label className="required">Job Type</label>
                  <EditableSelect
                    styles={selectStyles}
                    value={formData.job_type}
                    options={employmentTypes.map(et => ({ value: String(et.id), label: et.name }))}
                    onChange={(val) => setFormData({ ...formData, job_type: val })}
                    onCreate={async (name) => {
                      const res = await createEmployementType(name.trim());
                      setFormData({ ...formData, job_type: String(res.id) });
                    }}
                  />
                </div>
              </div>

              {/* Location with Sentence Case */}
              <div className="designation-page-form-row">
                <label className="required">Location</label>
                <input
                  type="text"
                  className="designation-page-form-input"
                  required
                  placeholder="e.g. City, Country"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  onBlur={(e) => setFormData({ ...formData, location: toSentenceCase(e.target.value) })}
                />
              </div>

              <div className="designation-page-form-row">
                <label>Required Skills</label>
                <div className="skill-input-container">
                  <input
                    list="skill-datalist"
                    type="text"
                    className="designation-page-form-input"
                    placeholder="Type skill and press Enter..."
                    value={currentSkillInput}
                    onChange={handleSkillInputChange}
                    onKeyDown={handleSkillKeyDown}
                  />
                  <datalist id="skill-datalist">
                    {skillSuggestions.map((s, index) => (
                      <option key={index} value={s.label || s.skill_name} />
                    ))}
                  </datalist>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {formData.skills.map((skill, index) => (
                    <span key={index} className="skill-tag" style={{ background: "#e0e7ff", color: "#4338ca", padding: "4px 10px", borderRadius: "16px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "5px" }}>
                      {skill}
                      <button type="button" onClick={() => removeSkill(index)} style={{ border: "none", background: "none", cursor: "pointer", color: "#4338ca" }}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Job Description with Sentence Case */}
              <div className="designation-page-form-row">
                <label className="required">Job Description</label>
                <textarea
                  className="designation-page-form-input"
                  required
                  style={{ minHeight: "150px" }}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  onBlur={(e) => setFormData({ ...formData, description: toSentenceCase(e.target.value) })}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>Post Job</button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

export default AddJobPage;