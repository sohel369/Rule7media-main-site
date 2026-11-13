// import axiosInstance from "../../axiosInstance";
// export const getPrivacy = async () => {
//     const response = await axiosInstance.get(`/privacy`);
//     return response.data;
//   };
//   const addPrivacy = async (data) => {
//     const res = await axios.post(`/privacy/add`, data);
//     return res.data; // Expected: { success: true, policy: { ... } }
//   }

//   export const updatePrivacy = async (data) => {
//     // Change from axiosInstance.put to axiosInstance.post if your Express route uses POST.
//     const response = await axiosInstance.post(`/privacy`, data);
//     return response.data;
//   };

//   const privacyService = {
//     getPrivacy,
//     updatePrivacy,
//     addPrivacy,
//   };

//   export default privacyService;

import axiosInstance from "../../axiosInstance";

export const getPrivacy = async () => {
  const response = await axiosInstance.get(`/privacy`);
  return response.data;
};

export const updatePrivacy = async (data) => {
  const response = await axiosInstance.post(`/privacy`, data); // { country, content }
  return response.data;
};

export const addPrivacy = async (data) => {
  return updatePrivacy(data); // Reuse
};

const privacyService = {
  getPrivacy,
  updatePrivacy,
  addPrivacy,
};

export default privacyService;
