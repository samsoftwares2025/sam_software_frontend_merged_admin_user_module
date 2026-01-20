import "../../assets/styles/CompanyRegistrationPage.css";
import React, { useState, useRef, useEffect } from "react";
import {
  getAllCountries,
  getStatesByCountry,
  getCitiesByState
} from "../../api/Companyregistration";



import { companyRegister, checkExists } from "../../api/Companyregistration";
import { getIndustries } from "../../api/Companyregistration";

import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Select from "react-select";



const CompanyRegistration = () => {
  const [form, setForm] = useState({
    company_name: "",
    registration_number: "",
    industry: [],

    company_size: "",
    website: "",
    company_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    company_email: "",
    company_phone: "",
    contact_name: "",
    designation: "",
    contact_email: "",
    contact_phone: "",
    gst_vat_number: "",
    pan_tax_id: "",
    currency: "",
    billing_email: "",
    admin_email: "",
    admin_phone: "",
    password: "",
    confirm_password: "",
    terms: true,
    logo: null,
  });

  const [errors, setErrors] = useState({});
  const [validating, setValidating] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [industries, setIndustries] = useState([]);
  const [loadingIndustries, setLoadingIndustries] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // LOCATION STATES
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [manualCountry, setManualCountry] = useState(false);
  const [manualState, setManualState] = useState(false);
  const [manualCity, setManualCity] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // REMOVED: const [personalInfo, setPersonalInfo] = useState({...});
  // We'll use form state directly for all location data

// 🔹 Build industry options for react-select
const industryOptions = industries.map((item) => ({
  value: item.id,
  label: item.name,
}));

  const mode = "create";

  const backendMap = {
    company_name: "name",
    registration_number: "cin_number",
    company_email: "email",
    contact_email: "email",
    billing_email: "finance_email",
    admin_email: "email",
    company_phone: "phone",
    admin_phone: "phone",
    gst_vat_number: "gst_vat",
    pan_tax_id: "tax",
    website: "website"
  };

  /* ---------------------- VALIDATION FUNCTIONS ---------------------- */
  
  // GST Validation (Indian GST format)
  const isValidGST = (gst) => {
    if (!gst) return true;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst.toUpperCase());
  };

  // PAN Validation (Indian PAN format)
  const isValidPAN = (pan) => {
    if (!pan) return true;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
  };

  // CIN Validation (Indian CIN format)
  const isValidCIN = (cin) => {
    if (!cin) return true;
    const cinRegex = /^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
    return cinRegex.test(cin.toUpperCase());
  };

  // Website URL Validation
  const isValidWebsite = (url) => {
    if (!url) return true;
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  // Email Validation
  const isValidEmail = (email) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /* ---------------------- FIELD VALIDATION ---------------------- */
  const validateField = (name, value) => {
    let msg = "";
    const required = [
      "company_name",
      "registration_number",
      "industry",
      "company_size",
      "contact_name",
      "contact_email",
      "password",
      "confirm_password",
      "currency",
      "admin_email",
    ];

    


    if (required.includes(name)) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      msg = "This field is required";
    }
  } else if (!value || !String(value).trim()) {
    msg = "This field is required";
  }
}

    // Email validation for all email fields
    if (["contact_email", "admin_email", "billing_email", "company_email"].includes(name) && value) {
      if (!isValidEmail(value)) {
        msg = "Invalid email format";
      }
    }

    // Contact phone validation (regular phone)
    if (name === "contact_phone" && value) {
      const clean = value.replace(/\D/g, "");
      if (!/^\d{7,15}$/.test(clean)) msg = "Phone must be 7–15 digits";
    }

    // Company phone validation (with country code)
    if (name === "company_phone" && value) {
      if (!isValidPhoneNumber(value)) {
        msg = "Invalid phone number for selected country";
      }
    }

    // Admin phone validation (with country code)
    if (name === "admin_phone" && value) {
      if (!isValidPhoneNumber(value)) {
        msg = "Invalid phone number for selected country";
      }
    }

    // Password validation
    if (name === "password" && value.length < 8) {
      msg = "Password must be minimum 8 characters";
    }

    // Confirm password validation
    if (name === "confirm_password" && value !== form.password) {
      msg = "Passwords do not match";
    }

    // GST validation
    if (name === "gst_vat_number" && value && !isValidGST(value)) {
      msg = "Invalid GST format (e.g., 27AAAAA0000A1Z5)";
    }

    // PAN validation
    if (name === "pan_tax_id" && value && !isValidPAN(value)) {
      msg = "Invalid PAN format (e.g., ABCDE1234F)";
    }

    // CIN/Registration validation
    if (name === "registration_number" && value && !isValidCIN(value)) {
      msg = "Invalid CIN format (e.g., U74999TN2014PTC096978)";
    }

    // Website validation
    if (name === "website" && value && !isValidWebsite(value)) {
      msg = "Invalid website URL";
    }

    // Logo validation
    if (name === "logo" && value) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(value.type)) {
        msg = "Only JPG, PNG, or GIF files are allowed";
      } else if (value.size > maxSize) {
        msg = "File size must be less than 5MB";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: msg }));
    return msg === "";
  };

  /* ---------------------- LIVE VALIDATION + BACKEND CHECK ---------------------- */
  const timerRef = useRef({});

  const startDuplicateCheck = (name, value) => {
    const backendField = backendMap[name];
    if (!backendField || !value) return;

    if (timerRef.current[name]) {
      clearTimeout(timerRef.current[name]);
    }

    setValidating((prev) => ({ ...prev, [name]: true }));

    timerRef.current[name] = setTimeout(async () => {
      try {
        const res = await checkExists(backendField, value);

        setErrors((prev) => ({
          ...prev,
          [name]: res.exists
            ? `${name.replace(/_/g, " ")} already exists`
            : "",
        }));
      } catch (err) {
        console.error(`Duplicate check failed for ${name}`, err);
      } finally {
        setValidating((prev) => ({ ...prev, [name]: false }));
      }
    }, 600);
  };

  // Handle normal input change
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    const val = type === "file" ? files[0] : value;

    // Update form
    setForm((prev) => ({ ...prev, [name]: val }));

    // Frontend validation
    const ok = validateField(name, val);
    if (!ok) return;

    // Backend duplicate check ONLY for mapped fields
    if (backendMap[name]) {
      startDuplicateCheck(name, val);
    }
  };

