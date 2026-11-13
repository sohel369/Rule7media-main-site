import axiosInstance from "../../axiosInstance";

export const getgoogleapi = async () => {
  try {
    const response = await axiosInstance.get("/google-map");
    return response.data;
  } catch (error) {
    console.error("Error fetching Google Maps API key:", error.message);
    throw error;
  }
};

const googlemapService = {
  getgoogleapi,
};

export default googlemapService;
