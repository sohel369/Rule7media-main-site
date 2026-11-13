import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState,useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout, reset } from "../store/auth/authSlice";
import {
  Clapperboard,
  ChevronDown,
  Zap,
  Settings,
  Eye,
  HelpCircle,
  Globe,
  TrendingDown,
  Megaphone,
  Gavel,
  Menu,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";
import { IoIosNotificationsOutline } from "react-icons/io";
import { getNotificationForUser } from "../store/notification/notificationSlice";
import socket from "../socket";
import {
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaChartBar,
  FaBox,
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaPlusCircle,
  FaGavel,
  FaPhone,
} from "react-icons/fa";
import { BsCart3 } from "react-icons/bs";
import { fetchUserCountry, setCountry } from "../store/countary/countrySlice";
import ReactCountryFlag from "react-country-flag";
import "./header.css";
import { clearNonEnglishSourceTranslateCookies } from "../utils/googleTranslate";
import { getCartItems, getWinningBid } from "../store/cart/cartSlice";
import { getContactInfo } from "../store/contact/contactSlice";
import AbandonedCartBanner from "./AbandonedCartBanner.jsx";

const Header = () => {
  const googleTranslateRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collabOpen, setCollabOpen] = useState(false);
  const [benefitsOpen, setBenefitsOpen] = useState(false);
  const [opportunitiesOpen, setOpportunitiesOpen] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { contact = [] } = useSelector((state) => state.contactInfo);
  const { notifications } = useSelector((state) => state.notification);
  const navigate = useNavigate();
  const location = useLocation();
  const logInUser = JSON.parse(localStorage.getItem("user"));
  const country = useSelector((state) => state.country.country);

  const unReadNotifications = notifications.filter((n) => n.isRead === false);
  const { cartItems, winningBid } = useSelector((state) => state.cart);
  const params = new URLSearchParams(location.search);

  const landingPageToRoleMap = {
    "/BuyerMarketingExecutive": "advertiser",
    "/VehicleOwner": "fleet-owner",
    "/WrapperLandingPage": "wrapping-shop",
    "/AncillaryAdvertisers": "seller",
  };
const isAffiliatePage = location.pathname === "/affiliate";
  // handleJoinElite function
  const handleJoinElite = () => {
    const currentPath = location.pathname;
    const currentPageRole = landingPageToRoleMap[currentPath];

if (isAffiliatePage) {
  
    window.open("https://www.refferq.com/", "_blank", "noopener,noreferrer");
    return;
  }
    if (user) {
      // Logged in user - existing role ke according
      switch (user?.role) {
        case "advertiser":
          navigate("/BuyerMarketingExecutive");
          break;
        case "fleetOwner":
          navigate("/VehicleOwner");
          break;
        case "wrapper":
          navigate("/WrapperLandingPage");
          break;
        case "seller":
          navigate("/AncillaryAdvertisers");
          break;
        default:
          navigate("/register");
      }
    } else {
      // Not logged in - agar specific landing page se aaya hai toh role ke saath register
      if (currentPageRole) {
        // Agar current page Special landing page hai toh
        navigate(`/register?role=${currentPageRole}`);
      } else {
        // Normal page se aaya hai
        navigate("/register");
      }
    }
  };
  const isActiveRoute = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };
  useEffect(() => {
    let total = 0;

    // Cart items se count
    if (Array.isArray(cartItems)) {
      cartItems.forEach((item) => {
        if (Array.isArray(item.products)) {
          total += item.products.length;
        } else if (item.products && typeof item.products === "object") {
          total += 1;
        }
      });
    }

    // Winning bids se count
    if (winningBid && Array.isArray(winningBid) && winningBid.length > 0) {
      const bids = winningBid[0]?.bids || [];
      if (Array.isArray(bids)) {
        total += bids.length;
      }
    }

    setItemCount(total);
  }, [cartItems, winningBid]);

  const currentCountryContact =
    Array.isArray(contact) && contact.length > 0
      ? contact.find(
          (item) => item.country?.toLowerCase() === country?.toLowerCase(),
        ) ||
        contact.find((item) => item.country?.toLowerCase() === "australia") ||
        contact[0]
      : null;

  useEffect(() => {
    // Listen for cart update events
    const handleCartUpdate = () => {
      if (user && ["buyer", "advertiser", "wrapper"].includes(user?.userType)) {
        dispatch(getCartItems());
        dispatch(getWinningBid());
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [dispatch, user]);
  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [country, dispatch]);

  useEffect(() => {
    dispatch(getContactInfo());
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user && ["buyer", "advertiser", "wrapper"].includes(user?.userType)) {
      dispatch(getCartItems());
      dispatch(getWinningBid());
    }
  }, [dispatch, user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const dropdown = document.querySelector(".profile-dropdown");
      const profileImg = document.querySelector(".profile-image");
      if (
        sidebarOpen &&
        dropdown &&
        !dropdown.contains(e.target) &&
        profileImg &&
        !profileImg.contains(e.target)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  useEffect(() => setSidebarOpen(false), [location]);

  // Google Translate - Optimized singleton loader
  useEffect(() => {
    clearNonEnglishSourceTranslateCookies();

    const initTranslate = () => {
      if (window.google?.translate?.TranslateElement) {
        const container = document.getElementById("google_translate_element");
        if (container) {
          container.innerHTML = "";
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,hi,id,ja,zh-CN,es,fr,de,th",
              layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
              autoDisplay: false,
            },
            "google_translate_element"
          );
        }
      }
    };

    window.googleTranslateElementInit = initTranslate;
    const hasScript = document.querySelector('script[src*="translate_a/element.js"]');
    if (!hasScript) {
      const script = document.createElement("script");
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if (window.google?.translate?.TranslateElement) {
          initTranslate();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (logInUser) dispatch(getNotificationForUser());
    socket.on("newBidNotification", () => {
      socket.emit("joinAuction", logInUser?._id);
      dispatch(getNotificationForUser());
    });
  }, [location]);

  const isSubscriptionActive = () => {
    const currentUser = user || logInUser;
    if (!currentUser) return false;
    const status = currentUser?.subscription?.status?.toLowerCase()?.trim();
    return status === "active";
  };

  const hasActiveSubscription = isSubscriptionActive();

  const handleProfileIconClick = (e) => {
    // Prevent any default navigation
    e.preventDefault();
    e.stopPropagation();

    if (dashboardLoading) return;

    const status = user?.subscription?.status?.toLowerCase()?.trim();
    const isActive = status === "active";

    if (isActive) {
      setDashboardLoading(true);
      navigate("/user-profile/profile");
      setDashboardLoading(false);
    } else {
      navigate("/subscriberonly");
    }
  };
  const logoutHandle = () => {
    dispatch(logout());
    toast.success("Logout Successfully!");
    setSidebarOpen(false);
    dispatch(reset());
    navigate("/login");
  };

  useEffect(() => {
    if (!country) dispatch(fetchUserCountry());
  }, [dispatch, country]);

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    if (selectedCountry) dispatch(setCountry(selectedCountry));
  };

  const countries = [
    "United States",
    "Canada",
    "Australia",
    "China",
    "Japan",
    "India",
    "Thailand",
    "Indonesia",
    "Spain",
    "France",
    "United Kingdom",
  ];
  const countryToCodeMap = {
    "United States": "US",
    Canada: "CA",
    Australia: "AU",
    China: "CN",
    Japan: "JP",
    India: "IN",
    Thailand: "TH",
    Indonesia: "ID",
    Spain: "ES",
    France: "FR",
    "United Kingdom": "GB",
  };

  const isSpecialPage =
    (location.pathname === "/BuyerMarketSubsriptionPaymentSuccess" &&
      params.has("session_id")) ||
    (location.pathname === "/subscriptionpaymentsuccess" &&
      params.has("session_id")) ||
    location.pathname === "/subscription-cancel";

  const isLoggedIn = !!user && !isSpecialPage && hasActiveSubscription;
  const isLogged = user;
  // Dropdown items with correct icon colors (matching original)
  const collaborativeItems = [
    {
      name: "Viral Engine",
      path: "https://scanthemall.com/",
      icon: <Zap size={18} />,
      bgColor: "bg-red-500/10",
      textColor: "text-red-500",
    },
    {
      name: "How it Works",
      path: "/how-it-works",
      icon: <Settings size={18} />,
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-500",
    },
    {
      name: "Vision",
      path: "/missionstatement",
      icon: <Eye size={18} />,
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-500",
    },
  ];
  const benefitsItems = [
    {
      name: "FAQ",
      path: "/faq",
      icon: <HelpCircle size={18} />,
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-500",
    },
    {
      name: "Global Explainer Videos",
      path: "/Statistics",
      icon: <Globe size={18} />,
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-500",
    },
    {
      name: "Savings Opportunities",
      path: "/Cpm",
      icon: <TrendingDown size={18} />,
      bgColor: "bg-pink-500/10",
      textColor: "text-pink-500",
    },
  ];
  const opportunitiesItems = [
    {
      name: "Advertise with Us",
      path: "/AncillaryAdvertisers",
      icon: <Megaphone size={18} />,
      bgColor: "bg-indigo-500/10",
      textColor: "text-indigo-500",
    },
    {
      name: "Live Auctions",
      path: "/liveauction",
      icon: <Gavel size={18} />,
      bgColor: "bg-orange-500/10",
      textColor: "text-orange-500",
    },
  ];

  return (
    <>
      {["/register", "/signup"].includes(location.pathname) && (
        <AbandonedCartBanner />
      )}

      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-container">
          {/* ❌ Removed top-bar-left */}

          <div className="top-bar-right">
            <div className="country-selector">
              <ReactCountryFlag
                countryCode={countryToCodeMap[country] || "US"}
                svg
                className="country-flag"
              />
              <select
                className="country-dropdown"
                value={country || ""}
                disabled
                onChange={handleCountryChange}
              >
                <option value="">Country</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

         <div
              id="google_translate_element"
              ref={googleTranslateRef}
              className="google-translate"
            />
          </div>
        </div>
      </div>

      {/* Main Header - Original Colors & Hover */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-[#0B0E14] shadow-lg" : "bg-[#0B0E14]"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200 group-hover:rotate-12 transition-transform">
              <Clapperboard className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Rule7<span className="text-red-600">Media</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {!isLoggedIn ? (
              // PUBLIC HEADER (with Login button)
              <>
                <Link
                  to="/"
                  className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-red-500 uppercase tracking-wider"
                >
                  Home
                </Link>

                {/* Collaborative */}
                <div
                  className="relative"
                  onMouseEnter={() => setCollabOpen(true)}
                  onMouseLeave={() => setCollabOpen(false)}
                >
                  <button className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-red-500 flex items-center gap-1 uppercase tracking-wider">
                    Collaborative{" "}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${collabOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {collabOpen && (
                    <div className="absolute top-full left-0 w-64 pt-4">
                      <div className="bg-[#161B26] rounded-2xl shadow-2xl border border-slate-800 p-2">
                        {collaborativeItems.map((item) =>
                          item.path.startsWith("http") ? (
                            <a
                              key={item.name}
                              href={item.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-sm font-semibold text-slate-300 hover:text-red-500 transition-all"
                            >
                              <div
                                className={`w-8 h-8 ${item.bgColor} ${item.textColor} rounded-lg flex items-center justify-center`}
                              >
                                {item.icon}
                              </div>
                              {item.name}
                            </a>
                          ) : (
                            <Link
                              key={item.name}
                              to={item.path}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-sm font-semibold text-slate-300 hover:text-red-500 transition-all"
                            >
                              <div
                                className={`w-8 h-8 ${item.bgColor} ${item.textColor} rounded-lg flex items-center justify-center`}
                              >
                                {item.icon}
                              </div>
                              {item.name}
                            </Link>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Benefits */}
                <div
                  className="relative"
                  onMouseEnter={() => setBenefitsOpen(true)}
                  onMouseLeave={() => setBenefitsOpen(false)}
                >
                  <button className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-red-500 flex items-center gap-1 uppercase tracking-wider">
                    Benefits{" "}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${benefitsOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {benefitsOpen && (
                    <div className="absolute top-full left-0 w-72 pt-4">
                      <div className="bg-[#161B26] rounded-2xl shadow-2xl border border-slate-800 p-2">
                        {benefitsItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.path}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-sm font-semibold text-slate-300 hover:text-red-500 transition-all"
                          >
                            <div
                              className={`w-8 h-8 ${item.bgColor} ${item.textColor} rounded-lg flex items-center justify-center`}
                            >
                              {item.icon}
                            </div>
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Opportunities */}
                <div
                  className="relative"
                  onMouseEnter={() => setOpportunitiesOpen(true)}
                  onMouseLeave={() => setOpportunitiesOpen(false)}
                >
                  <button className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-red-500 flex items-center gap-1 uppercase tracking-wider">
                    Opportunities{" "}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${opportunitiesOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {opportunitiesOpen && (
                    <div className="absolute top-full right-0 w-64 pt-4">
                      <div className="bg-[#161B26] rounded-2xl shadow-2xl border border-slate-800 p-2">
                        {opportunitiesItems.map((item) =>
                          item.path.startsWith("http") ? (
                            <a
                              key={item.name}
                              href={item.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-sm font-semibold text-slate-300 hover:text-red-500 transition-all"
                            >
                              <div
                                className={`w-8 h-8 ${item.bgColor} ${item.textColor} rounded-lg flex items-center justify-center`}
                              >
                                {item.icon}
                              </div>
                              {item.name}
                            </a>
                          ) : (
                            <Link
                              key={item.name}
                              to={item.path}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-sm font-semibold text-slate-300 hover:text-red-500 transition-all"
                            >
                              <div
                                className={`w-8 h-8 ${item.bgColor} ${item.textColor} rounded-lg flex items-center justify-center`}
                              >
                                {item.icon}
                              </div>
                              {item.name}
                            </Link>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {!isLogged ? (
                  <>
                    <button
                      onClick={handleJoinElite}
                      className="ml-4 px-6 py-2.5 bg-red-600 text-white text-sm font-bold rounded-full hover:bg-red-700 transition-all shadow-lg cursor-pointer"
                    >
                      Join Elite
                    </button>
                   {isAffiliatePage ? ( <a href="https://www.refferq.com/" target="_blank" rel="noopener noreferrer" className="ml-2 px-6 py-2.5 border border-slate-600 text-slate-300 text-sm font-bold rounded-full hover:bg-slate-800 transition-all" > Login </a> ) : ( <Link to="/login" className="ml-2 px-6 py-2.5 border border-slate-600 text-slate-300 text-sm font-bold rounded-full hover:bg-slate-800 transition-all" > Login </Link> )}
                  </>
                ) : !hasActiveSubscription ? (
                  // Logged in but NO subscription - sirf Logout dikhao
                  <button
                    onClick={logoutHandle}
                    className="ml-4 px-6 py-2.5 bg-slate-700 text-red-400 text-sm font-bold rounded-full hover:bg-slate-600 border border-red-500/30 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <FaSignOutAlt size={14} /> Logout
                  </button>
                ) : (
                  <Link
                    to="/user-profile/profile"
                    onClick={handleProfileIconClick}
                    style={{ cursor: "pointer" }}
                    className="ml-4 flex items-center cursor-pointer"
                  >
                    <img
                      src={
                        user?.profilePicture ||
                        logInUser?.profilePicture ||
                        "https://via.placeholder.com/40"
                      }
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 hover:border-red-500 transition-all"
                    />
                  </Link>
                )}
              </>
            ) : (
              // PRIVATE HEADER (Logged in)
              <>
                <Link
                  to="/"
                  className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all ${
                    isActiveRoute("/")
                      ? "text-red-500 border-b-2 border-red-500"
                      : "text-slate-300 hover:text-red-500"
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/about-us"
                  className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all ${
                    isActiveRoute("/about-us")
                      ? "text-red-500 border-b-2 border-red-500"
                      : "text-slate-300 hover:text-red-500"
                  }`}
                >
                  About
                </Link>
                <Link
                  to="/contact-us"
                  className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all ${
                    isActiveRoute("/contact-us")
                      ? "text-red-500 border-b-2 border-red-500"
                      : "text-slate-300 hover:text-red-500"
                  }`}
                >
                  Contact
                </Link>
                <Link
                  to="/Statistics"
                  className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all ${
                    isActiveRoute("/Statistics")
                      ? "text-red-500 border-b-2 border-red-500"
                      : "text-slate-300 hover:text-red-500"
                  }`}
                >
                  Statistics
                </Link>
                {/* {(user?.userType === "advertiser" || user?.userType === "buyer") && (
                  <Link to="/our-products" className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all ${
        isActiveRoute("/our-products") 
          ? "text-red-500 border-b-2 border-red-500" 
          : "text-slate-300 hover:text-red-500"
      }`}>Products</Link>
                )} */}
                {["buyer", "advertiser", "wrapper"].includes(
                  user?.userType,
                ) && (
                  <Link
                    to="/user-profile/cart"
                    className="relative ml-2 p-2 text-slate-300 hover:text-red-500"
                  >
                    <BsCart3 size={22} />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                )}
                <Link
                  to="/user-profile/notifications"
                  className="relative ml-2 p-2 text-slate-300 hover:text-red-500"
                >
                  <IoIosNotificationsOutline size={28} />
                  {unReadNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unReadNotifications.length}
                    </span>
                  )}
                </Link>
                <div className="relative ml-4">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="flex items-center gap-2 p-2 bg-slate-800 rounded-full hover:bg-theme-bg"
                  >
                    <img
                      src={
                        user?.profilePicture || "https://via.placeholder.com/32"
                      }
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <ChevronDown
                      className={`w-4 h-4 text-slate-300 transition-transform ${sidebarOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {sidebarOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#161B26] rounded-2xl shadow-2xl border border-slate-800 p-2 z-50">
                      <Link
                        to="/user-profile/profile"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-sm font-semibold text-slate-300 hover:text-red-500"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <FaUser /> Profile
                      </Link>
                      {user.userType === "seller" && (
                        <Link
                          to="/user-profile/manage-items"
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-sm font-semibold text-slate-300 hover:text-red-500"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <FaBox /> Manage Items
                        </Link>
                      )}
                      {user.userType === "fleetOwner" && (
                        <Link
                          to="/user-profile/add-auction"
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-sm font-semibold text-slate-300 hover:text-red-500"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <FaPlusCircle /> Add Auction
                        </Link>
                      )}
                      {(user.userType === "wrapper" ||
                        user.userType === "advertiser" ||
                        user.userType === "buyer") && (
                        <Link
                          to="/user-profile/bids-items"
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-sm font-semibold text-slate-300 hover:text-red-500"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <FaGavel /> Bids Items
                        </Link>
                      )}
                      <Link
                        to="/user-profile/account-settings"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-sm font-semibold text-slate-300 hover:text-red-500"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <FaCog /> Settings
                      </Link>
                      <button
                        onClick={logoutHandle}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-sm font-semibold text-red-500"
                      >
                        <FaSignOutAlt /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:bg-slate-800 rounded-lg"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0B0E14] border-t border-slate-800 py-4 px-4 shadow-xl">
            {!isLoggedIn ? (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/"
                  className="px-4 py-3 text-sm font-bold text-slate-300 hover:text-red-500 uppercase"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <details className="group">
                  <summary className="px-4 py-3 text-sm font-bold text-slate-300 hover:text-red-500 flex justify-between uppercase cursor-pointer list-none">
                    Collaborative
                    <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pl-6 mt-1 space-y-1">
                    {collaborativeItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-red-500"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className={`w-6 h-6 ${item.textColor}`}>
                          {item.icon}
                        </div>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </details>
                <details className="group">
                  <summary className="px-4 py-3 text-sm font-bold text-slate-300 hover:text-red-500 flex justify-between uppercase cursor-pointer list-none">
                    Benefits
                    <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pl-6 mt-1 space-y-1">
                    {benefitsItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-red-500"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className={`w-6 h-6 ${item.textColor}`}>
                          {item.icon}
                        </div>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </details>
                <details className="group">
                  <summary className="px-4 py-3 text-sm font-bold text-slate-300 hover:text-red-500 flex justify-between uppercase cursor-pointer list-none">
                    Opportunities
                    <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pl-6 mt-1 space-y-1">
                    {opportunitiesItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-red-500"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className={`w-6 h-6 ${item.textColor}`}>
                          {item.icon}
                        </div>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </details>
                {!isLogged ? (
                  <>
                    <button
                      onClick={() => {
                        handleJoinElite();
                        setMobileMenuOpen(false);
                      }}
                      className="mt-4 mx-4 px-6 py-2.5 bg-red-600 text-white text-sm font-bold rounded-full text-center"
                    >
                      Join Elite
                    </button>

                    <Link
                      to="/login"
                      className="mx-4 px-6 py-2.5 border border-slate-600 text-slate-300 text-sm font-bold rounded-full text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </>
                ) : !hasActiveSubscription ? (
                  <button
                    onClick={() => {
                      logoutHandle();
                      setMobileMenuOpen(false);
                    }}
                    className="mt-4 mx-4 px-6 py-2.5 bg-slate-700 text-red-400 text-sm font-bold rounded-full flex items-center justify-center gap-2"
                  >
                    <FaSignOutAlt size={14} /> Logout
                  </button>
                ) : (
                  <Link
                    to="/user-profile/profile"
                    onClick={handleProfileIconClick}
                    style={{ cursor: "pointer" }}
                    className="mt-4 flex justify-center"
                  >
                    <img
                      src={
                        user?.profilePicture ||
                        logInUser?.profilePicture ||
                        "https://via.placeholder.com/50"
                      }
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
                    />
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-red-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaHome /> Home
                </Link>
                <Link
                  to="/about-us"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-red-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaInfoCircle /> About
                </Link>
                <Link
                  to="/contact-us"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-red-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaEnvelope /> Contact
                </Link>
                <Link
                  to="/Statistics"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-red-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaChartBar /> Statistics
                </Link>
                {/* {(user?.userType === "advertiser" || user?.userType === "buyer") && <Link to="/our-products" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-red-500" onClick={() => setMobileMenuOpen(false)}><FaBox /> Products</Link>} */}
                {["buyer", "advertiser", "wrapper"].includes(
                  user?.userType,
                ) && (
                  <Link
                    to="/user-profile/cart"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-red-500"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <BsCart3 /> Cart{" "}
                    {itemCount > 0 && (
                      <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                )}
                <Link
                  to="/user-profile/notifications"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-red-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <IoIosNotificationsOutline /> Notifications{" "}
                  {unReadNotifications.length > 0 && (
                    <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                      {unReadNotifications.length}
                    </span>
                  )}
                </Link>
                <div className="border-t border-slate-800 my-2"></div>
                <Link
                  to="/user-profile/profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-red-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaUser /> Profile
                </Link>
                {user.userType === "seller" && (
                  <Link
                    to="/user-profile/manage-items"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-red-500"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaBox /> Manage Items
                  </Link>
                )}
                {user.userType === "fleetOwner" && (
                  <Link
                    to="/user-profile/add-auction"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-red-500"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaPlusCircle /> Add Auction
                  </Link>
                )}
                {(user.userType === "wrapper" ||
                  user.userType === "advertiser" ||
                  user.userType === "buyer") && (
                  <Link
                    to="/user-profile/bids-items"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-red-500"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaGavel /> Bids Items
                  </Link>
                )}
                <Link
                  to="/user-profile/account-settings"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-red-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaCog /> Settings
                </Link>
                <button
                  onClick={logoutHandle}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500"
                >
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};

export default Header;

// import { Link, useNavigate } from "react-router-dom";
// import { useEffect, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { logout, reset } from "../store/auth/authSlice";
// import { Clapperboard } from "lucide-react";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { useLocation } from "react-router-dom";
// import { IoIosNotificationsOutline } from "react-icons/io";
// import { getNotificationForUser } from "../store/notification/notificationSlice";
// import socket from "../socket";
// import {
//   FaBars,
//   FaTimes,
//   FaHome,
//   FaInfoCircle,
//   FaEnvelope,
//   FaChartBar,
//   FaBox,
//   FaUser,
//   FaSignOutAlt,
//   FaCog,
//   FaPlusCircle,
//   FaGavel,
//   FaPhone,
//   FaFlag
// } from "react-icons/fa";
// import { BsCart3 } from "react-icons/bs";
// import { fetchUserCountry, setCountry } from "../store/countary/countrySlice";
// import logo from "../assets/logo2.jpg";
// import ReactCountryFlag from "react-country-flag";
// import "./header.css";
// import { getCartItems, getWinningBid } from "../store/cart/cartSlice";
// import { getContactInfo } from "../store/contact/contactSlice";
// import AbandonedCartBanner from "./AbandonedCartBanner.jsx";

// // Custom Icons with different colors
// const ChevronDownIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chevron-icon-svg">
//     <path d="m6 9 6 6 6-6"></path>
//   </svg>
// );

// const ZapIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="zap-icon">
//     <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
//   </svg>
// );

// const SettingsIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="settings-icon">
//     <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"></path>
//     <circle cx="12" cy="12" r="3"></circle>
//   </svg>
// );

// const EyeIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon">
//     <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
//     <circle cx="12" cy="12" r="3"></circle>
//   </svg>
// );

// const HelpCircleIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="help-icon">
//     <circle cx="12" cy="12" r="10"></circle>
//     <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
//     <path d="M12 17h.01"></path>
//   </svg>
// );

// const GlobeIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="globe-icon">
//     <circle cx="12" cy="12" r="10"></circle>
//     <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
//     <path d="M2 12h20"></path>
//   </svg>
// );

// const TrendingDownIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="trending-icon">
//     <path d="M16 17h6v-6"></path>
//     <path d="m22 17-8.5-8.5-5 5L2 7"></path>
//   </svg>
// );

// const MegaphoneIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="megaphone-icon">
//     <path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"></path>
//     <path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"></path>
//     <path d="M8 6v8"></path>
//   </svg>
// );

// const GavelIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="gavel-icon">
//     <path d="m14 13-8.381 8.38a1 1 0 0 1-3.001-3l8.384-8.381"></path>
//     <path d="m16 16 6-6"></path>
//     <path d="m21.5 10.5-8-8"></path>
//     <path d="m8 8 6-6"></path>
//     <path d="m8.5 7.5 8 8"></path>
//   </svg>
// );

// const Header = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [selectedLanguage, setSelectedLanguage] = useState("en");
//   const [itemCount, setItemCount] = useState(0);
//   const [isScrolled, setIsScrolled] = useState(false);

//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);
//   const { contact = [] } = useSelector((state) => state.contactInfo);
//   const { notifications } = useSelector((state) => state.notification);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const logInUser = JSON.parse(localStorage.getItem("user"));
//   const country = useSelector((state) => state.country.country);

//   const unReadNotifications = notifications.filter(
//     (notification) => notification.isRead === false
//   );

//   const { cartItems, winningBid } = useSelector((state) => state.cart);

//   useEffect(() => {
//     let totalItems = 0;
//     if (Array.isArray(cartItems)) {
//       cartItems.forEach((item) => {
//         if (Array.isArray(item.products)) {
//           totalItems += item.products.length;
//         }
//       });
//     }

//     if (winningBid && Array.isArray(winningBid) && winningBid.length > 0) {
//       const bids = winningBid[0]?.bids || [];
//       if (Array.isArray(bids)) {
//         totalItems += bids.length;
//       }
//     }

//     setItemCount(totalItems);
//   }, [cartItems, winningBid]);

//   const currentCountryContact =
//     Array.isArray(contact) && contact.length > 0
//       ? contact.find(
//           (item) => item.country?.toLowerCase() === country?.toLowerCase()
//         ) ||
//         contact.find((item) => item.country?.toLowerCase() === "australia") ||
//         contact[0]
//       : null;

//   useEffect(() => {
//     if (!country) {
//       fetch("https://ipapi.co/json/")
//         .then((res) => res.json())
//         .then((data) => {
//           if (data.country_name) {
//             dispatch(setCountry(data.country_name));
//           }
//         })
//         .catch(() => {
//           dispatch(setCountry("Australia"));
//         });
//     }
//   }, [country, dispatch]);

//   useEffect(() => {
//     dispatch(getContactInfo());
//   }, [dispatch]);

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 10);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   useEffect(() => {
//     if (user && ["buyer", "advertiser", "wrapper"].includes(user?.userType)) {
//       dispatch(getCartItems());
//       dispatch(getWinningBid());
//     }
//   }, [dispatch, user]);

//   useEffect(() => {
//     const logInUser = JSON.parse(localStorage.getItem("user"));
//     if (logInUser && ["buyer", "advertiser", "wrapper"].includes(logInUser?.userType)) {
//       dispatch(getCartItems());
//       dispatch(getWinningBid());
//     }
//   }, [dispatch]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       const dropdown = document.querySelector('.profile-dropdown');
//       const profileImg = document.querySelector('.profile-image');

//       if (
//         sidebarOpen &&
//         dropdown &&
//         !dropdown.contains(event.target) &&
//         profileImg &&
//         !profileImg.contains(event.target)
//       ) {
//         setSidebarOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [sidebarOpen]);

//   useEffect(() => {
//     setSidebarOpen(false);
//   }, [location]);

// useEffect(() => {
//   // Purani script hatao agar ho
//   const oldScript = document.querySelector('script[src*="translate.google.com"]');
//   if (oldScript) oldScript.remove();

//   // Global callback define karo pehle
//   window.googleTranslateElementInit = () => {
//     new window.google.translate.TranslateElement(
//       {
//         pageLanguage: "en",
//         includedLanguages: "en,hi,id,ja,zh-CN,es,fr,de,th",
//         layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
//         autoDisplay: false,
//       },
//       "google_translate_element"
//     );
//   };

//   // Script load karo
//   const script = document.createElement("script");
//   script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
//   script.async = true;
//   document.body.appendChild(script);

//   return () => {
//     if (document.body.contains(script)) {
//       document.body.removeChild(script);
//     }
//     delete window.googleTranslateElementInit;
//   };
// }, []);

//   useEffect(() => {
//     if (logInUser) {
//       dispatch(getNotificationForUser());
//     }
//     socket.on("newBidNotification", (data) => {
//       socket.emit("joinAuction", logInUser?._id);
//       dispatch(getNotificationForUser());
//     });
//   }, [location]);

//   const logoutHandle = () => {
//     dispatch(logout());
//     toast.success("Logout Successfully!");
//     setSidebarOpen(false);
//     dispatch(reset());
//     navigate("/login");
//   };

//   useEffect(() => {
//     if (!country) {
//       dispatch(fetchUserCountry());
//     }
//   }, [dispatch, country]);

//   const handleCountryChange = (event) => {
//     const selectedCountry = event.target.value;
//     if (!selectedCountry) return;
//     dispatch(setCountry(selectedCountry));
//   };

//   const countries = [
//     "United States",
//     "Canada",
//     "Australia",
//     "China",
//     "Japan",
//     "India",
//     "Thailand",
//     "Indonesia",
//     "Spain",
//     "France",
//     "United Kingdom",
//   ];

//   const countryToCodeMap = {
//     "United States": "US",
//     Canada: "CA",
//     Australia: "AU",
//     China: "CN",
//     Japan: "JP",
//     India: "IN",
//     Thailand: "TH",
//     Indonesia: "ID",
//     Spain: "ES",
//     France: "FR",
//     "United Kingdom": "GB",
//   };

//   // Navigation items for non-logged in users
//   const publicNavItems = [
//     {
//       name: "HOME",
//       path: "/",
//       hasDropdown: false
//     },
//     {
//       name: "COLLABORATIVE",
//       path: "#",
//       hasDropdown: true,
//       dropdownIcon: <ChevronDownIcon />,
//       dropdownItems: [
//         { name: "Viral Engine", path: "/viral-engine", icon: <ZapIcon /> },
//         { name: "How it Works", path: "/how-it-works", icon: <SettingsIcon /> },
//         { name: "Vision", path: "/missionstatement", icon: <EyeIcon /> },
//       ]
//     },
//     {
//       name: "BENEFITS",
//       path: "#",
//       hasDropdown: true,
//       dropdownIcon: <ChevronDownIcon />,
//       dropdownItems: [
//         { name: "FAQ", path: "/faq", icon: <HelpCircleIcon /> },
//         { name: "Global Explainer Videos", path: "/Statistics", icon: <GlobeIcon /> },
//         { name: "Savings Opportunities", path: "#", icon: <TrendingDownIcon /> },
//       ]
//     },
//     {
//       name: "OPPORTUNITIES",
//       path: "#",
//       hasDropdown: true,
//       dropdownIcon: <ChevronDownIcon />,
//       dropdownItems: [
//         { name: "Advertise with Us", path: "/advertise", icon: <MegaphoneIcon /> },
//         { name: "Live Auctions", path: "/liveauction", icon: <GavelIcon /> },
//       ]
//     },
//   ];

//   const isLoggedIn = !!user;

//   return (
//     <>
//       {["/register", "/signup"].includes(location.pathname) && <AbandonedCartBanner />}

//       {/* Top Bar */}
//       <div className="top-bar">
//         <div className="top-bar-container">
//           <div className="top-bar-left">
//             <div className="contact-item">
//               <FaPhone className="contact-icon" />
//               <span>{currentCountryContact?.phone || "+1 (555) 123-4567"}</span>
//             </div>
//             <div className="contact-item">
//               <FaEnvelope className="contact-icon" />
//               <span>{currentCountryContact?.email || "info@rule7media.com"}</span>
//             </div>
//           </div>

//           <div className="top-bar-right">
//             <div className="country-selector">
//               <ReactCountryFlag
//                 countryCode={countryToCodeMap[country] || "US"}
//                 svg
//                 className="country-flag"
//               />
//               <select
//                 className="country-dropdown"
//                 value={country || ""}
//               disabled
//                 onChange={handleCountryChange}
//               >
//                 <option value="">Country</option>
//                 {countries.map((c) => (
//                   <option key={c} value={c}>{c}</option>
//                 ))}
//               </select>
//             </div>
//            <div id="google_translate_element" className="google-translate"></div>
//           </div>
//         </div>
//       </div>

//       {/* Main Header */}
//       <header className="site-header">
//         <div className="header-container">

//           {/* Logo */}
//            <div className="logo-container group flex items-center gap-2">
//       <Link to="/" className="flex items-center gap-2">
//         {/* Icon as logo with hover effect */}
//         <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200 transition-transform group-hover:rotate-12">
//           <Clapperboard className="lucide lucide-clapperboard w-6 h-6" />
//         </div>

//         {/* Logo Text */}
//         <span className="text-2xl font-extrabold tracking-tight text-white">
//           Rule7<span className="text-red-600">Media</span>
//         </span>
//       </Link>

//       {/* {!isLoggedIn && (
//         <span className="global-leader-text text-sm text-white">
//           GLOBAL INNOVATION LEADER
//         </span>
//       )} */}
//     </div>

//           {/* Desktop Navigation */}
//           <nav className="desktop-nav">
//             {!isLoggedIn ? (
//               /* Public Header */
//               <>
//                 {publicNavItems.map((item) => (
//                   <div key={item.name} className="dropdown-container">
//                     {item.hasDropdown ? (
//                       <>
//                         <button className="public-nav-link">
//                           {item.name}
//                           <span className="chevron-icon">{item.dropdownIcon}</span>
//                         </button>

//                         <div className="dropdown-menu">
//                           {item.dropdownItems.map((dropdownItem) => (
//                             <Link
//                               key={dropdownItem.name}
//                               to={dropdownItem.path}
//                               className="dropdown-link"
//                               onClick={() => setMobileMenuOpen(false)}
//                             >
//                               {dropdownItem.icon}
//                               {dropdownItem.name}
//                             </Link>
//                           ))}
//                         </div>
//                       </>
//                     ) : (
//                       <Link
//                         to={item.path}
//                         className={`public-nav-link ${location.pathname === item.path ? 'active' : ''}`}
//                       >
//                         {item.name}
//                       </Link>
//                     )}
//                   </div>
//                 ))}

//                 <Link to="/register" className="join-elite-btn">
//                   Join Elite
//                 </Link>
//                 <Link to="/login" className="join-elite-btn">
//                    Login
//                 </Link>
//               </>
//             ) : (
//               /* Private Header */
//               <>
//                 <Link
//                   to="/"
//                   className={`nav-link nav-link-lg ${location.pathname === '/' ? 'active' : ''}`}
//                 >
//                   Home
//                 </Link>

//                 <Link
//                   to="/about-us"
//                   className={`nav-link nav-link-lg ${location.pathname === '/about-us' ? 'active' : ''}`}
//                 >
//                   About
//                 </Link>

//                 <Link
//                   to="/contact-us"
//                   className={`nav-link nav-link-lg ${location.pathname === '/contact-us' ? 'active' : ''}`}
//                 >
//                   Contact
//                 </Link>

//                 <Link
//                   to="/Statistics"
//                   className={`nav-link nav-link-lg ${location.pathname === '/Statistics' ? 'active' : ''}`}
//                 >
//                   Statistics
//                 </Link>

//                 {(user?.userType === "advertiser" || user?.userType === "buyer") && (
//                   <Link
//                     to="/our-products"
//                     className={`nav-link nav-link-lg ${location.pathname === '/our-products' ? 'active' : ''}`}
//                   >
//                     Products
//                   </Link>
//                 )}

//                 {["buyer", "advertiser", "wrapper"].includes(user?.userType) && (
//                   <Link
//                     to="/user-profile/cart"
//                     className={`icon-link ${location.pathname === '/user-profile/cart' ? 'active' : ''}`}
//                   >
//                     <BsCart3 size={22} />
//                     {itemCount > 0 && (
//                       <span className="cart-badge">
//                         {itemCount}
//                       </span>
//                     )}
//                   </Link>
//                 )}

//                 <Link
//                   to="/user-profile/notifications"
//                   className={`icon-link ${location.pathname === '/user-profile/notifications' ? 'active' : ''}`}
//                 >
//                   <IoIosNotificationsOutline size={28} />
//                   {unReadNotifications.length > 0 && (
//                     <span className="notification-badge">
//                       {unReadNotifications.length}
//                     </span>
//                   )}
//                 </Link>

//                 {/* Profile/Sign Out */}
//                 <div className="profile-container">
//                   <button
//                     onClick={() => setSidebarOpen(!sidebarOpen)}
//                     className="auth-btn"
//                   >
//                     <img
//                       src={user?.profilePicture || "https://via.placeholder.com/28"}
//                       alt="Profile"
//                       className="profile-img"
//                     />
//                     <FaSignOutAlt size={14} />
//                   </button>

//                   {sidebarOpen && (
//                     <div className="profile-dropdown">
//                       <Link
//                         to="/user-profile/profile"
//                         className="dropdown-link"
//                         onClick={() => setSidebarOpen(false)}
//                       >
//                         <FaUser className="dropdown-icon" /> Profile
//                       </Link>

//                       {user.userType === "seller" && (
//                         <Link
//                           to="/user-profile/manage-items"
//                           className="dropdown-link"
//                           onClick={() => setSidebarOpen(false)}
//                         >
//                           <FaBox className="dropdown-icon" /> Manage Items
//                         </Link>
//                       )}

//                       {user.userType === "fleetOwner" && (
//                         <Link
//                           to="/user-profile/add-auction"
//                           className="dropdown-link"
//                           onClick={() => setSidebarOpen(false)}
//                         >
//                           <FaPlusCircle className="dropdown-icon" /> Add Auction
//                         </Link>
//                       )}

//                       {(user.userType === "wrapper" || user.userType === "advertiser" || user.userType === "buyer") && (
//                         <Link
//                           to="/user-profile/bids-items"
//                           className="dropdown-link"
//                           onClick={() => setSidebarOpen(false)}
//                         >
//                           <FaGavel className="dropdown-icon" /> Bids Items
//                         </Link>
//                       )}

//                       <Link
//                         to="/user-profile/account-settings"
//                         className="dropdown-link"
//                         onClick={() => setSidebarOpen(false)}
//                       >
//                         <FaCog className="dropdown-icon" /> Settings
//                       </Link>

//                       <button
//                         onClick={() => {
//                           logoutHandle();
//                           setSidebarOpen(false);
//                         }}
//                         className="dropdown-link logout-btn"
//                       >
//                         <FaSignOutAlt className="dropdown-icon" /> Sign Out
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </>
//             )}
//           </nav>

//           {/* Mobile Menu Button */}
//           <button
//             className="mobile-menu-btn"
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//           >
//             {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
//           </button>
//         </div>

//         {/* Mobile Menu */}
//         {mobileMenuOpen && (
//           <div className="mobile-menu">
//             {!isLoggedIn ? (
//               <>
//                 {publicNavItems.map((item) => (
//                   <div key={item.name} className="mobile-menu-item">
//                     {item.hasDropdown ? (
//                       <details className="mobile-dropdown">
//                         <summary className="mobile-dropdown-summary">
//                           {item.name}
//                           {item.dropdownIcon}
//                         </summary>
//                         <div className="mobile-dropdown-menu">
//                           {item.dropdownItems.map((dropdownItem) => (
//                             <Link
//                               key={dropdownItem.name}
//                               to={dropdownItem.path}
//                               className="mobile-dropdown-link"
//                               onClick={() => setMobileMenuOpen(false)}
//                             >
//                               {dropdownItem.icon}
//                               {dropdownItem.name}
//                             </Link>
//                           ))}
//                         </div>
//                       </details>
//                     ) : (
//                       <Link
//                         to={item.path}
//                         className="mobile-nav-link"
//                         onClick={() => setMobileMenuOpen(false)}
//                       >
//                         {item.name}
//                       </Link>
//                     )}
//                   </div>
//                 ))}
//                 <Link to="/register" className="mobile-join-btn" onClick={() => setMobileMenuOpen(false)}>
//                   Join Elite
//                 </Link>
//                 <div className="mobile-global-leader">
//                   GLOBAL INNOVATION LEADER
//                 </div>
//               </>
//             ) : (
//               <div className="mobile-menu-loggedin">
//                 <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//                   <FaHome className="mobile-icon" /> Home
//                 </Link>
//                 <Link to="/about-us" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//                   <FaInfoCircle className="mobile-icon" /> About
//                 </Link>
//                 <Link to="/contact-us" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//                   <FaEnvelope className="mobile-icon" /> Contact
//                 </Link>
//                 <Link to="/Statistics" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//                   <FaChartBar className="mobile-icon" /> Statistics
//                 </Link>

//                 {(user?.userType === "advertiser" || user?.userType === "buyer") && (
//                   <Link to="/our-products" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//                     <FaBox className="mobile-icon" /> Products
//                   </Link>
//                 )}

//                 {["buyer", "advertiser", "wrapper"].includes(user?.userType) && (
//                   <Link to="/user-profile/cart" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//                     <BsCart3 size={16} className="mobile-icon" /> Cart
//                     {itemCount > 0 && <span className="mobile-badge">{itemCount}</span>}
//                   </Link>
//                 )}

//                 <Link to="/user-profile/notifications" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//                   <IoIosNotificationsOutline size={18} className="mobile-icon" /> Notifications
//                   {unReadNotifications.length > 0 && <span className="mobile-badge">{unReadNotifications.length}</span>}
//                 </Link>

//                 <div className="mobile-profile-section">
//                   <Link to="/user-profile/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//                     <FaUser className="mobile-icon" /> Profile
//                   </Link>

//                   {user.userType === "seller" && (
//                     <Link to="/user-profile/manage-items" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//                       <FaBox className="mobile-icon" /> Manage Items
//                     </Link>
//                   )}

//                   {user.userType === "fleetOwner" && (
//                     <Link to="/user-profile/add-auction" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//                       <FaPlusCircle className="mobile-icon" /> Add Auction
//                     </Link>
//                   )}

//                   {(user.userType === "wrapper" || user.userType === "advertiser" || user.userType === "buyer") && (
//                     <Link to="/user-profile/bids-items" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//                       <FaGavel className="mobile-icon" /> Bids Items
//                     </Link>
//                   )}

//                   <Link to="/user-profile/account-settings" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//                     <FaCog className="mobile-icon" /> Settings
//                   </Link>

//                   <button onClick={logoutHandle} className="mobile-nav-link logout-btn">
//                     <FaSignOutAlt className="mobile-icon" /> Sign Out
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </header>
//     </>
//   );
// };

// export default Header;

// import { Link, useNavigate } from "react-router-dom";
// import { useEffect, useRef, useState, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { logout, reset } from "../store/auth/authSlice";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { useLocation } from "react-router-dom";
// import { IoIosNotificationsOutline } from "react-icons/io";
// import { getNotificationForUser } from "../store/notification/notificationSlice";
// import socket from "../socket";
// import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
// import { BsCart3 } from "react-icons/bs";
// import { FaPhone, FaEnvelope, FaFlag } from "react-icons/fa";
// import { fetchUserCountry, setCountry } from "../store/countary/countrySlice";
// import logo from "../assets/logo2.jpg";
// import ReactCountryFlag from "react-country-flag";
// import "./header.css";
// import { getCartItems, getWinningBid } from "../store/cart/cartSlice";
// import { getContactInfo } from "../store/contact/contactSlice";
// import AbandonedCartBanner from "./AbandonedCartBanner.jsx";
// const Header = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [selectedLanguage, setSelectedLanguage] = useState("en");
//   const [itemCount, setItemCount] = useState(0);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);
//   const { contact = [], isLoading } = useSelector((state) => state.contactInfo);
//   const { notifications } = useSelector((state) => state.notification);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const logInUser = JSON.parse(localStorage.getItem("user"));
//   const country = useSelector((state) => state.country.country);

//   const unReadNotifications = notifications.filter(
//     (notification) => notification.isRead === false
//   );

//   const googleTranslateRef = useRef(null);

//   const { cartItems, winningBid } = useSelector((state) => state.cart);

//   useEffect(() => {
//     let totalItems = 0;
//     if (Array.isArray(cartItems)) {
//       cartItems.forEach((item) => {
//         if (Array.isArray(item.products)) {
//           totalItems += item.products.length;
//         }
//       });
//     } else {
//       console.warn("cartItems is not an array:", cartItems);
//     }

//     if (winningBid && Array.isArray(winningBid) && winningBid.length > 0) {
//       const bids = winningBid[0]?.bids || [];
//       if (Array.isArray(bids)) {
//         totalItems += bids.length;
//       }
//     } else {
//       console.warn("winningBid is not properly structured:", winningBid);
//     }

//     setItemCount(totalItems);
//   }, [cartItems, winningBid]);

//   const currentCountryContact =
//     Array.isArray(contact) && contact.length > 0
//       ? contact.find(
//           (item) => item.country?.toLowerCase() === country?.toLowerCase()
//         ) ||
//         contact.find((item) => item.country?.toLowerCase() === "australia") ||
//         contact[0]
//       : null;

//   useEffect(() => {
//     if (!country) {
//       fetch("https://ipapi.co/json/")
//         .then((res) => res.json())
//         .then((data) => {
//           if (data.country_name) {
//             dispatch(setCountry(data.country_name));
//           }
//         })
//         .catch(() => {
//           dispatch(setCountry("Australia"));
//         });
//     }
//   }, [country, dispatch]);

//   useEffect(() => {
//     dispatch(getContactInfo());
//   }, [dispatch]);

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 10);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   useEffect(() => {
//     if (user?.userType === "buyer") {
//       dispatch(getCartItems());
//       dispatch(getWinningBid());
//     }
//   }, [dispatch, user]);
// // Close sidebar when clicking outside or changing route
// useEffect(() => {
//   const handleClickOutside = (event) => {
//     const dropdown = document.querySelector('.profile-dropdown');
//     const profileImg = document.querySelector('.profile-image');

//     if (
//       sidebarOpen &&
//       dropdown &&
//       !dropdown.contains(event.target) &&
//       profileImg &&
//       !profileImg.contains(event.target)
//     ) {
//       setSidebarOpen(false);
//     }
//   };

//   document.addEventListener("mousedown", handleClickOutside);
//   return () => {
//     document.removeEventListener("mousedown", handleClickOutside);
//   };
// }, [sidebarOpen]);

// // Close sidebar when route changes
// useEffect(() => {
//   setSidebarOpen(false);
// }, [location]);

//   useEffect(() => {
//     const script = document.createElement("script");
//     script.src =
//       "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
//     script.async = true;
//     document.body.appendChild(script);

//     window.googleTranslateElementInit = () => {
//       new window.google.translate.TranslateElement(
//         {
//           pageLanguage: "en",
//           includedLanguages: "en,hi,id,ja,zh-CN,es,fr,de,th",
//           layout:
//             window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
//         },
//         googleTranslateRef.current
//       );
//     };

//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);

//   useEffect(() => {
//     const observer = new MutationObserver(() => {
//       const langSelect = document.querySelector(".goog-te-combo");
//       if (langSelect) {
//         setSelectedLanguage(langSelect.value);
//       }
//     });

//     const langSelect = document.querySelector(".goog-te-combo");
//     if (langSelect) {
//       observer.observe(langSelect, {
//         attributes: true,
//         childList: true,
//         subtree: true,
//       });
//     }

//     return () => {
//       observer.disconnect();
//     };
//   }, []);

//   useEffect(() => {
//     if (logInUser) {
//       dispatch(getNotificationForUser());
//     }
//     socket.on("newBidNotification", (data) => {
//       socket.emit("joinAuction", logInUser?._id);
//       dispatch(getNotificationForUser());
//     });
//   }, [location]);

//   const logoutHandle = () => {
//     dispatch(logout());
//     toast.success("Logout Successfully!");
//     setSidebarOpen(false);
//     dispatch(reset());
//     navigate("/login");
//   };

//   const marginTopStyle = selectedLanguage === "en" ? "0px" : "-46px";

//   useEffect(() => {
//     if (!country) {
//       dispatch(fetchUserCountry());
//     }
//   }, [dispatch, country]);

//   const handleCountryChange = (event) => {
//     const selectedCountry = event.target.value;
//     if (!selectedCountry) return;
//     dispatch(setCountry(selectedCountry));
//   };

//   const countries = [
//     "United States",
//     "Canada",
//     "Australia",
//     "China",
//     "Japan",
//     "India",
//     "Thailand",
//     "Indonesia",
//     "Spain",
//     "France",
//     "United Kingdom",
//   ];

//   const countryToCodeMap = {
//     "United States": "US",
//     Canada: "CA",
//     Australia: "AU",
//     China: "CN",
//     Japan: "JP",
//     India: "IN",
//     Thailand: "TH",
//     Indonesia: "ID",
//     Spain: "ES",
//     France: "FR",
//     "United Kingdom": "GB",
//   };

//   const topBarGradient = {
//     background: "linear-gradient(to right, #08121c, #343f51, #0d141e",
//   };

//   const mainHeaderGradient = {
//     background: isScrolled
//       ? "linear-gradient(to right, #08121c, #343f51, #0d141e)"
//       : "linear-gradient(to right, #08121c, #343f51, #0d141e)",
//     boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
//     transition: "all 0.3s ease",
//   };

//   const countryPickerGradient = {
//     background: "linear-gradient(to right, #203547 90%)",
//   };

//   const dropdownGradient = {
//     background: "linear-gradient(to bottom, #1e2b3d, #0e1925)",
//     boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)",
//   };

//   return (
//     <>

//       <header
//         className={`sticky top-0 z-50 transition-all duration-300 ${
//           isScrolled ? "shadow-lg" : "shadow-md"
//         }`}
//         style={mainHeaderGradient}
//       >
//          {["/register", "/signup"].includes(location.pathname) && <AbandonedCartBanner />}

//          <div
//         className={`text-white border-b border-gray-700  ${
//           isScrolled ? "hidden" : "block"
//         }`}
//         style={{ marginTop: marginTopStyle }}
//       >
//         <div
//           className="flex flex-col md:flex-row justify-between items-center gap-3 px-4 py-2"
//           style={topBarGradient}
//         >
//           <div className="flex flex-wrap items-center gap-4 text-sm w-full md:w-auto">
//             <div className="flex flex-wrap items-center gap-4 text-sm w-full md:w-auto">
//               <div className="flex items-center gap-2">
//                 <FaPhone className="text-gray-300" />
//                 {currentCountryContact?.phone ? (
//                   <a
//                     href={`tel:+${currentCountryContact.phone}`}
//                     className="text-gray-300 hover:text-white transition-colors cursor-pointer"
//                   >
//                     {currentCountryContact.phone}
//                   </a>
//                 ) : (
//                   <Link
//                     to="/contact-us"
//                     className="text-gray-300 hover:text-white transition-colors"
//                   >
//                     Contact Us
//                   </Link>
//                 )}
//               </div>
//               <div className="flex items-center gap-2">
//                 <FaEnvelope className="text-gray-300" />
//                 {currentCountryContact?.email ? (
//                   <a
//                     href={`mailto:${currentCountryContact.email}`}
//                     className="text-gray-300 hover:text-white transition-colors break-all"
//                   >
//                     {currentCountryContact.email}
//                   </a>
//                 ) : (
//                   <Link
//                     to="/contact-us"
//                     className="text-gray-300 hover:text-white transition-colors"
//                   >
//                     Contact Us
//                   </Link>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="flex flex-row items-center w-full md:w-auto gap-2 mt-2 md:mt-0">
//             <div
//               className="flex items-center gap-1 border border-gray-700 rounded-md px-2 py-1 text-sm flex-1 min-w-0"
//               style={countryPickerGradient}
//             >
//               <div className="flex-shrink-0">
//                 {country && countryToCodeMap[country] ? (
//                   <ReactCountryFlag
//                     countryCode={countryToCodeMap[country]}
//                     svg
//                     style={{ width: "1.2em", height: "1.2em" }}
//                   />
//                 ) : (
//                   <FaFlag className="text-gray-300" size={14} />
//                 )}
//               </div>
//               <select
//                 className="bg-transparent text-gray-300 hover:text-white outline-none text-sm appearance-none w-full overflow-hidden text-ellipsis pr-4 pl-3 truncate"
//                 style={{
//                   backgroundRepeat: "no-repeat",
//                   backgroundPosition: "right 0 center",
//                 }}
//                 value={country || ""}
//                 onChange={handleCountryChange}
//               >
//                 <option value="" className="bg-gray-800 text-white">
//                   Country
//                 </option>
//                 {countries.map((c) => (
//                   <option key={c} value={c} className="bg-gray-800 text-white">
//                     {c}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div
//               id="google_translate_element"
//               className="google-translate-container overflow-hidden whitespace-nowrap text-ellipsis"
//               ref={googleTranslateRef}
//             ></div>
//           </div>
//         </div>
//       </div>
//         <div className="container mx-auto flex justify-between items-center px-4 md:px-8 py-3">

//           <div className="flex items-center">
//             <Link
//               to="/"
//               className="flex items-center no-underline transition-transform hover:scale-105 duration-300"
//             >
//               <img
//                 src={logo}
//                 alt="Logo"
//                 className="rounded-md"
//                 style={{
//                   height: isScrolled ? "4rem" : "5rem",
//                   transform: `perspective(500px) rotateY(${isScrolled ? "0deg" : "15deg"}) scale(${isScrolled ? 1 : 1.1})`,
//                   transition: "all 0.3s ease",
//                   filter: isScrolled
//                     ? "none"
//                     : "drop-shadow(0 5px 5px rgba(0,0,0,0.2))",
//                   opacity: isScrolled ? 0.6 : 0.9,
//                 }}
//               />
//             </Link>
//           </div>

//           <nav className="hidden md:flex space-x-8 items-center">
//             <Link
//               to="/"
//               className={`text-lg font-medium uppercase tracking-wider relative group transition-colors ${
//                 location.pathname === "/"
//                   ? "text-blue-400"
//                   : "text-gray-300 hover:text-white"
//               }`}
//             >
//               <span>Home</span>
//               <span
//                 className={`absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-500 group-hover:w-full ${
//                   location.pathname === "/" ? "w-full" : ""
//                 }`}
//               ></span>
//             </Link>

//             <Link
//               to="/about-us"
//               className={`text-lg font-medium uppercase tracking-wider relative group transition-colors ${
//                 location.pathname === "/about-us"
//                   ? "text-blue-400"
//                   : "text-gray-300 hover:text-white"
//               }`}
//             >
//               <span>About</span>
//               <span
//                 className={`absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-500 group-hover:w-full ${
//                   location.pathname === "/about-us" ? "w-full" : ""
//                 }`}
//               ></span>
//             </Link>

//             <Link
//               to="/contact-us"
//               className={`text-lg font-medium uppercase tracking-wider relative group transition-colors ${
//                 location.pathname === "/contact-us"
//                   ? "text-blue-400"
//                   : "text-gray-300 hover:text-white"
//               }`}
//             >
//               <span>Contact</span>
//               <span
//                 className={`absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-500 group-hover:w-full ${
//                   location.pathname === "/contact-us" ? "w-full" : ""
//                 }`}
//               ></span>
//             </Link>
//             <Link
//               to="/Statistics"
//               className={`text-lg font-medium uppercase tracking-wider relative group transition-colors ${
//                 location.pathname === "/Statistics"
//                   ? "text-blue-400"
//                   : "text-gray-300 hover:text-white"
//               }`}
//             >
//               <span>Statistics</span>
//               <span
//                 className={`absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-500 group-hover:w-full ${
//                   location.pathname === "/Statistics" ? "w-full" : ""
//                 }`}
//               ></span>
//             </Link>
//          {(user?.userType === "advertiser" || user?.userType === "buyer") && (
//               <Link
//                 to="/our-products"
//                 className={`text-lg font-medium uppercase tracking-wider relative group transition-colors ${
//                   location.pathname === "/user-profile/our-products"
//                     ? "text-blue-400"
//                     : "text-gray-300 hover:text-white"
//                 }`}
//               >
//                 <span>Products</span>
//                 <span
//                   className={`absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-500 group-hover:w-full ${
//                     location.pathname === "/user-profile/our-products"
//                       ? "w-full"
//                       : ""
//                   }`}
//                 ></span>
//               </Link>
//             )}

//             {user ? (
//               <div className="flex justify-center items-center space-x-4 ml-4">
//                 {["buyer", "advertiser", "wrapper"].includes(
//                   user?.userType
//                 ) && (
//                   <Link
//                     to="/user-profile/cart"
//                     className="relative transition-transform hover:scale-110 duration-300"
//                   >
//                     <BsCart3
//                       className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
//                       size={22}
//                     />

//                     {itemCount > 0 && (
//                       <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
//                         {itemCount}
//                       </span>
//                     )}
//                   </Link>
//                 )}

//                 <Link
//                   to="/user-profile/notifications"
//                   className="relative transition-transform hover:scale-110 duration-300"
//                 >
//                   {unReadNotifications.length > 0 ? (
//                     <span className="absolute right-0 top-0 w-[18px] h-[18px] flex items-center justify-center bg-blue-500 rounded-full text-white text-xs font-bold">
//                       {unReadNotifications.length}
//                     </span>
//                   ) : null}
//                   <IoIosNotificationsOutline
//                     size={26}
//                     className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
//                   />
//                 </Link>

//                 <div className="relative">
//                   <img
//                     src={user?.profilePicture}
//                     alt="User Profile"
//                     className="w-9 h-9 rounded-full cursor-pointer transition-all hover:ring-2 hover:ring-blue-400 duration-300"
//                     onClick={() => setSidebarOpen(!sidebarOpen)}
//                     title="Click to Manage Profile (Login/Logout)"
//                     style={{
//                       boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
//                       border: "2px solid #3b82f6", // Highlight with a subtle border
//                     }}
//                   />
//                   {/*
//                   {sidebarOpen && (
//                     <div
//                       className="animate-fadeIn origin-top-right overflow-hidden absolute right-0 top-12 mt-2 z-50 w-48 rounded-md shadow-lg"
//                       style={dropdownGradient}
//                     >
//                       <nav className="py-1 [&_a]:transition-all [&_a]:duration-300">
//                         <Link
//                           to="/user-profile/profile"
//                           className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700"
//                           onClick={() => setSidebarOpen(false)}
//                         >
//                           Profile
//                         </Link>
//                         <Link
//                           to={
//                             user.userType === "seller"
//                               ? "/user-profile/manage-items"
//                               : "/user-profile/bids-items"
//                           }
//                           className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700"
//                           onClick={() => setSidebarOpen(false)}
//                         >
//                           {user.userType === "seller"
//                             ? "Manage Items"
//                             : "Bids Items"}
//                         </Link>
//                         <Link
//                           to="/user-profile/account-settings"
//                           className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700"
//                           onClick={() => setSidebarOpen(false)}
//                         >
//                           Account Settings
//                         </Link>
//                         <button
//                           onClick={() => {
//                             logoutHandle();
//                             setSidebarOpen(false);
//                           }}
//                           className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700"
//                         >
//                           Logout
//                         </button>
//                       </nav>
//                     </div>
//                   )} */}

//                   {sidebarOpen && (
//                      <div
//     className="profile-dropdown animate-fadeIn origin-top-right overflow-hidden absolute right-0 top-12 mt-2 z-50 w-48 rounded-md shadow-lg"
//     style={dropdownGradient}
//     onClick={(e) => e.stopPropagation()} // ⛔ Prevents click inside dropdown from closing it
//   >
//                       <nav className="py-1 [&_a]:transition-all [&_a]:duration-300">
//                         <Link
//                           to="/user-profile/profile"
//                           className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700"
//                           onClick={() => setSidebarOpen(false)}
//                         >
//                           Profile
//                         </Link>
//                         {user.userType === "seller" && (
//                           <Link
//                             to="/user-profile/manage-items"
//                             className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700"
//                             onClick={() => setSidebarOpen(false)}
//                           >
//                             Manage Items
//                           </Link>
//                         )}
//                         {user.userType === "fleetOwner" && (
//                           <Link
//                             to="/user-profile/add-auction"
//                             className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700"
//                             onClick={() => setSidebarOpen(false)}
//                           >
//                             Add Auction
//                           </Link>
//                         )}
//                         {(user.userType === "wrapper" ||
//                           user.userType === "advertiser" ||
//                           user.userType === "buyer") && (
//                           <Link
//                             to="/user-profile/bids-items"
//                             className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700"
//                             onClick={() => setSidebarOpen(false)}
//                           >
//                             Bids Items
//                           </Link>
//                         )}
//                         <Link
//                           to="/user-profile/account-settings"
//                           className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700"
//                           onClick={() => setSidebarOpen(false)}
//                         >
//                           Account Settings
//                         </Link>
//                         <button
//                           onClick={() => {
//                             logoutHandle();
//                             setSidebarOpen(false);
//                           }}
//                           className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700"
//                         >
//                           Logout
//                         </button>
//                       </nav>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <Link
//                 to="/login"
//                 className="text-lg font-medium uppercase tracking-wider text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-md border border-gray-600 hover:border-blue-400 hover:shadow-md hover:shadow-blue-400/20 duration-300"
//               >
//                 Sign In
//               </Link>
//             )}
//           </nav>

//           <button
//             className="md:hidden text-gray-300 hover:text-white focus:outline-none transition-transform hover:scale-110 duration-300"
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//           >
//             {mobileMenuOpen ? (
//               <FaTimes className="text-xl" />
//             ) : (
//               <FaBars className="text-xl" />
//             )}
//           </button>
//         </div>

//         {mobileMenuOpen && (
//           <div
//             className="md:hidden shadow-lg py-3 px-4 flex flex-col space-y-3"
//             style={{
//               background: "linear-gradient(to bottom, #1e2b3d, #0e1925)",
//               borderTop: "1px solid rgba(255,255,255,0.1)",
//             }}
//           >
//             <Link
//               to="/"
//               onClick={() => {
//                 setMobileMenuOpen(false);
//                 window.scrollTo(0, 0);
//               }}
//               className={`text-lg py-2 px-3 rounded transition-colors ${
//                 location.pathname === "/"
//                   ? "text-blue-400 font-medium"
//                   : "text-gray-300 hover:text-white"
//               }`}
//             >
//               Home
//             </Link>

//             <Link
//               to="/about-us"
//               onClick={() => {
//                 setMobileMenuOpen(false);
//                 window.scrollTo(0, 0);
//               }}
//               className={`text-lg py-2 px-3 rounded transition-colors ${
//                 location.pathname === "/about-us"
//                   ? "text-blue-400 font-medium"
//                   : "text-gray-300 hover:text-white"
//               }`}
//             >
//               About
//             </Link>

//             <Link
//               to="/contact-us"
//               onClick={() => {
//                 setMobileMenuOpen(false);
//                 window.scrollTo(0, 0);
//               }}
//               className={`text-lg py-2 px-3 rounded transition-colors ${
//                 location.pathname === "/contact-us"
//                   ? "text-blue-400 font-medium"
//                   : "text-gray-300 hover:text-white"
//               }`}
//             >
//               Contact
//             </Link>

//             {user && user.userType === "buyer" && (
//               <>
//                 <Link
//                   to="/our-products"
//                   onClick={() => {
//                     setMobileMenuOpen(false);
//                     window.scrollTo(0, 0);
//                   }}
//                   className={`text-lg py-2 px-3 rounded transition-colors ${
//                     location.pathname === "/our-products"
//                       ? "text-blue-400 font-medium"
//                       : "text-gray-300 hover:text-white"
//                   }`}
//                 >
//                   Products
//                 </Link>
//                 <Link
//                   to="/user-profile/cart"
//                   onClick={() => {
//                     setMobileMenuOpen(false);
//                     window.scrollTo(0, 0);
//                   }}
//                   className={`text-lg py-2 px-3 rounded transition-colors ${
//                     location.pathname === "/user-profile/cart"
//                       ? "text-blue-400 font-medium"
//                       : "text-gray-300 hover:text-white"
//                   }`}
//                 >
//                   Cart
//                 </Link>
//               </>
//             )}

//             {user && (
//               <div className="pt-2 border-t border-gray-700">
//                 <Link
//                   to="/user-profile/profile"
//                   onClick={() => {
//                     setMobileMenuOpen(false);
//                     window.scrollTo(0, 0);
//                   }}
//                   className="block text-lg py-2 px-3 rounded text-gray-300 hover:text-white transition-colors"
//                 >
//                   Profile
//                 </Link>
//                 <Link
//                   to={
//                     user.userType === "seller"
//                       ? "/user-profile/manage-items"
//                       : "/user-profile/bids-items"
//                   }
//                   onClick={() => {
//                     setMobileMenuOpen(false);
//                     window.scrollTo(0, 0);
//                   }}
//                   className="block text-lg py-2 px-3 rounded text-gray-300 hover:text-white transition-colors"
//                 >
//                   {user.userType === "seller" ? "Manage Items" : "Bids Items"}
//                 </Link>
//                 <Link
//                   to="/user-profile/account-settings"
//                   onClick={() => {
//                     setMobileMenuOpen(false);
//                     window.scrollTo(0, 0);
//                   }}
//                   className="block text-lg py-2 px-3 rounded text-gray-300 hover:text-white transition-colors"
//                 >
//                   Account Settings
//                 </Link>
//                 <button
//                   onClick={() => {
//                     logoutHandle();
//                     setMobileMenuOpen(false);
//                   }}
//                   className="block w-full text-left text-lg py-2 px-3 rounded text-gray-300 hover:text-white transition-colors"
//                 >
//                   Logout
//                 </button>
//               </div>
//             )}

//             {!user && (
//               <Link
//                 to="/login"
//                 onClick={() => {
//                   setMobileMenuOpen(false);
//                   window.scrollTo(0, 0);
//                 }}
//                 className="text-lg py-2 px-3 rounded text-center bg-gray-700 text-white hover:bg-blue-900 transition-colors"
//               >
//                 Sign In
//               </Link>
//             )}
//           </div>
//         )}
//       </header>
//     </>
//   );
// };

// export default Header;