useEffect(() => {
  if (!form.country || manualCountry) {
    setStateList([]);
    return;
  }

  setLoadingStates(true);

  getStatesByCountry(form.country)
    .then((res) => {
      const list = res.map((s) => ({
        label: s.state_name,
        value: s.state_name,
      }));

      list.push({ label: "➕ Enter manually", value: "__manual" });

      setStateList(list);
    })
    .catch((error) => {
      console.error("Error loading states:", error);
      setStateList([]);
    })
    .finally(() => setLoadingStates(false));
}, [form.country, manualCountry]);

  // Handle phone inputs
  const handlePhoneChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));

    if (value && !isValidPhoneNumber(value)) {
      setErrors((prev) => ({ ...prev, [name]: "Invalid phone number" }));
      return;
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Backend duplicate check for phone fields
    if (backendMap[name]) {
      startDuplicateCheck(name, value);
    }
  };

  // Handle location dropdown changes
  const handleLocationChange = (name, value, isManual = false) => {
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };
      
      // Reset dependent fields when parent changes
      if (name === "country") {
        newForm.state = "";
        newForm.city = "";
        setManualState(false);
        setManualCity(false);
        setStateList([]);
        setCityList([]);
      } else if (name === "state") {
        newForm.city = "";
        setManualCity(false);
        setCityList([]);
      }
      
      return newForm;
    });

    // Set manual flags
    if (name === "country") {
      setManualCountry(isManual);
    } else if (name === "state") {
      setManualState(isManual);
    } else if (name === "city") {
      setManualCity(isManual);
    }
  };

  /* ---------------------- SUBMIT FORM ---------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    let hasErrors = false;
    const fieldNames = Object.keys(form);
    
    for (const fieldName of fieldNames) {
      if (fieldName === "terms") continue;
      
      const value = form[fieldName];
      const isValid = validateField(fieldName, value);
      
      if (!isValid && (fieldName !== "logo" || value)) {
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrorMessage("Please fix all highlighted errors before submitting.");
      return;
    }

    // If ANY error exists, block submission
    if (Object.values(errors).some((msg) => msg !== "")) {
      setErrorMessage("Please fix all highlighted errors before submitting.");
      return;
    }

    if (!form.terms) {
      setErrorMessage("You must agree to the terms and conditions.");
      return;
    }

    try {
      const response = await companyRegister(form);
      if (response.success) {
        setSuccessMessage("Company Registered Successfully!");
        setShowSuccessModal(true);
        localStorage.setItem("token", response.token);
        localStorage.setItem("user_id", response.user_id);
        localStorage.setItem("company_id", response.company_id);
        return;
      }

      // Handle backend errors
      const msg = response.message?.toLowerCase() || "";
      if (msg.includes("company") && msg.includes("exists"))
        setErrors((p) => ({ ...p, company_name: "Company already exists" }));
      if (msg.includes("cin") && msg.includes("exists"))
        setErrors((p) => ({ ...p, registration_number: "CIN already exists" }));
      if (msg.includes("gst") && msg.includes("exists"))
        setErrors((p) => ({ ...p, gst_vat_number: "GST already exists" }));
      if (msg.includes("pan") && msg.includes("exists"))
        setErrors((p) => ({ ...p, pan_tax_id: "PAN already exists" }));
      if (msg.includes("email") && msg.includes("exists"))
        setErrors((p) => ({ ...p, company_email: "Email already exists" }));
      if (msg.includes("website") && msg.includes("exists"))
        setErrors((p) => ({ ...p, website: "Website already exists" }));
      
    } catch (err) {
      if (err.response) {
        setErrorMessage(err.response.data.message || "Validation error occurred.");
      } else {
        setErrorMessage("Network Error. Please check your connection.");
      }
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    window.location.reload(); // reloads the same page
  };

  useEffect(() => {
    const loadIndustries = async () => {
      try {
        const res = await getIndustries();

        if (res?.success && Array.isArray(res.industries)) {
          setIndustries(res.industries);
        } else {
          console.warn("Industry list missing or invalid:", res);
        }
      } catch (err) {
        console.error("Error loading industries:", err);
      } finally {
        setLoadingIndustries(false);
      }
    };

    loadIndustries();
  }, []);

  useEffect(() => {
    if (showSuccessModal || errorMessage) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [showSuccessModal, errorMessage]);

  /** Load Countries */
  useEffect(() => {
    setLoadingCountries(true);
    getAllCountries().then((res) => {
      const list = res.map((c) => ({
        label: c.country_name,
        value: c.country_name,
      }));
      list.push({ label: "Enter manually", value: "__manual" });
      setCountryList(list);
    }).catch(err => {
      console.error("Error loading countries:", err);
    }).finally(() => {
      setLoadingCountries(false);
    });
  }, []);

 useEffect(() => {
  // Debounce to avoid race conditions when react-select sends null → value
  const timer = setTimeout(() => {

    // 🔒 If state or country is missing OR manual entry is active → stop
    if (!form.state || !form.country || manualState) {
      setCityList([]);
      return;
    }

    setLoadingCities(true);

    getCitiesByState(form.country, form.state)
      .then((res) => {
        // Normalize response (backend may return array OR object)
        const arr = Array.isArray(res)
          ? res
          : res && Array.isArray(res.cities)
          ? res.cities
          : [];

        // Build react-select options
        const options = arr.map((city) => ({
          label: city,
          value: city,
        }));

        // Add manual entry option
        options.push({ label: "➕ Enter manually", value: "__manual" });

        setCityList(options);
      })
      .catch((err) => {
        console.error("Error loading cities:", err);
        setCityList([]);
      })
      .finally(() => {
        setLoadingCities(false);
      });

  }, 80); // 80ms debounce is PERFECT for react-select

  // Cleanup
  return () => clearTimeout(timer);

}, [form.state, form.country, manualState]);

  return (
    <div className="page-wrapper">
      {/* ✅ SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-card success">
            <div className="success-icon">
              <i className="fa-solid fa-circle-check"></i>
            </div>

            <h2>Registration Successful</h2>
            <p>{successMessage}</p>

            <button className="modal-btn" onClick={handleModalClose}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* ❌ ERROR MODAL */}
      {errorMessage && (
        <div className="modal-overlay">
          <div className="modal-card error">
            <div className="error-icon">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>

            <h2>⚠️ Validation Error</h2>
            <p>{errorMessage}</p>

            <button className="modal-btn" onClick={() => setErrorMessage("")}>
              OK
            </button>
          </div>
        </div>
      )}

      <div className="login-container">
        {/* LEFT PANEL */}
        <div className="login-left">
          <h1>
            Onboard Your Company
            <br />
            To HR Partner
          </h1>
          <p>
            Streamline hiring, payroll, and employee engagement in one powerful platform designed for modern teams.
          </p>
          <div className="features">
            <div className="feature-item">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>End-to-end HR automation</span>
            </div>
            <div className="feature-item">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Finance &amp; payroll ready</span>
            </div>
            <div className="feature-item">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Secure, compliant &amp; scalable</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL – COMPANY REGISTRATION FORM */}
        <div className="login-right">
          <div className="login-header">
            <h2>Company Registration</h2>
            <p>Create your organization account to start using HR Partner</p>
          </div>
          <form onSubmit={handleSubmit}>
            {/* COMPANY DETAILS */}
            <div className="section-title">Company Details</div>
         
            <div className="input-group">
              <label htmlFor="companyName">Company Name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="companyName"
                  name="company_name"
                  placeholder="Ex: Acme Technologies Pvt. Ltd."
                  value={form.company_name}
                  onChange={handleChange}
                  required
                  className={errors.company_name ? "input-error" : ""}
                />
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 10l9-7 9 7v7a2 2 0 01-2 2h-3m-8 0H5a2 2 0 01-2-2v-7z"
                  />
                </svg>
              </div>
              {validating.company_name && (
                <span className="validating-text">Checking availability...</span>
              )}
              {errors.company_name && (
                <span className="error-text">{errors.company_name}</span>
              )}
            </div>

            <div className="form-row">
              <div className="input-group">
                <label htmlFor="registrationNumber">Registration / CIN Number</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="registrationNumber"
                    name="registration_number"
                    placeholder="U74999TN2014PTC096978"
                    value={form.registration_number}
                    onChange={handleChange}
                    required
                    className={errors.registration_number ? "input-error" : ""}
                  />
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m-6 4h6m-9 4h3m4 0h3M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
                  </svg>
                </div>
                {validating.registration_number && <span className="validating-text">Checking...</span>}
                {errors.registration_number && <span className="error-text">{errors.registration_number}</span>}
              </div>

