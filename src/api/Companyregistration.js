import http from "./http";

export const companyRegister = async (form) => {
  const fd = new FormData();

  /* COMPANY FIELDS */
  fd.append("name", form.company_name || "");
  fd.append("email", form.company_email || "");
  fd.append("company_phone", form.company_phone || "");
  fd.append("cin_number", form.registration_number || "");
  fd.append("website", form.website || "");
  fd.append("no_of_employees", form.company_size || "");
  fd.append("registration_address", form.company_address || "");
  fd.append("city", form.city || "");
  fd.append("state", form.state || "");
  fd.append("postal_code", form.postal_code || "");
  fd.append("country", form.country || "");
  fd.append("finance_email", form.billing_email || "");
  fd.append("gst_vat", form.gst_vat_number || "");
  fd.append("tax", form.pan_tax_id || "");
  fd.append("currency", form.currency || "");




if (Array.isArray(form.industry)) {
  form.industry.forEach((id) => {
    fd.append("industries[]", id);
  });
}




  if (form.logo instanceof File) {
    fd.append("logo", form.logo);
  }

  /* USER DATA (ADMIN ACCOUNT) */
  fd.append("full_name", form.contact_name || "");
  fd.append("official_email", form.admin_email || "");
  fd.append("personal_email", form.contact_email || "");
  fd.append("phone", form.admin_phone || "");

    fd.append("payment_status", "Pending");


  /* SECURITY */
  fd.append("password", form.password || "");
  fd.append("confirm_password", form.confirm_password || "");
  fd.append("is_agree_terms", form.terms ? "True" : "False");

  try {
    const response = await http.post("/users/user-registration/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("CompanyRegister error:", error);
    throw error;
  }
};



export const checkExists = async (field, value) => {
  if (!value.trim()) return { exists: false };

  try {
    const fd = new FormData();
    fd.append("field", field);
    fd.append("value", value);

    const userId = localStorage.getItem("user_id") || "";
    fd.append("user_id", userId);

    const response = await http.post(
      "/hr/check-company-field-exists/",
      fd
    );

    return {
      exists: !response.data.success,
      backendMsg: response.data.message,
    };

  } catch (err) {
    console.error("checkExists error:", err);
    return { exists: false };
  }
};



export const getIndustries = async () => {
  try {
    const response = await http.post("/companies/list-industries/", {}); 
    return response.data;
  } catch (error) {
    console.error("Fetch industries error:", error);
    return { success: false, industries: [] };
  }
};


// src/api/admin/locationApi.js

/**
 * 🗺️ Get All Countries
 */
export const getAllCountries = async () => {
  const { data } = await http.post("/companies/list-all-countries/");
  return data;
};

/**
 * 🏛️ Get States by Country
 */
export const getStatesByCountry = async (country_name) => {
  const { data } = await http.post("/companies/list-states-by-country/", {
    country_name,
  });
  return data;
};







export const getCitiesByState = async (country, state) => {
  const response = await http.post("/companies/list-cities-by-state/", {
    country_name: country,
    state_name: state,
  });

  console.log("🌍 CITY API RAW RESPONSE:", response.data);
  return response.data;
};