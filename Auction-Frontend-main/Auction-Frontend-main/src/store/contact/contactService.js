import axiosInstance from "../../axiosInstance";
export const getContactInfo = async () => {
  const response = await axiosInstance.get(`/contact`);
  return response.data;
};
export const CreateContactInfo = async (data) => {
  const response = await axiosInstance.post(`/contact/create-contact`, data);
  return response.data;
};
export const updateContactInfo = async (data) => {
  const { id, ...updateData } = data;
  const response = await axiosInstance.put(`/contact/${id}`, updateData);
  return response.data;
};
export const sendMessage = async (data) => {
  const response = await axiosInstance.post(`/contact`, data);
  return response.data;
};
export const deleteContactInfo = async (id) => {
  const response = await axiosInstance.delete(`/contact/contact-info/${id}`);
  return response;
};
const contactService = {
  CreateContactInfo,
  getContactInfo,
  updateContactInfo,
  sendMessage,
  deleteContactInfo,
};

export default contactService;
