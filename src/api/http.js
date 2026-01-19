// src/api/http.js
import axios from "axios";
import { API_BASE_URL } from "./config";

const isDev = import.meta.env.DEV;

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Allow external modules to set/clear auth token (JWT only)
export const setAuth = ({ token = null } = {}) => {
  if (token) {
    http.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete http.defaults.headers.common["Authorization"];
  }
};

// 🔎 Request logging (DEV only)
http.interceptors.request.use((req) => {
  if (isDev) {
    req.metadata = { startTime: new Date() };
    console.info("[HTTP] →", req.method?.toUpperCase(), req.baseURL + req.url);
  }
  return req;
});

// 🔁 Response & error handling
http.interceptors.response.use(
  (res) => {
    if (isDev && res.config.metadata) {
      res.config.metadata.endTime = new Date();
      res.duration =
        res.config.metadata.endTime - res.config.metadata.startTime;

      console.info(
        `[HTTP] ← ${res.status} (${res.duration}ms)`,
        res.config.url
      );
    }
    return res;
  },
  (error) => {
    if (isDev) {
      if (error.response) {
        console.error("[HTTP] response error", {
          status: error.response.status,
          data: error.response.data,
          url: error.config?.url,
        });
      } else if (error.request) {
        console.error("[HTTP] no response from server", {
          url: error.config?.url,
          message: error.message,
        });
      } else {
        console.error("[HTTP] setup error", error.message);
      }
    }

    return Promise.reject(error);
  }
);

export default http;
