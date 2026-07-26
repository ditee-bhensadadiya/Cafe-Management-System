import axiosClient from "./axiosClient";

export const dashboardApi = {
  user: () => axiosClient.get("/dashboard/user").then((r) => r.data),
  admin: () => axiosClient.get("/dashboard/admin").then((r) => r.data),
};

export const adminUserApi = {
  list: (params) => axiosClient.get("/admin/users", { params }).then((r) => r.data),
  setActiveStatus: (id, isActive) =>
    axiosClient.put(`/admin/users/${id}/status`, { is_active: isActive }).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/admin/users/${id}`),
};
