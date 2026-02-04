import http from "../http";

export const getMyCompanyRules = async () => {
  const userId =
    localStorage.getItem("user_id") ||
    localStorage.getItem("id") ||
    localStorage.getItem("userId");

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token");

  console.log("[COMPANY RULE STORAGE CHECK]", {
    userId,
    token,
  });

  if (!userId || !token) {
    throw new Error("Session expired. Please login again.");
  }

  const payload = {
    user_id: userId,
    id: userId,
  };

  console.log("[getMyCompanyRules] PAYLOAD:", payload);

  const { data } = await http.post(
    "/users/my-company-rules/",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
};
