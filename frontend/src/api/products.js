import axiosClient from "./axiosClient";

export const productApi = {
  list: (params) => axiosClient.get("/products", { params }).then((r) => r.data),
  get: (id) => axiosClient.get(`/products/${id}`).then((r) => r.data),
  create: (payload) => axiosClient.post("/products", payload).then((r) => r.data),
  update: (id, payload) => axiosClient.put(`/products/${id}`, payload).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/products/${id}`),
};
