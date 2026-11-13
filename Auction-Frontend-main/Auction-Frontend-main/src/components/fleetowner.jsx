import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addfleetauctiondata,
  resetFleetOwner,
} from "../store/fleetowner/fleetownerSlice";
import {
  fetchVehicles,
  fetchVehiclesbyfleetOwner,
  getVehicleDetails,
  setSelectedVehicle,
} from "../store/vehicle/vehicleSlice";
import AddressSelector from "../components/AddressSelector";
import { toast } from "react-toastify";
import worldData from "../countries+states+cities.json";
import axios from "axios";
import _ from "lodash";
import { BiCurrentLocation } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { fetchUserCountry } from "../store/countary/countrySlice";
import { FaCalculator } from "react-icons/fa";
import RevenueCalculator from "./RevenueCalculator";
import { FooterLeaderboard, HeaderLeaderboard } from "./AdSlots";

const FleetOwnerForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.fleetOwner,
  );
  const {
    fleetvehclelist = [],
    selectedVehicle,
    error,
  } = useSelector((state) => state.vehicles || {});
  const approvedVehicles = fleetvehclelist?.filter((v) => v.isApproved) || [];
  const { user } = useSelector((state) => state.auth);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    console.error("Google Maps API key is missing!");
  }
  const { country, currency } = useSelector((state) => state.country);
  const defaultCountry = { id: "UK", name: "United Kingdom", isoCode: "UK" };
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [selectedState, setSelectedState] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsError, setSuggestionsError] = useState("");
  const [imgUrls, setImgUrls] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zipCodes, setZipCodes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [showCalculator, setShowCalculator] = useState(false);

  // NEW: Separate states for From and To route searches
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [loadingFrom, setLoadingFrom] = useState(false);
  const [loadingTo, setLoadingTo] = useState(false);
  const [autoSelected, setAutoSelected] = useState(false);
  const [directions, setDirections] = useState(null);
  const [routeFromCoords, setRouteFromCoords] = useState(null);
  const [routeToCoords, setRouteToCoords] = useState(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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
    auctionRateFullWrap: "90",
    auctionRateOneSide: "110",
    auctionRateBothSides: "100",
    auctionRateRearDoors: "120",
    buyNowRateFullWrap: "80",
    buyNowRateOneSide: "100",
    buyNowRateBothSides: "90",
    buyNowRateRearDoors: "110",
    discount3Month: "0",
    discount6Month: "5",
    discount12Month: "10",
    discount24Month: "",
    manufacturer: "",
    vehicleType: "",
    yearOfManufacture: "",
    manufactureCountry: "",
    model: "",
    registrationPlate: "",
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
  const defaultCenter = { lat: 41.3444587, lng: -99.6104541 };
  const containerStyle = {
    width: "100%",
    height: "400px",
  };

  useEffect(() => {
    setCountries(worldData);
  }, []);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchVehiclesbyfleetOwner(user._id));
    }
  }, [dispatch, user?._id]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  useEffect(() => {
    if (worldData && worldData.length > 0) {
      const countriesWithIso = worldData.map((country) => ({
        ...country,
        isoCode: country.iso2 || country.isoCode || country.code || "",
      }));
      setCountries(countriesWithIso);
    }
  }, []);

  useEffect(() => {
    if (country && !selectedCountry.id) {
      setSelectedCountry({
        id: country.code || "US",
        name: country.name || "United States",
        isoCode: country.code || "US",
      });
    }
  }, [country, selectedCountry.id]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        company: user.company || "",
        accountNumber: user.stripeAccountId || user.accountNumber || "",
        suburb: user.suburb || "",
        city: user.city || "",
        state: user.state || "",
        country: user.country || "",
        zipCodes: user.postalCode ? [user.postalCode] : prev.zipCodes,
        locations: user.location?.coordinates
          ? [
              {
                name: user.location.name || "",
                zip: user.location.zip || "",
                location: {
                  type: "Point",
                  coordinates: user.location.coordinates,
                },
              },
            ]
          : prev.locations,
      }));

      if (user.location?.coordinates) {
        setLocations([
          {
            lat: user.location.coordinates[1],
            lng: user.location.coordinates[0],
            name: user.location.name || "",
            zip: user.location.zip || "",
            location: {
              type: "Point",
              coordinates: user.location.coordinates,
            },
          },
        ]);
      }

      setSelectedCountry({
        id: user.countryCode || defaultCountry.id,
        name: user.country || defaultCountry.name,
        isoCode: user.countryCode?.toUpperCase() || defaultCountry.isoCode,
      });

      if (user.state) {
        setSelectedState({ id: user.stateId || "", name: user.state });
      }
    }
  }, [user]);
  useEffect(() => {
    if (mapRef.current && routeFromCoords && routeToCoords) {
      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: new window.google.maps.LatLng(
            routeFromCoords.lat,
            routeFromCoords.lng,
          ),
          destination: new window.google.maps.LatLng(
            routeToCoords.lat,
            routeToCoords.lng,
          ),
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);

            // Fit map to show all markers AND the route
            const bounds = new window.google.maps.LatLngBounds();

            // Add all ZIP code locations
            locations.forEach((loc) => {
              bounds.extend({ lat: loc.lat, lng: loc.lng });
            });

            // Add route start and end points
            bounds.extend(routeFromCoords);
            bounds.extend(routeToCoords);

            // Add route path points
            if (result.routes[0]?.overview_path) {
              result.routes[0].overview_path.forEach((point) => {
                bounds.extend(point);
              });
            }

            mapRef.current.fitBounds(bounds);

            // Add padding
            const padding = 50;
            mapRef.current.fitBounds(bounds, padding);
          } else {
            console.error(`Error fetching directions: ${status}`);
            toast.error(
              "Could not calculate route. Please check the locations.",
            );
            setDirections(null);
          }
        },
      );
    } else {
      setDirections(null);
    }
  }, [routeFromCoords, routeToCoords, locations, mapLoaded]);
  const fitMapToBounds = useCallback(() => {
    if (
      !mapRef.current ||
      (locations.length === 0 && !routeFromCoords && !routeToCoords)
    )
      return;

    const bounds = new window.google.maps.LatLngBounds();

    // Add ZIP code locations
    locations.forEach((loc) => {
      if (loc.lat && loc.lng) {
        bounds.extend({ lat: loc.lat, lng: loc.lng });
      }
    });

    // Add route start and end points
    if (routeFromCoords) {
      bounds.extend(routeFromCoords);
    }
    if (routeToCoords) {
      bounds.extend(routeToCoords);
    }

    // If there are any bounds, fit the map
    if (!bounds.isEmpty()) {
      const padding = 50;
      mapRef.current.fitBounds(bounds, padding);
    }
  }, [locations, routeFromCoords, routeToCoords]);

  useEffect(() => {
    if (mapLoaded && locations.length > 0) {
      fitMapToBounds();
    }
  }, [locations, mapLoaded, fitMapToBounds]);

  useEffect(() => {
    if (country && !autoSelected) {
      const matchedCountry = countries.find(
        (c) =>
          c.name?.toLowerCase() === country.toLowerCase() ||
          c.iso2?.toUpperCase() === country.toUpperCase() ||
          c.isoCode?.toUpperCase() === country.toUpperCase(),
      );

      if (matchedCountry) {
        handleCountryChange(matchedCountry.id);
        setAutoSelected(true);
      }
    }
  }, [country, countries, autoSelected]);

  useEffect(() => {
    if (user?.country && countries.length > 0 && !autoSelected) {
      const userCountry = countries.find(
        (c) =>
          c.name?.toLowerCase() === user.country.toLowerCase() ||
          c.iso2?.toUpperCase() === user.country?.toUpperCase(),
      );

      if (userCountry) {
        handleCountryChange(userCountry.id);
        setAutoSelected(true);
      }
    }
  }, [user, countries, autoSelected]);
  const geocodeAddress = async (address) => {
    if (!googleMapsApiKey) {
      return null;
    }

    if (!selectedCountry || !selectedCountry.name) {
      toast.error("Please select a country first");
      return null;
    }

    try {
      let searchAddress = address;
      if (selectedCountry && selectedCountry.name !== "Select Country") {
        searchAddress = `${address}, ${selectedCountry.name}`;
      }

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          searchAddress,
        )}&key=${googleMapsApiKey}`,
      );

      if (response.data.status === "OK" && response.data.results[0]) {
        const result = response.data.results[0];
        const { lat, lng } = result.geometry.location;

        const postalCode =
          result.address_components.find((component) =>
            component.types.includes("postal_code"),
          )?.long_name || address;

        return {
          lat,
          lng,
          formattedAddress: result.formatted_address,
          postalCode,
          addressComponents: result.address_components,
          geoJson: {
            type: "Point",
            coordinates: [lng, lat],
          },
        };
      } else {
        console.error("Geocoding failed:", response.data.status);
        toast.error(`Could not find location for: ${address}`);
        return null;
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Error processing location. Please try again.");
      return null;
    }
  };

  const handleZipCodesChange = async (e) => {
    const input = e.target.value;
    if (!selectedCountry || !selectedCountry.id) {
      toast.error("Please select a country first!");
      setErrors((prev) => ({
        ...prev,
        zipCodes: "Please select a country before adding zip codes",
      }));
      return;
    }
    try {
      const zipArray = input
        .split(",")
        .map((zip) => zip.trim())
        .filter(Boolean);

      const invalidZips = zipArray.filter((zip) => {
        return !/^[A-Za-z0-9\s\-]{3,10}$/.test(zip);
      });
      if (invalidZips.length > 0) {
        setErrors((prev) => ({
          ...prev,
          zipCodes: `Invalid postal codes: ${invalidZips.join(", ")}`,
        }));
        toast.error(`Invalid postal codes: ${invalidZips.join(", ")}`);
        return;
      }

      setErrors((prev) => ({ ...prev, zipCodes: "" }));
      const newLocations = [];
      const rejectedZips = [];

      for (const zip of zipArray) {
        const locationData = await geocodeAddress(zip);

        if (locationData) {
          const addressComponents = locationData.addressComponents || [];
          const countryComponent = addressComponents.find((component) =>
            component.types.includes("country"),
          );

          const geocodedCountryCode =
            countryComponent?.short_name?.toUpperCase();
          const selectedCountryCode = selectedCountry?.isoCode?.toUpperCase();

          if (geocodedCountryCode !== selectedCountryCode) {
            rejectedZips.push({
              zip,
              country: countryComponent?.long_name || "Unknown",
            });
            continue;
          }

          newLocations.push({
            lat: locationData.lat,
            lng: locationData.lng,
            name: locationData.formattedAddress,
            zip: locationData.postalCode,
            location: locationData.geoJson,
          });
        } else {
          rejectedZips.push({ zip, country: "Not Found" });
        }
      }

      if (rejectedZips.length > 0) {
        const rejectedMessage = rejectedZips
          .map((item) => `${item.zip} (${item.country})`)
          .join(", ");
        toast.error(
          `These postal codes don't belong to ${selectedCountry?.name}: ${rejectedMessage}`,
          { autoClose: 5000 },
        );
      }

      if (newLocations.length === 0) {
        toast.error(`No valid postal codes found for ${selectedCountry?.name}`);
        return;
      }

      const updatedLocations = [...locations, ...newLocations];
      const updatedZipCodes = [
        ...new Set([...zipCodes, ...newLocations.map((loc) => loc.zip)]),
      ].filter(Boolean);

      setLocations(updatedLocations);
      setZipCodes(updatedZipCodes);

      setFormData((prev) => ({
        ...prev,
        zipCodes: updatedZipCodes,
        locations: updatedLocations.map((loc) => ({
          name: loc.name || "",
          zip: loc.zip || "",
          location: loc.location,
        })),
      }));

      if (newLocations.length > 0) {
        toast.success(
          `Added ${newLocations.length} valid postal code(s) from ${selectedCountry?.name}`,
        );
      }
    } catch (error) {
      console.error("Error processing postal codes:", error);
      toast.error("Error processing postal codes. Please try again.");
    }
  };

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

  const handlePreSelectVehicle = (vehicleId) => {
    const vehicle = approvedVehicles.find((v) => v._id === vehicleId);
    if (!vehicle) {
      setPreSelectedVehicle(null);
      setFormData((prev) => ({
        ...prev,
        vehicleType: "",
        model: "",
        manufacturer: "",
        yearOfManufacture: "",
        manufactureCountry: "",
        registrationPlate: "",
        dailyMileage: "",
        images: [],
      }));
      setImgUrls([]);
      setImageFiles([]);
      return;
    }

    setPreSelectedVehicle(vehicle);

    setFormData((prev) => ({
      ...prev,
      vehicleType: vehicle.vehicle || "",
      model: vehicle.model || "",
      manufacturer: vehicle.manufacturer || "",
      yearOfManufacture: vehicle.yearOfManufacture || "",
      manufactureCountry: vehicle.country || "Not Available",
      registrationPlate: vehicle.registrationPlate || "",
      dailyMileage: vehicle.dailyMileage || "50",
    }));

    if (vehicle.images && vehicle.images.length > 0) {
      const secureImages = vehicle.images.map((img) => {
        let secureUrl = img;
        if (img.startsWith("http:")) secureUrl = img.replace("http:", "https:");
        if (img.startsWith("/")) secureUrl = `${window.location.origin}${img}`;
        if (img.includes("cloudinary") && !img.includes("https"))
          secureUrl = img.replace("http://", "https://");
        return secureUrl;
      });

      setImgUrls(secureImages);
      setFormData((prev) => ({ ...prev, images: secureImages }));

      const fetchImagesAsBlobs = async () => {
        try {
          const blobPromises = secureImages.map(async (url, index) => {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch: ${url}`);
            const blob = await response.blob();
            return new File([blob], `vehicle_image_${index}.jpg`, {
              type: blob.type,
            });
          });
          const files = await Promise.all(blobPromises);
          setImageFiles(files);
        } catch (err) {
          console.error("Error loading images:", err);
          toast.error("Failed to load vehicle images");
          setImageFiles([]);
        }
      };
      fetchImagesAsBlobs();
    } else {
      setImgUrls([]);
      setImageFiles([]);
    }
  };

  useEffect(() => {
    if (hasSubmitted && isSuccess) {
      dispatch(resetFleetOwner());
      resetForm();
      setHasSubmitted(false);
    }
    if (hasSubmitted && isError) {
      toast.error(message?.data || message);
      dispatch(resetFleetOwner());
      setHasSubmitted(false);
    }
  }, [isSuccess, isError, message, dispatch, hasSubmitted]);

  const resetForm = () => {
    setFormData({
      company: "",
      accountNumber: "",
      suburb: "",
      city: "",
      startTime: "",
      endTime: "",
      state: "",
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
      model: "",
      registrationPlate: "",
      yearOfManufacture: "",
      manufactureCountry: "",
      vehicleType: "",
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
    setImgUrls([]);
    setImageFiles([]);
    setErrors({});
    setZipCodes([]);
    setQuery("");
    setLocations([]);
    setPreSelectedVehicle(null);
    setFromQuery("");
    setToQuery("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.company.trim()) newErrors.company = "Company is required";
    if (!formData.accountNumber.trim())
      newErrors.accountNumber = "Account Number is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.registrationPlate)
      newErrors.registrationPlate = "Registration Plate Number is required";
    if (!preSelectedVehicle) newErrors.vehicleType = "Please select a vehicle";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";
    if (formData.availability.length === 0)
      newErrors.availability = "Select at least one availability option";
    if (imageFiles.length === 0)
      newErrors.images = "At least one image is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach((error) => toast.error(error));
      return false;
    }
    return true;
  };

  // Debounce for main location search (zip codes)
  const debounceRef = useRef(
    _.debounce(async (query, countryIsoCode) => {
      if (!query || query.length < 3) {
        setSuggestions([]);
        setSuggestionsError("");
        return;
      }

      if (!countryIsoCode) {
        setSuggestionsError("Please select a country first");
        setSuggestions([]);
        return;
      }

      try {
        setSuggestionsError("");
        setLoading(true);

        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query,
          )}&format=json&addressdetails=1&limit=10&countrycodes=${countryIsoCode.toLowerCase()}`,
        );

        if (response.data && response.data.length > 0) {
          setSuggestions(response.data);
        } else {
          setSuggestions([]);
          setSuggestionsError(
            `No locations found for "${query}" in ${selectedCountry?.name || "selected country"}`,
          );
        }
      } catch (error) {
        console.error("Search error:", error);
        setSuggestions([]);
        setSuggestionsError("Failed to fetch suggestions. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 800),
  );

  // NEW: Debounce for "From" route search
  const debounceFromRef = useRef(
    _.debounce(async (query, countryIsoCode) => {
      if (!query || query.length < 3) {
        setFromSuggestions([]);
        return;
      }

      if (!countryIsoCode) {
        toast.error("Please select a country first");
        setFromSuggestions([]);
        return;
      }

      try {
        setLoadingFrom(true);
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query,
          )}&format=json&addressdetails=1&limit=10&countrycodes=${countryIsoCode.toLowerCase()}`,
        );

        if (response.data && response.data.length > 0) {
          setFromSuggestions(response.data);
        } else {
          setFromSuggestions([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setFromSuggestions([]);
      } finally {
        setLoadingFrom(false);
      }
    }, 800),
  );

  // NEW: Debounce for "To" route search
  const debounceToRef = useRef(
    _.debounce(async (query, countryIsoCode) => {
      if (!query || query.length < 3) {
        setToSuggestions([]);
        return;
      }

      if (!countryIsoCode) {
        toast.error("Please select a country first");
        setToSuggestions([]);
        return;
      }

      try {
        setLoadingTo(true);
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query,
          )}&format=json&addressdetails=1&limit=10&countrycodes=${countryIsoCode.toLowerCase()}`,
        );

        if (response.data && response.data.length > 0) {
          setToSuggestions(response.data);
        } else {
          setToSuggestions([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setToSuggestions([]);
      } finally {
        setLoadingTo(false);
      }
    }, 800),
  );

  const handleLocationSelect = async (location) => {
    if (!selectedCountry || !selectedCountry.id) {
      toast.error("Please select a country first!");
      return;
    }
    const locationCountryCode = location.address?.country_code?.toUpperCase();
    const selectedCountryCode = selectedCountry?.isoCode?.toUpperCase();
    if (locationCountryCode && locationCountryCode !== selectedCountryCode) {
      toast.error(`Location is in another country`);
      setSuggestions([]);
      setQuery("");
      return;
    }

    const zip = location.address?.postcode || "";
    const newLocation = {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
      name: location.display_name || "",
      zip: zip || "",
      location: {
        type: "Point",
        coordinates: [parseFloat(location.lon), parseFloat(location.lat)],
      },
    };

    const updatedLocations = [...locations, newLocation];
    const updatedZipCodes = [...new Set([...zipCodes, zip])].filter(Boolean);

    setLocations(updatedLocations);
    setZipCodes(updatedZipCodes);

    setFormData((prev) => ({
      ...prev,
      zipCodes: updatedZipCodes,
      locations: updatedLocations.map((loc) => ({
        name: loc.name || "",
        zip: loc.zip || "",
        location: loc.location,
      })),
    }));

    setSuggestions([]);
    setQuery("");
    toast.success("Location added successfully!");
  };
  const geocodeRouteLocation = async (locationName) => {
    if (!googleMapsApiKey) {
      console.error("No Google Maps API key configured");
      toast.error("Google Maps API key is missing. Cannot geocode locations.");
      return null;
    }

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          locationName,
        )}&key=${googleMapsApiKey}`,
      );

      if (response.data.status === "OK" && response.data.results?.[0]) {
        const { lat, lng } = response.data.results[0].geometry.location;
        return { lat, lng };
      }

      // More detailed error messages
      let msg = "Could not geocode location";
      if (response.data.status) {
        msg += ` (${response.data.status})`;
        if (response.data.error_message) {
          msg += ` – ${response.data.error_message}`;
        }
      }

      toast.error(msg);
      return null;
    } catch (error) {
      console.error("Geocoding network/axios error:", error);
      if (error.response?.data) {
        console.error("Google error response:", error.response.data);
        toast.error(
          `Geocoding failed: ${error.response.data.error_message || error.message}`,
        );
      } else {
        toast.error("Network error while geocoding location");
      }
      return null;
    }
  };
  const onMapLoad = (map) => {
    mapRef.current = map;
    setMapLoaded(true);
  };
  const geocodeRouteLocationNominatim = async (locationName, countryCode) => {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&addressdetails=1&limit=1&countrycodes=${countryCode?.toLowerCase()}`,
      );

      if (res.data?.[0]) {
        const item = res.data[0];
        return {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        };
      }
      return null;
    } catch (err) {
      console.error("Nominatim geocoding failed:", err);
      return null;
    }
  };
  // NEW: Handle From route selection
  const handleFromSelect = async (location) => {
    const locationName = location.display_name;
    setFormData((prev) => ({
      ...prev,
      routeFrom: locationName,
    }));
    setFromQuery(locationName);
    setFromSuggestions([]);

    // Get coordinates for the "From" location
    const coords = await geocodeRouteLocationNominatim(
      locationName,
      selectedCountry?.isoCode,
    );
    if (coords) {
      setRouteFromCoords(coords);
      toast.success("Origin location selected!");
    } else {
      toast.error("Could not get coordinates for this location");
    }
  };

  const handleToSelect = async (location) => {
    const locationName = location.display_name;
    setFormData((prev) => ({
      ...prev,
      routeTo: locationName,
    }));
    setToQuery(locationName);
    setToSuggestions([]);

    // Get coordinates for the "To" location
    const coords = await geocodeRouteLocationNominatim(
      locationName,
      selectedCountry?.isoCode,
    );
    if (coords) {
      setRouteToCoords(coords);
      toast.success("Destination location selected!");
    } else {
      toast.error("Could not get coordinates for this location");
    }
  };

  const getCurrentLocation = async () => {
    if (!selectedCountry || !selectedCountry.id) {
      toast.error("Please select a country first!");
      return;
    }

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

            const locationCountryCode =
              data.address?.country_code?.toUpperCase();
            const selectedCountryCode = selectedCountry?.isoCode?.toUpperCase();

            if (locationCountryCode !== selectedCountryCode) {
              toast.error(
                `Your current location is in ${data.address?.country}, but you have selected ${selectedCountry?.name}.`,
              );
              setLoading(false);
              return;
            }

            const zip = data.address?.postcode || "";
            const newLocation = {
              lat: latitude,
              lng: longitude,
              name: data.display_name || "",
              zip: zip || "",
              location: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
            };

            const updatedLocations = [...locations, newLocation];
            const updatedZipCodes = [...new Set([...zipCodes, zip])].filter(
              Boolean,
            );

            setLocations(updatedLocations);
            setZipCodes(updatedZipCodes);
            setFormData((prev) => ({
              ...prev,
              zipCodes: updatedZipCodes,
              locations: updatedLocations.map((loc) => ({
                name: loc.name || "",
                zip: loc.zip || "",
                location: loc.location,
              })),
            }));
            setQuery("");
            toast.success("Current location added successfully!");
            setLoading(false);
          } catch (error) {
            setLoading(false);
            console.error("Error fetching current location:", error);
            toast.error("Failed to fetch current location");
          }
        },
        (error) => {
          setLoading(false);
          console.error("Geolocation error:", error);
          toast.error(
            "Unable to access your location. Please check permissions.",
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000,
        },
      );
    } else {
      setLoading(false);
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!selectedCountry || !selectedCountry.isoCode) {
      toast.error("Please select a country first!");
      setSuggestions([]);
      return;
    }

    debounceRef.current(value, selectedCountry.isoCode);
  };

  // NEW: Handle From input change
  const handleFromInputChange = (e) => {
    const value = e.target.value;
    setFromQuery(value);

    if (!selectedCountry || !selectedCountry.isoCode) {
      toast.error("Please select a country first!");
      setFromSuggestions([]);
      return;
    }

    debounceFromRef.current(value, selectedCountry.isoCode);
  };

  // NEW: Handle To input change
  const handleToInputChange = (e) => {
    const value = e.target.value;
    setToQuery(value);

    if (!selectedCountry || !selectedCountry.isoCode) {
      toast.error("Please select a country first!");
      setToSuggestions([]);
      return;
    }

    debounceToRef.current(value, selectedCountry.isoCode);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("prohibitedAds")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        prohibitedAds: {
          ...prev.prohibitedAds,
          [field]: type === "checkbox" ? checked : String(value),
        },
      }));
    } else if (type === "checkbox" && name === "availability") {
      setFormData((prev) => {
        const updatedAvailability = checked
          ? [...prev.availability, value]
          : prev.availability.filter((item) => item !== value);
        return { ...prev, availability: updatedAvailability };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: String(value) }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const clearError = (field) => {
    if (errors?.[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCountryChange = (countryId) => {
    const countryIdNum = parseInt(countryId);
    const country = countries.find((c) => c.id === countryIdNum);
    if (!country) return;

    const countryData = {
      id: country.id,
      name: country.name,
      isoCode: country.iso2 || country.isoCode || country.code || "",
    };
    setSelectedCountry(countryData);
    setSelectedState(null);
    setStates(country?.states || []);
    setCities([]);
    setZipCodes([]);
    setLocations([]);
    setQuery("");
    setFromQuery("");
    setToQuery("");
    setFormData({
      ...formData,
      country: country.name,
      state: "",
      city: "",
      zipCodes: [],
      locations: [],
      routeFrom: "",
      routeTo: "",
    });
    clearError("country");
    clearError("zipCodes");
  };

  const handleStateChange = (stateId) => {
    const stateIdNum = parseInt(stateId);
    const state = states.find((s) => s.id === stateIdNum);
    if (!state) return;
    setSelectedState(state);
    setCities(state.cities || []);
    setFormData((prev) => ({
      ...prev,
      state: state.name,
      city: "",
      zipCodes: [],
      locations: [],
    }));
    setZipCodes([]);
    setLocations([]);
    setQuery("");
    clearError("state");
  };

  const handleCityChange = (cityName) => {
    setFormData((prev) => ({
      ...prev,
      city: cityName,
    }));
    clearError("city");
  };

  const removeLocation = (index) => {
    const newZipCodes = [...zipCodes];
    const newLocations = [...locations];
    newZipCodes.splice(index, 1);
    newLocations.splice(index, 1);
    setZipCodes(newZipCodes);
    setLocations(newLocations);
    setFormData((prev) => ({
      ...prev,
      zipCodes: newZipCodes,
      locations: newLocations.map((loc) => ({
        name: loc.name || "",
        zip: loc.zip || "",
        location: loc.location,
      })),
    }));
  };
  const markers = useCallback(() => {
    const allMarkers = [];

    // ZIP code markers
    locations.forEach((loc, index) => {
      allMarkers.push({
        position: { lat: loc.lat, lng: loc.lng },
        label: (index + 1).toString(),
        type: "zip",
      });
    });

    // Route "From" marker
    if (routeFromCoords) {
      allMarkers.push({
        position: routeFromCoords,
        label: "A",
        type: "routeFrom",
      });
    }

    // Route "To" marker
    if (routeToCoords) {
      allMarkers.push({
        position: routeToCoords,
        label: "B",
        type: "routeTo",
      });
    }

    return allMarkers;
  }, [locations, routeFromCoords, routeToCoords]);

  // Then change handleFromSelect / handleToSelect to:

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);
    if (!validateForm()) {
      setHasSubmitted(false);
      return;
    }

    if (locations.length === 0) {
      toast.error("Please add at least one location");
      setHasSubmitted(false);
      return;
    }
    if (!user || !user._id) {
      toast.error("User not authenticated.");
      setHasSubmitted(false);
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      toast.error("Please select both start and end times");
      setHasSubmitted(false);
      return;
    }

   const startDate = new Date(formData.startTime);
const endDate = new Date(formData.endTime);
const now = new Date();

if (startDate < now) {
  toast.error("Auction start time cannot be in the past");
  setHasSubmitted(false);
  return;
}

if (startDate >= endDate) {
  toast.error("End time must be after start time");
  setHasSubmitted(false);
  return;
}

    const formDataToSend = new FormData();
    formDataToSend.append("vehicleType", formData.vehicleType);
    formDataToSend.append("fleetOwner", user._id);
    formDataToSend.append(
      "yearofmanufacturer",
      String(formData.yearOfManufacture),
    );
    formDataToSend.append("dailyMileage", formData.dailyMileage || "50");
    const sanitizedLocations = locations.map((loc) => ({
      name: loc.name || "",
      zip: loc.zip || "",
      location: {
        type: "Point",
        coordinates: [loc.lng || 0, loc.lat || 0],
      },
    }));
    formDataToSend.append("locations", JSON.stringify(sanitizedLocations));
    formDataToSend.append("zipCodes", JSON.stringify(zipCodes));

    if (locations[0]) {
      formDataToSend.append("latitude", String(locations[0].lat || ""));
      formDataToSend.append("longitude", String(locations[0].lng || ""));
      formDataToSend.append("locationName", locations[0].name || "");
      formDataToSend.append("zipCode", locations[0].zip || "");
    }

    if (formData.routeFrom && formData.routeTo) {
      formDataToSend.append(
        "interRoutes",
        JSON.stringify([{ from: formData.routeFrom, to: formData.routeTo }]),
      );
    } else {
      formDataToSend.append("interRoutes", JSON.stringify([]));
    }

    imageFiles.forEach((file) => {
      formDataToSend.append("images", file);
    });

    Object.entries(formData).forEach(([key, value]) => {
      if (
        !["images", "locations", "zipCodes", "routeFrom", "routeTo"].includes(
          key,
        )
      ) {
        if (key === "prohibitedAds" || key === "availability") {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, String(value));
        }
      }
    });

    formDataToSend.append("user", user._id);

    try {
      await dispatch(addfleetauctiondata(formDataToSend)).unwrap();
      toast.success("Form submitted successfully!");
      navigate("/user-profile/manage-fleetauction");
      resetForm();
    } catch (error) {
      const errMsg = typeof error === "string" ? error : error?.message || error?.error || "";
      const errCode = typeof error === "object" ? error?.errorCode : "";

      if (
        errMsg.toLowerCase().includes("already exists") ||
        errMsg.toLowerCase().includes("duplicate") ||
        errCode === "DUPLICATE_REGISTRATION_PLATE"
      ) {
        toast.error(
          errMsg || "This registration plate is already in use.",
        );

        setErrors((prev) => ({
          ...prev,
          registrationPlate: "This registration plate is already registered",
        }));
      } else {
        toast.error(errMsg || "Failed to submit form");
      }
      setHasSubmitted(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <p className="text-red-500">Please login to access this form.</p>
      </div>
    );
  }

  return (
    <div className="p-6 flex-1 bg-theme-bg rounded-lg shadow-md text-white">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* LEFT: TITLE */}
        <h2 className="text-2xl font-bold text-white-800 flex-1">
          Fleet Owner Form
        </h2>

        {/* CENTER: AD */}
        <div className="flex justify-center flex-1">
          <div className="w-[728px] max-w-full">
            <HeaderLeaderboard />
          </div>
        </div>

        {/* RIGHT: BUTTON */}
        <div className="flex justify-end flex-1">
          <button
            onClick={() => setShowCalculator(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            <FaCalculator className="w-5 h-5" />
            Revenue Calculator
          </button>
        </div>
      </div>

      <RevenueCalculator
        showCalculator={showCalculator}
        setShowCalculator={setShowCalculator}
        userType="fleetOwner"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 mb-6 lg:mb-0">
            <div className="bg-theme-bg2 p-4 rounded-lg h-full">
              <h3 className="text-lg font-semibold mb-4 text-white-700">
                Vehicle Images
              </h3>

              {imgUrls.length > 0 ? (
                <div className="space-y-4">
                  <div className="relative w-full h-80 rounded-lg border-2 border-white/20 bg-gray-900/50 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <img
                        src={imgUrls[currentImageIndex]}
                        alt={`vehicle ${currentImageIndex + 1}`}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/400x300?text=Image+Not+Found";
                        }}
                      />
                    </div>

                    {imgUrls.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevImage}
                          className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white w-10 h-10 flex items-center justify-center rounded-full transition-all z-10 shadow-lg"
                          aria-label="Previous image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={handleNextImage}
                          className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white w-10 h-10 flex items-center justify-center rounded-full transition-all z-10 shadow-lg"
                          aria-label="Next image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </>
                    )}

                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                      {currentImageIndex + 1} / {imgUrls.length}
                    </div>
                  </div>

                  {imgUrls.length > 1 && (
                    <div className="grid grid-cols-5 gap-2 pb-2 overflow-hidden">
                      {imgUrls.map((url, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentImageIndex(index);
                          }}
                          className={`w-full aspect-square rounded-lg border-2 overflow-hidden transition-all duration-200 ${
                            currentImageIndex === index
                              ? "border-blue-500 ring-2 ring-blue-500/50"
                              : "border-white/20 hover:border-white/40"
                          }`}
                        >
                          <img
                            src={url}
                            alt={`thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/80?text=Img";
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-80 bg-theme-bg rounded-xl border-2 border-dashed border-border-info-color flex items-center justify-center">
                  <div className="text-center flex flex-col items-center gap-3 text-white p-6">
                    <svg
                      className="w-16 h-16 text-gray-500"
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
                    <div>
                      <p className="font-semibold mb-1">No Vehicle Selected</p>
                      <p className="text-sm text-gray-400">
                        Select a vehicle above to load images automatically
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-theme-bg2 p-4 rounded-lg mt-6">
                <h3 className="text-lg font-semibold mb-4 text-white-700">
                  Route Map - ZIP Codes & Intercity Route
                </h3>
                {googleMapsApiKey ? (
                  <LoadScript
                    googleMapsApiKey={googleMapsApiKey}
                    libraries={["directions"]}
                  >
                    <GoogleMap
                      mapContainerStyle={containerStyle}
                      center={defaultCenter}
                      zoom={5}
                      onLoad={onMapLoad}
                      options={{
                        zoomControl: true,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                      }}
                    >
                      {/* Render all markers */}
                      {markers().map((marker, index) => (
                        <Marker
                          key={index}
                          position={marker.position}
                          label={{
                            text: marker.label,
                            color:
                              marker.type === "zip"
                                ? "white"
                                : marker.type === "routeFrom"
                                  ? "green"
                                  : "red",
                            fontSize: marker.type === "zip" ? "12px" : "16px",
                            fontWeight: "bold",
                          }}
                          icon={
                            marker.type === "routeFrom" ||
                            marker.type === "routeTo"
                              ? {
                                  path: window.google.maps.SymbolPath.CIRCLE,
                                  scale: 8,
                                  fillColor:
                                    marker.type === "routeFrom"
                                      ? "#34D399"
                                      : "#EF4444",
                                  fillOpacity: 1,
                                  strokeColor: "white",
                                  strokeWeight: 2,
                                }
                              : null
                          }
                        />
                      ))}

                      {/* Render route between From and To locations */}
                      {directions && (
                        <DirectionsRenderer
                          directions={directions}
                          options={{
                            suppressMarkers: true, // We're using our own markers
                            polylineOptions: {
                              strokeColor: "#3B82F6",
                              strokeOpacity: 0.8,
                              strokeWeight: 4,
                            },
                            preserveViewport: false,
                          }}
                        />
                      )}
                    </GoogleMap>
                  </LoadScript>
                ) : (
                  <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-600">Google Maps not available</p>
                  </div>
                )}

                {/* Legend */}
                {/* <div className="mt-4 flex flex-wrap gap-4 text-sm">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      <span className="text-gray-300">A = Route Start (From)</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
      <span className="text-gray-300">B = Route End (To)</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 bg-blue-500 border border-white"></div>
      <span className="text-gray-300">Numbers = ZIP Code Locations</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-6 h-1 bg-blue-500"></div>
      <span className="text-gray-300">Blue Line = Intercity Route</span>
    </div>
  </div> */}

                {/* Route Info */}
                {directions && (
                  <div className="mt-4 p-3 bg-theme-bg rounded-md border border-gray-600">
                    <h4 className="font-semibold text-white mb-2">
                      Intercity Route Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-300">
                      <div>
                        <span className="font-medium">From:</span>{" "}
                        {formData.routeFrom}
                      </div>
                      <div>
                        <span className="font-medium">To:</span>{" "}
                        {formData.routeTo}
                      </div>
                      <div>
                        <span className="font-medium">Distance:</span>{" "}
                        {directions.routes[0].legs[0].distance.text}
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium">Duration:</span>{" "}
                        {directions.routes[0].legs[0].duration.text}
                      </div>
                      <div>
                        <span className="font-medium">ZIP Locations:</span>{" "}
                        {locations.length}
                      </div>
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

              {approvedVehicles.length === 0 ? (
                <div className="space-y-3">
                  <select
                    className="w-full px-3 py-2 bg-theme-bg border border-gray-400 rounded-md text-gray-400 cursor-not-allowed"
                    disabled
                  >
                    <option>-- No approved vehicles available --</option>
                  </select>
                  <p className="text-sm text-yellow-400 text-center">
                    No approved vehicles yet.{" "}
                    <span className="block text-xs mt-1 text-gray-300">
                      Only vehicles approved by the admin will appear here.
                    </span>{" "}
                    <button
                      onClick={() =>
                        navigate("/user-profile/add-vehicle-dimensions")
                      }
                      className="underline hover:text-yellow-300 font-medium"
                    >
                      Add a vehicle
                    </button>{" "}
                    to create an auction.
                  </p>
                </div>
              ) : (
                <>
                  <select
                    value={preSelectedVehicle?._id || ""}
                    onChange={(e) => handlePreSelectVehicle(e.target.value)}
                    className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
                      errors.vehicleType ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  >
                    <option value="">
                      -- Choose one of your approved vehicles --
                    </option>
                    {approvedVehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.vehicle} - {v.manufacturer} {v.model} (
                        {v.yearOfManufacture})
                        {v.registrationPlate &&
                          ` | Plate: ${v.registrationPlate}`}
                      </option>
                    ))}
                  </select>
                  {errors.vehicleType && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.vehicleType}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="bg-theme-bg2 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-white-700">
                Basic Information
              </h3>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white-700 mb-1">
                    Company Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    name="company"
                    className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
                      errors.company ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.company}
                    onChange={handleChange}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white-700 mb-1">
                    Account Number<span className="text-red-500">*</span>
                  </label>
                  <input
                    name="accountNumber"
                    className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
                      errors.accountNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    value={formData.accountNumber}
                    onChange={handleChange}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white-700 mb-1">
                    Suburb
                  </label>
                  <input
                    name="suburb"
                    className="w-full px-3 py-2 bg-theme-bg border border-gray-300 rounded-md"
                    value={formData.suburb}
                    onChange={handleChange}
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
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCountry?.id || ""}
                    required
                    onChange={(e) => {
                      handleCountryChange(e.target.value);
                      setAutoSelected(true);
                    }}
                    className={`w-full pl-5 py-3 rounded text-white bg-theme-bg outline-none border ${
                      errors?.country
                        ? "border-red-500"
                        : "border-border-info-color"
                    }`}
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
                    State / County <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedState?.id || ""}
                    onChange={(e) => handleStateChange(e.target.value)}
                    disabled={!selectedCountry}
                    className={`w-full pl-5 py-3 rounded text-white bg-theme-bg outline-none border ${
                      errors?.state
                        ? "border-red-500"
                        : "border-border-info-color"
                    } ${!selectedCountry ? "opacity-50 cursor-not-allowed" : ""}`}
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
                    onChange={(e) => handleCityChange(e.target.value)}
                    disabled={!selectedState || cities.length === 0}
                    className={`w-full pl-5 py-3 rounded text-white bg-theme-bg outline-none border ${
                      errors?.city
                        ? "border-red-500"
                        : "border-border-info-color"
                    } ${!selectedState ? "opacity-50 cursor-not-allowed" : ""}`}
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

              <div className="relative md:col-span-3 mt-6">
                <label className="block text-sm font-medium text-white-700 mb-1">
                  Campaign Post / Zip Codes (separated by commas)
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={zipCodes.join(", ")}
                  placeholder="Selected zip codes will appear here..."
                  className="w-full px-3 py-2 bg-theme-bg border rounded-md mt-2"
                />
              </div>

              <div className="relative md:col-span-3 mt-2 mb-4">
                <label className="block text-sm font-medium text-white-700 mb-1">
                  Search Zip Codes to Add
                </label>
                <div className="relative w-full mt-2">
                  <input
                    type="text"
                    value={query}
                    disabled={!selectedCountry || !selectedCountry.id}
                    onChange={handleInputChange}
                    placeholder={
                      selectedCountry && selectedCountry.id
                        ? "Search for a location to add to route"
                        : "Select a country first..."
                    }
                    className="search-input w-full bg-theme-bg border rounded-md px-4 py-2"
                  />
                  <BiCurrentLocation
                    size={24}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600 hover:text-white bg-theme-bg2"
                    onClick={getCurrentLocation}
                  />
                  {loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  )}
                  {suggestions.length > 0 && (
                    <ul className="absolute top-full left-0 w-full z-50 rounded-md border border-gray-300 bg-theme-bg2 text-sm shadow-lg max-h-48 overflow-y-auto mt-1">
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          onClick={() => handleLocationSelect(suggestion)}
                          className="cursor-pointer p-2 hover:bg-theme-bg hover:text-white"
                        >
                          {suggestion.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {locations.length > 0 && (
                <div className="md:col-span-3 mb-4">
                  <ul className="space-y-2">
                    {locations.map((loc, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between p-2 rounded-md bg-theme-bg"
                      >
                        <span>
                          {loc.name} (Zip: {loc.zip || "N/A"})
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLocation(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* UPDATED INTERSTATE/INTERCITY ROUTES SECTION */}
              <div className="md:col-span-3 text-white mt-6">
                <label className="block font-medium mb-2">
                  Interstate/Intercity Routes
                </label>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-2">
                  {/* From Field */}
                  <div className="relative">
                    <label className="block text-xs text-gray-400 mb-1">
                      Insert One CBD Post Code of Origin City
                    </label>
                    <div className="relative">
                      <input
                        value={fromQuery}
                        onChange={handleFromInputChange}
                        disabled={!selectedCountry || !selectedCountry.id}
                        placeholder={
                          selectedCountry && selectedCountry.id
                            ? "Search for origin location"
                            : "Select a country first..."
                        }
                        className="w-full px-3 py-2 bg-theme-bg border border-gray-600 rounded-md text-white pr-10"
                      />
                      <BiCurrentLocation
                        size={20}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white"
                        onClick={getCurrentLocation}
                      />
                      {loadingFrom && (
                        <div className="absolute right-10 top-1/2 transform -translate-y-1/2 w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                      )}
                    </div>

                    {fromSuggestions.length > 0 && (
                      <ul className="absolute top-full left-0 w-full z-50 rounded-md border border-gray-600 bg-theme-bg2 text-sm shadow-lg max-h-48 overflow-y-auto mt-1">
                        {fromSuggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            onClick={() => handleFromSelect(suggestion)}
                            className="cursor-pointer p-2 hover:bg-theme-bg hover:text-white text-gray-300"
                          >
                            {suggestion.display_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* To Field */}
                  <div className="relative">
                    <label className="block text-xs text-gray-400 mb-1">
                      Insert One CBD Post Code of Destination City
                    </label>
                    <div className="relative">
                      <input
                        value={toQuery}
                        onChange={handleToInputChange}
                        disabled={!selectedCountry || !selectedCountry.id}
                        placeholder={
                          selectedCountry && selectedCountry.id
                            ? "Search for destination location"
                            : "Select a country first..."
                        }
                        className="w-full px-3 py-2 bg-theme-bg border border-gray-600 rounded-md text-white pr-10"
                      />
                      <BiCurrentLocation
                        size={20}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white"
                        onClick={getCurrentLocation}
                      />
                      {loadingTo && (
                        <div className="absolute right-10 top-1/2 transform -translate-y-1/2 w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                      )}
                    </div>

                    {toSuggestions.length > 0 && (
                      <ul className="absolute top-full left-0 w-full z-50 rounded-md border border-gray-600 bg-theme-bg2 text-sm shadow-lg max-h-48 overflow-y-auto mt-1">
                        {toSuggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            onClick={() => handleToSelect(suggestion)}
                            className="cursor-pointer p-2 hover:bg-theme-bg hover:text-white text-gray-300"
                          >
                            {suggestion.display_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Display selected routes */}
                {formData.routeFrom && formData.routeTo && (
                  <div className="mt-4 p-3 bg-theme-bg rounded-md border border-gray-600">
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-white">Route:</span>{" "}
                      {formData.routeFrom}
                      <span className="mx-2">→</span>
                      {formData.routeTo}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-theme-bg2 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-white-700">
                Auction Time
              </h3>
              <div className="grid lg:grid-cols-2 gap-4">
                <div>
                  <label>
                    Auction Start Time<span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="datetime-local"
                    className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
                      errors.startTime ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label>
                    Auction End Time<span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="datetime-local"
                    className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
                      errors.endTime ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="bg-theme-bg2 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-white-700">
                Vehicle Details (Auto-filled from selection)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-white-600 mb-1">
                    Vehicle Type
                  </label>
                  <input
                    value={formData.vehicleType}
                    readOnly
                    className="w-full px-3 py-2 bg-theme-bg border rounded-md text-gray-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white-600 mb-1">
                    Model
                  </label>
                  <input
                    value={formData.model}
                    readOnly
                    className="w-full px-3 py-2 bg-theme-bg border rounded-md text-gray-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-white-600 mb-1">
                    Manufacturer
                  </label>
                  <input
                    value={formData.manufacturer}
                    readOnly
                    className="w-full px-3 py-2 bg-theme-bg border rounded-md text-gray-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white-600 mb-1">
                    Year
                  </label>
                  <input
                    value={formData.yearOfManufacture}
                    readOnly
                    className="w-full px-3 py-2 bg-theme-bg border rounded-md text-gray-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white-600 mb-1">
                    Daily Mileage
                  </label>
                  <div className="relative">
                    <input
                      name="dailyMileage"
                      className="w-full px-3 py-2 bg-theme-bg border rounded-md text-sm text-gray-300 pr-10"
                      value={formData.dailyMileage || ""}
                      onChange={handleChange}
                      type="number"
                      min="1"
                      readOnly
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 text-xs">
                      km/day
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white-600 mb-1">
                    Registration Plate Number
                  </label>
                  <input
                    name="registrationPlate"
                    className={`text-gray-300 w-full px-3 py-2 bg-theme-bg border rounded-md text-sm ${
                      errors.registrationPlate
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    value={formData.registrationPlate}
                    readOnly
                    onChange={handleChange}
                  />
                  {errors.registrationPlate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.registrationPlate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-theme-bg2 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-white-700">
                Vehicle Availability <span className="text-red-500">*</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["3 Months", "6 Months", "12 Months", "24 Months"].map(
                  (val) => (
                    <label
                      key={val}
                      className={`flex items-center justify-center cursor-pointer border rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200
                    ${
                      formData.availability.includes(val)
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-theme-bg text-white border-gray-600 hover:bg-theme-bg2"
                    }`}
                    >
                      <input
                        type="radio"
                        name="availability"
                        value={val}
                        checked={formData.availability.includes(val)}
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
          </div>
        </div>

        <div className="mt-8 bg-theme-bg2 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-white-700">
            Pricing Information
          </h3>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="bg-theme-bg2 p-4 rounded-md border border-gray-200">
              <h4 className="font-medium text-white-700 mb-3">
                Auction Rates (per sqm)
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-white-600 mb-1">
                    Full Wrap
                  </label>
                  <input
                    name="auctionRateFullWrap"
                    type="number"
                    min="0"
                    required
                    className="w-full px-3 py-2 border bg-theme-bg border-gray-300 rounded-md"
                    value={formData.auctionRateFullWrap}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white-600 mb-1">
                    One Side
                  </label>
                  <input
                    name="auctionRateOneSide"
                    type="number"
                    min="0"
                    required
                    className="w-full px-3 py-2 border bg-theme-bg border-gray-300 rounded-md"
                    value={formData.auctionRateOneSide}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white-600 mb-1">
                    Both Sides
                  </label>
                  <input
                    name="auctionRateBothSides"
                    type="number"
                    min="0"
                    required
                    className="w-full px-3 py-2 border bg-theme-bg border-gray-300 rounded-md"
                    value={formData.auctionRateBothSides}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white-600 mb-1">
                    Rear Doors
                  </label>
                  <input
                    name="auctionRateRearDoors"
                    type="number"
                    min="0"
                    required
                    className="w-full px-3 py-2 border bg-theme-bg border-gray-300 rounded-md"
                    value={formData.auctionRateRearDoors}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="bg-theme-bg2 p-4 rounded-md border border-gray-200">
              <h4 className="font-medium text-white-700 mb-3">
                Buy Now Rates (per sqm)
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-white-600 mb-1">
                    Full Wrap
                  </label>
                  <input
                    name="buyNowRateFullWrap"
                    type="number"
                    min="0"
                    required
                    className="w-full px-3 py-2 border bg-theme-bg border-gray-300 rounded-md"
                    value={formData.buyNowRateFullWrap}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white-600 mb-1">
                    One Side
                  </label>
                  <input
                    name="buyNowRateOneSide"
                    type="number"
                    min="0"
                    required
                    className="w-full px-3 py-2 border bg-theme-bg border-gray-300 rounded-md"
                    value={formData.buyNowRateOneSide}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white-600 mb-1">
                    Both Sides
                  </label>
                  <input
                    name="buyNowRateBothSides"
                    type="number"
                    min="0"
                    required
                    className="w-full px-3 py-2 border bg-theme-bg border-gray-300 rounded-md"
                    value={formData.buyNowRateBothSides}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white-600 mb-1">
                    Rear Doors
                  </label>
                  <input
                    name="buyNowRateRearDoors"
                    type="number"
                    min="0"
                    required
                    className="w-full px-3 py-2 border bg-theme-bg border-gray-300 rounded-md"
                    value={formData.buyNowRateRearDoors}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-theme-bg2 p-4 rounded-md border border-gray-200">
            <h4 className="font-medium text-white-700 mb-3">
              Discounts for Longer Campaigns (%)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-white-600 mb-1">
                  3 Month
                </label>
                <input
                  name="discount3Month"
                  type="number"
                  className="w-full px-3 py-2 bg-theme-bg border border-gray-300 rounded-md"
                  value={formData.discount3Month}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm text-white-600 mb-1">
                  6 Month
                </label>
                <input
                  name="discount6Month"
                  type="number"
                  className="w-full px-3 py-2 bg-theme-bg border border-gray-300 rounded-md"
                  value={formData.discount6Month}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm text-white-600 mb-1">
                  12 Month
                </label>
                <input
                  name="discount12Month"
                  type="number"
                  className="w-full px-3 py-2 bg-theme-bg border border-gray-300 rounded-md"
                  value={formData.discount12Month}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm text-white-600 mb-1">
                  24 Month
                </label>
                <input
                  name="discount24Month"
                  type="number"
                  className="w-full px-3 py-2 bg-theme-bg border border-gray-300 rounded-md"
                  value={formData.discount24Month}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-theme-bg2 p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Prohibited Ads <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: "gambling", label: "Gambling" },
              { name: "alcohol", label: "Alcohol" },
              { name: "smoking", label: "Smoking" },
            ].map((item) => (
              <label
                key={item.name}
                className="flex items-center gap-2 bg-theme-bg border border-white/20 px-4 py-2 rounded-md text-white hover:bg-theme-bg2 transition"
              >
                <input
                  type="checkbox"
                  name={`prohibitedAds.${item.name}`}
                  checked={formData.prohibitedAds[item.name]}
                  onChange={handleChange}
                  className="h-4 w-4 accent-blue-500"
                />
                <span className="text-sm">{item.label}</span>
              </label>
            ))}
            <div className="col-span-2 sm:col-span-1 lg:col-span-2">
              <label className="flex items-start gap-2 bg-theme-bg border border-white/20 px-4 py-2 rounded-md text-white hover:bg-theme-bg2 transition">
                <input
                  type="checkbox"
                  name="prohibitedAds.other"
                  checked={formData.prohibitedAds.other}
                  onChange={handleChange}
                  className="h-4 w-4 mt-1 accent-blue-500"
                />
                <div className="flex-1">
                  <span className="text-sm">Other</span>
                  {formData.prohibitedAds.other && (
                    <div className="mt-2">
                      <input
                        type="text"
                        name="prohibitedAds.otherSpecify"
                        placeholder="Please specify"
                        className={`w-full px-3 py-2 rounded-md text-sm text-white bg-theme-bg2 border ${
                          errors.prohibitedAdsOther
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        value={formData.prohibitedAds.otherSpecify}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </>
            ) : (
              "Submit Form"
            )}
          </button>
        </div>
        <FooterLeaderboard />
      </form>
    </div>
  );
};

export default FleetOwnerForm;

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   addfleetauctiondata,
//   resetFleetOwner,
// } from "../store/fleetowner/fleetownerSlice";
// import {
//   fetchVehicles,
//   getVehicleDetails,
//   setSelectedVehicle,
// } from "../store/vehicle/vehicleSlice";
// import { toast } from "react-toastify";
// import axios from "axios";
// import {
//   CitySelect,
//   CountrySelect,
//   StateSelect,
// } from "react-country-state-city";
// import _ from "lodash";
// import { BiCurrentLocation } from "react-icons/bi";
// import { useNavigate } from "react-router-dom";
// import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
// import { fetchUserCountry } from "../store/countary/countrySlice";
// const FleetOwnerForm = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { isLoading, isSuccess, isError, message } = useSelector(
//     (state) => state.fleetOwner
//   );
//   const {
//     list: vehicles,
//     selectedVehicle,
//     error,
//   } = useSelector((state) => state.vehicles || {});
//   const { user } = useSelector((state) => state.auth);

//   const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
//   if (!googleMapsApiKey) {
//     console.error("Google Maps API key is missing!");
//   }

//   const defaultCountry = { id: "IN", name: "India", isoCode: "IN" };
//   const [selectedCountry, setSelectedCountry] = useState(defaultCountry);

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
//    const { country, currency } = useSelector((state) => state.country);
//   const mapRef = useRef(null);

//   const [mapLoaded, setMapLoaded] = useState(false);

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
//     yearOfManufacture: "",
//     model: "",
//     availability: [],
//     prohibitedAds: {
//       gambling: false,
//       alcohol: false,
//       smoking: false,
//       other: false,
//       otherSpecify: "",
//     },
//     images: [], // Store image URLs for form state consistency
//     locations: [],
//   });

//   const [errors, setErrors] = useState({});

//   const defaultCenter = { lat: 20.5937, lng: 78.9629 };
//   const containerStyle = {
//     width: "100%",
//     height: "400px",
//   };

//   useEffect(() => {
//     dispatch(fetchVehicles()).then((result) => {

//     });
//   }, [dispatch]);

//   useEffect(() => {
//      if (!country) {
//        dispatch(fetchUserCountry());
//      }
//    }, [dispatch, country]);

//    useEffect(() => {
//   if (country && !selectedCountry.id) {
//     setSelectedCountry({
//       id: country.code || "US", // Default to US if no country detected
//       name: country.name || "United States",
//       isoCode: country.code || "US",
//     });
//   }
// }, [country, selectedCountry.id]);

//   useEffect(() => {
//     if (user) {
//       setFormData((prev) => ({
//         ...prev,
//         company: user.company || "",
//         accountNumber: user.stripeAccountId || user.accountNumber || "",
//         suburb: user.suburb || "",
//         city: user.city || "",
//         state: user.state || "",
//         country: user.country || "",
//         zipCodes: user.postalCode ? [user.postalCode] : prev.zipCodes,
//         locations: user.location?.coordinates
//           ? [
//               {
//                 name: user.location.name || "",
//                 zip: user.location.zip || "",
//                 location: {
//                   type: "Point",
//                   coordinates: user.location.coordinates,
//                 },
//               },
//             ]
//           : prev.locations,
//       }));

//       if (user.location?.coordinates) {
//         setLocations([
//           {
//             lat: user.location.coordinates[1],
//             lng: user.location.coordinates[0],
//             name: user.location.name || "",
//             zip: user.location.zip || "",
//             location: {
//               type: "Point",
//               coordinates: user.location.coordinates,
//             },
//           },
//         ]);
//       }

//       setSelectedCountry({
//         id: user.countryCode || defaultCountry.id,
//         name: user.country || defaultCountry.name,
//         isoCode: user.countryCode?.toUpperCase() || defaultCountry.isoCode,
//       });

//       if (user.state) {
//         setSelectedState({ id: user.stateId || "", name: user.state });
//       }
//     }
//   }, [user]);

//   const fitMapToBounds = useCallback(() => {
//     if (!mapRef.current || locations.length === 0) return;

//     const bounds = new window.google.maps.LatLngBounds();
//     locations.forEach((loc) => {
//       bounds.extend({ lat: loc.lat, lng: loc.lng });
//     });

//     mapRef.current.fitBounds(bounds);
//     const listener = window.google.maps.event.addListener(
//       mapRef.current,
//       "bounds_changed",
//       () => {
//         if (mapRef.current.getZoom() > 15) {
//           mapRef.current.setZoom(15);
//         }
//         window.google.maps.event.removeListener(listener);
//       }
//     );
//   }, [locations]);

//   useEffect(() => {
//     if (mapLoaded && locations.length > 0) {
//       fitMapToBounds();
//     }
//   }, [locations, mapLoaded, fitMapToBounds]);
// const geocodeAddress = async (address) => {
//   if (!googleMapsApiKey) {
//     console.error("Google Maps API key missing");
//     toast.error("Google Maps API key is not configured");
//     return null;
//   }

//   try {

//     // For postal codes, add more context if country is selected
//     let searchAddress = address;
//     if (selectedCountry && selectedCountry.name !== "Select Country") {
//       searchAddress = `${address}, ${selectedCountry.name}`;
//     }

//     const response = await axios.get(
//       `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//         searchAddress
//       )}&key=${googleMapsApiKey}`
//     );

//     if (response.data.status === "OK" && response.data.results[0]) {
//       const result = response.data.results[0];
//       const { lat, lng } = result.geometry.location;
//       const postalCode =
//         result.address_components.find((component) =>
//           component.types.includes("postal_code")
//         )?.long_name || address; // Use original address if no postal code found

//       return {
//         lat,
//         lng,
//         formattedAddress: result.formatted_address,
//         postalCode,
//         geoJson: {
//           type: "Point",
//           coordinates: [lng, lat],
//         },
//       };
//     } else {
//       console.error("Geocoding failed:", response.data.status);
//       toast.error(`Could not find location for: ${address}`);
//       return null;
//     }
//   } catch (error) {
//     console.error("Geocoding error:", error);
//     toast.error("Error processing location. Please try again.");
//     return null;
//   }
// };

//  const handleZipCodesChange = async (e) => {
//   const input = e.target.value;

//   try {
//     const zipArray = input
//       .split(",")
//       .map((zip) => zip.trim())
//       .filter(Boolean);
//     setZipCodes(zipArray);

//     // Updated validation for global postal codes
//     const invalidZips = zipArray.filter((zip) => {
//       // More flexible validation for international postal codes
//       // Allow alphanumeric codes (UK: SW1A 1AA, Canada: K1A 0A6, etc.)
//       return !/^[A-Za-z0-9\s\-]{3,10}$/.test(zip);
//     });

//     if (invalidZips.length > 0) {
//       setErrors((prev) => ({
//         ...prev,
//         zipCodes: `Invalid postal codes: ${invalidZips.join(", ")}`,
//       }));
//       toast.error(`Invalid postal codes: ${invalidZips.join(", ")}`);
//       return;
//     }

//     setErrors((prev) => ({ ...prev, zipCodes: "" }));

//     const newLocations = [];
//     for (const zip of zipArray) {
//       const locationData = await geocodeAddress(zip);
//       if (locationData) {
//         newLocations.push({
//           lat: locationData.lat,
//           lng: locationData.lng,
//           name: locationData.formattedAddress,
//           zip: locationData.postalCode,
//           location: locationData.geoJson,
//         });
//       } else {
//         console.warn(`Could not find location for postal code: ${zip}`);
//       }
//     }

//     if (newLocations.length === 0) {
//       setErrors((prev) => ({
//         ...prev,
//         zipCodes: "Could not find any locations for the provided postal codes",
//       }));
//       toast.error("Could not find any locations for the provided postal codes");
//       return;
//     }

//     setLocations(newLocations);
//     setFormData((prev) => ({
//       ...prev,
//       zipCodes: zipArray,
//       locations: newLocations.map((loc) => ({
//         name: loc.name || "",
//         zip: loc.zip || "",
//         location: loc.location,
//       })),
//     }));
//   } catch (error) {
//     console.error("Error processing postal codes:", error);
//     setErrors((prev) => ({
//       ...prev,
//       zipCodes: "Error processing postal codes. Please try again.",
//     }));
//     toast.error("Error processing postal codes. Please try again.");
//   }
// };

//   const handleVehicleChange = (e) => {
//     const selectedVehicleName = e.target.value;

//     setFormData((prev) => ({
//       ...prev,
//       model: selectedVehicleName,
//       manufacturer: "",
//       yearOfManufacture: "",
//       images: [], // Reset images when vehicle changes
//     }));
//     setImgUrls([]); // Reset displayed images
//     setImageFiles([]); // Reset files to be sent
//   };

//   // Fetch images as blobs when vehicle is selected
//   useEffect(() => {

//     if (formData.model && formData.manufacturer && formData.yearOfManufacture) {
//       const vehicle = vehicles.find(
//         (v) =>
//           v.vehicle === formData.model &&
//           v.manufacturer === formData.manufacturer &&
//           v.yearOfManufacture == formData.yearOfManufacture
//       );
//       if (vehicle && vehicle.images?.length > 0) {

//         const secureImages = vehicle.images.map((img) =>
//           img.startsWith("http:") ? img.replace("http:", "https:") : img
//         );
//         setImgUrls(secureImages);
//         setFormData((prev) => ({ ...prev, images: secureImages }));

//         // Convert image URLs to blobs
//         const fetchImagesAsBlobs = async () => {
//           try {
//             const blobPromises = secureImages.map(async (url, index) => {
//               const response = await fetch(url);
//               if (!response.ok)
//                 throw new Error(`Failed to fetch image: ${url}`);
//               const blob = await response.blob();
//               return new File([blob], `vehicle_image_${index}.jpg`, {
//                 type: blob.type,
//               });
//             });
//             const files = await Promise.all(blobPromises);

//             setImageFiles(files);
//           } catch (error) {
//             console.error("Error converting images to blobs:", error);
//             toast.error("Failed to process vehicle images");
//             setImageFiles([]);
//             setErrors((prev) => ({
//               ...prev,
//               images: "Failed to load vehicle images",
//             }));
//           }
//         };
//         fetchImagesAsBlobs();
//       } else {

//         setImgUrls([]);
//         setImageFiles([]);
//         setFormData((prev) => ({ ...prev, images: [] }));
//       }
//     } else {

//       setImgUrls([]);
//       setImageFiles([]);
//       setFormData((prev) => ({ ...prev, images: [] }));
//     }
//   }, [
//     formData.model,
//     formData.manufacturer,
//     formData.yearOfManufacture,
//     vehicles,
//   ]);

//   useEffect(() => {
//     if (hasSubmitted && isSuccess) {

//       dispatch(resetFleetOwner());
//       resetForm();
//       setHasSubmitted(false);
//     }

//     if (hasSubmitted && isError) {
//       console.error("Form submission error:", message);
//       toast.error(message.data || message);
//       dispatch(resetFleetOwner());
//       setHasSubmitted(false);
//     }
//   }, [isSuccess, isError, message, dispatch, hasSubmitted]);

//   const resetForm = () => {

//     setFormData({
//       company: "",
//       accountNumber: "",
//       suburb: "",
//       city: "",
//       startTime: "",
//       endTime: "",
//       state: "",
//       country: "",
//       zipCodes: [],
//       routeFrom: "",
//       routeTo: "",
//       auctionRateFullWrap: "",
//       auctionRateOneSide: "",
//       auctionRateBothSides: "",
//       auctionRateRearDoors: "",
//       buyNowRateFullWrap: "",
//       buyNowRateOneSide: "",
//       buyNowRateBothSides: "",
//       buyNowRateRearDoors: "",
//       discount3Month: "10",
//       discount6Month: "15",
//       discount12Month: "25",
//       discount24Month: "",
//       manufacturer: "",
//       model: "",
//       availability: [],
//       prohibitedAds: {
//         gambling: false,
//         alcohol: false,
//         smoking: false,
//         other: false,
//         otherSpecify: "",
//       },
//       images: [],
//       locations: [],
//     });
//     setImgUrls([]);
//     setImageFiles([]);
//     setErrors({});
//     setZipCodes([]);
//     setQuery("");
//     setLocations([]);
//   };

//   const validateForm = () => {

//     const newErrors = {};

//     if (!formData.company.trim()) newErrors.company = "Company is required";
//     if (!formData.accountNumber.trim())
//       newErrors.accountNumber = "Account Number is required";
//     if (!formData.country.trim()) newErrors.country = "Country is required";
//     if (!formData.state.trim()) newErrors.state = "State is required";
//     if (!formData.manufacturer)
//       newErrors.manufacturer = "Manufacturer is required";
//     if (!formData.model) newErrors.model = "Model is required";
//     if (!formData.yearOfManufacture)
//       newErrors.yearOfManufacture = "Year is required";
//     if (!formData.startTime) newErrors.startTime = "Start time is required";
//     if (!formData.endTime) newErrors.endTime = "End time is required";
//     if (formData.availability.length === 0)
//       newErrors.availability = "Select at least one availability option";
//     if (imageFiles.length === 0)
//       newErrors.images = "At least one image is required";

//     const numericFields = [
//       "auctionRateFullWrap",
//       "auctionRateOneSide",
//       "auctionRateBothSides",
//       "auctionRateRearDoors",
//       "buyNowRateFullWrap",
//       "buyNowRateOneSide",
//       "buyNowRateBothSides",
//       "buyNowRateRearDoors",
//       "discount3Month",
//       "discount6Month",
//       "discount12Month",
//       "discount24Month",
//     ];

//     numericFields.forEach((field) => {
//       if (formData[field] && isNaN(formData[field])) {
//         newErrors[field] =
//           `${field.replace(/([A-Z])/g, " $1").trim()} must be a number`;
//       }
//     });

//     if (
//       formData.prohibitedAds.other &&
//       !formData.prohibitedAds.otherSpecify.trim()
//     ) {
//       newErrors.prohibitedAdsOther = "Please specify prohibited ads";
//     }

//     setErrors(newErrors);

//     if (Object.keys(newErrors).length > 0) {
//       Object.values(newErrors).forEach((error) => toast.error(error));
//       return false;
//     }

//     return true;
//   };

//  const debounceRef = useRef(
//   _.debounce(async (query) => {
//     if (!query || query.length < 3) {
//       setSuggestions([]);
//       setSuggestionsError("");
//       return;
//     }

//     try {

//       setSuggestionsError("");
//       setLoading(true);

//       // Remove country restriction to allow global search
//       const response = await axios.get(
//         `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
//           query
//         )}&format=json&addressdetails=1&limit=5`
//         // Removed: &countrycodes=${selectedCountry.isoCode.toLowerCase()}
//       );

//       if (response.data && response.data.length > 0) {
//         setSuggestions(response.data);
//       } else {
//         setSuggestions([]);
//         setSuggestionsError("No locations found. Try a different search term.");
//       }
//     } catch (error) {
//       console.error("Error fetching location suggestions:", error);
//       setSuggestions([]);
//       setSuggestionsError("Failed to fetch location suggestions. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }, 800)
// );

//   const handleLocationSelect = async (location) => {

//     const zip = location.address?.postcode || "";
//     setQuery(location.display_name);
//     const newZipCodes = [...new Set([...zipCodes, zip])].filter(Boolean);
//     setZipCodes(newZipCodes);

//     const newLocation = {
//       lat: parseFloat(location.lat),
//       lng: parseFloat(location.lon),
//       name: location.display_name || "",
//       zip: zip || "",
//       location: {
//         type: "Point",
//         coordinates: [parseFloat(location.lon), parseFloat(location.lat)],
//       },
//     };

//     const updatedLocations = [...locations, newLocation];
//     setLocations(updatedLocations);
//     setFormData((prev) => ({
//       ...prev,
//       zipCodes: newZipCodes,
//       locations: updatedLocations.map((loc) => ({
//         name: loc.name || "",
//         zip: loc.zip || "",
//         location: loc.location,
//       })),
//     }));
//     setSuggestions([]);
//     setQuery("");
//   };

//   const getCurrentLocation = async () => {
//     setLoading(true);
//     if ("geolocation" in navigator) {
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           const { latitude, longitude } = position.coords;
//           try {

//             const response = await axios.get(
//               `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
//             );

//             const data = response.data;
//             const zip = data.address?.postcode || "";

//             const newLocation = {
//               lat: latitude,
//               lng: longitude,
//               name: data.display_name || "",
//               zip: zip || "",
//               location: {
//                 type: "Point",
//                 coordinates: [longitude, latitude],
//               },
//             };

//             const updatedLocations = [...locations, newLocation];
//             setLocations(updatedLocations);
//             setZipCodes([...new Set([...zipCodes, zip])].filter(Boolean));
//             setFormData((prev) => ({
//               ...prev,
//               zipCodes: [...new Set([...zipCodes, zip])].filter(Boolean),
//               locations: updatedLocations.map((loc) => ({
//                 name: loc.name || "",
//                 zip: loc.zip || "",
//                 location: loc.location,
//               })),
//             }));
//             setQuery("");
//             setLoading(false);
//           } catch (error) {
//             setLoading(false);
//             console.error("Error fetching current location:", error);
//             toast.error("Failed to fetch current location");
//           }
//         },
//         (error) => {
//           setLoading(false);
//           console.error("Geolocation error:", error);
//           toast.error(
//             "Unable to access your location. Please check permissions."
//           );
//         },
//         {
//           enableHighAccuracy: true,
//           timeout: 15000,
//           maximumAge: 300000,
//         }
//       );
//     } else {
//       setLoading(false);
//       toast.error("Geolocation is not supported by your browser");
//     }
//   };

//   const handleInputChange = (e) => {
//     const value = e.target.value;
//     setQuery(value);
//     debounceRef.current(value);
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     if (name.startsWith("prohibitedAds")) {
//       const field = name.split(".")[1];
//       setFormData((prev) => ({
//         ...prev,
//         prohibitedAds: {
//           ...prev.prohibitedAds,
//           [field]: type === "checkbox" ? checked : String(value),
//         },
//       }));
//     } else if (type === "checkbox" && name === "availability") {
//       setFormData((prev) => {
//         const updatedAvailability = checked
//           ? [...prev.availability, value]
//           : prev.availability.filter((item) => item !== value);
//         return { ...prev, availability: updatedAvailability };
//       });
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: String(value) }));
//     }

//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: "" }));
//     }
//   };

//   const handleCountryChange = (country) => {

//     setSelectedCountry(country);
//     setFormData({
//       ...formData,
//       country: country.name,
//       state: "",
//       city: "",
//       zipCodes: [],
//       locations: [],
//     });
//     setSelectedState("");
//     setZipCodes([]);
//     setQuery("");
//     setLocations([]);
//   };

//   const handleStateChange = (state) => {

//     setSelectedState(state);
//     setFormData({
//       ...formData,
//       state: state.name,
//       city: "",
//       zipCodes: [],
//       locations: [],
//     });
//     setZipCodes([]);
//     setQuery("");
//     setLocations([]);
//   };

//   const removeLocation = (index) => {

//     const newZipCodes = [...zipCodes];
//     const newLocations = [...locations];
//     newZipCodes.splice(index, 1);
//     newLocations.splice(index, 1);
//     setZipCodes(newZipCodes);
//     setLocations(newLocations);
//     setFormData((prev) => ({
//       ...prev,
//       zipCodes: newZipCodes,
//       locations: newLocations.map((loc) => ({
//         name: loc.name || "",
//         zip: loc.zip || "",
//         location: loc.location,
//       })),
//     }));
//   };

//   const markers = useCallback(() => {
//     return locations.map((loc, index) => ({
//       position: { lat: loc.lat, lng: loc.lng },
//       label: (index + 1).toString(),
//     }));
//   }, [locations]);

//   const onMapLoad = (map) => {

//     mapRef.current = map;
//     setMapLoaded(true);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setHasSubmitted(true);

//     if (!validateForm()) {
//       setHasSubmitted(false);
//       return;
//     }

//     if (locations.length === 0) {

//       toast.error("Please add at least one location");
//       setHasSubmitted(false);
//       return;
//     }

//     if (!user || !user._id) {

//       toast.error("User not authenticated. Please login again.");
//       setHasSubmitted(false);
//       return;
//     }

//     if (!formData.startTime || !formData.endTime) {

//       toast.error("Please select both start and end times");
//       setHasSubmitted(false);
//       return;
//     }

//     const startDate = new Date(formData.startTime);
//     const endDate = new Date(formData.endTime);
//     const startTimeISO = startDate.toISOString();
//     const endTimeISO = endDate.toISOString();

//     if (startDate >= endDate) {
//       toast.error("End time must be after start time");
//       setHasSubmitted(false);
//       return;
//     }

//     const formDataWithDates = {
//       ...formData,
//       startTime: startTimeISO,
//       endTime: endTimeISO,
//     };

//     const formDataToSend = new FormData();

//     formDataToSend.append("fleetOwner", user._id);
//     formDataToSend.append(
//       "yearofmanufacturer",
//       String(formDataWithDates.yearOfManufacture)
//     );

//     const sanitizedLocations = locations.map((loc) => ({
//       name: loc.name || "",
//       zip: loc.zip || "",
//       location: {
//         type: "Point",
//         coordinates: [loc.lng || 0, loc.lat || 0],
//       },
//     }));
//     formDataToSend.append("locations", JSON.stringify(sanitizedLocations));
//     formDataToSend.append("zipCodes", JSON.stringify(zipCodes));
//     if (locations[0]) {
//       formDataToSend.append("latitude", String(locations[0].lat || ""));
//       formDataToSend.append("longitude", String(locations[0].lng || ""));
//       formDataToSend.append("locationName", locations[0].name || "");
//       formDataToSend.append("zipCode", locations[0].zip || "");
//     }

//     if (formData.routeFrom && formData.routeTo) {
//       formDataToSend.append(
//         "interRoutes",
//         JSON.stringify([
//           {
//             from: String(formData.routeFrom),
//             to: String(formData.routeTo),
//           },
//         ])
//       );
//     } else {
//       formDataToSend.append("interRoutes", JSON.stringify([]));
//     }

//     // Append image files (blobs) instead of URLs
//     imageFiles.forEach((file) => {
//       formDataToSend.append("images", file);
//     });

//     Object.entries(formDataWithDates).forEach(([key, value]) => {
//       if (
//         key !== "images" &&
//         key !== "locations" &&
//         key !== "zipCodes" &&
//         key !== "routeFrom" &&
//         key !== "routeTo"
//       ) {
//         if (key === "prohibitedAds" || key === "availability") {
//           formDataToSend.append(key, JSON.stringify(value));
//         } else {
//           formDataToSend.append(key, String(value));
//         }
//       }
//     });

//     formDataToSend.append("user", user._id);

//     for (let pair of formDataToSend.entries()) {

//     }

//     try {

//       const response = await dispatch(
//         addfleetauctiondata(formDataToSend)
//       ).unwrap();

//       toast.success("Form submitted successfully!");
//       navigate("/user-profile/manage-fleetauction");
//       resetForm();
//     } catch (error) {
//       console.error("Submission error:", error);
//       toast.error(error.message || "Failed to submit form");
//       setHasSubmitted(false);
//     }
//   };

//   if (!user) {
//     return (
//       <div className="p-6 max-w-4xl mx-auto text-center">
//         <p className="text-red-500">Please login to access this form.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-6xl mx-auto bg-theme-bg rounded-lg shadow-md text-white">
//       <h2 className="text-2xl font-bold mb-6 text-white-800">
//         Fleet Owner Form
//       </h2>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//           <div className="lg:col-span-4 mb-6 lg:mb-0">
//             <div className="bg-theme-bg2 p-4 rounded-lg h-full">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Vehicle Images
//               </h3>
//               {imgUrls.length > 0 ? (
//                 <div className="space-y-4">
//                   <div className="relative w-full h-80 rounded-lg border-2 border-solid p-2 overflow-hidden">
//                     <div className="flex flex-col space-y-4 h-full overflow-y-auto">
//                       {imgUrls.map((url, index) => (
//                         <div
//                           key={index}
//                           className="relative w-full h-64 flex-shrink-0"
//                         >
//                           <img
//                             src={url}
//                             alt={`vehicle ${index}`}
//                             className="w-full h-full object-contain"
//                             onError={(e) => {
//                               console.error(`Failed to load image: ${url}`);
//                               e.target.src =
//                                 "https://via.placeholder.com/300x200?text=Image+Not+Found";
//                             }}
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="w-full h-80 bg-theme-bg rounded-xl border-2 border-dashed border-border-info-color flex items-center justify-center">
//                   <div className="text-center flex flex-col items-center gap-2 text-white">
//                     <p>No images available for selected vehicle</p>
//                   </div>
//                 </div>
//               )}

//               <div className="bg-theme-bg2 p-4 rounded-lg mt-6">
//                 <h3 className="text-lg font-semibold mb-4 text-white-700">
//                   Route Map
//                 </h3>
//                 {googleMapsApiKey ? (
//                   <LoadScript
//                     googleMapsApiKey={googleMapsApiKey}
//                     onLoad={() => setMapLoaded(true)}
//                     onError={(error) => {
//                       console.error("Google Maps failed to load:", error);
//                       toast.error("Failed to load Google Maps");
//                     }}
//                   >
//                     <GoogleMap
//                       mapContainerStyle={containerStyle}
//                       center={defaultCenter}
//                       zoom={5}
//                       onLoad={onMapLoad}
//                       options={{
//                         zoomControl: true,
//                         streetViewControl: false,
//                         mapTypeControl: false,
//                         fullscreenControl: false,
//                       }}
//                     >
//                       {markers().map((marker, index) => (
//                         <Marker
//                           key={index}
//                           position={marker.position}
//                           label={marker.label}
//                         />
//                       ))}
//                     </GoogleMap>
//                   </LoadScript>
//                 ) : (
//                   <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
//                     <div className="text-center text-gray-600">
//                       <p className="mb-2">Google Maps not available</p>
//                       <p className="text-sm">API key not configured</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="lg:col-span-8 space-y-6">
//             <div className="bg-theme-bg2 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Basic Information
//               </h3>
//               <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Company Name*
//                   </label>
//                   <input
//                     name="company"
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                       errors.company ? "border-red-500" : "border-gray-300"
//                     }`}
//                     value={formData.company}
//                     onChange={handleChange}
//                     readOnly
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Account Number*
//                   </label>
//                   <input
//                     name="accountNumber"
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                       errors.accountNumber
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     }`}
//                     value={formData.accountNumber}
//                     onChange={handleChange}
//                     readOnly
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Suburb
//                   </label>
//                   <input
//                     name="suburb"
//                     className="w-full px-3 py-2 bg-theme-bg border border-gray-300 rounded-md"
//                     value={formData.suburb}
//                     onChange={handleChange}
//                     readOnly
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-theme-bg2 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Location Information
//               </h3>
//               <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Country*
//                   </label>
//                   <CountrySelect
//                     placeHolder="Select Country"
//                     value={selectedCountry}
//                     required
//                     onChange={handleCountryChange}
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                       errors.country ? "border-red-500" : "border-gray-300"
//                     }`}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     State*
//                   </label>
//                   <StateSelect
//                     countryid={selectedCountry?.id}
//                     value={selectedState}
//                     required
//                     onChange={handleStateChange}
//                     placeHolder="Select State"
//                     className={`w-full px-3 py-2 border rounded-md bg-white ${
//                       errors.state ? "border-red-500" : "border-gray-300"
//                     }`}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     City*
//                   </label>
//                   <CitySelect
//                     countryid={selectedCountry?.id}
//                     stateid={selectedState?.id}
//                     value={{ name: formData.city }}
//                     onChange={(city) =>
//                       setFormData({ ...formData, city: city.name })
//                     }
//                     placeHolder="Select City"
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                       errors.city ? "border-red-500" : "border-gray-300"
//                     }`}
//                   />
//                 </div>
//                 <div className="relative md:col-span-3">
//                   <label
//                     htmlFor="zipCodes"
//                     className="block text-sm font-medium text-white-700 mb-1"
//                   >
//                     Campaign Post / Zip Codes (separated by commas)*
//                   </label>
//                   <input
//                     type="text"
//                     id="zipCodes"
//                     readOnly
//                     value={zipCodes.join(", ")}
//                     onChange={handleZipCodesChange}
//                     placeholder="Enter zip codes separated by commas (e.g., 400001, 400002)"
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md `}
//                   />
//                 </div>
//                 <div className="relative">
//                   <label
//                     htmlFor="locationSearch"
//                     className="block text-sm font-medium text-white-700 mb-1"
//                   >
//                     Search Location to Add
//                   </label>
//                   <div className="relative w-full">
//                     <input
//                       type="text"
//                       id="locationSearch"
//                       value={query}
//                       onChange={handleInputChange}
//                       placeholder="Search for a location to add to route"
//                       className="search-input w-full bg-theme-bg border rounded-md px-4 py-2"
//                     />
//                     <BiCurrentLocation
//                       size={24}
//                       className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600 hover:text-white"
//                       onClick={getCurrentLocation}
//                       aria-label="Get current location"
//                       tabIndex={0}
//                     />
//                     {loading && (
//                       <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
//                     )}
//                     {suggestions.length > 0 && (
//                       <ul className="absolute top-full left-0 w-full z-50 rounded-md border border-gray-300 bg-[rgb(7, 27, 54)] text-sm shadow-lg max-h-48 overflow-y-auto mt-1">
//                         {suggestions.map((suggestion, index) => (
//                           <li
//                             key={index}
//                             onClick={() => handleLocationSelect(suggestion)}
//                             className="cursor-pointer p-2 hover:bg-gray-200 hover:text-black"
//                           >
//                             {suggestion.display_name}
//                           </li>
//                         ))}
//                       </ul>
//                     )}
//                   </div>
//                 </div>
//                 {locations.length > 0 && (
//                   <div className="md:col-span-3">
//                     <h4 className="text-sm font-medium text-white-700 mb-2">
//                       Selected Route Locations
//                     </h4>
//                     <ul className="space-y-2">
//                       {locations.map((loc, index) => (
//                         <li
//                           key={index}
//                           className="flex items-center justify-between bg-theme-bg p-2 rounded-md"
//                         >
//                           <span>
//                             {loc.name} (Zip: {loc.zip || "N/A"})
//                           </span>
//                           <button
//                             type="button"
//                             onClick={() => removeLocation(index)}
//                             className="text-red-500 hover:text-red-700"
//                           >
//                             Remove
//                           </button>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//                 <div className="md:col-span-2 text-white">
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Interstate/Intercity Routes
//                   </label>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs text-white-500 mb-1">
//                         From
//                       </label>
//                       <input
//                         name="routeFrom"
//                         className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                         value={formData.routeFrom}
//                         required
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs text-white-500 mb-1">
//                         To
//                       </label>
//                       <input
//                         name="routeTo"
//                         required
//                         className="w-full px-3 py-2 bg-theme-bg2 border border-gray-300 rounded-md"
//                         value={formData.routeTo}
//                         onChange={handleChange}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-theme-bg2 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Vehicle Information
//               </h3>
//               <div className="bg-theme-bg2 p-4 rounded-lg grid lg:grid-cols-2 gap-4 mlg:grid-cols-1">
//                 <div className="grid">
//                   <label htmlFor="startTime">Auction Start Time*</label>
//                   <input
//                     required
//                     id="startTime"
//                     type="datetime-local"
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                       errors.startTime ? "border-red-500" : "border-gray-300"
//                     }`}
//                     onChange={(e) =>
//                       setFormData({ ...formData, startTime: e.target.value })
//                     }
//                     value={formData.startTime}
//                   />
//                 </div>
//                 <div className="grid">
//                   <label htmlFor="endTime">Auction End Time*</label>
//                   <input
//                     required
//                     id="endTime"
//                     type="datetime-local"
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                       errors.endTime ? "border-red-500" : "border-gray-300"
//                     }`}
//                     onChange={(e) =>
//                       setFormData({ ...formData, endTime: e.target.value })
//                     }
//                     value={formData.endTime}
//                   />
//                 </div>
//               </div>
//               <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Vehicle Type*
//                   </label>
//                   <select
//                     name="model"
//                     required
//                     onChange={handleVehicleChange}
//                     value={formData.model}
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                       errors.model ? "border-red-500" : "border-gray-300"
//                     }`}
//                   >
//                     <option value="">Select a Vehicle</option>
//                     {[...new Set(vehicles.map((v) => v.vehicle))].map(
//                       (vehicle) => (
//                         <option key={vehicle} value={vehicle}>
//                           {vehicle}
//                         </option>
//                       )
//                     )}
//                   </select>
//                 </div>
//                 {formData.model && (
//                   <div>
//                     <label className="block text-sm font-medium text-white-700 mb-1">
//                       Manufacturer*
//                     </label>
//                     <select
//                       name="manufacturer"
//                       required
//                       onChange={handleChange}
//                       value={formData.manufacturer}
//                       className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                         errors.manufacturer
//                           ? "border-red-500"
//                           : "border-gray-300"
//                       }`}
//                     >
//                       <option value="">Select Manufacturer</option>
//                       {[
//                         ...new Set(
//                           vehicles
//                             .filter((v) => v.vehicle === formData.model)
//                             .map((v) => v.manufacturer)
//                         ),
//                       ].map((manufacturer) => (
//                         <option key={manufacturer} value={manufacturer}>
//                           {manufacturer}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}
//                 {formData.model && formData.manufacturer && (
//                   <div>
//                     <label className="block text-sm font-medium text-white-700 mb-1">
//                       Year of Manufacture*
//                     </label>
//                     <select
//                       name="yearOfManufacture"
//                       required
//                       onChange={handleChange}
//                       value={formData.yearOfManufacture}
//                       className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                         errors.yearOfManufacture
//                           ? "border-red-500"
//                           : "border-gray-300"
//                       }`}
//                     >
//                       <option value="">Select Year</option>
//                       {[
//                         ...new Set(
//                           vehicles
//                             .filter(
//                               (v) =>
//                                 v.vehicle === formData.model &&
//                                 v.manufacturer === formData.manufacturer
//                             )
//                             .map((v) => v.yearOfManufacture)
//                         ),
//                       ].map((year) => (
//                         <option key={year} value={year}>
//                           {year}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}
//               </div>
//               <br />
//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-white mb-2">
//                   Vehicle Availability <span className="text-red-500">*</span>
//                 </label>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                   {["3 Months", "6 Months", "12 Months", "24 Months"].map(
//                     (val) => (
//                       <label
//                         key={val}
//                         className={`flex items-center justify-center cursor-pointer border rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200
//                         ${
//                           formData.availability.includes(val)
//                             ? "bg-blue-600 text-white border-blue-600 shadow-md"
//                             : "bg-theme-bg2 text-white border-gray-600 hover:bg-gray-700 hover:border-gray-500"
//                         }`}
//                       >
//                         <input
//                           type="radio"
//                           name="availability"
//                           value={val}
//                           checked={formData.availability.includes(val)}
//                           onChange={handleChange}
//                           className="hidden"
//                         />
//                         {val}
//                       </label>
//                     )
//                   )}
//                 </div>
//                 <input
//                   type="hidden"
//                   name="availabilityRequired"
//                   required
//                   value={formData.availability.length > 0 ? "valid" : ""}
//                 />
//                 {errors.availability && (
//                   <p className="text-red-500 text-sm mt-1">
//                     {errors.availability}
//                   </p>
//                 )}
//               </div>
//             </div>

//           </div>
//         </div>
//             <div className="bg-theme-bg2 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Pricing Information
//               </h3>
//               <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
//                 <div className="bg-theme-bg p-4 rounded-md border border-gray-200">
//                   <h4 className="font-medium text-white-700 mb-3">
//                     Auction Rates (per sqm)
//                   </h4>
//                   <div className="space-y-3">
//                     <div>
//                       <label className="block text-sm text-white-600 mb-1">
//                         Full Wrap
//                       </label>
//                       <input
//                         name="auctionRateFullWrap"
//                         type="number"
//                         placeholder={`e.g. ${currency}100`}
//                         required
//                         className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                         value={formData.auctionRateFullWrap}
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm text-white-600 mb-1">
//                         One Side
//                       </label>
//                       <input
//                         name="auctionRateOneSide"
//                         type="number"
//                         placeholder={`e.g. ${currency}100`}
//                         required
//                         className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                         value={formData.auctionRateOneSide}
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm text-white-600 mb-1">
//                         Both Sides
//                       </label>
//                       <input
//                         name="auctionRateBothSides"
//                         type="number"
//                         placeholder={`e.g. ${currency}100`}
//                         required
//                         className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                         value={formData.auctionRateBothSides}
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm text-white-600 mb-1">
//                         Rear Doors
//                       </label>
//                       <input
//                         name="auctionRateRearDoors"
//                         type="number"
//                         placeholder={`e.g. ${currency}100`}
//                         required
//                         className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                         value={formData.auctionRateRearDoors}
//                         onChange={handleChange}
//                       />
//                     </div>
//                   </div>
//                 </div>
//                 <div className="bg-theme-bg p-4 rounded-md border border-gray-200">
//                   <h4 className="font-medium text-white-700 mb-3">
//                     Buy Now Rates (per sqm)
//                   </h4>
//                   <div className="space-y-3">
//                     <div>
//                       <label className="block text-sm text-white-600 mb-1">
//                         Full Wrap
//                       </label>
//                       <input
//                         name="buyNowRateFullWrap"
//                         type="number"
//                         placeholder={`e.g. ${currency}100`}
//                         required
//                         className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                         value={formData.buyNowRateFullWrap}
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm text-white-600 mb-1">
//                         One Side
//                       </label>
//                       <input
//                         name="buyNowRateOneSide"
//                         type="number"
//                         placeholder={`e.g. ${currency}100`}
//                         required
//                         className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                         value={formData.buyNowRateOneSide}
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm text-white-600 mb-1">
//                         Both Sides
//                       </label>
//                       <input
//                         name="buyNowRateBothSides"
//                         type="number"
//                         placeholder={`e.g. ${currency}100`}
//                         required
//                         className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                         value={formData.buyNowRateBothSides}
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm text-white-600 mb-1">
//                         Rear Doors
//                       </label>
//                       <input
//                         name="buyNowRateRearDoors"
//                         type="number"
//                         placeholder={`e.g. ${currency}100`}
//                         required
//                         className="w-full px-3 py-2 bg-theme-bg2 border border-gray-300 rounded-md"
//                         value={formData.buyNowRateRearDoors}
//                         onChange={handleChange}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="mt-4 bg-theme-bg2 p-4 rounded-md border border-gray-200">
//                 <h4 className="font-medium text-white-700 mb-3">
//                   Discounts for Longer Campaigns (%)
//                 </h4>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div>
//                     <label className="block text-sm text-white-600 mb-1">
//                       3 Month
//                     </label>
//                     <input
//                       name="discount3Month"
//                       type="number"
//                       className="w-full px-3 py-2 bg-theme-bg2 border border-gray-300 rounded-md"
//                       value={formData.discount3Month}
//                       onChange={handleChange}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm text-white-600 mb-1">
//                       6 Month
//                     </label>
//                     <input
//                       name="discount6Month"
//                       type="number"
//                       className="w-full px-3 py-2 bg-theme-bg2 border border-gray-300 rounded-md"
//                       value={formData.discount6Month}
//                       onChange={handleChange}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm text-white-600 mb-1">
//                       12 Month
//                     </label>
//                     <input
//                       name="discount12Month"
//                       type="number"
//                       className="w-full px-3 py-2 bg-theme-bg2 border border-gray-300 rounded-md"
//                       value={formData.discount12Month}
//                       onChange={handleChange}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm text-white-600 mb-1">
//                       24 Month
//                     </label>
//                     <input
//                       name="discount24Month"
//                       type="number"
//                       className="w-full px-3 py-2 bg-theme-bg2 border border-gray-300 rounded-md"
//                       value={formData.discount24Month}
//                       onChange={handleChange}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="md:col-span-2 bg-theme-bg2 p-6 rounded-xl shadow-md">
//               <h3 className="text-lg font-semibold mb-4 text-white">
//                 Prohibited Ads <span className="text-red-500">*</span>
//               </h3>
//               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//                 {[
//                   { name: "gambling", label: "Gambling" },
//                   { name: "alcohol", label: "Alcohol" },
//                   { name: "smoking", label: "Smoking" },
//                 ].map((item) => (
//                   <label
//                     key={item.name}
//                     className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-md text-white hover:bg-white/20 transition"
//                   >
//                     <input
//                       type="checkbox"
//                       name={`prohibitedAds.${item.name}`}
//                       checked={formData.prohibitedAds[item.name]}
//                       onChange={handleChange}
//                       className="h-4 w-4 accent-blue-500"
//                     />
//                     <span className="text-sm">{item.label}</span>
//                   </label>
//                 ))}
//                 <div className="col-span-2 sm:col-span-1 lg:col-span-2">
//                   <label className="flex items-start gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-md text-white hover:bg-white/20 transition">
//                     <input
//                       type="checkbox"
//                       name="prohibitedAds.other"
//                       checked={formData.prohibitedAds.other}
//                       onChange={handleChange}
//                       className="h-4 w-4 mt-1 accent-blue-500"
//                     />
//                     <div className="flex-1">
//                       <span className="text-sm">Other</span>
//                       {formData.prohibitedAds.other && (
//                         <div className="mt-2">
//                           <input
//                             type="text"
//                             name="prohibitedAds.otherSpecify"
//                             placeholder="Please specify"
//                             className={`w-full px-3 py-2 rounded-md text-sm text-black bg-white border ${
//                               errors.prohibitedAdsOther
//                                 ? "border-red-500"
//                                 : "border-gray-300"
//                             }`}
//                             value={formData.prohibitedAds.otherSpecify}
//                             onChange={handleChange}
//                           />
//                         </div>
//                       )}
//                     </div>
//                   </label>
//                 </div>
//               </div>
//             </div>

//             <div className="md:col-span-2 flex justify-end">
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
//                   isLoading ? "opacity-50 cursor-not-allowed" : ""
//                 }`}
//               >
//                 {isLoading ? (
//                   <>
//                     <svg
//                       className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                       ></path>
//                     </svg>
//                     Submitting...
//                   </>
//                 ) : (
//                   "Submit Form"
//                 )}
//               </button>
//             </div>
//       </form>
//     </div>
//   );
// };

// export default FleetOwnerForm;

// import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   addfleetauctiondata,
//   resetFleetOwner,
// } from "../store/fleetowner/fleetownerSlice";
// import {
//   fetchVehicles,
//   getVehicleDetails,
//   setSelectedVehicle,
// } from "../store/vehicle/vehicleSlice";
// import { toast } from "react-toastify";
// import axios from "axios";
// import { CitySelect, CountrySelect, StateSelect } from "react-country-state-city";
// import _ from "lodash";
// import { BiCurrentLocation } from "react-icons/bi";
// import { useNavigate } from "react-router-dom";
// import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

// const FleetOwnerForm = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { isLoading, isSuccess, isError, message } = useSelector(
//     (state) => state.fleetOwner
//   );
//   const { list: vehicles, selectedVehicle, error } = useSelector(
//     (state) => state.vehicles || {}
//   );
//   const { user } = useSelector((state) => state.auth);
//
//   const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
//   if (!googleMapsApiKey) {
//     console.error("Google Maps API key is missing!");
//   }

//   const defaultCountry = { id: "IN", name: "India", isoCode: "IN" };
//   const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
//   const [selectedState, setSelectedState] = useState("");
//   const [query, setQuery] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [suggestions, setSuggestions] = useState([]);
//   const [imgUrls, setImgUrls] = useState([]);
//   const [hasSubmitted, setHasSubmitted] = useState(false);
//   const [zipCodes, setZipCodes] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const mapRef = useRef(null); // Ref to store the map instance
//   const [mapLoaded, setMapLoaded] = useState(false);

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
//     yearOfManufacture: "",
//     model: "",
//     availability: [],
//     prohibitedAds: {
//       gambling: false,
//       alcohol: false,
//       smoking: false,
//       other: false,
//       otherSpecify: "",
//     },
//     images: [],
//     locations: [],
//   });

//   const [errors, setErrors] = useState({});

//   const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // Default center (India)
//   const containerStyle = {
//     width: "100%",
//     height: "400px",
//   };

//   useEffect(() => {
//     dispatch(fetchVehicles());
//   }, [dispatch]);

//   useEffect(() => {
//     if (user) {
//       setFormData((prev) => ({
//         ...prev,
//         company: user.company || "",
//         accountNumber: user.stripeAccountId || user.accountNumber || "",
//         suburb: user.suburb || "",
//         city: user.city || "",
//         state: user.state || "",
//         country: user.country || "",
//         zipCodes: user.postalCode ? [user.postalCode] : prev.zipCodes,
//         locations: user.location?.coordinates
//           ? [
//               {
//                 name: user.location.name || "",
//                 zip: user.location.zip || "",
//                 location: {
//                   type: "Point",
//                   coordinates: user.location.coordinates,
//                 },
//               },
//             ]
//           : prev.locations,
//       }));

//       if (user.location?.coordinates) {
//         setLocations([
//           {
//             lat: user.location.coordinates[1],
//             lng: user.location.coordinates[0],
//             name: user.location.name || "",
//             zip: user.location.zip || "",
//             location: {
//               type: "Point",
//               coordinates: user.location.coordinates,
//             },
//           },
//         ]);
//       }

//       setSelectedCountry({
//         id: user.countryCode || defaultCountry.id,
//         name: user.country || defaultCountry.name,
//         isoCode: user.countryCode?.toUpperCase() || defaultCountry.isoCode,
//       });

//       if (user.state) {
//         setSelectedState({ id: user.stateId || "", name: user.state });
//       }
//     }
//   }, [user]);

//   // Function to fit map bounds to show all locations
//   const fitMapToBounds = useCallback(() => {
//     if (!mapRef.current || locations.length === 0) return;

//     const bounds = new window.google.maps.LatLngBounds();
//     locations.forEach((loc) => {
//       bounds.extend({ lat: loc.lat, lng: loc.lng });
//     });

//     mapRef.current.fitBounds(bounds);
//     // Ensure a minimum zoom level to avoid excessive zooming
//     const listener = window.google.maps.event.addListener(
//       mapRef.current,
//       "bounds_changed",
//       () => {
//         if (mapRef.current.getZoom() > 15) {
//           mapRef.current.setZoom(15);
//         }
//         window.google.maps.event.removeListener(listener);
//       }
//     );
//   }, [locations]);

//   // Update map bounds when locations change
//   useEffect(() => {
//     if (mapLoaded && locations.length > 0) {
//       fitMapToBounds();
//     }
//   }, [locations, mapLoaded, fitMapToBounds]);

//   const geocodeAddress = async (address) => {
//     if (!googleMapsApiKey) {
//       toast.error("Google Maps API key is not configured");
//       return null;
//     }

//     try {
//       const response = await axios.get(
//         `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//           address
//         )}&key=${googleMapsApiKey}`
//       );

//       if (response.data.status === "OK" && response.data.results[0]) {
//         const result = response.data.results[0];
//         const { lat, lng } = result.geometry.location;
//         const postalCode =
//           result.address_components.find((component) =>
//             component.types.includes("postal_code")
//           )?.long_name || "";

//         return {
//           lat,
//           lng,
//           formattedAddress: result.formatted_address,
//           postalCode,
//           geoJson: {
//             type: "Point",
//             coordinates: [lng, lat],
//           },
//         };
//       } else {
//         console.error(
//           "Geocoding failed:",
//           response.data.status,
//           response.data.error_message
//         );
//         return null;
//       }
//     } catch (error) {
//       console.error("Geocoding error:", error);
//       return null;
//     }
//   };

//   const handleZipCodesChange = async (e) => {
//     const input = e.target.value;
//     try {
//       const zipArray = input
//         .split(",")
//         .map((zip) => zip.trim())
//         .filter(Boolean);
//       setZipCodes(zipArray);

//       const invalidZips = zipArray.filter((zip) => !/^\d+$/.test(zip));
//       if (invalidZips.length > 0) {
//         setErrors((prev) => ({
//           ...prev,
//           zipCodes: `Invalid zip codes: ${invalidZips.join(", ")}`,
//         }));
//         toast.error(`Invalid zip codes: ${invalidZips.join(", ")}`);
//         return;
//       }

//       setErrors((prev) => ({ ...prev, zipCodes: "" }));

//       const newLocations = [];
//       for (const zip of zipArray) {
//         const locationData = await geocodeAddress(zip);
//         if (locationData) {
//           newLocations.push({
//             lat: locationData.lat,
//             lng: locationData.lng,
//             name: locationData.formattedAddress,
//             zip: locationData.postalCode,
//             location: locationData.geoJson,
//           });
//         } else {
//           setErrors((prev) => ({
//             ...prev,
//             zipCodes: `Could not find location for zip code: ${zip}`,
//           }));
//           toast.error(`Could not find location for zip code: ${zip}`);
//           return;
//         }
//       }

//       setLocations(newLocations);
//       setFormData((prev) => ({
//         ...prev,
//         zipCodes: zipArray,
//         locations: newLocations.map((loc) => ({
//           name: loc.name || "",
//           zip: loc.zip || "",
//           location: loc.location,
//         })),
//       }));
//     } catch (error) {
//       console.error("Error processing zip codes:", error);
//       setErrors((prev) => ({
//         ...prev,
//         zipCodes: "Error processing zip codes. Please try again.",
//       }));
//       toast.error("Error processing zip codes. Please try again.");
//     }
//   };

//   const handleVehicleChange = (e) => {
//     const selectedVehicleName = e.target.value;
//     setFormData((prev) => ({
//       ...prev,
//       model: selectedVehicleName,
//       manufacturer: "",
//       yearOfManufacture: "",
//     }));
//   };

//   useEffect(() => {
//     if (formData.model && formData.manufacturer && formData.yearOfManufacture) {
//       const vehicle = vehicles.find(
//         (v) =>
//           v.vehicle === formData.model &&
//           v.manufacturer === formData.manufacturer &&
//           v.yearOfManufacture == formData.yearOfManufacture
//       );
//       if (vehicle && vehicle.images?.length > 0) {
//         setImgUrls(vehicle.images);
//         setFormData((prev) => ({ ...prev, images: vehicle.images }));
//       } else {
//         setImgUrls([]);
//         setFormData((prev) => ({ ...prev, images: [] }));
//       }
//     }
//   }, [formData.model, formData.manufacturer, formData.yearOfManufacture, vehicles]);

//   useEffect(() => {
//     if (hasSubmitted && isSuccess) {
//       dispatch(resetFleetOwner());
//       resetForm();
//       setHasSubmitted(false);
//     }

//     if (hasSubmitted && isError) {
//       toast.error(message.data || message);
//       dispatch(resetFleetOwner());
//       setHasSubmitted(false);
//     }
//   }, [isSuccess, isError, message, dispatch, hasSubmitted]);

//   const resetForm = () => {
//     setFormData({
//       company: "",
//       accountNumber: "",
//       suburb: "",
//       city: "",
//       startTime: "",
//       endTime: "",
//       state: "",
//       country: "",
//       zipCodes: [],
//       routeFrom: "",
//       routeTo: "",
//       auctionRateFullWrap: "",
//       auctionRateOneSide: "",
//       auctionRateBothSides: "",
//       auctionRateRearDoors: "",
//       buyNowRateFullWrap: "",
//       buyNowRateOneSide: "",
//       buyNowRateBothSides: "",
//       buyNowRateRearDoors: "",
//       discount3Month: "10",
//       discount6Month: "15",
//       discount12Month: "25",
//       discount24Month: "",
//       manufacturer: "",
//       model: "",
//       availability: [],
//       prohibitedAds: {
//         gambling: false,
//         alcohol: false,
//         smoking: false,
//         other: false,
//         otherSpecify: "",
//       },
//       images: [],
//       locations: [],
//     });
//     setImgUrls([]);
//     setErrors({});
//     setZipCodes([]);
//     setQuery("");
//     setLocations([]);
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     // Validate required fields
//     if (!formData.company.trim()) newErrors.company = "Company is required";
//     if (!formData.accountNumber.trim()) newErrors.accountNumber = "Account Number is required";
//     if (!formData.country.trim()) newErrors.country = "Country is required";
//     if (!formData.state.trim()) newErrors.state = "State is required";
//     if (!formData.manufacturer) newErrors.manufacturer = "Manufacturer is required";
//     if (!formData.model) newErrors.model = "Model is required";
//     if (!formData.yearOfManufacture) newErrors.yearOfManufacture = "Year is required";
//     if (!formData.startTime) newErrors.startTime = "Start time is required";
//     if (!formData.endTime) newErrors.endTime = "End time is required";
//     if (formData.availability.length === 0) newErrors.availability = "Select at least one availability option";
//     if (!formData.images || formData.images.length === 0) newErrors.images = "At least one image is required";

//     const numericFields = [
//       "auctionRateFullWrap",
//       "auctionRateOneSide",
//       "auctionRateBothSides",
//       "auctionRateRearDoors",
//       "buyNowRateFullWrap",
//       "buyNowRateOneSide",
//       "buyNowRateBothSides",
//       "buyNowRateRearDoors",
//       "discount3Month",
//       "discount6Month",
//       "discount12Month",
//       "discount24Month",
//     ];

//     numericFields.forEach((field) => {
//       if (formData[field] && isNaN(formData[field])) {
//         newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').trim()} must be a number`;
//       }
//     });

//     if (formData.prohibitedAds.other && !formData.prohibitedAds.otherSpecify.trim()) {
//       newErrors.prohibitedAdsOther = "Please specify prohibited ads";
//     }

//     // Set errors state for styling
//     setErrors(newErrors);

//     // Display errors as toasts
//     if (Object.keys(newErrors).length > 0) {
//       Object.values(newErrors).forEach((error) => {
//         toast.error(error, {
//           position: "top-right",
//           autoClose: 5000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//         });
//       });
//       return false;
//     }

//     return true;
//   };

//   const debounceRef = useRef(
//     _.debounce(async (query) => {
//       if (!query || query.length < 3) {
//         setSuggestions([]);
//         return;
//       }

//       try {
//         const response = await axios.get(
//           `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
//             query
//           )}&format=json&addressdetails=1&limit=5&countrycodes=${selectedCountry.isoCode.toLowerCase()}`
//         );
//         setSuggestions(response.data);
//       } catch (error) {
//         console.error("Error fetching location suggestions:", error);
//         toast.error("Failed to fetch location suggestions");
//       }
//     }, 800)
//   );

//   const handleLocationSelect = async (location) => {
//     const zip = location.address?.postcode || "";
//     setQuery(location.display_name);
//     const newZipCodes = [...new Set([...zipCodes, zip])].filter(Boolean);
//     setZipCodes(newZipCodes);

//     const newLocation = {
//       lat: parseFloat(location.lat),
//       lng: parseFloat(location.lon),
//       name: location.display_name || "",
//       zip: zip || "",
//       location: {
//         type: "Point",
//         coordinates: [parseFloat(location.lon), parseFloat(location.lat)],
//       },
//     };

//     const updatedLocations = [...locations, newLocation];
//     setLocations(updatedLocations);
//     setFormData((prev) => ({
//       ...prev,
//       zipCodes: newZipCodes,
//       locations: updatedLocations.map((loc) => ({
//         name: loc.name || "",
//         zip: loc.zip || "",
//         location: loc.location,
//       })),
//     }));
//     setSuggestions([]);
//     setQuery("");
//   };

//   const getCurrentLocation = async () => {
//     setLoading(true);
//     if ("geolocation" in navigator) {
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           const { latitude, longitude } = position.coords;
//           try {
//             const response = await axios.get(
//               `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
//             );
//             const data = response.data;
//             const zip = data.address?.postcode || "";

//             const newLocation = {
//               lat: latitude,
//               lng: longitude,
//               name: data.display_name || "",
//               zip: zip || "",
//               location: {
//                 type: "Point",
//                 coordinates: [longitude, latitude],
//               },
//             };

//             const updatedLocations = [...locations, newLocation];
//             setLocations(updatedLocations);
//             setZipCodes([...new Set([...zipCodes, zip])].filter(Boolean));
//             setFormData((prev) => ({
//               ...prev,
//               zipCodes: [...new Set([...zipCodes, zip])].filter(Boolean),
//               locations: updatedLocations.map((loc) => ({
//                 name: loc.name || "",
//                 zip: loc.zip || "",
//                 location: loc.location,
//               })),
//             }));
//             setQuery("");
//             setLoading(false);
//           } catch (error) {
//             setLoading(false);
//             console.error("Error fetching current location:", error);
//             toast.error("Failed to fetch current location");
//           }
//         },
//         (error) => {
//           setLoading(false);
//           console.error("Geolocation error:", error);
//           toast.error("Unable to access your location. Please check permissions.");
//         },
//         {
//           enableHighAccuracy: true,
//           timeout: 15000,
//           maximumAge: 300000,
//         }
//       );
//     } else {
//       setLoading(false);
//       toast.error("Geolocation is not supported by your browser");
//     }
//   };

//   const handleInputChange = (e) => {
//     const value = e.target.value;
//     setQuery(value);
//     debounceRef.current(value);
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     if (name.startsWith("prohibitedAds")) {
//       const field = name.split(".")[1];
//       setFormData((prev) => ({
//         ...prev,
//         prohibitedAds: {
//           ...prev.prohibitedAds,
//           [field]: type === "checkbox" ? checked : String(value),
//         },
//       }));
//     } else if (type === "checkbox" && name === "availability") {
//       setFormData((prev) => {
//         const updatedAvailability = checked
//           ? [...prev.availability, value]
//           : prev.availability.filter((item) => item !== value);
//         return { ...prev, availability: updatedAvailability };
//       });
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: String(value) }));
//     }

//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: "" }));
//     }
//   };

//   const handleCountryChange = (country) => {
//     setSelectedCountry(country);
//     setFormData({
//       ...formData,
//       country: country.name,
//       state: "",
//       city: "",
//       zipCodes: [],
//       locations: [],
//     });
//     setSelectedState("");
//     setZipCodes([]);
//     setQuery("");
//     setLocations([]);
//   };

//   const handleStateChange = (state) => {
//     setSelectedState(state);
//     setFormData({
//       ...formData,
//       state: state.name,
//       city: "",
//       zipCodes: [],
//       locations: [],
//     });
//     setZipCodes([]);
//     setQuery("");
//     setLocations([]);
//   };

//   const removeLocation = (index) => {
//     const newZipCodes = [...zipCodes];
//     const newLocations = [...locations];
//     newZipCodes.splice(index, 1);
//     newLocations.splice(index, 1);
//     setZipCodes(newZipCodes);
//     setLocations(newLocations);
//     setFormData((prev) => ({
//       ...prev,
//       zipCodes: newZipCodes,
//       locations: newLocations.map((loc) => ({
//         name: loc.name || "",
//         zip: loc.zip || "",
//         location: loc.location,
//       })),
//     }));
//   };

//   const markers = useMemo(() => {
//     return locations.map((loc, index) => ({
//       position: { lat: loc.lat, lng: loc.lng },
//       label: (index + 1).toString(),
//     }));
//   }, [locations]);

//   const onMapLoad = (map) => {
//     mapRef.current = map;
//     setMapLoaded(true);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setHasSubmitted(true);

//     if (!validateForm()) {
//       setHasSubmitted(false);
//       return;
//     }

//     if (locations.length === 0) {
//       toast.error("Please add at least one location");
//       setHasSubmitted(false);
//       return;
//     }

//     if (!user || !user._id) {
//       toast.error("User not authenticated. Please login again.");
//       setHasSubmitted(false);
//       return;
//     }

//     if (!formData.startTime || !formData.endTime) {
//       toast.error("Please select both start and end times");
//       setHasSubmitted(false);
//       return;
//     }

//     const startDate = new Date(formData.startTime);
//     const endDate = new Date(formData.endTime);
//     const startTimeISO = startDate.toISOString();
//     const endTimeISO = endDate.toISOString();

//     if (startDate >= endDate) {
//       toast.error("End time must be after start time");
//       setHasSubmitted(false);
//       return;
//     }

//     const formDataWithDates = {
//       ...formData,
//       startTime: startTimeISO,
//       endTime: endTimeISO,
//     };

//     const formDataToSend = new FormData();

//     let images = formData.images;

//     if (images.length > 0 && typeof images[0] === "string") {
//       try {
//         images = await Promise.all(
//           images.map(async (url) => {
//             const response = await fetch(url);
//             if (!response.ok) throw new Error("Failed to fetch image");
//             const blob = await response.blob();
//             const filename = url.split("/").pop() || "image.png";
//             return new File([blob], filename, { type: blob.type });
//           })
//         );
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to load vehicle images for submission");
//         setHasSubmitted(false);
//         return;
//       }
//     }

//     formDataToSend.append("fleetOwner", user._id);
//     formDataToSend.append(
//       "yearofmanufacturer",
//       String(formDataWithDates.yearOfManufacture)
//     );

//     const sanitizedLocations = locations.map((loc) => ({
//       name: loc.name || "",
//       zip: loc.zip || "",
//       location: {
//         type: "Point",
//         coordinates: [loc.lng || 0, loc.lat || 0],
//       },
//     }));
//     formDataToSend.append("locations", JSON.stringify(sanitizedLocations));
//     formDataToSend.append("zipCodes", JSON.stringify(zipCodes));
//     if (locations[0]) {
//       formDataToSend.append("latitude", String(locations[0].lat || ""));
//       formDataToSend.append("longitude", String(locations[0].lng || ""));
//       formDataToSend.append("locationName", locations[0].name || "");
//       formDataToSend.append("zipCode", locations[0].zip || "");
//     }

//     if (formData.routeFrom && formData.routeTo) {
//       formDataToSend.append(
//         "interRoutes",
//         JSON.stringify([
//           {
//             from: String(formData.routeFrom),
//             to: String(formData.routeTo),
//           },
//         ])
//       );
//     } else {
//       formDataToSend.append("interRoutes", JSON.stringify([]));
//     }

//     Object.entries(formDataWithDates).forEach(([key, value]) => {
//       if (key === "images") {
//         images.forEach((file) => formDataToSend.append("images", file));
//       } else if (key === "prohibitedAds" || key === "availability") {
//         formDataToSend.append(key, JSON.stringify(value));
//       } else if (
//         key !== "locations" &&
//         key !== "zipCodes" &&
//         key !== "routeFrom" &&
//         key !== "routeTo"
//       ) {
//         formDataToSend.append(key, String(value));
//       }
//     });

//     formDataToSend.append("user", user._id);

//
//     for (let pair of formDataToSend.entries()) {
//
//     }

//     try {
//       await dispatch(addfleetauctiondata(formDataToSend)).unwrap();
//       toast.success("Form submitted successfully!");
//       navigate("/user-profile/manage-fleetauction");
//       resetForm();
//     } catch (error) {
//       toast.error(error.message || "Failed to submit form");
//       setHasSubmitted(false);
//     }
//   };

//   if (!user) {
//     return (
//       <div className="p-6 max-w-4xl mx-auto text-center">
//         <p className="text-red-500">Please login to access this form.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-6xl mx-auto bg-theme-bg rounded-lg shadow-md text-white">
//       <h2 className="text-2xl font-bold mb-6 text-white-800">
//         Fleet Owner Form
//       </h2>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//           <div className="lg:col-span-4 mb-6 lg:mb-0">
//             <div className="bg-theme-bg2 p-4 rounded-lg h-full">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Vehicle Images
//               </h3>
//               {imgUrls.length > 0 ? (
//                 <div className="space-y-4">
//                   <div className="relative w-full h-80 rounded-lg border-2 border-solid p-2 overflow-hidden">
//                     <div className="flex flex-col space-y-4 h-full overflow-y-auto">
//                       {imgUrls.map((url, index) => (
//                         <div
//                           key={index}
//                           className="relative w-full h-64 flex-shrink-0"
//                         >
//                           <img
//                             src={url}
//                             alt={`vehicle ${index}`}
//                             className="w-full h-full object-contain"
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="w-full h-80 bg-theme-bg rounded-xl border-2 border-dashed border-border-info-color flex items-center justify-center">
//                   <div className="text-center flex flex-col items-center gap-2 text-white">
//                     <p>No images available for selected vehicle</p>
//                   </div>
//                 </div>
//               )}

//               <div className="bg-theme-bg2 p-4 rounded-lg mt-6">
//                 <h3 className="text-lg font-semibold mb-4 text-white-700">
//                   Route Map
//                 </h3>
//                 {googleMapsApiKey ? (
//                   <LoadScript
//                     googleMapsApiKey={googleMapsApiKey}
//                     onLoad={() => setMapLoaded(true)}
//                     onError={(error) => {
//                       console.error("Google Maps failed to load:", error);
//                       toast.error("Failed to load Google Maps");
//                     }}
//                   >
//                     <GoogleMap
//                       mapContainerStyle={containerStyle}
//                       center={defaultCenter}
//                       zoom={5}
//                       onLoad={onMapLoad}
//                       options={{
//                         zoomControl: true,
//                         streetViewControl: false,
//                         mapTypeControl: false,
//                         fullscreenControl: false,
//                       }}
//                     >
//                       {markers.map((marker, index) => (
//                         <Marker
//                           key={index}
//                           position={marker.position}
//                           label={marker.label}
//                         />
//                       ))}
//                     </GoogleMap>
//                   </LoadScript>
//                 ) : (
//                   <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
//                     <div className="text-center text-gray-600">
//                       <p className="mb-2">Google Maps not available</p>
//                       <p className="text-sm">API key not configured</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="lg:col-span-8 space-y-6">
//             <div className="bg-theme-bg2 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Basic Information
//               </h3>
//               <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Company Name*
//                   </label>
//                   <input
//                     name="company"
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                       errors.company ? "border-red-500" : "border-gray-300"
//                     }`}
//                     value={formData.company}
//                     onChange={handleChange}
//                     readOnly
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Account Number*
//                   </label>
//                   <input
//                     name="accountNumber"
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                       errors.accountNumber ? "border-red-500" : "border-gray-300"
//                     }`}
//                     value={formData.accountNumber}
//                     onChange={handleChange}
//                     readOnly
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Suburb
//                   </label>
//                   <input
//                     name="suburb"
//                     className="w-full px-3 py-2 bg-theme-bg border border-gray-300 rounded-md"
//                     value={formData.suburb}
//                     onChange={handleChange}
//                     readOnly
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-theme-bg2 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Location Information
//               </h3>
//               <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Country*
//                   </label>
//                   <CountrySelect
//                     placeHolder="Select Country"
//                     value={selectedCountry}
//                     required
//                     onChange={handleCountryChange}
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                       errors.country ? "border-red-500" : "border-gray-300"
//                     }`}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     State*
//                   </label>
//                   <StateSelect
//                     countryid={selectedCountry?.id}
//                     value={selectedState}
//                     required
//                     onChange={handleStateChange}
//                     placeHolder="Select State"
//                     className={`w-full px-3 py-2 border rounded-md bg-white ${
//                       errors.state ? "border-red-500" : "border-gray-300"
//                     }`}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     City*
//                   </label>
//                   <CitySelect
//                     countryid={selectedCountry?.id}
//                     stateid={selectedState?.id}
//                     value={{ name: formData.city }}
//                     onChange={(city) => setFormData({ ...formData, city: city.name })}
//                     placeHolder="Select City"
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                       errors.city ? "border-red-500" : "border-gray-300"
//                     }`}
//                   />
//                 </div>
//                 <div className="relative md:col-span-3">
//                   <label
//                     htmlFor="zipCodes"
//                     className="block text-sm font-medium text-white-700 mb-1"
//                   >
//                     Campaign Post / Zip Codes (separated by commas)*
//                   </label>
//                   <input
//                     type="text"
//                     id="zipCodes"
//                     readOnly
//                     value={zipCodes.join(", ")}
//                     onChange={handleZipCodesChange}
//                     placeholder="Enter zip codes separated by commas (e.g., 400001, 400002)"
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md `}
//                   />
//                 </div>
//                 <div className="relative">
//                   <label
//                     htmlFor="locationSearch"
//                     className="block text-sm font-medium text-white-700 mb-1"
//                   >
//                     Search Location to Add
//                   </label>
//                   <div className="relative w-full">
//                     <input
//                       type="text"
//                       id="locationSearch"
//                       value={query}

//                       onChange={handleInputChange}
//                       placeholder="Search for a location to add to route"
//                       className="search-input w-full bg-theme-bg border rounded-md px-4 py-2"
//                     />
//                     <BiCurrentLocation
//                       size={24}
//                       className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600 hover:text-white"
//                       onClick={getCurrentLocation}
//                       aria-label="Get current location"
//                       tabIndex={0}
//                     />
//                     {loading && (
//                       <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
//                     )}
//                     {suggestions.length > 0 && (
//                       <ul className="absolute top-full left-0 w-full z-50 rounded-md border border-gray-300 bg-[rgb(7, 27, 54)] text-sm shadow-lg max-h-48 overflow-y-auto mt-1">
//                         {suggestions.map((suggestion, index) => (
//                           <li
//                             key={index}
//                             onClick={() => handleLocationSelect(suggestion)}
//                             className="cursor-pointer p-2 hover:bg-gray-200 hover:text-black"
//                           >
//                             {suggestion.display_name}
//                           </li>
//                         ))}
//                       </ul>
//                     )}
//                   </div>
//                 </div>
//                 {locations.length > 0 && (
//                   <div className="md:col-span-3">
//                     <h4 className="text-sm font-medium text-white-700 mb-2">
//                       Selected Route Locations
//                     </h4>
//                     <ul className="space-y-2">
//                       {locations.map((loc, index) => (
//                         <li
//                           key={index}
//                           className="flex items-center justify-between bg-theme-bg p-2 rounded-md"
//                         >
//                           <span>
//                             {loc.name} (Zip: {loc.zip || "N/A"})
//                           </span>
//                           <button
//                             type="button"
//                             onClick={() => removeLocation(index)}
//                             className="text-red-500 hover:text-red-700"
//                           >
//                             Remove
//                           </button>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//                 <div className="md:col-span-2 text-white">
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Interstate/Intercity Routes
//                   </label>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs text-white-500 mb-1">
//                         From
//                       </label>
//                       <input
//                         name="routeFrom"
//                         className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                         value={formData.routeFrom}
//                         required
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs text-white-500 mb-1">
//                         To
//                       </label>
//                       <input
//                         name="routeTo"
//                         required
//                         className="w-full px-3 py-2 bg-theme-bg2 border border-gray-300 rounded-md"
//                         value={formData.routeTo}
//                         onChange={handleChange}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-theme-bg2 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Vehicle Information
//               </h3>
//               <div className="bg-theme-bg2 p-4 rounded-lg grid lg:grid-cols-2 gap-4 mlg:grid-cols-1">
//                 <div className="grid">
//                   <label htmlFor="startTime">Auction Start Time*</label>
//                   <input
//                     required
//                     id="startTime"
//                     type="datetime-local"
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                       errors.startTime ? "border-red-500" : "border-gray-300"
//                     }`}
//                     onChange={(e) =>
//                       setFormData({ ...formData, startTime: e.target.value })
//                     }
//                     value={formData.startTime}
//                   />
//                 </div>
//                 <div className="grid">
//                   <label htmlFor="endTime">Auction End Time*</label>
//                   <input
//                     required
//                     id="endTime"
//                     type="datetime-local"
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                       errors.endTime ? "border-red-500" : "border-gray-300"
//                     }`}
//                     onChange={(e) =>
//                       setFormData({ ...formData, endTime: e.target.value })
//                     }
//                     value={formData.endTime}
//                   />
//                 </div>
//               </div>
//               <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Vehicle Type*
//                   </label>
//                   <select
//                     name="model"
//                     required
//                     onChange={handleVehicleChange}
//                     value={formData.model}
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                       errors.model ? "border-red-500" : "border-gray-300"
//                     }`}
//                   >
//                     <option value="">Select a Vehicle</option>
//                     {[...new Set(vehicles.map((v) => v.vehicle))].map((vehicle) => (
//                       <option key={vehicle} value={vehicle}>
//                         {vehicle}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 {formData.model && (
//                   <div>
//                     <label className="block text-sm font-medium text-white-700 mb-1">
//                       Manufacturer*
//                     </label>
//                     <select
//                       name="manufacturer"
//                       required
//                       onChange={handleChange}
//                       value={formData.manufacturer}
//                       className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                         errors.manufacturer ? "border-red-500" : "border-gray-300"
//                       }`}
//                     >
//                       <option value="">Select Manufacturer</option>
//                       {[
//                         ...new Set(
//                           vehicles
//                             .filter((v) => v.vehicle === formData.model)
//                             .map((v) => v.manufacturer)
//                         ),
//                       ].map((manufacturer) => (
//                         <option key={manufacturer} value={manufacturer}>
//                           {manufacturer}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}
//                 {formData.model && formData.manufacturer && (
//                   <div>
//                     <label className="block text-sm font-medium text-white-700 mb-1">
//                       Year of Manufacture*
//                     </label>
//                     <select
//                       name="yearOfManufacture"
//                       required
//                       onChange={handleChange}
//                       value={formData.yearOfManufacture}
//                       className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                         errors.yearOfManufacture ? "border-red-500" : "border-gray-300"
//                       }`}
//                     >
//                       <option value="">Select Year</option>
//                       {[
//                         ...new Set(
//                           vehicles
//                             .filter(
//                               (v) =>
//                                 v.vehicle === formData.model &&
//                                 v.manufacturer === formData.manufacturer
//                             )
//                             .map((v) => v.yearOfManufacture)
//                         ),
//                       ].map((year) => (
//                         <option key={year} value={year}>
//                           {year}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}
//               </div>
//               <br />
//       <div className="mb-6">
//   <label className="block text-sm font-medium text-white mb-2">
//     Vehicle Availability <span className="text-red-500">*</span>
//   </label>
//   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//     {["3 Months", "6 Months", "12 Months", "24 Months"].map((val) => (
//       <label
//         key={val}
//         className={`flex items-center justify-center cursor-pointer border rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200
//           ${
//             formData.availability === val
//               ? "bg-blue-600 text-white border-blue-600 shadow-md"
//               : "bg-theme-bg2 text-white border-gray-600 hover:bg-gray-700 hover:border-gray-500"
//           }`}
//       >
//         <input
//           type="radio"
//           name="availability"
//           value={val}
//           checked={formData.availability === val}
//           onChange={handleChange}
//           className="hidden"
//         />
//         {val}
//       </label>
//     ))}
//   </div>
//   <input
//     type="hidden"
//     name="availabilityRequired"
//     required
//     value={formData.availability ? "valid" : ""}
//   />
//   {errors.availability && (
//     <p className="text-red-500 text-sm mt-1">{errors.availability}</p>
//   )}
// </div>

//             </div>

//           </div>
//         </div>
//            <div className="bg-theme-bg2 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Pricing Information
//               </h3>
//               <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
//                 <div className="bg-theme-bg p-4 rounded-md border border-gray-200">
//                   <h4 className="font-medium text-white-700 mb-3">
//                     Auction Rates (per sqm)
//                   </h4>
//                   <div className="space-y-3">
//                     <div>
//                       <label className="block text-sm text-white-600 mb-1">
//                         Full Wrap
//                       </label>
//                       <input
//                         name="auctionRateFullWrap"
//                         type="number"
//                         required
//                         className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                         value={formData.auctionRateFullWrap}
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm text-white-600 mb-1">
//                         One Side
//                       </label>
//                       <input
//                         name="auctionRateOneSide"
//                         type="number"
//                         required
//                         className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                         value={formData.auctionRateOneSide}
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm text-white-600 mb-1">
//                         Both Sides
//                       </label>
//                       <input
//                         name="auctionRateBothSides"
//                         type="number"
//                         required
//                         className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                         value={formData.auctionRateBothSides}
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm text-white-600 mb-1">
//                         Rear Doors
//                       </label>
//                       <input
//                         name="auctionRateRearDoors"
//                         type="number"
//                         required
//                         className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                         value={formData.auctionRateRearDoors}
//                         onChange={handleChange}
//                       />
//                     </div>
//                   </div>
//                 </div>
//                 <div className="bg-theme-bg p-4 rounded-md border border-gray-200">
//                   <h4 className="font-medium text-white-700 mb-3">
//                     Buy Now Rates (per sqm)
//                   </h4>
//                   <div className="space-y-3">
//                     <div>
//                       <label className="block text-sm text-white-600 mb-1">
//                         Full Wrap
//                       </label>
//                       <input
//                         name="buyNowRateFullWrap"
//                         type="number"
//                         required
//                         className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                         value={formData.buyNowRateFullWrap}
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm text-white-600 mb-1">
//                         One Side
//                       </label>
//                       <input
//                         name="buyNowRateOneSide"
//                         type="number"
//                         required
//                         className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                         value={formData.buyNowRateOneSide}
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm text-white-600 mb-1">
//                         Both Sides
//                       </label>
//                       <input
//                         name="buyNowRateBothSides"
//                         type="number"
//                         required
//                         className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                         value={formData.buyNowRateBothSides}
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm text-white-600 mb-1">
//                         Rear Doors
//                       </label>
//                       <input
//                         name="buyNowRateRearDoors"
//                         type="number"
//                         required
//                         className="w-full px-3 py-2 bg-theme-bg2 border border-gray-300 rounded-md"
//                         value={formData.buyNowRateRearDoors}
//                         onChange={handleChange}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="mt-4 bg-theme-bg2 p-4 rounded-md border border-gray-200">
//                 <h4 className="font-medium text-white-700 mb-3">
//                   Discounts for Longer Campaigns (%)
//                 </h4>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div>
//                     <label className="block text-sm text-white-600 mb-1">
//                       3 Month
//                     </label>
//                     <input
//                       name="discount3Month"
//                       type="number"
//                       className="w-full px-3 py-2 bg-theme-bg2 border border-gray-300 rounded-md"
//                       value={formData.discount3Month}
//                       onChange={handleChange}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm text-white-600 mb-1">
//                       6 Month
//                     </label>
//                     <input
//                       name="discount6Month"
//                       type="number"
//                       className="w-full px-3 py-2 bg-theme-bg2 border border-gray-300 rounded-md"
//                       value={formData.discount6Month}
//                       onChange={handleChange}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm text-white-600 mb-1">
//                       12 Month
//                     </label>
//                     <input
//                       name="discount12Month"
//                       type="number"
//                       className="w-full px-3 py-2 bg-theme-bg2 border border-gray-300 rounded-md"
//                       value={formData.discount12Month}
//                       onChange={handleChange}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm text-white-600 mb-1">
//                       24 Month
//                     </label>
//                     <input
//                       name="discount24Month"
//                       type="number"
//                       className="w-full px-3 py-2 bg-theme-bg2 border border-gray-300 rounded-md"
//                       value={formData.discount24Month}
//                       onChange={handleChange}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="md:col-span-2 bg-theme-bg2 p-6 rounded-xl shadow-md">
//               <h3 className="text-lg font-semibold mb-4 text-white">
//                 Prohibited Ads <span className="text-red-500">*</span>
//               </h3>
//               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//                 {[
//                   { name: "gambling", label: "Gambling" },
//                   { name: "alcohol", label: "Alcohol" },
//                   { name: "smoking", label: "Smoking" },
//                 ].map((item) => (
//                   <label
//                     key={item.name}
//                     className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-md text-white hover:bg-white/20 transition"
//                   >
//                     <input
//                       type="checkbox"
//                       name={`prohibitedAds.${item.name}`}
//                       checked={formData.prohibitedAds[item.name]}
//                       onChange={handleChange}
//                       className="h-4 w-4 accent-blue-500"
//                     />
//                     <span className="text-sm">{item.label}</span>
//                   </label>
//                 ))}
//                 <div className="col-span-2 sm:col-span-1 lg:col-span-2">
//                   <label className="flex items-start gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-md text-white hover:bg-white/20 transition">
//                     <input
//                       type="checkbox"
//                       name="prohibitedAds.other"
//                       checked={formData.prohibitedAds.other}
//                       onChange={handleChange}
//                       className="h-4 w-4 mt-1 accent-blue-500"
//                     />
//                     <div className="flex-1">
//                       <span className="text-sm">Other</span>
//                       {formData.prohibitedAds.other && (
//                         <div className="mt-2">
//                           <input
//                             type="text"
//                             name="prohibitedAds.otherSpecify"
//                             placeholder="Please specify"
//                             className={`w-full px-3 py-2 rounded-md text-sm text-black bg-white border ${
//                               errors.prohibitedAdsOther ? "border-red-500" : "border-gray-300"
//                             }`}
//                             value={formData.prohibitedAds.otherSpecify}
//                             onChange={handleChange}
//                           />
//                         </div>
//                       )}
//                     </div>
//                   </label>
//                 </div>
//               </div>
//             </div>

//             <div className="md:col-span-2 flex justify-end">
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
//                   isLoading ? "opacity-50 cursor-not-allowed" : ""
//                 }`}
//               >
//                 {isLoading ? (
//                   <>
//                     <svg
//                       className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                       ></path>
//                     </svg>
//                     Submitting...
//                   </>
//                 ) : (
//                   "Submit Form"
//                 )}
//               </button>
//             </div>
//       </form>
//     </div>
//   );
// };

// export default FleetOwnerForm;

// import React, {
//   useState,
//   useEffect,
//   useRef,
//   useMemo,
//   useCallback,
// } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   addfleetauctiondata,
//   resetFleetOwner,
// } from "../store/fleetowner/fleetownerSlice";
// import {
//   fetchVehicles,
//   getVehicleDetails,
//   setSelectedVehicle,
// } from "../store/vehicle/vehicleSlice";
// import { toast } from "react-toastify";
// import axios from "axios";
// import {
//   CitySelect,
//   CountrySelect,
//   StateSelect,
// } from "react-country-state-city";
// import _ from "lodash";
// import { BiCurrentLocation } from "react-icons/bi";
// import { IoCloudUploadOutline } from "react-icons/io5";
// import { useNavigate } from "react-router-dom";
// import {
//   GoogleMap,
//   LoadScript,
//   Marker,
//   DirectionsService,
//   DirectionsRenderer,
// } from "@react-google-maps/api";

// const FleetOwnerForm = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { isLoading, isSuccess, isError, message } = useSelector(
//     (state) => state.fleetOwner
//   );
//   const {
//     list: vehicles,
//     selectedVehicle,
//     error,
//   } = useSelector((state) => state.vehicles || {});
//   const { user } = useSelector((state) => state.auth);
//
//   const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
//   if (!googleMapsApiKey) {
//     console.error("Google Maps API key is missing!");
//   }

//   const defaultCountry = { id: "IN", name: "India", isoCode: "IN" };
//   const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
//   const [selectedState, setSelectedState] = useState("");
//   const [query, setQuery] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [suggestions, setSuggestions] = useState([]);
//   const [imgUrls, setImgUrls] = useState([]);
//   const imgRef = useRef(null);
//   const [hasSubmitted, setHasSubmitted] = useState(false);
//   const [zipCodes, setZipCodes] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const [mapLoaded, setMapLoaded] = useState(false);
//   const [directions, setDirections] = useState(null);

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
//     estimatedDailyImpressions: "",
//     discount3Month: "10",
//     discount6Month: "15",
//     discount12Month: "25",
//     discount24Month: "",
//     manufacturer: "",
//     yearOfManufacture: "",
//     model: "",
//     availability: [],
//     prohibitedAds: {
//       gambling: false,
//       alcohol: false,
//       smoking: false,
//       other: false,
//       otherSpecify: "",
//     },
//     images: [],
//     locations: [],
//   });

//   const [errors, setErrors] = useState({});

//   const defaultCenter = { lat: 8.811927, lng: 83.5581972 };

//   const containerStyle = {
//     width: "100%",
//     height: "400px",
//   };

//   useEffect(() => {
//     dispatch(fetchVehicles());
//   }, [dispatch]);

//   useEffect(() => {
//     if (user) {
//       setFormData((prev) => ({
//         ...prev,
//         company: user.company || "",
//         accountNumber: user.stripeAccountId || user.accountNumber || "",
//         suburb: user.suburb || "",
//         city: user.city || "",
//         state: user.state || "",
//         country: user.country || "",
//         zipCodes: user.postalCode ? [user.postalCode] : prev.zipCodes,
//         locations: user.location?.coordinates
//           ? [
//               {
//                 name: user.location.name || "",
//                 zip: user.location.zip || "",
//                 location: {
//                   type: "Point",
//                   coordinates: user.location.coordinates,
//                 },
//               },
//             ]
//           : prev.locations,
//       }));

//       if (user.location?.coordinates) {
//         setLocations([
//           {
//             lat: user.location.coordinates[1],
//             lng: user.location.coordinates[0],
//             name: user.location.name || "",
//             zip: user.location.zip || "",
//             location: {
//               type: "Point",
//               coordinates: user.location.coordinates,
//             },
//           },
//         ]);
//       }

//       setSelectedCountry({
//         id: user.countryCode || defaultCountry.id,
//         name: user.country || defaultCountry.name,
//         isoCode: user.countryCode?.toUpperCase() || defaultCountry.isoCode,
//       });

//       if (user.state) {
//         setSelectedState({ id: user.stateId || "", name: user.state });
//       }
//     }
//   }, [user]);

//   const geocodeAddress = async (address) => {
//     if (!googleMapsApiKey) {
//       toast.error("Google Maps API key is not configured");
//       return null;
//     }

//     try {
//       const response = await axios.get(
//         `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//           address
//         )}&key=${googleMapsApiKey}`
//       );

//       if (response.data.status === "OK" && response.data.results[0]) {
//         const result = response.data.results[0];
//         const { lat, lng } = result.geometry.location;
//         const postalCode =
//           result.address_components.find((component) =>
//             component.types.includes("postal_code")
//           )?.long_name || "";

//         return {
//           lat,
//           lng,
//           formattedAddress: result.formatted_address,
//           postalCode,
//           geoJson: {
//             type: "Point",
//             coordinates: [lng, lat],
//           },
//         };
//       } else {
//         console.error(
//           "Geocoding failed:",
//           response.data.status,
//           response.data.error_message
//         );
//         return null;
//       }
//     } catch (error) {
//       console.error("Geocoding error:", error);
//       return null;
//     }
//   };

//   const handleZipCodesChange = async (e) => {
//     const input = e.target.value;
//     try {
//       const zipArray = input
//         .split(",")
//         .map((zip) => zip.trim())
//         .filter(Boolean);
//       setZipCodes(zipArray);

//       const invalidZips = zipArray.filter((zip) => !/^\d+$/.test(zip));
//       if (invalidZips.length > 0) {
//         setErrors((prev) => ({
//           ...prev,
//           zipCodes: `Invalid zip codes: ${invalidZips.join(", ")}`,
//         }));
//         return;
//       }

//       setErrors((prev) => ({ ...prev, zipCodes: "" }));

//       const newLocations = [];
//       for (const zip of zipArray) {
//         const locationData = await geocodeAddress(zip);
//         if (locationData) {
//           newLocations.push({
//             lat: locationData.lat,
//             lng: locationData.lng,
//             name: locationData.formattedAddress,
//             zip: locationData.postalCode,
//             location: locationData.geoJson,
//           });
//         } else {
//           setErrors((prev) => ({
//             ...prev,
//             zipCodes: `Could not find location for zip code: ${zip}`,
//           }));
//           return;
//         }
//       }

//       setLocations(newLocations);
//       setFormData((prev) => ({
//         ...prev,
//         zipCodes: zipArray,
//         locations: newLocations.map((loc) => ({
//           name: loc.name || "",
//           zip: loc.zip || "",
//           location: loc.location,
//         })),
//       }));

//       setDirections(null);
//     } catch (error) {
//       console.error("Error processing zip codes:", error);
//       setErrors((prev) => ({
//         ...prev,
//         zipCodes: "Error processing zip codes. Please try again.",
//       }));
//     }
//   };

//   const handleVehicleChange = (e) => {
//     const selectedVehicleName = e.target.value;
//     setFormData((prev) => ({
//       ...prev,
//       model: selectedVehicleName,
//       manufacturer: "",
//       yearOfManufacture: "",
//     }));
//   };

//   const handleImageUpload = (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length > 3) {
//       toast.error("Maximum 3 images allowed");
//       return;
//     }

//     const invalidFiles = files.filter((file) => file.size > 1024 * 1024);
//     if (invalidFiles.length > 0) {
//       toast.error("Each image must be less than 1MB");
//       return;
//     }

//     const validTypes = ["image/png", "image/jpg", "image/jpeg"];
//     const invalidTypes = files.filter(
//       (file) => !validTypes.includes(file.type)
//     );
//     if (invalidTypes.length > 0) {
//       toast.error("Only PNG, JPG, and JPEG files are allowed");
//       return;
//     }

//     const newImageUrls = files.map((file) => URL.createObjectURL(file));
//     setImgUrls(newImageUrls);
//     setFormData((prev) => ({ ...prev, images: files }));
//   };

//   useEffect(() => {
//     if (hasSubmitted && isSuccess) {
//       dispatch(resetFleetOwner());
//       resetForm();
//       setHasSubmitted(false);
//     }

//     if (hasSubmitted && isError) {
//       toast.error(message.data || message);
//       dispatch(resetFleetOwner());
//       setHasSubmitted(false);
//     }
//   }, [isSuccess, isError, message, dispatch, hasSubmitted]);

//   const resetForm = () => {
//     setFormData({
//       company: "",
//       accountNumber: "",
//       suburb: "",
//       city: "",
//       startTime: "",
//       endTime: "",
//       state: "",
//       country: "",
//       zipCodes: [],
//       routeFrom: "",
//       routeTo: "",
//       auctionRateFullWrap: "",
//       auctionRateOneSide: "",
//       auctionRateBothSides: "",
//       auctionRateRearDoors: "",
//       buyNowRateFullWrap: "",
//       buyNowRateOneSide: "",
//       buyNowRateBothSides: "",
//       buyNowRateRearDoors: "",
//       discount3Month: "10",
//       discount6Month: "15",
//       discount12Month: "25",
//       discount24Month: "",
//       manufacturer: "",
//       model: "",
//       availability: [],
//       estimatedDailyImpressions: "",
//       prohibitedAds: {
//         gambling: false,
//         alcohol: false,
//         smoking: false,
//         other: false,
//         otherSpecify: "",
//       },
//       images: [],
//       locations: [],
//     });
//     setImgUrls([]);
//     setErrors({});
//     setZipCodes([]);
//     setQuery("");
//     setLocations([]);
//     setDirections(null);
//     if (imgRef.current) {
//       imgRef.current.value = "";
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.company.trim()) newErrors.company = "Company is required";
//     if (!formData.accountNumber.trim())
//       newErrors.accountNumber = "Account Number is required";
//     // if (!formData.city.trim()) newErrors.city = "City is required";
//     // if (!formData.state.trim()) newErrors.state = "State is required";
//     if (!formData.country.trim()) newErrors.country = "Country is required";

//     if (!formData.manufacturer)
//       newErrors.manufacturer = "Manufacturer is required";
//     if (!formData.model) newErrors.model = "Model is required";
//     if (!formData.yearOfManufacture)
//       newErrors.yearOfManufacture = "Year is required";

//     if (zipCodes.length === 0) {
//       newErrors.zipCodes = "At least one zip code is required";
//     } else if (zipCodes.length < 2) {
//       newErrors.zipCodes = "At least two zip codes are required for a route";
//     }

//     if (formData.availability.length === 0) {
//       newErrors.availability = "Select at least one availability option";
//     }
//     if (!formData.estimatedDailyImpressions) {
//       newErrors.estimatedDailyImpressions = "Estimated impressions is required";
//     }
//     if (!formData.images || formData.images.length === 0) {
//       newErrors.images = "At least one image is required";
//     }

//     const numericFields = [
//       "auctionRateFullWrap",
//       "auctionRateOneSide",
//       "auctionRateBothSides",
//       "auctionRateRearDoors",
//       "buyNowRateFullWrap",
//       "buyNowRateOneSide",
//       "buyNowRateBothSides",
//       "buyNowRateRearDoors",
//       "discount3Month",
//       "discount6Month",
//       "discount12Month",
//       "discount24Month",
//     ];

//     numericFields.forEach((field) => {
//       if (formData[field] && isNaN(formData[field])) {
//         newErrors[field] = "Must be a number";
//       }
//     });

//     if (
//       formData.prohibitedAds.other &&
//       !formData.prohibitedAds.otherSpecify.trim()
//     ) {
//       newErrors.prohibitedAdsOther = "Please specify prohibited ads";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const debounceRef = useRef(
//     _.debounce(async (query) => {
//       if (!query || query.length < 3) {
//         setSuggestions([]);
//         return;
//       }

//       try {
//         const response = await axios.get(
//           `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
//             query
//           )}&format=json&addressdetails=1&limit=5&countrycodes=${selectedCountry.isoCode.toLowerCase()}`
//         );
//         setSuggestions(response.data);
//       } catch (error) {
//         console.error("Error fetching location suggestions:", error);
//         toast.error("Failed to fetch location suggestions");
//       }
//     }, 800)
//   );

//   const handleLocationSelect = async (location) => {
//     const zip = location.address?.postcode || "";
//     setQuery(location.display_name);
//     const newZipCodes = [...new Set([...zipCodes, zip])].filter(Boolean); // Prevent duplicates
//     setZipCodes(newZipCodes);

//     const newLocation = {
//       lat: parseFloat(location.lat),
//       lng: parseFloat(location.lon),
//       name: location.display_name || "",
//       zip: zip || "",
//       location: {
//         type: "Point",
//         coordinates: [parseFloat(location.lon), parseFloat(location.lat)],
//       },
//     };

//     const updatedLocations = [...locations, newLocation];
//     setLocations(updatedLocations);
//     setFormData((prev) => ({
//       ...prev,
//       zipCodes: newZipCodes,
//       locations: updatedLocations.map((loc) => ({
//         name: loc.name || "",
//         zip: loc.zip || "",
//         location: loc.location,
//       })),
//     }));
//     setSuggestions([]);
//     setQuery("");
//   };

//   const getCurrentLocation = async () => {
//     setLoading(true);
//     if ("geolocation" in navigator) {
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           const { latitude, longitude } = position.coords;
//           try {
//             const response = await axios.get(
//               `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
//             );
//             const data = response.data;
//             const zip = data.address?.postcode || "";

//             const newLocation = {
//               lat: latitude,
//               lng: longitude,
//               name: data.display_name || "",
//               zip: zip || "",
//               location: {
//                 type: "Point",
//                 coordinates: [longitude, latitude],
//               },
//             };

//             const updatedLocations = [...locations, newLocation];
//             setLocations(updatedLocations);
//             setZipCodes([...new Set([...zipCodes, zip])].filter(Boolean));
//             setFormData((prev) => ({
//               ...prev,
//               zipCodes: [...new Set([...zipCodes, zip])].filter(Boolean),
//               locations: updatedLocations.map((loc) => ({
//                 name: loc.name || "",
//                 zip: loc.zip || "",
//                 location: loc.location,
//               })),
//             }));
//             setQuery("");
//             setLoading(false);
//           } catch (error) {
//             setLoading(false);
//             console.error("Error fetching current location:", error);
//             toast.error("Failed to fetch current location");
//           }
//         },
//         (error) => {
//           setLoading(false);
//           console.error("Geolocation error:", error);
//           toast.error(
//             "Unable to access your location. Please check permissions."
//           );
//         },
//         {
//           enableHighAccuracy: true,
//           timeout: 15000,
//           maximumAge: 300000,
//         }
//       );
//     } else {
//       setLoading(false);
//       toast.error("Geolocation is not supported by your browser");
//     }
//   };

//   const handleInputChange = (e) => {
//     const value = e.target.value;
//     setQuery(value);
//     debounceRef.current(value);
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     if (name.startsWith("prohibitedAds")) {
//       const field = name.split(".")[1];
//       setFormData((prev) => ({
//         ...prev,
//         prohibitedAds: {
//           ...prev.prohibitedAds,
//           [field]: type === "checkbox" ? checked : String(value),
//         },
//       }));
//     } else if (type === "checkbox" && name === "availability") {
//       setFormData((prev) => {
//         const updatedAvailability = checked
//           ? [...prev.availability, value]
//           : prev.availability.filter((item) => item !== value);
//         return { ...prev, availability: updatedAvailability };
//       });
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: String(value) }));
//     }

