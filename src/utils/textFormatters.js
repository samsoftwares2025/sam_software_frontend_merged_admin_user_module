// src/utils/textFormatters.js
export const toSentenceCase = (text = "") => {
  if (!text) return "";

  // 1. Clean up whitespace
  let result = text.trim();

  // 2. Add space after punctuation (.!?) if a letter follows immediately
  result = result.replace(/([.!?])(?=\w)/g, "$1 ");

  // 3. Capitalize the first letter of the string AND after [.!?]
  // We use a regex that finds the start (^) OR punctuation followed by space
  result = result.replace(/(^\s*\w|[.!?]\s+\w)/g, (match) => {
    return match.toUpperCase();
  });

  return result;
};