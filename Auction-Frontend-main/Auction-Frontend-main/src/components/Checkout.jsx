import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { placeOrderAsync, placeauctionOrder } from "../store/order/OrderSlice";
import {
  getSingleAuctionById,
  reset as resetAuction,
} from "../store/auction/auctionSlice";
import axiosInstance from "../axiosInstance";
import {
  FaLock,
  FaShoppingCart,
  FaCreditCard,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { fetchCommission, reset } from "../store/commission/commissionSlice";
import {
  ShoppingCart,
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  Lock,
  ChevronLeft,
  ChevronRight,
  Banknote,
} from "lucide-react";
import { fetchUserCountry } from "../store/countary/countrySlice";

const Checkout = () => {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Selectors
  const { orders, status, error } = useSelector((state) => state.order);
  const { country, currency } = useSelector((state) => state.country);
  const user = useSelector((state) => state.auth.user);

  const { commission, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.commission,
  );
  const userId = user ? user._id : null;
  const userName = user ? user.firstName : "";
  const userMobile = user ? user.telephoneNumber : "";
  const userEmail = user ? user.email : "";

  const subscriptionPlan = user?.subscription.durationMonths;

  const searchParams = new URLSearchParams(location.search);
  const initialPaymentMethod = searchParams.get("payment") || "CARD";
  const wrapType =
    searchParams.get("wrapType") || location.state?.wrapType || "";

  const description =
    searchParams.get("description") || "No description available.";
  const isAuction =
    searchParams.get("isAuction") === "true" ||
    location.state?.isAuction === true ||
    false;
  const isFleetAuction =
    searchParams.get("isFleetAuction") === "true" ||
    location.state?.isFleetAuction === true;

  const productName = searchParams.get("name");
  const productPrice = parseFloat(searchParams.get("price")) || 0;
  const quantity = parseInt(searchParams.get("quantity")) || 1;
  const imageUrl = searchParams.get("image");

  // State hooks
  const [loading, setLoading] = useState(isAuction ? true : false);
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod);
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [auction, setAuction] = useState(null);
  const [address, setAddress] = useState({
    firstName: userName || "",
    mobile: userMobile || "",
    email: userEmail || "",
    street: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });

  // Constants
  const MINIMUM_ONLINE_PAYMENT_AMOUNT = 42;
  const STRIPE_MINIMUM_AMOUNT_USD = 0.5;

  const sliders = [
    {
      id: 1,
      title: "Employee Satisfaction",
      content: (
        <>
          Operators of branded vehicles frequently report elevated levels of job
          satisfaction,
          <br />
          which contributes to a reduction in employee turnover rates.
        </>
      ),
      bgColor: "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800",
      accentColor: "from-blue-400 to-cyan-300",
    },
    {
      id: 2,
      title: "Theft Deterrence",
      content: (
        <>
          Vehicles with visible markings are substantially less likely to be
          stolen,
          <br />
          as such assets are more easily traceable and therefore typically
          avoided by thieves.
        </>
      ),
      bgColor: "bg-gradient-to-br from-green-600 via-green-700 to-green-800",
      accentColor: "from-green-400 to-emerald-300",
    },
    {
      id: 3,
      title: "Enhanced Fleet Resale Value",
      content: (
        <>
          Vinyl wraps provide protection to vehicle paintwork from chips and
          scratches.
          <br />
          Upon removal of these wraps, vehicles can be restored to an almost new
          condition,
          <br />
          significantly improving their resale value.
        </>
      ),
      bgColor: "bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800",
      accentColor: "from-purple-400 to-pink-300",
    },
    {
      id: 4,
      title: "Reduced Insurance Costs",
      content: (
        <>
          Vehicles wrapped in bright, noticeable colors are more visible to
          other road users,
          <br />
          resulting in fewer collisions and, consequently,
          <br />a reduction in insurance claims.
        </>
      ),
      bgColor: "bg-gradient-to-br from-orange-600 via-red-600 to-pink-600",
      accentColor: "from-orange-400 to-red-300",
    },
    {
      id: 5,
      title: "Optimized Fleet Renewal and Efficiency",
      content: (
        <>
          The additional advertising revenue generated enables fleet owners to
          replace vehicles more frequently.
          <br />
          This practice leads to the adoption of vehicles that are more
          fuel-efficient and environmentally sustainable.
        </>
      ),
      bgColor: "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800",
      accentColor: "from-blue-400 to-cyan-300",
    },
  ];

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);
  // useEffect hooks
  useEffect(() => {
    dispatch(fetchCommission());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        mobile: user.telephoneNumber || "",
        email: user.email || "",
        street: `${user.street1 || ""} ${user.street2 || ""}`.trim(),
        city: user.city || "",
        state: user.state || "",
        country: user.country || "",
        pincode: user.postalCode || user.location?.zip || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (isAuction && id) {
      const fetchAuctionData = async () => {
        try {
          const response = await axiosInstance.get(`/auctions/${id}`);
          setAuction(response.data);
        } catch (error) {
          console.error("Error fetching auction:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAuctionData();
    }
  }, [isAuction, id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setCurrentSlide((prev) => (prev === sliders.length - 1 ? 0 : prev + 1));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [sliders.length, isPaused]);
  const getPlanKey = (plan) => {
    switch (Number(plan)) {
      case 3:
        return "threeMonth";
      case 6:
        return "sixMonth";
      case 12:
        return "twelveMonth";
      default:
        return null;
    }
  };

  // Helper functions
  const calculateTotals = () => {
    const basePrice = isAuction
      ? auction?.bidAmount || productPrice
      : productPrice;

    const subtotal = basePrice * quantity;

    const planKey = getPlanKey(subscriptionPlan);

    // check correct object
    const commissionRate =
      planKey && commission?.[planKey] !== undefined ? commission[planKey] : 0;

    const commissionCharge = subtotal * (commissionRate / 100);
    const total = subtotal + commissionCharge;

    return {
      basePrice,
      subtotal,
      commissionCharge,
      total,
      commissionRate,
      subscriptionPlan,
    };
  };

  const { basePrice, subtotal, commissionRate, commissionCharge, total } =
    calculateTotals();

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const validateCheckoutData = (data) => {
    const errors = [];
    if (!data.productName || typeof data.productName !== "string") {
      errors.push("Product name is required");
    } else if (data.productName.length > 100) {
      errors.push("Product name must be less than 100 characters");
    }
    if (isNaN(data.amount) || data.amount <= 0) {
      errors.push("Invalid amount");
    }
    if (!data.address || typeof data.address !== "object") {
      errors.push("Address is required");
    } else {
      const requiredAddressFields = [
        "street",
        "city",
        "state",
        "country",
        "pincode",
      ];
      for (const field of requiredAddressFields) {
        if (!data.address[field]) {
          errors.push(`${field} is required`);
        }
      }
      if (data.address.street && data.address.street.length > 500) {
        errors.push("Street address too long");
      }
    }
    if (data.description && data.description.length > 500) {
      errors.push("Description must be less than 500 characters");
    }
    return errors;
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === sliders.length - 1 ? 0 : prev + 1));
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? sliders.length - 1 : prev - 1));
  };

  const handlePlaceOrder = async () => {
    if (
      !address.firstName ||
      !address.mobile ||
      !address.street ||
      !address.city ||
      !address.state ||
      !address.country ||
      !address.pincode
    ) {
      alert(
        "Please fill in all required address fields before placing the order.",
      );
      return;
    }
    if (!userId) {
      alert("Please log in first!");
      navigate("/login");
      return;
    }
    //    if (!paymentMethod || (paymentMethod !== "COD" && paymentMethod !== "CARD")) {
    //   alert("Please select a payment method before proceeding.");
    //   return;
    // }
    const MAX_STRIPE_AMOUNT = 999999.99;

    if (paymentMethod === "CARD" && total > MAX_STRIPE_AMOUNT) {
      alert(
        `Amount cannot exceed ${currency}${MAX_STRIPE_AMOUNT.toLocaleString(
          undefined,
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          },
        )} for online payment. Please contact support for larger transactions.`,
      );
      return;
    }

    // if (paymentMethod === "CARD" && total < MINIMUM_ONLINE_PAYMENT_AMOUNT) {
    //   alert(
    //     `Minimum amount for online payment is ${currency} ${MINIMUM_ONLINE_PAYMENT_AMOUNT}. Your total is ${currency} ${total.toFixed(2)}. Please use Cash on Delivery or add more items.`
    //   );
    //   setPaymentMethod("COD");
    //   return;
    // }

    if (paymentMethod === "CARD" && total < STRIPE_MINIMUM_AMOUNT_USD) {
      alert(
        `Minimum amount for online payment is $${STRIPE_MINIMUM_AMOUNT_USD}. Your total is ${currency} ${total.toFixed(2)}. Please use Cash on Delivery or add more items.`,
      );
      setPaymentMethod("COD");
      return;
    }
    if (paymentMethod === "CARD" && total < MINIMUM_ONLINE_PAYMENT_AMOUNT) {
      alert(
        `Minimum amount for online payment is ${currency} ${MINIMUM_ONLINE_PAYMENT_AMOUNT}. Your total is ${currency} ${total}. Please use Cash on Delivery or add more items.`,
      );
      setPaymentMethod("COD");
      return;
    }
    if (paymentMethod === "CARD" && total < STRIPE_MINIMUM_AMOUNT_USD) {
      alert(
        `Minimum amount for online payment is ${currency} ${STRIPE_MINIMUM_AMOUNT_USD}. Your total is ${currency} ${total}. Please use Cash on Delivery or add more items.`,
      );
      setPaymentMethod("COD");
      return;
    }

    const commonOrderData = {
      userId,
      basePrice,
      totalPrice: parseFloat(total),
      paymentMethod: paymentMethod.toUpperCase(),
      description,
      address: {
        firstName: address.firstName,
        mobile: address.mobile,
        email: address.email,
        street: address.street,
        city: address.city,
        state: address.state,
        country: address.country,
        pincode: address.pincode,
      },
      buyerCommission: commissionCharge,
      buyerCommissionRate: commissionRate,
    };

    try {
      if (isFleetAuction) {
        const fleetAuctionId = id || location.state?.fleetAuctionId;
        const fleetOrderData = {
          ...commonOrderData,
          fleetAuction: [
            {
              fleetAuctionId,
              fleetOwner:
                location.state?.fleetOwnerId || auction?.fleetOwner?._id,
              quantity: 1,
              image: Array.isArray(imageUrl) ? imageUrl : [imageUrl],
              price: basePrice,
              originalPrice: basePrice,
              name: productName,
              description,
              buyerCommission: commissionCharge,
              buyerCommissionRate: commissionRate,
              wrapType: wrapType, // Pass wrapType
            },
          ],
        };

        if (paymentMethod === "COD") {
          await dispatch(placeauctionOrder(fleetOrderData)).unwrap();
          navigate("/MyOrder", { replace: true });
        } else {
          const response = await axiosInstance.post(
            "/payments/create-fleet-checkout-session",
            {
              productName,
              vehicleModel: productName,
              amount: total,
              quantity: 1,
              fleetAuctionId,
              address: fleetOrderData.address,
              description,
              image: imageUrl,
              isFleetAuction: true,
              fleetOwnerId: location.state?.fleetOwnerId,
              buyerCommission: commissionCharge,
              buyerCommissionRate: commissionRate,
              originalPrice: basePrice,
              wrapType: wrapType, // Pass wrapType
            },
          );
          if (response.data?.url) window.location.href = response.data.url;
        }
      } else if (isAuction) {
        const auctionId = id || location.state?.auctionId;
        const auctionOrderData = {
          ...commonOrderData,
          auction: [
            {
              auctionId,
              fleetOwner: auction?.fleetOwner?._id,
              seller: auction?.seller?._id,
              quantity: 1,
              image: Array.isArray(imageUrl) ? imageUrl : [imageUrl],
              price: basePrice,
              originalPrice: auction?.startingPrice || basePrice,
              name: auction?.name || productName,
              description: auction?.description || description,
              buyerCommission: commissionCharge,
              buyerCommissionRate: commissionRate,
              wrapType: wrapType, // Pass wrapType
            },
          ],
        };

        if (paymentMethod === "COD") {
          await dispatch(placeauctionOrder(auctionOrderData)).unwrap();
          navigate("/MyOrder", { replace: true });
        } else {
          const response = await axiosInstance.post(
            "/payments/create-auction-checkout-session",
            {
              productName: auction?.name || productName,
              amount: total,
              quantity: 1,
              productId: id,
              address: auctionOrderData.address,
              description: auction?.description || description,
              image: imageUrl,
              isAuction: true,
              auctionId,
              originalPrice: auction?.startingPrice || basePrice,
              wrapType: wrapType, // Pass wrapType
            },
          );
          if (response.data?.url) window.location.href = response.data.url;
        }
      } else {
        const productOrderData = {
          ...commonOrderData,
          products: [
            {
              productId: id,
              quantity,
              image: imageUrl ? [imageUrl] : ["/placeholder.jpg"],
              price: basePrice,
              originalPrice: basePrice,
            },
          ],
        };

        if (paymentMethod === "COD") {
          await dispatch(placeOrderAsync(productOrderData)).unwrap();
          navigate("/MyOrder", { replace: true });
        } else {
          const response = await axiosInstance.post(
            "/payments/create-checkout-session",
            {
              productName,
              basePrice,
              amount: total,
              quantity,
              productId: id,
              address: productOrderData.address,
              description,
              image: imageUrl,
              originalPrice: basePrice,
            },
          );
          if (response.data?.url) window.location.href = response.data.url;
        }
      }
    } catch (error) {
      console.error("Order error:", error);
      alert(error.message || "Order failed");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading auction details...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-5 py-10 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        {isFleetAuction
          ? "Complete Your Fleet Auction Payment"
          : isAuction
            ? "Complete Your Auction Payment"
            : "Complete Your Order"}
      </h1>
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <div className="relative h-48 sm:h-64 lg:h-80 w-full">
              <div
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {sliders.map((slider) => (
                  <div
                    key={slider.id}
                    className={`w-full flex-shrink-0 ${slider.bgColor} relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white"></div>
                      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white"></div>
                    </div>
                    <div className="relative h-full flex items-center justify-center px-6 sm:px-12 lg:px-20">
                      <div className="text-center text-white max-w-4xl">
                        <h3 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-2 sm:mb-4 drop-shadow-lg">
                          {slider.title}
                        </h3>
                        <p className="text-sm sm:text-lg lg:text-xl opacity-90 leading-relaxed max-w-2xl mx-auto">
                          {slider.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={goToPrevSlide}
                className="hidden sm:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md text-white p-2 lg:p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-xl items-center justify-center"
                aria-label="Previous slide"
              >
                <ChevronLeft size={20} className="lg:w-6 lg:h-6" />
              </button>
              <button
                onClick={goToNextSlide}
                className="hidden sm:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md text-white p-2 lg:p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-xl items-center justify-center"
                aria-label="Next slide"
              >
                <ChevronRight size={20} className="lg:w-6 lg:h-6" />
              </button>
              <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center space-x-2 sm:space-x-3">
                {sliders.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${
                      currentSlide === index
                        ? "bg-white w-6 sm:w-8 shadow-lg"
                        : "bg-white/50 w-2 sm:w-3 hover:bg-white/70"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <FaShoppingCart className="text-yellow-500 text-xl mr-2" />
            <h2 className="text-xl font-semibold">
              {isFleetAuction
                ? "Fleet Auction Details"
                : isAuction
                  ? "Auction Details"
                  : "Order Summary"}
            </h2>
          </div>
          <div className="border-b pb-4">
            <div className="flex items-start">
              <img
                src={imageUrl}
                alt={auction?.name || productName}
                className="w-28 h-28 object-contain border rounded-lg bg-gray-50"
              />
              <div className="ml-4 flex-1">
                <p className="text-lg font-medium text-gray-800">
                  {auction?.name || productName}
                </p>
                <p className="text-gray-600 mt-1 text-sm">
                  {auction?.description || description}
                </p>
                {isFleetAuction && wrapType && (
                  <p className="text-gray-600 mt-1 text-sm">
                    Bid Type: {wrapType}
                  </p>
                )}
                <div className="flex justify-between mt-2">
                  <p className="text-gray-600">
                    {isFleetAuction
                      ? `Winning Bid: ${currency}${basePrice}`
                      : isAuction
                        ? `Winning Bid: ${currency} ${basePrice}`
                        : `Price: ${currency} ${basePrice}`}
                  </p>
                  <p className="text-gray-600">Qty: {quantity}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Item Total:</span>
              <span className="font-medium">
                {currency} {(basePrice * quantity).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">
                Processing Fee ({commissionRate}%):
              </span>
              <span className="font-medium text-blue-600">
                + {currency} {commissionCharge.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Shipping:</span>
              <span className="font-medium">Free</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t mt-2">
              <span className="text-gray-800 font-semibold">Total Amount:</span>
              <span className="text-xl font-bold text-red-600">
                {currency} {total.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <FaCreditCard className="text-yellow-500 text-xl mr-2" />
              <h3 className="text-lg font-medium text-gray-800">
                Payment Method
              </h3>
            </div>
            <div className="space-y-3">
              {/* <label
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "COD" ? "bg-yellow-50 border-yellow-500" : "hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={handlePaymentMethodChange}
                  className="h-4 w-4 text-yellow-500 focus:ring-yellow-500"
                />
                <FaMoneyBillWave size={20} className="ml-3 text-green-600" />
                <span className="ml-2 text-gray-700">Cash on Delivery</span>
              </label> */}
              <label
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "CARD" ? "bg-yellow-50 border-yellow-500" : "hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CARD"
                  checked={paymentMethod === "CARD"}
                  onChange={handlePaymentMethodChange}
                  className="h-4 w-4 text-yellow-500 focus:ring-yellow-500"
                />
                <FaCreditCard size={20} className="ml-3 text-blue-600" />
                <span className="ml-2 text-gray-700">Credit/Debit Card</span>
              </label>
            </div>
            {paymentMethod === "CARD" && (
              <div className="mt-4 bg-blue-50 p-3 rounded text-sm text-blue-800">
                You'll be redirected to Stripe's secure payment page after
                confirming.
              </div>
            )}
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <FaMapMarkerAlt className="text-yellow-500 text-xl mr-2" />
            <h2 className="text-xl font-semibold">Shipping Address</h2>
          </div>
          {!isNewAddress &&
          user?.address &&
          Object.keys(user.address).length > 0 ? (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center mb-2">
                <FaUser className="text-gray-500 mr-2" />
                <p className="font-medium">{userName}</p>
              </div>
              <div className="flex items-center mb-2">
                <FaPhone className="text-gray-500 mr-2" />
                <p>{userMobile}</p>
              </div>
              <div className="flex items-center mb-2">
                <FaEnvelope className="text-gray-500 mr-2" />
                <p>{userEmail}</p>
              </div>
              <div className="pl-6 border-l-2 border-gray-300 ml-1 mt-3">
                <p>{user.address.street}</p>
                <p>
                  {user.address.city}, {user.address.state}
                </p>
                <p>{user.address.country}</p>
                <p>{user.address.pincode}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewAddress(true)}
                className="mt-4 text-blue-600 hover:underline flex items-center"
              >
                <span className="mr-1">+</span> Add New Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div className="flex items-center border rounded-md px-3 py-2 focus-within:border-yellow-500 transition-colors">
                <FaUser className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="firstName"
                  placeholder="Full Name"
                  value={address.firstName}
                  onChange={handleChange}
                  className="w-full outline-none"
                />
              </div>
              <div className="flex items-center border rounded-md px-3 py-2 focus-within:border-yellow-500 transition-colors">
                <FaPhone className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="mobile"
                  placeholder="Mobile Number"
                  value={address.mobile}
                  onChange={handleChange}
                  className="w-full outline-none"
                />
              </div>
              <div className="flex items-center border rounded-md px-3 py-2 focus-within:border-yellow-500 transition-colors">
                <FaEnvelope className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="email"
                  placeholder="Email"
                  value={address.email}
                  onChange={handleChange}
                  className="w-full outline-none"
                />
              </div>
              <div className="flex items-center border rounded-md px-3 py-2 focus-within:border-yellow-500 transition-colors">
                <FaMapMarkerAlt className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="street"
                  placeholder="Street Address"
                  value={address.street}
                  onChange={handleChange}
                  className="w-full outline-none"
                />
              </div>
              <div className="flex items-center border rounded-md px-3 py-2 focus-within:border-yellow-500 transition-colors">
                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode"
                  value={address.pincode}
                  onChange={handleChange}
                  className="w-full outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center border rounded-md px-3 py-2 focus-within:border-yellow-500 transition-colors">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={address.city}
                    onChange={handleChange}
                    className="w-full outline-none"
                  />
                </div>
                <div className="flex items-center border rounded-md px-3 py-2 focus-within:border-yellow-500 transition-colors">
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={address.state}
                    onChange={handleChange}
                    className="w-full outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center border rounded-md px-3 py-2 focus-within:border-yellow-500 transition-colors">
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={address.country}
                  onChange={handleChange}
                  className="w-full outline-none"
                />
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={!paymentMethod}
            className={`flex items-center justify-center px-6 py-3 rounded-lg w-full mt-6 text-white font-medium ${
              !paymentMethod
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600 transition-colors"
            }`}
          >
            <FaCreditCard className="mr-2" />
            Proceed to Payment
          </button>
          <div className="mt-4 flex items-center justify-center text-gray-600 text-sm">
            <FaLock className="mr-2" />
            Your information is secure and encrypted
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

// import React, { useState, useEffect } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { placeOrderAsync, placeauctionOrder, } from "../store/order/OrderSlice";
// import {
//   getSingleAuctionById,
//   reset as resetAuction,
// } from "../store/auction/auctionSlice";
// import { loadStripe } from "@stripe/stripe-js";
// import axiosInstance from "../axiosInstance";
// import {
//   FaLock,
//   FaShoppingCart,
//   FaCreditCard,
//   FaMoneyBillWave,
//   FaMapMarkerAlt,
//   FaUser,
//   FaPhone,
//   FaEnvelope,
// } from "react-icons/fa";
// import { fetchCommission, reset } from "../store/commission/commissionSlice";
// import { ShoppingCart, CreditCard, MapPin, User, Phone, Mail, Lock, ChevronLeft, ChevronRight, Banknote } from 'lucide-react';
// const Checkout = () => {
//   const location = useLocation();
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { orders, status, error } = useSelector((state) => state.order);
//   const user = useSelector((state) => state.auth.user);
//   const userId = user ? user._id : null;
//   const userName = user ? user.firstName : "";
//   const userMobile = user ? user.telephoneNumber : "";
//   const userEmail = user ? user.email : "";

//   const searchParams = new URLSearchParams(location.search);
//   const initialPaymentMethod = searchParams.get("payment") || "COD";
//   const description =
//     searchParams.get("description") || "No description available.";
//   const isAuction =
//     searchParams.get("isAuction") === "true" ||
//     location.state?.isAuction === true ||
//     false;
//   location.state?.auctionId && location.state.auctionId !== null;

//   const isFleetAuction =
//     searchParams.get("isFleetAuction") === "true" ||
//     location.state?.isFleetAuction === true;

//   const {
//     singleAuction,
//     isLoading: isAuctionLoading,
//     isError: isAuctionError,
//     message: auctionMessage,
//   } = useSelector((state) => state.auction);
//   const productName = searchParams.get("name");
//   const productPrice = parseFloat(searchParams.get("price")) || 0;
//   const quantity = parseInt(searchParams.get("quantity")) || 1;
//   const imageUrl = searchParams.get("image");

//   const [loading, setLoading] = useState(isAuction ? true : false);
//   const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod);
//   const [isNewAddress, setIsNewAddress] = useState(false);
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [isPaused, setIsPaused] = useState(false);
//   const [commissionRate, setCommissionRate] = useState({
//     seller: 10,
//     buyer: 2,
//   });
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [auction, setAuction] = useState(null);
//   const [address, setAddress] = useState({
//     firstName: userName || "",
//     mobile: userMobile || "",
//     email: userEmail || "",
//     street: "",
//     city: "",
//     state: "",
//     pincode: "",
//   });
// const MINIMUM_ONLINE_PAYMENT_AMOUNT = 42;
// const STRIPE_MINIMUM_AMOUNT_USD = 0.50;
//   const { commissionRate, SelerRate, isLoading, isSuccess, isError, message } =
//     useSelector((state) => state.commission);

//   useEffect(() => {
//     dispatch(fetchCommission());
//     return () => {
//       dispatch(reset());
//     };
//   }, [dispatch]);

//   useEffect(() => {
//     if (user && user.address) {
//       setAddress((prevAddress) => ({
//         ...prevAddress,
//         ...user.address,
//       }));
//     }
//   }, [user]);

//   const calculateTotals = () => {
//     const basePrice = isAuction
//       ? auction?.bidAmount || productPrice
//       : productPrice;

//     // Validate commission rates
//     const validatedcommissionRate =
//       isNaN(commissionRate) || commissionRate < 0 ? 0 : commissionRate;
//     const validatedSellerRate =
//       isNaN(SelerRate) || SelerRate < 0 ? 0 : SelerRate;

//     const subtotal = basePrice * quantity;
//     const buyerCharge = subtotal * (validatedcommissionRate / 100);
//     const sellerCharge = subtotal * (validatedSellerRate / 100);
//     const total = subtotal + buyerCharge;

//     return {
//       basePrice,
//       subtotal,
//       buyerCharge,
//       sellerCharge,
//       total,
//       commissionRate: validatedcommissionRate,
//       sellerRate: validatedSellerRate,
//     };
//   };

//   const { basePrice, subtotal, buyerCharge, total, commissionRate } =
//     calculateTotals();
//

//   const handleChange = (e) => {
//     setAddress({ ...address, [e.target.name]: e.target.value });
//   };

//   const handlePaymentMethodChange = (e) => {
//     setPaymentMethod(e.target.value);
//   };

//   useEffect(() => {
//     if (isAuction && id) {
//       const fetchAuctionData = async () => {
//         try {
//           const response = await axiosInstance.get(`/auctions/${id}`);
//           setAuction(response.data);
//         } catch (error) {
//           console.error("Error fetching auction:", error);
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchAuctionData();
//     }
//   }, [isAuction, id]);

//   const validateCheckoutData = (data) => {
//     const errors = [];

//     // Validate product name
//     if (!data.productName || typeof data.productName !== "string") {
//       errors.push("Product name is required");
//     } else if (data.productName.length > 100) {
//       errors.push("Product name must be less than 100 characters");
//     }

//     // Validate amount
//     if (isNaN(data.amount) || data.amount <= 0) {
//       errors.push("Invalid amount");
//     }

//     // Validate address
//     if (!data.address || typeof data.address !== "object") {
//       errors.push("Address is required");
//     } else {
//       const requiredAddressFields = ["street", "city", "state", "pincode"];
//       for (const field of requiredAddressFields) {
//         if (!data.address[field]) {
//           errors.push(`${field} is required`);
//         }
//       }

//       if (data.address.street && data.address.street.length > 500) {
//         errors.push("Street address too long");
//       }
//     }

//     // Validate description
//     if (data.description && data.description.length > 500) {
//       errors.push("Description must be less than 500 characters");
//     }

//     return errors;
//   };

//   const handlePlaceOrder = async () => {
//     if (!userId) {
//       alert("Please log in first!");
//       navigate("/login");
//       return;
//     }
// if (paymentMethod === "CARD" && total < MINIMUM_ONLINE_PAYMENT_AMOUNT) {
//     alert(`Minimum amount for online payment is ₹${MINIMUM_ONLINE_PAYMENT_AMOUNT}. Your total is ₹${total.toFixed(2)}. Please use Cash on Delivery or add more items.`);
//     setPaymentMethod("COD"); // Auto-switch to COD
//     return;
//   }
//   if (paymentMethod === "CARD" && total < STRIPE_MINIMUM_AMOUNT_USD) {
//     alert(`Minimum amount for online payment is $${STRIPE_MINIMUM_AMOUNT_USD}. Your total is ₹${total.toFixed(2)}. Please use Cash on Delivery or add more items.`);
//     setPaymentMethod("COD"); // Auto-switch to COD
//     return;
//   }

//     const commonOrderData = {
//       userId,
//       basePrice, // Original price is now stored as basePrice
//       totalPrice: parseFloat(total.toFixed(2)),
//       paymentMethod: paymentMethod.toUpperCase(),
//       description,
//       address: {
//         firstName: address.firstName,
//         mobile: address.mobile,
//         street: address.street,
//         city: address.city,
//         state: address.state,
//         pincode: address.pincode,
//       },
//       buyerCommission: buyerCharge,
//       buyerCommissionRate: commissionRate,
//     };

//     try {
//       if (isFleetAuction) {
//         const fleetAuctionId = id || location.state?.fleetAuctionId;
//         const fleetOrderData = {
//           ...commonOrderData,
//           fleetAuction: [
//             {
//               fleetAuctionId,
//               fleetOwner:
//                 location.state?.fleetOwnerId || auction?.fleetOwner?._id,
//               quantity: 1,
//               image: Array.isArray(imageUrl) ? imageUrl : [imageUrl],
//               price: basePrice, // Original price
//               originalPrice: basePrice, // Explicitly store original price
//               name: productName,
//               description,
//               buyerCommission: buyerCharge,
//               buyerCommissionRate: commissionRate,
//             },
//           ],
//         };

//         if (paymentMethod === "COD") {
//           await dispatch(placeauctionOrder(fleetOrderData)).unwrap();
//           navigate("/MyOrder", { replace: true });
//         } else {
//           const response = await axiosInstance.post(
//             "/payments/create-fleet-checkout-session",
//             {
//               productName,
//               vehicleModel: productName,
//               amount: total,
//               quantity: 1,
//               fleetAuctionId,
//               address: fleetOrderData.address,
//               description,
//               image: imageUrl,
//               isFleetAuction: true,
//               fleetOwnerId: location.state?.fleetOwnerId,
//               buyerCommission: buyerCharge,
//               buyerCommissionRate: commissionRate,
//               originalPrice: basePrice, // Pass original price
//             }
//           );
//           if (response.data?.url) window.location.href = response.data.url;
//         }
//       } else if (isAuction) {
//         const auctionId = id || location.state?.auctionId;
//         const auctionOrderData = {
//           ...commonOrderData,
//           auction: [
//             {
//               auctionId,
//               fleetOwner: auction?.fleetOwner?._id,
//               seller: auction?.seller?._id,
//               quantity: 1,
//               image: Array.isArray(imageUrl) ? imageUrl : [imageUrl],
//               price: basePrice, // Current price
//               originalPrice: auction?.startingPrice || basePrice, // Store original starting price
//               name: auction?.name || productName,
//               description: auction?.description || description,
//               buyerCommission: buyerCharge,
//               buyerCommissionRate: commissionRate,
//             },
//           ],
//         };

//         if (paymentMethod === "COD") {
//           await dispatch(placeauctionOrder(auctionOrderData)).unwrap();
//           navigate("/MyOrder", { replace: true });
//         } else {
//           const response = await axiosInstance.post(
//             "/payments/create-auction-checkout-session",
//             {
//               productName: auction?.name || productName,
//               amount: total,
//               quantity: 1,
//               productId: id,
//               address: auctionOrderData.address,
//               description: auction?.description || description,
//               image: imageUrl,
//               isAuction: true,
//               auctionId,
//               originalPrice: auction?.startingPrice || basePrice,
//             }
//           );
//           if (response.data?.url) window.location.href = response.data.url;
//         }
//       } else {
//         // Regular product
//         const productOrderData = {
//           ...commonOrderData,
//           products: [
//             {
//               productId: id,
//               quantity,
//               image: imageUrl ? [imageUrl] : ["/placeholder.jpg"],
//               price: basePrice, // Current price
//               originalPrice: basePrice, // Same for regular products
//             },
//           ],
//         };

//         if (paymentMethod === "COD") {
//           await dispatch(placeOrderAsync(productOrderData)).unwrap();
//           navigate("/MyOrder", { replace: true });
//         } else {
//           const response = await axiosInstance.post(
//             "/payments/create-checkout-session",
//             {
//               productName,
//               basePrice,
//               amount: total,
//               quantity,
//               productId: id,
//               address: productOrderData.address,
//               description,
//               image: imageUrl,
//               originalPrice: basePrice,
//             }
//           );
//           if (response.data?.url) window.location.href = response.data.url;
//         }
//       }
//     } catch (error) {
//       console.error("Order error:", error);
//       alert(error.message || "Order failed");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         Loading auction details...
//       </div>
//     );
//   }
//   const sliders = [
//     {
//       id: 1,
//       title: "Employee Satisfaction",
//       content: (
//         <>
//           Operators of branded vehicles frequently report elevated levels of job
//           satisfaction,
//           <br />
//           which contributes to a reduction in employee turnover rates.
//         </>
//       ),
//       bgColor: "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800",
//       accentColor: "from-blue-400 to-cyan-300"
//     },
//     {
//       id: 2,
//       title: "Theft Deterrence",
//       content: (
//         <>
//           Vehicles with visible markings are substantially less likely to be
//           stolen,
//           <br />
//           as such assets are more easily traceable and therefore typically
//           avoided by thieves.
//         </>
//       ),
//        bgColor: "bg-gradient-to-br from-green-600 via-green-700 to-green-800",
//       accentColor: "from-green-400 to-emerald-300"
//     },
//     {
//       id: 3,
//       title: "Enhanced Fleet Resale Value",
//       content: (
//         <>
//           Vinyl wraps provide protection to vehicle paintwork from chips and
//           scratches.
//           <br />
//           Upon removal of these wraps, vehicles can be restored to an almost new
//           condition,
//           <br />
//           significantly improving their resale value.
//         </>
//       ),
//        bgColor: "bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800",
//       accentColor: "from-purple-400 to-pink-300"
//     },
//     {
//       id: 4,
//       title: "Reduced Insurance Costs",
//       content: (
//         <>
//           Vehicles wrapped in bright, noticeable colors are more visible to
//           other road users,
//           <br />
//           resulting in fewer collisions and, consequently,
//           <br />a reduction in insurance claims.
//         </>
//       ),
//         bgColor: "bg-gradient-to-br from-orange-600 via-red-600 to-pink-600",
//       accentColor: "from-orange-400 to-red-300"
//     },
//     {
//       id: 5,
//       title: "Optimized Fleet Renewal and Efficiency",
//       content: (
//         <>
//           The additional advertising revenue generated enables fleet owners to
//           replace vehicles more frequently.
//           <br />
//           This practice leads to the adoption of vehicles that are more
//           fuel-efficient and environmentally sustainable.
//         </>
//       ),
//        bgColor: "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800",
//       accentColor: "from-blue-400 to-cyan-300"
//     },
//   ];

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (!isPaused) {
//         setCurrentSlide((prev) => (prev === sliders.length - 1 ? 0 : prev + 1));
//       }
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [sliders.length, isPaused]);

//   const goToSlide = (index) => {
//     setCurrentSlide(index);
//   };

//   const goToNextSlide = () => {
//     setCurrentSlide((prev) => (prev === sliders.length - 1 ? 0 : prev + 1));
//   };

//   const goToPrevSlide = () => {
//     setCurrentSlide((prev) => (prev === 0 ? sliders.length - 1 : prev - 1));
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         Loading auction details...
//       </div>
//     );
//   }
//   return (
//     <div className="container mx-auto px-5 py-10 bg-gray-50">
//       <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
//         {isAuction ? "Complete Your Auction Payment" : "Complete Your Order"}
//       </h1>
//        <div className="bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
//           <div className="relative overflow-hidden rounded-2xl shadow-2xl">
//             <div className="relative h-48 sm:h-64 lg:h-80 w-full">
//               <div
//                 className="flex transition-transform duration-700 ease-in-out h-full"
//                 style={{ transform: `translateX(-${currentSlide * 100}%)` }}
//               >
//                 {sliders.map((slider) => (
//                   <div key={slider.id} className={`w-full flex-shrink-0 ${slider.bgColor} relative overflow-hidden`}>
//                     {/* Background Pattern */}
//                     <div className="absolute inset-0 opacity-10">
//                       <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white"></div>
//                       <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white"></div>
//                     </div>

//                     <div className="relative h-full flex items-center justify-center px-6 sm:px-12 lg:px-20">
//                       <div className="text-center text-white max-w-4xl">
//                         <h3 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-2 sm:mb-4 drop-shadow-lg">
//                           {slider.title}
//                         </h3>
//                         <p className="text-sm sm:text-lg lg:text-xl opacity-90 leading-relaxed max-w-2xl mx-auto">
//                           {slider.content}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Navigation Buttons - Hidden on mobile */}
//               <button
//                 onClick={goToPrevSlide}
//                 className="hidden sm:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md text-white p-2 lg:p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-xl items-center justify-center"
//                 aria-label="Previous slide"
//               >
//                 <ChevronLeft size={20} className="lg:w-6 lg:h-6" />
//               </button>
//               <button
//                 onClick={goToNextSlide}
//                 className="hidden sm:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md text-white p-2 lg:p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-xl items-center justify-center"
//                 aria-label="Next slide"
//               >
//                 <ChevronRight size={20} className="lg:w-6 lg:h-6" />
//               </button>

//               {/* Slide Indicators */}
//               <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center space-x-2 sm:space-x-3">
//                 {sliders.map((_, index) => (
//                   <button
//                     key={index}
//                     onClick={() => goToSlide(index)}
//                     className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${
//                       currentSlide === index
//                         ? "bg-white w-6 sm:w-8 shadow-lg"
//                         : "bg-white/50 w-2 sm:w-3 hover:bg-white/70"
//                     }`}
//                     aria-label={`Go to slide ${index + 1}`}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="grid md:grid-cols-2 gap-8">
//         <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md">
//           <div className="flex items-center mb-4">
//             <FaShoppingCart className="text-yellow-500 text-xl mr-2" />
//             <h2 className="text-xl font-semibold">
//               {isAuction ? "Auction Details" : "Order Summary"}
//             </h2>
//           </div>

//           <div className="border-b pb-4">
//             <div className="flex items-start">
//               <img
//                 src={imageUrl}
//                 alt={auction?.name || productName}
//                 className="w-28 h-28 object-contain border rounded-lg bg-gray-50"
//               />
//               <div className="ml-4 flex-1">
//                 <p className="text-lg font-medium text-gray-800">
//                   {auction?.name || productName}
//                 </p>
//                 <p className="text-gray-600 mt-1 text-sm">
//                   {auction?.description || description}
//                 </p>
//                 <div className="flex justify-between mt-2">
//                   <p className="text-gray-600">
//                     {isAuction ? "Winning Bid: ₹" : "Price: ₹"}
//                     {basePrice.toFixed(2)}
//                   </p>
//                   <p className="text-gray-600">Qty: {quantity}</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="mt-4 mb-6">
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-gray-600">Item Total:</span>
//               <span className="font-medium">
//                 ₹{(basePrice * quantity).toFixed(2)}
//               </span>
//             </div>

//             <div className="flex justify-between items-center mb-2">
//               <span className="text-gray-600">
//                 Processing Fee ({commissionRate}%):
//               </span>
//               <span className="font-medium text-blue-600">
//                 + ₹{buyerCharge.toFixed(2)}
//               </span>
//             </div>

//             <div className="flex justify-between items-center mb-2">
//               <span className="text-gray-600">Shipping:</span>
//               <span className="font-medium">Free</span>
//             </div>

//             <div className="flex justify-between items-center pt-2 border-t mt-2">
//               <span className="text-gray-800 font-semibold">Total Amount:</span>
//               <span className="text-xl font-bold text-red-600">
//                 ₹{total.toFixed(2)}
//               </span>
//             </div>

//             {/* <div className="mt-3 text-xs text-gray-500">
//               <p>* Includes {commissionRate}% processing fee</p>
//               {isAuction && (
//                 <p>
//                   * Seller will receive ₹
//                   {(subtotal * (1 - SelerRate / 100)).toFixed(2)} after{" "}
//                   {SelerRate}% commission
//                 </p>
//               )}
//             </div> */}
//           </div>

//           {/* Payment Method Selection */}
//           <div className="mb-6">
//             <div className="flex items-center mb-3">
//               <FaCreditCard className="text-yellow-500 text-xl mr-2" />
//               <h3 className="text-lg font-medium text-gray-800">
//                 Payment Method
//               </h3>
//             </div>

//             <div className="space-y-3">
//               <label
//                 className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "COD" ? "bg-yellow-50 border-yellow-500" : "hover:bg-gray-50"}`}
//               >
//                 <input
//                   type="radio"
//                   name="paymentMethod"
//                   value="COD"
//                   checked={paymentMethod === "COD"}
//                   onChange={handlePaymentMethodChange}
//                   className="h-4 w-4 text-yellow-500 focus:ring-yellow-500"
//                 />
//                 <FaMoneyBillWave size={20} className="ml-3 text-green-600" />
//                 <span className="ml-2 text-gray-700">Cash on Delivery</span>
//               </label>

//               <label
//                 className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "CARD" ? "bg-yellow-50 border-yellow-500" : "hover:bg-gray-50"}`}
//               >
//                 <input
//                   type="radio"
//                   name="paymentMethod"
//                   value="CARD"
//                   checked={paymentMethod === "CARD"}
//                   onChange={handlePaymentMethodChange}
//                   className="h-4 w-4 text-yellow-500 focus:ring-yellow-500"
//                 />
//                 <FaCreditCard size={20} className="ml-3 text-blue-600" />
//                 <span className="ml-2 text-gray-700">Credit/Debit Card</span>
//               </label>
//             </div>

//             {paymentMethod === "CARD" && (
//               <div className="mt-4 bg-blue-50 p-3 rounded text-sm text-blue-800">
//                 You'll be redirected to Stripe's secure payment page after
//                 confirming.
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Address Form */}
//         <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md">
//           <div className="flex items-center mb-4">
//             <FaMapMarkerAlt className="text-yellow-500 text-xl mr-2" />
//             <h2 className="text-xl font-semibold">Shipping Address</h2>
//           </div>

//           {!isNewAddress &&
//           user?.address &&
//           Object.keys(user.address).length > 0 ? (
//             <div className="mb-6 p-4 border rounded-lg bg-gray-50">
//               <div className="flex items-center mb-2">
//                 <FaUser className="text-gray-500 mr-2" />
//                 <p className="font-medium">{userName}</p>
//               </div>
//               <div className="flex items-center mb-2">
//                 <FaPhone className="text-gray-500 mr-2" />
//                 <p>{userMobile}</p>
//               </div>
//               <div className="flex items-center mb-2">
//                 <FaEnvelope className="text-gray-500 mr-2" />
//                 <p>{userEmail}</p>
//               </div>
//               <div className="pl-6 border-l-2 border-gray-300 ml-1 mt-3">
//                 <p>{user.address.street}</p>
//                 <p>
//                   {user.address.city}, {user.address.state}
//                 </p>
//                 <p>{user.address.pincode}</p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setIsNewAddress(true)}
//                 className="mt-4 text-blue-600 hover:underline flex items-center"
//               >
//                 <span className="mr-1">+</span> Add New Address
//               </button>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 gap-4 mb-4">
//               <div className="flex items-center border rounded-md px-3 py-2 focus-within:border-yellow-500 transition-colors">
//                 <FaUser className="text-gray-400 mr-2" />
//                 <input
//                   type="text"
//                   name="firstName"
//                   placeholder="Full Name"
//                   value={address.firstName}
//                   onChange={handleChange}
//                   className="w-full outline-none"
//                 />
//               </div>

//               <div className="flex items-center border rounded-md px-3 py-2 focus-within:border-yellow-500 transition-colors">
//                 <FaPhone className="text-gray-400 mr-2" />
//                 <input
//                   type="text"
//                   name="mobile"
//                   placeholder="Mobile Number"
//                   value={address.mobile}
//                   onChange={handleChange}
//                   className="w-full outline-none"
//                 />
//               </div>

//               <div className="flex items-center border rounded-md px-3 py-2 focus-within:border-yellow-500 transition-colors">
//                 <FaEnvelope className="text-gray-400 mr-2" />
//                 <input
//                   type="text"
//                   name="email"
//                   placeholder="Email"
//                   value={address.email}
//                   onChange={handleChange}
//                   className="w-full outline-none"
//                 />
//               </div>

//               <div className="flex items-center border rounded-md px-3 py-2 focus-within:border-yellow-500 transition-colors">
//                 <FaMapMarkerAlt className="text-gray-400 mr-2" />
//                 <input
//                   type="text"
//                   name="street"
//                   placeholder="Street Address"
//                   value={address.street}
//                   onChange={handleChange}
//                   className="w-full outline-none"
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="flex items-center border rounded-md px-3 py-2 focus-within:border-yellow-500 transition-colors">
//                   <input
//                     type="text"
//                     name="city"
//                     placeholder="City"
//                     value={address.city}
//                     onChange={handleChange}
//                     className="w-full outline-none"
//                   />
//                 </div>

//                 <div className="flex items-center border rounded-md px-3 py-2 focus-within:border-yellow-500 transition-colors">
//                   <input
//                     type="text"
//                     name="state"
//                     placeholder="State"
//                     value={address.state}
//                     onChange={handleChange}
//                     className="w-full outline-none"
//                   />
//                 </div>
//               </div>

//               <div className="flex items-center border rounded-md px-3 py-2 focus-within:border-yellow-500 transition-colors">
//                 <input
//                   type="text"
//                   name="pincode"
//                   placeholder="Pincode"
//                   value={address.pincode}
//                   onChange={handleChange}
//                   className="w-full outline-none"
//                 />
//               </div>
//             </div>
//           )}

//           <button
//             type="button"
//             onClick={handlePlaceOrder}
//             disabled={!paymentMethod}
//             className={`flex items-center justify-center px-6 py-3 rounded-lg w-full mt-6 text-white font-medium ${
//               !paymentMethod
//                 ? "bg-gray-300 cursor-not-allowed"
//                 : "bg-yellow-500 hover:bg-yellow-600 transition-colors"
//             }`}
//           >
//             {paymentMethod === "COD" ? (
//               <>
//                 <FaShoppingCart className="mr-2" />
//                 {isAuction ? "Place Auction Order" : "Place Order"}
//               </>
//             ) : (
//               <>
//                 <FaCreditCard className="mr-2" />
//                 Proceed to Payment
//               </>
//             )}
//           </button>

//           <div className="mt-4 flex items-center justify-center text-gray-600 text-sm">
//             <FaLock className="mr-2" />
//             Your information is secure and encrypted
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Checkout;
