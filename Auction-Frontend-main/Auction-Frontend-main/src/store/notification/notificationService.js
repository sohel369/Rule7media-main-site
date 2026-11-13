import axiosInstance from "../../axiosInstance";

export const getNotificationForUser = async () => {
  const response = await axiosInstance.get(`/notifications/get-notifications`);

  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await axiosInstance.put(
    `/notifications/mark-as-read/${id}`,
    {},
  );

  return response.data;
};

export const sendNewBidNotification = async (data) => {
  const response = await axiosInstance.post(
    `/notifications/send-notification`,
    data,
  );

  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await axiosInstance.put(
    `/notifications/mark-all-as-read`,
    {},
  );

  return response.data;
};

export const sendOrderStatusNotification = async (data) => {
  try {
    const response = await axiosInstance.post(
      `/notifications/order-notification`,
      data,
    );

    return response.data;
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
    throw error;
  }
};

const notificationService = {
  getNotificationForUser,
  markNotificationAsRead,
  sendNewBidNotification,
  markAllNotificationsAsRead,
  sendOrderStatusNotification,
};

export default notificationService;
