import http from "../http"; // Adjust path to your http utility
const getUserId = () => {
  return localStorage.getItem("user_id") || localStorage.getItem("userId");
};
export const createShift = async (payload) => {
  const userId = getUserId();
  
  // Create FormData to match your Company Document style
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("name", payload.name);
  formData.append("start_time", payload.start_time);
  formData.append("end_time", payload.end_time);
  formData.append("grace_period", payload.grace_period);

  const { data } = await http.post(
    "/attendance/add-shift/", 
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};




export const listShifts = async (params = {}) => {
  const userId = getUserId();
  
  const payload = {
    user_id: userId,
    page: params.page || 1,
    page_size: params.page_size || 20, 
    search: params.search || "",
  };

  const { data } = await http.post("/attendance/list-shifts/", payload);
  return data;
};


export const getShiftDetails = async (shiftId) => {
  const userId = getUserId();
  const { data } = await http.post("/attendance/get-shift-details/", {
    user_id: userId,
    shift_id: shiftId,
  });
  return data;
};



export const updateShift = async (shiftId, payload) => {
  const userId = getUserId();
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("shift_id", shiftId);
  formData.append("name", payload.name);
  formData.append("start_time", payload.start_time);
  formData.append("end_time", payload.end_time);
  formData.append("grace_period", payload.grace_period);

  const { data } = await http.post("/attendance/update-shift/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};



export const deleteShift = async (shiftId) => {
  const userId = getUserId();
  const { data } = await http.post("/attendance/delete-shift/", {
    user_id: userId,
    shift_id: shiftId,
  });
  return data;
};