//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: "" }));
//     }
//   };

//   const handleCountryChange = (country) => {
//     setSelectedCountry(country);
//     setFormData({
//       ...formData,
//       country: country.name,
//       state: "",
//       city: "",
//       zipCodes: [],
//       locations: [],
//     });
//     setSelectedState("");
//     setZipCodes([]);
//     setQuery("");
//     setLocations([]);
//     setDirections(null);
//   };

//   const handleStateChange = (state) => {
//     setSelectedState(state);
//     setFormData({
//       ...formData,
//       state: state.name,
//       city: "",
//       zipCodes: [],
//       locations: [],
//     });
//     setZipCodes([]);
//     setQuery("");
//     setLocations([]);
//     setDirections(null);
//   };

//   const removeImage = (index) => {
//     const newImages = [...formData.images];
//     const newImgUrls = [...imgUrls];
//     URL.revokeObjectURL(newImgUrls[index]);
//     newImages.splice(index, 1);
//     newImgUrls.splice(index, 1);
//     setFormData((prev) => ({ ...prev, images: newImages }));
//     setImgUrls(newImgUrls);
//     if (newImages.length === 0 && imgRef.current) {
//       imgRef.current.value = "";
//     }
//   };

//   const removeLocation = (index) => {
//     const newZipCodes = [...zipCodes];
//     const newLocations = [...locations];
//     newZipCodes.splice(index, 1);
//     newLocations.splice(index, 1);
//     setZipCodes(newZipCodes);
//     setLocations(newLocations);
//     setFormData((prev) => ({
//       ...prev,
//       zipCodes: newZipCodes,
//       locations: newLocations.map((loc) => ({
//         name: loc.name || "",
//         zip: loc.zip || "",
//         location: loc.location,
//       })),
//     }));
//     setDirections(null);
//   };
//   const directionsServiceOptions = useMemo(() => {
//     if (locations.length < 2) return null;

