import http from "../http";

/* ======================================================
   GET SUPER ADMIN TICKET TYPES
====================================================== */
export const getSuperAdminTicketTypes = async () => {
  const userId =
    localStorage.getItem("user_id") ||
    localStorage.getItem("id") ||
    localStorage.getItem("userId");

  const token =
    localStorage.getItem("token") || localStorage.getItem("access_token");

  if (!userId) {
    return { success: false, message: "user_id missing", types: [] };
  }

  const payload = { user_id: userId };

  const { data } = await http.post(
    "/hr/list-ticket-type-super-admin/",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
};

/* ======================================================
   ADD SUPER ADMIN TICKET
====================================================== */
export const addSuperAdminTicket = async (formData) => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("access_token");

  const { data } = await http.post(
    "/hr/add-super-admin-support-ticket/",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
};

/* ======================================================
   LIST SUPER ADMIN TICKETS
====================================================== */
export const listSuperAdminTickets = async (page = 1, pageSize = 10) => {
  const userId =
    localStorage.getItem("user_id") ||
    localStorage.getItem("id") ||
    localStorage.getItem("userId");

  const token =
    localStorage.getItem("token") || localStorage.getItem("access_token");

  if (!userId) {
    return {
      success: false,
      message: "user_id missing",
      support_tickets: [],
      pagination: {},
    };
  }

  const payload = {
    user_id: userId,
    page,
    page_size: pageSize,
  };

  const { data } = await http.post(
    "/hr/list-super-admin-support-ticket/",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
};

/* ======================================================
   FILTER SUPER ADMIN TICKETS
====================================================== */
export const filterSuperAdminTickets = async (
  page = 1,
  pageSize = 10,
  status = "",
  search = "",
  ticket_type_id = ""
) => {
  const userId =
    localStorage.getItem("user_id") ||
    localStorage.getItem("id") ||
    localStorage.getItem("userId");

  const token =
    localStorage.getItem("token") || localStorage.getItem("access_token");

  if (!userId) {
    return {
      success: false,
      message: "user_id missing",
      support_tickets: [],
      pagination: {},
    };
  }

  const payload = {
    user_id: userId,
    page,
    page_size: pageSize,
    status,
    search,
    ticket_type_id, // ✅ correctly passed
  };

  const { data } = await http.post(
    "/hr/filter-super-admin-support-ticket/",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
};



/* ======================================================
   CANCEL SUPER ADMIN TICKET
====================================================== */
export const cancelSuperAdminTicket = async (ticketId) => {
  const userId =
    localStorage.getItem("user_id") ||
    localStorage.getItem("id") ||
    localStorage.getItem("userId");

  const token =
    localStorage.getItem("token") || localStorage.getItem("access_token");

  if (!userId || !ticketId) {
    return {
      success: false,
      message: "Missing user_id or ticket_id",
    };
  }

  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("ticket_id", ticketId);
  formData.append("status", "cancelled");

  const { data } = await http.post(
    "/hr/change-super-admin-support-ticket-status/",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
};