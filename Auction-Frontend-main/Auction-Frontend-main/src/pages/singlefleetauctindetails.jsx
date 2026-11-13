import { useParams, useSearchParams, Link } from "react-router-dom";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getfleetauctionbyid,
  getVehicalAvalibality,
} from "../store/fleetowner/fleetownerSlice";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { placeABid } from "../store/bid/bidSlice";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { toast } from "react-toastify";
import { sendNewBidNotification } from "../store/notification/notificationSlice";
import socket from "../socket";
import RequestBudgetModal from "./RequestBudgetModal";
import CpaComparisonTable from "../components/CpaComparisonTable";
import { fetchUserCountry } from "../store/countary/countrySlice";
import {
  FiInfo,
  FiMapPin,
  FiTruck,
  FiDollarSign,
  FiEye,
  FiX,
} from "react-icons/fi";
import SEO from "../components/SEO";
import image1 from "../assets/Dimension labeled_page-0001.jpg";
// import image2 from "../assets/image2.png";
// import image3 from "../assets/image3.png";
import CountDownTimer from "../components/CountDownTimer";
import { getAllBidsForAuction } from "../store/bid/bidSlice";
import GoogleMapComponent from "../components/GoogleComponents";
import axios from "axios";
import { fetchVehicles } from "../store/vehicle/vehicleSlice";
import { fetchSoldWraps } from "../store/order/OrderSlice";
import { parseISO, isAfter } from "date-fns";
import { HeaderLeaderboard, MediumRectangle } from "../components/AdSlots";

