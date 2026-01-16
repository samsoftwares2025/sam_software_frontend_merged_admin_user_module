// src/pages/auth/UserLogin.jsx
import React from "react";
import "../../assets/styles/Loginuser.css";

const UserLogin = () => {
  return (
    <div className="login-wrapper">
      <div className="login-container">

        {/* LEFT SECTION */}
        <div className="login-left">
          <h1>
            Your HR Partner <br /> for Growth & Success
          </h1>
          <p>
            Simplify HR operations with clarity, automation, and people-first
            insights.
          </p>

          <ul className="features">
            <li>✔ Trusted by growing teams</li>
            <li>✔ Smart HR automation</li>
            <li>✔ 24/7 Platform Access</li>
          </ul>
        </div>

        {/* RIGHT SECTION */}
        <div className="login-right">
          <h2>Welcome Back</h2>
          <p className="subtitle">Login to your account</p>

          <form className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="form-options">
              <label className="remember">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="forgot">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="login-btn">
              Sign In
            </button>
          </form>

          <p className="signup-text">
            Don’t have an account? <span>Contact Admin</span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default UserLogin;
