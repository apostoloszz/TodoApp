import axiosInstance from "./axiosInstance";

const getAllStatuses = async () => {
  try {
    const response = await axiosInstance.get("/api/statuses");
    // Transform the enum array into the expected format for the UI
    // Converting PENDING, IN_PROGRESS, COMPLETED to proper display format
    return response.data.map((status, index) => ({
      id: status,
      name: status
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" "),
    }));
  } catch (error) {
    throw error;
  }
};

const statusService = {
  getAllStatuses,
};

export default statusService;
