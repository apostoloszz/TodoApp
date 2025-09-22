import axios from "axios";

const API_URL = "http://localhost:8080";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
// Queue of pending requests
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor for adding the auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error contains JWT expired message and we haven't tried to refresh yet
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry &&
      // Check various locations where the error might be
      ((typeof error.response.data === "string" &&
        error.response.data.includes("JWT expired")) ||
        (error.response.data &&
          error.response.data.message &&
          error.response.data.message.includes("JWT expired")) ||
        (error.response.data &&
          error.response.data.error &&
          error.response.data.error.includes("JWT expired")) ||
        (error.message && error.message.includes("JWT expired")) ||
        error.toString().includes("JWT expired") ||
        (error.response.data &&
          error.response.data.toString &&
          error.response.data.toString().includes("JWT expired")))
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call your refresh token endpoint
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(
          `${API_URL}/api/auth/refresh-token?refreshToken=${refreshToken}`
        );

        // If refresh successful, store new token and retry original request
        if (response.status === 200 && response.data) {
          const newAccessToken = response.data.accessToken;
          localStorage.setItem("token", newAccessToken);
          localStorage.setItem("refreshToken", response.data.refreshToken);
          axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 401 Unauthorized errors that aren't token expiration
    if (error.response && error.response.status === 401) {
      // Only redirect if it's truly an auth error (avoid redirect loops)
      const isAuthEndpoint = originalRequest.url.includes("/api/auth/");
      if (!isAuthEndpoint) {
        console.log("Unauthorized access detected, clearing tokens");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
