import axiosInstance from "../../axiosInstance";

// Get token from localStorage
const getToken = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.token || "";
};

const submitBudgetRequest = async (data) => {
  const response = await axiosInstance.post(
    "/budget-requests/budget-requests",
    data,
  );
  return response.data;
};

const fetchFleetRecommendedAuctions = async (fleetOwnerId, budgetRequestId) => {
  // Build URL with query params if budgetRequestId is provided
  let url = `budget-requests/getfleetauction/${fleetOwnerId}`;
  if (budgetRequestId) {
    url += `?budgetRequestId=${budgetRequestId}`;
  }

  const response = await axiosInstance.get(url);

  return response.data;
};

const sendFleetRecommendation = async (budgetData) => {
  const token = getToken();
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const response = await axiosInstance.post(
    `/budget-requests/fleetRecomendation`,
    budgetData,
    config,
  );
  return response.data;
};

export const getFleetRecommendation = async (userId) => {
  const token = getToken();
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axiosInstance.get(
    `/budget-requests/fleetrecomendation/${userId}`,
    config,
  );

  return response.data;
};

const fleetService = {
  submitBudgetRequest,
  sendFleetRecommendation,
  fetchFleetRecommendedAuctions,
  getFleetRecommendation,
};

export default fleetService;
