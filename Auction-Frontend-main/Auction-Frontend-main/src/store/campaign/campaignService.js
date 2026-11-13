import axiosInstance from "../../axiosInstance"; // pre-configured axios

const API_URL = "/campaigns"; // backend endpoint

// Get all campaigns
const getCampaigns = async () => {
  try {
    const response = await axiosInstance.get("/campaigns");
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Create a new campaign
const createCampaign = async (campaignData) => {
  try {
    const response = await axiosInstance.post(
      "/campaigns/create",
      campaignData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // Ye zaroori nahi, lekin safe hai
        },
      },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
const getCampaignsByUserId = async () => {
  try {
    const response = await axiosInstance.get(`/campaigns/my-campaigns`);
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch your campaigns",
    );
  }
};
const getCampaignById = async (id) => {
  const response = await axiosInstance.get(`/campaigns/${id}`);
  return response.data.data;
};
const updateCampaign = async (id, campaignData) => {
  try {
    const response = await axiosInstance.put(`/campaigns/${id}`, campaignData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update campaign",
    );
  }
};

const deleteCampaign = async (id) => {
  try {
    const response = await axiosInstance.delete(`/campaigns/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete campaign",
    );
  }
};
// Track campaign click
const trackClick = async (id) => {
  try {
    const response = await axiosInstance.post(`/campaigns/${id}/click`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Track campaign impression
const trackImpression = async (id) => {
  try {
    const response = await axiosInstance.post(`/campaign//${id}/impression`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
const searchCampaigns = async (searchData) => {
  try {
    const response = await axiosInstance.post("/campaigns/search", searchData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
const campaignService = {
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignById,
  trackClick,
  trackImpression,
  getCampaignsByUserId,
  searchCampaigns,
};

export default campaignService;
