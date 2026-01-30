// src/api/admin/employement_type.js
import http from "../http";

/**
 * Helper: get userId safely (NO THROW)
 */
const getUserId = () => {
  return localStorage.getItem("userId");
};

/**
 * createEmployementType
 */
export const createEmployementType = async (name) => {
  const userId = getUserId();

  const payload = {
    name,
    user_id: userId,
  };

  const { data } = await http.post(
    "/hr/add-employment-type/",
    payload
  );

  return data;
};

/**
 * list EmployementTypes
 */
export const listEmployementTypes = async () => {
  const userId = getUserId();

  const { data } = await http.post(
    "/hr/list-employment-type/",
    { user_id: userId }
  );

  return data;
};

/**
 * GET EMPLOYMENT TYPE By Id
 * Fetches full details for a single policy
 */
export const getEmploymentTypeById = async (id) => {
  const userId = getUserId(); // Ensure this helper is imported in your API file

  const { data } = await http.post(
    "/hr/get-employment-type/", 
    { 
      user_id: userId,
      employment_type_id: id 
    }
  );

  return data;
};

/**
 * getEmployementTypes for non permitted users
 */
export const getEmployementTypes_employee_mgmnt = async () => {
  const userId = getUserId();

  const { data } = await http.post(
    "/hr/employee-add-list-employment-type/",
    { user_id: userId }
  );

  return data;
};





/**
 * updateEmployementType
 */
export const updateEmployementType = async (employmentTypeId, name) => {
  const userId = getUserId();

  const payload = {
    employment_type_id: employmentTypeId,
    name,
    user_id: userId,
  };

  const { data } = await http.post(
    "/hr/update-employment-type/",
    payload
  );

  return data;
};

/**
 * deleteEmployementType
 */
export const deleteEmployementType = async (employmentTypeId) => {
  const userId = getUserId();

  const payload = {
    employment_type_id: employmentTypeId,
    user_id: userId,
  };

  const { data } = await http.post(
    "/hr/delete-employment-type/",
    payload
  );

  return data;
};