//     return {
//       destination: locations[locations.length - 1],
//       origin: locations[0],
//       waypoints: locations.slice(1, -1).map((loc) => ({
//         location: { lat: loc.lat, lng: loc.lng },
//         stopover: true,
//       })),
//       travelMode: "DRIVING",
//     };
//   }, [locations]);

//   const directionsRendererOptions = useMemo(() => {
//     if (!directions) return null;
//     return { directions };
//   }, [directions]);

//   // Memoize the map center
//   const mapCenter = useMemo(() => {
//     return locations.length > 0 ? locations[0] : defaultCenter;
//   }, [locations]);

//   // Memoize the markers
//   const markers = useMemo(() => {
//     return locations.map((loc, index) => ({
//       position: { lat: loc.lat, lng: loc.lng },
//       label: (index + 1).toString(),
//     }));
//   }, [locations]);
//   const directionsCallback = useCallback((response) => {
//     if (response !== null && response.status === "OK") {
//       setDirections(response);
//     } else {
//       console.error("Directions request failed:", response?.status);
//       toast.error(
//         "Failed to calculate route. Please check the entered zip codes."
//       );
//     }
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setHasSubmitted(true);

//     if (!validateForm()) {
//       setHasSubmitted(false);
//       return;
//     }

//     if (locations.length === 0) {
//       toast.error("Please add at least one location");
//       setHasSubmitted(false);
//       return;
//     }

