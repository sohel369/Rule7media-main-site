import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { reset, logout } from "../store/auth/authSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUser,
  FaEdit,
  FaBars,
  FaTimes,
  FaPlusCircle,
  FaShoppingCart,
  FaBoxOpen,
  FaMoneyBillWave,
  FaHome,
  FaListAlt,
  FaSearch 
} from "react-icons/fa";

import { BiSolidMemoryCard } from "react-icons/bi";
import {
  IoIosNotifications,
  IoMdSettings,
  IoIosListBox,
  IoIosCart,
  IoMdCloseCircle,
} from "react-icons/io";
import { MdLocalShipping, MdCampaign, MdAnimation } from "react-icons/md";
import {
  RiLockPasswordFill,
  RiImageAddLine,
  RiPieChartLine,
} from "react-icons/ri";
import { IoLogOutSharp, IoWalletOutline } from "react-icons/io5";

const Sidebar = () => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname, user]);

  const logoutHandle = () => {
    dispatch(logout());
    toast.success("Logout Successfully!");
    dispatch(reset());
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const renderNavContent = () => (
    <div className="space-y-1 py-2">
      <p className="text-blue-200 text-xs uppercase tracking-wider px-3 mb-1">
        Main
      </p>

      <NavItem
        to="/user-profile/profile"
        icon={<FaUser size={18} />}
        label="Profile"
        activeLink={activeLink}
        setActiveLink={setActiveLink}
        closeMobileMenu={closeMobileMenu}
      />
      <NavItem
        to="/user-profile/search"
        icon={<FaSearch size={18} />}
        label="Search Marketplace"
        activeLink={activeLink}
        setActiveLink={setActiveLink}
        closeMobileMenu={closeMobileMenu}
      />
      {user?.userType === "fleetOwner" && (
        <>
          <NavItem
            to="/user-profile/add-auction"
            icon={<MdLocalShipping size={18} />}
            label="Add Auction"
            activeLink={activeLink}
            setActiveLink={setActiveLink}
            closeMobileMenu={closeMobileMenu}
          />

          <NavItem
            to="/user-profile/add-vehicle-dimensions"
            icon={<MdLocalShipping size={18} />}
            label="Vehicle Management"
            activeLink={activeLink}
            setActiveLink={setActiveLink}
            closeMobileMenu={closeMobileMenu}
          />
        </>
      )}

      {user?.userType === "seller" && (
        <>
          <div className="pt-4">
            <p className="text-blue-200 text-xs uppercase tracking-wider px-3 mb-1">
              Marketing Tools
            </p>

            <NavItem
              to="/user-profile/manage-items"
              icon={<FaEdit size={18} />}
              label="Manage Ads"
              activeLink={activeLink}
              setActiveLink={setActiveLink}
              closeMobileMenu={closeMobileMenu}
            />

            <NavItem
              to="/user-profile/create-auction"
              icon={<FaPlusCircle size={18} />}
              label="Create Ad"
              activeLink={activeLink}
              setActiveLink={setActiveLink}
              closeMobileMenu={closeMobileMenu}
            />
          </div>
        </>
      )}
      {(user?.userType === "fleetowner" ||
        user?.userType === "fleetOwner") && (
        <NavItem
          to="/user-profile/manage-fleetauction"
          icon={<MdLocalShipping size={18} />}
          label="Manage Auctions"
          activeLink={activeLink}
          setActiveLink={setActiveLink}
          closeMobileMenu={closeMobileMenu}
        />
      )}

      <div className="pt-4">
        <p className="text-blue-200 text-xs uppercase tracking-wider px-3 mb-1">
          Activity
        </p>
        {["buyer", "advertiser"].includes(user?.userType) && (
          <>
            <NavItem
              to="/user-profile/bids-items"
              icon={<IoIosListBox size={18} />}
              label="My Bids"
              activeLink={activeLink}
              setActiveLink={setActiveLink}
              closeMobileMenu={closeMobileMenu}
            />
            <NavItem
              to="/user-profile/create-campaign"
              icon={<MdCampaign size={18} />}
              label="Create Campaign"
              activeLink={activeLink}
              setActiveLink={setActiveLink}
              closeMobileMenu={closeMobileMenu}
            />
            <NavItem
              to="/user-profile/my-campaign"
              icon={<FaListAlt size={18} />}
              label="My Campaign"
              activeLink={activeLink}
              setActiveLink={setActiveLink}
              closeMobileMenu={closeMobileMenu}
            />
            <NavItem
              to="/user-profile/myorder"
              icon={<IoIosCart size={18} />}
              label="My Orders"
              activeLink={activeLink}
              setActiveLink={setActiveLink}
              closeMobileMenu={closeMobileMenu}
            />
          </>
        )}
        {["wrapper"].includes(user?.userType) && (
          <>
            <NavItem
              to="/user-profile/bids-items"
              icon={<IoIosListBox size={18} />}
              label="My Bids"
              activeLink={activeLink}
              setActiveLink={setActiveLink}
              closeMobileMenu={closeMobileMenu}
            />
            <NavItem
              to="/user-profile/wrapper-orders"
              icon={<IoIosCart size={18} />}
              label="My Orders"
              activeLink={activeLink}
              setActiveLink={setActiveLink}
              closeMobileMenu={closeMobileMenu}
            />
          </>
        )}
        {["seller"].includes(user?.userType) && (
          <>
            <NavItem
              to="/user-profile/myorder"
              icon={<IoIosCart size={18} />}
              label="My Orders"
              activeLink={activeLink}
              setActiveLink={setActiveLink}
              closeMobileMenu={closeMobileMenu}
            />
          </>
        )}
        {user?.userType === "fleetOwner" && (
          <NavItem
            to="/user-profile/bids-items"
            icon={<IoIosListBox size={18} />}
            label="My Bids"
            activeLink={activeLink}
            setActiveLink={setActiveLink}
            closeMobileMenu={closeMobileMenu}
          />
        )}
      </div>

      <div className="pt-4">
        <p className="text-blue-200 text-xs uppercase tracking-wider px-3 mb-1">
          Settings
        </p>

        <NavItem
          to="/user-profile/account-settings"
          icon={<IoMdSettings size={18} />}
          label="Account Settings"
          activeLink={activeLink}
          setActiveLink={setActiveLink}
          closeMobileMenu={closeMobileMenu}
        />
        <NavItem
          to="/user-profile/change-password"
          icon={<RiLockPasswordFill size={18} />}
          label="Change Password"
          activeLink={activeLink}
          setActiveLink={setActiveLink}
          closeMobileMenu={closeMobileMenu}
        />
        <NavItem
          to="/user-profile/notifications"
          icon={<IoIosNotifications size={18} />}
          label="Notifications"
          activeLink={activeLink}
          setActiveLink={setActiveLink}
          closeMobileMenu={closeMobileMenu}
        />
        <NavItem
          to="/user-profile/payment-method"
          icon={<IoWalletOutline size={18} />}
          label="Payment Method"
          activeLink={activeLink}
          setActiveLink={setActiveLink}
          closeMobileMenu={closeMobileMenu}
        />

        {user?.userType === "seller" && (
          <NavItem
            to="/user-profile/budget-request"
            icon={<FaMoneyBillWave size={18} />}
            label="Budget Requests"
            activeLink={activeLink}
            setActiveLink={setActiveLink}
            closeMobileMenu={closeMobileMenu}
          />
        )}

        {user?.userType === "fleetOwner" && (
          <NavItem
            to="/user-profile/fleet-budget-request"
            icon={<FaMoneyBillWave size={18} />}
            label="Budget Requests"
            activeLink={activeLink}
            setActiveLink={setActiveLink}
            closeMobileMenu={closeMobileMenu}
          />
        )}
      </div>

      <div className="border-t border-white/20 mt-6 pt-4">
        <button
          className="flex items-center w-full gap-3 py-3 px-4 rounded-lg text-white hover:bg-red-500/30 transition-all duration-300"
          onClick={() => {
            closeMobileMenu();
            logoutHandle();
          }}
        >
          <IoLogOutSharp size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Navigation Toggle Bar (Doesn't block site header) */}
      <div className="lg:hidden w-full mb-3 flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <FaUser size={14} />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Dashboard Menu</p>
            <p className="text-[10px] text-slate-400">
              {user?.firstName ? `${user.firstName} (${user.userType || "Member"})` : "Select a feature"}
            </p>
          </div>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all"
        >
          {isMobileMenuOpen ? <FaTimes size={14} /> : <FaBars size={14} />}
          <span>{isMobileMenuOpen ? "Close" : "Menu"}</span>
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden animate-fadein"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Slide-Out Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-gradient-to-b from-[#08121C] via-[#1e293b] to-[#0D141E] p-4 shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              R7
            </div>
            <span className="font-bold text-sm text-white">Dashboard</span>
          </div>
          <button
            onClick={closeMobileMenu}
            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-slate-300 hover:text-white"
          >
            <FaTimes size={16} />
          </button>
        </div>
        {renderNavContent()}
      </div>

      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block lg:sticky top-[120px] left-0 h-full flex-none basis-[18rem] w-72">
        <div className="w-full px-4 rounded-2xl bg-gradient-to-b from-[#08121C] via-[#343F51] to-[#0D141E] overflow-y-auto scrollbar-hide border border-white/5 shadow-xl">
          {renderNavContent()}
        </div>
      </div>
    </>
  );
};

// NavItem Component for cleaner code
const NavItem = ({
  to,
  icon,
  label,
  activeLink,
  setActiveLink,
  closeMobileMenu,
}) => {
  // Agar to undefined hai toh return null
  if (!to) return null;

  return (
    <Link
      className={`flex items-center gap-3 py-2.5 px-4 rounded-lg transition-all duration-300 ${
        activeLink === to
          ? "bg-white text-blue-700 font-medium shadow-md"
          : "text-white hover:bg-white/10"
      }`}
      to={to}
      onClick={() => {
        setActiveLink(to);
        if (closeMobileMenu) closeMobileMenu();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      <span className={activeLink === to ? "text-blue-700" : "text-blue-200"}>
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
};

export default Sidebar;
