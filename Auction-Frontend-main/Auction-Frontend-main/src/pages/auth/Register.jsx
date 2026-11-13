import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  FaSpinner,
  FaUser,
  FaBriefcase,
  FaTruck,
  FaStore,
  FaShoppingCart,
  FaPalette,
  FaCheckCircle,
} from "react-icons/fa";
import {
  Clapperboard,
  
} from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import { register, reset } from "../../store/auth/authSlice";
import logo from "../../assets/LOGO.png";
import AdvertiserForm from "./AdvertiserForm";
import FleetOwnerForm from "./FleetOwnerForm";
import WrappingShopForm from "./WrappingShopForm";
import { BiCurrentLocation } from "react-icons/bi";
import _ from "lodash";
import { allCountries } from "country-telephone-data";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import axios from "axios";
import AddressSelector from "../../components/AddressSelector";
import { Country } from "country-state-city";
import CountryPhoneSelector from "../../components/PhoneInputWithCountry";
import CountrySpecificZipCode from "../../components/CountrySpecificZipCode";
import Header from "../../components/Header";
const Register = () => {
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    firstName: "",
    lastname: "",
    email: "",
    password: "",
    position: "",
    company: "",
    telephoneAreaCode: "91",
    telephoneNumber: "",
    state: "",
    country: "",
    city: "",
    postalCode: "",
    userType: "",
    location: {
      name: "",
      zip: "",
      latitude: null,
      longitude: null,
    },
  });

  const [errors, setErrors] = useState({});
  const [dynamicFormData, setDynamicFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countryPhoneCode, setCountryPhoneCode] = useState("44");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(true);
  const [selectedRole, setSelectedRole] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [phoneError, setPhoneError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth,
  );
  useEffect(() => {
    const role = searchParams.get("role");

    if (role && roleConfigs[role]) {
      setSelectedRole(role);

      const userTypeValue = roleConfigs[role]?.userTypeValue || role;

      setFormData((prev) => ({
        ...prev,
        userType: userTypeValue,
      }));

      setShowRoleModal(false);
      setCurrentStep(2);
    }
  }, []);

  const roleConfigs = {
    advertiser: {
      icon: <FaBriefcase className="text-blue-500 text-2xl" />,
      title: "Buyer or Marketing Executive",
      description: "Promote your Brand, Products or Services",
      hasCustomForm: true,
      userTypeValue: "advertiser",
    },
    "fleet-owner": {
      icon: <FaTruck className="text-green-500 text-2xl" />,
      title: "Vehicle Owner or Fleet Manager",
      description: "Manage your Vehicle Availability and Revenue",
      hasCustomForm: true,
      userTypeValue: "fleet",
    },
    "wrapping-shop": {
      icon: <FaPalette className="text-purple-500 text-2xl" />,
      title: "Vehicle Wrapping Business",
      description: "Promate your Vehicle Wrapping services",
      hasCustomForm: true,
      userTypeValue: "wrapping",
    },
    seller: {
      icon: <FaStore className="text-orange-500 text-2xl" />,
      title: "Ancillary Advertiser",
      description: "Promote vehicle related products or services",
      hasCustomForm: false,
      userTypeValue: "seller",
    },
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRoleSelection = (role) => {
    setSelectedRole(role);

    const userTypeValue = roleConfigs[role]?.userTypeValue || role;

    setFormData((prev) => ({
      ...prev,
      userType: userTypeValue,
    }));

    setShowRoleModal(false);
    setCurrentStep(2);

    if (role === "advertiser") {
      navigate("/BuyerMarketingExecutive");
    } else if (role === "fleet-owner") {
      navigate("/VehicleOwner");
    } else if (role === "wrapping-shop") {
      navigate("/WrapperLandingPage");
    } else if (role === "seller") {
      navigate("/AncillaryAdvertisers");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Registration successful", { autoClose: 1000 });
      setShowConfirmation(true);
      dispatch(reset());
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } else if (isError) {
      toast.error(message, { autoClose: 1000 });
      dispatch(reset());
    }
  }, [isSuccess, isError, message, dispatch, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error("Please select a user type", { autoClose: 1000 });
      setShowRoleModal(true);
      return;
    }
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email format is invalid", { autoClose: 1000 });
      return;
    }
    if (!passwordRegex.test(formData.password)) {
      toast.error(
        "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character",
        { autoClose: 1000 },
      );
      return;
    }
    const userTypeValue =
      roleConfigs[selectedRole]?.userTypeValue || selectedRole;
    const completeFormData = {
      ...formData,
      ...dynamicFormData,
      userType: userTypeValue,
    };
    setCurrentStep(3);
    setIsSubmitted(true);
    try {
      await dispatch(register(completeFormData)).unwrap();
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };
  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, telephoneNumber: value }));

    // Validate phone number (7-15 digits)
    if (!/^\d{7,15}$/.test(value) && value.length > 0) {
      setPhoneError("Please enter a valid phone number (7-15 digits)");
    } else {
      setPhoneError("");
    }
  };

  // Handle country change
  const handleCountryChange = (countryCode, phoneCode) => {
    setFormData((prev) => ({
      ...prev,
      telephoneAreaCode: phoneCode,
      country: countryCode,
    }));
  };
  const renderRoleSpecificForm = () => {
    if (!selectedRole || !roleConfigs[selectedRole]?.hasCustomForm) return null;
    const userTypeValue =
      roleConfigs[selectedRole]?.userTypeValue || selectedRole;
    const mergedFormData = {
      ...formData,
      ...dynamicFormData,
      userType: userTypeValue,
    };
    switch (selectedRole) {
      case "advertiser":
        return (
          <AdvertiserForm
            formData={mergedFormData}
            setFormData={setDynamicFormData}
            isLoading={isLoading}
          />
        );
      case "fleet-owner":
        return (
          <FleetOwnerForm
            formData={mergedFormData}
            setFormData={setDynamicFormData}
          />
        );
      case "wrapping-shop":
        return (
          <WrappingShopForm
            formData={mergedFormData}
            setFormData={setDynamicFormData}
          />
        );
      default:
        return null;
    }
  };

  const shouldShowDefaultForm = () => {
    return (
      !selectedRole ||
      ["buyer", "seller"].includes(selectedRole) ||
      !roleConfigs[selectedRole]?.hasCustomForm
    );
  };

  const AbandonedCartBanner = () => (
    <div className="fixed top-0 left-0 w-full bg-gradient-to-r from-red-600 to-orange-600 text-white p-3 z-[200] shadow-lg">
      <div className="container mx-auto text-center">
        <p className="text-sm md:text-base font-semibold">
          Don't miss out! Complete your registration to unlock exclusive
          benefits and opportunities.
        </p>
      </div>
    </div>
  );

  const SuccessConfirmation = () => (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-[300] flex justify-center items-center p-4">
      <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <FaCheckCircle className="text-6xl text-white mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">
          Registration Successful!
        </h2>
        <p className="text-green-100 mb-6">
          Thank you for joining our platform. You will be redirected to login
          shortly.
        </p>
        <div className="animate-pulse">
          <div className="bg-white bg-opacity-20 rounded-full h-2 mb-2">
            <div
              className="bg-white h-2 rounded-full"
              style={{ width: "100%" }}
            ></div>
          </div>
          <p className="text-sm text-green-100">Redirecting...</p>
        </div>
      </div>
    </div>
  );

  const StepProgress = () => (
    <div className="flex justify-center mb-6">
      <div className="flex items-center space-x-4">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-blue-500 text-white" : "bg-gray-300"}`}
        >
          1
        </div>
        <div
          className={`w-16 h-1 ${currentStep >= 2 ? "bg-blue-500" : "bg-gray-300"}`}
        ></div>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-blue-500 text-white" : "bg-gray-300"}`}
        >
          2
        </div>
        <div
          className={`w-16 h-1 ${currentStep >= 3 ? "bg-blue-500" : "bg-gray-300"}`}
        ></div>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-green-500 text-white" : "bg-gray-300"}`}
        >
          3
        </div>
      </div>
    </div>
  );

  const benefits = [
    {
      title: "Boost Employee Satisfaction",
      description:
        "Operators of branded vehicles report higher job satisfaction, reducing turnover and saving you recruitment costs!",
      cta: "Don’t miss out on a happier workforce!",
    },
    {
      title: "Deter Theft, Protect Assets",
      description:
        "Wrapped vehicles are less likely to be stolen, ensuring your fleet stays secure and operational.",
      cta: "Secure your fleet today!",
    },
    {
      title: "Increase Resale Value",
      description:
        "Vinyl wraps protect paintwork from damage, boosting resale value and maximizing your ROI!",
      cta: "Profit more when you sell!",
    },
    {
      title: "Lower Insurance Costs",
      description:
        "Brightly wrapped vehicles have fewer collisions, leading to lower insurance premiums and more savings!",
      cta: "Save on insurance now!",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % benefits.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [benefits.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % benefits.length);
  };
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + benefits.length) % benefits.length);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debounceRef.current(value);
  };

  const handleLocationSelect = (suggestion) => {
    const address = suggestion.address;
    const locationData = {
      name: suggestion.display_name,
      zip: address.postcode || "",
      latitude: parseFloat(suggestion.lat) || null,
      longitude: parseFloat(suggestion.lon) || null,
    };

    setFormData((prev) => ({
      ...prev,
      city: address.city || address.town || address.village || "",
      state: address.state || "",
      country: address.country || "",
      postalCode: address.postcode || "",
      location: locationData,
    }));

    const foundCountry = allCountries.find(
      (c) => c.name.toLowerCase() === (address.country || "").toLowerCase(),
    );
    if (foundCountry) {
      const countryObj = Country.getAllCountries().find(
        (c) => c.isoCode === foundCountry.iso2.toUpperCase(),
      );
      if (countryObj) {
        updatePhoneCode(countryObj.isoCode);
      }
    }

    setQuery(suggestion.display_name);
    setSuggestions([]);
  };

  const debounceRef = useRef(
    _.debounce(async (query) => {
      if (!query) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5`,
        );
        setSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
      }
    }, 1000),
  );

  const getCurrentLocation = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
          );
          const data = response.data;
          const address = data.address;
          const locationData = {
            name: data.display_name,
            zip: address.postcode || "",
            latitude: latitude,
            longitude: longitude,
          };

          setFormData((prevData) => ({
            ...prevData,
            city: address.city || address.town || address.village || "",
            state: address.state || "",
            country: address.country || "",
            postalCode: address.postcode || "",
            location: locationData,
          }));

          const foundCountry = allCountries.find(
            (c) =>
              c.name.toLowerCase() === (address.country || "").toLowerCase(),
          );
          if (foundCountry) {
            const countryObj = Country.getAllCountries().find(
              (c) => c.isoCode === foundCountry.iso2.toUpperCase(),
            );
            if (countryObj) {
              updatePhoneCode(countryObj.isoCode);
            }
          }

          setQuery(data.display_name);
          setLoading(false);
        } catch (error) {
          setLoading(false);
          console.error("Error fetching current location:", error);
        }
      });
    }
  };

  const updatePhoneCode = (isoCode) => {
    const country = allCountries.find((c) => c.iso2 === isoCode);
    const code = country ? country.dialCode.replace("+", "") : "91";
    setCountryPhoneCode(code);
    setFormData((prev) => ({ ...prev, telephoneAreaCode: code }));
  };

  return (
    <>
      <Header />
      <div className="flex min-h-screen w-full items-center justify-center bg-black text-[#7386a8] py-10">
        {showConfirmation && <SuccessConfirmation />}
        {currentStep > 1 && !isSubmitted}

        {showRoleModal && (
          <div className="fixed inset-0 bg-gray-900  z-[100] flex justify-center items-center p-4 overflow-y-auto">
            <div className="bg-black rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-2xl border border-gray-800">
              <div className="text-center mb-6">
                <FaUser className="text-4xl text-gray-400 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  Choose Your Role
                </h2>
                <p className="text-gray-400">
                  Select the option that best describes you
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(roleConfigs).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => handleRoleSelection(key)}
                    className="group p-5 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all transform hover:scale-105"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-gray-700 rounded-md group-hover:bg-gray-600">
                        {config.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-gray-300">
                          {config.title}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {config.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* <div className="flex w-[98%] flex-col items-center justify-center rounded-xl bg-[#071B36] py-10 sm:w-[90%] lg:w-[80%] xl:w-[70%] sm:px-6
"> */}
        {/* <div className="flex w-[55%] flex-col items-center justify-center rounded-xl bg-[#071B36] py-10  sm:px-6"> */}
        <div className="flex w-[90%] flex-col items-center justify-center rounded-xl bg-[#071B36] py-10 sm:w-3/4 lg:w-2/3 xl:w-1/2 sm:px-6">
  <div className="group flex items-center gap-3 mb-4 cursor-pointer">
  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200 transition-transform duration-300 group-hover:rotate-12">
    <Clapperboard className="w-7 h-7" />
  </div>

  <span className="text-3xl font-extrabold tracking-tight text-white">
    Rule7<span className="text-red-600">Media</span>
  </span>
</div>

            
          <p className="text-xl my-4">Create your new account</p>
          <StepProgress />
          {selectedRole && (
            <div className="text-center mb-4">
              <p className="text-blue-400 mb-2">
                Selected Role:{" "}
                {roleConfigs[selectedRole]?.title || "Not Selected"}
              </p>
              <button
                onClick={() => setShowRoleModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Change Role
              </button>
            </div>
          )}
          <p className="my-4 h-[1px] w-[80%] bg-[#747d9340]"></p>

          {shouldShowDefaultForm() && (
            <form onSubmit={handleRegister} className="w-full mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="my-2 block">First Name</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full p-3 rounded bg-[#0E294D] text-white border border-gray-600 focus:border-blue-500 transition-colors"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="my-2 block">Last Name</label>
                  <input
                    type="text"
                    placeholder="Your Last Name"
                    className="w-full p-3 rounded bg-[#0E294D] text-white border border-gray-600 focus:border-blue-500 transition-colors"
                    value={formData.lastname}
                    onChange={(e) =>
                      setFormData({ ...formData, lastname: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="my-2 block">Email Address</label>
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full p-3 rounded bg-[#0E294D] text-white border border-gray-600 focus:border-blue-500 transition-colors"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="relative">
                  <label className="my-2 block">Password</label>
                  <div className="relative w-full">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Your Password"
                      className="w-full p-3 pr-12 rounded bg-[#0E294D] text-white border border-gray-600 focus:border-blue-500 transition-colors"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white focus:outline-none"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <AiOutlineEyeInvisible size={22} />
                      ) : (
                        <AiOutlineEye size={22} />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="my-2 block">Position</label>
                  <input
                    type="text"
                    placeholder="Your position"
                    className="w-full p-3 rounded bg-[#0E294D] text-white border border-gray-600 focus:border-blue-500 transition-colors"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="my-2 block">Company</label>
                  <input
                    type="text"
                    placeholder="Your company"
                    className="w-full p-3 rounded bg-[#0E294D] text-white border border-gray-600 focus:border-blue-500 transition-colors"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    required
                  />
                </div>

                {/* <div className="sm:col-span-3">
                <label className="block mb-1 text-white text-sm">
                  Postal/Zip Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    required
                    onChange={handleInputChange}
                    placeholder="Enter location to find postal code"
                    className="w-full pl-3 pr-8 py-2 h-12 rounded text-sm text-white bg-[#0E294D] placeholder-gray-400 outline-none border border-border-info-color"
                  />
                  <BiCurrentLocation
                    size={24}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white"
                    onClick={getCurrentLocation}
                    aria-label="Get current location"
                    tabIndex={0}
                  />
                  {loading && (
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    </div>
                  )}
                  {suggestions.length > 0 && (
                    <ul className="absolute top-full left-0 w-full z-50 rounded-md border border-gray-300 bg-[rgb(7,27,54)] text-white shadow-lg max-h-48 overflow-y-auto mt-1">
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          onClick={() => handleLocationSelect(suggestion)}
                          className="cursor-pointer p-2 hover:bg-gray-700"
                        >
                          {suggestion.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div> */}

                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                  <AddressSelector
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                    updatePhoneCode={updatePhoneCode}
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                  <CountrySpecificZipCode
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                    required={true}
                    label="Postal/Zip Code"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                  <div className="w-full mb-3">
                    <label
                      htmlFor="telephoneNumber"
                      className="block mb-1 text-white"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </label>

                    <CountryPhoneSelector
                      value={formData.telephoneNumber}
                      onChange={handlePhoneChange}
                      onCountryChange={handleCountryChange}
                      placeholder="Phone Number"
                      required={true}
                      error={phoneError}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full p-3 rounded bg-[#00A3FF] text-white font-bold hover:bg-blue-700 transition-colors transform hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <FaSpinner className="animate-spin mx-auto" />
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </form>
          )}
          {renderRoleSpecificForm()}
          <p className="mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-[#29B6F6] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;

// import { Link, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import { FaSpinner, FaUser, FaBriefcase, FaTruck, FaStore, FaShoppingCart, FaPalette } from 'react-icons/fa';
// import "react-toastify/dist/ReactToastify.css";
// import { register, reset } from "../../store/auth/authSlice";
// import logo from "../../assets/LOGO.png";
// import AdvertiserForm from "./AdvertiserForm";
// import FleetOwnerForm from "./FleetOwnerForm";
// import WrappingShopForm from "./WrappingShopForm";
// import { CountrySelect, StateSelect, PhonecodeSelect } from "react-country-state-city";
// import { allCountries } from 'country-telephone-data';
// const Register = () => {
//   const getCountryTelCode = (iso2) => {
//   const match = allCountries.find(
//     (country) => country.iso2.toLowerCase() === iso2.toLowerCase()
//   );
//   return match?.dialCode || '';
// };
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastname: "",
//     email: "",
//     password: "",
//     position: "",
//     company: "",
//     telephoneAreaCode: "91",
//     telephoneNumber: "",
//     state: "",
//     country: "",
//     userType: ""
//   });

//   const [dynamicFormData, setDynamicFormData] = useState({});
//   const defaultCountry = { id: "IN", name: "India", isoCode: "IN" };
//   const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
//   const [selectedState, setSelectedState] = useState("");
//   const [countryPhoneCode, setCountryPhoneCode] = useState(
//     getCountryTelCode(defaultCountry.isoCode)?.replace('+', '') || '91'
//   );
//   const [showRoleModal, setShowRoleModal] = useState(true);
//   const [selectedRole, setSelectedRole] = useState("");

//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

//   const roleConfigs = {
//     advertiser: {
//       icon: <FaBriefcase className="text-blue-500 text-2xl" />,
//       title: "Advertiser",
//       description: "Promote your products and services",
//       hasCustomForm: true,
//       userTypeValue: "advertiser"
//     },
//     'fleet-owner': {
//       icon: <FaTruck className="text-green-500 text-2xl" />,
//       title: "Fleet Owner",
//       description: "Manage your vehicle fleet",
//       hasCustomForm: true,
//       userTypeValue: "fleet"
//     },
//     'wrapping-shop': {
//       icon: <FaPalette className="text-purple-500 text-2xl" />,
//       title: "Wrapping Shop",
//       description: "Provide vehicle wrapping services",
//       hasCustomForm: true,
//       userTypeValue: "wrapping"
//     },
//     seller: {
//       icon: <FaStore className="text-orange-500 text-2xl" />,
//       title: "Seller",
//       description: "Sell your products",
//       hasCustomForm: false,
//       userTypeValue: "seller"
//     },
//     buyer: {
//       icon: <FaShoppingCart className="text-red-500 text-2xl" />,
//       title: "Buyer",
//       description: "Purchase products",
//       hasCustomForm: false,
//       userTypeValue: "buyer"
//     }
//   };

//   const handleCountryChange = (country) => {
//     setSelectedCountry(country);
//     setFormData({ ...formData, country: country.name });
//     setSelectedState("");
//   };

//   const handleStateChange = (state) => {
//     setSelectedState(state);
//     setFormData({ ...formData, state: state.name });
//   };

//   const handlePhonecodeChange = (phonecode) => {
//     setCountryPhoneCode(phonecode);
//     setFormData({ ...formData, telephoneAreaCode: phonecode });
//   };

//   const handleRoleSelection = (role) => {
//     setSelectedRole(role);
//     const userTypeValue = roleConfigs[role]?.userTypeValue || role;
//     setFormData(prev => ({ ...prev, userType: userTypeValue }));
//     setShowRoleModal(false);
//   };
// useEffect(() => {
//     if (selectedCountry?.isoCode) {
//       const dialCode = getCountryTelCode(selectedCountry.isoCode);
//       const phoneCode = dialCode ? dialCode.replace('+', '') : '1';
//       setCountryPhoneCode(phoneCode);
//       setFormData(prev => ({
//         ...prev,
//         telephoneAreaCode: phoneCode
//       }));
//     }
//   }, [selectedCountry]);
//   useEffect(() => {
//     if (isSuccess) {
//       toast.success("Registration successful", { autoClose: 1000 });
//       dispatch(reset());
//       navigate("/login");
//     } else if (isError) {
//       toast.error(message, { autoClose: 1000 });
//       dispatch(reset());
//     }
//   }, [isSuccess, isError, message, dispatch, navigate]);

//   const handleRegister = async (e) => {
//     e.preventDefault();

//     if (!selectedRole) {
//       toast.error("Please select a user type", { autoClose: 1000 });
//       setShowRoleModal(true);
//       return;
//     }

//     const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
//     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

//     if (!emailRegex.test(formData.email)) {
//       toast.error("Email format is invalid", { autoClose: 1000 });
//       return;
//     }

//     if (!passwordRegex.test(formData.password)) {
//       toast.error(
//         "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character",
//         { autoClose: 1000 }
//       );
//       return;
//     }

//     const userTypeValue = roleConfigs[selectedRole]?.userTypeValue || selectedRole;
//     const completeFormData = {
//       ...formData,
//       ...dynamicFormData,
//       userType: userTypeValue
//     };

//     try {
//       await dispatch(register(completeFormData)).unwrap();
//     } catch (error) {
//       console.error("Registration failed:", error);
//     }
//   };

//   const renderRoleSpecificForm = () => {
//     if (!selectedRole || !roleConfigs[selectedRole]?.hasCustomForm) return null;

//     const userTypeValue = roleConfigs[selectedRole]?.userTypeValue || selectedRole;
//     const mergedFormData = { ...formData, ...dynamicFormData, userType: userTypeValue };

//     switch (selectedRole) {
//       case 'advertiser':
//         return <AdvertiserForm formData={mergedFormData} setFormData={setDynamicFormData} />;
//       case 'fleet-owner':
//         return <FleetOwnerForm formData={mergedFormData} setFormData={setDynamicFormData} />;
//       case 'wrapping-shop':
//         return <WrappingShopForm formData={mergedFormData} setFormData={setDynamicFormData} />;
//       default:
//         return null;
//     }
//   };

//   const shouldShowDefaultForm = () => {
//     return !selectedRole || ['buyer', 'seller'].includes(selectedRole) || !roleConfigs[selectedRole]?.hasCustomForm;
//   };

//   return (
//     <div className="flex min-h-screen w-full items-center justify-center bg-black text-[#7386a8] py-10">
//       {isLoading && (
//         <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white bg-opacity-80 z-50">
//           <FaSpinner className="text-4xl text-blue-500 animate-spin" />
//         </div>
//       )}

//       {showRoleModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-80 z-[100] flex justify-center items-center p-4 overflow-y-auto">
//           <div className="bg-gradient-to-br from-[#071B36] to-[#0E294D] rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-2xl border border-blue-800/30">
//             <div className="text-center mb-6">
//               <FaUser className="text-4xl text-blue-400 mx-auto mb-3" />
//               <h2 className="text-2xl font-bold text-white mb-2">Choose Your Role</h2>
//               <p className="text-gray-300">Select the option that best describes you</p>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {Object.entries(roleConfigs).map(([key, config]) => (
//                 <button
//                   key={key}
//                   onClick={() => handleRoleSelection(key)}
//                   className="group p-5 bg-gradient-to-br from-[#0E294D] to-[#1a3a5c] rounded-lg border border-gray-600 hover:border-blue-500 transition-all"
//                 >
//                   <div className="flex items-start space-x-4">
//                     <div className="p-2 bg-gray-800 rounded-md group-hover:bg-gray-700">
//                       {config.icon}
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-semibold text-white group-hover:text-blue-300">
//                         {config.title}
//                       </h3>
//                       <p className="text-gray-400 text-sm">
//                         {config.description}
//                       </p>
//                     </div>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="flex w-[90%] flex-col items-center justify-center rounded-xl bg-[#071B36] py-10 sm:w-3/4 lg:w-2/3 xl:w-1/2 sm:px-6">
//         <img src={logo} alt="Logo" className="h-20" />
//         <p className="text-xl my-4">Create your new account</p>

//         {selectedRole && (
//           <div className="text-center mb-4">
//             <p className="text-blue-400 mb-2">
//               Selected Role: {roleConfigs[selectedRole]?.title || 'Not Selected'}
//             </p>
//             <button
//               onClick={() => setShowRoleModal(true)}
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//             >
//               Change Role
//             </button>
//           </div>
//         )}

//         <p className="my-4 h-[1px] w-[80%] bg-[#747d9340]"></p>

//         {/* Show default form only for roles without custom forms */}
//         {shouldShowDefaultForm() && (
//           <form onSubmit={handleRegister} className="w-full mb-4">
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               <div>
//                 <label className="my-2 block">First Name</label>
//                 <input
//                   type="text"
//                   placeholder="Your Name"
//                   className="w-full p-3 rounded bg-[#0E294D] text-white border border-gray-600"
//                   value={formData.firstName}
//                   onChange={(e) => setFormData({...formData, firstName: e.target.value})}
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="my-2 block">Last Name</label>
//                 <input
//                   type="text"
//                   placeholder="Your Last Name"
//                   className="w-full p-3 rounded bg-[#0E294D] text-white border border-gray-600"
//                   value={formData.lastname}
//                   onChange={(e) => setFormData({...formData, lastname: e.target.value})}
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="my-2 block">Email Address</label>
//                 <input
//                   type="email"
//                   placeholder="Your Email"
//                   className="w-full p-3 rounded bg-[#0E294D] text-white border border-gray-600"
//                   value={formData.email}
//                   onChange={(e) => setFormData({...formData, email: e.target.value})}
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="my-2 block">Password</label>
//                 <input
//                   type="password"
//                   placeholder="Your Password"
//                   className="w-full p-3 rounded bg-[#0E294D] text-white border border-gray-600"
//                   value={formData.password}
//                   onChange={(e) => setFormData({...formData, password: e.target.value})}
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="my-2 block">Position</label>
//                 <input
//                   type="text"
//                   placeholder="Your position"
//                   className="w-full p-3 rounded bg-[#0E294D] text-white border border-gray-600"
//                   value={formData.position}
//                   onChange={(e) => setFormData({...formData, position: e.target.value})}
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="my-2 block">Company</label>
//                 <input
//                   type="text"
//                   placeholder="Your company"
//                   className="w-full p-3 rounded bg-[#0E294D] text-white border border-gray-600"
//                   value={formData.company}
//                   onChange={(e) => setFormData({...formData, company: e.target.value})}
//                   required
//                 />
//               </div>

//               <div className="col-span-1 sm:col-span-2 lg:col-span-3">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="my-2 block">Country</label>
//                     <CountrySelect
//                       value={selectedCountry}
//                       onChange={handleCountryChange}
//                       className="w-full p-3 rounded bg-[#0E294D] text-white"
//                       placeHolder="Select Country"
//                     />
//                   </div>

//                   <div>
//                     <label className="my-2 block">State</label>
//                     <StateSelect
//                       countryid={selectedCountry?.id}
//                       value={selectedState}
//                       onChange={handleStateChange}
//                       className="w-full p-3 rounded bg-[#0E294D] text-white"
//                       placeHolder="Select State"
//                     />
//                   </div>
//                 </div>
//               </div>

//              <div className="col-span-1 sm:col-span-2 lg:col-span-3">
//   <label className="my-2 block text-white">Phone Number <span className="text-red-500">*</span></label>

//   <div className="flex items-center space-x-2">
//     {/* Country Code */}
//     <div className="bg-[#0E294D] text-white border border-gray-600 px-4 py-3 rounded-l min-w-[70px] text-center">
//       +{countryPhoneCode}
//     </div>

//     {/* Phone Number Input */}
//     <input
//       type="tel"
//       placeholder="Your phone number"
//       className="flex-1 p-3 rounded-r bg-[#0E294D] text-white border border-gray-600 outline-none focus:border-blue-500"
//       value={formData.telephoneNumber}
//       onChange={(e) => {
//         const phoneNumber = e.target.value.replace(/\D/g, "");
//         if (phoneNumber.length <= 10) {
//           setFormData({
//             ...formData,
//             telephoneNumber: phoneNumber,
//           });
//         }
//       }}
//       required
//     />
//   </div>
// </div>

//             </div>

//             <div className="mt-6">
//               <button
//                 type="submit"
//                 className="w-full p-3 rounded bg-[#00A3FF] text-white font-bold hover:bg-blue-700 transition-colors"
//                 disabled={isLoading}
//               >
//                 {isLoading ? <FaSpinner className="animate-spin mx-auto" /> : 'Sign Up'}
//               </button>
//             </div>
//           </form>
//         )}

//         {/* Render role-specific forms */}
//         {renderRoleSpecificForm()}

//         <p className="mt-4">
//           Already have an account?{" "}
//           <Link to="/login" className="text-[#29B6F6] hover:underline">
//             Sign In
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Register;
