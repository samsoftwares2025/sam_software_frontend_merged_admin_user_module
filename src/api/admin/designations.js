// src/api/admin/designations.js
import http from "../http";

/**
 * Helper: get userId safely (NO THROW)
 */
const getUserId = () => {
  return localStorage.getItem("userId");
};

/**
 * createDesignation
 */
// src/api/admin/designations.js
export const createDesignation = async ({ name, department_id }) => {
  const userId = getUserId();

  const payload = {
    name,
    department_id: Number(department_id), // ✅ ensure integer
    user_id: userId,
  };

  const { data } = await http.post(
    "/companies/add-designation/",
    payload
  );

  return data;
};

/**
 * list Designations
 */
export const listDesignations = async () => {
  const userId = getUserId();

  const { data } = await http.post(
    "/companies/list-designations/",
    { user_id: userId }
  );

  return data;
};


/**
 * get Designation By Id
 * Fetches full details for a single designation
 */
export const getDesignationById = async (id) => {
  const userId = getUserId(); 

  const { data } = await http.post(
    "/companies/get-designation/", 
    { 
      user_id: userId,
      designation_id: id 
    }
  );

  return data;
};


/**
 * getDesignations while emp management
 */
export const getDesignations_employee_mgmnt = async () => {
  const userId = getUserId();

  const { data } = await http.post(
    "/hr/list-designations/",
    { user_id: userId }
  );

  return data;
};

/**
 * updateDesignation
 */
export const updateDesignation = async (
  designationId,
  name,
  departmentId
) => {
  const userId = getUserId();

  const payload = {
    designation_id: designationId,
    name,
    department_id: departmentId,
    user_id: userId,
  };

  const { data } = await http.post(
    "/companies/update-designation/",
    payload
  );

  return data;
};

/**
 * deleteDesignation
 */
export const deleteDesignation = async (designationId) => {
  const userId = getUserId();

  const payload = {
    designation_id: designationId,
    user_id: userId,
  };

  const { data } = await http.post(
    "/companies/delete-designation/",
    payload
  );

  return data;
};
