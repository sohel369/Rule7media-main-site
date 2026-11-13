import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { getWrapperOrders } from "../store/wrapperassignorders/wrapperassignorderSlice";
import { IoIosCart } from "react-icons/io";
import { FaFilter, FaBox, FaEye } from "react-icons/fa";
import { MdLocalShipping, MdDeliveryDining, MdPending } from "react-icons/md";
import { BsBoxSeam } from "react-icons/bs";
import Loading from "./Loading";
import { fetchUserCountry } from "../store/countary/countrySlice";
const WrapperOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { assignments, isLoading, isError, message } = useSelector(
    (state) => state.wrappers,
  );

  const { user } = useSelector((state) => state.auth);
  const [filterStatus, setFilterStatus] = useState("All");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const locationFilter = location.state?.defaultFilter;
  const { country, currency } = useSelector((state) => state.country);
  const userId = user?._id;

  useEffect(() => {
    if (locationFilter) {
      setFilterStatus(locationFilter);
    }
  }, [locationFilter]);
  useEffect(() => {
    if (userId) {
      dispatch(getWrapperOrders(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);
  // Filter assignments based on status
  const filteredAssignments =
    filterStatus === "All"
      ? assignments || [] // Use assignments directly
      : (assignments || []).filter((assignment) => {
          const statusMap = {
            Delivered: "DELIVERED",
            Pending: "PENDING",
            Preparing: "PREPARE_FOR_DELIVERY",
            Cancelled: "CANCELLED",
            ACCEPTED: "ACCEPTED",
            REJECTED: "REJECTED",
          };
          const compareStatus = statusMap[filterStatus] || filterStatus;
          return (
            assignment.status === compareStatus ||
            assignment.acceptStatus === compareStatus
          );
        });

  const formatDate = (dateString) => {
    const options = { month: "short", day: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "text-white";
      case "ACCEPTED":
        return " text-white";
      case "REJECTED":
        return " text-white";
      case "DELIVERED":
        return " text-white";
      case "CANCELLED":
        return " text-white";
      case "PREPARE_FOR_DELIVERY":
        return " text-white0";
      default:
        return " text-white";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "ACCEPTED":
        return "Accepted";
      case "REJECTED":
        return "Rejected";
      case "DELIVERED":
        return "Delivered";
      case "CANCELLED":
        return "Cancelled";
      case "PREPARE_FOR_DELIVERY":
        return "Preparing for Delivery";
      default:
        return status;
    }
  };

  return (
    <div className="bg-theme-bg min-h-screen w-full text-white rounded-2xl">
      <div className="bg-theme-bg2 text-white px-4 py-3 shadow-md rounded-2xl">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center">
            <IoIosCart className="mr-2 text-2xl" />
            My Assigned Orders
          </h1>
          <button
            className="md:hidden flex items-center text-sm bg-white bg-opacity-20 rounded-full px-3 py-1"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          >
            <FaFilter className="mr-1" /> Filters
          </button>
        </div>
      </div>

      <div className="container w-full px-4 py-6">
        <div className="w-full flex flex-col md:flex-row gap-6">
          {isMobileFilterOpen && (
            <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end">
              <div className="bg-white rounded-t-xl w-full p-4 animate-slide-up">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-gray-800">Filters</h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="text-gray-500"
                  >
                    ×
                  </button>
                </div>
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    ASSIGNMENT STATUS
                  </h4>
                  <div className="space-y-2">
                    {[
                      "All",
                      "PENDING",
                      "ACCEPTED",
                      "REJECTED",
                      "PREPARE_FOR_DELIVERY",
                      "DELIVERED",
                      "CANCELLED",
                    ].map((statusItem) => (
                      <div
                        key={statusItem}
                        onClick={() => {
                          setFilterStatus(statusItem);
                          setIsMobileFilterOpen(false);
                        }}
                        className={`
                          cursor-pointer px-3 py-2 rounded-md
                          ${filterStatus === statusItem ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-gray-50 text-gray-600"}
                        `}
                      >
                        <div className="flex items-center">
                          <span
                            className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${filterStatus === statusItem ? "border-blue-600" : "border-gray-300"}`}
                          >
                            {filterStatus === statusItem && (
                              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            )}
                          </span>
                          {statusItem
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0) + word.slice(1).toLowerCase(),
                            )
                            .join(" ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  className="w-full mt-4 bg-theme-bg2 text-white py-2 rounded-md font-medium"
                  onClick={() => setIsMobileFilterOpen(false)}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          <aside className="hidden md:block w-64 sticky top-4 h-fit">
            <div className="bg-theme-bg2 rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center mb-4">
                <FaFilter className="text-white mr-2" />
                <h2 className="font-bold text-white">Filters</h2>
              </div>
              <div className="border-t pt-3">
                <h3 className="font-medium text-sm text-white mb-2">
                  ASSIGNMENT STATUS
                </h3>
                <div className="space-y-1">
                  {[
                    "All",
                    "PENDING",
                    "ACCEPTED",
                    "REJECTED",
                    "PREPARE_FOR_DELIVERY",
                    "DELIVERED",
                    "CANCELLED",
                  ].map((statusItem) => (
                    <div
                      key={statusItem}
                      onClick={() => setFilterStatus(statusItem)}
                      className={`
                        cursor-pointer px-2 py-1.5 rounded text-sm
                        ${filterStatus === statusItem ? "bg-blue-500 text-white font-medium" : "hover:bg-theme-bg text-white"}
                      `}
                    >
                      <div className="flex items-center">
                        <span
                          className={`w-4 h-4 rounded-full border mr-2 flex items-center justify-center ${filterStatus === statusItem ? "border-white" : "border-white"}`}
                        >
                          {filterStatus === statusItem && (
                            <span className="w-2 h-2 rounded-full bg-white"></span>
                          )}
                        </span>
                        {statusItem
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0) + word.slice(1).toLowerCase(),
                          )
                          .join(" ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {isError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-center p-4 rounded-lg mb-4">
                <p>Error fetching assignments: {message}</p>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loading width="sidebar" />
              </div>
            ) : filteredAssignments.length > 0 ? (
              <div className="space-y-4">
                {filteredAssignments.map((assignment) => (
                  <div
                    key={assignment._id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="bg-theme-bg2 px-4 py-3 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <p className="text-sm text-white">
                          ASSIGNED: {formatDate(assignment.assignedAt)}
                        </p>
                        <p className="text-xs text-white mt-1">
                          ASSIGNMENT ID: #{assignment._id}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <span
                          className={`inline-flex text-xs px-2 py-1 rounded-full bg-theme-bg ${getStatusColor(assignment.acceptStatus)}`}
                        >
                          {getStatusText(assignment.acceptStatus)}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-theme-bg2 text-white">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-shrink-0">
                          <img
                            src={
                              assignment.order?.products?.[0]?.image?.[0] ||
                              assignment.order?.auction?.[0]?.image?.[0] ||
                              assignment.order?.fleetAuction?.[0]?.image?.[0] ||
                              "/placeholder.jpg"
                            }
                            alt={
                              assignment.order?.products?.[0]?.name ||
                              assignment.order?.auction?.[0]?.name ||
                              assignment.order?.fleetAuction?.[0]?.name ||
                              "Item Image"
                            }
                            className="w-24 h-24 object-contain rounded"
                            onError={(e) => {
                              e.target.src = "/placeholder.jpg";
                            }}
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 mb-1">
                            {assignment.order?.products?.[0]?.productId?.name ||
                              assignment.order?.auction?.[0]?.name ||
                              assignment.order?.fleetAuction?.[0]?.name ||
                              "N/A"}
                          </h3>
                          <p className="text-white text-sm">
                            Quantity:{" "}
                            {assignment.order?.products?.[0]?.quantity ||
                              assignment.order?.auction?.[0]?.quantity ||
                              assignment.order?.fleetAuction?.[0]?.quantity ||
                              "N/A"}
                          </p>
                          <p className="text-white font-medium mt-1">
                            {currency}&nbsp;
                            {assignment?.order?.fleetAuction?.[0]?.price ??
                              "N/A"}
                          </p>
                          <p className="text-white text-sm mt-1">
                            Type: Wrapper Assignment
                          </p>
                          <div className="mt-3">
                            <div
                              className={`flex items-center text-sm ${getStatusColor(assignment.status)}`}
                            >
                              {assignment.status === "DELIVERED" ? (
                                <MdDeliveryDining className="mr-1" />
                              ) : assignment.status ===
                                "PREPARE_FOR_DELIVERY" ? (
                                <MdLocalShipping className="mr-1" />
                              ) : assignment.status === "CANCELLED" ? (
                                <BsBoxSeam className="mr-1" />
                              ) : (
                                <MdPending className="mr-1" />
                              )}
                              {getStatusText(assignment.status)}
                              {assignment.status === "CANCELLED" && (
                                <p className="text-sm text-gray-400 ml-2">
                                  This assignment was cancelled
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 mt-3 md:mt-0">
                          <button
                            onClick={() => {
                              navigate(
                                `/user-profile/wrapper-order-details/${assignment.order._id}`,
                              );
                            }}
                            className="px-4 py-2 bg-theme-bg text-white rounded-md text-sm hover:bg-opacity-90 transition-colors flex items-center justify-center"
                          >
                            <FaEye className="mr-1" /> View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center bg-theme-bg2 rounded-lg shadow-sm border p-8">
                <FaBox className="text-white text-5xl mb-4" />
                <p className="text-white text-lg">No assignments found.</p>
                <p className="text-white text-sm mt-2">
                  Looks like you haven't been assigned any orders yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WrapperOrders;
