import React, { useState, useEffect, useCallback } from "react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect handler
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    // Initial check
    handleScroll();

    // Add event listener
    window.addEventListener('scroll', handleScroll);

    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const closeAll = () => {
    setMenuOpen(false);
    setServicesOpen(false);
  };

  return (
    <header className={`landing-navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">

        {/* BRAND */}
        <div className="brand">SamSoftwares</div>

        {/* DESKTOP NAV */}
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#home">Home</a>

          {/* DROPDOWN */}
          <div
            className="nav-dropdown"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button className="dropdown-toggle">
              Solutions
              <span className="caret">▾</span>
            </button>

            <div className={`dropdown-menu ${servicesOpen ? "show" : ""}`}>
              <a href="#hr">HR Management</a>
              <a href="#compliance">Compliance</a>
              <a href="#payroll">Payroll</a>
              <a href="#analytics">Analytics</a>
            </div>
          </div>

          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>

          {/* CTA */}
        </nav>

        {/* MOBILE TOGGLE */}
        <button
          className={`nav-toggle ${menuOpen ? "open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(prev => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* MOBILE NAV */}
      <nav className={`mobile-nav ${menuOpen ? "show" : ""}`}>
        <a href="#home" onClick={closeAll}>Home</a>

        <button
          className="mobile-dropdown-toggle"
          onClick={() => setServicesOpen(prev => !prev)}
        >
          Solutions <span className="caret">▾</span>
        </button>

        {servicesOpen && (
          <div className="mobile-submenu">
            <a href="#hr" onClick={closeAll}>HR Management</a>
            <a href="#compliance" onClick={closeAll}>Compliance</a>
            <a href="#payroll" onClick={closeAll}>Payroll</a>
            <a href="#analytics" onClick={closeAll}>Analytics</a>
          </div>
        )}

        <a href="#features" onClick={closeAll}>Features</a>
        <a href="#pricing" onClick={closeAll}>Pricing</a>
        <a href="#contact" onClick={closeAll}>Contact</a>

      </nav>
    </header>
  );
};

export default Navbar;