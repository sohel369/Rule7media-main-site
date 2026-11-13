import axiosInstance from "../../axiosInstance";

const getOrdersBySeller = async (userId) => {
  try {
    const response = await axiosInstance.get(`/orders/Order/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    throw error;
  }
};
const getOrderSummary = async (sellerId) => {
  try {
    const response = await axiosInstance.get(`/orders/summary/${sellerId}`);

    return response.data;
  } catch (error) {
    console.error("Error fetching order summary:", error);
    throw error;
  }
};
const updateStatus = async (orderId, status) => {
  const response = await axiosInstance.put(`/orders/${orderId}`, { status });

  return response.data;
};
const getBuyerStats = async (userId) => {
  try {
    const response = await axiosInstance.get(`/orders/stats/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching buyer stats:", error);
    throw error;
  }
};

const getOrderfleetownerSummary = async (fleetownerId) => {
  try {
    const response = await axiosInstance.get(
      `/orders/fleet-orders-summary/${fleetownerId}`,
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching order summary:", error);
    throw error;
  }
};
const sellerOrderService = {
  getOrdersBySeller,
  getOrderSummary,
  updateStatus,
  getBuyerStats,
  getOrderfleetownerSummary,
};

export default sellerOrderService;
