import React, { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { register, reset } from "../store/auth/authSlice";
import { useNavigate } from "react-router-dom";
import _ from "lodash";
import axios from "axios";
import { BiCurrentLocation } from "react-icons/bi";
import { allCountries } from "country-telephone-data";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import worldData from "../countries+states+cities.json";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getStatisticsByCountry } from "../store/statistic/statisticSlice";
import { fetchUserCountry } from "../store/countary/countrySlice";
const FleetOwnerLandingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeFaq, setActiveFaq] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    firstName: "",
    lastname: "",
    position: "",
    email: "",
    password: "",
    telephoneAreaCode: "44",
    telephoneNumber: "",
    street1: "",
    street2: "",
    suburb: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
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
    location: {
      name: "",
      zip: "",
      latitude: null,
      longitude: null,
    },
    countryData: null,
  });

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [currentCountryCode, setCurrentCountryCode] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [countryPhoneCode, setCountryPhoneCode] = useState("44");
  const [phoneCode, setPhoneCode] = useState("44");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [phoneError, setPhoneError] = useState("");
    const { statistics, isLoading } = useSelector((state) => state.statistic);
  const { country } = useSelector((state) => state.country);
   
  const {
    isLoading: authLoading,
    isError,
    isSuccess,
    message,
  } = useSelector((state) => state.auth);
