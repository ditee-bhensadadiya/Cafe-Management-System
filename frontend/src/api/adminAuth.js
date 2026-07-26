import axiosClient from "./axiosClient";

export const adminAuthApi = {
  register: (payload) =>
    axiosClient.post("/auth/admin/register", payload).then((res) => res.data),
};