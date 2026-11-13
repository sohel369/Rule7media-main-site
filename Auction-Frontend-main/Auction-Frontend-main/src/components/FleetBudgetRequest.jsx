import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFleetRecommendedAuctions,
  resetBudgetState,
  sendFleetRecommendation,
  clearError,
  clearSuccess,
} from "../store/fleetbudgetrequest/fleetbudgetslice";
import { fetchBudgetRequestsForFleetOwner } from "../store/fleetowner/fleetownerSlice";
import { fetchUserCountry } from "../store/countary/countrySlice";
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
  AlertCircle,
  Shield,
  Eye,
  EyeOff,
  UserCheck,
  Lock,
  Info,
} from "lucide-react";
import {
  FooterLeaderboard,
  HeaderLeaderboard,
  MediumRectangle,
} from "./AdSlots";

const FleetBudgetRequest = () => {
  const dispatch = useDispatch();
  const { fleetrequest, isLoading, isError, message } = useSelector(
    (state) => state.fleetOwner,
  );

  const budgetState = useSelector((state) => state.fleetbudget);
  const {
    recommendedFleetAuctions,
    loading,
    error,
    success,
    hasBudgetComparison,
  } = budgetState;

  const { user } = useSelector((state) => state.auth);
  const fleetOwnerId = user?._id;

  const [selectedRequests, setSelectedRequests] = useState([]);
  const [recommendationModal, setRecommendationModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [loadingAuctions, setLoadingAuctions] = useState(false);
  const [selectedAuctions, setSelectedAuctions] = useState([]);
  const [showAdminInfo, setShowAdminInfo] = useState(false);
  const [directContactModal, setDirectContactModal] = useState(false);
  const { country, currency } = useSelector((state) => state.country);

  useEffect(() => {
    if (fleetOwnerId) {
      dispatch(fetchBudgetRequestsForFleetOwner(fleetOwnerId));
    }

    return () => {
      dispatch(resetBudgetState());
    };
  }, [dispatch, fleetOwnerId]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }
  }, [error, dispatch]);

  const actualBudgetList = fleetrequest?.data?.length
    ? fleetrequest.data
    : Array.isArray(fleetrequest)
      ? fleetrequest
      : [];

  const handleSelectRequest = (requestId) => {
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId],
    );
  };

  const handleSendRecommendation = async (request) => {
    if (!request.adminApproved) {
      alert(
        "This request is not yet approved by admin. Please wait for admin approval.",
      );
      return;
    }

    setCurrentRequest(request);
    setLoadingAuctions(true);

    try {
      const actionResult = await dispatch(
        fetchFleetRecommendedAuctions({
          fleetOwnerId,
          budgetId: request._id,
        }),
      );

      if (fetchFleetRecommendedAuctions.fulfilled.match(actionResult)) {
        setRecommendationModal(true);
      } else {
        alert("Failed to fetch matching auctions. Please try again.");
      }
    } catch (error) {
      alert("Failed to fetch matching auctions. Please try again.");
    } finally {
      setLoadingAuctions(false);
    }
  };

  const submitRecommendation = async () => {
    if (selectedAuctions.length === 0) {
      alert("Please select at least one auction to recommend.");
      return;
    }

    try {
      const recommendationData = {
        buyerId: currentRequest.user._id,
        fleetOwnerId: user._id,
        budgetRequestId: currentRequest._id,
        auctionIds: selectedAuctions.map(
          (item) => item.auction?._id || item._id,
        ),
        message: `We found ${selectedAuctions.length} matching vehicles for your budget!`,
      };

      const response = await dispatch(
        sendFleetRecommendation(recommendationData),
      );

      if (sendFleetRecommendation.fulfilled.match(response)) {
        alert("Recommendation sent successfully! Admin has been notified.");
        setRecommendationModal(false);
        setCurrentRequest(null);
        setSelectedAuctions([]);
        dispatch(fetchBudgetRequestsForFleetOwner(fleetOwnerId));
      } else {
        alert(response.payload?.message || "Failed to send recommendation");
      }
    } catch (error) {
      alert("Failed to send recommendation");
    }
  };

  const closeModal = () => {
    setRecommendationModal(false);
    setCurrentRequest(null);
    setSelectedAuctions([]);
    dispatch(resetBudgetState());
  };

  const getBuyerDisplayInfo = (request) => {
    if (request.showBuyerDetails) {
      return {
        name: request.user?.name || "Buyer",
        email: request.user?.email || "buyer@example.com",
        phone: request.user?.phone || "000-000-0000",
        accountNumber: request.user?.accountNumber || "ANON-******",
        canContact: true,
      };
    } else {
      return {
        name: "Anonymous Buyer",
        email: "***@***.com",
        phone: "***-***-****",
        accountNumber: "ANON-******",
        canContact: false,
      };
    }
  };

  const getStatusBadge = (request) => {
    if (!request.adminApproved) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending Admin Approval
        </span>
      );
    }

    if (request.canContactDirectly) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <UserCheck className="h-3 w-3 mr-1" />
          Info Requested
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-theme-bg text-white">
        <Shield className="h-3 w-3 mr-1" />
        Admin Approved
      </span>
    );
  };

  const handleDirectContact = (request) => {
    if (!request.canContactDirectly) {
      alert(
        "Direct contact is not enabled for this request. Please contact admin.",
      );
      return;
    }
    setCurrentRequest(request);
    setDirectContactModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg rounded-2xl p-6 w-full">
      <HeaderLeaderboard />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-theme-bg2 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Fleet Budget Requests
              </h1>
              <p className="text-white">
                Fleet Owner ID:{" "}
                <span className="font-semibold text-blue-600">
                  {fleetOwnerId}
                </span>
              </p>
              <p className="text-sm text-white mt-1">
                Total Approved Requests: {actualBudgetList?.length || 0}
              </p>
            </div>

            {/* Admin Info Toggle */}
            <button
              onClick={() => setShowAdminInfo(!showAdminInfo)}
              className="flex items-center gap-2 px-4 py-2 bg-theme-bg text-white rounded-lg hover:bg-theme-bg2 transition-colors"
            >
              <Shield className="h-4 w-4" />
              Admin Process Info
              {showAdminInfo ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Admin Process Information */}
          {showAdminInfo && (
            <div className="mt-4 p-4 bg-theme-bg border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-white mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2" /> How Admin Mediation Works:
              </h3>
              <ul className="text-sm text-white space-y-1">
                <li>• All budget requests are first reviewed by admin</li>
                <li>• Admin maintains anonymity between buyer and seller</li>
                <li>• You only see approved requests from admin</li>
                <li>
                  • Buyer details are hidden unless admin enables direct contact
                </li>
                <li>• Admin controls when parties can communicate directly</li>
                <li>• All recommendations are monitored by admin</li>
              </ul>
            </div>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-green-700">
                Recommendation sent successfully! Admin has been notified.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {(isError || error) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <X className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-700">{message || error}</p>
            </div>
          </div>
        )}

        {/* Budget Requests List */}
        <div className="grid gap-6">
          {actualBudgetList && actualBudgetList.length > 0 ? (
            actualBudgetList.map((request, index) => {
              const buyerInfo = getBuyerDisplayInfo(request);

              return (
                <div
                  key={request._id || index}
                  className="bg-theme-bg2 rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Status Badge */}
                      <div className="mb-4">{getStatusBadge(request)}</div>

                      {/* Buyer Info */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          {buyerInfo.canContact ? (
                            <User className="h-5 w-5 text-white" />
                          ) : (
                            <Lock className="h-5 w-5 text-white" />
                          )}
                          <div>
                            <p className="font-semibold text-white">
                              {buyerInfo.name}
                            </p>
                            <p className="text-sm text-white">
                              {buyerInfo.email}
                            </p>
                            <p className="text-sm text-white">
                              {buyerInfo.phone}
                            </p>
                            <p className="text-xs text-white mt-1">
                              Account: {buyerInfo.accountNumber}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-white" />
                          <span className="text-sm text-white">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Budget Details */}
                      <div className="bg-theme-bg rounded-lg p-4 mb-4 text-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Pricing Section */}
                          <div>
                            <h3 className="font-medium text-white mb-2">
                              Pricing Details
                            </h3>
                            <div className="space-y-2">
                              <p>
                                <span className="font-medium">Full Wrap:</span>{" "}
                                {currency}
                                {request.fullWrap?.toLocaleString() || "0"}
                              </p>
                              <p>
                                <span className="font-medium">One Side:</span>{" "}
                                {currency}
                                {request.oneSide?.toLocaleString() || "0"}
                              </p>
                              <p>
                                <span className="font-medium">Both Sides:</span>{" "}
                                {currency}{" "}
                                {request.bothSides?.toLocaleString() || "0"}
                              </p>
                              <p>
                                <span className="font-medium">Rear Doors:</span>{" "}
                                {currency}
                                {request.rearDoors?.toLocaleString() || "0"}
                              </p>
                            </div>
                          </div>

                          {/* Vehicle/Auction Info */}
                          <div>
                            <h3 className="font-medium text-white mb-2">
                              Vehicle Details
                            </h3>
                            <div className="space-y-2">
                              <p>
                                <span className="font-medium">Company:</span>{" "}
                                {request.fleetAuctionId?.vehicleManufacturer ||
                                  request.fleetAuctionId?.company ||
                                  "N/A"}
                              </p>
                              <p>
                                <span className="font-medium">Model:</span>{" "}
                                {request.fleetAuctionId?.vehicleModel || "N/A"}
                              </p>
                              <p>
                                <span className="font-medium">Auction ID:</span>{" "}
                                {request.fleetAuctionId?._id || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Query */}
                        {request.query && (
                          <div className="mt-4">
                            <p className="text-base text-white">
                              <span className="font-semibold">
                                Buyer Query:
                              </span>{" "}
                              {request.query}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleSendRecommendation(request)}
                        disabled={!request.adminApproved || loadingAuctions}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                          request.adminApproved
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {loadingAuctions ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Send Recommendation
                      </button>

                      {request.adminApproved && request.canContactDirectly && (
                        <button
                          onClick={() => handleDirectContact(request)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <UserCheck className="h-4 w-4" />
                          Contact Buyer
                        </button>
                      )}

                      <label className="flex items-center gap-3 px-3 py-2 rounded-lg bg-theme-bg border border-blue-700/40 text-sm text-white cursor-pointer hover:bg-blue-900/30 transition">
                        <input
                          type="checkbox"
                          checked={selectedRequests.includes(request._id)}
                          onChange={() => handleSelectRequest(request._id)}
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
                        />
                        <span className="select-none">Select</span>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-theme-bg2 rounded-lg shadow-sm p-12 text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No Budget Requests
              </h3>
              <p className="text-white">
                You haven't received any admin-approved budget requests yet.
              </p>
            </div>
          )}
        </div>

        {/* RECOMMENDATION MODAL – CENTER ME + CLOSE FIXED */}
        {recommendationModal && currentRequest && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <div
              className="bg-theme-bg rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    Send Auction Recommendations
                  </h2>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeModal();
                    }}
                    className="text-white hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Request Info */}
                <div className="bg-theme-bg2 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-white mb-2">
                    Budget Request Details
                  </h3>
                  <div className="text-sm text-white space-y-1">
                    <p>
                      <span className="font-medium">Request ID:</span>{" "}
                      {currentRequest._id}
                    </p>
                    <p>
                      <span className="font-medium">Buyer Reference:</span>{" "}
                      {getBuyerDisplayInfo(currentRequest).name}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p>
                          <span className="font-medium">Full Wrap:</span>{" "}
                          {currency} {currentRequest.fullWrap?.toLocaleString()}
                        </p>
                        <p>
                          <span className="font-medium">One Side:</span>{" "}
                          {currency} {currentRequest.oneSide?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p>
                          <span className="font-medium">Both Sides:</span>{" "}
                          {currency}{" "}
                          {currentRequest.bothSides?.toLocaleString()}
                        </p>
                        <p>
                          <span className="font-medium">Rear Doors:</span>{" "}
                          {currency}{" "}
                          {currentRequest.rearDoors?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {currentRequest.query && (
                      <p className="mt-2">
                        <span className="font-medium">Buyer Query:</span>{" "}
                        {currentRequest.query}
                      </p>
                    )}
                  </div>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">
                      Loading matching auctions...
                    </span>
                  </div>
                )}

                {/* Available Auctions */}
                {!loading && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-white mb-4">
                      Matching Auctions ({recommendedFleetAuctions?.length || 0}
                      )
                    </h3>

                    {recommendedFleetAuctions &&
                    recommendedFleetAuctions.length > 0 ? (
                      <div className="space-y-4 max-h-96 overflow-y-auto bg-theme-bg2 text-white">
                        {recommendedFleetAuctions.map((match, index) => (
                          <div
                            key={match.auction?._id || index}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              selectedAuctions.some(
                                (a) => a._id === match.auction?._id,
                              )
                                ? "border-blue-500 bg-theme-bg"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => {
                              if (!match.auction) return;

                              const isSelected = selectedAuctions.some(
                                (a) => a._id === match.auction._id,
                              );
                              if (isSelected) {
                                setSelectedAuctions(
                                  selectedAuctions.filter(
                                    (a) => a._id !== match.auction._id,
                                  ),
                                );
                              } else {
                                setSelectedAuctions([
                                  ...selectedAuctions,
                                  match.auction,
                                ]);
                              }
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg">
                                  {match.auction?.company} -{" "}
                                  {match.auction?.vehicleModel}
                                </h4>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                  <div>
                                    <h5 className="font-medium">
                                      Auction Rates:
                                    </h5>
                                    <p>
                                      Full Wrap: {currency}{" "}
                                      {match.auction?.minAuctionRates?.fullWrap?.toLocaleString() ||
                                        "N/A"}
                                    </p>
                                    <p>
                                      One Side: {currency}{" "}
                                      {match.auction?.minAuctionRates?.oneSide?.toLocaleString() ||
                                        "N/A"}
                                    </p>
                                    <p>
                                      Both Sides:{currency}{" "}
                                      {match.auction?.minAuctionRates?.bothSides?.toLocaleString() ||
                                        "N/A"}
                                    </p>
                                    <p>
                                      Rear Doors: {currency}{" "}
                                      {match.auction?.minAuctionRates?.rearDoors?.toLocaleString() ||
                                        "N/A"}
                                    </p>
                                  </div>
                                  {match.priceComparison && (
                                    <div>
                                      <h5 className="font-medium">
                                        Price Comparison:
                                      </h5>
                                      <p>
                                        Full Wrap:{" "}
                                        {match.priceComparison.fullWrap
                                          ?.percentage || "N/A"}
                                        %
                                      </p>
                                      <p>
                                        One Side:{" "}
                                        {match.priceComparison.oneSide
                                          ?.percentage || "N/A"}
                                        %
                                      </p>
                                      <p>
                                        Both Sides:{" "}
                                        {match.priceComparison.bothSides
                                          ?.percentage || "N/A"}
                                        %
                                      </p>
                                      <p>
                                        Rear Doors:{" "}
                                        {match.priceComparison.rearDoors
                                          ?.percentage || "N/A"}
                                        %
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center ml-4">
                                <input
                                  type="checkbox"
                                  checked={selectedAuctions.some(
                                    (a) => a._id === match.auction?._id,
                                  )}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    if (!match.auction) return;

                                    if (e.target.checked) {
                                      setSelectedAuctions([
                                        ...selectedAuctions,
                                        match.auction,
                                      ]);
                                    } else {
                                      setSelectedAuctions(
                                        selectedAuctions.filter(
                                          (a) => a._id !== match.auction._id,
                                        ),
                                      );
                                    }
                                  }}
                                  className="h-5 w-5 rounded border-gray-300"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">
                          No matching auctions found for this budget request.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-white rounded-lg hover:bg-theme-bg2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitRecommendation}
                    disabled={selectedAuctions.length === 0 || loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    Send{" "}
                    {selectedAuctions.length > 0
                      ? `${selectedAuctions.length} `
                      : ""}
                    Recommendations
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Direct Contact Modal */}
        {directContactModal && currentRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Contact Buyer
                  </h2>
                  <button
                    onClick={() => setDirectContactModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                    <p className="text-blue-700">
                      <Info className="inline h-4 w-4 mr-1" />
                      Admin has approved direct contact for this transaction
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Buyer Name
                      </label>
                      <div className="p-2 bg-gray-50 rounded border border-gray-200">
                        {getBuyerDisplayInfo(currentRequest).name}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="p-2 bg-gray-50 rounded border border-gray-200">
                        {getBuyerDisplayInfo(currentRequest).email}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <div className="p-2 bg-gray-50 rounded border border-gray-200">
                        {getBuyerDisplayInfo(currentRequest).phone}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number
                      </label>
                      <div className="p-2 bg-gray-50 rounded border border-gray-200">
                        {getBuyerDisplayInfo(currentRequest).accountNumber}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDirectContactModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <FooterLeaderboard />
    </div>
  );
};

export default FleetBudgetRequest;
