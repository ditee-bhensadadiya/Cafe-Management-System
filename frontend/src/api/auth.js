import axiosClient from "./axiosClient";

export const authApi = {
  register: (payload) => axiosClient.post("/auth/register", payload).then((r) => r.data),
  login: (payload) => axiosClient.post("/auth/login", payload).then((r) => r.data),
  forgotPassword: (payload) => axiosClient.post("/auth/forgot-password", payload).then((r) => r.data),
  resetPassword: (payload) => axiosClient.post("/auth/reset-password", payload).then((r) => r.data),
  me: () => axiosClient.get("/auth/me").then((r) => r.data),
};
