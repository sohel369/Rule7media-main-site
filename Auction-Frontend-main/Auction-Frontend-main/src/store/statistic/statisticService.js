import axiosInstance from "../../axiosInstance";

const createStatistic = async (data) => {
  const response = await axiosInstance.post("/statistics", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
const getStatistics = async () => {
  const response = await axiosInstance.get(`/statistics`);

  return response.data;
};
//getstiitscsby langugage
const getStatisticsByCountry = async (country) => {
  const response = await axiosInstance.get(`/statistics/${country}`);
  return response.data;
};

// In statisticService.js
const updateStatistic = async (id, statisticData) => {
  const response = await axiosInstance.patch(
    `/statistics/${id}`,
    statisticData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

const deleteStatistic = async (id) => {
  await axiosInstance.delete(`/statistics/${id}`);
  return id;
};

const StatisticService = {
  createStatistic,
  getStatistics,
  getStatisticsByCountry,
  updateStatistic,
  deleteStatistic,
};

export default StatisticService;
