// utils/selectStyles.js

export const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "44px",
    borderRadius: "8px",
    borderColor: state.isFocused
      ? "var(--primary-2)"
      : "var(--muted-border)",
    boxShadow: state.isFocused
      ? "0 0 0 3px rgba(66, 165, 245, 0.1)"
      : "none",
    fontFamily: "'Times New Roman', Times, serif",
    fontSize: "14px",
    backgroundColor: "#fff",
    "&:hover": {
      borderColor: "var(--primary-2)",
    },
  }),

  valueContainer: (base) => ({
    ...base,
    padding: "0 14px",
  }),

  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),

  placeholder: (base) => ({
    ...base,
    color: "#999",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),

  /* ✅ Selected value (closed select) */
  singleValue: (base) => ({
    ...base,
    color: "#000",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  }),

  /* ✅ Dropdown options */
  option: (base, state) => ({
    ...base,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    cursor: "pointer",
    backgroundColor: state.isFocused
      ? "rgba(66, 165, 245, 0.1)"
      : state.isSelected
      ? "rgba(66, 165, 245, 0.2)"
      : "#fff",
    color: "#000",
  }),

  menu: (base) => ({
    ...base,
    zIndex: 9999,
    width: "100%",
  }),
};
