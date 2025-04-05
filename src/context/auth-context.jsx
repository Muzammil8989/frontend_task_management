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
      } catch (error) {
        console.error(error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const loginUser = async (credentials) => {
    try {
      const data = await login(credentials);
      setUser(data.user);
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
