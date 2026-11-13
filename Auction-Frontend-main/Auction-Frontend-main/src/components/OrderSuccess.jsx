import React, { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../axiosInstance";
import { fetchUserCountry } from "../store/countary/countrySlice";
const OrderSuccess = () => {
  const dispatch = useDispatch();
  const { productId, auctionId } = useParams(); // Add auctionId to params
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [isProcessing, setIsProcessing] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isAuctionOrder, setIsAuctionOrder] = useState(false);
  const { country, currency } = useSelector((state) => state.country);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  useEffect(() => {
    let isMounted = true;

    const confirmOrder = async () => {
      if (!isMounted) return;

      try {
        setIsProcessing(true);

        // Get session_id from URL
        const sessionId = new URLSearchParams(window.location.search).get(
          "session_id",
        );

        if (!sessionId) {
          toast.error("Session ID not found");
          setIsProcessing(false);
          return;
        }

        // Confirm the payment - backend handles both auction and product orders
        const response = await axiosInstance.post("/payments/confirm", {
          session_id: sessionId,
        });

        if (response.data.success) {
          const { order, transaction } = response.data.data;

          // Determine if this is an auction order
          const isAuction = order.auction && order.auction.length > 0;
          setIsAuctionOrder(isAuction);
          setOrderDetails(order);

          if (isAuction) {
            toast.success("Auction payment confirmed successfully! 🎉");
          } else {
            toast.success("Product payment confirmed successfully! ✅");
          }
        } else {
          toast.error("Payment confirmation failed");
        }
      } catch (err) {
        console.error("Error confirming payment:", err);
        toast.error(err.response?.data?.message || "Failed to confirm payment");
      } finally {
        if (isMounted) {
          setIsProcessing(false);
        }
      }
    };

    if (user) {
      confirmOrder();
    } else {
      toast.error("Please login to view order status");
      navigate("/login");
    }

    return () => {
      isMounted = false;
    };
  }, [navigate, productId, auctionId, user]);

  const getOrderTitle = () => {
    if (isProcessing) return "Processing Your Payment...";
    return isAuctionOrder ? "🎉 Auction Won!" : "🎉 Order Successful!";
  };

  const getOrderMessage = () => {
    if (isAuctionOrder) {
      return "Congratulations! You've successfully won the auction and your payment has been processed.";
    }
    return "Thank you for your purchase. Your order has been confirmed.";
  };

  const getOrderItemName = () => {
    if (!orderDetails) return "";

    if (isAuctionOrder && orderDetails.auction?.[0]) {
      return orderDetails.auction[0].name || "Auction Item";
    } else if (orderDetails.products?.[0]) {
      return orderDetails.products[0].name || "Product";
    }
    return "";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 text-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          {getOrderTitle()}
        </h1>

        {isProcessing ? (
          <div className="mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">
              Please wait while we confirm your payment...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-lg mb-3 text-gray-700">{getOrderMessage()}</p>

              {orderDetails && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {isAuctionOrder ? "Auction Details:" : "Order Details:"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    <strong>Item:</strong> {getOrderItemName()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Total Amount:</strong> {currency}{" "}
                    {orderDetails.totalPrice}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Payment Status:</strong>
                    <span className="text-green-600 font-medium">
                      {" "}
                      {orderDetails.paymentStatus}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Order Status:</strong>
                    <span className="text-blue-600 font-medium">
                      {" "}
                      {orderDetails.status}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => navigate("/MyOrder")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {isAuctionOrder ? "View My Auctions" : "View My Orders"}
              </button>

              <button
                onClick={() => navigate("/our-products")}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Continue Shopping
              </button>

              {isAuctionOrder && (
                <button
                  onClick={() => navigate("/auctions")}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Browse More Auctions
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderSuccess;
