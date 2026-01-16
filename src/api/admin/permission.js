// src/api/admin/companyRules.js
import http from "../http";

/**
 * Helper: get userId safely (NO THROW)
 */
const getUserId = () => {
  return localStorage.getItem("userId");
};




export const list_Permission_modules = async () => {
  const userId = getUserId();

  const { data } = await http.post(
    "/users/list-permission-modules/",
    { user_id: userId }
  );

  return data;
};




