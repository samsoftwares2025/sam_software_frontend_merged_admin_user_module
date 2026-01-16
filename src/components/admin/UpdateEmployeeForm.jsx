import React, { useRef, useState } from "react";

function UpdateEmployeeForm({ initialValues = {}, onSubmit }) {
  const formRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (photoFile) formData.append("image", photoFile);

    formData.append("name", e.target.full_name.value);
    formData.append("date_of_birth", e.target.dob.value);

    onSubmit(formData);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit} ref={formRef}>
      <div className="form-section">
        <h2 className="section-title">
          <i className="fa-solid fa-user" /> Edit Employee
        </h2>

        <div className="photo-upload">
          <div className="photo-preview">
            {photoPreview ? (
              <img src={photoPreview} alt="Employee" />
            ) : (
              <i className="fa-solid fa-user" />
            )}
          </div>

          <label className="upload-btn">
            Upload Photo
            <input type="file" hidden onChange={handlePhotoChange} />
          </label>
        </div>

        <div className="form-grid">
          <input
            className="form-input"
            name="full_name"
            defaultValue={initialValues.first_name || ""}
            required
          />

          <input
            type="date"
            className="form-input"
            name="dob"
            defaultValue={initialValues.dob || ""}
            required
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Update Employee
        </button>
      </div>
    </form>
  );
}

export default UpdateEmployeeForm;