<div className="input-group">
  <label>Industry</label>

  <Select
    isMulti
    options={industryOptions}
    value={industryOptions.filter(opt =>
      form.industry.includes(opt.value)
    )}
    onChange={(selected) =>
      setForm({ ...form, industry: selected.map(opt => opt.value) })
    }
    placeholder="Select industries"
    classNamePrefix="rs"
    className={errors.industry ? "rs-error" : ""}
  />

  {errors.industry && (
    <span className="error-text">{errors.industry}</span>
  )}
</div>


          
            </div>

            <div className="form-row">
              <div className="input-group">
                <label htmlFor="companySize">Company Size</label>
                <div className="input-wrapper">
                  <select
                    id="companySize"
                    name="company_size"
                    value={form.company_size}
                    onChange={handleChange}
                    required
                    className={errors.company_size ? "input-error" : ""}
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {errors.company_size && <span className="error-text">{errors.company_size}</span>}
              </div>
              
              <div className="input-group">
                <label htmlFor="website">Company Website</label>
                <div className="input-wrapper">
                  <input
                    type="url"
                    id="website"
                    name="website"
                    placeholder="https://example.com"
                    value={form.website}
                    onChange={handleChange}
                    className={errors.website ? "input-error" : ""}
                  />
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.5c4.142 0 7.5 3.358 7.5 7.5s-3.358 7.5-7.5 7.5S4.5 16.142 4.5 12 7.858 4.5 12 4.5zM9 12h6m-3-3v6" />
                  </svg>
                </div>
                {validating.website && <span className="validating-text">Checking...</span>}
                {errors.website && <span className="error-text">{errors.website}</span>}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="logo">Company Logo</label>
              <div className="file-input-wrapper">
                <div className={`file-input-container ${form.logo ? 'has-file' : ''}`}>
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    accept=".jpg,.jpeg,.png,.gif"
                    onChange={handleChange}
                  />
                  <div className="file-input-display">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-6l-4-4m0 0l-4 4m4-4v12"
                      />
                    </svg>
                    <span className="file-input-text">
                      {form.logo ? form.logo.name : "Choose logo file (JPG, PNG, GIF)"}
                    </span>
                    <span className="file-browse-btn">Browse</span>
                  </div>
                </div>
              </div>
              {errors.logo && <span className="error-text">{errors.logo}</span>}
            </div>

            <div className="form-row">
              <div className="input-group">
                <label htmlFor="companyEmail">Company Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="companyEmail"
                    name="company_email"
                    placeholder="info@company.com"
                    value={form.company_email}
                    onChange={handleChange}
                    required
                    className={errors.company_email ? "input-error" : ""}
                  />
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                {validating.company_email && <span className="validating-text">Checking availability...</span>}
                {errors.company_email && <span className="error-text">{errors.company_email}</span>}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="companyAddress">Registered Address</label>
              <div className="input-wrapper">
                <textarea
                  id="companyAddress"
                  name="company_address"
                  placeholder="Street, building, area"
                  rows={2}
                  value={form.company_address}
                  onChange={handleChange}
                  className={errors.company_address ? "input-error" : ""}
                />
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" />
                </svg>
              </div>
              {errors.company_address && <span className="error-text">{errors.company_address}</span>}
            </div>

            {/* LOCATION SECTION - FIXED */}
            <div className="form-grid" style={{ marginTop: 20 }}>
              {/* COUNTRY */}
              <div className="form-group">
                <label className="form-label required">Country</label>
                {!manualCountry ? (
                  <Select
                    options={[...countryList, { label: "➕ Enter manually", value: "__manual" }]}
                    placeholder={loadingCountries ? "Loading countries..." : "Search country..."}
                    isLoading={loadingCountries}
                    value={countryList.find((c) => c.value === form.country) || null}
                    onChange={(opt) => {
                      if (opt.value === "__manual") {
                        handleLocationChange("country", "", true);
                      } else {
                        handleLocationChange("country", opt.value, false);
                      }
                    }}
                  />
                ) : (
                  <>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter country manually"
                      value={form.country || ""}
                      onChange={(e) => handleLocationChange("country", e.target.value, true)}
                    />
                    <button
                      type="button"
                      className="manual-btn"
                      onClick={() => setManualCountry(false)}
                    >
                      ⬅ Use dropdown
                    </button>
                  </>
                )}
              </div>

              {/* STATE */}
              <div className="form-group">
                <label className="form-label required">State</label>
                {!manualState ? (
                  <Select
                    options={
                      form.country && !manualCountry
                        ? [...stateList, { label: "➕ Enter manually", value: "__manual" }]
                        : [{ label: form.country ? "Select Country first" : "Select Country first", value: "" }]
                    }
                    placeholder={
                      !form.country ? "Select Country first" :
                      loadingStates ? "Loading states..." : 
                      "Search state..."
                    }
                    isLoading={loadingStates}
                    isDisabled={!form.country || manualCountry}
                    value={stateList.find((s) => s.value === form.state) || null}
                    onChange={(opt) => {
                      if (!form.country) return;
                      if (opt.value === "__manual") {
                        handleLocationChange("state", "", true);
                      } else {
                        handleLocationChange("state", opt.value, false);
                      }
                    }}
                  />
                ) : (
                  <>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter state manually"
                      value={form.state || ""}
                      onChange={(e) => handleLocationChange("state", e.target.value, true)}
                    />
                    <button
                      type="button"
                      className="manual-btn"
                      onClick={() => setManualState(false)}
                    >
                      ⬅ Use dropdown
                    </button>
                  </>
                )}
              </div>

              
            {/* CITY Dropdown - Updated */}
