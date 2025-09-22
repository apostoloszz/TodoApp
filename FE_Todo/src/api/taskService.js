import axiosInstance from "./axiosInstance";

const getAllTasks = async () => {
  try {
    const response = await axiosInstance.get("/api/tasks");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// General task creation for Dashboard (uses /api/tasks endpoint)
const createGeneralTask = async (taskData) => {
  try {
    // Transform UI task format to backend format
    const backendTaskData = {
      title: taskData.title,
      description: taskData.description,
      status: taskData.statusId, // Backend expects status enum value directly
      priority: taskData.priorityId, // Backend expects priority enum value directly
      dueDate: taskData.dueDate || taskData.dueAt, // Backend expects dueDate
      categoryId: taskData.categoryId, // Include direct categoryId for some backend implementations
      category: taskData.categoryId ? { id: taskData.categoryId } : null,
    };

    console.log("Regular user create task data:", backendTaskData);

    const response = await axiosInstance.post("/api/tasks", backendTaskData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// General task update for Dashboard (uses /api/tasks endpoint)
const updateGeneralTask = async (taskId, taskData) => {
  try {
    // Transform UI task format to backend format
    const backendTaskData = {
      id: taskId, // Include task ID for proper identification
      title: taskData.title,
      description: taskData.description,
      status: taskData.statusId, // Backend expects status enum value directly
      priority: taskData.priorityId, // Backend expects priority enum value directly
      dueDate: taskData.dueDate || taskData.dueAt, // Backend expects dueDate
      categoryId: taskData.categoryId, // Include direct categoryId for some backend implementations
      category: taskData.categoryId ? { id: taskData.categoryId } : null,
    };

    console.log("Regular user update task data:", backendTaskData);

    const response = await axiosInstance.put(
      `/api/tasks/${taskId}`,
      backendTaskData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// General task deletion for Dashboard (uses /api/tasks endpoint)
const deleteGeneralTask = async (taskId) => {
  try {
    const response = await axiosInstance.delete(`/api/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getMyTasks = async (userId, categoryId) => {
  try {
    // Log the userId to help debug
    console.log("getMyTasks called with userId:", userId);

    if (!userId) {
      console.error("No userId provided to getMyTasks function");
      return [];
    }

    let url = `/api/my-tasks?currentUserId=${userId}`;
    if (categoryId && categoryId !== "all") {
      url += `&categoryId=${categoryId}`;
    }

    console.log("Fetching from URL:", url);
    const response = await axiosInstance.get(url);
    console.log("getMyTasks response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in getMyTasks:", error);
    throw error;
  }
};

const getTasksByStatus = async (status) => {
  try {
    const response = await axiosInstance.get(
      `/api/tasks/status?status=${status}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const createTask = async (currentUserId, taskData) => {
  try {
    // Transform UI task format to backend format
    const backendTaskData = {
      title: taskData.title,
      description: taskData.description,
      status: taskData.statusId, // Assuming statusId is the enum value
      priority: taskData.priorityId, // Assuming priorityId is the enum value
      dueDate: taskData.dueAt, // Backend expects dueDate, not dueAt
      category: taskData.categoryId ? { id: taskData.categoryId } : null,
      // Add user assignment if different from current user (for admin)
      user:
        taskData.userId && taskData.userId !== currentUserId
          ? { id: taskData.userId }
          : null,
    };

    console.log("Creating task with data:", backendTaskData);

    const response = await axiosInstance.post(
      `/api/my-tasks?currentUserId=${currentUserId}`,
      backendTaskData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateTask = async (taskId, currentUserId, taskData) => {
  try {
    // Transform UI task format to backend format
    const backendTaskData = {
      title: taskData.title,
      description: taskData.description,
      status: taskData.statusId, // Assuming statusId is the enum value
      priority: taskData.priorityId, // Assuming priorityId is the enum value
      dueDate: taskData.dueAt, // Backend expects dueDate, not dueAt
      category: taskData.categoryId ? { id: taskData.categoryId } : null,
      // Add user assignment if different from current user (for admin)
      user:
        taskData.userId && taskData.userId !== currentUserId
          ? { id: taskData.userId }
          : null,
    };

    console.log("Updating task with data:", backendTaskData);

    const response = await axiosInstance.put(
      `/api/my-tasks/${taskId}?currentUserId=${currentUserId}`,
      backendTaskData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateTaskStatus = async (taskId, status, currentUserId) => {
  try {
    const response = await axiosInstance.patch(
      `/api/my-tasks/${taskId}/status?status=${status}&currentUserId=${currentUserId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteTask = async (taskId, currentUserId) => {
  try {
    console.log(`Deleting task ${taskId} for user ${currentUserId}`);
    await axiosInstance.delete(
      `/api/my-tasks/${taskId}?currentUserId=${currentUserId}`
    );
    console.log(`Task ${taskId} deleted successfully`);
    return true;
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    throw error;
  }
};

const taskService = {
  getAllTasks,
  getMyTasks,
  getTasksByStatus,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  // General task functions for Dashboard
  createGeneralTask,
  updateGeneralTask,
  deleteGeneralTask,
};

export default taskService;
