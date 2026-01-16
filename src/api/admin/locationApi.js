// src/api/admin/locationApi.js
import http from "../http";

/**
 * 🗺️ Get All Countries
 */
export const getAllCountries = async () => {
  const { data } = await http.post("/companies/list-all-countries/");
  return data;
};

/**
 * 🏛️ Get States by Country
 */
export const getStatesByCountry = async (country_name) => {
  const { data } = await http.post("/companies/list-states-by-country/", {
    country_name,
  });
  return data;
};

/**
 * 🌆 Get Cities by State
 */
export const getCitiesByState = async (country_name, state_name) => {
  const { data } = await http.post("/companies/list-cities-by-state/", {
    country_name,
    state_name,
  });
  return data;
};