<div className="form-group">
  <label className="form-label required">City</label>
  
  {!manualCity ? (
    <>
      <Select
        options={
          form.state && !manualState
            ? cityList
            : [{ label: form.state ? "Select State first" : "Select State first", value: "" }]
        }
        placeholder={
          !form.state ? "Select State first" :
          loadingCities ? "Loading cities..." : 
          cityList.length > 0 ? "Search city..." : "No cities found"
        }
        isLoading={loadingCities}
        isDisabled={!form.state || manualState}
        value={cityList.find((c) => c.value === form.city) || null}
        onChange={(opt) => {
          if (!form.state || !opt) return;
          if (opt.value === "__manual") {
            handleLocationChange("city", "", true);
          } else {
            handleLocationChange("city", opt.value, false);
          }
        }}
      />
      {form.state && cityList.length === 0 && !loadingCities && (
        <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
          No cities found for {form.state}. Try manual entry.
        </div>
      )}
    </>
  ) : (
    <>
      <input
        type="text"
        className="form-input"
        placeholder="Enter city manually"
        value={form.city || ""}
        onChange={(e) => handleLocationChange("city", e.target.value, true)}
      />
      <button
        type="button"
        className="manual-btn"
        onClick={() => setManualCity(false)}
      >
        ⬅ Use dropdown
      </button>
    </>
  )}
