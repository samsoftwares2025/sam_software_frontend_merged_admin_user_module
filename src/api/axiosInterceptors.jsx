// src/api/axiosInterceptors.jsx
import axiosInstance from "./axiosInstance";

let showLoader;
let hideLoader;

export const registerLoader = (show, hide) => {
  showLoader = show;
  hideLoader = hide;
};

axiosInstance.interceptors.request.use(config => {
  showLoader && showLoader();
  return config;
});

axiosInstance.interceptors.response.use(
  response => {
    hideLoader && hideLoader();
    return response;
  },
  error => {
    hideLoader && hideLoader();
    return Promise.reject(error);
  }
);
