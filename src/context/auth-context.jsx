// src/context/auth-context.js
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login, logout, register, getProfile } from "../services/auth-service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getProfile();
        setUser(data);
        if (window.location.pathname === "/login") {
          navigate("/profile");
        }
      } catch (error) {
        console.log(error);
        if (window.location.pathname !== "/login") {
          navigate("/login");
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // src/context/auth-context.js
  const loginUser = async (credentials) => {
    try {
      await login(credentials);
      const profileData = await getProfile();
      setUser(profileData);
      toast.success("Logged in successfully!");
      navigate("/profile");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logoutUser = async () => {
    try {
      await logout();
      setUser(null);
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const registerUser = async (userData) => {
    try {
      await register(userData);
      toast.success("Registration successful!");
      navigate("/login");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginUser,
        logoutUser,
        registerUser,
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
