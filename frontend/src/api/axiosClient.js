import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach JWT to every outgoing request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("cafe_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response handling: normalize errors, handle 401 (session expired), retry once on network failure
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    // Retry once on pure network failure (no response at all), e.g. flaky connection
    if (!error.response && !originalRequest._retried) {
      originalRequest._retried = true;
      try {
        return await axiosClient(originalRequest);
      } catch (retryError) {
        return Promise.reject(normalizeError(retryError));
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("cafe_access_token");
      localStorage.removeItem("cafe_user");

      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin/login";
      } else {
        window.location.href = "/login";
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

function normalizeError(error) {
  const data = error.response?.data;
  if (data?.errors?.length) {
    // FastAPI/Pydantic validation error shape from our backend's error handler
    return { message: data.message || "Validation failed.", fieldErrors: data.errors, status: error.response.status };
  }
  return {
    message: data?.message || error.message || "Something went wrong. Please try again.",
    status: error.response?.status,
  };
}

export default axiosClient;
