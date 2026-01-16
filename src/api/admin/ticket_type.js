import http from "../http";

const getUserId = () => {
  return localStorage.getItem("userId");
};

export const createTicketType = async ({ title, description }) => {
  const userId = getUserId();

  if (!userId) {
    throw new Error("User ID not found in localStorage.");
  }

  // Django expects FORM DATA, not JSON
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("user_id", Number(userId));

  const { data } = await http.post("/hr/add-ticket-type/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};




export const getTicketTypes = async () => {
  const userId = localStorage.getItem("userId");

  const payload = { user_id: Number(userId) };

  const { data } = await http.post("/hr/list-ticket-type/", payload);

  return data;
};



export const deleteTicketType = async (type_id) => {
  const userId = getUserId();

  const payload = {
    user_id: Number(userId),
    type_id: Number(type_id),
  };

  const { data } = await http.post("/hr/delete-ticket-type/", payload);

  return data;
};




/* ============================
   GET TICKET TYPE BY ID
============================ */
export const getTicketTypeById = async (type_id) => {
  const userId = getUserId();

  const payload = {
    user_id: Number(userId),
    type_id: Number(type_id),
  };

  const { data } = await http.post("/hr/get-ticket-type/", payload);

  return data;
};


/* ============================
     UPDATE TICKET TYPE
============================ */
export const updateTicketType = async ({ type_id, title, description }) => {
  const userId = getUserId();
  const formData = new FormData();

  formData.append("user_id", Number(userId));
  formData.append("type_id", Number(type_id));
  formData.append("title", title);
  formData.append("description", description);

  const { data } = await http.post("/hr/update-ticket-type/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};