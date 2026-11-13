import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { reset, logout } from "../../store/auth/authSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useSelector } from "react-redux";

import {
  FaUser,
  FaCirclePlus,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa6";
import { IoIosNotifications, IoMdSettings } from "react-icons/io";
import {
  FaYoutube,
  FaTrophy,
  FaChartBar,
  FaRegCreditCard,
  FaHandshake,
} from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoLogOutSharp, IoWalletOutline } from "react-icons/io5";
import {
  BiSolidCategory,
  BiArchive,
  BiSolidMemoryCard,
  BiSolidPrinter,
  BiTrash,
  BiFile,
  BiSolidNotepad
} from "react-icons/bi";
import {
  MdPersonAdd,
  MdLocationPin,
  MdPolicy,
  MdRequestPage,
  MdOutlineCheckCircle,
  MdLocalShipping,
  MdBackup,
  MdEmail,
} from "react-icons/md";
import { BiBarChart } from "react-icons/bi";
import { RiAuctionFill, RiFileTextLine } from "react-icons/ri";
import { getNotificationForUser } from "../../store/notification/notificationSlice";
import socket from "../../socket";

const Sidebar = ({ closeNavbar, isMobileDrawer = false }) => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLinkClick = (path) => {
    setActiveLink(path);
    if (closeNavbar) {
      closeNavbar();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const logInUser = JSON.parse(localStorage.getItem("user"));
  const { notifications } = useSelector((state) => state.notification);

  const unReadNotifications = notifications.filter(
    (notification) => notification.isRead === false,
  );

  useEffect(() => {
    if (logInUser) {
      dispatch(getNotificationForUser());
    }
    socket.on("newBidNotification", (data) => {
      socket.emit("joinAuction", logInUser?._id);
      dispatch(getNotificationForUser());
    });
  }, [location]);

  useEffect(() => {}, [user]);

  const logoutHandle = () => {
    dispatch(logout());
    toast.success("Logout Successfully!");
    dispatch(reset());
    if (closeNavbar) closeNavbar();
    navigate("/login");
  };

  // Check if current path is in settings section
  const settingsRoutes = [
    "/admin/categories",
    "/admin/vehicles",
    "/admin/VehicleWrapForm",
    "/admin/executive-member",
    "/admin/update-address",
    "/admin/privacy-policy",
    "/admin/terms",
    "/admin/cookie",
    "/admin/commission",
    "/admin/TopFleetAuctions",
    "/admin/Subscription-plans",
    "/admin/franchise",
    "/admin/backup",
    "/admin/dropcollections",
    "/admin/email-settings",
    "/admin/CpmTable",
  ];

  const isSettingsActive = settingsRoutes.includes(activeLink);

  useEffect(() => {
    if (isSettingsActive) {
      setSettingsOpen(true);
    }
  }, [isSettingsActive]);

  const containerClass = isMobileDrawer
    ? "w-full max-h-[80vh] overflow-y-auto"
    : "w-full hidden lg:block lg:sticky top-5 lg:h-screen lg:w-[25%] lg:min-w-[250px] lg:max-w-[280px]";

  return (
    <div className={containerClass}>
      <div className="text-white bg-theme-bg p-5 rounded-2xl h-full lg:h-screen overflow-y-auto scrollbar-hide border border-white/5">
        <ul className="flex flex-col gap-1 font-medium cursor-pointer">
          {/* Users */}
          <li>
            <Link
              className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer hover:pl-[20px] hover:text-theme-color hover:bg-theme transition-all duration-500 ${
                activeLink === "/admin/users"
                  ? "bg-theme-color hover:text-white"
                  : ""
              }`}
              to="/admin/users"
              onClick={() => handleLinkClick("/admin/users")}
            >
              <FaUser
                size={16}
                className={`text-theme-color transition-all duration-500 ${
                  activeLink === "/admin/users" ? " text-white" : ""
                }`}
              />
              Users
            </Link>
          </li>

          {/* Auctions */}
          <li>
            <Link
              className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer hover:pl-[20px] hover:text-theme-color hover:bg-theme transition-all duration-500 ${
                activeLink === "/admin/auctions"
                  ? "bg-theme-color hover:text-white"
                  : ""
              }`}
              to="/admin/auctions"
              onClick={() => handleLinkClick("/admin/auctions")}
            >
              <RiAuctionFill
                size={16}
                className={`text-theme-color transition-all duration-500 ${
                  activeLink === "/admin/auctions" ? " text-white" : ""
                }`}
              />
              Auctions
            </Link>
          </li>

          {/* Auction Winner */}
          <li>
            <Link
              to="/admin/auction-winner"
              className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer
         hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500
         ${activeLink === "/admin/auction-winner" ? "bg-theme-color text-white" : ""}`}
              onClick={() => handleLinkClick("/admin/auction-winner")}
            >
              <FaTrophy
                size={18}
                className={`text-theme-color transition-all duration-500
        ${activeLink === "/admin/auction-winner" ? "text-white" : ""}`}
              />
              Auction Winner
            </Link>
          </li>

          {/* Notifications */}
          <li>
            <Link
              to="/admin/notifications"
              className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer relative
    hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500
    ${activeLink === "/admin/notifications" ? "bg-theme-color text-white" : ""}`}
              onClick={() => handleLinkClick("/admin/notifications")}
            >
              <div className="relative">
                <IoIosNotifications
                  size={20}
                  className={`text-theme-color transition-all duration-500
        ${activeLink === "/admin/notifications" ? "text-white" : ""}`}
                />
                {unReadNotifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-[18px] h-[18px] flex items-center justify-center bg-red-500 rounded-full text-white text-xs font-bold">
                    {unReadNotifications.length}
                  </span>
                )}
              </div>
              <span>Notifications</span>
            </Link>
          </li>

          {/* Fleet Auction Approval */}
          <li>
            <Link
              to="/admin/FleetAuctionApproval"
              className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer relative
    hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500
    ${activeLink === "/admin/FleetAuctionApproval" ? "bg-theme-color text-white" : ""}`}
              onClick={() => handleLinkClick("/admin/FleetAuctionApproval")}
            >
              <div className="relative">
                <MdOutlineCheckCircle
                  size={20}
                  className={`text-theme-color transition-all duration-500
        ${activeLink === "/admin/FleetAuctionApproval" ? "text-white" : ""}`}
                />
              </div>
              <span>Fleet Auction Approval</span>
            </Link>
          </li>

          {/* Budget Requests */}
          <li>
            <Link
              to="/admin/budget-requests"
              className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer
      hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500
      ${activeLink === "/admin/budget-requests" ? "bg-theme-color text-white" : ""}`}
              onClick={() => handleLinkClick("/admin/budget-requests")}
            >
              <MdRequestPage
                size={18}
                className={`text-theme-color transition-all duration-500
        ${activeLink === "/admin/budget-requests" ? "text-white" : ""}`}
              />
              Budget Requests
            </Link>
          </li>

          {/* Orders */}
          <li>
            <Link
              to="/admin/orders"
              className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer 
      hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500 
      ${activeLink === "/admin/orders" ? "bg-theme-color hover:text-white" : ""}`}
              onClick={() => handleLinkClick("/admin/orders")}
            >
              <BiSolidMemoryCard
                size={18}
                className={`text-theme-color transition-all duration-500 
        ${activeLink === "/admin/orders" ? " text-white" : ""}`}
              />
              Orders
            </Link>
          </li>

          {/* Show CTR */}
          <li>
            <Link
              to="/admin/AdminCTRTable"
              className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer 
      hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500 
      ${activeLink === "/admin/AdminCTRTable" ? "bg-theme-color hover:text-white" : ""}`}
              onClick={() => handleLinkClick("/admin/AdminCTRTable")}
            >
              <BiBarChart
                size={18}
                className={`text-theme-color transition-all duration-500 
        ${activeLink === "/admin/AdminCTRTable" ? " text-white" : ""}`}
              />
              Show CTR
            </Link>
          </li>

          {/* Settings Section */}
          <li>
            <div
              className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500 ${
                isSettingsActive ? "bg-theme-color text-white" : ""
              }`}
              onClick={() => setSettingsOpen(!settingsOpen)}
            >
              <IoMdSettings
                size={18}
                className={`text-theme-color transition-all duration-500 ${
                  isSettingsActive ? "text-white" : ""
                }`}
              />
              <span className="flex-1">Settings</span>
              {settingsOpen ? (
                <FaChevronDown
                  size={12}
                  className={`transition-all duration-300 ${isSettingsActive ? "text-white" : "text-theme-color"}`}
                />
              ) : (
                <FaChevronRight
                  size={12}
                  className={`transition-all duration-300 ${isSettingsActive ? "text-white" : "text-theme-color"}`}
                />
              )}
            </div>

            {/* Settings Submenu */}
            {settingsOpen && (
              <ul className="ml-4 mt-1 space-y-1">
                <li>
                  <Link
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500 ${
                      activeLink === "/admin/categories"
                        ? "bg-theme-color hover:text-white"
                        : ""
                    }`}
                    to="/admin/categories"
                    onClick={() => handleLinkClick("/admin/categories")}
                  >
                    <BiSolidCategory
                      size={16}
                      className={`text-theme-color transition-all duration-500 ${
                        activeLink === "/admin/categories" ? " text-white" : ""
                      }`}
                    />
                    Category
                  </Link>
                </li>

                <li>
                  <Link
                    to="/admin/vehicles"
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer
                        hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500
                        ${activeLink === "/admin/vehicles" ? "bg-theme-color text-white" : ""}`}
                    onClick={() => handleLinkClick("/admin/vehicles")}
                  >
                    <FaCirclePlus
                      size={16}
                      className={`text-theme-color transition-all duration-500
      ${activeLink === "/admin/vehicles" ? "text-white" : ""}`}
                    />
                    Add Vehicle
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/VehicleWrapForm"
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer
                        hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500
                        ${activeLink === "/admin/VehicleWrapForm" ? "bg-theme-color text-white" : ""}`}
                    onClick={() => handleLinkClick("/admin/VehicleWrapForm")}
                  >
                    <MdLocalShipping
                      size={16}
                      className={`text-theme-color transition-all duration-500
      ${activeLink === "/admin/VehicleWrapForm" ? "text-white" : ""}`}
                    />
                    Add Wrapped Vehicle
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/franchise"
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer
                        hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500
                        ${activeLink === "/admin/franchise" ? "bg-theme-color text-white" : ""}`}
                    onClick={() => handleLinkClick("/admin/franchise")}
                  >
                    <FaHandshake
                      size={16}
                      className={`text-theme-color transition-all duration-500
      ${activeLink === "/admin/franchise" ? "text-white" : ""}`}
                    />
                    Manage Franchise & kit requests
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/subscription-plans"
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer
                        hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500
                        ${activeLink === "/admin/subscription-plans" ? "bg-theme-color text-white" : ""}`}
                    onClick={() => handleLinkClick("/admin/subscription-plans")}
                  >
                    <FaRegCreditCard
                      size={16}
                      className={`text-theme-color transition-all duration-500
      ${activeLink === "/admin/subscription-plans" ? "text-white" : ""}`}
                    />
                    Subscription Plans
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/TopFleetAuctions"
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer
        hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500
        ${activeLink === "/admin/TopFleetAuctions" ? "bg-theme-color text-white" : ""}`}
                    onClick={() => handleLinkClick("/admin/TopFleetAuctions")}
                  >
                    <FaTrophy
                      size={16}
                      className={`text-theme-color transition-all duration-500
        ${activeLink === "/admin/TopFleetAuctions" ? "text-white" : ""}`}
                    />
                    Top Fleet Auctions
                  </Link>
                </li>

                <li>
                  <Link
                    to="/admin/executive-member"
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer 
    hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500 
    ${activeLink === "/admin/executive-member" ? "bg-theme-color text-white" : ""}`}
                    onClick={() => handleLinkClick("/admin/executive-member")}
                  >
                    <MdPersonAdd
                      size={16}
                      className={`text-theme-color transition-all duration-500 
      ${activeLink === "/admin/executive-member" ? "text-white" : ""}`}
                    />
                    Add Executive Member
                  </Link>
                </li>

                <li>
                  <Link
                    to="/admin/commission"
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer 
    hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500 
    ${activeLink === "/admin/commission" ? "bg-theme-color hover:text-white" : ""}`}
                    onClick={() => handleLinkClick("/admin/commission")}
                  >
                    <BiSolidMemoryCard
                      size={16}
                      className={`text-theme-color transition-all duration-500 
      ${activeLink === "/admin/commission" ? "text-white" : ""}`}
                    />
                    Add Commission
                  </Link>
                </li>

                <li>
                  <Link
                    to="/admin/update-address"
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer 
    hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500 
    ${activeLink === "/admin/update-address" ? "bg-theme-color text-white" : ""}`}
                    onClick={() => handleLinkClick("/admin/update-address")}
                  >
                    <MdLocationPin
                      size={16}
                      className={`text-theme-color transition-all duration-500 
      ${activeLink === "/admin/update-address" ? "text-white" : ""}`}
                    />
                    Add Address
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/Statistics"
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer 
    hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500 
    ${activeLink === "/admin/Statistics" ? "bg-theme-color text-white" : ""}`}
                    onClick={() => handleLinkClick("/admin/Statistics")}
                  >
                    <FaYoutube
                      size={16}
                      className={`text-theme-color transition-all duration-500 
      ${activeLink === "/admin/Statistics" ? "text-white" : ""}`}
                    />
                    Explainer videos
                  </Link>
                </li>
 <li>
                  <Link
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500 ${
                      activeLink === "/admin/media-kit"
                        ? "bg-theme-color hover:text-white"
                        : ""
                    }`}
                    to="/admin/media-kit"
                    onClick={() => handleLinkClick("/admin/media-kit")}
                  >
                    <BiFile
                      size={16}
                      className={`text-theme-color transition-all duration-500 ${
                        activeLink === "/admin/media-kit" ? " text-white" : ""
                      }`}
                    />
                    Media Kit
                  </Link>
                </li>
                 <li>
        <Link
          className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500 ${
            activeLink === "/admin/blogs" ? "bg-theme-color hover:text-white" : ""
          }`}
          to="/admin/blogs"
          onClick={() => handleLinkClick("/admin/blogs")}
        >
          <BiSolidNotepad
            size={16}
            className={`text-theme-color transition-all duration-500 ${
              activeLink === "/admin/blogs" ? " text-white" : ""
            }`}
          />
          Blog Management
        </Link>
      </li>

                <li>
                  <Link
                    to="/admin/CpmTable"
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer 
    hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500 
    ${activeLink === "/admin/CpmTable" ? "bg-theme-color text-white" : ""}`}
                    onClick={() => handleLinkClick("/admin/CpmTable")}
                  >
                    <FaChartBar
                      size={16}
                      className={`text-theme-color transition-all duration-500 
      ${activeLink === "/admin/CpmTable" ? "text-white" : ""}`}
                    />
                    CPM Table
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/privacy-policy"
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer 
    hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500 
    ${activeLink === "/admin/privacy-policy" ? "bg-theme-color text-white" : ""}`}
                    onClick={() => handleLinkClick("/admin/privacy-policy")}
                  >
                    <MdPolicy
                      size={16}
                      className={`text-theme-color transition-all duration-500 
      ${activeLink === "/admin/privacy-policy" ? "text-white" : ""}`}
                    />
                    Privacy Policies
                  </Link>
                </li>

                <li>
                  <Link
                    to="/admin/terms"
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer 
      hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500 
      ${activeLink === "/admin/terms" ? "bg-theme-color text-white" : ""}`}
                    onClick={() => handleLinkClick("/admin/terms")}
                  >
                    <RiFileTextLine
                      size={16}
                      className={`text-theme-color transition-all duration-500 
        ${activeLink === "/admin/terms" ? "text-white" : ""}`}
                    />
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/cookie"
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer 
      hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500 
      ${activeLink === "/admin/cookie" ? "bg-theme-color text-white" : ""}`}
                    onClick={() => handleLinkClick("/admin/cookie")}
                  >
                    <RiFileTextLine
                      size={16}
                      className={`text-theme-color transition-all duration-500 
        ${activeLink === "/admin/cookie" ? "text-white" : ""}`}
                    />
                    Privacy Cookie
                  </Link>
                </li>
                <li>
                  <Link
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500 ${
                      activeLink === "/admin/backup"
                        ? "bg-theme-color hover:text-white"
                        : ""
                    }`}
                    to="/admin/backup"
                    onClick={() => handleLinkClick("/admin/backup")}
                  >
                    <BiArchive
                      size={16}
                      className={`text-theme-color transition-all duration-500 ${
                        activeLink === "/admin/backup" ? " text-white" : ""
                      }`}
                    />
                    Backup Manager
                  </Link>
                </li>
                <li>
                  <Link
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500 ${
                      activeLink === "/admin/dropcollections"
                        ? "bg-theme-color hover:text-white"
                        : ""
                    }`}
                    to="/admin/dropcollections"
                    onClick={() => handleLinkClick("/admin/dropcollections")}
                  >
                    <BiTrash
                      size={16}
                      className={`text-theme-color transition-all duration-500 ${
                        activeLink === "/admin/dropcollections" ? " text-white" : ""
                      }`}
                    />
                    Drop Collection Data
                  </Link>
                </li>
                <li>
                  <Link
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer hover:pl-[20px] hover:text-white hover:bg-theme transition-all duration-500 ${
                      activeLink === "/admin/email-settings"
                        ? "bg-theme-color hover:text-white"
                        : ""
                    }`}
                    to="/admin/email-settings"
                    onClick={() => handleLinkClick("/admin/email-settings")}
                  >
                    <MdEmail
                      size={16}
                      className={`text-theme-color transition-all duration-500 ${
                        activeLink === "/admin/email-settings" ? " text-white" : ""
                      }`}
                    />
                    Email Settings
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Logout */}
          <li>
            <Link
              className="group flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer hover:pl-[20px] hover:text-red-800 transition-all duration-500"
              onClick={() => {
                logoutHandle();
              }}
            >
              <IoLogOutSharp
                size={18}
                className="text-theme-color group-hover:text-red-800 transition-all duration-500"
              />
              <span>Log Out</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
