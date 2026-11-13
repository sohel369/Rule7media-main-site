import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAdminCTR } from "../../store/click/clickSlice";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Modal from "react-modal";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const AdminCTRTable = () => {
  const dispatch = useDispatch();
  const { adminCTR, loading, error } = useSelector((state) => state.click);

  const [isAuctionModalOpen, setIsAuctionModalOpen] = useState(false);
  const [selectedAuctionUsers, setSelectedAuctionUsers] = useState([]);
  const [selectedAuctionTitle, setSelectedAuctionTitle] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(getAdminCTR());
  }, [dispatch]);
  const userTypeLabels = {
    advertiser: "Buyer or Marketing Executive",
    wrapper: "Vehicle Wrapping Business",
    buyer: "Buyer",
    seller: "Ancillary Advertiser",
    fleetowner: "Vehicle Owner or Fleet Manager",
    // others remain "Others"
  };
  const getUserTypeLabel = (type) => {
    if (!type) return "Unknown";
    const lowerType = type.toLowerCase();
    return (
      userTypeLabels[lowerType] || type.charAt(0).toUpperCase() + type.slice(1)
    );
  };
  // Process the raw data to create the required structure
  const processedData = useMemo(() => {
    if (!adminCTR?.data || !Array.isArray(adminCTR.data)) {
      return {
        summary: {},
        topFleetAuctions: [],
        userTypeData: [],
        auctionData: [],
        uniqueUsers: [],
      };
    }

    const rawData = adminCTR.data;
    // Calculate summary statistics
    let totalClicks = 0;
    let totalAuctions = rawData.length;
    let uniqueUsersSet = new Set();
    let clicksByUserType = {
      advertiser: 0,
      wrapper: 0,
      buyer: 0,
      fleetOwner: 0,
      others: 0,
    };
    let userMap = new Map();

    // Process each auction to extract data
    const auctionStats = rawData.map((auction) => {
      let auctionClicks = 0;
      let userTypeCounts = {
        advertisers: 0,
        wrappers: 0,
        buyers: 0,
        fleetOwners: 0,
        others: 0,
      };

      auction.users.forEach((user) => {
        auctionClicks += user.clickCount;
        totalClicks += user.clickCount;
        uniqueUsersSet.add(user.userId);

        // Aggregate user data
        const existingUser = userMap.get(user.userId) || {
          userId: user.userId,
          email: user.email,
          userType: user.userType,
          clickCount: 0,
        };
        existingUser.clickCount += user.clickCount;
        userMap.set(user.userId, existingUser);

        const userType = user.userType.toLowerCase();
        if (userType === "advertiser") {
          userTypeCounts.advertisers += user.clickCount;
          clicksByUserType.advertiser += user.clickCount;
        } else if (userType === "wrapper") {
          userTypeCounts.wrappers += user.clickCount;
          clicksByUserType.wrapper += user.clickCount;
        } else if (userType === "buyer") {
          userTypeCounts.buyers += user.clickCount;
          clicksByUserType.buyer += user.clickCount;
        } else if (userType === "fleetowner") {
          userTypeCounts.fleetOwners += user.clickCount;
          clicksByUserType.fleetOwner += user.clickCount;
        } else {
          userTypeCounts.others += user.clickCount;
          clicksByUserType.others += user.clickCount;
        }
      });

      return {
        auctionId: auction.auctionId,
        auctionTitle:
          auction.vehicleModel || `Auction ${auction.auctionId.slice(-6)}`,
        clickCount: auctionClicks,
        clicksByUserType: userTypeCounts,
        users: auction.users,
      };
    });

    // Sort auctions by click count and get top ones
    const topFleetAuctions = [...auctionStats]
      .sort((a, b) => b.clickCount - a.clickCount)
      .slice(0, 10);

    // Prepare data for charts
    const auctionData = topFleetAuctions.map((auction) => ({
      name: auction.auctionTitle,
      clicks: auction.clickCount,
      advertisers: auction.clicksByUserType.advertisers,
      wrappers: auction.clicksByUserType.wrappers,
      buyers: auction.clicksByUserType.buyers,
      others: auction.clicksByUserType.others,
    }));

    // User type distribution data
    const userTypeData = [
      {
        name: getUserTypeLabel("advertiser"),
        value: clicksByUserType.advertiser,
      },
      { name: getUserTypeLabel("wrapper"), value: clicksByUserType.wrapper },
      { name: getUserTypeLabel("buyer"), value: clicksByUserType.buyer },
      { name: "Others", value: clicksByUserType.others },
    ].filter((item) => item.value > 0);

    // Convert userMap to array for table
    const uniqueUsers = Array.from(userMap.values()).sort(
      (a, b) => b.clickCount - a.clickCount,
    );

    const summary = {
      totalClicks,
      totalAuctions,
      totalAdvertisers: uniqueUsersSet.size,
      uniqueUsers: uniqueUsersSet.size,
      clicksByUserType,
    };

    return {
      summary,
      topFleetAuctions,
      userTypeData,
      auctionData,
      uniqueUsers,
    };
  }, [adminCTR]);

  const openAuctionModal = (users, auctionTitle) => {
    setSelectedAuctionUsers(users || []);
    setSelectedAuctionTitle(auctionTitle || "Unknown Auction");
    setIsAuctionModalOpen(true);
  };

  const closeAuctionModal = () => {
    setIsAuctionModalOpen(false);
    setSelectedAuctionUsers([]);
    setSelectedAuctionTitle("");
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(null);
  };

  if (loading)
    return <p className="text-center py-4">Loading analytics data...</p>;
  if (error)
    return (
      <p className="text-red-500 text-center py-4">
        Error loading data: {error}
      </p>
    );

  const { summary, topFleetAuctions, userTypeData, auctionData, uniqueUsers } =
    processedData;

  return (
    <div className="p-4 bg-theme-bg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-white">
        Fleet Auction Click Analytics
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-theme-bg">
        <div className="bg-theme-bg2 p-4 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-white">Total Clicks</h3>
          <p className="text-3xl font-bold text-white">
            {summary.totalClicks || 0}
          </p>
        </div>
        <div className="bg-theme-bg2 p-4 rounded-lg border  shadow-sm">
          <h3 className="text-sm font-medium text-white">Total Auctions</h3>
          <p className="text-3xl font-bold text-white">
            {summary.totalAuctions || 0}
          </p>
        </div>
        <div className="bg-theme-bg2 p-4 rounded-lg border  shadow-sm">
          <h3 className="text-sm font-medium text-white">Total Users</h3>
          <p className="text-3xl font-bold text-white">
            {summary.totalAdvertisers || 0}
          </p>
        </div>
        <div className="bg-theme-bg2 p-4 rounded-lg border  shadow-sm">
          <h3 className="text-sm font-medium text-white">Unique Users</h3>
          <p className="text-3xl font-bold text-white">
            {summary.uniqueUsers || 0}
          </p>
        </div>
      </div>

      <div className="mb-8 bg-theme-bg2 rounded-2xl">
        <h3 className="text-xl font-semibold mb-2 ml-4 text-white">
          Top Fleet Auctions by Clicks
        </h3>
        <div className="overflow-x-auto bg-theme-bg2">
          <table className="min-w-full bg-theme-bg2 ">
            <thead className="bg-gray-50">
              <tr className="bg-theme-bg2  text-white">
                <th className="px-4 py-3 text-left bg-theme-bg2 text-xs font-medium text-white uppercase tracking-wider">
                  Auction
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Total Clicks
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium ">
                  <div className="leading-tight">
                    Buyer or
                    <br />
                    Marketing Executive
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium ">
                  <div className="leading-tight">
                    Vehicle
                    <br />
                    Wrapping Business
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium ">
                  <div className="leading-tight">
                    Vehicle Owner or
                    <br />
                    Fleet Manager
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium  uppercase tracking-wider">
                  Others
                </th>
              </tr>
            </thead>
            <tbody className="bg-theme-bg2">
              {topFleetAuctions.map((auction, index) => (
                <tr
                  key={
                    auction.auctionId
                      ? `auction-${auction.auctionId}`
                      : `auction-fallback-${index}`
                  }
                  className={`cursor-pointer hover:bg-theme-bg transition-colors ${index % 2 === 0 ? "bg-theme-bg2" : "bg-theme-bg2"}`}
                  onClick={() =>
                    openAuctionModal(auction.users, auction.auctionTitle)
                  }
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {auction.auctionTitle}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-theme-bg text-white">
                      {auction.clickCount}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-theme-bg text-white">
                      {auction.clicksByUserType?.advertisers || 0}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-theme-bg text-white">
                      {auction.clicksByUserType?.wrappers || 0}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-theme-bg text-white">
                      {auction.clicksByUserType?.fleetOwners || 0}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-theme-bg text-white">
                      {auction.clicksByUserType?.others || 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unique Users Table */}
      <div className="mb-8 bg-theme-bg2 rounded-2xl">
        <h3 className="text-xl font-semibold mb-2 ml-6 text-white">
          Individual Users
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-theme-bg2 rounded-2xl ">
            <thead className="bg-theme-bg2">
              <tr className="bg-theme-bg2">
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  User Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Total Clicks
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {uniqueUsers.length > 0 ? (
                uniqueUsers.map((user, index) => (
                  <tr
                    key={`modal-user-${user.userId}`}
                    className={
                      index % 2 === 0 ? "bg-theme-bg2" : "bg-theme-bg2"
                    }
                    onClick={() => openUserModal(user)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {user.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {getUserTypeLabel(user.userType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-theme-bg text-white">
                        {user.clickCount}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No user data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auction Modal */}
      <Modal
        isOpen={isAuctionModalOpen}
        onRequestClose={closeAuctionModal}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "95vw", // ✅ Make modal full width on small screens
            maxWidth: "1200px", // ✅ Limit max-width on large screens
            maxHeight: "90vh",
            overflow: "auto",
            zIndex: 1000,
            borderRadius: "8px",
            padding: "20px",
            backgroundColor: "#1e293b",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          },
        }}
        contentLabel="Auction Users Modal"
      >
        <h2 className="text-xl font-semibold mb-4 text-white">
          Users for {selectedAuctionTitle}
        </h2>
        {selectedAuctionUsers.length > 0 ? (
          <table className="min-w-full  border-gray-200">
            <thead className="">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  User Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  User Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  User Last Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  User Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Clicks
                </th>
              </tr>
            </thead>
            <tbody className=" text-white">
              {selectedAuctionUsers.map((user, index) => (
                <tr key={`${user.userId}-${index}`} className={index % 2 === 0}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {user.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {getUserTypeLabel(user.userType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {user.firstName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {user.lastname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {user.clickCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">
            No user data available for this auction.
          </p>
        )}
        <button
          onClick={closeAuctionModal}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Close
        </button>
      </Modal>

      {/* User Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onRequestClose={closeUserModal}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "400px",
            maxHeight: "80vh",
            overflow: "auto",
            zIndex: 1000,
            borderRadius: "8px",
            padding: "20px",
            backgroundColor: "#1e293b",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          },
        }}
        contentLabel="User Details Modal"
      >
        <h2 className="text-xl font-semibold mb-4 text-white">User Details</h2>
        {selectedUser ? (
          <div className="space-y-4">
            <div>
              <span className="font-medium text-white">User ID:</span>
              <p className="text-white">{selectedUser.userId}</p>
            </div>
            <div>
              <span className="font-medium text-white">Email:</span>
              <p className="text-white">{selectedUser.email}</p>
            </div>
            <div>
              <span className="font-medium text-white">User Type:</span>
              <p className="text-white">
                {getUserTypeLabel(selectedUser?.userType)}
              </p>
            </div>
            <div>
              <span className="font-medium text-white">Total Clicks:</span>
              <p className="text-white">{selectedUser.clickCount}</p>
            </div>
          </div>
        ) : (
          <p className="text-white">No user selected.</p>
        )}
        <button
          onClick={closeUserModal}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Close
        </button>
      </Modal>

      {/* Charts Section */}
      <div className="bg-theme-bg2 p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-white">
          User Type Distribution
        </h3>
        <div className="h-80">
          {userTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  label={(entry) => {
                    const percent = (
                      (entry.value / summary.totalClicks) *
                      100
                    ).toFixed(1);
                    const showLabel =
                      entry.value > 0 &&
                      (percent >= 2 || entry.name === "Others");
                    return showLabel ? `${entry.name}: ${percent}%` : "";
                  }}
                >
                  {userTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value} clicks`}
                  contentStyle={{ fontSize: "12px" }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No user type data available
            </p>
          )}
        </div>

        {/* Optional: Show small values in a table below */}
        {userTypeData.some(
          (d) => (d.value / summary.totalClicks) * 100 < 2 && d.value > 0,
        ) && (
          <div className="mt-4 p-3 bg-theme-bg rounded-lg text-xs text-white">
            <p className="font-medium text-white mb-1">Small Contributions:</p>
            <div className="space-y-1">
              {userTypeData
                .filter(
                  (d) =>
                    (d.value / summary.totalClicks) * 100 < 2 && d.value > 0,
                )
                .map((d, i) => {
                  const percent = (
                    (d.value / summary.totalClicks) *
                    100
                  ).toFixed(1);
                  return (
                    <div key={i} className="flex justify-between">
                      <span
                        style={{
                          color:
                            COLORS[userTypeData.indexOf(d) % COLORS.length],
                        }}
                      >
                        {d.name}
                      </span>
                      <span className="font-medium text-white">
                        {d.value} clicks ({percent}%)
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {auctionData.length > 0 && (
        <div className="mb-8 bg-theme-bg2 rounded-2xl">
          <h3 className="text-xl font-semibold mt-2 ml-6 text-white">
            User Engagement by Auction
          </h3>
          <div className="h-96 overflow-x-auto text-white">
            <div
              style={{
                minWidth: `${Math.max(auctionData.length * 80, 600)}px`,
              }}
            >
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={auctionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  barSize={40}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={0}
                    tick={{
                      fill: "#ffffff",
                      fontSize: 12,
                      fontWeight: "500",
                    }}
                  />
                  <YAxis
                    domain={[0, 25]}
                    tick={{
                      fill: "#ffffff",
                    }}
                  />
                  <Tooltip
                    cursor={{
                      fill: "#4e688bff", // bg-theme-bg ka color
                      opacity: 0.6,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={60}
                    wrapperStyle={{ paddingTop: 10 }}
                  />
                  <Bar
                    dataKey="advertisers"
                    stackId="a"
                    fill="#0088FE"
                    name={getUserTypeLabel("advertiser")}
                  />
                  <Bar
                    dataKey="wrappers"
                    stackId="a"
                    fill="#00C49F"
                    name={getUserTypeLabel("wrapper")}
                  />
                  <Bar
                    dataKey="buyers"
                    stackId="a"
                    fill="#FFBB28"
                    name={getUserTypeLabel("buyer")}
                  />
                  <Bar
                    dataKey="fleetOwners"
                    stackId="a"
                    fill="#FF8042"
                    name={getUserTypeLabel("fleetowner")}
                  />
                  <Bar
                    dataKey="others"
                    stackId="a"
                    fill="#FF8042"
                    name="Others"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCTRTable;
