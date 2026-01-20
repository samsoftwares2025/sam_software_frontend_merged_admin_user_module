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
    "/users/user-change-support-ticket-status/",
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
    "/users/user-list-ticket-type/",   // <-- IMPORTANT: correct endpoint
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;  // contains: { success: true, types: [...] }
};




// ==============================
// FILTER / SEARCH MY SUPPORT TICKETS
// ==============================
export const filterMyTickets = async ({
  page = 1,
  pageSize = 10,
  status = null,
  search = null,
  dateFrom = null,
  dateTo = null,
}) => {
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

  // attach filters only if provided
  if (status && status !== "all") payload.status = status;
  if (search) payload.search = search;
  if (dateFrom) payload.date_from = dateFrom;
  if (dateTo) payload.date_to = dateTo;

  const { data } = await http.post(
    "/users/user-filter-support-tickets/",
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
// LIST ASSIGNED SUPPORT TICKETS
// ==============================
export const getAssignedTickets = async (page = 1, pageSize = 10) => {
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
    "/users/user-list-assigned-support-tickets/",
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
// UPDATE ASSIGNED TICKET STATUS (HR)
// ==============================
export const updateAssignedTicketStatus = async ({
  ticketId,
  status,
}) => {
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
  payload.append("status", status);

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
// FILTER SUPPORT TICKETS (ADMIN / HR)
// ==============================
export const filterSupportTickets = async ({
  page = 1,
  pageSize = 10,
  status = null,
  search = null,
  assigned_to = null,
  submitted_by = null,
  date_from = null,
  date_to = null,
}) => {
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

  if (status) payload.status = status;
  if (search) payload.search = search;
  if (assigned_to) payload.assigned_to = assigned_to;
  if (submitted_by) payload.submitted_by = submitted_by;
  if (date_from) payload.date_from = date_from;
  if (date_to) payload.date_to = date_to;

  const { data } = await http.post(
    "/hr/filter-support-ticket/",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return data;
};
