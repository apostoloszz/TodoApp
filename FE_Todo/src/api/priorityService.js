import axiosInstance from "./axiosInstance";

const getAllPriorities = async () => {
  try {
    const response = await axiosInstance.get("/api/priorities");
    // Transform the enum array into the expected format for the UI
    return response.data.map((priority, index) => ({
      id: priority,
      name: priority.charAt(0) + priority.slice(1).toLowerCase(),
    }));
  } catch (error) {
    throw error;
  }
};

// Note: The backend doesn't support these operations as Priority is an enum,
// but keeping the interface consistent for future use
const createPriority = async (priorityData) => {
  try {
    throw new Error("Creating priorities is not supported by the backend");
  } catch (error) {
    throw error;
  }
};

const updatePriority = async (priorityId, priorityData) => {
  try {
    throw new Error("Updating priorities is not supported by the backend");
  } catch (error) {
    throw error;
  }
};

const deletePriority = async (priorityId) => {
  try {
    throw new Error("Deleting priorities is not supported by the backend");
  } catch (error) {
    throw error;
  }
};

const priorityService = {
  getAllPriorities,
  createPriority,
  updatePriority,
  deletePriority,
};

export default priorityService;
