// src/api/loaderRegistry.js
let showLoader;
let hideLoader;

export const registerLoader = (show, hide) => {
  showLoader = show;
  hideLoader = hide;
};

export const triggerShow = () => {
  showLoader && showLoader();
};

export const triggerHide = () => {
  hideLoader && hideLoader();
};
