// src/services/gifService.js
import axiosInstance from "../../axiosInstance";

export const getGifs = async () => {
  const response = await axiosInstance.get("/add-gif");
  return response.data;
};

export const addGif = async (formData) => {
  const response = await axiosInstance.post("/add-gif", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateGifById = async (id, formData) => {
  const response = await axiosInstance.put(`/add-gif/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteGifById = async (id) => {
  const response = await axiosInstance.delete(`/add-gif/${id}`);
  return response.data;
};
export const getGifById = async (id) => {
  const response = await axiosInstance.get(`/add-gif/${id}`);
  return response.data;
};
export const getPublicGifs = async () => {
  const response = await axiosInstance.get("/add-gif/public");
  return response.data;
};

export const trackImpression = async (adId) => {
  await axiosInstance.post(`/add-gif/track/impression/${adId}`);
};

export const trackClick = async (adId) => {
  await axiosInstance.post(`/add-gif/track/click/${adId}`);
};
const gifService = {
  getGifs,
  addGif,
  updateGifById,
  deleteGifById,
  getPublicGifs,
  trackImpression,
  trackClick,
  getGifById,
};

export default gifService;
