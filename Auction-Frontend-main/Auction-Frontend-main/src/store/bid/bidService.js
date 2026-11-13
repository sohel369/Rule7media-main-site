import axiosInstance from "../../axiosInstance";

export const placeABid = async (data) => {
  const response = await axiosInstance.post(`/bids/${data.id}`, {
    amount: data.amount,
    bidType: data.bidType,
  });
  return response.data;
};

export const getBidsAuctionsByUser = async () => {
  const response = await axiosInstance.get(`/auctions/user-bids`);

  return response.data;
};
export const getFleetAuctionBidsByUser = async () => {
  const response = await axiosInstance.get(`/auctions/get-all-fleetbid-items`);

  return response.data;
};
export const getAllBidsForAuction = async (id) => {
  const response = await axiosInstance.get(`/bids/get-all-bids/${id}`);

  return response.data;
};

const bidService = {
  placeABid,
  getAllBidsForAuction,
  getBidsAuctionsByUser,
};

export default bidService;
