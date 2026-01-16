import React from "react";
import "../../assets/styles/admin.css";

export default function DeleteConfirmModal({
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item?",
  onConfirm,
  onClose,
  loading = false
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-card delete">
        <div className="delete-icon">
          <i className="fa-solid fa-trash"></i>
        </div>

        <h2>{title}</h2>
        <p>{message}</p>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
