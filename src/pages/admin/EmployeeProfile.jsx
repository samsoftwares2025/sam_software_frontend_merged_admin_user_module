import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";

import { getEmployeeById } from "../../api/admin/employees";

function EmployeeProfile() {
  const { id } = useParams(); // ✅ FIX
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("employees");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        const res = await getEmployeeById(id); // ✅ PASS ID

        if (!res?.employee) {
          throw new Error("Employee data not found");
        }

        if (mounted) setProfile(res.employee);
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => (mounted = false);
  }, [id]);

  if (loading) return <main className="main">Loading profile...</main>;
  if (error) return <main className="main">{error}</main>;
  if (!profile) return <main className="main">No profile data found.</main>;

  return (
    <div className="container">
      <Sidebar
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        openSection={openSection}
        setOpenSection={setOpenSection}
      />

      <main className="main">
        <Header onMenuClick={() => setIsSidebarOpen((p) => !p)} />

        <div className="page-title">
          <h3>Employee Profile</h3>
        </div>

        <div className="edit-btn-wrapper">
          <button
            className="btn btn-primary edit-btn"
            onClick={() =>
              navigate(`/admin/update-employee-profile/${profile.id}`)
            }
          >
            Update
          </button>
        </div>

        <section className="profile-container">
          {/* PROFILE CARD */}
          <div className="card profile-card">
            <div className="profile-header">
              <div
                className="profile-photo"
                onClick={() => profile.image && setIsOpen(true)}
              >
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="profile-photo-img"
                  />
                ) : (
                  <span className="profile-initial">
                    {profile.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>

              <div className="profile-name">{profile.name}</div>
            </div>
          </div>
          {/* Modal */}
          {isOpen && (
            <div className="image-modal" onClick={() => setIsOpen(false)}>
              <div
                className="image-modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="image-modal-close"
                  onClick={() => setIsOpen(false)}
                >
                  ✕
                </button>

                <img src={profile.image} alt={profile.name} />
              </div>
            </div>
          )}

          {/* PERSONAL INFO */}
          <div className="card info-card">
            <h3>Personal Information</h3>

            <p>
              <b>Official Email:</b> {profile.official_email || "-"}
            </p>
            <p>
              <b>Personal Email:</b> {profile.personal_email || "-"}
            </p>
            <p>
              <b>Phone:</b> {profile.phone || "-"}
            </p>
            <p>
              <b>Gender:</b> {profile.gender || "-"}
            </p>
            <p>
              <b>DOB:</b>{" "}
              {profile.date_of_birth
                ? new Date(profile.date_of_birth).toLocaleDateString()
                : "-"}
            </p>
            <p>
              <b>Qualification:</b> {profile.qualification || "-"}
            </p>
          </div>

          {/* ADDRESS */}
          <div className="card info-card">
            <h3>Address Details</h3>
            <p>
              <b>Address:</b> {profile.address || "-"}
            </p>
            <p>
              <b>City:</b> {profile.city || "-"}
            </p>
            <p>
              <b>State:</b> {profile.state || "-"}
            </p>
            <p>
              <b>Country:</b> {profile.country || "-"}
            </p>
            <p>
              <b>Postal Code:</b> {profile.postal_code || "-"}
            </p>
          </div>

          {/* WORK INFO */}
          <div className="card info-card">
            <h3>Work Information</h3>
            <p>
              <b>Department:</b> {profile.department || "-"}
            </p>
            <p>
              <b>Designation:</b> {profile.designation || "-"}
            </p>
            {!profile.is_client_admin && (
              <p>
                <b>User Role:</b> {profile.user_role || "-"}
              </p>
            )}

            <p>
              <b>Employment Type:</b> {profile.employment_type || "-"}
            </p>

            <p>
              <b>Work Location:</b> {profile.work_location || "-"}
            </p>
            <p>
              <b>Joining Date:</b>{" "}
              {profile.joining_date
                ? new Date(profile.joining_date).toLocaleDateString()
                : "-"}
            </p>
            <p>
              <b>Last Working Date:</b>{" "}
              {profile.last_working_date
                ? new Date(profile.last_working_date).toLocaleDateString()
                : "-"}
            </p>
            <p>
              <b>Status:</b> {profile.is_active ? "Active" : "Inactive"}
            </p>
          </div>

          {/* BANK */}
          <div className="card info-card">
            <h3>Bank Details</h3>
            <p>
              <b>Bank Name:</b> {profile.bank_name || "-"}
            </p>
            <p>
              <b>Account Number:</b> {profile.account_number || "-"}
            </p>
            <p>
              <b>IFSC Code:</b> {profile.ifsc_code || "-"}
            </p>
          </div>

          {/* EMERGENCY */}
          <div className="card info-card">
            <h3>Emergency Contact</h3>
            <p>
              <b>Name:</b> {profile.emergency_contact_name || "-"}
            </p>
            <p>
              <b>Relationship:</b>{" "}
              {profile.emergency_contact_relationship || "-"}
            </p>
            <p>
              <b>Phone:</b> {profile.emergency_contact_number || "-"}
            </p>
            <p>
              <b>Email:</b> {profile.emergency_contact_email || "-"}
            </p>
          </div>
        </section>

        <div
          id="sidebarOverlay"
          className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        />
      </main>
    </div>
  );
}

export default EmployeeProfile;
