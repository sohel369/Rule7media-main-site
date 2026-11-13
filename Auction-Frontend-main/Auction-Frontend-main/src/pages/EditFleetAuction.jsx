import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getfleetauctionbyid,
  updateFleetAuction,
  resetFleetOwner,
} from "../store/fleetowner/fleetownerSlice";
import { fetchVehicles } from "../store/vehicle/vehicleSlice";
import { toast } from "react-toastify";
import worldData from "../countries+states+cities.json";
import axios from "axios";
import _ from "lodash";
import { BiCurrentLocation } from "react-icons/bi";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";

const EditFleetAuction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    form,
    isLoading: reduxLoading,
    isSuccess,
    isError,
    message,
  } = useSelector((state) => state.fleetOwner);
  const { fleetvehclelist = [] } = useSelector((state) => state.vehicles || {});
  const approvedVehicles = fleetvehclelist?.filter((v) => v.isApproved) || [];
  const { user } = useSelector((state) => state.auth);

  const auction = form?.data;

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsError, setSuggestionsError] = useState("");
  const [imgUrls, setImgUrls] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [zipCodes, setZipCodes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Map related states
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Default center and map container style
  const defaultCenter = { lat: 20.5937, lng: 78.9629 };
  const containerStyle = {
    width: "100%",
    height: "400px",
  };

  const [preSelectedVehicle, setPreSelectedVehicle] = useState(null);

  const [formData, setFormData] = useState({
    company: "",
    accountNumber: "",
    suburb: "",
    city: "",
    state: "",
    startTime: "",
    endTime: "",
    country: "",
    zipCodes: [],
    routeFrom: "",
    routeTo: "",
    auctionRateFullWrap: "",
    auctionRateOneSide: "",
    auctionRateBothSides: "",
    auctionRateRearDoors: "",
    buyNowRateFullWrap: "",
    buyNowRateOneSide: "",
    buyNowRateBothSides: "",
    buyNowRateRearDoors: "",
    discount3Month: "10",
    discount6Month: "15",
    discount12Month: "25",
    discount24Month: "",
    manufacturer: "",
    vehicleType: "",
    yearOfManufacture: "",
    manufactureCountry: "",
    model: "",
    registrationPlate: "",
    dailyMileage: "",
    availability: [],
    prohibitedAds: {
      gambling: false,
      alcohol: false,
      smoking: false,
      otherSpecify: "",
    },
    images: [],
    locations: [],
  });

  const [errors, setErrors] = useState({});

  // Function to fit map to all markers
  const fitMapToBounds = useCallback(() => {
    if (!mapRef.current || locations.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    // Add all locations to bounds
    locations.forEach((loc) => {
      if (loc.lat && loc.lng) {
        bounds.extend({ lat: loc.lat, lng: loc.lng });
      }
    });

    // Fit map to bounds
    mapRef.current.fitBounds(bounds);

    // Add some padding
    const padding = 50; // pixels
    mapRef.current.fitBounds(bounds, padding);

    // Adjust zoom if too close
    if (locations.length === 1 && mapRef.current.getZoom() > 15) {
      mapRef.current.setZoom(15);
    }
  }, [locations]);

  // Fit map when locations change
  useEffect(() => {
    if (mapLoaded && locations.length > 0) {
      setTimeout(() => {
        fitMapToBounds();
      }, 100);
    }
  }, [locations, mapLoaded, fitMapToBounds]);

  // Load map script
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    setMapLoaded(true);
  }, []);

  // Generate markers for all locations
  const generateMarkers = () => {
    return locations.map((loc, index) => ({
      position: { lat: loc.lat, lng: loc.lng },
      label: (index + 1).toString(),
    }));
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

    return (
      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={
            locations.length > 0
              ? { lat: locations[0].lat, lng: locations[0].lng }
              : defaultCenter
          }
          zoom={locations.length === 1 ? 12 : 5}
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

  // Fetch auction data
  useEffect(() => {
    if (id) {
      dispatch(getfleetauctionbyid(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (auction?.country) {
      setSelectedCountry({
        id: auction.country.isoCode,
        name: auction.country.name,
        isoCode: auction.country.isoCode,
      });
    }
  }, [auction]);

  // Fetch vehicles
  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  // Load countries
  useEffect(() => {
    if (worldData && worldData.length > 0) {
      const countriesWithIso = worldData.map((country) => ({
        ...country,
        isoCode: country.iso2 || country.isoCode || country.code || "",
      }));
      setCountries(countriesWithIso);
    }
  }, []);

  // Pre-fill form when auction data loads
  useEffect(() => {
    if (auction && countries.length > 0) {
      const auctionCountry = countries.find(
        (c) => c.name.toLowerCase() === (auction.country || "").toLowerCase(),
      );

      if (auctionCountry) {
        setSelectedCountry(auctionCountry);
        setStates(auctionCountry.states || []);

        // Find and set State
        if (auction.state) {
          const auctionState = auctionCountry.states?.find(
            (s) => s.name.toLowerCase() === auction.state.toLowerCase(),
          );
          if (auctionState) {
            setSelectedState(auctionState);
            setCities(auctionState.cities || []);
          }
        }
      }
      const startTime = auction.startTime
        ? new Date(auction.startTime).toISOString().slice(0, 16)
        : "";
      const endTime = auction.endTime
        ? new Date(auction.endTime).toISOString().slice(0, 16)
        : "";

      let selectedAvailability = "";

      if (auction.vehicleAvailability?.twentyFourMonths === "Available") {
        selectedAvailability = "24 Months";
      } else if (auction.vehicleAvailability?.twelveMonths === "Available") {
        selectedAvailability = "12 Months";
      } else if (auction.vehicleAvailability?.sixMonths === "Available") {
        selectedAvailability = "6 Months";
      } else if (auction.vehicleAvailability?.threeMonths === "Available") {
        selectedAvailability = "3 Months";
      }
      const route = auction.interRoutes?.[0] || { from: "", to: "" };

      setFormData({
        company: auction.company || "",
        accountNumber: auction.accountNumber || "",
        suburb: auction.suburb || "",
        city: auction.townOrCity || "",
        state: auction.state || "",
        country: auction.country || "",
        startTime,
        endTime,
        auctionRateFullWrap: auction.minAuctionRates?.fullWrap || "",
        auctionRateOneSide: auction.minAuctionRates?.oneSide || "",
        auctionRateBothSides: auction.minAuctionRates?.bothSides || "",
        auctionRateRearDoors: auction.minAuctionRates?.rearDoors || "",
        buyNowRateFullWrap: auction.buyNowRates?.fullWrap || "",
        buyNowRateOneSide: auction.buyNowRates?.oneSide || "",
        buyNowRateBothSides: auction.buyNowRates?.bothSides || "",
        buyNowRateRearDoors: auction.buyNowRates?.rearDoors || "",
        discount3Month: auction.discountOffers?.threeMonth || "10",
        discount6Month: auction.discountOffers?.sixMonth || "15",
        discount12Month: auction.discountOffers?.twelveMonth || "25",
        discount24Month: auction.discountOffers?.twentyFourMonth || "",
        manufacturer: auction.vehicleManufacturer || "",
        vehicleType: auction.vehicleType || "",
        yearOfManufacture: auction.yearofmanufacturer || "",
        manufactureCountry: auction.manufactureCountry || "Not Available",
        model: auction.vehicleModel || "",
        registrationPlate: auction.registrationPlate || "",
        dailyMileage: auction.dailyMileage || "",
        availability: selectedAvailability,
        prohibitedAds: {
          gambling: auction.prohibitedAds?.gambling || false,
          alcohol: auction.prohibitedAds?.alcohol || false,
          smoking: auction.prohibitedAds?.smoking || false,
          otherSpecify: auction.prohibitedAds?.otherSpecify || "",
        },
        routeFrom: route.from || "",
        routeTo: route.to || "",
      });

      // Load existing images
      if (auction.images && auction.images.length > 0) {
        const urls = auction.images.map((img) => img.url);
        setImgUrls(urls);
      }

      // Load locations
      const allLocs = [
        auction.location,
        ...(auction.additionalLocations || []),
      ].filter(Boolean);
      const mappedLocs = allLocs.map((loc) => ({
        lat: loc.coordinates[1],
        lng: loc.coordinates[0],
        name: loc.name || "",
        zip: loc.zip || "",
        location: {
          type: "Point",
          coordinates: loc.coordinates,
        },
      }));
      setLocations(mappedLocs);
      setZipCodes(auction.zipCodesCovered || []);
    }
  }, [auction]);

  const debounceRef = useRef(
    _.debounce(async (query) => {
      if (!query || query.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
        );
        setSuggestions(response.data);
      } catch (error) {
        setSuggestions([]);
      }
    }, 800),
  );

  const handleLocationSelect = (location) => {
    const newLocation = {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
      name: location.display_name,
      zip: location.address?.postcode || "",
      location: {
        type: "Point",
        coordinates: [parseFloat(location.lon), parseFloat(location.lat)],
      },
    };
    setLocations((prev) => [...prev, newLocation]);
    setZipCodes((prev) =>
      [...new Set([...prev, newLocation.zip])].filter(Boolean),
    );
    setQuery("");
    setSuggestions([]);
    toast.success("Location added!");
  };

  const getCurrentLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const data = response.data;
          const newLocation = {
            lat: latitude,
            lng: longitude,
            name: data.display_name,
            zip: data.address?.postcode || "",
            location: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
          };
          setLocations((prev) => [...prev, newLocation]);
          setZipCodes((prev) => [...new Set([...prev, newLocation.zip])]);
          toast.success("Current location added!");
        } catch (error) {
          toast.error("Failed to get address");
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.error("Location access denied");
        setLoading(false);
      },
    );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("prohibitedAds.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        prohibitedAds: {
          ...prev.prohibitedAds,
          [field]: type === "checkbox" ? checked : value,
        },
      }));
    } else if (name === "availability") {
      setFormData((prev) => ({
        ...prev,
        availability: value,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const removeLocation = (index) => {
    setLocations((prev) => prev.filter((_, i) => i !== index));
    const newZips = zipCodes.filter((_, i) => i !== index);
    setZipCodes(newZips);
  };

  const handlePreSelectVehicle = (vehicleId) => {
  const vehicle = approvedVehicles.find((v) => v._id === vehicleId);

  if (vehicle) {
    setPreSelectedVehicle(vehicle);

    setFormData((prev) => ({
      ...prev,
      vehicleType: vehicle.vehicle || "",
      model: vehicle.model || "",
      manufacturer: vehicle.manufacturer || "",
      yearOfManufacture: vehicle.yearOfManufacture || "",
      manufactureCountry: vehicle.country || "Not Available",

      // Vehicle ke according ye bhi change hoga
      registrationPlate:
        vehicle.registrationPlate ||
        vehicle.regoPlate ||
        vehicle.registrationNumber ||
        "",

      dailyMileage:
        vehicle.dailyMileage ||
        vehicle.kmsPerDay ||
        "",
    }));

    if (vehicle.images?.length > 0) {
      setImgUrls(vehicle.images);
    }

    // Optional: image index reset
    setCurrentImageIndex(0);
  }
};

  const validateForm = () => {
    const newErrors = {};
    if (!formData.startTime) newErrors.startTime = "Start time required";
    if (!formData.endTime) newErrors.endTime = "End time required";
    if (formData.availability.length === 0)
      newErrors.availability = "Select availability";
    if (locations.length === 0)
      newErrors.locations = "Add at least one location";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();

    formDataToSend.append(
      "locations",
      JSON.stringify(
        locations.map((loc) => ({
          name: loc.name,
          zip: loc.zip,
          location: loc.location,
        })),
      ),
    );
    formDataToSend.append("zipCodes", JSON.stringify(zipCodes));
    formDataToSend.append(
      "availability",
      JSON.stringify([formData.availability]),
    );
    formDataToSend.append(
      "prohibitedAds",
      JSON.stringify(formData.prohibitedAds),
    );

    if (formData.routeFrom && formData.routeTo) {
      formDataToSend.append(
        "interRoutes",
        JSON.stringify([{ from: formData.routeFrom, to: formData.routeTo }]),
      );
    }

    imageFiles.forEach((file) => formDataToSend.append("images", file));

    Object.entries(formData).forEach(([key, value]) => {
      if (
        ![
          "images",
          "locations",
          "zipCodes",
          "availability",
          "prohibitedAds",
        ].includes(key)
      ) {
        formDataToSend.append(key, value);
      }
    });

    try {
      await dispatch(updateFleetAuction({ id, data: formDataToSend })).unwrap();
      toast.success("Fleet auction updated successfully!");
      navigate("/user-profile/manage-fleetauction");
    } catch (err) {
      toast.error("Failed to update auction");
    }
  };

  if (reduxLoading && !auction) {
    return (
      <div className="text-center py-20 text-black text-2xl">
        Loading auction...
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="text-center py-20 text-red-500 text-2xl">
        Auction not found
      </div>
    );
  }
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? imgUrls.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === imgUrls.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div className="p-6 flex-1 bg-theme-bg rounded-lg shadow-md text-white">
      <h2 className="text-3xl font-bold mb-8 text-center">
        Edit Fleet Auction
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 mb-6 lg:mb-0">
            <div className="bg-theme-bg2 p-4 rounded-lg h-full">
              <h3 className="text-lg font-semibold mb-4 text-white-700">
                Vehicle Images{" "}
                <span className="text-xs text-gray-400">
                  (Optional - Update if needed)
                </span>
              </h3>

              {/* Upload New Images Button */}
              <div className="mb-6">
                <label className="cursor-pointer inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span>Upload New Images (Max 5)</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      if (files.length > 5) {
                        toast.error("Maximum 5 images allowed");
                        return;
                      }
                      setImageFiles(files);
                      const previewUrls = files.map((file) =>
                        URL.createObjectURL(file),
                      );
                      setImgUrls(previewUrls);
                      toast.success(`${files.length} image(s) selected`);
                    }}
                    className="hidden"
                  />
                </label>
                {imageFiles.length > 0 && (
                  <p className="text-sm text-green-400 mt-2">
                    {imageFiles.length} new image(s) will be uploaded on save
                  </p>
                )}
              </div>

              {/* Current Images Display */}
              {imgUrls.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative w-full h-80 rounded-lg border-2 border-white/20 bg-gray-900/50 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <img
                        src={imgUrls[currentImageIndex]}
                        alt={`Vehicle ${currentImageIndex + 1}`}
                        className="max-w-full max-h-full object-contain rounded"
                        // No broken image - fallback to placeholder
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/600x400/1a1a1a/ffffff?text=Image+Not+Available";
                        }}
                      />
                    </div>

                    {/* Navigation Arrows */}
                    {imgUrls.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                        >
                          →
                        </button>
                      </>
                    )}

                    {/* Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                      {currentImageIndex + 1} / {imgUrls.length}
                    </div>
                  </div>

                  {/* Thumbnails */}
                  {imgUrls.length > 1 && (
                    <div className="grid grid-cols-5 gap-3">
                      {imgUrls.map((url, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentImageIndex(index);
                          }}
                          className={`aspect-square rounded-lg overflow-hidden border-4 transition-all ${
                            index === currentImageIndex
                              ? "border-blue-500 shadow-lg scale-105"
                              : "border-white/30 hover:border-white/60"
                          }`}
                        >
                          <img
                            src={url}
                            alt={`thumb ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/100/1a1a1a/666666?text=Img";
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-80 bg-theme-bg/50 rounded-xl border-2 border-dashed border-gray-500 flex flex-col items-center justify-center text-gray-400">
                  <svg
                    className="w-20 h-20 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-lg font-medium">No images available</p>
                  <p className="text-sm mt-2">Upload new images above</p>
                </div>
              )}

              {/* Route Map Section - Directly integrated */}
              <div className="bg-theme-bg2 p-4 rounded-lg mt-6">
                <h3 className="text-lg font-semibold mb-4 text-white-700">
                  Route Map ({locations.length} locations)
                </h3>

                {renderMap()}

                {/* Location List */}
                {locations.length > 0 && (
                  <div className="mt-4 bg-black/50 backdrop-blur-md rounded-xl p-4 max-h-40 overflow-y-auto">
                    <p className="text-sm font-semibold mb-3 text-purple-300">
                      Selected Zip Codes ({locations.length}):
                    </p>

                    <div className="flex flex-col gap-2">
                      {locations.map((loc, i) => (
                        <div
                          key={i}
                          className="text-xs text-gray-200 bg-purple-900/30 rounded-lg px-3 py-2 border border-purple-700/40"
                          title={loc.name}
                        >
                          <div className="font-medium text-purple-300">
                            {loc.zip || "N/A"}
                          </div>
                          <div className="text-gray-300 break-words text-sm">
                            {loc.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-theme-bg2 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-white-700">
                Select Your Vehicle <span className="text-red-500">*</span>
              </h3>
              <select
                value={preSelectedVehicle?._id || ""}
                onChange={(e) => handlePreSelectVehicle(e.target.value)}
                className="w-full px-3 py-2 bg-theme-bg border rounded-md border-gray-300"
              >
                <option value="">
                  -- Choose one of your approved vehicles --
                </option>
                {approvedVehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.vehicle} - {v.manufacturer} {v.model} (
                    {v.yearOfManufacture})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-theme-bg2 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-white-700">
                Basic Information
              </h3>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white-700 mb-1">
                    Company Name
                  </label>
                  <input
                    name="company"
                    className="w-full px-3 py-2 bg-theme-bg border rounded-md"
                    value={formData.company}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white-700 mb-1">
                    Account Number
                  </label>
                  <input
                    name="accountNumber"
                    className="w-full px-3 py-2 bg-theme-bg border rounded-md"
                    value={formData.accountNumber}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white-700 mb-1">
                    Suburb
                  </label>
                  <input
                    name="suburb"
                    className="w-full px-3 py-2 bg-theme-bg border rounded-md"
                    value={formData.suburb}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="bg-theme-bg2 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-white-700">
                Location Information
              </h3>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mt-6">
                <div>
                  <label className="block text-sm font-medium text-white-700 mb-1">
                    Country
                  </label>
                  <select
                    value={selectedCountry?.id || ""}
                    onChange={(e) => {
                      const countryId = parseInt(e.target.value);
                      const country = countries.find((c) => c.id === countryId);
                      if (country) {
                        setSelectedCountry(country);
                        setStates(country.states || []);
                        setFormData((prev) => ({
                          ...prev,
                          country: country.name,
                        }));
                      }
                    }}
                    className="w-full pl-5 py-3 rounded text-white bg-theme-bg border border-border-info-color"
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-white">
                    State / County
                  </label>
                  <select
                    value={selectedState?.id || ""}
                    onChange={(e) => {
                      const stateId = parseInt(e.target.value);
                      const state = states.find((s) => s.id === stateId);
                      if (state) {
                        setSelectedState(state);
                        setCities(state.cities || []);
                        setFormData((prev) => ({ ...prev, state: state.name }));
                      }
                    }}
                    className="w-full pl-5 py-3 rounded text-white bg-theme-bg border border-border-info-color"
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-white">
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.city || ""}
                    onChange={handleChange}
                    name="city"
                    disabled={!selectedState || cities.length === 0}
                    className={`w-full pl-5 py-3 rounded text-white bg-theme-bg outline-none border ${
                      !selectedState ? "opacity-50 cursor-not-allowed" : ""
                    } border-border-info-color`}
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-white-700 mb-1">
                  Search Location to Add
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      debounceRef.current(e.target.value);
                    }}
                    placeholder="Search location..."
                    className="w-full px-4 py-2 bg-theme-bg border rounded-md"
                  />
                  <BiCurrentLocation
                    size={24}
                    className="absolute right-3 top-2 cursor-pointer"
                    onClick={getCurrentLocation}
                  />
                  {suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-theme-bg2 border mt-1 rounded-md shadow-lg">
                      {suggestions.map((sug, i) => (
                        <li
                          key={i}
                          onClick={() => handleLocationSelect(sug)}
                          className="p-2 hover:bg-theme-bg cursor-pointer"
                        >
                          {sug.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {locations.length > 0 && (
                <div className="mt-4">
                  <ul className="space-y-2">
                    {locations.map((loc, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center bg-theme-bg p-2 rounded"
                      >
                        <span>
                          {loc.name} (Zip: {loc.zip || "N/A"})
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLocation(index)}
                          className="text-red-500"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4">
                <label className="block">Interstate/Intercity Routes</label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <input
                    name="routeFrom"
                    value={formData.routeFrom}
                    onChange={handleChange}
                    placeholder="From"
                    className="px-3 py-2 bg-theme-bg border rounded"
                  />
                  <input
                    name="routeTo"
                    value={formData.routeTo}
                    onChange={handleChange}
                    placeholder="To"
                    className="px-3 py-2 bg-theme-bg border rounded"
                  />
                </div>
              </div>
            </div>

            <div className="bg-theme-bg2 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-white-700">
                Auction Time
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>
                    Auction Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-theme-bg border rounded-md"
                  />
                </div>
                <div>
                  <label>
                    Auction End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-theme-bg border rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="bg-theme-bg2 p-4 rounded-lg">
  <h3 className="text-lg font-semibold mb-4 text-white">
    Vehicle Details
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-white mb-1">
        Vehicle Type
      </label>
      <input
        value={formData.vehicleType}
        readOnly
        className="w-full px-3 py-2 bg-theme-bg border rounded-md"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-white mb-1">
        Model
      </label>
      <input
        value={formData.model}
        readOnly
        className="w-full px-3 py-2 bg-theme-bg border rounded-md"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-white mb-1">
        Manufacturer
      </label>
      <input
        value={formData.manufacturer}
        readOnly
        className="w-full px-3 py-2 bg-theme-bg border rounded-md"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-white mb-1">
        Year of Manufacture
      </label>
      <input
        value={formData.yearOfManufacture}
        readOnly
        className="w-full px-3 py-2 bg-theme-bg border rounded-md"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-white mb-1">
        Kms Per Day
      </label>
      <input
        value={formData.dailyMileage}
        readOnly
        className="w-full px-3 py-2 bg-theme-bg border rounded-md"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-white mb-1">
        Manufacture Country
      </label>
      <input
        value={formData.manufactureCountry}
        readOnly
        className="w-full px-3 py-2 bg-theme-bg border rounded-md"
      />
    </div>
  </div>
</div>
            <h3 className="text-lg font-semibold mb-4 text-white-700">
              Registration Plate Number
            </h3>
            <input
              name="registrationPlate"
              value={formData.registrationPlate}
              onChange={handleChange}
              className="px-3 py-2 bg-theme-bg border rounded-md"
              placeholder="Registration Plate Number"
            />

            <div className="bg-theme-bg2 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-white-700">
                Vehicle Availability <span className="text-red-500">*</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["3 Months", "6 Months", "12 Months", "24 Months"].map(
                  (val) => (
                    <label
                      key={val}
                      className={`flex items-center justify-center cursor-pointer border rounded-lg px-4 py-4 text-sm font-medium transition-all ${
                        formData.availability === val
                          ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                          : "bg-theme-bg text-white border-gray-600 hover:bg-theme-bg2"
                      }`}
                    >
                      <input
                        type="radio"
                        name="availability"
                        value={val}
                        checked={formData.availability === val}
                        onChange={handleChange}
                        className="hidden"
                      />
                      {val}
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

          <div className="bg-theme-bg2 p-4 rounded-lg">
  <h3 className="text-lg font-semibold mb-4 text-white-700">
    Pricing Information
  </h3>

  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">

    {/* Auction Rates */}
    <div>
      <h4 className="font-medium mb-3">Auction Rates</h4>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Full Wrap
          </label>
          <input
            name="auctionRateFullWrap"
            type="number"
            value={formData.auctionRateFullWrap}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-theme-bg border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            One Side
          </label>
          <input
            name="auctionRateOneSide"
            type="number"
            value={formData.auctionRateOneSide}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-theme-bg border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Both Sides
          </label>
          <input
            name="auctionRateBothSides"
            type="number"
            value={formData.auctionRateBothSides}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-theme-bg border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Rear Doors
          </label>
          <input
            name="auctionRateRearDoors"
            type="number"
            value={formData.auctionRateRearDoors}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-theme-bg border rounded-md"
          />
        </div>
      </div>
    </div>

    {/* Buy Now Rates */}
    <div>
      <h4 className="font-medium mb-3">Buy Now Rates</h4>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Full Wrap
          </label>
          <input
            name="buyNowRateFullWrap"
            type="number"
            value={formData.buyNowRateFullWrap}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-theme-bg border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            One Side
          </label>
          <input
            name="buyNowRateOneSide"
            type="number"
            value={formData.buyNowRateOneSide}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-theme-bg border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Both Sides
          </label>
          <input
            name="buyNowRateBothSides"
            type="number"
            value={formData.buyNowRateBothSides}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-theme-bg border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Rear Doors
          </label>
          <input
            name="buyNowRateRearDoors"
            type="number"
            value={formData.buyNowRateRearDoors}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-theme-bg border rounded-md"
          />
        </div>
      </div>
    </div>

  </div>
</div>
{/* Campaign Length Discounts */}
<div className="md:col-span-2 mt-4">
  <h4 className="font-medium mb-3">
    Campaign Length Discounts
  </h4>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

    <div>
      <label className="block text-sm font-medium mb-1">
        3 Month Discount (%)
      </label>
      <input
        name="discount3Month"
        type="number"
        min="0"
        max="100"
        value={formData.discount3Month}
        onChange={handleChange}
        className="w-full px-3 py-2 bg-theme-bg border rounded-md"
        placeholder="10"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        6 Month Discount (%)
      </label>
      <input
        name="discount6Month"
        type="number"
        min="0"
        max="100"
        value={formData.discount6Month}
        onChange={handleChange}
        className="w-full px-3 py-2 bg-theme-bg border rounded-md"
        placeholder="15"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        12 Month Discount (%)
      </label>
      <input
        name="discount12Month"
        type="number"
        min="0"
        max="100"
        value={formData.discount12Month}
        onChange={handleChange}
        className="w-full px-3 py-2 bg-theme-bg border rounded-md"
        placeholder="25"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        24 Month Discount (%)
      </label>
      <input
        name="discount24Month"
        type="number"
        min="0"
        max="100"
        value={formData.discount24Month}
        onChange={handleChange}
        className="w-full px-3 py-2 bg-theme-bg border rounded-md"
        placeholder="Enter discount"
      />
    </div>

  </div>
</div>
            <div className="bg-theme-bg2 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">Prohibited Ads</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {["gambling", "alcohol", "smoking"].map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2 bg-theme-bg border px-4 py-2 rounded-md cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name={`prohibitedAds.${item}`}
                      checked={formData.prohibitedAds[item] || false}
                      onChange={handleChange}
                      className="accent-blue-500 h-4 w-4"
                    />
                    <span className="capitalize text-sm">{item}</span>
                  </label>
                ))}

                {/* Other Option */}
                <div className="col-span-2 sm:col-span-4">
                  <label className="flex items-center gap-2 bg-theme-bg border px-4 py-2 rounded-md cursor-pointer">
                    <input
                      type="checkbox"
                      name="prohibitedAds.other"
                      checked={formData.prohibitedAds.other || false}
                      onChange={handleChange}
                      className="accent-blue-500 h-4 w-4"
                    />
                    <span className="text-sm">Other</span>
                  </label>

                  {/* Yeh input tab dikhega jab "Other" checked ho */}
                  {formData.prohibitedAds.other && (
                    <div className="mt-3 ml-8">
                      <input
                        type="text"
                        name="prohibitedAds.otherSpecify"
                        value={formData.prohibitedAds.otherSpecify || ""}
                        onChange={handleChange}
                        placeholder="Please specify..."
                        className="w-full px-4 py-2 bg-theme-bg2 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-10">
              <button
                type="submit"
                disabled={reduxLoading}
                className="px-10 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {reduxLoading ? "Updating..." : "Update Auction"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditFleetAuction;

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   getfleetauctionbyid,
//   updateFleetAuction,
//   resetFleetOwner,
// } from "../store/fleetowner/fleetownerSlice";
// import { fetchVehicles } from "../store/vehicle/vehicleSlice";
// import { toast } from "react-toastify";
// import worldData from "../countries+states+cities.json";
// import axios from "axios";
// import _ from "lodash";
// import { BiCurrentLocation } from "react-icons/bi";
// import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
// import GoogleMapComponent from "../components/GoogleComponents";
// const EditFleetAuction = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const {
//     form,
//     isLoading: reduxLoading,
//     isSuccess,
//     isError,
//     message,
//   } = useSelector((state) => state.fleetOwner);
//   const { fleetvehclelist = [] } = useSelector((state) => state.vehicles || {});
//   const approvedVehicles = fleetvehclelist?.filter((v) => v.isApproved) || [];
//   const { user } = useSelector((state) => state.auth);

//   const auction = form?.data;

//   const [selectedCountry, setSelectedCountry] = useState(null);
//   const [selectedState, setSelectedState] = useState("");
//   const [query, setQuery] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [suggestions, setSuggestions] = useState([]);
//   const [suggestionsError, setSuggestionsError] = useState("");
//   const [imgUrls, setImgUrls] = useState([]);
//   const [imageFiles, setImageFiles] = useState([]);
//   const [hasSubmitted, setHasSubmitted] = useState(false);
//   const [zipCodes, setZipCodes] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   const mapRef = useRef(null);
//   const [mapLoaded, setMapLoaded] = useState(false);

//   const [preSelectedVehicle, setPreSelectedVehicle] = useState(null);

//   const [formData, setFormData] = useState({
//     company: "",
//     accountNumber: "",
//     suburb: "",
//     city: "",
//     state: "",
//     startTime: "",
//     endTime: "",
//     country: "",
//     zipCodes: [],
//     routeFrom: "",
//     routeTo: "",
//     auctionRateFullWrap: "",
//     auctionRateOneSide: "",
//     auctionRateBothSides: "",
//     auctionRateRearDoors: "",
//     buyNowRateFullWrap: "",
//     buyNowRateOneSide: "",
//     buyNowRateBothSides: "",
//     buyNowRateRearDoors: "",
//     discount3Month: "10",
//     discount6Month: "15",
//     discount12Month: "25",
//     discount24Month: "",
//     manufacturer: "",
//     vehicleType: "",
//     yearOfManufacture: "",
//     manufactureCountry: "",
//     model: "",
//     registrationPlate: "",
//     availability: [],
//     prohibitedAds: {
//       gambling: false,
//       alcohol: false,
//       smoking: false,
//       otherSpecify: "",
//     },
//     images: [],
//     locations: [],
//   });

//   const [errors, setErrors] = useState({});
//   const defaultCenter = { lat: 20.5937, lng: 78.9629 };
//   const containerStyle = {
//     width: "100%",
//     height: "400px",
//   };

//   // Fetch auction data
//   useEffect(() => {
//     if (id) {
//       dispatch(getfleetauctionbyid(id));
//     }
//   }, [id, dispatch]);
//   useEffect(() => {
//     if (auction?.country) {
//       setSelectedCountry({
//         id: auction.country.isoCode,
//         name: auction.country.name,
//         isoCode: auction.country.isoCode,
//       });
//     }
//   }, [auction]);
//   // Fetch vehicles
//   useEffect(() => {
//     dispatch(fetchVehicles());
//   }, [dispatch]);

//   // Load countries
//   useEffect(() => {
//     if (worldData && worldData.length > 0) {
//       const countriesWithIso = worldData.map((country) => ({
//         ...country,
//         isoCode: country.iso2 || country.isoCode || country.code || "",
//       }));
//       setCountries(countriesWithIso);
//     }
//   }, []);

//   // Pre-fill form when auction data loads
//   useEffect(() => {
//     if (auction && countries.length > 0) {
//       const auctionCountry = countries.find(
//         (c) => c.name.toLowerCase() === (auction.country || "").toLowerCase()
//       );

//       if (auctionCountry) {
//         setSelectedCountry(auctionCountry);
//         setStates(auctionCountry.states || []);

//         // Find and set State
//         if (auction.state) {
//           const auctionState = auctionCountry.states?.find(
//             (s) => s.name.toLowerCase() === auction.state.toLowerCase()
//           );
//           if (auctionState) {
//             setSelectedState(auctionState);
//             setCities(auctionState.cities || []);
//           }
//         }
//       }
//       const startTime = auction.startTime
//         ? new Date(auction.startTime).toISOString().slice(0, 16)
//         : "";
//       const endTime = auction.endTime
//         ? new Date(auction.endTime).toISOString().slice(0, 16)
//         : "";

//       let selectedAvailability = "";

//       if (auction.vehicleAvailability?.twentyFourMonths === "Available") {
//         selectedAvailability = "24 Months";
//       } else if (auction.vehicleAvailability?.twelveMonths === "Available") {
//         selectedAvailability = "12 Months";
//       } else if (auction.vehicleAvailability?.sixMonths === "Available") {
//         selectedAvailability = "6 Months";
//       } else if (auction.vehicleAvailability?.threeMonths === "Available") {
//         selectedAvailability = "3 Months";
//       }
//       const route = auction.interRoutes?.[0] || { from: "", to: "" };

//       setFormData({
//         company: auction.company || "",
//         accountNumber: auction.accountNumber || "",
//         suburb: auction.suburb || "",
//         city: auction.townOrCity || "",
//         state: auction.state || "",
//         country: auction.country || "",
//         startTime,
//         endTime,
//         auctionRateFullWrap: auction.minAuctionRates?.fullWrap || "",
//         auctionRateOneSide: auction.minAuctionRates?.oneSide || "",
//         auctionRateBothSides: auction.minAuctionRates?.bothSides || "",
//         auctionRateRearDoors: auction.minAuctionRates?.rearDoors || "",
//         buyNowRateFullWrap: auction.buyNowRates?.fullWrap || "",
//         buyNowRateOneSide: auction.buyNowRates?.oneSide || "",
//         buyNowRateBothSides: auction.buyNowRates?.bothSides || "",
//         buyNowRateRearDoors: auction.buyNowRates?.rearDoors || "",
//         discount3Month: auction.discountOffers?.threeMonth || "10",
//         discount6Month: auction.discountOffers?.sixMonth || "15",
//         discount12Month: auction.discountOffers?.twelveMonth || "25",
//         discount24Month: auction.discountOffers?.twentyFourMonth || "",
//         manufacturer: auction.vehicleManufacturer || "",
//         vehicleType: auction.vehicleType || "",
//         yearOfManufacture: auction.yearofmanufacturer || "",
//         manufactureCountry: auction.manufactureCountry || "Not Available",
//         model: auction.vehicleModel || "",
//         registrationPlate: auction.registrationPlate || "",
//         availability: selectedAvailability,
//         prohibitedAds: {
//           gambling: auction.prohibitedAds?.gambling || false,
//           alcohol: auction.prohibitedAds?.alcohol || false,
//           smoking: auction.prohibitedAds?.smoking || false,
//           otherSpecify: auction.prohibitedAds?.otherSpecify || "",
//         },
//         routeFrom: route.from || "",
//         routeTo: route.to || "",
//       });

//       // Load existing images
//       if (auction.images && auction.images.length > 0) {
//         const urls = auction.images.map((img) => img.url);
//         setImgUrls(urls);
//       }

//       // Load locations
//       const allLocs = [
//         auction.location,
//         ...(auction.additionalLocations || []),
//       ].filter(Boolean);
//       const mappedLocs = allLocs.map((loc) => ({
//         lat: loc.coordinates[1],
//         lng: loc.coordinates[0],
//         name: loc.name || "",
//         zip: loc.zip || "",
//         location: {
//           type: "Point",
//           coordinates: loc.coordinates,
//         },
//       }));
//       setLocations(mappedLocs);
//       setZipCodes(auction.zipCodesCovered || []);
//     }
//   }, [auction]);

//   const debounceRef = useRef(
//     _.debounce(async (query) => {
//       if (!query || query.length < 3) {
//         setSuggestions([]);
//         return;
//       }
//       try {
//         const response = await axios.get(
//           `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`
//         );
//         setSuggestions(response.data);
//       } catch (error) {
//         setSuggestions([]);
//       }
//     }, 800)
//   );

//   const handleLocationSelect = (location) => {
//     const newLocation = {
//       lat: parseFloat(location.lat),
//       lng: parseFloat(location.lon),
//       name: location.display_name,
//       zip: location.address?.postcode || "",
//       location: {
//         type: "Point",
//         coordinates: [parseFloat(location.lon), parseFloat(location.lat)],
//       },
//     };
//     setLocations((prev) => [...prev, newLocation]);
//     setZipCodes((prev) =>
//       [...new Set([...prev, newLocation.zip])].filter(Boolean)
//     );
//     setQuery("");
//     setSuggestions([]);
//     toast.success("Location added!");
//   };

//   const getCurrentLocation = () => {
//     setLoading(true);
//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const { latitude, longitude } = position.coords;
//         try {
//           const response = await axios.get(
//             `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
//           );
//           const data = response.data;
//           const newLocation = {
//             lat: latitude,
//             lng: longitude,
//             name: data.display_name,
//             zip: data.address?.postcode || "",
//             location: {
//               type: "Point",
//               coordinates: [longitude, latitude],
//             },
//           };
//           setLocations((prev) => [...prev, newLocation]);
//           setZipCodes((prev) => [...new Set([...prev, newLocation.zip])]);
//           toast.success("Current location added!");
//         } catch (error) {
//           toast.error("Failed to get address");
//         } finally {
//           setLoading(false);
//         }
//       },
//       () => {
//         toast.error("Location access denied");
//         setLoading(false);
//       }
//     );
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     if (name.startsWith("prohibitedAds.")) {
//       const field = name.split(".")[1];
//       setFormData((prev) => ({
//         ...prev,
//         prohibitedAds: {
//           ...prev.prohibitedAds,
//           [field]: type === "checkbox" ? checked : value,
//         },
//       }));
//     } else if (name === "availability") {
//       setFormData((prev) => ({
//         ...prev,
//         availability: value,
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const removeLocation = (index) => {
//     setLocations((prev) => prev.filter((_, i) => i !== index));
//     const newZips = zipCodes.filter((_, i) => i !== index);
//     setZipCodes(newZips);
//   };

//   const handlePreSelectVehicle = (vehicleId) => {
//     const vehicle = approvedVehicles.find((v) => v._id === vehicleId);
//     if (vehicle) {
//       setPreSelectedVehicle(vehicle);
//       setFormData((prev) => ({
//         ...prev,
//         vehicleType: vehicle.vehicle || "",
//         model: vehicle.model || "",
//         manufacturer: vehicle.manufacturer || "",
//         yearOfManufacture: vehicle.yearOfManufacture || "",
//         manufactureCountry: vehicle.country || "Not Available",
//       }));
//       if (vehicle.images?.length > 0) {
//         setImgUrls(vehicle.images);
//       }
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.startTime) newErrors.startTime = "Start time required";
//     if (!formData.endTime) newErrors.endTime = "End time required";
//     if (formData.availability.length === 0)
//       newErrors.availability = "Select availability";
//     if (locations.length === 0)
//       newErrors.locations = "Add at least one location";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     const formDataToSend = new FormData();

//     formDataToSend.append(
//       "locations",
//       JSON.stringify(
//         locations.map((loc) => ({
//           name: loc.name,
//           zip: loc.zip,
//           location: loc.location,
//         }))
//       )
//     );
//     formDataToSend.append("zipCodes", JSON.stringify(zipCodes));
//     formDataToSend.append(
//       "availability",
//       JSON.stringify([formData.availability])
//     );
//     formDataToSend.append(
//       "prohibitedAds",
//       JSON.stringify(formData.prohibitedAds)
//     );

//     if (formData.routeFrom && formData.routeTo) {
//       formDataToSend.append(
//         "interRoutes",
//         JSON.stringify([{ from: formData.routeFrom, to: formData.routeTo }])
//       );
//     }

//     imageFiles.forEach((file) => formDataToSend.append("images", file));

//     Object.entries(formData).forEach(([key, value]) => {
//       if (
//         ![
//           "images",
//           "locations",
//           "zipCodes",
//           "availability",
//           "prohibitedAds",
//         ].includes(key)
//       ) {
//         formDataToSend.append(key, value);
//       }
//     });

//     try {
//       await dispatch(updateFleetAuction({ id, data: formDataToSend })).unwrap();
//       toast.success("Fleet auction updated successfully!");
//       navigate("/user-profile/manage-fleetauction");
//     } catch (err) {
//       toast.error("Failed to update auction");
//     }
//   };

//   if (reduxLoading && !auction) {
//     return (
//       <div className="text-center py-20 text-white text-2xl">
//         Loading auction...
//       </div>
//     );
//   }

//   if (!auction) {
//     return (
//       <div className="text-center py-20 text-red-500 text-2xl">
//         Auction not found
//       </div>
//     );
//   }
//   const handlePrevImage = () => {
//     setCurrentImageIndex((prev) =>
//       prev === 0 ? imgUrls.length - 1 : prev - 1
//     );
//   };

//   const handleNextImage = () => {
//     setCurrentImageIndex((prev) =>
//       prev === imgUrls.length - 1 ? 0 : prev + 1
//     );
//   };
//   return (
//     <div className="p-6 flex-1 bg-theme-bg rounded-lg shadow-md text-white">
//       <h2 className="text-3xl font-bold mb-8 text-center">
//         Edit Fleet Auction
//       </h2>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//           <div className="lg:col-span-4 mb-6 lg:mb-0">
//             <div className="bg-theme-bg2 p-4 rounded-lg h-full">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Vehicle Images{" "}
//                 <span className="text-xs text-gray-400">
//                   (Optional - Update if needed)
//                 </span>
//               </h3>

//               {/* Upload New Images Button */}
//               <div className="mb-6">
//                 <label className="cursor-pointer inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition">
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//                     />
//                   </svg>
//                   <span>Upload New Images (Max 5)</span>
//                   <input
//                     type="file"
//                     multiple
//                     accept="image/*"
//                     onChange={(e) => {
//                       const files = Array.from(e.target.files);
//                       if (files.length > 5) {
//                         toast.error("Maximum 5 images allowed");
//                         return;
//                       }
//                       setImageFiles(files);
//                       const previewUrls = files.map((file) =>
//                         URL.createObjectURL(file)
//                       );
//                       setImgUrls(previewUrls);
//                       toast.success(`${files.length} image(s) selected`);
//                     }}
//                     className="hidden"
//                   />
//                 </label>
//                 {imageFiles.length > 0 && (
//                   <p className="text-sm text-green-400 mt-2">
//                     {imageFiles.length} new image(s) will be uploaded on save
//                   </p>
//                 )}
//               </div>

//               {/* Current Images Display */}
//               {imgUrls.length > 0 ? (
//                 <div className="space-y-4">
//                   {/* Main Image */}
//                   <div className="relative w-full h-80 rounded-lg border-2 border-white/20 bg-gray-900/50 overflow-hidden">
//                     <div className="w-full h-full flex items-center justify-center p-4">
//                       <img
//                         src={imgUrls[currentImageIndex]}
//                         alt={`Vehicle ${currentImageIndex + 1}`}
//                         className="max-w-full max-h-full object-contain rounded"
//                         // No broken image - fallback to placeholder
//                         onError={(e) => {
//                           e.target.src =
//                             "https://via.placeholder.com/600x400/1a1a1a/ffffff?text=Image+Not+Available";
//                         }}
//                       />
//                     </div>

//                     {/* Navigation Arrows */}
//                     {imgUrls.length > 1 && (
//                       <>
//                         <button
//                           type="button"
//                           onClick={handlePrevImage}
//                           className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
//                         >
//                           ←
//                         </button>
//                         <button
//                           type="button"
//                           onClick={handleNextImage}
//                           className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
//                         >
//                           →
//                         </button>
//                       </>
//                     )}

//                     {/* Counter */}
//                     <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
//                       {currentImageIndex + 1} / {imgUrls.length}
//                     </div>
//                   </div>

//                   {/* Thumbnails */}
//                   {imgUrls.length > 1 && (
//                     <div className="grid grid-cols-5 gap-3">
//                       {imgUrls.map((url, index) => (
//                         <button
//                           key={index}
//                           type="button"
//                           onClick={(e) => {
//                             e.preventDefault();
//                             e.stopPropagation();
//                             setCurrentImageIndex(index);
//                           }}
//                           className={`aspect-square rounded-lg overflow-hidden border-4 transition-all ${
//                             index === currentImageIndex
//                               ? "border-blue-500 shadow-lg scale-105"
//                               : "border-white/30 hover:border-white/60"
//                           }`}
//                         >
//                           <img
//                             src={url}
//                             alt={`thumb ${index + 1}`}
//                             className="w-full h-full object-cover"
//                             onError={(e) => {
//                               e.target.src =
//                                 "https://via.placeholder.com/100/1a1a1a/666666?text=Img";
//                             }}
//                           />
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="w-full h-80 bg-theme-bg/50 rounded-xl border-2 border-dashed border-gray-500 flex flex-col items-center justify-center text-gray-400">
//                   <svg
//                     className="w-20 h-20 mb-4"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
//                     />
//                   </svg>
//                   <p className="text-lg font-medium">No images available</p>
//                   <p className="text-sm mt-2">Upload new images above</p>
//                 </div>
//               )}

//               <div className="bg-theme-bg2 p-4 rounded-lg mt-6">
//                 <h3 className="text-lg font-semibold mb-4 text-white-700">
//                   Route Map
//                 </h3>
//                 {auction && (
//                   <GoogleMapComponent
//                     zipCode={auction?.zipCodesCovered?.[0]}
//                     location={auction?.location?.name}
//                     latitude={auction?.location?.coordinates?.[1]}
//                     longitude={auction?.location?.coordinates?.[0]}
//                   />
//                 )}

//                 {/* Fallback if no data */}
//                 {!auction && (
//                   <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
//                     <p className="text-gray-600">Loading map...</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="lg:col-span-8 space-y-6">
//             <div className="bg-theme-bg2 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Select Your Vehicle <span className="text-red-500">*</span>
//               </h3>
//               <select
//                 value={preSelectedVehicle?._id || ""}
//                 onChange={(e) => handlePreSelectVehicle(e.target.value)}
//                 className="w-full px-3 py-2 bg-theme-bg border rounded-md border-gray-300"
//               >
//                 <option value="">
//                   -- Choose one of your approved vehicles --
//                 </option>
//                 {approvedVehicles.map((v) => (
//                   <option key={v._id} value={v._id}>
//                     {v.vehicle} - {v.manufacturer} {v.model} (
//                     {v.yearOfManufacture})
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="bg-theme-bg2 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Basic Information
//               </h3>
//               <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Company Name
//                   </label>
//                   <input
//                     name="company"
//                     className="w-full px-3 py-2 bg-theme-bg border rounded-md"
//                     value={formData.company}
//                     readOnly
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Account Number
//                   </label>
//                   <input
//                     name="accountNumber"
//                     className="w-full px-3 py-2 bg-theme-bg border rounded-md"
//                     value={formData.accountNumber}
//                     readOnly
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Suburb
//                   </label>
//                   <input
//                     name="suburb"
//                     className="w-full px-3 py-2 bg-theme-bg border rounded-md"
//                     value={formData.suburb}
//                     readOnly
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-theme-bg2 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Location Information
//               </h3>

//               <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mt-6">
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Country
//                   </label>
//                   <select
//                     value={selectedCountry?.id || ""}
//                     onChange={(e) => {
//                       const countryId = parseInt(e.target.value);
//                       const country = countries.find((c) => c.id === countryId);
//                       if (country) {
//                         setSelectedCountry(country);
//                         setStates(country.states || []);
//                         setFormData((prev) => ({
//                           ...prev,
//                           country: country.name,
//                         }));
//                       }
//                     }}
//                     className="w-full pl-5 py-3 rounded text-white bg-theme-bg border border-border-info-color"
//                   >
//                     <option value="">Select Country</option>
//                     {countries.map((c) => (
//                       <option key={c.id} value={c.id}>
//                         {c.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block mb-1 text-white">
//                     State / County
//                   </label>
//                   <select
//                     value={selectedState?.id || ""}
//                     onChange={(e) => {
//                       const stateId = parseInt(e.target.value);
//                       const state = states.find((s) => s.id === stateId);
//                       if (state) {
//                         setSelectedState(state);
//                         setCities(state.cities || []);
//                         setFormData((prev) => ({ ...prev, state: state.name }));
//                       }
//                     }}
//                     className="w-full pl-5 py-3 rounded text-white bg-theme-bg border border-border-info-color"
//                   >
//                     <option value="">Select State</option>
//                     {states.map((s) => (
//                       <option key={s.id} value={s.id}>
//                         {s.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block mb-1 text-white">
//                     City <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     value={formData.city || ""}
//                     onChange={handleChange}
//                     name="city"
//                     disabled={!selectedState || cities.length === 0}
//                     className={`w-full pl-5 py-3 rounded text-white bg-theme-bg outline-none border ${
//                       !selectedState ? "opacity-50 cursor-not-allowed" : ""
//                     } border-border-info-color`}
//                   >
//                     <option value="">Select City</option>
//                     {cities.map((city) => (
//                       <option key={city.id} value={city.name}>
//                         {city.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               <div className="mt-6">
//                 <label className="block text-sm font-medium text-white-700 mb-1">
//                   Search Location to Add
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="text"
//                     value={query}
//                     onChange={(e) => {
//                       setQuery(e.target.value);
//                       debounceRef.current(e.target.value);
//                     }}
//                     placeholder="Search location..."
//                     className="w-full px-4 py-2 bg-theme-bg border rounded-md"
//                   />
//                   <BiCurrentLocation
//                     size={24}
//                     className="absolute right-3 top-2 cursor-pointer"
//                     onClick={getCurrentLocation}
//                   />
//                   {suggestions.length > 0 && (
//                     <ul className="absolute z-10 w-full bg-theme-bg2 border mt-1 rounded-md shadow-lg">
//                       {suggestions.map((sug, i) => (
//                         <li
//                           key={i}
//                           onClick={() => handleLocationSelect(sug)}
//                           className="p-2 hover:bg-theme-bg cursor-pointer"
//                         >
//                           {sug.display_name}
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </div>
//               </div>

//               {locations.length > 0 && (
//                 <div className="mt-4">
//                   <ul className="space-y-2">
//                     {locations.map((loc, index) => (
//                       <li
//                         key={index}
//                         className="flex justify-between items-center bg-theme-bg p-2 rounded"
//                       >
//                         <span>
//                           {loc.name} (Zip: {loc.zip || "N/A"})
//                         </span>
//                         <button
//                           type="button"
//                           onClick={() => removeLocation(index)}
//                           className="text-red-500"
//                         >
//                           Remove
//                         </button>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               <div className="mt-4">
//                 <label className="block">Interstate/Intercity Routes</label>
//                 <div className="grid grid-cols-2 gap-4 mt-2">
//                   <input
//                     name="routeFrom"
//                     value={formData.routeFrom}
//                     onChange={handleChange}
//                     placeholder="From"
//                     className="px-3 py-2 bg-theme-bg border rounded"
//                   />
//                   <input
//                     name="routeTo"
//                     value={formData.routeTo}
//                     onChange={handleChange}
//                     placeholder="To"
//                     className="px-3 py-2 bg-theme-bg border rounded"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-theme-bg2 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Auction Time
//               </h3>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label>
//                     Auction Start Time <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="datetime-local"
//                     name="startTime"
//                     value={formData.startTime}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 bg-theme-bg border rounded-md"
//                   />
//                 </div>
//                 <div>
//                   <label>
//                     Auction End Time <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="datetime-local"
//                     name="endTime"
//                     value={formData.endTime}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 bg-theme-bg border rounded-md"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-theme-bg2 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Vehicle Details
//               </h3>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <input
//                   value={formData.vehicleType}
//                   readOnly
//                   className="px-3 py-2 bg-theme-bg border rounded-md"
//                   placeholder="Type"
//                 />
//                 <input
//                   value={formData.model}
//                   readOnly
//                   className="px-3 py-2 bg-theme-bg border rounded-md"
//                   placeholder="Model"
//                 />
//                 <input
//                   value={formData.manufacturer}
//                   readOnly
//                   className="px-3 py-2 bg-theme-bg border rounded-md"
//                   placeholder="Manufacturer"
//                 />
//                 <input
//                   value={formData.yearOfManufacture}
//                   readOnly
//                   className="px-3 py-2 bg-theme-bg border rounded-md"
//                   placeholder="Year"
//                 />
//               </div>
//             </div>
//             <h3 className="text-lg font-semibold mb-4 text-white-700">
//               Registration Plate Number
//             </h3>
//             <input
//               name="registrationPlate"
//               value={formData.registrationPlate}
//               onChange={handleChange}
//               className="px-3 py-2 bg-theme-bg border rounded-md"
//               placeholder="Registration Plate Number"
//             />

//             <div className="bg-theme-bg2 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Vehicle Availability <span className="text-red-500">*</span>
//               </h3>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 {["3 Months", "6 Months", "12 Months", "24 Months"].map(
//                   (val) => (
//                     <label
//                       key={val}
//                       className={`flex items-center justify-center cursor-pointer border rounded-lg px-4 py-4 text-sm font-medium transition-all ${
//                         formData.availability === val
//                           ? "bg-blue-600 text-white border-blue-600 shadow-lg"
//                           : "bg-theme-bg text-white border-gray-600 hover:bg-theme-bg2"
//                       }`}
//                     >
//                       <input
//                         type="radio"
//                         name="availability"
//                         value={val}
//                         checked={formData.availability === val}
//                         onChange={handleChange}
//                         className="hidden"
//                       />
//                       {val}
//                     </label>
//                   )
//                 )}
//               </div>
//               {errors.availability && (
//                 <p className="text-red-500 text-sm mt-2">
//                   {errors.availability}
//                 </p>
//               )}
//             </div>

//             <div className="bg-theme-bg2 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Pricing Information
//               </h3>
//               <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
//                 <div>
//                   <h4 className="font-medium mb-3">Auction Rates</h4>
//                   <div className="space-y-3">
//                     <input
//                       name="auctionRateFullWrap"
//                       type="number"
//                       value={formData.auctionRateFullWrap}
//                       onChange={handleChange}
//                       placeholder="Full Wrap"
//                       className="w-full px-3 py-2 bg-theme-bg border rounded-md"
//                     />
//                     <input
//                       name="auctionRateOneSide"
//                       type="number"
//                       value={formData.auctionRateOneSide}
//                       onChange={handleChange}
//                       placeholder="One Side"
//                       className="w-full px-3 py-2 bg-theme-bg border rounded-md"
//                     />
//                     <input
//                       name="auctionRateBothSides"
//                       type="number"
//                       value={formData.auctionRateBothSides}
//                       onChange={handleChange}
//                       placeholder="Both Sides"
//                       className="w-full px-3 py-2 bg-theme-bg border rounded-md"
//                     />
//                     <input
//                       name="auctionRateRearDoors"
//                       type="number"
//                       value={formData.auctionRateRearDoors}
//                       onChange={handleChange}
//                       placeholder="Rear Doors"
//                       className="w-full px-3 py-2 bg-theme-bg border rounded-md"
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <h4 className="font-medium mb-3">Buy Now Rates</h4>
//                   <div className="space-y-3">
//                     <input
//                       name="buyNowRateFullWrap"
//                       type="number"
//                       value={formData.buyNowRateFullWrap}
//                       onChange={handleChange}
//                       placeholder="Full Wrap"
//                       className="w-full px-3 py-2 bg-theme-bg border rounded-md"
//                     />
//                     <input
//                       name="buyNowRateOneSide"
//                       type="number"
//                       value={formData.buyNowRateOneSide}
//                       onChange={handleChange}
//                       placeholder="One Side"
//                       className="w-full px-3 py-2 bg-theme-bg border rounded-md"
//                     />
//                     <input
//                       name="buyNowRateBothSides"
//                       type="number"
//                       value={formData.buyNowRateBothSides}
//                       onChange={handleChange}
//                       placeholder="Both Sides"
//                       className="w-full px-3 py-2 bg-theme-bg border rounded-md"
//                     />
//                     <input
//                       name="buyNowRateRearDoors"
//                       type="number"
//                       value={formData.buyNowRateRearDoors}
//                       onChange={handleChange}
//                       placeholder="Rear Doors"
//                       className="w-full px-3 py-2 bg-theme-bg border rounded-md"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-theme-bg2 p-6 rounded-xl">
//               <h3 className="text-lg font-semibold mb-4">Prohibited Ads</h3>
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//                 {["gambling", "alcohol", "smoking"].map((item) => (
//                   <label
//                     key={item}
//                     className="flex items-center gap-2 bg-theme-bg border px-4 py-2 rounded-md cursor-pointer"
//                   >
//                     <input
//                       type="checkbox"
//                       name={`prohibitedAds.${item}`}
//                       checked={formData.prohibitedAds[item] || false}
//                       onChange={handleChange}
//                       className="accent-blue-500 h-4 w-4"
//                     />
//                     <span className="capitalize text-sm">{item}</span>
//                   </label>
//                 ))}

//                 {/* Other Option */}
//                 <div className="col-span-2 sm:col-span-4">
//                   <label className="flex items-center gap-2 bg-theme-bg border px-4 py-2 rounded-md cursor-pointer">
//                     <input
//                       type="checkbox"
//                       name="prohibitedAds.other"
//                       checked={formData.prohibitedAds.other || false}
//                       onChange={handleChange}
//                       className="accent-blue-500 h-4 w-4"
//                     />
//                     <span className="text-sm">Other</span>
//                   </label>

//                   {/* Yeh input tab dikhega jab "Other" checked ho */}
//                   {formData.prohibitedAds.other && (
//                     <div className="mt-3 ml-8">
//                       <input
//                         type="text"
//                         name="prohibitedAds.otherSpecify"
//                         value={formData.prohibitedAds.otherSpecify || ""}
//                         onChange={handleChange}
//                         placeholder="Please specify..."
//                         className="w-full px-4 py-2 bg-theme-bg2 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
//                       />
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-end mt-10">
//               <button
//                 type="submit"
//                 disabled={reduxLoading}
//                 className="px-10 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
//               >
//                 {reduxLoading ? "Updating..." : "Update Auction"}
//               </button>
//             </div>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default EditFleetAuction;
