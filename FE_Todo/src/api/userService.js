import axiosInstance from "./axiosInstance";

const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get("/api/users/me");
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/api/users");
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const response = await axiosInstance.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post("/api/users", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateUser = async (userId, userData) => {
  try {
    const response = await axiosInstance.put(`/api/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    await axiosInstance.delete(`/api/users/${userId}`);
    return true;
  } catch (error) {
    throw error;
  }
};

const userService = {
  getCurrentUser,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

export default userService;
