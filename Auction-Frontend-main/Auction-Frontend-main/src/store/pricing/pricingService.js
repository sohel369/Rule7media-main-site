import axiosInstance from "../../axiosInstance";

const fetchPlane = async () => {
  const response = await axiosInstance.get("/pricing");

  return Array.isArray(response.data) ? response.data : [];
};

export const createplane = async (plan) => {
  const res = await axiosInstance.post("/pricing/create", plan);

  return res.data.plan;
};

export const updateplan = async (id, plan) => {
  const res = await axiosInstance.put(`/pricing/updateplane/${id}`, plan);

  return res.data;
};

export const deleteplan = async (id) => {
  await axiosInstance.delete(`/pricing/deleteplane/${id}`);
  return id;
};

const planeService = {
  fetchPlane,
  createplane,
  updateplan,
  deleteplan,
};

export default planeService;
