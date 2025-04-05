import axios from "axios";

// Fetch the base URL from the environment variables
const API = import.meta.env.VITE_BASE_URL;

// Login API
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API}/api/v1/auth/login`, credentials, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json", // Ensures content is sent as JSON
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Login failed. Please try again."
    );
  }
};

// Logout API
export const logout = async () => {
  try {
    const response = await axios.get(`${API}/api/v1/auth/logout`, {});
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Logout failed. Please try again."
    );
  }
};

// Register API (New)
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API}/api/v1/auth/register`, userData, {
      headers: {
        "Content-Type": "application/json", // Ensures content is sent as JSON
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Registration failed. Please try again."
    );
  }
};
