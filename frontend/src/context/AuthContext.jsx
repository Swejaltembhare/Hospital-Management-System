import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Synchronize authenticated user state from local storage on mount
  useEffect(() => {
    if (token) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse stored user session data:", e);
          localStorage.removeItem("user");
        }
      }
    }
    setLoading(false);
  }, [token]);

  // Authenticate user by role-specific login route
  const login = async (email, password, role) => {
    try {
      const response = await api.post(`/auth/${role}/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { token: authToken, user: authUser } = response.data;
        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(authUser));
        localStorage.setItem("userRole", authUser.role);

        setToken(authToken);
        setUser(authUser);
        return { success: true, user: authUser };
      }
      return { success: false, error: "Login failed" };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed. Please try again.",
      };
    }
  };

  // Register new patient or doctor account
  const register = async (userData) => {
    try {
      const accountType = userData.accountType || "patient";
      const response = await api.post(`/auth/${accountType}/register`, userData);

      if (response.data.success) {
        const { token: authToken, user: authUser } = response.data;
        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(authUser));
        localStorage.setItem("userRole", authUser.role);

        setToken(authToken);
        setUser(authUser);
        return { success: true, user: authUser };
      }
      return { success: false, error: "Registration failed" };
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.errors?.map((e) => e.message).join(", ") ||
        "Registration failed";

      return { success: false, error: errorMsg };
    }
  };

  // Revoke active user authentication state
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      setToken(null);
      setUser(null);
    }
  };

  // Update authenticated user state in application memory and storage
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUser,
        loading,
        token,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};