import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  useParams,
  useSearchParams,
  Link,
  useNavigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getSingleAuctionById } from "../store/auction/auctionSlice";
import { placeABid, getAllBidsForAuction } from "../store/bid/bidSlice";
import { sendNewBidNotification } from "../store/notification/notificationSlice";
import { fetchUserCountry } from "../store/countary/countrySlice";
import { fetchVehicles } from "../store/vehicle/vehicleSlice";
import { fetchSoldWraps } from "../store/order/OrderSlice";
import { getAllCategories } from "../store/category/categorySlice";
import { createbudge } from "../store/budget/budgetSlice";
import _ from "lodash";
import socket from "../socket";
import axiosInstance from "../axiosInstance";
import { generateToken } from "../firebase";
import CountDownTimer from "../components/CountDownTimer";
import BidCard from "../components/BidCard";
import { BiCurrentLocation, BiX } from "react-icons/bi";
import CpaComparisonTable from "../components/CpaComparisonTable";
import axios from "axios";
import { MapPin, Search } from "lucide-react";
import GoogleMapComponent from "../components/GoogleComponents";
import { toast } from "react-toastify";
import {
  FiInfo,
  FiMapPin,
  FiTruck,
  FiDollarSign,
  FiEye,
  FiX,
} from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import SEO from "../components/SEO";
import { HeaderLeaderboard, MediumRectangle } from "../components/AdSlots";
const SingleAuctionDetail = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const initialLoadRef = useRef(false);
  const logInUser = JSON.parse(localStorage.getItem("user"));
  const { country, currency } = useSelector((state) => state.country);
  const { list: vehicles } = useSelector((state) => state.vehicles);
  const { user } = useSelector((state) => state.auth);
  const { singleAuction, isLoading: auctionLoading } = useSelector(
    (state) => state.auction,
  );

  const { bids, isLoading: bidsLoading } = useSelector((state) => state.bid);
  const {
    soldWraps,
    isLoading: orderLoading,
    error: orderError,
  } = useSelector((state) => state.order);

  const isAdmin = user?.userType === "admin";
  const [activeSlide, setActiveSlide] = useState(0);
  const [newBidAmount, setNewBidAmount] = useState("");
  const [bidType, setBidType] = useState("fullWrap");
  const [activeTab, setActiveTab] = useState("description");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [fcmToken, setFcmToken] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [query, setQuery] = useState("");
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [locationZip, setLocationZip] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetRates, setBudgetRates] = useState({
    fullWrap: "",
    oneSide: "",
    bothSides: "",
    rearDoors: "",
  });
  const [budgetDescription, setBudgetDescription] = useState("");

  const [wrapType, setWrapType] = useState(
    searchParams.get("wrapType") || location.state?.wrapType || "",
  );
  const { categories } = useSelector((state) => state.category);
  // Memoized auction data
  const auctionData = useMemo(() => {
    if (!singleAuction) return {};

    if (singleAuction.data && singleAuction.data._id) {
      return singleAuction.data;
    } else if (singleAuction._id) {
      return singleAuction;
    }

    return singleAuction || {};
  }, [singleAuction]);
  const seoData = {
    title: auctionData?.name
      ? `${auctionData.name} | Live Fleet Auction Details ${new Date().getFullYear()}`
      : "Live Fleet Auction Details | Bid on Vehicle Advertising Space",

    description: auctionData?.description
      ? auctionData.description.substring(0, 160)
      : "Participate in live fleet auction for vehicle advertising space. Bid on full wrap, one side, both sides, and rear doors advertising opportunities.",

    keywords: `fleet auction, vehicle advertising, ${auctionData?.vehicleModel || "fleet vehicle"}, ${auctionData?.vehicleManufacturer || "vehicle"}, wrap advertising, out of home advertising, fleet management auction`,

    publishedTime: auctionData?.startTime,
    modifiedTime: auctionData?.updatedAt,
  };
  const fetchAuctionData = useCallback(async () => {
    if (initialLoadRef.current) return;

    initialLoadRef.current = true;
    setIsLoading(true);

    try {
      await Promise.all([
        dispatch(getSingleAuctionById(params.id)),
        dispatch(getAllBidsForAuction(params.id)),
      ]);
    } catch (err) {
      console.error("❌ Error while fetching auction:", err);
      toast.error("Failed to load auction");
    }
  }, [dispatch, params.id]);
  useEffect(() => {
    if (!params.id) return;

    fetchAuctionData();
    dispatch(getAllCategories());
  }, [fetchAuctionData, dispatch, params.id]);
  const image = useMemo(() => auctionData?.images || [], [auctionData]);
  const debounceRef = useRef(
    _.debounce(async (searchQuery) => {
      if (searchQuery.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&addressdetails=1&limit=10`,
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Location search error:", err);
      }
    }, 500),
  );
  useEffect(() => {
    const initFCM = async () => {
      if (!logInUser?._id) return;
      try {
        const token = await generateToken();
        if (token) {
          setFcmToken(token);
          await axiosInstance.post("/users/save-fcm-token", {
            userId: logInUser._id,
            fcmToken: token,
          });
        }
      } catch (err) {
        console.error("FCM Token Error:", err);
      }
    };
    initFCM();
  }, [logInUser]);
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      dispatch(getSingleAuctionById(params.id)),
      dispatch(fetchVehicles()),
      dispatch(fetchSoldWraps(params.id)),
      dispatch(getAllBidsForAuction(params.id)),
      dispatch(fetchUserCountry()),
    ]).then(() => {
      setIsLoading(false);
    });
  }, [dispatch, params.id]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  const currentBids = useMemo(() => {
    if (!bids || !Array.isArray(bids)) return {};

    const bidMap = {
      fullWrap: null,
      oneSide: null,
      bothSides: null,
      rearDoors: null,
    };

    bids.forEach((bid) => {
      if (bid.bidType && bid.bidAmount) {
        if (
          !bidMap[bid.bidType] ||
          bid.bidAmount > bidMap[bid.bidType].bidAmount
        ) {
          bidMap[bid.bidType] = bid;
        }
      }
    });

    return bidMap;
  }, [bids]);

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

  // Check if user is owner
  const isOwner = useMemo(
    () => auctionData?.seller?._id === logInUser?._id,
    [auctionData?.seller?._id, logInUser?._id],
  );

  const minBidAmounts = useMemo(
    () => ({
      fullWrap: auctionData?.minAuctionRates?.fullWrap || 0,
      oneSide: auctionData?.minAuctionRates?.oneSide || 0,
      bothSides: auctionData?.minAuctionRates?.bothSides || 0,
      rearDoors: auctionData?.minAuctionRates?.rearDoors || 0,
    }),
    [auctionData?.minAuctionRates],
  );

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
    if (status !== "active") return true;
    if (endTime) {
      const now = new Date();
      const auctionEndTime = new Date(endTime);
      return now > auctionEndTime;
    }
    return false;
  }, [status, endTime]);

  const extractZipCode = (suggestion) => {
    const address = suggestion.address || {};
    return (
      address.postcode ||
      address.postal_code ||
      address.zipcode ||
      address.zip ||
      ""
    );
  };
  const handleLocationSelect = (suggestion) => {
    const zipCode = extractZipCode(suggestion);
    const locationName = suggestion.display_name;

    // Check if location already exists
    const exists = selectedLocations.some(
      (loc) => loc.zip === zipCode && loc.name === locationName,
    );

    if (!exists && zipCode) {
      const newLocation = {
        id: Date.now() + Math.random(),
        name: locationName,
        zip: zipCode,
        country: suggestion.address?.country || "Unknown",
        lat: suggestion.lat,
        lon: suggestion.lon,
      };

      setSelectedLocations([...selectedLocations, newLocation]);

      // FIX 1: Set the locationZip state
      setLocationZip(zipCode);

      // FIX 2: Update query to show selected location
      setQuery(locationName);
    }

    // FIX 3: Close the suggestions dropdown
    setShowSuggestions(false);
    setSuggestions([]);
  };

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
            id: params.id,
            amount: Math.floor(bidAmount),
            sellerId: auctionData?.seller?._id,
            bidType: type,
          }),
        );

        if (placeABid.fulfilled.match(result)) {
          toast.success(
            `${capitalizeWords(type.replace(/([A-Z])/g, " $1"))} bid placed successfully!`,
          );
          setBidAmounts((prev) => ({ ...prev, [type]: "" }));
          dispatch(getSingleAuctionById(params.id));
          dispatch(getAllBidsForAuction(params.id));
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
      params.id,
      auctionData?.seller?._id,
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
  const getCurrentLocation = () => {
    setLoadingLocation(true);
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&addressdetails=1`,
          );
          const data = await res.json();
          handleLocationSelect(data);
        } catch (err) {
          alert("Failed to get location");
        } finally {
          setLoadingLocation(false);
        }
      },
      () => {
        alert("Location access denied");
        setLoadingLocation(false);
      },
    );
  };

  const removeLocation = (id) => {
    setSelectedLocations(selectedLocations.filter((loc) => loc.id !== id));
  };

  const getZipCodesString = () => {
    return selectedLocations.map((loc) => loc.zip).join(", ");
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debounceRef.current(value);
  };
  const calculateSurfaceArea = (dimensions, wrapType) => {
    if (!dimensions || !wrapType) return 0;

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
        return 0;
    }
  };
  const submitBudgetRequest = async (e) => {
    e.preventDefault();

    // Validate rates
    const hasValidRate = Object.values(budgetRates).some(
      (rate) => rate && !isNaN(rate) && Number(rate) > 0,
    );

    if (!hasValidRate) {
      toast.error("Please enter at least one valid budget rate");
      return;
    }

    try {
      const budgetData = {
        buyerId: logInUser?._id,
        auctionId: params.id,
        budgetRates: {
          fullWrap: budgetRates.fullWrap ? Number(budgetRates.fullWrap) : 0,
          oneSide: budgetRates.oneSide ? Number(budgetRates.oneSide) : 0,
          bothSides: budgetRates.bothSides ? Number(budgetRates.bothSides) : 0,
          rearDoors: budgetRates.rearDoors ? Number(budgetRates.rearDoors) : 0,
        },
        description: budgetDescription,
      };

      await dispatch(createbudge(budgetData)).unwrap();
      toast.success("Budget request submitted successfully!");

      // Reset form and close modal
      setShowBudgetModal(false);
      setBudgetRates({
        fullWrap: "",
        oneSide: "",
        bothSides: "",
        rearDoors: "",
      });
      setBudgetDescription("");
    } catch (error) {
      console.error("Budget submission error:", error);
      toast.error(error.message || "Failed to submit budget request");
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

    const selectedVehicle = vehicles.find(
      (vehicle) => vehicle.vehicle === auctionData.vehicleModel,
    );

    if (!selectedVehicle) {
      toast.error("Vehicle not found for the specified model.");
      return;
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error("Invalid Buy Now amount.");
      return;
    }

    const surfaceArea = calculateSurfaceArea(selectedVehicle.dimensions, type);
    const totalCost = surfaceArea * amount;

    const queryParams = new URLSearchParams({
      name: auctionData.name || "Vehicle Advertising",
      price: totalCost.toFixed(2),
      quantity: 1,
      description: `${type} (Area: ${surfaceArea.toFixed(2)} m²)`,
      image: auctionData.images?.[0]?.url || "",
      payment: "CARD",
      isSingleAuction: true,
      auctionId: auctionData._id || "",
      wrapType: type,
      surfaceArea: surfaceArea.toFixed(2),
    });

    navigate(
      `/checkout/${auctionData._id || "unknown"}?${queryParams.toString()}`,
      {
        state: {
          type,
          amount: parseFloat(totalCost.toFixed(2)),
          vehicleModel: auctionData.vehicleModel || "",
          image: auctionData.images?.[0]?.url || "",
          isSingleAuction: true,
          auctionId: auctionData._id || "",
          surfaceArea: surfaceArea.toFixed(2),
        },
      },
    );
  };

  function capitalizeWords(str) {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  if (isLoading || auctionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading auction details...</p>
        </div>
      </div>
    );
  }

  if (!auctionData || !auctionData._id) {
    return (
      <div className="text-red-500 text-center py-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-2xl font-bold mb-2">Error Loading Auction</div>
          <div className="text-gray-600">Auction not found</div>
        </div>
      </div>
    );
  }

  if (auctionData.adminstatus !== "approved" && !isAdmin) {
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
            to="/user-profile/profile"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO {...seoData} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 m-6">
          {/* Request Budget Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:justify-end gap-4 sm:gap-2 w-full relative mt-6">
            <HeaderLeaderboard />
            {["buyer", "advertiser", "fleetOwner", "wrapper"].includes(
              user?.userType,
            ) && (
              <div className="flex items-center justify-end space-x-2 relative">
                <button
                  onClick={() => setShowBudgetModal(!showBudgetModal)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  {showBudgetModal ? "Cancel Budget Request" : "Request Budget"}
                </button>

                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="text-gray-500 text-xl focus:outline-none"
                  aria-label="Info"
                  title="Click to know what 'Request Budget' means"
                >
                  <FiInfo className="w-6 h-6" />
                </button>

                {showInfo && (
                  <div className="absolute z-10 mt-2 right-0 w-80 p-4 bg-white border rounded shadow-lg text-sm text-gray-700">
                    <p className="mb-2 font-semibold">
                      What is Request Budget?
                    </p>
                    <p>
                      If you'd like to be matched with vehicle opportunities
                      that align with your submitted budget, please use this
                      option to submit a budget request
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
            )}
          </div>

          {/* MODAL STYLE FORM - ये आपके कोड में ही है */}
          {["buyer", "advertiser", "fleetOwner", "wrapper"].includes(
            user?.userType,
          ) &&
            showBudgetModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <div>
                      <h2 className="text-2xl font-bold">Request Budget</h2>
                      <p className="text-blue-100 text-sm mt-1">
                        Submit your budget rates for advertising spaces
                      </p>
                    </div>
                    <button
                      onClick={() => setShowBudgetModal(false)}
                      className="text-white hover:text-gray-200 text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/20 transition"
                    >
                      <FiX className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div
                    className="overflow-y-auto p-6"
                    style={{ maxHeight: "calc(90vh - 120px)" }}
                  >
                    <form onSubmit={submitBudgetRequest} className="space-y-6">
                      {/* Budget Rates for each wrap type */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Full Wrap Rate */}
                        <div>
                          <label className="block text-gray-800 font-semibold mb-1">
                            Full Wrap Rate ({currency})
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              {currency}
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={budgetRates.fullWrap || ""}
                              onChange={(e) =>
                                setBudgetRates((prev) => ({
                                  ...prev,
                                  fullWrap: e.target.value,
                                }))
                              }
                              className="w-full border border-gray-300 px-3 py-2 pl-10 rounded bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="Enter rate per m²"
                              required
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Rate per square meter for full wrap
                          </p>
                        </div>

                        {/* One Side Rate */}
                        <div>
                          <label className="block text-gray-800 font-semibold mb-1">
                            One Side Rate ({currency})
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              {currency}
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={budgetRates.oneSide || ""}
                              onChange={(e) =>
                                setBudgetRates((prev) => ({
                                  ...prev,
                                  oneSide: e.target.value,
                                }))
                              }
                              className="w-full border border-gray-300 px-3 py-2 pl-10 rounded bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="Enter rate per m²"
                              required
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Rate per square meter for one side
                          </p>
                        </div>

                        {/* Both Sides Rate */}
                        <div>
                          <label className="block text-gray-800 font-semibold mb-1">
                            Both Sides Rate ({currency})
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              {currency}
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={budgetRates.bothSides || ""}
                              onChange={(e) =>
                                setBudgetRates((prev) => ({
                                  ...prev,
                                  bothSides: e.target.value,
                                }))
                              }
                              className="w-full border border-gray-300 px-3 py-2 pl-10 rounded bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="Enter rate per m²"
                              required
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Rate per square meter for both sides
                          </p>
                        </div>

                        {/* Rear Doors Rate */}
                        <div>
                          <label className="block text-gray-800 font-semibold mb-1">
                            Rear Doors Rate ({currency})
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              {currency}
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={budgetRates.rearDoors || ""}
                              onChange={(e) =>
                                setBudgetRates((prev) => ({
                                  ...prev,
                                  rearDoors: e.target.value,
                                }))
                              }
                              className="w-full border border-gray-300 px-3 py-2 pl-10 rounded bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="Enter rate per m²"
                              required
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Rate per square meter for rear doors
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block font-semibold mb-1 text-gray-800">
                          Description (Optional)
                        </label>
                        <textarea
                          value={budgetDescription}
                          onChange={(e) => setBudgetDescription(e.target.value)}
                          className="w-full border border-gray-300 px-3 py-2 rounded bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Any specific requirements or additional details..."
                          rows={3}
                        />
                      </div>

                      {/* Note Box */}
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                        <p className="text-yellow-800 text-sm">
                          <strong>Note:</strong> Your budget rates are per
                          square meter (m²). The vehicle owner will review your
                          rates and may accept or negotiate.
                        </p>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2 flex gap-4">
                        <button
                          type="submit"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-medium transition-colors"
                        >
                          Submit Budget Request
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowBudgetModal(false)}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          {/* Auction Header */}
          <div className="bg-white rounded-2xl shadow-md mb-8 p-6 relative m-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {auctionData.name}
                </h1>
                <div className="flex flex-wrap gap-4 text-gray-700 text-base">
                  {/* <div className="flex items-center gap-2 flex-wrap bg-gray-50 rounded-full">
                  <FiMapPin className="w-5 h-5 text-gray-500" />
                  {auctionData.location?.name ||
                    auctionData.location?.zip ||
                    "Location not specified"}
                </div> */}
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
                    {auctionData.vehicleModel ||
                      auctionData.vehicle?.model ||
                      "Vehicle"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Images Section */}
              {Array.isArray(auctionData?.images) &&
                auctionData.images.length > 0 && (
                  <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                      Vehicle Images
                    </h2>
                    <Swiper
                      modules={[Navigation, Pagination]}
                      spaceBetween={10}
                      slidesPerView={1}
                      navigation
                      loop={true}
                      pagination={{ clickable: true }}
                      onSlideChange={(swiper) =>
                        setActiveSlide(swiper.activeIndex)
                      }
                      className="rounded-lg overflow-hidden"
                    >
                      {auctionData.images.map((img, index) => (
                        <SwiperSlide key={index}>
                          <div className="relative h-64 sm:h-80 md:h-96 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={img.url || img}
                              alt={`Vehicle ${index + 1}`}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "path/to/placeholder/image.jpg";
                              }}
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    <div className="flex justify-center mt-4">
                      {/* <div className="flex space-x-2">
                    {auctionData.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveSlide(index)}
                        className={`w-3 h-3 rounded-full ${
                          index === activeSlide
                            ? "bg-blue-600"
                            : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div> */}
                    </div>
                  </div>
                )}

              {/* Description */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                  Description
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {auctionData?.description || "No description available."}
                </p>
              </div>

              {/* Bidding Options - FleetAuctionDetails style */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  Bidding Options
                </h2>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-xs md:text-sm p-3 rounded mb-4 md:mb-6">
                  <strong>Note:</strong> Your payment method will not be charged
                  until the auction is finalized.
                </div>

                {/* Minimum Auction Rates */}
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
                        ) : !logInUser ? (
                          <Link
                            to="/login"
                            className="w-full block py-1 md:py-2 bg-gray-800 text-white rounded hover:bg-gray-900 text-xs md:text-sm"
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
                                id: params.id,
                              },
                            }}
                            className="w-full block py-1 md:py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs md:text-sm"
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
                                placeholder={`${currency} ${highestBids[type] + 1}+`}
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

                {/* Buy Now Rates */}
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
                                handleBuyNow(type, amount);
                              }}
                              disabled={isSold || isAuctionEnded}
                              className={`w-full px-2 py-1 md:px-3 md:py-2 text-white rounded-md text-xs md:text-sm font-medium ${
                                isSold || isAuctionEnded
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-green-600 hover:bg-green-700 transition-colors"
                              }`}
                            >
                              {isSold
                                ? "Already Sold"
                                : isAuctionEnded
                                  ? "Auction Ended"
                                  : "Buy Now"}
                            </button>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Bids List */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                  Recent Bids
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {bids && bids.length > 0 ? (
                    bids.map((bid) => <BidCard key={bid._id} bid={bid} />)
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No bids yet
                    </div>
                  )}
                </div>
              </div>

              {/* Map */}
              {(auctionData?.location?.zip || auctionData?.location?.name) && (
                <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                    Location
                  </h2>
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

              {/* CPA Comparison Table */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                <CpaComparisonTable />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 md:space-y-6">
              {/* Auction Timer */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                  Auction Timer
                </h2>
                <div className="flex flex-col gap-2">
                  <p className="text-blue-600 font-medium text-sm">
                    {isAuctionEnded ? "Auction Ended" : "Time Remaining"}
                  </p>
                  <div className="text-white bg-blue-600 px-3 py-2 rounded-md text-center">
                    <CountDownTimer
                      startTime={startTime}
                      endTime={endTime}
                      id={auctionData?._id}
                    />
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                  Basic Information
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs md:text-sm">
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-2 md:py-3 font-medium text-gray-700 w-1/3">
                          Seller
                        </td>
                        <td className="py-2 md:py-3 text-gray-900">
                          {auctionData.seller?.firstName || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 md:py-3 font-medium text-gray-700">
                          Vehicle Type
                        </td>
                        <td className="py-2 md:py-3 text-gray-900">
                          {auctionData.vehicleType ||
                            auctionData.vehicle?.type ||
                            "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 md:py-3 font-medium text-gray-700">
                          Model
                        </td>
                        <td className="py-2 md:py-3 text-gray-900">
                          {auctionData.vehicleModel ||
                            auctionData.vehicle?.model ||
                            "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 md:py-3 font-medium text-gray-700">
                          Manufacturer
                        </td>
                        <td className="py-2 md:py-3 text-gray-900">
                          {auctionData.vehicleManufacturer ||
                            auctionData.vehicle?.manufacturer ||
                            "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 md:py-3 font-medium text-gray-700">
                          Year
                        </td>
                        <td className="py-2 md:py-3 text-gray-900">
                          {auctionData.yearofmanufacturer ||
                            auctionData.vehicle?.yearofmanufacture ||
                            "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 md:py-3 font-medium text-gray-700">
                          Country
                        </td>
                        <td className="py-2 md:py-3 text-gray-900">
                          {auctionData.vehicle?.country ||
                            "Country not available"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vehicle Specifications */}
              {auctionData?.vehicle && (
                <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                    Vehicle Specifications
                  </h2>
                  <div className="space-y-3">
                    {auctionData.vehicle.dimensions && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Length:</span>
                          <span className="font-medium">
                            {auctionData.vehicle.dimensions.length || "---"} in
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Width:</span>
                          <span className="font-medium">
                            {auctionData.vehicle.dimensions.width || "---"} in
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Height:</span>
                          <span className="font-medium">
                            {auctionData.vehicle.dimensions.height || "---"} in
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Wheelbase:</span>
                          <span className="font-medium">
                            {auctionData.vehicle.dimensions.wheelbase || "---"}{" "}
                            in
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              <MediumRectangle />
              {/* Seller Information */}
              {/* <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                Seller Information
              </h2>
              <div className="flex items-center gap-3">
                <img
                  src={auctionData.seller?.profilePicture || "/default-avatar.png"}
                  alt="Seller"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium text-gray-900">
                    {auctionData.seller?.firstName} {auctionData.seller?.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {auctionData.seller?.email || "N/A"}
                  </p>
                </div>
              </div>
            </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleAuctionDetail;

// import React, {
//   useEffect,
//   useState,
//   useRef,
//   useCallback,
//   useMemo,
// } from "react";
// import { Link, useParams } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { getSingleAuctionById, reset } from "../store/auction/auctionSlice";
// import CountDownTimer from "../components/CountDownTimer";
// import BidCard from "../components/BidCard";
// import _ from "lodash";
// import { placeABid } from "../store/bid/bidSlice";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { sendNewBidNotification } from "../store/notification/notificationSlice";
// import socket from "../socket";
// import { getAllBidsForAuction } from "../store/bid/bidSlice";
// import Loading from "../components/Loading";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";
// import { Navigation, Pagination } from "swiper/modules";
// import { createbudge } from "../store/budget/budgetSlice";
// import { generateToken } from "../firebase";
// import { getAllCategories } from "../store/category/categorySlice";
// import { BiCurrentLocation, BiX } from "react-icons/bi";
// import axiosInstance from "../axiosInstance";
// import axios from "axios";
// import { FiInfo } from "react-icons/fi";
// import { MapPin, Search } from "lucide-react";
// import GoogleMapComponent from "../components/GoogleComponents";

// const SingleAuctionDetail = ({ noPadding }) => {
//   const [newBidAmount, setNewBidAmount] = useState("");
//   const logInUser = JSON.parse(localStorage.getItem("user"));
//   const { user } = useSelector((state) => state.auth);
//   const [activeTab, setActiveTab] = useState("description");
//   const params = useParams();
//   const dispatch = useDispatch();

//   const { singleAuction, isLoading: auctionLoading } = useSelector(
//     (state) => state.auction
//   );
// const isAdmin = user?.userType === "admin";
//   const { bids, isLoading: bidsLoading } = useSelector((state) => state.bid);
//   const { categories } = useSelector((state) => state.category);
//   const { country, currency } = useSelector((state) => state.country);

//   const [auctionStarted, setAuctionStarted] = useState(false);
//   const [bidsData, setBidsData] = useState([]);
//   const [auctionWinner, setAuctionWinner] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   const auctionStartedRef = useRef(false);
//   const socketInitialized = useRef(false);
//   const initialLoadRef = useRef(false);

//   // Budget Form States
//   const [showBudgetForm, setShowBudgetForm] = useState(false);
//   const [budgetAmount, setBudgetAmount] = useState("");
//   const [budgetDescription, setBudgetDescription] = useState("");
//   const [category, setCategory] = useState("");
//   const [size, setSize] = useState("");
//   const [quantity, setQuantity] = useState(1);
//   const [query, setQuery] = useState("");
//   const [selectedLocations, setSelectedLocations] = useState([]);
//   const [locationZip, setLocationZip] = useState("");
//   const [suggestions, setSuggestions] = useState([]);
//   const [loadingLocation, setLoadingLocation] = useState(false);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [showInfo, setShowInfo] = useState(false);
//   const [fcmToken, setFcmToken] = useState("");

//   // Debounce location search
//   const debounceRef = useRef(
//     _.debounce(async (searchQuery) => {
//       if (searchQuery.length < 3) {
//         setSuggestions([]);
//         return;
//       }
//       try {
//         const res = await fetch(
//           `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&addressdetails=1&limit=10`
//         );
//         const data = await res.json();
//         setSuggestions(data);
//         setShowSuggestions(true);
//       } catch (err) {
//         console.error("Location search error:", err);
//       }
//     }, 500)
//   );

//   const auctionData = useMemo(() => {
//     if (!singleAuction) return {};

//     if (singleAuction.data && singleAuction.data._id) {
//       return singleAuction.data;
//     } else if (singleAuction._id) {
//       return singleAuction;
//     } else if (singleAuction.success && singleAuction.bidders) {
//       setTimeout(() => {
//         dispatch(getSingleAuctionById(params.id));
//       }, 1000);
//       return {};
//     }

//     return singleAuction || {};
//   }, [singleAuction, dispatch, params.id]);

//   const fetchAuctionData = useCallback(async () => {
//     if (initialLoadRef.current) return;

//     initialLoadRef.current = true;
//     setIsLoading(true);

//     try {
//       await Promise.all([
//         dispatch(getSingleAuctionById(params.id)),
//         dispatch(getAllBidsForAuction(params.id)),
//       ]);
//     } catch (err) {
//       console.error("❌ Error while fetching auction:", err);
//       toast.error("Failed to load auction");
//     }
//   }, [dispatch, params.id]);

//   useEffect(() => {
//     if (!params.id) return;

//     fetchAuctionData();
//     dispatch(getAllCategories());
//   }, [fetchAuctionData, dispatch, params.id]);

//   useEffect(() => {
//     const isAuctionLoaded = auctionData?._id && !auctionLoading;
//     const isBidsLoaded = bids !== null && !bidsLoading;

//     if (isAuctionLoaded && isBidsLoaded && isLoading) {
//       setIsLoading(false);
//     }

//     if (!auctionLoading && !bidsLoading && isLoading) {
//       setIsLoading(false);
//     }
//   }, [auctionData, auctionLoading, bids, bidsLoading, isLoading]);

//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       if (isLoading) {
//         setIsLoading(false);
//       }
//     }, 10000);

//     return () => clearTimeout(timeout);
//   }, [isLoading]);

//   useEffect(() => {
//     setBidsData(bids || []);
//   }, [bids]);

//   useEffect(() => {
//     if (!auctionData?._id) return;

//     const interval = setInterval(() => {
//       const now = Date.now();
//       const start = new Date(auctionData.startTime).getTime();
//       const end = new Date(auctionData.endTime).getTime();

//       if (now >= start && now <= end && !auctionStartedRef.current) {
//         auctionStartedRef.current = true;
//         setAuctionStarted(true);
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [auctionData]);

//   // Socket.IO Real-time Updates (Bids & Winner) — ONE-TIME SETUP
//   useEffect(() => {
//     if (socketInitialized.current || !params.id) return;

//     const handleNewBid = (data) => {
//       if (data.auctionId !== params.id) return;

//       const newBid = {
//         _id: Date.now() + Math.random(),
//         bidder: {
//           firstName: data.firstName,
//           profilePicture: data.profilePicture,
//         },
//         bidAmount: data.bidAmount,
//         bidTime: data.bidTime,
//         auction: data.auctionId,
//       };

//       setBidsData((prev) => [newBid, ...prev]);
//       dispatch(getSingleAuctionById(params.id));
//     };

//     const handleWinner = (data) => {
//       if (data.auctionId !== params.id) return;

//       const winner = data.winner || data;
//       setAuctionWinner(winner);
//       setAuctionStarted(false);

//       if (logInUser?._id === winner.bidder?._id) {
//         toast.success("Congratulations! You won the auction!");
//       } else {
//         toast.info(`${winner.bidder?.firstName} won the auction!`);
//       }

//       dispatch(getSingleAuctionById(params.id));
//       dispatch(getAllBidsForAuction(params.id));
//     };

//     socket.emit("joinAuction", params.id);
//     socket.on("newBidData", handleNewBid);
//     socket.on("winnerSelected", handleWinner);

//     socketInitialized.current = true;

//     return () => {
//       socket.off("newBidData", handleNewBid);
//       socket.off("winnerSelected", handleWinner);
//       socket.emit("leaveAuction", params.id);
//       socketInitialized.current = false;
//     };
//   }, [params.id, dispatch, logInUser]);

//   // Generate FCM Token
//   useEffect(() => {
//     const initFCM = async () => {
//       if (!logInUser?._id) return;
//       try {
//         const token = await generateToken();
//         if (token) {
//           setFcmToken(token);
//           await axiosInstance.post("/users/save-fcm-token", {
//             userId: logInUser._id,
//             fcmToken: token,
//           });
//         }
//       } catch (err) {
//         console.error("FCM Token Error:", err);
//       }
//     };
//     initFCM();
//   }, [logInUser]);

//   // Location Search Input
//   const handleInputChange = (e) => {
//     const value = e.target.value;
//     setQuery(value);
//     debounceRef.current(value);
//   };

//   const extractZipCode = (suggestion) => {
//     const address = suggestion.address || {};
//     return (
//       address.postcode ||
//       address.postal_code ||
//       address.zipcode ||
//       address.zip ||
//       ""
//     );
//   };

//   const handleLocationSelect = (suggestion) => {
//     const zipCode = extractZipCode(suggestion);
//     const locationName = suggestion.display_name;

//     // Check if location already exists
//     const exists = selectedLocations.some(
//       (loc) => loc.zip === zipCode && loc.name === locationName
//     );

//     if (!exists && zipCode) {
//       const newLocation = {
//         id: Date.now() + Math.random(),
//         name: locationName,
//         zip: zipCode,
//         country: suggestion.address?.country || "Unknown",
//         lat: suggestion.lat,
//         lon: suggestion.lon,
//       };

//       setSelectedLocations([...selectedLocations, newLocation]);
//     }

//     setQuery("");
//     setSuggestions([]);
//     setShowSuggestions(false);
//   };

//   const getCurrentLocation = () => {
//     setLoadingLocation(true);
//     if (!navigator.geolocation) {
//       alert("Geolocation not supported");
//       setLoadingLocation(false);
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       async (pos) => {
//         try {
//           const res = await fetch(
//             `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&addressdetails=1`
//           );
//           const data = await res.json();
//           handleLocationSelect(data);
//         } catch (err) {
//           alert("Failed to get location");
//         } finally {
//           setLoadingLocation(false);
//         }
//       },
//       () => {
//         alert("Location access denied");
//         setLoadingLocation(false);
//       }
//     );
//   };

//   const removeLocation = (id) => {
//     setSelectedLocations(selectedLocations.filter((loc) => loc.id !== id));
//   };

//   const getZipCodesString = () => {
//     return selectedLocations.map((loc) => loc.zip).join(", ");
//   };

//   // Submit Budget Request
//   const submitBudgetRequest = async (e) => {
//     e.preventDefault();

//     if (!budgetAmount || isNaN(budgetAmount)) {
//       toast.error("Please enter a valid budget amount");
//       return;
//     }
//     if (!category) {
//       toast.error("Please select a vehicle type");
//       return;
//     }
//     if (!size) {
//       toast.error("Please enter size");
//       return;
//     }
//     if (selectedLocations.length === 0) {
//       toast.error("Please select at least one location");
//     }

//     try {
//       const budgetData = {
//         buyerId: logInUser._id,
//         auctionId: params.id,
//         budgetAmount: Number(budgetAmount),
//         category,
//         size,
//         quantity: Number(quantity),
//         description: budgetDescription,
//         location: selectedLocations.map((loc) => ({
//           name: loc.name,
//           zip: loc.zip,
//         })),
//         status: "open",
//         fcmToken,
//       };

//       await dispatch(createbudge(budgetData)).unwrap();
//       toast.success("Budget request sent!");

//       setShowBudgetForm(false);
//       setBudgetAmount("");
//       setCategory("");
//       setSize("");
//       setQuantity(1);
//       setBudgetDescription("");
//       setSelectedLocations([]);
//       setQuery("");
//       setLocationZip("");
//     } catch (error) {
//       toast.error(error.message || "Failed to submit budget request");
//     }
//   };

//   // Place Bid Handler
//   const placeBidHandle = async (e) => {
//     e.preventDefault();

//     // ✅ Only redirect if user payment is NOT verified
//     if (!user?.paymentVerified) {
//       toast.info("Please verify your payment method to place a bid.");
//       const redirectUrl = `/auction/${params.id}`;
//       window.location.href = `/user-profile/payment-method?redirect=${encodeURIComponent(redirectUrl)}`;
//       return; // Stop execution
//     }

//     const amount = Math.floor(newBidAmount);
//     const currentPrice = auctionData?.startingPrice || 0;

//     if (amount <= currentPrice) {
//       toast.error("Bid amount must be greater than current bid");
//       return;
//     }

//     if (new Date(auctionData.endTime) < new Date()) {
//       toast.error("Auction time is over");
//       return;
//     }

//     try {
//       await dispatch(placeABid({ id: params.id, amount })).unwrap();

//       socket.emit("newBid", {
//         profilePicture: logInUser?.profilePicture,
//         firstName: logInUser?.firstName,
//         bidAmount: amount,
//         bidTime: Date.now(),
//         auctionId: params.id,
//       });

//       socket.emit("sendNewBidNotification", {
//         auctionId: params.id,
//         type: "BID_PLACED",
//         newBidAmount: amount,
//         firstName: logInUser?.firstName,
//         id: logInUser?._id,
//       });

//       dispatch(
//         sendNewBidNotification({
//           auctionId: params.id,
//           type: "BID_PLACED",
//           newBidAmount: amount,
//         })
//       );

//       setNewBidAmount("");
//       setActiveTab("bids");
//       toast.success("Bid placed successfully!");
//     } catch (err) {
//       toast.error("Failed to place bid");
//     }
//   };

//   // Loading UI - IMPROVED
//   const shouldShowLoading = isLoading || auctionLoading;

//   if (shouldShowLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <Loading />
//       </div>
//     );
//   }

//   // if (!auctionData || !auctionData._id) {
//   //   if (singleAuction?.bidders) {
//   //     return (
//   //       <div className="text-center py-10">
//   //         <div className="text-red-600 mb-4">Received incorrect data format</div>
//   //         <button
//   //           onClick={() => {
//   //             initialLoadRef.current = false;
//   //             fetchAuctionData();
//   //           }}
//   //           className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
//   //         >
//   //           Retry Loading Auction
//   //         </button>
//   //       </div>
//   //     );
//   //   }

//   //   return (
//   //     <div className="text-center py-10 text-red-600">
//   //       Auction not found or failed to load.
//   //     </div>
//   //   );
//   // }
//  if (auctionData.adminstatus !== "approved" && !isAdmin) {

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
//   return (
//     <>
//       <div
//         className={`flex place-content-between py-10 px-5 lg:py-20 lg:px-10 items-start gap-7 flex-wrap md:flex-nowrap ${
//           noPadding ? "lg:py-0 px-0" : "p-4"
//         }`}
//         id="item01"
//       >
//        <div className="rounded-xl md:max-w-[45%] w-full">
//   {(() => {
//     // Extract valid image URLs
//     const getImageUrls = () => {
//       const images = auctionData?.images || [];
//       const imageUrls = [];

//       // Process images array
//       images.forEach(img => {
//         if (typeof img === 'string') {
//           imageUrls.push(img);
//         } else if (img && typeof img === 'object') {
//           // Check for common image property names
//           const possibleKeys = ['url', 'imageUrl', 'src', 'path', 'link'];
//           for (const key of possibleKeys) {
//             if (img[key] && typeof img[key] === 'string') {
//               imageUrls.push(img[key]);
//               break;
//             }
//           }
//         }
//       });

//       // Fallback to single image property
//       if (imageUrls.length === 0 && auctionData?.image && typeof auctionData.image === 'string') {
//         imageUrls.push(auctionData.image);
//       }

//       return imageUrls;
//     };

//     const imageUrls = getImageUrls();
//

//     if (imageUrls.length === 0) {
//       return (
//         <div className="bg-gray-900 border-2 border-dashed border-gray-700 rounded-2xl w-full h-[500px] flex items-center justify-center text-gray-400 text-xl font-medium">
//           <div className="text-center">No Image Available</div>
//         </div>
//       );
//     }

//   return (
//   <Swiper
//     modules={[Navigation, Pagination]}
//     spaceBetween={10}
//     slidesPerView={1}
//     navigation={{
//       nextEl: '.swiper-button-next',
//       prevEl: '.swiper-button-prev',
//     }}
//     pagination={{
//       clickable: true,
//       dynamicBullets: true,
//     }}
//     loop={true} // Loop enable karein
//     className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 relative"
//   >
//     {imageUrls.map((imgUrl, index) => (
//       <SwiperSlide key={index}>
//         <div className="relative bg-gray-900 flex items-center justify-center h-[350px] sm:h-[350px] lg:h-[400px]">
//           <img
//             src={imgUrl}
//             alt={`Vehicle Image ${index + 1}`}
//             className="
//               w-full
//               h-full
//               object-contain
//               max-h-full
//               transition-all
//               duration-300
//             "
//             loading="lazy"
//             onError={(e) => {
//               console.error(`Image failed to load: ${imgUrl}`);
//               e.target.src = "https://via.placeholder.com/600x400?text=No+Image";
//               e.target.onerror = null;
//               e.target.className = "w-full h-full object-contain opacity-50";
//             }}
//           />

//           {/* Image counter badge */}
//           <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm z-10">
//             {index + 1} / {imageUrls.length}
//           </div>
//         </div>
//       </SwiperSlide>
//     ))}

//     {/* Custom Navigation Buttons */}
//     <div className="swiper-button-prev absolute left-4 top-1/2 transform -translate-y-1/2 z-10  bg-opacity-50 text-blue p-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-opacity">
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//       </svg>
//     </div>
//     <div className="swiper-button-next absolute right-4 top-1/2 transform -translate-y-1/2 z-10  bg-opacity-50 text-blue p-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-opacity">
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//       </svg>
//     </div>
//   </Swiper>
// );
//   })()}
// </div>
//         {/* Details Panel */}
//         <div className="w-full flex gap-4 flex-col border-2 p-10 rounded-2xl">
//           {/* Title & Locations */}
//           <div>
//             <h2 className="text-3xl font-extrabold text-black">
//               {auctionData?.name}
//             </h2>
//             <div className="pt-4 flex flex-row gap-4 flex-wrap text-body-text-color capitalize">
//               <div className="flex flex-wrap gap-2">
//                 {auctionData?.additionalLocations?.length > 0 &&
//                   auctionData.additionalLocations.map((location, index) => (
//                     <span
//                       key={index}
//                       className="px-4 py-1 border rounded-full hover:bg-color-primary border-border-info-color hover:text-white transition-all"
//                     >
//                       {location.name || location.zip || "Unknown"}
//                     </span>
//                   ))}
//               </div>
//             </div>
//           </div>

//           {/* Seller & Budget Button */}
//           <div className="pt-4 border-t border-border-info-color">
//             <div className="flex justify-between items-start gap-8">
//               <div id="author-item" className="text-heading-black">
//                 <span className="font-medium capitalize">Seller</span>
//                 <div id="author-info" className="flex items-center gap-2 pt-2">
//                   <img
//                     src={auctionData?.seller?.profilePicture}
//                     alt="avatar"
//                     className="w-[45px] h-[45px] rounded-full object-cover"
//                   />
//                   <a href="#" className="font-medium">
//                     {auctionData?.seller?.firstName}
//                   </a>
//                 </div>
//               </div>

//               {["buyer", "advertiser", "fleetOwner", "wrapper"].includes(
//                 user?.userType
//               ) && (
//                 <div className="flex items-center justify-end space-x-2 relative">
//                   <button
//                     onClick={() => setShowBudgetForm(!showBudgetForm)}
//                     className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
//                   >
//                     {showBudgetForm
//                       ? "Cancel Budget Request"
//                       : "Request Budget"}
//                   </button>

//                   <button
//                     onClick={() => setShowInfo(!showInfo)}
//                     className="text-gray-500 text-xl focus:outline-none"
//                     aria-label="Info"
//                     title="Click to know what 'Request Budget' means"
//                   >
//                     <FiInfo className="w-6 h-6" />
//                   </button>

//                   {showInfo && (
//                     <div className="absolute z-10 mt-2 right-0 w-80 p-4 bg-white border rounded shadow-lg text-sm text-gray-700">
//                       <p className="mb-2 font-semibold">
//                         What is Request Budget?
//                       </p>
//                       <p>
//                         If you'd like to be matched with vehicle opportunities
//                         that align with your submitted budget, please use this
//                         option to submit a budget request
//                       </p>
//                       <button
//                         onClick={() => setShowInfo(false)}
//                         className="mt-3 text-blue-600 hover:underline"
//                       >
//                         Close
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Budget Form */}
//             {["buyer", "advertiser", "fleetOwner", "wrapper"].includes(
//               user?.userType
//             ) &&
//               showBudgetForm && (
//                 <form
//                   onSubmit={submitBudgetRequest}
//                   className="mt-4 space-y-4 bg-white p-4 rounded-lg shadow"
//                 >
//                   {/* Budget Amount */}
//                   <div>
//                     <label className="block font-semibold mb-1">
//                       Budget Amount
//                     </label>
//                     <input
//                       type="number"
//                       min="1"
//                       value={budgetAmount}
//                       onChange={(e) => setBudgetAmount(e.target.value)}
//                       className="w-full border px-3 py-2 rounded"
//                       placeholder="Enter your budget amount"
//                       required
//                     />
//                   </div>

//                   {/* Category */}
//                   <div className="grid">
//                     <label className="block font-semibold mb-1">
//                       Vehicle Type
//                     </label>
//                     <select
//                       className="outline-none h-[50px] bg-white rounded border px-3 py-2 cursor-pointer"
//                       required
//                       value={category}
//                       onChange={(e) => setCategory(e.target.value)}
//                     >
//                       <option value="">Select Category</option>
//                       {categories.data?.map((cat) => (
//                         <option key={cat._id} value={cat._id}>
//                           {cat.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* Size */}
//                   <div>
//                     <label className="block font-semibold mb-1">
//                       Vehicle Size
//                     </label>
//                     <input
//                       type="text"
//                       value={size}
//                       onChange={(e) => setSize(e.target.value)}
//                       className="w-full border px-3 py-2 rounded"
//                       placeholder="e.g. Long, Medium, Van"
//                       required
//                     />
//                   </div>

//                   {/* Quantity */}
//                   <div>
//                     <label className="block font-semibold mb-1">Quantity</label>
//                     <input
//                       type="number"
//                       min="1"
//                       value={quantity}
//                       onChange={(e) => setQuantity(e.target.value)}
//                       className="w-full border px-3 py-2 rounded"
//                       required
//                     />
//                   </div>

//                   {/* Location */}
//                   {selectedLocations.length > 0 && (
//                     <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
//                       <div className="flex items-center justify-between mb-3">
//                         <h3 className="text-sm font-semibold text-gray-700">
//                           Selected Locations ({selectedLocations.length})
//                         </h3>
//                         <div className="text-xs text-gray-500">
//                           Zip Codes:{" "}
//                           <span className="font-mono">
//                             {getZipCodesString()}
//                           </span>
//                         </div>
//                       </div>

//                       <div className="flex flex-wrap gap-2">
//                         {selectedLocations.map((location) => (
//                           <div
//                             key={location.id}
//                             className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-full border border-blue-300 hover:bg-blue-200 transition-colors"
//                           >
//                             <MapPin className="w-4 h-4" />
//                             <div className="flex flex-col">
//                               <span className="text-xs font-semibold">
//                                 {location.zip}
//                               </span>
//                               <span className="text-xs text-blue-600 max-w-[200px] truncate">
//                                 {location.country}
//                               </span>
//                             </div>
//                             <button
//                               onClick={() => removeLocation(location.id)}
//                               className="ml-1 hover:bg-blue-300 rounded-full p-1 transition-colors"
//                               title="Remove location"
//                             >
//                               <BiX className="w-4 h-4" />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Search Input */}
//                   <div className="relative">
//                     <label className="block font-semibold mb-2 text-gray-700">
//                       <Search className="inline w-4 h-4 mr-2" />
//                       Search Location
//                     </label>

//                     <div className="relative">
//                       <input
//                         type="text"
//                         value={query}
//                         onChange={handleInputChange}
//                         onFocus={() =>
//                           suggestions.length > 0 && setShowSuggestions(true)
//                         }
//                         placeholder="Search city, zip code, or address..."
//                         className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
//                       />

//                       {/* Current Location Button */}
//                       <button
//                         type="button"
//                         onClick={getCurrentLocation}
//                         disabled={loadingLocation}
//                         className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none disabled:opacity-50"
//                         title="Use my current location"
//                       >
//                         {loadingLocation ? (
//                           <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
//                         ) : (
//                           <BiCurrentLocation className="w-6 h-6" />
//                         )}
//                       </button>
//                     </div>

//                     {/* Suggestions Dropdown */}
//                     {showSuggestions && suggestions.length > 0 && (
//                       <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-2xl max-h-80 overflow-y-auto">
//                         <div className="p-2 bg-gray-50 border-b border-gray-200">
//                           <p className="text-xs text-gray-600">
//                             {suggestions.length} locations found
//                           </p>
//                         </div>
//                         {suggestions.map((suggestion, index) => {
//                           const zipCode = extractZipCode(suggestion);
//                           return (
//                             <div
//                               key={index}
//                               className="p-3 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 transition-colors"
//                               onClick={() => handleLocationSelect(suggestion)}
//                             >
//                               <div className="flex items-start gap-2">
//                                 <MapPin className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
//                                 <div className="flex-1 min-w-0">
//                                   <p className="text-gray-800 font-medium truncate">
//                                     {suggestion.display_name}
//                                   </p>
//                                   {zipCode && (
//                                     <p className="text-xs text-gray-500 mt-1">
//                                       Zip:{" "}
//                                       <span className="font-mono font-semibold">
//                                         {zipCode}
//                                       </span>
//                                     </p>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     )}
//                   </div>

//                   {/* Close suggestions on outside click */}
//                   {showSuggestions && (
//                     <div
//                       className="fixed inset-0 z-40"
//                       onClick={() => setShowSuggestions(false)}
//                     />
//                   )}

//                   {selectedLocations.length > 0 && (
//                     <div className="mt-6">
//                       <h3 className="text-lg font-semibold mb-3 text-gray-800">
//                         Selected Locations
//                       </h3>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         {selectedLocations.map((loc) => (
//                           <div
//                             key={loc.id}
//                             className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
//                           >
//                             <div className="flex items-start justify-between">
//                               <div className="flex-1 min-w-0">
//                                 <p className="font-semibold text-gray-800 text-sm">
//                                   {loc.zip} - {loc.country}
//                                 </p>
//                                 <p className="text-xs text-gray-500 mt-1 truncate">
//                                   {loc.name}
//                                 </p>
//                               </div>
//                               <button
//                                 onClick={() => removeLocation(loc.id)}
//                                 className="text-red-500 hover:text-red-700 ml-2"
//                               >
//                                 <BiX className="w-5 h-5" />
//                               </button>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                   <div className="border border-gray-300 rounded-xl overflow-hidden shadow-lg bg-gray-100">
//                     <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 text-sm font-semibold flex items-center gap-2">
//                       <MapPin className="w-5 h-5" />
//                       Map Preview - All Selected Locations
//                     </div>
//                     <div className="h-96">
//                       <GoogleMapComponent
//                         additionalLocations={selectedLocations.map((loc) => ({
//                           name: loc.name,
//                           zip: loc.zip,
//                           lat: loc.lat,
//                           lon: loc.lon,
//                         }))}
//                       />
//                     </div>
//                   </div>
//                   {/* Description */}
//                   <div>
//                     <label className="block font-semibold mb-1">
//                       Description
//                     </label>
//                     <textarea
//                       value={budgetDescription}
//                       onChange={(e) => setBudgetDescription(e.target.value)}
//                       className="w-full border px-3 py-2 rounded"
//                       placeholder="Additional details (optional)"
//                       rows={3}
//                     />
//                   </div>

//                   <button
//                     type="submit"
//                     className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//                   >
//                     Submit Budget
//                   </button>
//                 </form>
//               )}

//             {/* Tabs */}
//             <div className="flex gap-4 pt-4 font-bold text-white">
//               <button
//                 className={`px-5 py-2 rounded-xl ${
//                   activeTab === "description"
//                     ? "bg-blue-600 text-white"
//                     : "bg-gray-200 text-gray-800"
//                 }`}
//                 onClick={() => setActiveTab("description")}
//               >
//                 Details
//               </button>
//               <button
//                 className={`px-5 py-2 rounded-xl ${
//                   activeTab === "bids"
//                     ? "bg-blue-600 text-white"
//                     : "bg-gray-200 text-gray-800"
//                 }`}
//                 onClick={() => setActiveTab("bids")}
//               >
//                 Bids
//               </button>
//             </div>
//           </div>

//           {/* Description */}
//           <div className={activeTab === "description" ? "block" : "hidden"}>
//             <div className="mb-6">
//               <h3 className="font-semibold text-lg text-gray-900 mb-3">
//                 Description
//               </h3>
//               <p className="text-gray-600 leading-relaxed whitespace-pre-line">
//                 {auctionData?.description || "No description available."}
//               </p>
//             </div>
//           </div>

//           {/* Bids */}
//           <div
//             id="bids"
//             className={`pt-4 border-t border-border-info-color max-h-[250px] overflow-y-auto ${
//               activeTab === "bids" ? "block" : "hidden"
//             } no-scrollbar`}
//           >
//             {bidsData.length > 0 ? (
//               bidsData.map((bid) => <BidCard key={bid._id} bid={bid} />)
//             ) : (
//               <h1 className="text-blue">No bids yet</h1>
//             )}
//           </div>

//           {/* Price & Timer */}
//           <div className="flex flex-col gap-4 pt-4 border-t border-border-info-color">
//             <div className="flex justify-between items-center">
//               <div className="flex flex-col gap-2">
//                 <h3 className="text-black font-medium">
//                   {bidsData.length > 0 ? "Current Bid" : "Starting Price"}
//                 </h3>
//                 <p className="text-body-text-color">
//                   {currency}
//                   {auctionData.startingPrice}
//                 </p>
//               </div>
//               <div className="flex flex-col gap-2">
//                 <h3 className="text-blue-500 font-medium">
//                   Auction Ending Time
//                 </h3>
//                 <p className="text-body-text-color">
//                   <CountDownTimer
//                     startTime={auctionData?.startTime}
//                     endTime={auctionData?.endTime}
//                     id={auctionData?._id}
//                   />
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Winner or Bid Form */}
//           <div className="flex flex-col gap-4 pt-4 border-t border-border-info-color">
//             {auctionWinner || auctionData?.status === "over" ? (
//               bidsData.length > 0 ? (
//                 <div>
//                   <h1 className="font-bold text-black">Winner</h1>
//                   <div className="flex sm:gap-10 items-center border mt-2 justify-between md:w-[80%] py-1 px-2 md:px-5 border-theme-bg-light rounded-full bg-white">
//                     <div className="flex gap-4 items-center text-black">
//                       <img
//                         src={
//                           bidsData[0]?.bidder?.profilePicture ||
//                           "/default-avatar.png"
//                         }
//                         alt="Winner"
//                         className="w-10 h-10 rounded-full"
//                       />
//                       <div className="flex flex-col">
//                         <span className="font-semibold">
//                           {bidsData[0]?.bidder?.firstName || "Winner"}
//                         </span>
//                         <span className="text-xs text-gray-500">
//                           {(() => {
//                             const time = bidsData[0]?.bidTime;
//                             if (!time) return "N/A";
//                             const date = new Date(time);
//                             return date.toLocaleString();
//                           })()}
//                         </span>
//                       </div>
//                     </div>
//                     <div className="text-black">
//                       Bid: ${bidsData[0]?.bidAmount?.toFixed(2) || "0.00"}
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <h1 className="text-black">No bids</h1>
//               )
//             ) : (
//               auctionStarted && (
//                 <form
//                   className="flex justify-between flex-wrap gap-4 items-center"
//                   onSubmit={placeBidHandle}
//                 >
//                   <input
//                     type="number"
//                     className="outline-none text-slate-300 px-3 text-white py-4 rounded-xl bg-theme-bg2 border border-border-info- text-left focus:border-theme-color transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                     placeholder="Enter your bid"
//                     min="1"
//                     value={newBidAmount}
//                     onChange={(e) => setNewBidAmount(e.target.value)}
//                     required
//                   />
//                   {logInUser ? (
//                     user?.paymentVerified ? (
//                       <button
//                         type="submit"
//                         disabled={
//                           auctionData?.seller?._id === logInUser?._id ||
//                           !auctionStarted
//                         }
//                         className={`py-4 px-4 rounded-lg text-white ${
//                           auctionData?.seller?._id === logInUser?._id ||
//                           !auctionStarted
//                             ? "bg-theme-bg2 text-body-text-color cursor-not-allowed border border-border-info-color"
//                             : "bg-color-primary border cursor-pointer border-border-info-color hover:bg-color-danger"
//                         }`}
//                       >
//                         Place Bid
//                       </button>
//                     ) : (
//                       <Link
//                         to={{
//                           pathname: "/user-profile/payment-method",
//                           search: `?redirect=${encodeURIComponent(window.location.pathname)}`,
//                           state: {
//                             from: window.location.pathname,
//                             auctionId: params.id,
//                           },
//                         }}
//                         className="bg-color-primary py-4 px-4 rounded-lg cursor-pointer text-white"
//                       >
//                         Attach Payment Method
//                       </Link>
//                     )
//                   ) : (
//                     <Link
//                       to="/login"
//                       className="bg-color-primary py-2 px-4 rounded-lg cursor-pointer text-white"
//                     >
//                       Login First
//                     </Link>
//                   )}
//                 </form>
//               )
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Vehicle Specs */}
//       {auctionData?.vehicle ? (
//         <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-6 mt-10">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
//             <h3 className="text-2xl font-bold text-gray-900">
//               Vehicle Specifications
//             </h3>
//             <div className="flex items-center text-gray-700 text-base font-medium">
//               <svg
//                 className="w-5 h-5 text-gray-500 mr-2"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M4 6h16M4 12h16M4 18h16"
//                 />
//               </svg>
//               Technical Details
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <div className="bg-gray-50 p-5 rounded-lg space-y-4 shadow-sm">
//               <h4 className="text-lg font-semibold text-gray-800 flex items-center">
//                 <svg
//                   className="w-5 h-5 text-blue-500 mr-2"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
//                   />
//                 </svg>
//                 Vehicle Information
//               </h4>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <p className="text-gray-700">
//                     <span className="font-medium text-gray-900">Model:</span>{" "}
//                     {auctionData.vehicle.model || "---"}
//                   </p>
//                   <p className="text-gray-700">
//                     <span className="font-medium text-gray-900">
//                       Manufacturer:
//                     </span>{" "}
//                     {auctionData.vehicle.manufacturer || "---"}
//                   </p>
//                 </div>
//                 <div className="space-y-2">
//                   <p className="text-gray-700">
//                     <span className="font-medium text-gray-900">Year:</span>{" "}
//                     {auctionData.vehicle.yearofmanufacture || "---"}
//                   </p>
//                   <p className="text-gray-700">
//                     <span className="font-medium text-gray-900">Country:</span>{" "}
//                     {auctionData.vehicle.country || "---"}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-gray-50 p-5 rounded-lg space-y-4 shadow-sm">
//               <h4 className="text-lg font-semibold text-gray-800 flex items-center">
//                 <svg
//                   className="w-5 h-5 text-blue-500 mr-2"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
//                   />
//                 </svg>
//                 Dimensions
//               </h4>
//               {auctionData.vehicle.dimensions && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <p className="text-gray-700">
//                       <span className="font-medium text-gray-900">Length:</span>{" "}
//                       {auctionData.vehicle.dimensions.length || "---"} in
//                     </p>
//                     <p className="text-gray-700">
//                       <span className="font-medium text-gray-900">Width:</span>{" "}
//                       {auctionData.vehicle.dimensions.width || "---"} in
//                     </p>
//                     <p className="text-gray-700">
//                       <span className="font-medium text-gray-900">Height:</span>{" "}
//                       {auctionData.vehicle.dimensions.height || "---"} in
//                     </p>
//                     <p className="text-gray-700">
//                       <span className="font-medium text-gray-900">
//                         Wheelbase:
//                       </span>{" "}
//                       {auctionData.vehicle.dimensions.wheelbase || "---"} in
//                     </p>
//                   </div>
//                   <div className="space-y-2">
//                     <p className="text-gray-700">
//                       <span className="font-medium text-gray-900">
//                         Curb Weight:
//                       </span>{" "}
//                       {auctionData.vehicle.dimensions.curbWeight || "---"} lbs
//                     </p>
//                     <p className="text-gray-700">
//                       <span className="font-medium text-gray-900">
//                         Engine Size:
//                       </span>{" "}
//                       {auctionData.vehicle.dimensions.engineSize || "---"} L
//                     </p>
//                     <p className="text-gray-700">
//                       <span className="font-medium text-gray-900">
//                         Cab Width:
//                       </span>{" "}
//                       {auctionData.vehicle.dimensions.cabwidth || "---"} in
//                     </p>
//                     <p className="text-gray-700">
//                       <span className="font-medium text-gray-900">
//                         Cab Height:
//                       </span>{" "}
//                       {auctionData.vehicle.dimensions.cabheight || "---"} in
//                     </p>
//                     <p className="text-gray-700">
//                       <span className="font-medium text-gray-900">
//                         Bonnet Width:
//                       </span>{" "}
//                       {auctionData.vehicle.dimensions.bonnetwidth || "---"} in
//                     </p>
//                     <p className="text-gray-700">
//                       <span className="font-medium text-gray-900">
//                         Bonnet Length:
//                       </span>{" "}
//                       {auctionData.vehicle.dimensions.bonnetLength || "---"} in
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center mt-10">
//           <svg
//             className="w-12 h-12 mx-auto text-gray-400"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//             />
//           </svg>
//           <p className="mt-3 text-gray-500 font-medium">
//             No vehicle information available
//           </p>
//         </div>
//       )}
//     </>
//   );
// };

// export default SingleAuctionDetail;

// import { useEffect, useState, useRef } from "react";
// import { Link, useParams } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { getSingleAuctionById, reset } from "../store/auction/auctionSlice";
// import CountDownTimer from "../components/CountDownTimer";
// import BidCard from "../components/BidCard";
// import _ from "lodash";
// import { placeABid } from "../store/bid/bidSlice";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { sendNewBidNotification } from "../store/notification/notificationSlice";
// import socket from "../socket";
// import { getAllBidsForAuction } from "../store/bid/bidSlice";
// import Loading from "../components/Loading";
// import LiveHome from "../components/home/LiveHome";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import { createbudge } from "../store/budget/budgetSlice";
// import { generateToken } from "../firebase";
// import { getAllCategories } from "../store/category/categorySlice";
// import { BiCurrentLocation } from "react-icons/bi";
// import axiosInstance from "../axiosInstance";
// import axios from "axios";
// import { FiInfo } from "react-icons/fi";
// import { Navigation, Pagination } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";
// import GoogleMapComponent from "../components/GoogleComponents";
// import { fetchUserCountry } from "../store/countary/countrySlice";
// const SingleAuctionDetail = ({ noPadding }) => {
//   const [newBidAmount, setNewBidAmount] = useState("");
//   const logInUser = JSON.parse(localStorage.getItem("user"));
//   const { user } = useSelector((state) => state.auth);

//   const [activeTab, setActiveTab] = useState("description");
//   const params = useParams();
//   const dispatch = useDispatch();
//   const { singleAuction } = useSelector((state) => state.auction);

//   const { bids } = useSelector((state) => state.bid);
//   const [auctionStarted, setAuctionStarted] = useState(false);
//   const [singleAuctionData, setSingleAuctionData] = useState();

//   const [auctionWinnerDetailData, setAuctionWinnerDetailData] = useState();
//   const [bidsData, setBidsData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const auctionStartedRef = useRef(false);
//   const { categories } = useSelector((state) => state.category);
//   const [showBudgetForm, setShowBudgetForm] = useState(false);
//   const [budgetAmount, setBudgetAmount] = useState("");
//   const [budgetDescription, setBudgetDescription] = useState("");
//   const [category, setCategory] = useState("");
//   const [size, setSize] = useState("");
//   const [quantity, setQuantity] = useState(1);
//   const [locationZip, setLocationZip] = useState("");

//   const [fcmToken, setFcmToken] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [query, setQuery] = useState("");
//   const [suggestions, setSuggestions] = useState([]);
//   const [showInfo, setShowInfo] = useState(false);
//   const { country, currency } = useSelector((state) => state.country);
//   useEffect(() => {
//     const interval = setInterval(() => {
//       const currentTime = new Date().getTime();
//       const auctionStartTime = new Date(singleAuction?.startTime).getTime();
//       const auctionEndTime = new Date(singleAuction?.endTime).getTime();

//       if (
//         currentTime >= auctionStartTime &&
//         currentTime <= auctionEndTime &&
//         !auctionStartedRef.current
//       ) {
//         auctionStartedRef.current = true;
//         setAuctionStarted(true);
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [singleAuction?.startTime]);

//   useEffect(() => {
//     if (!country) {
//       dispatch(fetchUserCountry());
//     }
//   }, [dispatch, country]);

//   useEffect(() => {
//     // Socket.IO connection and winner handling
//     const handleWinner = (data) => {
//       if (data.auctionId === params.id) {
//         setAuctionWinnerDetailData(data);
//         setAuctionStarted(false);

//         // Refresh data
//         dispatch(getSingleAuctionById(params.id));
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

//         // Refresh data
//         dispatch(getSingleAuctionById(params.id));
//         dispatch(getAllBidsForAuction(params.id));

//         // Show success notification if current user is the winner
//         if (logInUser?._id === data.winner.bidder._id.toString()) {
//           toast.success(
//             `Congratulations! You won this auction! Item has been added to your cart.`,
//             {
//               autoClose: 5000,
//             }
//           );

//           // Refresh cart data
//           // dispatch(getCartItems());
//         }
//       }
//     };

//     socket.on("winnerSelected", handleWinnerSelected);

//     return () => {
//       socket.off("winnerSelected", handleWinnerSelected);
//     };
//   }, [params.id, dispatch, logInUser]);

//   socket.on("winnerSelected", async (data) => {
//     setAuctionStarted(false);
//     setAuctionWinnerDetailData(data);
//   });

//   const handleWinner = () => {
//     socket.emit("selectWinner", params?.id);
//   };

//   useEffect(() => {
//     setIsLoading(true);

//     Promise.all([dispatch(getSingleAuctionById(params?.id))]).then(() => {
//       setIsLoading(false);
//     });
//     dispatch(getAllBidsForAuction(params?.id));
//   }, [params?.id]);

//   socket.on("newBidData", async (data) => {
//     setBidsData([
//       {
//         _id: new Date().getTime(),
//         bidder: {
//           firstName: data.firstName,
//           profilePicture: data.profilePicture,
//         },
//         bidAmount: data.bidAmount,
//         bidTime: data.bidTime,
//         auction: data.auctionId,
//       },
//       ...bidsData,
//     ]);

//     setSingleAuctionData((prevState) => ({
//       ...prevState,
//       startingPrice: data.bidAmount,
//     }));
//   });

//   useEffect(() => {}, [bidsData]);

//   useEffect(() => {
//     setBidsData(bids);
//     setSingleAuctionData(singleAuction);
//   }, [bids, singleAuction]);

//   useEffect(() => {
//     socket.on("connect", () => {});
//     socket.emit("joinAuction", logInUser?._id);
//     socket.on("newUserJoined", (data) => {});
//   }, []);

//   const debounceRef = useRef(
//     _.debounce(async (query) => {
//       if (query.length < 3) {
//         setSuggestions([]);
//         return;
//       }
//       try {
//         const response = await axios.get(
//           `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5`
//         );
//         setSuggestions(response.data);
//       } catch (error) {
//         console.error("Search error:", error);
//       }
//     }, 500)
//   );

//   const handleLocationSelect = (suggestion) => {
//     const fullAddress = suggestion.display_name;
//     const zipCode = suggestion.address?.postcode || "";

//     setQuery(fullAddress);
//     setLocationZip(zipCode);
//     setSuggestions([]);
//   };

//   const getCurrentLocation = () => {
//     setLoading(true);
//     if ("geolocation" in navigator) {
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           const { latitude, longitude } = position.coords;
//           try {
//             const response = await axios.get(
//               `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
//             );
//             const data = response.data;
//             setQuery(data.display_name);
//             setLocationZip(data.address?.postcode || "");
//           } catch (error) {
//             console.error("Location error:", error);
//           } finally {
//             setLoading(false);
//           }
//         },
//         (error) => {
//           console.error("Geolocation error:", error);
//           setLoading(false);
//         }
//       );
//     }
//   };

//   const handleInputChange = (e) => {
//     const value = e.target.value;
//     setQuery(value);
//     debounceRef.current(value);
//   };

//   useEffect(() => {
//     const generateAndStoreToken = async () => {
//       try {
//         const token = await generateToken();
//         if (token) {
//           setFcmToken(token);
//           await axiosInstance.post("/users/save-fcm-token", {
//             userId: logInUser?._id,
//             fcmToken: token,
//           });
//         }
//       } catch (err) {
//         console.error("FCM Token Error:", err);
//       }
//     };

//     generateAndStoreToken();
//   }, []);

//   useEffect(() => {
//     dispatch(getAllCategories());
//   }, []);

//   const submitBudgetRequest = async (e) => {
//     e.preventDefault();

//     if (!budgetAmount || isNaN(budgetAmount)) {
//       toast.error("Please enter a valid budget amount");
//       return;
//     }
//     if (!category) {
//       toast.error("Please select a vehicle type");
//       return;
//     }
//     if (!size) {
//       toast.error("Please enter size");
//       return;
//     }
//     if (!query || !locationZip) {
//       toast.error("Please select a valid location");
//       return;
//     }

//     try {
//       const budgetData = {
//         buyerId: logInUser?._id,
//         auctionId: params.id,
//         budgetAmount: Number(budgetAmount),
//         category,
//         size,
//         quantity: Number(quantity),
//         description: budgetDescription,
//         location: {
//           name: query,
//           zip: locationZip || "",
//         },
//         status: "open",
//         fcmToken,
//       };

//       await dispatch(createbudge(budgetData)).unwrap();
//       toast.success("Budget request sent!");

//       setShowBudgetForm(false);
//       setBudgetAmount("");
//       setCategory("");
//       setSize("");
//       setQuantity(1);
//       setBudgetDescription("");
//       setQuery("");
//       setLocationZip("");
//     } catch (error) {
//       console.error("Budget submission error:", error);
//       toast.error(error.message || "Failed to submit budget request");
//     }
//   };

//   const placeBidHandle = async (e) => {
//     e.preventDefault();

//     if (user?.paymentVerified === false) {
//       toast.info(
//         "Please verify your payment method to place a bid. Go to payment method page..."
//       );
//     }
//     let bidData = {
//       id: params.id,
//       amount: Math.floor(newBidAmount),
//     };
//     if (Math.floor(newBidAmount) <= singleAuctionData?.startingPrice) {
//       toast.info("Bid amount should be greater than the current bid");
//     } else if (singleAuction?.endTime < new Date().getTime() / 1000) {
//       toast.info("Auction time is over");
//     } else {
//       dispatch(placeABid(bidData));
//       setNewBidAmount("");

//       socket.emit("newBid", {
//         profilePicture: logInUser?.profilePicture,
//         firstName: logInUser?.firstName,
//         bidAmount: Math.floor(newBidAmount),
//         bidTime: new Date().getTime(),
//         auctionId: params.id,
//       });

//       await socket.emit("sendNewBidNotification", {
//         auctionId: params.id,
//         type: "BID_PLACED",
//         newBidAmount: newBidAmount,
//         firstName: logInUser?.firstName,
//         id: logInUser?._id,
//       });
//       setActiveTab("bids");
//       dispatch(
//         sendNewBidNotification({
//           auctionId: params.id,
//           type: "BID_PLACED",
//           newBidAmount: newBidAmount,
//         })
//       );
//       toast.success("Bid placed successfully!");
//     }
//   };

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <>
//       <div
//         className={`flex place-content-between py-10 px-5 lg:py-20 lg:px-10 items-start gap-7 flex-wrap md:flex-nowrap ${noPadding ? "lg:py-0 px-0" : "p-4"}`}
//         id="item01"
//       >
//         <div className="rounded-xl md:max-w-[45%] w-full">
//           {singleAuction?.images && singleAuction.images.length > 0 ? (
//             <Swiper
//               modules={[Navigation, Pagination]}
//               spaceBetween={10}
//               slidesPerView={1}
//               navigation
//               pagination={{ clickable: true }}
//               className="rounded-xl"
//             >
//               {singleAuction.images.map((img, index) => (
//                 <SwiperSlide key={index}>
//                   <img
//                     src={img}
//                     alt={`Auction Image ${index + 1}`}
//                     className="rounded-xl w-full object-contain max-h-[500px]"
//                   />
//                 </SwiperSlide>
//               ))}
//             </Swiper>
//           ) : singleAuction?.image ? (
//             <img
//               src={singleAuction.image}
//               alt="product image"
//               className="rounded-xl w-full"
//             />
//           ) : (
//             <p>No Image Available</p>
//           )}

//           {(singleAuction?.location?.zip || singleAuction?.location?.name) && (
//             <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6 mt-6 ">
//               <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4"></h2>
//               <div className="h-64 sm:h-80 md:h-96">
//                 <GoogleMapComponent
//                   zipCode={singleAuction?.location?.zip}
//                   location={singleAuction?.location?.name}
//                   latitude={singleAuction?.location?.latitude}
//                   longitude={singleAuction?.location?.longitude}
//                   additionalLocations={singleAuction.additionalLocations}
//                 />
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="w-full flex gap-4 flex-col border-2 p-10 rounded-2xl">
//           <div>
//             <h2 className="text-3xl font-extrabold text-black">
//               {singleAuction?.name}
//             </h2>

//             <div className="pt-4 flex flex-row gap-4 flex-wrap text-body-text-color capitalize">
//               <div className="flex flex-wrap gap-2">
//                 {singleAuction?.additionalLocations?.length > 0 &&
//                   singleAuction.additionalLocations.map((location, index) => (
//                     <span
//                       key={index}
//                       className="px-4 py-1 border rounded-full hover:bg-color-primary border-border-info-color hover:text-black transition-all"
//                     >
//                       {location.name || location.zip || "Unknown"}
//                     </span>
//                   ))}
//               </div>
//             </div>
//           </div>

//           <div className="pt-4 border-t border-border-info-color">
//             <div className="flex justify-between items-start gap-8">
//               {/* Seller Info (Left Side) */}
//               <div id="author-item" className="text-heading-black">
//                 <span className="font-medium capitalize">Seller</span>
//                 <div id="author-info" className="flex items-center gap-2 pt-2">
//                   <img
//                     src={singleAuction?.seller?.profilePicture}
//                     alt="avatar"
//                     className="w-[45px] rounded-full"
//                   />
//                   <a href="#" className="font-medium">
//                     {singleAuction?.seller?.firstName}
//                   </a>
//                 </div>
//               </div>

//               {["buyer", "advertiser", "fleetOwner", "wrapper"].includes(
//                 user?.userType
//               ) && (
//                 <div className="flex items-center justify-end space-x-2 relative">
//                   {/* Request Budget Button */}
//                   <button
//                     onClick={() => setShowBudgetForm(!showBudgetForm)}
//                     className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
//                   >
//                     {showBudgetForm
//                       ? "Cancel Budget Request"
//                       : "Request Budget"}
//                   </button>

//                   {/* Info Button */}
//                   <button
//                     onClick={() => setShowInfo(!showInfo)}
//                     className="text-gray-500 text-xl focus:outline-none"
//                     aria-label="Info"
//                     title="Click to know what 'Request Budget' means"
//                   >
//                     <FiInfo className="w-6 h-6" />
//                   </button>

//                   {/* Info Popup */}
//                   {showInfo && (
//                     <div className="absolute z-10 mt-2 right-0 w-80 p-4 bg-white border rounded shadow-lg text-sm text-gray-700">
//                       <p className="mb-2 font-semibold">
//                         What is Request Budget?
//                       </p>
//                       <p>
//                         If you'd like to be matched with vehicle opportunities
//                         that align with your submitted budget, please use this
//                         option to submit a budget request
//                       </p>
//                       <button
//                         onClick={() => setShowInfo(false)}
//                         className="mt-3 text-blue-600 hover:underline"
//                       >
//                         Close
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {["buyer", "advertiser", "fleetOwner", "wrapper"].includes(
//               user?.userType
//             ) &&
//               showBudgetForm && (
//                 <form
//                   onSubmit={submitBudgetRequest}
//                   className="mt-4 space-y-4 bg-white p-4 rounded-lg shadow"
//                 >
//                   {/* Budget Amount */}
//                   <div>
//                     <label className="block font-semibold mb-1">
//                       Budget Amount
//                     </label>
//                     <input
//                       type="number"
//                       min="1"
//                       value={budgetAmount}
//                       onChange={(e) => setBudgetAmount(e.target.value)}
//                       className="w-full border px-3 py-2 rounded"
//                       placeholder="Enter your budget amount"
//                       required
//                     />
//                   </div>

//                   {/* Category Dropdown */}
//                   <div className="grid">
//                     <label className="block font-semibold mb-1">
//                       Vehicle Type
//                     </label>
//                     <select
//                       className="outline-none h-[50px] bg-white rounded border px-3 py-2 cursor-pointer"
//                       required
//                       value={category}
//                       onChange={(e) => setCategory(e.target.value)}
//                     >
//                       <option value="">Select Category</option>
//                       {categories.data?.map((cat) => (
//                         <option key={cat._id} value={cat._id}>
//                           {cat.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* Size */}
//                  <div>
//   <label className="block font-semibold mb-1">Vehicle Size</label>
//   <input
//     type="text"
//     value={size}
//     onChange={(e) => setSize(e.target.value)}
//     className="w-full border px-3 py-2 rounded"
//     placeholder="e.g. Long, Medium, Van"
//     required
//   />
// </div>
//                   {/* Quantity */}
//                   <div>
//                     <label className="block font-semibold mb-1">Quantity</label>
//                     <input
//                       type="number"
//                       min="1"
//                       value={quantity}
//                       onChange={(e) => setQuantity(e.target.value)}
//                       className="w-full border px-3 py-2 rounded"
//                       required
//                     />
//                   </div>

//                   {/* Location Zip with Auto-detection */}
//               {/* Location Zip with Auto-detection */}
// <div className="grid relative">
//   <label className="block font-semibold mb-1">Location</label>
//   <div className="relative w-full">
//     <input
//       type="text"
//       value={query}
//       onChange={handleInputChange}
//       placeholder="Search for your location"
//       className="w-full border rounded-md px-4 py-2"
//       required
//     />
//     <input type="hidden" name="locationZip" value={locationZip} />

//     {suggestions.length > 0 && (
//       <ul className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
//         {suggestions.map((suggestion, index) => (
//           <li
//             key={index}
//             className="p-2 hover:bg-gray-100 cursor-pointer"
//             onClick={() => handleLocationSelect(suggestion)}
//           >
//             {suggestion.display_name}
//           </li>
//         ))}
//       </ul>
//     )}

//     {/* Current Location Button with Icon */}
//     <button
//       type="button"
//       onClick={getCurrentLocation}
//       disabled={loading}
//       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-blue-600 focus:outline-none"
//       title="Use my current location"
//     >
//       {loading ? (
//         <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
//       ) : (
//         <BiCurrentLocation className="w-6 h-6" />
//       )}
//     </button>
//   </div>

//   {/* Map Preview */}
//   {(locationZip || query) && (
//     <div className="mt-3">
//       <GoogleMapComponent zipCode={locationZip} location={query} />
//     </div>
//   )}
// </div>

//                   {/* Description */}
//                   <div>
//                     <label className="block font-semibold mb-1">
//                       Description
//                     </label>
//                     <textarea
//                       value={budgetDescription}
//                       onChange={(e) => setBudgetDescription(e.target.value)}
//                       className="w-full border px-3 py-2 rounded"
//                       placeholder="Additional details (optional)"
//                       rows={3}
//                     />
//                   </div>

//                   <button
//                     type="submit"
//                     className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//                   >
//                     Submit Budget
//                   </button>
//                 </form>
//               )}

//             {/* TABS buttons */}
//             <div className="flex gap-4 pt-4 font-bold text-white ">
//               <button
//                 className={`px-5 py-2 rounded-xl ${
//                   activeTab === "description"
//                     ? "bg-blue-600 text-white"
//                     : "bg-gray-200 text-gray-800"
//                 }`}
//                 onClick={() => setActiveTab("description")}
//               >
//                 Details
//               </button>
//               <button
//                 className={`px-5 py-2 rounded-xl ${
//                   activeTab === "bids"
//                     ? "bg-blue-600 text-white"
//                     : "bg-gray-200 text-gray-800"
//                 }`}
//                 onClick={() => setActiveTab("bids")}
//               >
//                 Bids
//               </button>
//             </div>
//           </div>

//           <div>
//             {/* Description */}
//             <div className={activeTab === "description" ? "block" : "hidden"}>
//               <div className="mb-6">
//                 <h3 className="font-semibold text-lg text-gray-900 mb-3">
//                   Description
//                 </h3>
//                 <p className="text-gray-600 leading-relaxed whitespace-pre-line">
//                   {singleAuction?.description || "No description available."}
//                 </p>
//               </div>
//             </div>

//             {/* Bids */}
//             <div
//               id="bids"
//               className={`pt-4 border-t border-border-info-color max-h-[250px] overflow-y-auto  ${
//                 activeTab === "bids" ? "block" : "hidden"
//               } no-scrollbar`}
//             >
//               {/* map over bids array */}
//               {singleAuction?.bids?.length > 0 || bidsData.length > 0 ? (
//                 bidsData?.map((bid) => <BidCard key={bid._id} bid={bid} />)
//               ) : (
//                 <h1 className="text-blue">No bids yet</h1>
//               )}
//             </div>
//           </div>

//           <div className="text-heading-color capitalize"></div>

//           {/* countdown timer */}

//           <div className="flex flex-col gap-4 pt-4 border-t border-border-info-color">
//             <div className="flex justify-between items-center">
//               <div className="flex flex-col gap-2">
//                 <h3 className="text-black font-medium">
//                   {" "}
//                   {singleAuction?.bids?.length > 0
//                     ? "Current Bid"
//                     : "Starting Price"}
//                 </h3>
//                 <p className="text-body-text-color">
//                   {currency}
//                   {singleAuctionData?.startingPrice}
//                 </p>
//               </div>
//               <div className="flex flex-col gap-2">
//                 <h3 className="text-blue-500 font-medium">Time</h3>

//                 <p className="text-body-text-color">
//                   <CountDownTimer
//                     startTime={singleAuction?.startTime}
//                     endTime={singleAuction?.endTime}
//                     id={singleAuction?._id}
//                     Winner={handleWinner}
//                   />
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* // detail about current bid and timer  */}
//           <div className="flex flex-col gap-4 pt-4 border-t border-border-info-color">
//             {singleAuction?.status === "over" || auctionWinnerDetailData ? (
//               bidsData.length > 0 ? (
//                 <>
//                   <div>
//                     <h1 className="font-bold text-black">Winner</h1>
//                     {bidsData.length > 0 ? (
//                       <div className="flex sm:gap-10 items-center border mt-2 justify-between md:w-[80%] py-1 px-2 md:px-5 border-theme-bg-light rounded-full bg-white">
//                         <div className="flex gap-4 items-center text-black">
//                           <img
//                             src={
//                               // Use winner data from the first bid if available
//                               bidsData[0]?.bidder?.profilePicture ||
//                               "/default-avatar.png"
//                             }
//                             alt="bidder profilePicture"
//                             className="w-10 h-10 rounded-full"
//                           />
//                           <div className="flex flex-col">
//                             <span className="font-semibold">
//                               {bidsData[0]?.bidder?.firstName || "Winner"}
//                             </span>
//                             <span className="text-xs text-gray-500">
//                               {(() => {
//                                 const bidTime = bidsData[0]?.bidTime;
//                                 if (!bidTime) return "Date not available";

//                                 try {
//                                   const dateObj = new Date(bidTime);
//                                   if (isNaN(dateObj.getTime()))
//                                     return "Invalid date";

//                                   return `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`;
//                                 } catch (e) {
//                                   return "Invalid date format";
//                                 }
//                               })()}
//                             </span>
//                           </div>
//                         </div>
//                         <div className="text-black">
//                           Bid Amount: $
//                           {bidsData[0]?.bidAmount?.toFixed(2) || "0.00"}
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="text-white mt-2">
//                         No winner information available
//                       </div>
//                     )}
//                   </div>
//                 </>
//               ) : (
//                 <h1 className="text-black">No bids</h1>
//               )
//             ) : (
//               auctionStarted && (
//                 <form
//                   className="flex justify-between flex-wrap gap-4 items-center"
//                   onSubmit={placeBidHandle}
//                 >
//                   {/* input button for bid */}
//                   <input
//                     type="number"
//                     className="outline-none text-slate-300 px-3 text-white py-4 rounded-xl bg-theme-bg2 border border-border-info- text-center focus:border-theme-color transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                     placeholder="Enter your bid"
//                     value={newBidAmount}
//                     onChange={(e) => setNewBidAmount(e.target.value)}
//                     required
//                   />
//                   {logInUser ? (
//                     user?.paymentVerified ? (
//                       <button
//                         type="submit"
//                         disabled={
//                           singleAuction?.seller?._id === logInUser?._id ||
//                           !auctionStarted
//                         }
//                         className={`py-2 px-4 rounded-lg text-white ${
//                           singleAuction?.seller?._id === logInUser?._id ||
//                           !auctionStarted
//                             ? "bg-theme-bg2 text-body-text-color cursor-not-allowed border border-border-info-color hover:border-color-danger"
//                             : "bg-color-primary border cursor-pointer border-border-info-color hover:bg-color-danger"
//                         }`}
//                       >
//                         Place Bid
//                       </button>
//                     ) : (
//                       <Link
//                         to="/user-profile/payment-method"
//                         className="bg-color-primary py-4 px-4 rounded-lg cursor-pointer text-white"
//                       >
//                         Attach Payment Method to Bid
//                       </Link>
//                     )
//                   ) : (
//                     <Link
//                       to="/login"
//                       className="bg-color-primary py-2 px-4 rounded-lg cursor-pointer text-white"
//                     >
//                      Login First
//                     </Link>
//                   )}
//                 </form>
//               )
//             )}
//           </div>
//         </div>
//       </div>
//       <div>
//         {singleAuction?.vehicle ? (
//           <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-6">
//             {/* Header */}
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
//               <h3 className="text-2xl font-bold justify-center text-gray-900">
//                 Vehicle Specifications
//               </h3>
//               <div className="flex items-center text-gray-700 text-base font-medium">
//                 <svg
//                   className="w-5 h-5 text-gray-500 mr-2"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M4 6h16M4 12h16M4 18h16"
//                   />
//                 </svg>
//                 Technical Details
//               </div>
//             </div>

//             {/* Main Content */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Vehicle Information */}
//               <div className="bg-gray-50 p-5 rounded-lg space-y-4 shadow-sm">
//                 <h4 className="text-lg font-semibold text-gray-800 flex items-center">
//                   <svg
//                     className="w-5 h-5 text-blue-500 mr-2"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
//                     />
//                   </svg>
//                   Vehicle Information
//                 </h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <p className="text-gray-700">
//                       <span className="font-medium text-gray-900">Model:</span>{" "}
//                       {singleAuction.vehicle.model || "---"}
//                     </p>
//                     <p className="text-gray-700">
//                       <span className="font-medium text-gray-900">
//                         Manufacturer:
//                       </span>{" "}
//                       {singleAuction.vehicle.manufacturer || "---"}
//                     </p>
//                   </div>
//                   <div className="space-y-2">
//                     <p className="text-gray-700">
//                       <span className="font-medium text-gray-900">Year:</span>{" "}
//                       {singleAuction.vehicle.yearofmanufacture || "---"}
//                     </p>
//                     <p className="text-gray-700">
//                       <span className="font-medium text-gray-900">
//                         Country:
//                       </span>{" "}
//                       {singleAuction.vehicle.country || "---"}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Dimensions */}
//               <div className="bg-gray-50 p-5 rounded-lg space-y-4 shadow-sm">
//                 <h4 className="text-lg font-semibold text-gray-800 flex items-center">
//                   <svg
//                     className="w-5 h-5 text-blue-500 mr-2"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
//                     />
//                   </svg>
//                   Dimensions
//                 </h4>
//                 {singleAuction.vehicle.dimensions && (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <p className="text-gray-700">
//                         <span className="font-medium text-gray-900">
//                           Length:
//                         </span>{" "}
//                         {singleAuction.vehicle.dimensions.length || "---"} in
//                       </p>
//                       <p className="text-gray-700">
//                         <span className="font-medium text-gray-900">
//                           Width:
//                         </span>{" "}
//                         {singleAuction.vehicle.dimensions.width || "---"} in
//                       </p>
//                       <p className="text-gray-700">
//                         <span className="font-medium text-gray-900">
//                           Height:
//                         </span>{" "}
//                         {singleAuction.vehicle.dimensions.height || "---"} in
//                       </p>
//                       <p className="text-gray-700">
//                         <span className="font-medium text-gray-900">
//                           Wheelbase:
//                         </span>{" "}
//                         {singleAuction.vehicle.dimensions.wheelbase || "---"} in
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-700">
//                         <span className="font-medium text-gray-900">
//                           Curb Weight:
//                         </span>{" "}
//                         {singleAuction.vehicle.dimensions.curbWeight || "---"}{" "}
//                         lbs
//                       </p>
//                       <p className="text-gray-700">
//                         <span className="font-medium text-gray-900">
//                           Engine Size:
//                         </span>{" "}
//                         {singleAuction.vehicle.dimensions.engineSize || "---"} L
//                       </p>
//                       <p className="text-gray-700">
//                         <span className="font-medium text-gray-900">
//                           Cab Width:
//                         </span>{" "}
//                         {singleAuction.vehicle.dimensions.cabwidth || "---"} in
//                       </p>
//                       <p className="text-gray-700">
//                         <span className="font-medium text-gray-900">
//                           Cab Height:
//                         </span>{" "}
//                         {singleAuction.vehicle.dimensions.cabheight || "---"} in
//                       </p>
//                       <p className="text-gray-700">
//                         <span className="font-medium text-gray-900">
//                           Bonnet Width:
//                         </span>{" "}
//                         {singleAuction.vehicle.dimensions.bonnetwidth || "---"}{" "}
//                         in
//                       </p>
//                       <p className="text-gray-700">
//                         <span className="font-medium text-gray-900">
//                           Bonnet Length:
//                         </span>{" "}
//                         {singleAuction.vehicle.dimensions.bonnetLength || "---"}{" "}
//                         in
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
//             <svg
//               className="w-12 h-12 mx-auto text-gray-400"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//               />
//             </svg>
//             <p className="mt-3 text-gray-500 font-medium">
//               No vehicle information available
//             </p>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default SingleAuctionDetail;
