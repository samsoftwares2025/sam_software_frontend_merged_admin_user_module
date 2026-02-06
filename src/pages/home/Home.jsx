import React from "react";

const Home = () => {
  return (
    <>
      {/* ================= HERO CAROUSEL ================= */}
      <section className="hero-carousel" aria-label="Homepage highlights">
        <div className="hero-slide slide-1">
          <div className="hero-overlay">
            <div className="hero-content">
              <h1>Sam Software</h1>
              <p>
                Modern HR & compliance solutions designed for fast-growing
                organizations.
              </p>
            </div>
          </div>
        </div>

        <div className="hero-slide slide-2">
          <div className="hero-overlay">
            <div className="hero-content">
              <h1>Enterprise Ready</h1>
              <p>
                Secure, scalable and compliant — built with enterprise
                standards.
              </p>
            </div>
          </div>
        </div>

        <div className="hero-slide slide-3">
          <div className="hero-overlay">
            <div className="hero-content">
              <h1>People First</h1>
              <p>
                Empower teams, simplify HR operations and ensure compliance
                with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>
{/* ================= ABOUT US ================= */}
<section className="about-section" id="about">
  <div className="about-container">
    <div className="about-grid">
      {/* CONTENT */}
      <div className="about-content">
  <span className="about-eyebrow">About Us</span>
  <h2>
    We build simple software <br /> that helps businesses grow
  </h2>

  <p>
    Sam Software is a growing technology company that creates smart
    software and accounting solutions for modern businesses. We focus
    on making daily work easier, faster, and more organized.
  </p>

  <p>
    Our goal is simple — reduce complexity, save time, and give
    businesses tools they can actually enjoy using. We design our
    products to be secure, scalable, and easy for everyone.
  </p>

  <div className="about-stats">
    <div className="stat">
      <strong>10+</strong>
      <span>Business Modules</span>
    </div>
    <div className="stat">
      <strong>99.9%</strong>
      <span>System Uptime</span>
    </div>
    <div className="stat">
      <strong>24/7</strong>
      <span>Support & Security</span>
    </div>
  </div>
</div>


      {/* IMAGE WITH FLOATING ELEMENTS */}
      <div className="about-image">
        <img
          src="https://images.pexels.com/photos/7439771/pexels-photo-7439771.jpeg"
          alt="Team collaboration"
          loading="lazy"
        />
        <div className="floating-element">🚀</div>
        <div className="floating-element">💡</div>
        <div className="floating-element">⚡</div>
      </div>
    </div>
  </div>
</section>

{/* ================= OUR SOLUTIONS ================= */}
<section className="industry-section" id="solutions">
  <div className="industry-container">
    <header className="industry-header">
      <h2>
        Simple solutions <br />
        built for everyday business needs
      </h2>
    </header>

    <div className="industry-grid">
      <article className="industry-card">
        <img
          src="https://images.pexels.com/photos/4342125/pexels-photo-4342125.jpeg"
          alt="HR Management"
        />
        <div className="industry-overlay">
          <span className="industry-tag">HR Management</span>
          <h3>
            Simple tools to manage employees, attendance, payroll, and everyday
            HR tasks without any hassle.
          </h3>
          <span className="industry-cta">Learn more →</span>
        </div>
      </article>

      <article className="industry-card">
        <img
          src="https://images.pexels.com/photos/326503/pexels-photo-326503.jpeg"
          alt="Website Design & Templates"
        />
        <div className="industry-overlay">
          <span className="industry-tag">Website Design</span>
          <h3>
            Clean, modern website designs and ready-made templates that work
            smoothly on all devices.
          </h3>
          <span className="industry-cta">Learn more →</span>
        </div>
      </article>

      <article className="industry-card">
        <img
          src="https://images.pexels.com/photos/7988752/pexels-photo-7988752.jpeg"
          alt="Custom Software Solutions"
        />
        <div className="industry-overlay">
          <span className="industry-tag">Software Solutions</span>
          <h3>
            We build software that fits your business needs — easy to use,
            scalable, and dependable.
          </h3>
          <span className="industry-cta">Learn more →</span>
        </div>
      </article>

      <article className="industry-card">
        <img
          src="https://images.pexels.com/photos/221174/pexels-photo-221174.png"
          alt="Accounting & Finance Solutions"
        />
        <div className="industry-overlay">
          <span className="industry-tag">Accounting & Finance</span>
          <h3>
            User-friendly accounting tools to manage billing, expenses, reports,
            and financial records with confidence.
          </h3>
          <span className="industry-cta">Learn more →</span>
        </div>
      </article>
    </div>
  </div>
</section>


<section className="why-section" id="why-samsoftware">
  <div className="why-container">
    <header className="why-header">
      <span className="why-eyebrow">Why SamSoftwares</span>
      <h2>
        Technology built for trust, scale & growth
      </h2>
      <p>
        We help organizations modernize operations with secure, scalable and people-centric software solutions.
      </p>
    </header>

    <div className="why-grid">
      {/* Card 1 */}
      <article className="why-card">
        <div className="why-card-image">
          <img
            src="https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg"
            alt="Enterprise Architecture"
            loading="lazy"
          />
        </div>
        <div className="why-card-content">
          <span className="why-card-icon">🏛️</span>
          <h3>Enterprise-Grade Architecture</h3>
          <p>
            Platforms designed with security, scalability and compliance at the core — ready for enterprise adoption.
          </p>
        </div>
        <div className="why-card-floater">✓</div>
      </article>

      {/* Card 2 */}
      <article className="why-card">
        <div className="why-card-image">
          <img
            src="https://images.pexels.com/photos/12902862/pexels-photo-12902862.jpeg"
            alt="Domain Expertise"
            loading="lazy"
          />
        </div>
        <div className="why-card-content">
          <span className="why-card-icon">⚡</span>
          <h3>Deep Domain Expertise</h3>
          <p>
            Combined expertise in HR, compliance and modern technology to solve real business challenges.
          </p>
        </div>
        <div className="why-card-floater">✓</div>
      </article>

      {/* Card 3 */}
      <article className="why-card">
        <div className="why-card-image">
          <img
            src="https://images.pexels.com/photos/5473301/pexels-photo-5473301.jpeg"
            alt="Future Ready Technology"
            loading="lazy"
          />
        </div>
        <div className="why-card-content">
          <span className="why-card-icon">🚀</span>
          <h3>Modern & Future-Ready</h3>
          <p>
            Built using cloud-ready, scalable architectures that evolve as your organization grows.
          </p>
        </div>
        <div className="why-card-floater">✓</div>
      </article>

      {/* Card 4 */}
      <article className="why-card">
        <div className="why-card-image">
          <img
            src="https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg"
            alt="Security and Compliance"
            loading="lazy"
          />
        </div>
        <div className="why-card-content">
          <span className="why-card-icon">🔒</span>
          <h3>Security & Compliance First</h3>
          <p>
            Designed to meet regulatory standards while ensuring data protection and operational integrity.
          </p>
        </div>
        <div className="why-card-floater">✓</div>
      </article>
    </div>
  </div>
</section>


 <section className="team-section" id="team">
        <div className="team-container">
          <header className="team-header">
            <span className="team-eyebrow">Leadership Team</span>
            <h2>Meet our expert leadership team</h2>
            <p>
              Industry veterans with decades of combined experience in HR technology, 
              compliance, and enterprise software development.
            </p>
          </header>

          <div className="team-grid">
            {/* Team Member 1 */}
            <article className="team-member">
              <div className="member-image" data-role="CEO & Founder">
                <img
                  src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
                  alt="Alex Johnson"
                  loading="lazy"
                />
              </div>
              <div className="member-info">
                <h3>Alex Johnson</h3>
                <span>CEO & Founder</span>
                <p>
                  Former enterprise software executive with 15+ years in HR 
                  technology and platform development.
                </p>
                <div className="member-social">
                  <a href="#" aria-label="LinkedIn">in</a>
                  <a href="#" aria-label="Twitter">𝕏</a>
                </div>
              </div>
            </article>

            {/* Team Member 2 */}
            <article className="team-member">
              <div className="member-image" data-role="CTO">
                <img
                  src="https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg"
                  alt="Sarah Chen"
                  loading="lazy"
                />
              </div>
              <div className="member-info">
                <h3>Sarah Chen</h3>
                <span>Chief Technology Officer</span>
                <p>
                  Cloud architecture expert specializing in scalable, secure 
                  enterprise platforms and AI-driven solutions.
                </p>
                <div className="member-social">
                  <a href="#" aria-label="LinkedIn">in</a>
                  <a href="#" aria-label="GitHub">gh</a>
                </div>
              </div>
            </article>

            {/* Team Member 3 */}
            <article className="team-member">
              <div className="member-image" data-role="Head of Compliance">
                <img
                  src="https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg"
                  alt="Michael Rodriguez"
                  loading="lazy"
                />
              </div>
              <div className="member-info">
                <h3>Michael Rodriguez</h3>
                <span>Head of Compliance</span>
                <p>
                  Regulatory compliance specialist with expertise in global 
                  HR regulations and enterprise risk management.
                </p>
                <div className="member-social">
                  <a href="#" aria-label="LinkedIn">in</a>
                  <a href="#" aria-label="Email">✉</a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>


{/* ================= TESTIMONIALS ================= */}
<section className="testimonials-section" id="testimonials">
  <div className="testimonials-container">
    <header className="testimonials-header">
      <span className="testimonials-eyebrow">Client Success</span>
      <h2>Trusted by leading organizations</h2>
      <p>See what our clients say about working with us.</p>
    </header>

    <div className="testimonials-grid">
      <div className="testimonial-card">
        <div className="testimonial-content">
          <div className="testimonial-rating">
            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
          </div>
          <p>"SamSoftware transformed our HR operations with their platform. Implementation was smooth and support has been exceptional."</p>
        </div>
        <div className="testimonial-author">
          <div className="author-avatar">JD</div>
          <div className="author-info">
            <h4>John Davis</h4>
            <span>CTO, TechCorp Inc.</span>
          </div>
        </div>
      </div>

      <div className="testimonial-card">
        <div className="testimonial-content">
          <div className="testimonial-rating">
            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
          </div>
          <p>"The compliance features saved us countless hours of manual work. The platform is intuitive and powerful."</p>
        </div>
        <div className="testimonial-author">
          <div className="author-avatar">SR</div>
          <div className="author-info">
            <h4>Sarah Roberts</h4>
            <span>HR Director, GrowthScale</span>
          </div>
        </div>
      </div>

      <div className="testimonial-card">
        <div className="testimonial-content">
          <div className="testimonial-rating">
            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
          </div>
          <p>"Excellent support team and robust platform. It scaled perfectly as we grew from 50 to 500 employees."</p>
        </div>
        <div className="testimonial-author">
          <div className="author-avatar">MK</div>
          <div className="author-info">
            <h4>Michael Kim</h4>
            <span>CEO, InnovateLabs</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


      {/* ================= CONTACT ================= */}
      <section className="contact-section" id="contact">
        <div className="contact-container">
          <div className="contact-map">
            <iframe
              title="Company Location"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3922.7114211137323!2d76.2097936!3d10.5233802!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba7ee4429182c19%3A0x8b9a44cf4dbcc798!2sAnanya%20Tower!5e0!3m2!1sen!2sin!4v1770023822173!5m2!1sen!2sin"
            />

            
          </div>

          <div className="contact-form">
            <span className="contact-eyebrow">Get in Touch</span>
            <h2>Let’s talk about your business</h2>
            <p>
              Tell us about your requirements and our team will get back to you.
            </p>

            <form>
              <div className="form-row">
                <input type="text" placeholder="Full Name" required />
                <input type="email" placeholder="Email Address" required />
              </div>

              <input type="text" placeholder="Company Name" />
              <textarea rows="4" placeholder="How can we help you?" />

              <button type="submit" className="primary-btn">
                Submit Request
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
