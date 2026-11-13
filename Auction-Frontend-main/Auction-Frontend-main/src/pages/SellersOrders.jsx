import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  fetchSellerOrders,
  fetchOrderSummary,
  updateOrderStatus,
  getOrderfleetownerSummary,
} from "../store/sellerOrder/sellerOrderSlice";
import socket from "../socket";
import {
  FaEye,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaBoxOpen,
} from "react-icons/fa";
import { messaging, generateToken, onMessageListener } from "../firebase";
import { fetchUserCountry } from "../store/countary/countrySlice";
import { HeaderLeaderboard } from "../components/AdSlots";

const OrderPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { country, currency } = useSelector((state) => state.country);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlFilter = searchParams.get("status")?.toUpperCase() || "ALL";

  const { user } = useSelector((state) => state.auth);
  const orderState = useSelector((state) => state.sellerOrders);
  const {
    orders: initialOrders,
    totalPages,
    currentPage,
  } = orderState.ordersResponse || {
    orders: [],
    totalPages: 1,
    currentPage: 1,
  };
  const { status, error, ordersSummary, fleetordersSummary } = orderState;

  const userId = user?._id;
  const userType = user?.userType;
  const [orders, setOrders] = useState(initialOrders);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [displayPage, setDisplayPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [updatingOrders, setUpdatingOrders] = useState(new Set()); // Track updating orders

  // Initialize Firebase notifications
  useEffect(() => {
    generateToken()
      .then((token) => {
        if (token) {
        }
      })
      .catch((error) => console.error("Error generating token:", error));

    onMessageListener()
      .then((payload) => {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("New Notification", {
            body: payload.notification.body,
            icon: "/path/to/icon.png",
          });
        } else if (
          "Notification" in window &&
          Notification.permission !== "denied"
        ) {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification("New Notification", {
                body: payload.notification.body,
                icon: "/path/to/icon.png",
              });
            }
          });
        } else {
          console.warn("Browser does not support notifications.");
          alert(`New Notification: ${payload.notification.body}`);
        }
      })
      .catch((error) => console.error("Error in onMessageListener:", error));
  }, []);
  useEffect(() => {
    if (location.state?.defaultFilter) {
      setFilterStatus(location.state.defaultFilter);
      setDisplayPage(1);
    }
  }, [location.state]);
  // Fetch user country if not available
  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  // Fetch orders and summaries based on userType
  useEffect(() => {
    if (userId && userType) {
      if (userType === "seller") {
        dispatch(fetchOrderSummary(userId));
        dispatch(fetchSellerOrders({ page: displayPage, userId }));
      } else if (userType === "fleetOwner") {
        dispatch(getOrderfleetownerSummary(userId));
        dispatch(fetchSellerOrders({ page: displayPage, userId }));
      }
    }
  }, [dispatch, userId, userType, displayPage]);

  // Update local orders state when Redux state changes
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  // Socket listener for real-time order status updates
  useEffect(() => {
    socket.on("orderStatusUpdate", (data) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === data.orderId ? { ...order, status: data.status } : order,
        ),
      );
    });

    return () => {
      socket.off("orderStatusUpdate");
    };
  }, []);
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);
  useEffect(() => {
    const statusFromUrl = searchParams.get("status")?.toUpperCase();
    if (statusFromUrl && statusFromUrl !== filterStatus) {
      setFilterStatus(statusFromUrl);
      setDisplayPage(1);
    }
  }, [searchParams]);
  const filteredOrders = useMemo(() => {
    if (filterStatus === "ALL") return orders;

    if (filterStatus === "Cancle") {
      return orders.filter(
        (order) =>
          order.status === "Cancle" ||
          order.status === "CANCELED" ||
          order.status?.toUpperCase() === "CANCELED",
      );
    }

    return orders.filter(
      (order) => order.status?.toUpperCase() === filterStatus,
    );
  }, [orders, filterStatus]);
  const handleCloseModal = () => setSelectedOrder(null);

  // Helper function to get product info consistently
  const getOrderProductInfo = (order) => {
    if (!order) {
      return { name: "N/A", quantity: "N/A", price: "N/A", image: null };
    }

    // ✅ Check for products array
    if (order.products?.length > 0 && order.products[0]) {
      const product = order.products[0];
      return {
        name: product.name || "Product Name N/A",
        quantity: product.quantity || order.quantity || 1,
        price: product.price || order.amount || order.totalAmount || "0.00",
        image: product.image || product.mainImage || null,
      };
    }
    // ✅ Check for auction items
    else if (order.auctionItems?.length > 0 && order.auctionItems[0]) {
      const auctionItem = order.auctionItems[0];
      return {
        name: auctionItem.name || auctionItem.auction?.name || "Auction Item",
        quantity: auctionItem.quantity || 1,
        price:
          auctionItem.price || auctionItem.bidAmount || order.amount || "0.00",
        image: auctionItem.image || auctionItem.auction?.images?.[0] || null,
      };
    } else if (order.fleetAuction?.length > 0 && order.fleetAuction[0]) {
      const fleetAuction = order.fleetAuction[0];
      return {
        name:
          fleetAuction.vehicleModel || fleetAuction.company || "Fleet Vehicle",
        quantity: fleetAuction.quantity || 1,
        price: order.amount || fleetAuction.bidAmount || "0.00",
        image: fleetAuction.images?.[0]?.url || fleetAuction.mainImage || null,
      };
    }
    // ✅ Check for single auction
    else if (order.auction) {
      return {
        name: order.auction.name || "Auction Item",
        quantity: order.quantity || 1,
        price: order.amount || order.auction.price || "0.00",
        image: order.auction.images?.[0] || null,
      };
    }
    // ✅ Check for single fleet auction
    else if (order.fleetAuction) {
      return {
        name:
          order.fleetAuction.vehicleModel ||
          order.fleetAuction.company ||
          "Fleet Vehicle",
        quantity: order.quantity || 1,
        price: order.amount || order.fleetAuction.bidAmount || "0.00",
        image:
          order.fleetAuction.images?.[0]?.url ||
          order.fleetAuction.mainImage ||
          null,
      };
    }
    // ✅ Fallback to order level data
    else {
      return {
        name: order.productName || "Order Item",
        quantity: order.quantity || 1,
        price: order.amount || order.totalAmount || "0.00",
        image: null,
      };
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const order = orders.find((order) => order.id === orderId);
    if (!order) {
      console.error("Order not found.");
      return;
    }

    // Validate required data
    if (!order.buyer && !order.address) {
      console.error("User data is missing in the order.");
      return;
    }

    const fcmToken = await generateToken();
    if (!fcmToken) {
      console.error("FCM Token is missing.");
      return;
    }

    const buyerCountry = order.buyer?.country || order.address?.country || "US";

    // ✅ Store complete original order data for rollback
    const originalOrder = JSON.parse(JSON.stringify(order));

    // Add to updating set to show loading
    setUpdatingOrders((prev) => new Set(prev).add(orderId));

    // ✅ Optimistically update ONLY the status field, preserve all other data
    setOrders((prevOrders) =>
      prevOrders.map((o) =>
        o.id === orderId ? { ...o, status: newStatus } : o,
      ),
    );

    try {
      const result = await dispatch(
        updateOrderStatus({
          orderId,
          status: newStatus,
          fcmToken,
          [userType === "seller" ? "sellerId" : "fleetOwnerId"]: userId,
          buyerData: order.buyer || {},
          buyerCountry,
        }),
      ).unwrap();

      // ✅ If API returns updated order, use it to update the state
      if (result && result.updatedOrder) {
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.id === orderId ? { ...o, ...result.updatedOrder } : o,
          ),
        );
      } else {
        // ✅ If no updated order returned, refresh the orders list to get fresh data
        dispatch(fetchSellerOrders({ page: displayPage, userId })).then(
          (action) => {
            if (action.payload && action.payload.orders) {
              setOrders(action.payload.orders);
            }
          },
        );
      }

      // Fetch updated summary (don't wait for this)
      if (userType === "seller") {
        dispatch(fetchOrderSummary(userId));
      } else if (userType === "fleetOwner") {
        dispatch(getOrderfleetownerSummary(userId));
      }

      // Emit socket notification
      if (order.buyer?.id) {
        socket.emit("orderStatusUpdate", {
          userId: order.buyer.id,
          orderId,
          message: `Your order has been marked as '${newStatus}'`,
          status: newStatus,
          fcmToken,
        });
      }
    } catch (err) {
      console.error("API Error:", err);

      // ✅ Revert optimistic update on error - restore complete original order
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o.id === orderId ? originalOrder : o)),
      );

      // Show error message to user
      alert(`Failed to update order status: ${err.message || "Unknown error"}`);
    } finally {
      // Remove from updating set
      setUpdatingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setDisplayPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getStatusColor = (status, isFocused = false) => {
    if (isFocused) return "#3b82f6";
    switch (status) {
      case "DELIVERED":
        return "#16a34a";
      case "PENDING":
        return "#eab308";
      case "PREPARE_FOR_DELIVERY":
        return "#3b82f6";
      case "Cancle":
        return "#8B0000";
      default:
        return "transparent";
    }
  };

  const capitalizeFirstLetter = (str) => {
    if (!str || str === "") return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Safe data access for rendering
  const SafeOrderData = ({ order, children }) => {
    const productInfo = getOrderProductInfo(order);

    // ✅ Ensure we always have valid data
    const safeProductInfo = {
      name: productInfo.name || "Product Name N/A",
      quantity: productInfo.quantity || 1,
      price:
        typeof productInfo.price === "number"
          ? productInfo.price.toFixed(2)
          : productInfo.price || "0.00",
      image: productInfo.image,
    };

    return children(safeProductInfo);
  };

  if (!userId)
    return <div className="text-center py-4">Loading user information...</div>;
  if (status === "loading" && orders.length === 0)
    return <div className="text-center py-4">Loading orders...</div>;
  if (status === "failed")
    return <div className="text-center py-4">Error: {error}</div>;

  // Empty Message
  const getEmptyMessage = () => {
    switch (filterStatus) {
      case "DELIVERED":
        return "No Delivered Orders";
      case "PENDING":
        return "No Pending Orders";
      case "PREPARE_FOR_DELIVERY":
        return "No Orders Preparing for Delivery";
      case "Cancle":
        return "No Cancel Orders";
      default:
        return "No Orders Found";
    }
  };
  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setDisplayPage(1);

    if (status === "ALL") {
      setSearchParams({});
    } else {
      setSearchParams({ status: status.toUpperCase() });
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const summary = userType === "seller" ? ordersSummary : fleetordersSummary;

  return (
    <div className="overflow-auto px-7 py-4 w-full bg-theme-bg text-white rounded-2xl">
      <div className="flex items-center gap-6 mb-5">
        <h1 className="text-white font-bold text-xl border-b border-border-info-color pb-3 whitespace-nowrap">
          {userType === "seller" ? "Seller Orders" : "Fleet Owner Orders"}
        </h1>

        <HeaderLeaderboard />
      </div>
      {summary && (
        <div className="grid grid-cols-5 gap-4 mb-5 items-stretch">
          <div
            className={`bg-blue-500 text-white px-4 py-3 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:opacity-90 transition ${
              filterStatus === "ALL" ? "ring-2 ring-white" : ""
            }`}
            onClick={() => handleFilterChange("ALL")}
          >
            <FaClipboardList className="text-white text-2xl mb-2" />
            <h2 className="text-sm font-bold mb-1">Total Orders</h2>
            <span className="text-xl font-extrabold">
              {summary.totalOrders || 0}
            </span>
          </div>

          <div
            className={`bg-green-500 text-white px-4 py-3 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:opacity-90 transition ${
              filterStatus === "DELIVERED" ? "ring-2 ring-white" : ""
            }`}
            onClick={() => handleFilterChange("DELIVERED")}
          >
            <FaCheckCircle className="text-white text-2xl mb-2" />
            <h2 className="text-sm font-bold mb-1">Completed Orders</h2>
            <span className="text-xl font-extrabold">
              {summary.deliveredOrders || summary.delivered || 0}
            </span>
          </div>

          {/* Pending */}
          <div
            className={`bg-yellow-500 text-white px-4 py-3 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:opacity-90 transition ${
              filterStatus === "PENDING" ? "ring-2 ring-white" : ""
            }`}
            onClick={() => handleFilterChange("PENDING")}
          >
            <FaClock className="text-white text-2xl mb-2" />
            <h2 className="text-sm font-bold mb-1">Pending Orders</h2>
            <span className="text-xl font-extrabold">
              {summary.pendingOrders || summary.pending || 0}
            </span>
          </div>

          {/* Prepare for Delivery */}
          <div
            className={`bg-purple-500 text-white px-4 py-3 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:opacity-90 transition ${
              filterStatus === "PREPARE_FOR_DELIVERY" ? "ring-2 ring-white" : ""
            }`}
            onClick={() => handleFilterChange("PREPARE_FOR_DELIVERY")}
          >
            <FaBoxOpen className="text-white text-2xl mb-2" />
            <h2 className="text-sm font-bold mb-1">Prepare For Delivery</h2>
            <span className="text-xl font-extrabold">
              {summary.preparedOrders || summary.shipped || 0}
            </span>
          </div>

          {/* Canceled */}
          <div
            className={`bg-red-500 text-white px-4 py-3 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:opacity-90 transition ${
              filterStatus === "CANCELED" ? "ring-2 ring-white" : ""
            }`}
            onClick={() => handleFilterChange("CANCELED")}
          >
            <FaBoxOpen className="text-white text-2xl mb-2" />
            <h2 className="text-sm font-bold mb-1">Canceled Orders</h2>
            <span className="text-xl font-extrabold">
              {summary.Cancle || summary.CancleOrders || 0}
            </span>
          </div>
        </div>
      )}

      <div className="overflow-auto px-4 rounded-2xl border border-border-info-color mt-4 max-h-[700px]">
        {filteredOrders.length > 0 ? (
          <table className="text-left whitespace-nowrap w-full border-separate border-spacing-x-0 border-spacing-y-4">
            <thead className="sticky top-0 bg-gradient-to-r from-purple-700 to-indigo-900 text-white font-bold text-lg uppercase tracking-wider shadow-xl rounded-t-lg">
              <tr>
                <th className="p-3 border-b border-indigo-600 first:rounded-tl-lg">
                  Order ID
                </th>
                <th className="p-3 border-b border-indigo-600">Order Date</th>
                <th className="p-3 border-b border-indigo-600">Product Name</th>
                <th className="p-3 border-b border-indigo-600">Quantity</th>
                <th className="p-3 border-b border-indigo-600">Status</th>
                <th className="p-3 border-b border-indigo-600">Total Price</th>
                <th className="p-3 border-b border-indigo-600 text-center last:rounded-tr-lg">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => {
                const isUpdating = updatingOrders.has(order.id);

                return (
                  <SafeOrderData key={order.id} order={order}>
                    {(productInfo) => (
                      <tr
                        className={`border-b border-blue-400 ${
                          index % 2 === 0 ? "bg-theme-bg" : "bg-gray-700"
                        } hover:bg-gray-500 transition ${isUpdating ? "opacity-70" : ""}`}
                      >
                        <td className="px-6 py-4">{order.id || "N/A"}</td>
                        <td className="px-6 py-4">
                          {order.date
                            ? new Date(order.date).toLocaleDateString()
                            : order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString()
                              : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          {capitalizeFirstLetter(productInfo.name)}
                        </td>
                        <td className="px-6 py-4">{productInfo.quantity}</td>
                        <td className="px-4 py-2">
                          {order.status === "Cancle" ||
                          order.status === "CANCELED" ? (
                            <div className="text-center">
                              <span
                                className="text-white px-3 py-1 rounded-lg"
                                style={{
                                  backgroundColor: getStatusColor(order.status),
                                }}
                              >
                                Cancel
                              </span>
                              <p className="text-sm text-gray-400 mt-1">
                                This order canceled by admin
                              </p>
                            </div>
                          ) : (
                            <div className="border border-indigo-600 rounded-lg max-w-[130px] mx-auto">
                              <select
                                className={`text-white px-3 py-1 rounded-lg w-full text-center ${isUpdating ? "cursor-not-allowed" : "cursor-pointer"}`}
                                value={order.status || "PENDING"}
                                onChange={(e) =>
                                  !isUpdating &&
                                  handleStatusChange(order.id, e.target.value)
                                }
                                style={{
                                  backgroundColor: getStatusColor(order.status),
                                }}
                                onFocus={(e) => {
                                  e.target.style.backgroundColor =
                                    getStatusColor(order.status, true);
                                }}
                                onBlur={(e) => {
                                  e.target.style.backgroundColor =
                                    getStatusColor(order.status);
                                }}
                                disabled={isUpdating}
                              >
                                <option value="PENDING">Pending</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="PREPARE_FOR_DELIVERY">
                                  Prepare for delivery
                                </option>
                              </select>
                              {isUpdating && (
                                <div className="text-xs text-center mt-1 text-yellow-400">
                                  Updating...
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {currency} {productInfo.price}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
                            onClick={() => setSelectedOrder(order)}
                            disabled={isUpdating}
                          >
                            <FaEye size={20} />
                          </button>
                        </td>
                      </tr>
                    )}
                  </SafeOrderData>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="mt-4 text-center text-gray-400 py-20 text-xl font-medium">
            {getEmptyMessage()}
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination mt-4 flex justify-center items-center gap-4">
          <button
            onClick={() => handlePageChange(displayPage - 1)}
            disabled={displayPage === 1}
            className="px-4 py-2 bg-blue-600 rounded disabled:bg-gray-600"
          >
            Previous
          </button>
          <span className="font-medium">
            Page {displayPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(displayPage + 1)}
            disabled={displayPage === totalPages}
            className="px-4 py-2 bg-blue-600 rounded disabled:bg-gray-600"
          >
            Next
          </button>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-theme-bg text-slate-300 p-8 rounded-2xl shadow-2xl w-[700px] max-w-[90%] border border-indigo-500">
            <h2 className="text-2xl font-bold text-center text-white bg-gradient-to-r from-indigo-700 to-purple-800 py-3 rounded-t-2xl">
              Order Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
              <div className="space-y-3">
                <div className="p-4 bg-gray-800 rounded-lg shadow-sm">
                  <p className="font-bold text-blue-400">Order Information</p>
                  <SafeOrderData order={selectedOrder}>
                    {(productInfo) => (
                      <>
                        <p>
                          <strong>Product:</strong>{" "}
                          {capitalizeFirstLetter(productInfo.name)}
                        </p>
                        <p>
                          <strong>Price: {currency}</strong> {productInfo.price}
                        </p>
                      </>
                    )}
                  </SafeOrderData>
                  <p>
                    <strong>Status:</strong> {selectedOrder.status}
                  </p>
                  <p>
                    <strong>Payment Method:</strong>{" "}
                    {selectedOrder.paymentMethod || "N/A"}
                  </p>
                </div>

                <div className="p-4 bg-gray-800 rounded-lg shadow-sm">
                  <p className="font-bold text-purple-400">Buyer Information</p>
                  <p>
                    <strong>Name:</strong>{" "}
                    {capitalizeFirstLetter(selectedOrder.buyer?.name || "N/A")}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {selectedOrder.buyer?.email || "N/A"}
                  </p>
                </div>
              </div>

              {selectedOrder.address && (
                <div className="p-4 bg-gray-800 rounded-lg shadow-sm">
                  <p className="font-bold text-green-400">Shipping Address</p>
                  <p>
                    <strong>Name:</strong>{" "}
                    {capitalizeFirstLetter(selectedOrder.address.firstName)}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedOrder.address.mobile}
                  </p>
                  <p>
                    <strong>Street:</strong>{" "}
                    {capitalizeFirstLetter(selectedOrder.address.street)}
                  </p>
                  <p>
                    <strong>City:</strong>{" "}
                    {capitalizeFirstLetter(selectedOrder.address.city)}
                  </p>
                  <p>
                    <strong>State:</strong>{" "}
                    {capitalizeFirstLetter(selectedOrder.address.state)}
                  </p>
                  <p>
                    <strong>Zip Code:</strong>{" "}
                    {capitalizeFirstLetter(selectedOrder.address.pincode)}
                  </p>
                </div>
              )}
            </div>

            <SafeOrderData order={selectedOrder}>
              {(productInfo) =>
                productInfo.image && (
                  <div className="mt-5">
                    <p className="font-bold text-blue-400 mb-2">
                      Product Image
                    </p>
                    <div className="flex justify-center">
                      <img
                        src={productInfo.image}
                        alt={productInfo.name || "Product"}
                        className="max-h-40 object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )
              }
            </SafeOrderData>

            <div className="flex justify-end mt-6">
              <button
                className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                onClick={handleCloseModal}
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
