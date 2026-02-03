import http from "../http";


export const checkUserFieldExists = async (field, value, employeeUserId = "") => {
  // Use the same keys as defined in auth.js
  const userId = localStorage.getItem("user_id"); 
  const companyId = localStorage.getItem("company_id");

  const formData = new FormData();
  formData.append("field", field);
  formData.append("value", value);
  
  // Only append if they exist and are not the string "null"
  if (userId && userId !== "null") formData.append("user_id", userId);
  if (companyId && companyId !== "null") formData.append("company_id", companyId);

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