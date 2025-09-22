import axiosInstance from "./axiosInstance";

// Admin specific task functions
const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/tasks/users");
    return response.data;
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    throw error;
  }
};

const getTasksByUser = async (userId) => {
  try {
    const response = await axiosInstance.get(`/api/admin/tasks/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error in getTasksByUser for userId=${userId}:`, error);
    throw error;
  }
};

const getTasksByUserAndStatus = async (userId, status) => {
  try {
    const response = await axiosInstance.get(
      `/api/admin/tasks/user/${userId}/status?status=${status}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error in getTasksByUserAndStatus for userId=${userId}, status=${status}:`,
      error
    );
    throw error;
  }
};

const updateTaskAsAdmin = async (taskId, taskData) => {
  try {
    // Ensure data is formatted correctly for backend
    const formattedData = {
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      dueDate: taskData.dueDate || taskData.dueAt, // Support both field names
      // Add user if available - support both direct ID and object
      userId: taskData.userId,
      user: taskData.userId
        ? { id: taskData.userId }
        : taskData.user
        ? taskData.user
        : undefined,
      // Add category if available - support both direct ID and object
      categoryId: taskData.categoryId,
      category: taskData.categoryId
        ? { id: taskData.categoryId }
        : taskData.category
        ? taskData.category
        : undefined,
    };

    console.log("Admin update task data:", formattedData);

    const response = await axiosInstance.put(
      `/api/admin/tasks/${taskId}`,
      formattedData
    );
    return response.data;
  } catch (error) {
    console.error(`Error in updateTaskAsAdmin for taskId=${taskId}:`, error);
    throw error;
  }
};

const updateTaskStatusAsAdmin = async (taskId, status) => {
  try {
    const response = await axiosInstance.patch(
      `/api/admin/tasks/${taskId}/status?status=${status}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error in updateTaskStatusAsAdmin for taskId=${taskId}, status=${status}:`,
      error
    );
    throw error;
  }
};

const deleteTaskAsAdmin = async (taskId) => {
  try {
    await axiosInstance.delete(`/api/admin/tasks/${taskId}`);
    return true;
  } catch (error) {
    console.error(`Error in deleteTaskAsAdmin for taskId=${taskId}:`, error);
    throw error;
  }
};

// Add task as admin
const createTaskForUser = async (userId, taskData) => {
  try {
    // Ensure data is formatted correctly for backend
    const formattedData = {
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      dueDate: taskData.dueDate || taskData.dueAt, // Support both field names
      // Add category if available
      category: taskData.categoryId ? { id: taskData.categoryId } : undefined,
    };

    console.log("Admin create task data:", formattedData);

    const response = await axiosInstance.post(
      `/api/admin/tasks/user/${userId}`,
      formattedData
    );
    return response.data;
  } catch (error) {
    console.error(`Error in createTaskForUser for userId=${userId}:`, error);
    throw error;
  }
};

const adminTaskService = {
  getAllUsers,
  getTasksByUser,
  getTasksByUserAndStatus,
  updateTaskAsAdmin,
  updateTaskStatusAsAdmin,
  deleteTaskAsAdmin,
  createTaskForUser,
};

export default adminTaskService;
