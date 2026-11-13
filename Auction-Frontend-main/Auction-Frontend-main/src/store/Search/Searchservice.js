import axiosInstance from "../../axiosInstance";

const searchMarketplaceApi = async (payload) => {
  try {
    const response = await axiosInstance.post("/search", payload);
    return response.data;
  } catch (error) {
    // Re-throw as-is so the thunk can read error.response.data.message
    // Only wrap if there's genuinely no server response (network/CORS/timeout)
    if (!error.response) {
      throw new Error(
        error.code === "ECONNABORTED"
          ? "Request timed out. Please check your connection and try again."
          : "Unable to reach the server. Please check your internet connection."
      );
    }
    throw error;
  }
};

const searchService = {
  searchMarketplaceApi,
};

export default searchService;