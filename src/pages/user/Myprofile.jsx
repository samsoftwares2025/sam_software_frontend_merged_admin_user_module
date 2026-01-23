import React, { useEffect, useState } from "react";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/user.css";

import LoaderOverlay from "../../components/common/LoaderOverlay";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

import { getMyProfile, updateMyProfile } from "../../api/user/myprofile";

const Myprofile = () => {
  /* ===== SIDEBAR STATE ===== */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===== EDIT STATE ===== */
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  /* ===== MODALS ===== */
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* =========================
     FETCH PROFILE
  ========================= */
  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        if (!res?.employee) {
          throw new Error("Employee data not found.");
        }

        if (mounted) {
          setProfile(res.employee);
          setName(res.employee.name || "");
          setImagePreview(res.employee.image || null);
        }
      } catch (err) {
        if (mounted) {
          setErrorMessage(err.message || "Failed to load profile.");
          setShowErrorModal(true);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => (mounted = false);
  }, []);

  /* =========================
     SAVE PROFILE
  ========================= */
  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);

      const payload = { name };
      if (profileImage) payload.image = profileImage;

      await updateMyProfile(payload, profile);

      setProfile((prev) => ({
        ...prev,
        name,
        image: imagePreview || prev.image,
      }));

      setIsEditing(false);
      setProfileImage(null);
      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage(err?.message || "Failed to update profile.");
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     CANCEL EDIT
  ========================= */
  const handleCancel = () => {
    setIsEditing(false);
    setName(profile?.name || "");
    setProfileImage(null);
    setImagePreview(profile?.image || null);
  };

  if (loading) return <main className="main">Loading profile...</main>;
  if (!profile) return <main className="main">No profile data found.</main>;

  return (
    <>
      {/* ===== LOADER ===== */}
      {saving && <LoaderOverlay />}

      {/* ===== ERROR MODAL ===== */}
      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}

      {/* ===== SUCCESS MODAL ===== */}
      {showSuccessModal && (
        <SuccessModal
          message="Your profile information has been updated successfully."
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      <div className="container">
        {/* ===== SIDEBAR ===== */}
        <Sidebar
          isMobileOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          openSection={openSection}
          setOpenSection={setOpenSection}
        />

        {/* ===== MAIN ===== */}
        <main className="main">
          {/* ===== HEADER (FIXED) ===== */}
          <Header onMenuClick={() => setIsSidebarOpen((p) => !p)} />

          {/* ACTION BUTTONS */}
          <div className="profile-actions">
            {!isEditing ? (
              <button
                className="btn btn-edit btn-primary"
                onClick={() => setIsEditing(true)}
              >
                <i className="fa-solid fa-pen-to-square" />
                <span>Edit</span>
              </button>
            ) : (
              <>
                <button
                  className="btn btn-cancel"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-save btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </>
            )}
          </div>

          <section className="profile-container">
            {/* ================= PROFILE CARD ================= */}
            <div className="card profile-card">
              <div className="profile-card-left">
                <div className="profile-photo-wrapper">
                  <div className="profile-photo">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="profile-img"
                      />
                    ) : (
                      profile.name?.charAt(0)?.toUpperCase() || "U"
                    )}
                  </div>

                  {isEditing && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        id="profileImageInput"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          if (imagePreview?.startsWith("blob:")) {
                            URL.revokeObjectURL(imagePreview);
                          }

                          setProfileImage(file);
                          setImagePreview(URL.createObjectURL(file));
                        }}
                      />

                      <button
                        type="button"
                        className="photo-edit-btn"
                        title="Change profile photo"
                        onClick={() =>
                          document
                            .getElementById("profileImageInput")
                            .click()
                        }
                      >
                        ✎
                      </button>
                    </>
                  )}
                </div>

                <div>
                  {isEditing ? (
                    <input
                      className="name-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  ) : (
                    <h2>{profile.name || "-"}</h2>
                  )}
                  <p>{profile.designation || "-"}</p>
                  <p>Employee ID: {profile.employee_id || "-"}</p>
                </div>
              </div>
            </div>

            {/* ================= PERSONAL INFO ================= */}
            <div className="card info-card">
              <h3>Personal Information</h3>
              <p><b>Official Email:</b> {profile.official_email || "-"}</p>
              <p><b>Personal Email:</b> {profile.personal_email || "-"}</p>
              <p><b>Phone:</b> {profile.phone || "-"}</p>
              <p><b>Gender:</b> {profile.gender || "-"}</p>
              <p><b>DOB:</b> {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : "-"}</p>
              <p><b>Qualification:</b> {profile.qualification || "-"}</p>
            </div>

            {/* ================= ADDRESS ================= */}
            <div className="card info-card">
              <h3>Address Details</h3>
              <p><b>Address:</b> {profile.address || "-"}</p>
              <p><b>City:</b> {profile.city || "-"}</p>
              <p><b>State:</b> {profile.state || "-"}</p>
              <p><b>Country:</b> {profile.country || "-"}</p>
              <p><b>Postal Code:</b> {profile.postal_code || "-"}</p>
            </div>

            {/* ================= WORK ================= */}
            <div className="card info-card">
              <h3>Work Information</h3>
              <p><b>Department:</b> {profile.department || "-"}</p>
              <p><b>Designation:</b> {profile.designation || "-"}</p>
              <p><b>User Role:</b> {profile.user_role || "-"}</p>
              <p><b>Employment Type:</b> {profile.employment_type || "-"}</p>
              <p><b>Work Location:</b> {profile.work_location || "-"}</p>
              <p><b>Joining Date:</b> {profile.joining_date ? new Date(profile.joining_date).toLocaleDateString() : "-"}</p>
            </div>

            {/* ================= BANK ================= */}
            <div className="card info-card">
              <h3>Bank Details</h3>
              <p><b>Bank Name:</b> {profile.bank_name || "-"}</p>
              <p><b>Account Number:</b> {profile.account_number || "-"}</p>
              <p><b>IFSC Code:</b> {profile.ifsc_code || "-"}</p>
            </div>

            {/* ================= EMERGENCY ================= */}
            <div className="card info-card">
              <h3>Emergency Contact</h3>
              <p><b>Name:</b> {profile.emergency_contact_name || "-"}</p>
              <p><b>Relationship:</b> {profile.emergency_contact_relationship || "-"}</p>
              <p><b>Phone:</b> {profile.emergency_contact_number || "-"}</p>
              <p><b>Email:</b> {profile.emergency_contact_email || "-"}</p>
            </div>
          </section>
        </main>

        {/* ===== OVERLAY ===== */}
        {isSidebarOpen && (
          <div
            className="sidebar-overlay show"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default Myprofile;
