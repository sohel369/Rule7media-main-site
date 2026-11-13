import { useEffect, useMemo, useState, useCallback } from "react";
import {
  FaRegEdit,
  FaChartLine,
  FaShoppingCart,
  FaMoneyBillWave,
  FaCreditCard,
  FaCheckCircle,
  FaTrophy,
  FaStar,
  FaTruck,
  FaBullhorn,
  FaClock,
  FaAd,
  FaBox,
  FaRoad,
  FaCogs,
  FaHourglassHalf,
  FaThumbsUp,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser } from "../store/auth/authSlice";
import {
  fetchOrderSummary,
  getBuyerStats,
} from "../store/sellerOrder/sellerOrderSlice";
import { fetchEarnings } from "../store/payment/paymentSlice";
import {
  getLiveAuctionsbysellerid,
  reset,
} from "../store/auction/auctionSlice";
import {
  fetchDashboardStats,
  resetDashboard,
} from "../store/dashboard/dashboardSlice";

import {
  HeaderLeaderboard,
  FooterLeaderboard,
  MobileStickyLeaderboard,
} from "../components/AdSlots";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const sellerId = user?._id;
  const userId = user?._id;
  const { ordersSummary, buyerStats } = useSelector(
    (state) => state.sellerOrders,
  );

  const { stats, userType, isLoading, isError, message } = useSelector(
    (state) => state.dashboard,
  );
  const { earnings } = useSelector((state) => state.payment);
  const { liveAuction } = useSelector((state) => state.auction);
  const { cartItems, winningBid } = useSelector((state) => state.cart);

  const cartItemCount = useMemo(() => {
    if (cartItems && cartItems.length > 0) {
      const cart = cartItems[0];
      const productCount = cart.products?.length || 0;
      const auctionCount = cart.auctions?.length || 0;
      return productCount + auctionCount;
    }
    return 0;
  }, [cartItems, winningBid]);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (sellerId) {
      dispatch(getCurrentUser());
      dispatch(fetchOrderSummary(sellerId));
      dispatch(fetchEarnings(sellerId));
      dispatch(getLiveAuctionsbysellerid(sellerId));
    }
  }, [dispatch, sellerId]);

  useEffect(() => {
    dispatch(fetchDashboardStats(userId));

    return () => {
      dispatch(resetDashboard());
    };
  }, [dispatch, userId]);

  useEffect(() => {
    if (user?._id) {
      dispatch(getBuyerStats(user._id));
    }
  }, [user?._id, dispatch]);

  // Simulate error message on wrong input (for demo purposes)
  useEffect(() => {
    if (user && user.userType === "fleetOwner" && !user.email) {
      setErrorMessage("Welcome, Fleet Owner - Already Registered");
      const timer = setTimeout(() => setErrorMessage(""), 5000); // Display for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [user]);

  const capitalizeName = (name) => {
    if (!name || typeof name !== "string") return "User";
    return (
      name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase()
    );
  };
  const toTitleCase = (str) => {
    if (!str) return "-";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  const DashboardHeader = useCallback(() => {
    const userType = user?.userType;
    return (
      <div className="mb-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 shadow-xl border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {user && (
            <div className="flex items-center gap-3 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md ring-2 ring-blue-300/50 group-hover:ring-3 group-hover:ring-purple-300/50 ">
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : "F"}
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">
                  Welcome,{" "}
                  <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    {capitalizeName(user.firstName || "User")}
                    {user.lastname && <span className="inline-block w-2" />}
                    {user.lastname && capitalizeName(user.lastname)}
                  </span>
                </h2>
                <p className="text-blue-100/80 text-xs font-medium mt-0.5 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  {user?.userType === "fleetOwner"
                    ? "Vehicle Owner or Fleet Manager"
                    : user?.userType === "advertiser" ||
                        user?.userType === "buyer"
                      ? "Buyer or Marketing Executive"
                      : user?.userType === "wrapper"
                        ? "Vehicle Wrapping Business"
                        : user?.userType === "seller"
                          ? "Ancillary Advertiser"
                          : user?.userType
                            ? `${capitalizeName(user.userType)} Dashboard`
                            : "Standard Dashboard"}
                </p>
              </div>
            </div>
          )}

          {userType === "fleetOwner" && (
            <Link
              to="/user-profile/add-vehicle-dimensions"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white rounded-lg hover:shadow-md transition-all duration-300 font-semibold text-xs uppercase tracking-wider shadow-sm hover:shadow-blue-500/20 group"
            >
              <FaTruck className="group-hover:scale-105 transition-transform text-sm" />
              <span className="relative">
                Manage Fleet
                <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-white/40 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
              </span>
            </Link>
          )}

          {userType === "driver" && (
            <Link
              to="/driver-dashboard"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-lg hover:shadow-md transition-all duration-300 font-semibold text-xs uppercase tracking-wider shadow-sm hover:shadow-emerald-500/20 group"
            >
              <FaRoad className="group-hover:scale-105 transition-transform text-sm" />
              <span className="relative">
                View Routes
                <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-white/40 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
              </span>
            </Link>
          )}
        </div>
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-500/80 text-white rounded-lg shadow-md animate-fade-in">
            {errorMessage}
          </div>
        )}
      </div>
    );
  }, [user, capitalizeName, errorMessage]);

  const SellerDashboard = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="My display ads"
          value={ordersSummary?.totalAuctions || 0}
          icon={<FaBullhorn className="text-green-400" />}
          color="from-green-500 to-green-700"
          to="/user-profile/manage-items"
        />
        <StatCard
          title="Monthly Budget"
          value={ordersSummary?.totalOrders || 0}
          icon={<FaShoppingCart className="text-blue-400" />}
          color="from-blue-500 to-blue-700"
          to="/user-profile/orders"
        />
        <StatCard
          title="Expended"
          // value={
          //   earnings?.already_paid_out
          //     ? `${earnings.already_paid_out} ${earnings.currency}`
          //     : "$0"
          // }
          value={0}
          icon={<FaChartLine className="text-purple-400" />}
          color="from-purple-500 to-purple-700"
          to="/user-profile/manage-items"
          filter="active"
        />
        <StatCard
          title=" Available"
          //value={ordersSummary?.activeAuctions || 0}
          // value={
          //   earnings?.already_paid_out
          //     ? `${earnings.already_paid_out} ${earnings.currency}`
          //     : "$0"
          // }
          value={
            earnings?.already_paid_out ? `${earnings.already_paid_out}` : "$0"
          }
          icon={<FaChartLine className="text-yellow-400" />}
          color="from-yellow-500 to-yellow-700"
          to="/user-profile/SellerOnboarding"
        />
      </div>
    );
  };

  const BuyerDashboard = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Bids"
          value={buyerStats?.activeBids ?? 0}
          icon={<FaCreditCard className="text-blue-400" />}
          color="from-blue-500 to-blue-700"
        />
        <StatCard
          title="Won Auctions"
          value={buyerStats?.wonAuctions ?? 0}
          icon={<FaTrophy className="text-yellow-400" />}
          color="from-yellow-500 to-yellow-700"
        />
        <StatCard
          title="Total Orders"
          value={buyerStats?.totalOrders ?? 0}
          icon={<FaShoppingCart className="text-green-400" />}
          color="from-green-500 to-green-700"
        />
        <StatCard
          title="Saved Items"
          value={cartItemCount}
          icon={<FaStar className="text-purple-400" />}
          color="from-purple-500 to-purple-700"
        />
      </div>
    );
  };

  const FleetOwnerDashboard = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Fleet Vehicles"
          value={stats?.totalVehicles ?? 0}
          icon={<FaTruck className="text-blue-400" />}
          color="from-blue-500 to-blue-700"
          to="/user-profile/add-vehicle-dimensions"
          filter="ALL"
        />
        <StatCard
          title="Active Campaigns"
          value={stats?.activeFleetOwnerAuctions ?? 0}
          icon={<FaBullhorn className="text-green-400" />}
          color="from-green-500 to-green-700"
          to="/user-profile/manage-fleetauction?status=active"
          filter="active"
        />
        <StatCard
          title="Pending Admin Approvals"
          value={stats?.pendingApprovals ?? 0}
          icon={<FaMoneyBillWave className="text-purple-400" />}
          color="from-purple-500 to-purple-700"
          to="/user-profile/manage-fleetauction?status=AWAITING_ADMIN_APPROVAL"
          filter="AWAITING_ADMIN_APPROVAL"
        />
        <StatCard
          title="Over Auctions"
          value={stats?.overFleetAuctions ?? 0}
          icon={<FaClock className="text-yellow-400" />}
          color="from-yellow-500 to-yellow-700"
          to="/user-profile/manage-fleetauction?status=over"
          filter="over"
        />
      </div>
    );
  };
  const AdvertiserDashboard = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Win Auction"
          value={stats?.wonAuctions ?? 0}
          icon={<FaTrophy className="text-green-400" />}
          color="from-green-500 to-green-700"
          to="/user-profile/cart"
          filter="WON"
        />
        <StatCard
          title="Active Bid"
          value={stats?.activeBids ?? 0}
          icon={<FaAd className="text-blue-400" />}
          color="from-blue-500 to-blue-700"
          to="/user-profile/bids-items"
          filter="active"
        />

        <StatCard
          title="Delivered Orders"
          value={stats?.deliveredOrders ?? 0}
          icon={<FaCheckCircle className="text-green-400" />}
          color="from-green-500 to-green-700"
          to="/user-profile/myorder"
          filter="DELIVERED"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders ?? 0}
          icon={<FaShoppingCart className="text-yellow-400" />}
          color="from-yellow-500 to-yellow-700"
          to="/user-profile/myorder"
          filter="All"
        />
      </div>
    );
  };
  const WrapperDashboard = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Assigned Orders"
          value={stats?.assignedOrders ?? 0}
          icon={<FaBox className="text-blue-400" />}
          color="from-blue-500 to-blue-700"
          to="/user-profile/wrapper-orders"
          filter="All"
        />
        <StatCard
          title="Total Accepted  Jobs"
          value={stats?.acceptedAssignments ?? 0}
          icon={<FaThumbsUp className="text-green-400" />}
          color="from-green-500 to-green-700"
          to="/user-profile/wrapper-orders"
          filter="ACCEPTED"
        />
        <StatCard
          title="Completed Jobs"
          value={stats?.deliveredwrapperOrders ?? 0}
          icon={<FaCheckCircle className="text-purple-400" />}
          color="from-purple-500 to-purple-700"
          to="/user-profile/wrapper-orders"
          filter="DELIVERED"
        />
        <StatCard
          title="Pending Job"
          value={stats?.pendingRequests ?? 0}
          icon={<FaCogs className="text-yellow-400" />}
          color="from-yellow-500 to-yellow-700"
          to="/user-profile/wrapper-orders"
          filter="PENDING"
        />
      </div>
    );
  };
  const userTypeLabels = {
    wrapper: "Vehicle Wrapping Business",
    fleetOwner: "Vehicle Owner or Fleet Manager",
    advertiser: "Buyer or Marketing Executive",
    seller: "Ancillary Advertiser",
  };

  const ProfileSection = () => {
    return (
      <div className="min-h-screen bg-theme-bg flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-theme-bg p-6 rounded-2xl">
          <div className="px-7 py-6 bg-theme-bg2 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-5 text-white">
              <h2 className="text-xl font-bold text-white-800 dark:text-white">
                Personal Info
              </h2>
              <Link
                to="/user-profile/account-settings"
                className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-all"
              >
                <FaRegEdit size={16} /> <span>Edit</span>
              </Link>
            </div>
            <ul className="flex flex-col gap-4 text-white-700 dark:text-white-300">
              <ProfileItem
                label="Name"
                value={user?.firstName ? capitalizeName(user.firstName) : "-"}
              />
              <ProfileItem
                label="Last Name"
                value={user?.lastname ? capitalizeName(user.lastname) : "-"}
              />
              <ProfileItem label="Email" value={user?.email || "-"} />
              <ProfileItem label="Phone" value={user?.telephoneNumber || "-"} />

              {/* Street fields sirf tab dikhana jab userType advertiser, fleetOwner, wrapper ho */}
              {["advertiser", "fleetOwner", "wrapper"].includes(
                user?.userType,
              ) && (
                <>
                  <ProfileItem label="Street" value={user?.street1 || "-"} />
                  <ProfileItem label="Street 2" value={user?.street2 || "-"} />
                  <ProfileItem label="Suburb" value={user?.suburb || "-"} />
                  <ProfileItem label="Company" value={user?.company || "-"} />

                  <ProfileItem
                    label="Postal Code"
                    value={user?.postalCode || "-"}
                  />
                  <ProfileItem
                    label="Location"
                    value={user?.location?.name || "-"}
                  />
                  <ProfileItem label="City" value={user?.city || "-"} />
                </>
              )}
              {["buyer", "seller"].includes(user?.userType) && (
                <>
                  <ProfileItem
                    label="Postal Code"
                    value={user?.postalCode || "-"}
                  />
                  <ProfileItem
                    label="Location"
                    value={user?.location?.name || "-"}
                  />
                  <ProfileItem label="City" value={user?.city || "-"} />
                </>
              )}

              <ProfileItem
                label="Position"
                value={toTitleCase(user?.position)}
              />

              <ProfileItem label="State" value={user?.state || "-"} />
              <ProfileItem label="Country" value={user?.country || "-"} />
              {/* <ProfileItem
              label="User Type"
              value={user?.userType || "-"}
              isCapitalize={true}
            /> */}

              <ProfileItem
                label="User Type"
                value={userTypeLabels[user?.userType] ?? user?.userType ?? "-"}
                isCapitalize={true}
              />
              <ProfileItem
                label="Join Date"
                value={
                  user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "-"
                }
              />
            </ul>
          </div>

          <div className="px-7 py-6 bg-theme-bg2 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg text-white">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-5">
              <h2 className="text-xl font-bold text-white-800 dark:text-white">
                Your Bio
              </h2>
              <Link
                to="/user-profile/account-settings"
                className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-all"
              >
                <FaRegEdit size={16} /> <span>Edit</span>
              </Link>
            </div>
            <div className="bg-theme-bg2 text-white-100 dark:bg-gray-700 p-5 rounded-lg min-h-[250px]">
              <p className="text-white-700 dark:text-white-300 leading-relaxed whitespace-pre-wrap -ml-[19px]">
                {user?.description ? user.description : "No bio available."}
              </p>
            </div>
          </div>
        </div>
        <FooterLeaderboard />
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 pt-0 pb-6 min-h-screen">
      <div>
        <HeaderLeaderboard />
      </div>
      <DashboardHeader />
      {user?.userType === "seller" && <SellerDashboard />}
      {user?.userType === "buyer" && <BuyerDashboard />}
      {user?.userType === "fleetOwner" && <FleetOwnerDashboard />}
      {user?.userType === "advertiser" && <AdvertiserDashboard />}
      {user?.userType === "wrapper" && <WrapperDashboard />}
      <ProfileSection />
    </div>
  );
};
const StatCard = ({
  title,
  value,
  icon,
  color = "from-blue-500 to-blue-700",
  to, // Naya prop: jahan redirect karna hai
  filter, // Optional: konsa filter apply karna hai (jaise "PENDING", "All")
}) => {
  const cardContent = (
    <div
      className={`bg-gradient-to-br ${color} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className="p-3 rounded-full bg-white/10 backdrop-blur group-hover:bg-white/20 transition-colors">
          {icon}
        </div>
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} state={{ defaultFilter: filter }}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};
// const ProfileItem = ({ label, value, isCapitalize }) => (
//   <li className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700/50 text-white">
//     <span className="font-medium">{label}</span>
//     <span className={`${isCapitalize ? "capitalize" : ""}`}>{value}</span>
//   </li>
// );
const ProfileItem = ({ label, value, isCapitalize }) => {
  const isLocation = label.toLowerCase() === "location";

  return (
    <li className="flex justify-between items-start pb-2 border-b border-gray-200 dark:border-gray-700/50 text-white">
      <span className="font-medium flex-shrink-0">{label}</span>
      <span
        className={`${isCapitalize ? "capitalize" : ""} max-w-[60%] text-right`}
        style={
          isLocation
            ? {
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
              }
            : {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }
        }
        title={value}
      >
        {value}
      </span>
    </li>
  );
};

export default Dashboard;
