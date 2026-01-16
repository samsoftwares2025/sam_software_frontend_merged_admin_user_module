import http from "../http";

export const checkUserFieldExists = async (field, value, employeeUserId = "") => {
  const userId = localStorage.getItem("userId");

  const formData = new FormData();
  formData.append("field", field);
  formData.append("value", value);
  formData.append("user_id", userId);   // ✅ REQUIRED

  if (employeeUserId) {
    formData.append("employee_user_id", employeeUserId);
  }

  const { data } = await http.post(
    "/hr/check-user-field-exists/",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return data;
};
