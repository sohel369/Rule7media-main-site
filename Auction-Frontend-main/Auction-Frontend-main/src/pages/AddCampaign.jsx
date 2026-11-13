import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  createNewCampaign,
  updateExistingCampaign,
  clearMessages,
  fetchCampaignById,
} from "../store/campaign/campaignSlice";
import { fetchVehicles } from "../store/vehicle/vehicleSlice";
import { toast } from "react-toastify";
import { FiUpload, FiTrash2, FiMapPin } from "react-icons/fi";
import { BiCurrentLocation } from "react-icons/bi";
import _ from "lodash";
import axios from "axios";
import AddressSelector from "../components/AddressSelector";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import { getAllCategories } from "../store/category/categorySlice.js";
import {
  HeaderLeaderboard,
  FooterLeaderboard,
  RightSkyscraper,
  MobileStickyLeaderboard,
} from "../components/AdSlots";
const CreateCampaign = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, successMessage, isLoading } = useSelector(
    (state) => state.campaigns,
  );
  const { categories } = useSelector((state) => state.category);

  const { currentCampaign } = useSelector((state) => state.campaigns);
  const { country, currency } = useSelector((state) => state.country);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    country: "",
    state: "",
    city: "",
    target: { vehicleTypes: [] },
    startAt: "",
    endAt: "",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const debounceRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uniqueVehicleTypes, setUniqueVehicleTypes] = useState([]);
  const { list: vehicles, selectedVehicle } = useSelector(
    (state) => state.vehicles || {},
  );

  const approvedVehicles = vehicles.filter((v) => v.isApproved);
  const dropdownRef = useRef(null);

  // Map related states
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Default center and map container style
  const defaultCenter = { lat: 41.3444587, lng: -99.6104541 };
  const containerStyle = {
    width: "100%",
    height: "400px",
  };

  const requiredFields = [
    { key: "title", label: "Campaign Title" },
    { key: "budget", label: "Budget" },
    { key: "country", label: "Country" },
    { key: "state", label: "State" },
    { key: "target", label: "Vehicel" },
    { key: "startAt", label: "Start Date & Time" },
  ];

  // Function to fit map to all markers
  const fitMapToBounds = useCallback(() => {
    if (!mapRef.current || selectedLocations.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    // Add all locations to bounds
    selectedLocations.forEach((loc) => {
      if (loc.lat && loc.lon) {
        bounds.extend({ lat: loc.lat, lng: loc.lon });
      }
    });

    // Fit map to bounds
    mapRef.current.fitBounds(bounds);

    // Add some padding
    const padding = 50; // pixels
    mapRef.current.fitBounds(bounds, padding);

    // Adjust zoom if too close
    if (selectedLocations.length === 1 && mapRef.current.getZoom() > 15) {
      mapRef.current.setZoom(15);
    }
  }, [selectedLocations]);

  // Fit map when locations change
  useEffect(() => {
    if (mapLoaded && selectedLocations.length > 0) {
      setTimeout(() => {
        fitMapToBounds();
      }, 100);
    }
  }, [selectedLocations, mapLoaded, fitMapToBounds]);
  useEffect(() => {
    dispatch(getAllCategories());
  }, []);

  useEffect(() => {
    let categoryNames = [];

    if (categories?.data && Array.isArray(categories.data)) {
      categoryNames = categories.data
        .map((cat) => cat.name)
        .filter(
          (name) => name && typeof name === "string" && name.trim() !== "",
        );
    } else if (Array.isArray(categories)) {
      categoryNames = categories
        .map((cat) => cat.name)
        .filter(
          (name) => name && typeof name === "string" && name.trim() !== "",
        );
    }

    setUniqueVehicleTypes(categoryNames);
  }, [categories]);

  // Load map script
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    setMapLoaded(true);
  }, []);

  // Generate markers for all locations
  const generateMarkers = () => {
    return selectedLocations.map((loc, index) => ({
      position: { lat: loc.lat, lng: loc.lon },
      label: (index + 1).toString(),
    }));
  };

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchCampaignById(id));
    }
  }, [id, isEditMode, dispatch]);

  useEffect(() => {
    if (currentCampaign && isEditMode) {
      setFormData({
        title: currentCampaign.title || "",
        description: currentCampaign.description || "",
        budget: currentCampaign.budget || "",
        country: currentCampaign.location?.country || "",
        state: currentCampaign.location?.state || "",
        city: currentCampaign.location?.city || "",
        target: {
          vehicleTypes: currentCampaign.targetVehicleTypes || [],
        },
        startAt: currentCampaign.startAt
          ? new Date(currentCampaign.startAt).toISOString().slice(0, 16)
          : "",
        endAt: currentCampaign.endAt
          ? new Date(currentCampaign.endAt).toISOString().slice(0, 16)
          : "",
      });
      setExistingImages(currentCampaign.image || []);

      // FIX: Properly format locations for edit mode
      if (
        currentCampaign.location?.geoLocations &&
        currentCampaign.location.geoLocations.length > 0
      ) {
        const formattedLocations = currentCampaign.location.geoLocations.map(
          (loc) => {
            // Handle different coordinate formats
            let coords = [0, 0];

            if (loc.location?.coordinates) {
              coords = loc.location.coordinates;
            } else if (loc.coordinates?.coordinates) {
              coords = loc.coordinates.coordinates;
            }

            const longitude = coords[0] || 0;
            const latitude = coords[1] || 0;

            return {
              name: loc.displayName || loc.name || "Location",
              displayName: loc.displayName || loc.name || "Location",
              zip: loc.zip || "",
              lat: latitude,
              lon: longitude,
              coordinates: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
              location: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
            };
          },
        );

        // Filter out invalid locations (lat/lon = 0)
        const validLocations = formattedLocations.filter(
          (loc) => loc.lat !== 0 && loc.lon !== 0,
        );

        setSelectedLocations(validLocations);
      }
    }
  }, [currentCampaign, isEditMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper function to get country code
  const getCountryCode = (countryName) => {
    const countryCodes = {
      "united states": "us",
      usa: "us",
      "united kingdom": "gb",
      uk: "gb",
      india: "in",
      canada: "ca",
      australia: "au",
      germany: "de",
      france: "fr",
      spain: "es",
      italy: "it",
      japan: "jp",
      china: "cn",
      brazil: "br",
      mexico: "mx",
      "south africa": "za",
      "new zealand": "nz",
      singapore: "sg",
      "united arab emirates": "ae",
      uae: "ae",
      "saudi arabia": "sa",
      pakistan: "pk",
      bangladesh: "bd",
      "sri lanka": "lk",
      nepal: "np",
      thailand: "th",
      malaysia: "my",
      indonesia: "id",
      philippines: "ph",
      vietnam: "vn",
      "south korea": "kr",
      netherlands: "nl",
      belgium: "be",
      switzerland: "ch",
      austria: "at",
      sweden: "se",
      norway: "no",
      denmark: "dk",
      finland: "fi",
      poland: "pl",
      portugal: "pt",
      ireland: "ie",
      greece: "gr",
      turkey: "tr",
      egypt: "eg",
      nigeria: "ng",
      kenya: "ke",
      argentina: "ar",
      chile: "cl",
      colombia: "co",
      peru: "pe",
    };
    return countryCodes[countryName.toLowerCase()] || "";
  };

  // Debounced search with strict country + postal code filtering
  useEffect(() => {
    debounceRef.current = _.debounce(async (q) => {
      if (q.trim().length < 3) {
        setSuggestions([]);
        return;
      }

      if (!formData.country) {
        toast.warning("Please select Country first!");
        setSuggestions([]);
        return;
      }

      setLoadingLocation(true);
      try {
        const countryCode = getCountryCode(formData.country);
        if (!countryCode) {
          toast.error("Location search not supported for this country.");
          setSuggestions([]);
          setLoadingLocation(false);
          return;
        }

        const trimmedQuery = q.trim();
        // Detect postal code pattern: 5-7 digits OR UK format like SW1A 1AA
        const isPostalCodeQuery =
          /^\d{5,7}$/.test(trimmedQuery) ||
          /^[A-Za-z]{1,4}\s?\d{1,4}[A-Za-z]{0,2}$/.test(
            trimmedQuery.replace(/\s/g, ""),
          );

        let apiUrl = "";

        if (isPostalCodeQuery) {
          // Strict: Search only by postalcode + country
          apiUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10&countrycodes=${countryCode}&postalcode=${encodeURIComponent(trimmedQuery)}`;
        } else {
          // Regular location search restricted to country
          const locationQuery = `${trimmedQuery}, ${formData.country}`;
          apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json&addressdetails=1&limit=10&countrycodes=${countryCode}`;
        }

        const res = await axios.get(apiUrl);

        // Strict filtering: Must have postcode AND country must match
        const filtered = res.data.filter((location) => {
          const addr = location.address || {};
          const hasPostcode = !!addr.postcode;
          const locationCountry = (addr.country || "").toLowerCase().trim();
          const selectedCountryName = formData.country.toLowerCase().trim();

          const countryMatches =
            locationCountry === selectedCountryName ||
            (selectedCountryName.includes("united kingdom") &&
              locationCountry.includes("united kingdom")) ||
            (selectedCountryName.includes("india") &&
              locationCountry === "india");

          return hasPostcode && countryMatches;
        });

        if (filtered.length === 0) {
          if (isPostalCodeQuery) {
            toast.warning(
              `"${trimmedQuery}" is not a valid postcode in ${formData.country}.`,
            );
          } else if (res.data.length > 0) {
            toast.info(
              `No valid locations with postcode found in ${formData.country}.`,
            );
          }
        }

        setSuggestions(filtered);
      } catch (err) {
        console.error("Location search error:", err);
        toast.error("Failed to search locations.");
        setSuggestions([]);
      } finally {
        setLoadingLocation(false);
      }
    }, 600);
  }, [formData.country]);

  // Reset form on success
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      setTimeout(() => {
        if (isEditMode) {
          navigate("/user-profile/my-campaign");
        } else {
          setFormData({
            title: "",
            description: "",
            budget: "",
            country: "",
            state: "",
            city: "",
            target: { vehicleTypes: [] },
            startAt: new Date().toISOString().slice(0, 16),
            endAt: "",
          });
          setSelectedImages([]);
          setExistingImages([]);
          setSelectedLocations([]);
          setQuery("");
        }
        dispatch(clearMessages());
      }, 2500);
    }
  }, [successMessage, isEditMode, navigate, dispatch]);

  useEffect(() => {
    if (formData.country && selectedLocations.length > 0) {
      setSelectedLocations([]);
      setQuery("");
      setSuggestions([]);
    }
  }, [formData.country]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages =
      existingImages.length + selectedImages.length + files.length;
    if (totalImages > 3) {
      toast.error("Maximum 3 images allowed!");
      return;
    }
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setSelectedImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLocationSelect = (location) => {
    const a = location.address || {};
    const zip = a.postcode || "";
    const locationCountry = (a.country || "").toLowerCase().trim();
    const selectedCountry = (formData.country || "").toLowerCase().trim();

    const countryMatches =
      locationCountry === selectedCountry ||
      (selectedCountry.includes("united kingdom") &&
        locationCountry.includes("united kingdom")) ||
      (selectedCountry.includes("india") && locationCountry === "india");

    if (!zip || !countryMatches) {
      toast.error(`You can only add valid postcodes from ${formData.country}.`);
      return;
    }

    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);

    const newLoc = {
      name: location.display_name,
      displayName: location.display_name,
      zip,
      lat: lat,
      lon: lon,
      coordinates: {
        type: "Point",
        coordinates: [lon, lat],
      },
      location: {
        type: "Point",
        coordinates: [lon, lat],
      },
    };

    const exists = selectedLocations.some(
      (l) =>
        Math.abs(l.lat - newLoc.lat) < 0.001 &&
        Math.abs(l.lon - newLoc.lon) < 0.001,
    );

    if (exists) {
      toast.warning("Already added this location!");
      return;
    }

    setSelectedLocations((prev) => [...prev, newLoc]);
    setQuery("");
    setSuggestions([]);
  };

  const removeLocation = (index) => {
    setSelectedLocations((prev) => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
          );
          handleLocationSelect(res.data);
        } catch (err) {
          toast.error("Could not fetch address for your location");
        } finally {
          setLoadingLocation(false);
        }
      },
      () => {
        setLoadingLocation(false);
        toast.error("Location access was denied");
      },
    );
  };

  const validateRequiredFields = () => {
    for (const field of requiredFields) {
      if (
        !formData[field.key] ||
        formData[field.key].toString().trim() === ""
      ) {
        toast.error(`Please add ${field.label}`);
        return false;
      }
    }

    if (existingImages.length + selectedImages.length === 0) {
      toast.error("Please upload at least one image");
      return false;
    }
    // Start date validation - FIXED
    // Start date validation - Skip for edit mode if campaign already started
    if (formData.startAt) {
      const selectedDate = new Date(formData.startAt);
      const currentDate = new Date();

      // Remove seconds and milliseconds from comparison
      currentDate.setSeconds(0, 0);
      selectedDate.setSeconds(0, 0);

      // For edit mode: allow past dates (campaign already running)
      // For create mode: only allow future or current dates
      if (!isEditMode && selectedDate < currentDate) {
        toast.error("Start date & time cannot be in the past");
        return false;
      }

      // For edit mode: only show warning, don't block
      if (isEditMode && selectedDate < currentDate) {
        //toast.warning("Campaign has already started. Start date cannot be changed to future.");
        // Don't return false, allow update
      }
    }
    if (!selectedLocations || selectedLocations.length === 0) {
      toast.error("Please select at least one Target Location / Zip Code");
      return false;
    }
    if (formData.endAt) {
      if (new Date(formData.endAt) <= new Date(formData.startAt)) {
        toast.error("End date must be after start date");
        return false;
      }
    }

    if (
      !formData.target ||
      !Array.isArray(formData.target.vehicleTypes) ||
      formData.target.vehicleTypes.length === 0
    ) {
      toast.error("Please select at least one Target Vehicle Type");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateRequiredFields()) return;

    const totalImages = existingImages.length + selectedImages.length;
    if (totalImages === 0) return toast.error("Upload at least 1 image");
    if (!formData.title || !formData.budget)
      return toast.error("Title and budget are required");

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description || "");
      data.append("budget", formData.budget);
      data.append("country", formData.country);
      data.append("state", formData.state);
      data.append("city", formData.city);

      // Fix: Ensure target is properly structured
      const targetData = {
        vehicleTypes: formData.target.vehicleTypes || [],
      };
      data.append("target", JSON.stringify(targetData));

      data.append("startAt", formData.startAt);
      if (formData.endAt) data.append("endAt", formData.endAt);

      const zipCodes = selectedLocations.map((l) => l.zip).filter(Boolean);
      const locations = selectedLocations.map((l) => ({
        name: l.name,
        displayName: l.displayName || l.name,
        zip: l.zip,
        location: l.location ||
          l.coordinates || {
            type: "Point",
            coordinates: [l.lon, l.lat],
          },
      }));

      data.append("zipCodes", JSON.stringify(zipCodes));
      data.append("locations", JSON.stringify(locations));

      if (isEditMode) {
        data.append("existingImages", JSON.stringify(existingImages));
      }

      selectedImages.forEach((img) => data.append("images", img.file));

      if (isEditMode) {
        await dispatch(updateExistingCampaign({ id, data })).unwrap();
        //toast.success("Campaign updated successfully!");
        navigate("/user-profile/my-campaign");
      } else {
        await dispatch(createNewCampaign(data)).unwrap();
        //toast.success("Campaign created successfully!");
        navigate("/user-profile/my-campaign");
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err?.message || "Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) {
      debounceRef.current(val);
    }
  };

  const displayZipCodes =
    selectedLocations
      .map((loc) => loc.zip)
      .filter(Boolean)
      .join(", ") || "";

  const getPlaceholder = () => {
    if (!formData.country) return "Select country first...";
    const lower = formData.country.toLowerCase();
    if (lower.includes("united kingdom") || lower.includes("uk")) {
      return "Search UK postcodes (e.g. SW1A 1AA, M15 6SZ)...";
    } else if (lower.includes("india")) {
      return "Search Indian PIN codes (e.g. 127021, 400001)...";
    } else {
      return `Search postal codes in ${formData.country}...`;
    }
  };

  // Render Google Map directly
  const renderMap = () => {
    if (!googleMapsApiKey) {
      return (
        <div className="w-full h-96 bg-gray-800 rounded-xl flex items-center justify-center">
          <p className="text-gray-400">Google Maps API key is missing</p>
        </div>
      );
    }
    // Add this before the return statement

    return (
      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={
            selectedLocations.length > 0
              ? { lat: selectedLocations[0].lat, lng: selectedLocations[0].lon }
              : defaultCenter
          }
          zoom={selectedLocations.length === 1 ? 12 : 5}
          onLoad={onMapLoad}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {generateMarkers().map((marker, index) => (
            <Marker
              key={index}
              position={marker.position}
              label={marker.label}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    );
  };
  if (isEditMode && isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  return (
    <div className="overflow-auto px-7 py-4 w-full bg-theme-bg text-white rounded-2xl">
      <p className="text-center text-2xl md:text-3xl mt-10 font-semibold  bg-clip-text text-white">
        {isEditMode ? "Edit Campaign" : "Create New Campaign"}
      </p>
      <div style={{ position: "relative", left: "80px" }}>
        <HeaderLeaderboard />
      </div>
      <div className="w-full mx-auto px-6 py-12 rounded-2xl">
        <div className="grid lg:grid-cols-[0.9fr_1.3fr] gap-12">
          <div>
            <div className="bg-theme-bg backdrop-blur-xl rounded-3xl p-8 border border-gray-800 shadow-2xl">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <FiUpload className="text-purple-400 text-3xl" />
                {isEditMode
                  ? "Campaign Images (Max 3)"
                  : "Upload Ad Images (Max 3)"}
              </h2>

              {/* Existing Images */}
              {isEditMode && existingImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">
                    Current Images
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {existingImages.map((img, i) => (
                      <div
                        key={i}
                        className="relative group rounded-2xl overflow-hidden border-2 border-gray-700 hover:white transition"
                      >
                        <img
                          src={img}
                          alt={`Existing ${i + 1}`}
                          className="w-full h-40 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(i)}
                          className="absolute top-2 right-2 bg-red-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition"
                        >
                          <FiTrash2 className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <label htmlFor="images">
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={existingImages.length + selectedImages.length >= 3}
                />
                <div
                  className={`border-2 border-dashed rounded-2xl p-12 bg-[#0E294D] text-center cursor-pointer transition-all ${
                    existingImages.length + selectedImages.length >= 3
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:bg-[#0E294D] hover:bg-theme-bg"
                  }`}
                >
                  <FiUpload className="mx-auto text-7xl text-gray-500 mb-6" />
                  <p className="text-xl font-medium text-gray-300">
                    {existingImages.length + selectedImages.length}/3 images
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    PNG, JPG, WebP • Max 5MB
                  </p>
                </div>
              </label>

              {selectedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-8">
                  {selectedImages.map((img, i) => (
                    <div
                      key={i}
                      className="relative group rounded-2xl overflow-hidden border-2 border-gray-700 hover:white transition"
                    >
                      <img
                        src={img.preview}
                        alt={`Preview ${i + 1}`}
                        className="w-full h-40 object-cover"
                      />
                      {isEditMode && (
                        <div className="absolute top-2 left-2 bg-green-600 px-2 py-1 rounded text-xs">
                          NEW
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 bg-red-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition"
                      >
                        <FiTrash2 className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* GOOGLE MAP DISPLAY - DIRECTLY IN CODE */}
            {selectedLocations.length > 0 && (
              <div className="bg-theme-bg backdrop-blur-xl rounded-3xl p-8 border border-gray-800 shadow-2xl mt-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <FiMapPin className="text-purple-400 text-3xl" />
                  Selected Areas Map ({selectedLocations.length} locations)
                </h2>

                {/* Map Render */}
                {renderMap()}

                <div className="mt-4 bg-black/50 backdrop-blur-md rounded-xl p-4 max-h-40 overflow-y-auto">
                  <p className="text-sm font-semibold mb-3 text-purple-300">
                    Selected Zip Codes ({selectedLocations.length}):
                  </p>

                  <div className="flex flex-col gap-2">
                    {selectedLocations.map((loc, i) => (
                      <div
                        key={i}
                        className="text-xs text-gray-200 bg-purple-900/30 rounded-lg px-3 py-2 border border-purple-700/40"
                        title={loc.displayName || loc.name}
                      >
                        <div className="font-medium text-purple-300">
                          {loc.zip || "N/A"}
                        </div>
                        <div className="text-gray-300 break-words">
                          {loc.name}
                        </div>
                      </div>
                    ))}

                    {selectedLocations.length === 0 && (
                      <p className="text-xs text-gray-500 italic">
                        No zip codes selected yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT - FORM */}
          <div className="space-y-8">
            <div className="bg-theme-bg backdrop-blur-xl rounded-3xl p-8 border border-gray-800 shadow-2xl">
              <h2 className="text-2xl font-bold mb-8">Campaign Details</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-medium mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="Campaign Title *"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-6 py-3 bg-[#0E294D] border border-gray-700 rounded  outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">
                    Budget {currency}
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    step={100}
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                    className="w-full px-6 py-3 rounded border border-gray-700 bg-[#0E294D] outline-none"
                    placeholder={`e.g. ${currency} 100`}
                  />
                </div>

                {/* Target Location */}
                <h3 className="text-lg font-bold mb-4">Target Location</h3>
                <AddressSelector
                  key={`${formData.country}-${formData.state}-${formData.city}`}
                  formData={formData}
                  setFormData={setFormData}
                  errors={{}}
                  setErrors={() => {}}
                  updatePhoneCode={() => {}}
                />

                {/* Selected Zip Codes Display */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Selected Zip Codes
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={displayZipCodes}
                    placeholder="Selected zip codes will appear here..."
                    className="w-full px-4 py-3 bg-[#0E294D] rounded border border-gray-700 rounded text-gray-300"
                  />
                </div>

                {/* Zip Code Search */}
                <div>
                  <label className="block mb-2 font-medium">
                    Target Areas / Zip Codes
                  </label>

                  {!formData.country && (
                    <div className="mb-3 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg text-yellow-300 text-sm">
                      ⚠️ Please select Country, State and City in "Target
                      Location" section above before searching zip codes
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="text"
                      value={query}
                      onChange={handleSearchInput}
                      placeholder={getPlaceholder()}
                      disabled={!formData.country}
                      className="w-full px-4 py-3 bg-[#0E294D] rounded border border-gray-700 rounded pr-12  outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <BiCurrentLocation
                      onClick={getCurrentLocation}
                      className={`absolute right-4 top-3.5 text-2xl cursor-pointer text-purple-400 hover:text-purple-300 ${
                        !formData.country ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      title="Use my current location"
                    />
                  </div>

                  <div className="h-6 mt-2 flex items-center">
                    {loadingLocation && (
                      <p className="text-sm text-gray-400 animate-pulse">
                        Searching locations in {formData.country}...
                      </p>
                    )}
                  </div>

                  {suggestions.length > 0 && !loadingLocation && (
                    <div className="mt-2 bg-gray-800 border border-gray-700 rounded max-h-60 overflow-y-auto z-10">
                      <div className="p-2 bg-purple-900/30 border-b border-gray-700 text-xs text-purple-300 flex items-center justify-between">
                        <span>Results from {formData.country} only</span>
                        <span className="bg-purple-700 px-2 py-1 rounded">
                          {suggestions.length} found
                        </span>
                      </div>
                      {suggestions.map((s, i) => (
                        <div
                          key={i}
                          onClick={() => handleLocationSelect(s)}
                          className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0 text-sm"
                        >
                          <div>{s.display_name}</div>
                          {s.address.postcode && (
                            <div className="text-xs text-purple-400 mt-1">
                              Zip: {s.address.postcode}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {suggestions.length === 0 &&
                    !loadingLocation &&
                    query.length >= 3 &&
                    formData.country && (
                      <div className="mt-2 p-4 bg-yellow-900/30 border border-yellow-600/50 rounded text-yellow-300 text-sm">
                        <p className="font-semibold mb-1">
                          ⚠️ No results found
                        </p>
                        <p>
                          Please enter a valid postcode from{" "}
                          <strong>{formData.country}</strong>.
                        </p>
                      </div>
                    )}

                  {selectedLocations.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {selectedLocations.map((loc, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-2 bg-[#0E294D] hover:bg-purple-800 px-4 py-2.5 rounded-full text-sm font-medium transition max-w-xs truncate"
                          title={loc.displayName}
                        >
                          <span className="truncate">{loc.name}</span>
                          <button
                            type="button"
                            onClick={() => removeLocation(i)}
                            className="ml-2 hover:text-red-300 font-bold flex-shrink-0"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-2 w-full">
                  <div className="flex flex-col">
                    <label className="block mb-2">Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      onChange={(e) =>
                        setFormData({ ...formData, startAt: e.target.value })
                      }
                      value={formData.startAt}
                      className="`w-full px-3 py-3 bg-[#0E294D] rounded-md border border-gray-600 text-white"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block mb-2">End Date</label>
                    <input
                      type="datetime-local"
                      value={formData.endAt}
                      onChange={(e) =>
                        setFormData({ ...formData, endAt: e.target.value })
                      }
                      className="`w-full px-3 py-3 bg-[#0E294D] rounded-md border border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="mt-6 relative" ref={dropdownRef}>
                  <label className="text-white font-medium">
                    Target Vehicle Types
                  </label>

                  <div
                    className="mt-2 min-h-[48px] cursor-pointer
               border border-gray-600 rounded px-4 py-3
               bg-[#0E294D]/70 flex flex-wrap gap-2 items-center
              "
                    onClick={() => setDropdownOpen((prev) => !prev)}
                  >
                    {formData.target.vehicleTypes.length === 0 ? (
                      <span className="text-gray-400 text-sm">
                        Select vehicle types...
                      </span>
                    ) : (
                      formData.target.vehicleTypes.map((type) => (
                        <span
                          key={type}
                          className="bg-purple-700/60 text-white text-sm px-3 py-1 rounded-full flex items-center gap-2"
                        >
                          {type}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData({
                                ...formData,
                                target: {
                                  ...formData.target,
                                  vehicleTypes:
                                    formData.target.vehicleTypes.filter(
                                      (t) => t !== type,
                                    ),
                                },
                              });
                            }}
                            className="hover:text-red-300"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                    <span className="ml-auto text-gray-400">
                      {dropdownOpen ? "▲" : "▼"}
                    </span>
                  </div>

                  {dropdownOpen && (
                    <div
                      className="absolute left-0 right-0 top-full mt-2 z-50
                   bg-[#0E294D] border border-gray-700 rounded
                   max-h-56 overflow-y-auto p-3 shadow-2xl
                   scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800"
                    >
                      {Array.isArray(uniqueVehicleTypes) &&
                      uniqueVehicleTypes.length > 0 ? (
                        uniqueVehicleTypes.map((type) => (
                          <label
                            key={type}
                            className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 cursor-pointer text-white transition"
                          >
                            <input
                              type="checkbox"
                              checked={formData.target.vehicleTypes.includes(
                                type,
                              )}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...formData.target.vehicleTypes, type]
                                  : formData.target.vehicleTypes.filter(
                                      (t) => t !== type,
                                    );
                                setFormData({
                                  ...formData,
                                  target: {
                                    ...formData.target,
                                    vehicleTypes: updated,
                                  },
                                });
                              }}
                              className="form-checkbox h-4 w-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                            />
                            <span>{type}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-center text-gray-400 py-4">
                          {uniqueVehicleTypes === null ||
                          uniqueVehicleTypes === undefined
                            ? "Loading vehicle types..."
                            : "No vehicle types available"}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="relative flex flex-col gap-3">
                  <label className="text-white font-medium">
                    Description (Optional)
                  </label>

                  <textarea
                    rows="3"
                    placeholder="Description "
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-[#0E294D] border border-gray-700 rounded  outline-none resize-none"
                  />
                </div>

                {isEditMode ? (
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => navigate("/user-profile/my-campaign")}
                      className="flex-1 py-5 text-xl font-bold rounded-2xl bg-gray-700 hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-5 text-xl font-bold rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 shadow-2xl transition relative flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
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
                              d="M4 12a8 8 0 018-8v8z"
                            ></path>
                          </svg>
                          Updating...
                        </>
                      ) : (
                        "Update Campaign"
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-5 text-xl font-bold rounded-2xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 shadow-2xl transition relative flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
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
                            d="M4 12a8 8 0 018-8v8z"
                          ></path>
                        </svg>
                        Creating Campaign...
                      </>
                    ) : (
                      "Create Campaign"
                    )}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
      <FooterLeaderboard />
    </div>
  );
};

export default CreateCampaign;
