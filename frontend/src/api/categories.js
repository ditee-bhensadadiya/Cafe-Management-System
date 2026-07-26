import axiosClient from "./axiosClient";

export const categoryApi = {
  list: (includeInactive = false) =>
    axiosClient.get("/categories", { params: { include_inactive: includeInactive } }).then((r) => r.data),
  create: (payload) => axiosClient.post("/categories", payload).then((r) => r.data),
  update: (id, payload) => axiosClient.put(`/categories/${id}`, payload).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/categories/${id}`),
};
