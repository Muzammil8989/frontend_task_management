import { createContext, useContext, useState } from "react";
import { login, logout, register } from "../services/auth-service";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Create the context with default values
export const AuthContext = createContext({
  user: null,
  loginUser: () => {
    throw new Error("loginUser must be used within an AuthProvider");
  },
  logoutUser: () => {
    throw new Error("logoutUser must be used within an AuthProvider");
  },
  registerUser: () => {
    throw new Error("registerUser must be used within an AuthProvider");
  },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const loginUser = async (credentials) => {
    try {
      const data = await login(credentials);
      setUser(data.user);
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed!");
    }
  };

  const logoutUser = async () => {
    try {
      await logout();
      setUser(null);
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed!");
    }
  };

  const registerUser = async (userData) => {
    try {
      const data = await register(userData);
      setUser(data.user);
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed!");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, registerUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
