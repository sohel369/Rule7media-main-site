import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchSingleBudgetRequest } from "../../store/adminbudgetrequest/adminbudgetSlice";
import { fetchUserCountry } from "../../store/countary/countrySlice";

const SingleBudgetRequestPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { country, currency } = useSelector((state) => state.country);
  const { selectedRequest, loading, error } = useSelector(
    (state) => state.adminbudget,
  );

  // Zoom Modal State
  const [zoomImage, setZoomImage] = useState(null);

  useEffect(() => {
    if (id) dispatch(fetchSingleBudgetRequest(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  useEffect(() => {
    console.table("selectedRequest:", selectedRequest);
  }, [selectedRequest]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center animate-fade-in">
        <p className="text-red-500 text-lg font-semibold">Error: {error}</p>
        <button
          className="mt-4 text-teal-600 hover:text-teal-800 underline transition-colors duration-200"
          onClick={() => navigate("/admin/budget-requests")}
        >
          Back to Requests
        </button>
      </div>
    );
  }

  if (!selectedRequest || selectedRequest._id !== id) {
    return (
      <div className="p-6 text-center animate-fade-in">
        <p className="text-white text-lg">No request found</p>
        <button
          className="mt-4 text-teal-600 hover:text-teal-800 underline transition-colors duration-200"
          onClick={() => navigate("/admin/budget-requests")}
        >
          Back to Requests
        </button>
      </div>
    );
  }

  const totalBudget = (
    (selectedRequest.oneSide || 0) +
    (selectedRequest.bothSides || 0) +
    (selectedRequest.fullWrap || 0) +
    (selectedRequest.rearDoors || 0)
  ).toFixed(2);

  return (
    <>
      {/* ZOOM MODAL – SABSE UPAR */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-full">
            <img
              src={zoomImage}
              alt="Zoomed Vehicle"
              className="w-full h-auto max-h-screen object-contain rounded-lg"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoomImage(null);
              }}
              className="absolute top-4 right-4 bg-white text-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT – NO BG/THEME CHANGE */}
      <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen transition-all duration-300 ease-in-out bg-theme-bg rounded-2xl">
        {/* STICKY HEADER */}
        <div className="sticky top-0 z-10 bg-theme-bg shadow-md p-4 mb-6 -mt-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <button
              className="text-white hover:text-teal-300 flex items-center gap-2 transition-colors duration-200"
              onClick={() => navigate("/admin/budget-requests")}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Requests
            </button>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Budget Request Details
            </h2>
          </div>
        </div>

        {/* VEHICLE IMAGES – UPAR MEIN, CHOTI, EK ROW, ZOOMABLE */}
        <div className="mb-8 -mt-8 relative z-20 bg-theme-bg2 p-4 rounded-xl shadow-lg border border-teal-100">
          <h3 className="text-lg font-semibold text-white mb-3">
            Vehicle Images
          </h3>
          {selectedRequest.fleetAuctionId?.images?.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400">
              {selectedRequest.fleetAuctionId.images.map((image) => (
                <div
                  key={image._id}
                  className="relative flex-shrink-0 group cursor-pointer"
                  onClick={() => setZoomImage(image.url)}
                >
                  <img
                    src={image.url}
                    alt="Vehicle"
                    className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-lg shadow-md border-2 border-gray-300 transition-transform duration-200 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/128x128?text=No+Image";
                    }}
                  />
                  {image.isPrimary && (
                    <span className="absolute top-1 left-1 bg-teal-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg flex items-center justify-center transition-all duration-200">
                    <svg
                      className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 italic">No images available</p>
          )}
        </div>

        {/* REST OF THE CONTENT – ORIGINAL BG & THEME PRESERVED */}
        <div className="bg-theme-bg2 p-6 rounded-xl shadow-lg border border-teal-100 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* FLEET OWNER DETAILS */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                Fleet Owner Details
              </h3>
              <p className="text-white">
                <strong>Company:</strong>{" "}
                {selectedRequest.fleetAuctionId?.company ||
                  selectedRequest.fleetOwnerId?.company ||
                  "N/A"}
              </p>
              <p className="text-white">
                <strong>Name:</strong>{" "}
                {selectedRequest.fleetOwnerId
                  ? selectedRequest.fleetOwnerId.name
                    ? selectedRequest.fleetOwnerId.name
                    : `${selectedRequest.fleetOwnerId.firstName || "N/A"} ${selectedRequest.fleetOwnerId.lastName || ""}`
                  : selectedRequest.fleetAuctionId?.user
                    ? `${selectedRequest.fleetAuctionId.user.firstName || "N/A"} ${selectedRequest.fleetAuctionId.user.lastName || ""}`
                    : "N/A"}
              </p>
              <p className="text-white">
                <strong>Email:</strong>{" "}
                {selectedRequest.fleetOwnerId?.email ||
                  selectedRequest.fleetAuctionId?.user?.email ||
                  "N/A"}
              </p>
            </div>

            {/* BUYER DETAILS */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                Buyer Details
              </h3>
              <p className="text-white">
                <strong>Email:</strong>{" "}
                {selectedRequest.user?.email || "Anonymous"}
              </p>
              <p className="text-white">
                <strong>Account Number:</strong>{" "}
                {selectedRequest.accountNumber || "N/A"}
              </p>
              <p className="text-white">
                <strong>Name:</strong>{" "}
                {selectedRequest.user
                  ? `${selectedRequest.user.firstName || "N/A"} ${selectedRequest.user.lastName || ""}`
                  : "Anonymous"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* VEHICLE DETAILS */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                Vehicle Details
              </h3>
              <p className="text-white">
                <strong>Manufacturer:</strong>{" "}
                {selectedRequest.fleetAuctionId?.vehicleManufacturer || "N/A"}
              </p>
              <p className="text-white">
                <strong>Model:</strong>{" "}
                {selectedRequest.fleetAuctionId?.vehicleModel || "N/A"}
              </p>
              <p className="text-white">
                <strong>Year:</strong>{" "}
                {selectedRequest.fleetAuctionId?.yearofmanufacturer || "N/A"}
              </p>
              <p className="text-white">
                <strong>Location:</strong>{" "}
                {selectedRequest.fleetAuctionId?.location?.name || "N/A"}
              </p>
            </div>

            {/* BUDGET DETAILS */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                Budget Details
              </h3>
              <p className="text-white">
                <strong>One Side:</strong> {currency}{" "}
                {selectedRequest.oneSide || "N/A"}
              </p>
              <p className="text-white">
                <strong>Both Sides:</strong> {currency}{" "}
                {selectedRequest.bothSides || "N/A"}
              </p>
              <p className="text-white">
                <strong>Full Wrap:</strong> {currency}{" "}
                {selectedRequest.fullWrap || "N/A"}
              </p>
              <p className="text-white">
                <strong>Rear Doors:</strong> {currency}{" "}
                {selectedRequest.rearDoors || "N/A"}
              </p>
              <p className="text-white font-bold">
                <strong>Total Budget:</strong> {currency} {totalBudget}
              </p>
            </div>
          </div>

          {/* ADDITIONAL DETAILS */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              Additional Details
            </h3>
            <p className="text-white">
              <strong>Query:</strong> {selectedRequest.query || "N/A"}
            </p>
            <p className="text-white">
              <strong>Status:</strong>{" "}
              <span
                className={`inline-block px-2 py-1 rounded-full text-white
                  ${
                    selectedRequest.status === "approved"
                      ? "bg-green-500"
                      : selectedRequest.status === "rejected"
                        ? "bg-red-500"
                        : selectedRequest.status === "info_requested"
                          ? "bg-yellow-500 text-black"
                          : "bg-teal-500"
                  }`}
              >
                {selectedRequest.status?.replace(/_/g, " ") || "N/A"}
              </span>
            </p>
            <p className="text-white">
              <strong>Created At:</strong>{" "}
              {new Date(selectedRequest.createdAt).toLocaleString() || "N/A"}
            </p>
            <p className="text-white">
              <strong>Updated At:</strong>{" "}
              {new Date(selectedRequest.updatedAt).toLocaleString() || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleBudgetRequestPage;
