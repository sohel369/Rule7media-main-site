import axiosInstance from "../../axiosInstance";

const createAuction = async (data) => {
  try {
    const response = await axiosInstance.post(`/auctions/create-auction`, data);

    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;
    //console.error("Error with createAuction", error);
    return { message, isError: true };
  }
};
const createAuctionsFromCSV = async (data) => {
  try {
    const response = await axiosInstance.post("/auctions/uploadcsv", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;
    //console.error("Error with createAuction", error);
    return { message, isError: true };
  }
};

const getAllAuctions = async (data) => {
  try {
    const response = await axiosInstance.post(`/auctions`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;
    // //console.error("Error with getAllAuctions", error);
    return { message, isError: true };
  }
};
const getAllAuctionscombined = async (data) => {
  try {
    const response = await axiosInstance.post(`/auctions/combined`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;

    return { message, isError: true };
  }
};
const getSingleAuctionById = async (id) => {
  try {
    const res = await axiosInstance.get(`/auctions/${id}`);

    if (res.data && res.data.data) {
      return res.data;
    } else {
      return {
        success: true,
        data: res.data,
        message: "Auction retrieved successfully",
      };
    }
  } catch (err) {
    console.error("❌ API error:", err.response?.data || err.message);
    throw err;
  }
};
const getLiveAuctionsbysellerid = async (sellerId) => {
  try {
    const res = await axiosInstance.get(`/auctions/active-count/${sellerId}`);

    return res.data;
  } catch (err) {
    //console.error("Error in getSingleAuctionById", err);
    return null;
  }
};
const getAuctionsBySellerWithBids = async (id) => {
  if (!id) {
    console.error("No seller ID provided to getAuctionsBySellerWithBids");
    return null;
  }
  try {
    const response = await axiosInstance.get(`/auctions/seller/${id}`);
    return response.data;
  } catch (err) {
    console.error("Error in getAuctionsBySellerWithBids", err);
    return null;
  }
};

//update auction status

const updateAuctionStatus = async (data) => {
  try {
    const response = await axiosInstance.post(`/auctions/${data.id}/status`, {
      status: data.status,
    });

    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;
    //console.error("Error with updateAuctionStatus", error);
    return { message, isError: true };
  }
};

const selectAuctionWinner = async (data) => {
  try {
    const response = await axiosInstance.get(`/bids/${data.id}/winner`);

    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;
    //console.error("Error with selectAuctionWinner", error);
    return { message, isError: true };
  }
};

const getSellerAuction = async () => {
  try {
    const response = await axiosInstance.get(`/auctions/user-auctions`);
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;
    //console.error("Error with getSellerAuction", error);
    return { message, isError: true };
  }
};

const deleteSingleAuctionById = async (id) => {
  try {
    const response = await axiosInstance.delete(`/auctions/delete/${id}`);

    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;

    return { message, isError: true };
  }
};

const deleteAuctionByAdminById = async (id) => {
  try {
    const response = await axiosInstance.delete(`/auctions/admin-delete/${id}`);

    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;

    return { message, isError: true };
  }
};

const updateSingleAuction = async (data) => {
  try {
    const response = await axiosInstance.put(
      `/auctions/update/${data.id}`,
      data.data,
      { withCredentials: true },
    );

    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;
    //console.error("Error with updateSingleAuction", error);
    return { message, isError: true };
  }
};

const getWinnerDetail = async (id) => {
  try {
    const response = await axiosInstance.get(`/auctions/${id}/winner`);

    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;

    return { message, isError: true };
  }
};

const getLiveAuctions = async (country) => {
  try {
    const response = await axiosInstance.get(
      `/auctions/live-auctions?country=${encodeURIComponent(country)}`,
    );
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};

const getUpcomingAuctions = async (country) => {
  try {
    const response = await axiosInstance.get(
      `/auctions/upcoming-auctions?country=${encodeURIComponent(country)}`,
    );

    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;

    return { message, isError: true };
  }
};

const getEndingAuctions = async (country) => {
  try {
    const response = await axiosInstance.get(
      `/auctions/ending-auctions?country=${encodeURIComponent(country)}`,
    );

    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;

    return { message, isError: true };
  }
};

const updatePaymentStatus = async (id) => {
  try {
    const response = await axiosInstance.put(
      `/auctions/update-payment-status/${id}`,
      {
        withCredentials: true,
      },
    );

    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;
    //console.error("Error with getLiveAuctions", error);
    return { message, isError: true };
  }
};

const getAllAuctionWinners = async () => {
  try {
    const response = await axiosInstance.get(`/auctions/winners`);
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};

const updateCampingAdminStatus = async (data) => {
  try {
    const response = await axiosInstance.put(
      `/auctions/admin-status/${data.id}`,
      { adminstatus: data.adminstatus },
    );

    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data.message) || error.message;
    return { message, isError: true };
  }
};
const auctionService = {
  getWinnerDetail,
  createAuction,
  getAllAuctions,
  getAllAuctionscombined,
  getSingleAuctionById,
  updateAuctionStatus,
  selectAuctionWinner,
  getSellerAuction,
  deleteSingleAuctionById,
  updateSingleAuction,
  getLiveAuctions,
  getUpcomingAuctions,
  getEndingAuctions,
  updatePaymentStatus,
  deleteAuctionByAdminById,
  getAuctionsBySellerWithBids,
  getLiveAuctionsbysellerid,
  createAuctionsFromCSV,
  getAllAuctionWinners,
  updateCampingAdminStatus,
};

export default auctionService;
