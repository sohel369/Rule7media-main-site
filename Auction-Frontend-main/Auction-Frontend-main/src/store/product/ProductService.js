import axiosInstance from "../../axiosInstance";

const createProducts = async (data) => {
  try {
    const response = await axiosInstance.post(`/products`, data);

    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;

    return { message, isError: true };
  }
};
///get products by seller id
const getProductsBySellerId = async (id, page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(
      `products/seller/${id}?page=${page}&limit=${limit}`,
    );

    // Standardize the response structure
    return {
      data: response.data.data || response.data.products || [],
      totalPages: response.data.totalPages || 1,
      currentPage: response.data.currentPage || page,
    };
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
};

///////get all product in home page
const ShowAllProducts = async (payload) => {
  try {
    const response = await axiosInstance.get(`/products`, {
      params: payload,
    });

    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};

///filter products
const getAllProducts = async (payload) => {
  try {
    const response = await axiosInstance.post(`/products/filter`, payload);
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};

const getSingleProductById = async (id) => {
  try {
    const res = await axiosInstance.get(`/products/${id}`);

    return res.data;
  } catch (err) {
    //console.error("Error in getSingleAuctionById", err);
    return null;
  }
};

const deleteSingleProductById = async (id) => {
  try {
    const response = await axiosInstance.delete(`/products/${id}`);

    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;
    //console.error("Error with deleteSingleAuctionById", error);
    return { message, isError: true };
  }
};

const updateSingleProduct = async (payload) => {
  try {
    const response = await axiosInstance.put(
      `/products/${payload.id}`,
      payload.data,
    );
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};
//////////admin page get product
export const getAllPRO = async ({ page, limit }) => {
  try {
    const response = await axiosInstance.get(
      `/products/getAllPRO?page=${page}&limit=${limit}`,
    );
    return response.data; // Return the complete data response
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch products",
    );
  }
};
const productsService = {
  getAllProducts,
  getSingleProductById,
  updateSingleProduct,
  deleteSingleProductById,
  createProducts,
  ShowAllProducts,
  getAllPRO,
  getProductsBySellerId,
};

export default productsService;
