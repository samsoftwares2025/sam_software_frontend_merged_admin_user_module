// src/api/admin/policies.js
import http from "../http";

/**
 * Helper: get userId safely (NO THROW)
 */
const getUserId = () => {
  return localStorage.getItem("userId");
};

/**
 * createPolicy
 */


export const createPolicy = async (formData) => {
  const userId = getUserId();

  // attach user_id to FormData
  formData.append("user_id", userId);

  const { data } = await http.post(
    "/hr/add-policy/",
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
 * listPolicies
 */
export const listPolicies = async () => {

  const userId = getUserId();

  const { data } = await http.post(
    "/hr/list-policies/",
    { user_id: userId }
  );

  return data;
};


/**
 * getPolicyById
 * Fetches full details for a single policy
 */
export const getPolicyById = async (policyId) => {
  const userId = getUserId();

  const { data } = await http.post(
    "/hr/get-policy/", // Ensure this endpoint exists on your backend
    { 
      user_id: userId,
      policy_id: policyId 
    }
  );

  return data;
};
/**
 * updatePolicy
 */


export const updatePolicy = async (policyId, formData) => {
  const userId = getUserId();

  // Attach user_id (backend expects it)
  formData.append("user_id", userId);
  formData.append("policy_id", policyId);

  const { data } = await http.post(
    "/hr/update-policy/",
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
 * deletePolicy
 */
export const deletePolicy = async (policyId) => {
  const userId = getUserId();

  const payload = {
    policy_id: policyId,
    user_id: userId,
  };

  const { data } = await http.post(
    "/hr/delete-policy/",
    payload
  );

  return data;
};