//     if (!user || !user._id) {
//       toast.error("User not authenticated. Please login again.");
//       setHasSubmitted(false);
//       return;
//     }

//     if (!formData.startTime || !formData.endTime) {
//       toast.error("Please select both start and end times");
//       setHasSubmitted(false);
//       return;
//     }

//     const startDate = new Date(formData.startTime);
//     const endDate = new Date(formData.endTime);
//     const startTimeISO = startDate.toISOString();
//     const endTimeISO = endDate.toISOString();

//     if (startDate >= endDate) {
//       toast.error("End time must be after start time");
//       setHasSubmitted(false);
//       return;
//     }

//     const formDataWithDates = {
//       ...formData,
//       startTime: startTimeISO,
//       endTime: endTimeISO,
//     };

//     const formDataToSend = new FormData();

//     // Append fixed fields
//     formDataToSend.append("fleetOwner", user._id);
//     formDataToSend.append(
//       "yearofmanufacturer",
//       String(formDataWithDates.yearOfManufacture)
//     );
//     formDataToSend.append(
//       "estimatedDailyImpressions",
//       String(formData.estimatedDailyImpressions)
//     );

//     // Append locations and zipCodes
//     const sanitizedLocations = locations.map((loc) => ({
//       name: loc.name || "",
//       zip: loc.zip || "",
//       location: {
//         type: "Point",
//         coordinates: [loc.lng || 0, loc.lat || 0],
//       },
//     }));
//     formDataToSend.append("locations", JSON.stringify(sanitizedLocations));
//     formDataToSend.append("zipCodes", JSON.stringify(zipCodes));
//     if (locations[0]) {
//       formDataToSend.append("latitude", String(locations[0].lat || ""));
//       formDataToSend.append("longitude", String(locations[0].lng || ""));
//       formDataToSend.append("locationName", locations[0].name || "");
//       formDataToSend.append("zipCode", locations[0].zip || "");
//     }

