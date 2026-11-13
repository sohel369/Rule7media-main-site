import axiosInstance from "../../axiosInstance";

const getAllUsers = async () => {
  const response = await axiosInstance.get(`/users`);

  return response.data;
};
const getAllAdmin = async () => {
  const response = await axiosInstance.get(`/users/getAllAdmin`);

  return response.data;
};
const getSellerById = async (id) => {
  const response = await axiosInstance.get(`/users/getSaller/${id}`); // Fixed URL typo
  return response.data;
};

//get single user by id
const getUserById = async (data) => {
  const response = await axiosInstance.get(`/users/${data}`);

  return response.data.data.user;
};

//update user by id update-user/665199e75a0743671dff61c1
const updateUserById = async (data) => {
  const response = await axiosInstance.put(
    `/users/update-user/${data.id}`,
    data.data,
  );

  return response.data.data.user;
};

//delete a user by id
const deleteUserById = async (data) => {
  const response = await axiosInstance.delete(`/users/${data}`);

  return response.data;
};

//get top sellers
const getTopSellers = async () => {
  const response = await axiosInstance.get(`/users/top-sellers`);

  return response.data.data;
};

const userService = {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getTopSellers,
  getAllAdmin,
  getSellerById,
};

export default userService;
