import { useState, useEffect, useRef, useMemo } from "react";
import React from "react";
import {
  CitySelect,
  CountrySelect,
  StateSelect,
} from "react-country-state-city";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { register, reset } from "../../store/auth/authSlice";
import { useNavigate } from "react-router-dom";
import _ from "lodash";
import axios from "axios";
import { BiCurrentLocation } from "react-icons/bi";
import { allCountries } from "country-telephone-data";
import AddressSelector from "../../components/AddressSelector";
import { Country } from "country-state-city";
import { FaEye, FaEyeSlash, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import CountryPhoneSelector from "../../components/PhoneInputWithCountry";
import CountrySpecificZipCode from "../../components/CountrySpecificZipCode";

const FleetRegistrationForm = () => {
  const [formData, setFormData] = useState({
    company: "",
    firstName: "",
    lastname: "",
    position: "",
    email: "",
    password: "",
    telephoneAreaCode: "91",
    telephoneNumber: "",
    street1: "",
    street2: "",
    suburb: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    website: "",
    employees: "",
    yearsInBusiness: "",
    userType: "fleetOwner",
    area: "",
    deliveryVans: "",
    boxVans: "",
    longHaul: "",
    standby: "",
    availability: "",
    prohibitedAdvertising: {
      gambling: false,
      alcohol: false,
      smoking: false,
      other: false,
      otherSpecify: "",
    },
    locationName: "",
  });

  const [errors, setErrors] = useState({});
  const defaultCountry = { id: "IN", name: "India", isoCode: "IN" };
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [selectedState, setSelectedState] = useState("");
  const [countryPhoneCode, setCountryPhoneCode] = useState("91");
  const [showPassword, setShowPassword] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [mainSlide, setMainSlide] = useState(0);
  const [benefitSlide, setBenefitSlide] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("fleet-owner");
  const [isPaused, setIsPaused] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [showMainArrows, setShowMainArrows] = useState(false);
  const [showBenefitArrows, setShowBenefitArrows] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    isLoading: authLoading,
    isError,
    isSuccess,
    message,
  } = useSelector((state) => state.auth);

  // Static slides that don't rotate
  const staticSlides = useMemo(
    () => [
      {
        title: "Transform Fleet Costs into Profits",
        content:
          "Fleet management is often associated with significant expense and time commitments, which can adversely affect an organisation's profitability. However, this initiative provides an opportunity to transform the direct and indirect costs of fleet management into a profit centre.",
      },
    ],
    [],
  );

  // Rotating slides
  const rotatingSlides = useMemo(
    () => [
      {
        title: "Build Customer Connections",
        content:
          "This collaborative strategy creates a unified objective among brands, amplifying each vehicle owner's reach regardless of a B2B (Business to Business) or B2C (Business to Consumer) offering, and positioning consumers as engaged participants in the marketing process.",
      },
      {
        title: "Generate Revenue from Vehicle Space",
        content:
          "For example, in the USA, average rates per square metre are approximately $60, meaning that a fully wrapped delivery vehicle (such as one with Mercedes Sprinter dimensions) could possibly generate an income of $30,000 annually, for the utilisation of your currently unused or redundant space.",
      },
      {
        title: "Long-Term Revenue Stream",
        content:
          "Since advertisers typically commit upfront to the substantial expense of physically wrapping the vehicle, this revenue stream may continue for up to five years and generate up to $150,000 in revenue.",
      },
      {
        title: "Offset Vehicle Costs",
        content:
          "Over time, this can more than offset the acquisition cost of the vehicle and potentially cover fixed operating expenses, including insurance, maintenance, and tyre replacement.",
      },
      {
        title: "Flexible Advertising Options",
        content:
          "Vehicle owners may also choose to reserve a portion of the advertising space for their own use, thereby foregoing a part of the potential revenue. This option enables them to enjoy similar promotional benefits as external advertisers by showcasing their own brand or products.",
      },
      {
        title: "Fleet Owner Benefits Package",
        content:
          "Zero upfront investment • Professional wrap installation • Paint protection included • Reduced theft risk • Flexible contract terms • Keep space for your own brand • Real-time earnings tracking",
        isStatic: true,
      },
    ],
    [],
  );

  // Combine static and rotating slides
  const allSlides = useMemo(
    () => [...staticSlides, ...rotatingSlides],
    [staticSlides, rotatingSlides],
  );

  const benefits = useMemo(
    () => [
      {
        title: "Maximize Revenue Potential",
        description:
          "Turn your fleet into a revenue-generating asset by leasing advertising space on your vehicles, creating a new income stream without additional operational costs.",
        cta: "Unlock new profits today!",
      },
      {
        title: "Enhance Brand Visibility",
        description:
          "Showcase your own brand or partner with advertisers to increase visibility in high-traffic areas, reaching thousands of potential customers daily.",
        cta: "Boost your brand's reach!",
      },
      {
        title: "Flexible Advertising Options",
        description:
          "Choose which advertisements to display or reserve space for your own promotions, giving you control over your fleet's appearance and messaging.",
        cta: "Customize your fleet's look!",
      },
    ],
    [],
  );

  // Improved slide navigation with proper arrow controls
  const prevMainSlide = () => {
    setMainSlide((prev) => (prev === 0 ? allSlides.length - 1 : prev - 1));
    handleInteraction();
  };

  const nextMainSlide = () => {
    setMainSlide((prev) => (prev === allSlides.length - 1 ? 0 : prev + 1));
    handleInteraction();
  };

  const prevBenefitSlide = () => {
    setBenefitSlide((prev) => (prev === 0 ? benefits.length - 1 : prev - 1));
    handleInteraction();
  };

  const nextBenefitSlide = () => {
    setBenefitSlide((prev) => (prev === benefits.length - 1 ? 0 : prev + 1));
    handleInteraction();
  };

  const handleInteraction = () => {
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 12000);
  };

  // const AnimatedBanner = React.memo(({ children, delay = 0 }) => {
  //   const [isVisible, setIsVisible] = useState(false);

  //   useEffect(() => {
  //     const timer = setTimeout(() => {
  //       setIsVisible(true);
  //     }, delay);
  //     return () => clearTimeout(timer);
  //   }, [delay]);

  //   return (
  //     <div
  //       className={`transform transition-all duration-1000 ease-out ${
  //         isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
  //       }`}
  //     >
  //       {children}
  //     </div>
  //   );
  // });

  const getBannerContent = () => {
    if (currentStep === 1) {
      return {
        title: "Building Enduring Consumer Connections",
        content:
          "This collaborative strategy ensures a unified objective among brands, amplifying each advertiser's reach and positioning consumers as engaged participants in the marketing process. As individuals share branded images within their networks and credit rewards platforms, a dynamic cycle of engagement develops, strengthening brand recognition. Through these authentic exchanges, advertisers foster lasting connections that extend beyond fleeting digital impressions, establishing new channels for brand awareness and driving purchase intent.",
      };
    } else if (currentStep === 2) {
      if (selectedRole === "fleet-owner") {
        return {
          title: "Transform Fleet Costs into Revenue",
          content:
            "Fleet management is often associated with significant expense and time commitments, which can adversely affect an organisation's profitability. However, this initiative provides an opportunity to transform the direct and indirect costs of fleet management into a profit centre. For example, in the USA, average rates per square metre are approximately $60, meaning that a fully wrapped delivery vehicle (such as one with Mercedes Sprinter dimensions) could generate up to $30,000 annually.",
        };
      }
    } else if (currentStep === 3) {
      if (selectedRole === "fleet-owner") {
        return {
          title: "Long-term Revenue Generation",
          content:
            "Since advertisers typically commit upfront to the substantial expense of physically wrapping the vehicle, this revenue stream may continue for up to five years. Over time, this can more than offset the acquisition cost of the vehicle and potentially cover fixed operating expenses, including insurance, maintenance, and tyre replacement.",
        };
      }
    }
    return null;
  };

  // Improved auto-rotation logic
  useEffect(() => {
    if (currentStep !== 1 || isPaused) return;

    const timer = setInterval(() => {
      setMainSlide((prev) => {
        const nextSlide = (prev + 1) % allSlides.length;
        // Skip auto-advancement for static slides
        return allSlides[nextSlide]?.isStatic ? prev : nextSlide;
      });
    }, 12000);

    return () => clearInterval(timer);
  }, [currentStep, isPaused, allSlides]);

  useEffect(() => {
    if (currentStep !== 2 || isPaused) return;

    const timer = setInterval(() => {
      setBenefitSlide((prev) => (prev + 1) % benefits.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [currentStep, isPaused, benefits.length]);

  useEffect(() => {
    const fetchCountryByIP = async () => {
      try {
        const response = await axios.get("https://ipapi.co/json/");
        const { country_code, country_name } = response.data;

        const country = allCountries.find(
          (c) => c.iso2.toLowerCase() === country_code.toLowerCase(),
        );

        if (country) {
          const phoneCode = country.dialCode.replace("+", "");
          const countryObj = {
            id: country.iso2.toUpperCase(),
            name: country_name || country.name,
            isoCode: country.iso2.toUpperCase(),
          };

          setSelectedCountry(countryObj);
          setCountryPhoneCode(phoneCode);
          setFormData((prev) => ({
            ...prev,
            telephoneAreaCode: phoneCode,
            country: country_name || country.name,
          }));
        }
      } catch (error) {
        console.error("Error fetching country by IP:", error);
        setCountryPhoneCode("91");
        setFormData((prev) => ({
          ...prev,
          telephoneAreaCode: "91",
          country: "India",
        }));
      }
    };
    fetchCountryByIP();
  }, []);

  // सभी फॉर्म्स में यह useEffect डालें
  useEffect(() => {
    if (!selectedCountry?.isoCode) return;

    const iso2 = selectedCountry.isoCode.toLowerCase();
    const country = allCountries.find((c) => c.iso2 === iso2);

    if (country) {
      const phoneCode = country.dialCode.replace("+", "");
      setCountryPhoneCode(phoneCode);

      setFormData((prev) => ({
        ...prev,
        telephoneAreaCode: phoneCode,
      }));
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (isSuccess) {
      // toast.success("Registration successful", {
      //   autoClose: 2000,
      // });
      dispatch(reset());
      navigate("/login");
    } else if (isError) {
      // toast.error(message || "User already exists", {
      //   autoClose: 2000,
      // });
      dispatch(reset());
    }
  }, [isSuccess, isError, message, dispatch, navigate]);

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, telephoneNumber: value }));

    // Validate phone number (7-15 digits)
    if (!/^\d{7,15}$/.test(value) && value.length > 0) {
      setPhoneError("Please enter a valid phone number (7-15 digits)");
    } else {
      setPhoneError("");
    }
  };

  const handleCountryChange = (countryCode, phoneCode) => {
    const country = allCountries.find((c) => c.iso2 === countryCode);

    if (country) {
      const countryObj = {
        id: countryCode,
        name: country.name,
        isoCode: countryCode,
      };

      setSelectedCountry(countryObj);
      setCountryPhoneCode(phoneCode);

      setFormData((prev) => ({
        ...prev,
        country: countryObj.name,
        telephoneAreaCode: phoneCode,
      }));
    }
  };

  const handleStateChange = (state) => {
    setSelectedState(state);
    setFormData({ ...formData, state: state.name, city: "" });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes("prohibitedAdvertising")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
      setErrors((prev) => ({ ...prev, [parent]: "" }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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
      locationName: suggestion.display_name,
      location: locationData,
    }));

    const foundCountry = allCountries.find(
      (c) => c.name.toLowerCase() === (address.country || "").toLowerCase(),
    );
    if (foundCountry) {
      const countryObj = {
        id: foundCountry.iso2.toUpperCase(),
        name: foundCountry.name,
        isoCode: foundCountry.iso2.toUpperCase(),
      };
      setSelectedCountry(countryObj);
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
            const countryObj = {
              id: foundCountry.iso2.toUpperCase(),
              name: foundCountry.name,
              isoCode: foundCountry.iso2.toUpperCase(),
            };
            setSelectedCountry(countryObj);
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

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "company",
      "firstName",
      "lastname",
      "position",
      "email",
      "password",
      "telephoneNumber",
      "street1",
      "suburb",
      "postalCode",
      "country",
      "area",
      "standby",
      "availability",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
      }
    });

    if (
      formData.prohibitedAdvertising.other &&
      !formData.prohibitedAdvertising.otherSpecify.trim()
    ) {
      newErrors.prohibitedAdvertisingOther =
        "Please specify the other prohibited advertising type";
    }

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Email format is invalid";
    }

    if (formData.website && formData.website.trim() !== "") {
      const urlRegex =
        /^(https?:\/\/)?(www\.)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/;
      if (!urlRegex.test(formData.website)) {
        newErrors.website =
          "Please enter a valid website URL (e.g., example.com or www.example.com)";
      }
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (formData.password && !passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character";
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (
      formData.telephoneNumber &&
      !phoneRegex.test(formData.telephoneNumber)
    ) {
      newErrors.telephoneNumber = "Phone number must be 10-15 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updatePhoneCode = (isoCode) => {
    const country = allCountries.find((c) => c.iso2 === isoCode);

    if (country) {
      const code = country.dialCode.replace("+", "");
      setCountryPhoneCode(code);

      // Update both the country object AND the form data
      setSelectedCountry({
        id: isoCode,
        name: country.name,
        isoCode: isoCode,
      });

      setFormData((prev) => ({
        ...prev,
        telephoneAreaCode: code,
      }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const registrationData = {
      firstName: formData.firstName,
      lastname: formData.lastname,
      email: formData.email,
      password: formData.password,
      position: formData.position,
      company: formData.company,
      telephoneAreaCode: formData.telephoneAreaCode,
      telephoneNumber: formData.telephoneNumber,
      street1: formData.street1,
      street2: formData.street2,
      suburb: formData.suburb,
      city: formData.city,
      state: formData.state,
      location: {
        name: formData.locationName || formData.location?.name || "",
        zip: formData.postalCode || "",
        latitude: formData.location?.latitude || null,
        longitude: formData.location?.longitude || null,
      },
      postalCode: formData.postalCode,
      country: formData.country,
      website: formData.website,
      employees: formData.employees,
      yearsInBusiness: formData.yearsInBusiness,
      userType: "fleetOwner",
      fleetOwnerDetails: {
        area: formData.area,
        deliveryVans: formData.deliveryVans || 0,
        boxVans: formData.boxVans || 0,
        longHaul: formData.longHaul || 0,
        standby: formData.standby,
        availability: formData.availability,
        prohibitedAdvertising: formData.prohibitedAdvertising,
      },
    };

    dispatch(register(registrationData));
  };

  const renderInput = (name, placeholder, type = "text", required = false) => (
    <div className="w-full mb-3">
      <label htmlFor={name} className="block mb-1 text-white">
        {placeholder} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        min={type === "number" ? "0" : undefined}
        className={`w-full pl-5 py-3 rounded text-white bg-[#0E294D] placeholder-body-text-color outline-none border ${
          errors[name] ? "border-red-500" : "border-border-info-color"
        } focus:border-theme-color`}
      />
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
      )}
    </div>
  );

  // Main slides section में arrows को fix करने के लिए
  const renderMainSlides = () => (
    <div className="relative h-64 overflow-hidden rounded-lg">
      {allSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 p-4 transition-opacity duration-1000 ${
            index === mainSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="bg-[#0E294D] p-8 rounded-lg h-full flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-2">
              {slide.title}
            </h3>
            <p className="text-sm text-slate-300 flex-grow">{slide.content}</p>
            <div className="mt-2 text-center text-xs text-slate-400">
              {index + 1} of {allSlides.length}
              {slide.isStatic}
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prevMainSlide}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-all duration-200  z-10"
        aria-label="Previous slide"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={nextMainSlide}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-all duration-200  z-10"
        aria-label="Next slide"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
        {allSlides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all -mb-5 ${
              index === mainSlide
                ? allSlides[index]?.isStatic
                  ? "bg-blue-400 w-4"
                  : "bg-white w-4"
                : "bg-gray-600"
            }`}
            onClick={() => {
              setMainSlide(index);
              handleInteraction();
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      {currentStep === 1 ? (
        <div className="bg-[#0E294D] rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#1E3A8A] p-4 text-center">
            <h1 className="text-2xl font-bold text-white">
              Fleet Owner Registration
            </h1>
          </div>
          <div className="p-4">
            <div className="bg-[#0E1F3D] rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4 text-center">
                Fleet Benefits
              </h2>

              {renderMainSlides()}

              {getBannerContent() && (
                <div className="w-full mt-6 p-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg border border-blue-500/30">
                  <h2 className="text-2xl font-bold text-white mb-3 text-center">
                    {getBannerContent().title}
                  </h2>
                  <p className="text-blue-100 text-sm leading-relaxed text-center">
                    {getBannerContent().content}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setCurrentStep(2)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg text-lg transition-colors duration-200 w-full sm:w-auto"
            >
              Get Started
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#0E294D] rounded-xl shadow-lg overflow-hidden">
          <div className="p-4">
            {selectedRole === "fleet-owner" && (
              <div className="w-full mt-6 p-6 bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-lg border border-green-500/30">
                <h3 className="text-xl font-bold text-white mb-4 text-center">
                  Additional Benefits for Vehicle Owners
                </h3>
                <div className="relative">
                  <div
                    className="text-center transition-all duration-500 ease-in-out px-12"
                    key={benefitSlide}
                  >
                    {benefits.length > 0 &&
                    benefitSlide >= 0 &&
                    benefitSlide < benefits.length ? (
                      <>
                        <h4 className="font-semibold text-green-300 mb-2">
                          {benefits[benefitSlide].title}
                        </h4>
                        <p className="text-gray-300 mb-4">
                          {benefits[benefitSlide].description}
                        </p>
                        <p className="text-blue-300 font-semibold">
                          {benefits[benefitSlide].cta}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-300">Loading benefits...</p>
                    )}
                  </div>

                  {/* Left Arrow - Completely on left side */}
                  <button
                    onClick={prevBenefitSlide}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 h-20 p-2 rounded-full transition-all duration-200  "
                  >
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {/* Right Arrow - Completely on right side */}
                  <button
                    onClick={nextBenefitSlide}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2  p-2 rounded-full transition-all duration-200"
                  >
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  <div className="flex justify-center mt-4 space-x-2">
                    {benefits.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                          benefitSlide === index
                            ? "bg-blue-500 w-4"
                            : "bg-gray-500"
                        }`}
                        onClick={() => {
                          setBenefitSlide(index);
                          handleInteraction();
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <form onSubmit={handleRegister} className="space-y-4 p-4">
            <div className="bg-[#0E1F3D] rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 border-b border-slate-700 pb-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput("firstName", "First Name", "text", true)}
                {renderInput("lastname", "Last Name", "text", true)}
                {renderInput("position", "Position", "text", true)}
                {renderInput("email", "Email", "email", true)}

                <div className="sm:col-span-2">
                  <label className="block mb-1 text-white text-sm">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className={`w-full pl-3 pr-8 py-2 rounded text-sm h-12 text-white bg-[#0E294D] placeholder-gray-400 outline-none border ${
                        errors.password
                          ? "border-red-500"
                          : "border-border-info-color"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <FaEyeSlash className="w-5 h-5" />
                      ) : (
                        <FaEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
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
                    currentPhoneCode={countryPhoneCode}
                    placeholder="Phone Number"
                    required={true}
                    error={phoneError}
                  />
                </div>
              </div>
            </div>
            <div className="bg-[#0E1F3D] rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 border-b border-slate-700 pb-2">
                Company Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput("company", "Company", "text", true)}
                {renderInput("website", "Website Address", "text")}
                {renderInput("employees", "Employees", "number")}
                {renderInput("yearsInBusiness", "Years in Business", "number")}
              </div>
            </div>
            <div className="bg-[#0E1F3D] rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 border-b border-slate-700 pb-2">
                Address
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput("street1", "Street 1", "text", true)}
                {renderInput("street2", "Street 2", "text")}

                {renderInput("suburb", "Suburb", "text", true)}
                <div className="sm:col-span-2">
                  <AddressSelector
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                    updatePhoneCode={updatePhoneCode}
                  />
                  <div className="mt-6">
                    <CountrySpecificZipCode
                      formData={formData}
                      setFormData={setFormData}
                      selectedCountry={selectedCountry}
                      errors={errors}
                      setErrors={setErrors}
                      required={true}
                      label="Postal/Zip Code"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#0E1F3D] rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 border-b border-slate-700 pb-2">
                Fleet Details
              </h3>
              <div className="mb-4">
                <label className="block text-white text-sm mb-2">
                  Operating Area <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Local", "State/County Wide", "National"].map((area) => (
                    <label
                      key={area}
                      className="flex items-center space-x-2 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="area"
                        value={area}
                        checked={formData.area === area}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 bg-[#0E294D] border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-slate-300">{area}</span>
                    </label>
                  ))}
                </div>
                {errors.area && (
                  <p className="text-red-500 text-sm mt-2">{errors.area}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {renderInput("deliveryVans", "Delivery Vans", "number")}
                {renderInput("boxVans", "Box Vans", "number")}
                {renderInput("longHaul", "Long Haul", "number")}
              </div>
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">
                  Stand-By Vehicles <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Yes", "No"].map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-2 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="standby"
                        value={option}
                        checked={formData.standby === option}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 bg-[#0E294D] border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-slate-300">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.standby && (
                  <p className="text-red-500 text-sm mt-2">{errors.standby}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">
                  Vehicle Availability <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["3 Months", "6 Months", "12 Months", "24 Months"].map(
                    (val) => (
                      <label
                        key={val}
                        className="flex items-center space-x-2 text-sm cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="availability"
                          value={val}
                          checked={formData.availability === val}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 bg-[#0E294D] border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-slate-300">{val}</span>
                      </label>
                    ),
                  )}
                </div>
                {errors.availability && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.availability}
                  </p>
                )}
              </div>
              <div className="bg-[#0E1F3D] rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Prohibited Ads
                </h3>
                <div className="flex flex-wrap gap-6">
                  {["gambling", "alcohol", "smoking"].map((type) => (
                    <label
                      key={type}
                      className="flex items-center space-x-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        name={`prohibitedAdvertising.${type}`}
                        checked={formData.prohibitedAdvertising[type]}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 bg-[#0E294D] rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-slate-300 capitalize">{type}</span>
                    </label>
                  ))}
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        name="prohibitedAdvertising.other"
                        checked={formData.prohibitedAdvertising.other}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 bg-[#0E294D] rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-slate-300">Other</span>
                    </label>
                    {formData.prohibitedAdvertising.other && (
                      <div className="ml-2 flex-1">
                        <input
                          type="text"
                          name="prohibitedAdvertising.otherSpecify"
                          placeholder="Please specify"
                          className="w-full px-3 py-2 bg-[#0E294D] border border-gray-300 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          value={formData.prohibitedAdvertising.otherSpecify}
                          onChange={handleChange}
                        />
                        {errors.prohibitedAdvertisingOther && (
                          <p className="text-red-500 text-sm mt-2">
                            {errors.prohibitedAdvertisingOther}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center pt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded text-sm transition disabled:opacity-50"
                disabled={authLoading}
              >
                {authLoading ? "Registering..." : "Complete Registration"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FleetRegistrationForm;

// import { useState, useEffect, useRef, useMemo } from "react";
// import React from "react";
// import {
//   CitySelect,
//   CountrySelect,
//   StateSelect,
// } from "react-country-state-city";
// import { useDispatch, useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import { register, reset } from "../../store/auth/authSlice";
// import { useNavigate } from "react-router-dom";
// import _ from "lodash";
// import axios from "axios";
// import { BiCurrentLocation } from "react-icons/bi";
// import { allCountries } from "country-telephone-data";
// import AddressSelector from "../../components/AddressSelector";
// import { Country } from "country-state-city";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import CountryPhoneSelector from '../../components/PhoneInputWithCountry';
// const FleetRegistrationForm = () => {
//   const [formData, setFormData] = useState({
//     company: "",
//     firstName: "",
//     lastname: "",
//     position: "",
//     email: "",
//     password: "",
//     telephoneAreaCode: "91",
//     telephoneNumber: "",
//     street1: "",
//     street2: "",
//     suburb: "",
//     city: "",
//     state: "",
//     postalCode: "",
//     country: "India",
//     website: "",
//     employees: "",
//     yearsInBusiness: "",
//     userType: "fleetOwner",
//     area: "",
//     deliveryVans: "",
//     boxVans: "",
//     longHaul: "",
//     standby: "",
//     availability: "",
//     prohibitedAdvertising: {
//       gambling: false,
//       alcohol: false,
//       smoking: false,
//       other: false,
//       otherSpecify: "",
//     },
//     locationName: "",
//   });

//   const [errors, setErrors] = useState({});
//   const defaultCountry = { id: "IN", name: "India", isoCode: "IN" };
//   const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
//   const [selectedState, setSelectedState] = useState("");
//   const [countryPhoneCode, setCountryPhoneCode] = useState("91");
//   const [showPassword, setShowPassword] = useState(false);
//   const [query, setQuery] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [suggestions, setSuggestions] = useState([]);
//   const [mainSlide, setMainSlide] = useState(0);
//   const [benefitSlide, setBenefitSlide] = useState(0);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [selectedRole, setSelectedRole] = useState("fleet-owner");
//   const [isPaused, setIsPaused] = useState(false);
// const [phoneError, setPhoneError] = useState('');
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { isLoading: authLoading, isError, isSuccess, message } = useSelector(
//     (state) => state.auth
//   );

//   const benefits = useMemo(() => [
//     {
//       title: "Maximize Revenue Potential",
//       description:
//         "Turn your fleet into a revenue-generating asset by leasing advertising space on your vehicles, creating a new income stream without additional operational costs.",
//       cta: "Unlock new profits today!",
//     },
//     {
//       title: "Enhance Brand Visibility",
//       description:
//         "Showcase your own brand or partner with advertisers to increase visibility in high-traffic areas, reaching thousands of potential customers daily.",
//       cta: "Boost your brand's reach!",
//     },
//     {
//       title: "Flexible Advertising Options",
//       description:
//         "Choose which advertisements to display or reserve space for your own promotions, giving you control over your fleet's appearance and messaging.",
//       cta: "Customize your fleet's look!",
//     },
//   ], []);

//   const slides = useMemo(() => [
//     {
//       title: "Transform Fleet Costs into Profits",
//       content:
//         "Fleet management is often associated with significant expense and time commitments, which can adversely affect an organisation's profitability. However, this initiative provides an opportunity to transform the direct and indirect costs of fleet management into a profit centre.",
//     },
//     {
//       title: "Generate Revenue from Vehicle Space",
//       content:
//         "For example, in the USA, average rates per square metre are approximately $60, meaning that a fully wrapped delivery vehicle (such as one with Mercedes Sprinter dimensions) could possibly generate an income of $30,000 annually, for the utilisation of your currently unused or redundant space.",
//     },
//     {
//       title: "Long-Term Revenue Stream",
//       content:
//         "Since advertisers typically commit upfront to the substantial expense of physically wrapping the vehicle, this revenue stream may continue for up to five years and generate up to $150,000 in revenue.",
//     },
//     {
//       title: "Offset Vehicle Costs",
//       content:
//         "Over time, this can more than offset the acquisition cost of the vehicle and potentially cover fixed operating expenses, including insurance, maintenance, and tyre replacement.",
//     },
//     {
//       title: "Flexible Advertising Options",
//       content:
//         "Vehicle owners may also choose to reserve a portion of the advertising space for their own use, thereby foregoing a part of the potential revenue. This option enables them to enjoy similar promotional benefits as external advertisers by showcasing their own brand or products.",
//     },
//     {
//       title: "Build Customer Connections",
//       content:
//         "This collaborative strategy creates a unified objective among brands, amplifying each vehicle owner's reach regardless of a B2B (Business to Business) or B2C (Business to Consumer) offering, and positioning consumers as engaged participants in the marketing process.",
//     },
//     {
//       title: "Strengthen Brand Engagement",
//       content:
//         "As individuals share branded images within their networks and revisit rewards platforms, a dynamic cycle of engagement develops, strengthening brand recognition. Through these authentic exchanges, advertisers foster lasting connections that extend beyond fleeting digital impressions, establishing new channels for brand awareness and driving purchase intent.",
//     },
//   ], []);

//   const prevBenefitSlide = () => {
//     setBenefitSlide((prev) => (prev === 0 ? benefits.length - 1 : prev - 1));
//     handleInteraction();
//   };

//   const nextBenefitSlide = () => {
//     setBenefitSlide((prev) => (prev === benefits.length - 1 ? 0 : prev + 1));
//     handleInteraction();
//   };

//   const handleInteraction = () => {
//     setIsPaused(true);
//     setTimeout(() => setIsPaused(false), 12000);
//   };

//   const AnimatedBanner = React.memo(({ children, delay = 0 }) => {
//     const [isVisible, setIsVisible] = useState(false);

//     useEffect(() => {
//       const timer = setTimeout(() => {
//         setIsVisible(true);
//       }, delay);
//       return () => clearTimeout(timer);
//     }, [delay]);

//     return (
//       <div
//         className={`transform transition-all duration-1000 ease-out ${
//           isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
//         }`}
//       >
//         {children}
//       </div>
//     );
//   });

//   const getBannerContent = () => {
//     if (currentStep === 1) {
//       return {
//         title: "Building Enduring Consumer Connections",
//         content:
//           "This collaborative strategy creates a unified objective among brands, amplifying each advertiser's reach and positioning consumers as engaged participants in the marketing process. As individuals share branded images within their networks and revisit rewards platforms, a dynamic cycle of engagement develops, strengthening brand recognition. Through these authentic exchanges, advertisers foster lasting connections that extend beyond fleeting digital impressions, establishing new channels for brand awareness and driving purchase intent.",
//       };
//     } else if (currentStep === 2) {
//       if (selectedRole === "fleet-owner") {
//         return {
//           title: "Transform Fleet Costs into Revenue",
//           content:
//             "Fleet management is often associated with significant expense and time commitments, which can adversely affect an organisation's profitability. However, this initiative provides an opportunity to transform the direct and indirect costs of fleet management into a profit centre. For example, in the USA, average rates per square metre are approximately $60, meaning that a fully wrapped delivery vehicle (such as one with Mercedes Sprinter dimensions) could generate up to $30,000 annually.",
//         };
//       }
//     } else if (currentStep === 3) {
//       if (selectedRole === "fleet-owner") {
//         return {
//           title: "Long-term Revenue Generation",
//           content:
//             "Since advertisers typically commit upfront to the substantial expense of physically wrapping the vehicle, this revenue stream may continue for up to five years. Over time, this can more than offset the acquisition cost of the vehicle and potentially cover fixed operating expenses, including insurance, maintenance, and tyre replacement.",
//         };
//       }
//     }
//     return null;
//   };
// useEffect(() => {
//   if (currentStep !== 1 || isPaused) return;

//   const timer = setInterval(() => {
//     setMainSlide(prev => (prev + 1) % slides.length);
//   }, 12000);

//   return () => clearInterval(timer);
// }, [currentStep, isPaused, slides.length]);

// useEffect(() => {
//   if (currentStep !== 2 || isPaused) return;

//   const timer = setInterval(() => {
//     setBenefitSlide(prev => (prev + 1) % benefits.length);
//   }, 8000);

//   return () => clearInterval(timer);
// }, [currentStep, isPaused, benefits.length]);

//   useEffect(() => {
//     const fetchCountryByIP = async () => {
//       try {
//         const response = await axios.get("https://ipapi.co/json/");
//         const { country_code, country_name } = response.data;

//         const country = allCountries.find((c) =>
//           c.iso2.toLowerCase() === country_code.toLowerCase()
//         );

//         if (country) {
//           const phoneCode = country.dialCode.replace("+", "");
//           const countryObj = {
//             id: country.iso2.toUpperCase(),
//             name: country_name || country.name,
//             isoCode: country.iso2.toUpperCase(),
//           };

//           setSelectedCountry(countryObj);
//           setCountryPhoneCode(phoneCode);
//           setFormData((prev) => ({
//             ...prev,
//             telephoneAreaCode: phoneCode,
//             country: country_name || country.name,
//           }));
//         }
//       } catch (error) {
//         console.error("Error fetching country by IP:", error);
//         setCountryPhoneCode("91");
//         setFormData((prev) => ({
//           ...prev,
//           telephoneAreaCode: "91",
//           country: "India",
//         }));
//       }
//     };
//     fetchCountryByIP();
//   }, []);

// // सभी फॉर्म्स में यह useEffect डालें
// useEffect(() => {
//   if (!selectedCountry?.isoCode) return;

//   const iso2 = selectedCountry.isoCode.toLowerCase();
//   const country = allCountries.find(c => c.iso2 === iso2);

//   if (country) {
//     const phoneCode = country.dialCode.replace('+', '');
//     setCountryPhoneCode(phoneCode);

//     setFormData(prev => ({
//       ...prev,
//       telephoneAreaCode: phoneCode,
//     }));
//   }
// }, [selectedCountry]);

//   useEffect(() => {
//     if (isSuccess) {
//       toast.success("Registration successful", {
//         autoClose: 2000,
//       });
//       dispatch(reset());
//       navigate("/login");
//     } else if (isError) {
//       toast.error(message || "User already exists", {
//         autoClose: 2000,
//       });
//       dispatch(reset());
//     }
//   }, [isSuccess, isError, message, dispatch, navigate]);
// const handlePhoneChange = (value) => {
//   setFormData(prev => ({ ...prev, telephoneNumber: value }));

//   // Validate phone number (7-15 digits)
//   if (!/^\d{7,15}$/.test(value) && value.length > 0) {
//     setPhoneError('Please enter a valid phone number (7-15 digits)');
//   } else {
//     setPhoneError('');
//   }
// };
// const handleCountryChange = (countryCode, phoneCode) => {
//   const country = allCountries.find(c => c.iso2 === countryCode);

//   if (country) {
//     const countryObj = {
//       id: countryCode,
//       name: country.name,
//       isoCode: countryCode
//     };

//     setSelectedCountry(countryObj);
//     setCountryPhoneCode(phoneCode);

//     setFormData(prev => ({
//       ...prev,
//       country: countryObj.name,
//       telephoneAreaCode: phoneCode,
//     }));
//   }
// };

//   const handleStateChange = (state) => {
//     setSelectedState(state);
//     setFormData({ ...formData, state: state.name, city: "" });
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     if (name.includes("prohibitedAdvertising")) {
//       const [parent, child] = name.split(".");
//       setFormData((prev) => ({
//         ...prev,
//         [parent]: {
//           ...prev[parent],
//           [child]: type === "checkbox" ? checked : value,
//         },
//       }));
//       setErrors((prev) => ({ ...prev, [parent]: "" }));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: type === "checkbox" ? checked : value,
//       }));
//       setErrors((prev) => ({ ...prev, [name]: "" }));
//     }
//   };

//   const handleInputChange = (e) => {
//     const value = e.target.value;
//     setQuery(value);
//     debounceRef.current(value);
//   };

//   const handleLocationSelect = (suggestion) => {
//     const address = suggestion.address;
//     const locationData = {
//       name: suggestion.display_name,

//       zip: address.postcode || "",
//       latitude: parseFloat(suggestion.lat) || null,
//       longitude: parseFloat(suggestion.lon) || null,
//     };

//     setFormData((prev) => ({
//       ...prev,
//       city: address.city || address.town || address.village || "",
//       state: address.state || "",
//       country: address.country || "",
//       postalCode: address.postcode || "",
//        locationName: suggestion.display_name,
//       location: locationData,
//     }));

//     const foundCountry = allCountries.find(
//       (c) => c.name.toLowerCase() === (address.country || "").toLowerCase()
//     );
//     if (foundCountry) {
//       const countryObj = {
//         id: foundCountry.iso2.toUpperCase(),
//         name: foundCountry.name,
//         isoCode: foundCountry.iso2.toUpperCase(),
//       };
//       setSelectedCountry(countryObj);
//     }

//     setQuery(suggestion.display_name);
//     setSuggestions([]);
//   };

//   const debounceRef = useRef(
//     _.debounce(async (query) => {
//       if (!query) {
//         setSuggestions([]);
//         return;
//       }

//       try {
//         const response = await axios.get(
//           `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5`
//         );
//         setSuggestions(response.data);
//       } catch (error) {
//         console.error("Error fetching location suggestions:", error);
//       }
//     }, 1000)
//   );

//   const getCurrentLocation = () => {
//     setLoading(true);
//     if ("geolocation" in navigator) {
//       navigator.geolocation.getCurrentPosition(async (position) => {
//         const { latitude, longitude } = position.coords;
//         try {
//           const response = await axios.get(
//             `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
//           );
//           const data = response.data;
//           const address = data.address;
//           const locationData = {
//             name: data.display_name,
//             zip: address.postcode || "",
//             latitude: latitude,
//             longitude: longitude,
//           };

//           setFormData((prevData) => ({
//             ...prevData,
//             city: address.city || address.town || address.village || "",
//             state: address.state || "",
//             country: address.country || "",
//             postalCode: address.postcode || "",
//             location: locationData,
//           }));

//           const foundCountry = allCountries.find(
//             (c) => c.name.toLowerCase() === (address.country || "").toLowerCase()
//           );
//           if (foundCountry) {
//             const countryObj = {
//               id: foundCountry.iso2.toUpperCase(),
//               name: foundCountry.name,
//               isoCode: foundCountry.iso2.toUpperCase(),
//             };
//             setSelectedCountry(countryObj);
//           }

//           setQuery(data.display_name);
//           setLoading(false);
//         } catch (error) {
//           setLoading(false);
//           console.error("Error fetching current location:", error);
//         }
//       });
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     const requiredFields = [
//       "company",
//       "firstName",
//       "lastname",
//       "position",
//       "email",
//       "password",
//       "telephoneNumber",
//       "street1",
//       "suburb",
//       "postalCode",
//       "country",
//       "area",
//       "standby",
//       "availability",
//     ];

//     requiredFields.forEach((field) => {
//       if (!formData[field] || formData[field].toString().trim() === "") {
//         newErrors[field] = `${
//           field.charAt(0).toUpperCase() + field.slice(1)
//         } is required`;
//       }
//     });

//     if (
//       formData.prohibitedAdvertising.other &&
//       !formData.prohibitedAdvertising.otherSpecify.trim()
//     ) {
//       newErrors.prohibitedAdvertisingOther = "Please specify the other prohibited advertising type";
//     }

//     const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
//     if (formData.email && !emailRegex.test(formData.email)) {
//       newErrors.email = "Email format is invalid";
//     }

//     if (formData.website && formData.website.trim() !== "") {
//       const urlRegex =
//         /^(https?:\/\/)?(www\.)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/;
//       if (!urlRegex.test(formData.website)) {
//         newErrors.website =
//           "Please enter a valid website URL (e.g., example.com or www.example.com)";
//       }
//     }

//     const passwordRegex =
//       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
//     if (formData.password && !passwordRegex.test(formData.password)) {
//       newErrors.password =
//         "Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character";
//     }

//     const phoneRegex = /^[0-9]{10,15}$/;
//     if (formData.telephoneNumber && !phoneRegex.test(formData.telephoneNumber)) {
//       newErrors.telephoneNumber = "Phone number must be 10-15 digits";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

// const updatePhoneCode = (isoCode) => {
//   const country = allCountries.find(c => c.iso2 === isoCode);

//   if (country) {
//     const code = country.dialCode.replace("+", "");
//     setCountryPhoneCode(code);

//     // Update both the country object AND the form data
//     setSelectedCountry({
//       id: isoCode,
//       name: country.name,
//       isoCode: isoCode
//     });

//     setFormData(prev => ({
//       ...prev,
//       telephoneAreaCode: code
//     }));
//   }
// };
//   const handleRegister = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     const registrationData = {
//       firstName: formData.firstName,
//       lastname: formData.lastname,
//       email: formData.email,
//       password: formData.password,
//       position: formData.position,
//       company: formData.company,
//      telephoneAreaCode: formData.telephoneAreaCode,
//       telephoneNumber: formData.telephoneNumber,
//       street1: formData.street1,
//       street2: formData.street2,
//       suburb: formData.suburb,
//       city: formData.city,
//       state: formData.state,
//       location: {
//         name: formData.locationName || formData.location?.name || "",
//         zip: formData.postalCode || "",
//         latitude: formData.location?.latitude || null,
//         longitude: formData.location?.longitude || null,
//       },
//       postalCode: formData.postalCode,
//       country: formData.country,
//       website: formData.website,
//       employees: formData.employees,
//       yearsInBusiness: formData.yearsInBusiness,
//       userType: "fleetOwner",
//       fleetOwnerDetails: {
//         area: formData.area,
//         deliveryVans: formData.deliveryVans || 0,
//         boxVans: formData.boxVans || 0,
//         longHaul: formData.longHaul || 0,
//         standby: formData.standby,
//         availability: formData.availability,
//         prohibitedAdvertising: formData.prohibitedAdvertising
//       },
//     };

//     dispatch(register(registrationData));
//   };

//   const renderInput = (name, placeholder, type = "text", required = false) => (
//     <div className="w-full mb-3">
//       <label htmlFor={name} className="block mb-1 text-white">
//         {placeholder} {required && <span className="text-red-500">*</span>}
//       </label>
//       <input
//         id={name}
//         name={name}
//         type={type}
//         value={formData[name]}
//         onChange={handleChange}
//         placeholder={placeholder}
//         min={type === "number" ? "0" : undefined}
//         className={`w-full pl-5 py-3 rounded text-white bg-[#0E294D] placeholder-body-text-color outline-none border ${
//           errors[name] ? "border-red-500" : "border-border-info-color"
//         } focus:border-theme-color`}
//       />
//       {errors[name] && (
//         <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
//       )}
//     </div>
//   );

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       {currentStep === 1 ? (
//         <div className="bg-[#0E294D] rounded-xl shadow-lg overflow-hidden">
//           <div className="bg-[#1E3A8A] p-4 text-center">
//             <h1 className="text-2xl font-bold text-white">
//               Fleet Owner Registration
//             </h1>
//           </div>
//           <div className="p-4">
//             <div className="bg-[#0E1F3D] rounded-lg p-4 mb-6">
//               <h2 className="text-lg font-semibold text-white mb-4 text-center">
//                 Fleet Benefits
//               </h2>
//               <div className="relative h-64 overflow-hidden rounded-lg">
//                 {slides.map((slide, index) => (
//                   <div
//                     key={index}
//                     className={`absolute inset-0 p-4 transition-opacity duration-1000 ${
//                       index === mainSlide ? "opacity-100" : "opacity-0"
//                     }`}
//                   >
//                     <div className="bg-[#0E294D] p-4 rounded-lg h-full flex flex-col">
//                       <h3 className="text-lg font-semibold text-white mb-2">
//                         {slide.title}
//                       </h3>
//                       <p className="text-sm text-slate-300 flex-grow">
//                         {slide.content}
//                       </p>
//                       <div className="mt-2 text-center text-xs text-slate-400">
//                         {index + 1} of {slides.length}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//                 <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
//                   {slides.map((_, index) => (
//                     <button
//                       key={index}
//                       className={`w-2 h-2 rounded-full transition-all ${
//                         index === mainSlide ? "bg-white w-4" : "bg-gray-600"
//                       }`}
//                       onClick={() => {
//                         setMainSlide(index);
//                         handleInteraction();
//                       }}
//                     />
//                   ))}
//                 </div>
//               </div>
//               {getBannerContent() && (
//                 <AnimatedBanner delay={500}>
//                   <div className="w-full mb-6 p-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg border border-blue-500/30">
//                     <h2 className="text-2xl font-bold text-white mb-3 text-center">
//                       {getBannerContent().title}
//                     </h2>
//                     <p className="text-blue-100 text-sm leading-relaxed text-center">
//                       {getBannerContent().content}
//                     </p>
//                   </div>
//                 </AnimatedBanner>
//               )}
//             </div>
//             <button
//               onClick={() => setCurrentStep(2)}
//               className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg text-lg transition"
//             >
//               Get Started
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className="bg-[#0E294D] rounded-xl shadow-lg overflow-hidden">
//           <div className="p-4">
//             {selectedRole === "fleet-owner" && (
//               <div className="w-full mt-6 p-6 bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-lg border border-green-500/30">
//                 <h3 className="text-xl font-bold text-white mb-4 text-center">
//                   Additional Benefits for Vehicle Owners
//                 </h3>
//                 <div className="relative">
//                   <div
//                     className="text-center transition-all duration-500 ease-in-out"
//                     key={benefitSlide}
//                   >
//                     {benefits.length > 0 && benefitSlide >= 0 && benefitSlide < benefits.length ? (
//                       <>
//                         <h4 className="font-semibold text-green-300 mb-2">
//                           {benefits[benefitSlide].title}
//                         </h4>
//                         <p className="text-gray-300 mb-4">
//                           {benefits[benefitSlide].description}
//                         </p>
//                         <p className="text-blue-300 font-semibold">
//                           {benefits[benefitSlide].cta}
//                         </p>
//                       </>
//                     ) : (
//                       <p className="text-gray-300">Loading benefits...</p>
//                     )}
//                   </div>
//                   <button
//                     onClick={prevBenefitSlide}
//                     className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white hover:text-blue-300 focus:outline-none"
//                   >
//                     <svg
//                       className="w-6 h-6"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M15 19l-7-7 7-7"
//                       />
//                     </svg>
//                   </button>
//                   <button
//                     onClick={nextBenefitSlide}
//                     className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-blue-300 focus:outline-none"
//                   >
//                     <svg
//                       className="w-6 h-6"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M9 5l7 7-7 7"
//                       />
//                     </svg>
//                   </button>
//                   <div className="flex justify-center mt-4 space-x-2">
//                     {benefits.map((_, index) => (
//                       <div
//                         key={index}
//                         className={`w-2 h-2 rounded-full ${
//                           benefitSlide === index ? "bg-blue-500" : "bg-gray-500"
//                         } cursor-pointer`}
//                         onClick={() => {
//                           setBenefitSlide(index);
//                           handleInteraction();
//                         }}
//                       ></div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//           <form onSubmit={handleRegister} className="space-y-4 p-4">
//             <div className="bg-[#0E1F3D] rounded-lg p-4">
//               <h3 className="text-lg font-semibold text-white mb-3 border-b border-slate-700 pb-2">
//                 Personal Information
//               </h3>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 {renderInput("firstName", "First Name", "text", true)}
//                 {renderInput("lastname", "Last Name", "text", true)}
//                 {renderInput("position", "Position", "text", true)}
//                 {renderInput("email", "Email", "email", true)}

//                 <div className="sm:col-span-2">
//                   <label className="block mb-1 text-white text-sm">
//                     Password <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <input
//                       name="password"
//                       type={showPassword ? "text" : "password"}
//                       value={formData.password}
//                       onChange={handleChange}
//                       placeholder="Password"
//                       className={`w-full pl-3 pr-8 py-2 rounded text-sm text-white bg-[#0E294D] placeholder-gray-400 outline-none border ${
//                         errors.password
//                           ? "border-red-500"
//                           : "border-border-info-color"
//                       }`}
//                     />
//                    <button
//   type="button"
//   onClick={() => setShowPassword(!showPassword)}
//   className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
//   aria-label={showPassword ? "Hide password" : "Show password"}
// >
//   {showPassword ? (
//     <FaEyeSlash className="w-5 h-5" />
//   ) : (
//     <FaEye className="w-5 h-5" />
//   )}
// </button>
//                   </div>
//                   {errors.password && (
//                     <p className="text-red-500 text-sm mt-1">{errors.password}</p>
//                   )}
//                 </div>
//                 <div className="sm:col-span-2">
//  <label htmlFor="telephoneNumber" className="block mb-1 text-white">
//     Phone Number <span className="text-red-500">*</span>
//   </label>

//  <CountryPhoneSelector
//     value={formData.telephoneNumber}
//     onChange={handlePhoneChange}
//     onCountryChange={handleCountryChange}
//     currentPhoneCode={countryPhoneCode}
//     placeholder="Phone Number"
//     required={true}
//     error={phoneError}
//   />
// </div>
// </div>
//             </div>
//             <div className="bg-[#0E1F3D] rounded-lg p-4">
//               <h3 className="text-lg font-semibold text-white mb-3 border-b border-slate-700 pb-2">
//                 Company Information
//               </h3>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 {renderInput("company", "Company", "text", true)}
//                 {renderInput("website", "Website Address", "text")}
//                 {renderInput("employees", "Employees", "number")}
//                 {renderInput("yearsInBusiness", "Years in Business", "number")}
//               </div>
//             </div>
//             <div className="bg-[#0E1F3D] rounded-lg p-4">
//               <h3 className="text-lg font-semibold text-white mb-3 border-b border-slate-700 pb-2">
//                 Address
//               </h3>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 {renderInput("street1", "Street 1", "text", true)}
//                 {renderInput("street2", "Street 2", "text")}
//                 <div className="sm:col-span-2">
//                   <label className="block mb-1 text-white text-sm">
//                     Postal/Zip Code<span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="text"
//                       id="postalCode"
//                       name="postalCode"
//                       value={query}
//                       onChange={handleInputChange}
//                       required
//                       placeholder="Enter location to find postal code"
//                       className="w-full pl-3 pr-8 py-2 rounded text-sm text-white bg-[#0E294D] placeholder-gray-400 outline-none border border-border-info-color"
//                     />
//                     <BiCurrentLocation
//                       size={24}
//                       className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white"
//                       onClick={getCurrentLocation}
//                       aria-label="Get current location"
//                       tabIndex={0}
//                     />
//                     {loading && (
//                       <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                       </div>
//                     )}
//                     {suggestions.length > 0 && (
//                       <ul className="absolute top-full left-0 w-full z-50 rounded-md border border-gray-300 bg-[rgb(7,27,54)] text-white shadow-lg max-h-48 overflow-y-auto mt-1">
//                         {suggestions.map((suggestion, index) => (
//                           <li
//                             key={index}
//                             onClick={() => handleLocationSelect(suggestion)}
//                             className="cursor-pointer p-2 hover:bg-gray-700"
//                           >
//                             {suggestion.display_name}
//                           </li>
//                         ))}
//                       </ul>
//                     )}
//                   </div>
//                   {errors.postalCode && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.postalCode}
//                     </p>
//                   )}
//                 </div>
//                 {renderInput("suburb", "Suburb", "text", true)}
//                <div className="sm:col-span-2">
//                   <AddressSelector
//                     formData={formData}
//                     setFormData={setFormData}
//                     errors={errors}
//                     setErrors={setErrors}
//                     updatePhoneCode={updatePhoneCode}
//                   />
//                 </div>
//                 </div>
//                 </div>
//             <div className="bg-[#0E1F3D] rounded-lg p-4">
//               <h3 className="text-lg font-semibold text-white mb-3 border-b border-slate-700 pb-2">
//                 Fleet Details
//               </h3>
//               <div className="mb-4">
//                 <label className="block text-white text-sm mb-2">
//                   Operating Area <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex flex-wrap gap-4">
//                  {["Local", "State/County Wide", "National"].map((area) => (
//   <label
//     key={area}
//     className="flex items-center space-x-2 text-sm cursor-pointer"
//   >
//     <input
//       type="radio"
//       name="area"
//       value={area}
//       checked={formData.area === area}
//       onChange={handleChange}
//       className="h-4 w-4 text-blue-600 bg-[#0E294D] border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
//     />
//     <span className="text-slate-300">{area}</span>
//   </label>
// ))}
//                 </div>
//                 {errors.area && (
//                   <p className="text-red-500 text-sm mt-2">{errors.area}</p>
//                 )}
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
//                 {renderInput("deliveryVans", "Delivery Vans", "number")}
//                 {renderInput("boxVans", "Box Vans", "number")}
//                 {renderInput("longHaul", "Long Haul", "number")}
//               </div>
//               <div className="mb-4">
//                 <label className="block text-white text-sm font-medium mb-2">
//                   Stand-By Vehicles <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex flex-wrap gap-4">
//                   {["Yes", "No"].map((option) => (
//                     <label
//                       key={option}
//                       className="flex items-center space-x-2 text-sm cursor-pointer"
//                     >
//                       <input
//                         type="radio"
//                         name="standby"
//                         value={option}
//                         checked={formData.standby === option}
//                         onChange={handleChange}
//                         className="h-4 w-4 text-blue-600 bg-[#0E294D] border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
//                       />
//                       <span className="text-slate-300">{option}</span>
//                     </label>
//                   ))}
//                 </div>
//                 {errors.standby && (
//                   <p className="text-red-500 text-sm mt-2">{errors.standby}</p>
//                 )}
//               </div>
//               <div className="mb-4">
//                 <label className="block text-white text-sm font-medium mb-2">
//                   Vehicle Availability <span className="text-red-500">*</span>
//                 </label>
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                   {["3 Months", "6 Months", "12 Months", "24 Months"].map(
//                     (val) => (
//                       <label
//                         key={val}
//                         className="flex items-center space-x-2 text-sm cursor-pointer"
//                       >
//                         <input
//                           type="radio"
//                           name="availability"
//                           value={val}
//                           checked={formData.availability === val}
//                           onChange={handleChange}
//                           className="h-4 w-4 text-blue-600 bg-[#0E294D] border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
//                         />
//                         <span className="text-slate-300">{val}</span>
//                       </label>
//                     )
//                   )}
//                 </div>
//                 {errors.availability && (
//                   <p className="text-red-500 text-sm mt-2">{errors.availability}</p>
//                 )}
//               </div>
//               <div className="bg-[#0E1F3D] rounded-lg p-4 border border-slate-700">
//                 <h3 className="text-lg font-semibold text-white mb-3">
//                   Prohibited Ads
//                 </h3>
//                 <div className="flex flex-wrap gap-6">
//                   {["gambling", "alcohol", "smoking"].map((type) => (
//                     <label
//                       key={type}
//                       className="flex items-center space-x-2 text-sm cursor-pointer"
//                     >
//                       <input
//                         type="checkbox"
//                         name={`prohibitedAdvertising.${type}`}
//                         checked={formData.prohibitedAdvertising[type]}
//                         onChange={handleChange}
//                         className="h-4 w-4 text-blue-600 bg-[#0E294D] rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
//                       />
//                       <span className="text-slate-300 capitalize">{type}</span>
//                     </label>
//                   ))}
//                   <div className="flex items-center space-x-2">
//                     <label className="flex items-center space-x-2 text-sm cursor-pointer">
//                       <input
//                         type="checkbox"
//                         name="prohibitedAdvertising.other"
//                         checked={formData.prohibitedAdvertising.other}
//                         onChange={handleChange}
//                         className="h-4 w-4 text-blue-600 bg-[#0E294D] rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
//                       />
//                       <span className="text-slate-300">Other</span>
//                     </label>
//                     {formData.prohibitedAdvertising.other && (
//                       <div className="ml-2 flex-1">
//                         <input
//                           type="text"
//                           name="prohibitedAdvertising.otherSpecify"
//                           placeholder="Please specify"
//                           className="w-full px-3 py-2 bg-[#0E294D] border border-gray-300 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
//                           value={formData.prohibitedAdvertising.otherSpecify}
//                           onChange={handleChange}
//                         />
//                         {errors.prohibitedAdvertisingOther && (
//                           <p className="text-red-500 text-sm mt-2">
//                             {errors.prohibitedAdvertisingOther}
//                           </p>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="text-center pt-2">
//               <button
//                 type="submit"
//                 className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded text-sm transition disabled:opacity-50"
//                 disabled={authLoading}
//               >
//                 {authLoading ? "Registering..." : "Complete Registration"}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FleetRegistrationForm;
