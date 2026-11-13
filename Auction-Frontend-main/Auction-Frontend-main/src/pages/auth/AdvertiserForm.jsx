import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddressSelector from "../../components/AddressSelector";
import { register, reset } from "../../store/auth/authSlice";
import _ from "lodash";
import { BiCurrentLocation } from "react-icons/bi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { allCountries } from "country-telephone-data";
import { Country } from "country-state-city";
import CountryPhoneSelector from "../../components/PhoneInputWithCountry";
import CountrySpecificZipCode from "../../components/CountrySpecificZipCode";
const defaultSlides = [
  {
    title: "Building Enduring Consumer Connections",
    content:
      "This collaborative strategy creates a unified objective among brands, and vehicle owners amplifying each partners reach and positioning consumers as engaged participants in the marketing process.",
  },
  {
    title: "Dynamic Engagement Cycle",
    content:
      "As individuals share branded images within their networks and revisit rewards platforms, a dynamic cycle of engagement develops, strengthening brand and fleet recognition.",
  },
  {
    title: "Authentic Connections",
    content:
      "Through these authentic exchanges, advertisers foster lasting connections that extend beyond fleeting digital impressions, establishing new channels for brand awareness and driving purchase intent.",
  },
];

const buyerMarketingSlides = [
  {
    title: "Active Consumer Ecosystem",
    content:
      "By leveraging this model, brands are no longer confined to fleeting, one-directional advertising touchpoints. Instead, they become active participants in a lively ecosystem of consumer interaction.",
  },
  {
    title: "Building Brand Advocates",
    content:
      "Each scan and share is not just an isolated event, but a building block in the construction of robust brand-consumer relationships. This approach harnesses the organic power of social media viral spread, transforming every participant into a potential brand advocate who proactively widens the campaign’s impact.",
  },
];

const postFormSlides = [
  {
    title: "Interactive Marketing Journey",
    content:
      "Importantly, this participatory framework also democratizes the marketing process. Rather than imposing advertisements onto passive recipients, it invites consumers into an interactive journey—one where they feel empowered and rewarded for their engagement.",
  },
  {
    title: "Virtuous Engagement Cycle",
    content:
      "The result is a virtuous cycle: as excitement around the valuable rewards grows, so too does the frequency and quality of interactions, weaving brands more deeply into the fabric of everyday social exchanges and ultimately driving sustained market growth.",
  },
];

const abandonedCartSlides = [
  {
    title: "Be Part of the Consumer Journey",
    content: `By leveraging this model, brands are no longer confined to fleeting, one-
directional advertising touchpoints. Instead, they become active participants in 
a lively ecosystem of consumer interaction`,
  },
  {
    title: "Turn Every Share Into Influence",
    content: `"Each scan and share is not just an isolated event, but a building block in the 
construction of robust brand-consumer relationships. This approach harnesses 
the organic power of social media viral spread, transforming every participant 
into a potential brand advocate who proactively widens the campaign’s impact"`,
  },
];

const AdvertiserForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth,
  );

  // Form state
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    firstName: "",
    lastname: "",
    position: "",
    email: "",
    password: "",
    telephoneAreaCode: "",
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
    userType: "advertiser",
    location: {
      name: "",
      zip: "",
      latitude: null,
      longitude: null,
    },
    advertiserDetails: {
      campaignArea: "",
      brandRecognition: "",
      campaignLength: "",
      potentialVehicleRequirement: "",
      specialPromotion: "",
    },
  });
  const [errors, setErrors] = useState({});
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [countryPhoneCode, setCountryPhoneCode] = useState("91");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAbandoned, setIsAbandoned] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  // Determine slides based on position and step
  const getSlides = () => {
    if (isAbandoned) return abandonedCartSlides;
    if (step === 2 && formData.position) {
      return buyerMarketingSlides;
    }
    if (step === 3) return postFormSlides;
    return defaultSlides;
  };

  // Slider navigation handlers
  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % getSlides().length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + getSlides().length) % getSlides().length);
  };

  // Slider rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % getSlides().length);
    }, 10000);
    return () => clearInterval(interval);
  }, [step, formData.position, isAbandoned]);

  useEffect(() => {
    const checkAbandoned = () => {
      const savedData = localStorage.getItem("advertiserFormData");
      if (savedData) {
        setIsAbandoned(true);
        setFormData(JSON.parse(savedData));
      }
    };
    checkAbandoned();
  }, []);

  // Save form data to localStorage on change
  useEffect(() => {
    if (step === 2) {
      localStorage.setItem("advertiserFormData", JSON.stringify(formData));
    }
  }, [formData, step]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      [
        "campaignArea",
        "brandRecognition",
        "campaignLength",
        "potentialVehicleRequirement",
        "specialPromotion",
      ].includes(name)
    ) {
      setFormData((prev) => ({
        ...prev,
        advertiserDetails: {
          ...prev.advertiserDetails,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
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
  const handleCountryChange = (countryCode, phoneCode) => {
    const country = allCountries.find((c) => c.iso2 === countryCode);

    if (country) {
      setSelectedCountry({
        id: countryCode,
        name: country.name,
        isoCode: countryCode,
      });

      setFormData((prev) => ({
        ...prev,
        country: country.name,
        telephoneAreaCode: phoneCode,
      }));
    }
  };

  const handleStateChange = (state) => {
    setSelectedState(state);
    setFormData({ ...formData, state: state.name, city: "" });
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
    setQuery(suggestion.display_name);
    setSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    const requiredFields = [
      "company",
      "firstName",
      "lastname",
      "position",
      "email",
      "password",
      "street1",
      "suburb",
      "postalCode",
      "country",
    ];
    const advertiserRequiredFields = [
      "campaignArea",
      "brandRecognition",
      "campaignLength",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        newErrors[field] =
          `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    advertiserRequiredFields.forEach((field) => {
      if (
        !formData.advertiserDetails[field] ||
        formData.advertiserDetails[field].toString().trim() === ""
      ) {
        newErrors[field] =
          `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    if (!formData.email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submitData = {
      ...formData,
      location: {
        ...formData.location,
        zip: formData.postalCode,
      },
    };

    dispatch(register(submitData))
      .unwrap()
      .then(() => {
        localStorage.removeItem("advertiserFormData");
        setStep(3);
        setTimeout(() => navigate("/login"), 5000);
      })
      .catch((error) => {
        console.error("Registration failed:", error);
        if (error.message) {
          setErrors({ ...errors, apiError: error.message });
        }
      });
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
        value={formData[name] || ""}
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

  const renderPasswordInput = (name, placeholder, required = false) => (
    <div className="w-full mb-3">
      <label htmlFor={name} className="block mb-1 text-white">
        {placeholder} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          value={formData[name] || ""}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full pl-5 pr-12 py-3 rounded text-white bg-[#0E294D] placeholder-body-text-color outline-none border ${
            errors[name] ? "border-red-500" : "border-border-info-color"
          } focus:border-theme-color`}
          style={{
            fontFamily: "inherit",
            letterSpacing: "normal",
          }}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <AiOutlineEyeInvisible size={20} />
          ) : (
            <AiOutlineEye size={20} />
          )}
        </button>
      </div>
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
      )}
    </div>
  );

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
          setQuery(data.display_name);
          setLoading(false);
        } catch (error) {
          setLoading(false);
          console.error("Error fetching current location:", error);
        }
      });
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debounceRef.current(value);
  };
  const updatePhoneCode = (isoCode) => {
    const country = allCountries.find((c) => c.iso2 === isoCode);
    const code = country ? country.dialCode.replace("+", "") : "91";
    setCountryPhoneCode(code);
    setFormData((prev) => ({ ...prev, telephoneAreaCode: code }));
  };
  return (
    <div className="w-full mx-auto p-6 bg-theme-bg shadow-md rounded-lg space-y-6">
      {step === 1 && (
        <div className="text-center">
          <div className="bg-[#0E294D] p-6 px-16 rounded-lg relative">
            {/* Navigation Buttons */}
            <button
              type="button"
              onClick={goToPrevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 transition-all duration-200 -ml-5"
              aria-label="Previous slide"
              title="Previous"
            >
              <ChevronLeft size={24} />
            </button>

            <h2 className="text-3xl font-bold text-white mb-4">
              {getSlides()[currentSlide].title}
            </h2>
            <p className="text-slate-300 mb-6">
              {getSlides()[currentSlide].content}
            </p>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {getSlides().map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? "bg-blue-500 w-6" : "bg-slate-500"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
            >
              Get Started
            </button>

            <button
              type="button"
              onClick={goToNextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 transition-all duration-200 -mr-5"
              aria-label="Next slide"
              title="Next"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-slate-300">
            Registration Form Advertisers
          </h2>
          {isError && (
            <div className="text-red-500 text-center p-2 bg-red-100 rounded">
              {message || "Registration failed. Please try again."}
            </div>
          )}
          {errors.apiError && (
            <div className="text-red-500 text-center p-2 bg-red-100 rounded">
              {errors.apiError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {renderInput("company", "Company", "text", true)}
            {renderInput("website", "Website Address")}
            {renderInput("employees", "No. of Employees", "number")}
            {renderInput("yearsInBusiness", "Years in Business", "number")}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderInput("firstName", "First Name", "text", true)}
            {renderInput("lastname", "Last Name", "text", true)}
            {renderInput("position", "Position", "text", true)}
            {renderInput("email", "Email Address", "email", true)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderPasswordInput("password", "Password", true)}
          </div>
          <h3 className="text-lg font-semibold text-slate-300">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {renderInput("street1", "Street Address 1", "text", true)}
            {renderInput("street2", "Street Address 2", "text")}
            {renderInput("suburb", "Suburb", "text", true)}
          </div>

          <AddressSelector
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            updatePhoneCode={updatePhoneCode}
          />
          <CountrySpecificZipCode
            formData={formData}
            setFormData={setFormData}
            selectedCountry={selectedCountry}
            errors={errors}
            setErrors={setErrors}
            required={true}
            label="Promotion Area Zip Codes"
          />

          <div className="w-full mb-3">
            <label htmlFor="telephoneNumber" className="block mb-1 text-white">
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

          <h3 className="text-lg font-semibold text-slate-300">
            Campaign Details
          </h3>
          <div className="flex flex-col space-y-2">
            <label className="font-medium text-slate-300">
              Vehicle Operating Area <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-4 text-slate-300">
              {["Local", "State/County Wide", "National"].map((area) => (
                <label key={area}>
                  <input
                    type="radio"
                    name="campaignArea"
                    value={area}
                    onChange={handleChange}
                    className="mr-1"
                    checked={formData.advertiserDetails.campaignArea === area}
                  />
                  {area}
                </label>
              ))}
            </div>
            {errors.campaignArea && (
              <p className="text-red-500 text-sm mt-1">{errors.campaignArea}</p>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <label className="font-medium text-slate-300">
              Brand Recognition <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-4 text-slate-300">
              {["Yes", "No"].map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name="brandRecognition"
                    value={option}
                    onChange={handleChange}
                    className="mr-1"
                    checked={
                      formData.advertiserDetails.brandRecognition === option
                    }
                  />
                  {option}
                </label>
              ))}
            </div>
            {errors.brandRecognition && (
              <p className="text-red-500 text-sm mt-1">
                {errors.brandRecognition}
              </p>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <label className="font-medium text-slate-300">
              Campaign Length <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-4 text-slate-300">
              {["3 Months", "6 Months", "12 Months", "24 Months"].map((val) => (
                <label key={val}>
                  <input
                    type="radio"
                    name="campaignLength"
                    value={val}
                    onChange={handleChange}
                    className="mr-1"
                    checked={formData.advertiserDetails.campaignLength === val}
                  />
                  {val}
                </label>
              ))}
            </div>
            {errors.campaignLength && (
              <p className="text-red-500 text-sm mt-1">
                {errors.campaignLength}
              </p>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <label className="font-medium text-slate-300">
              Vehicle Requirement
            </label>
            <div className="flex flex-wrap gap-4 text-slate-300">
              {[
                "Single Vehicle",
                "2-5 Vehicles",
                "6-10 Vehicles",
                "10 or More Vehicles",
              ].map((val) => (
                <label key={val}>
                  <input
                    type="radio"
                    name="potentialVehicleRequirement"
                    value={val}
                    onChange={handleChange}
                    className="mr-1"
                    checked={
                      formData.advertiserDetails.potentialVehicleRequirement ===
                      val
                    }
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <label className="font-medium text-slate-300">
              Special Promotion
            </label>
            <div className="flex flex-wrap gap-4 text-slate-300">
              {["Yes", "No"].map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name="specialPromotion"
                    value={option}
                    onChange={handleChange}
                    className="mr-1"
                    checked={
                      formData.advertiserDetails.specialPromotion === option
                    }
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
};

export default AdvertiserForm;
