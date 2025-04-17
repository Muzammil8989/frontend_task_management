import axios from "axios";

const API = import.meta.env.VITE_BASE_URL;

export const taskService = {
  getTasks: async (params) => {
   
    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
    );

    console.log("Sending request with params:", cleanedParams); // Debug log

    try {
      const response = await axios.get(`${API}/api/v1/tasks/get-tasks`, {
        params: cleanedParams,
        withCredentials: true,
      });
      console.log("Received response:", response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error("Error fetching tasks:", error.response?.data || error.message);
      // Re-throw the error so React Query can handle it
      throw error.response?.data || new Error("Failed to fetch tasks");
    }
  },

  createTask: async (taskData) => {
    try {
      const response = await axios.post(
        `${API}/api/v1/tasks/create-tasks`,
        taskData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating task:", error.response?.data || error.message);
      throw error.response?.data || new Error("Failed to create task");
    }
  }, 
  updateTask: async (id, taskData) => {
    try {
      const response = await axios.put(
        `${API}/api/v1/tasks/update-tasks/${id}`,
        taskData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating task:", error.response?.data || error.message);
      throw error.response?.data || new Error("Failed to update task");
    }
  }, 

  deleteTask: async (id) => {
    try {
      const response = await axios.delete(
        `${API}/api/v1/tasks/delete-tasks/${id}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting task:", error.response?.data || error.message);
      throw error.response?.data || new Error("Failed to delete task");
    }
  }, 
}; 
