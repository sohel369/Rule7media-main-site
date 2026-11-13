// fleetownerService.js
import axiosInstance from "../../axiosInstance";

export const addfleetauction = async (data) => {
  const response = await axiosInstance.post(`/fleetowner/addfleetdata`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response;
};

export const getfleetauctiondata = async (page = 1, limit = 10) => {
  const response = await axiosInstance.get(
    `/fleetowner?page=${page}&limit=${limit}`,
  );
  return response.data;
};
export const gettopfleetauction = async (page = 1, limit = 10) => {
  const response = await axiosInstance.get(
    `/fleetowner/topfleetauction?page=${page}&limit=${limit}`,
  );

  return response.data;
};

export const getfleetauctionbyid = async (id) => {
  const response = await axiosInstance.get(
    `/fleetowner/getfleetauctionby/${id}`,
  );
  return response.data;
};

export const getAuctionsByFleetOwner = async (fleetOwnerId) => {
  if (!fleetOwnerId) {
    throw new Error("fleetOwnerId is required");
  }
  const response = await axiosInstance.get(`/fleetowner/${fleetOwnerId}`); // Correct endpoint
  return response.data.data; // Return the auctions array directly
};

export const getAllVehicles = async () => {
  try {
    const response = await axiosInstance.get(`/vehicle/vehicles`);
    return response.data;
  } catch (error) {
    console.error("Vehicle not found");
  }
};
export const getVehicleDetails = async (vehicleName) => {
  try {
    const res = await axiosInstance.get(
      `/vehicle/model-details/${vehicleName}`,
    );
    setManufacturer(res.data.manufacturer);
    setYearOfManufacture(res.data.yearOfManufacture);
  } catch (error) {
    console.error("Vehicle not found");
  }
};

export const fetchBudgetRequestsForFleetOwner = async (fleetOwnerId) => {
  try {
    const response = await axiosInstance.get(
      `/budget-requests/fleetbudgetrequest/${fleetOwnerId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching budget requests:", error);
    throw error;
  }
};

export const getVehicalAvalibality = async (fleetOwnerId) => {
  const response = await axiosInstance.get(`/fleetowner/owner/${fleetOwnerId}`);
  return response.data.data.stats;
};
export const approveFleetAuction = async (auctionId) => {
  const res = await axiosInstance.put(
    `/fleetowner/approve-auction/${auctionId}`,
  );
  return res.data;
};

export const rejectFleetAuction = async (auctionId) => {
  const res = await axiosInstance.put(
    `/fleetowner/reject-auction/${auctionId}`,
  );
  return res.data;
};

export const updateFleetAuction = async (id, data) => {
  const response = await axiosInstance.put(
    `/fleetowner/edit-fleet-auction/${id}`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};
const deleteSingleFleetAuctionById = async (id) => {
  try {
    const response = await axiosInstance.delete(`/fleetowner/delete/${id}`);

    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;
    //console.error("Error with deleteSingleAuctionById", error);
    return { message, isError: true };
  }
};
export const fetchCPMData = async (id) => {
  const response = await axiosInstance.get(`/fleetowner/${id}`);
  return response.data;
};

export const searchFleetCampaigns = async (filters) => {
  const response = await axiosInstance.post(
    `/fleetowner/campaigns/search`,
    filters,
  );
  return response.data;
};
const fleetOwnerService = {
  addfleetauction,
  getfleetauctionbyid,
  getfleetauctiondata,
  getVehicleDetails,
  getAllVehicles,
  fetchBudgetRequestsForFleetOwner,
  getVehicalAvalibality,
  approveFleetAuction,
  rejectFleetAuction,
  deleteSingleFleetAuctionById,
  gettopfleetauction,
  fetchCPMData,
  getAuctionsByFleetOwner,
  searchFleetCampaigns,
  updateFleetAuction,
};

export default fleetOwnerService;
