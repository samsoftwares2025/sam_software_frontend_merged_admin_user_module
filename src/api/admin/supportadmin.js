import http from "../http";

/* ================= GET TICKET TYPES ================= */
export const getSuperAdminTicketTypes = async () => {
  try {
    const userId = localStorage.getItem("user_id") || localStorage.getItem("id") || localStorage.getItem("userId");
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");

    if (!userId) return { success: false, message: "user_id missing", types: [] };

    const { data } = await http.post(
      "/hr/list-ticket-type-super-admin/",
      { user_id: userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return data;
  } catch (err) {
    console.error("Error fetching ticket types:", err);
    return { success: false, message: "Failed to fetch ticket types", types: [] };
  }
};

/* ================= ADD TICKET ================= */
export const addSuperAdminTicket = async ({ user_id, ticket_type_id, subject, content, attachment }) => {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");

    if (!user_id) return { success: false, message: "user_id missing" };
    if (!ticket_type_id) return { success: false, message: "ticket_type_id missing" };

    const formData = new FormData();
    formData.append("user_id", user_id);
    formData.append("ticket_type_id", ticket_type_id);
    formData.append("subject", subject);
    formData.append("content", content);

    if (attachment) formData.append("attachment", attachment);

    // Debug log to verify data before sending
    console.log("Submitting ticket:", { user_id, ticket_type_id, subject, content, attachment });

    // ✅ Important: DO NOT set Content-Type manually, let axios handle FormData
    const { data } = await http.post("/hr/add-super-admin-support-ticket/", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  } catch (err) {
    console.error("Error adding ticket:", err.response || err);
    return { success: false, message: "Something went wrong" };
  }
};

/* ======================================================
   LIST SUPER ADMIN TICKETS
====================================================== */
export const listSuperAdminTickets = async (page = 1, pageSize = 10) => {
  const userId = localStorage.getItem("user_id") || localStorage.getItem("id") || localStorage.getItem("userId");
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");

  if (!userId) return { success: false, message: "user_id missing", support_tickets: [], pagination: {} };

  const payload = { user_id: userId, page, page_size: pageSize };
  const { data } = await http.post("/hr/list-super-admin-support-ticket/", payload, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

/* ======================================================
   FILTER SUPER ADMIN TICKETS
====================================================== */
export const filterSuperAdminTickets = async (page = 1, pageSize = 10, status = "", search = "", ticket_type_id = "") => {
  const userId = localStorage.getItem("user_id") || localStorage.getItem("id") || localStorage.getItem("userId");
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");

  if (!userId) return { success: false, message: "user_id missing", support_tickets: [], pagination: {} };

  const payload = { user_id: userId, page, page_size: pageSize, status, search, ticket_type_id };
  const { data } = await http.post("/hr/filter-super-admin-support-ticket/", payload, { headers: { Authorization: `Bearer ${token}` } });

  return data;
};

/* ======================================================
   CANCEL SUPER ADMIN TICKET
====================================================== */
export const cancelSuperAdminTicket = async (ticketId) => {
  const userId = localStorage.getItem("user_id") || localStorage.getItem("id") || localStorage.getItem("userId");
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");

  if (!userId || !ticketId) return { success: false, message: "Missing user_id or ticket_id" };

  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("ticket_id", ticketId);
  formData.append("status", "cancelled");

  const { data } = await http.post("/hr/change-super-admin-support-ticket-status/", formData, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
};
