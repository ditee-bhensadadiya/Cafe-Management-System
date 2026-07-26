import axiosClient from "./axiosClient";

export const orderApi = {
  calculateCart: (items) => axiosClient.post("/orders/cart/calculate", { items }).then((r) => r.data),
  checkout: (payload) => axiosClient.post("/orders", payload).then((r) => r.data),
  myOrders: (params) => axiosClient.get("/orders/my", { params }).then((r) => r.data),
  getOrder: (id) => axiosClient.get(`/orders/${id}`).then((r) => r.data),
  // Admin
  listAll: (params) => axiosClient.get("/orders", { params }).then((r) => r.data),
  updateStatus: (id, status) => axiosClient.put(`/orders/${id}/status`, { status }).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/orders/${id}`),
};