</div>

              {/* POSTAL CODE */}
              <div className="form-group">
                <label className="form-label required">Postal Code</label>
                <input
                  type="text"
                  className="form-input"
                  name="postal_code"
                  value={form.postal_code || ""}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* PRIMARY CONTACT */}
            <div className="section-title">Primary Contact</div>
            
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="contactName">Full Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="contactName"
                    name="contact_name"
                    placeholder="Primary HR / Admin contact"
                    value={form.contact_name}
                    onChange={handleChange}
                    required
                    className={errors.contact_name ? "input-error" : ""}
                  />
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {errors.contact_name && <span className="error-text">{errors.contact_name}</span>}
              </div>
              
              <div className="input-group">
                <label htmlFor="designation">Designation</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    placeholder="Ex: HR Manager, Director, Founder"
                    value={form.designation}
                    onChange={handleChange}
                    className={errors.designation ? "input-error" : ""}
                  />
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {errors.designation && <span className="error-text">{errors.designation}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label htmlFor="contactEmail">Contact Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="contactEmail"
                    name="contact_email"
                    placeholder="name@company.com"
                    value={form.contact_email}
                    onChange={handleChange}
                    required
                    className={errors.contact_email ? "input-error" : ""}
                  />
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                {errors.contact_email && <span className="error-text">{errors.contact_email}</span>}
              </div>

              <div className="input-group">
                <label>Company Phone Number</label>
                <div className={`phone-input ${errors.company_phone ? "input-error" : ""}`}>
                  <PhoneInput
                    international
                    defaultCountry="IN"
                    value={form.company_phone}
                    onChange={(value) => handlePhoneChange("company_phone", value)}
                  />
                </div>
                {validating.company_phone && <span className="validating-text">Checking...</span>}
                {errors.company_phone && <span className="error-text">{errors.company_phone}</span>}
              </div>
            </div>

            {/* FINANCE & BILLING */}
            <div className="section-title">Finance &amp; Billing</div>
            
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="gst">GST / VAT Number</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="gst"
                    name="gst_vat_number"
                    placeholder="27AAAAA0000A1Z5"
                    value={form.gst_vat_number}
                    onChange={handleChange}
                    className={errors.gst_vat_number ? "input-error" : ""}
                  />
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l2 2 4-4m-7 9h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                {validating.gst_vat_number && <span className="validating-text">Checking...</span>}
                {errors.gst_vat_number && <span className="error-text">{errors.gst_vat_number}</span>}
              </div>
              
              <div className="input-group">
                <label htmlFor="pan">PAN / Tax ID</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="pan"
                    name="pan_tax_id"
                    placeholder="ABCDE1234F"
                    value={form.pan_tax_id}
                    onChange={handleChange}
                    className={errors.pan_tax_id ? "input-error" : ""}
                  />
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7h16M4 12h16M4 17h10" />
                  </svg>
                </div>
                {validating.pan_tax_id && <span className="validating-text">Checking...</span>}
                {errors.pan_tax_id && <span className="error-text">{errors.pan_tax_id}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label htmlFor="currency">Preferred Billing Currency</label>
                <div className="input-wrapper">
                  <select
                    id="currency"
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    required
                    className={errors.currency ? "input-error" : ""}
                  >
                    <option value="">Select currency</option>
                    <option value="INR">INR – Indian Rupee</option>
                    <option value="USD">USD – US Dollar</option>
                    <option value="EUR">EUR – Euro</option>
                    <option value="GBP">GBP – British Pound</option>
                    <option value="AED">AED – UAE Dirham</option>
                  </select>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {errors.currency && <span className="error-text">{errors.currency}</span>}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="billingEmail">Billing / Finance Email</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="billingEmail"
                  name="billing_email"
                  placeholder="finance@company.com"
                  value={form.billing_email}
                  onChange={handleChange}
                  className={errors.billing_email ? "input-error" : ""}
                />
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              {validating.billing_email && <span className="validating-text">Checking...</span>}
              {errors.billing_email && <span className="error-text">{errors.billing_email}</span>}
            </div>

            {/* ACCOUNT SECURITY */}
            <div className="section-title">Account Security</div>
            
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="adminEmail">Admin Login Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="adminEmail"
                    name="admin_email"
                    placeholder="This will be used to login"
                    value={form.admin_email}
                    onChange={handleChange}
                    required
                    className={errors.admin_email ? "input-error" : ""}
                  />
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {validating.admin_email && <span className="validating-text">Checking...</span>}
                {errors.admin_email && <span className="error-text">{errors.admin_email}</span>}
              </div>
              <div className="input-group">
                <label>Admin Phone</label>
                <div className={`phone-input ${errors.admin_phone ? "input-error" : ""}`}>
                  <PhoneInput
                    international
                    defaultCountry="IN"
                    value={form.admin_phone}
                    onChange={(value) => handlePhoneChange("admin_phone", value)}
                  />
                </div>
                {validating.admin_phone && <span className="validating-text">Checking...</span>}
                {errors.admin_phone && <span className="error-text">{errors.admin_phone}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label htmlFor="password">Create Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Minimum 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className={errors.password ? "input-error" : ""}
                  />
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
              
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirm_password"
                    placeholder="Re-enter password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    required
                    className={errors.confirm_password ? "input-error" : ""}
                  />
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                {errors.confirm_password && <span className="error-text">{errors.confirm_password}</span>}
              </div>
            </div>

            <div className="options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="terms"
                  checked={form.terms}
                  onChange={(e) => setForm((prev) => ({ ...prev, terms: e.target.checked }))}
                  required
                />
                <span>I agree to the Terms &amp; Privacy Policy</span>
              </label>
            </div>

            <button type="submit" className="login-btn">
              Create Company Account
            </button>

            <div className="signup-link">
              Already have an account? <a href="/">Sign in</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegistration;