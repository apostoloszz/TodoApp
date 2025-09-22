import axiosInstance from "./axiosInstance";

const register = async (userData) => {
  try {
    const response = await axiosInstance.post("/api/auth/register", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const login = async (credentials) => {
  try {
    const response = await axiosInstance.post("/api/auth/login", credentials);
    if (response.data) {
      localStorage.setItem("token", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      return response.data;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};

const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};

const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axiosInstance.post(
      `/api/auth/refresh-token?refreshToken=${refreshToken}`
    );
    if (response.data) {
      localStorage.setItem("token", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      return response.data.accessToken;
    }
    return null;
  } catch (error) {
    logout();
    throw error;
  }
};

const authService = {
  register,
  login,
  logout,
  isAuthenticated,
  refreshToken,
};

export default authService;
