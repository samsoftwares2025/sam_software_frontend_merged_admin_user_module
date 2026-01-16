// src/api/admin/countries.js
import http from "../http";
export const getCountries = async () => {
  const userId = localStorage.getItem("userId");
  const { data } = await http.post(
    "/companies/list-all-countries/",
    { user_id: userId }
  );

  // ✅ data itself is already an array
  return data ?? [];
};
