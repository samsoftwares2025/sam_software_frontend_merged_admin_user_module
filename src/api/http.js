import axios from "axios";
import { API_BASE_URL } from "./config";
import { triggerShow, triggerHide } from "./loaderRegistry";

const isDev = import.meta.env.DEV;

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  
});

/* 🔄 GLOBAL LOADER HOOK */
http.interceptors.request.use((req) => {
  triggerShow();
  return req;
});

/* 🔄 GLOBAL LOADER HIDE */
http.interceptors.response.use(
  (res) => {
    triggerHide();
    return res;
  },
  (error) => {
    triggerHide();
    return Promise.reject(error);
  }
);

/* 🔐 Allow external modules to set/clear auth token */
export const setAuth = ({ token = null } = {}) => {
  if (token) {
    http.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete http.defaults.headers.common["Authorization"];
  }
};

/* 🔎 DEV logging */
http.interceptors.request.use((req) => {
  if (isDev) {
    req.metadata = { startTime: new Date() };
    console.info("[HTTP] →", req.method?.toUpperCase(), req.baseURL + req.url);
  }
  return req;
});

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
    return Promise.reject(error);
  }
);

export default http;