//     // Append interRoutes as an array of objects
//     if (formData.routeFrom && formData.routeTo) {
//       formDataToSend.append(
//         "interRoutes",
//         JSON.stringify([
//           {
//             from: String(formData.routeFrom),
//             to: String(formData.routeTo),
//           },
//         ])
//       );
//     } else {
//       formDataToSend.append("interRoutes", JSON.stringify([]));
//     }

//     // Append other form fields
//     Object.entries(formDataWithDates).forEach(([key, value]) => {
//       if (key === "images") {
//         value.forEach((file) => formDataToSend.append("images", file));
//       } else if (key === "prohibitedAds" || key === "availability") {
//         formDataToSend.append(key, JSON.stringify(value));
//       } else if (
//         key !== "locations" &&
//         key !== "zipCodes" &&
//         key !== "routeFrom" &&
//         key !== "routeTo"
//       ) {
//         formDataToSend.append(key, String(value));
//       }
//     });

//     formDataToSend.append("user", user._id);

//     // Log FormData for debugging

//     for (let pair of formDataToSend.entries()) {
//
//     }

//     try {
//       await dispatch(addfleetauctiondata(formDataToSend)).unwrap();
//       toast.success("Form submitted successfully!");
//       navigate("/user-profile/manage-fleetauction");
//       resetForm();
//     } catch (error) {
//       toast.error(error.message || "Failed to submit form");
//       setHasSubmitted(false);
//     }
//   };

