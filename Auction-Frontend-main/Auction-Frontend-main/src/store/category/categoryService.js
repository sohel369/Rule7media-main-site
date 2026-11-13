import axiosInstance from "../../axiosInstance";

export const getAllCategories = async () => {
  const response = await axiosInstance.get(`/product-categories`);
  return response.data;
};

//createCategory
export const createCategory = async (data) => {
  const response = await axiosInstance.post(`/product-categories`, data);

  return response.data;
};

//get a single category
export const getSingleCategory = async (id) => {
  const response = await axiosInstance.get(`/product-categories/${id}`);

  return response.data.data;
};

//update a category
export const updateCategory = async (data) => {
  const response = await axiosInstance.put(
    `/product-categories/${data.id}`,
    data.data,
  );

  return response.data.data;
};

//delete a category
export const deleteCategory = async (id) => {
  const response = await axiosInstance.delete(`/product-categories/${id}`);

  return response.data;
};

//get more detail about category
export const getCategoriesMoreDetail = async () => {
  const response = await axiosInstance.get(`/product-categories/detail`);

  return response.data.data;
};

//top 5 categoriess
export const getTopCategories = async () => {
  const response = await axiosInstance.get(`/product-categories/top`);

  return response.data.data;
};

const categoryService = {
  getAllCategories,
  createCategory,
  getSingleCategory,
  updateCategory,
  deleteCategory,
  getCategoriesMoreDetail,
  getTopCategories,
};

export default categoryService;
