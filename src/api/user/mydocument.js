

import http from "../http";

export const getMyDocuments = async () => {
  // 🔍 read from all possible keys
  const userId =
    localStorage.getItem("user_id") ||
    localStorage.getItem("id") ||
    localStorage.getItem("userId");

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token");

  console.log("[DOCUMENT STORAGE CHECK]", {
    userId,
    token,
  });

  if (!userId || !token) {
    throw new Error("Session expired. Please login again.");
  }

  const payload = {
    user_id: userId,
    employee_id: userId,
    id: userId,
  };

  console.log("[getMyDocuments] PAYLOAD:", payload);

  const { data } = await http.post(
    "/hr/get-employee/",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
};

