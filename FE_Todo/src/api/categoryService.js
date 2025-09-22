import axiosInstance from "./axiosInstance";

// Get all categories for current user
export const getAllCategories = async (currentUserId) => {
  try {
    const response = await axiosInstance.get(
      `/api/my-tasks/categories?currentUserId=${currentUserId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// Create a new category for current user
export const createCategory = async (currentUserId, categoryData) => {
  try {
    const response = await axiosInstance.post(
      `/api/my-tasks/categories?currentUserId=${currentUserId}`,
      categoryData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (currentUserId, categoryId) => {
  try {
    await axiosInstance.delete(
      `/api/my-tasks/categories?currentUserId=${currentUserId}&categoryId=${categoryId}`
    );
    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};
