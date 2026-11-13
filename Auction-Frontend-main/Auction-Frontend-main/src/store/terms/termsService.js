import axiosInstance from "../../axiosInstance";
export const getterms = async () => {
  const response = await axiosInstance.get(`/terms`);
  return response.data;
};

export const updateterms = async (data) => {
  // Change from axiosInstance.put to axiosInstance.post if your Express route uses POST.
  const response = await axiosInstance.post(`/terms`, data);
  return response.data;
};

const termsService = {
  getterms,
  updateterms,
};

export default termsService;
