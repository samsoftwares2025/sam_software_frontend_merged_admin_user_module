import http from "../http";

/**
 * Helper: get userId safely
 */
const getUserId = () => {
  return localStorage.getItem("userId");
};

/**
 * createRole
 */
export const createRole = async (roleName, permissions) => {
  const userId = getUserId();

  const payload = {
    role: roleName,      // backend expects `role`
    user_id: userId,
    permissions          // full permission object
  };

  const { data } = await http.post(
    "/users/add-user-roles/",
    payload,
    { headers: { "Content-Type": "application/json" } }
  );

  return data;
};




/**
 * getRoles
 */
export const getUserRoleById = async (roleId) => {
  const userId = getUserId();

  const payload = {
    user_id: userId,
    user_role_id: roleId,
  };

  const { data } = await http.post(
    "/users/get-user-roles/",
    payload,
    { headers: { "Content-Type": "application/json" } }
  );

  return data;
};


export const listUserRoles = async () => {
  const userId = getUserId();

  const payload = {
    user_id: userId, // required by backend
  };

  const { data } = await http.post(
    "/users/list-user-roles/",
    payload,
    { headers: { "Content-Type": "application/json" } }
  );

  return data;
};

// list user roles while emp management

export const listUserRoles_employee_mgmnt = async () => {
  const userId = getUserId();

  const payload = {
    user_id: userId, // required by backend
  };

  const { data } = await http.post(
    "/hr/list-user-roles/",
    payload,
    { headers: { "Content-Type": "application/json" } }
  );

  return data;
};



// src/api/admin/roles.js
// src/api/admin/roles.js
export const updateRole = async (roleId, { roleName, permissions }) => {
  const userId = localStorage.getItem("userId");

  const payload = {
    user_role_id: roleId,
    role: roleName,           // ✔ correct string value
    permissions,              // ✔ correct permissions
    user_id: userId,
  };

  try {
    const { data } = await http.post(
      "/users/update-user-roles/",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    return data;
  } catch (err) {
    throw err; // pass error back to component
  }
};


// src/api/admin/roles.js



// src/api/admin/roles.js
export const deleteUserRole = async (roleId) => {
  const userId = localStorage.getItem("userId");

  const { data } = await http.post("/users/delete-user-roles/", {
    user_id: userId,
    user_role_id: roleId, // ✅ MUST MATCH BACKEND
  });

  return data;
};

