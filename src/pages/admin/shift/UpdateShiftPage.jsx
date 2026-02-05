import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import Header from "../../../components/common/Header";
import LoaderOverlay from "../../../components/common/LoaderOverlay";
import SuccessModal from "../../../components/common/SuccessModal";
import ErrorModal from "../../../components/common/ErrorModal";
import { toSentenceCase } from "../../../utils/textFormatters";
import { getShiftDetails, updateShift } from "../../../api/admin/shift";
import "../../../assets/styles/admin.css";

function UpdateShiftPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shiftId = searchParams.get("id");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    start_time: "",
    end_time: "",
    grace_period: 15,
  });

  // UI Modals
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // Added state for BE message
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (shiftId) {
      loadShiftData();
    }
  }, [shiftId]);

  const loadShiftData = async () => {
    try {
      const resp = await getShiftDetails(shiftId);
      if (resp.success) {
        setFormData({
          name: resp.data.name,
          start_time: resp.data.start_time,
          end_time: resp.data.end_time,
          grace_period: resp.data.grace_period,
        });
      } else {
        setErrorMessage(resp.message || "Failed to load shift details.");
        setShowError(true);
      }
    } catch (err) {
      setErrorMessage("Error connecting to server.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await updateShift(shiftId, formData);
      if (resp.success) {
        // Use the message sent from your Django JsonResponse
        setSuccessMessage(resp.message || "Shift updated successfully!");
        setShowSuccess(true);
      } else {
        setErrorMessage(resp.message || "Update failed.");
        setShowError(true);
      }
    } catch (err) {
      // Capture the specific error message sent by Django
      const backendMessage = err.response?.data?.message;
      setErrorMessage(backendMessage || "An error occurred during update.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoaderOverlay />}
      {showSuccess && (
        <SuccessModal
          message={successMessage} // Passing the message from state
          onClose={() => navigate("/admin/shifts")}
        />
      )}
      {showError && (
        <ErrorModal 
          message={errorMessage} 
          onClose={() => setShowError(false)} 
        />
      )}

      <div className="container">
        <Sidebar 
          isMobileOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          openSection="organization" 
        />
        <main className="main">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <div className="page-title">
            <h3>Update Shift</h3>
            <p className="subtitle">Modify shift timings for future attendance logs.</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label required">Shift Name</label>
                  <input
                    type="text" 
                    name="name" 
                    className="form-input"
                    value={formData.name} 
                    onChange={handleChange}
                    onBlur={() => setFormData(p => ({ ...p, name: toSentenceCase(formData.name) }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Start Time</label>
                  <input 
                    type="time" 
                    name="start_time" 
                    className="form-input" 
                    value={formData.start_time} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">End Time</label>
                  <input 
                    type="time" 
                    name="end_time" 
                    className="form-input" 
                    value={formData.end_time} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Grace Period (Minutes)</label>
                  <input 
                    type="number" 
                    name="grace_period" 
                    className="form-input" 
                    value={formData.grace_period} 
                    onChange={handleChange} 
                    min="0" 
                  />
                </div>
              </div>

              <div className="form-actions" style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Updating..." : "Update Shift"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

export default UpdateShiftPage;