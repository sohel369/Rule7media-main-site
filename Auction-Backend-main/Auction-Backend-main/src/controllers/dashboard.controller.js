import User from "../models/user.model.js";
import FleetOwner from "../models/fleetowner.model.js";
import Auction from "../models/auction.model.js";
import WrapperAssignment from "../models/wrapperassignment.model.js";
import Order from "../models/Order.js";
import Bid from "../models/bid.model.js";
import Vehicle from "../models/vehicle.model.js";
export const getDashboardStats = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let stats = {};

    switch (user.userType) {
      case "fleetOwner":
        const totalFleetOwnerAuctions = await FleetOwner.countDocuments({
          user: userId,
        });
const totalVehicles = await Vehicle.countDocuments({ addedBy: userId });
        const activeFleetOwnerAuctions = await FleetOwner.countDocuments({
          user: userId,
          $and: [
            { status: "active" },
            { status: { $nin: ["rejected", "over"] } },
            { purchaseStatus: { $ne: "sold" } },
          ],
        });
        const overFleetAuctions = await FleetOwner.countDocuments({
          user: userId,
          status: "over",
        });
        const pendingApprovals = await FleetOwner.countDocuments({
          user: userId,
          isApprovedByAdmin: false,
        });

        stats = {
          totalFleetOwnerAuctions,
          activeFleetOwnerAuctions,
          overFleetAuctions,
          pendingApprovals,
          totalVehicles
        };
        break;

      case "advertiser":
        const activeBidsCount = await Bid.countDocuments({
          bidder: userId,
          auctionType: "fleetauction",
          isWinningBid: false,
        });
        const wonAuctionsCount = await Bid.countDocuments({
          bidder: userId,
          auctionType: "fleetauction",
          isWinningBid: true,
        });

        const totalOrders = await Order.countDocuments({ userId });
        const deliveredOrders = await Order.countDocuments({
          userId,
          status: "DELIVERED",
        });
        stats = {
          activeBids: activeBidsCount,
          wonAuctions: wonAuctionsCount,
          deliveredOrders,
          totalOrders,
        };
        break;

      case "wrapper":
        // Count assigned orders (excluding cancelled)
        const assignedOrders = await WrapperAssignment.countDocuments({
          wrapper: userId,
          status: { $nin: ["CANCELLED"] },
        });

        const deliveredwrapperOrders = await WrapperAssignment.countDocuments({
          wrapper: userId,
          status: "DELIVERED",
        });

        const pendingRequests = await WrapperAssignment.countDocuments({
          wrapper: userId,
          status: "PENDING",
        });
        const acceptedAssignments = await WrapperAssignment.countDocuments({
          wrapper: userId,
          acceptStatus: "ACCEPTED",
        });
        stats = {
          assignedOrders,
          acceptedAssignments,
          deliveredwrapperOrders,
          pendingRequests,
        };
        break;
        break;
      case "seller":
        const totalAuctions = await Auction.countDocuments({ seller: userId });
        const activeAuctions = await Auction.countDocuments({
          seller: userId,
          status: "active",
        });
        const soldAuctions = await Auction.countDocuments({
          seller: userId,
          status: "sold",
        });
        stats = { totalAuctions, activeAuctions, soldAuctions };
        break;

      default:
        return res
          .status(400)
          .json({ message: "Invalid user type for dashboard stats" });
    }

    res.json({ userType: user.userType, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
