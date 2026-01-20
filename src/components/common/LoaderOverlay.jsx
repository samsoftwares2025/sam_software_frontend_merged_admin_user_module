// src/components/common/LoaderOverlay.jsx

import React from "react";
import "../../assets/styles/loader.css";

export default function LoaderOverlay() {
  return (
    <div className="loader-overlay">
      <div className="loader"></div>
      <p>Please wait...</p>
    </div>
  );
}
