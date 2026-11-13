import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchbudgetbysellerid,
  reset,
  fetchAuctionsByBudget,
  sendRecommendation,
} from "../store/budget/budgetSlice";
import {
  DollarSign,
  User,
  Calendar,
  Send,
  Check,
  X,
  Package,
  MapPin,
  Clock,
  Layers,
  Car,
} from "lucide-react";
import { fetchUserCountry } from "../store/countary/countrySlice";

const BudgetRequestPage = () => {
  const dispatch = useDispatch();
  const { budgetList, recommendedAuctions, isLoading, isError, message } =
    useSelector((state) => state.budget);
  const { user } = useSelector((state) => state.auth);
  const sellerId = user?._id;

  const [selectedRequests, setSelectedRequests] = useState([]);
  const [recommendationModal, setRecommendationModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [loadingAuctions, setLoadingAuctions] = useState(false);
  const { country, currency } = useSelector((state) => state.country);

  useEffect(() => {
    if (sellerId) {
      dispatch(fetchbudgetbysellerid(sellerId));
    }

    return () => {
      dispatch(reset());
    };
  }, [dispatch, sellerId]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  // Extract actual data from the response
  const actualBudgetList = budgetList?.data || budgetList || [];

  // Extract matching auctions from the recommendedAuctions structure
  const getMatchingAuctions = () => {
    if (!recommendedAuctions || !Array.isArray(recommendedAuctions)) {
      return [];
    }

    if (
      recommendedAuctions.length > 0 &&
      recommendedAuctions[0].matchingAuctions
    ) {
      return recommendedAuctions[0].matchingAuctions;
    }

    return recommendedAuctions;
  };

  const handleSelectRequest = (requestId) => {
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId],
    );
  };

  const handleSendRecommendation = async (request) => {
    setCurrentRequest(request);
    setLoadingAuctions(true);

    try {
      const response = await dispatch(
        fetchAuctionsByBudget({
          budgetRates: request.budgetRates,
          sellerId,
        }),
      );

      setRecommendationModal(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingAuctions(false);
    }
  };

  const submitRecommendation = async (selectedAuctions) => {
    try {
      const auctionIds = selectedAuctions.map((auction) => auction._id);

      if (!sellerId) {
        throw new Error("Seller ID is required");
      }
      if (!currentRequest?._id) {
        throw new Error("Budget Request ID is required");
      }
      if (!currentRequest?.buyerId) {
        throw new Error("Buyer ID is required");
      }

      const response = await dispatch(
        sendRecommendation({
          buyerId: currentRequest.buyerId,
          sellerId: sellerId,
          budgetRequestId: currentRequest._id,
          auctionIds,
          message: `We found ${selectedAuctions.length} matching products for your budget request!`,
          budgetRates: currentRequest.budgetRates,
        }),
      );

      if (response.payload?.success) {
        alert("Recommendation sent successfully!");
        setRecommendationModal(false);
        setCurrentRequest(null);
      } else {
        throw new Error(
          response.payload?.message || "Failed to send recommendation",
        );
      }
    } catch (error) {
      console.error("Error sending recommendation:", error);
      alert(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-black/40 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Helper function to display budget amount (for backward compatibility)
  const getBudgetAmount = (request) => {
    // Use budgetAmount if exists (backward compatibility)
    if (request.budgetAmount && request.budgetAmount > 0) {
      return request.budgetAmount;
    }

    // Calculate from budgetRates
    if (request.budgetRates) {
      const rates = request.budgetRates;
      return (
        (rates.fullWrap || 0) +
        (rates.oneSide || 0) +
        (rates.bothSides || 0) +
        (rates.rearDoors || 0)
      );
    }

    return 0;
  };

  // Helper function to display budget rates in a compact way
  const renderBudgetRatesCompact = (budgetRates) => {
    if (!budgetRates) return null;

    return (
      <div className="mt-2">
        <div className="flex items-center gap-1 mb-1">
          <Layers className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-300">
            Budget Rates:
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {budgetRates.fullWrap > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Full Wrap:</span>
              <span className="text-white font-medium">
                {currency} {budgetRates.fullWrap}/m²
              </span>
            </div>
          )}
          {budgetRates.oneSide > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">One Side:</span>
              <span className="text-white font-medium">
                {currency} {budgetRates.oneSide}/m²
              </span>
            </div>
          )}
          {budgetRates.bothSides > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Both Sides:</span>
              <span className="text-white font-medium">
                {currency} {budgetRates.bothSides}/m²
              </span>
            </div>
          )}
          {budgetRates.rearDoors > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Rear Doors:</span>
              <span className="text-white font-medium">
                {currency} {budgetRates.rearDoors}/m²
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-theme-bg rounded-lg min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-theme-bg2 rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Budget Requests
          </h1>
          <p className="text-white">
            Seller ID:{" "}
            <span className="font-semibold text-blue-600">{sellerId}</span>
          </p>
          <p className="text-sm text-white mt-1">
            Total Requests: {actualBudgetList?.length || 0}
          </p>
        </div>

        {/* Error Message */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <X className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-700">{message}</p>
            </div>
          </div>
        )}

        {/* Budget Requests List */}
        <div className="grid gap-6">
          {actualBudgetList && actualBudgetList.length > 0 ? (
            actualBudgetList.map((request, index) => {
              const budgetAmount = getBudgetAmount(request);

              return (
                <div
                  key={request._id || index}
                  className="bg-theme-bg2 rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Buyer Info */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold text-white">
                            Buyer ID: {request.buyerId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-white" />
                          <span className="text-sm text-white">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Budget Details */}
                      <div className="bg-theme-bg rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-lg text-white">
                            {currency} {budgetAmount.toLocaleString()}
                          </span>
                        </div>

                        {/* Budget Rates Display */}
                        {request.budgetRates &&
                          renderBudgetRatesCompact(request.budgetRates)}

                        <div className="grid grid-cols-2 gap-4 text-sm text-white mt-4">
                          <div>
                            <p>
                              <span className="font-medium">Request ID:</span>{" "}
                              {request._id}
                            </p>
                            <p>
                              <span className="font-medium">Description:</span>{" "}
                              {request.description || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p>
                              <span className="font-medium">Status:</span>
                              <span
                                className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                  request.status === "open"
                                    ? "bg-green-100 text-green-800"
                                    : request.status === "accepted"
                                      ? "bg-blue-100 text-blue-800"
                                      : request.status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {request.status || "Open"}
                              </span>
                            </p>
                            {/* Legacy fields (if they exist) */}
                            {request.category && (
                              <p>
                                <span className="font-medium">Category:</span>{" "}
                                {request.category}
                              </p>
                            )}
                            {request.quantity && (
                              <p>
                                <span className="font-medium">Quantity:</span>{" "}
                                {request.quantity}
                              </p>
                            )}
                            {request.size && (
                              <p>
                                <span className="font-medium">Size:</span>{" "}
                                {request.size}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Location */}
                        {request.location && request.location.length > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-3">
                              <MapPin className="h-5 w-5 text-blue-600" />
                              <p className="font-semibold text-white">
                                Locations ({request.location.length})
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              {request.location.map((loc, idx) => {
                                const city =
                                  loc.name?.split(",")[0]?.trim() || "";
                                const stateOrCountry =
                                  loc.name?.split(",")[1]?.trim() || "";

                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 bg-theme-bg border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm hover:shadow-md transition-all"
                                  >
                                    <div className="bg-theme-bg2 p-2 rounded-lg">
                                      <MapPin className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="text-left">
                                      <div className="font-bold text-white text-sm">
                                        {loc.zip}
                                      </div>
                                      <div className="text-xs text-white">
                                        {city}
                                        {stateOrCountry &&
                                          `, ${stateOrCountry}`}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Seller Info */}
                      {request.seller && (
                        <div className="text-sm text-white">
                          <p>
                            <span className="font-medium">Seller Email:</span>{" "}
                            {request.seller.email}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleSendRecommendation(request)}
                        disabled={loadingAuctions}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {loadingAuctions ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Send Recommendation
                      </button>

                      <label className="flex items-center gap-3 px-3 py-2 rounded-lg bg-theme-bg border border-blue-700/40 text-sm text-white cursor-pointer hover:bg-blue-900/30 transition">
                        <input
                          type="checkbox"
                          checked={selectedRequests.includes(request._id)}
                          onChange={() => handleSelectRequest(request._id)}
                          className="rounded border-gray-300"
                        />
                        Select
                      </label>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-theme-bg rounded-lg shadow-sm p-12 text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No Budget Requests
              </h3>
              <p className="text-gray-400">
                You haven't received any budget requests yet.
              </p>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedRequests.length > 0 && (
          <div className="fixed bottom-6 right-6 bg-theme-bg2 rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-white">
                {selectedRequests.length} selected
              </span>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Bulk Respond
              </button>
            </div>
          </div>
        )}

        {/* Recommendation Modal */}
        {recommendationModal && currentRequest && (
          <RecommendationModal
            request={currentRequest}
            currency={currency}
            auctions={getMatchingAuctions()}
            onClose={() => {
              setRecommendationModal(false);
              setCurrentRequest(null);
            }}
            onSubmit={submitRecommendation}
          />
        )}
      </div>
    </div>
  );
};

// Recommendation Modal Component
const RecommendationModal = ({
  request,
  auctions = [],
  onClose,
  onSubmit,
  currency,
}) => {
  const [selectedAuctions, setSelectedAuctions] = useState([]);

  const safeAuctions = Array.isArray(auctions) ? auctions : [];
  const safeRequest = request || {};

  const handleAuctionSelect = (auctionId) => {
    setSelectedAuctions((prev) =>
      prev.includes(auctionId)
        ? prev.filter((id) => id !== auctionId)
        : [...prev, auctionId],
    );
  };

  const handleSubmit = () => {
    if (selectedAuctions.length === 0) {
      alert("Please select at least one auction to recommend.");
      return;
    }

    const selectedAuctionData = safeAuctions.filter(
      (auction) => auction && selectedAuctions.includes(auction._id),
    );

    onSubmit(selectedAuctionData);
  };

  const getStringValue = (value) => {
    if (typeof value === "string") return value;
    if (typeof value === "object" && value !== null) {
      return value.name || value.email || value.id || JSON.stringify(value);
    }
    return String(value || "N/A");
  };

  // Function to render wrap rates for an auction
  const renderAuctionWrapRates = (auction) => {
    if (!auction) return null;

    // Check for buyNowRates first
    if (
      auction.buyNowRates &&
      Object.values(auction.buyNowRates).some((rate) => rate > 0)
    ) {
      return (
        <div className="space-y-1">
          {auction.buyNowRates.fullWrap > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-white-400 font-medium">Full Wrap:</span>
              <span className="text-white font-bold">
                {currency} {auction.buyNowRates.fullWrap}
                <span className="text-xs text-gray-400 ml-1">/m²</span>
              </span>
            </div>
          )}
          {auction.buyNowRates.oneSide > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-white-400 font-medium">One Side:</span>
              <span className="text-white font-bold">
                {currency} {auction.buyNowRates.oneSide}
                <span className="text-xs text-gray-400 ml-1">/m²</span>
              </span>
            </div>
          )}
          {auction.buyNowRates.bothSides > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-white-400 font-medium">Both Sides:</span>
              <span className="text-white font-bold">
                {currency} {auction.buyNowRates.bothSides}
                <span className="text-xs text-gray-400 ml-1">/m²</span>
              </span>
            </div>
          )}
          {auction.buyNowRates.rearDoors > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-white-400 font-medium">Rear Doors:</span>
              <span className="text-white font-bold">
                {currency} {auction.buyNowRates.rearDoors}
                <span className="text-xs text-gray-400 ml-1">/m²</span>
              </span>
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
        <div className="space-y-1">
          {auction.minAuctionRates.fullWrap > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Full Wrap (Min):</span>
              <span className="text-white font-bold">
                {currency} {auction.minAuctionRates.fullWrap}
                <span className="text-xs text-gray-400 ml-1">/m²</span>
              </span>
            </div>
          )}
          {auction.minAuctionRates.oneSide > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">One Side (Min):</span>
              <span className="text-white font-bold">
                {currency} {auction.minAuctionRates.oneSide}
                <span className="text-xs text-gray-400 ml-1">/m²</span>
              </span>
            </div>
          )}
          {auction.minAuctionRates.bothSides > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Both Sides (Min):</span>
              <span className="text-white font-bold">
                {currency} {auction.minAuctionRates.bothSides}
                <span className="text-xs text-gray-400 ml-1">/m²</span>
              </span>
            </div>
          )}
          {auction.minAuctionRates.rearDoors > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Rear Doors (Min):</span>
              <span className="text-white font-bold">
                {currency} {auction.minAuctionRates.rearDoors}
                <span className="text-xs text-gray-400 ml-1">/m²</span>
              </span>
            </div>
          )}
        </div>
      );
    }

    // Fallback: show starting price or base price
    return (
      <p>
        <span className="font-medium">Price:</span>
        <span className="ml-2">
          {currency}{" "}
          {(auction.startingPrice || auction.basePrice || 0).toLocaleString()}
        </span>
      </p>
    );
  };

  // Display budget rates in modal
  const renderBudgetRatesInModal = (budgetRates) => {
    if (!budgetRates) return null;

    return (
      <div className="bg-gray-800 rounded-lg p-3 mt-2">
        <p className="text-sm font-medium text-gray-300 mb-2">
          Budget Rates (per m²):
        </p>
        <div className="grid grid-cols-2 gap-2">
          {budgetRates.fullWrap > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Full Wrap:</span>
              <span className="text-white">
                {currency} {budgetRates.fullWrap}
              </span>
            </div>
          )}
          {budgetRates.oneSide > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">One Side:</span>
              <span className="text-white">
                {currency} {budgetRates.oneSide}
              </span>
            </div>
          )}
          {budgetRates.bothSides > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Both Sides:</span>
              <span className="text-white">
                {currency} {budgetRates.bothSides}
              </span>
            </div>
          )}
          {budgetRates.rearDoors > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Rear Doors:</span>
              <span className="text-white">
                {currency} {budgetRates.rearDoors}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              Send Auction Recommendations
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Request Info */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-white mb-2">
              Budget Request Details
            </h3>
            <div className="text-sm text-white space-y-1">
              <p>
                <span className="font-medium">Request ID:</span>{" "}
                {getStringValue(safeRequest._id)}
              </p>
              <p>
                <span className="font-medium">Buyer ID:</span>{" "}
                {getStringValue(safeRequest.buyerId)}
              </p>

              {/* Display budget amount */}
              {safeRequest.budgetAmount && safeRequest.budgetAmount > 0 && (
                <p>
                  <span className="font-medium">Total Budget:</span> {currency}{" "}
                  {(safeRequest.budgetAmount || 0).toLocaleString()}
                </p>
              )}

              <p>
                <span className="font-medium">Description:</span>{" "}
                {getStringValue(safeRequest.description) || "Not specified"}
              </p>
            </div>

            {/* Display budget rates if available */}
            {safeRequest.budgetRates &&
              renderBudgetRatesInModal(safeRequest.budgetRates)}
          </div>

          {/* Available Auctions */}
          <div className="mb-6">
            <h3 className="font-semibold text-white mb-4">
              Available Auctions ({safeAuctions.length})
            </h3>

            {safeAuctions.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {safeAuctions.map((auction, index) => {
                  if (!auction) return null;

                  const safeAuction = auction || {};
                  const safeSeller = safeAuction.seller || {};
                  const safeLocation = safeAuction.location || {};

                  const title = getStringValue(
                    safeAuction.name ||
                      safeAuction.title ||
                      safeAuction.productName ||
                      `${safeAuction.category} Auction` ||
                      "Auction",
                  );

                  const sellerName = getStringValue(
                    safeSeller.name ||
                      safeSeller.email ||
                      safeAuction.sellerId ||
                      "N/A",
                  );

                  const locationName = getStringValue(
                    safeLocation.name ||
                      safeLocation.city ||
                      safeLocation ||
                      "N/A",
                  );

                  return (
                    <div
                      key={safeAuction._id || index}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedAuctions.includes(safeAuction._id)
                          ? "border-blue-500 bg-blue-900/20"
                          : "border-gray-700 hover:border-gray-500"
                      }`}
                      onClick={() => handleAuctionSelect(safeAuction._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-5 w-5 text-blue-600" />
                            <h4 className="font-semibold text-white">
                              {title}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                safeAuction.status === "active"
                                  ? "bg-green-900 text-green-300"
                                  : "bg-gray-800 text-gray-300"
                              }`}
                            >
                              {getStringValue(safeAuction.status) || "Active"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                            <div>
                              {/* Wrap Rates Section */}
                              {renderAuctionWrapRates(safeAuction)}

                              {/* Vehicle Info if available */}
                              {safeAuction.vehicleModel && (
                                <div className="flex items-center gap-1 mt-2">
                                  <Car className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-400">
                                    {safeAuction.vehicleModel}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <p>
                                <span className="font-medium">Seller:</span>{" "}
                                {sellerName}
                              </p>
                              <p>
                                <span className="font-medium">Location:</span>{" "}
                                {locationName}
                              </p>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span className="font-medium">Ends:</span>
                                <span>
                                  {safeAuction.endTime || safeAuction.endDate
                                    ? new Date(
                                        safeAuction.endTime ||
                                          safeAuction.endDate,
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="ml-4">
                          <input
                            type="checkbox"
                            checked={selectedAuctions.includes(safeAuction._id)}
                            onChange={() =>
                              handleAuctionSelect(safeAuction._id)
                            }
                            className="rounded border-gray-300 h-4 w-4"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white">
                  No auctions available for this budget.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={selectedAuctions.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Send{" "}
              {selectedAuctions.length > 0 ? `${selectedAuctions.length} ` : ""}
              Recommendations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetRequestPage;
