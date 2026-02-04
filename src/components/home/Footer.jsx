import React from "react";

const Footer = () => {
  return (
    <footer className="landing-footer">
      <div className="footer-container">

        {/* BRAND + ABOUT */}
        <div className="footer-column footer-brand">
          <h3>SamSoftware</h3>
          <p>
            Sam Software is a modern technology startup delivering
            enterprise-grade HR, compliance and workforce management
            platforms for growing organizations.
          </p>
        </div>

        {/* SOLUTIONS */}
        <div className="footer-column">
          <h4>Solutions</h4>
          <ul>
            <li><a href="#hr">HR Management</a></li>
            <li><a href="#compliance">Compliance & Governance</a></li>
            <li><a href="#payroll">Payroll Automation</a></li>
            <li><a href="#analytics">People Analytics</a></li>
          </ul>
        </div>

        {/* COMPANY */}
        <div className="footer-column">
          <h4>Company</h4>
          <ul>
            <li><a href="#about">About Us</a></li>
            <li><a href="#careers">Careers</a></li>
            <li><a href="#partners">Partners</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        {/* RESOURCES */}
        <div className="footer-column">
          <h4>Resources</h4>
          <ul>
            <li><a href="#blog">Insights & Blog</a></li>
            <li><a href="#docs">Documentation</a></li>
            <li><a href="#support">Support</a></li>
            <li><a href="#security">Security</a></li>
          </ul>
        </div>

        {/* CONTACT */}
        <div className="footer-column">
          <h4>Get in Touch</h4>
          <p>Email: <a href="mailto:info@samsoftware.com">info@samsoftware.com</a></p>
          <p>Phone: +91 90000 00000</p>
          <p>Location: India</p>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} SamSoftware. All rights reserved.</p>
        <div className="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#cookies">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
