import http from "../http";

// ==============================
// LIST MY SUPPORT TICKETS
// ==============================
export const getMyTickets = async (page = 1, pageSize = 10) => {
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
    "/users/user-list-support-tickets/",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
};
// ==============================
// ADD SUPPORT TICKET (FORM-DATA)
// ==============================

export const addSupportTicket = async (formData) => {
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

  // append user_id
  if (!formData.has("user_id")) {
    formData.append("user_id", userId);
  }

  // OPTIONAL: ensure ticket_type_id exists
  if (!formData.has("ticket_type_id")) {
    throw new Error("ticket_type_id is required");
  }

  const { data } = await http.post(
    "/users/user-add-support-ticket/",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type manually
      },
    }
  );

  return data;
};




export const cancelTicket = async (ticketId) => {
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

  const payload = new FormData();
  payload.append("user_id", userId);
  payload.append("ticket_id", ticketId);
  payload.append("status", "cancelled");

  const { data } = await http.post(
    "/hr/assign-and-change-status-support-ticket/",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
};



// ==============================
// GET TICKET TYPES (LIST)
// ==============================



// ==============================
// GET ALL TICKET TYPES
// ==============================
export const getTicketTypes = async () => {
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

  const payload = { user_id: userId };

  const { data } = await http.post(
    "/hr/list-ticket-type/",   // <-- IMPORTANT: correct endpoint
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;  // contains: { success: true, types: [...] }
};
