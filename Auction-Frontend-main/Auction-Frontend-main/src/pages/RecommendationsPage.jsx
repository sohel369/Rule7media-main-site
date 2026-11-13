import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getbuyerrecmondation, reset } from "../store/budget/budgetSlice";
import { getFleetRecommendation } from "../store/fleetbudgetrequest/fleetbudgetslice";
import { fetchUserCountry } from "../store/countary/countrySlice";
import {
  User,
  Package,
  DollarSign,
  Truck,
  Car,
  Check,
  Mail,
  Phone,
  CalendarDays,
  Eye,
  Star,
  Clock,
  TrendingUp,
  Zap,
  ChevronRight,
  Heart,
  Award,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";

const RecommendationsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { country, currency } = useSelector((state) => state.country);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  // Get recommendations from both sources
  const { recommendedAuctions, isLoading: isBudgetLoading } = useSelector(
    (state) => state.budget,
  );
  const { recommendedFleetAuctions, isLoading: isFleetLoading } = useSelector(
    (state) => state.fleetbudget,
  );

  const isLoading = isBudgetLoading || isFleetLoading;

  // Categorize recommendations
  const buyerRecommendations = recommendedAuctions || [];
  const fleetRecommendations = recommendedFleetAuctions || [];

  useEffect(() => {
    dispatch(reset());

    // Handle notifications
    const notificationData = localStorage.getItem("clickedNotification");
    if (notificationData) {
      try {
        const { auctionIds, type } = JSON.parse(notificationData);
        if (auctionIds?.length === 1) {
          if (type === "fleet") {
            navigate(`/single-fleet-auction-detail/${auctionIds[0]}`);
          } else {
            navigate(`/single-auction-detail/${auctionIds[0]}`);
          }
          return;
        }
      } catch (error) {
        console.error("Error parsing notification data:", error);
      }
    }

    // Fetch recommendations
    if (user?._id) {
      dispatch(getbuyerrecmondation(user._id));
      dispatch(getFleetRecommendation(user._id));
    }

    return () => {
      localStorage.removeItem("clickedNotification");
    };
  }, [dispatch, navigate, user]);

  // Handle auction click - redirect to appropriate page based on auction type
  const handleAuctionClick = (auction, type = "standard") => {
    if (type === "fleet") {
      navigate(`/single-fleet-auction-detail/${auction._id}`);
    } else {
      navigate(`/single-auction-detail/${auction._id}`);
    }
  };

  // Handle view all auctions from a recommendation
  const handleViewAllAuctions = (recommendation, type = "standard") => {
    if (recommendation.auctionIds?.length > 0) {
      // If multiple auctions, show first one for now
      if (type === "fleet") {
        navigate(
          `/single-fleet-auction-detail/${recommendation.auctionIds[0]._id}`,
        );
      } else {
        navigate(`/single-auction-detail/${recommendation.auctionIds[0]._id}`);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      default: {
        bg: "bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm",
        text: "text-white",
        icon: Clock,
        border: "border-gray-600",
      },
    };

    const config = statusConfig[status] || statusConfig.default;
    const IconComponent = config.icon;

    return (
      <div
        className={`${config.bg} ${config.text} ${config.border} border px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm`}
      >
        <IconComponent className="h-3 w-3" />
        {status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
      </div>
    );
  };

  // Function to render wrap rates for an auction
  const renderWrapRates = (auction) => {
    if (!auction) return null;

    // Check for buyNowRates first
    if (
      auction.buyNowRates &&
      Object.values(auction.buyNowRates).some((rate) => rate > 0)
    ) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          {auction.buyNowRates.fullWrap > 0 && (
            <div className="bg-theme-bg border border-blue-700/30 rounded-lg p-2 text-center">
              <div className="text-xs text-white font-medium mb-1">
                Full Wrap
              </div>
              <div className="text-white font-bold text-sm">
                {currency} {auction.buyNowRates.fullWrap}
                <span className="text-xs text-gray-400 ml-1">/m²</span>
              </div>
            </div>
          )}
          {auction.buyNowRates.oneSide > 0 && (
            <div className="bg-theme-bg2 border border-green-700/30 rounded-lg p-2 text-center">
              <div className="text-xs text-green-400 font-medium mb-1">
                One Side
              </div>
              <div className="text-white font-bold text-sm">
                {currency} {auction.buyNowRates.oneSide}
                <span className="text-xs text-gray-400 ml-1">/m²</span>
              </div>
            </div>
          )}
          {auction.buyNowRates.bothSides > 0 && (
            <div className="bg-theme-bg2 border border-purple-700/30 rounded-lg p-2 text-center">
              <div className="text-xs text-purple-400 font-medium mb-1">
                Both Sides
              </div>
              <div className="text-white font-bold text-sm">
                {currency} {auction.buyNowRates.bothSides}
                <span className="text-xs text-gray-400 ml-1">/m²</span>
              </div>
            </div>
          )}
          {auction.buyNowRates.rearDoors > 0 && (
            <div className="bg-theme-bg2 border border-orange-700/30 rounded-lg p-2 text-center">
              <div className="text-xs text-orange-400 font-medium mb-1">
                Rear Doors
              </div>
              <div className="text-white font-bold text-sm">
                {currency} {auction.buyNowRates.rearDoors}
                <span className="text-xs text-gray-400 ml-1">/m²</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Check for minAuctionRates
    if (
      auction.minAuctionRates &&
      Object.values(auction.minAuctionRates).some((rate) => rate > 0)
    ) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          {auction.minAuctionRates.fullWrap > 0 && (
            <div className="bg-theme-bg border border-blue-700/30 rounded-lg p-2 text-center">
              <div className="text-xs text-white font-medium mb-1">
                Full Wrap (Min)
              </div>
              <div className="text-white font-bold text-sm">
                {currency} {auction.minAuctionRates.fullWrap}
                <span className="text-xs text-gray-400 ml-1">/m²</span>
              </div>
            </div>
          )}
          {auction.minAuctionRates.oneSide > 0 && (
            <div className="bg-theme-bg border border-green-700/30 rounded-lg p-2 text-center">
              <div className="text-xs text-white font-medium mb-1">
                One Side (Min)
              </div>
              <div className="text-white font-bold text-sm">
                {currency} {auction.minAuctionRates.oneSide}
                <span className="text-xs text-gray-400 ml-1">/m²</span>
              </div>
            </div>
          )}
          {auction.minAuctionRates.bothSides > 0 && (
            <div className="bg-theme-bg border border-purple-700/30 rounded-lg p-2 text-center">
              <div className="text-xs text-white font-medium mb-1">
                Both Sides (Min)
              </div>
              <div className="text-white font-bold text-sm">
                {currency} {auction.minAuctionRates.bothSides}
                <span className="text-xs text-gray-400 ml-1">/m²</span>
              </div>
            </div>
          )}
          {auction.minAuctionRates.rearDoors > 0 && (
            <div className="bg-theme-bg border border-orange-700/30 rounded-lg p-2 text-center">
              <div className="text-xs text-white font-medium mb-1">
                Rear Doors (Min)
              </div>
              <div className="text-white font-bold text-sm">
                {currency} {auction.minAuctionRates.rearDoors}
                <span className="text-xs text-gray-400 ml-1">/m²</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const renderFleetRecommendationCard = (recommendation) => {
    return (
      <div
        key={recommendation._id}
        className="group relative bg-theme-bg2 border border-gray-700 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1"
      >
        {/* Gradient Header */}
        <div className="bg-theme-bg p-6 text-white relative overflow-hidden">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Fleet Recommendation</h3>
                <p className="text-blue-200 text-sm">
                  Premium fleet opportunity
                </p>
              </div>
            </div>
            {getStatusBadge(recommendation.status)}
          </div>
        </div>

        <div className="p-6 bg-theme-bg">
          <div className="bg-theme-bg2 border border-blue-800/50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-theme-bg p-2 rounded-lg">
                <User className="h-4 w-4 text-white" />
              </div>
              <h4 className="font-semibold text-white">Fleet Owner</h4>
            </div>
          </div>

          {/* Message Section */}
          <div className="mb-6">
            <div className="bg-theme-bg2 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-white leading-relaxed">
                {recommendation.message}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-3 text-sm text-gray-300">
              <CalendarDays className="h-4 w-4" />
              <span>{new Date(recommendation.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Vehicles Section */}
          {recommendation.auctionIds?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-blue-400" />
                  <h4 className="font-semibold text-white">
                    Recommended Vehicles ({recommendation.auctionIds.length})
                  </h4>
                </div>
                <div className="bg-theme-bg2 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">
                  {recommendation.auctionIds.length} Available
                </div>
              </div>

              <div className="space-y-4">
                {recommendation.auctionIds.slice(0, 2).map((auction) => (
                  <div
                    key={auction._id}
                    className="border border-gray-700 rounded-xl p-4 hover:bg-theme-bg hover:shadow-lg transition-all duration-200 bg-theme-bg2"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-theme-bg p-1.5 rounded-lg">
                            <Car className="h-4 w-4 text-white" />
                          </div>
                          <h5 className="font-bold text-white">
                            {auction.company || auction.name || "Premium Fleet"}{" "}
                            - {auction.vehicleModel || "Vehicle"}
                          </h5>
                        </div>
                        <p className="text-sm text-gray-400 font-mono bg-gray-800 px-2 py-1 rounded inline-block">
                          ID: {auction._id?.slice(-8)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAuctionClick(auction, "fleet")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </div>

                    {/* Wrap Rates Display */}
                    {renderWrapRates(auction)}
                  </div>
                ))}

                {/* View All Button if more than 2 auctions */}
                {recommendation.auctionIds.length > 2 && (
                  <button
                    onClick={() =>
                      handleViewAllAuctions(recommendation, "fleet")
                    }
                    className="w-full bg-theme-bg border border-gray-700 hover:border-blue-500 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    View All {recommendation.auctionIds.length} Vehicles
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStandardRecommendationCard = (recommendation) => {
    return (
      <div
        key={recommendation._id}
        className="group relative bg-theme-bg2 border border-gray-700 rounded-2xl overflow-hidden hover:shadow-xl hover:border-green-500 transition-all duration-300 transform hover:-translate-y-1"
      >
        {/* Header */}
        <div className="bg-theme-bg p-5 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute -top-3 -right-3 w-20 h-20 bg-white opacity-10 rounded-full"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2.5 rounded-xl backdrop-blur-sm">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {recommendation.advertiserId?.email ||
                    recommendation.wrapperId?.email ||
                    "System Recommendation"}
                </h3>
                <p className="text-white text-sm flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {new Date(recommendation.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {getStatusBadge(recommendation.status)}
          </div>
        </div>

        <div className="p-5 bg-theme-bg">
          {/* Message */}
          <div className="mb-5">
            <div className="bg-theme-bg2 border-l-4 border-bg-theme-bg p-4 rounded-r-lg">
              <p className="text-white leading-relaxed">
                {recommendation.message}
              </p>
            </div>
          </div>

          {/* Auctions */}
          {recommendation.auctionIds?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-white" />
                  <h4 className="font-semibold text-white">
                    {recommendation.auctionIds.length > 1
                      ? "Recommended Auctions"
                      : "Recommended Auction"}
                  </h4>
                </div>
                <div className="bg-theme-bg2 text-white px-3 py-1 rounded-full text-xs font-medium">
                  {recommendation.auctionIds.length} Items
                </div>
              </div>

              <div className="space-y-3">
                {recommendation.auctionIds.slice(0, 2).map((auction) => (
                  <div
                    key={auction._id}
                    className="border border-gray-700 rounded-xl p-4 hover:bg-theme-bg hover:shadow-md transition-all duration-200 bg-theme-bg2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-theme-bg p-2 rounded-lg">
                          <Car className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-white">
                            {auction.name ||
                              auction.title ||
                              auction.vehicleModel ||
                              "Vehicle Auction"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <BadgeCheck className="h-4 w-4 text-white" />
                            <p className="text-white text-sm">
                              Recommended Match
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAuctionClick(auction, "standard")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </div>

                    {/* Wrap Rates Display */}
                    {renderWrapRates(auction)}

                    {/* Vehicle Info */}
                    {(auction.vehicleModel || auction.vehicleManufacturer) && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Car className="h-3 w-3" />
                          <span>
                            {auction.vehicleModel}{" "}
                            {auction.vehicleManufacturer &&
                              `- ${auction.vehicleManufacturer}`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* View All Button if more than 2 auctions */}
                {recommendation.auctionIds.length > 2 && (
                  <button
                    onClick={() =>
                      handleViewAllAuctions(recommendation, "standard")
                    }
                    className="w-full bg-theme-bg border border-gray-700 hover:border-green-500 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    View All {recommendation.auctionIds.length} Auctions
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen  flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-700 border-t-blue-400 mx-auto"></div>
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-400 animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "0.75s",
              }}
            ></div>
          </div>
          <p className="mt-4 text-black font-medium">
            Loading your recommendations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-black mb-4">
            Your Recommendations
          </h1>
          <p className="text-xl text-black max-w-2xl mx-auto">
            Discover handpicked opportunities tailored to your preferences and
            requirements
          </p>
        </div>

        {/* Fleet Recommendations */}
        {fleetRecommendations.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="bg-theme-bg p-3 rounded-xl">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-black">
                Fleet Recommendations
              </h2>
              <div className="bg-theme-bg text-white px-4 py-2 rounded-full text-sm font-bold">
                {fleetRecommendations.length} Available
              </div>
            </div>
            <div className="grid gap-8">
              {fleetRecommendations.map(renderFleetRecommendationCard)}
            </div>
          </section>
        )}

        {/* Standard Recommendations */}
        {buyerRecommendations.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="bg-theme-bg p-3 rounded-xl">
                <User className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-black">
                Auction Recommendations
              </h2>
              <div className="bg-theme-bg text-white px-4 py-2 rounded-full text-sm font-bold">
                {buyerRecommendations.length} Available
              </div>
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              {buyerRecommendations.map(renderStandardRecommendationCard)}
            </div>
          </section>
        )}

        {/* Empty State */}
        {buyerRecommendations.length === 0 &&
          fleetRecommendations.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-theme-bg2 rounded-3xl shadow-2xl p-12 max-w-md mx-auto border border-gray-700">
                <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-6 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Package className="h-12 w-12 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  No Recommendations Yet
                </h3>
                <p className="text-gray-300 mb-8 leading-relaxed">
                  Don't worry! Our AI is learning your preferences. Start
                  exploring auctions to receive personalized recommendations.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
                >
                  <TrendingUp className="h-5 w-5" />
                  Browse Auctions
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
