// src/api/auth.js

import http from "./http";
import { setAuth } from "./http";

/* ===========================================================
   LOGIN
   =========================================================== */
export const loginUser = async (email, password) => {
  const response = await http.post("/users/login/", { email, password });
  const data = response.data;

  /* ================= TOKEN ================= */
  const accessToken =
    data.access ||
    data.token ||
    data.access_token ||
    data.authToken ||
    data.authentication?.access;

  if (!accessToken) {
    throw new Error("Login succeeded but no access token returned.");
  }

  /* ================= USER ID ================= */
  const userId = data.user?.id || data.user_id || data.id;
  if (!userId) {
    throw new Error("Login succeeded but no user ID returned.");
  }

  /* ================= STORE BASIC AUTH ================= */
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("userId", String(userId));
  localStorage.setItem("userName", data.name || data.user?.name || "");

  /* ================= STORE CLIENT ADMIN ================= */
  localStorage.setItem(
    "is_client_admin",
    data.is_client_admin ? "true" : "false"
  );

  /* ================= STORE ROLE ================= */
  localStorage.setItem("user_role_id", data.user_role_id || "");
  localStorage.setItem("user_role", data.user_role || "");

  /* ================= SET AUTH HEADER ================= */
  setAuth({ token: accessToken });

  /* ================= GET PERMISSIONS ================= */
  const permissions = await fetchUserPermissions(userId);

  localStorage.setItem("permissions", JSON.stringify(permissions));

  return {
    ...data,
    permissions
  };
};

/* ===========================================================
   FETCH USER PERMISSIONS  (YOUR API)
   POST /users/user-check-role-permission/
   =========================================================== */
export const fetchUserPermissions = async (userId) => {
  if (!userId) return {};

  const response = await http.post(
    "/users/user-check-role-permission/",
    { user_id: userId }
  );

  const data = response.data;

  const rawPermissions = data.permissions_list || [];

  const permissionMap = {};

  rawPermissions.forEach((p) => {
    const clean = p.module_name?.trim().toLowerCase();
    if (!clean) return;

    permissionMap[clean] = {
      view: p.view ?? false,
      add: p.add ?? false,
      update: p.update ?? false,
      delete: p.delete ?? false,
    };
  });

  return permissionMap;
};

/* ===========================================================
   REFRESH PERMISSIONS (LIVE UPDATE)
   =========================================================== */
export const refreshUserPermissions = async () => {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("accessToken");

  if (!userId || !token) return null;

  try {
    const newPermissions = await fetchUserPermissions(userId);

    localStorage.setItem("permissions", JSON.stringify(newPermissions));

    return newPermissions;
  } catch (err) {
    console.error("Permission refresh failed:", err);
    return null;
  }
};

/* ===========================================================
   LOGOUT
   =========================================================== */
export const logoutUser = async () => {
  try {
    const token = localStorage.getItem("accessToken");

    await http.post(
      "/users/logout/",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err) {
    console.error("Logout API error:", err);
  } finally {

    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("permissions");
    localStorage.removeItem("user_role_id");
    localStorage.removeItem("is_client_admin");

    setAuth({ token: null });
  }
};
