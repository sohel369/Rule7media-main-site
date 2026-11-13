import axiosInstance from "../../axiosInstance";

export const getExecutives = async () => {
  const response = await axiosInstance.get(`/executive`);

  return response.data;
};

export const addExecutive = async (data) => {
  const response = await axiosInstance.post(`/executive/executive`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response;
};

export const updateExecutiveById = async (id, data) => {
  const response = await axiosInstance.put(`/executive/executive/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};

export const deleteExecutiveById = async (id) => {
  const response = await axiosInstance.delete(`/executive/executive/${id}`);
  return response;
};

const ExecutivesService = {
  getExecutives,
  addExecutive,
  updateExecutiveById,
  deleteExecutiveById,
};

export default ExecutivesService;
