import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  getCartItems,
  clearCart,
  getWinningBid,
} from "../store/cart/cartSlice";

import { useNavigate } from "react-router-dom";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  FaLock,
  FaShoppingCart,
  FaCreditCard,
  FaMoneyBillWave,
} from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";
import { BsCart4, BsCartX } from "react-icons/bs";
import { fetchUserCountry } from "../store/countary/countrySlice";
import { fetchVehicles } from "../store/vehicle/vehicleSlice";
import { fetchOrdersbyUserIdAsync } from "../store/order/OrderSlice";
import { fetchCommission, reset } from "../store/commission/commissionSlice";

const Cart = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [cartItem, setCartItem] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [commissionCharge, setCommissionCharge] = useState(0);
  const [commissionRate, setCommissionRate] = useState(0);
  const { country, currency } = useSelector((state) => state.country);
  const { cartItems, isLoading, isError, message } = useSelector(
    (state) => state.cart,
  );
  const { list: vehicles } = useSelector((state) => state.vehicles);
  const { winningBid } = useSelector((state) => state.cart);

  const { orders, status, error } = useSelector((state) => state.order);

  const { user } = useSelector((state) => state.auth);
  const { commission } = useSelector((state) => state.commission);
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("CARD");
  const userId = user?._id;

  useEffect(() => {
    if (userId) {
      dispatch(fetchOrdersbyUserIdAsync(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    dispatch(fetchCommission());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  useEffect(() => {
    dispatch(getCartItems());
  }, [dispatch]);

  useEffect(() => {
    if (user?._id) {
      dispatch(getWinningBid(user._id));
    }
  }, [user, dispatch]);

  const isWinningBidPurchased = (bid) => {
    if (bid.auctionType === "fleetauction" && bid.fleetOwner) {
      const isPurchased = orders.some((order) =>
        order.fleetAuction?.some(
          (fa) =>
            fa.fleetAuctionId === bid.fleetOwner?._id &&
            fa.wrapType === bid.bidType &&
            order.paymentStatus === "PAID",
        ),
      );

      return isPurchased;
    }

    if (bid.auctionType === "auction") {
      const isPurchased = orders.some((order) =>
        order.auctionItems?.some(
          (ai) =>
            ai.auctionId === bid.auction?._id && order.paymentStatus === "PAID",
        ),
      );

      return isPurchased;
    }

    return false;
  };

  const isAuctionCompleted = (bid) => {
    if (bid.auctionType === "auction" && bid.auction) {
      const isCompleted = bid.auction.status?.toLowerCase() === "completed";
      return isCompleted;
    }
    return false;
  };

  const getPlanKey = (plan) => {
    const planKey =
      plan === 3
        ? "threeMonth"
        : plan === 6
          ? "sixMonth"
          : plan === 12
            ? "twelveMonth"
            : null;
    return planKey;
  };

  const calculateSurfaceArea = (dimensions, wrapType) => {
    if (
      !dimensions ||
      !wrapType ||
      typeof dimensions !== "object" ||
      Object.keys(dimensions).length === 0
    ) {
      console.error("❌ Missing or invalid dimensions or wrapType:", {
        dimensions,
        wrapType,
        dimensionsType: typeof dimensions,
        dimensionsKeys: dimensions ? Object.keys(dimensions) : "none",
      });
      return 0;
    }
    const {
      length = 0,
      width = 0,
      height = 0,
      bonnetLength = 0,
      bonnetwidth: bonnetHeight = 0,
      cabheight = 0,
      cabwidth = 0,
    } = dimensions;

    const lengthM = (length || 0) * 0.0254;
    const widthM = (width || 0) * 0.0254;
    const heightM = (height || 0) * 0.0254;
    const bonnetLengthM = (bonnetLength || 0) * 0.0254;
    const bonnetHeightM = (bonnetHeight || 0) * 0.0254;
    const cabHeightM = (cabheight || 0) * 0.0254;
    const cabWidthM = (cabwidth || 0) * 0.0254;
    let area = 0;

    switch (wrapType) {
      case "fullWrap":
        area =
          2 * lengthM * heightM +
          2 * lengthM * widthM +
          2 * widthM * heightM +
          bonnetLengthM * bonnetHeightM;

        break;
      case "oneSide":
        area = lengthM * heightM;

        break;
      case "bothSides":
        area = 2 * lengthM * heightM;

        break;
      case "rearDoors":
        area = widthM * heightM;

        break;
      case "bonnet":
        area = bonnetLengthM * bonnetHeightM;

        break;
      case "roof":
        area = lengthM * widthM;

        break;
      default:
        //console.warn("⚠️ Unknown wrapType:", wrapType);
        area = 0;
    }

    return Number(area.toFixed(4));
  };

  useEffect(() => {
    const { totalAmount, totalItems, commissionCharge, commissionRate } =
      calculateCartTotal(cartItems, winningBid, vehicles, currency);

    setCartItem(cartItems);
    setCartTotal(totalAmount);
    setItemCount(totalItems);
    setCommissionCharge(commissionCharge);
    setCommissionRate(commissionRate);
  }, [cartItems, winningBid, vehicles, currency]);

  const calculateCartTotal = (cartItems, winningBid, vehicles, currency) => {
    let totalAmount = 0;
    let totalItems = 0;

    // Calculate regular cart items
    if (Array.isArray(cartItems) && cartItems.length > 0) {
      cartItems.forEach((item, i) => {
        if (item.products && Array.isArray(item.products)) {
          item.products.forEach((product, index) => {
            const quantity = item.quantity?.[index] || 1;
            const productTotal = product.price * quantity;
            totalAmount += productTotal;
            totalItems += quantity;
          });
        }
      });
    }

    if (winningBid && Array.isArray(winningBid) && winningBid.length > 0) {
      const bidsArray = winningBid[0]?.bids || winningBid;

      if (Array.isArray(bidsArray) && bidsArray.length > 0) {
        bidsArray.forEach((bid, index) => {
          let itemTotal = 0;

          if (bid.auctionType === "fleetauction" && bid.fleetOwner) {
            const vehicle = vehicles.find((v) => {
              const searchModel =
                bid.fleetOwner.model?.toLowerCase() ||
                bid.fleetOwner.vehicleModel?.toLowerCase() ||
                bid.fleetOwner.vehicle?.toLowerCase() ||
                bid.fleetOwner.name?.toLowerCase();

              if (!searchModel) return false;

              const isMatch =
                (v.model && v.model.toLowerCase().includes(searchModel)) ||
                (v.vehicleModel &&
                  v.vehicleModel.toLowerCase().includes(searchModel)) ||
                (v.vehicle && v.vehicle.toLowerCase().includes(searchModel)) ||
                (v.name && v.name.toLowerCase().includes(searchModel)) ||
                v._id === bid.fleetOwner._id;

              if (isMatch) {
              }
              return isMatch;
            });

            const dimensions =
              vehicle?.dimensions || bid.fleetOwner?.dimensions;
            const wrapType = bid.bidType || "fullWrap";

            // Calculate surface area if dimensions exist
            if (dimensions && Object.keys(dimensions).length > 0) {
              const surfaceArea = calculateSurfaceArea(dimensions, wrapType);
              const ratePerSquareMeter = bid.bidAmount || 0;
              itemTotal = surfaceArea * ratePerSquareMeter;
            } else {
              console.error("❌ No dimensions found for fleet auction!");
              itemTotal = 0;
            }
          } else if (bid.auctionType === "auction" && bid.auction) {
            const vehicle = vehicles.find((v) => {
              const searchModel =
                bid.auction.model?.toLowerCase() ||
                bid.auction.vehicleModel?.toLowerCase() ||
                bid.auction.vehicle?.toLowerCase() ||
                bid.auction.name?.toLowerCase();

              if (!searchModel) return false;

              const isMatch =
                (v.model && v.model.toLowerCase().includes(searchModel)) ||
                (v.vehicleModel &&
                  v.vehicleModel.toLowerCase().includes(searchModel)) ||
                (v.vehicle && v.vehicle.toLowerCase().includes(searchModel)) ||
                (v.name && v.name.toLowerCase().includes(searchModel)) ||
                v._id === bid.auction._id;

              if (isMatch) {
              }
              return isMatch;
            });

            const dimensions = vehicle?.dimensions || bid.auction?.dimensions;
            const wrapType = bid.bidType || "fullWrap";

            if (dimensions && Object.keys(dimensions).length > 0) {
              const surfaceArea = calculateSurfaceArea(dimensions, wrapType);
              const ratePerSquareMeter = bid.bidAmount || 0;
              itemTotal = surfaceArea * ratePerSquareMeter;
            } else {
              //console.error("❌ No dimensions found for auction!");
              itemTotal = 0;
            }
          } else {
            itemTotal = bid.bidAmount || 0;
          }

          totalAmount += Number(itemTotal.toFixed(2));
          totalItems += 1;
        });
      }
    }

    const planKey = getPlanKey(user?.subscription?.durationMonths);
    const commissionRate =
      planKey && commission?.[planKey] !== undefined ? commission[planKey] : 0;
    const commissionCharge = Number(
      (totalAmount * (commissionRate / 100)).toFixed(2),
    );

    return {
      totalAmount: Number(totalAmount.toFixed(2)),
      totalItems,
      commissionCharge,
      commissionRate,
      currency,
    };
  };

  const handleManualCheckout = async (product) => {
    if (!product) {
      console.error("❌ No product found");
      return;
    }

    const isFleetAuction = product.auctionType === "fleetauction";
    const isRegularAuction = product.auctionType === "auction";
    const productName = isFleetAuction
      ? product.model || product.vehicleModel
      : product.name;
    const totalPrice = product.price * (product.quantity || 1);
    const mainImage =
      Array.isArray(product.image) && product.image.length > 0
        ? product.image[0]
        : product.image || "/fallback-image.png";
    const auctionId = product.auctionId || product._id;

    if (!auctionId) {
      console.error("❌ No valid ID found for product:", product);
      return;
    }

    const isAuction =
      !!product.auctionId ||
      (winningBid &&
        winningBid.some((bid) => bid.auction?._id === product._id));

    let wrapType = product.wrapType || "";
    let surfaceArea = 0;

    let dimensions = product.dimensions;

    if (!dimensions || Object.keys(dimensions).length === 0) {
      if (winningBid && Array.isArray(winningBid)) {
        const bidsArray = winningBid[0]?.bids || winningBid;
        const winningBidItem = bidsArray.find(
          (bid) =>
            bid.auction?._id === auctionId ||
            bid.fleetOwner?._id === auctionId ||
            bid.auctionId === auctionId ||
            bid._id === auctionId,
        );

        if (winningBidItem) {
          dimensions =
            winningBidItem.auction?.dimensions ||
            winningBidItem.fleetOwner?.dimensions ||
            winningBidItem.dimensions;
        }
      }
    }

    if (!dimensions || Object.keys(dimensions).length === 0) {
      const searchTerm = (
        product.model ||
        product.vehicleModel ||
        product.name
      )?.toLowerCase();

      if (searchTerm) {
        const foundVehicle = vehicles.find((v) => {
          const vModel = v.model?.toLowerCase();
          const vVehicleModel = v.vehicleModel?.toLowerCase();
          const vVehicle = v.vehicle?.toLowerCase();
          const vName = v.name?.toLowerCase();

          if (!searchTerm) return false;

          const isMatch =
            (vModel && vModel.includes(searchTerm)) ||
            (vVehicleModel && vVehicleModel.includes(searchTerm)) ||
            (vVehicle && vVehicle.includes(searchTerm)) ||
            (vName && vName.includes(searchTerm)) ||
            (searchTerm && vModel && searchTerm.includes(vModel)) ||
            (searchTerm && vVehicle && searchTerm.includes(vVehicle)) ||
            vModel === searchTerm ||
            vVehicle === searchTerm;

          if (isMatch) {
          }

          return isMatch;
        });

        if (foundVehicle?.dimensions) {
          dimensions = foundVehicle.dimensions;
        }
      }
    }

    if (!wrapType && winningBid && Array.isArray(winningBid)) {
      const bidsArray = winningBid[0]?.bids || winningBid;
      const winningBidItem = bidsArray.find(
        (bid) =>
          bid.auction?._id === auctionId ||
          bid.fleetOwner?._id === auctionId ||
          bid.auctionId === auctionId ||
          bid._id === auctionId,
      );
      wrapType = winningBidItem?.bidType || "fullWrap";
    }
    if (!dimensions || Object.keys(dimensions).length === 0) {
      console.error("❌ CRITICAL: No dimensions found for vehicle!");
      console.error("Model:", product.model);
      console.error("Vehicle Model:", product.vehicleModel);
      console.error("Product Name:", product.name);
      console.error("Auction ID:", auctionId);
      console.error(
        "All vehicles in database:",
        vehicles.map((v) => ({
          id: v._id,
          model: v.model,
          vehicleModel: v.vehicleModel,
          vehicle: v.vehicle,
          name: v.name,
          hasDimensions: !!v.dimensions,
        })),
      );

      alert(
        `Cannot calculate surface area: No dimensions found for vehicle "${product.model || product.vehicleModel || product.name}". Please contact support.`,
      );
      return;
    }

    surfaceArea = calculateSurfaceArea(dimensions, wrapType || "fullWrap");

    if (surfaceArea === 0) {
      console.error("❌ Surface area calculation resulted in 0!");
      alert(
        "Surface area calculation failed. Please check vehicle dimensions.",
      );
      return;
    }

    let adjustedPrice = 0;

    if (isFleetAuction || isRegularAuction) {
      const bidsArray = winningBid[0]?.bids || winningBid;
      const winningBidItem = bidsArray.find(
        (bid) =>
          bid.auction?._id === product._id ||
          bid.fleetOwner?._id === product._id ||
          bid.auctionId === product._id ||
          bid._id === product._id,
      );

      const ratePerSquareMeter = winningBidItem?.bidAmount || 0;
      adjustedPrice = Number((surfaceArea * ratePerSquareMeter).toFixed(2));
    } else {
      adjustedPrice = Number(totalPrice.toFixed(2));
    }

    navigate(
      `/checkout/${product._id}?name=${encodeURIComponent(
        productName,
      )}&price=${adjustedPrice.toFixed(2)}&quantity=${
        product.quantity || 1
      }&payment=${encodeURIComponent(
        selectedPaymentMethod,
      )}&image=${encodeURIComponent(mainImage)}&description=${encodeURIComponent(
        product.description || "",
      )}&isAuction=${isAuction}&isFleetAuction=${isFleetAuction}&wrapType=${encodeURIComponent(
        wrapType,
      )}&surfaceArea=${surfaceArea.toFixed(4)}&description=${encodeURIComponent(product.description || "")}`,
      {
        state: {
          _id: product._id,
          name: productName,
          model: product.model,
          price: adjustedPrice,
          quantity: product.quantity || 1,
          payment: selectedPaymentMethod,
          image: mainImage,
          description: product.description || "",
          total: adjustedPrice,
          isAuction,
          auctionId,
          isFleetAuction,
          auctionType: product.auctionType || "normal",
          vehicleModel: product.vehicleModel || "",
          vehicleType: product.vehicleType || "",
          country: product.country || "",
          company: product.company || "",
          wrapType,
          surfaceArea: surfaceArea,
          dimensions: dimensions,
        },
      },
    );
  };

  const handleClearCart = async () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear the cart?",
    );
    if (!confirmClear) return;

    try {
      await dispatch(clearCart()).unwrap();
      dispatch(getCartItems());
    } catch (error) {
      console.error("❌ Error clearing cart:", error);
      alert("Failed to clear cart");
    }
  };

  const isProductOutOfStock = (product) => {
    const isOutOfStock =
      (product.countInStock !== undefined && product.countInStock <= 0) ||
      (product.availableQuantity !== undefined &&
        product.availableQuantity <= 0) ||
      (product.quantity !== undefined && product.quantity <= 0);

    return isOutOfStock;
  };

  const hasCartItems =
    (Array.isArray(cartItem) &&
      cartItem.length > 0 &&
      cartItem.some(
        (item) =>
          item.products &&
          Array.isArray(item.products) &&
          item.products.length > 0,
      )) ||
    (winningBid &&
      Array.isArray(winningBid) &&
      winningBid.length > 0 &&
      (winningBid[0]?.bids?.length > 0 || winningBid.length > 0));

  const getWinningBidsForDisplay = () => {
    if (!winningBid || !Array.isArray(winningBid)) {
      return [];
    }

    if (winningBid.length > 0 && winningBid[0]?.bids) {
      return winningBid[0].bids;
    }

    return winningBid;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-theme-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-theme-color border-t-transparent"></div>
      </div>
    );
  }

  const winningBids = getWinningBidsForDisplay();

  return (
    <div className="cart-main-box overflow-auto px-7 py-4 w-full bg-theme-bg text-white rounded-2xl">
      <div className="container mx-auto px-4 py-8">
        <div className="cart-box-main-head flex justify-between items-center mb-8">
          <div className="flex items-center">
            <button
              onClick={() => {
                navigate(-1);
              }}
              className="flex items-center text-slate-300 hover:text-theme-color mr-4"
            >
              <IoMdArrowBack size={20} className="mr-1" />
              <span>Continue Shopping</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <FaShoppingCart className="mr-3" />
            Your Shopping Cart
          </h1>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8 mb-8 lg:mb-0">
            <div className="bg-theme-bg2 rounded-xl shadow-md p-6 mb-6 border border-border-info-color">
              <div className="flex justify-between items-center border-b border-border-info-color pb-4 mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Cart Items ({itemCount})
                </h2>
                {hasCartItems && (
                  <button
                    onClick={handleClearCart}
                    className="flex items-center text-red-500 hover:text-red-400 transition-colors"
                  >
                    <RiDeleteBin6Line size={18} className="mr-1" />
                    Clear Cart
                  </button>
                )}
              </div>

              {winningBids && winningBids.length > 0 ? (
                winningBids.map((bid, bidIndex) => {
                  let auctionData =
                    bid.auction || bid.fleetAuction || bid.fleetOwner;
                  const hasAuctionData = auctionData && auctionData._id;

                  let auctionImage = "/fallback-image.png";
                  let auctionName = "Auction Item";
                  let auctionStatus = "Won";

                  if (bid.auctionType === "fleetauction" && bid.fleetOwner) {
                    auctionData = bid.fleetOwner;
                    auctionImage =
                      bid.fleetOwner?.mainImage ||
                      (Array.isArray(bid.fleetOwner?.images) &&
                        bid.fleetOwner.images[0]?.url) ||
                      "/fallback-image.png";
                    auctionName = bid.fleetOwner?.company || "Fleet Auction";
                    auctionStatus = bid.fleetOwner?.status || "Won";
                  } else if (bid.auction) {
                    auctionData = bid.auction;
                    auctionImage =
                      bid?.auction?.images?.find((img) => img?.isPrimary)
                        ?.url ||
                      bid?.auction?.images?.[0]?.url ||
                      "/fallback-image.png";
                    auctionName = bid.auction?.name || "Auction Item";
                    auctionStatus = bid.auction?.status || "Won";
                  } else {
                    auctionData = {};
                    auctionImage = "/fallback-image.png";
                    auctionName = "Unknown Auction";
                    auctionStatus = "Won";
                  }
                  const isPurchased = isWinningBidPurchased(bid);
                  const isCompleted = isAuctionCompleted(bid);

                  return (
                    <div
                      key={`winning-bid-${bid._id || bidIndex}`}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-border-info-color rounded-lg mb-4 hover:bg-theme-bg/50 transition-all"
                    >
                      <div className="flex items-start md:items-center mb-4 md:mb-0 md:w-3/5">
                        <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-theme-bg flex items-center justify-center border border-border-info-color">
                          <img
                            className="max-w-full max-h-full object-contain"
                            src={auctionImage}
                            alt={auctionName}
                          />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-white">
                            {auctionName}
                          </h3>
                          <p className="text-slate-300 text-sm mb-1">
                            Winning Bid: {currency} {bid?.bidAmount?.toFixed(2)}
                          </p>
                          <p className="text-slate-300 text-sm">
                            Status: {auctionStatus}
                          </p>
                          {bid.bidType && (
                            <p className="text-slate-300 text-sm">
                              Bid Type: {bid.bidType}
                            </p>
                          )}
                          {bid.auctionType === "fleetauction" && (
                            <div className="text-xs text-slate-400 mt-1">
                              Model:{" "}
                              {auctionData.model ||
                                auctionData.vehicleModel ||
                                "N/A"}{" "}
                              <br />
                              Country: {auctionData.country || "Country"}
                            </div>
                          )}
                          {/* {bid.auctionType === "auction" && (
                            <div className="text-xs text-slate-400 mt-1">
                              Model: {auctionData.model || auctionData.vehicleModel || "N/A"} <br />
                              {auctionData.country && `Country: ${auctionData.country}`}
                            </div>
                          )} */}
                          {bid.auctionType === "fleetauction" && (
                            <span className="inline-block bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded mt-1">
                              Fleet Auction
                            </span>
                          )}
                          {/* {bid.auctionType === "auction" && (
                            <span className="inline-block bg-purple-900 text-purple-200 text-xs px-2 py-1 rounded mt-1">
                              Regular Auction
                            </span>
                          )} */}
                          {/* <div className={`text-xs mt-1 ${isPurchased ? 'text-green-400' : 'text-yellow-400'}`}>
                            {isPurchased ? '✅ Already Purchased' : '🛒 Available for Purchase'}
                          </div> */}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-3 w-full md:w-auto">
                        <div className="flex space-x-2">
                          <button
                            disabled={isPurchased || isCompleted}
                            className={`px-3 py-2 text-sm rounded-lg text-white transition-colors flex-1 ${
                              isPurchased || isCompleted
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-theme-color hover:bg-theme-color/90"
                            }`}
                            onClick={() => {
                              if (isPurchased || isCompleted) {
                                return;
                              }

                              const vehicle = vehicles.find((v) => {
                                const searchModel =
                                  auctionData.model?.toLowerCase() ||
                                  auctionData.vehicleModel?.toLowerCase();

                                if (!searchModel) return false;

                                const isMatch =
                                  (v.model &&
                                    v.model
                                      .toLowerCase()
                                      .includes(searchModel)) ||
                                  (v.vehicleModel &&
                                    v.vehicleModel
                                      .toLowerCase()
                                      .includes(searchModel)) ||
                                  (v.vehicle &&
                                    v.vehicle
                                      .toLowerCase()
                                      .includes(searchModel)) ||
                                  (v.name &&
                                    v.name
                                      .toLowerCase()
                                      .includes(searchModel)) ||
                                  v._id === auctionData._id;

                                if (isMatch) {
                                }
                                return isMatch;
                              });

                              const productData = hasAuctionData
                                ? {
                                    ...auctionData,
                                    name: auctionName,
                                    price: bid.bidAmount,
                                    quantity: 1,
                                    image: auctionImage,
                                    auctionId: auctionData._id,
                                    auctionType: bid.auctionType,
                                    wrapType: bid.bidType || "fullWrap",

                                    model: auctionData.model,
                                    vehicleModel:
                                      auctionData.vehicleModel ||
                                      auctionData.model,

                                    dimensions:
                                      auctionData.dimensions ||
                                      bid.dimensions ||
                                      (() => {
                                        const modelToSearch =
                                          auctionData.model?.toLowerCase();

                                        if (modelToSearch) {
                                          const foundVehicle = vehicles.find(
                                            (v) => {
                                              const vModel =
                                                v.model?.toLowerCase();
                                              const vVehicleModel =
                                                v.vehicleModel?.toLowerCase();
                                              const vVehicle =
                                                v.vehicle?.toLowerCase();
                                              const vName =
                                                v.name?.toLowerCase();

                                              const isMatch =
                                                (vModel &&
                                                  vModel.includes(
                                                    modelToSearch,
                                                  )) ||
                                                (vVehicleModel &&
                                                  vVehicleModel.includes(
                                                    modelToSearch,
                                                  )) ||
                                                (vVehicle &&
                                                  vVehicle.includes(
                                                    modelToSearch,
                                                  )) ||
                                                (vName &&
                                                  vName.includes(
                                                    modelToSearch,
                                                  )) ||
                                                (modelToSearch &&
                                                  vModel &&
                                                  modelToSearch.includes(
                                                    vModel,
                                                  )) ||
                                                (modelToSearch &&
                                                  vVehicle &&
                                                  modelToSearch.includes(
                                                    vVehicle,
                                                  ));

                                              if (isMatch) {
                                              }

                                              return isMatch;
                                            },
                                          );

                                          return foundVehicle?.dimensions;
                                        }
                                        return {};
                                      })(),
                                    description: auctionData.description,
                                  }
                                : {
                                    _id: bid._id,
                                    name: "Auction Item",
                                    price: bid.bidAmount,
                                    quantity: 1,
                                    image: auctionImage,
                                    auctionId:
                                      bid.fleetOwner?._id ||
                                      bid.auction?._id ||
                                      bid._id,
                                    auctionType: bid.auctionType,
                                    description: "Winning bid item",
                                    wrapType: bid.bidType || "fullWrap",
                                    model:
                                      bid.auction?.model ||
                                      bid.fleetOwner?.model,
                                    vehicleModel:
                                      bid.auction?.vehicleModel ||
                                      bid.fleetOwner?.vehicleModel ||
                                      bid.auction?.model ||
                                      bid.fleetOwner?.model ||
                                      bid.auction?.name ||
                                      bid.fleetOwner?.name ||
                                      "Unknown Vehicle",
                                    dimensions:
                                      bid.auction?.dimensions ||
                                      bid.fleetOwner?.dimensions ||
                                      bid.dimensions ||
                                      {},

                                  };

                              handleManualCheckout(productData);
                            }}
                          >
                            {isPurchased
                              ? "Already Purchased"
                              : isCompleted
                                ? "Auction Completed"
                                : "Checkout"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-slate-400">
                  <BsCartX size={32} className="mx-auto mb-3" />
                  No winning bids found
                </div>
              )}

              {Array.isArray(cartItem) &&
              cartItem.length > 0 &&
              cartItem.some(
                (item) =>
                  item.products &&
                  Array.isArray(item.products) &&
                  item.products.length > 0,
              ) ? (
                cartItem.map((item, itemIndex) => (
                  <div
                    key={`cart-item-${item._id || itemIndex}`}
                    className="mb-4"
                  >
                    {item.products.map((product, index) => {
                      const isOutOfStock = isProductOutOfStock(product);
                      const quantity = item.quantity?.[index] || 1;

                      return (
                        <div
                          key={product._id}
                          className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-border-info-color rounded-lg mb-4 hover:bg-theme-bg/50 transition-all"
                        >
                          <div className="flex items-start md:items-center mb-4 md:mb-0 md:w-3/5">
                            <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-theme-bg flex items-center justify-center border border-border-info-color">
                              <img
                                className="max-w-full max-h-full object-contain"
                                src={
                                  product.mainImage ||
                                  product.image?.[0] ||
                                  "/fallback-image.png"
                                }
                                alt={product.name}
                              />
                            </div>
                            <div className="ml-4">
                              <h3 className="text-lg font-medium text-white">
                                {product.name}
                              </h3>
                              <p className="text-slate-300 text-sm mb-1">
                                Price: {currency} {product.price.toFixed(2)}
                              </p>
                              <p className="text-slate-300 text-sm">
                                Quantity: {quantity}
                              </p>
                              {isOutOfStock && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200 mt-2">
                                  Out of Stock
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col space-y-3 w-full md:w-auto">
                            <div className="text-right">
                              <p className="text-lg font-bold text-white">
                                {currency}{" "}
                                {(product.price * quantity).toFixed(2)}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Link
                                to={`/ProductDetails/${product._id}`}
                                className="px-3 py-2 text-sm text-theme-color border border-border-info-color rounded-lg hover:bg-theme-bg hover:text-white transition-colors"
                              >
                                View Details
                              </Link>
                              <button
                                disabled={isOutOfStock}
                                className={`px-3 py-2 text-sm rounded-lg text-white transition-colors flex-1 ${
                                  isOutOfStock
                                    ? "bg-gray-500 cursor-not-allowed"
                                    : "bg-theme-color hover:bg-theme-color/90"
                                }`}
                                onClick={() => {
                                  handleManualCheckout({
                                    ...product,
                                    quantity,
                                  });
                                }}
                              >
                                {isOutOfStock ? "Out of Stock" : "Checkout"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : !winningBids || winningBids.length === 0 ? (
                <div className="text-center py-16">
                  <BsCartX size={64} className="mx-auto text-slate-500 mb-4" />
                  <h3 className="text-xl font-medium text-slate-300 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-slate-400 mb-6">
                    Looks like you haven't added any products to your cart yet.
                  </p>
                  <Link
                    to="/our-products"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-theme-color hover:bg-theme-color/90"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-4">
            <div className="bg-theme-bg2 rounded-xl shadow-md p-6 sticky top-6 border border-border-info-color">
              <h2 className="text-xl font-semibold text-white border-b border-border-info-color pb-4 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-300">Subtotal</span>
                  <span className="font-medium text-white">
                    {currency} {cartTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">
                    Processing Fee ({commissionRate}%)
                  </span>
                  <span className="font-medium text-white">
                    {currency} {commissionCharge}
                  </span>
                </div>
                <div className="border-t border-border-info-color pt-4 flex justify-between">
                  <span className="text-lg font-semibold text-white">
                    Total
                  </span>
                  <span className="text-lg font-bold text-theme-color">
                    {currency} {(cartTotal + commissionCharge).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-md font-medium text-white mb-3">
                  Payment Method
                </h3>
                <div className="space-y-3">
                  {/* <label className="flex items-center p-3 border border-border-info-color rounded-lg cursor-pointer hover:bg-theme-bg/50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={selectedPaymentMethod === "COD"}
                      onChange={(e) => {
                      
                        setSelectedPaymentMethod(e.target.value);
                      }}
                      className="h-4 w-4 text-theme-color focus:ring-theme-color"
                    />
                    <FaMoneyBillWave
                      size={20}
                      className="ml-3 text-slate-400"
                    />
                    <span className="ml-2 text-slate-300">
                      Cash on Delivery
                    </span>
                  </label> */}
                  <label className="flex items-center p-3 border border-border-info-color rounded-lg cursor-pointer hover:bg-theme-bg/50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CARD"
                      checked={selectedPaymentMethod === "CARD"}
                      onChange={(e) => {
                        setSelectedPaymentMethod(e.target.value);
                      }}
                      className="h-4 w-4 text-theme-color focus:ring-theme-color"
                    />
                    <FaCreditCard size={20} className="ml-3 text-slate-400" />
                    <span className="ml-2 text-slate-300">
                      Credit/Debit Card
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border-info-color">
                <div className="flex items-center text-sm text-slate-400">
                  <FaLock className="mr-2 text-green-500" />
                  <span>Secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

// import { useEffect, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   getCartItems,
//   clearCart,
//   getWinningBid,
// } from "../store/cart/cartSlice";

// import { useNavigate } from "react-router-dom";
// import { RiDeleteBin6Line } from "react-icons/ri";
// import {
//   FaLock,
//   FaShoppingCart,
//   FaCreditCard,
//   FaMoneyBillWave,
// } from "react-icons/fa";
// import { IoMdArrowBack } from "react-icons/io";
// import { BsCart4, BsCartX } from "react-icons/bs";
// import { fetchUserCountry } from "../store/countary/countrySlice";
// import { fetchVehicles } from "../store/vehicle/vehicleSlice";
// import { fetchOrdersbyUserIdAsync } from "../store/order/OrderSlice";
// import { fetchCommission, reset } from "../store/commission/commissionSlice";
// const Cart = () => {
//   const { id } = useParams();
//   const dispatch = useDispatch();
//   const [cartItem, setCartItem] = useState([]);
//   const [cartTotal, setCartTotal] = useState(0);
//   const [itemCount, setItemCount] = useState(0);
//   const [commissionCharge, setCommissionCharge] = useState(0);
//   const [commissionRate, setCommissionRate] = useState(0);
//   const { country, currency } = useSelector((state) => state.country);
//   const { cartItems, isLoading, isError, message } = useSelector(
//     (state) => state.cart
//   );
//   const { list: vehicles } = useSelector((state) => state.vehicles);
//   const { winningBid } = useSelector((state) => state.cart);
//   const { orders, status, error } = useSelector((state) => state.order);

//   const { user } = useSelector((state) => state.auth);
//  const { commission} = useSelector((state) => state.commission);
//   const navigate = useNavigate();
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("COD");
//   const userId = user?._id;

//   useEffect(() => {
//     if (userId) {
//       dispatch(fetchOrdersbyUserIdAsync(userId));
//     }
//   }, [dispatch, userId]);

//     useEffect(() => {
//       dispatch(fetchCommission());
//       return () => {
//         dispatch(reset());
//       };
//     }, [dispatch]);

//   useEffect(() => {
//     dispatch(fetchVehicles());
//   }, [dispatch]);

//   useEffect(() => {
//     if (!country) {
//       dispatch(fetchUserCountry());
//     }
//   }, [dispatch, country]);

//   useEffect(() => {
//     if (Array.isArray(cartItems)) {
//       setCartItem(cartItems);
//       let totalItems = 0;
//       let totalAmount = 0;

//       cartItems.forEach((item) => {
//         if (item.products) {
//           totalItems += item.products.length;
//           item.products.forEach((product, index) => {
//             const quantity = item.quantity?.[index] || 1;
//             totalAmount += product.price * quantity;
//           });
//         }
//       });

//       if (winningBid && Array.isArray(winningBid)) {
//         totalItems += winningBid.length;
//         winningBid.forEach((bid) => {
//           totalAmount += bid.bidAmount || 0;
//         });
//       }

//       setItemCount(totalItems);
//       setCartTotal(totalAmount);
//     } else {
//       console.warn("cartItems is not an array:", cartItems);
//       setCartItem([]);
//       setCartTotal(0);
//       setItemCount(0);
//     }
//   }, [cartItems, winningBid]);

//   useEffect(() => {
//     dispatch(getCartItems());
//   }, [dispatch]);

//   useEffect(() => {
//     if (user?._id) {
//       dispatch(getWinningBid(user._id));
//     }
//   }, [user, dispatch]);
// const getPlanKey = (plan) => {
//   switch (Number(plan)) {
//     case 3:
//       return "threeMonth";
//     case 6:
//       return "sixMonth";
//     case 12:
//       return "twelveMonth";
//     default:
//       return null;
//   }
// };

//   ///calculate total cart item price

//   const calculateSurfaceArea = (dimensions, wrapType) => {
//     if (!dimensions || !wrapType) {
//       console.error("❌ Missing dimensions or wrapType:", {
//         dimensions,
//         wrapType,
//       });
//       return 0;
//     }

//     const {
//       length,
//       width,
//       height,
//       bonnetLength,
//       bonnetwidth: bonnetHeight,
//       cabheight,
//       cabwidth,
//     } = dimensions;

//     const lengthM = length ? Number(length) * 0.0254 : 0;
//     const widthM = width ? Number(width) * 0.0254 : 0;
//     const heightM = height ? Number(height) * 0.0254 : 0;
//     const bonnetLengthM = bonnetLength ? Number(bonnetLength) * 0.0254 : 0;
//     const bonnetHeightM = bonnetHeight ? Number(bonnetHeight) * 0.0254 : 0;
//     const cabHeightM = cabheight ? Number(cabheight) * 0.0254 : 0;
//     const cabWidthM = cabwidth ? Number(cabwidth) * 0.0254 : 0;

//     let area = 0;

//     switch (wrapType) {
//       case "fullWrap":
//         area =
//           2 * lengthM * heightM +
//           2 * lengthM * widthM +
//           2 * widthM * heightM +
//           bonnetLengthM * bonnetHeightM;

//         break;

//       case "oneSide":
//         area = lengthM * heightM;

//         break;

//       case "bothSides":
//         area = 2 * lengthM * heightM;

//         break;

//       case "rearDoors":
//         area = widthM * heightM;

//         break;

//       case "bonnet":
//         area = bonnetLengthM * bonnetHeightM;

//         break;

//       case "roof":
//         area = lengthM * widthM;

//         break;

//       default:
//         console.warn("⚠️ Unknown wrapType:", wrapType);
//         area = 0;
//     }

//     return Number(area.toFixed(4));
//   };

//   const handleManualCheckout = async (product) => {
//     if (!product) {
//       console.error("❌ No product found");
//       return;
//     }

//     const isFleetAuction = product.auctionType === "fleetauction";
//     const productName = isFleetAuction ? product.vehicleModel : product.name;
//     const totalPrice = product.price * (product.quantity || 1);
//     const mainImage =
//       Array.isArray(product.image) && product.image.length > 0
//         ? product.image[0]
//         : product.image || "/fallback-image.png";
//     const auctionId = product.auctionId || product._id;

//     if (!auctionId) {
//       console.error("No valid ID found for product:", product);
//       return;
//     }

//     const isAuction =
//       !!product.auctionId ||
//       (winningBid &&
//         winningBid.some((bid) => bid.auction?._id === product._id));

//     let wrapType = product.wrapType || "";
//     let surfaceArea = 0;

//     if (isFleetAuction) {
//       const vehicle = !product.dimensions
//         ? vehicles.find((v) => {
//             const vehicleModel = product.vehicleModel?.toLowerCase();
//             const isMatch =
//               (v.model && v.model.toLowerCase() === vehicleModel) ||
//               (v.vehicleModel &&
//                 v.vehicleModel.toLowerCase() === vehicleModel) ||
//               (v.vehicle && v.vehicle.toLowerCase() === vehicleModel) ||
//               v._id === auctionId;
//             if (!isMatch) {
//             }
//             return isMatch;
//           })
//         : null;

//       const dimensions = product.dimensions || vehicle?.dimensions;
//       if (
//         !wrapType &&
//         winningBid &&
//         Array.isArray(winningBid) &&
//         winningBid.length > 0
//       ) {
//         const bidArray = winningBid[0]?.bids || [];
//         const winningBidItem = bidArray.find(
//           (bid) =>
//             bid.fleetOwner?._id === auctionId ||
//             bid.auctionId === auctionId ||
//             bid._id === auctionId
//         );
//         wrapType = winningBidItem?.bidType || "fullWrap";
//       }
//       if (dimensions && wrapType) {
//         surfaceArea = calculateSurfaceArea(dimensions, wrapType);
//       } else {
//         console.error(
//           "❌ Cannot calculate surface area: Missing dimensions or wrapType",
//           {
//             dimensions,
//             wrapType,
//             vehicleModel: product.vehicleModel,
//             auctionId,
//           }
//         );
//       }
//     }

//    let adjustedPrice = 0;

// if (isFleetAuction) {
//   // Get winning bid for this vehicle
//   const bidArray = winningBid[0]?.bids || [];
//   const winningBidItem = bidArray.find(
//     (bid) =>
//       bid.fleetOwner?._id === product._id ||
//       bid.auctionId === product._id ||
//       bid._id === product._id
//   );

//   // Use bidAmount as rate per square meter
//   const ratePerSquareMeter = winningBidItem?.bidAmount || 0;
//    adjustedPrice = Number((surfaceArea * ratePerSquareMeter).toFixed(2));
// } else {
//   adjustedPrice = Number(totalPrice.toFixed(2));
// }

//     navigate(
//       `/checkout/${product._id}?name=${encodeURIComponent(
//         productName
//       )}&price=${adjustedPrice.toFixed(2)}&quantity=${
//         product.quantity || 1
//       }&payment=${encodeURIComponent(
//         selectedPaymentMethod
//       )}&image=${encodeURIComponent(mainImage)}&description=${encodeURIComponent(
//         product.description || ""
//       )}&isAuction=${isAuction}&isFleetAuction=${isFleetAuction}&wrapType=${encodeURIComponent(
//         wrapType
//       )}&surfaceArea=${surfaceArea.toFixed(4)}`,
//       {
//         state: {
//           _id: product._id,
//           name: productName,
//           vehicleModel: isFleetAuction ? product.vehicleModel : undefined,
//           price: adjustedPrice,
//           quantity: product.quantity || 1,
//           payment: selectedPaymentMethod,
//           image: mainImage,
//           description: product.description || "",
//           total: adjustedPrice,
//           isAuction,
//           auctionId,
//           isFleetAuction,
//           auctionType: product.auctionType || "normal",
//           vehicleModel: product.vehicleModel || "",
//           vehicleType: product.vehicleType || "",
//           country: product.country || "",
//           company: product.company || "",
//           wrapType,
//           surfaceArea: isFleetAuction ? surfaceArea : undefined,
//         },
//       }
//     );
//   };

//   const handleClearCart = async () => {
//     const confirmClear = window.confirm(
//       "Are you sure you want to clear the cart?"
//     );
//     if (!confirmClear) return;

//     try {
//       await dispatch(clearCart()).unwrap();
//       dispatch(getCartItems());
//     } catch (error) {
//       console.error("Error clearing cart:", error);
//       alert("Failed to clear cart");
//     }
//   };

//   const isProductOutOfStock = (product) => {
//     return (
//       (product.countInStock !== undefined && product.countInStock <= 0) ||
//       (product.availableQuantity !== undefined &&
//         product.availableQuantity <= 0) ||
//       (product.quantity !== undefined && product.quantity <= 0)
//     );
//   };

//    useEffect(() => {
//   const { totalAmount, totalItems, commissionCharge,commissionRate   } = calculateCartTotal(
//     cartItems,
//     winningBid,
//     vehicles,
//     currency
//   );

//   setCartItem(cartItems);
//   setCartTotal(totalAmount);
//   setItemCount(totalItems);
//   setCommissionCharge(commissionCharge);
//   setCommissionRate(commissionRate);
// }, [cartItems, winningBid, vehicles, currency]);

// const calculateCartTotal = (cartItems, winningBid, vehicles, currency) => {
//   let totalAmount = 0;
//   let totalItems = 0;
//   const checkoutItems = [];

//   const calculateSurfaceArea = (dimensions, wrapType) => {
//     if (!dimensions || !wrapType) return 0;

//     const {
//       length,
//       width,
//       height,
//       bonnetLength,
//       bonnetwidth: bonnetHeight,
//       cabheight,
//       cabwidth,
//     } = dimensions;

//     const lengthM = length ? Number(length) * 0.0254 : 0;
//     const widthM = width ? Number(width) * 0.0254 : 0;
//     const heightM = height ? Number(height) * 0.0254 : 0;
//     const bonnetLengthM = bonnetLength ? Number(bonnetLength) * 0.0254 : 0;
//     const bonnetHeightM = bonnetHeight ? Number(bonnetHeight) * 0.0254 : 0;
//     const cabHeightM = cabheight ? Number(cabheight) * 0.0254 : 0;
//     const cabWidthM = cabwidth ? Number(cabwidth) * 0.0254 : 0;

//     let area = 0;
//     switch (wrapType) {
//       case "fullWrap":
//         area =
//           2 * lengthM * heightM +
//           2 * lengthM * widthM +
//           2 * widthM * heightM +
//           bonnetLengthM * bonnetHeightM;
//         break;
//       case "oneSide":
//         area = lengthM * heightM;
//         break;
//       case "bothSides":
//         area = 2 * lengthM * heightM;
//         break;
//       case "rearDoors":
//         area = widthM * heightM;
//         break;
//       case "bonnet":
//         area = bonnetLengthM * bonnetHeightM;
//         break;
//       case "roof":
//         area = lengthM * widthM;
//         break;
//       default:
//         area = 0;
//     }
//     return Number(area.toFixed(4));
//   };

//   // 🛒 Cart items total
//   if (Array.isArray(cartItems)) {
//     cartItems.forEach((item) => {
//       if (item.products && Array.isArray(item.products)) {
//         item.products.forEach((product, index) => {
//           const quantity = item.quantity?.[index] || 1;
//           const productTotal = product.price * quantity;
//           totalAmount += productTotal;
//           totalItems += quantity;

//           checkoutItems.push({
//             id: product._id,
//             name: product.name,
//             price: product.price,
//             quantity,
//             total: Number(productTotal.toFixed(2)),
//             image: product.mainImage || product.image?.[0] || "/fallback-image.png",
//             type: "product",
//           });
//         });
//       }
//     });
//   }

//   // 🏆 Winning bids total
//   if (Array.isArray(winningBid) && winningBid.length > 0) {
//     winningBid[0]?.bids?.forEach((bid) => {
//       let itemTotal = 0;
//       let itemData = {};

//       if (bid.auctionType === "fleetauction" && bid.fleetOwner) {
//         const vehicle = vehicles.find((v) => {
//           const vehicleModel = bid.fleetOwner.vehicleModel?.toLowerCase();
//           return (
//             (v.model && v.model.toLowerCase() === vehicleModel) ||
//             (v.vehicleModel && v.vehicleModel.toLowerCase() === vehicleModel) ||
//             (v.vehicle && v.vehicle.toLowerCase() === vehicleModel) ||
//             v._id === bid.fleetOwner._id
//           );
//         });

//         const dimensions = vehicle?.dimensions || bid.fleetOwner?.dimensions;
//         const wrapType = bid.bidType || "fullWrap";
//         const surfaceArea = calculateSurfaceArea(dimensions, wrapType);
//         const ratePerSquareMeter = bid.bidAmount || 0;
//         itemTotal = surfaceArea * ratePerSquareMeter;

//         itemData = {
//           id: bid.fleetOwner?._id || bid._id,
//           name: bid.fleetOwner?.company || "Fleet Auction",
//           price: Number(itemTotal.toFixed(2)),
//           quantity: 1,
//           total: Number(itemTotal.toFixed(2)),
//           image:
//             bid.fleetOwner?.mainImage ||
//             (Array.isArray(bid.fleetOwner?.images) &&
//               bid.fleetOwner.images[0]?.url) ||
//             "/fallback-image.png",
//           auctionId: bid.fleetOwner?._id || bid._id,
//           auctionType: bid.auctionType,
//           wrapType,
//           surfaceArea: Number(surfaceArea.toFixed(4)),
//           vehicleModel: bid.fleetOwner?.vehicleModel || "",
//           type: "fleetAuction",
//         };
//       } else {
//         itemTotal = bid.bidAmount || 0;
//         itemData = {
//           id: bid._id,
//           name: bid.auction?.name || "Auction Item",
//           price: Number(itemTotal.toFixed(2)),
//           quantity: 1,
//           total: Number(itemTotal.toFixed(2)),
//           image: bid.auction?.images?.[0] || "/fallback-image.png",
//           auctionId: bid.auction?._id || bid._id,
//           auctionType: bid.auctionType,
//           type: "auction",
//         };
//       }

//       totalAmount += Number(itemTotal.toFixed(2));
//       totalItems += 1;
//       checkoutItems.push(itemData);
//     });
//   }

//   // ✅ Ab final amount ke baad commission nikalna hai
//   const planKey = getPlanKey(user?.subscription?.durationMonths);
//   const commissionRate = planKey && commission?.[planKey] !== undefined ? commission[planKey] : 0;
//   const commissionCharge = Number((totalAmount * (commissionRate / 100)).toFixed(2));

//   return {
//     totalAmount: Number(totalAmount.toFixed(2)),
//     totalItems,
//     checkoutItems,
//     commissionCharge,
//     commissionRate,
//     currency,
//   };
// };

//   const hasItems =
//     cartItem?.length > 0 && cartItem.some((item) => item.products.length > 0);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen w-full flex justify-center items-center bg-theme-bg">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-theme-color border-t-transparent"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="cart-main-box overflow-auto px-7 py-4 w-full bg-theme-bg text-white rounded-2xl">
//       <div className="container mx-auto px-4 py-8">
//         <div className="cart-box-main-head flex justify-between items-center mb-8">
//           <div className="flex items-center">
//             <button
//               onClick={() => navigate(-1)}
//               className="flex items-center text-slate-300 hover:text-theme-color mr-4"
//             >
//               <IoMdArrowBack size={20} className="mr-1" />
//               <span>Continue Shopping</span>
//             </button>
//           </div>
//           <h1 className="text-3xl font-bold text-white flex items-center">
//             <FaShoppingCart className="mr-3" />
//             Your Shopping Cart
//           </h1>
//         </div>

//         <div className="lg:grid lg:grid-cols-12 lg:gap-8">
//           <div className="lg:col-span-8 mb-8 lg:mb-0">
//             <div className="bg-theme-bg2 rounded-xl shadow-md p-6 mb-6 border border-border-info-color">
//               <div className="flex justify-between items-center border-b border-border-info-color pb-4 mb-6">
//                 <h2 className="text-xl font-semibold text-white">
//                   Cart Items ({itemCount})
//                 </h2>
//                 {hasItems && (
//                   <button
//                     onClick={handleClearCart}
//                     className="flex items-center text-red-500 hover:text-red-400 transition-colors"
//                   >
//                     <RiDeleteBin6Line size={18} className="mr-1" />
//                     Clear Cart
//                   </button>
//                 )}
//               </div>

//               {winningBid &&
//                 winningBid.length > 0 &&
//                 winningBid[0].bids.map((bid, bidIndex) => {
//                   let auctionData =
//                     bid.auction || bid.fleetAuction || bid.fleetOwner;
//                   const hasAuctionData = auctionData && auctionData._id;

//                   let auctionImage = "/fallback-image.png";
//                   let auctionName = "Auction Item";
//                   let auctionStatus = "Won";

//                   if (bid.auctionType === "fleetauction" && bid.fleetOwner) {
//                     auctionData = bid.fleetOwner;
//                     auctionImage =
//                       bid.fleetOwner?.mainImage ||
//                       (Array.isArray(bid.fleetOwner?.images) &&
//                         bid.fleetOwner.images[0]?.url) ||
//                       "/fallback-image.png";
//                     auctionName = bid.fleetOwner?.company || "Fleet Auction";
//                     auctionStatus = bid.fleetOwner?.status || "Won";
//                   } else if (bid.auction) {
//                     auctionData = bid.auction;
//                     auctionImage =
//                       bid.auction?.images?.[0] || "/fallback-image.png";
//                     auctionName = bid.auction?.name || "Auction Item";
//                     auctionStatus = bid.auction?.status || "Won";
//                   } else {
//                     auctionData = {};
//                     auctionImage = "/fallback-image.png";
//                     auctionName = "Unknown Auction";
//                     auctionStatus = "Won";
//                   }

//                   // Check if the bid's fleetOwner and bidType have a PAID order
//                   const isPurchased = orders.some((order) =>
//                     order.fleetAuction?.some(
//                       (fa) =>
//                         fa.fleetAuctionId === bid.fleetOwner?._id &&
//                         fa.wrapType === bid.bidType &&
//                         order.paymentStatus === "PAID"
//                     )
//                   );
//                   const isAuctionPurchased = winningBid[0]?.bids.some(
//                     (b) =>
//                       b.auctionType === "auction" &&
//                       b.isWinningBid === true &&
//                       b.auction?.status?.toLowerCase() === "completed"
//                   );

//                   return (
//                     <div
//                       key={`winning-bid-${bid._id || bidIndex}`}
//                       className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-border-info-color rounded-lg mb-4 hover:bg-theme-bg/50 transition-all"
//                     >
//                       <div className="flex items-start md:items-center mb-4 md:mb-0 md:w-3/5">
//                         <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-theme-bg flex items-center justify-center border border-border-info-color">
//                           <img
//                             className="max-w-full max-h-full object-contain"
//                             src={auctionImage}
//                             alt={auctionName}
//                           />
//                         </div>
//                         <div className="ml-4">
//                           <h3 className="text-lg font-medium text-white">
//                             {auctionName}
//                           </h3>
//                           <p className="text-slate-300 text-sm mb-1">
//                             Winning Bid: {currency} {bid?.bidAmount?.toFixed(2)}
//                           </p>
//                           <p className="text-slate-300 text-sm">
//                             Status: {auctionStatus}
//                           </p>
//                           {bid.bidType && (
//                             <p className="text-slate-300 text-sm">
//                               Bid Type: {bid.bidType}
//                             </p>
//                           )}
//                           {bid.auctionType === "fleetauction" && (
//                             <div className="text-xs text-slate-400 mt-1">
//                               {auctionData.vehicleModel || "Model"} <br />
//                               Country {auctionData.country || "Country"}
//                             </div>
//                           )}
//                           {bid.auctionType === "fleetauction" && (
//                             <span className="inline-block bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded mt-1">
//                               Fleet Auction
//                             </span>
//                           )}
//                           {/* Display purchaseStatus and purchased state for debugging */}
//                           {bid.auctionType === "fleetauction" && (
//                             <p className="text-xs text-slate-400 mt-1">
//                               Purchased: {isPurchased ? "Yes" : "No"}
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                       <div className="flex flex-col space-y-3 w-full md:w-auto">
//                         <div className="flex space-x-2">
//                           <button
//                             disabled={
//                               (bid.auctionType === "fleetauction" &&
//                                 isPurchased) ||
//                               (bid.auctionType === "auction" &&
//                                 isAuctionPurchased)
//                             }
//                             className={`px-3 py-2 text-sm rounded-lg text-white transition-colors flex-1 ${
//                               (bid.auctionType === "fleetauction" &&
//                                 isPurchased) ||
//                               (bid.auctionType === "auction" &&
//                                 isAuctionPurchased)
//                                 ? "bg-gray-500 cursor-not-allowed"
//                                 : "bg-theme-color hover:bg-theme-color/90"
//                             }`}
//                             onClick={() => {
//                               const vehicle = vehicles.find((v) => {
//                                 const vehicleModel =
//                                   auctionData.vehicleModel?.toLowerCase();
//                                 const isMatch =
//                                   (v.model &&
//                                     v.model.toLowerCase() === vehicleModel) ||
//                                   (v.vehicleModel &&
//                                     v.vehicleModel.toLowerCase() ===
//                                       vehicleModel) ||
//                                   (v.vehicle &&
//                                     v.vehicle.toLowerCase() === vehicleModel) ||
//                                   v._id === auctionData._id;
//                                 return isMatch;
//                               });

//                               const productData = hasAuctionData
//                                 ? {
//                                     ...auctionData,
//                                     name: auctionName,
//                                     price: bid.bidAmount,
//                                     quantity: 1,
//                                     image: auctionImage,
//                                     auctionId: auctionData._id,
//                                     auctionType: bid.auctionType,
//                                     wrapType: bid.bidType || "rearDoors",
//                                     dimensions:
//                                       vehicle?.dimensions ||
//                                       auctionData.dimensions ||
//                                       bid.dimensions,
//                                   }
//                                 : {
//                                     _id: bid._id,
//                                     name: "Auction Item",
//                                     price: bid.bidAmount,
//                                     quantity: 1,
//                                     image: auctionImage,
//                                     auctionId: bid.fleetOwner?._id || bid._id,
//                                     auctionType: bid.auctionType,
//                                     description: "Winning bid item",
//                                     wrapType: bid.bidType || "rearDoors",
//                                     dimensions:
//                                       vehicle?.dimensions || bid.dimensions,
//                                   };

//                               handleManualCheckout(productData);
//                             }}
//                           >
//                             Checkout
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}

//               {hasItems ? (
//                 cartItem.map((item, itemIndex) => (
//                   <div
//                     key={`cart-item-${item._id || itemIndex}`}
//                     className="mb-4"
//                   >
//                     {item.products.map((product, index) => {
//                       const isOutOfStock = isProductOutOfStock(product);
//                       const quantity = item.quantity?.[index] || 1;

//                       return (
//                         <div
//                           key={product._id}
//                           className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-border-info-color rounded-lg mb-4 hover:bg-theme-bg/50 transition-all"
//                         >
//                           <div className="flex items-start md:items-center mb-4 md:mb-0 md:w-3/5">
//                             <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-theme-bg flex items-center justify-center border border-border-info-color">
//                               <img
//                                 className="max-w-full max-h-full object-contain"
//                                 src={
//                                   product.mainImage ||
//                                   product.image?.[0] ||
//                                   "/fallback-image.png"
//                                 }
//                                 alt={product.name}
//                               />
//                             </div>
//                             <div className="ml-4">
//                               <h3 className="text-lg font-medium text-white">
//                                 {product.name}
//                               </h3>
//                               <p className="text-slate-300 text-sm mb-1">
//                                 Price: {currency} {product.price.toFixed(2)}
//                               </p>
//                               <p className="text-slate-300 text-sm">
//                                 Quantity: {quantity}
//                               </p>
//                               {isOutOfStock && (
//                                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200 mt-2">
//                                   Out of Stock
//                                 </span>
//                               )}
//                             </div>
//                           </div>

//                           <div className="flex flex-col space-y-3 w-full md:w-auto">
//                             <div className="text-right">
//                               <p className="text-lg font-bold text-white">
//                                 {currency}{" "}
//                                 {(product.price * quantity).toFixed(2)}
//                               </p>
//                             </div>
//                             <div className="flex space-x-2">
//                               <Link
//                                 to={`/ProductDetails/${product._id}`}
//                                 className="px-3 py-2 text-sm text-theme-color border border-border-info-color rounded-lg hover:bg-theme-bg hover:text-white transition-colors"
//                               >
//                                 View Details
//                               </Link>
//                               <button
//                                 disabled={isOutOfStock}
//                                 className={`px-3 py-2 text-sm rounded-lg text-white transition-colors flex-1 ${
//                                   isOutOfStock
//                                     ? "bg-gray-500 cursor-not-allowed"
//                                     : "bg-theme-color hover:bg-theme-color/90"
//                                 }`}
//                                 onClick={() =>
//                                   handleManualCheckout({
//                                     ...product,
//                                     quantity,
//                                   })
//                                 }
//                               >
//                                 {isOutOfStock ? "Out of Stock" : "Checkout"}
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center py-16">
//                   <BsCartX size={64} className="mx-auto text-slate-500 mb-4" />
//                   <h3 className="text-xl font-medium text-slate-300 mb-2">
//                     Your cart is empty
//                   </h3>
//                   <p className="text-slate-400 mb-6">
//                     Looks like you haven't added any products to your cart yet.
//                   </p>
//                   <Link
//                     to="/our-products"
//                     className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-theme-color hover:bg-theme-color/90"
//                   >
//                     Start Shopping
//                   </Link>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="lg:col-span-4">
//             <div className="bg-theme-bg2 rounded-xl shadow-md p-6 sticky top-6 border border-border-info-color">
//               <h2 className="text-xl font-semibold text-white border-b border-border-info-color pb-4 mb-6">
//                 Order Summary
//               </h2>

//               <div className="space-y-4 mb-6">
//                 <div className="flex justify-between">
//                   <span className="text-slate-300">Subtotal</span>
//                   <span className="font-medium text-white">
//                     {currency} {cartTotal.toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-slate-300">Processing Fee ({commissionRate}%)</span>
//                   <span className="font-medium text-white">{commissionCharge}</span>
//                 </div>
//                 <div className="border-t border-border-info-color pt-4 flex justify-between">
//                   <span className="text-lg font-semibold text-white">
//                     Total
//                   </span>
//                   <span className="text-lg font-bold text-theme-color">
//                       {currency} {(cartTotal + commissionCharge).toFixed(2)}
//                   </span>
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <h3 className="text-md font-medium text-white mb-3">
//                   Payment Method
//                 </h3>
//                 <div className="space-y-3">
//                   <label className="flex items-center p-3 border border-border-info-color rounded-lg cursor-pointer hover:bg-theme-bg/50 transition-colors">
//                     <input
//                       type="radio"
//                       name="paymentMethod"
//                       value="COD"
//                       checked={selectedPaymentMethod === "COD"}
//                       onChange={(e) => setSelectedPaymentMethod(e.target.value)}
//                       className="h-4 w-4 text-theme-color focus:ring-theme-color"
//                     />
//                     <FaMoneyBillWave
//                       size={20}
//                       className="ml-3 text-slate-400"
//                     />
//                     <span className="ml-2 text-slate-300">
//                       Cash on Delivery
//                     </span>
//                   </label>
//                   <label className="flex items-center p-3 border border-border-info-color rounded-lg cursor-pointer hover:bg-theme-bg/50 transition-colors">
//                     <input
//                       type="radio"
//                       name="paymentMethod"
//                       value="CARD"
//                       checked={selectedPaymentMethod === "CARD"}
//                       onChange={(e) => setSelectedPaymentMethod(e.target.value)}
//                       className="h-4 w-4 text-theme-color focus:ring-theme-color"
//                     />
//                     <FaCreditCard size={20} className="ml-3 text-slate-400" />
//                     <span className="ml-2 text-slate-300">
//                       Credit/Debit Card
//                     </span>
//                   </label>
//                 </div>
//               </div>

//             <div className="flex flex-col space-y-3">
//                 <button
//                   className="w-full py-3 px-4 rounded-lg border border-border-info-color text-slate-300 flex items-center justify-center font-medium hover:bg-theme-bg/50"
//                   onClick={() => navigate("/our-products")}
//                 >
//                   Continue Shopping
//                 </button>
//               </div>

//               <div className="mt-6 pt-6 border-t border-border-info-color">
//                 <div className="flex items-center text-sm text-slate-400">
//                   <FaLock className="mr-2 text-green-500" />
//                   <span>Secure checkout</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Cart;
