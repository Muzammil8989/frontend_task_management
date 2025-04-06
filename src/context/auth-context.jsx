import { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { login, logout, register, getProfile } from "../services/auth-service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch user profile using React Query
  const { data: user, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    retry: false,
    onError: () => {
      queryClient.setQueryData(["profile"], null);
    },
  });

  const loginUser = async (credentials) => {
    try {
      await login(credentials);
      await queryClient.invalidateQueries(["profile"]);
      toast.success("Logged in successfully!");
      navigate("/task");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logoutUser = async () => {
    try {
      await logout();
      // Clear profile data and redirect
      queryClient.setQueryData(["profile"], null);
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
        isLoading: isProfileLoading,
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
