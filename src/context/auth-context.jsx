// import { createContext, useContext, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import { login, logout, register, getProfile } from "../services/auth-service";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Check for existing user profile on initial load
//     const checkAuth = async () => {
//       try {
//         const data = await getProfile();
//         setUser(data); // Set the user data if the profile is fetched successfully
//       } catch (error) {
//         console.error("Error fetching user profile:", error);
//         setUser(null); // If profile fetch fails, set user to null
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkAuth(); // Always check for the user's profile when the app loads
//   }, []); // Empty dependency array ensures this runs only once when the component mounts

//   const loginUser = async (credentials) => {
//     try {
//       const data = await login(credentials);
//       setUser(data.user); // Set the user after login
//       toast.success("Logged in successfully!");
//       navigate("/profile"); // Navigate to the profile page after login
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const logoutUser = async () => {
//     try {
//       await logout();
//       setUser(null); // Clear user data on logout
//       toast.success("Logged out successfully!");
//       navigate("/login"); // Navigate to login page after logout
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const registerUser = async (userData) => {
//     try {
//       await register(userData);
//       toast.success("Registration successful!");
//       navigate("/login"); // Navigate to login page after registration
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isLoading,
//         loginUser,
//         logoutUser,
//         registerUser,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

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
      // Invalidate and refetch profile to update user data
      await queryClient.invalidateQueries(["profile"]);
      toast.success("Logged in successfully!");
      navigate("/profile");
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
