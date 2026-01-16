// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState } from "react";
import { refreshUserPermissions } from "../api/auth";
import { setAuth } from "../api/http";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("accessToken")
  );

  const [permissions, setPermissions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("permissions")) || {};
    } catch {
      return {};
    }
  });

  const [isClientAdmin, setIsClientAdmin] = useState(
    localStorage.getItem("is_client_admin") === "true"
  );

  const [isLoading, setIsLoading] = useState(true);

  /* ===========================================================
      RUN ON EVERY PAGE RELOAD
    =========================================================== */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    // ✔ Restore axios auth header on reload
    setAuth({ token });

    setIsAuthenticated(true);
    setIsClientAdmin(localStorage.getItem("is_client_admin") === "true");

    const loadPermissions = async () => {
      try {
        const newPermissions = await refreshUserPermissions();
        if (newPermissions) {
          setPermissions(newPermissions);
        }
      } catch (err) {
        console.error("Permission refresh failed:", err);
      }

      setIsLoading(false);
    };

    loadPermissions();
  }, []);

  /* ===========================================================
      METHOD: CALL THIS IMMEDIATELY AFTER loginUser()
    =========================================================== */
  const setLoginData = () => {
    const token = localStorage.getItem("accessToken");

    // ✔ Set axios header after login
    setAuth({ token });

    setIsAuthenticated(true);
    setIsClientAdmin(localStorage.getItem("is_client_admin") === "true");

    setPermissions(JSON.parse(localStorage.getItem("permissions")) || {});
  };

  /* ===========================================================
      DEPRECATED IN NEW VERSION BUT STILL SUPPORTED
      (Some pages might still call login())
    =========================================================== */
  const login = () => {
    setLoginData(); // simply forward to main function
  };

  /* ===========================================================
      LOGOUT
    =========================================================== */
  const logout = () => {
    localStorage.clear();
    setAuth(null);

    setIsAuthenticated(false);
    setPermissions({});
    setIsClientAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        permissions,
        isClientAdmin,
        isLoading,
        setLoginData,
        login,      // ✔ keep backward compatibility
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
