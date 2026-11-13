import axiosInstance from "../../axiosInstance";

export const trackClick = async ({
  auctionId,
  userId,
  fleetOwnerId,
  userType,
  referrer,
  userAgent,
  email,
}) => {
  const response = await axiosInstance.post("/clicks/track-click", {
    auctionId,
    userId,
    fleetOwnerId,
    userType,
    referrer,
    userAgent,
    email,
    timestamp: new Date().toISOString(),
  });
  return response.data;
};

export const getAdminCTR = async () => {
  const response = await axiosInstance.get(`/clicks/ctr`);

  return response.data;
};

export const getAdvertiserCTR = async (advertiserId) => {
  const response = await axiosInstance.get(
    `/clicks/advertiser/${advertiserId}`,
  );
  return response.data;
};

const CTRService = {
  trackClick,
  getAdminCTR,
  getAdvertiserCTR,
};

export default CTRService;
