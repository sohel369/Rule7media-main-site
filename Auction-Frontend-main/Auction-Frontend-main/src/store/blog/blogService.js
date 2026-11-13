import axiosInstance from "../../axiosInstance";

// Public API - get blogs by country
export const fetchBlogsByCountryAPI = async (country, page = 1, limit = 9) => {
  const response = await axiosInstance.get(`/blogs/country/${country}?page=${page}&limit=${limit}`);
  return response.data;
};

// Admin APIs
export const createBlogAPI = async (formData) => {
  const response = await axiosInstance.post("/blogs/admin", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

export const updateBlogAPI = async (id, formData) => {
  const response = await axiosInstance.put(`/blogs/admin/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

export const deleteBlogAPI = async (id) => {
  const response = await axiosInstance.delete(`/blogs/admin/${id}`);
  return response.data;
};
export const fetchBlogByIdAPI = async (id) => {
  const response = await axiosInstance.get(`/blogs/${id}`);
  return response.data;
};
export const getAllBlogsAdminAPI = async ({ page = 1, limit = 10, country, category } = {}) => {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("limit", limit);
  if (country && country !== "all") params.append("country", country);
  if (category && category !== "all") params.append("category", category);
  
  const response = await axiosInstance.get(`/blogs/admin/all?${params.toString()}`);
  return response.data;
};