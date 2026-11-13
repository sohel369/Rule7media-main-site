import axiosInstance from "../../axiosInstance";
import Cookies from "js-cookie";
const getSubscriptionPlans = async () => {
  const response = await axiosInstance.get("/subscription-plans/all");
  return response.data;
};
const getSubscriptionPlansforusers = async () => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const response = await axiosInstance.get("/subscription-plans");
  return response.data;
};
const createSubscriptionPlan = async (planData) => {
  const response = await axiosInstance.post("/subscription-plans", planData);
  return response.data;
};

const updateSubscriptionPlan = async ({ id, planData }) => {
  const response = await axiosInstance.put(
    `/subscription-plans/${id}`,
    planData,
  );
  return response.data;
};

const deleteSubscriptionPlan = async (id) => {
  const response = await axiosInstance.delete(`/subscription-plans/${id}`);
  return response.data;
};
const upgradeSubscription = async ({ newPriceId, userEmail }) => {
  try {
    const token = Cookies.get("JwtToken");
    const response = await axiosInstance.post(
      "/subscription-plans/upgrade",
      { newPriceId, userEmail },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    return response.data;
  } catch (error) {
    console.error(
      "upgradeSubscription error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
const subscriptionPlanService = {
  getSubscriptionPlans,
  getSubscriptionPlansforusers,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  upgradeSubscription,
};

export default subscriptionPlanService;