//   const onMapLoad = (map) => {
//     setMapLoaded(true);
//   };

//   if (!user) {
//     return (
//       <div className="p-6 max-w-4xl mx-auto text-center">
//         <p className="text-red-500">Please login to access this form.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-6xl mx-auto bg-theme-bg rounded-lg shadow-md text-white">
//       <h2 className="text-2xl font-bold mb-6 text-white-800">
//         Fleet Owner Form
//       </h2>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//           <div className="lg:col-span-4 mb-6 lg:mb-0">
//             <div className="bg-theme-bg2 p-4 rounded-lg h-full">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Vehicle Images
//               </h3>
//               {imgUrls.length > 0 ? (
//                 <div className="space-y-4">
//                   <div className="relative w-full h-80 rounded-lg border-2 border-solid p-2 overflow-hidden">
//                     <div className="flex flex-col space-y-4 h-full overflow-y-auto">
//                       {imgUrls.map((url, index) => (
//                         <div
//                           key={index}
//                           className="relative w-full h-64 flex-shrink-0"
//                         >
//                           <img
//                             src={url}
//                             alt={`upload ${index}`}
//                             className="w-full h-full object-contain"
//                             onClick={() => imgRef.current.click()}
//                           />
//                           <button
//                             type="button"
//                             onClick={() => removeImage(index)}
//                             className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
//                           >
//                             ✕
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => imgRef.current.click()}
//                     className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                   >
//                     Change Images
//                   </button>
//                 </div>
//               ) : (
//                 <div
//                   onClick={() => imgRef.current.click()}
//                   className="w-full h-80 bg-theme-bg rounded-xl border-2 border-dashed border-border-info-color flex items-center justify-center cursor-pointer hover:bg-theme-bg2 transition-colors"
//                 >
//                   <div className="text-center flex flex-col items-center gap-2 text-white">
//                     <IoCloudUploadOutline
//                       size={68}
//                       className="text-theme-color"
//                     />
//                     <p>Click to Upload Vehicle Images</p>
//                     <span className="text-white text-sm">
//                       PNG, JPG, JPEG | Max Size 1MB | Max 3 Images
//                     </span>
//                   </div>
//                 </div>
//               )}
//               {errors.images && (
//                 <p className="text-red-500 text-xs mt-2">{errors.images}</p>
//               )}
//               <input
//                 type="file"
//                 className="hidden"
//                 onChange={handleImageUpload}
//                 ref={imgRef}
//                 accept=".png,.jpg,.jpeg,image/png,image/jpg,image/jpeg"
//                 multiple
//               />

