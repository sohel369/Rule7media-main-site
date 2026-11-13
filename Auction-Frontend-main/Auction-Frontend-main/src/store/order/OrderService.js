import axiosInstance from "../../axiosInstance";

const createOrders = async (data) => {
  try {
    const response = await axiosInstance.post(`/orders`, data);

    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;

    return { message, isError: true };
  }
};
const createAuctionorder = async (data) => {
  try {
    const response = await axiosInstance.post(`/orders/auction`, data);

    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;

    return { message, isError: true };
  }
};
///////get all order in home page
const getAllOrder = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(
      `/orders?page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    return { message: error.message, isError: true };
  }
};

const getWrapTypesSoldByFleetAuctionId = async (fleetAuctionId) => {
  try {
    const response = await axiosInstance.get(
      `/orders/wrap-types/${fleetAuctionId}`,
    );
    return response.data;
  } catch (error) {
    //console.error(`Error fetching wrap types for orderId ${fleetAuctionId}:`, error);
    throw error;
  }
};

const getBuyersOfProduct = async (productId, page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(
      `/orders/product/${productId}?page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching buyer orders:", error);
    throw error; // Important: Throw the error for the thunk to catch
  }
};

const getOrderSummary = async (payload) => {
  try {
    const response = await axiosInstance.get(`/orders/orders-summary`, payload);

    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};

const getSingleOrdertById = async (id) => {
  try {
    const res = await axiosInstance.get(`/orders/${id}`);

    return res.data;
  } catch (err) {
    //console.error("Error in getSingleAuctionById", err);
    return null;
  }
};
const fetchOrdersbyUserIdAsync = async (userId) => {
  try {
    const response = await axiosInstance.get(`/orders/user/${userId}`);

    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
};

const updateSingleOrder = async (orderId, status, fcmToken) => {
  try {
    const response = await axiosInstance.put(`/orders/${orderId}`, {
      status,
      fcmToken,
    });

    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};
///admin update order staus

const adminUpdateOrderStatus = async (orderId, status, fcmToken) => {
  try {
    const response = await axiosInstance.put(`/orders/status/${orderId}`, {
      status,
      fcmToken,
    });

    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};
///getsold quantity
const getSoldQuantity = async (productId) => {
  try {
    const response = await axiosInstance.get(
      `/orders/soldquantity/${productId}`,
    );
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};
// orderService.js
const downloadInvoiceService = async (orderId, status) => {
  try {
    const response = await axiosInstance.get(
      `/orders/download-invoice/${orderId}`,
      {
        responseType: "blob",
      },
    );
    return { blob: response.data, orderId };
  } catch (error) {
    console.error("Invoice API Error:", error);
    throw error;
  }
};

export const getSellerOrders = async (sellerId) => {
  try {
    // Make sure sellerId is properly extracted from the parameter
    const sellerIdValue = sellerId.sellerId || sellerId;
    const response = await axiosInstance.get(`/orders/Order/${sellerIdValue}`);
    return response.data; // Extract the actual data array from the response
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error; // Let the Redux thunk handle the error
  }
};

// Fixed getSellerOrderSummary function
export const getSellerOrderSummary = async (sellerId) => {
  try {
    // Make sure we have a valid sellerId string
    const sellerIdValue = sellerId?.sellerId || sellerId;

    const response = await axiosInstance.get(
      `/orders/orders/summary/${sellerIdValue}`,
    );
    return response.data.summary; // Extract the summary object
  } catch (error) {
    console.error("Error fetching order summary:", error);
    throw error; // Let the Redux thunk handle the error
  }
};

/* const deleteSingleProductById = async (id) => {
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
*/

const OrderService = {
  getAllOrder,
  getSingleOrdertById,
  createOrders,
  getOrderSummary,
  updateSingleOrder,
  adminUpdateOrderStatus,
  fetchOrdersbyUserIdAsync,
  downloadInvoiceService,
  getSoldQuantity,
  createAuctionorder,
  getBuyersOfProduct,
  getSellerOrders,
  getSellerOrderSummary,
  getWrapTypesSoldByFleetAuctionId,
};

export default OrderService;
