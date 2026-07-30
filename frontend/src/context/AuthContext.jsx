// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password, role) => {
    try {
      console.log(`Attempting login: /api/auth/${role}/login`);
      const response = await api.post(`/auth/${role}/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userRole", user.role);
        setToken(token);
        setUser(user);
        return { success: true, user };
      }
      return { success: false, error: "Login failed" };
    } catch (error) {
      console.error("Login error:", error.response || error);
      return {
        success: false,
        error: error.response?.data?.error || "Login failed. Please try again.",
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log("Attempting registration:", userData);
const response = await api.post(
   `/auth/${userData.accountType}/register`,
   userData
);
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userRole", user.role);
        setToken(token);
        setUser(user);
        return { success: true, user };
      }
      return { success: false, error: "Registration failed" };
    } catch (error) {
      console.log("=========== REGISTRATION ERROR ===========");
      console.log("Status:", error.response?.status);
      console.log("Response:", error.response?.data);

      // 👇 Ye line add karo
      console.table(error.response?.data?.errors);

      console.log("Full Error:", error);
      console.log("==========================================");

      return {
  success: false,
  error:
    error.response?.data?.error ||
    error.response?.data?.errors?.map((e) => e.message).join(", ") ||
    "Registration failed",
};
    }
  };

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
