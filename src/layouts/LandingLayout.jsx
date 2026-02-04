import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/home/Navbar";
import Footer from "../components/home/Footer";
import LandingWrapper from "../components/home/LandingWrapper";

import "../assets/styles/landingpage.css";

const LandingLayout = () => {
  useEffect(() => {
    // Enable scrolling for landing pages
    document.body.style.overflowY = "auto";

    return () => {
      // Restore previous behavior (user/admin pages)
      document.body.style.overflowY = "hidden";
    };
  }, []);



  return (
    <LandingWrapper>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </LandingWrapper>
  );
};

export default LandingLayout;