//               <div className="bg-theme-bg2 p-4 rounded-lg  mt-6">
//                 <h3 className="text-lg font-semibold mb-4 text-white-700">
//                   Route Map
//                 </h3>
//                 {googleMapsApiKey ? (
//                   <LoadScript
//                     googleMapsApiKey={googleMapsApiKey}
//                     onLoad={() => setMapLoaded(true)}
//                     onError={(error) => {
//                       console.error("Google Maps failed to load:", error);
//                       toast.error("Failed to load Google Maps");
//                     }}
//                   >
//                     <GoogleMap
//                       mapContainerStyle={containerStyle}
//                       center={mapCenter}
//                       zoom={locations.length > 0 ? 8 : 5}
//                       onLoad={onMapLoad}
//                       options={{
//                         zoomControl: true,
//                         streetViewControl: false,
//                         mapTypeControl: false,
//                         fullscreenControl: false,
//                       }}
//                     >
//                       {markers.map((marker, index) => (
//                         <Marker
//                           key={index}
//                           position={marker.position}
//                           label={marker.label}
//                         />
//                       ))}

//                       {directionsServiceOptions && (
//                         <DirectionsService
//                           options={directionsServiceOptions}
//                           callback={directionsCallback}
//                         />
//                       )}

//                       {directionsRendererOptions && (
//                         <DirectionsRenderer
//                           options={directionsRendererOptions}
//                         />
//                       )}
//                     </GoogleMap>
//                   </LoadScript>
//                 ) : (
//                   <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
//                     <div className="text-center text-gray-600">
//                       <p className="mb-2">Google Maps not available</p>
//                       <p className="text-sm">API key not configured</p>
//                     </div>
//                   </div>
//                 )}
//                 {errors.zipCodes && (
//                   <p className="text-red-500 text-xs mt-2">{errors.zipCodes}</p>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="lg:col-span-8 space-y-6">
//             <div className="bg-theme-bg2 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Basic Information
//               </h3>
//               <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Company Name*
//                   </label>
//                   <input
//                     name="company"
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                       errors.company ? "border-red-500" : "border-gray-300"
//                     }`}
//                     value={formData.company}
//                     onChange={handleChange}
//                     readOnly
//                   />
//                   {errors.company && (
//                     <p className="text-red-500 text-xs mt-1">
//                       {errors.company}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Account Number*
//                   </label>
//                   <input
//                     name="accountNumber"
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                       errors.accountNumber
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     }`}
//                     value={formData.accountNumber}
//                     onChange={handleChange}
//                     readOnly
//                   />
//                   {errors.accountNumber && (
//                     <p className="text-red-500 text-xs mt-1">
//                       {errors.accountNumber}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Suburb
//                   </label>
//                   <input
//                     name="suburb"
//                     className="w-full px-3 py-2 bg-theme-bg border border-gray-300 rounded-md"
//                     value={formData.suburb}
//                     onChange={handleChange}
//                     readOnly
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-theme-bg2 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Location Information
//               </h3>
//               <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Country*
//                   </label>
//                   <CountrySelect
//                     placeHolder="Select Country"
//                     value={selectedCountry}
//                     onChange={handleCountryChange}
//                     className="w-full px-3 py-2 bg-theme-bg border border-gray-300 rounded-md"
//                   />
//                   {errors.country && (
//                     <p className="text-red-500 text-xs mt-1">
//                       {errors.country}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     State*
//                   </label>
//                   <StateSelect
//                     countryid={selectedCountry?.id}
//                     value={selectedState}
//                     onChange={handleStateChange}
//                     placeHolder="Select State"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
//                   />
//                   {errors.state && (
//                     <p className="text-red-500 text-xs mt-1">{errors.state}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     City*
//                   </label>
//                   <CitySelect
//                     countryid={selectedCountry?.id}
//                     stateid={selectedState?.id}
//                     value={{ name: formData.city }}
//                     onChange={(city) =>
//                       setFormData({ ...formData, city: city.name })
//                     }
//                     placeHolder="Select City"
//                     className="w-full px-3 py-2 bg-theme-bg border border-gray-300 rounded-md"
//                   />
//                   {errors.city && (
//                     <p className="text-red-500 text-xs mt-1">{errors.city}</p>
//                   )}
//                 </div>

//                 <div className="relative md:col-span-3">
//                   <label
//                     htmlFor="zipCodes"
//                     className="block text-sm font-medium text-white-700 mb-1"
//                   >
//                     Campaign Post / Zip Codes (separated by commas)*
//                   </label>
//                   <input
//                     type="text"
//                     id="zipCodes"
//                     value={zipCodes.join(", ")}
//                     onChange={handleZipCodesChange}
//                     placeholder="Enter zip codes separated by commas (e.g., 12345, 67890)"
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                       errors.zipCodes ? "border-red-500" : "border-gray-300"
//                     }`}
//                   />
//                   {errors.zipCodes && (
//                     <p className="text-red-500 text-xs mt-1">
//                       {errors.zipCodes}
//                     </p>
//                   )}
//                 </div>

