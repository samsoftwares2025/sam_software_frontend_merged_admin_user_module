import http from "../http";

/**
 * Helper: get userId safely
 */
const getUserId = () => {
  return localStorage.getItem("userId");
};

/**
 * ===============================
 * Get Support Tickets (Admin)
 * ===============================
 * Filters supported:
 * - status
 * - from_date
 * - to_date
 * - assigned_to
 * - submitted_by
 * - search
 */
export const getSupportTickets = async (filters = {}) => {
  const token = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("user_id");

  const { data } = await http.post("/hr/list-all-support-ticket/", {
    user_id: userId,
    page: 1,
    page_size: 20, 
  });

 return {
  list: (data.support_tickets || []).map((t) => ({
    ...t,
    submitted_by: t.submitted_by
      ? { id: t.submitted_by, name: t.submitted_by_name }
      : null,
    assigned_to: t.assigned_to
      ? { id: t.assigned_to, name: t.assigned_to_name }
      : null,
  })),
  pagination: data.pagination || { total_pages: 1, total_records: 0 }
};



};




export const filterSupportTickets = async (filters) => {
  const userId = localStorage.getItem("userId");

  const body = {
    user_id: Number(userId),
    page: filters.page || 1,
    page_size: filters.page_size || 20,
    status: filters.status || "",
    search: filters.search || "",
    assigned_to: filters.assigned_to || "",
    submitted_by: filters.submitted_by || "",
  };

  const { data } = await http.post("/hr/filter-support-ticket/", body);
  return data;
};



/**
 * ===============================
 * Get Single Support Ticket
 * ===============================
 */


export const getSupportTicketById = async (ticketId) => {
  const userId = localStorage.getItem("userId");


  if (!userId) {
    throw new Error("Session expired");
  }

  const { data } = await http.post("/users/user-get-support-ticket/", {
    user_id: userId,
    ticket_id: ticketId,

  });

  return data;
};


/**
 * ===============================
 * Update Ticket Status
 * ===============================
 */
export const updateSupportTicket = async (payload) => {
  const userId = localStorage.getItem("userId");

  const form = new FormData();
  form.append("user_id", userId);
  form.append("ticket_id", payload.ticket_id);
  form.append("assigned_user_id", payload.assigned_to);
  form.append("status", payload.status);

  const { data } = await http.post(
    "/hr/assign-and-change-status-support-ticket/",
    form,
    {
      headers: { "Content-Type": "multipart/form-data" } // <--- FIX HERE
    }
  );

  return data;
};





export const getEmployeesList_filter = async () => {
  const token = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("user_id");

  const { data } = await http.post("/hr/list-user-support-ticket-filter/", {
    user_id: userId,
    page: 1,
    page_size: 500, // enough for dropdown
  });

  return data.users_data || [];
};