// src/api/admin/departments.js
import http from "../http";

/**
 * Helper: get userId safely (NO THROW)
 */
const getUserId = () => {
  return localStorage.getItem("userId");
};

/**
 * createDepartment
 */
export const createDepartment = async (name) => {
  const userId = getUserId();

  const payload = {
    name,
    user_id: userId,
  };

  const { data } = await http.post(
    "/companies/add-department/",
    payload
  );

  return data;
};

/**
 * getDepartments
 */
export const getDepartments = async () => {

  const userId = getUserId();

  const { data } = await http.post(
    "/companies/list-departments/",
    { user_id: userId }
  );

  return data;
};


/**
 * getDepartments while emp management
 */
export const getDepartments_employee_mgmnt = async () => {

  const userId = getUserId();

  const { data } = await http.post(
    "/hr/list-departments/",
    { user_id: userId }
  );

  return data;
};

/**
 * updateDepartment
 */
export const updateDepartment = async (departmentId, name) => {
  const userId = getUserId();

  const payload = {
    department_id: departmentId,
    name,
    user_id: userId,
  };

  const { data } = await http.post(
    "/companies/update-department/",
    payload
  );

  return data;
};

/**
 * deleteDepartment
 */
export const deleteDepartment = async (departmentId) => {
  const userId = getUserId();

  const payload = {
    department_id: departmentId,
    user_id: userId,
  };

  const { data } = await http.post(
    "/companies/delete-department/",
    payload
  );

  return data;
};
