import axiosInstance from "../../axiosInstance";

export const createCity = async (data) => {
  const response = await axiosInstance.post(`/cities`, data);

  return response.data;
};

export const getAllCities = async () => {
  const response = await axiosInstance.get(`/cities`);

  return response.data;
};

//get top cities by user
export const getTopCitiesByUser = async () => {
  const response = await axiosInstance.get(`/users/top-cities`);

  return response.data;
};

//delete a city
export const deleteCity = async (id) => {
  const response = await axiosInstance.delete(`/cities/${id}`);

  return response.data;
};

const cityService = {
  getAllCities,
  getTopCitiesByUser,
  createCity,
  deleteCity,
};

export default cityService;