const fleetOwner =
    statistics
      ?.filter((item) => item.videoType === "fleetOwner")

      ?.flatMap((item) => item.sources || []) || [];
  const isYouTubeUrl = (url) => {
    return url && (url.includes("youtube.com") || url.includes("youtu.be"));
  };

  const extractVideoId = (url) => {
    if (!url) return null;

    const cleanUrl = url.trim();

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;

    const match = cleanUrl.match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
  };
  // FAQs - exactly 5 as per HTML
  const faqs = [
    {
      question:
        "Can I use my vehicle to promote my own business instead of advertising for others?",
      answer:
        "Absolutely! Many vehicle owners and fleet managers choose to wrap their vehicles to promote their own brands. If you believe advertising your own business delivers greater benefits, our wrap specialists are here to support that.",
    },
    {
      question: "Is the income from advertising short-term or long-term?",
      answer:
        "Advertisers make a substantial investment in vehicle design and wrapping, so they generally plan for long-term partnerships.",
    },
    {
      question:
        "How can I increase my competitiveness in the auction process without lowering my square metre rate?",
      answer:
        "Adding value, such as providing the first two months free, can offset initial installation costs and build rewarding relationships without lowering your base rate.",
    },
    {
      question: "How do I know if my subscription is worth it?",
      answer:
        "Consider the ROI. A $30,000 annual booking for a $360 subscription is over 8,000% ROI, plus paint protection and reduced theft risk.",
    },
    {
      question: "Are there limited spots available for vehicle advertising?",
      answer:
        "Yes. We restrict subscriptions in each area until projected demand matches supply to ensure quality for early adopters.",
    },
  ];

  // Address Selector States
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    setCountries(worldData);
  }, []);
 useEffect(() => {
      dispatch(fetchUserCountry());
    }, [dispatch]);
  useEffect(() => {
    if (country) {
      dispatch(getStatisticsByCountry(country));
    }
  }, [dispatch, country]);
  // Initialize selected country from formData
  useEffect(() => {
    if (formData.country && countries.length > 0 && !selectedCountry) {
      const country = countries.find(
        (c) => c.name === formData.country || c.id === formData.country,
      );
      if (country) {
        setSelectedCountry(country);
        setStates(country.states || []);
      }
    }
  }, [formData.country, countries]);

  useEffect(() => {
    if (isSuccess) {
      dispatch(reset());
      navigate("/login");
    } else if (isError) {
      toast.error(message || "User already exists", {
        autoClose: 2000,
      });
      dispatch(reset());
    }
  }, [isSuccess, isError, message, dispatch, navigate]);
  useEffect(() => {
    if (!selectedCountry && phoneCode === "44") {
      const defaultCountry = allCountries.find((c) => c.dialCode === "+44");
      if (defaultCountry) {
        setSelectedCountry(defaultCountry);
        setPhoneCode(defaultCountry.dialCode.replace("+", ""));
        setFormData((prev) => ({
          ...prev,
          telephoneAreaCode: defaultCountry.dialCode.replace("+", ""),
        }));
      }
    }
  }, [selectedCountry, phoneCode]);
  const getCountryCode = () => {
    if (!formData.country) return null;

    if (typeof formData.country === "object" && formData.country !== null) {
      return formData.country.iso2 || formData.country.isoCode || null;
    }

    if (formData.countryData && formData.countryData.iso2) {
      return formData.countryData.iso2;
    }

    const countryMapping = {
      India: "IN",
      "United States": "US",
      "United Kingdom": "GB",
      Canada: "CA",
      Australia: "AU",
      Germany: "DE",
      France: "FR",
      Italy: "IT",
      Spain: "ES",
      Japan: "JP",
      China: "CN",
      Brazil: "BR",
      Mexico: "MX",
      "South Africa": "ZA",
      "New Zealand": "NZ",
    };

    return countryMapping[formData.country] || null;
  };

  const getCountryName = () => {
    if (!formData.country) return "";

    if (typeof formData.country === "object") {
      return formData.country.name;
    }
    return formData.country;
  };

  const isDisabled = !formData.country;

  // Debounced search function
  const debounceRef = useRef(
    _.debounce(async (searchQuery, countryCode, countryName) => {
      if (!searchQuery || searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      if (!countryCode) {
        setValidationMessage(
          "Please select a country first from the address section",
        );
        return;
      }

      setLoading(true);

      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search`,
          {
            params: {
              q: searchQuery,
              format: "json",
              addressdetails: 1,
              limit: 10,
              countrycodes: countryCode.toLowerCase(),
            },
          },
        );

        const filteredResults = response.data.filter((item) => {
          const itemCountryCode =
            item.address?.country_code?.toUpperCase() || "";
          return itemCountryCode === countryCode.toUpperCase();
        });

        if (filteredResults.length === 0) {
          setValidationMessage(
            `No locations found in ${countryName}. Please enter a valid location from ${countryName}.`,
          );
          toast.warning(`Please enter a location from ${countryName} only`, {
            autoClose: 3000,
          });
        } else {
          setValidationMessage("");
        }

        setSuggestions(filteredResults);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
        setSuggestions([]);
        setLoading(false);
        setValidationMessage("Error fetching locations. Please try again.");
      }
    }, 1000),
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!formData.country) {
      setValidationMessage(
        "⚠️ Please select a country first from the address section",
      );
      toast.warning("Please select a country first", { autoClose: 2000 });
      return;
    }

    const countryCode = getCountryCode();
    const countryName = getCountryName();

    if (!countryCode) {
      setValidationMessage(
        "⚠️ Could not determine country code. Please select country again.",
      );
      toast.warning("Please select country from the dropdown", {
        autoClose: 2000,
      });
      return;
    }

    setValidationMessage("");
    debounceRef.current(value, countryCode, countryName);
  };

  const handleLocationSelect = (suggestion) => {
    const address = suggestion.address;
    const countryCode = getCountryCode();
    const countryName = getCountryName();

    if (!countryCode) {
      toast.error("Please select a country first", { autoClose: 2000 });
      return;
    }

    const suggestionCountryCode = address?.country_code?.toUpperCase() || "";

    if (suggestionCountryCode !== countryCode.toUpperCase()) {
      const message = `❌ You can only add zip codes from ${countryName}. This location is from ${
        address?.country || "another country"
      }.`;

      setValidationMessage(message);
      toast.error(
        `You can only select locations from ${countryName}. Please select a location from ${countryName} only.`,
        { autoClose: 4000 },
      );
      return;
    }

    const locationData = {
      name: suggestion.display_name,
      zip: address.postcode || "",
      latitude: parseFloat(suggestion.lat) || null,
      longitude: parseFloat(suggestion.lon) || null,
    };

    setFormData((prev) => ({
      ...prev,
      city: address.city || address.town || address.village || prev.city || "",
      state: address.state || prev.state || "",
      postalCode: address.postcode || "",
      location: locationData,
    }));

    setQuery(suggestion.display_name);
    setSuggestions([]);
    setValidationMessage("");

    setErrors((prev) => ({ ...prev, postalCode: "" }));
  };

  const getCurrentLocation = () => {
    if (!formData.country) {
      setValidationMessage(
        "⚠️ Please select a country first from the address section",
      );
      toast.warning("Please select a country before using current location", {
        autoClose: 2000,
      });
      return;
    }

    const countryCode = getCountryCode();
    const countryName = getCountryName();

    if (!countryCode) {
      toast.warning("Please select country from the dropdown", {
        autoClose: 2000,
      });
      return;
    }

    setLoading(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse`,
              {
                params: {
                  format: "json",
                  lat: latitude,
                  lon: longitude,
                  addressdetails: 1,
                },
              },
            );

            const data = response.data;
            const address = data.address;

            const locationCountryCode =
              address?.country_code?.toUpperCase() || "";

            if (locationCountryCode !== countryCode.toUpperCase()) {
              const message = `❌ Your current location is in ${
                address?.country || "another country"
              }. You can only add zip codes from ${countryName}.`;

              setValidationMessage(message);
              toast.error(
                `Your current location is in ${address?.country || "another country"}. You selected ${countryName} in the address section, so you can only add zip codes from ${countryName}.`,
                { autoClose: 6000 },
              );
              setLoading(false);
              return;
            }

            const locationData = {
              name: data.display_name,
              zip: address.postcode || "",
              latitude: latitude,
              longitude: longitude,
            };

            setFormData((prevData) => ({
              ...prevData,
              city:
                address.city ||
                address.town ||
                address.village ||
                prevData.city ||
                "",
              state: address.state || prevData.state || "",
              postalCode: address.postcode || "",
              location: locationData,
            }));

            setQuery(data.display_name);
            setValidationMessage("");
            setLoading(false);
          } catch (error) {
            setLoading(false);
            console.error("Error fetching current location:", error);
            setValidationMessage("Unable to fetch current location");
            toast.error("Unable to fetch current location", {
              autoClose: 2000,
            });
          }
        },
        (error) => {
          setLoading(false);
          console.error("Geolocation error:", error);
          setValidationMessage("Location access denied or unavailable");
          toast.error("Location access denied or unavailable", {
            autoClose: 2000,
          });
        },
      );
    } else {
      setLoading(false);
      setValidationMessage("Geolocation is not supported by this browser");
      toast.error("Geolocation is not supported", { autoClose: 2000 });
    }
  };

  // Update query when formData.location changes
  useEffect(() => {
    if (formData.location?.name && !query) {
      setQuery(formData.location.name);
    }
  }, [formData.location?.name]);

  // Clear zip code when country changes
  useEffect(() => {
    const newCountryCode = getCountryCode();

    if (currentCountryCode !== null && currentCountryCode !== newCountryCode) {
      setQuery("");
      setSuggestions([]);
      setValidationMessage("");

      setFormData((prev) => ({
        ...prev,
        postalCode: "",
        location: {
          ...prev.location,
          zip: "",
        },
      }));
    }

    setCurrentCountryCode(newCountryCode);
  }, [formData.country]);

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, telephoneNumber: value }));

    if (!/^\d{7,15}$/.test(value) && value.length > 0) {
      setPhoneError("Please enter a valid phone number (7-15 digits)");
    } else {
      setPhoneError("");
    }
  };

  const handleCountrySelect = (country) => {
    const code = country.dialCode.replace("+", "");
    setPhoneCode(code);
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchQuery("");

    setFormData((prev) => ({
      ...prev,
      telephoneAreaCode: code,
    }));
  };

  // Filter countries based on search query
  const filteredCountries = allCountries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery),
  );

  const handleCountryChange = (countryId) => {
    const countryIdNum = parseInt(countryId);
    const country = countries.find((c) => c.id === countryIdNum);

    setSelectedCountry(country);
    setSelectedState(null);

    setStates(country?.states || []);
    setCities([]);

    setFormData((prev) => ({
      ...prev,
      country: country?.name || "",
      countryData: country || null,
      state: "",
      city: "",
    }));

    updatePhoneCode(country?.phonecode || "");

    clearError("country");
  };

  const handleStateChange = (stateId) => {
    const stateIdNum = parseInt(stateId);
    const state = states.find((s) => s.id === stateIdNum);

    setSelectedState(state);
    setCities(state?.cities || []);

    setFormData((prev) => ({
      ...prev,
      state: state?.name || "",
      city: "",
    }));

    clearError("state");
  };

  const handleCityChange = (cityName) => {
    setFormData((prev) => ({
      ...prev,
      city: cityName,
    }));
    clearError("city");
  };

  const clearError = (field) => {
    if (errors?.[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const updatePhoneCode = (isoCode) => {
    const country = allCountries.find((c) => c.iso2 === isoCode);

    if (country) {
      const code = country.dialCode.replace("+", "");
      setCountryPhoneCode(code);
      setPhoneCode(code);

      setSelectedCountry({
        id: isoCode,
        name: country.name,
        iso2: isoCode,
      });

      setFormData((prev) => ({
        ...prev,
        telephoneAreaCode: code,
      }));
    }
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

  const renderPhoneInput = (value, onChange, placeholder, required, error) => {
    // Helper to convert iso2 to flag emoji
    const getFlagEmoji = (iso2) => {
      if (!iso2) return "🌐";
      const codePoints = iso2
        .toUpperCase()
        .split("")
        .map((ch) => 127397 + ch.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    };

    return (
      <div className="relative w-full">
        <label className="block text-[10px] font-bold text-zinc-500 tracking-[0.3em] mb-3">
          Phone Number <span className="text-orange-500">*</span>
        </label>

        <div className="flex">
          {/* Country Code Dropdown Button */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between gap-2 bg-zinc-900 border border-zinc-800 rounded-l-xl px-4 py-4 min-w-[120px] group cursor-pointer hover:bg-zinc-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              {selectedCountry ? (
                <span className="text-2xl">
                  {selectedCountry.flag ||
                    getFlagEmoji(selectedCountry.iso2) ||
                    "🌐"}
                </span>
              ) : (
                <span className="text-xl">🌐</span>
              )}
              <span className="font-medium text-white/90">+{phoneCode}</span>
            </span>
            <svg
              className={`w-4 h-4 text-zinc-400 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Phone Number Input */}
          <input
            type="tel"
            value={value}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/\D/g, "");
              onChange(numericValue);
            }}
            placeholder={placeholder || "PHONE NUMBER"}
            maxLength="15"
            inputMode="numeric"
            pattern="[0-9]*"
            required={required}
            className={`flex-1 bg-zinc-900 border ${
              error ? "border-red-500" : "border-zinc-800"
            } rounded-r-xl px-6 py-4 text-white focus:border-orange-500 outline-none text-xs placeholder:text-zinc-600`}
          />
        </div>

        {error && (
          <p className="text-red-500 text-xs mt-2 flex items-center gap-1 bg-red-500/10 p-2 rounded-lg">
            <span className="text-red-500">⚠️</span>
            {error}
          </p>
        )}

        {/* Country Dropdown Menu */}
        {isDropdownOpen && (
          <>
            <div className="absolute top-[calc(100%+8px)] left-0 w-80 z-50">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
                {/* Search Header */}
                <div className="p-3 border-b border-zinc-800 bg-zinc-900/95">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search country..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm focus:border-orange-500 outline-none placeholder:text-zinc-600 pl-10"
                      autoFocus
                    />
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Country List */}
                <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          handleCountrySelect(country);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-orange-600/20 hover:to-orange-800/20 transition-all duration-200 flex items-center gap-3 border-b border-zinc-800/50 last:border-b-0 ${
                          selectedCountry?.iso2 === country.iso2
                            ? "bg-gradient-to-r from-orange-600/30 to-orange-800/30 border-l-2 border-l-orange-500"
                            : ""
                        }`}
                      >
                        <span className="text-2xl">
                          {country.flag || getFlagEmoji(country.iso2) || "🌐"}
                        </span>
                        <div className="flex-1">
                          <span className="text-white text-sm font-medium block">
                            {country.name}
                          </span>
                          <span className="text-orange-500/70 text-xs">
                            +{country.dialCode}
                          </span>
                        </div>
                        {selectedCountry?.iso2 === country.iso2 && (
                          <svg
                            className="w-5 h-5 text-orange-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-zinc-400 text-sm">
                        No countries found
                      </p>
                      <p className="text-zinc-600 text-xs mt-1">
                        Try a different search term
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-black/30 border-t border-zinc-800">
                  <p className="text-[10px] text-zinc-600 tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                    Auto-detected from your IP: +{phoneCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsDropdownOpen(false)}
            />
          </>
        )}
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500 selection:text-white">
      {/* Navigation */}
      {/* <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path
                  d="M20 5L35 32H5L20 5Z"
                  stroke="#FF3D00"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <circle cx="20" cy="22" r="6" fill="#FF3D00" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tighter text-white uppercase italic leading-none">
                AUCTION
              </span>
              <span className="text-[9px] text-orange-500 font-bold tracking-[0.3em] uppercase">
                Rule 7 Media
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-10">
          <a
  href="#faq"
  className="text-zinc-400 hover:text-orange-500 transition-colors text-sm uppercase tracking-widest"
>
  FAQ
</a>
            <Link
               to="/register?role=fleet-owner"
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full text-sm font-bold tracking-widest transition-all uppercase"
            >
              Start Earning
            </Link>
          </div>
        </div>
      </nav> */}
      <Header />
      {/* Hero Section */}
  <header className="relative pt-12 pb-32 px-6">
  <div className="max-w-7xl mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left side - Text Content */}
      <div className="reveal active">
        <h1 className="text-6xl md:text-8xl font-bold leading-[0.9] mb-8 uppercase tracking-tighter">
          MONETIZE YOUR <br />
          <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent italic">
            ASSETS.
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-zinc-400 mb-12 leading-relaxed max-w-2xl font-light">
          Turn your fleet into a{" "}
          <span className="text-white font-medium italic">
            revenue engine
          </span>{" "}
          generating up to $300,000 lifetime value per vehicle.
        </p>

        <Link
          to="/register?role=fleet-owner"
          className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-5 rounded-full font-bold text-lg inline-flex items-center gap-3 uppercase tracking-tighter transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
        >
          Join the Auction
        </Link>
      </div>

      {/* Right side - Video Player */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-800 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
        <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
          {isLoading ? (
            <div className="aspect-video flex items-center justify-center bg-zinc-900">
              <div className="text-white">Loading video...</div>
            </div>
          ) : fleetOwner && fleetOwner.length > 0 ? (
            (() => {
              const video = fleetOwner[0];
              const videoUrl = Array.isArray(video.url) ? video.url[0]?.trim() : video.url?.trim();
              const isYoutube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
              
              const extractVideoId = (url) => {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                const match = url.match(regExp);
                return (match && match[2].length === 11) ? match[2] : null;
              };
              
              const videoId = isYoutube ? extractVideoId(videoUrl) : null;
              
              return (
                <>
                  {isYoutube && videoId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`}
                      title={video.description || "Video"}
                      className="w-full aspect-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      className="w-full aspect-video object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls={false}
                    >
                      <source src={videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  
                  {/* Video Description */}
                  <div className="p-5 bg-slate-900/50">
                    <h4 className="text-white font-bold text-lg">
                      {video.description || "Featured Video"}
                    </h4>
                  </div>
                </>
              );
            })()
          ) : (
            <div className="aspect-video flex items-center justify-center bg-zinc-900">
              <p className="text-slate-400">No video available</p>
            </div>
          )}
        </div>
        
      
      </div>
    </div>
  </div>
</header>

      {/* FAQ Section */}
      <section id="faq" className="py-32 px-6 bg-[#050505]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold uppercase tracking-tighter mb-4">
              Frequently Asked{" "}
              <span className="text-orange-500">Questions</span>
            </h2>
            <div className="w-24 h-1 bg-orange-600 mx-auto"></div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-zinc-900/30 rounded-2xl overflow-hidden border border-zinc-800/50"
              >
                <button
                  onClick={() =>
                    setActiveFaq(activeFaq === index ? null : index)
                  }
                  className="w-full text-left p-8 flex items-center justify-between group"
                >
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-4 pr-8">
                    <span className="text-orange-500">Q:</span>
                    <span>{faq.question}</span>
                  </h3>
                  <div
                    className={`w-10 h-10 shrink-0 rounded-full bg-zinc-800 flex items-center justify-center transition-all ${
                      activeFaq === index
                        ? "bg-orange-600 rotate-45"
                        : "group-hover:bg-orange-600"
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                  </div>
                </button>

                {activeFaq === index && (
                  <div className="p-8 pt-0 text-zinc-400 font-light leading-relaxed bg-zinc-900/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="register" className="py-32 px-6 bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#0A0A0A] border border-zinc-900 rounded-[3rem] overflow-hidden grid lg:grid-cols-2 items-stretch">
            {/* Left Side - Gradient Header */}
            <div className="p-16 lg:p-24 bg-gradient-to-br from-orange-700 via-orange-600 to-orange-500 flex flex-col justify-between">
              <div>
                <h2 className="text-5xl font-bold text-white uppercase italic tracking-tighter mb-8 leading-none">
                  Ready to <br />
                  start?
                </h2>
                <p className="text-white/90 text-lg mb-12 font-medium">
                  Join the waitlist. Slots are limited per region.
                </p>
              </div>
            </div>

            {/* Right Side - Form Fields */}
            <div className="p-16 lg:p-24 flex flex-col justify-center">
              <form onSubmit={handleRegister} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em] mb-6">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500  tracking-[0.3em] mb-3">
                        First Name <span className="text-orange-500">*</span>
                      </label>
                      <input
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full bg-zinc-900 border ${
                          errors.firstName
                            ? "border-red-500"
                            : "border-zinc-800"
                        } rounded-xl px-6 py-4 text-white focus:border-orange-500 outline-none  text-xs`}
                        placeholder="FIRST NAME"
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-xs mt-2">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500  tracking-[0.3em] mb-3">
                        Last Name <span className="text-orange-500">*</span>
                      </label>
                      <input
                        name="lastname"
                        type="text"
                        value={formData.lastname}
                        onChange={handleChange}
                        className={`w-full bg-zinc-900 border ${
                          errors.lastname ? "border-red-500" : "border-zinc-800"
                        } rounded-xl px-6 py-4 text-white focus:border-orange-500 outline-none  text-xs`}
                        placeholder="LAST NAME"
                      />
                      {errors.lastname && (
                        <p className="text-red-500 text-xs mt-2">
                          {errors.lastname}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500  tracking-[0.3em] mb-3">
                        Position <span className="text-orange-500">*</span>
                      </label>
                      <input
                        name="position"
                        type="text"
                        value={formData.position}
                        onChange={handleChange}
                        className={`w-full bg-zinc-900 border ${
                          errors.position ? "border-red-500" : "border-zinc-800"
                        } rounded-xl px-6 py-4 text-white focus:border-orange-500 outline-none  text-xs`}
                        placeholder="POSITION"
                      />
                      {errors.position && (
                        <p className="text-red-500 text-xs mt-2">
                          {errors.position}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500  tracking-[0.3em] mb-3">
                        Email <span className="text-orange-500">*</span>
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full bg-zinc-900 border ${
                          errors.email ? "border-red-500" : "border-zinc-800"
                        } rounded-xl px-6 py-4 text-white focus:border-orange-500 outline-none  text-xs`}
                        placeholder="EMAIL"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-2">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-zinc-500  tracking-[0.3em] mb-3">
                        Password <span className="text-orange-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          className={`w-full bg-zinc-900 border ${
                            errors.password
                              ? "border-red-500"
                              : "border-zinc-800"
                          } rounded-xl px-6 py-4 text-white focus:border-orange-500 outline-none  text-xs pr-12`}
                          placeholder="PASSWORD"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-6 text-gray-400 hover:text-white"
                        >
                          {showPassword ? (
                            <FaEyeSlash className="w-5 h-5" />
                          ) : (
                            <FaEye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-2">
                          {errors.password}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    {renderPhoneInput(
                      formData.telephoneNumber,
                      (value) => handlePhoneChange(value),
                      "PHONE NUMBER",
                      true,
                      phoneError,
                    )}
                  </div>
                </div>

                {/* Company Information */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em] mb-6">
                    Company Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-zinc-500  tracking-[0.3em] mb-3">
                        Company <span className="text-orange-500">*</span>
                      </label>
                      <input
                        name="company"
                        type="text"
                        value={formData.company}
                        onChange={handleChange}
                        className={`w-full bg-zinc-900 border ${
                          errors.company ? "border-red-500" : "border-zinc-800"
                        } rounded-xl px-6 py-4 text-white focus:border-orange-500 outline-none  text-xs`}
                        placeholder="COMPANY NAME"
                      />
                      {errors.company && (
                        <p className="text-red-500 text-xs mt-2">
                          {errors.company}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500  tracking-[0.3em] mb-3">
                        Website
                      </label>
                      <input
                        name="website"
                        type="text"
                        value={formData.website}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-white focus:border-orange-500 outline-none  text-xs"
                        placeholder="WEBSITE"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500  tracking-[0.3em] mb-3">
                        Employees
                      </label>
                      <input
                        name="employees"
                        type="number"
                        value={formData.employees}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-white focus:border-orange-500 outline-none uppercase text-xs"
                        placeholder="NUMBER OF EMPLOYEES"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500  tracking-[0.3em] mb-3">
                        Years in Business
                      </label>
                      <input
                        name="yearsInBusiness"
                        type="number"
                        value={formData.yearsInBusiness}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-white focus:border-orange-500 outline-none uppercase text-xs"
                        placeholder="YEARS IN BUSINESS"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em] mb-6">
                    Address
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3">
                        Street 1 <span className="text-orange-500">*</span>
                      </label>
                      <input
                        name="street1"
                        type="text"
                        value={formData.street1}
                        onChange={handleChange}
                        className={`w-full bg-zinc-900 border ${
                          errors.street1 ? "border-red-500" : "border-zinc-800"
                        } rounded-xl px-6 py-4 text-white focus:border-orange-500 outline-none  text-xs`}
                        placeholder="STREET ADDRESS"
                      />
                      {errors.street1 && (
                        <p className="text-red-500 text-xs mt-2">
                          {errors.street1}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-zinc-500  uppercase tracking-[0.3em] mb-3">
                        Street 2
                      </label>
                      <input
                        name="street2"
                        type="text"
                        value={formData.street2}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-white focus:border-orange-500 outline-none  text-xs"
                        placeholder="APT, SUITE, ETC"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3">
                        Suburb <span className="text-orange-500">*</span>
                      </label>
                      <input
                        name="suburb"
                        type="text"
                        value={formData.suburb}
                        onChange={handleChange}
                        className={`w-full bg-zinc-900 border ${
                          errors.suburb ? "border-red-500" : "border-zinc-800"
                        } rounded-xl px-6 py-4 text-white focus:border-orange-500 outline-none  text-xs`}
                        placeholder="SUBURB"
                      />
                      {errors.suburb && (
                        <p className="text-red-500 text-xs mt-2">
                          {errors.suburb}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3">
                      Country <span className="text-orange-500">*</span>
                    </label>
                    <select
                      value={selectedCountry?.id || ""}
                      required
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className={`w-full bg-zinc-900 border ${
                        errors?.country ? "border-red-500" : "border-zinc-800"
                      } rounded-xl px-6 py-4 text-white focus:border-orange-500 outline-none  text-xs`}
                    >
                      <option value="">Select Country</option>
                      {countries.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {errors?.country && (
                      <p className="text-red-500 text-xs mt-2">
                        {errors.country}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3">
                      State / County <span className="text-orange-500">*</span>
                    </label>
                    <select
                      value={selectedState?.id || ""}
                      onChange={(e) => handleStateChange(e.target.value)}
                      disabled={!selectedCountry}
                      className={`w-full bg-zinc-900 border ${
                        errors?.state ? "border-red-500" : "border-zinc-800"
                      } ${!selectedCountry ? "opacity-50 cursor-not-allowed" : ""} rounded-xl px-6 py-4 text-white focus:border-orange-500 outline-none uppercase text-xs`}
                    >
                      <option value="">Select State</option>
                      {states.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    {errors?.state && (
                      <p className="text-red-500 text-xs mt-2">
                        {errors.state}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3">
                      City <span className="text-orange-500">*</span>
                    </label>
                    <select
                      value={formData.city || ""}
                      onChange={(e) => handleCityChange(e.target.value)}
                      disabled={!selectedState}
                      className={`w-full bg-zinc-900 border ${
                        errors?.city ? "border-red-500" : "border-zinc-800"
                      } ${!selectedState ? "opacity-50 cursor-not-allowed" : ""} rounded-xl px-6 py-4 text-white focus:border-orange-500 outline-none uppercase text-xs`}
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    {errors?.city && (
                      <p className="text-red-500 text-xs mt-2">{errors.city}</p>
                    )}
                  </div>

                  <div className="w-full">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3">
                      Zip/Postal Code <span className="text-orange-500">*</span>
                    </label>

                    {isDisabled && (
                      <div className="mb-2 p-2 bg-yellow-900/30 border border-yellow-600/50 rounded text-yellow-400 text-sm flex items-center gap-2">
                        <span>⚠️</span>
                        <span>
                          Please select a country first from the address section
                          to enable zip code entry
                        </span>
                      </div>
                    )}

                    <div className="relative">
                      <input
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        placeholder={
                          isDisabled
                            ? "Select country first from address section"
                            : `Enter location from ${getCountryName()}`
                        }
                        disabled={isDisabled}
                        required
                        className={`w-full bg-zinc-900 border ${
                          errors?.postalCode || validationMessage
                            ? "border-red-500"
                            : "border-zinc-800"
                        } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""} rounded-xl px-6 py-4 text-white focus:border-orange-500 outline-none uppercase text-xs pr-12`}
                      />

                      {loading ? (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                      ) : (
                        <BiCurrentLocation
                          size={24}
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${
                            !isDisabled
                              ? "cursor-pointer hover:text-white"
                              : "cursor-not-allowed opacity-50"
                          }`}
                          onClick={!isDisabled ? getCurrentLocation : null}
                          aria-label="Get current location"
                          tabIndex={!isDisabled ? 0 : -1}
                        />
                      )}

                      {suggestions.length > 0 && (
                        <ul className="absolute top-full left-0 w-full z-50 rounded-xl border border-zinc-800 bg-zinc-900 text-white shadow-2xl max-h-60 overflow-y-auto mt-2">
                          {suggestions.map((suggestion, index) => (
                            <li
                              key={index}
                              onClick={() => handleLocationSelect(suggestion)}
                              className="cursor-pointer p-4 hover:bg-gradient-to-r hover:from-orange-600/20 hover:to-orange-800/20 border-b border-zinc-800 last:border-b-0 transition-all duration-200 group"
                            >
                              <div className="font-medium text-sm text-white group-hover:text-orange-400 transition-colors">
                                {suggestion.display_name}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-orange-500/70  tracking-wider">
                                  {suggestion.address?.postcode
                                    ? ` ${suggestion.address.postcode}`
                                    : " Location"}
                                </span>
                                <span className="text-xs text-zinc-500">•</span>
                                <span className="text-xs text-zinc-400">
                                  {suggestion.address?.country ||
                                    getCountryName()}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {validationMessage && (
                      <p className="text-red-400 text-sm mt-2 flex items-start gap-2">
                        <span className="mt-0.5">❌</span>
                        <span>{validationMessage}</span>
                      </p>
                    )}

                    {errors?.postalCode && (
                      <p className="text-red-500 text-xs mt-2">
                        {errors.postalCode}
                      </p>
                    )}
                  </div>
                </div>

                {/* Fleet Details */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em] mb-6">
                    Fleet Details
                  </h3>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3">
                      Operating Area <span className="text-orange-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-6">
                      {["Local", "State/County Wide", "National"].map(
                        (area) => (
                          <label
                            key={area}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="area"
                              value={area}
                              checked={formData.area === area}
                              onChange={handleChange}
                              className="h-4 w-4 text-orange-500 bg-zinc-900 border-zinc-700 focus:ring-orange-500 focus:ring-offset-0"
                            />
                            <span className="text-zinc-300 text-sm  tracking-wider">
                              {area}
                            </span>
                          </label>
                        ),
                      )}
                    </div>
                    {errors.area && (
                      <p className="text-red-500 text-xs mt-2">{errors.area}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3">
                        Delivery Vans
                      </label>
                      <input
                        name="deliveryVans"
                        type="number"
                        value={formData.deliveryVans}
                        onChange={handleChange}
                        min={0}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-white focus:border-orange-500 outline-none uppercase text-xs"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3">
                        Box Vans
                      </label>
                      <input
                        name="boxVans"
                        type="number"
                        value={formData.boxVans}
                        onChange={handleChange}
                        min={0}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-white focus:border-orange-500 outline-none uppercase text-xs"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3">
                        Long Haul
                      </label>
                      <input
                        name="longHaul"
                        type="number"
                        value={formData.longHaul}
                        onChange={handleChange}
                        min={0}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-white focus:border-orange-500 outline-none uppercase text-xs"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3">
                      Stand-By Vehicles{" "}
                      <span className="text-orange-500">*</span>
                    </label>
                    <div className="flex gap-6">
                      {["Yes", "No"].map((option) => (
                        <label
                          key={option}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="standby"
                            value={option}
                            checked={formData.standby === option}
                            onChange={handleChange}
                            className="h-4 w-4 text-orange-500 bg-zinc-900 border-zinc-700 focus:ring-orange-500 focus:ring-offset-0"
                          />
                          <span className="text-zinc-300 text-sm  tracking-wider">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.standby && (
                      <p className="text-red-500 text-xs mt-2">
                        {errors.standby}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3">
                      Vehicle Availability{" "}
                      <span className="text-orange-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {["3 Months", "6 Months", "12 Months", "24 Months"].map(
                        (val) => (
                          <label
                            key={val}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="availability"
                              value={val}
                              checked={formData.availability === val}
                              onChange={handleChange}
                              className="h-4 w-4 text-orange-500 bg-zinc-900 border-zinc-700 focus:ring-orange-500 focus:ring-offset-0"
                            />
                            <span className="text-zinc-300 text-sm  tracking-wider">
                              {val}
                            </span>
                          </label>
                        ),
                      )}
                    </div>
                    {errors.availability && (
                      <p className="text-red-500 text-xs mt-2">
                        {errors.availability}
                      </p>
                    )}
                  </div>

                  <div className="pt-4">
                    <h4 className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em] mb-4">
                      Prohibited Ads
                    </h4>
                    <div className="flex flex-wrap gap-6">
                      {["gambling", "alcohol", "smoking"].map((type) => (
                        <label
                          key={type}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            name={`prohibitedAdvertising.${type}`}
                            checked={formData.prohibitedAdvertising[type]}
                            onChange={handleChange}
                            className="h-4 w-4 text-orange-500 bg-zinc-900 rounded border-zinc-700 focus:ring-orange-500 focus:ring-offset-0"
                          />
                          <span className="text-zinc-300 text-sm  tracking-wider">
                            {type}
                          </span>
                        </label>
                      ))}
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="prohibitedAdvertising.other"
                            checked={formData.prohibitedAdvertising.other}
                            onChange={handleChange}
                            className="h-4 w-4 text-orange-500 bg-zinc-900 rounded border-zinc-700 focus:ring-orange-500 focus:ring-offset-0"
                          />
                          <span className="text-zinc-300 text-sm  tracking-wider">
                            Other
                          </span>
                        </label>
                        {formData.prohibitedAdvertising.other && (
                          <div className="ml-2 flex-1">
                            <input
                              type="text"
                              name="prohibitedAdvertising.otherSpecify"
                              placeholder="PLEASE SPECIFY"
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-3 text-white focus:border-orange-500 outline-none uppercase text-xs"
                              value={
                                formData.prohibitedAdvertising.otherSpecify
                              }
                              onChange={handleChange}
                            />
                            {errors.prohibitedAdvertisingOther && (
                              <p className="text-red-500 text-xs mt-2">
                                {errors.prohibitedAdvertisingOther}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-5 rounded-xl uppercase tracking-[0.2em] text-sm transition-all duration-300 disabled:opacity-50 mt-8"
                  disabled={authLoading}
                >
                  {authLoading ? "REGISTERING..." : "Initialize Registration"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default FleetOwnerLandingPage;
