import axiosInstance from "../../axiosInstance";

export const getVehicleWraps = async () => {
  const response = await axiosInstance.get(`/vehiclewrap`);

  return response.data;
};

export const getVehicleWrapById = async (id) => {
  const response = await axiosInstance.get(`/vehiclewrap/${id}`);
  return response.data;
};

export const addVehicleWrap = async (formData) => {
  const response = await axiosInstance.post("/vehiclewrap", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateVehicleWrap = async (id, formData) => {
  const response = await axiosInstance.put(`/vehiclewrap/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteVehicleWrap = async (id) => {
  const response = await axiosInstance.delete(`/vehiclewrap/${id}`);
  return response.data;
};

const vehicleWrapService = {
  getVehicleWraps,
  getVehicleWrapById,
  addVehicleWrap,
  updateVehicleWrap,
  deleteVehicleWrap,
};

export default vehicleWrapService;
