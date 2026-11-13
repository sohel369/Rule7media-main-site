import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrdersbyUserIdAsync } from "../store/order/OrderSlice";
import { useLocation } from "react-router-dom";
import { IoIosCart } from "react-icons/io";
import {
  FaStar,
  FaChevronLeft,
  FaDownload,
  FaFilter,
  FaBox,
  FaCommentAlt,
} from "react-icons/fa";
import { MdLocalShipping, MdDeliveryDining, MdPending } from "react-icons/md";
import { BsCreditCard, BsBoxSeam } from "react-icons/bs";
import Loading from "./Loading";
import { downloadInvoiceService } from "../store/order/OrderSlice";
import ChatWidget from "./chatwidget";
import { fetchUserCountry } from "../store/countary/countrySlice";
import { FooterLeaderboard, HeaderLeaderboard } from "./AdSlots";
const MyOrder = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { orders, status, error } = useSelector((state) => state.order);

  const { user } = useSelector((state) => state.auth);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [filterStatus, setFilterStatus] = useState("All");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const { country, currency } = useSelector((state) => state.country);
  const userId = user?._id;

  useEffect(() => {
    if (location.state?.defaultFilter) {
      setFilterStatus(location.state.defaultFilter);
    }
  }, [location.state]);
  useEffect(() => {
    if (userId) {
      dispatch(fetchOrdersbyUserIdAsync(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const displayedOrders =
    filterStatus === "All"
      ? orders
      : orders.filter((order) => {
          const statusMap = {
            Delivered: "DELIVERED",
            Pending: "PENDING",
            Preparing: "PREPARE_FOR_DELIVERY",
            DELIVERED: "DELIVERED",
            PAID: "PAID",
            UNPAID: "UNPAID",
          };

          const compareStatus = statusMap[filterStatus] || filterStatus;

          if (filterStatus === "PAID" || filterStatus === "UNPAID") {
            return order.paymentStatus === compareStatus;
          }

          return order.status === compareStatus;
        });

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
  function capitalizeWords(str) {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  // Order status tracking mapper
  const getOrderStatusStep = (status) => {
    switch (status) {
      case "DELIVERED":
        return 4;
      case "PREPARE_FOR_DELIVERY":
        return 3;
      case "PENDING":
        return 2;
      default:
        return 1;
    }
  };

  const formatDate = (dateString) => {
    const options = { month: "short", day: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div className="bg-theme-bg min-h-screen w-full text-white rounded-2xl">
      {/* Top header with title */}
      <div className="bg-theme-bg2 text-white px-4 py-3 shadow-md rounded-2xl">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center">
            <IoIosCart className="mr-2 text-2xl" /> My Orders
          </h1>
          <HeaderLeaderboard />
          <button
            className="md:hidden flex items-center text-sm bg-white bg-opacity-20 rounded-full px-3 py-1"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          >
            <FaFilter className="mr-1" /> Filters
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Mobile filter toggle */}
          {isMobileFilterOpen && (
            <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end">
              <div className="bg-white rounded-t-xl w-full p-4 animate-slide-up">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Filters</h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="text-gray-500"
                  >
                    ×
                  </button>
                </div>

                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    ORDER STATUS
                  </h4>
                  <div className="space-y-2">
                    {[
                      "All",
                      "PENDING",
                      "PREPARE_FOR_DELIVERY",
                      "DELIVERED",
                      "PAID",
                      "UNPAID",
                    ].map((statusItem) => (
                      <div
                        key={statusItem}
                        onClick={() => {
                          setFilterStatus(statusItem);
                          setIsMobileFilterOpen(false);
                        }}
                        className={`
                          cursor-pointer px-3 py-2 rounded-md
                          ${
                            filterStatus === statusItem
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "hover:bg-gray-50 text-gray-600"
                          }
                        `}
                      >
                        <div className="flex items-center">
                          <span
                            className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
                              filterStatus === statusItem
                                ? "border-blue-600"
                                : "border-gray-300"
                            }`}
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

          {/* Desktop Sidebar filter */}
          <aside className="hidden md:block w-64 sticky top-4 h-fit">
            <div className="bg-theme-bg2 rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center mb-4">
                <FaFilter className="text-white mr-2" />
                <h2 className="font-bold text-white">Filters</h2>
              </div>

              <div className="border-t pt-3">
                <h3 className="font-medium text-sm text-white mb-2">
                  ORDER STATUS
                </h3>
                <div className="space-y-1">
                  {[
                    "All",
                    "PENDING",
                    "PREPARE_FOR_DELIVERY",
                    "DELIVERED",
                    "PAID",
                    "UNPAID",
                  ].map((statusItem) => (
                    <div
                      key={statusItem}
                      onClick={() => setFilterStatus(statusItem)}
                      className={`
        cursor-pointer px-3 py-2 rounded-lg text-sm transition-all duration-200
        ${
          filterStatus === statusItem
            ? "bg-blue-600 text-white font-semibold shadow-sm"
            : "hover:bg-blue-600 text-white"
        }
      `}
                    >
                      <div className="flex items-center gap-3">
                        {/* Custom Radio Button Circle */}
                        <div
                          className={`
            w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
            ${
              filterStatus === statusItem
                ? "border-white"
                : "border-white hover:border-white"
            }
          `}
                        >
                          {filterStatus === statusItem && (
                            <div className="w-3 h-3 rounded-full bg-white animate-in fade-in zoom-in duration-200" />
                          )}
                        </div>

                        {/* Status Label */}
                        <span className="select-none">
                          {statusItem === "All"
                            ? "All"
                            : statusItem
                                .replace(/_/g, " ")
                                .toLowerCase()
                                .replace(/\b\w/g, (char) => char.toUpperCase())}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Orders List Section */}
          <div className="flex-1">
            {/* {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-center p-4 rounded-lg mb-4">
                {typeof error !== "object" && (
                  <p>Error fetching orders: {error}</p>
                )}
              </div>
            )} */}

            {status === "loading" ? (
              <div className="flex justify-center items-center h-40">
                <Loading width="sidebar" />
              </div>
            ) : Array.isArray(displayedOrders) && displayedOrders.length > 0 ? (
              <div className="space-y-4">
                {displayedOrders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Order header */}
                    <div className="bg-theme-bg2 px-4 py-3 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <p className="text-sm text-white">
                          ORDER PLACED: {formatDate(order.createdAt)}
                        </p>
                        <p className="text-xs text-white mt-1">
                          ORDER ID: #
                          {order._id ? order._id.substring(0, 8) : "N/A"}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <span
                          className={`inline-flex text-xs px-2 py-1 rounded-full ${
                            order.paymentStatus === "PAID"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Order content */}
                    <div className="p-4 bg-theme-bg2 text-white">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-shrink-0">
                          <img
                            src={
                              order.products?.[0]?.image?.[0] ||
                              order.auction?.[0]?.image?.[0] ||
                              order.fleetAuction?.[0]?.image?.[0] ||
                              "/placeholder.jpg"
                            }
                            alt={
                              order.products?.[0]?.name ||
                              order.auction?.[0]?.name ||
                              order.fleetAuction?.[0]?.name ||
                              "Product Image"
                            }
                            className="w-24 h-24 object-contain rounded"
                            onError={(e) => {
                              e.target.src = "/placeholder.jpg";
                            }}
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium text-white mb-1">
                            {order.products?.[0]?.productId?.name ||
                              order.auction?.[0]?.name ||
                              order.fleetAuction?.[0]?.name ||
                              "N/A"}
                          </h3>

                          <p className="text-white text-sm">
                            Quantity:{" "}
                            {order.products?.[0]?.quantity ||
                              order.auction?.[0]?.quantity ||
                              order.fleetAuction?.[0]?.quantity || // Add this line
                              "N/A"}
                          </p>
                          <p className="text-white font-medium mt-1">
                            {currency}
                            {order.products?.[0]?.price ||
                              order.auction?.[0]?.price ||
                              order.fleetAuction?.[0]?.price || // Add this line
                              "N/A"}
                          </p>

                          {/* Delivery status info */}
                          <div className="mt-3">
                            <div
                              className={`flex items-center text-sm ${
                                order.status === "DELIVERED"
                                  ? "text-green-600"
                                  : order.status === "PREPARE_FOR_DELIVERY"
                                    ? "text-blue-600"
                                    : "text-orange-600"
                              }`}
                            >
                              {order.status === "DELIVERED" ? (
                                <MdDeliveryDining className="mr-1" />
                              ) : order.status === "PREPARE_FOR_DELIVERY" ? (
                                <MdLocalShipping className="mr-1" />
                              ) : (
                                <MdPending className="mr-1" />
                              )}
                              {order.status === "DELIVERED"
                                ? `Delivered on ${formatDate(order.updatedAt)}`
                                : order.status === "PREPARE_FOR_DELIVERY"
                                  ? "Preparing for delivery"
                                  : order.status}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 mt-3 md:mt-0">
                          <button
                            onClick={() => handleOrderClick(order)}
                            className="px-4 py-2  border border-gray-300 bg-theme-bg text-white rounded-md text-sm hover:bg-opacity-90 transition-colors"
                          >
                            View Order Details
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadInvoice(order._id);
                            }}
                            className="px-4 py-2 border bg-theme-bg border-gray-300 text-white rounded-md text-sm hover:bg-theme-bg2 transition-colors flex items-center justify-center"
                          >
                            <FaDownload className="mr-1" /> Invoice
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
                <p className="text-white text-lg">No orders found.</p>
                <p className="text-white text-sm mt-2">
                  Looks like you haven't placed any orders yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex  justify-center z-50 p-4 ml-16">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-lg shadow-xl overflow-hidden flex flex-col">
            {/* Modal header */}
            <div className="bg-theme-bg px-6  text-white py-4 border-b flex items-center justify-between">
              <button
                className="text-white  hover:text-white flex items-center gap-1"
                onClick={handleCloseModal}
              >
                <FaChevronLeft className="text-sm" /> Back to Orders
              </button>
              <div className="text-sm ">
                <span className="text-white">ORDER ID:</span> #
                {selectedOrder._id}
              </div>
            </div>

            <div className="overflow-y-auto p-6 flex-1 bg-theme-bg2">
              {/* Order status tracker */}
              <div className="mb-8">
                <h3 className="font-medium text-white mb-4">Order Status</h3>
                <div className="relative">
                  {/* Progress bar */}
                  <div className="h-1 bg-gray-200 absolute top-5 left-0 right-0 z-0">
                    <div
                      className="h-1 bg-green-500 absolute top-0 left-0 transition-all duration-500"
                      style={{
                        width: `${(getOrderStatusStep(selectedOrder.status) / 4) * 100}%`,
                      }}
                    ></div>
                  </div>

                  {/* Status steps */}
                  <div className="flex justify-between relative z-10">
                    {["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"].map(
                      (statusText, index) => {
                        const step = index + 1;
                        const isCompleted =
                          getOrderStatusStep(selectedOrder.status) >= step;
                        const isCurrent =
                          getOrderStatusStep(selectedOrder.status) === step;

                        return (
                          <div
                            key={statusText}
                            className="flex flex-col items-center"
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center 
                      ${isCompleted ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}
                            >
                              {index === 0 && <BsCreditCard />}
                              {index === 1 && <FaStar />}
                              {index === 2 && <MdLocalShipping />}
                              {index === 3 && <BsBoxSeam />}
                            </div>
                            <span
                              className={`text-xs mt-2 ${isCurrent ? "font-medium text-white" : "text-white"}`}
                            >
                              {statusText}
                            </span>
                            {(isCurrent || isCompleted) && (
                              <span className="text-xs text-gray-400">
                                {index === 0 &&
                                  formatDate(selectedOrder.createdAt)}
                                {index === 3 &&
                                  selectedOrder.status === "DELIVERED" &&
                                  formatDate(selectedOrder.updatedAt)}
                              </span>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Product and Shipping Details */}
                <div className="md:col-span-2 space-y-6">
                  {/* Product Details */}
                  <div className="bg-theme-bg border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-3">
                      Product Details
                    </h3>
                    <div className="flex gap-4">
                      <img
                        src={
                          selectedOrder.products?.[0]?.image?.[0] ||
                          selectedOrder.auction?.[0]?.image?.[0] ||
                          selectedOrder.fleetAuction?.[0]?.image?.[0] ||
                          "/placeholder.jpg"
                        }
                        alt="Product"
                        className="w-20 h-20 object-contain rounded"
                        onError={(e) => {
                          e.target.src = "/placeholder.jpg";
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-white">
                          {selectedOrder.products?.[0]?.name ||
                            selectedOrder.auction?.[0]?.name ||
                            selectedOrder.fleetAuction?.[0]?.name ||
                            "Product Name"}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div>
                            <p className="text-white">Quantity:</p>
                            <p className="text-white">
                              {selectedOrder.products?.[0]?.quantity ||
                                selectedOrder.auction?.[0]?.quantity ||
                                selectedOrder.fleetAuction?.[0]?.quantity ||
                                "1"}
                            </p>
                          </div>
                          <div>
                            <p className="text-white">Price:</p>
                            <p className="text-white font-medium">
                              {currency}
                              {selectedOrder.products?.[0]?.price ||
                                selectedOrder.auction?.[0]?.price ||
                                selectedOrder.fleetAuction?.[0]?.price ||
                                "0.00"}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-white font-medium mt-2">
                              Description:{" "}
                              {selectedOrder.description ||
                                selectedOrder.fleetAuction?.[0]?.wrapType ||
                                selectedOrder.auction?.[0]?.description ||
                                selectedOrder.products?.[0]?.description ||
                                "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Details */}
                  <div className="bg-theme-bg border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-3">
                      Shipping Details
                    </h3>
                    <div className="text-white space-y-1">
                      <p className="font-medium">
                        {selectedOrder.address?.firstName}{" "}
                        {selectedOrder.address?.lastName}
                      </p>
                      <p>{selectedOrder.address?.street}</p>
                      <p>
                        {selectedOrder.address?.city},{" "}
                        {selectedOrder.address?.state} -{" "}
                        {selectedOrder.address?.pincode}
                      </p>
                      <p>
                        Phone:{" "}
                        {selectedOrder.address?.mobile ||
                          selectedOrder.address?.phone}
                      </p>
                      <p>
                        Email:{" "}
                        {selectedOrder.user?.email ||
                          user?.email ||
                          "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Summary and Actions */}
                <div className="space-y-6">
                  {/* Payment Details */}
                  {/* Payment Details */}
                  <div className="bg-theme-bg border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-3">
                      Payment Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white">Method</span>
                        {/* ----  CAPITALISED  ---- */}
                        <span className="font-medium text-white uppercase">
                          {selectedOrder.paymentMethod || "ONLINE PAYMENT"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white">Status</span>
                        <span
                          className={`font-medium ${
                            selectedOrder.paymentStatus === "PAID"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {selectedOrder.paymentStatus || "PENDING"}
                        </span>
                      </div>
                      {selectedOrder.transactionId && (
                        <div className="flex justify-between">
                          <span className="text-white">Transaction ID</span>
                          <span className="font-mono text-sm">
                            {selectedOrder.transactionId.slice(-8)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-theme-bg border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-3">
                      Price Breakdown
                    </h3>
                    <div className="space-y-2 text-sm">
                      {/* Subtotal */}
                      <div className="flex justify-between">
                        <span className="text-white">Subtotal</span>
                        <span className="text-white">
                          {currency}
                          {(
                            (selectedOrder.products?.[0]?.price ||
                              selectedOrder.auction?.[0]?.price ||
                              selectedOrder.fleetAuction?.[0]?.price ||
                              0) *
                            (selectedOrder.products?.[0]?.quantity ||
                              selectedOrder.auction?.[0]?.quantity ||
                              selectedOrder.fleetAuction?.[0]?.quantity ||
                              1)
                          ).toFixed(2)}
                        </span>
                      </div>

                      {/* Processing Fee */}
                      <div className="flex justify-between">
                        <span className="text-white">Processing Fee </span>
                        <span className="text-white">
                          {currency}
                          {selectedOrder.commissionDetails?.buyerCharge?.toFixed(
                            2,
                          ) || "0.00"}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-200 my-2"></div>

                      {/* Total */}
                      <div className="flex justify-between">
                        <span className="text-white font-medium">
                          Grand Total
                        </span>
                        <span className="text-white font-medium">
                          {currency}
                          {(
                            (selectedOrder.products?.[0]?.price ||
                              selectedOrder.auction?.[0]?.price ||
                              selectedOrder.fleetAuction?.[0]?.price ||
                              0) *
                              (selectedOrder.products?.[0]?.quantity ||
                                selectedOrder.auction?.[0]?.quantity ||
                                selectedOrder.fleetAuction?.[0]?.quantity ||
                                1) +
                            (selectedOrder.commissionDetails?.buyerCharge || 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => handleDownloadInvoice(selectedOrder._id)}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FaDownload /> Download Invoice
                    </button>

                    <button
                      onClick={() => setChatOpen(true)}
                      className="w-full flex items-center justify-center gap-2 border border-gray-300 text-white py-2.5 rounded-md hover:bg-theme-bg transition-colors"
                    >
                      <FaCommentAlt /> Contact Support
                    </button>

                    {selectedOrder.status === "DELIVERED" && (
                      <button
                        onClick={() => navigate(`/review/${selectedOrder._id}`)}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-md hover:bg-green-700 transition-colors"
                      >
                        <FaStar /> Leave Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      {chatOpen && <ChatWidget isOpen={chatOpen} setIsOpen={setChatOpen} />}
      <FooterLeaderboard />
    </div>
  );
};

export default MyOrder;
