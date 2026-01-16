import React, { useState, useEffect } from "react";
import "../../../assets/styles/admin.css";
import { checkUserFieldExists } from "../../../api/admin/checkUserField";

export default function CompensationSection({
  initialValues = {},
  employeeId,
  formErrors,
  setFormErrors,
}) {
  const [errors, setErrors] = useState({ account_number: "" });

  /** Sync parent → local */
  useEffect(() => {
    setErrors((prev) => ({
      ...prev,
      account_number: formErrors.account_number,
    }));
  }, [formErrors.account_number]);

  return (
    <div className="form-section">
      <h2 className="section-title">
        <i className="fa-solid fa-money-bill-wave" />
        Compensation Details
      </h2>

      <div className="form-grid-3">

        {/* Annual CTC */}
        <div className="form-group">
          <label className="form-label required">Annual CTC</label>
          <input
            type="number"
            className="form-input"
            name="annual_ctc"
            required
            defaultValue={initialValues.annual_ctc || ""}
          />
        </div>

        {/* Basic Salary */}
        <div className="form-group">
          <label className="form-label required">Basic Salary</label>
          <input
            type="number"
            className="form-input"
            name="basic_salary"
            required
            defaultValue={initialValues.basic_salary || ""}
          />
        </div>

        {/* Variable Pay */}
        <div className="form-group">
          <label className="form-label required">Variable Pay</label>
          <input
            type="number"
            className="form-input"
            name="variable_pay"
            required
            defaultValue={initialValues.variable_pay || ""}
          />
        </div>

        {/* Bank Name */}
        <div className="form-group required">
          <label className="form-label">Bank Name</label>
          <input
            type="text"
            className="form-input"
            name="bank_name"
            required
            defaultValue={initialValues.bank_name || ""}
          />
        </div>

        {/* ------------------------------  
            ACCOUNT NUMBER DUPLICATE CHECK  
        ------------------------------ */}
        <div className={`form-group ${errors.account_number ? "has-error" : ""}`}>
          <div className="label-row">
            <label className="form-label required">
              Account Number{" "}
              {errors.account_number && (
                <span className="inline-error">{errors.account_number}</span>
              )}
            </label>
          </div>

          <input
            type="text"
            className={`form-input ${errors.account_number ? "input-error" : ""}`}
            name="account_number"
            required
            defaultValue={initialValues.account_number || ""}

            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^0-9]/g, "");
            }}

            onChange={async (e) => {
              const acc = e.target.value.trim();

              if (acc.length > 6) {
                try {
                  const res = await checkUserFieldExists(
                    "account_number",
                    acc,
                    employeeId
                  );

                  const msg = res.success ? "" : "already exists!";

                  setErrors((prev) => ({ ...prev, account_number: msg }));

                  /** 🔥 update parent error state */
                  setFormErrors((prev) => ({
                    ...prev,
                    account_number: msg,
                  }));

                } catch (err) {
                  console.error("Account number duplicate check failed:", err);
                }
              } else {
                setErrors((prev) => ({ ...prev, account_number: "" }));
                setFormErrors((prev) => ({
                  ...prev,
                  account_number: "",
                }));
              }
            }}
          />
        </div>

        {/* IFSC Code */}
        <div className="form-group">
          <label className="form-label">IFSC Code</label>
          <input
            type="text"
            className="form-input"
            name="ifsc_code"
            defaultValue={initialValues.ifsc_code || ""}
          />
        </div>

      </div>
    </div>
  );
}
