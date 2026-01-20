// src/context/LoaderContext.jsx
import React, { createContext, useContext, useState } from "react";
import LoaderOverlay from "../components/common/LoaderOverlay";

const LoaderContext = createContext();

export const useLoader = () => useContext(LoaderContext);

export const LoaderProvider = ({ children }) => {
  const [count, setCount] = useState(0);

  const showLoader = () => setCount(c => c + 1);
  const hideLoader = () => setCount(c => Math.max(0, c - 1));

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      {count > 0 && <LoaderOverlay />}
    </LoaderContext.Provider>
  );
};
