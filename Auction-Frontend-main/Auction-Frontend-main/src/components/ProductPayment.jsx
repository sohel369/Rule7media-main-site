import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import axiosInstance from "../axiosInstance";
import { useSelector, useDispatch } from "react-redux";
import { getCurrentUser } from "../store/auth/authSlice";
import { toast } from "react-toastify";

const stripePromise = loadStripe(
  "pk_test_51RI0UFFM11eA9IXhRNiYDYNjKlfeJSNKp3uUmMpp3ujQiKW8zvoCAWkIgR4LW2bidkil06NsitcsLmtJYS1oY8kU00O3QRpodm",
);

const Productpayment = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [productName, setProductName] = useState("Auction Product #123");
  const [amount, setAmount] = useState(100); // in USD
  const [quantity, setQuantity] = useState(1);
  const [productId] = useState("abc123");

  useEffect(() => {
    dispatch(getCurrentUser());
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axiosInstance.post(
        "/orders/create-checkout-session",
        {
          productName,
          amount,
          quantity,
          productId,
        },
        {
          withCredentials: true,
        },
      );

      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: response.data.id });
    } catch (error) {
      console.error(error);
      toast.error("Failed to initiate Stripe checkout");
    }
  };

  return (
    <div className="px-7 pt-4 pb-10 w-full bg-theme-bg rounded-2xl">
      <h1 className="text-white font-bold text-xl border-b border-border-info-color pb-3 mb-5">
        Order Product
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:w-[450px] gap-3"
      >
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Product Name"
          required
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="Amount in USD"
          required
        />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          placeholder="Quantity"
          required
        />
        <button
          type="submit"
          className="bg-theme-color text-white px-3 py-4 rounded-xl font-bold"
        >
          Buy Now
        </button>
      </form>
    </div>
  );
};

export default Productpayment;