const FleetAuctionDetails = () => {
  const { id } = useParams();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const logInUser = JSON.parse(localStorage.getItem("user"));
  const { country, currency } = useSelector((state) => state.country);
  const { list: vehicles } = useSelector((state) => state.vehicles);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.userType === "admin";
  const [activeSlide, setActiveSlide] = useState(0);
  const [newBidAmount, setNewBidAmount] = useState("");
  const [bidType, setBidType] = useState("fullWrap");
  const [activeTab, setActiveTab] = useState("description");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentBids, setCurrentBids] = useState({
    fullWrap: null,
    oneSide: null,
    bothSides: null,
    rearDoors: null,
  });
  const [showInfo, setShowInfo] = useState(false);
  const [wrapType, setWrapType] = useState(
    searchParams.get("wrapType") || location.state?.wrapType || "",
  );
  const {
    form: auction,
    vehicalavalibality,
    isError,
    message,
  } = useSelector((state) => state.fleetOwner);

  const auctionData = useMemo(() => auction?.data, [auction?.data]);
  const image = useMemo(() => auctionData?.images || [], [auctionData]);

  const seoData = {
    title: auctionData?.company
      ? `${auctionData.company} | Fleet Auction Details ${new Date().getFullYear()}`
      : "Fleet Auction Details | Bid on Fleet Vehicle Advertising",

    description: auctionData?.description
      ? auctionData.description.substring(0, 160)
      : "Participate in fleet auction for vehicle advertising space. Bid on multiple vehicle wraps and advertising opportunities across fleet vehicles.",

    keywords: `fleet auction, vehicle advertising, ${auctionData?.vehicleModel || "fleet vehicle"}, ${auctionData?.vehicleManufacturer || "vehicle"}, fleet wrap, out of home advertising, fleet management auction, vehicle fleet auction`,

    publishedTime: auctionData?.startTime,
    modifiedTime: auctionData?.updatedAt,
  };
  const {
    soldWraps,
    isLoading: orderLoading,
    error: orderError,
  } = useSelector((state) => state.order);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchVehicles());
    dispatch(fetchSoldWraps(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  const highestBids = useMemo(
    () => ({
      fullWrap: currentBids.fullWrap?.bidAmount || 0,
      oneSide: currentBids.oneSide?.bidAmount || 0,
      bothSides: currentBids.bothSides?.bidAmount || 0,
      rearDoors: currentBids.rearDoors?.bidAmount || 0,
    }),
    [currentBids],
  );

  const [bidAmounts, setBidAmounts] = useState({
    fullWrap: "",
    oneSide: "",
    bothSides: "",
    rearDoors: "",
  });
  const [submittingType, setSubmittingType] = useState(null);

  const minBidAmounts = useMemo(
    () => ({
      fullWrap: auctionData?.minAuctionRates?.fullWrap || 0,
      oneSide: auctionData?.minAuctionRates?.oneSide || 0,
      bothSides: auctionData?.minAuctionRates?.bothSides || 0,
      rearDoors: auctionData?.minAuctionRates?.rearDoors || 0,
    }),
    [auctionData?.minAuctionRates],
  );

  useEffect(() => {
    setIsLoading(true);
    Promise.all([dispatch(getfleetauctionbyid(params?.id))]).then(() => {
      setIsLoading(false);
    });
    dispatch(getAllBidsForAuction(params?.id));
  }, [params?.id]);

  const handleWinner = () => {
    socket.emit("selectWinner", params?.id);
  };

  useEffect(() => {
    const handleWinner = (data) => {
      if (data.auctionId === params.id) {
        setAuctionWinnerDetailData(data);
        setAuctionStarted(false);
        dispatch(getfleetauctionbyid(params.id));
        dispatch(getAllBidsForAuction(params.id));
      }
    };
    socket.on("winnerSelected", handleWinner);
    socket.emit("joinAuction", params.id);
    return () => {
      socket.off("winnerSelected", handleWinner);
      socket.emit("leaveAuction", params.id);
    };
  }, [params.id, dispatch]);

  useEffect(() => {
    const handleWinnerSelected = (data) => {
      if (data.auctionId === params.id) {
        setAuctionWinnerDetailData(data.winner);
        setAuctionStarted(false);
        dispatch(getfleetauctionbyid(params.id));
        dispatch(getAllBidsForAuction(params.id));
        if (logInUser?._id === data.winner.bidder._id.toString()) {
          toast.success(
            `Congratulations! You won this auction! Item has been added to your cart.`,
            { autoClose: 5000 },
          );
        }
      }
    };
    socket.on("winnerSelected", handleWinnerSelected);
    return () => {
      socket.off("winnerSelected", handleWinnerSelected);
    };
  }, [params.id, dispatch, logInUser]);

  const isOwner = useMemo(
    () => auctionData?.fleetOwner?._id === logInUser?._id,
    [auctionData?.fleetOwner?._id, logInUser?._id],
  );

  useEffect(() => {
    if (id) {
      dispatch(getfleetauctionbyid(id));
    }
  }, [dispatch, id]);

  useEffect((fleetOwnerId) => {
    dispatch(getVehicalAvalibality(fleetOwnerId));
  }, []);

  useEffect(() => {
    if (auctionData?.currentBids) {
      setCurrentBids(auctionData.currentBids);
    }
  }, [auctionData]);

  const auctionTiming = useMemo(() => {
    if (!auctionData)
      return { startTime: null, endTime: null, status: "pending" };
    return {
      startTime: auctionData.startTime || auctionData.auctionStartTime || null,
      endTime: auctionData.endTime || auctionData.auctionEndTime || null,
      status: auctionData.status || auctionData.auctionStatus || "active",
    };
  }, [auctionData]);

  const { startTime, endTime, status } = auctionTiming;

  const isAuctionEnded = useMemo(() => {
    if (status === "ended" || status === "completed") return true;
    if (endTime) {
      const now = new Date();
      const auctionEndTime = new Date(endTime);
      return now > auctionEndTime;
    }
    return false;
  }, [status, endTime]);

  const isAuctionUpcoming = useMemo(() => {
    if (!startTime) return false;
    const now = new Date();
    const auctionStartTime = new Date(startTime);
    return now < auctionStartTime;
  }, [startTime]);

  const isAuctionActive = useMemo(() => {
    if (!startTime || !endTime) return false;
    const now = new Date();
    const auctionStartTime = new Date(startTime);
    const auctionEndTime = new Date(endTime);
    return now >= auctionStartTime && now < auctionEndTime;
  }, [startTime, endTime]);

  const handleBidAmountChange = useCallback((type, value) => {
    setBidAmounts((prev) => ({
      ...prev,
      [type]: value,
    }));
  }, []);

  const placeBidHandle = useCallback(
    async (e, type) => {
      e.preventDefault();
      setSubmittingType(type);
      const bidAmount = parseFloat(bidAmounts[type]);
      const minAmount = minBidAmounts[type] || 0;
      const currentHighestBid = highestBids[type] || 0;

      if (!bidAmount) {
        toast.error("Please enter a bid amount");
        setSubmittingType(null);
        return;
      }

      if (bidAmount < minAmount) {
        toast.error(`Bid must be at least ${currency}${minAmount} for ${type}`);
        setSubmittingType(null);
        return;
      }

      if (bidAmount <= currentHighestBid) {
        toast.error(
          `Bid must be greater than current highest bid of ${currency}${currentHighestBid} for ${type}`,
        );
        setSubmittingType(null);
        return;
      }

      try {
        const result = await dispatch(
          placeABid({
            id,
            amount: Math.floor(bidAmount),
            fleetOwnerId: auctionData?.fleetOwner?._id,
            bidType: type,
          }),
        );
        if (placeABid.fulfilled.match(result)) {
          toast.success(
            `${type.replace(/([A-Z])/g, " $1")} bid placed successfully!`,
          );
          setBidAmounts((prev) => ({ ...prev, [type]: "" }));
          dispatch(getfleetauctionbyid(id));
        } else {
          toast.error(result.payload?.message || "Failed to place bid");
        }
      } catch (error) {
        toast.error(error.message || "Error placing bid");
      } finally {
        setSubmittingType(null);
      }
    },
    [
      bidAmounts,
      minBidAmounts,
      highestBids,
      dispatch,
      id,
      auctionData?.fleetOwner?._id,
      currency,
    ],
  );

  const isWrapSold = useCallback(
    (type) => {
      if (!soldWraps) return false;
      if (Array.isArray(soldWraps)) {
        const isSold = soldWraps.some(
          (wrap) => wrap.wrapType === type && wrap.status === "sold",
        );
        return isSold;
      }
      return false;
    },
    [soldWraps],
  );

  const calculateSurfaceArea = (dimensions, wrapType) => {
    if (!dimensions || !wrapType) {
      console.error("Missing dimensions or wrapType:", {
        dimensions,
        wrapType,
      });
      return 0;
    }
    const {
      length,
      width,
      height,
      bonnetLength,
      bonnetwidth,
      cabheight,
      cabwidth,
    } = dimensions;

    const lengthMeters = length ? length * 0.0254 : 0;
    const widthMeters = width ? width * 0.0254 : 0;
    const heightMeters = height ? height * 0.0254 : 0;
    const bonnetLengthMeters = bonnetLength ? bonnetLength * 0.0254 : 0;
    const bonnetWidthMeters = bonnetwidth ? bonnetwidth * 0.0254 : 0;
    const cabHeightMeters = cabheight ? cabheight * 0.0254 : 0;
    const cabWidthMeters = cabwidth ? cabwidth * 0.0254 : 0;

    switch (wrapType) {
      case "fullWrap":
        return (
          2 * lengthMeters * heightMeters +
          2 * widthMeters * heightMeters +
          lengthMeters * widthMeters +
          bonnetLengthMeters * bonnetWidthMeters +
          cabHeightMeters * cabWidthMeters
        );
      case "oneSide":
        return lengthMeters * heightMeters;
      case "bothSides":
        return 2 * lengthMeters * heightMeters;
      case "rearDoors":
        return widthMeters * heightMeters;
      default:
        console.warn(`Unknown wrapType: ${wrapType}`);
        return 0;
    }
  };

  const handleBuyNow = (type, amount) => {
    if (!auctionData) {
      toast.error("Auction data not available.");
      return;
    }
    if (!logInUser) {
      toast.error("Please log in to buy now.", { autoClose: 8000 });
      return;
    }
    if (isWrapSold(type)) {
      toast.error(`${capitalizeWords(type)} is already sold.`);
      return;
    }
    if (isAuctionEnded) {
      toast.error(`Auction has ended for ${capitalizeWords(type)}.`);
      return;
    }
    if (isAuctionUpcoming) {
      toast.error(`Auction has not started yet for ${capitalizeWords(type)}.`);
      return;
    }
    if (isOwner) {
      toast.error("You cannot buy from your own auction.");
      return;
    }
    if (!user?.paymentVerified) {
      toast.error("Please verify your payment method first.");
      setTimeout(() => {
        navigate("/user-profile/payment-method", {
          state: { from: window.location.pathname, auctionId: id },
        });
      }, 1500);
      return;
    }

    let selectedVehicle = vehicles.find(
      (v) =>
        v._id === auctionData.vehicleId ||
        v._id === auctionData.vehicle ||
        v._id === auctionData.selectedVehicle,
    );

    if (!selectedVehicle) {
      selectedVehicle = vehicles.find(
        (v) =>
          v.model?.toLowerCase().trim() ===
            auctionData.vehicleModel?.toLowerCase().trim() &&
          v.manufacturer?.toLowerCase().trim() ===
            auctionData.vehicleManufacturer?.toLowerCase().trim() &&
          String(v.yearOfManufacture) ===
            String(auctionData.yearofmanufacturer),
      );
    }

    if (!selectedVehicle) {
      selectedVehicle = vehicles.find(
        (v) =>
          v.model?.toLowerCase().trim() ===
          auctionData.vehicleModel?.toLowerCase().trim(),
      );
    }

    if (!selectedVehicle || !selectedVehicle.dimensions) {
      toast.error(
        "Vehicle dimensions not available. Cannot proceed with Buy Now.",
      );
      console.error("Vehicle match failed", {
        auctionModel: auctionData.vehicleModel,
        auctionManufacturer: auctionData.vehicleManufacturer,
        auctionYear: auctionData.yearofmanufacturer,
        availableVehicles: vehicles.map((v) => ({
          id: v._id,
          model: v.model,
          manufacturer: v.manufacturer,
          year: v.yearOfManufacture,
        })),
      });
      return;
    }

    const surfaceArea = calculateSurfaceArea(selectedVehicle.dimensions, type);
    if (surfaceArea <= 0) {
      toast.error("Invalid vehicle dimensions. Cannot calculate area.");
      return;
    }

    const totalCost = surfaceArea * amount;
    const totalCostRounded = parseFloat(totalCost.toFixed(2));

    const queryParams = new URLSearchParams({
      name: auctionData.company || "Fleet Advertising",
      price: totalCost.toFixed(2),
      quantity: 1,
      description: `${capitalizeWords(type)} (Area: ${surfaceArea.toFixed(2)} m²)`,
      image: auctionData.images?.[0]?.url || auctionData.images?.[0] || "",
      payment: "CARD",
      isFleetAuction: true,
      fleetAuctionId: auctionData._id || "",
      wrapType: type,
      surfaceArea: surfaceArea.toFixed(2),
    });

    navigate(
      `/checkout/${auctionData._id || "unknown"}?${queryParams.toString()}`,
      {
        state: {
          type,
          amount: totalCostRounded,
          vehicleModel: auctionData.vehicleModel || "",
          manufacturer: auctionData.vehicleManufacturer || "",
          year: auctionData.yearofmanufacturer || "",
          surfaceArea: surfaceArea.toFixed(2),
          image: auctionData.images?.[0]?.url || auctionData.images?.[0] || "",
          isFleetAuction: true,
          fleetAuctionId: auctionData._id || "",
          wrapType: type,
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading auction details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center py-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-2xl font-bold mb-2">Error Loading Auction</div>
          <div className="text-gray-600">{message}</div>
        </div>
      </div>
    );
  }

  if (!auctionData.isApprovedByAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-theme-bg rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⛔</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Auction Not Approved
          </h2>
          <p className="text-white mb-6">
            This auction has not been approved by the admin yet. Please check
            back later.
          </p>
          <Link
            to="/user-profile/manage-fleetauction"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  const capitalizeWords = (str) => str.replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <SEO {...seoData} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 m-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:justify-end gap-4 sm:gap-2 w-full relative mt-6">
  <HeaderLeaderboard />
  
  {/* Sirf wrapper nahi hone par hi yeh block dikhega */}
  {user?.userType !== "wrapper" && (
    <>
      <div className="flex gap-4">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          Request Budget
        </button>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-gray-600 text-xl hover:text-gray-800 transition"
          aria-label="Info"
          title="Click to know what 'Request Budget' means"
        >
          <FiInfo className="w-6 h-6" />
        </button>
        {showInfo && (
          <div className="absolute top-8 right-0 w-80 p-4 bg-white border border-gray-200 rounded-md shadow-lg z-50 text-sm text-gray-700">
            <p className="mb-2 font-semibold">
              {capitalizeWords("What is Request Budget?")}
            </p>
            <p>
              {capitalizeWords(
                "As an Advertiser, you can request a budget to propose your expected rates for advertising spaces (Rear Doors, One Side, Both Sides, Full Wrap) on fleet vehicles. Enter your budget per square meter in the provided fields. After submission, your request will be sent to Fleet Managers, who can review your proposal and match it with their available advertising spaces. You'll be notified when a Fleet Manager responds or accepts your budget request."
              )}
            </p>
            <button
              onClick={() => setShowInfo(false)}
              className="mt-3 text-blue-600 hover:underline"
            >
              Close
            </button>
          </div>
        )}
      </div>
      
      {open && <RequestBudgetModal onClose={() => setOpen(false)} />}
    </>
  )}
</div>
          {/* AUCTION HEADER */}
          <div className="bg-white rounded-2xl shadow-md mb-8 p-6 relative m-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {auctionData.company}
                </h1>
                <div className="flex flex-wrap gap-4 text-gray-700 text-base">
                  <div className="flex items-center gap-2 flex-wrap bg-gray-50 rounded-full">
                    <FiMapPin className="w-5 h-5 text-gray-500" />
                    {auctionData.location?.name ||
                      auctionData.location?.zip ||
                      "Location not specified"}
                  </div>
                  {auctionData.additionalLocations?.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <FiMapPin className="w-5 h-5 text-gray-500" />
                      {auctionData.additionalLocations.map(
                        (location, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                          >
                            {location.name || location.zip || "Unknown"}
                          </span>
                        ),
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FiTruck className="w-5 h-5 text-gray-500" />
                    {auctionData.vehicleModel || "Vehicle Model"}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="w-5 h-5 text-gray-500" />
                    Account: {auctionData.accountNumber || "N/A"}
                  </div>
                </div>
              </div>
              <div className="self-start">
                <button
                  onClick={() => setIsOpen(true)}
                  className="text-blue-600 hover:text-blue-800 font-bold text-lg rounded-full p-1"
                  title="Visualise how your campaign will appear on the vehicle"
                >
                  <FiInfo className="w-6 h-6" />
                </button>
              </div>
            </div>

            {isOpen && (
              <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50">
                <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
                  <div className="sticky top-0 flex justify-end z-[1100] bg-white/60 backdrop-blur-md p-2">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="bg-red-600 hover:bg-red-700 text-white text-3xl font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
                    >
                      ×
                    </button>
                  </div>
                  <img
                    src={image1}
                    alt="Vehicle Measurement"
                    className="w-full h-auto rounded-lg object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* AVAILABILITY SECTION */}
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              Fleet Manager Availability
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm sm:text-base text-gray-700">
              <div className="flex flex-col gap-y-1">
                <span>Total Vehicles:</span>
                <span className="font-semibold">
                  {vehicalavalibality?.totalVehicles}
                </span>
              </div>
              <div className="flex flex-col gap-y-1">
                <span>Available Now:</span>
                <span className="font-semibold text-green-600">
                  {vehicalavalibality?.availableNow}
                </span>
              </div>
              {/* <div className="flex flex-col gap-y-1">
              <span>Utilization Rate:</span>
              <span className="font-semibold">
                {vehicalavalibality?.utilizationRate}
              </span>
            </div> */}
            </div>
          </div>

          {/* MAIN CONTENT GRID */}
          <div className="grid lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* FLEET PERFORMANCE METRICS */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-3 md:mb-4 lg:mb-6">
                  Fleet Performance Metrics
                </h2>
                <div className="overflow-x-auto">
                  <table className="hidden md:table w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="border border-gray-200 px-3 py-2 md:px-4 md:py-3 text-left font-semibold text-gray-900 text-sm md:text-base">
                          Metric
                        </th>
                        <th className="border border-gray-200 px-3 py-2 md:px-4 md:py-3 text-left font-semibold text-gray-900 text-sm md:text-base">
                          Value
                        </th>
                        <th className="border border-gray-200 px-3 py-2 md:px-4 md:py-3 text-left font-semibold text-gray-900 text-sm md:text-base">
                          Source
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          metric: "1. Zip/Postal Codes Covered",
                          value: auctionData.location?.zip || "Multiple Zones",
                          source: "Database Values",
                        },
                        {
                          metric: "Full Wrap",
                          value: highestBids.fullWrap,
                          source: "Live Bidding",
                          color: "text-green-600",
                        },
                        {
                          metric: "One Side",
                          value: highestBids.oneSide,
                          source: "Live Bidding",
                          color: "text-green-600",
                          bg: true,
                        },
                        {
                          metric: "Both Sides",
                          value: highestBids.bothSides,
                          source: "Live Bidding",
                          color: "text-green-600",
                        },
                        {
                          metric: "Rear Doors",
                          value: highestBids.rearDoors,
                          source: "Live Bidding",
                          color: "text-green-600",
                          bg: true,
                        },
                      ].map((row, index) => {
                        const isBid = row.source === "Live Bidding";
                        return (
                          <tr
                            key={index}
                            className={row.bg ? "bg-gray-50" : ""}
                          >
                            <td className="border border-gray-200 px-3 py-2 md:px-4 md:py-3 font-medium text-sm md:text-base">
                              {row.metric}
                            </td>
                            <td className="border border-gray-200 px-3 py-2 md:px-4 md:py-3 text-sm md:text-base">
                              {isBid ? (
                                <div className="flex flex-col items-start leading-tight">
                                  {row.value ? (
                                    <>
                                      <span
                                        className={`font-bold ${row.color} text-base md:text-lg`}
                                      >
                                        {currency}&nbsp;
                                        {row.value}
                                        <span className="text-xs text-gray-500 ml-1">
                                          (Current Bid)
                                        </span>
                                      </span>
                                      <span className="text-xs text-gray-500 mt-0.5">
                                        Per Square Metre (m²)
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-gray-400 italic">
                                      No Bids Yet
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span>{row.value}</span>
                              )}
                            </td>
                            <td className="border border-gray-200 px-3 py-2 md:px-4 md:py-3 text-gray-600 text-sm md:text-base">
                              {row.source}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="md:hidden space-y-3">
                    {[
                      {
                        metric: "1. Zip/Postal Codes Covered",
                        value: auctionData.location?.zip || "Multiple Zones",
                        source: "Database Values",
                      },
                      {
                        metric: "Full Wrap",
                        value: highestBids.fullWrap
                          ? `${currency}${highestBids.fullWrap} Per Square Metre (m²)`
                          : "No bids yet",
                        source: "Live Bidding",
                        color: "text-green-600 font-bold",
                      },
                      {
                        metric: "One Side",
                        value: highestBids.oneSide
                          ? `${currency}${highestBids.oneSide} Per Square Metre (m²)`
                          : "No bids yet",
                        source: "Live Bidding",
                        color: "text-green-600 font-bold",
                      },
                      {
                        metric: "Both Sides",
                        value: highestBids.bothSides
                          ? `${currency}${highestBids.bothSides} Per Square Metre (m²)`
                          : "No bids yet",
                        source: "Live Bidding",
                        color: "text-green-600 font-bold",
                      },
                      {
                        metric: "Rear Doors",
                        value: highestBids.rearDoors
                          ? `${currency}${highestBids.rearDoors} Per Square Metre (m²)`
                          : "No bids yet",
                        source: "Live Bidding",
                        color: "text-green-600 font-bold",
                      },
                    ].map((row, index) => (
                      <div
                        key={index}
                        className={`border border-gray-200 rounded-lg p-3 shadow-sm ${
                          index % 2 === 1 ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          {row.metric}
                        </div>
                        <div
                          className={`text-base ${
                            row.color || "text-gray-800"
                          } mb-1`}
                        >
                          {row.value}
                        </div>
                        <div className="text-xs text-gray-500">
                          Source: {row.source}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* VEHICLE SPECIFICATIONS */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-3 md:mb-6">
                  Vehicle Specifications
                </h2>
                <div className="overflow-x-auto">
                  <table className="hidden md:table w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-200 px-4 py-2 md:py-3 text-left font-semibold text-sm md:text-base">
                          Specification
                        </th>
                        <th className="border border-gray-200 px-4 py-2 md:py-3 text-left font-semibold text-sm md:text-base">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          spec: "Manufacturer",
                          value: auctionData.vehicleManufacturer || "N/A",
                        },
                        {
                          spec: "Model",
                          value: auctionData.vehicleModel || "N/A",
                          bg: true,
                        },
                        {
                          spec: "Year",
                          value: auctionData.yearofmanufacturer || "N/A",
                        },
                        {
                          spec: "Account Number",
                          value: auctionData.accountNumber || "N/A",
                          bg: true,
                        },
                      ].map((row, index) => (
                        <tr key={index} className={row.bg ? "bg-gray-50" : ""}>
                          <td className="border border-gray-200 px-4 py-2 md:py-3 font-medium text-sm md:text-base">
                            {row.spec}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 md:py-3 text-sm md:text-base">
                            {row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="md:hidden space-y-3">
                    {[
                      {
                        spec: "Manufacturer",
                        value: auctionData.vehicleManufacturer || "N/A",
                      },
                      {
                        spec: "Model",
                        value: auctionData.vehicleModel || "N/A",
                      },
                      {
                        spec: "Year",
                        value: auctionData.yearofmanufacturer || "N/A",
                      },
                      {
                        spec: "Account Number",
                        value: auctionData.accountNumber || "N/A",
                      },
                    ].map((row, index) => (
                      <div
                        key={index}
                        className="border-b border-gray-200 pb-3 last:border-0 last:pb-0"
                      >
                        <div className="text-sm font-medium text-gray-500">
                          {row.spec}
                        </div>
                        <div className="text-base font-medium">{row.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* TIMER */}
              <div className="flex flex-col gap-2">
                <h3 className="text-blue-600 font-medium text-sm">
                  End Auction Time
                </h3>
                <p className="text-white bg-blue-600 px-3 py-1 rounded-md text-sm w-max">
                  <CountDownTimer
                    startTime={auctionData?.startTime}
                    endTime={auctionData?.endTime}
                    id={auctionData?._id}
                    Winner={handleWinner}
                  />
                </p>
              </div>

              {/* BIDDING OPTIONS */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  Bidding Options
                </h2>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-xs md:text-sm p-3 rounded mb-4 md:mb-6">
                  <strong>Note:</strong> Your payment method will not be charged
                  until the auction is finalized.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                  {Object.entries(minBidAmounts).map(([type, amount]) => (
                    <div key={type} className="text-center">
                      <div
                        className={`bg-blue-50 p-3 md:p-4 rounded-lg border ${
                          bidType === type
                            ? "border-blue-500"
                            : "border-blue-200"
                        }`}
                      >
                        <div className="font-semibold text-gray-800 mb-1 md:mb-2 text-sm md:text-base">
                          {capitalizeWords(
                            type.replace(/([A-Z])/g, " $1").trim(),
                          )}
                        </div>
                        <div className="text-xs md:text-sm text-gray-700 mb-1">
                          Current:{" "}
                          <span className="font-semibold">
                            {currency}&nbsp;
                            {highestBids[type]}
                          </span>
                          <span className="text-xs text-gray-500 block -mt-1">
                            {capitalizeWords(`per square metre (m²)`)}
                          </span>
                        </div>
                        <div className="text-base md:text-lg font-bold text-blue-600 mb-2 md:mb-3">
                          Min: {currency}&nbsp;
                          {amount}
                        </div>
                        {isAuctionEnded ? (
                          <button
                            disabled
                            className="w-full py-1 md:py-2 bg-gray-400 text-gray-700 rounded cursor-not-allowed text-xs md:text-sm"
                          >
                            Auction Ended
                          </button>
                        ) : isAuctionUpcoming ? (
                          <button
                            disabled
                            className="w-full py-1 md:py-2 bg-yellow-500 text-white rounded cursor-not-allowed text-xs md:text-sm"
                          >
                            Upcoming Auction
                          </button>
                        ) : !logInUser ? (
                          <Link
                            to="/login"
                            className="w-full block text-center py-1 md:py-2 bg-gray-800 text-white rounded hover:bg-gray-900 text-xs md:text-sm"
                          >
                            Login to Bid
                          </Link>
                        ) : isOwner ? (
                          <button
                            type="button"
                            disabled
                            className="w-full py-1 md:py-2 bg-gray-400 text-gray-700 rounded cursor-not-allowed text-xs md:text-sm"
                          >
                            Own Auction
                          </button>
                        ) : !user?.paymentVerified ? (
                          <Link
                            to={{
                              pathname: "/user-profile/payment-method",
                              search: `?redirect=${encodeURIComponent(window.location.pathname)}`,
                              state: {
                                from: window.location.pathname,
                                auctionId: params.id,
                              },
                            }}
                            className="w-full block text-center py-1 md:py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs md:text-sm"
                          >
                            Verify Payment
                          </Link>
                        ) : (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              setBidType(type);
                              placeBidHandle(e, type);
                            }}
                          >
                            <div className="mb-2">
                              <input
                                type="number"
                                className="w-full px-2 py-1 md:px-3 md:py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                                placeholder={`${currency}${highestBids[type] + 1}+`}
                                value={bidAmounts[type]}
                                min={highestBids[type] + 1}
                                step="1"
                                required
                                disabled={isOwner}
                                onChange={(e) =>
                                  handleBidAmountChange(type, e.target.value)
                                }
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={submittingType === type}
                              className={`w-full py-1 md:py-2 text-white rounded text-xs md:text-sm ${
                                submittingType === type
                                  ? "bg-gray-500"
                                  : "bg-green-600 hover:bg-green-700"
                              }`}
                            >
                              {submittingType === type ? (
                                <div className="flex items-center justify-center">
                                  <svg
                                    className="animate-spin -ml-1 mr-1 h-3 w-3 md:h-4 md:w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Placing...
                                </div>
                              ) : (
                                "Place Bid"
                              )}
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                  {Object.entries(auctionData.buyNowRates || {}).map(
                    ([type, amount], index) => {
                      const displayType = type
                        .replace(/([A-Z])/g, " $1")
                        .trim();
                      const isSold = isWrapSold(type);
                      return (
                        <div key={type} className="text-center">
                          <div className="bg-green-50 p-3 md:p-4 rounded-lg border border-green-200 relative">
                            <div className="text-xs text-gray-600 mb-1">
                              {index + 5}
                            </div>
                            <div className="font-semibold text-gray-800 mb-1 md:mb-2 text-sm md:text-base">
                              {capitalizeWords(displayType)}
                            </div>
                            <div className="text-base md:text-lg font-bold text-green-600 mb-2 md:mb-3">
                              {currency}&nbsp;
                              {amount}
                              <span className="text-xs text-gray-500 block -mt-1">
                                {capitalizeWords(`per square metre (m²)`)}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                if (isSold) {
                                  toast.error(
                                    `${capitalizeWords(displayType)} is already sold.`,
                                  );
                                  return;
                                }
                                if (isAuctionEnded) {
                                  toast.error(
                                    `Auction has ended for ${capitalizeWords(displayType)}.`,
                                  );
                                  return;
                                }
                                if (isAuctionUpcoming) {
                                  toast.error(
                                    `Auction has not started yet for ${capitalizeWords(displayType)}.`,
                                  );
                                  return;
                                }
                                if (!logInUser) {
                                  toast.error("Please log in to buy now.", {
                                    autoClose: 8000,
                                  });
                                  return;
                                }
                                if (isOwner) {
                                  toast.error(
                                    "You cannot buy from your own auction.",
                                  );
                                  return;
                                }
                                if (!user?.paymentVerified) {
                                  toast.error(
                                    "Please verify your payment method first.",
                                  );
                                  setTimeout(() => {
                                    navigate("/user-profile/payment-method", {
                                      state: {
                                        from: window.location.pathname,
                                        auctionId: params.id,
                                      },
                                    });
                                  }, 1500);
                                  return;
                                }
                                handleBuyNow(type, amount);
                              }}
                              disabled={
                                isSold ||
                                isAuctionEnded ||
                                isAuctionUpcoming ||
                                isOwner
                              }
                              className={`w-full px-2 py-1 md:px-3 md:py-2 text-white rounded-md text-xs md:text-sm font-medium ${
                                isSold
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : isAuctionEnded
                                    ? "bg-red-400 cursor-not-allowed"
                                    : isAuctionUpcoming
                                      ? "bg-yellow-400 cursor-not-allowed"
                                      : isOwner
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-green-600 hover:bg-green-700 transition-colors"
                              }`}
                            >
                              {isSold
                                ? "Already Sold"
                                : isAuctionEnded
                                  ? "Auction Ended"
                                  : isAuctionUpcoming
                                    ? "Upcoming"
                                    : "Buy Now"}
                            </button>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              {/* VEHICLE IMAGES */}
              {Array.isArray(auctionData?.images) &&
                auctionData.images.length > 0 && (
                  <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                      Vehicle Images
                    </h2>
                    <div className="flex flex-col gap-3 md:gap-4">
                      <div className="w-full h-48 sm:h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        <img
                          src={selectedImage?.url || auctionData.images[0].url}
                          alt="main preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "path/to/placeholder/image.jpg";
                          }}
                        />
                      </div>
                      <div className="flex gap-2 overflow-x-auto py-1 md:py-2">
                        {auctionData.images.map((img, index) => (
                          <div
                            key={index}
                            className={`w-12 h-12 sm:w-16 sm:h-16 border-2 rounded-md overflow-hidden flex justify-center items-center cursor-pointer transition-all ${
                              selectedImage?.url === img.url ||
                              selectedImage === img.url
                                ? "border-blue-500"
                                : "border-gray-300"
                            }`}
                            onClick={() => setSelectedImage(img)}
                            onMouseEnter={() => setSelectedImage(img)}
                          >
                            <img
                              src={img.url}
                              alt={`thumbnail-${index}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              {/* MAP */}
              {(auctionData?.location?.zip || auctionData?.location?.name) && (
                <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                  <div className="h-64 sm:h-80 md:h-96">
                    <GoogleMapComponent
                      zipCode={auctionData?.location?.zip}
                      location={auctionData?.location?.name}
                      latitude={auctionData?.location?.latitude}
                      longitude={auctionData?.location?.longitude}
                      additionalLocations={auctionData.additionalLocations}
                    />
                  </div>
                </div>
              )}

              {/* CPA COMPARISON TABLE */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                <CpaComparisonTable />
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="space-y-4 md:space-y-6">
              {/* BASIC INFORMATION */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                  Vehicle Information
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs md:text-sm">
                    <tbody className="divide-y divide-gray-100">
                      {[
                        {
                          label: "Vehicle Type",
                          value: auctionData.vehicleType,
                        },
                        { label: "Model", value: auctionData.vehicleModel },
                        {
                          label: "Manufacturer",
                          value: auctionData.vehicleManufacturer,
                        },
                        {
                          label: "Registration Plate No.",
                          value: auctionData.registrationPlate || "---",
                        },
                        {
                          label: "Daily Mileage",
                          value: auctionData.dailyMileage
                            ? `${auctionData.dailyMileage} km/day`
                            : "---",
                        },
                        {
                          label: "Account Number",
                          value: auctionData.accountNumber,
                        },
                        // { label: "Manufacturer Country", value: auctionData.country },
                      ].map((item, index) => (
                        <tr key={index} className="align-top">
                          <td className="py-3 pr-4 font-medium text-gray-700 whitespace-nowrap w-1/3 md:w-1/4">
                            {item.label}
                          </td>
                          <td className="py-3 text-gray-900 break-all">
                            <span className="font-semibold text-theme-color">
                              {item.value}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* VEHICLE AVAILABILITY */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                  Vehicle Availability
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {Object.entries(auctionData.vehicleAvailability || {})
                    .filter(([_, status]) => status === "Available")
                    .map(([period]) => (
                      <div key={period} className="flex items-center">
                        <span
                          className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                          style={{ backgroundColor: "#10B981" }}
                        ></span>
                        <div className="text-sm font-medium capitalize">
                          {period.replace(/([A-Z])/g, " $1")}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* PRICING INFORMATION */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                {/* <div className="mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">
                  Vehicle Information
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 text-xs md:text-sm text-gray-700">
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-medium mb-1">
                      Manufacturer
                    </span>
                    <span className="text-sm md:text-base font-semibold text-gray-900">
                      {auctionData.vehicleManufacturer || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-medium mb-1">
                      Vehicle Type
                    </span>
                    <span className="text-sm md:text-base font-semibold text-gray-900">
                      {auctionData.vehicleType || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-medium mb-1">Year</span>
                    <span className="text-sm md:text-base font-semibold text-gray-900">
                      {auctionData.yearofmanufacturer || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-medium mb-1">
                      Model
                    </span>
                    <span className="text-sm md:text-base font-semibold text-gray-900">
                      {auctionData.vehicleModel || "N/A"}
                    </span>
                  </div>
                </div>
              </div> */}
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                  Pricing Information
                </h2>
                <div className="mb-4 md:mb-6">
                  <h3 className="text-base md:text-lg font-medium text-gray-800 mb-2 md:mb-3">
                    Minimum Auction Rates
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs md:text-sm border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-1 px-2 md:py-2 md:px-3 text-left font-medium text-gray-700">
                            Ad Type
                          </th>
                          <th className="py-1 px-2 md:py-2 md:px-3 text-right font-medium text-gray-700">
                            Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[
                          {
                            type: "Full Wrap",
                            value:
                              auctionData.minAuctionRates?.fullWrap || "N/A",
                          },
                          {
                            type: "One Side",
                            value:
                              auctionData.minAuctionRates?.oneSide || "N/A",
                          },
                          {
                            type: "Both Sides",
                            value:
                              auctionData.minAuctionRates?.bothSides || "N/A",
                          },
                          {
                            type: "Rear Doors",
                            value:
                              auctionData.minAuctionRates?.rearDoors || "N/A",
                          },
                        ].map((item, index) => (
                          <tr key={index}>
                            <td className="py-1 px-2 md:py-2 md:px-3">
                              {item.type}
                            </td>
                            <td className="py-1 px-2 md:py-2 md:px-3 text-right font-medium">
                              {item.value === "N/A"
                                ? "N/A"
                                : `${currency} ${item.value}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="mb-4 md:mb-6">
                  <h3 className="text-base md:text-lg font-medium text-gray-800 mb-2 md:mb-3">
                    Buy Now Rates
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs md:text-sm border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-1 px-2 md:py-2 md:px-3 text-left font-medium text-gray-700">
                            Ad Type
                          </th>
                          <th className="py-1 px-2 md:py-2 md:px-3 text-right font-medium text-gray-700">
                            Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[
                          {
                            type: "Full Wrap",
                            value: auctionData.buyNowRates?.fullWrap || "N/A",
                          },
                          {
                            type: "One Side",
                            value: auctionData.buyNowRates?.oneSide || "N/A",
                          },
                          {
                            type: "Both Sides",
                            value: auctionData.buyNowRates?.bothSides || "N/A",
                          },
                          {
                            type: "Rear Doors",
                            value: auctionData.buyNowRates?.rearDoors || "N/A",
                          },
                        ].map((item, index) => (
                          <tr key={index}>
                            <td className="py-1 px-2 md:py-2 md:px-3">
                              {item.type}
                            </td>
                            <td className="py-1 px-2 md:py-2 md:px-3 text-right font-medium">
                              {item.value === "N/A"
                                ? "N/A"
                                : `${currency} ${item.value}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-medium text-gray-800 mb-2 md:mb-3">
                    Discount Offers
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
                    {[
                      {
                        duration: "3 Months",
                        value: auctionData.discountOffers?.threeMonth,
                        color: "blue",
                      },
                      {
                        duration: "6 Months",
                        value: auctionData.discountOffers?.sixMonth,
                        color: "green",
                      },
                      {
                        duration: "12 Months",
                        value: auctionData.discountOffers?.twelveMonth,
                        color: "yellow",
                      },
                      {
                        duration: "24 Months",
                        value: auctionData.discountOffers?.twentyFourMonth,
                        color: "purple",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className={`bg-${item.color}-50 p-2 md:p-3 rounded-lg text-center`}
                      >
                        <div className="text-lg md:text-xl font-bold text-${item.color}-600">
                          {item.value}%
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">
                          {item.duration}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {Array.isArray(auctionData?.interRoutes) &&
                auctionData.interRoutes.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">
                      Intercity Routes
                    </h2>

                    <div className="space-y-2">
                      {auctionData.interRoutes.map((route, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg"
                        >
                          <FiMapPin className="text-blue-600 mt-1" />
                          <div className="text-sm text-gray-800">
                            <div>
                              <span className="font-semibold">From:</span>{" "}
                              {route.from}
                            </div>
                            <div>
                              <span className="font-semibold">To:</span>{" "}
                              {route.to}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* PROHIBITED ADS */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                  Prohibited Advertisements
                </h2>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(auctionData.prohibitedAds || {}).map(
                    ([type, prohibited]) => {
                      if (type === "otherSpecify" || !prohibited) return null;
                      return (
                        <div
                          key={type}
                          className="flex items-center bg-red-50 px-3 py-1 rounded-full"
                        >
                          <span className="text-sm font-medium capitalize">
                            {type.replace(/([A-Z])/g, " $1")}
                          </span>
                        </div>
                      );
                    },
                  )}
                  {auctionData.prohibitedAds?.otherSpecify && (
                    <div className="flex items-center bg-red-50 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium">
                        {auctionData.prohibitedAds.otherSpecify}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <MediumRectangle />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FleetAuctionDetails;

// import { useParams, useSearchParams, Link } from "react-router-dom";
// import React, { useEffect, useState, useMemo, useCallback } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   getfleetauctionbyid,
//   getVehicalAvalibality,
// } from "../store/fleetowner/fleetownerSlice";
// import { useNavigate } from "react-router-dom";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, Pagination } from "swiper/modules";
// import { placeABid } from "../store/bid/bidSlice";
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";
// import { toast } from "react-toastify";
// import { sendNewBidNotification } from "../store/notification/notificationSlice";
// import socket from "../socket";
// import RequestBudgetModal from "./RequestBudgetModal";
// import CpaComparisonTable from "../components/CpaComparisonTable";
// import { fetchUserCountry } from "../store/countary/countrySlice";
// import {
//   FiInfo,
//   FiMapPin,
//   FiTruck,
//   FiDollarSign,
//   FiEye,
//   FiX,
// } from "react-icons/fi";
// import image1 from "../assets/Dimension labeled_page-0001.jpg";
// // import image2 from "../assets/image2.png";
// // import image3 from "../assets/image3.png";
// import CountDownTimer from "../components/CountDownTimer";
// import { getAllBidsForAuction } from "../store/bid/bidSlice";
// import GoogleMapComponent from "../components/GoogleComponents";
// import axios from "axios";
// import { fetchVehicles } from "../store/vehicle/vehicleSlice";
// import { fetchSoldWraps } from "../store/order/OrderSlice";
// import { parseISO, isAfter } from "date-fns";
// const FleetAuctionDetails = () => {
//   const { id } = useParams();
//   const params = useParams();
//   const [searchParams] = useSearchParams();
//   const dispatch = useDispatch();
//   const logInUser = JSON.parse(localStorage.getItem("user"));
//   const { country, currency } = useSelector((state) => state.country);
//   const { list: vehicles } = useSelector((state) => state.vehicles);
//   const { user } = useSelector((state) => state.auth);
//   const isAdmin = user?.userType === "admin";
//   const [activeSlide, setActiveSlide] = useState(0);
//   const [newBidAmount, setNewBidAmount] = useState("");
//   const [bidType, setBidType] = useState("fullWrap");
//   const [activeTab, setActiveTab] = useState("description");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isOpen, setIsOpen] = useState(false);
//   const [open, setOpen] = useState(false);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [currentBids, setCurrentBids] = useState({
//     fullWrap: null,
//     oneSide: null,
//     bothSides: null,
//     rearDoors: null,
//   });
//   const [showInfo, setShowInfo] = useState(false);

//   const [wrapType, setWrapType] = useState(
//     searchParams.get("wrapType") || location.state?.wrapType || ""
//   );
//   const {
//     soldWraps,
//     isLoading: orderLoading,
//     error: orderError,
//   } = useSelector((state) => state.order);

//   const navigate = useNavigate();

//   useEffect(() => {
//     dispatch(fetchVehicles());
//     dispatch(fetchSoldWraps(id));
//   }, [dispatch, id]);

//   useEffect(() => {
//     if (!country) {
//       dispatch(fetchUserCountry());
//     }
//   }, [dispatch, country]);

//   const highestBids = useMemo(
//     () => ({
//       fullWrap: currentBids.fullWrap?.bidAmount || 0,
//       oneSide: currentBids.oneSide?.bidAmount || 0,
//       bothSides: currentBids.bothSides?.bidAmount || 0,
//       rearDoors: currentBids.rearDoors?.bidAmount || 0,
//     }),
//     [currentBids]
//   );

//   const [bidAmounts, setBidAmounts] = useState({
//     fullWrap: "",
//     oneSide: "",
//     bothSides: "",
//     rearDoors: "",
//   });
//   const [submittingType, setSubmittingType] = useState(null);

//   const {
//     form: auction,
//     vehicalavalibality,
//     isError,
//     message,
//   } = useSelector((state) => state.fleetOwner);

//   // Memoized auction data
//   const auctionData = useMemo(() => auction?.data, [auction?.data]);
//   const image = useMemo(() => auctionData?.images || [], [auctionData]);
//   // Memoized route data
//   // const routeData = useMemo(
//   //   () =>
//   //     auctionData?.interRoutes?.[0]
//   //       ? {
//   //           from: auctionData.interRoutes[0].from,
//   //           to: auctionData.interRoutes[0].to,
//   //         }
//   //       : null,
//   //   [auctionData?.interRoutes]
//   // );

//   // Memoized minimum bid amounts

//   const minBidAmounts = useMemo(
//     () => ({
//       fullWrap: auctionData?.minAuctionRates?.fullWrap || 0,
//       oneSide: auctionData?.minAuctionRates?.oneSide || 0,
//       bothSides: auctionData?.minAuctionRates?.bothSides || 0,
//       rearDoors: auctionData?.minAuctionRates?.rearDoors || 0,
//     }),
//     [auctionData?.minAuctionRates]
//   );

//   useEffect(() => {
//     setIsLoading(true);
//     Promise.all([dispatch(getfleetauctionbyid(params?.id))]).then(() => {
//       setIsLoading(false);
//     });
//     dispatch(getAllBidsForAuction(params?.id));
//   }, [params?.id]);

//   const handleWinner = () => {
//     socket.emit("selectWinner", params?.id);
//   };

//   useEffect(() => {
//     const handleWinner = (data) => {
//       if (data.auctionId === params.id) {
//         setAuctionWinnerDetailData(data);
//         setAuctionStarted(false);
//         dispatch(getfleetauctionbyid(params.id));
//         dispatch(getAllBidsForAuction(params.id));
//       }
//     };

//     socket.on("winnerSelected", handleWinner);
//     socket.emit("joinAuction", params.id);

//     return () => {
//       socket.off("winnerSelected", handleWinner);
//       socket.emit("leaveAuction", params.id);
//     };
//   }, [params.id, dispatch]);

//   useEffect(() => {
//     const handleWinnerSelected = (data) => {
//       if (data.auctionId === params.id) {
//         setAuctionWinnerDetailData(data.winner);
//         setAuctionStarted(false);
//         dispatch(getfleetauctionbyid(params.id));
//         dispatch(getAllBidsForAuction(params.id));

//         if (logInUser?._id === data.winner.bidder._id.toString()) {
//           toast.success(
//             `Congratulations! You won this auction! Item has been added to your cart.`,
//             { autoClose: 5000 }
//           );
//         }
//       }
//     };

//     socket.on("winnerSelected", handleWinnerSelected);

//     return () => {
//       socket.off("winnerSelected", handleWinnerSelected);
//     };
//   }, [params.id, dispatch, logInUser]);

//   // Memoized user checks
//   const isOwner = useMemo(
//     () => auctionData?.fleetOwner?._id === logInUser?._id,
//     [auctionData?.fleetOwner?._id, logInUser?._id]
//   );

//   useEffect(() => {
//     if (id) {
//       dispatch(getfleetauctionbyid(id));
//     }
//   }, [dispatch, id]);

//   useEffect((fleetOwnerId) => {
//     dispatch(getVehicalAvalibality(fleetOwnerId));
//   }, []);

//   useEffect(() => {
//     if (auctionData?.currentBids) {
//       setCurrentBids(auctionData.currentBids);
//     }
//   }, [auctionData]);

//   const auctionTiming = useMemo(() => {
//     if (!auctionData)
//       return { startTime: null, endTime: null, status: "pending" };

//     return {
//       startTime: auctionData.startTime || auctionData.auctionStartTime || null,
//       endTime: auctionData.endTime || auctionData.auctionEndTime || null,
//       status: auctionData.status || auctionData.auctionStatus || "active",
//     };
//   }, [auctionData]);

//   const { startTime, endTime, status } = auctionTiming;

//  const isAuctionEnded = useMemo(() => {
//   // If status is explicitly "ended" or "completed", auction has ended
//   if (status === "ended" || status === "completed") return true;

//   // Check if current time is past the end time
//   if (endTime) {
//     const now = new Date();
//     const auctionEndTime = new Date(endTime);
//     return now > auctionEndTime;
//   }

//   // Default to false (auction is either upcoming or active)
//   return false;
// }, [status, endTime]);
// const isAuctionUpcoming = useMemo(() => {
//   if (!startTime) return false;

//   const now = new Date();
//   const auctionStartTime = new Date(startTime);

//   return now < auctionStartTime;
// }, [startTime]);

// // And one for active auctions:
// const isAuctionActive = useMemo(() => {
//   if (!startTime || !endTime) return false;

//   const now = new Date();
//   const auctionStartTime = new Date(startTime);
//   const auctionEndTime = new Date(endTime);

//   return now >= auctionStartTime && now < auctionEndTime;
// }, [startTime, endTime]);

//   const handleBidAmountChange = useCallback((type, value) => {
//     setBidAmounts((prev) => ({
//       ...prev,
//       [type]: value,
//     }));
//   }, []);

//   const placeBidHandle = useCallback(
//     async (e, type) => {
//       e.preventDefault();
//       setSubmittingType(type);

//       const bidAmount = parseFloat(bidAmounts[type]);
//       const minAmount = minBidAmounts[type] || 0;
//       const currentHighestBid = highestBids[type] || 0;

//       if (!bidAmount) {
//         toast.error("Please enter a bid amount");
//         setSubmittingType(null);
//         return;
//       }

//       if (bidAmount < minAmount) {
//         toast.error(`Bid must be at least ${currency}${minAmount} for ${type}`);
//         setSubmittingType(null);
//         return;
//       }

//       if (bidAmount <= currentHighestBid) {
//         toast.error(
//           `Bid must be greater than current highest bid of ${currency}${currentHighestBid} for ${type}`
//         );
//         setSubmittingType(null);
//         return;
//       }

//       try {
//         const result = await dispatch(
//           placeABid({
//             id,
//             amount: Math.floor(bidAmount),
//             fleetOwnerId: auctionData?.fleetOwner?._id,
//             bidType: type,
//           })
//         );

//         if (placeABid.fulfilled.match(result)) {
//           toast.success(
//             `${type.replace(/([A-Z])/g, " $1")} bid placed successfully!`
//           );
//           setBidAmounts((prev) => ({ ...prev, [type]: "" }));
//           dispatch(getfleetauctionbyid(id));
//         } else {
//           toast.error(result.payload?.message || "Failed to place bid");
//         }
//       } catch (error) {
//         toast.error(error.message || "Error placing bid");
//       } finally {
//         setSubmittingType(null);
//       }
//     },
//     [
//       bidAmounts,
//       minBidAmounts,
//       highestBids,
//       dispatch,
//       id,
//       auctionData?.fleetOwner?._id,
//       currency,
//     ]
//   );
//   const isWrapSold = useCallback(
//     (type) => {
//       if (!soldWraps) return false;

//       if (Array.isArray(soldWraps)) {
//         const isSold = soldWraps.some(
//           (wrap) => wrap.wrapType === type && wrap.status === "sold"
//         );
//         return isSold;
//       }

//       return false;
//     },
//     [soldWraps]
//   );

//   const calculateSurfaceArea = (dimensions, wrapType) => {
//     if (!dimensions || !wrapType) {
//       console.error("Missing dimensions or wrapType:", {
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
//       bonnetwidth,
//       cabheight,
//       cabwidth,
//     } = dimensions;

//     // Convert dimensions to meters (assuming dimensions are in inches)
//     const lengthMeters = length ? length * 0.0254 : 0;
//     const widthMeters = width ? width * 0.0254 : 0;
//     const heightMeters = height ? height * 0.0254 : 0;
//     const bonnetLengthMeters = bonnetLength ? bonnetLength * 0.0254 : 0;
//     const bonnetWidthMeters = bonnetwidth ? bonnetwidth * 0.0254 : 0;
//     const cabHeightMeters = cabheight ? cabheight * 0.0254 : 0;
//     const cabWidthMeters = cabwidth ? cabwidth * 0.0254 : 0;

//     switch (wrapType) {
//       case "fullWrap":
//         // Include main body (length, width, height) and bonnet/cab areas
//         return (
//           // Main body: two sides, two ends, top (excluding bottom)
//           2 * lengthMeters * heightMeters +
//           2 * widthMeters * heightMeters +
//           lengthMeters * widthMeters +
//           // Bonnet area: bonnetLength * bonnetwidth
//           bonnetLengthMeters * bonnetWidthMeters +
//           // Cab area: cabheight * cabwidth (assuming cab front)
//           cabHeightMeters * cabWidthMeters
//         );
//       case "oneSide":
//         // One side of the main body
//         return lengthMeters * heightMeters;
//       case "bothSides":
//         // Both sides of the main body
//         return 2 * lengthMeters * heightMeters;
//       case "rearDoors":
//         // Rear door area (width * height)
//         return widthMeters * heightMeters;
//       default:
//         console.warn(`Unknown wrapType: ${wrapType}`);
//         return 0;
//     }
//   };

//   const handleBuyNow = (type, amount) => {
//   if (!auctionData) {
//     toast.error("Auction data not available.");
//     return;
//   }

//   if (!logInUser) {
//     toast.error("Please log in to buy now.", { autoClose: 8000 });
//     return;
//   }

//   if (isWrapSold(type)) {
//     toast.error(`${capitalizeWords(type)} is already sold.`);
//     return;
//   }

//   if (isAuctionEnded) {
//     toast.error(`Auction has ended for ${capitalizeWords(type)}.`);
//     return;
//   }

//   if (isAuctionUpcoming) {
//     toast.error(`Auction has not started yet for ${capitalizeWords(type)}.`);
//     return;
//   }

//   if (isOwner) {
//     toast.error("You cannot buy from your own auction.");
//     return;
//   }

//   if (!user?.paymentVerified) {
//     toast.error("Please verify your payment method first.");
//     setTimeout(() => {
//       navigate("/user-profile/payment-method", {
//         state: { from: window.location.pathname, auctionId: id },
//       });
//     }, 1500);
//     return;
//   }

//   // Step 1: Try to find vehicle by _id (best case - if backend saves vehicleId)
//   let selectedVehicle = vehicles.find(
//     (v) =>
//       v._id === auctionData.vehicleId ||
//       v._id === auctionData.vehicle || // कुछ cases में vehicle field में _id होता है
//       v._id === auctionData.selectedVehicle // अगर कोई और field हो
//   );

//   // Step 2: Fallback - model + manufacturer + year (सबसे common case)
//   if (!selectedVehicle) {
//     selectedVehicle = vehicles.find(
//       (v) =>
//         v.model?.toLowerCase().trim() === auctionData.vehicleModel?.toLowerCase().trim() &&
//         v.manufacturer?.toLowerCase().trim() === auctionData.vehicleManufacturer?.toLowerCase().trim() &&
//         String(v.yearOfManufacture) === String(auctionData.yearofmanufacturer)
//     );
//   }

//   // Step 3: Weak fallback - only by model name (last resort)
//   if (!selectedVehicle) {
//     selectedVehicle = vehicles.find(
//       (v) => v.model?.toLowerCase().trim() === auctionData.vehicleModel?.toLowerCase().trim()
//     );
//   }

//   // Final check: अगर फिर भी नहीं मिला या dimensions missing हैं
//   if (!selectedVehicle || !selectedVehicle.dimensions) {
//     toast.error("Vehicle dimensions not available. Cannot proceed with Buy Now.");
//     console.error("Vehicle match failed", {
//       auctionModel: auctionData.vehicleModel,
//       auctionManufacturer: auctionData.vehicleManufacturer,
//       auctionYear: auctionData.yearofmanufacturer,
//       availableVehicles: vehicles.map((v) => ({
//         id: v._id,
//         model: v.model,
//         manufacturer: v.manufacturer,
//         year: v.yearOfManufacture,
//       })),
//     });
//     return;
//   }

//   // अब safely calculate surface area
//   const surfaceArea = calculateSurfaceArea(selectedVehicle.dimensions, type);

//   if (surfaceArea <= 0) {
//     toast.error("Invalid vehicle dimensions. Cannot calculate area.");
//     return;
//   }

//   const totalCost = surfaceArea * amount;
//   const totalCostRounded = parseFloat(totalCost.toFixed(2));

//   // Navigate to checkout with all details
//   const queryParams = new URLSearchParams({
//     name: auctionData.company || "Fleet Advertising",
//     price: totalCost.toFixed(2),
//     quantity: 1,
//     description: `${capitalizeWords(type)} (Area: ${surfaceArea.toFixed(2)} m²)`,
//     image: auctionData.images?.[0]?.url || auctionData.images?.[0] || "",
//     payment: "CARD",
//     isFleetAuction: true,
//     fleetAuctionId: auctionData._id || "",
//     wrapType: type,
//     surfaceArea: surfaceArea.toFixed(2),
//   });

//   navigate(`/checkout/${auctionData._id || "unknown"}?${queryParams.toString()}`, {
//     state: {
//       type,
//       amount: totalCostRounded,
//       vehicleModel: auctionData.vehicleModel || "",
//       manufacturer: auctionData.vehicleManufacturer || "",
//       year: auctionData.yearofmanufacturer || "",
//       surfaceArea: surfaceArea.toFixed(2),
//       image: auctionData.images?.[0]?.url || auctionData.images?.[0] || "",
//       isFleetAuction: true,
//       fleetAuctionId: auctionData._id || "",
//       wrapType: type,
//     },
//   });
// };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600 text-lg">Loading auction details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="text-red-500 text-center py-20 bg-gray-50 min-h-screen flex items-center justify-center">
//         <div className="bg-white rounded-2xl shadow-lg p-8">
//           <div className="text-2xl font-bold mb-2">Error Loading Auction</div>
//           <div className="text-gray-600">{message}</div>
//         </div>
//       </div>
//     );
//   }

//   if (!auctionData.isApprovedByAdmin && !isAdmin) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
//         <div className="bg-theme-bg rounded-2xl shadow-lg p-8 max-w-md text-center">
//           <div className="text-red-500 text-5xl mb-4">⛔</div>
//           <h2 className="text-2xl font-bold text-white mb-4">
//             Auction Not Approved
//           </h2>
//           <p className="text-white mb-6">
//             This auction has not been approved by the admin yet. Please check
//             back later.
//           </p>
//           <Link
//             to="/user-profile/profile"
//             className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//           >
//             Go to Dashboard
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   function capitalizeWords(str) {
//     if (!str) return "";
//     return str
//       .split(" ")
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//       .join(" ");
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 m-6">
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:justify-end gap-4 sm:gap-2 w-full relative mt-6">
//           <button
//             onClick={() => setOpen(true)}
//             className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
//           >
//             Request Budget
//           </button>
//           <div className="relative">
//             <button
//               onClick={() => setShowInfo(!showInfo)}
//               className="text-gray-600 text-xl hover:text-gray-800 transition"
//               aria-label="Info"
//               title="Click to know what 'Request Budget' means"
//             >
//               <FiInfo className="w-6 h-6" />
//             </button>
//             {showInfo && (
//               <div className="absolute top-8 right-0 w-80 p-4 bg-white border border-gray-200 rounded-md shadow-lg z-50 text-sm text-gray-700">
//                 <p className="mb-2 font-semibold">
//                   {capitalizeWords("What is Request Budget?")}
//                 </p>
//                 <p>
//                   {capitalizeWords(
//                     "As an Advertiser, you can request a budget to propose your expected rates for advertising spaces (Rear Doors, One Side, Both Sides, Full Wrap) on fleet vehicles. Enter your budget per square meter in the provided fields. After submission, your request will be sent to Fleet Managers, who can review your proposal and match it with their available advertising spaces. You’ll be notified when a Fleet Manager responds or accepts your budget request."
//                   )}
//                 </p>
//                 <button
//                   onClick={() => setShowInfo(false)}
//                   className="mt-3 text-blue-600 hover:underline"
//                 >
//                   Close
//                 </button>
//               </div>
//             )}
//           </div>
//           {open && <RequestBudgetModal onClose={() => setOpen(false)} />}
//         </div>

//         <div className="bg-white rounded-2xl shadow-md mb-8 p-6 relative m-6">
//           <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
//             <div className="flex-1">
//               <h1 className="text-3xl font-bold text-gray-900 mb-3">
//                 {auctionData.company}
//               </h1>
//               <div className="flex flex-wrap gap-4 text-gray-700 text-base">
//                 <div className="flex items-center gap-2 flex-wrap bg-gray-50 rounded-full">
//                   <svg
//                     className="w-5 h-5 text-gray-500"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z"
//                     />
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//                     />
//                   </svg>
//                   {auctionData.location?.name ||
//                     auctionData.location?.zip ||
//                     "Location not specified"}
//                 </div>
//                 {auctionData.additionalLocations?.length > 0 && (
//                   <div className="flex items-center gap-2 flex-wrap">
//                     <svg
//                       className="w-5 h-5 text-gray-500"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z"
//                       />
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//                       />
//                     </svg>
//                     {auctionData.additionalLocations.map((location, index) => (
//                       <span
//                         key={index}
//                         className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
//                       >
//                         {location.name || location.zip || "Unknown"}
//                       </span>
//                     ))}
//                   </div>
//                 )}
//                 <div className="flex items-center gap-2">
//                   <svg
//                     className="w-5 h-5 text-gray-500"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"
//                     />
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 7h1m-1 4h1m4-4h1m-1 4h1"
//                     />
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 20v-5a1 1 0 011-1h2a1 1 0 011 1v5"
//                     />
//                   </svg>
//                   {auctionData.vehicleModel || "Vehicle Model"}
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <svg
//                     className="w-5 h-5 text-gray-500"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
//                     />
//                   </svg>
//                   Account: {auctionData.accountNumber || "N/A"}
//                 </div>
//               </div>
//             </div>
//             <div className="self-start">
//               <button
//                 onClick={() => setIsOpen(true)}
//                 className="text-blue-600 hover:text-blue-800 font-bold text-lg rounded-full p-1"
//                 title="Visualise how your campaign will appear on the vehicle"
//               >
//                 <FiInfo className="w-6 h-6" />
//               </button>
//             </div>
//           </div>
//           {/* {isOpen && (
//             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//               <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4">
//                   {capitalizeWords("How to Measure Vehicle Dimensions")}
//                 </h2>
//                 <div className="space-y-2 text-gray-700 text-sm leading-relaxed">
//                   <p>
//                     •{" "}
//                     {capitalizeWords(
//                       "Measure from side to side at the height of the wing mirrors to determine"
//                     )}{" "}
//                     <strong>Vehicle Width</strong>.
//                   </p>
//                   <p>
//                     •{" "}
//                     {capitalizeWords(
//                       "Measure from the roof edge to the bottom of the tail light extremity to determine"
//                     )}{" "}
//                     <strong>Vehicle Height</strong>.
//                   </p>
//                   <p>
//                     •{" "}
//                     {capitalizeWords(
//                       "Measure from the edge of the cab to the tail light extremity to determine"
//                     )}{" "}
//                     <strong>Vehicle Length</strong>.
//                   </p>
//                   <p>
//                     • <strong>Bonnet/Hood Length</strong>:{" "}
//                     {capitalizeWords(
//                       "Measure the full length of the hood separately."
//                     )}
//                     .
//                   </p>
//                   <p>
//                     • <strong>Cab Height</strong>:{" "}
//                     {capitalizeWords(
//                       "Measure from the ground to the top of the cab."
//                     )}
//                     .
//                   </p>
//                   <p>
//                     • <strong>Cab Length</strong>:{" "}
//                     {capitalizeWords(
//                       "Measure only the cab section, excluding the rear."
//                     )}
//                     .
//                   </p>
//                   <p>
//                     •{" "}
//                     {capitalizeWords(
//                       "Measure between the centers of the wheels to determine"
//                     )}{" "}
//                     <strong>Wheelbase</strong>.
//                   </p>
//                   <p className="text-xs text-gray-500 italic">
//                     {capitalizeWords(
//                       `Note: Ensure descriptions and measurement labels are aligned properly.`
//                     )}
//                   </p>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
//                   <img
//                     src={image3}
//                     alt="Vehicle Width and Height Measurement"
//                     className="w-full rounded-lg object-cover"
//                   />
//                   <img
//                     src={image1}
//                     alt="Vehicle Length and Wheelbase Measurement"
//                     className="w-full rounded-lg object-cover"
//                   />
//                   <img
//                     src={image2}
//                     alt="Cab and Bonnet Measurement"
//                     className="w-full rounded-lg object-cover"
//                   />
//                 </div>
//                 <button
//                   onClick={() => setIsOpen(false)}
//                   className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold"
//                 >
//                   ×
//                 </button>
//               </div>
//             </div>
//           )} */}
//           {isOpen && (
//   <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50">
//     <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">

//       {/* CLOSE BUTTON - stays visible even while scrolling */}
//        <div className="sticky top-0 flex justify-end z-[1100] bg-white/60 backdrop-blur-md p-2">
//         <button
//           onClick={() => setIsOpen(false)}
//           className="bg-red-600 hover:bg-red-700 text-white text-3xl font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
//         >
//           ×
//         </button>
//       </div>

//       {/* IMAGE */}
//       <img
//         src={image1}
//         alt="Vehicle Measurement"
//         className="w-full h-auto rounded-lg object-contain"
//       />
//     </div>
//   </div>
// )}

//         </div>

//         <div className="mb-6 p-4 bg-gray-100 rounded-lg">
//           <h3 className="text-lg font-semibold mb-3 text-gray-700">
//             Fleet Manager Availability
//           </h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm sm:text-base text-gray-700">
//             <div className="flex flex-col gap-y-1">
//               <span>Total Vehicles:</span>
//               <span className="font-semibold">
//                 {vehicalavalibality?.totalVehicles}
//               </span>
//             </div>
//             <div className="flex flex-col gap-y-1">
//               <span>Available Now:</span>
//               <span className="font-semibold text-green-600">
//                 {vehicalavalibality?.availableNow}
//               </span>
//             </div>
//             <div className="flex flex-col gap-y-1">
//               <span>Utilization Rate:</span>
//               <span className="font-semibold">
//                 {vehicalavalibality?.utilizationRate}
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="grid lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
//           <div className="lg:col-span-2 space-y-4 md:space-y-6">
//             <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
//               <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-3 md:mb-4 lg:mb-6">
//                 Fleet Performance Metrics
//               </h2>
//               <div className="overflow-x-auto">
//                 <table className="hidden md:table w-full border-collapse border border-gray-200">
//                   <thead>
//                     <tr className="bg-blue-50">
//                       <th className="border border-gray-200 px-3 py-2 md:px-4 md:py-3 text-left font-semibold text-gray-900 text-sm md:text-base">
//                         Metric
//                       </th>
//                       <th className="border border-gray-200 px-3 py-2 md:px-4 md:py-3 text-left font-semibold text-gray-900 text-sm md:text-base">
//                         Value
//                       </th>
//                       <th className="border border-gray-200 px-3 py-2 md:px-4 md:py-3 text-left font-semibold text-gray-900 text-sm md:text-base">
//                         Source
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {[
//                       {
//                         metric: "1. Zip/Postal Codes Covered",
//                         value: auctionData.location?.zip || "Multiple Zones",
//                         source: "Database Values",
//                       },
//                       // {
//                       //   metric: "2. Intercity/Interstate Route",
//                       //   value: routeData
//                       //     ? `${routeData.from} → ${routeData.to}`
//                       //     : "Local Coverage",
//                       //   source: "Route Data",
//                       //   bg: true,
//                       // },
//                       {
//                         metric: "Full Wrap",
//                         value: highestBids.fullWrap,
//                         source: "Live Bidding",
//                         color: "text-green-600",
//                       },
//                       {
//                         metric: "One Side",
//                         value: highestBids.oneSide,
//                         source: "Live Bidding",
//                         color: "text-green-600",
//                         bg: true,
//                       },
//                       {
//                         metric: "Both Sides",
//                         value: highestBids.bothSides,
//                         source: "Live Bidding",
//                         color: "text-green-600",
//                       },
//                       {
//                         metric: "Rear Doors",
//                         value: highestBids.rearDoors,
//                         source: "Live Bidding",
//                         color: "text-green-600",
//                         bg: true,
//                       },
//                     ].map((row, index) => {
//                       const isBid = row.source === "Live Bidding";
//                       return (
//                         <tr key={index} className={row.bg ? "bg-gray-50" : ""}>
//                           <td className="border border-gray-200 px-3 py-2 md:px-4 md:py-3 font-medium text-sm md:text-base">
//                             {row.metric}
//                           </td>
//                           <td className="border border-gray-200 px-3 py-2 md:px-4 md:py-3 text-sm md:text-base">
//                             {isBid ? (
//                               <div className="flex flex-col items-start leading-tight">
//                                 {row.value ? (
//                                   <>
//                                     <span
//                                       className={`font-bold ${row.color} text-base md:text-lg`}
//                                     >
//                                       {currency}&nbsp;
//                                       {row.value}
//                                       <span className="text-xs text-gray-500 ml-1">
//                                         (Current Bid)
//                                       </span>
//                                     </span>
//                                     <span className="text-xs text-gray-500 mt-0.5">
//                                       Per Square Metre (m²)
//                                     </span>
//                                   </>
//                                 ) : (
//                                   <span className="text-gray-400 italic">
//                                     No Bids Yet
//                                   </span>
//                                 )}
//                               </div>
//                             ) : (
//                               <span>{row.value}</span>
//                             )}
//                           </td>
//                           <td className="border border-gray-200 px-3 py-2 md:px-4 md:py-3 text-gray-600 text-sm md:text-base">
//                             {row.source}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//                 <div className="md:hidden space-y-3">
//                   {[
//                     {
//                       metric: "1. Zip/Postal Codes Covered",
//                       value: auctionData.location?.zip || "Multiple Zones",
//                       source: "Database Values",
//                     },
//                     // {
//                     //   metric: "2. Intercity/Interstate Route",
//                     //   value: routeData
//                     //     ? `${routeData.from} → ${routeData.to}`
//                     //     : "Local Coverage",
//                     //   source: "Route Data",
//                     // },
//                     {
//                       metric: "Full Wrap",
//                       value: highestBids.fullWrap
//                         ? `${currency}${highestBids.fullWrap} Per Square Metre (m²)`
//                         : "No bids yet",
//                       source: "Live Bidding",
//                       color: "text-green-600 font-bold",
//                     },
//                     {
//                       metric: "One Side",
//                       value: highestBids.oneSide
//                         ? `${currency}${highestBids.oneSide} Per Square Metre (m²)`
//                         : "No bids yet",
//                       source: "Live Bidding",
//                       color: "text-green-600 font-bold",
//                     },
//                     {
//                       metric: "Both Sides",
//                       value: highestBids.bothSides
//                         ? `${currency}${highestBids.bothSides} Per Square Metre (m²)`
//                         : "No bids yet",
//                       source: "Live Bidding",
//                       color: "text-green-600 font-bold",
//                     },
//                     {
//                       metric: "Rear Doors",
//                       value: highestBids.rearDoors
//                         ? `${currency}${highestBids.rearDoors} Per Square Metre (m²)`
//                         : "No bids yet",
//                       source: "Live Bidding",
//                       color: "text-green-600 font-bold",
//                     },
//                   ].map((row, index) => (
//                     <div
//                       key={index}
//                       className={`border border-gray-200 rounded-lg p-3 shadow-sm ${
//                         index % 2 === 1 ? "bg-gray-50" : "bg-white"
//                       }`}
//                     >
//                       <div className="text-sm font-medium text-gray-700 mb-1">
//                         {row.metric}
//                       </div>
//                       <div
//                         className={`text-base ${
//                           row.color || "text-gray-800"
//                         } mb-1`}
//                       >
//                         {row.value}
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         Source: {row.source}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
//               <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-3 md:mb-6">
//                 Vehicle Specifications
//               </h2>
//               <div className="overflow-x-auto">
//                 <table className="hidden md:table w-full border-collapse border border-gray-200">
//                   <thead>
//                     <tr className="bg-gray-100">
//                       <th className="border border-gray-200 px-4 py-2 md:py-3 text-left font-semibold text-sm md:text-base">
//                         Specification
//                       </th>
//                       <th className="border border-gray-200 px-4 py-2 md:py-3 text-left font-semibold text-sm md:text-base">
//                         Value
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {[
//                       {
//                         spec: "Manufacturer",
//                         value: auctionData.vehicleManufacturer || "N/A",
//                       },
//                       {
//                         spec: "Model",
//                         value: auctionData.vehicleModel || "N/A",
//                         bg: true,
//                       },
//                       {
//                         spec: "Year",
//                         value: auctionData.yearofmanufacturer || "N/A",
//                       },
//                       {
//                         spec: "Account Number",
//                         value: auctionData.accountNumber || "N/A",
//                         bg: true,
//                       },
//                     ].map((row, index) => (
//                       <tr key={index} className={row.bg ? "bg-gray-50" : ""}>
//                         <td className="border border-gray-200 px-4 py-2 md:py-3 font-medium text-sm md:text-base">
//                           {row.spec}
//                         </td>
//                         <td className="border border-gray-200 px-4 py-2 md:py-3 text-sm md:text-base">
//                           {row.value}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//                 <div className="md:hidden space-y-3">
//                   {[
//                     {
//                       spec: "Manufacturer",
//                       value: auctionData.vehicleManufacturer || "N/A",
//                     },
//                     { spec: "Model", value: auctionData.vehicleModel || "N/A" },
//                     {
//                       spec: "Year",
//                       value: auctionData.yearofmanufacturer || "N/A",
//                     },
//                     {
//                       spec: "Account Number",
//                       value: auctionData.accountNumber || "N/A",
//                     },
//                   ].map((row, index) => (
//                     <div
//                       key={index}
//                       className="border-b border-gray-200 pb-3 last:border-0 last:pb-0"
//                     >
//                       <div className="text-sm font-medium text-gray-500">
//                         {row.spec}
//                       </div>
//                       <div className="text-base font-medium">{row.value}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <div className="flex flex-col gap-2">
//               <h3 className="text-blue-600 font-medium text-sm">
//                 End Auction Time
//               </h3>
//               <p className="text-white bg-blue-600 px-3 py-1 rounded-md text-sm w-max">
//                 <CountDownTimer
//                   startTime={auctionData?.startTime}
//                   endTime={auctionData?.endTime}
//                   id={auctionData?._id}
//                   Winner={handleWinner}
//                 />
//               </p>
//             </div>

//             {/* <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
//               <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
//                 Bidding Options
//               </h2>
//               <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-xs md:text-sm p-3 rounded mb-4 md:mb-6">
//                 <strong>Note:</strong>{" "}
//                 {capitalizeWords(
//                   `Your payment method will not be charged until the auction is finalized.`
//                 )}
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
//                 {Object.entries(minBidAmounts).map(([type, amount]) => (
//                   <div key={type} className="text-center">
//                     <div
//                       className={`bg-blue-50 p-3 md:p-4 rounded-lg border ${
//                         bidType === type ? "border-blue-500" : "border-blue-200"
//                       }`}
//                     >
//                       <div className="font-semibold text-gray-800 mb-1 md:mb-2 text-sm md:text-base">
//                         {capitalizeWords(
//                           type.replace(/([A-Z])/g, " $1").trim()
//                         )}
//                       </div>
//                       <div className="text-xs md:text-sm text-gray-700 mb-1">
//                         Current:{" "}
//                         <span className="font-semibold">
//                           {currency}
//                           {highestBids[type]}
//                         </span>
//                         <span className="text-xs text-gray-500 block -mt-1">
//                           {capitalizeWords(`per square metre (m²)`)}
//                         </span>
//                       </div>
//                       <div className="text-base md:text-lg font-bold text-blue-600 mb-2 md:mb-3">
//                         Min: {currency}
//                         {amount}
//                       </div>
//                       <form
//                         onSubmit={(e) => {
//                           e.preventDefault();
//                           setBidType(type);
//                           placeBidHandle(e, type);
//                         }}
//                       >
//                         <div className="mb-2">
//                           <input
//                             type="number"
//                             className="w-full px-2 py-1 md:px-3 md:py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
//                             placeholder={`${currency}${highestBids[type] + 1}+`}
//                             value={bidAmounts[type]}
//                             min={highestBids[type] + 1}
//                             step="1"
//                             required
//                             disabled={isOwner}
//                             onChange={(e) =>
//                               handleBidAmountChange(type, e.target.value)
//                             }
//                           />
//                         </div>
//                         {!logInUser ? (
//                             to="/login"
//                             className="w-full block py-1 md:py-2 bg-gray-800 text-white rounded hover:bg-gray-900 text-xs md:text-sm"
//                           >
//                             Login to Bid
//                           </Link>
//                         ) : isOwner ? (
//                           <button
//                             type="button"
//                             disabled
//                             className="w-full py-1 md:py-2 bg-gray-400 text-gray-700 rounded cursor-not-allowed text-xs md:text-sm"
//                           >
//                             Own Auction
//                           </button>
//                         ) : !user?.paymentVerified ? (
//                           <Link
//                             to="/user-profile/payment-method"
//                             className="w-full block py-1 md:py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs md:text-sm"
//                           >
//                             Verify Payment
//                           </Link>
//                         ) : (
//                           <button
//                             type="submit"
//                             disabled={submittingType === type}
//                             className={`w-full py-1 md:py-2 text-white rounded text-xs md:text-sm ${
//                               submittingType === type
//                                 ? "bg-gray-500"
//                                 : "bg-green-600 hover:bg-green-700"
//                             }`}
//                           >
//                             {submittingType === type ? (
//                               <div className="flex items-center justify-center">
//                                 <svg
//                                   className="animate-spin -ml-1 mr-1 h-3 w-3 md:h-4 md:w-4 text-white"
//                                   xmlns="http://www.w3.org/2000/svg"
//                                   fill="none"
//                                   viewBox="0 0 24 24"
//                                 >
//                                   <circle
//                                     className="opacity-25"
//                                     cx="12"
//                                     cy="12"
//                                     r="10"
//                                     stroke="currentColor"
//                                     strokeWidth="4"
//                                   ></circle>
//                                   <path
//                                     className="opacity-75"
//                                     fill="currentColor"
//                                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                                   ></path>
//                                 </svg>
//                                 Placing...
//                               </div>
//                             ) : (
//                               "Place Bid"
//                             )}
//                           </button>
//                         )}
//                       </form>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
//                 {Object.entries(auctionData.buyNowRates || {}).map(
//                   ([type, amount], index) => {
//                     const displayType = type.replace(/([A-Z])/g, " $1").trim();
//                  const isSold = isWrapSold(type);
//                     return (
//                       <div key={type} className="text-center">
//                         <div className="bg-green-50 p-3 md:p-4 rounded-lg border border-green-200 relative">
//                           <div className="text-xs text-gray-600 mb-1">
//                             {index + 5}
//                           </div>
//                           <div className="font-semibold text-gray-800 mb-1 md:mb-2 text-sm md:text-base">
//                             {capitalizeWords(displayType)}
//                           </div>
//                           <div className="text-base md:text-lg font-bold text-green-600 mb-2 md:mb-3">
//                             {currency}
//                             {amount}
//                             <span className="text-xs text-gray-500 block -mt-1">
//                               {capitalizeWords(`per square metre (m²)`)}
//                             </span>
//                           </div>
//                         <button
//   onClick={() => {
//     if (isSold) {
//       toast.error(
//         `${capitalizeWords(displayType)} is already sold.`
//       );
//       return;
//     }
//     handleBuyNow(type, amount);
//   }}
//   disabled={isSold}
//   className={`w-full px-2 py-1 md:px-3 md:py-2 text-white rounded-md text-xs md:text-sm font-medium ${
//     isSold
//       ? "bg-gray-400 cursor-not-allowed"
//       : "bg-green-600 hover:bg-green-700 transition-colors"
//   }`}
// >
//   {isSold ? "Already Sold" : "Buy Now"}
// </button>
//                         </div>
//                       </div>
//                     );
//                   }
//                 )}
//               </div>
//             </div> */}
//             <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
//               <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
//                 Bidding Options
//               </h2>
//               <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-xs md:text-sm p-3 rounded mb-4 md:mb-6">
//                 <strong>Note:</strong>{" "}
//                 Your payment method will not be charged until the auction is finalized.`

//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
//                 {Object.entries(minBidAmounts).map(([type, amount]) => (
//                   <div key={type} className="text-center">
//                     <div
//                       className={`bg-blue-50 p-3 md:p-4 rounded-lg border ${
//                         bidType === type ? "border-blue-500" : "border-blue-200"
//                       }`}
//                     >
//                       <div className="font-semibold text-gray-800 mb-1 md:mb-2 text-sm md:text-base">
//                         {capitalizeWords(
//                           type.replace(/([A-Z])/g, " $1").trim()
//                         )}
//                       </div>
//                       <div className="text-xs md:text-sm text-gray-700 mb-1">
//                         Current:{" "}
//                         <span className="font-semibold">
//                           {currency}&nbsp;
//                           {highestBids[type]}
//                         </span>
//                         <span className="text-xs text-gray-500 block -mt-1">
//                           {capitalizeWords(`per square metre (m²)`)}
//                         </span>
//                       </div>
//                       <div className="text-base md:text-lg font-bold text-blue-600 mb-2 md:mb-3">
//                         Min: {currency}&nbsp;
//                         {amount}
//                       </div>
//                      {isAuctionEnded ? (
//   <button
//     disabled
//     className="w-full py-1 md:py-2 bg-gray-400 text-gray-700 rounded cursor-not-allowed text-xs md:text-sm"
//   >
//     Auction Ended
//   </button>
// ) : isAuctionUpcoming ? (
//   <button
//     disabled
//     className="w-full py-1 md:py-2 bg-yellow-500 text-white rounded cursor-not-allowed text-xs md:text-sm"
//   >
//     Auction Not Started
//   </button>
// ) : !logInUser ? (
//   <Link
//     to="/login"
//     className="w-full block text-center py-1 md:py-2 bg-gray-800 text-white rounded hover:bg-gray-900 text-xs md:text-sm"
//   >
//     Login to Bid
//   </Link>
// ) : isOwner ? (
//   <button
//     type="button"
//     disabled
//     className="w-full py-1 md:py-2 bg-gray-400 text-gray-700 rounded cursor-not-allowed text-xs md:text-sm"
//   >
//     Own Auction
//   </button>
// ) : !user?.paymentVerified ? (
//   <Link
//     to={{
//       pathname: "/user-profile/payment-method",
//       search: `?redirect=${encodeURIComponent(window.location.pathname)}`,
//       state: {
//         from: window.location.pathname,
//         auctionId: params.id
//       }
//     }}
//     className="w-full block text-center py-1 md:py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs md:text-sm"
//   >
//     Verify Payment
//   </Link>
// ) : (
//   <form
//     onSubmit={(e) => {
//       e.preventDefault();
//       setBidType(type);
//       placeBidHandle(e, type);
//     }}
//   >
//     <div className="mb-2">
//       <input
//         type="number"
//         className="w-full px-2 py-1 md:px-3 md:py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
//         placeholder={`${currency}${highestBids[type] + 1}+`}
//         value={bidAmounts[type]}
//         min={highestBids[type] + 1}
//         step="1"
//         required
//         disabled={isOwner}
//         onChange={(e) =>
//           handleBidAmountChange(type, e.target.value)
//         }
//       />
//     </div>
//     <button
//       type="submit"
//       disabled={submittingType === type}
//       className={`w-full py-1 md:py-2 text-white rounded text-xs md:text-sm ${
//         submittingType === type
//           ? "bg-gray-500"
//           : "bg-green-600 hover:bg-green-700"
//       }`}
//     >
//       {submittingType === type ? (
//         <div className="flex items-center justify-center">
//           <svg
//             className="animate-spin -ml-1 mr-1 h-3 w-3 md:h-4 md:w-4 text-white"
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 24 24"
//           >
//             <circle
//               className="opacity-25"
//               cx="12"
//               cy="12"
//               r="10"
//               stroke="currentColor"
//               strokeWidth="4"
//             ></circle>
//             <path
//               className="opacity-75"
//               fill="currentColor"
//               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//             ></path>
//           </svg>
//           Placing...
//         </div>
//       ) : (
//         "Place Bid"
//       )}
//     </button>
//   </form>
// )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
//                 {Object.entries(auctionData.buyNowRates || {}).map(
//                   ([type, amount], index) => {
//                     const displayType = type.replace(/([A-Z])/g, " $1").trim();
//                     const isSold = isWrapSold(type);
//                     return (
//                       <div key={type} className="text-center">
//                         <div className="bg-green-50 p-3 md:p-4 rounded-lg border border-green-200 relative">
//                           <div className="text-xs text-gray-600 mb-1">
//                             {index + 5}
//                           </div>
//                           <div className="font-semibold text-gray-800 mb-1 md:mb-2 text-sm md:text-base">
//                             {capitalizeWords(displayType)}
//                           </div>
//                           <div className="text-base md:text-lg font-bold text-green-600 mb-2 md:mb-3">
//                             {currency}&nbsp;
//                             {amount}
//                             <span className="text-xs text-gray-500 block -mt-1">
//                               {capitalizeWords(`per square metre (m²)`)}
//                             </span>
//                           </div>
//                          <button
//   onClick={() => {
//     if (isSold) {
//       toast.error(
//         `${capitalizeWords(displayType)} is already sold.`
//       );
//       return;
//     }
//     if (isAuctionEnded) {
//       toast.error(
//         `Auction has ended for ${capitalizeWords(displayType)}.`
//       );
//       return;
//     }
//     if (isAuctionUpcoming) {
//       toast.error(
//         `Auction has not started yet for ${capitalizeWords(displayType)}.`
//       );
//       return;
//     }
//     if (!logInUser) {
//       toast.error("Please log in to buy now.", { autoClose: 8000 });
//       return;
//     }
//     if (isOwner) {
//       toast.error("You cannot buy from your own auction.");
//       return;
//     }
//     if (!user?.paymentVerified) {
//       toast.error("Please verify your payment method first.");
//       setTimeout(() => {
//         navigate("/user-profile/payment-method", {
//           state: {
//             from: window.location.pathname,
//             auctionId: params.id
//           }
//         });
//       }, 1500);
//       return;
//     }
//     handleBuyNow(type, amount);
//   }}
//   disabled={isSold || isAuctionEnded || isAuctionUpcoming || isOwner}
//   className={`w-full px-2 py-1 md:px-3 md:py-2 text-white rounded-md text-xs md:text-sm font-medium ${
//     isSold
//       ? "bg-gray-400 cursor-not-allowed"
//       : isAuctionEnded
//       ? "bg-red-400 cursor-not-allowed"
//       : isAuctionUpcoming
//       ? "bg-yellow-400 cursor-not-allowed"
//       : isOwner
//       ? "bg-gray-400 cursor-not-allowed"
//       : "bg-green-600 hover:bg-green-700 transition-colors"
//   }`}
// >
//   {isSold
//     ? "Already Sold"
//     : isAuctionEnded
//     ? "Auction Ended"
//     : isAuctionUpcoming
//     ? "Not Started"
//     : "Buy Now"}
// </button>
//                         </div>
//                       </div>
//                     );
//                   }
//                 )}
//               </div>
//             </div>
//             {Array.isArray(auctionData?.images) &&
//               auctionData.images.length > 0 && (
//                 <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
//                   <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
//                     Vehicle Images
//                   </h2>
//                   <div className="flex flex-col gap-3 md:gap-4">
//                     <div className="w-full h-48 sm:h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
//                       <img
//                         src={selectedImage?.url || auctionData.images[0].url}
//                         alt="main preview"
//                         className="w-full h-full object-contain"
//                         onError={(e) => {
//                           e.target.onerror = null;
//                           e.target.src = "path/to/placeholder/image.jpg";
//                         }}
//                       />
//                     </div>
//                     <div className="flex gap-2 overflow-x-auto py-1 md:py-2">
//                       {auctionData.images.map((img, index) => (
//                         <div
//                           key={index}
//                           className={`w-12 h-12 sm:w-16 sm:h-16 border-2 rounded-md overflow-hidden flex justify-center items-center cursor-pointer transition-all ${
//                             selectedImage?.url === img.url ||
//                             selectedImage === img.url
//                               ? "border-blue-500"
//                               : "border-gray-300"
//                           }`}
//                           onClick={() => setSelectedImage(img)}
//                           onMouseEnter={() => setSelectedImage(img)}
//                         >
//                           <img
//                             src={img.url}
//                             alt={`thumbnail-${index}`}
//                             className="w-full h-full object-cover"
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}

//             {(auctionData?.location?.zip || auctionData?.location?.name) && (
//               <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
//                 {/* <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
//                   {routeData ? "Route Coverage Map" : "Location Coverage"}
//                 </h2> */}
//                 <div className="h-64 sm:h-80 md:h-96">
//                   <GoogleMapComponent
//                     zipCode={auctionData?.location?.zip}
//                     location={auctionData?.location?.name}
//                     latitude={auctionData?.location?.latitude}
//                     longitude={auctionData?.location?.longitude}
//                     // routeData={routeData}
//                     additionalLocations={auctionData.additionalLocations}
//                   />
//                 </div>
//               </div>
//             )}

//             <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
//               <CpaComparisonTable />
//             </div>
//           </div>

//           <div className="space-y-4 md:space-y-6">
//             <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
//               <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
//                 Basic Information
//               </h2>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-xs md:text-sm">
//                   <tbody className="divide-y divide-gray-100">
//   {[
//     { label: "Vehicle Type", value: auctionData.vehicleType },
//     { label: "Model", value: auctionData.vehicleModel },
//     { label: "Manufacturer", value: auctionData.vehicleManufacturer },
//     {
//       label: "Registration Plate No.",
//       value: auctionData.registrationPlate || "---"
//     },
//     { label: "Account Number", value: auctionData.accountNumber },
//     { label: "Manufacturer Country", value: auctionData.country },
//   ].map((item, index) => (
//     <tr key={index} className="align-top">
//       <td className="py-3 pr-4 font-medium text-gray-700 whitespace-nowrap w-1/3 md:w-1/4">
//         {item.label}
//       </td>
//       <td className="py-3 text-gray-900 break-all">
//         <span className="font-semibold text-theme-color">
//           {item.value}
//         </span>
//       </td>
//     </tr>
//   ))}
// </tbody>
//                 </table>
//               </div>
//             </div>

//             <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
//               <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
//                 Vehicle Availability
//               </h2>
//               <div className="grid grid-cols-2 gap-4 mb-4">
//                 {Object.entries(auctionData.vehicleAvailability || {})
//                   .filter(([_, status]) => status === "Available")
//                   .map(([period]) => (
//                     <div key={period} className="flex items-center">
//                       <span
//                         className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
//                         style={{ backgroundColor: "#10B981" }}
//                       ></span>
//                       <div className="text-sm font-medium capitalize">
//                         {period.replace(/([A-Z])/g, " $1")}
//                       </div>
//                     </div>
//                   ))}
//               </div>
//             </div>

//             <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
//               <div className="mb-4 md:mb-6">
//                 <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">
//                   Vehicle Information
//                 </h2>
//                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 text-xs md:text-sm text-gray-700">
//                   <div className="flex flex-col">
//                     <span className="text-gray-500 font-medium mb-1">
//                       Manufacturer
//                     </span>
//                     <span className="text-sm md:text-base font-semibold text-gray-900">
//                       {auctionData.vehicleManufacturer || "N/A"}
//                     </span>
//                   </div>
//                    <div className="flex flex-col">
//                     <span className="text-gray-500 font-medium mb-1">
//                       vehicle Type

//                     </span>
//                     <span className="text-sm md:text-base font-semibold text-gray-900">
//                       {auctionData.vehicleType
//  || "N/A"}
//                     </span>
//                   </div>
//                   <div className="flex flex-col">
//                     <span className="text-gray-500 font-medium mb-1">Year</span>
//                     <span className="text-sm md:text-base font-semibold text-gray-900">
//                       {auctionData.yearofmanufacturer || "N/A"}
//                     </span>
//                   </div>
//                   <div className="flex flex-col">
//                     <span className="text-gray-500 font-medium mb-1">
//                       Model
//                     </span>
//                     <span className="text-sm md:text-base font-semibold text-gray-900">
//                       {auctionData.vehicleModel || "N/A"}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
//                 Pricing Information
//               </h2>
//               <div className="mb-4 md:mb-6">
//                 <h3 className="text-base md:text-lg font-medium text-gray-800 mb-2 md:mb-3">
//                   Minimum Auction Rates
//                 </h3>
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-xs md:text-sm border border-gray-200 rounded-lg">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="py-1 px-2 md:py-2 md:px-3 text-left font-medium text-gray-700">
//                           Ad Type
//                         </th>
//                         <th className="py-1 px-2 md:py-2 md:px-3 text-right font-medium text-gray-700">
//                           Rate
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-100">
//                       {[
//                         {
//                           type: "Full Wrap",
//                           value: auctionData.minAuctionRates?.fullWrap || "N/A",
//                         },
//                         {
//                           type: "One Side",
//                           value: auctionData.minAuctionRates?.oneSide || "N/A",
//                         },
//                         {
//                           type: "Both Sides",
//                           value:
//                             auctionData.minAuctionRates?.bothSides || "N/A",
//                         },
//                         {
//                           type: "Rear Doors",
//                           value:
//                             auctionData.minAuctionRates?.rearDoors || "N/A",
//                         },
//                       ].map((item, index) => (
//                         <tr key={index}>
//                           <td className="py-1 px-2 md:py-2 md:px-3">
//                             {item.type}
//                           </td>
//                           <td className="py-1 px-2 md:py-2 md:px-3 text-right font-medium">
//                             {item.value === "N/A"
//                               ? "N/A"
//                               : `${currency}  ${item.value}`}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//               <div className="mb-4 md:mb-6">
//                 <h3 className="text-base md:text-lg font-medium text-gray-800 mb-2 md:mb-3">
//                   Buy Now Rates
//                 </h3>
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-xs md:text-sm border border-gray-200 rounded-lg">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="py-1 px-2 md:py-2 md:px-3 text-left font-medium text-gray-700">
//                           Ad Type
//                         </th>
//                         <th className="py-1 px-2 md:py-2 md:px-3 text-right font-medium text-gray-700">
//                           Rate
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-100">
//                       {[
//                         {
//                           type: "Full Wrap",
//                           value: auctionData.buyNowRates?.fullWrap || "N/A",
//                         },
//                         {
//                           type: "One Side",
//                           value: auctionData.buyNowRates?.oneSide || "N/A",
//                         },
//                         {
//                           type: "Both Sides",
//                           value: auctionData.buyNowRates?.bothSides || "N/A",
//                         },
//                         {
//                           type: "Rear Doors",
//                           value: auctionData.buyNowRates?.rearDoors || "N/A",
//                         },
//                       ].map((item, index) => (
//                         <tr key={index}>
//                           <td className="py-1 px-2 md:py-2 md:px-3">
//                             {item.type}
//                           </td>
//                           <td className="py-1 px-2 md:py-2 md:px-3 text-right font-medium">
//                             {item.value === "N/A"
//                               ? "N/A"
//                               : `${currency}  ${item.value}`}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//               <div>
//                 <h3 className="text-base md:text-lg font-medium text-gray-800 mb-2 md:mb-3">
//                   Discount Offers
//                 </h3>
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
//                   {[
//                     {
//                       duration: "3 Months",
//                       value: auctionData.discountOffers?.threeMonth,
//                       color: "blue",
//                     },
//                     {
//                       duration: "6 Months",
//                       value: auctionData.discountOffers?.sixMonth,
//                       color: "green",
//                     },
//                     {
//                       duration: "12 Months",
//                       value: auctionData.discountOffers?.twelveMonth,
//                       color: "yellow",
//                     },
//                     {
//                       duration: "24 Months",
//                       value: auctionData.discountOffers?.twentyFourMonth,
//                       color: "purple",
//                     },
//                   ].map((item, index) => (
//                     <div
//                       key={index}
//                       className={`bg-${item.color}-50 p-2 md:p-3 rounded-lg text-center`}
//                     >
//                       <div className="text-lg md:text-xl font-bold text-${item.color}-600">
//                         {item.value}%
//                       </div>
//                       <div className="text-xs md:text-sm text-gray-600">
//                         {item.duration}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
//               <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
//                 Prohibited Advertisements
//               </h2>
//               <div className="flex flex-wrap gap-2">
//                 {Object.entries(auctionData.prohibitedAds || {}).map(
//                   ([type, prohibited]) => {
//                     if (type === "otherSpecify" || !prohibited) return null;

//                     return (
//                       <div
//                         key={type}
//                         className="flex items-center bg-red-50 px-3 py-1 rounded-full"
//                       >
//                         <span className="text-sm font-medium capitalize">
//                           {type.replace(/([A-Z])/g, " $1")}
//                         </span>
//                       </div>
//                     );
//                   }
//                 )}
//                 {auctionData.prohibitedAds?.otherSpecify && (
//                   <div className="flex items-center bg-red-50 px-3 py-1 rounded-full">

//                     <span className="text-sm font-medium">
//                       {auctionData.prohibitedAds.otherSpecify}
//                     </span>
//                   </div>
//                 )}
//                 {/* {Object.values(auctionData.prohibitedAds || {}).filter(
//                   (val) => val === true
//                 ).length === 0 && (
//                   <span className="text-gray-500 text-sm">
//                     No ad restrictions specified
//                   </span>
//                 )} */}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FleetAuctionDetails;
