import axiosInstance from "../../axiosInstance";
export const getCookie = async () => {
  const response = await axiosInstance.get(`/cookie`);
  return response.data;
};

export const updateCookie = async (data) => {
  // Change from axiosInstance.put to axiosInstance.post if your Express route uses POST.
  const response = await axiosInstance.post(`/cookie`, data);
  return response.data;
};

const CookieService = {
  getCookie,
  updateCookie,
};

export default CookieService;
