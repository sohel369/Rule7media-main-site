import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserCountry } from "../store/countary/countrySlice";
import {
  getsingleassignmentsorder,
  updateAssignment,
} from "../store/wrapperassignorders/wrapperassignorderSlice";
import { downloadInvoiceService } from "../store/order/OrderSlice";
import { FaDownload, FaEye, FaTimes } from "react-icons/fa";

const OrderDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [zoomedImage, setZoomedImage] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const { country, currency } = useSelector((state) => state.country);

  const { singleAssignment, isLoading, isError, message } = useSelector(
    (state) => state.wrappers,
  );

  useEffect(() => {
    if (id) {
      dispatch(getsingleassignmentsorder(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  // Store order data when first loaded
  useEffect(() => {
    if (singleAssignment && singleAssignment.order && !orderData) {
      setOrderData(singleAssignment.order);
    }
  }, [singleAssignment, orderData]);

  const handleAction = async (assignmentId, acceptStatus) => {
    await dispatch(updateAssignment({ assignmentId, acceptStatus }));
    // Re-fetch to get updated data
    dispatch(getsingleassignmentsorder(id));
  };

  const handleStatusChange = async (assignmentId, status) => {
    await dispatch(updateAssignment({ assignmentId, status }));
    // Re-fetch to get updated data
    dispatch(getsingleassignmentsorder(id));
  };

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const handleImageClick = (img) => {
    setZoomedImage(typeof img === "string" ? img : img.url);
  };

  const closeModal = () => {
    setZoomedImage(null);
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const resultAction = await dispatch(downloadInvoiceService({ orderId }));
      if (downloadInvoiceService.fulfilled.match(resultAction)) {
        const { blob } = resultAction.payload;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error(resultAction.error.message || "Failed to download");
      }
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ACCEPTED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "DELIVERED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "UNASSIGNED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
      case "UNASSIGNED":
        return "Unassigned";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-100">
        <div className="text-gray-600 text-xl font-medium animate-pulse text-center">
          Loading order details...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 text-red-700 rounded-xl p-6 shadow-lg">
          {message || "Failed to load order"}
        </div>
      </div>
    );
  }

  if (!singleAssignment || !singleAssignment.order) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-red-600 text-xl">
          Order not found or not assigned yet
        </p>
        <button
          onClick={() => navigate("/user-profile/wrapper-orders")}
          className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const assignment = singleAssignment;
  const order = singleAssignment.order || orderData;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-theme-bg rounded-xl shadow-lg ">
      <h2 className="text-2xl font-bold text-white mb-4">
        Order Details #{order._id.slice(-6)}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-theme-bg2 p-4 rounded-lg">
          <h3 className="font-semibold text-white text-lg mb-3">Order Info</h3>
          <p className="text-sm text-white mb-2">
            <span className="font-medium">Order ID:</span> #
            {order._id.slice(-6)}
          </p>
          <p className="text-sm text-white mb-2">
            <span className="font-medium">Wrap Type:</span>&nbsp;
            {capitalize(order.fleetAuction?.[0]?.wrapType || "N/A")}
          </p>
          <p className="text-sm text-white mb-2">
            <span className="font-medium">Total Price:</span> {currency}&nbsp;
            {order.fleetAuction?.[0]?.price ?? "N/A"}
          </p>
          <p className="text-sm text-white mb-2">
            <span className="font-medium">Payment Status:</span>{" "}
            <span
              className={
                order.paymentStatus === "PAID" ? "text-white" : "text-white"
              }
            >
              {capitalize(order.paymentStatus)}
            </span>
          </p>
          <p className="text-sm text-white">
            <span className="font-medium">Payment Method:</span>{" "}
            {capitalize(order.paymentMethod) || "N/A"}
          </p>
        </div>

        <div className="bg-theme-bg2 p-4 rounded-lg">
          <h3 className="font-semibold text-white text-lg mb-3">
            Assignment Info
          </h3>
          <p className="text-sm text-white mb-2">
            <span className="font-medium">Assignment ID:</span> #
            {assignment._id.slice(-6)}
          </p>
          <p className="text-sm text-white mb-2">
            <span className="font-medium">Assigned At:</span>{" "}
            {new Date(assignment.assignedAt).toLocaleString()}
          </p>
          <p className="text-sm text-white mb-2">
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs bg-theme-bg text-white ${getStatusColor(
                assignment.status,
              )}`}
            >
              {getStatusText(assignment.status)}
            </span>
          </p>
          <p className="text-sm text-white">
            <span className="font-medium">Accept Status:</span>{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs bg-theme-bg text-white ${getStatusColor(
                assignment.acceptStatus,
              )}`}
            >
              {getStatusText(assignment.acceptStatus)}
            </span>
          </p>
        </div>
      </div>

      {order.fleetAuction && order.fleetAuction.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-4 border-b pb-2">
            Fleet Auction Details
          </h3>
          <div className="space-y-4">
            {order.fleetAuction.map((fleet, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-theme-bg2">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-white text-white">
                    {capitalize(fleet.fleetAuctionId?.name) || "Service Body"}
                  </h4>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {currency}&nbsp;
                      {fleet.price}
                    </p>
                    <p className="text-xs text-white">Qty: {fleet.quantity}</p>
                  </div>
                </div>
                {fleet.fleetAuctionId?.description &&
                  fleet.fleetAuctionId.description !==
                    "No description available." && (
                    <p className="text-sm text-white mb-3">
                      {fleet.fleetAuctionId.description}
                    </p>
                  )}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-white mb-1">
                      <span className="font-medium">Vehicle:</span>
                    </p>
                    <p className="text-sm text-white">
                      {capitalize(fleet.fleetAuctionId?.vehicleManufacturer) ||
                        "N/A"}{" "}
                      {capitalize(fleet.fleetAuctionId?.vehicleModel) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white mb-1">
                      <span className="font-medium">Year:</span>
                    </p>
                    <p className="text-sm text-white">
                      {fleet.fleetAuctionId?.yearofmanufacturer || "N/A"}
                    </p>
                    <p className="text-xs font-medium text-white mb-2">
                      Vehicle Images:
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {fleet.fleetAuctionId?.images?.map((img, i) => (
                        <img
                          key={i}
                          src={typeof img === "string" ? img : img.url}
                          alt="Fleet Vehicle"
                          className="w-24 h-16 sm:w-28 sm:h-20 object-cover rounded-md border shadow-sm cursor-pointer hover:opacity-80 transition-opacity duration-300"
                          onClick={() => handleImageClick(img)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {order.address && (
        <div className="bg-theme-bg2 p-4 rounded-lg">
          <h3 className="font-semibold text-white text-lg mb-3">
            Delivery Address
          </h3>
          <p className="text-sm text-white mb-1">
            {capitalize(order.address.firstName)}{" "}
            {capitalize(order.address.lastName)} ({order.address.mobile})
          </p>
          <p className="text-sm text-white">
            {capitalize(order.address.street)}, {capitalize(order.address.city)}
            , {capitalize(order.address.state)} - {order.address.pincode}
          </p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        {assignment.acceptStatus === "PENDING" ? (
          <>
            <button
              onClick={() => handleAction(assignment._id, "ACCEPTED")}
              className="bg-theme-bg2 hover:bg-theme-bg  text-white px-4 py-2 rounded-md text-sm transition-all duration-300"
            >
              Accept
            </button>
            <button
              onClick={() => handleAction(assignment._id, "REJECTED")}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-all duration-300"
            >
              Reject
            </button>
          </>
        ) : (
          <div className="flex gap-3 items-center">
            <span
              className={`px-2 py-1 rounded-full text-sm font-medium bg-theme-bg2 text-white ${getStatusColor(
                assignment.acceptStatus,
              )}`}
            >
              {getStatusText(assignment.acceptStatus)}
            </span>
            {assignment.acceptStatus === "ACCEPTED" && (
              <select
                value={assignment.status}
                onChange={(e) =>
                  handleStatusChange(assignment._id, e.target.value)
                }
                className="text-sm px-3 py-2 rounded-md bg-theme-bg2 text-white border border-black shadow-sm focus:border-blue-500 focus:outline-none min-w-[150px]"
              >
                <option value="PENDING">Pending</option>
                <option value="PREPARE_FOR_DELIVERY">Prepare</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => navigate("/user-profile/wrapper-orders")}
          className="px-4 py-2 border border-gray-300 text-white rounded-md hover:bg-theme-bg2 transition-colors"
        >
          Back to Orders
        </button>
        <button
          onClick={() => handleDownloadInvoice(order._id)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FaDownload size={14} /> Invoice
        </button>
      </div>

      {zoomedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-3xl w-full p-4">
            <img
              src={zoomedImage}
              alt="Zoomed Vehicle"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-900 transition-all duration-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
