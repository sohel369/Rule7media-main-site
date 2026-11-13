import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWrappers,
  assignWrapper,
  fetchAllAssignmentsStatus,
} from "../../store/wrapperassignorders/wrapperassignorderSlice";
import { generateToken } from "../../firebase";
import socket from "../../socket";
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaBuilding,
  FaGlobe,
  FaUsers,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

const AssignWrapperPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const scrollRef = React.useRef(null);

  const wrapperState = useSelector((state) => state.wrappers);
  const {
    wrappers = [],
    alreadyAssigned,
    wrappersstatus,
    isLoading: wrapperLoading,
    isError: wrapperError,
    message: wrapperMessage,
  } = wrapperState;

  const [selectedWrapper, setSelectedWrapper] = useState("");

  // Fetch available wrappers for this order
  useEffect(() => {
    if (orderId) {
      dispatch(fetchWrappers(orderId));
    }
    dispatch(fetchAllAssignmentsStatus());
  }, [orderId, dispatch]);

  // Get wrapper status for a specific wrapper - UPDATED LOGIC
  const getWrapperStatus = (wrapperId, wrapperIndex) => {
    if (!wrappersstatus || !Array.isArray(wrappersstatus)) return null;

    // Option 1: Use array index if data is in same order
    if (wrappersstatus[wrapperIndex]) {
      return wrappersstatus[wrapperIndex];
    }

    // Option 2: If wrapper field exists, match by wrapper ID
    const byWrapperId = wrappersstatus.find(
      (assignment) =>
        assignment.wrapper === wrapperId ||
        assignment.wrapper?._id === wrapperId,
    );
    if (byWrapperId) {
      return byWrapperId;
    }

    // Option 3: If no wrapper field, use array index as fallback
    return wrappersstatus[wrapperIndex] || null;
  };

  const handleAssignWrapper = async (wrapperId) => {
    if (!wrapperId) {
      alert("Please select a wrapper to assign.");
      return;
    }
    const fcmToken = await generateToken();
    if (!fcmToken) {
      console.error("FCM Token is missing.");
      return;
    }

    dispatch(assignWrapper({ orderId, wrapperId }))
      .unwrap()
      .then(() => {
        socket.emit("wrapperAssignment", {
          wrapperId,
          orderId,
          message: `You have been assigned to order ${orderId}`,
          fcmToken,
        });
        alert("Wrapper assigned successfully!");
        setSelectedWrapper("");
        navigate("/admin/orders");
      })
      .catch((err) => console.error("Wrapper Assignment Error:", err));
  };

  // Scroll handlers
  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };
  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  const capitalizeFirstLetter = (str) => {
    if (!str || str.toLowerCase() === "n/a") return "N/A";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Parse and format wrappingShopDetails
  const formatWrappingShopDetails = (details) => {
    try {
      const parsed =
        typeof details === "string" ? JSON.parse(details) : details;
      return (
        <div className="space-y-3 text-sm text-gray-600">
          <div>
            <p className="font-semibold text-gray-800">Fitting Time:</p>
            {parsed.fittingTime ? (
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(parsed.fittingTime).map(
                  ([vehicleType, times]) => (
                    <div key={vehicleType}>
                      <p className="font-medium text-gray-700 capitalize">
                        {vehicleType}
                      </p>
                      <ul className="list-disc pl-5">
                        {Object.entries(times).map(([key, value]) => (
                          <li key={key}>
                            {capitalizeFirstLetter(key)}: {value} Days
                          </li>
                        ))}
                      </ul>
                    </div>
                  ),
                )}
              </div>
            ) : (
              "N/A"
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-800">Design Service:</p>
            <p>{parsed.designService || "N/A"}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Overnight Fitting:</p>
            <p>{parsed.overnightFitting || "N/A"}</p>
          </div>
        </div>
      );
    } catch (error) {
      console.error("Error parsing wrappingShopDetails:", error);
      return "Invalid wrapping shop details";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Assign Wrapper to Order
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
            Order ID: {orderId}
          </h2>

          {wrapperLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse bg-gray-100 rounded-lg p-6"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : wrapperError ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium">
              Error: {wrapperMessage}
            </div>
          ) : wrappers.length > 0 ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Available Wrappers
                </h3>
                <div className="flex space-x-2">
                  <button
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 focus:ring-2 focus:ring-green-500"
                    onClick={scrollLeft}
                    aria-label="Scroll left"
                  >
                    <FaArrowLeft className="text-gray-600" />
                  </button>
                  <button
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 focus:ring-2 focus:ring-green-500"
                    onClick={scrollRight}
                    aria-label="Scroll right"
                  >
                    <FaArrowRight className="text-gray-600" />
                  </button>
                </div>
              </div>

              <div
                ref={scrollRef}
                className="flex flex-nowrap overflow-x-auto gap-4 sm:gap-6 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 snap-x snap-mandatory"
              >
                {wrappers.map((wrapper, index) => {
                  const isAssigned =
                    Array.isArray(alreadyAssigned) &&
                    alreadyAssigned.includes(wrapper._id);

                  // Get status for this specific wrapper only - UPDATED
                  const wrapperStatus = getWrapperStatus(wrapper._id, index);

                  return (
                    <div
                      key={wrapper._id}
                      className={`min-w-[280px] sm:min-w-[320px] max-w-[320px] flex-shrink-0 p-6 bg-white rounded-lg shadow-md border-2 transition-all duration-200 snap-center ${
                        selectedWrapper === wrapper._id
                          ? "border-green-500 ring-2 ring-green-200"
                          : "border-gray-200 hover:border-green-300"
                      } cursor-pointer`}
                      onClick={() => setSelectedWrapper(wrapper._id)}
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        {wrapper.profilePicture ? (
                          <img
                            src={wrapper.profilePicture}
                            alt={`${wrapper.firstName} profile`}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                            onError={(e) =>
                              (e.target.src =
                                "https://res.cloudinary.com/dnsxaor2k/image/upload/v1721403078/r4s3ingo0ysqq5hzsqal.jpg")
                            }
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                            {wrapper.firstName?.charAt(0) || "N/A"}
                          </div>
                        )}
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">
                            {capitalizeFirstLetter(wrapper.firstName)}{" "}
                            {capitalizeFirstLetter(wrapper.lastname || "")}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {wrapper.position || "N/A"}
                          </p>

                          {/* Show status only for this wrapper */}
                          {wrapperStatus ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  wrapperStatus.status.toLowerCase() ===
                                  "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : wrapperStatus.status.toLowerCase() ===
                                        "delivered"
                                      ? "bg-green-100 text-green-800"
                                      : wrapperStatus.status.toLowerCase() ===
                                          "accepted"
                                        ? "bg-green-100 text-green-800"
                                        : wrapperStatus.status.toLowerCase() ===
                                            "prepare_for_delivery"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                Order Status:{" "}
                                {capitalizeFirstLetter(
                                  wrapperStatus.status.replace(/_/g, " "),
                                )}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  wrapperStatus.acceptStatus.toLowerCase() ===
                                  "accepted"
                                    ? "bg-green-100 text-green-800"
                                    : wrapperStatus.acceptStatus.toLowerCase() ===
                                        "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                Order Response:{" "}
                                {capitalizeFirstLetter(
                                  wrapperStatus.acceptStatus,
                                )}
                              </span>
                            </div>
                          ) : (
                            <div className="mt-2 text-gray-400 text-sm">
                              No assignment status available
                            </div>
                          )}

                          {isAssigned && (
                            <p className="text-red-600 text-sm font-semibold mt-2">
                              Already Assigned
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex items-center space-x-2">
                          <FaEnvelope className="text-gray-500" />
                          <p className="truncate">
                            <span className="font-semibold">Email:</span>{" "}
                            {wrapper.email || "N/A"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaBuilding className="text-gray-500" />
                          <p className="truncate">
                            <span className="font-semibold">Company:</span>{" "}
                            {capitalizeFirstLetter(wrapper.company || "N/A")}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaMapMarkerAlt className="text-gray-500" />
                          <p className="truncate">
                            <span className="font-semibold">Location:</span>{" "}
                            {capitalizeFirstLetter(wrapper.city || "N/A")},{" "}
                            {capitalizeFirstLetter(wrapper.state || "N/A")},{" "}
                            {capitalizeFirstLetter(wrapper.country || "N/A")}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaMapMarkerAlt className="text-gray-500" />
                          <p className="break-words">
                            <span className="font-semibold">Address:</span>{" "}
                            {capitalizeFirstLetter(wrapper.street1 || "N/A")}{" "}
                            {wrapper.street2
                              ? `, ${capitalizeFirstLetter(wrapper.street2)}`
                              : ""}
                            , {capitalizeFirstLetter(wrapper.suburb || "N/A")},{" "}
                            {wrapper.postalCode || "N/A"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaGlobe className="text-gray-500" />
                          <p className="truncate">
                            <span className="font-semibold">Website:</span>{" "}
                            {wrapper.website ? (
                              <a
                                href={wrapper.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:underline"
                              >
                                {wrapper.website}
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaUsers className="text-gray-500" />
                          <p>
                            <span className="font-semibold">Employees:</span>{" "}
                            {wrapper.employees || "N/A"}
                          </p>
                        </div>
                        <div className="mt-4">
                          <p className="font-semibold text-gray-800">
                            Wrapping Shop Details:
                          </p>
                          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50 text-sm">
                            {formatWrappingShopDetails(
                              wrapper.wrappingShopDetails,
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        className={`mt-6 w-full py-2 rounded-md text-white font-medium transition-colors focus:ring-2 focus:ring-green-500 ${
                          selectedWrapper === wrapper._id
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-400 hover:bg-gray-500"
                        } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignWrapper(wrapper._id);
                        }}
                        disabled={wrapperLoading || isAssigned}
                        aria-disabled={wrapperLoading || isAssigned}
                      >
                        {isAssigned
                          ? "Already Assigned"
                          : selectedWrapper === wrapper._id
                            ? "Assign This Wrapper"
                            : "Select Wrapper"}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition-colors"
                  onClick={() => navigate("/admin/orders")}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 text-gray-600 p-4 rounded-lg text-center font-medium">
              No wrappers available for this order.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignWrapperPage;
