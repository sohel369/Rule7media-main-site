// src/services/adminbudgetService.js
import axiosInstance from "../../axiosInstance";
export const getAdminBudgetRequests = async ({
  status,
  page,
  limit,
  sortBy,
}) => {
  const response = await axiosInstance.get(
    "/budget-requests/admin/budget-requests",
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      params: {
        status: status || "", // empty to get all
        page: page || 1,
        limit: limit || 10,
        sortBy: sortBy || "createdAt",
      },
    },
  );
  return response.data;
};

const manageBudgetRequest = async (budgetRequestId, budgetData) => {
  const response = await axiosInstance.post(
    `/budget-requests/admin/budget-requests/${budgetRequestId}`, // Correct endpoint
    budgetData,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};
const getSingleBudgetRequest = async (id) => {
  const response = await axiosInstance.get(`/budget/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};
const adminbudgetService = {
  getAdminBudgetRequests,
  manageBudgetRequest,
  getSingleBudgetRequest,
};

export default adminbudgetService;
