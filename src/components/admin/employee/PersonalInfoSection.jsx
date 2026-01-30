import "../../../assets/styles/admin.css";
import { checkUserFieldExists } from "../../../api/admin/checkUserField";
import { selectStyles } from "../../../utils/selectStyles";
import { toSentenceCase } from "../../../utils/textFormatters";

import {
  getAllCountries,
  getStatesByCountry,
  getCitiesByState,
} from "../../../api/admin/locationApi";
import React, { useState, useEffect } from "react";
import Select from "react-select";

export default function PersonalInfoSection({
  personalInfo = {},
  setPersonalInfo,
  photoPreview,
  onPhotoChange,
  mode = "add",
  employeeId,
  formErrors,
  setFormErrors,
}) {
  const [errors, setErrors] = useState({});

  /** Sync errors */
  useEffect(() => {
    setErrors(formErrors);
  }, [formErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  /** LOCATION STATES */
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);

  const [manualCountry, setManualCountry] = useState(false);
  const [manualState, setManualState] = useState(false);
  const [manualCity, setManualCity] = useState(false);

  /** Load Countries */
  useEffect(() => {
    getAllCountries().then((res) => {
      const list = res.map((c) => ({
        label: c.country_name,
        value: c.country_name,
      }));
      list.push({ label: "Enter manually", value: "__manual" });
      setCountryList(list);
    });
  }, []);

  /** COUNTRY — Detect manual */
  useEffect(() => {
    if (mode === "edit" && personalInfo.country) {
      const exists = countryList.some((c) => c.value === personalInfo.country);

      if (!exists) {
        setManualCountry(true);
      }
    }
  }, [mode, personalInfo.country, countryList]);

  /** STATE — Load only when NOT manual */
  useEffect(() => {
    if (!personalInfo.country || manualCountry) return;

    getStatesByCountry(personalInfo.country).then((res) => {
      const list = res.map((s) => ({
        label: s.state_name,
        value: s.state_name,
      }));
      list.push({ label: "Enter manually", value: "__manual" });
      setStateList(list);
    });
  }, [personalInfo.country, manualCountry]);

  /** STATE — Detect manual */
  useEffect(() => {
    if (mode === "edit" && personalInfo.state) {
      if (manualCountry) {
        setManualState(true);
        return;
      }

      const exists = stateList.some((s) => s.value === personalInfo.state);

      if (!exists) {
        setManualState(true);
      }
    }
  }, [mode, personalInfo.state, manualCountry, stateList]);

  /** CITY — Load only when NOT manual */
  useEffect(() => {
    if (!personalInfo.state || manualState) return;

    getCitiesByState(personalInfo.country, personalInfo.state).then((res) => {
      const list = res.map((c) => ({
        label: c,
        value: c,
      }));
      list.push({ label: "Enter manually", value: "__manual" });
      setCityList(list);
    });
  }, [personalInfo.state, manualState]);

  /** CITY — Detect manual */
  useEffect(() => {
    if (mode === "edit" && personalInfo.city) {
      if (manualState) {
        setManualCity(true);
        return;
      }

      const exists = cityList.some((c) => c.value === personalInfo.city);

      if (!exists) {
        setManualCity(true);
      }
    }
  }, [mode, personalInfo.city, manualState, cityList]);

  return (
    <div className="form-section">
      <h2 className="section-title">
        <i className="fa-solid fa-user" />{" "}
        {mode === "edit"
          ? "Update Personal Information"
          : "Add Personal Information"}
      </h2>

      {/* PHOTO */}
      <div className="form-group full-width">
        <div className="photo-upload">
          <div className="photo-preview">
            {photoPreview ? (
              <img src={photoPreview} alt="Employee" />
            ) : (
              <i className="fa-solid fa-user" />
            )}
          </div>

          <div>
            <label htmlFor="photoUpload" className="upload-btn">
              <i className="fa-solid fa-upload" /> Upload Photo
            </label>

            <input
              type="file"
              id="photoUpload"
              className="file-input"
              accept="image/*"
              name="image"
              onChange={onPhotoChange}
            />
          </div>
        </div>
      </div>

      {/* BASIC GRID */}
      <div className="form-grid" style={{ marginTop: 20 }}>
        <div className="form-group">
          <label className="form-label required">Full Name</label>
          <input
            type="text"
            className="form-input"
            name="name"
            value={personalInfo.name || ""}
            onChange={handleChange}
            onBlur={(e) => {
              const formattedName = toSentenceCase(e.target.value);
              setPersonalInfo((prev) => ({ ...prev, name: formattedName }));
            }}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label required">Date of Birth</label>
          <input
            type="date"
            className="form-input"
             style={{ textTransform: "uppercase" }} 
            name="date_of_birth"
            value={
              personalInfo.date_of_birth
                ? personalInfo.date_of_birth.slice(0, 10)
                : ""
            }
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label required">Gender</label>
          <select
            className="form-select"
            name="gender"
            value={personalInfo.gender || ""}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* PERSONAL EMAIL */}
        <div
          className={`form-group ${errors.personal_email ? "has-error" : ""}`}
        >
          <div className="label-row">
            <label className="form-label required">
              Personal Email{" "}
              {errors.personal_email && (
                <span className="inline-error">{errors.personal_email}</span>
              )}
            </label>
          </div>

          <input
            type="email"
            className={`form-input ${
              errors.personal_email ? "input-error" : ""
            }`}
            name="personal_email"
            value={personalInfo.personal_email || ""}
            onChange={async (e) => {
              handleChange(e);
              const email = e.target.value.trim();

              if (email.length > 3) {
                const res = await checkUserFieldExists(
                  "personal_email",
                  email,
                  employeeId,
                );
                const msg = res.success ? "" : "already exists!";
                setErrors((p) => ({ ...p, personal_email: msg }));
                setFormErrors((p) => ({ ...p, personal_email: msg }));
              }
            }}
            required
          />
        </div>

        {/* PHONE */}
        <div className={`form-group ${errors.phone ? "has-error" : ""}`}>
          <div className="label-row">
            <label className="form-label required">
              Phone Number{" "}
              {errors.phone && (
                <span className="inline-error">{errors.phone}</span>
              )}
            </label>
          </div>

          <input
            type="tel"
            className={`form-input ${errors.phone ? "input-error" : ""}`}
            name="phone"
            value={personalInfo.phone || ""}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^0-9]/g, "");
            }}
            onChange={async (e) => {
              handleChange(e);
              const phone = e.target.value.trim();

              if (phone.length > 5) {
                const res = await checkUserFieldExists(
                  "phone",
                  phone,
                  employeeId,
                );
                const msg = res.success ? "" : "already exists!";
                setErrors((p) => ({ ...p, phone: msg }));
                setFormErrors((p) => ({ ...p, phone: msg }));
              }
            }}
            required
          />
        </div>

        {/* QUALIFICATION */}
        <div className="form-group">
          <label className="form-label required">Qualification</label>
          <input
            type="text"
            className="form-input"
            name="qualification"
            value={personalInfo.qualification || ""}
            onChange={handleChange}
            onBlur={(e) => {
              const formattedValue = toSentenceCase(e.target.value);
              setPersonalInfo((prev) => ({
                ...prev,
                qualification: formattedValue,
              }));
            }}
            required
          />
        </div>
      </div>

      {/* ADDRESS */}
      <div className="form-group full-width" style={{ marginTop: 20 }}>
        <label className="form-label required">Address</label>
        <textarea
          className="form-textarea"
          name="address"
          value={personalInfo.address || ""}
          onChange={handleChange}
          onBlur={(e) => {
            const formattedAddress = toSentenceCase(e.target.value);
            setPersonalInfo((prev) => ({ ...prev, address: formattedAddress }));
          }}
          required
        />
      </div>

      {/* LOCATION SECTION */}
      <div className="form-grid" style={{ marginTop: 20 }}>
        {/* COUNTRY */}
        <div className="form-group">
          <label className="form-label required">Country</label>

          {!manualCountry ? (
            <Select
              styles={selectStyles}
              options={[
                ...countryList,
                { label: "➕ Enter manually", value: "__manual" },
              ]}
              placeholder="Search country..."
              value={
                countryList.find((c) => c.value === personalInfo.country) ||
                null
              }
              onChange={(opt) => {
                if (opt.value === "__manual") {
                  setManualCountry(true);
                  setPersonalInfo((p) => ({ ...p, country: "" }));
                } else {
                  setManualCountry(false);
                  setPersonalInfo((p) => ({ ...p, country: opt.value }));
                }
              }}
            />
          ) : (
            <>
              <input
                type="text"
                className="form-input"
                placeholder="Enter country manually"
                name="country" // Added name for clarity
                value={personalInfo.country || ""}
                onChange={(e) =>
                  setPersonalInfo((p) => ({ ...p, country: e.target.value }))
                }
                onBlur={(e) => {
                  const formattedCountry = toSentenceCase(e.target.value);
                  setPersonalInfo((p) => ({ ...p, country: formattedCountry }));
                }}
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

          <input
            type="hidden"
            name="country"
            value={personalInfo.country || ""}
          />
        </div>

        {/* STATE */}
        <div className="form-group">
          <label className="form-label required">State</label>

          {!manualState ? (
            <Select
              styles={selectStyles}
              options={
                personalInfo.country
                  ? [
                      ...stateList,
                      { label: "➕ Enter manually", value: "__manual" },
                    ]
                  : [{ label: "Select Country first", value: "" }]
              }
              placeholder={
                personalInfo.country
                  ? "Search state..."
                  : "Select Country first"
              }
              value={
                stateList.find((s) => s.value === personalInfo.state) || null
              }
              onChange={(opt) => {
                if (!personalInfo.country) return;

                if (opt.value === "__manual") {
                  setManualState(true);
                  setPersonalInfo((p) => ({ ...p, state: "" }));
                } else {
                  setManualState(false);
                  setPersonalInfo((p) => ({ ...p, state: opt.value }));
                }
              }}
              isDisabled={!personalInfo.country}
            />
          ) : (
            <>
              <input
                type="text"
                className="form-input"
                placeholder="Enter state manually"
                value={personalInfo.state || ""}
                onChange={(e) =>
                  setPersonalInfo((p) => ({ ...p, state: e.target.value }))
                }
                onBlur={(e) =>
                  setPersonalInfo((p) => ({
                    ...p,
                    state: toSentenceCase(e.target.value),
                  }))
                }
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

          <input type="hidden" name="state" value={personalInfo.state || ""} />
        </div>

        {/* CITY */}
        <div className="form-group">
          <label className="form-label required">City</label>

          {!manualCity ? (
            <Select
              styles={selectStyles}
              options={
                personalInfo.state
                  ? [
                      ...cityList,
                      { label: "➕ Enter manually", value: "__manual" },
                    ]
                  : [{ label: "Select State first", value: "" }]
              }
              placeholder={
                personalInfo.state ? "Search city..." : "Select State first"
              }
              value={
                cityList.find((c) => c.value === personalInfo.city) || null
              }
              onChange={(opt) => {
                if (!personalInfo.state) return;

                if (opt.value === "__manual") {
                  setManualCity(true);
                  setPersonalInfo((p) => ({ ...p, city: "" }));
                } else {
                  setManualCity(false);
                  setPersonalInfo((p) => ({ ...p, city: opt.value }));
                }
              }}
              isDisabled={!personalInfo.state}
            />
          ) : (
            <>
              <input
                type="text"
                className="form-input"
                placeholder="Enter city manually"
                value={personalInfo.city || ""}
                onChange={(e) =>
                  setPersonalInfo((p) => ({ ...p, city: e.target.value }))
                }
                onBlur={(e) =>
                  setPersonalInfo((p) => ({
                    ...p,
                    city: toSentenceCase(e.target.value),
                  }))
                }
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

          <input type="hidden" name="city" value={personalInfo.city || ""} />
        </div>

        {/* POSTAL CODE */}
        <div className="form-group">
          <label className="form-label required">Postal Code</label>
          <input
            type="text"
            className="form-input"
            name="postal_code"
            value={personalInfo.postal_code || ""}
            onChange={handleChange}
            required
          />
        </div>
      </div>
    </div>
  );
}
