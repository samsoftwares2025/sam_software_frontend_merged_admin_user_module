import axios from "axios";
import { API_BASE_URL } from "./config";
import { triggerShow, triggerHide } from "./loaderRegistry";

const isDev = import.meta.env.DEV;

/* ================= AXIOS INSTANCE ================= */
const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

/* ================= REQUEST INTERCEPTOR ================= */
http.interceptors.request.use(
  (config) => {
    triggerShow();

    // ✅ ENSURE JSON BODY IS PRESERVED
    return {
      ...config,
      data: config.data,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...config.headers,
      },
      ...(isDev && {
        metadata: { startTime: new Date() },
      }),
    };
  },
  (error) => {
    triggerHide();
    return Promise.reject(error);
  }
);

/* ================= RESPONSE INTERCEPTOR ================= */
http.interceptors.response.use(
  (response) => {
    triggerHide();

    /* 🔎 DEV LOGGING */
    if (isDev && response.config.metadata) {
      const endTime = new Date();
      const duration = endTime - response.config.metadata.startTime;

      console.info(
        `[HTTP] ← ${response.status} (${duration}ms)`,
        response.config.url
      );
    }

    return response;
  },
  (error) => {
    triggerHide();

    if (isDev) {
      console.error(
        "[HTTP ERROR]",
        error.response?.status,
        error.config?.url,
        error.response?.data
      );
    }

    return Promise.reject(error);
  }
);

/* ================= AUTH TOKEN HANDLER ================= */
export const setAuth = ({ token = null } = {}) => {
  if (token) {
    http.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete http.defaults.headers.common.Authorization;
  }
};

export default http;
