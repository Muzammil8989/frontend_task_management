import axios from "axios";

const API = import.meta.env.VITE_BASE_URL;

export const taskService = {
  getTasks: async (params) => {
    const response = await axios.get(`${API}/api/v1/tasks/get-tasks`, {
      params,
      withCredentials: true,
    });
    return response.data;
  },
  createTask: async (taskData) => {
    const response = await axios.post(
      `${API}/api/v1/tasks/create-tasks`,
      taskData,
      { withCredentials: true }
    );
    return response.data;
  },
  updateTask: async (id, taskData) => {
    const response = await axios.put(
      `${API}/api/v1/tasks/update-tasks/${id}`,
      taskData,
      { withCredentials: true }
    );
    return response.data;
  },
  deleteTask: async (id) => {
    const response = await axios.delete(
      `${API}/api/v1/tasks/delete-tasks/${id}`,
      { withCredentials: true }
    );
    return response.data;
  },
};
