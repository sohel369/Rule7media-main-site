import axiosInstance from "../../axiosInstance";
const fetchEarnings = async (userId) => {
  try {
    const response = await axiosInstance.get(`/users/payouts/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching buyer orders:", error);
    throw error;
  }
};
const fetchStripeAccountStatus = async (accountId) => {
  try {
    const response = await axiosInstance.get(
      `/users/stripe-account-status/${accountId}`,
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching stripAccount Status:", error);
    throw error;
  }
};

const fetchSellerOnboarding = async (userId) => {
  try {
    const response = await axiosInstance.get(
      `/users/get-seller-onboarding/${userId}`,
    );

    return response.data;
  } catch (error) {
    console.error("Error fetch Seller onBoariding:", error);
    throw error;
  }
};

const fetchPayoutMethods = async (accountId) => {
  try {
    const response = await axiosInstance.get(
      `/users/${accountId}/payout-method`,
    );
    return response.data?.payout_methods || [];
  } catch (error) {
    console.error("Error fetching buyer orders:", error);
    throw error;
  }
};

const generateOnboardingLink = async (userId) => {
  try {
    const response = await axiosInstance.post(
      `/users/generate-onboarding-link/${userId}`,
    );

    return response.data;
  } catch (error) {
    console.error("Error Genrate OnBoarding Link:", error);
    throw error; // Important: Throw the error for the thunk to catch
  }
};

const generateUpdateLink = async (userId) => {
  try {
    const response = await axiosInstance.post(
      `/users/generate-update-link/${userId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error Genrate update Link:", error);
    throw error;
  }
};
const addPaymentMethod = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/payments/add-payment-method",
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Error adding payment method:", error);
    throw error;
  }
};

const updatePaymentMethod = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/payments/update-payment-method",
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating payment method:", error);
    throw error;
  }
};

const deletePaymentMethod = async () => {
  try {
    const response = await axiosInstance.delete(
      "/payments/delete-payment-method",
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting payment method:", error);
    throw error;
  }
};

const getPaymentMethod = async () => {
  try {
    const response = await axiosInstance.get("/payments/get-payment-method");

    return response.data;
  } catch (error) {
    console.error("Error fetching payment method:", error);
    throw error;
  }
};
const PaymentService = {
  fetchEarnings,
  fetchStripeAccountStatus,
  fetchSellerOnboarding,
  fetchPayoutMethods,
  generateOnboardingLink,
  generateUpdateLink,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  getPaymentMethod,
};
export default PaymentService;
