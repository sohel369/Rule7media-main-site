// pages/LiveAuctions.jsx
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import { fetchUserCountry } from "../store/countary/countrySlice";
import { getfleetauctiondata } from "../store/fleetowner/fleetownerSlice";
import { getAllAuctionscombined } from "../store/auction/auctionSlice";
import { useNavigate, Navigate } from "react-router-dom";
import { checkSubscriptionStatus } from "../store/subscription/subscriptionSlice";
import CountDownTimer from "../components/CountDownTimer";
import { trackClickAsync } from "../store/click/clickSlice";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import { seoData } from "../seo/seoData";
import {
  FiClock,
  FiMapPin,
  FiEye,
  FiHeart,
  FiLogIn,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { BsLightningCharge, BsTruck, BsMegaphone } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";

// Helper function to extract country from auction object
const extractCountry = (auction) => {
  // Try direct country field
  if (auction.country) return auction.country;
  // Try location.country
  if (auction.location?.country) return auction.location.country;
  // Try location.name (contains "India" etc.)
  if (auction.location?.name) {
    const parts = auction.location.name.split(",");
    const lastPart = parts[parts.length - 1]?.trim();
    if (lastPart) return lastPart;
  }
  // Try vehicle.country
  if (auction.vehicle?.country) return auction.vehicle.country;
  return null;
};

const LiveAuctions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [statusChecked, setStatusChecked] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const isLoggedIn = !!user;

  const { country, currency } = useSelector((state) => state.country);

  // Fleet auctions
  const {
    form: fleetAuctions,
    isLoading: fleetLoading,
    isError: fleetError,
    message: fleetMessage,
  } = useSelector((state) => state.fleetOwner);

  // Advertiser auctions
  const {
    auction: advertiserAuctions,
    isLoading: advLoading,
    isError: advError,
    message: advMessage,
  } = useSelector((state) => state.auction);

  const [filterType, setFilterType] = useState("live");
  const [noCountryAuctions, setNoCountryAuctions] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) {
        setHasSubscription(false);
        setStatusChecked(true);
        return;
      }

      try {
        const result = await dispatch(checkSubscriptionStatus()).unwrap();

        const status = result?.status || user?.subscription?.status;
        const active = ["active", "trialing"].includes(status?.toLowerCase());

        setHasSubscription(active);
      } catch (error) {
        console.error("❌ Subscription check failed:", error);
        // Fallback to user object from localStorage/Redux
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const fallbackStatus =
          storedUser?.subscriptionStatus || user?.subscriptionStatus;
        const fallbackActive = ["active", "trialing"].includes(
          fallbackStatus?.toLowerCase(),
        );

        setHasSubscription(fallbackActive);
      } finally {
        setStatusChecked(true);
      }
    };

    checkStatus();
  }, [dispatch, user]);

  // Fetch data
  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  useEffect(() => {
    if (country) {
      dispatch(getfleetauctiondata());
      dispatch(getAllAuctionscombined());
    }
  }, [dispatch, country]);

  // Combine auctions
  const auctionsData = useMemo(() => {
    let combined = [];

    // Fleet auctions
    if (
      fleetAuctions &&
      fleetAuctions.data &&
      Array.isArray(fleetAuctions.data)
    ) {
      combined.push(
        ...fleetAuctions.data.map((auction) => ({
          ...auction,
          auctionType: "fleet",
          isApprovedByAdmin: auction.isApprovedByAdmin === true,
          // Extract country for fleet auctions
          extractedCountry: auction.country,
        })),
      );
    }

    // Advertiser auctions – extract country from location
    if (advertiserAuctions && Array.isArray(advertiserAuctions)) {
      combined.push(
        ...advertiserAuctions.map((auction) => ({
          ...auction,
          auctionType: "advertiser",
          isApprovedByAdmin: auction.adminstatus === "approved",
          status: auction.status === "active" ? "active" : auction.status,
          // Extract country using helper
          extractedCountry: extractCountry(auction),
        })),
      );
    }

    return combined;
  }, [fleetAuctions, advertiserAuctions]);

  const getAuctionStatus = (startTime, endTime) => {
    if (!startTime || !endTime) return "upcoming";
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (now < start) return "upcoming";
    if (now >= start && now < end) return "live";
    return "ending";
  };

  const filteredAuctions = useMemo(() => {
    if (!auctionsData.length) {
      setNoCountryAuctions(false);
      return [];
    }

    let filtered = auctionsData.filter((item) => {
      const auctionStatus = getAuctionStatus(item.startTime, item.endTime);
      if (auctionStatus !== filterType) return false;
      if (item.status === "rejected") return false;
      if (item.isApprovedByAdmin !== true) return false;
      return true;
    });

    if (activeTab === "fleet") {
      filtered = filtered.filter((item) => item.auctionType === "fleet");
    } else if (activeTab === "advertiser") {
      filtered = filtered.filter((item) => item.auctionType === "advertiser");
    }

    // Country filter using extractedCountry
    if (country) {
      const countryLower = country.toLowerCase();
      filtered = filtered.filter((item) => {
        const itemCountry = item.extractedCountry?.toLowerCase();
        const match = itemCountry === countryLower;

        return match;
      });
    }

    setNoCountryAuctions(filtered.length === 0 && country);
    return filtered;
  }, [auctionsData, filterType, country, activeTab]);

  const totalPages = Math.ceil(filteredAuctions.length / itemsPerPage);
  const paginatedAuctions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAuctions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAuctions, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, activeTab, country]);

  const isLoading = fleetLoading || advLoading;
  const isError = fleetError || advError;
  const errorMessage = fleetMessage || advMessage;

  const handleClick = (auction) => {
    if (!user) {
      navigate("/login", {
        state: {
          from: "/liveauction",
          message: "Please login to view auction details",
        },
      });
      return;
    }

    const clickPayload = {
      auctionId: auction._id,
      fleetOwnerId: auction.user?._id,
      userId: user?._id,
      referrer: window.location.href,
      userAgent: navigator.userAgent,
      country,
      currency,
    };

    dispatch(trackClickAsync(clickPayload));

    if (auction.auctionType === "fleet") {
      navigate(`/single-fleet-auction-detail/${auction._id}`);
    } else {
      navigate(`/single-auction-detail/${auction._id}`);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "live":
        return {
          color: "bg-green-500",
          icon: <BsLightningCharge />,
          text: "Live Now",
        };
      case "upcoming":
        return { color: "bg-blue-500", icon: <FiClock />, text: "Upcoming" };
      case "ending":
        return {
          color: "bg-orange-500",
          icon: <FiClock />,
          text: "Ending Soon",
        };
      default:
        return { color: "bg-gray-500", icon: <FiClock />, text: "Unknown" };
    }
  };

  const heroText =
    activeTab === "fleet"
      ? "Bid on premium fleet vehicles and advertising spaces"
      : activeTab === "advertiser"
        ? "Bid on advertising campaigns and sponsorship opportunities"
        : "Bid on fleet vehicles or advertising campaigns – find the best deals";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BsTruck className="text-purple-500 text-3xl animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-purple-300 font-medium animate-pulse">
            Loading auctions...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 max-w-md text-center border border-red-500/20">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Error Loading Auctions
          </h2>
          <p className="text-gray-400 mb-6">
            {errorMessage || "Something went wrong"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  if (statusChecked) {
    if (!hasSubscription) {
      return <Navigate to="/subscriberonly" replace />;
    }
  }
  return (
    <>
      <SEO {...seoData.liveAuctions} />

      {!isLoggedIn && <Header />}
      <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" bg-black></div>
          </div>

          <div className="absolute top-20 left-10 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                Live <span className="text-red-500">Auctions</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                {heroText} in {country || "your region"}.
              </p>

              <div className="flex flex-wrap justify-center gap-8 mb-12">
                {/* <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {filteredAuctions.length}
                  </div>
                  <div className="text-sm text-gray-400">
                    Active in {country || "Your Region"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">24/7</div>
                  <div className="text-sm text-gray-400">Bidding Open</div>
                </div> */}
                {!user && (
                  <div className="text-center">
                    <button
                      onClick={() => navigate("/register")}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <FiLogIn />
                      Register to Bid
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Auction Type Tabs */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  activeTab === "all"
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                All Auctions
              </button>
              <button
                onClick={() => setActiveTab("fleet")}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  activeTab === "fleet"
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                Fleet Auctions
              </button>
              <button
                onClick={() => setActiveTab("advertiser")}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  activeTab === "advertiser"
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                Auctions
              </button>
            </div>

            {/* Status Filter Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700"
            >
              <div className="flex flex-wrap justify-center gap-4">
                {["live", "upcoming", "ending"].map((type) => {
                  const statusInfo = getStatusInfo(type);
                  return (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 ${
                        filterType === type
                          ? `${statusInfo.color} text-white scale-105 shadow-lg`
                          : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      <span>{statusInfo.icon}</span>
                      <span className="capitalize font-semibold">{type}</span>
                      {type === "live" && (
                        <span className="ml-1 w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Auctions Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {paginatedAuctions.length > 0 ? (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={filterType + activeTab + currentPage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {paginatedAuctions.map((item, index) => {
                    const status = getAuctionStatus(
                      item.startTime,
                      item.endTime,
                    );
                    const statusInfo = getStatusInfo(status);
                    const isInWishlist = wishlist.includes(item._id);

                    return (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -5 }}
                        className="group cursor-pointer"
                        onClick={() => handleClick(item)}
                      >
                        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
                          <div className="relative h-48">
                            <img
                              src={
                                item?.images?.[0]?.url ||
                                "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
                              }
                              alt={item?.company || item?.title || "Auction"}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />

                            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white flex items-center gap-1">
                              {item.auctionType === "fleet" ? (
                                <BsTruck className="text-purple-400" />
                              ) : (
                                <BsTruck className="text-pink-400" />
                              )}
                              <span>
                                {item.auctionType === "fleet"
                                  ? "Fleet Auction"
                                  : "Auction"}
                              </span>
                            </div>

                            <div
                              className={`absolute top-3 right-3 ${statusInfo.color} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}
                            >
                              {statusInfo.icon}
                              {statusInfo.text}
                            </div>

                            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white flex items-center gap-1">
                              <FiMapPin className="text-purple-400" />
                              {item.extractedCountry ||
                                item.country ||
                                "Unknown"}
                            </div>

                            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-white flex items-center gap-1">
                              <FiClock className="text-purple-400" />
                              <CountDownTimer
                                startTime={item?.startTime}
                                endTime={item?.endTime}
                                status={item?.status}
                              />
                            </div>
                          </div>

                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                                  {item?.company ||
                                    item?.title ||
                                    item?.name ||
                                    "Auction"}
                                </h3>
                                <p className="text-sm text-gray-400 flex items-center gap-1">
                                  <FiMapPin className="text-purple-400" />
                                  {item?.townOrCity ||
                                    item?.location?.name ||
                                    "Unknown City"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 mb-3">
                              {item.auctionType === "fleet" && (
                                <div className="flex items-center gap-1 text-sm text-gray-400">
                                  <BsTruck className="text-purple-400" />
                                  {item?.vehicleModel || "Various"}
                                </div>
                              )}

                              {item.auctionType === "advertiser" && (
                                <div className="flex items-center gap-1 text-sm text-gray-400">
                                  <BsTruck className="text-pink-400" />
                                  {item?.vehicleType || "Campaign"}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-400">
                                  Starting at
                                </p>
                                <p className="text-xl font-bold text-green-400">
                                  {currency}
                                  {item?.minAuctionRates?.fullWrap ||
                                    item?.startingBid ||
                                    "N/A"}
                                  {item.auctionType === "fleet" && (
                                    <span className="text-xs text-gray-400 ml-1">
                                      /m²
                                    </span>
                                  )}
                                </p>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClick(item);
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2"
                              >
                                <FiEye />
                                {user ? "View Details" : "Login to View"}
                              </button>
                            </div>

                            {!user && (
                              <div className="mt-3 pt-3 border-t border-gray-700">
                                <p className="text-xs text-gray-400 text-center">
                                  Please{" "}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate("/login");
                                    }}
                                    className="text-purple-400 hover:underline"
                                  >
                                    login
                                  </button>{" "}
                                  to bid or save
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                      currentPage === 1
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    <FiChevronLeft /> Previous
                  </button>
                  <span className="text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                      currentPage === totalPages
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    Next <FiChevronRight />
                  </button>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-12 max-w-md mx-auto border border-gray-700">
                {activeTab === "advertiser" ? (
                  <BsMegaphone className="text-6xl text-gray-600 mx-auto mb-4" />
                ) : (
                  <BsTruck className="text-6xl text-gray-600 mx-auto mb-4" />
                )}
                <h3 className="text-2xl font-bold text-white mb-2">
                  No Auctions Found
                </h3>
                <p className="text-gray-400 mb-6">
                  {noCountryAuctions
                    ? `No ${filterType} ${activeTab === "fleet" ? "fleet" : activeTab === "advertiser" ? "advertiser" : ""} auctions available in ${country} at the moment.`
                    : `No ${filterType} auctions available at the moment.`}
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => setFilterType("live")}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                  >
                    View Live Auctions
                  </button>
                  {!user && (
                    <button
                      onClick={() => navigate("/register")}
                      className="w-full px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <FiLogIn />
                      Register to Start Bidding
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BsLightningCharge className="text-3xl text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Live Bidding
              </h3>
              <p className="text-gray-400">
                Real-time bidding on premium fleet vehicles & ad spaces
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiMapPin className="text-3xl text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Local Auctions
              </h3>
              <p className="text-gray-400">
                Showing auctions in {country || "your region"}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiEye className="text-3xl text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Verified Listings
              </h3>
              <p className="text-gray-400">
                All auctions are verified by our team
              </p>
            </div>
          </div>
        </div>
      </div>
      {!isLoggedIn && <Footer />}
    </>
  );
};

export default LiveAuctions;
