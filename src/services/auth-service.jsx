import axios from "axios";

// Fetch the base URL from the environment variables
const API = import.meta.env.VITE_BASE_URL;

// Login API
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API}/api/v1/auth/login`, credentials, {
      withCredentials: true, // Ensure cookies are sent with the request
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
    const response = await axios.post(
      `${API}/api/v1/auth/logout`, // Endpoint for logout
      {},
      {
        withCredentials: true, // Ensures cookies are sent with the request
        headers: {
          "Content-Type": "application/json", // Ensures content is sent as JSON
        },
      }
    );
    return response.data; // Successfully logged out
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Logout failed. Please try again."
    );
  }
};

// Register API
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

export const getProfile = async () => {
  try {
    const response = await axios.get(`${API}/api/v1/auth/profile`, {
      withCredentials: true, // Ensure cookies are sent with the request
      headers: {
        "Content-Type": "application/json", // Ensures content is sent as JSON
      },
    });
    return response.data;
  } catch (error) {
    // Network or response errors
    if (error.response) {
      // Server responded with an error
      throw new Error(
        error.response?.data?.message ||
          "Profile fetch failed. Please try again."
      );
    } else if (error.request) {
      // No response received from server
      throw new Error("No response from server. Please check your connection.");
    } else {
      // Something else went wrong while setting up the request
      throw new Error(`Request error: ${error.message}`);
    }
  }
};
