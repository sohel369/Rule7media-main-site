import axiosInstance from "../../axiosInstance";

const getDashboardStats = async (userId) => {
  const response = await axiosInstance.get(`/dashboard/stats/${userId}`);
  return response.data;
};

const DashboardService = {
  getDashboardStats,
};

export default DashboardService;
