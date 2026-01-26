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
 */
export const getSupportTickets = async () => {
  const userId = getUserId();

  const payload = {
    user_id: userId,
    page: 1,
    page_size: 20,
  };

  const { data } = await http.post(
    "/hr/list-all-support-ticket/",
    payload,
    { headers: { "Content-Type": "application/json" } }
  );

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
    pagination: data.pagination || {
      total_pages: 1,
      total_records: 0,
    },
  };
};

/**
 * ===============================
 * Filter Support Tickets
 * ===============================
 */
export const filterSupportTickets = async (filters = {}) => {
  const userId = getUserId();

  const payload = {
    user_id: userId,
    page: filters.page || 1,
    page_size: filters.page_size || 20,
    status: filters.status || "",
    search: filters.search || "",
    assigned_to: filters.assigned_to || "",
    submitted_by: filters.submitted_by || "",
  };

  const { data } = await http.post(
    "/hr/filter-support-ticket/",
    payload,
    { headers: { "Content-Type": "application/json" } }
  );

  return data;
};

/**
 * ===============================
 * Get Single Support Ticket
 * ===============================
 */
export const getSupportTicketById = async (ticketId) => {
  const userId = getUserId();

  if (!userId) {
    throw new Error("Session expired");
  }

  const payload = {
    user_id: userId,
    ticket_id: ticketId,
  };

  const { data } = await http.post(
    "/users/user-get-support-ticket/",
    payload,
    { headers: { "Content-Type": "application/json" } }
  );

  return data;
};

/**
 * ===============================
 * Update Ticket Status
 * ===============================
 */
export const updateSupportTicket = async ({ ticket_id, assigned_to, status }) => {
  const userId = getUserId();

  const form = new FormData();
  form.append("user_id", userId);
  form.append("ticket_id", ticket_id);
  form.append("assigned_user_id", assigned_to);
  form.append("status", status);

  const { data } = await http.post(
    "/hr/assign-and-change-status-support-ticket/",
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return data;
};

/**
 * ===============================
 * Get Employees for Filter
 * ===============================
 */
export const getEmployeesList_filter = async () => {
  const userId = getUserId();

  const payload = {
    user_id: userId,
    page: 1,
    page_size: 500,
  };

  const { data } = await http.post(
    "/hr/list-user-support-ticket-filter/",
    payload,
    { headers: { "Content-Type": "application/json" } }
  );

  return data.users_data || [];
};