//                 <div className="relative">
//                   <label
//                     htmlFor="locationSearch"
//                     className="block text-sm font-medium text-white-700 mb-1"
//                   >
//                     Search Location to Add
//                   </label>
//                   <div className="relative w-full">
//                     <input
//                       type="text"
//                       id="locationSearch"
//                       value={query}
//                       onChange={handleInputChange}
//                       placeholder="Search for a location to add to route"
//                       className="search-input w-full bg-theme-bg border rounded-md px-4 py-2"
//                     />
//                     <BiCurrentLocation
//                       size={24}
//                       className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600 hover:text-white"
//                       onClick={getCurrentLocation}
//                       aria-label="Get current location"
//                       tabIndex={0}
//                     />
//                     {loading && (
//                       <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
//                     )}
//                     {suggestions.length > 0 && (
//                       <ul className="absolute top-full left-0 w-full z-50 rounded-md border border-gray-300 bg-[rgb(7, 27, 54)] text-sm shadow-lg max-h-48 overflow-y-auto mt-1">
//                         {suggestions.map((suggestion, index) => (
//                           <li
//                             key={index}
//                             onClick={() => handleLocationSelect(suggestion)}
//                             className="cursor-pointer p-2 hover:bg-gray-200 hover:text-black"
//                           >
//                             {suggestion.display_name}
//                           </li>
//                         ))}
//                       </ul>
//                     )}
//                   </div>
//                 </div>

//                 {locations.length > 0 && (
//                   <div className="md:col-span-3">
//                     <h4 className="text-sm font-medium text-white-700 mb-2">
//                       Selected Route Locations
//                     </h4>
//                     <ul className="space-y-2">
//                       {locations.map((loc, index) => (
//                         <li
//                           key={index}
//                           className="flex items-center justify-between bg-theme-bg p-2 rounded-md"
//                         >
//                           <span>
//                             {loc.name} (Zip: {loc.zip || "N/A"})
//                           </span>
//                           <button
//                             type="button"
//                             onClick={() => removeLocation(index)}
//                             className="text-red-500 hover:text-red-700"
//                           >
//                             Remove
//                           </button>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}

//                 <div className="md:col-span-2 text-white">
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Interstate/Intercity Routes
//                   </label>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs text-white-500 mb-1">
//                         From
//                       </label>
//                       <input
//                         name="routeFrom"
//                         className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                         value={formData.routeFrom}
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs text-white-500 mb-1">
//                         To
//                       </label>
//                       <input
//                         name="routeTo"
//                         className="w-full px-3 py-2 bg-theme-bg2 border border-gray-300 rounded-md"
//                         value={formData.routeTo}
//                         onChange={handleChange}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-theme-bg2 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 text-white-700">
//                 Vehicle Information
//               </h3>
//               <div className="bg-theme-bg2 p-4 rounded-lg grid lg:grid-cols-2 gap-4 mlg:grid-cols-1">
//                 <div className="grid">
//                   <label htmlFor="start_time">Auction Start Time</label>
//                   <input
//                     required
//                     id="startTime"
//                     type="datetime-local"
//                     className="w-full px-3 py-2 bg-theme-bg border border-gray-300 rounded-md"
//                     onChange={(e) =>
//                       setFormData({ ...formData, startTime: e.target.value })
//                     }
//                     value={formData.startTime}
//                   />
//                 </div>
//                 <div className="grid">
//                   <label htmlFor="end_time">Auction End Time</label>
//                   <input
//                     required
//                     id="endTime"
//                     type="datetime-local"
//                     className="w-full px-3 py-2 bg-theme-bg border border-gray-300 rounded-md"
//                     onChange={(e) =>
//                       setFormData({ ...formData, endTime: e.target.value })
//                     }
//                     value={formData.endTime}
//                   />
//                 </div>
//               </div>
//               <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
//                 <div>
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Vehicle Type*
//                   </label>
//                   <select
//                     name="model"
//                     onChange={handleVehicleChange}
//                     value={formData.model}
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                       errors.model ? "border-red-500" : "border-gray-300"
//                     }`}
//                   >
//                     <option value="">Select a Vehicle</option>
//                     {[...new Set(vehicles.map((v) => v.vehicle))].map(
//                       (vehicle) => (
//                         <option key={vehicle} value={vehicle}>
//                           {vehicle}
//                         </option>
//                       )
//                     )}
//                   </select>
//                   {errors.model && (
//                     <p className="text-red-500 text-xs mt-1">{errors.model}</p>
//                   )}
//                 </div>

//                 {formData.model && (
//                   <div>
//                     <label className="block text-sm font-medium text-white-700 mb-1">
//                       Manufacturer*
//                     </label>
//                     <select
//                       name="manufacturer"
//                       onChange={handleChange}
//                       value={formData.manufacturer}
//                       className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                         errors.manufacturer
//                           ? "border-red-500"
//                           : "border-gray-300"
//                       }`}
//                     >
//                       <option value="">Select Manufacturer</option>
//                       {[
//                         ...new Set(
//                           vehicles
//                             .filter((v) => v.vehicle === formData.model)
//                             .map((v) => v.manufacturer)
//                         ),
//                       ].map((manufacturer) => (
//                         <option key={manufacturer} value={manufacturer}>
//                           {manufacturer}
//                         </option>
//                       ))}
//                     </select>
//                     {errors.manufacturer && (
//                       <p className="text-red-500 text-xs mt-1">
//                         {errors.manufacturer}
//                       </p>
//                     )}
//                   </div>
//                 )}

//                 {formData.model && (
//                   <div>
//                     <label className="block text-sm font-medium text-white-700 mb-1">
//                       Year of Manufacture*
//                     </label>
//                     <select
//                       name="yearOfManufacture"
//                       onChange={handleChange}
//                       value={formData.yearOfManufacture}
//                       className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                         errors.yearOfManufacture
//                           ? "border-red-500"
//                           : "border-gray-300"
//                       }`}
//                     >
//                       <option value="">Select Year</option>
//                       {[
//                         ...new Set(
//                           vehicles
//                             .filter((v) => v.vehicle === formData.model)
//                             .map((v) => v.yearOfManufacture)
//                         ),
//                       ].map((year) => (
//                         <option key={year} value={year}>
//                           {year}
//                         </option>
//                       ))}
//                     </select>
//                     {errors.yearOfManufacture && (
//                       <p className="text-red-500 text-xs mt-1">
//                         {errors.yearOfManufacture}
//                       </p>
//                     )}
//                   </div>
//                 )}

//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-white-700 mb-1">
//                     Estimated Daily Impressions*
//                   </label>
//                   <input
//                     type="number"
//                     name="estimatedDailyImpressions"
//                     value={formData.estimatedDailyImpressions}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         estimatedDailyImpressions: e.target.value,
//                       })
//                     }
//                     className={`w-full px-3 py-2 bg-theme-bg border rounded-md ${
//                       errors.estimatedDailyImpressions
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     }`}
//                     placeholder="e.g. 5000"
//                     min={0}
//                     required
//                   />
//                   {errors.estimatedDailyImpressions && (
//                     <p className="text-red-500 text-xs mt-1">
//                       {errors.estimatedDailyImpressions}
//                     </p>
//                   )}
//                 </div>
//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-white mb-2">
//                     Vehicle Availability <span className="text-red-500">*</span>
//                   </label>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                     {["3 Months", "6 Months", "12 Months", "24 Months"].map(
//                       (val) => (
//                         <label
//                           key={val}
//                           className={`flex items-center justify-center cursor-pointer border rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200
//           ${
//             formData.availability.includes(val)
//               ? "bg-blue-600 text-white border-blue-600 shadow-md"
//               : "bg-theme-bg2 text-white border-gray-600 hover:bg-gray-700 hover:border-gray-500"
//           }`}
//                         >
//                           <input
//                             type="radio"
//                             name="availability"
//                             value={val}
//                             checked={formData.availability.includes(val)}
//                             onChange={(e) =>
//                               setFormData((prev) => ({
//                                 ...prev,
//                                 availability: [e.target.value], // Store as array
//                               }))
//                             }
//                             className="hidden"
//                           />
//                           {val}
//                         </label>
//                       )
//                     )}
//                   </div>
//                   {errors.availability && (
//                     <p className="text-red-500 text-sm mt-2 font-medium">
//                       {errors.availability}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-theme-bg2 p-4 rounded-lg">
//           <h3 className="text-lg font-semibold mb-4 text-white-700">
//             Pricing Information
//           </h3>
//           <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
//             <div className="bg-theme-bg p-4 rounded-md border border-gray-200">
//               <h4 className="font-medium text-white-700 mb-3">
//                 Auction Rates (per sqm)
//               </h4>
//               <div className="space-y-3">
//                 <div>
//                   <label className="block text-sm text-white-600 mb-1">
//                     Full Wrap
//                   </label>
//                   <input
//                     name="auctionRateFullWrap"
//                     type="number"
//                     className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                     value={formData.auctionRateFullWrap}
//                     onChange={handleChange}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm text-white-600 mb-1">
//                     One Side
//                   </label>
//                   <input
//                     name="auctionRateOneSide"
//                     type="number"
//                     className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                     value={formData.auctionRateOneSide}
//                     onChange={handleChange}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm text-white-600 mb-1">
//                     Both Sides
//                   </label>
//                   <input
//                     name="auctionRateBothSides"
//                     type="number"
//                     className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                     value={formData.auctionRateBothSides}
//                     onChange={handleChange}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm text-white-600 mb-1">
//                     Rear Doors
//                   </label>
//                   <input
//                     name="auctionRateRearDoors"
//                     type="number"
//                     className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                     value={formData.auctionRateRearDoors}
//                     onChange={handleChange}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-theme-bg p-4 rounded-md border border-gray-200">
//               <h4 className="font-medium text-white-700 mb-3">
//                 Buy Now Rates (per sqm)
//               </h4>
//               <div className="space-y-3">
//                 <div>
//                   <label className="block text-sm text-white-600 mb-1">
//                     Full Wrap
//                   </label>
//                   <input
//                     name="buyNowRateFullWrap"
//                     type="number"
//                     className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                     value={formData.buyNowRateFullWrap}
//                     onChange={handleChange}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm text-white-600 mb-1">
//                     One Side
//                   </label>
//                   <input
//                     name="buyNowRateOneSide"
//                     type="number"
//                     className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                     value={formData.buyNowRateOneSide}
//                     onChange={handleChange}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm text-white-600 mb-1">
//                     Both Sides
//                   </label>
//                   <input
//                     name="buyNowRateBothSides"
//                     type="number"
//                     className="w-full px-3 py-2 border bg-theme-bg2 border-gray-300 rounded-md"
//                     value={formData.buyNowRateBothSides}
//                     onChange={handleChange}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm text-white-600 mb-1">
//                     Rear Doors
//                   </label>
//                   <input
//                     name="buyNowRateRearDoors"
//                     type="number"
//                     className="w-full px-3 py-2 bg-theme-bg2 border border-gray-300 rounded-md"
//                     value={formData.buyNowRateRearDoors}
//                     onChange={handleChange}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="mt-4 bg-theme-bg2 p-4 rounded-md border border-gray-200">
//             <h4 className="font-medium text-white-700 mb-3">
//               Discounts for Longer Campaigns (%)
//             </h4>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <div>
//                 <label className="block text-sm text-white-600 mb-1">
//                   3 Month
//                 </label>
//                 <input
//                   name="discount3Month"
//                   type="number"
//                   className="w-full px-3 py-2 bg-theme-bg2 border border-gray-300 rounded-md"
//                   value={formData.discount3Month}
//                   onChange={handleChange}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm text-white-600 mb-1">
//                   6 Month
//                 </label>
//                 <input
//                   name="discount6Month"
//                   type="number"
//                   className="w-full px-3 py-2 bg-theme-bg2 border border-gray-300 rounded-md"
//                   value={formData.discount6Month}
//                   onChange={handleChange}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm text-white-600 mb-1">
//                   12 Month
//                 </label>
//                 <input
//                   name="discount12Month"
//                   type="number"
//                   className="w-full px-3 py-2 bg-theme-bg2 border border-gray-300 rounded-md"
//                   value={formData.discount12Month}
//                   onChange={handleChange}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm text-white-600 mb-1">
//                   24 Month
//                 </label>
//                 <input
//                   name="discount24Month"
//                   type="number"
//                   className="w-full px-3 py-2 bg-theme-bg2 border border-gray-300 rounded-md"
//                   value={formData.discount24Month}
//                   onChange={handleChange}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="md:col-span-2 bg-theme-bg2 p-6 rounded-xl shadow-md">
//           <h3 className="text-lg font-semibold mb-4 text-white">
//             Prohibited Ads <span className="text-red-500">*</span>
//           </h3>

//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//             {[
//               { name: "gambling", label: "Gambling" },
//               { name: "alcohol", label: "Alcohol" },
//               { name: "smoking", label: "Smoking" },
//             ].map((item) => (
//               <label
//                 key={item.name}
//                 className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-md text-white hover:bg-white/20 transition"
//               >
//                 <input
//                   type="checkbox"
//                   name={`prohibitedAds.${item.name}`}
//                   checked={formData.prohibitedAds[item.name]}
//                   onChange={handleChange}
//                   className="h-4 w-4 accent-blue-500"
//                 />
//                 <span className="text-sm">{item.label}</span>
//               </label>
//             ))}

//             {/* Other + Specify field */}
//             <div className="col-span-2 sm:col-span-1 lg:col-span-2">
//               <label className="flex items-start gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-md text-white hover:bg-white/20 transition">
//                 <input
//                   type="checkbox"
//                   name="prohibitedAds.other"
//                   checked={formData.prohibitedAds.other}
//                   onChange={handleChange}
//                   className="h-4 w-4 mt-1 accent-blue-500"
//                 />
//                 <div className="flex-1">
//                   <span className="text-sm">Other</span>
//                   {formData.prohibitedAds.other && (
//                     <div className="mt-2">
//                       <input
//                         type="text"
//                         name="prohibitedAds.otherSpecify"
//                         placeholder="Please specify"
//                         className="w-full px-3 py-2 rounded-md text-sm text-black bg-white border border-gray-300"
//                         value={formData.prohibitedAds.otherSpecify}
//                         onChange={handleChange}
//                       />
//                       {errors.prohibitedAdsOther && (
//                         <p className="text-red-500 text-xs mt-1">
//                           {errors.prohibitedAdsOther}
//                         </p>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </label>
//             </div>
//           </div>
//         </div>

//         <div className="md:col-span-2 flex justify-end">
//           <button
//             type="submit"
//             disabled={isLoading}
//             className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
//               isLoading ? "opacity-50 cursor-not-allowed" : ""
//             }`}
//           >
//             {isLoading ? (
//               <>
//                 <svg
//                   className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                   ></path>
//                 </svg>
//                 Submitting...
//               </>
//             ) : (
//               "Submit Form"
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default FleetOwnerForm;
