import React from "react";
import "../../assets/styles/admin.css";

export default function SuccessModal({ message, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="success-icon">
          <i className="fa-solid fa-circle-check"></i>
        </div>

        <h2>Success</h2>
        <p style={{ marginTop: "10px" }}>{message}</p>

        <button className="btn btn-primary" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
