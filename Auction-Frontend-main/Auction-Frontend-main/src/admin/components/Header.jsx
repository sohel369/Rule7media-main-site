import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout, reset } from "../../store/auth/authSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaBars, FaTimes } from "react-icons/fa";
import NavSidebar from "./NavSidebar";
import logo from "../../assets/LOGO.png";

const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);

  const sidebarRef = useRef(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  let navigate = useNavigate();

  const closeNavbar = () => {
    setNavbarOpen(false);
  };

  const logoutHandle = () => {
    dispatch(logout());
    toast.success("Logout Successfully!");
    setSidebarOpen(false);
    dispatch(reset());
    navigate("/admin/login");
  };

  // ✅ Detect click outside sidebar -> close popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest("img") // so clicking the avatar toggles it normally
      ) {
        setSidebarOpen(false);
      }
    };

    // Add listener for clicks anywhere
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    // Cleanup on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // ✅ Also close popup when navigating or opening mobile navbar
  useEffect(() => {
    if (navbarOpen) setSidebarOpen(false);
  }, [navbarOpen]);

  return (
    <div className="admin-head flex justify-between items-center px-2 sm:px-14 bg-body-bg py-4 border-b border-border-info-color sticky top-0 z-10">
      <div className="flex items-center px-1 z-[1]">
        <Link to="/admin/users" className="no-underline">
          <img src={logo} alt="Logo" className="h-20" />
        </Link>
      </div>

      <div className="flex items-center cursor-pointer z-[1]">
        {user ? (
          <div className="flex justify-center items-center">
            <img
              src={user?.profilePicture}
              key={user.profilePicture}
              alt="user"
              className="w-10 h-10 rounded-full order-2 cursor-pointer"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />
            <Link
              onClick={() => setNavbarOpen(!navbarOpen)}
              className="text-white font-Roboto sm:hidden text-lg mx-3 order-3"
            >
              {navbarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </Link>
          </div>
        ) : (
          <>
            <Link
              to="/admin/login"
              className="bg-blue-500 no-underline font-Roboto text-base hover:bg-color-danger transition-all duration-150 text-white py-1 sm:py-2 sm:px-3 px-2 rounded-md text-md font-semibold"
            >
              Sign In
            </Link>
            <Link
              onClick={() => setNavbarOpen(!navbarOpen)}
              className="text-white font-Roboto sm:hidden text-lg mx-3 order-3 z-50"
            >
              {navbarOpen ? <FaTimes size={25} /> : <FaBars size={25} />}
            </Link>
          </>
        )}
      </div>

      {user && sidebarOpen && (
        <div
          ref={sidebarRef}
          className="animate-fadein rounded-xl origin-top-right mt-10 overflow-hidden absolute right-12 top-16 mt-[4px] bg-body-bg z-50 w-[250px]"
        >
          <nav className="pt-2 [&_a]:transition-all [&_a]:duration-100">
            <Link
              onClick={() => {
                logoutHandle();
                setSidebarOpen(false);
              }}
              className="block no-underline text-white font-Roboto text-lg py-2 px-7 hover:bg-theme-bg-light"
            >
              Logout
            </Link>
          </nav>
        </div>
      )}

      {navbarOpen && (
        <div className="fixed inset-0 top-[73px] z-50 bg-black/80 backdrop-blur-md sm:hidden flex flex-col justify-start overflow-y-auto p-4 animate-fadein">
          <NavSidebar closeNavbar={closeNavbar} />
        </div>
      )}
    </div>
  );
};

export default Header;
