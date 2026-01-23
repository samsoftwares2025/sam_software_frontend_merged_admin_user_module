import { useEffect } from "react";

export default function SamSoftwareHR() {
  useEffect(() => {
    const yearSpan = document.getElementById("yearSpan");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    const backToTop = document.getElementById("backToTop");
    const onScroll = () => {
      if (window.scrollY > 300) backToTop?.classList.remove("d-none");
      else backToTop?.classList.add("d-none");
    };
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg nav-wrapper">
        <div className="container">
          <a className="navbar-brand" href="#hero">SamSoftware HR</a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav ms-auto align-items-lg-center">
              {[
                ["Overview", "#hero"],
                ["Features", "#features"],
                ["Platform", "#services"],
                ["Pricing", "#pricing"],
                ["Demo", "#contact"],
              ].map(([label, link]) => (
                <li className="nav-item" key={label}>
                  <a className="nav-link" href={link}>{label}</a>
                </li>
              ))}
              <li className="nav-item ms-lg-3">
                <a href="#contact" className="btn btn-primary btn-pill px-3 py-1">
                  Book a demo
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" className="hero">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <div className="hero-kicker">HR PLATFORM</div>
              <div className="hero-logo">SamSoftware <span>People OS</span></div>
              <h1 className="hero-title">Run HR at flight speed.</h1>
              <p className="hero-subtitle">
                Centralise employee data, automate workflows and get real-time people insights.
              </p>
              <div className="d-flex gap-2 flex-wrap">
                <a href="#contact" className="btn btn-primary btn-pill px-4">Get live demo</a>
                <a href="#pricing" className="btn btn-outline-primary btn-pill px-4">View pricing</a>
              </div>
              <p className="hero-note">Free for your first 25 employees · No credit card required</p>
            </div>
            <div className="col-lg-6">
              <div className="hero-device">Dashboard preview</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="feature-section">
        <div className="container">
          <div className="text-center mb-4">
            <div className="section-kicker">WHY SAMSOFTWARE HR</div>
            <h2>Everything HR needs in one calm view.</h2>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="pricing-section">
        <div className="container">
          <div className="text-center mb-4">
            <div className="section-kicker">PRICING</div>
            <h2>Simple plans, predictable pricing.</h2>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h2 className="text-center">Book a demo</h2>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-bottom d-flex justify-content-between align-items-center">
            <span>© <span id="yearSpan"></span> SamSoftware HR</span>
          </div>
        </div>
      </footer>

      <button id="backToTop" className="btn btn-primary btn-pill d-none">
        ↑
      </button>
    </>
  );
}
