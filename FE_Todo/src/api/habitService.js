import axiosInstance from "./axiosInstance";

const getAllHabits = async (userId) => {
  try {
    const response = await axiosInstance.get(`/api/habits?userId=${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getHabitById = async (habitId) => {
  try {
    const response = await axiosInstance.get(`/api/habits/${habitId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const createHabit = async (habitData) => {
  try {
    const response = await axiosInstance.post("/api/habits", habitData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateHabit = async (habitId, habitData) => {
  try {
    const response = await axiosInstance.put(
      `/api/habits/${habitId}`,
      habitData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteHabit = async (habitId) => {
  try {
    await axiosInstance.delete(`/api/habits/${habitId}`);
    return true;
  } catch (error) {
    throw error;
  }
};

const updateHabitProgress = async (habitId, completedDays) => {
  try {
    const response = await axiosInstance.patch(
      `/api/habits/${habitId}/progress`,
      {
        completedDays,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const markHabitCompleted = async (habitId, date) => {
  try {
    const response = await axiosInstance.post(
      `/api/habits/${habitId}/completion`,
      {
        date,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const habitService = {
  getAllHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  updateHabitProgress,
  markHabitCompleted,
};

export default habitService;
