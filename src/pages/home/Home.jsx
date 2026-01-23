import React, { useEffect } from "react";



const Home = () => {
  useEffect(() => {
    // Set current year in footer
    const yearSpan = document.getElementById("yearSpan");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Smooth scroll
    const navLinks = document.querySelectorAll('a.nav-link[href^="#"]');
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
          e.preventDefault();
          window.scrollTo({
            top: target.offsetTop - 80,
            behavior: "smooth",
          });
        }
      });
    });

    // Back to top button
    const backToTop = document.getElementById("backToTop");
    const onScroll = () => {
      if (window.scrollY > 300) {
        backToTop.style.display = "block";
      } else {
        backToTop.style.display = "none";
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <div className="nav-wrapper">
        <nav className="navbar navbar-expand-lg">
          <div className="container">
            <a className="navbar-brand d-flex align-items-center" href="#hero">
              {/* <span className="brand-icon"></span> */}
              <span>SamSoftware HR</span>
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#mainNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="mainNav">
              <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
                <li className="nav-item">
                  <a className="nav-link active" href="#hero">Overview</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#features">Features</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#modules">Platform</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#pricing">Pricing</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#contact">Demo</a>
                </li>
                <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
                  <a href="#contact" className="btn btn-primary btn-pill px-3 py-1">
                    Book a demo
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>

      {/* HERO */}
      <section id="hero" className="hero">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <div className="hero-kicker">HR PLATFORM</div>
              <div className="hero-logo">
                SamSoftware <span>People OS</span>
              </div>
              <h1 className="hero-title">Run HR at flight speed.</h1>
              <p className="hero-subtitle">
                Centralise employee data, automate workflows and get real-time people insights –
                all in one calm, modern workspace.
              </p>

              <div className="hero-badges">
                <div className="hero-badge"><span className="hero-badge-dot"></span> Live in under 10 days</div>
                <div className="hero-badge"><span className="hero-badge-dot"></span> Built for 20–3,000 employees</div>
                <div className="hero-badge"><span className="hero-badge-dot"></span> India & global payroll ready</div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <a href="#contact" className="btn btn-primary btn-pill px-4">Get live demo</a>
                <a href="#pricing" className="btn btn-outline-primary btn-pill px-4">View pricing</a>
              </div>

              <p className="hero-note">
                Free for your first 25 employees · No credit card required
              </p>
            </div>

            <div className="col-lg-6">
              <div className="hero-device">
                <div className="hero-device-header">
                  <span>Today · 9:41</span>
                  <span className="device-pill">People Ops cockpit</span>
                </div>

                <div className="hero-device-title">Live workforce health</div>
                <div className="hero-device-subtitle">
                  Track hiring, engagement and attrition in one view – by location, team and role.
                </div>

                <div className="metric-row">
                  <div className="metric-card">
                    <div className="metric-label">Time-to-hire</div>
                    <div className="metric-value">8 days</div>
                    <span className="metric-chip">34% faster</span>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Engagement</div>
                    <div className="metric-value">92%</div>
                    <span className="metric-chip">Quarterly pulse</span>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Attrition</div>
                    <div className="metric-value">-17%</div>
                    <span className="metric-chip">YoY change</span>
                  </div>
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block">Upcoming</small>
                  <small className="d-block">• 12 new joiners onboarding this week</small>
                  <small className="d-block">• 4 performance cycles in progress</small>
                  <small className="d-block">• 9 employees nearing leave balance limit</small>
                </div>

                <div className="hero-device-footer">
                  <div className="d-flex align-items-center">
                    <span className="avatar"></span>
                    <span className="avatar"></span>
                    <span className="avatar"></span>
                    <span className="ms-2">HR, Finance & IT in sync</span>
                  </div>
                  <span className="device-pill">Syncs with payroll, ATS & ERP</span>
                </div>
              </div>
            </div>
          </div>

          {/* HERO STRIP */}
          <div className="row g-3 hero-strip mt-4">
            <div className="col-6 col-lg-3">
              <div className="hero-strip-card h-100">
                <i className="fa-solid fa-user-tie"></i>
                <h6 className="mt-1 mb-1">Core HR</h6>
                <p>Single source of truth for your people data.</p>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="hero-strip-card h-100">
                <i className="fa-solid fa-briefcase"></i>
                <h6 className="mt-1 mb-1">Hiring & onboarding</h6>
                <p>From offer letter to day one, in one flow.</p>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="hero-strip-card h-100">
                <i className="fa-regular fa-clock"></i>
                <h6 className="mt-1 mb-1">Time & attendance</h6>
                <p>Smart shifts, geo-tagging & approvals.</p>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="hero-strip-card h-100">
                <i className="fa-solid fa-chart-line"></i>
                <h6 className="mt-1 mb-1">Performance & OKRs</h6>
                <p>Goals, reviews and feedback that stick.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BACK TO TOP */}
      <button
        id="backToTop"
        className="btn btn-primary btn-pill"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <i className="fa-solid fa-arrow-up"></i>
      </button>
    </>
  );
};

export default Home;
