import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import AddressSelector from "../../components/AddressSelector";
import { BiCurrentLocation } from "react-icons/bi";
import axios from "axios";
import { register, reset } from "../../store/auth/authSlice";
import { allCountries } from "country-telephone-data";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Country } from "country-state-city";
import CountryPhoneSelector from "../../components/PhoneInputWithCountry";
import CountrySpecificZipCode from "../../components/CountrySpecificZipCode";
const WrappingShopForm = ({ formData, setFormData }) => {
  const dispatch = useDispatch();

  const { isLoading } = useSelector((state) => state.auth);
  const [countryid, setCountryid] = useState(0);
  const [stateid, setStateid] = useState(0);
  const [emailError, setEmailError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [phoneError, setPhoneError] = useState("");
  const [countryPhoneCode, setCountryPhoneCode] = useState("");

  // Location search states
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Van and fitting types
  const vanTypes = ["smallVan", "mediumVan", "largeVan", "interCityTruck"];
  const fittingTypes = ["oneSide", "twoSide", "rear", "fullWrap"];

  // Initialize formData with proper field names matching backend
  const [localFormData, setLocalFormData] = useState(
    formData || {
      firstName: "",
      lastname: "",
      emailAddress: "",
      password: "",
      position: "",
      company: "",
      phoneNumberAreaCode: "91",
      phoneNumber: "",
      streetAddress1: "",
      streetAddress2: "",
      suburb: "",
      stateCountyRegion: "",
      country: "",
      city: "",
      zipPostalCode: "",
      websiteAddress: "",
      numberOfEmployees: "",
      designServiceAvailable: "",
      overnightWeekendFitting: "",
      userType: "wrapper",
      location: {
        name: "",
        zip: "",
        latitude: null,
        longitude: null,
      },
      smallVan: {
        oneSide: "",
        twoSide: "",
        rear: "",
        fullWrap: "",
      },
      mediumVan: {
        oneSide: "",
        twoSide: "",
        rear: "",
        fullWrap: "",
      },
      largeVan: {
        oneSide: "",
        twoSide: "",
        rear: "",
        fullWrap: "",
      },
      interCityTruck: {
        oneSide: "",
        twoSide: "",
        rear: "",
        fullWrap: "",
      },
    },
  );

  const currentFormData = formData || localFormData;
  const currentSetFormData = setFormData || setLocalFormData;

  // Update phone code when country changes
  useEffect(() => {
    if (!selectedCountry?.isoCode) return;

    const iso2 = selectedCountry.isoCode.toLowerCase();
    const country = allCountries.find((c) => c.iso2 === iso2);

    if (country) {
      const phoneCode = country.dialCode.replace("+", "");
      setCountryPhoneCode(phoneCode);

      currentSetFormData((prev) => ({
        ...prev,
        telephoneAreaCode: phoneCode,
        phoneNumberAreaCode: phoneCode,
      }));
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (currentFormData.userType !== "wrapper") {
      currentSetFormData((prev) => ({ ...prev, userType: "wrapper" }));
    }
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => {
    const re = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return re.test(email);
  };

  const handleInputChange = (field, value) => {
    if (field === "emailAddress") {
      if (value === "") {
        setEmailError("");
      } else if (!validateEmail(value)) {
        setEmailError("Invalid email format");
      } else {
        setEmailError("");
      }
    }
    currentSetFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (category, field, value) => {
    currentSetFormData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: value },
    }));
  };
  const handlePhoneChange = (value) => {
    currentSetFormData((prev) => ({ ...prev, phoneNumber: value }));

    // Validate phone number (7-15 digits)
    if (!/^\d{7,15}$/.test(value) && value.length > 0) {
      setPhoneError("Please enter a valid phone number (7-15 digits)");
    } else {
      setPhoneError("");
    }
  };

  // Update the handleCountryChange function to also update phoneNumberAreaCode:
  const handleCountryChange = (countryCode, phoneCode) => {
    // Find the country object
    const country = allCountries.find((c) => c.iso2 === countryCode);

    if (country) {
      const countryObj = {
        id: countryCode,
        name: country.name,
        isoCode: countryCode,
      };

      setSelectedCountry(countryObj);
      setCountryid(countryCode);
      setStateid(0);
      setCountryPhoneCode(phoneCode);

      // Update both country and phone area code
      currentSetFormData((prev) => ({
        ...prev,
        country: countryObj,
        phoneNumberAreaCode: phoneCode,
        telephoneAreaCode: phoneCode,
      }));
    }
  };
  // Location search functionality
  const handleLocationInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 2) {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&addressdetails=1&limit=5`,
        );
        setSuggestions(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
        setLoading(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleLocationSelect = (suggestion) => {
    const locationData = {
      name: suggestion.display_name,
      zip: suggestion.address?.postcode || "",
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
    };

    currentSetFormData((prev) => ({
      ...prev,
      location: locationData,
      zipPostalCode: locationData.zip,
    }));

    setQuery(suggestion.display_name);
    setSuggestions([]);
  };

  const getCurrentLocation = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            );
            const data = response.data;

            const locationData = {
              name: data.display_name,
              zip: data.address?.postcode || "",
              latitude,
              longitude,
            };

            currentSetFormData((prevData) => ({
              ...prevData,
              location: locationData,
              zipPostalCode: locationData.zip,
              streetAddress1:
                `${data.address?.house_number || ""} ${data.address?.road || ""}`.trim(),
            }));

            setQuery(data.display_name);
            setLoading(false);
          } catch (error) {
            setLoading(false);
            console.error("Error fetching current location:", error);
            toast.error("Unable to fetch current location");
          }
        },
        (error) => {
          setLoading(false);
          console.error("Geolocation error:", error);
          toast.error("Location access denied or unavailable");
        },
      );
    } else {
      setLoading(false);
      toast.error("Geolocation is not supported by this browser");
    }
  };
  useEffect(() => {
    if (
      currentFormData.state &&
      currentFormData.state !== currentFormData.stateCountyRegion
    ) {
      currentSetFormData((prev) => ({
        ...prev,
        stateCountyRegion: currentFormData.state,
      }));
    }
    if (currentFormData.city && currentFormData.city !== currentFormData.city) {
      currentSetFormData((prev) => ({
        ...prev,
        city: currentFormData.city,
      }));
    }
  }, [currentFormData.state, currentFormData.city]);
  // Initialize nested objects
  useEffect(() => {
    const updatedFormData = { ...currentFormData };
    let hasChanges = false;

    vanTypes.forEach((vanType) => {
      if (
        !updatedFormData[vanType] ||
        typeof updatedFormData[vanType] !== "object"
      ) {
        updatedFormData[vanType] = {
          oneSide: "",
          twoSide: "",
          rear: "",
          fullWrap: "",
        };
        hasChanges = true;
      }
    });

    if (
      !updatedFormData.location ||
      typeof updatedFormData.location !== "object"
    ) {
      updatedFormData.location = {
        name: "",
        zip: "",
        latitude: null,
        longitude: null,
      };
      hasChanges = true;
    }

    if (hasChanges) {
      currentSetFormData(updatedFormData);
    }
  }, []);

  const validateForm = () => {
    const requiredFields = [
      "firstName",
      "lastname",
      "emailAddress",
      "password",
      "position",
      "company",
      "streetAddress1",
      "suburb",
      "country",
      "zipPostalCode",
      "designServiceAvailable",
      "overnightWeekendFitting",
    ];

    for (let field of requiredFields) {
      if (
        !currentFormData[field] ||
        currentFormData[field].toString().trim() === ""
      ) {
        toast.error(
          `Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`,
          { autoClose: 2000 },
        );
        return false;
      }
    }

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(currentFormData.emailAddress)) {
      toast.error("Email format is invalid", { autoClose: 2000 });
      return false;
    }

    if (currentFormData.website && currentFormData.website.trim() !== "") {
      const urlRegex =
        /^(https?:\/\/)?(www\.)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/;
      if (!urlRegex.test(currentFormData.website)) {
        newErrors.website =
          "Please enter a valid website URL (e.g., example.com or www.example.com)";
      }
    }

    for (let vanType of vanTypes) {
      for (let fittingType of fittingTypes) {
        const value = currentFormData[vanType]?.[fittingType];
        if (!value || isNaN(value) || parseInt(value) <= 0) {
          toast.error(
            `Please enter a valid number of days for ${vanType} - ${fittingType}`,
            { autoClose: 2000 },
          );
          return false;
        }
      }
    }

    return true;
  };

  const updatePhoneCode = (isoCode) => {
    const country = allCountries.find((c) => c.iso2 === isoCode);
    const code = country ? country.dialCode.replace("+", "") : "91";
    setCountryPhoneCode(code);
    currentSetFormData((prev) => ({ ...prev, telephoneAreaCode: code }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const submissionData = {
        firstName: currentFormData.firstName,
        lastname: currentFormData.lastname,
        email: currentFormData.emailAddress,
        password: currentFormData.password,
        position: currentFormData.position,
        company: currentFormData.company,
        telephoneAreaCode: currentFormData.phoneNumberAreaCode,
        telephoneNumber: currentFormData.phoneNumber,
        street1: currentFormData.streetAddress1,
        street2: currentFormData.streetAddress2,
        suburb: currentFormData.suburb,
        state: currentFormData.stateCountyRegion, // From dropdown
        city: currentFormData.city,
        country:
          typeof currentFormData.country === "object"
            ? currentFormData.country.name || currentFormData.country.iso2
            : currentFormData.country,
        location: currentFormData.location,
        postalCode:
          currentFormData.location?.zip || currentFormData.zipPostalCode,
        website: currentFormData.websiteAddress,
        employees: currentFormData.numberOfEmployees,
        userType: "wrapper",

        wrappingShopDetails: {
          designService: currentFormData.designServiceAvailable.toUpperCase(),
          overnightFitting:
            currentFormData.overnightWeekendFitting.toUpperCase(),
          fittingTime: {
            smallVan: {
              oneSide: String(currentFormData.smallVan.oneSide),
              twoSide: String(currentFormData.smallVan.twoSide),
              rear: String(currentFormData.smallVan.rear),
              fullWrap: String(currentFormData.smallVan.fullWrap),
            },
            mediumVan: {
              oneSide: String(currentFormData.mediumVan.oneSide),
              twoSide: String(currentFormData.mediumVan.twoSide),
              rear: String(currentFormData.mediumVan.rear),
              fullWrap: String(currentFormData.mediumVan.fullWrap),
            },
            largeVan: {
              oneSide: String(currentFormData.largeVan.oneSide),
              twoSide: String(currentFormData.largeVan.twoSide),
              rear: String(currentFormData.largeVan.rear),
              fullWrap: String(currentFormData.largeVan.fullWrap),
            },
            interCityTruck: {
              oneSide: String(currentFormData.interCityTruck.oneSide),
              twoSide: String(currentFormData.interCityTruck.twoSide),
              rear: String(currentFormData.interCityTruck.rear),
              fullWrap: String(currentFormData.interCityTruck.fullWrap),
            },
          },
        },
      };

      dispatch(reset());
      const result = await dispatch(register(submissionData));

      if (register.fulfilled.match(result)) {
        // toast.success("Registration successful!", { autoClose: 2000 });
        currentSetFormData({
          firstName: "",
          lastname: "",
          emailAddress: "",
          password: "",
          position: "",
          company: "",
          phoneNumberAreaCode: "91",
          phoneNumber: "",
          streetAddress1: "",
          streetAddress2: "",
          suburb: "",
          stateCountyRegion: "",
          country: "",
          city: "",
          zipPostalCode: "",
          websiteAddress: "",
          numberOfEmployees: "",
          designServiceAvailable: "",
          overnightWeekendFitting: "",
          userType: "wrapper",
          location: { name: "", zip: "", latitude: null, longitude: null },
          smallVan: { oneSide: "", twoSide: "", rear: "", fullWrap: "" },
          mediumVan: { oneSide: "", twoSide: "", rear: "", fullWrap: "" },
          largeVan: { oneSide: "", twoSide: "", rear: "", fullWrap: "" },
          interCityTruck: { oneSide: "", twoSide: "", rear: "", fullWrap: "" },
        });
        setQuery("");
        setSuggestions([]);
      } else if (register.rejected.match(result)) {
        toast.error(result.payload?.message || "Registration failed", {
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration", { autoClose: 2000 });
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#0E294D] to-[#071B36] p-4 sm:p-6 rounded-lg mt-6 space-y-6 border border-blue-800/30">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">
          Vehicle Wrapping Business Details
        </h2>
        <p className="text-gray-300 text-sm sm:text-base">
          Please fill in your business information
        </p>
      </div>

      <form className="relative w-full rounded-lg" onSubmit={handleRegister}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Company Name */}
          <div className="md:col-span-2 xl:col-span-1">
            <label className="block mb-2 text-sm font-medium text-gray-200">
              Company Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-[#071B36] text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={currentFormData.company || ""}
              onChange={(e) => handleInputChange("company", e.target.value)}
              placeholder="Enter your company name"
              required
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-200">
              First Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-[#071B36] text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={currentFormData.firstName || ""}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="Enter first name"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-200">
              Last Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-[#071B36] text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={currentFormData.lastname || ""}
              onChange={(e) => handleInputChange("lastname", e.target.value)}
              placeholder="Enter Last name"
              required
            />
          </div>

          {/* Position */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-200">
              Position<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-[#071B36] text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={currentFormData.position || ""}
              onChange={(e) => handleInputChange("position", e.target.value)}
              placeholder="Enter your position"
              required
            />
          </div>

          {/* Email Address */}
          <div className="md:col-span-2 xl:col-span-1">
            <label className="block mb-2 text-sm font-medium text-gray-200">
              Email Address<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className={`w-full p-3 rounded-lg bg-[#071B36] text-white border transition-all ${
                emailError
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              }`}
              value={currentFormData.emailAddress || ""}
              onChange={(e) =>
                handleInputChange("emailAddress", e.target.value)
              }
              placeholder="Enter email address"
              required
            />
            {emailError && (
              <p className="text-red-400 text-sm mt-1 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {emailError}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="md:col-span-2 xl:col-span-1 relative">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-200"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={currentFormData.password || ""}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Enter your password"
                className="w-full p-3 pr-12 rounded-lg bg-[#071B36] text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={22} />
                ) : (
                  <AiOutlineEye size={22} />
                )}
              </button>
            </div>
          </div>

          {/* Phone Number - Full Width */}

          {/* Street Address 1 */}
          <div className="md:col-span-2 xl:col-span-1">
            <label className="block mb-2 text-sm font-medium text-gray-200">
              Street Address 1<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-[#071B36] text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={currentFormData.streetAddress1 || ""}
              onChange={(e) =>
                handleInputChange("streetAddress1", e.target.value)
              }
              placeholder="Enter street address"
              required
            />
          </div>

          {/* Street Address 2 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-200">
              Street Address 2<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-[#071B36] text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={currentFormData.streetAddress2 || ""}
              onChange={(e) =>
                handleInputChange("streetAddress2", e.target.value)
              }
              placeholder="Enter additional address"
            />
          </div>

          {/* Suburb */}
          <div className="mb-2">
            <label className="block mb-2 text-sm font-medium text-gray-200">
              Suburb<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-[#071B36] text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={currentFormData.suburb || ""}
              onChange={(e) => handleInputChange("suburb", e.target.value)}
              placeholder="Enter suburb"
              required
            />
          </div>

          {/* Zip Code / Location */}

          {/* Website */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-200">
              Website Address
            </label>
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-[#071B36] text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={currentFormData.websiteAddress || ""}
              onChange={(e) =>
                handleInputChange("websiteAddress", e.target.value)
              }
              placeholder="https://yourwebsite.com"
            />
          </div>

          {/* Country & Number of Employees - Grouped in same row */}
          <div className="md:col-span-2 xl:col-span-1 flex gap-4">
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-gray-200">
                Number of Employees
              </label>
              <input
                type="number"
                className="w-full p-3 mb-4 rounded-lg bg-[#071B36] text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={currentFormData.numberOfEmployees || ""}
                onChange={(e) =>
                  handleInputChange("numberOfEmployees", e.target.value)
                }
                min="0"
                placeholder="0"
              />
            </div>
          </div>
        </div>
        <div className="mb-6">
          <label
            htmlFor="telephoneNumber"
            className="block mb-2 text-sm font-medium text-gray-200"
          >
            Phone Number <span className="text-red-500">*</span>
          </label>

          <CountryPhoneSelector
            value={currentFormData.phoneNumber || ""}
            onChange={handlePhoneChange}
            onCountryChange={handleCountryChange}
            placeholder="Phone Number"
            required={true}
            error={phoneError}
          />
        </div>
        <AddressSelector
          formData={currentFormData} // Pass full formData
          setFormData={currentSetFormData}
          errors={errors}
          setErrors={setErrors}
          updatePhoneCode={updatePhoneCode}
        />
        <div className="mt-6">
          <CountrySpecificZipCode
            formData={currentFormData}
            setFormData={currentSetFormData}
            selectedCountry={selectedCountry}
            errors={errors}
            setErrors={setErrors}
            required={true}
            label="Business Post / Zip Codes"
          />
        </div>
        {/* Design Service */}
        <div className="bg-gradient-to-r from-[#071B36] to-[#0E294D] p-4 sm:p-6 rounded-lg border border-gray-600/50 mt-6">
          <label className="block mb-4 text-lg font-semibold text-blue-300">
            Design Service Available<span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-6">
            {["yes", "no"].map((val) => (
              <label
                key={val}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="designServiceAvailable"
                  value={val}
                  checked={currentFormData.designServiceAvailable === val}
                  onChange={() =>
                    handleInputChange("designServiceAvailable", val)
                  }
                  className="w-5 h-5 text-blue-500 bg-[#071B36] border-gray-600 focus:ring-blue-500"
                  required
                />
                <span className="text-white group-hover:text-blue-300 transition-colors capitalize">
                  {val}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Fitting Times */}
        <div className="space-y-6 mt-6">
          <h3 className="text-xl sm:text-2xl font-bold text-blue-400 text-center">
            Fitting Times (Days)<span className="text-red-500">*</span>
          </h3>
          {vanTypes.map((vanType) => (
            <div
              key={vanType}
              className="bg-gradient-to-r from-[#071B36] to-[#0E294D] p-4 sm:p-6 rounded-lg border border-gray-600/50"
            >
              <h4 className="mb-4 font-semibold text-lg text-blue-300">
                {vanType
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (s) => s.toUpperCase())}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {fittingTypes.map((type) => (
                  <div key={type}>
                    <label className="block mb-2 text-sm font-medium text-gray-200">
                      {type
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (s) => s.toUpperCase())}
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full p-3 rounded-lg bg-[#0E294D] text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      value={currentFormData[vanType]?.[type] || ""}
                      onChange={(e) =>
                        handleNestedInputChange(vanType, type, e.target.value)
                      }
                      placeholder="Days"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Overnight Fitting */}
        <div className="bg-gradient-to-r from-[#071B36] to-[#0E294D] p-4 sm:p-6 rounded-lg border border-gray-600/50 mt-6">
          <label className="block mb-4 text-lg font-semibold text-blue-300">
            Overnight/Weekend Fitting Available
            <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-6">
            {["yes", "no"].map((val) => (
              <label
                key={val}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="overnightWeekendFitting"
                  value={val}
                  checked={currentFormData.overnightWeekendFitting === val}
                  onChange={() =>
                    handleInputChange("overnightWeekendFitting", val)
                  }
                  className="w-5 h-5 text-blue-500 bg-[#071B36] border-gray-600 focus:ring-blue-500"
                  required
                />
                <span className="text-white group-hover:text-blue-300 transition-colors capitalize">
                  {val}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6">
          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#00A3FF] hover:bg-blue-600 text-white font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WrappingShopForm;
