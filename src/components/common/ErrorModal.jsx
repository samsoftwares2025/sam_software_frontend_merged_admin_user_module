import React from "react";
import "../../assets/styles/admin.css";

export default function ErrorModal({ message, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card error">
        <div className="error-icon">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>

        <h2>Error</h2>

        <p style={{ marginTop: "10px" }}>
          {message || "Something went wrong."}
        </p>

        <button className="btn btn-primary" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
