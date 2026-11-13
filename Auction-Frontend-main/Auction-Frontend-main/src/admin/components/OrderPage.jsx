import React, { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrdersAsync,
  fetchOrdersSummaryAsync,
  adminUpdateOrderStatus,
} from "../../store/order/OrderSlice";
import { fetchCommission } from "../../store/commission/commissionSlice";
import {
  FaEye,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaTruck,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaCreditCard,
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaTimes,
  FaUser,
  FaStore,
  FaUserTie,
} from "react-icons/fa";
import { messaging, generateToken, onMessageListener } from "../../firebase";
import socket from "../../socket";
import { fetchUserCountry } from "../../store/countary/countrySlice";
import { useNavigate } from "react-router-dom";

const OrderPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    orders: ordersResponse,
    status,
    error,
    ordersSummary,
    summaryStatus,
  } = useSelector((state) => state.order);
  const orders = ordersResponse?.orders || [];

  const totalPages = ordersResponse?.totalPages || 1;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const lastDispatchedPage = useRef(null);
  const { country, currency } = useSelector((state) => state.country);

  const { commission } = useSelector((state) => state.commission);

  // Add local state for orders to handle immediate updates
  const [localOrders, setLocalOrders] = useState([]);
  const [updatingOrders, setUpdatingOrders] = useState(new Set());

  // Update local orders when Redux orders change
  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);
  useEffect(() => {
    dispatch(fetchCommission());
  }, []);
  const filteredOrders = useMemo(() => {
    if (filterStatus === "ALL") return localOrders;
    return localOrders.filter((order) => order.status === filterStatus);
  }, [localOrders, filterStatus]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  useEffect(() => {
    generateToken()
      .then((token) => {
        if (token);
      })
      .catch((error) => console.error("Error generating token:", error));

    onMessageListener().then((payload) => {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("New Notification", {
          body: payload.notification.body,
          icon: "/path/to/icon.png",
        });
      }
    });
  }, []);

  useEffect(() => {
    if (lastDispatchedPage.current !== currentPage) {
      dispatch(fetchOrdersAsync(currentPage));
      lastDispatchedPage.current = currentPage;
    }
    dispatch(fetchOrdersSummaryAsync())
      .unwrap()
      .then((summary) => {});
  }, [currentPage, dispatch]);

  const handleCloseModal = () => setSelectedOrder(null);

  const handleStatusChange = async (orderId, newStatus) => {
    const order = localOrders.find((order) => order._id === orderId);
    if (!order || !order.userId) return;

    // Add orderId to updating set
    setUpdatingOrders((prev) => new Set([...prev, orderId]));

    // Optimistic update - immediately update local state
    setLocalOrders((prevOrders) =>
      prevOrders.map((o) =>
        o._id === orderId ? { ...o, status: newStatus } : o,
      ),
    );

    // Update selected order if it's the one being changed
    if (selectedOrder && selectedOrder._id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
    }

    try {
      const fcmToken = await generateToken();
      if (!fcmToken) {
        // Revert optimistic update if no FCM token
        setLocalOrders((prevOrders) =>
          prevOrders.map((o) =>
            o._id === orderId
              ? { ...o, status: order.status } // revert to original status
              : o,
          ),
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, status: order.status }));
        }
        setUpdatingOrders((prev) => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });
        return;
      }

      await dispatch(
        adminUpdateOrderStatus({ orderId, status: newStatus, fcmToken }),
      ).unwrap();

      // Emit socket event for real-time updates
      socket.emit("orderStatusUpdate", {
        userId: order.userId._id.toString(),
        orderId,
        message: `Your order has been marked as '${newStatus}'`,
        status: newStatus,
        fcmToken,
      });

      // Refresh data from server to ensure consistency
      await Promise.all([
        dispatch(fetchOrdersAsync(currentPage)),
        dispatch(fetchOrdersSummaryAsync()),
      ]);
    } catch (err) {
      console.error("API Error:", err);

      // Revert optimistic update on error
      setLocalOrders((prevOrders) =>
        prevOrders.map((o) =>
          o._id === orderId
            ? { ...o, status: order.status } // revert to original status
            : o,
        ),
      );

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: order.status }));
      }

      // Show error message to user
      alert("Failed to update order status. Please try again.");
    } finally {
      // Remove orderId from updating set
      setUpdatingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const capitalizeFirstLetter = (str) => {
    if (!str) return "N/A";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const parseLocation = (location) => {
    if (!location) return { city: "N/A", state: "N/A" };
    if (location.city && location.state) {
      return {
        city: capitalizeFirstLetter(location.city),
        state: capitalizeFirstLetter(location.state),
      };
    }
    if (location.name) {
      const parts = location.name.split(", ").map((part) => part.trim());
      let city = "N/A";
      let state = "N/A";
      if (parts.length >= 3) {
        city = parts[1] || parts[2] || "N/A";
        state = parts[parts.length - 2] || "N/A";
      }
      return {
        city: capitalizeFirstLetter(city),
        state: capitalizeFirstLetter(state),
      };
    }
    return { city: "N/A", state: "N/A" };
  };

  const getStatusColor = (status, isFocused = false) => {
    if (isFocused) return "border-blue-500 ring-2 ring-blue-300";
    switch (status) {
      case "DELIVERED":
        return "border-green-500";
      case "PENDING":
        return "border-yellow-500";
      case "PREPARED_FOR_DELIVERY":
        return "border-blue-500";
      case "Cancle":
        return "border-red-500";
      default:
        return "border-gray-300";
    }
  };

  const getOrderType = (order) => {
    if (order.fleetAuction?.length > 0) return "Fleet Auction";
    if (order.auction?.length > 0) return "Auction";
    if (order.products?.length > 0) return "Product";
    return "Unknown";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sellerRate = useMemo(() => {
    if (!commission) return null;

    const mapping = {
      3: "threeMonth",
      6: "sixMonth",
      12: "twelveMonth",
    };

    if (selectedOrder?.seller?.subscription) {
      const months = selectedOrder.seller.subscription.durationMonths;
      const key = mapping[months];
      if (key && commission[key]) return commission[key];
    }

    if (selectedOrder?.fleetOwner?.subscription) {
      const months = selectedOrder.fleetOwner.subscription.durationMonths;
      const key = mapping[months];
      if (key && commission[key]) return commission[key];
    }

    return null;
  }, [selectedOrder, commission]);

  const BuyerRate = useMemo(() => {
    if (!commission) return null;

    const mapping = {
      3: "threeMonth",
      6: "sixMonth",
      12: "twelveMonth",
    };

    if (selectedOrder?.userId?.subscription) {
      const months = selectedOrder.userId.subscription.durationMonths;
      const key = mapping[months];
      if (key && commission[key]) return commission[key];
    }

    if (selectedOrder?.advertiser?.subscription) {
      const months = selectedOrder.advertiser.subscription.durationMonths;
      const key = mapping[months];
      if (key && commission[key]) return commission[key];
    }

    return null;
  }, [selectedOrder, commission]);

  if (status === "loading" && !localOrders.length) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        Loading orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-600">
        Error: {error.message || "Failed to load orders"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg rounded-2xl p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">
        Orders Dashboard
      </h1>

      {/* Summary Cards */}
      {summaryStatus === "loading" ? (
        <div className="flex justify-center items-center h-32 text-white">
          Loading summary...
        </div>
      ) : (
        <div className="grid grid-cols-2 text-white sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
          {[
            {
              status: "ALL",
              icon: FaClipboardList,
              label: "Total Orders",
              count: ordersSummary?.totalOrders || 0,
              color: "bg-theme-bg2",
            },
            {
              status: "DELIVERED",
              icon: FaCheckCircle,
              label: "Delivered",
              count: ordersSummary?.deliveredOrders || 0,
              color: "bg-theme-bg2",
            },
            {
              status: "PENDING",
              icon: FaClock,
              label: "Pending",
              count: ordersSummary?.pendingOrders || 0,
              color: "bg-theme-bg2",
            },
            {
              status: "Cancle",
              icon: FaTimesCircle,
              label: "Cancelled",
              count: ordersSummary?.CancleOrders || 0,
              color: "bg-theme-bg2",
            },
            {
              status: "PREPARED_FOR_DELIVERY",
              icon: FaTruck,
              label: "Prepared",
              count: ordersSummary?.preparedOrders || 0,
              color: "bg-theme-bg2",
            },
          ].map(({ status, icon: Icon, label, count, color }) => (
            <div
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`p-4 rounded-lg ${color} cursor-pointer transition-all duration-200 flex items-center space-x-3 shadow-sm ${filterStatus === status ? "ring-2 ring-offset-6 ring-white" : ""}`}
            >
              <Icon className="text-2xl text-white" />
              <div>
                <h2 className="text-sm font-semibold text-white">{label}</h2>
                <span className="text-xl font-bold text-white">{count}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        {filteredOrders.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead className="bg-theme-bg2 text-white font-semibold">
              <tr>
                <th className="p-4 text-sm">Order ID</th>
                <th className="p-4 text-sm">Order Date</th>
                <th className="p-4 text-sm">Product Name</th>
                <th className="p-4 text-sm">Quantity</th>
                <th className="p-4 text-sm">Status</th>
                <th className="p-4 text-sm">Total Price</th>
                <th className="p-4 text-sm text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-theme-bg2">
              {filteredOrders.map((order, index) => (
                <tr
                  key={order._id}
                  className={`border-b ${index % 2 === 0 ? "bg-theme-bg2" : "bg-theme-bg2"} hover:bg-theme-bg text-white transition-colors duration-200 ${updatingOrders.has(order._id) ? "opacity-60" : ""}`}
                >
                  <td className="p-4 text-sm">
                    {order._id.substring(0, 8)}...
                  </td>
                  <td className="p-4 text-sm">{formatDate(order.createdAt)}</td>
                  <td className="p-4 text-sm">
                    {capitalizeFirstLetter(
                      order.products?.[0]?.productId?.name ||
                        order.auction?.[0]?.name ||
                        order.fleetAuction?.[0]?.name ||
                        "N/A",
                    )}
                  </td>
                  <td className="p-4 text-sm">
                    {order.products?.[0]?.quantity ||
                      order.auction?.[0]?.quantity ||
                      order.fleetAuction?.[0]?.quantity ||
                      "N/A"}
                  </td>
                  <td className="p-4">
                    {order.fleetAuction?.length > 0 &&
                      order.wrapperAssignmentStatus && (
                        <p className="text-xs text-gray-500 mb-1">
                          Wrapper Status:{" "}
                          <span className="font-semibold text-blue-600">
                            {capitalizeFirstLetter(
                              order.wrapperAssignmentStatus,
                            )}
                          </span>
                        </p>
                      )}
                    {order.status === "Cancle" ? (
                      <span className="text-red-600 font-semibold">
                        Cancelled
                      </span>
                    ) : (
                      <select
                        className={`border-2 rounded-md p-1 text-sm w-full 
    ${getStatusColor(order.status)} 
    focus:${getStatusColor(order.status, true)} 
    transition-colors duration-200 
    appearance-none 
    bg-theme-bg2
    text-white
    ${updatingOrders.has(order._id) ? "cursor-not-allowed" : "cursor-pointer"}`}
                        value={order.status || "PENDING"}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        disabled={updatingOrders.has(order._id)}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="PREPARED_FOR_DELIVERY">
                          Prepare for Delivery
                        </option>
                        <option value="Cancle">Cancel</option>
                      </select>
                    )}
                    {updatingOrders.has(order._id) && (
                      <p className="text-xs text-white mt-1">Updating...</p>
                    )}
                  </td>
                  <td className="p-4 text-sm">
                    {currency}{" "}
                    {(
                      order?.price ||
                      order?.products?.[0]?.price ||
                      order?.auction?.[0]?.price ||
                      order?.fleetAuction?.[0]?.price ||
                      0
                    ).toFixed(2)}
                  </td>
                  <td className="p-4 text-center flex justify-center space-x-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      aria-label="View order details"
                    >
                      <FaEye size={16} />
                    </button>
                    {order.fleetAuction?.length > 0 && (
                      <button
                        onClick={() =>
                          navigate(`/admin/assign-wrapper/${order._id}`)
                        }
                        className="text-white hover:text-cyan-800 transition-colors duration-200"
                        title="Assign Wrapper"
                        aria-label="Assign wrapper to fleet auction order"
                      >
                        <FaUserTie size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-6 bg-theme-bg2 text-center text-white">
            No orders found.
          </p>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-theme-bg2 hover:bg-blue-700 transition-colors duration-200"
        >
          Previous
        </button>
        <span className="text-white font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-theme-bg2 hover:bg-blue-700 transition-colors duration-200"
        >
          Next
        </button>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[1000] transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="sticky top-0 z-10 bg-theme-bg2 text-white p-4 md:p-6 flex justify-between items-center rounded-t-xl">
              <div className="flex items-center space-x-3">
                <FaShoppingCart className="text-xl md:text-2xl" />
                <div>
                  <h2 className="text-lg md:text-xl font-bold">
                    Order Details
                  </h2>
                  <p className="text-xs md:text-sm opacity-90">
                    Order ID: {selectedOrder._id}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full p-2 transition-colors duration-200"
                aria-label="Close modal"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="bg-theme-bg p-6 md:p-8 space-y-6">
              <div className="bg-theme-bg2 rounded-lg p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-white flex items-center mb-4">
                  <FaIdCard className="mr-2" /> Order Overview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-white">Order Date</p>
                    <p className="font-semibold text-white">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white">Order Type</p>
                    <p className="font-semibold text-white">
                      {getOrderType(selectedOrder)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white">Status</p>
                    <p className="font-semibold text-white">
                      {capitalizeFirstLetter(selectedOrder.status)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white">Payment Method</p>
                    <p className="font-semibold text-white">
                      {capitalizeFirstLetter(
                        selectedOrder.paymentMethod || "N/A",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white">Price</p>
                    <p className="font-bold text-white">
                      {currency}{" "}
                      {(
                        selectedOrder.products?.[0]?.price ||
                        selectedOrder.auction?.[0]?.price ||
                        selectedOrder.fleetAuction?.[0]?.price ||
                        0
                      ).toFixed(2)}
                    </p>
                    <p className="text-sm text-white mt-1">
                      Total Price (with Commission){" "}
                    </p>
                    <p className="font-bold text-white">
                      {currency}{" "}
                      {selectedOrder.totalPrice?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white">Payment Status</p>
                    <p
                      className={`font-semibold ${selectedOrder.paymentStatus === "PAID" ? "text-white" : "text-red-600"}`}
                    >
                      {capitalizeFirstLetter(
                        selectedOrder.paymentStatus || "N/A",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-theme-bg2 rounded-lg p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-white flex items-center mb-4">
                  <FaShoppingCart className="mr-2" /> Item Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white">Item Name</p>
                    <p className="font-semibold text-white">
                      {capitalizeFirstLetter(
                        selectedOrder.products?.[0]?.productId?.name ||
                          selectedOrder.auction?.[0]?.name ||
                          selectedOrder.fleetAuction?.[0]?.name ||
                          "N/A",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white">Quantity</p>
                    <p className="font-semibold text-white">
                      {selectedOrder.products?.[0]?.quantity ||
                        selectedOrder.auction?.[0]?.quantity ||
                        selectedOrder.fleetAuction?.[0]?.quantity ||
                        "N/A"}
                    </p>
                  </div>
                  {selectedOrder.fleetAuction?.[0]?.wrapType && (
                    <div>
                      <p className="text-sm text-white">Wrap Type</p>
                      <p className="font-semibold text-white">
                        {capitalizeFirstLetter(
                          selectedOrder.fleetAuction[0].wrapType,
                        )}
                      </p>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <p className="text-sm text-white">Description</p>
                    <p className="text-white">
                      {capitalizeFirstLetter(
                        selectedOrder.products?.[0]?.productId?.description ||
                          selectedOrder.auction?.[0]?.description ||
                          selectedOrder.fleetAuction?.[0]?.description ||
                          selectedOrder.description ||
                          "No description available",
                      )}
                    </p>
                  </div>
                  {(selectedOrder.products?.[0]?.image?.[0] ||
                    selectedOrder.auction?.[0]?.image?.[0] ||
                    selectedOrder.fleetAuction?.[0]?.image?.[0]) && (
                    <div className="sm:col-span-2">
                      <p className="text-sm text-white">Item Image</p>
                      <img
                        src={
                          selectedOrder.products?.[0]?.image?.[0] ||
                          selectedOrder.auction?.[0]?.image?.[0] ||
                          selectedOrder.fleetAuction?.[0]?.image?.[0]
                        }
                        alt="Item"
                        className="w-32 h-32 object-cover rounded-md mt-2 border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {selectedOrder.userId && (
                  <div className="bg-theme-bg2 text-white rounded-lg p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-white flex items-center mb-4">
                      <FaUser className="mr-2" /> Buyer Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-white">Name</p>
                        <p className="font-semibold text-white">
                          {capitalizeFirstLetter(
                            selectedOrder.userId.firstName,
                          )}{" "}
                          {capitalizeFirstLetter(
                            selectedOrder.userId.lastname || "",
                          )}
                        </p>
                      </div>
                      {selectedOrder.userId.email && (
                        <div className="flex items-center space-x-2">
                          <FaEnvelope className="text-white" />
                          <div>
                            <p className="text-sm text-white">Email</p>
                            <p className="font-semibold text-white">
                              {selectedOrder.userId.email}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedOrder.userId.phoneNumber && (
                        <div className="flex items-center space-x-2">
                          <FaPhone className="text-white" />
                          <div>
                            <p className="text-sm text-white">Phone</p>
                            <p className="font-semibold text-white">
                              {selectedOrder.userId.phoneNumber}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedOrder?.userId?.location && (
                        <div className="flex items-center space-x-2">
                          <FaMapMarkerAlt className="text-white" />
                          <div>
                            <p className="text-sm text-white">Location</p>
                            <p className="font-semibold text-white">
                              {selectedOrder.userId.location.name}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedOrder.seller && (
                  <div className="bg-theme-bg2 text-white rounded-lg p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-white flex items-center mb-4">
                      <FaStore className="mr-2" /> Seller Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-white">Name</p>
                        <p className="font-semibold text-white">
                          {capitalizeFirstLetter(
                            selectedOrder.seller.firstName,
                          )}{" "}
                          {capitalizeFirstLetter(
                            selectedOrder.seller.lastname || "",
                          )}
                        </p>
                      </div>
                      {selectedOrder.seller.email && (
                        <div className="flex items-center space-x-2">
                          <FaEnvelope className="text-white" />
                          <div>
                            <p className="text-sm text-white">Email</p>
                            <p className="font-semibold text-white">
                              {selectedOrder.seller.email}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedOrder.seller.phoneNumber && (
                        <div className="flex items-center space-x-2">
                          <FaPhone className="text-white" />
                          <div>
                            <p className="text-sm text-white">Phone</p>
                            <p className="font-semibold text-white">
                              {selectedOrder.seller.phoneNumber}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedOrder.seller.location && (
                        <div className="flex items-center space-x-2">
                          <FaMapMarkerAlt className="text-white" />
                          <div>
                            <p className="text-sm text-white">Location</p>
                            <p className="font-semibold text-white">
                              {capitalizeFirstLetter(
                                selectedOrder.seller.location.city || "",
                              )}
                              ,{" "}
                              {capitalizeFirstLetter(
                                selectedOrder.seller.location.state || "",
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedOrder.fleetOwner && (
                  <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-teal-700 flex items-center mb-4">
                      <FaTruck className="mr-2" /> Fleet Owner Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-white">Name</p>
                        <p className="font-semibold text-white">
                          {capitalizeFirstLetter(
                            selectedOrder.fleetOwner.firstName,
                          )}{" "}
                          {capitalizeFirstLetter(
                            selectedOrder.fleetOwner.lastname || "",
                          )}
                        </p>
                      </div>
                      {selectedOrder.fleetOwner.email && (
                        <div className="flex items-center space-x-2">
                          <FaEnvelope className="text-teal-600" />
                          <div>
                            <p className="text-sm text-white">Email</p>
                            <p className="font-semibold text-white">
                              {selectedOrder.fleetOwner.email}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedOrder.fleetOwner.phoneNumber && (
                        <div className="flex items-center space-x-2">
                          <FaPhone className="text-white" />
                          <div>
                            <p className="text-sm text-white">Phone</p>
                            <p className="font-semibold text-white">
                              {selectedOrder.fleetOwner.phoneNumber}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedOrder.fleetOwner.fleetOwnerDetails && (
                        <div>
                          <p className="text-sm text-white">Company Name</p>
                          <p className="font-semibold text-white">
                            {capitalizeFirstLetter(
                              selectedOrder.fleetOwner.fleetOwnerDetails
                                .companyName || "N/A",
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedOrder.address && (
                  <div className="bg-theme-bg2 text-white rounded-lg p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-white flex items-center mb-4">
                      <FaMapMarkerAlt className="mr-2" /> Shipping Address
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-white">Recipient</p>
                        <p className="font-semibold text-white">
                          {capitalizeFirstLetter(
                            selectedOrder.address.firstName,
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaPhone className="text-white" />
                        <div>
                          <p className="text-sm text-white">Phone</p>
                          <p className="font-semibold text-white">
                            {selectedOrder.address.mobile}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-white">Complete Address</p>
                        <p className="font-semibold text-white">
                          {capitalizeFirstLetter(selectedOrder.address.street)}
                          <br />
                          {capitalizeFirstLetter(
                            selectedOrder.address.city,
                          )},{" "}
                          {capitalizeFirstLetter(selectedOrder.address.state)}
                          <br />
                          {capitalizeFirstLetter(selectedOrder.address.country)}
                          <br />
                          PIN: {selectedOrder.address.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Commission Details (Hidden for Fleet Auctions) */}
              {/* Commission Details - Only Show for Online Paid Orders */}
              {selectedOrder.paymentMethod !== "COD" &&
                selectedOrder.paymentStatus === "PAID" && (
                  <div className="bg-theme-bg2 rounded-lg p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-white flex items-center mb-4">
                      <FaCreditCard className="mr-2" /> Commission Details
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-theme-bg rounded-md shadow-sm">
                        <p className="text-sm text-white">Seller Rate</p>
                        <p className="font-bold text-white">
                          {sellerRate !== null ? sellerRate + "%" : "N/A"}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-theme-bg rounded-md shadow-sm">
                        <p className="text-sm text-white">Buyer Rate</p>
                        <p className="font-bold text-white">
                          {BuyerRate !== null ? BuyerRate + "%" : "N/A"}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-theme-bg rounded-md shadow-sm">
                        <p className="text-sm text-white">Seller Charge</p>
                        <p className="font-bold text-white">
                          {currency}
                          {selectedOrder.commissionDetails?.sellerCharge?.toFixed(
                            2,
                          ) || "0.00"}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-theme-bg rounded-md shadow-sm">
                        <p className="text-sm text-white">Buyer Charge</p>
                        <p className="font-bold text-white">
                          {currency}
                          {selectedOrder.commissionDetails?.buyerCharge?.toFixed(
                            2,
                          ) || "0.00"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              {/* Transaction Details - Hide Transaction ID & Session ID for COD/Unpaid */}
              {selectedOrder.paymentMethod !== "COD" &&
              selectedOrder.paymentStatus !== "UNPAID" ? (
                <div className="bg-theme-bg2 rounded-lg p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-white flex items-center mb-4">
                    <FaCreditCard className="mr-2" /> Transaction Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-white">Transaction ID</p>
                      <p className="font-semibold text-white text-sm break-all">
                        {selectedOrder.transactionId || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white">Payment Session ID</p>
                      <p className="font-semibold text-white text-sm break-all">
                        {selectedOrder.paymentSessionId || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white">Last Updated</p>
                      <p className="font-semibold text-white">
                        {formatDate(selectedOrder.updatedAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white">Payment Status</p>
                      <p
                        className={`font-semibold ${selectedOrder.paymentStatus === "PAID" ? "text-white" : "text-red-600"}`}
                      >
                        {capitalizeFirstLetter(
                          selectedOrder.paymentStatus || "N/A",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-emerald-700 flex items-center mb-4">
                    <FaCreditCard className="mr-2" /> Payment Summary
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-semibold text-gray-800">
                        {capitalizeFirstLetter(
                          selectedOrder.paymentMethod || "N/A",
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Status</p>
                      <p
                        className={`font-semibold ${selectedOrder.paymentStatus === "PAID" ? "text-green-600" : "text-red-600"}`}
                      >
                        {capitalizeFirstLetter(
                          selectedOrder.paymentStatus || "N/A",
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-semibold text-gray-800">
                        {formatDate(selectedOrder.updatedAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Note</p>
                      <p className="font-medium text-amber-600">
                        {selectedOrder.paymentMethod === "COD"
                          ? "Cash on Delivery - No online transaction"
                          : "Payment pending"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-theme-bg text-white flex justify-end rounded-b-xl">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;

// import React, { useEffect, useState, useRef, useMemo } from "react";
// import { createRoot } from "react-dom/client";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchOrdersAsync,
//   fetchOrdersSummaryAsync,
//   adminUpdateOrderStatus,
// } from "../../store/order/OrderSlice";
// import {
//   fetchWrappers,
//   assignWrapper,
// } from "../../store/wrapperassignorders/wrapperassignorderSlice";
// import {
//   BrowserRouter as Router,
//   Route,
//   Routes,
//   Link,
//   useNavigate,
//   useParams,
// } from "react-router-dom";
// import {
//   FaEye,
//   FaClipboardList,
//   FaCheckCircle,
//   FaClock,
//   FaTimesCircle,
//   FaTruck,
//   FaShoppingCart,
//   FaMapMarkerAlt,
//   FaCreditCard,
//   FaCalendarAlt,
//   FaIdCard,
//   FaPhone,
//   FaEnvelope,
//   FaTimes,
//   FaUser,
//   FaStore,
//   FaUserTie,
// } from "react-icons/fa";
// import { messaging, generateToken, onMessageListener } from "../../firebase";
// import socket from "../../socket";
// import { fetchUserCountry } from "../../store/countary/countrySlice";
// const OrderPage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const orderState = useSelector((state) => state.order);
//   const { orders: ordersResponse, status, error, ordersSummary } = orderState;
//   const orders = ordersResponse?.orders || [];
//   const totalPages = ordersResponse?.totalPages || 1;
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [filterStatus, setFilterStatus] = useState("ALL");

//   const lastDispatchedPage = useRef(null);
//   const { country, currency } = useSelector((state) => state.country);
//   const filteredOrders = useMemo(() => {
//     if (filterStatus === "ALL") return orders;
//     return orders.filter((order) => order.status === filterStatus);
//   }, [orders, filterStatus]);

//   useEffect(() => {
//     generateToken()
//       .then((token) => {
//         if (token);
//       })
//       .catch((error) => console.error("Error generating token:", error));

//     onMessageListener().then((payload) => {
//
//       if ("Notification" in window && Notification.permission === "granted") {
//         new Notification("New Notification", {
//           body: payload.notification.body,
//           icon: "/path/to/icon.png",
//         });
//       }
//     });
//   }, []);

//   useEffect(() => {
//     if (!country) {
//       dispatch(fetchUserCountry());
//     }
//   }, [dispatch, country]);

//   useEffect(() => {
//     if (lastDispatchedPage.current !== currentPage) {
//       dispatch(fetchOrdersAsync(currentPage));
//       lastDispatchedPage.current = currentPage;
//     }
//     dispatch(fetchOrdersSummaryAsync());

//   }, [currentPage, dispatch]);

//   const handleCloseModal = () => setSelectedOrder(null);

//   const handleStatusChange = async (orderId, newStatus) => {
//     const order = orders.find((order) => order._id === orderId);
//     if (!order || !order.userId) return;
//     const fcmToken = await generateToken();
//     if (!fcmToken) return;
//     dispatch(adminUpdateOrderStatus({ orderId, status: newStatus, fcmToken }))
//       .unwrap()
//       .then(() => {
//         dispatch(fetchOrdersAsync(currentPage));
//         socket.emit("orderStatusUpdate", {
//           userId: order.userId._id.toString(),
//           orderId,
//           message: `Your order has been marked as '${newStatus}'`,
//           status: newStatus,
//           fcmToken,
//         });
//       })
//       .catch((err) => console.error("API Error:", err));
//   };

//   const handlePageChange = (newPage) => {
//     if (newPage > 0 && newPage <= totalPages) {
//       setCurrentPage(newPage);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   const capitalizeFirstLetter = (str) => {
//     if (!str) return "N/A";
//     return str
//       .split(" ")
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//       .join(" ");
//   };
//   const parseLocation = (location) => {
//     if (!location) return { city: "N/A", state: "N/A" };
//     if (location.city && location.state) {
//       return {
//         city: capitalizeFirstLetter(location.city),
//         state: capitalizeFirstLetter(location.state),
//       };
//     }
//     if (location.name) {
//       // Example name: "127031, Bawani Khera, Bhiwani, Haryana, India"
//       const parts = location.name.split(", ").map((part) => part.trim());
//       let city = "N/A";
//       let state = "N/A";
//       if (parts.length >= 3) {
//         // Assuming format: [zip, city, ..., state, country]
//         city = parts[1] || parts[2] || "N/A"; // Use second or third part as city
//         state = parts[parts.length - 2] || "N/A"; // Use second-to-last part as state
//       }
//       return {
//         city: capitalizeFirstLetter(city),
//         state: capitalizeFirstLetter(state),
//       };
//     }
//     return { city: "N/A", state: "N/A" };
//   };
//   const getStatusColor = (status, isFocused = false) => {
//     if (isFocused) return "border-blue-500";
//     switch (status) {
//       case "DELIVERED":
//         return "border-green-500";
//       case "PENDING":
//         return "border-yellow-500";
//       case "PREPARED_FOR_DELIVERY":
//         return "border-blue-500";
//       case "Cancle":
//         return "border-red-500";
//       default:
//         return "border-gray-300";
//     }
//   };

//   const getOrderType = (order) => {
//     if (order.products?.length > 0) return "Product";
//     if (order.auction?.length > 0) return "Auction";
//     if (order.fleetAuction?.length > 0) return "fleetAuction";
//     return "Unknown";
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleDateString("en-IN", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   if (status === "loading") {
//     return (
//       <div className="flex justify-center items-center h-64 text-gray-600">
//         Loading...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center h-64 text-red-600">
//         Error: {error.message || "Failed to load orders"}
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
//       <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
//         Orders List
//       </h1>

//       {ordersSummary && (
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
//           {[
//             {
//               status: "ALL",
//               icon: FaClipboardList,
//               label: "Total",
//               count: ordersSummary.totalOrders,
//               color: "bg-blue-100 hover:bg-blue-200",
//             },
//             {
//               status: "DELIVERED",
//               icon: FaCheckCircle,
//               label: "Delivered",
//               count: ordersSummary.deliveredOrders,
//               color: "bg-green-100 hover:bg-green-200",
//             },
//             {
//               status: "PENDING",
//               icon: FaClock,
//               label: "Pending",
//               count: ordersSummary.pendingOrders,
//               color: "bg-yellow-100 hover:bg-yellow-200",
//             },
//             {
//               status: "Cancle",
//               icon: FaTimesCircle,
//               label: "Cancelled",
//               count: ordersSummary.CancleOrders,
//               color: "bg-red-100 hover:bg-red-200",
//             },
//             {
//               status: "PREPARED_FOR_DELIVERY",
//               icon: FaTruck,
//               label: "Prepared",
//               count: ordersSummary.preparedOrders,
//               color: "bg-purple-100 hover:bg-purple-200",
//             },
//           ].map(({ status, icon: Icon, label, count, color }) => (
//             <div
//               key={status}
//               onClick={() => setFilterStatus(status)}
//               className={`p-4 rounded-lg ${color} cursor-pointer transition flex items-center space-x-3 ${filterStatus === status ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
//             >
//               <Icon className="text-2xl text-gray-700" />
//               <div>
//                 <h2 className="text-sm font-semibold text-gray-700">{label}</h2>
//                 <span className="text-xl font-bold text-gray-800">{count}</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       <div className="bg-white rounded-lg shadow-md overflow-x-auto">
//         {filteredOrders.length > 0 ? (
//           <table className="w-full text-left border-collapse">
//             <thead className="bg-gray-200 text-gray-700 font-semibold">
//               <tr>
//                 <th className="p-3 text-sm">Order ID</th>
//                 <th className="p-3 text-sm">Order Date</th>
//                 <th className="p-3 text-sm">Product Name</th>
//                 <th className="p-3 text-sm">Quantity</th>
//                 <th className="p-3 text-sm">Status</th>
//                 <th className="p-3 text-sm">Total Price</th>
//                 <th className="p-3 text-sm text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredOrders.map((order, index) => (
//                 <tr
//                   key={order._id}
//                   className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
//                 >
//                   <td className="p-3 text-sm">
//                     {order._id.substring(0, 8)}...
//                   </td>
//                   <td className="p-3 text-sm">{formatDate(order.createdAt)}</td>
//                   <td className="p-3 text-sm">
//                     {order.products?.[0]?.productId?.name ||
//                       order.auction?.[0]?.name ||
//                       order.fleetAuction?.[0]?.name ||
//                       "N/A"}
//                   </td>
//                   <td className="p-3 text-sm">
//                     {order.products?.[0]?.quantity ||
//                       order.auction?.[0]?.quantity ||
//                       order.fleetAuction?.[0]?.quantity ||
//                       "N/A"}
//                   </td>
//                   <td className="p-3">
//                     {order.fleetAuction?.length > 0 &&
//                       order.wrapperAssignmentStatus && (
//                         <p className="text-xs text-gray-500 mb-1">
//                           Wrapper updated status:{" "}
//                           <span className="font-semibold text-blue-600">
//                             {capitalizeFirstLetter(
//                               order.wrapperAssignmentStatus
//                             )}
//                           </span>
//                         </p>
//                       )}
//                     {order.status === "Cancle" ? (
//                       <span className="text-red-600 font-semibold">
//                         Cancelled
//                       </span>
//                     ) : (
//                       <select
//                         className={`border-2 rounded-md p-1 text-sm w-full ${getStatusColor(order.status)} focus:${getStatusColor(order.status, true)}`}
//                         value={order.status || "PENDING"}
//                         onChange={(e) =>
//                           handleStatusChange(order._id, e.target.value)
//                         }
//                       >
//                         <option value="PENDING">Pending</option>
//                         <option value="DELIVERED">Delivered</option>
//                         <option value="PREPARED_FOR_DELIVERY">
//                           Prepare for delivery
//                         </option>
//                         <option value="Cancle">Cancel</option>
//                       </select>
//                     )}
//                   </td>
//                   <td className="p-3 text-sm">
//                     {currency} {order.totalPrice}
//                   </td>
//                   <td className="p-3 text-center">
//                     <button
//                       onClick={() => setSelectedOrder(order)}
//                       className="text-blue-600 hover:text-blue-800"
//                     >
//                       <FaEye size={16} />
//                     </button>
//                     {order.fleetAuction?.length > 0 && (
//                       <button
//                         onClick={() =>
//                           navigate(`/admin/assign-wrapper/${order._id}`)
//                         }
//                         className="ml-2 text-cyan-600 hover:text-cyan-800"
//                         title="👔 Icon only appears for Fleet Auction orders. Click to assign a wrapper."
//                       >
//                         <FaUserTie size={16} />
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p className="p-6 text-center text-gray-500">No orders found.</p>
//         )}
//       </div>

//       <div className="flex justify-center items-center gap-4 mt-6">
//         <button
//           onClick={() => handlePageChange(currentPage - 1)}
//           disabled={currentPage === 1}
//           className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
//         >
//           Previous
//         </button>
//         <span className="text-gray-700">
//           Page {currentPage} of {totalPages}
//         </span>
//         <button
//           onClick={() => handlePageChange(currentPage + 1)}
//           disabled={currentPage === totalPages}
//           className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
//         >
//           Next
//         </button>
//       </div>

//       {selectedOrder && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000]">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//             <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
//               <div className="flex items-center space-x-3">
//                 <FaShoppingCart className="text-xl" />
//                 <div>
//                   <h2 className="text-lg font-bold">Order Details</h2>
//                   <p className="text-sm">Order ID: {selectedOrder._id}</p>
//                 </div>
//               </div>
//               <button
//                 onClick={handleCloseModal}
//                 className="text-white hover:text-gray-200"
//               >
//                 <FaTimes size={20} />
//               </button>
//             </div>

//             <div className="p-6 space-y-6 pt-16">
//               {" "}
//               {/* Added pt-16 to account for header height */}
//               <div className="bg-gray-50 rounded-lg p-4">
//                 <h3 className="text-lg font-semibold text-blue-700 flex items-center">
//                   <FaIdCard className="mr-2" /> Order Overview
//                 </h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
//                   <div>
//                     <p className="text-sm text-gray-500">Order Date</p>
//                     <p className="font-semibold">
//                       {formatDate(selectedOrder.createdAt)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Order Type</p>
//                     <p className="font-semibold">
//                       {getOrderType(selectedOrder)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Status</p>
//                     <p className="font-semibold">
//                       {capitalizeFirstLetter(selectedOrder.status)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Payment Method</p>
//                     <p className="font-semibold">
//                       {capitalizeFirstLetter(
//                         selectedOrder.paymentMethod || "N/A"
//                       )}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Price</p>
//                     <p className="font-bold text-green-600">
//                      {currency}{" "}
//           {(
//             selectedOrder.products?.[0]?.price ||
//             selectedOrder.auction?.[0]?.price ||
//             selectedOrder.fleetAuction?.[0]?.price ||
//             0
//           ).toFixed(2)}
//                     </p>
//                     <p className="text-sm text-gray-500">Total Price</p>
//                     <p className="font-bold text-green-600">
//                        {currency} {selectedOrder.totalPrice?.toFixed(2) || "0.00"}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-sm text-gray-500">Payment Status</p>
//                     <p
//                       className={`font-semibold ${selectedOrder.paymentStatus === "PAID" ? "text-green-600" : "text-red-600"}`}
//                     >
//                       {capitalizeFirstLetter(
//                         selectedOrder.paymentStatus || "N/A"
//                       )}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-50 rounded-lg p-4">
//                 <h3 className="text-lg font-semibold text-green-700 flex items-center">
//                   <FaShoppingCart className="mr-2" /> Item Details
//                 </h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
//                   <div>
//                     <p className="text-sm text-gray-500">Item Name</p>
//                     <p className="font-semibold">
//                       {capitalizeFirstLetter(
//                         selectedOrder.products?.[0]?.productId?.name ||
//                           selectedOrder.auction?.[0]?.name ||
//                           selectedOrder.fleetAuction?.[0]?.name ||
//                           "N/A"
//                       )}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Quantity</p>
//                     <p className="font-semibold">
//                       {selectedOrder.products?.[0]?.quantity ||
//                         selectedOrder.auction?.[0]?.quantity ||
//                         selectedOrder.fleetAuction?.[0]?.quantity ||
//                         "N/A"}
//                     </p>
//                   </div>
//                   <div className="sm:col-span-2">
//                     <p className="text-sm text-gray-500">Description</p>
//                     <p className="text-gray-700">
//                       {capitalizeFirstLetter(
//                         selectedOrder.products?.[0]?.productId?.description ||
//                           selectedOrder.auction?.[0]?.description ||
//                           selectedOrder.fleetAuction?.[0]?.description ||
//                           selectedOrder.description ||
//                           "No description available"
//                       )}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                 {selectedOrder.userId && (
//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <h3 className="text-lg font-semibold text-purple-700 flex items-center">
//                       <FaUser className="mr-2" /> Buyer Details
//                     </h3>
//                     <div className="space-y-3 mt-4">
//                       <div>
//                         <p className="text-sm text-gray-500">Name</p>
//                         <p className="font-semibold">
//                           {capitalizeFirstLetter(
//                             selectedOrder.userId.firstName
//                           )}{" "}
//                           {capitalizeFirstLetter(
//                             selectedOrder.userId.lastname || ""
//                           )}
//                         </p>
//                       </div>
//                       {selectedOrder.userId.email && (
//                         <div className="flex items-center space-x-2">
//                           <FaEnvelope className="text-purple-600" />
//                           <div>
//                             <p className="text-sm text-gray-500">Email</p>
//                             <p className="font-semibold">
//                               {selectedOrder.userId.email}
//                             </p>
//                           </div>
//                         </div>
//                       )}
//                       {selectedOrder.userId.phoneNumber && (
//                         <div className="flex items-center space-x-2">
//                           <FaPhone className="text-purple-600" />
//                           <div>
//                             <p className="text-sm text-gray-500">Phone</p>
//                             <p className="font-semibold">
//                               {selectedOrder.userId.phoneNumber}
//                             </p>
//                           </div>
//                         </div>
//                       )}
//                       {selectedOrder?.userId?.location && (
//                         <div className="flex items-center space-x-2">
//                           <FaMapMarkerAlt className="text-purple-600" />
//                           <div>
//                             <p className="text-sm text-gray-500">Location</p>
//                             <p className="font-semibold">
//                               {selectedOrder.userId.location.name}
//                             </p>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {selectedOrder.seller && (
//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <h3 className="text-lg font-semibold text-orange-700 flex items-center">
//                       <FaStore className="mr-2" /> Seller Details
//                     </h3>
//                     <div className="space-y-3 mt-4">
//                       <div>
//                         <p className="text-sm text-gray-500">Name</p>
//                         <p className="font-semibold">
//                           {capitalizeFirstLetter(
//                             selectedOrder.seller.firstName
//                           )}{" "}
//                           {capitalizeFirstLetter(
//                             selectedOrder.seller.lastname || ""
//                           )}
//                         </p>
//                       </div>
//                       {selectedOrder.seller.email && (
//                         <div className="flex items-center space-x-2">
//                           <FaEnvelope className="text-orange-600" />
//                           <div>
//                             <p className="text-sm text-gray-500">Email</p>
//                             <p className="font-semibold">
//                               {selectedOrder.seller.email}
//                             </p>
//                           </div>
//                         </div>
//                       )}
//                       {selectedOrder.seller.phoneNumber && (
//                         <div className="flex items-center space-x-2">
//                           <FaPhone className="text-orange-600" />
//                           <div>
//                             <p className="text-sm text-gray-500">Phone</p>
//                             <p className="font-semibold">
//                               {selectedOrder.seller.phoneNumber}
//                             </p>
//                           </div>
//                         </div>
//                       )}
//                       {selectedOrder.seller.location && (
//                         <div className="flex items-center space-x-2">
//                           <FaMapMarkerAlt className="text-orange-600" />
//                           <div>
//                             <p className="text-sm text-gray-500">Location</p>
//                             <p className="font-semibold">
//                               {capitalizeFirstLetter(
//                                 selectedOrder.seller.location.city || ""
//                               )}
//                               ,{" "}
//                               {capitalizeFirstLetter(
//                                 selectedOrder.seller.location.state || ""
//                               )}
//                             </p>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {selectedOrder.fleetOwner && (
//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <h3 className="text-lg font-semibold text-teal-700 flex items-center">
//                       <FaTruck className="mr-2" /> Fleet Owner Details
//                     </h3>
//                     <div className="space-y-3 mt-4">
//                       <div>
//                         <p className="text-sm text-gray-500">Name</p>
//                         <p className="font-semibold">
//                           {capitalizeFirstLetter(
//                             selectedOrder.fleetOwner.firstName
//                           )}{" "}
//                           {capitalizeFirstLetter(
//                             selectedOrder.fleetOwner.lastname || ""
//                           )}
//                         </p>
//                       </div>
//                       {selectedOrder.fleetOwner.email && (
//                         <div className="flex items-center space-x-2">
//                           <FaEnvelope className="text-teal-600" />
//                           <div>
//                             <p className="text-sm text-gray-500">Email</p>
//                             <p className="font-semibold">
//                               {selectedOrder.fleetOwner.email}
//                             </p>
//                           </div>
//                         </div>
//                       )}
//                       {selectedOrder.fleetOwner.phoneNumber && (
//                         <div className="flex items-center space-x-2">
//                           <FaPhone className="text-teal-600" />
//                           <div>
//                             <p className="text-sm text-gray-500">Phone</p>
//                             <p className="font-semibold">
//                               {selectedOrder.fleetOwner.phoneNumber}
//                             </p>
//                           </div>
//                         </div>
//                       )}
//                       {selectedOrder.fleetOwner.fleetOwnerDetails && (
//                         <div>
//                           <p className="text-sm text-gray-500">Fleet Details</p>
//                           <p className="font-semibold">
//                             {capitalizeFirstLetter(
//                               selectedOrder.fleetOwner.fleetOwnerDetails
//                                 .companyName || "N/A"
//                             )}
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {selectedOrder.address && (
//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <h3 className="text-lg font-semibold text-indigo-700 flex items-center">
//                       <FaMapMarkerAlt className="mr-2" /> Shipping Address
//                     </h3>
//                     <div className="space-y-3 mt-4">
//                       <div>
//                         <p className="text-sm text-gray-500">Recipient</p>
//                         <p className="font-semibold">
//                           {capitalizeFirstLetter(
//                             selectedOrder.address.firstName
//                           )}
//                         </p>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <FaPhone className="text-indigo-600" />
//                         <div>
//                           <p className="text-sm text-gray-500">Phone</p>
//                           <p className="font-semibold">
//                             {selectedOrder.address.mobile}
//                           </p>
//                         </div>
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-500">
//                           Complete Address
//                         </p>
//                         <p className="font-semibold">
//                           {capitalizeFirstLetter(selectedOrder.address.street)}
//                           <br />
//                           {capitalizeFirstLetter(
//                             selectedOrder.address.city
//                           )},{" "}
//                           {capitalizeFirstLetter(selectedOrder.address.state)}
//                           <br />
//                           PIN: {selectedOrder.address.pincode}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//               {/*
//           {selectedOrder.commissionDetails && (
//             <div className="bg-gray-50 rounded-lg p-4">
//               <h3 className="text-lg font-semibold text-gray-700">Commission Details</h3>
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
//                 <div className="text-center p-3 bg-blue-100 rounded-md">
//                   <p className="text-sm text-gray-500">Seller Rate</p>
//                   <p className="font-bold text-blue-600">{selectedOrder.commissionDetails.sellerRate}%</p>
//                 </div>
//                 <div className="text-center p-3 bg-purple-100 rounded-md">
//                   <p className="text-sm text-gray-500">Buyer Rate</p>
//                   <p className="font-bold text-purple-600">{selectedOrder.commissionDetails.buyerRate}%</p>
//                 </div>
//                 <div className="text-center p-3 bg-green-100 rounded-md">
//                   <p className="text-sm text-gray-500">Seller Charge</p>
//                   <p className="font-bold text-green-600">₹{selectedOrder.commissionDetails.sellerCharge}</p>
//                 </div>
//                 <div className="text-center p-3 bg-yellow-100 rounded-md">
//                   <p className="text-sm text-gray-500">Buyer Charge</p>
//                   <p className="font-bold text-yellow-600">₹{selectedOrder.commissionDetails.buyerCharge}</p>
//                 </div>
//               </div>
//             </div>
//           )} */}
//               <div className="bg-gray-50 rounded-lg p-4">
//                 <h3 className="text-lg font-semibold text-emerald-700 flex items-center">
//                   <FaCreditCard className="mr-2" /> Transaction Details
//                 </h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
//                   <div>
//                     <p className="text-sm text-gray-500">Transaction ID</p>
//                     <p className="font-semibold text-sm break-all">
//                       {selectedOrder.transactionId || "N/A"}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Payment Session ID</p>
//                     <p className="font-semibold text-sm break-all">
//                       {selectedOrder.paymentSessionId || "N/A"}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Last Updated</p>
//                     <p className="font-semibold">
//                       {formatDate(selectedOrder.updatedAt)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Payment Status</p>
//                     <p
//                       className={`font-semibold ${selectedOrder.paymentStatus === "PAID" ? "text-green-600" : "text-red-600"}`}
//                     >
//                       {capitalizeFirstLetter(
//                         selectedOrder.paymentStatus || "N/A"
//                       )}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="p-4 bg-gray-50 flex justify-end">
//               <button
//                 onClick={handleCloseModal}
//                 className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrderPage;

// // import React, { useEffect, useState } from "react";
// // import { useDispatch, useSelector } from "react-redux";
// // import {
// //   fetchOrdersAsync,
// //   fetchOrdersSummaryAsync,
// //   adminUpdateOrderStatus,
// // } from "../../store/order/OrderSlice";
// // import socket from "../../socket";
// // import {
// //   FaEye,
// //   FaClipboardList,
// //   FaCheckCircle,
// //   FaClock,
// //   FaTimesCircle,
// //   FaTruck,
// //   FaShoppingCart,
// //   FaMapMarkerAlt,
// //   FaCreditCard,
// //   FaCalendarAlt,
// //   FaIdCard,
// //   FaPhone,
// //   FaEnvelope,
// //   FaTimes,
// //   FaUser,
// //   FaStore
// // } from "react-icons/fa";
// // import { messaging, generateToken, onMessageListener } from "../../firebase";

// // const OrderPage = () => {
// //   const dispatch = useDispatch();
// //   const orderState = useSelector((state) => state.order);
// //   const { orders: ordersResponse, status, error, ordersSummary } = orderState;
// //   const orders = ordersResponse?.orders || [];
// //   const totalPages = ordersResponse?.totalPages || 1;
// //   const currentPageFromResponse = ordersResponse?.currentPage || 1;

// //   const [currentPage, setCurrentPage] = useState(currentPageFromResponse);
// //   const [selectedOrder, setSelectedOrder] = useState(null);
// //   const [filterStatus, setFilterStatus] = useState("ALL");
// //   const [filteredOrders, setFilteredOrders] = useState([]);

// //   useEffect(() => {
// //     if (filterStatus === "ALL") {
// //       setFilteredOrders(orders);
// //     } else {
// //       setFilteredOrders(orders.filter((order) => order.status === filterStatus));
// //     }
// //   }, [orders, filterStatus]);

// //   useEffect(() => {
// //     generateToken()
// //       .then((token) => {
// //         if (token) {
// //

// //         }
// //       })
// //       .catch((error) => {
// //         console.error("Error generating token:", error);
// //       });

// //     onMessageListener().then((payload) => {
// //

// //       if ("Notification" in window) {
// //         if (Notification.permission === "granted") {
// //           new Notification("New Notification", {
// //             body: payload.notification.body,
// //             icon: "/path/to/icon.png",
// //           });
// //         } else if (Notification.permission !== "denied") {
// //           Notification.requestPermission().then((permission) => {
// //             if (permission === "granted") {
// //               new Notification("New Notification", {
// //                 body: payload.notification.body,
// //                 icon: "/path/to/icon.png",
// //               });
// //             }
// //           });
// //         }
// //       } else {
// //         console.warn("Browser does not support notifications.");
// //         alert(`New Notification: ${payload.notification.body}`);
// //       }
// //     });
// //   }, []);

// //   useEffect(() => {
// //     dispatch(fetchOrdersAsync(currentPage));
// //     dispatch(fetchOrdersSummaryAsync());
// //   }, [currentPage, dispatch]);

// //   const handleCloseModal = () => setSelectedOrder(null);

// //   const handleStatusChange = async (orderId, newStatus) => {
// //     const order = orders.find((order) => order._id === orderId);

// //     if (!order || !order.userId) {
// //       console.error("User data is missing in the order.");
// //       return;
// //     }

// //     const fcmToken = await generateToken();

// //     if (!fcmToken) {
// //       console.error("FCM Token is missing.");
// //       return;
// //     }

// //     dispatch(adminUpdateOrderStatus({ orderId, status: newStatus, fcmToken }))
// //       .unwrap()
// //       .then(() => {
// //         dispatch(fetchOrdersAsync(currentPage));
// //         const notificationData = {
// //           userId: order.userId._id.toString(),
// //           orderId,
// //           message: `Your order has been marked as '${newStatus}'`,
// //           status: newStatus,
// //           fcmToken,
// //         };
// //         socket.emit("orderStatusUpdate", notificationData);
// //       })
// //       .catch((err) => console.error("API Error:", err));
// //   };

// //   const handlePageChange = (newPage) => {
// //     if (newPage > 0 && newPage <= totalPages) {
// //       setCurrentPage(newPage);
// //       window.scrollTo({ top: 0, behavior: "smooth" });
// //     }
// //   };

// //   function capitalizeFirstLetter(str) {
// //     if (!str) return "N/A";
// //     return str
// //       .split(" ")
// //       .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
// //       .join(" ");
// //   }

// //   const getStatusColor = (status, isFocused = false) => {
// //     if (isFocused) return "#3b82f6";

// //     switch (status) {
// //       case "DELIVERED":
// //         return "#16a34a";
// //       case "PENDING":
// //         return "#eab308";
// //       case "PREPARED_FOR_DELIVERY":
// //         return "#3b82f6";
// //       case "Cancle":
// //         return "#8B0000";
// //       default:
// //         return "transparent";
// //     }
// //   };

// //   const getOrderType = (order) => {
// //     if (order.products && order.products.length > 0) return "Product";
// //     if (order.auction && order.auction.length > 0) return "Auction";
// //     if (order.fleetAuction && order.fleetAuction.length > 0) return "Fleet Auction";
// //     return "Unknown";
// //   };

// //   const formatDate = (dateString) => {
// //     if (!dateString) return "N/A";
// //     return new Date(dateString).toLocaleDateString("en-IN", {
// //       year: "numeric",
// //       month: "long",
// //       day: "numeric",
// //       hour: "2-digit",
// //       minute: "2-digit",
// //     });
// //   };

// //   if (status === "loading") {
// //     return <div className="flex justify-center items-center h-64">Loading...</div>;
// //   }

// //   if (error) {
// //     return (
// //       <div className="flex justify-center items-center h-64 text-red-600">
// //         Error: {error.message || "Failed to load orders"}
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="px-7 py-4 w-full bg-theme-bg text-slate-300 rounded-2xl min-h-[100vh]">
// //       <h1 className="text-white font-bold text-xl border-b border-border-info-color pb-3 mb-5">
// //         Orders List
// //       </h1>

// //       {/* Orders Summary Cards with Filter on Click */}
// //       {ordersSummary && (
// //         <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 items-center text-center">
// //           <div
// //             onClick={() => setFilterStatus("ALL")}
// //             className={`bg-blue-500 text-white px-4 py-3 rounded-lg flex items-center space-x-3 cursor-pointer hover:bg-blue-600 transition ${filterStatus === "ALL" ? "ring-2 ring-blue-300" : ""}`}
// //           >
// //             <FaClipboardList className="text-white text-2xl" />
// //             <div className="flex-grow">
// //               <h2 className="text-base font-bold mb-1">Total Orders:</h2>
// //               <span className="text-xl font-extrabold">{ordersSummary.totalOrders}</span>
// //             </div>
// //           </div>
// //           <div
// //             onClick={() => setFilterStatus("DELIVERED")}
// //             className={`bg-green-500 text-white px-4 py-3 rounded-lg flex items-center space-x-3 cursor-pointer hover:bg-green-600 transition ${filterStatus === "DELIVERED" ? "ring-2 ring-green-300" : ""}`}
// //           >
// //             <FaCheckCircle className="text-white text-2xl" />
// //             <div className="flex-grow">
// //               <h2 className="text-base font-bold mb-1">Delivered Orders:</h2>
// //               <span className="text-xl font-extrabold">{ordersSummary.deliveredOrders}</span>
// //             </div>
// //           </div>
// //           <div
// //             onClick={() => setFilterStatus("Pending")}
// //             className={`bg-yellow-500 text-white px-4 py-3 rounded-lg flex items-center space-x-3 cursor-pointer hover:bg-yellow-600 transition ${filterStatus === "Pending" ? "ring-2 ring-yellow-300" : ""}`}
// //           >
// //             <FaClock className="text-white text-2xl" />
// //             <div className="flex-grow">
// //               <h2 className="text-base font-bold mb-1">Pending Orders:</h2>
// //               <span className="text-xl font-extrabold">{ordersSummary.pendingOrders}</span>
// //             </div>
// //           </div>
// //           <div
// //             onClick={() => setFilterStatus("Cancle")}
// //             className={`bg-red-500 text-white px-4 py-3 rounded-lg flex items-center space-x-3 cursor-pointer hover:bg-red-600 transition ${filterStatus === "Cancle" ? "ring-2 ring-red-300" : ""}`}
// //           >
// //             <FaTimesCircle className="text-white text-2xl" />
// //             <div className="flex-grow">
// //               <h2 className="text-base font-bold mb-1">Cancle Orders:</h2>
// //               <span className="text-xl font-extrabold">{ordersSummary.CancleOrders}</span>
// //             </div>
// //           </div>
// //           <div
// //             onClick={() => setFilterStatus("PREPARED_FOR_DELIVERY")}
// //             className={`bg-purple-500 text-white px-4 py-3 rounded-lg flex items-center space-x-3 cursor-pointer hover:bg-purple-600 transition ${filterStatus === "PREPARED_FOR_DELIVERY" ? "ring-2 ring-purple-300" : ""}`}
// //           >
// //             <FaTruck className="text-white text-2xl" />
// //             <div className="flex-grow">
// //               <h2 className="text-base font-bold mb-1">Prepared for Delivery:</h2>
// //               <span className="text-xl font-extrabold">{ordersSummary.preparedOrders}</span>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Orders Table */}
// //       <div className="overflow-auto px-4 rounded-2xl border border-border-info-color mt-4 max-h-[700px]">
// //         {filteredOrders.length > 0 ? (
// //           <table className="text-left whitespace-nowrap w-full border-separate border-spacing-x-0 border-spacing-y-4">
// //             <thead className="sticky top-0 bg-gradient-to-r from-purple-700 to-indigo-900 text-white font-bold text-lg uppercase tracking-wider shadow-xl rounded-t-lg overflow-hidden">
// //               <tr>
// //                 <th className="p-3 border-b border-indigo-600 first:rounded-tl-lg last:rounded-tr-lg">
// //                   Order ID
// //                 </th>
// //                 <th className="p-3 border-b border-indigo-600">Order Date</th>
// //                 <th className="p-3 border-b border-indigo-600">Product Name</th>
// //                 <th className="p-3 border-b border-indigo-600">Quantity</th>
// //                 <th className="p-3 border-b border-indigo-600">Status</th>
// //                 <th className="p-3 border-b border-indigo-600">Total Price</th>
// //                 <th className="p-3 border-b border-indigo-600 text-center last:rounded-tr-lg">
// //                   Actions
// //                 </th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {filteredOrders.map((order, index) => (
// //                 <tr
// //                   key={order._id}
// //                   className={`border-b border-blue-400 ${
// //                     index % 2 === 0 ? "bg-theme-bg" : "bg-gray-700"
// //                   } hover:bg-gray-500 transition`}
// //                 >
// //                   <td className="px-6 py-4">{order._id}</td>
// //                   <td className="px-6 py-4">
// //                     {order.createdAt
// //                       ? new Date(order.createdAt).toLocaleDateString()
// //                       : "N/A"}
// //                   </td>
// //                   <td className="px-6 py-4">
// //                     {order.products?.[0]?.productId?.name ||
// //                       order.auction?.[0]?.name ||
// //                       order.fleetAuction?.[0]?.name ||
// //                       "N/A"}
// //                   </td>
// //                   <td className="px-6 py-4">
// //                     {order.products?.[0]?.quantity ||
// //                       order.auction?.[0]?.quantity ||
// //                       order.fleetAuction?.[0]?.quantity ||
// //                       "N/A"}
// //                   </td>
// //                   <td className="px-4 py-2">
// //                     <div className="border border-indigo-600 rounded-lg mx-auto">
// //                       <select
// //                         className="text-white px-3 py-1 rounded-lg text-center"
// //                         value={order.status || "PENDING"}
// //                         onChange={(e) => handleStatusChange(order._id, e.target.value)}
// //                         style={{
// //                           backgroundColor: getStatusColor(order.status),
// //                         }}
// //                         onFocus={(e) => {
// //                           e.target.style.backgroundColor = getStatusColor(order.status, true);
// //                         }}
// //                         onBlur={(e) => {
// //                           e.target.style.backgroundColor = getStatusColor(order.status);
// //                         }}
// //                       >
// //                         <option value="PENDING">Pending</option>
// //                         <option value="DELIVERED">Delivered</option>
// //                         <option value="PREPARED_FOR_DELIVERY">Prepare for delivery</option>
// //                         <option value="Cancle">Cancle</option>
// //                       </select>
// //                     </div>
// //                   </td>
// //                   <td className="px-6 py-4">₹{order.totalPrice}</td>
// //                   <td className="px-6 py-4">
// //                     <button
// //                       className="text-blue-500 hover:text-blue-700"
// //                       onClick={() => setSelectedOrder(order)}
// //                     >
// //                       <FaEye size={20} />
// //                     </button>
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         ) : (
// //           <p className="mt-4 text-center text-gray-500">
// //             {status === "idle" ? "No orders found." : "Loading orders..."}
// //           </p>
// //         )}
// //       </div>

// //       {/* Pagination */}
// //       <div className="pagination mt-4 flex justify-center items-center gap-4">
// //         <button
// //           onClick={() => handlePageChange(currentPage - 1)}
// //           disabled={currentPage === 1}
// //           className="px-4 py-2 bg-blue-600 rounded disabled:bg-gray-600"
// //         >
// //           Previous
// //         </button>
// //         <span className="font-medium">
// //           Page {currentPage} of {totalPages}
// //         </span>
// //         <button
// //           onClick={() => handlePageChange(currentPage + 1)}
// //           disabled={currentPage === totalPages}
// //           className="px-4 py-2 bg-blue-600 rounded disabled:bg-gray-600"
// //         >
// //           Next
// //         </button>
// //       </div>

// //       {/* Enhanced Order Details Modal */}
// //       {selectedOrder && (
// //         <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
// //           <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-700">
// //             <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-6 flex justify-between items-center sticky top-0 z-10">
// //               <div className="flex items-center space-x-4">
// //                 <FaShoppingCart className="text-2xl" />
// //                 <div>
// //                   <h2 className="text-2xl font-bold">Order Details</h2>
// //                   <p className="text-indigo-200 text-sm">Order ID: {selectedOrder._id}</p>
// //                 </div>
// //               </div>
// //               <button
// //                 onClick={handleCloseModal}
// //                 className="text-white hover:text-red-400 transition-colors duration-200 p-2 hover:bg-white hover:bg-opacity-10 rounded-full"
// //               >
// //                 <FaTimes size={24} />
// //               </button>
// //             </div>

// //             <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)] space-y-8">
// //               <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 border border-blue-700">
// //                 <h3 className="text-xl font-bold text-blue-300 mb-4 flex items-center">
// //                   <FaIdCard className="mr-3" />
// //                   Order Overview
// //                 </h3>
// //                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //                   <div className="space-y-3">
// //                     <div className="flex items-center space-x-3">
// //                       <FaCalendarAlt className="text-blue-400" />
// //                       <div>
// //                         <p className="text-sm text-gray-400">Order Date</p>
// //                         <p className="font-semibold">{formatDate(selectedOrder.createdAt)}</p>
// //                       </div>
// //                     </div>
// //                     <div className="flex items-center space-x-3">
// //                       <FaShoppingCart className="text-green-400" />
// //                       <div>
// //                         <p className="text-sm text-gray-400">Order Type</p>
// //                         <p className="font-semibold">{getOrderType(selectedOrder)}</p>
// //                       </div>
// //                     </div>
// //                   </div>
// //                   <div className="space-y-3">
// //                     <div className="flex items-center space-x-3">
// //                       <div
// //                         className={`w-3 h-3 rounded-full ${
// //                           selectedOrder.status === "DELIVERED"
// //                             ? "bg-green-500"
// //                             : selectedOrder.status === "PENDING"
// //                             ? "bg-yellow-500"
// //                             : selectedOrder.status === "PREPARED_FOR_DELIVERY"
// //                             ? "bg-blue-500"
// //                             : "bg-red-500"
// //                         }`}
// //                       ></div>
// //                       <div>
// //                         <p className="text-sm text-gray-400">Status</p>
// //                         <p className="font-semibold">{capitalizeFirstLetter(selectedOrder.status)}</p>
// //                       </div>
// //                     </div>
// //                     <div className="flex items-center space-x-3">
// //                       <FaCreditCard className="text-purple-400" />
// //                       <div>
// //                         <p className="text-sm text-gray-400">Payment Method</p>
// //                         <p className="font-semibold">{capitalizeFirstLetter(selectedOrder.paymentMethod || "N/A")}</p>
// //                       </div>
// //                     </div>
// //                   </div>
// //                   <div className="space-y-3">
// //                     <div className="flex items-center space-x-3">
// //                       <div className="text-yellow-400 font-bold text-lg">₹</div>
// //                       <div>
// //                         <p className="text-sm text-gray-400">Total Price</p>
// //                         <p className="font-bold text-xl text-green-400">₹{selectedOrder.totalPrice}</p>
// //                       </div>
// //                     </div>
// //                     <div className="flex items-center space-x-3">
// //                       <div
// //                         className={`w-3 h-3 rounded-full ${
// //                           selectedOrder.paymentStatus === "PAID" ? "bg-green-500" : "bg-red-500"
// //                         }`}
// //                       ></div>
// //                       <div>
// //                         <p className="text-sm text-gray-400">Payment Status</p>
// //                         <p className="font-semibold">{capitalizeFirstLetter(selectedOrder.paymentStatus || "N/A")}</p>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>

// //               <div className="bg-gradient-to-r from-green-900 to-emerald-900 rounded-2xl p-6 border border-green-700">
// //                 <h3 className="text-xl font-bold text-green-300 mb-4 flex items-center">
// //                   <FaShoppingCart className="mr-3" />
// //                   Item Details
// //                 </h3>
// //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                   <div className="space-y-4">
// //                     <div>
// //                       <p className="text-sm text-gray-400 mb-1">Item Name</p>
// //                       <p className="font-semibold text-lg">
// //                         {capitalizeFirstLetter(
// //                           selectedOrder.products?.[0]?.productId?.name ||
// //                             selectedOrder.auction?.[0]?.name ||
// //                             selectedOrder.fleetAuction?.[0]?.name ||
// //                             "N/A"
// //                         )}
// //                       </p>
// //                     </div>
// //                     <div>
// //                       <p className="text-sm text-gray-400 mb-1">Quantity</p>
// //                       <p className="font-semibold">
// //                         {selectedOrder.products?.[0]?.quantity ||
// //                           selectedOrder.auction?.[0]?.quantity ||
// //                           selectedOrder.fleetAuction?.[0]?.quantity ||
// //                           "N/A"}
// //                       </p>
// //                     </div>
// //                   </div>
// //                   <div>
// //                     <p className="text-sm text-gray-400 mb-1">Description</p>
// //                     <p className="font-medium text-gray-200 leading-relaxed">
// //                       {capitalizeFirstLetter(
// //                         selectedOrder.products?.[0]?.productId?.description ||
// //                           selectedOrder.auction?.[0]?.description ||
// //                           selectedOrder.fleetAuction?.[0]?.description ||
// //                           selectedOrder.description ||
// //                           "No description available"
// //                       )}
// //                     </p>
// //                   </div>
// //                 </div>
// //               </div>

// //               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
// //                 {selectedOrder.userId && (
// //                   <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-2xl p-6 border border-purple-700">
// //                     <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center">
// //                       <FaUser className="mr-3" />
// //                       Buyer Details
// //                     </h3>
// //                     <div className="space-y-3">
// //                       <div>
// //                         <p className="text-sm text-gray-400">Name</p>
// //                         <p className="font-semibold text-lg">
// //                           {capitalizeFirstLetter(selectedOrder.userId.firstName)}{" "}
// //                           {capitalizeFirstLetter(selectedOrder.userId.lastname || "")}
// //                         </p>
// //                       </div>
// //                       {selectedOrder.userId.email && (
// //                         <div className="flex items-center space-x-3">
// //                           <FaEnvelope className="text-purple-400" />
// //                           <div>
// //                             <p className="text-sm text-gray-400">Email</p>
// //                             <p className="font-semibold">{selectedOrder.userId.email}</p>
// //                           </div>
// //                         </div>
// //                       )}
// //                       {selectedOrder.userId.phoneNumber && (
// //                         <div className="flex items-center space-x-3">
// //                           <FaPhone className="text-purple-400" />
// //                           <div>
// //                             <p className="text-sm text-gray-400">Phone</p>
// //                             <p className="font-semibold">{selectedOrder.userId.phoneNumber}</p>
// //                           </div>
// //                         </div>
// //                       )}
// //                       {selectedOrder.userId.location && (
// //                         <div className="flex items-center space-x-3">
// //                           <FaMapMarkerAlt className="text-purple-400" />
// //                           <div>
// //                             <p className="text-sm text-gray-400">Location</p>
// //                             <p className="font-semibold">
// //                               {capitalizeFirstLetter(selectedOrder.userId.location.city || "")},{" "}
// //                               {capitalizeFirstLetter(selectedOrder.userId.location.state || "")}
// //                             </p>
// //                           </div>
// //                         </div>
// //                       )}
// //                     </div>
// //                   </div>
// //                 )}

// //                 {selectedOrder.seller && (
// //                   <div className="bg-gradient-to-r from-orange-900 to-red-900 rounded-2xl p-6 border border-orange-700">
// //                     <h3 className="text-xl font-bold text-orange-300 mb-4 flex items-center">
// //                       <FaStore className="mr-3" />
// //                       Seller Details
// //                     </h3>
// //                     <div className="space-y-3">
// //                       <div>
// //                         <p className="text-sm text-gray-400">Name</p>
// //                         <p className="font-semibold text-lg">
// //                           {capitalizeFirstLetter(selectedOrder.seller.firstName)}{" "}
// //                           {capitalizeFirstLetter(selectedOrder.seller.lastname || "")}
// //                         </p>
// //                       </div>
// //                       {selectedOrder.seller.email && (
// //                         <div className="flex items-center space-x-3">
// //                           <FaEnvelope className="text-orange-400" />
// //                           <div>
// //                             <p className="text-sm text-gray-400">Email</p>
// //                             <p className="font-semibold">{selectedOrder.seller.email}</p>
// //                           </div>
// //                         </div>
// //                       )}
// //                       {selectedOrder.seller.phoneNumber && (
// //                         <div className="flex items-center space-x-3">
// //                           <FaPhone className="text-orange-400" />
// //                           <div>
// //                             <p className="text-sm text-gray-400">Phone</p>
// //                             <p className="font-semibold">{selectedOrder.seller.phoneNumber}</p>
// //                           </div>
// //                         </div>
// //                       )}
// //                       {selectedOrder.seller.location && (
// //                         <div className="flex items-center space-x-3">
// //                           <FaMapMarkerAlt className="text-orange-400" />
// //                           <div>
// //                             <p className="text-sm text-gray-400">Location</p>
// //                             <p className="font-semibold">
// //                               {capitalizeFirstLetter(selectedOrder.seller.location.city || "")},{" "}
// //                               {capitalizeFirstLetter(selectedOrder.seller.location.state || "")}
// //                             </p>
// //                           </div>
// //                         </div>
// //                       )}
// //                     </div>
// //                   </div>
// //                 )}

// //                 {selectedOrder.fleetOwner && (
// //                   <div className="bg-gradient-to-r from-teal-900 to-cyan-900 rounded-2xl p-6 border border-teal-700">
// //                     <h3 className="text-xl font-bold text-teal-300 mb-4 flex items-center">
// //                       <FaTruck className="mr-3" />
// //                       Fleet Owner Details
// //                     </h3>
// //                     <div className="space-y-3">
// //                       <div>
// //                         <p className="text-sm text-gray-400">Name</p>
// //                         <p className="font-semibold text-lg">
// //                           {capitalizeFirstLetter(selectedOrder.fleetOwner.firstName)}{" "}
// //                           {capitalizeFirstLetter(selectedOrder.fleetOwner.lastname || "")}
// //                         </p>
// //                       </div>
// //                       {selectedOrder.fleetOwner.email && (
// //                         <div className="flex items-center space-x-3">
// //                           <FaEnvelope className="text-teal-400" />
// //                           <div>
// //                             <p className="text-sm text-gray-400">Email</p>
// //                             <p className="font-semibold">{selectedOrder.fleetOwner.email}</p>
// //                           </div>
// //                         </div>
// //                       )}
// //                       {selectedOrder.fleetOwner.phoneNumber && (
// //                         <div className="flex items-center space-x-3">
// //                           <FaPhone className="text-teal-400" />
// //                           <div>
// //                             <p className="text-sm text-gray-400">Phone</p>
// //                             <p className="font-semibold">{selectedOrder.fleetOwner.phoneNumber}</p>
// //                           </div>
// //                         </div>
// //                       )}
// //                       {selectedOrder.fleetOwner.fleetOwnerDetails && (
// //                         <div>
// //                           <p className="text-sm text-gray-400">Fleet Details</p>
// //                           <p className="font-semibold">
// //                             {capitalizeFirstLetter(
// //                               selectedOrder.fleetOwner.fleetOwnerDetails.companyName || "N/A"
// //                             )}
// //                           </p>
// //                         </div>
// //                       )}
// //                     </div>
// //                   </div>
// //                 )}

// //                 {selectedOrder.address && (
// //                   <div className="bg-gradient-to-r from-indigo-900 to-blue-900 rounded-2xl p-6 border border-indigo-700">
// //                     <h3 className="text-xl font-bold text-indigo-300 mb-4 flex items-center">
// //                       <FaMapMarkerAlt className="mr-3" />
// //                       Shipping Address
// //                     </h3>
// //                     <div className="space-y-3">
// //                       <div>
// //                         <p className="text-sm text-gray-400">Recipient</p>
// //                         <p className="font-semibold text-lg">
// //                           {capitalizeFirstLetter(selectedOrder.address.firstName)}
// //                         </p>
// //                       </div>
// //                       <div className="flex items-center space-x-3">
// //                         <FaPhone className="text-indigo-400" />
// //                         <div>
// //                           <p className="text-sm text-gray-400">Phone</p>
// //                           <p className="font-semibold">{selectedOrder.address.mobile}</p>
// //                         </div>
// //                       </div>
// //                       <div>
// //                         <p className="text-sm text-gray-400">Complete Address</p>
// //                         <p className="font-semibold leading-relaxed">
// //                           {capitalizeFirstLetter(selectedOrder.address.street)}
// //                           <br />
// //                           {capitalizeFirstLetter(selectedOrder.address.city)},{" "}
// //                           {capitalizeFirstLetter(selectedOrder.address.state)}
// //                           <br />
// //                           PIN: {selectedOrder.address.pincode}
// //                         </p>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 )}
// //               </div>

// //               {selectedOrder.commissionDetails && (
// //                 <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-600">
// //                   <h3 className="text-xl font-bold text-gray-300 mb-4">Commission Details</h3>
// //                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
// //                     <div className="text-center p-4 bg-blue-800 rounded-lg">
// //                       <p className="text-sm text-gray-300">Seller Rate</p>
// //                       <p className="text-xl font-bold text-blue-300">
// //                         {selectedOrder.commissionDetails.sellerRate}%
// //                       </p>
// //                     </div>
// //                     <div className="text-center p-4 bg-purple-800 rounded-lg">
// //                       <p className="text-sm text-gray-300">Buyer Rate</p>
// //                       <p className="text-xl font-bold text-purple-300">
// //                         {selectedOrder.commissionDetails.buyerRate}%
// //                       </p>
// //                     </div>
// //                     <div className="text-center p-4 bg-green-800 rounded-lg">
// //                       <p className="text-sm text-gray-300">Seller Charge</p>
// //                       <p className="text-xl font-bold text-green-300">
// //                         ₹{selectedOrder.commissionDetails.sellerCharge}
// //                       </p>
// //                     </div>
// //                     <div className="text-center p-4 bg-yellow-800 rounded-lg">
// //                       <p className="text-sm text-gray-300">Buyer Charge</p>
// //                       <p className="text-xl font-bold text-yellow-300">
// //                         ₹{selectedOrder.commissionDetails.buyerCharge}
// //                       </p>
// //                     </div>
// //                   </div>
// //                 </div>
// //               )}

// //               <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl p-6 border border-emerald-700">
// //                 <h3 className="text-xl font-bold text-emerald-300 mb-4 flex items-center">
// //                   <FaCreditCard className="mr-3" />
// //                   Transaction Details
// //                 </h3>
// //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                   <div className="space-y-3">
// //                     <div>
// //                       <p className="text-sm text-gray-400">Transaction ID</p>
// //                       <p className="font-semibold text-sm break-all">
// //                         {selectedOrder.transactionId || "N/A"}
// //                       </p>
// //                     </div>
// //                     <div>
// //                       <p className="text-sm text-gray-400">Payment Session ID</p>
// //                       <p className="font-semibold text-sm break-all">
// //                         {selectedOrder.paymentSessionId || "N/A"}
// //                       </p>
// //                     </div>
// //                   </div>
// //                   <div className="space-y-3">
// //                     <div>
// //                       <p className="text-sm text-gray-400">Last Updated</p>
// //                       <p className="font-semibold">{formatDate(selectedOrder.updatedAt)}</p>
// //                     </div>
// //                     <div>
// //                       <p className="text-sm text-gray-400">Payment Status</p>
// //                       <p
// //                         className={`font-semibold ${
// //                           selectedOrder.paymentStatus === "PAID" ? "text-green-400" : "text-red-400"
// //                         }`}
// //                       >
// //                         {capitalizeFirstLetter(selectedOrder.paymentStatus || "N/A")}
// //                       </p>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-4 border-t border-gray-700 flex justify-end sticky bottom-0">
// //               <button
// //                 className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center space-x-2 shadow-lg"
// //                 onClick={handleCloseModal}
// //               >
// //                 <FaTimes />
// //                 <span>Close</span>
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default OrderPage;
