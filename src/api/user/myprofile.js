import http from "../http";

/* =========================
   GET MY PROFILE
========================= */
export const getMyProfile = async () => {
  const userId =
    localStorage.getItem("user_id") ||
    localStorage.getItem("id") ||
    localStorage.getItem("userId");

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token");

  if (!userId || !token) {
    return Promise.reject(
      new Error("Session expired. Please login again.")
    );
  }

  const payload = {
    user_id: userId,
    employee_id: userId,
    id: userId,
  };

  const response = await http.post(
    "/users/user-get-profile/",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

/* =========================
   UPDATE MY PROFILE
========================= */
export const updateMyProfile = async (payload, profile) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token");

  const userId =
    profile?.id ||
    profile?.user_id ||
    profile?.employee_id;

  const formData = new FormData();
  formData.append("user_id", userId);

  if (payload?.name) {
    formData.append("name", payload.name);
  }

  if (payload?.image instanceof File) {
    formData.append("image", payload.image);
  }

  const response = await http.post(
    "/users/user-update-profile/",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// ==============================
// LIST MY HISTORY (PAGINATED)
// ==============================
export const getMyHistory = async (page = 1, pageSize = 10) => {
  const userId =
    localStorage.getItem("user_id") ||
    localStorage.getItem("id") ||
    localStorage.getItem("userId");

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token");

  if (!userId || !token) {
    throw new Error("Session expired. Please login again.");
  }

  const payload = {
    user_id: userId,
    page,
    page_size: pageSize,
  };

  const { data } = await http.post(
    "/users/user-their-own-employee-history/",   // <-- replace with your actual history endpoint
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
};


/* =========================
   RESET PASSWORD
========================= */
export const resetPassword = async (payload) => {
  const userId =
    localStorage.getItem("user_id") ||
    localStorage.getItem("id") ||
    localStorage.getItem("userId");

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token");

  if (!userId || !token) {
    return Promise.reject(
      new Error("Session expired. Please login again.")
    );
  }

  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("current_password", payload.currentPassword);
  formData.append("password", payload.password);
  formData.append("confirm_password", payload.confirmPassword);

  const response = await http.post(
    "/users/user-reset-password/",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
