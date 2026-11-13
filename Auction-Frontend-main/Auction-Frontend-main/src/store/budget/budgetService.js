// src/redux/services/budgetService.js
import axiosInstance from "../../axiosInstance";

// Create Budget API
const createbudge = async (budgetData) => {
  const response = await axiosInstance.post("/budget/add", budgetData);
  return response.data;
};

// Get Budgets for Seller
const getbuyerbudgetinseller = async (sellerId) => {
  const response = await axiosInstance.get(`/budget/seller/${sellerId}`);
  return response.data;
};
const fetchAuctionsByBudget = async ({ sellerId, budget, category }) => {
  const response = await axiosInstance.get(
    `/budget/auctionbudget/${sellerId}`,
    {
      params: { budget, category },
    },
  );
  return response.data;
};
const sendRecommendation = async (budgetData) => {
  const response = await axiosInstance.post(
    "/budget/recommendations",
    budgetData,
  );
  return response.data;
};
const getbuyerrecmondation = async (buyerId) => {
  const response = await axiosInstance.get(`/budget/buyer/${buyerId}`);
  return response.data;
};
const budgetService = {
  createbudge,
  getbuyerbudgetinseller,
  fetchAuctionsByBudget,
  sendRecommendation,
  getbuyerrecmondation,
};

export default budgetService;
