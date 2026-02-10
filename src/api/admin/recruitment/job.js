// src/api/admin/recruitment/job.js
import http from "../../http";

/**
 * Helper: get userId safely from localStorage
 */
const getUserId = () => {
  return localStorage.getItem("userId");
};

/* ============================================================
   FETCH DROPDOWNS (Updated to POST to pass Authentication)
   ============================================================ */

export const fetchSkills = async () => {
  const userId = getUserId();
  const { data } = await http.post("/recruitment/list-all-skills/", {
    user_id: userId,
  });
  // Returns the array inside the 'skills' key from your Django response
  return data.skills; 
};

export const fetchCategories = async () => {
  const userId = getUserId();
  const { data } = await http.post("/recruitment/list-all-job-category/", {
    user_id: userId,
  });
  // Returns the array inside the 'job_categories' key from your Django response
  return data.job_categories;
};

/* ============================================================
   JOB VACANCY ACTIONS
   ============================================================ */

// src/api/admin/recruitment/job.js

export const getSkillSuggestions = async (query) => {
  const userId = getUserId();
  const { data } = await http.post("/recruitment/get_skill_suggestions/", {
    user_id: userId,
    q: query,
  });
  // We return the raw names for the custom list logic
  return data.skills.map(s => ({ id: s.id, name: s.name }));
};
export const getCategorySuggestions = async (query) => {
  const userId = getUserId();
  const { data } = await http.post("/recruitment/get_category_suggestions/", {
    user_id: userId,
    q: query,
  });
  return data.categories; // Expected: [{id, name}, ...]
};

export const getCompanyDefaultLocation = async () => {
  const userId = localStorage.getItem("user_id");
  const { data } = await http.post("/recruitment/get-default-location/", {
    user_id: userId,
  });
  return data.location; // Returns "City, State"
};

// Check if this name matches exactly (case-sensitive)
export const createJob = async (formData) => {
  const userId = localStorage.getItem("userId");
  const { data } = await http.post("/recruitment/add-job-vacancy/", {
    ...formData,
    user_id: userId,
  });
  return data;
};
/**
 * Fetch all jobs for the logged-in user's company
 */
export const listJobVacancies = async (payload) => {
  const userId = getUserId();
  const { data } = await http.post("/recruitment/list-job-vacancies/", {
    ...payload, // Spreads page, page_size, and search
    user_id: userId,
  });
  return data;
};


export const getVaccancyById = async (jobId) => {
  const userId = localStorage.getItem("userId");
  const { data } = await http.post("/recruitment/get-job-vacancy/", {
    user_id: userId,
    job_id: jobId,
  });
  return data.job; // Should return { title, description, skills: [], category_name, ... }
};

export const updateVaccancy = async (jobId, jobData) => {
  const userId = localStorage.getItem("userId");
  const { data } = await http.post("/recruitment/update-job-vacancy/", {
    ...jobData,
    user_id: userId,
    job_id: jobId,
  });
  return data;
};

/**
 * Delete a job vacancy
 */
export const deleteJobVacancy = async (jobId) => {
  const userId = getUserId();
  const { data } = await http.post("/recruitment/delete-job-vacancy/", {
    user_id: userId,
    job_id: jobId,
  });
  return data;
};




export const getPublicCompanyJobs = async (company_slug, search = "", sort = "newest") => {
  // Sending data in the body of the POST request
  const { data } = await http.post(`/recruitment/${company_slug}/jobs/`, {
    search,
    sort
  });
  return data;
};
export const getPublicJobDetail = async (company_slug, job_slug) => {
  // Use the relative path; the 'http' instance already knows the Base URL
  const { data } = await http.get(`/recruitment/${company_slug}/jobs/${job_slug}/`);
  return data;
};








// ... existing helpers (getPublicJobDetail, etc.)

/**
 * Submits a job application with a CV file
 * @param {string} company_slug 
 * @param {string} job_slug 
 * @param {FormData} formData - Must contain full_name, email, phone, cv, cover_letter
 */
export const submitPublicApplication = async (company_slug, job_slug, formData) => {
  const { data } = await http.post(
    `/recruitment/${company_slug}/jobs/${job_slug}/apply/`, 
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};




// recruitment/job.js

export const listActiveVacancies = async () => {
  const userId = getUserId();
  const { data } = await http.post("/recruitment/active-vacancies-list/", { user_id: userId });
  return data;
};

export const listJobApplications = async (filters) => {
  const userId = getUserId();
  const { data } = await http.post("/recruitment/job-applications-list/", { 
    user_id: userId,
    ...filters // Spreads page, search, from_date, to_date, job_id
  });
  return data;
};

export const updateJobApplication = async (applicationId, updateData) => {
  const userId = getUserId();

  // Constructing payload to match your requested pattern
  const payload = {
    application_id: applicationId,
    user_id: userId,
    ...updateData, // This will include status or is_contact
  };

  const { data } = await http.post(
    "/recruitment/update-job-application/",
    payload
  );

  return data;
};



export const deleteJobApplications = async (ids) => {
  const userId = getUserId();

  const payload = {
    ids: ids,
    user_id: userId,
  };

  const { data } = await http.post(
    "/recruitment/delete-job-applications/",
    payload
  );

  return data;
};