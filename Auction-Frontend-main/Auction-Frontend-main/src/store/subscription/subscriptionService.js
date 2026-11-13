import axiosInstance from "../../axiosInstance";
import Cookies from "js-cookie";
const subscribeUser = async ({ email, countryCode }) => {
  const response = await axiosInstance.post("/subscription/notify-admin", {
    email,
    countryCode,
  });
  return response.data;
};

const getSubscriptionPlanes = async () => {
  try {
    const response = await axiosInstance.get("/subscription/products");
    return response.data;
  } catch (error) {
    console.error(
      "getSubscriptionPlanes error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

const verifySubscription = async (sessionId) => {
  try {
    const response = await axiosInstance.get(
      `/subscription/verify-session/${sessionId}`,
    );
    return response.data;
  } catch (error) {
    console.error(
      "verifySubscription error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

const createsubscriptionCheckoutSession = async ({
  priceId,
  campaignId,
  price,
  currency,
  recurring,
  email,
  planDuration,
  country,
}) => {
  try {
    const response = await axiosInstance.post(
      "/subscription/subscription-checkout",
      {
        priceId,
        campaignId,
        price,
        currency,
        recurring,
        email,
        planDuration,
        country,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      "createsubscriptionCheckoutSession error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
const checkSubscriptionStatus = async () => {
  try {
    const token = Cookies.get("JwtToken");
    // if (!token) {
    //   throw new Error("No authentication token found");
    // }
    const response = await axiosInstance.get(
      "/subscription/check-subscription",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.subscription;
  } catch (error) {
    console.error(
      "checkSubscriptionStatus error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

const verifySubscriptionSession = async (sessionId, token) => {
  try {
    const response = await axiosInstance.get(
      `/subscription/verify-session/${sessionId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error) {
    console.error(
      "verifySubscriptionSession error:",
      error.response?.data,
      error.message,
    );
    throw error;
  }
};
const cancelSubscription = async ({
  stripeSubscriptionId,
  userEmail,
  userId,
  password,
  countryCode,
}) => {
  const token = Cookies.get("JwtToken");
  const response = await axiosInstance.post(
    "/subscription/cancel-subscription",
    { stripeSubscriptionId, userEmail, userId, password, countryCode },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};

const getSubscriptionStatus = async ({ userId, stripeSubscriptionId }) => {
  try {
    const token = Cookies.get("JwtToken");
    if (!token) {
      throw new Error("Authentication token not found");
    }
    const response = await axiosInstance.post(
      `subscription/status`,
      { userId, stripeSubscriptionId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data;
  } catch (error) {
    console.error("Get Subscription Status Error:", error.message);
    throw error;
  }
};

const subscriptionService = {
  subscribeUser,
  createsubscriptionCheckoutSession,
  verifySubscription,
  getSubscriptionPlanes,
  checkSubscriptionStatus,
  verifySubscriptionSession,
  cancelSubscription,
  getSubscriptionStatus,
};

export default subscriptionService;
