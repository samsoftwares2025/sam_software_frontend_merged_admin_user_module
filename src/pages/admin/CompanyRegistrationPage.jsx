import React from "react";
import "../../assets/styles/CompanyRegistrationPage.css";

const CompanyRegistration = () => {
  const handleSubmit = (e) => {
    e.preventDefault(); // prevent page reload, hook your API here
  };

  return (
      <div className="page-wrapper">

    <div className="login-container">
      {/* LEFT PANEL */}
      <div className="login-left">
        <h1>
          Onboard Your Company
          <br />
          To HR Partner
        </h1>
        <p>
          Streamline hiring, payroll, and employee engagement in one powerful
          platform designed for modern teams.
        </p>
        <div className="features">
          <div className="feature-item">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>End-to-end HR automation</span>
          </div>
          <div className="feature-item">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Finance &amp; payroll ready</span>
          </div>
          <div className="feature-item">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
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
                required
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
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="registrationNumber">
                Registration / CIN Number
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="registrationNumber"
                  name="registration_number"
                  placeholder="Company registration / CIN"
                />
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 7h6m-6 4h6m-9 4h3m4 0h3M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
                  />
                </svg>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="industry">Industry</label>
              <div className="input-wrapper">
                <select id="industry" name="industry" required>
                  <option value="">Select industry</option>
                  <option>IT / Software</option>
                  <option>Finance / Banking</option>
                  <option>Manufacturing</option>
                  <option>Healthcare</option>
                  <option>Education</option>
                  <option>Retail / E-Commerce</option>
                  <option>Consulting</option>
                  <option>Other</option>
                </select>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="companySize">Company Size</label>
              <div className="input-wrapper">
                <select id="companySize" name="company_size" required>
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="website">Company Website</label>
              <div className="input-wrapper">
                <input
                  type="url"
                  id="website"
                  name="website"
                  placeholder="https://example.com"
                />
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.5c4.142 0 7.5 3.358 7.5 7.5s-3.358 7.5-7.5 7.5S4.5 16.142 4.5 12 7.858 4.5 12 4.5zM9 12h6m-3-3v6"
                  />
                </svg>
              </div>
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
              />
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z"
                />
              </svg>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="city">City</label>
              <div className="input-wrapper">
                <input type="text" id="city" name="city" placeholder="City" />
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 21h18M5 21V8l7-5 7 5v13"
                  />
                </svg>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="state">State / Province</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="state"
                  name="state"
                  placeholder="State / Province"
                />
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 2l7 7-7 7-7-7 7-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="postalCode">Postal Code</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="postalCode"
                  name="postal_code"
                  placeholder="PIN / ZIP"
                />
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z"
                  />
                </svg>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="country">Country</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="country"
                  name="country"
                  placeholder="Country"
                />
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5h18M3 12h18M3 19h18"
                  />
                </svg>
              </div>
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
                  required
                />
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="designation">Designation</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  placeholder="Ex: HR Manager, Director, Founder"
                />
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="contactEmail">Work Email</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="contactEmail"
                  name="contact_email"
                  placeholder="name@company.com"
                  required
                />
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="contactPhone">Phone Number</label>
              <div className="input-wrapper">
                <input
                  type="tel"
                  id="contactPhone"
                  name="contact_phone"
                  placeholder="+91 98765 43210"
                  required
                />
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5l2-2 4 4-2 2a12 12 0 005 5l2-2 4 4-2 2c-1.5.5-3 .5-4.5 0C8.5 17 5 13.5 3.5 9.5c-.5-1.5-.5-3 0-4.5z"
                  />
                </svg>
              </div>
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
                  placeholder="GST / VAT / Tax ID"
                />
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 14l2 2 4-4m-7 9h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="pan">PAN / Tax ID</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="pan"
                  name="pan_tax_id"
                  placeholder="PAN / Tax Identification"
                />
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 7h16M4 12h16M4 17h10"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="currency">Preferred Billing Currency</label>
              <div className="input-wrapper">
                <select id="currency" name="currency" required>
                  <option value="">Select currency</option>
                  <option value="INR">INR – Indian Rupee</option>
                  <option value="USD">USD – US Dollar</option>
                  <option value="EUR">EUR – Euro</option>
                  <option value="GBP">GBP – British Pound</option>
                  <option value="AED">AED – UAE Dirham</option>
                </select>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
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
              />
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
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
                  required
                />
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="adminPhone">Admin Phone</label>
              <div className="input-wrapper">
                <input
                  type="tel"
                  id="adminPhone"
                  name="admin_phone"
                  placeholder="+91 98xxxxxxx"
                />
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5l2-2 4 4-2 2a12 12 0 005 5l2-2 4 4-2 2c-1.5.5-3 .5-4.5 0C8.5 17 5 13.5 3.5 9.5c-.5-1.5-.5-3 0-4.5z"
                  />
                </svg>
              </div>
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
                  required
                />
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirm_password"
                  placeholder="Re-enter password"
                  required
                />
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="options">
            <label className="remember-me">
              <input type="checkbox" name="terms" required />
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
