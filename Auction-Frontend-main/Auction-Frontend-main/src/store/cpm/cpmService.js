import axiosInstance from "../../axiosInstance";

export const createCpm = async (data) => {
  const response = await axiosInstance.post(`/cpm`, data);
  return response.data.data;
};

export const getAllCpm = async (pageType) => {
  const url = pageType ? `/cpm?pageType=${pageType}` : `/cpm`;
  const response = await axiosInstance.get(url);
  return response.data.data;
};
export const updateCpm = async ({ id, ...data }) => {
  const response = await axiosInstance.put(`/cpm/${id}`, data); // Changed to PUT
  return response.data.data;
};

export const deleteCpm = async (id) => {
  const response = await axiosInstance.delete(`/cpm/${id}`);
  return response.data;
};

const cpmService = {
  // Fixed service name
  createCpm,
  getAllCpm,
  updateCpm,
  deleteCpm,
};

export default cpmService;
