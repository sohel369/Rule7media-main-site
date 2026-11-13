import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createAuction,
  createAuctionsFromCSV,
  reset,
} from "../store/auction/auctionSlice";
import { getAllCategories } from "../store/category/categorySlice";
import { getAllCities } from "../store/city/citySlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import _ from "lodash";
import "react-toastify/dist/ReactToastify.css";
import { IoCloudUploadOutline, IoDocumentTextOutline } from "react-icons/io5";
import { BiCurrentLocation } from "react-icons/bi";
import { FaSpinner } from "react-icons/fa";
import axios from "axios";
import { fetchCommission } from "../store/commission/commissionSlice";
import axiosInstance from "../axiosInstance";
import countryList from "react-select-country-list";
import { fetchVehicles } from "../store/vehicle/vehicleSlice";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { fetchUserCountry } from "../store/countary/countrySlice";
import Papa from "papaparse";
import { FaCalculator } from "react-icons/fa";
import RevenueCalculator from "../components/RevenueCalculator";
const UploadItem = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { auction, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auction,
  );
  const { commission } = useSelector((state) => state.commission);
  const { categories } = useSelector((state) => state.category);
  const { cities } = useSelector((state) => state.city);
  const { list: vehicles } = useSelector((state) => state.vehicles);
  const { country, currency } = useSelector((state) => state.country);

  const [selectedFile, setSelectedFile] = useState(null);
  const [imgUrls, setImgUrls] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationChecked, setVerificationChecked] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [zipCodes, setZipCodes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [errors, setErrors] = useState({ zipCodes: "" });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [directions, setDirections] = useState(null);
  const [directionsServiceOptions, setDirectionsServiceOptions] =
    useState(null);
  const [directionsRendererOptions, setDirectionsRendererOptions] =
    useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const csvRef = useRef(null);
  const countries = countryList().getData();

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const defaultCenter = { lat: 8.811927, lng: 83.5581972 };
  const containerStyle = {
    width: "100%",
    height: "400px",
  };

  // Template data update करें
  const templateData = [
    {
      name: "Sample Vehicle",
      description: "A sample vehicle description",
      category: "Car",
      vehicleType: "Sedan",
      startTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      endTime: new Date(Date.now() + 172800000).toISOString().slice(0, 16),
      "location.zip": "12345",
      "location.name": "Sample City",
      "location.latitude": "40.7128",
      "location.longitude": "-74.0060",
      images: "https://example.com/image1.jpg,https://example.com/image2.jpg",
      "vehicle.country": "USA",
      "vehicle.yearofmanufacture": 2020,
      "vehicle.manufacturer": "Toyota",
      "vehicle.model": "Camry",
      "vehicle.dimensions.length": 4885,
      "vehicle.dimensions.width": 1840,
      "vehicle.dimensions.height": 1455,
      "vehicle.dimensions.wheelbase": 2825,
      "vehicle.dimensions.curbWeight": 1500,
      "vehicle.dimensions.engineSize": 2500,
      "vehicle.dimensions.cabwidth": 150,
      "vehicle.dimensions.cabheight": 120,
      "vehicle.dimensions.bonnetwidth": 120,
      "vehicle.dimensions.bonnetLength": 140,
      "vehicle.manufacturerLink": "http://example.com/toyota",
      "campingAvailability.threeMonths": "Available",
      "campingAvailability.sixMonths": "Available",
      "campingAvailability.twelveMonths": "Unavailable",
      "campingAvailability.twentyFourMonths": "Unavailable",
      "minAuctionRate.fullWrap": 100,
      "minAuctionRate.oneSide": 30,
      "minAuctionRate.bothSides": 60,
      "minAuctionRate.rearDoors": 20,
    },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file || null);
  };

  const downloadTemplate = () => {
    // Dynamic dates for template
    const tomorrow = new Date(Date.now() + 86400000);
    const dayAfterTomorrow = new Date(Date.now() + 172800000);

    const formattedData = templateData.map((item) => ({
      ...item,
      startTime: tomorrow.toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm format
      endTime: dayAfterTomorrow.toISOString().slice(0, 16),
    }));

    const csv = Papa.unparse(formattedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "auction_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVUpload = async (e) => {
    if (!selectedFile) return;
    setCsvLoading(true);

    try {
      Papa.parse(selectedFile, {
        header: true,
        transformHeader: (header) => header.trim(),
        complete: async (results) => {
          try {
            const csvData = results.data
              .filter((row) =>
                Object.values(row).some((val) => val && val.toString().trim()),
              )
              .map((row) => {
                // Process images from CSV
                const imagesFromCSV = row.images
                  ? row.images.split(",").map((url) => url.trim())
                  : [];

                return {
                  sellerId: user._id,
                  name: row.name?.trim(),
                  description: row.description?.trim(),
                  vehicleType: row.vehicleType?.trim(),
                  startTime: row.startTime,
                  endTime: row.endTime,
                  location: {
                    zip: row["location.zip"]?.trim(),
                    name: row["location.name"]?.trim(),
                    latitude: parseFloat(row["location.latitude"] || 0),
                    longitude: parseFloat(row["location.longitude"] || 0),
                  },
                  // ✅ Send as string array, backend will convert to proper format
                  images: imagesFromCSV,
                  vehicle: {
                    country: row["vehicle.country"]?.trim(),
                    yearofmanufacture: row["vehicle.yearofmanufacture"]?.trim(),
                    manufacturer: row["vehicle.manufacturer"]?.trim(),
                    model: row["vehicle.model"]?.trim(),
                    dimensions: {
                      length: parseFloat(row["vehicle.dimensions.length"] || 0),
                      width: parseFloat(row["vehicle.dimensions.width"] || 0),
                      height: parseFloat(row["vehicle.dimensions.height"] || 0),
                      wheelbase: parseFloat(
                        row["vehicle.dimensions.wheelbase"] || 0,
                      ),
                      curbWeight: parseFloat(
                        row["vehicle.dimensions.curbWeight"] || 0,
                      ),
                      engineSize: parseFloat(
                        row["vehicle.dimensions.engineSize"] || 0,
                      ),
                      cabwidth: parseFloat(
                        row["vehicle.dimensions.cabwidth"] || 0,
                      ),
                      cabheight: parseFloat(
                        row["vehicle.dimensions.cabheight"] || 0,
                      ),
                      bonnetwidth: parseFloat(
                        row["vehicle.dimensions.bonnetwidth"] || 0,
                      ),
                      bonnetLength: parseFloat(
                        row["vehicle.dimensions.bonnetLength"] || 0,
                      ),
                    },
                    manufacturerLink: row["vehicle.manufacturerLink"] || "",
                  },
                  campingAvailability: {
                    threeMonths:
                      (row["campingAvailability.threeMonths"] || "")
                        .toString()
                        .trim() === "Available"
                        ? "Available"
                        : "Unavailable",
                    sixMonths:
                      (row["campingAvailability.sixMonths"] || "")
                        .toString()
                        .trim() === "Available"
                        ? "Available"
                        : "Unavailable",
                    twelveMonths:
                      (row["campingAvailability.twelveMonths"] || "")
                        .toString()
                        .trim() === "Available"
                        ? "Available"
                        : "Unavailable",
                    twentyFourMonths:
                      (row["campingAvailability.twentyFourMonths"] || "")
                        .toString()
                        .trim() === "Available"
                        ? "Available"
                        : "Unavailable",
                  },
                  "minAuctionRate.fullWrap":
                    parseFloat(row["minAuctionRate.fullWrap"]) || 0,
                  "minAuctionRate.oneSide":
                    parseFloat(row["minAuctionRate.oneSide"]) || 0,
                  "minAuctionRate.bothSides":
                    parseFloat(row["minAuctionRate.bothSides"]) || 0,
                  "minAuctionRate.rearDoors":
                    parseFloat(row["minAuctionRate.rearDoors"]) || 0,
                };
              });
            if (csvData.length === 0) {
              toast.error("CSV file is empty or has no valid data");
              setCsvLoading(false);
              return;
            }

            // Dispatch action
            const result = await dispatch(
              createAuctionsFromCSV(csvData),
            ).unwrap();

            if (result.data?.errorCount > 0) {
              // Partial success (207 status)
              toast.warning(
                `Uploaded ${result.data.successCount} items successfully, ${result.data.errorCount} failed`,
              );
              // Show errors in console
              if (result.data.errors) {
                console.table(
                  result.data.errors.map((e) => ({
                    Row: e.row,
                    Error: e.error,
                  })),
                );
                // User के लिए detailed errors show करें
                const errorMessages = result.data.errors
                  .map((e) => `Row ${e.row}: ${e.error}`)
                  .join("\n");
                toast.error(`Some errors occurred:\n${errorMessages}`, {
                  autoClose: false,
                  closeOnClick: false,
                });
              }
            } else {
              // Full success (201 status)
              toast.success(
                `Successfully uploaded ${result.data?.successCount || csvData.length} items from CSV`,
              );
            }
          } catch (err) {
            // यहाँ error आएगा जब backend से 400/500 error आती है
            console.error("CSV Upload Failed - Full Error:", err);

            // Extract error message
            let errorMessage = "Upload failed";
            let errorsList = [];

            if (err?.data?.data?.message) {
              errorMessage = err.data.data.message;
            } else if (err?.data?.message) {
              errorMessage = err.data.message;
            } else if (err?.message) {
              errorMessage = err.message;
            }

            // Extract errors list
            if (err?.data?.data?.errors) {
              errorsList = err.data.data.errors;
            } else if (err?.data?.errors) {
              errorsList = err.data.errors;
            }

            // Show error toast
            if (errorsList.length > 0) {
              const errorDetails = errorsList
                .map((e) => `Row ${e.row}: ${e.error}`)
                .join("\n");
              toast.error(`${errorMessage}\n\nDetails:\n${errorDetails}`, {
                autoClose: false,
                closeOnClick: false,
              });

              // Show detailed errors in console
              errorsList.forEach((error) => {
                console.error(`Row ${error.row}: ${error.error}`);
              });
            } else {
              toast.error(errorMessage);
            }

            // Specific error for start time
            if (
              errorMessage?.includes("Start time must be in the future") ||
              errorsList.some((e) =>
                e?.error?.includes("Start time must be in the future"),
              )
            ) {
              toast.error(
                "ERROR: Start time must be in the future. Please check your CSV dates and ensure they are future dates.",
                {
                  autoClose: false,
                },
              );
            }
          } finally {
            setCsvLoading(false);
            setSelectedFile(null);
            // Reset file input
            if (csvRef.current) {
              csvRef.current.value = "";
            }
            if (e && e.target) {
              e.target.value = "";
            }
          }
        },
        error: (error) => {
          toast.error("CSV parsing error: " + error.message);
          setCsvLoading(false);
          setSelectedFile(null);
          if (csvRef.current) csvRef.current.value = "";
        },
      });
    } catch (error) {
      toast.error("Unexpected error: " + error.message);
      setCsvLoading(false);
      setSelectedFile(null);
      if (csvRef.current) csvRef.current.value = "";
    }
  };

  useEffect(() => {
    dispatch(fetchVehicles());
    dispatch(getAllCategories());
    dispatch(getAllCities());
    dispatch(fetchCommission());

    const checkVerification = async () => {
      try {
        if (user?.stripeAccountId) {
          const response = await axiosInstance.get(
            `/users/stripe-account-status/${user.stripeAccountId}`,
          );
          setIsVerified(response.data.data.isVerified);
        }
        setVerificationChecked(true);
      } catch (error) {
        console.error("Error checking verification status:", error);
        setVerificationChecked(true);
      }
    };

    checkVerification();
  }, [dispatch, user]);

  useEffect(() => {
    dispatch(reset());
    if (isError && message) {
      toast.error(message, { autoClose: 500 });
      setUploadLoading(false);
    } else if (isSuccess && auction && message) {
      if (uploadLoading) {
        toast.success(message, { autoClose: 500 });
      }
      setFormData({
        name: "",
        vehicleType: "",
        startTime: "",
        endTime: "",
        location: { zip: "", name: "", latitude: "", longitude: "" },
        startingPrice: "",
        description: "",
        vehicle: initialVehicleState,
        campingAvailability: [],
      });
      setImgUrls([]);
      setZipCodes([]);
      setLocations([]);
      setInputValue("");
      setDirections(null);
      setDirectionsServiceOptions(null);
      setDirectionsRendererOptions(null);
      setUploadLoading(false);
    }
  }, [isSuccess, isError, auction, message, dispatch, navigate, uploadLoading]);

  useEffect(() => {
    dispatch(fetchCommission());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  const initialVehicleState = {
    model: "",
    manufacturer: "",
    yearofmanufacture: "",
    country: "",
    dimensions: {
      length: "",
      width: "",
      height: "",
      wheelbase: "",
      curbWeight: "",
      cabheight: "",
      cabwidth: "",
      bonnetwidth: "",
      bonnetLength: "",
      engineSize: "",
    },
    images: [],
  };

  const [formData, setFormData] = useState({
    name: "",
    vehicleType: "",
    startTime: "",
    endTime: "",
    location: {
      zip: "",
      name: "",
      latitude: "",
      longitude: "",
    },
    startingPrice: "",
    description: "",
    vehicle: initialVehicleState,
    campingAvailability: {
      threeMonths: "Unavailable",
      sixMonths: "Unavailable",
      twelveMonths: "Unavailable",
      twentyFourMonths: "Unavailable",
    },
    auctionRateFullWrap: "",
    auctionRateOneSide: "",
    auctionRateBothSides: "",
    auctionRateRearDoors: "",
  });

  // Fixed geocoding function with better error handling
  const geocodeAddress = async (address) => {
    try {
      // Try Google Maps Geocoding API first if available
      if (googleMapsApiKey) {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address,
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
            geoJson: {
              type: "Point",
              coordinates: [lng, lat],
            },
          };
        }
      }

      // Fallback to Nominatim (OpenStreetMap)
      const nominatimResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          address,
        )}&format=json&addressdetails=1&limit=1`,
      );

      if (nominatimResponse.data && nominatimResponse.data[0]) {
        const result = nominatimResponse.data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          formattedAddress: result.display_name,
          postalCode: result.address?.postcode || address,
          geoJson: {
            type: "Point",
            coordinates: [parseFloat(result.lon), parseFloat(result.lat)],
          },
        };
      }

      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes("auctionRate")) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (type === "radio" && name === "campingAvailability") {
      const newCampingAvailability = {
        threeMonths: "Unavailable",
        sixMonths: "Unavailable",
        twelveMonths: "Unavailable",
        twentyFourMonths: "Unavailable",
      };
      switch (value) {
        case "3 Months":
          newCampingAvailability.threeMonths = "Available";
          break;
        case "6 Months":
          newCampingAvailability.sixMonths = "Available";
          break;
        case "12 Months":
          newCampingAvailability.twelveMonths = "Available";
          break;
        case "24 Months":
          newCampingAvailability.twentyFourMonths = "Available";
          break;
        default:
          break;
      }

      setFormData((prev) => ({
        ...prev,
        campingAvailability: newCampingAvailability,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: String(value) }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  // Fixed postal code handling function
  const handleZipCodesChange = async (e) => {
    const input = e.target.value;
    setInputValue(input);

    try {
      const zipArray = input
        .split(",")
        .map((zip) => zip.trim())
        .filter(Boolean);

      if (zipArray.length === 0) {
        setZipCodes([]);
        setLocations([]);
        setErrors((prev) => ({ ...prev, zipCodes: "" }));
        return;
      }

      setZipCodes(zipArray);

      // More flexible validation for international postal codes
      const invalidZips = zipArray.filter((zip) => {
        // Allow alphanumeric codes with spaces and hyphens (3-10 characters)
        return !/^[A-Za-z0-9\s\-]{2,10}$/.test(zip);
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

      // Process each postal code
      const newLocations = [];
      for (const zip of zipArray) {
        const locationData = await geocodeAddress(zip);
        if (locationData) {
          newLocations.push({
            lat: locationData.lat,
            lng: locationData.lng,
            name: locationData.formattedAddress,
            zip: locationData.postalCode,
            location: locationData.geoJson,
          });
        } else {
          console.warn(`Could not find location for postal code: ${zip}`);
          toast.warning(`Could not find location for postal code: ${zip}`);
        }
      }

      if (newLocations.length === 0 && zipArray.length > 0) {
        setErrors((prev) => ({
          ...prev,
          zipCodes:
            "Could not find any locations for the provided postal codes",
        }));
        toast.error(
          "Could not find any locations for the provided postal codes",
        );
        return;
      }

      setLocations(newLocations);

      // Update form data with the locations
      setFormData((prev) => ({
        ...prev,
        zipCodes: zipArray,
        locations: newLocations.map((loc) => ({
          name: loc.name || "",
          zip: loc.zip || "",
          location: loc.location,
        })),
        // Set the first location as the primary location
        location: newLocations[0]
          ? {
              zip: newLocations[0].zip,
              name: newLocations[0].name,
              latitude: newLocations[0].lat,
              longitude: newLocations[0].lng,
            }
          : prev.location,
      }));
    } catch (error) {
      console.error("Error processing postal codes:", error);
      setErrors((prev) => ({
        ...prev,
        zipCodes: "Error processing postal codes. Please try again.",
      }));
      toast.error("Error processing postal codes. Please try again.");
    }
  };

  const removeLocation = (index) => {
    const newZipCodes = [...zipCodes];
    const newLocations = [...locations];
    newZipCodes.splice(index, 1);
    newLocations.splice(index, 1);
    setZipCodes(newZipCodes);
    setLocations(newLocations);
    setInputValue(newZipCodes.join(", "));
    setFormData((prev) => ({
      ...prev,
      zipCodes: newZipCodes,
      locations: newLocations.map((loc) => ({
        name: loc.name || "",
        zip: loc.zip || "",
        location: loc.location,
      })),
      location: newLocations[0]
        ? {
            zip: newLocations[0].zip,
            name: newLocations[0].name,
            latitude: newLocations[0].lat,
            longitude: newLocations[0].lng,
          }
        : { zip: "", name: "", latitude: "", longitude: "" },
    }));

    if (newLocations.length >= 2) {
      setDirectionsServiceOptions({
        origin: newLocations[0].formattedAddress,
        destination: newLocations[newLocations.length - 1].formattedAddress,
        travelMode: "DRIVING",
        waypoints: newLocations
          .slice(1, -1)
          .map((loc) => ({ location: loc.formattedAddress, stopover: true })),
      });
      setDirectionsRendererOptions({
        directions: null,
      });
    } else {
      setDirections(null);
      setDirectionsServiceOptions(null);
      setDirectionsRendererOptions(null);
    }
  };

  const mapCenter = useMemo(() => {
    return locations.length > 0 ? locations[0] : defaultCenter;
  }, [locations]);

  const markers = useMemo(() => {
    return locations.map((loc, index) => ({
      position: { lat: loc.lat, lng: loc.lng },
      label: (index + 1).toString(),
    }));
  }, [locations]);

  const selectedVehicleType = formData.vehicleType;
  const selectedModel = formData.vehicle?.model;
  const selectedManufacturer = formData.vehicle?.manufacturer;
  const selectedYear = formData.vehicle?.yearofmanufacture;

  const filteredOptions = useMemo(() => {
    let filtered = vehicles || [];

    const vehicleTypes = [...new Set(filtered.map((v) => v.vehicle))].sort();

    if (selectedVehicleType) {
      filtered = filtered.filter((v) => v.vehicle === selectedVehicleType);
    }
    const models = [...new Set(filtered.map((v) => v.model))].sort();

    if (selectedModel) {
      filtered = filtered.filter((v) => v.model === selectedModel);
    }

    const manufacturers = [
      ...new Set(filtered.map((v) => v.manufacturer)),
    ].sort();
    if (selectedManufacturer) {
      filtered = filtered.filter(
        (v) => v.manufacturer === selectedManufacturer,
      );
    }
    const years = [...new Set(filtered.map((v) => v.yearOfManufacture))].sort(
      (a, b) => b - a,
    );

    const countries = [...new Set(vehicles.map((v) => v.country))].sort();

    return {
      vehicleTypes,
      models,
      manufacturers,
      years,
      countries,
      filteredVehicles: filtered,
    };
  }, [
    vehicles,
    selectedVehicleType,
    selectedModel,
    selectedManufacturer,
    selectedYear,
  ]);

  useEffect(() => {
    if (
      selectedVehicleType &&
      selectedModel &&
      selectedManufacturer &&
      selectedYear
    ) {
      const matchedVehicle = vehicles.find(
        (v) =>
          v.vehicle === selectedVehicleType &&
          v.model === selectedModel &&
          v.manufacturer === selectedManufacturer &&
          v.yearOfManufacture == selectedYear,
      );

      if (matchedVehicle && matchedVehicle.dimensions) {
        setFormData((prevData) => ({
          ...prevData,
          vehicle: {
            ...prevData.vehicle,
            dimensions: {
              length: matchedVehicle.dimensions.length || "",
              width: matchedVehicle.dimensions.width || "",
              height: matchedVehicle.dimensions.height || "",
              wheelbase: matchedVehicle.dimensions.wheelbase || "",
              curbWeight: matchedVehicle.dimensions.curbWeight || "",
              cabheight: matchedVehicle.dimensions.cabheight || "",
              cabwidth: matchedVehicle.dimensions.cabwidth || "",
              bonnetwidth: matchedVehicle.dimensions.bonnetwidth || "",
              bonnetLength: matchedVehicle.dimensions.bonnetLength || "",
              engineSize: matchedVehicle.dimensions.engineSize || "",
            },
          },
        }));
        if (matchedVehicle.images && matchedVehicle.images.length > 0) {
          const autoImages = matchedVehicle.images.slice(0, 3); // max 3
          setFormData((prev) => ({ ...prev, images: autoImages }));
          setImageFiles([]);
          setImgUrls(autoImages); // preview के लिए
        }
      }
    }
  }, [
    selectedVehicleType,
    selectedModel,
    selectedManufacturer,
    selectedYear,
    vehicles,
  ]);

  const handleProductUpload = async (e) => {
    e.preventDefault();
    setUploadLoading(true);

    if (!isVerified) {
      toast.error("Please complete your account verification first");
      navigate("/user-profile/SellerOnboarding");
      setUploadLoading(false);
      return;
    }

    if (imageFiles.length === 0)
      errors.images = "At least one image is required";

    // Validate required fields
    const requiredFields = {
      name: formData.name,
      description: formData.description,
      vehicleType: formData.vehicleType,
      startTime: formData.startTime,
      endTime: formData.endTime,
      "location.zip": formData.location.zip,
      "location.name": formData.location.name,
      "location.latitude": formData.location.latitude,
      "location.longitude": formData.location.longitude,
      "vehicle.country": formData.vehicle?.country,
      "vehicle.yearofmanufacture": formData.vehicle?.yearofmanufacture,
      "vehicle.manufacturer": formData.vehicle?.manufacturer,
      "vehicle.model": formData.vehicle?.model,
      "campingAvailability.threeMonths":
        formData.campingAvailability?.threeMonths,
      "campingAvailability.sixMonths": formData.campingAvailability?.sixMonths,
      "campingAvailability.twelveMonths":
        formData.campingAvailability?.twelveMonths,
      "campingAvailability.twentyFourMonths":
        formData.campingAvailability?.twentyFourMonths,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || value === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(", ")}`);
      setUploadLoading(false);
      return;
    }

    // Validate vehicle dimensions
    const dimensions = formData.vehicle?.dimensions || {};
    const requiredDimensions = [
      "length",
      "width",
      "height",
      "wheelbase",
      "curbWeight",
      "engineSize",
      "cabwidth",
      "cabheight",
      "bonnetwidth",
      "bonnetLength",
    ];
    const missingDimensions = requiredDimensions.filter(
      (key) => !dimensions[key] || dimensions[key] === "",
    );
    if (missingDimensions.length > 0) {
      toast.error(
        `Missing vehicle dimensions: ${missingDimensions.join(", ")}`,
      );
      setUploadLoading(false);
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("vehicleType", formData.vehicleType);
    data.append("startTime", formData.startTime);
    data.append("endTime", formData.endTime);
    data.append("sellerId", user._id);

    data.append("location[zip]", formData.location.zip || "");
    data.append("location[name]", formData.location.name || "");
    data.append("location[latitude]", formData.location.latitude || "");
    data.append("location[longitude]", formData.location.longitude || "");
    data.append(
      "minAuctionRates[fullWrap]",
      formData.auctionRateFullWrap || "0",
    );
    data.append("minAuctionRates[oneSide]", formData.auctionRateOneSide || "0");
    data.append(
      "minAuctionRates[bothSides]",
      formData.auctionRateBothSides || "0",
    );
    data.append(
      "minAuctionRates[rearDoors]",
      formData.auctionRateRearDoors || "0",
    );

    const sanitizedLocations = locations.map((loc) => ({
      name: loc.name || "",
      zip: loc.zip || "",
      type: "Point",
      coordinates: [loc.lng || 0, loc.lat || 0],
    }));
    data.append("additionalLocations", JSON.stringify(sanitizedLocations));

    data.append("vehicle[country]", formData.vehicle?.country || "");
    data.append(
      "vehicle[yearofmanufacture]",
      formData.vehicle?.yearofmanufacture || "",
    );
    data.append("vehicle[manufacturer]", formData.vehicle?.manufacturer || "");
    data.append("vehicle[model]", formData.vehicle?.model || "");

    Object.entries(dimensions).forEach(([key, value]) => {
      data.append(`vehicle[dimensions][${key}]`, value || "");
    });

    data.append(
      "vehicle[manufacturerLink]",
      formData.vehicle?.manufacturerLink || "",
    );
    data.append(
      "campingAvailability",
      JSON.stringify({
        threeMonths: formData.campingAvailability.threeMonths || "Unavailable",
        sixMonths: formData.campingAvailability.sixMonths || "Unavailable",
        twelveMonths:
          formData.campingAvailability.twelveMonths || "Unavailable",
        twentyFourMonths:
          formData.campingAvailability.twentyFourMonths || "Unavailable",
      }),
    );
    formData.images.forEach((imageUrl) => {
      data.append("images", imageUrl);
    });

    for (let pair of data.entries()) {
    }
    try {
      const response = await dispatch(createAuction(data)).unwrap();
      toast.success("Auction created successfully");
      navigate("/user-profile/manage-items");
    } catch (error) {
      console.error("Auction creation error:", error);
      const errorMessage = error.message || "Error creating auction";
      toast.error(errorMessage);
      setUploadLoading(false);
    }
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setImgUrls(newImageUrls);
  };

  const removeImage = (index) => {
    setImgUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debounceRef.current(value);
  };
  const commissionRate = useMemo(() => {
    const userPlanDuration = user?.subscription?.durationMonths;
    if (!userPlanDuration || !commission) {
      return 0;
    }

    const durationMap = {
      3: "threeMonth",
      6: "sixMonth",
      12: "twelveMonth",
    };

    const durationKey = durationMap[userPlanDuration];

    if (!Array.isArray(commission)) {
      return commission[durationKey] || 0;
    }
    const matchingCommission = commission.find(
      (comm) => comm.planDuration === userPlanDuration,
    );
    return matchingCommission?.commissionRate || 0;
  }, [user, commission]);

  const handleLocationSelect = async (location) => {
    const zip = location.address?.postcode || "";
    setQuery(location.display_name);
    const newZipCodes = [...new Set([...zipCodes, zip])].filter(Boolean);
    setZipCodes(newZipCodes);
    setInputValue(newZipCodes.join(", "));

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
    setLocations(updatedLocations);
    setFormData((prev) => ({
      ...prev,
      zipCodes: newZipCodes,
      locations: updatedLocations.map((loc) => ({
        name: loc.name || "",
        zip: loc.zip || "",
        location: loc.location,
      })),
      location: updatedLocations[0]
        ? {
            zip: updatedLocations[0].zip,
            name: updatedLocations[0].name,
            latitude: updatedLocations[0].lat,
            longitude: updatedLocations[0].lng,
          }
        : prev.location,
    }));
    setSuggestions([]);
    setQuery("");
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

            const newZip =
              data.address?.postcode || data.address?.postal_code || "";
            const locationName =
              data.display_name || `${latitude}, ${longitude}`;

            setFormData((prevData) => ({
              ...prevData,
              location: {
                name: locationName,
                zip: newZip,
                latitude,
                longitude,
              },
            }));

            setQuery(locationName);
            setZipCodes([newZip].filter(Boolean));
            setInputValue(newZip);

            const newLocation = {
              lat: latitude,
              lng: longitude,
              name: locationName,
              zip: newZip,
              location: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
            };

            setLocations([newLocation]);
            setLoading(false);
          } catch (error) {
            setLoading(false);
            console.error("Error fetching current location:", error);
            toast.error("Error fetching current location");
          }
        },
        (error) => {
          setLoading(false);
          console.error("Geolocation error:", error);
          toast.error("Unable to access location. Please try again.");
        },
      );
    } else {
      setLoading(false);
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(50), (val, index) => currentYear - index);

  if (!verificationChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-color"></div>
      </div>
    );
  }

  if (!isVerified) {
    setTimeout(() => {
      navigate("/user-profile/SellerOnboarding");
    }, 100);
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-white bg-theme-bg p-6 rounded-xl">
          Redirecting to verification page...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-theme-bg rounded-2xl">
      {uploadLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <FaSpinner className="text-4xl text-blue-500 animate-spin mb-4" />
            <p className="text-lg text-white font-semibold">
              Uploading your Auction...
            </p>
          </div>
        </div>
      )}

      <p className="text-center text-xl font-semibold text-theme-color mt-10 mb-6 tracking-wide">
        The general manager is entitled to a commission of
        <span className="inline-block text-2xl font-bold text-yellow-500 mx-1">
          {commissionRate}%
        </span>
        , calculated after deducting the commission charges.
      </p>

      {/* CSV Upload Section */}
      <div className="flex flex-col lg:flex-row lg:justify-end lg:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          {/* File Input */}
          <input
            type="file"
            ref={csvRef}
            onChange={handleFileChange}
            accept=".csv"
            className="w-60 text-white bg-theme-bg2 border border-border-info-color rounded-lg px-3 py-2 text-sm focus:border-theme-color outline-none"
          />

          {/* Bulk Upload Button */}
          <button
            onClick={handleCSVUpload}
            disabled={!selectedFile || csvLoading}
            className="px-4 py-2 bg-theme-color text-white rounded-lg flex items-center gap-2 hover:bg-color-danger text-sm disabled:opacity-50"
          >
            {csvLoading ? <FaSpinner className="animate-spin" /> : "Upload"}
          </button>

          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 text-sm "
          >
            <IoDocumentTextOutline size={16} />
            Download Template
          </button>

          <button
            onClick={() => setShowCalculator(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 text-sm mr-6"
          >
            <FaCalculator className="w-5 h-5" />
            Revenue Calculator
          </button>
        </div>

        {/* Revenue Calculator Component */}
        <RevenueCalculator
          showCalculator={showCalculator}
          setShowCalculator={setShowCalculator}
          userType="seller"
        />
      </div>

      <form
        className="flex flex-col lg:flex-row gap-8 justify-center w-full max-w-7xl m-auto px-4 py-15"
        onSubmit={handleProductUpload}
      >
        <div className="text-blue lg:w-1/4 lg:min-w-[350px]">
          <h1 className="text-white text-2xl font-bold mb-4">Upload Item</h1>

          {imgUrls.length > 0 ? (
            <div className="space-y-4">
              <div className="relative w-full h-80 rounded-lg border-2 border-solid p-2 overflow-hidden">
                <div className="flex flex-col space-y-4 h-full overflow-y-auto">
                  {imgUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative w-full h-64 flex-shrink-0"
                    >
                      <img
                        src={url}
                        alt={`Vehicle ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-green-400">
                Images auto-loaded from vehicle database
              </p>
            </div>
          ) : (
            <div className="w-full h-80 bg-theme-bg rounded-xl border-2 border-dashed border-border-info-color flex items-center justify-center">
              <p className="text-white text-center">
                Please select a vehicle to automatically load its image
              </p>
            </div>
          )}
          {errors.images && (
            <p className="text-red-500 text-xs mt-2">{errors.images}</p>
          )}
          {/* <input
            type="file"
            className="hidden"
            onChange={handleImageUpload}
            ref={imgRef}
            accept=".png,.jpg,.jpeg,image/png,image/jpg,image/jpeg"
            multiple
          /> */}

          <div className="bg-theme-bg2 p-4 rounded-lg mt-4 text-white">
            <h3 className="text-lg font-semibold mb-4 text-white-700">
              Route Map
            </h3>
            {googleMapsApiKey ? (
              <LoadScript
                googleMapsApiKey={googleMapsApiKey}
                onLoad={() => setMapLoaded(true)}
                onError={(error) => {
                  console.error("Google Maps failed to load:", error);
                  toast.error("Failed to load Google Maps");
                }}
              >
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={mapCenter}
                  zoom={locations.length > 0 ? 8 : 5}
                  options={{
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                  }}
                >
                  {markers.map((marker, index) => (
                    <Marker
                      key={index}
                      position={marker.position}
                      label={marker.label}
                      onClick={() => removeLocation(index)}
                    />
                  ))}
                </GoogleMap>
              </LoadScript>
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <p className="mb-2">Google Maps not available</p>
                  <p className="text-sm">API key not configured</p>
                </div>
              </div>
            )}
            {errors.zipCodes && (
              <p className="text-red-500 text-xs mt-2">{errors.zipCodes}</p>
            )}
          </div>
        </div>

        <div className="bg-theme-bg2 flex flex-col gap-4 w-full p-8 rounded-2xl border border-border-info-color [&_label]:mb-2 [&_label]:text-white [&_*]:transition-all">
          <div className="grid">
            <label htmlFor="product_name">Product Name</label>
            <input
              required
              id="product_name"
              placeholder="e.g (Modern Abstract Painting)"
              type="text"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              value={formData.name}
              className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color placeholder-body-text-color text-slate-300 bg-theme-bg"
            />
          </div>

          <div className="relative md:col-span-3">
            <label
              htmlFor="zipCodes"
              className="block text-sm font-medium text-white-700 mb-1"
            >
              Campaign Post / Zip Codes (separated by commas)*
            </label>
            <input
              type="text"
              id="zipCodes"
              value={inputValue}
              readOnly
              onChange={handleZipCodesChange}
              placeholder="Enter zip codes separated by commas (e.g., 400001, 400002, SW1A 1AA)"
              className="w-full px-3 py-2 bg-theme-bg border border-border-info-color rounded-md text-white focus:border-theme-color outline-none"
            />
            {errors.zipCodes && (
              <p className="text-red-500 text-xs mt-1">{errors.zipCodes}</p>
            )}
          </div>

          <div className="relative">
            <label
              htmlFor="locationSearch"
              className="block text-sm font-medium text-white-700 mb-1"
            >
              Search Location to Add
            </label>
            <div className="relative w-full">
              <input
                type="text"
                id="locationSearch"
                value={query}
                onChange={handleInputChange}
                placeholder="Search for a location to add to route"
                className="w-full pl-3 pr-10 py-2 h-12 bg-theme-bg rounded-md text-sm text-white bg-[#0E294D] placeholder-gray-400 outline-none border border-border-info-color"
                //className="search-input w-full bg-theme-bg border border-border-info-color rounded-md px-4 py-2 text-white focus:border-theme-color outline-none"
              />
              <BiCurrentLocation
                size={24}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white"
                onClick={getCurrentLocation}
                aria-label="Get current location"
                tabIndex={0}
              />
              {loading && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2 w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              )}
              {suggestions.length > 0 && (
                <ul className="absolute top-full left-0 w-full z-50 rounded-md border border-gray-300 bg-theme-bg text-sm shadow-lg max-h-48 overflow-y-auto mt-1">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => handleLocationSelect(suggestion)}
                      className="cursor-pointer p-2 hover:bg-theme-color hover:text-white text-white border-b border-gray-600"
                    >
                      {suggestion.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Display selected locations */}
          {locations.length > 0 && (
            <div className="text-white">
              <h4 className="text-sm font-medium text-white mb-2">
                Selected Route Locations ({locations.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {locations.map((loc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between  p-3 rounded-md text-white -info-color"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2 break-words">
                        {index + 1}. {loc.name}
                      </p>
                      {loc.zip && (
                        <p className="text-xs text-gray-300">Zip: {loc.zip}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLocation(index)}
                      className="ml-2 text-red-400 hover:text-red-300 flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-4 mlg:grid-cols-1 text-white date-time-picker">
            <div className="grid">
              <label htmlFor="start_time">Auction Start Time</label>
              <input
                required
                id="startTime"
                type="datetime-local"
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                value={formData.startTime}
                className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color placeholder-body-text-color text-white-300 bg-theme-bg"
              />
            </div>
            <div className="grid">
              <label htmlFor="end_time">Auction End Time</label>
              <input
                required
                id="endTime"
                type="datetime-local"
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                value={formData.endTime}
                className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color placeholder-body-text-color text-white-300 bg-theme-bg"
              />
            </div>
          </div>
          <div className="bg-theme-bg2 p-4 rounded-md border border-gray-200 mt-6">
            <h4 className="font-medium text-white mb-3">
              Auction Starting Rates (Minimum Bid per sqm) *
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
                  placeholder={`e.g. ${currency}100`}
                  className="w-full px-3 py-2 border bg-theme-bg border-gray-300 rounded-md text-white"
                  value={formData.auctionRateFullWrap || ""}
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
                  placeholder={`e.g. ${currency}30`}
                  className="w-full px-3 py-2 border bg-theme-bg border-gray-300 rounded-md text-white"
                  value={formData.auctionRateOneSide || ""}
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
                  placeholder={`e.g. ${currency}60`}
                  className="w-full px-3 py-2 border bg-theme-bg border-gray-300 rounded-md text-white"
                  value={formData.auctionRateBothSides || ""}
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
                  placeholder={`e.g. ${currency}20`}
                  className="w-full px-3 py-2 border bg-theme-bg border-gray-300 rounded-md text-white"
                  value={formData.auctionRateRearDoors || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="grid text-white">
            <label htmlFor="description">Description</label>
            <textarea
              placeholder="Describe your product, art, etc."
              required
              id="description"
              rows="7"
              className="outline-none bg-theme-bg rounded-xl px-3 py-4 border border-border-info-color focus:border-theme-color placeholder-body-text-color text-white-300"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              value={formData.description}
            />
          </div>

          <div className="grid text-white">
            <label htmlFor="vehicleType">Vehicle Type</label>
            <select
              id="vehicleType"
              value={formData.vehicleType}
              required
              className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color bg-theme-bg text-white-300 cursor-pointer"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  vehicleType: e.target.value,
                  vehicle: { ...initialVehicleState },
                });

                setImgUrls([]);
                setImageFiles([]);
              }}
            >
              <option value="">Select Vehicle Type</option>
              {filteredOptions.vehicleTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 text-white">
            <div className="grid">
              <label htmlFor="model">Vehicle Model</label>
              <select
                id="model"
                disabled={!formData.vehicleType}
                required
                value={formData.vehicle?.model || ""}
                className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color bg-theme-bg text-white-300 cursor-pointer"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vehicle: {
                      ...formData.vehicle,
                      model: e.target.value,
                      manufacturer: "",
                      yearofmanufacture: "",
                      country: "",
                      dimensions: {
                        length: "",
                        width: "",
                        height: "",
                        wheelbase: "",
                        curbWeight: "",
                        cabheight: "",
                        cabwidth: "",
                        bonnetwidth: "",
                        bonnetLength: "",
                        engineSize: "",
                      },
                    },
                  })
                }
              >
                <option value="">Select Model</option>
                {filteredOptions.models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid text-white">
              <label htmlFor="manufacturer">Vehicle Manufacturer</label>
              <select
                id="manufacturer"
                required
                value={formData.vehicle?.manufacturer || ""}
                className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color bg-theme-bg text-white-300 cursor-pointer"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vehicle: {
                      ...formData.vehicle,
                      manufacturer: e.target.value,
                      yearofmanufacture: "",
                      country: "",
                    },
                  })
                }
                disabled={!formData.vehicle?.model}
              >
                <option value="">Select Manufacturer</option>
                {filteredOptions.manufacturers.map((manufacturer) => (
                  <option key={manufacturer} value={manufacturer}>
                    {manufacturer}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 text-white">
            <div className="grid">
              <label htmlFor="yearofmanufacture">Year of Manufacturer</label>
              <select
                id="yearofmanufacture"
                required
                value={formData.vehicle?.yearofmanufacture || ""}
                className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color bg-theme-bg text-white-300 cursor-pointer"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vehicle: {
                      ...formData.vehicle,
                      yearofmanufacture: e.target.value,
                      country: "",
                    },
                  })
                }
                disabled={!formData.vehicle?.manufacturer}
              >
                <option value="">Select Year</option>
                {filteredOptions.years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid text-white">
              <label htmlFor="country">Vehicle Country</label>
              <select
                id="country"
                required
                value={formData.vehicle?.country || ""}
                className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color bg-theme-bg text-white-300 cursor-pointer"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vehicle: {
                      ...formData.vehicle,
                      country: e.target.value,
                    },
                  })
                }
                disabled={!formData.vehicle?.yearofmanufacture}
              >
                <option value="">Select Country</option>
                {filteredOptions.countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Camping Availability Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Camping Availability <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: "3 Months", field: "threeMonths" },
                { value: "6 Months", field: "sixMonths" },
                { value: "12 Months", field: "twelveMonths" },
                { value: "24 Months", field: "twentyFourMonths" },
              ].map(({ value, field }) => (
                <label
                  key={value}
                  className={`flex items-center justify-center cursor-pointer border rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200
          ${
            formData.campingAvailability[field] === "Available"
              ? "bg-blue-600 text-white border-blue-600 shadow-md"
              : "bg-theme-bg text-white border-gray-600 hover:bg-gray-700 hover:bg-theme-bg2"
          }`}
                >
                  <input
                    type="radio"
                    name="campingAvailability"
                    value={value}
                    checked={
                      formData.campingAvailability[field] === "Available"
                    }
                    onChange={handleChange}
                    className="hidden"
                  />
                  {value}
                </label>
              ))}
            </div>
            {/* Validation hidden input */}
            <input
              type="hidden"
              name="campingAvailabilityValidation"
              required
              value={
                formData.campingAvailability.threeMonths === "Available" ||
                formData.campingAvailability.sixMonths === "Available" ||
                formData.campingAvailability.twelveMonths === "Available" ||
                formData.campingAvailability.twentyFourMonths === "Available"
                  ? "valid"
                  : ""
              }
            />
            {errors.campingAvailability && (
              <p className="text-red-500 text-sm mt-1">
                {errors.campingAvailability}
              </p>
            )}
          </div>
          <h3 className="text-white mt-4 mb-2">
            Dimensions (Auto-filled when vehicle is selected)
          </h3>

          <div className="grid lg:grid-cols-2 gap-4 text-white">
            {[
              { id: "length", label: "Length" },
              { id: "width", label: "Width" },
              { id: "height", label: "Height" },
              { id: "wheelbase", label: "Wheelbase" },
              { id: "cabwidth", label: "Cab Width" },
              { id: "cabheight", label: "Cab Height" },
              { id: "bonnetwidth", label: "Bonnet Width" },
              { id: "bonnetLength", label: "Bonnet Length" },
              { id: "curbWeight", label: "Curb Weight", unit: "kg" },
              { id: "engineSize", label: "Engine Size", unit: "cc" },
            ].map(({ id, label, unit }) => (
              <div className="grid" key={id}>
                <label htmlFor={id}>{label}</label>
                <input
                  required
                  disabled
                  id={id}
                  placeholder={`e.g. in ${unit || "cm"}`}
                  type="number"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicle: {
                        ...formData.vehicle,
                        dimensions: {
                          ...formData.vehicle.dimensions,
                          [id]: e.target.value,
                        },
                      },
                    })
                  }
                  value={formData.vehicle?.dimensions?.[id] || ""}
                  className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color placeholder-body-text-color text-white-300 bg-theme-bg"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="px-3 py-4 rounded-xl text-white cursor-pointer font-bold tracking-wide w-full bg-theme-color hover:bg-color-danger flex justify-center items-center"
            disabled={uploadLoading}
          >
            {uploadLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadItem;

// import { useEffect, useRef, useState, useMemo, useCallback } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   createAuction,
//   reset,
//   createAuctionsFromCSV,
// } from "../store/auction/auctionSlice";
// import { getAllCategories } from "../store/category/categorySlice";
// import { getAllCities } from "../store/city/citySlice";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import _ from "lodash";
// import "react-toastify/dist/ReactToastify.css";
// import { IoCloudUploadOutline, IoDocumentTextOutline } from "react-icons/io5";
// import { BiCurrentLocation } from "react-icons/bi";
// import axios from "axios";
// import { FaSpinner } from "react-icons/fa";
// import { fetchCommission } from "../store/commission/commissionSlice";
// import axiosInstance from "../axiosInstance";
// import countryList from "react-select-country-list";
// import Papa from "papaparse";
// import { fetchVehicles } from "../store/vehicle/vehicleSlice";
// import {
//   GoogleMap,
//   LoadScript,
//   Marker,
//   DirectionsService,
//   DirectionsRenderer,
// } from "@react-google-maps/api";
// import { fetchUserCountry } from "../store/countary/countrySlice";
// const UploadItem = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);
//   const { auction, isLoading, isError, isSuccess, message } = useSelector(
//     (state) => state.auction
//   );
//   const { Buyerrate, SelerRate } = useSelector((state) => state.commission);
//   const { categories } = useSelector((state) => state.category);
//   const { cities } = useSelector((state) => state.city);
//   const { list: vehicles } = useSelector((state) => state.vehicles);

//   const [imgUrls, setImgUrls] = useState([]);
//   const [query, setQuery] = useState("");
//   const [inputValue, setInputValue] = useState(""); // New state for zip code input
//   const [loading, setLoading] = useState(false);
//   const [suggestions, setSuggestions] = useState([]);
//   const [commission, setCommission] = useState(10);
//   const [isVerified, setIsVerified] = useState(false);
//   const [verificationChecked, setVerificationChecked] = useState(false);
//   const [uploadLoading, setUploadLoading] = useState(false);
//   const [csvLoading, setCsvLoading] = useState(false);
//   const [zipCodes, setZipCodes] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const [errors, setErrors] = useState({ zipCodes: "" });
//   const [mapLoaded, setMapLoaded] = useState(false);
//   const [directions, setDirections] = useState(null);
//   const [directionsServiceOptions, setDirectionsServiceOptions] =
//     useState(null);
//   const [directionsRendererOptions, setDirectionsRendererOptions] =
//     useState(null);
// const { country, currency } = useSelector((state) => state.country);
//   const imgRef = useRef(null);
//   const csvRef = useRef(null);
//   const countries = countryList().getData();

//   const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
//   const defaultCenter = { lat: 8.811927, lng: 83.5581972 };
//   const containerStyle = {
//     width: "100%",
//     height: "400px",
//   };

//   useEffect(() => {
//     dispatch(fetchVehicles());
//     dispatch(getAllCategories());
//     dispatch(getAllCities());
//     dispatch(fetchCommission());

//     const checkVerification = async () => {
//       try {
//         if (user?.stripeAccountId) {
//           const response = await axiosInstance.get(
//             `/users/stripe-account-status/${user.stripeAccountId}`
//           );
//           setIsVerified(response.data.data.isVerified);
//         }
//         setVerificationChecked(true);
//       } catch (error) {
//         console.error("Error checking verification status:", error);
//         setVerificationChecked(true);
//       }
//     };

//     checkVerification();
//   }, [dispatch, user]);

//   useEffect(() => {
//     dispatch(reset());
//     if (isError && message) {
//       toast.error(message, { autoClose: 500 });
//       setUploadLoading(false);
//     } else if (isSuccess && auction && message) {
//       // Only show success toast if we're in an upload context
//       if (uploadLoading) {
//         toast.success(message, { autoClose: 500 });
//       }
//       setFormData({
//         name: "",
//         vehicleType: "",
//         startTime: "",
//         endTime: "",
//         location: { zip: "", name: "", latitude: "", longitude: "" },
//         startingPrice: "",
//         description: "",
//         vehicle: initialVehicleState,
//       });
//       setImgUrls([]);
//       setZipCodes([]);
//       setLocations([]);
//       setInputValue("");
//       setDirections(null);
//       setDirectionsServiceOptions(null);
//       setDirectionsRendererOptions(null);
//       setUploadLoading(false);
//     }
//   }, [isSuccess, isError, auction, message, dispatch, navigate, uploadLoading]);

//   useEffect(() => {
//     dispatch(fetchCommission());
//     return () => {
//       dispatch(reset());
//     };
//   }, [dispatch]);

//   useEffect(() => {
//     if (!country) {
//       dispatch(fetchUserCountry());
//     }
//   }, [dispatch, country]);

//   const initialVehicleState = {
//     model: "",
//     manufacturer: "",
//     yearofmanufacture: "",
//     country: "",
//     dimensions: {
//       length: "",
//       width: "",
//       height: "",
//       wheelbase: "",
//       curbWeight: "",
//       cabheight: "",
//       cabwidth: "",
//       bonnetwidth: "",
//       bonnetLength: "",
//       engineSize: "",
//     },
//   };

//   const [formData, setFormData] = useState({
//     name: "",
//     vehicleType: "",
//     startTime: "",
//     endTime: "",
//     location: {
//       zip: "",
//       name: "",
//       latitude: "",
//       longitude: "",
//     },
//     startingPrice: "",
//     description: "",
//     vehicle: initialVehicleState,
//   });

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
//     setInputValue(input); // Update input value immediately

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
//         location: newLocations[0]
//           ? {
//               zip: newLocations[0].zip,
//               name: newLocations[0].name,
//               latitude: newLocations[0].lat,
//               longitude: newLocations[0].lng,
//             }
//           : prev.location,
//       }));

//       if (newLocations.length >= 2) {
//         setDirectionsServiceOptions({
//           origin: newLocations[0].formattedAddress,
//           destination: newLocations[newLocations.length - 1].formattedAddress,
//           travelMode: "DRIVING",
//           waypoints: newLocations
//             .slice(1, -1)
//             .map((loc) => ({ location: loc.formattedAddress, stopover: true })),
//         });
//         setDirectionsRendererOptions({
//           directions: null,
//         });
//       } else {
//         setDirections(null);
//         setDirectionsServiceOptions(null);
//         setDirectionsRendererOptions(null);
//       }
//     } catch (error) {
//       console.error("Error processing zip codes:", error);
//       setErrors((prev) => ({
//         ...prev,
//         zipCodes: "Error processing zip codes. Please try again.",
//       }));
//     }
//   };

//   const removeLocation = (index) => {
//     const newZipCodes = [...zipCodes];
//     const newLocations = [...locations];
//     newZipCodes.splice(index, 1);
//     newLocations.splice(index, 1);
//     setZipCodes(newZipCodes);
//     setLocations(newLocations);
//     setInputValue(newZipCodes.join(", ")); // Update input value
//     setFormData((prev) => ({
//       ...prev,
//       zipCodes: newZipCodes,
//       locations: newLocations.map((loc) => ({
//         name: loc.name || "",
//         zip: loc.zip || "",
//         location: loc.location,
//       })),
//       location: newLocations[0]
//         ? {
//             zip: newLocations[0].zip,
//             name: newLocations[0].name,
//             latitude: newLocations[0].lat,
//             longitude: newLocations[0].lng,
//           }
//         : { zip: "", name: "", latitude: "", longitude: "" },
//     }));

//     if (newLocations.length >= 2) {
//       setDirectionsServiceOptions({
//         origin: newLocations[0].formattedAddress,
//         destination: newLocations[newLocations.length - 1].formattedAddress,
//         travelMode: "DRIVING",
//         waypoints: newLocations
//           .slice(1, -1)
//           .map((loc) => ({ location: loc.formattedAddress, stopover: true })),
//       });
//       setDirectionsRendererOptions({
//         directions: null,
//       });
//     } else {
//       setDirections(null);
//       setDirectionsServiceOptions(null);
//       setDirectionsRendererOptions(null);
//     }
//   };

//   const mapCenter = useMemo(() => {
//     return locations.length > 0 ? locations[0] : defaultCenter;
//   }, [locations]);

//   const markers = useMemo(() => {
//     return locations.map((loc, index) => ({
//       position: { lat: loc.lat, lng: loc.lng },
//       label: (index + 1).toString(),
//     }));
//   }, [locations]);

//   const directionsCallback = useCallback((response) => {
//     if (response !== null && response.status === "OK") {
//       setDirections(response);
//       setDirectionsRendererOptions({ directions: response });
//     } else {
//       console.error("Directions request failed:", response?.status);
//       toast.error(
//         "Failed to calculate route. Please check the entered zip codes."
//       );
//     }
//   }, []);

//   const selectedVehicleType = formData.vehicleType;
//   const selectedModel = formData.vehicle?.model;
//   const selectedManufacturer = formData.vehicle?.manufacturer;
//   const selectedYear = formData.vehicle?.yearofmanufacture;

//   const filteredOptions = useMemo(() => {
//     let filtered = vehicles || [];

//     const vehicleTypes = [...new Set(filtered.map((v) => v.vehicle))].sort();

//     if (selectedVehicleType) {
//       filtered = filtered.filter((v) => v.vehicle === selectedVehicleType);
//     }
//     const models = [...new Set(filtered.map((v) => v.model))].sort();

//     if (selectedModel) {
//       filtered = filtered.filter((v) => v.model === selectedModel);
//     }

//     const manufacturers = [
//       ...new Set(filtered.map((v) => v.manufacturer)),
//     ].sort();
//     if (selectedManufacturer) {
//       filtered = filtered.filter(
//         (v) => v.manufacturer === selectedManufacturer
//       );
//     }
//     const years = [...new Set(filtered.map((v) => v.yearOfManufacture))].sort(
//       (a, b) => b - a
//     );

//     const countries = [...new Set(vehicles.map((v) => v.country))].sort();

//     return {
//       vehicleTypes,
//       models,
//       manufacturers,
//       years,
//       countries,
//       filteredVehicles: filtered,
//     };
//   }, [
//     vehicles,
//     selectedVehicleType,
//     selectedModel,
//     selectedManufacturer,
//     selectedYear,
//   ]);

//   useEffect(() => {
//     if (
//       selectedVehicleType &&
//       selectedModel &&
//       selectedManufacturer &&
//       selectedYear
//     ) {
//       const matchedVehicle = vehicles.find(
//         (v) =>
//           v.vehicle === selectedVehicleType &&
//           v.model === selectedModel &&
//           v.manufacturer === selectedManufacturer &&
//           v.yearOfManufacture == selectedYear
//       );

//       if (matchedVehicle && matchedVehicle.dimensions) {
//         setFormData((prevData) => ({
//           ...prevData,
//           vehicle: {
//             ...prevData.vehicle,
//             dimensions: {
//               length: matchedVehicle.dimensions.length || "",
//               width: matchedVehicle.dimensions.width || "",
//               height: matchedVehicle.dimensions.height || "",
//               wheelbase: matchedVehicle.dimensions.wheelbase || "",
//               curbWeight: matchedVehicle.dimensions.curbWeight || "",
//               cabheight: matchedVehicle.dimensions.cabheight || "",
//               cabwidth: matchedVehicle.dimensions.cabwidth || "",
//               bonnetwidth: matchedVehicle.dimensions.bonnetwidth || "",
//               bonnetLength: matchedVehicle.dimensions.bonnetLength || "",
//               engineSize: matchedVehicle.dimensions.engineSize || "",
//             },
//           },
//         }));
//       }
//     }
//   }, [
//     selectedVehicleType,
//     selectedModel,
//     selectedManufacturer,
//     selectedYear,
//     vehicles,
//   ]);

//   const handleProductUpload = async (e) => {
//     e.preventDefault();
//     setUploadLoading(true);

//     if (!isVerified) {
//       toast.error("Please complete your account verification first");
//       navigate("/user-profile/SellerOnboarding");
//       setUploadLoading(false);
//       return;
//     }

//     if (!imgRef.current.files[0]) {
//       toast.error("At least one image is required");
//       setUploadLoading(false);
//       return;
//     }

//     const data = new FormData();
//     data.append("name", formData.name);
//     data.append("description", formData.description);
//     data.append("vehicleType", formData.vehicleType);
//     data.append("startTime", formData.startTime);
//     data.append("endTime", formData.endTime);
//     data.append("startingPrice", formData.startingPrice);

//     data.append("location[zip]", formData.location.zip || "");
//     data.append("location[name]", formData.location.name || "");
//     data.append("location[latitude]", formData.location.latitude || "");
//     data.append("location[longitude]", formData.location.longitude || "");

//     const sanitizedLocations = locations.map((loc) => ({
//       name: loc.name || "",
//       zip: loc.zip || "",
//       type: "Point",
//       coordinates: [loc.lng || 0, loc.lat || 0],
//     }));

//     data.append("additionalLocations", JSON.stringify(sanitizedLocations));

//     data.append("vehicle[country]", formData.vehicle?.country || "");
//     data.append(
//       "vehicle[yearofmanufacture]",
//       formData.vehicle?.yearofmanufacture || ""
//     );
//     data.append("vehicle[manufacturer]", formData.vehicle?.manufacturer || "");
//     data.append("vehicle[model]", formData.vehicle?.model || "");

//     const dimensions = formData.vehicle?.dimensions || {};
//     Object.entries(dimensions).forEach(([key, value]) => {
//       data.append(`vehicle[dimensions][${key}]`, value || "");
//     });

//     data.append(
//       "vehicle[manufacturerLink]",
//       formData.vehicle?.manufacturerLink || ""
//     );

//     const files = Array.from(imgRef.current.files).slice(0, 3);
//     for (const file of files) {
//       if (file.size > 1024 * 1024) {
//         toast.error(`Image ${file.name} size should be less than 1MB`);
//         setUploadLoading(false);
//         return;
//       }
//       data.append("images", file);
//     }

//     try {
//       const response = await dispatch(createAuction(data)).unwrap();

//       navigate("/user-profile/manage-items");
//     } catch (error) {
//       console.error("Auction creation error:", error);
//       setUploadLoading(false);
//       toast.error("Error creating auction: " + error.message);
//     }
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

//   const handleImageUpload = (e) => {
//     const files = Array.from(e.target.files).slice(0, 3);
//     const newImageUrls = files.map((file) => URL.createObjectURL(file));
//     setImgUrls(newImageUrls);
//   };
// const removeImage = (index) => {
//   setImgUrls((prev) => prev.filter((_, i) => i !== index));
// };
//   const handleInputChange = (e) => {
//     const value = e.target.value;
//     setQuery(value);
//     debounceRef.current(value);
//   };

//   const handleLocationSelect = async (location) => {
//     const zip = location.address?.postcode || "";
//     setQuery(location.display_name);
//     const newZipCodes = [...new Set([...zipCodes, zip])].filter(Boolean);
//     setZipCodes(newZipCodes);
//     setInputValue(newZipCodes.join(", ")); // Update input value

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
//       location: updatedLocations[0]
//         ? {
//             zip: updatedLocations[0].zip,
//             name: updatedLocations[0].name,
//             latitude: updatedLocations[0].lat,
//             longitude: updatedLocations[0].lng,
//           }
//         : prev.location,
//     }));
//     setSuggestions([]);
//     setQuery("");
//   };

//   const getCurrentLocation = () => {
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

//             setFormData((prevData) => ({
//               ...prevData,
//               location: {
//                 name: data.display_name,
//                 zip: data.address.postcode || "",
//                 latitude,
//                 longitude,
//               },
//             }));
//             setQuery(data.display_name);
//             const newZip = data.address.postcode || "";
//             setZipCodes([newZip]);
//             setInputValue(newZip); // Update input value
//             setLocations([
//               {
//                 lat: latitude,
//                 lng: longitude,
//                 name: data.display_name,
//                 zip: newZip,
//                 location: {
//                   type: "Point",
//                   coordinates: [longitude, latitude],
//                 },
//               },
//             ]);
//             setLoading(false);
//           } catch (error) {
//             setLoading(false);
//             console.error("Error fetching current location:", error);
//             toast.error("Error fetching current location");
//           }
//         },
//         (error) => {
//           setLoading(false);
//           console.error("Geolocation error:", error);
//           toast.error("Unable to access location. Please try again.");
//         }
//       );
//     } else {
//       setLoading(false);
//       toast.error("Geolocation is not supported by your browser.");
//     }
//   };

//   const handleCSVUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setCsvLoading(true);

//     try {
//       Papa.parse(file, {
//         header: true,
//         complete: async (results) => {

//           const csvData = results.data
//             .filter((row) => Object.values(row).some((val) => val))
//             .map((row) => {
//               const convertToIST = (dateString) => {
//                 if (!dateString) return null;
//                 const date = new Date(dateString);
//                 return new Date(
//                   date.getTime() + 5.5 * 60 * 60 * 1000
//                 ).toISOString();
//               };

//               const parseNumericValue = (value) => {
//                 if (value === null || value === undefined || value === "") {
//                   return 0;
//                 }
//                 const parsed = parseFloat(value);
//                 return isNaN(parsed) ? 0 : parsed;
//               };

//               return {
//                 name: row.name,
//                 description: row.description,
//                 category: row.category,
//                 vehicleType: row.vehicleType,
//                 startTime: convertToIST(row.startTime),
//                 endTime: convertToIST(row.endTime),
//                 startingPrice: parseFloat(row.startingPrice),
//                 location: {
//                   zip: row["location.zip"],
//                   name: row["location.name"],
//                 },
//                 images: row.images
//                   ? row.images.split(",").map((url) => url.trim())
//                   : [],
//                 vehicle: {
//                   country: row["vehicle.country"],
//                   yearofmanufacture: row["vehicle.yearofmanufacture"],
//                   manufacturer: row["vehicle.manufacturer"],
//                   model: row["vehicle.model"],
//                   dimensions: {
//                     length: parseNumericValue(row["vehicle.dimensions.length"]),
//                     width: parseNumericValue(row["vehicle.dimensions.width"]),
//                     height: parseNumericValue(row["vehicle.dimensions.height"]),
//                     wheelbase: parseNumericValue(
//                       row["vehicle.dimensions.wheelbase"]
//                     ),
//                     curbWeight: parseNumericValue(
//                       row["vehicle.dimensions.curbWeight"]
//                     ),
//                     engineSize: parseNumericValue(
//                       row["vehicle.dimensions.engineSize"]
//                     ),
//                     cabwidth: parseNumericValue(
//                       row["vehicle.dimensions.cabwidth"]
//                     ),
//                     cabheight: parseNumericValue(
//                       row["vehicle.dimensions.cabheight"]
//                     ),
//                     bonnetwidth: parseNumericValue(
//                       row["vehicle.dimensions.bonnetwidth"]
//                     ),
//                     bonnetLength: parseNumericValue(
//                       row["vehicle.dimensions.bonnetLength"]
//                     ),
//                   },
//                   manufacturerLink: row["vehicle.manufacturerLink"] || "",
//                 },
//               };
//             });

//           if (csvData.length === 0) {
//             toast.error("CSV file is empty or invalid format");
//             setCsvLoading(false);
//             return;
//           }

//           const response = await dispatch(
//             createAuctionsFromCSV(csvData)
//           ).unwrap();

//           setCsvLoading(false);

//           if (response.error) {
//             toast.error(
//               "Error uploading CSV: " +
//                 (response.payload?.message || "Unknown error")
//             );
//           } else {
//             const resultData = response.payload?.data;

//             if (resultData?.errorCount > 0) {
//               toast.warning(
//                 `Successfully created ${resultData.successCount} items, ` +
//                   `${resultData.errorCount} failed`
//               );
//               console.error("CSV errors:", resultData.errors);
//             } else {
//               toast.success(
//                 `Successfully uploaded ${resultData.successCount} items from CSV`
//               );
//               navigate("/user-profile/manage-items");
//             }
//           }
//         },
//         error: (error) => {
//           console.error("CSV parsing error:", error);
//           toast.error("Error parsing CSV: " + error.message);
//           setCsvLoading(false);
//         },
//       });
//     } catch (error) {
//       console.error("Error processing CSV:", error);
//       toast.error("Error processing CSV: " + error.message);
//       setCsvLoading(false);
//     } finally {
//       setCsvLoading(false);
//       e.target.value = "";
//     }
//   };

//   const currentYear = new Date().getFullYear();
//   const years = Array.from(new Array(50), (val, index) => currentYear - index);

//   if (!verificationChecked) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-color"></div>
//       </div>
//     );
//   }

//   if (!isVerified) {
//     setTimeout(() => {
//       navigate("/user-profile/SellerOnboarding");
//     }, 100);
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-white bg-theme-bg p-6 rounded-xl">
//           Redirecting to verification page...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div>
//       {uploadLoading && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
//             <FaSpinner className="text-4xl text-blue-500 animate-spin mb-4" />
//             <p className="text-lg font-semibold">Uploading your item...</p>
//           </div>
//         </div>
//       )}

//       <p className="text-center text-xl font-semibold text-theme-color mt-10 mb-6 tracking-wide">
//         The general manager is entitled to a commission of
//         <span className="inline-block text-2xl font-bold text-yellow-500 mx-1">
//           {SelerRate}%
//         </span>
//         , calculated after deducting the commission charges.
//       </p>
//       <form
//         className="flex flex-col lg:flex-row gap-8 justify-center w-full max-w-7xl m-auto px-4 py-20"
//         onSubmit={handleProductUpload}
//       >
//         <div className="text-blue lg:w-1/4 lg:min-w-[350px]">
//           <h1 className="text-blue text-2xl font-bold mb-4">Upload Item</h1>

//           {imgUrls.length > 0 ? (
//             <div className="space-y-4">
//               <div className="relative w-full h-80 rounded-lg border-2 border-solid p-2 overflow-hidden">
//                 <div className="flex flex-col space-y-4 h-full overflow-y-auto">
//                   {imgUrls.map((url, index) => (
//                     <div
//                       key={index}
//                       className="relative w-full h-64 flex-shrink-0"
//                     >
//                       <img
//                         src={url}
//                         alt={`upload ${index}`}
//                         className="w-full h-full object-contain"
//                         onClick={() => imgRef.current.click()}
//                       />
//                       <button
//                         type="button"
//                         onClick={() => removeImage(index)}
//                         className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
//                       >
//                         ✕
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => imgRef.current.click()}
//                 className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//               >
//                 Change Images
//               </button>
//             </div>
//           ) : (
//             <div
//               onClick={() => imgRef.current.click()}
//               className="w-full h-80 bg-theme-bg rounded-xl border-2 border-dashed border-border-info-color flex items-center justify-center cursor-pointer hover:bg-theme-bg2 transition-colors"
//             >
//               <div className="text-center flex flex-col items-center gap-2 text-white">
//                 <IoCloudUploadOutline size={68} className="text-theme-color" />
//                 <p>Click to Upload Vehicle Images</p>
//                 <span className="text-white text-sm">
//                   PNG, JPG, JPEG | Max Size 1MB | Max 3 Images
//                 </span>
//               </div>
//             </div>
//           )}
//           {errors.images && (
//             <p className="text-red-500 text-xs mt-2">{errors.images}</p>
//           )}
//           <input
//             type="file"
//             className="hidden"
//             onChange={handleImageUpload}
//             ref={imgRef}
//             accept=".png,.jpg,.jpeg,image/png,image/jpg,image/jpeg"
//             multiple
//           />

//           <div className="bg-theme-bg2 p-4 rounded-lg mt-4 text-white">
//             <h3 className="text-lg font-semibold mb-4 text-white-700">
//               Route Map
//             </h3>
//             {googleMapsApiKey ? (
//               <LoadScript
//                 googleMapsApiKey={googleMapsApiKey}
//                 onLoad={() => setMapLoaded(true)}
//                 onError={(error) => {
//                   console.error("Google Maps failed to load:", error);
//                   toast.error("Failed to load Google Maps");
//                 }}
//               >
//                 <GoogleMap
//                   mapContainerStyle={containerStyle}
//                   center={mapCenter}
//                   zoom={locations.length > 0 ? 8 : 5}
//                   options={{
//                     zoomControl: true,
//                     streetViewControl: false,
//                     mapTypeControl: false,
//                     fullscreenControl: false,
//                   }}
//                 >
//                   {markers.map((marker, index) => (
//                     <Marker
//                       key={index}
//                       position={marker.position}
//                       label={marker.label}
//                       onClick={() => removeLocation(index)}
//                     />
//                   ))}
//                   {directionsServiceOptions && (
//                     <DirectionsService
//                       options={directionsServiceOptions}
//                       callback={directionsCallback}
//                     />
//                   )}
//                   {directionsRendererOptions && (
//                     <DirectionsRenderer options={directionsRendererOptions} />
//                   )}
//                 </GoogleMap>
//               </LoadScript>
//             ) : (
//               <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
//                 <div className="text-center text-gray-600">
//                   <p className="mb-2">Google Maps not available</p>
//                   <p className="text-sm">API key not configured</p>
//                 </div>
//               </div>
//             )}
//             {errors.zipCodes && (
//               <p className="text-red-500 text-xs mt-2">{errors.zipCodes}</p>
//             )}
//           </div>
//         </div>

//         <div className="bg-theme-bg flex flex-col gap-4 w-full p-8 rounded-2xl border border-border-info-color [&_label]:mb-2 [&_label]:text-white [&_*]:transition-all">
//           <div className="grid">
//             <div className="flex justify-end gap-4 mt-4">
//               <button
//                 onClick={() => csvRef.current.click()}
//                 className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
//                 disabled={csvLoading}
//               >
//                 {csvLoading ? (
//                   <FaSpinner className="animate-spin" />
//                 ) : (
//                   <>
//                     <IoDocumentTextOutline size={20} />
//                     Upload CSV
//                   </>
//                 )}
//               </button>

//               <input
//                 type="file"
//                 ref={csvRef}
//                 onChange={handleCSVUpload}
//                 accept=".csv"
//                 className="hidden"
//               />
//             </div>
//             <label htmlFor="product_name">Product Name</label>
//             <input
//               required
//               id="product_name"
//               placeholder="e.g (Modern Abstract Painting)"
//               type="text"
//               onChange={(e) =>
//                 setFormData({ ...formData, name: e.target.value })
//               }
//               value={formData.name}
//               className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color placeholder-body-text-color text-slate-300 bg-theme-bg2"
//             />
//           </div>

//           <div className="grid">
//             <label htmlFor="zipCodes">Zip Codes (comma-separated)</label>
//             <div className="flex items-center gap-2 text-white">
//               <input
//                 id="zipCodes"
//                 type="text"
//                 placeholder="e.g. 12345, 67890"
//                 onChange={handleZipCodesChange}
//                 value={inputValue}
//                 className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color placeholder-body-text-color text-white-300 w-full bg-theme-bg2"
//               />
//               <button
//                 type="button"
//                 onClick={getCurrentLocation}
//                 className="p-2 bg-theme-color rounded-lg"
//                 disabled={loading}
//               >
//                 <BiCurrentLocation size={20} className="text-white" />
//               </button>
//             </div>
//             {errors.zipCodes && (
//               <p className="text-red-500 text-xs mt-1">{errors.zipCodes}</p>
//             )}
//             {suggestions.length > 0 && (
//               <ul className="bg-theme-bg border border-border-info-color rounded-lg mt-2 max-h-40 overflow-y-auto">
//                 {suggestions.map((suggestion, index) => (
//                   <li
//                     key={index}
//                     className="p-2 hover:bg-theme-color hover:text-white cursor-pointer"
//                     onClick={() => handleLocationSelect(suggestion)}
//                   >
//                     {suggestion.display_name}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//           {locations.length > 0 && (
//             <div className="md:col-span-3 text-white">
//               <h4 className="text-sm font-medium text-white-700 mb-2">
//                 Selected Route Locations
//               </h4>
//               <ul className="space-y-2">
//                 {locations.map((loc, index) => (
//                   <li
//                     key={index}
//                     className="flex items-center justify-between bg-theme-bg2 p-2 rounded-md text-white"
//                   >
//                     <span>
//                       {loc.name} (Zip: {loc.zip || "N/A"})
//                     </span>
//                     <button
//                       type="button"
//                       onClick={() => removeLocation(index)}
//                       className="text-red-500 hover:text-red-700"
//                     >
//                       Remove
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//           <div className="grid lg:grid-cols-2 gap-4 mlg:grid-cols-1 text-white">
//             <div className="grid">
//               <label htmlFor="start_time">Auction Start Time</label>
//               <input
//                 required
//                 id="startTime"
//                 type="datetime-local"
//                 onChange={(e) =>
//                   setFormData({ ...formData, startTime: e.target.value })
//                 }
//                 value={formData.startTime}
//                 className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color placeholder-body-text-color text-white-300 bg-theme-bg2"
//               />
//             </div>
//             <div className="grid">
//               <label htmlFor="end_time">Auction End Time</label>
//               <input
//                 required
//                 id="endTime"
//                 type="datetime-local"
//                 onChange={(e) =>
//                   setFormData({ ...formData, endTime: e.target.value })
//                 }
//                 value={formData.endTime}
//                 className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color placeholder-body-text-color text-black-300 bg-theme-bg2"
//               />
//             </div>
//           </div>

//           <div className="grid text-white">
//             <label htmlFor="starting_price">Starting Price per M²</label>
//             <input
//               required
//               id="starting_price"
//               type="number"
//               placeholder={`${currency} Enter price`}
//               onChange={(e) =>
//                 setFormData({ ...formData, startingPrice: e.target.value })
//               }
//               value={formData.startingPrice}
//               className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color placeholder-body-text-color text-white-300 bg-theme-bg2"
//             />
//           </div>

//           <div className="grid text-white">
//             <label htmlFor="description">Description</label>
//             <textarea
//               placeholder="Describe your product, art, etc."
//               required
//               id="description"
//               rows="7"
//               className="outline-none bg-theme-bg2 rounded-xl px-3 py-4 border border-border-info-color focus:border-theme-color placeholder-body-text-color text-white-300 "
//               onChange={(e) =>
//                 setFormData({ ...formData, description: e.target.value })
//               }
//               value={formData.description}
//             />
//           </div>

//           <div className="grid text-white">
//             <label htmlFor="vehicleType">Vehicle Type</label>
//             <select
//               id="vehicleType"
//               value={formData.vehicleType}
//               required
//               className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color bg-theme-bg2 text-white-300 cursor-pointer"
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   vehicleType: e.target.value,
//                   vehicle: { ...initialVehicleState },
//                 })
//               }
//             >
//               <option value="">Select Vehicle Type</option>
//               {filteredOptions.vehicleTypes.map((type) => (
//                 <option key={type} value={type}>
//                   {type}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="grid lg:grid-cols-2 gap-4 text-white">
//             <div className="grid">
//               <label htmlFor="model">Vehicle Model</label>
//               <select
//                 id="model"
//                 disabled={!formData.vehicleType}
//                 required
//                 value={formData.vehicle?.model || ""}
//                 className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color bg-theme-bg2 text-white-300 cursor-pointer"
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     vehicle: {
//                       ...formData.vehicle,
//                       model: e.target.value,
//                       manufacturer: "",
//                       yearofmanufacture: "",
//                       country: "",
//                       dimensions: {
//                         length: "",
//                         width: "",
//                         height: "",
//                         wheelbase: "",
//                         curbWeight: "",
//                         cabheight: "",
//                         cabwidth: "",
//                         bonnetwidth: "",
//                         bonnetLength: "",
//                         engineSize: "",
//                       },
//                     },
//                   })
//                 }
//               >
//                 <option value="">Select Model</option>
//                 {filteredOptions.models.map((model) => (
//                   <option key={model} value={model}>
//                     {model}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="grid text-white">
//               <label htmlFor="manufacturer">Vehicle Manufacturer</label>
//               <select
//                 id="manufacturer"
//                 required
//                 value={formData.vehicle?.manufacturer || ""}
//                 className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color bg-theme-bg2 text-white-300 cursor-pointer"
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     vehicle: {
//                       ...formData.vehicle,
//                       manufacturer: e.target.value,
//                       yearofmanufacture: "",
//                       country: "",
//                     },
//                   })
//                 }
//                 disabled={!formData.vehicle?.model}
//               >
//                 <option value="">Select Manufacturer</option>
//                 {filteredOptions.manufacturers.map((manufacturer) => (
//                   <option key={manufacturer} value={manufacturer}>
//                     {manufacturer}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="grid lg:grid-cols-2 gap-4 text-white">
//             <div className="grid">
//               <label htmlFor="yearofmanufacture">Year of Manufacturer</label>
//               <select
//                 id="yearofmanufacture"
//                 required
//                 value={formData.vehicle?.yearofmanufacture || ""}
//                 className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color bg-theme-bg2 text-white-300 cursor-pointer"
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     vehicle: {
//                       ...formData.vehicle,
//                       yearofmanufacture: e.target.value,
//                       country: "",
//                     },
//                   })
//                 }
//                 disabled={!formData.vehicle?.manufacturer}
//               >
//                 <option value="">Select Year</option>
//                 {filteredOptions.years.map((year) => (
//                   <option key={year} value={year}>
//                     {year}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="grid text-white">
//               <label htmlFor="country">Vehicle Country</label>
//               <select
//                 id="country"
//                 required
//                 value={formData.vehicle?.country || ""}
//                 className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color bg-theme-bg2 text-white-300 cursor-pointer"
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     vehicle: {
//                       ...formData.vehicle,
//                       country: e.target.value,
//                     },
//                   })
//                 }
//                 disabled={!formData.vehicle?.yearofmanufacture}
//               >
//                 <option value="">Select Country</option>
//                 {filteredOptions.countries.map((country) => (
//                   <option key={country} value={country}>
//                     {country}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <h3 className="text-white mt-4 mb-2">
//             Dimensions (Auto-filled when vehicle is selected)
//           </h3>

//           <div className="grid lg:grid-cols-2 gap-4 text-white ">
//             {[
//               { id: "length", label: "Length" },
//               { id: "width", label: "Width" },
//               { id: "height", label: "Height" },
//               { id: "wheelbase", label: "Wheelbase" },
//               { id: "cabwidth", label: "Cab Width" },
//               { id: "cabheight", label: "Cab Height" },
//               { id: "bonnetwidth", label: "Bonnet Width" },
//               { id: "bonnetLength", label: "Bonnet Length" },
//               { id: "curbWeight", label: "Curb Weight", unit: "kg" },
//               { id: "engineSize", label: "Engine Size", unit: "cc" },
//             ].map(({ id, label, unit }) => (
//               <div className="grid" key={id}>
//                 <label htmlFor={id}>{label}</label>
//                 <input
//                   required
//                   disabled
//                   id={id}
//                   placeholder={`e.g. in ${unit || "cm"}`}
//                   type="number"
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       vehicle: {
//                         ...formData.vehicle,
//                         dimensions: {
//                           ...formData.vehicle.dimensions,
//                           [id]: e.target.value,
//                         },
//                       },
//                     })
//                   }
//                   value={formData.vehicle?.dimensions?.[id] || ""}
//                   className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color placeholder-body-text-color text-white-300 bg-theme-bg2"
//                 />
//               </div>
//             ))}
//           </div>

//           <button
//             type="submit"
//             className="px-3 py-4 rounded-xl text-white cursor-pointer font-bold tracking-wide w-full bg-theme-color hover:bg-color-danger flex justify-center items-center"
//             disabled={uploadLoading}
//           >
//             {uploadLoading ? (
//               <>
//                 <FaSpinner className="animate-spin mr-2" />
//                 Uploading...
//               </>
//             ) : (
//               "Upload"
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default UploadItem;
