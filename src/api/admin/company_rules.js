// src/api/admin/companyRules.js
import http from "../http";

/**
 * Helper: get userId safely (NO THROW)
 */
const getUserId = () => {
  return localStorage.getItem("userId");
};

/**
 * createCompanyRule
 * (multipart/form-data)
 */
export const createCompanyRule = async (formData) => {
  const userId = getUserId();

  formData.append("user_id", userId);

  const { data } = await http.post(
    "/hr/add-rule/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};

/**
 * listCompanyRules
 */
export const listCompanyRules = async () => {
  const userId = getUserId();

  const { data } = await http.post(
    "/hr/list-rules/",
    { user_id: userId }
  );

  return data;
};



/**
 * get company rule ById
 * Fetches full details for a single company rule
 */
export const getRuleById = async (ruleId) => {
  const userId = getUserId();

  const { data } = await http.post(
    "/hr/get-rule/", // Ensure this endpoint exists on your backend
    { 
      user_id: userId,
      rule_id: ruleId 
    }
  );

  return data;
};
/**
 * updateCompanyRule
 * (multipart/form-data)
 */
export const updateCompanyRule = async (ruleId, formData) => {
  const userId = getUserId();

  formData.append("user_id", userId);
  formData.append("rule_id", ruleId);

  const { data } = await http.post(
    "/hr/update-rule/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};

/**
 * deleteCompanyRule
 */
export const deleteCompanyRule = async (ruleId) => {
  const userId = getUserId();

  const payload = {
    rule_id: ruleId,
    user_id: userId,
  };

  const { data } = await http.post(
    "/hr/delete-rule/",
    payload
  );

  return data;
};
