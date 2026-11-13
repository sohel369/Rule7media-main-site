import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { placeOrderAsync } from "../store/order/OrderSlice";
import { loadStripe } from "@stripe/stripe-js";
import axiosInstance from "../axiosInstance";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY ||
    "pk_test_51RI0UFFM11eA9IXhRNiYDYNjKlfeJSNKp3uUmMpp3ujQiKW8zvoCAWkIgR4LW2bidkil06NsitcsLmtJYS1oY8kU00O3QRpodm"
);

const ChoosePaymentMethod = () => {
  const [selectedMethod, setSelectedMethod] = useState("COD");
  const [upiId, setUpiId] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const userId = useSelector((state) => state.auth?.user?._id);
  const address = useSelector((state) => state.cart.address);
  const cartItems = useSelector((state) => state.cart.items);
  const totalPrice = useSelector((state) => state.cart.totalPrice);

  const handleContinue = async () => {
    if (!userId) {
      alert("Please log in first!");
      navigate("/login");
      return;
    }

    if (
      !address.firstName ||
      !address.mobile ||
      !address.street ||
      !address.city ||
      !address.pincode
    ) {
      alert("Please fill all address details!");
      return;
    }

    const products = cartItems.map((item) => ({
      productId: item._id,
      quantity: item.quantity,
      image: Array.isArray(item.imageUrl) ? item.imageUrl : [item.imageUrl],
    }));
    const stripeAmount = Math.round(parseFloat(totalPrice) * 100);
    if (stripeAmount > 99999999) {
      alert(
        "Total order amount exceeds the maximum limit allowed for online payment.",
      );
      return;
    }
    const orderData = {
      userId,
      products,
      totalPrice: parseFloat(totalPrice),
      paymentMethod: selectedMethod.toUpperCase(),
      description: `Order for ${products.length} item(s)`,
      address: {
        firstName: address.firstName,
        mobile: address.mobile,
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },
    };

    try {
      if (selectedMethod === "COD") {
        await dispatch(placeOrderAsync(orderData)).unwrap();
        alert("Order placed successfully!");
        navigate("/MyOrder", { replace: true });
      } else if (selectedMethod === "UPI") {
        if (!upiId) {
          alert("Please enter a valid UPI ID.");
          return;
        }

        navigate(`/checkout${location.search}`, {
          state: {
            paymentMethod: "UPI",
            upiId,
            orderData,
          },
        });
      } else if (selectedMethod === "CARD") {
        const response = await axiosInstance.post(
          "/payments/create-checkout-session",
          {
            productName: "Cart Items",
            amount: stripeAmount,
            quantity: products.length,
            productId: products[0]?.productId,
            address: orderData.address,
            description: orderData.description,
          },
          { withCredentials: true },
        );

        const stripe = await stripePromise;
        await stripe.redirectToCheckout({ sessionId: response.data.id });
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order: " + (error?.message || "Unknown error"));
    }
  };

  return (
    <div className="p-5 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8">
      <div className="md:w-1/2">
        <h2 className="text-xl font-bold mb-4">Choose Payment Method</h2>
        <div className="flex flex-col space-y-4">
          {["COD", "UPI", "CARD"].map((method) => (
            <label key={method} className="flex items-center space-x-2">
              <input
                type="radio"
                name="payment"
                value={method}
                checked={selectedMethod === method}
                onChange={() => setSelectedMethod(method)}
              />
              <span>{method}</span>
            </label>
          ))}
        </div>

        <button
          onClick={handleContinue}
          className="mt-6 bg-green-600 text-white px-4 py-2 rounded"
        >
          Continue to Checkout
        </button>
      </div>

      {/* Conditional Input Area */}
      <div className="md:w-1/2 bg-gray-100 p-5 rounded shadow">
        {selectedMethod === "UPI" && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Enter your UPI ID</h3>
            <input
              type="text"
              placeholder="example@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        )}

        {selectedMethod === "CARD" && (
          <div className="bg-white border-l-4 border-blue-500 p-4 rounded shadow">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">
              Stripe Payment
            </h3>
            <p className="text-gray-700">
              You will be redirected to Stripe for secure card payment. Please
              ensure your card details are ready.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChoosePaymentMethod;
