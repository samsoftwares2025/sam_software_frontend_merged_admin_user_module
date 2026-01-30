import React, { useState, useEffect } from "react";
import "../../../assets/styles/admin.css";
import { checkUserFieldExists } from "../../../api/admin/checkUserField";
import { toSentenceCase } from "../../../utils/textFormatters";

export default function EmergencyContactSection({
  initialValues = {},
  employeeId,
  formErrors,
  setFormErrors,
}) {
  const [errors, setErrors] = useState({
    emergency_contact_email: "",
    emergency_contact_number: "",
  });

  /** 🔥 Sync parent → local error state */
  useEffect(() => {
    setErrors((prev) => ({
      ...prev,
      emergency_contact_email: formErrors.emergency_contact_email,
      emergency_contact_number: formErrors.emergency_contact_number,
    }));
  }, [formErrors.emergency_contact_email, formErrors.emergency_contact_number]);

  return (
    <div className="form-section">
      <h2 className="section-title">
        <i className="fa-solid fa-phone" />
        Emergency Contact
      </h2>

      <div className="form-grid">
        {/* CONTACT NAME */}
        <div className="form-group">
          <label className="form-label required">Contact Name</label>
          <input
            type="text"
            className="form-input"
            name="emergency_contact_name"
            onBlur={(e) => {
              e.target.value = toSentenceCase(e.target.value);
            }}
            required
            defaultValue={initialValues.emergency_contact_name || ""}
          />
        </div>

        {/* RELATIONSHIP */}
        <div className="form-group">
          <label className="form-label required">Relationship</label>
          <input
            type="text"
            className="form-input"
            name="emergency_contact_relationship"
            onBlur={(e) => {
              e.target.value = toSentenceCase(e.target.value);
            }}
            required
            defaultValue={initialValues.emergency_contact_relationship || ""}
          />
        </div>

        {/* 🔥 EMERGENCY PHONE (Duplicate Check) */}
        <div
          className={`form-group ${
            errors.emergency_contact_number ? "has-error" : ""
          }`}
        >
          <div className="label-row">
            <label className="form-label required">
              Phone Number{" "}
              {errors.emergency_contact_number && (
                <span className="inline-error">
                  {errors.emergency_contact_number}
                </span>
              )}
            </label>
          </div>

          <input
            type="tel"
            className={`form-input ${
              errors.emergency_contact_number ? "input-error" : ""
            }`}
            name="emergency_contact_number"
            defaultValue={initialValues.emergency_contact_number || ""}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^0-9]/g, "");
            }}
            onChange={async (e) => {
              const number = e.target.value.trim();

              if (number.length > 5) {
                try {
                  const res = await checkUserFieldExists(
                    "emergency_contact_number",
                    number,
                    employeeId,
                  );

                  const msg = res.success ? "" : "already exists!";

                  setErrors((prev) => ({
                    ...prev,
                    emergency_contact_number: msg,
                  }));

                  /** 🔥 update parent errors */
                  setFormErrors((prev) => ({
                    ...prev,
                    emergency_contact_number: msg,
                  }));
                } catch (err) {
                  console.error("Emergency phone check failed:", err);
                }
              } else {
                setErrors((prev) => ({
                  ...prev,
                  emergency_contact_number: "",
                }));

                setFormErrors((prev) => ({
                  ...prev,
                  emergency_contact_number: "",
                }));
              }
            }}
            required
          />
        </div>

        {/* 🔥 EMERGENCY EMAIL (Duplicate Check) */}
        <div
          className={`form-group ${
            errors.emergency_contact_email ? "has-error" : ""
          }`}
        >
          <div className="label-row">
            <label className="form-label">
              Email{" "}
              {errors.emergency_contact_email && (
                <span className="inline-error">
                  {errors.emergency_contact_email}
                </span>
              )}
            </label>
          </div>

          <input
            type="email"
            className={`form-input ${
              errors.emergency_contact_email ? "input-error" : ""
            }`}
            name="emergency_contact_email"
            defaultValue={initialValues.emergency_contact_email || ""}
            onChange={async (e) => {
              const email = e.target.value.trim();

              if (email.length > 3) {
                try {
                  const res = await checkUserFieldExists(
                    "emergency_contact_email",
                    email,
                    employeeId,
                  );

                  const msg = res.success ? "" : "already exists!";

                  setErrors((prev) => ({
                    ...prev,
                    emergency_contact_email: msg,
                  }));

                  /** 🔥 update parent error state */
                  setFormErrors((prev) => ({
                    ...prev,
                    emergency_contact_email: msg,
                  }));
                } catch (err) {
                  console.error("Emergency email check failed:", err);
                }
              } else {
                setErrors((prev) => ({
                  ...prev,
                  emergency_contact_email: "",
                }));

                setFormErrors((prev) => ({
                  ...prev,
                  emergency_contact_email: "",
                }));
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
