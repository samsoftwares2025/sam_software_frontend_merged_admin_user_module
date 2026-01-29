// src/utils/textFormatters.js
export const toSentenceCase = (text = "") => {
  if (!text) return "";

  let result = text.trim().toLowerCase();

  // Add space after punctuation if missing
  result = result.replace(/([.!?])(?=\w)/g, "$1 ");

  // Capitalize first letter & after punctuation
  result = result.replace(/(^\w|[.!?]\s*\w)/g, (char) => char.toUpperCase());

  return result;
};
