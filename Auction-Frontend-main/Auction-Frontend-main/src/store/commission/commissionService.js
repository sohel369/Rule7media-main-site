import axiosInstance from "../../axiosInstance";

const fetchCommission = async () => {
  const response = await axiosInstance.get("/commission");
  return response.data;
};

const updateCommission = async (planDuration, commissionRate) => {
  const response = await axiosInstance.put(`/commission/${planDuration}`, {
    commissionRate,
  });
  return response.data.commission;
};

const commissionService = {
  fetchCommission,
  updateCommission,
};

export default commissionService;
