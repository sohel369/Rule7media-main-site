import { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSingleAuctionById,
  reset,
  updateSingleAuction,
} from "../store/auction/auctionSlice.js";
import { getAllCategories } from "../store/category/categorySlice.js";
import { getAllCities } from "../store/city/citySlice.js";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchVehicles } from "../store/vehicle/vehicleSlice.js";
import { IoCloudUploadOutline } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import countryList from "react-select-country-list";
import axios from "axios";
import { BiCurrentLocation } from "react-icons/bi";
import _ from "lodash";

const EditAuction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { singleAuction, isLoading: auctionLoading } = useSelector(
    (state) => state.auction,
  );
  const { categories } = useSelector((state) => state.category);
  const { cities } = useSelector((state) => state.city);
  const { list: vehicles } = useSelector((state) => state.vehicles);

  const [imgUrls, setImgUrls] = useState([]);
  const [imgRefFiles, setImgRefFiles] = useState([]);
  const imgRef = useRef(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Location states
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [zipCodes, setZipCodes] = useState([]);
  const [locations, setLocations] = useState([]); // Only additional locations
  const [errors, setErrors] = useState({ zipCodes: "" });

  const countries = countryList().getData();
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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
    manufacturerLink: "",
  };

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    vehicleType: "",
    location: {
      zip: "",
      name: "",
      latitude: "",
      longitude: "",
      type: "Point",
    },
    vehicle: initialVehicleState,
    campingAvailability: {
      threeMonths: "Unavailable",
      sixMonths: "Unavailable",
      twelveMonths: "Unavailable",
      twentyFourMonths: "Unavailable",
    },
    additionalLocations: [],
    minAuctionRates: {
      fullWrap: "",
      oneSide: "",
      bothSides: "",
      rearDoors: "",
    },
  });

  useEffect(() => {
    dispatch(getSingleAuctionById(id));
    dispatch(getAllCategories());
    dispatch(getAllCities());
    dispatch(fetchVehicles());
  }, [id, dispatch]);

  useEffect(() => {
    if (singleAuction) {
      // Images
      if (singleAuction.images && singleAuction.images.length > 0) {
        const imageUrls = singleAuction.images.map((img) => img.url || img);
        setImgUrls(imageUrls);
      }

      // Main location
      const mainLoc = singleAuction.location || {};
      const mainCoords = mainLoc.coordinates || [];
      const mainLat = mainCoords[1] || "";
      const mainLng = mainCoords[0] || "";

      // Only additional locations in list
      const additionalLocs = [];
      if (
        singleAuction.additionalLocations &&
        singleAuction.additionalLocations.length > 0
      ) {
        singleAuction.additionalLocations.forEach((loc) => {
          const coords = loc.coordinates || [];
          additionalLocs.push({
            lat: coords[1] || "",
            lng: coords[0] || "",
            name: loc.name || "",
            zip: loc.zip || "",
          });
        });
      }

      setLocations(additionalLocs);
      const additionalZips = additionalLocs
        .map((loc) => loc.zip)
        .filter(Boolean);
      setZipCodes(additionalZips);
      setInputValue(additionalZips.join(", "));

      // Min Auction Rates
      const rates = singleAuction.minAuctionRates || {
        fullWrap: 0,
        oneSide: 0,
        bothSides: 0,
        rearDoors: 0,
      };

      setFormData({
        name: singleAuction.name || "",
        description: singleAuction.description || "",
        startTime: singleAuction.startTime
          ? new Date(singleAuction.startTime).toISOString().slice(0, 16)
          : "",
        endTime: singleAuction.endTime
          ? new Date(singleAuction.endTime).toISOString().slice(0, 16)
          : "",
        vehicleType: singleAuction.vehicleType || "",
        location: {
          zip: mainLoc.zip || "",
          name: mainLoc.name || "",
          latitude: mainLat,
          longitude: mainLng,
          type: "Point",
        },
        vehicle: singleAuction.vehicle || initialVehicleState,
        campingAvailability: singleAuction.campingAvailability || {
          threeMonths: "Unavailable",
          sixMonths: "Unavailable",
          twelveMonths: "Unavailable",
          twentyFourMonths: "Unavailable",
        },
        additionalLocations:
          singleAuction.additionalLocations?.map((loc) => ({
            zip: loc.zip || "",
            name: loc.name || "",
            latitude: loc.coordinates?.[1] || "",
            longitude: loc.coordinates?.[0] || "",
            type: "Point",
          })) || [],
        minAuctionRates: {
          fullWrap: rates.fullWrap || "",
          oneSide: rates.oneSide || "",
          bothSides: rates.bothSides || "",
          rearDoors: rates.rearDoors || "",
        },
      });
    }
  }, [singleAuction]);

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

    return { vehicleTypes, models, manufacturers, years, countries };
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
      const matched = vehicles.find(
        (v) =>
          v.vehicle === selectedVehicleType &&
          v.model === selectedModel &&
          v.manufacturer === selectedManufacturer &&
          v.yearOfManufacture == selectedYear,
      );
      if (matched?.dimensions) {
        setFormData((prev) => ({
          ...prev,
          vehicle: { ...prev.vehicle, dimensions: { ...matched.dimensions } },
        }));
      }
    }
  }, [
    selectedVehicleType,
    selectedModel,
    selectedManufacturer,
    selectedYear,
    vehicles,
  ]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "radio" && name === "campingAvailability") {
      const newCamping = {
        threeMonths: "Unavailable",
        sixMonths: "Unavailable",
        twelveMonths: "Unavailable",
        twentyFourMonths: "Unavailable",
      };
      if (value === "3 Months") newCamping.threeMonths = "Available";
      if (value === "6 Months") newCamping.sixMonths = "Available";
      if (value === "12 Months") newCamping.twelveMonths = "Available";
      if (value === "24 Months") newCamping.twentyFourMonths = "Available";

      setFormData((prev) => ({ ...prev, campingAvailability: newCamping }));
    } else if (name.includes(".")) {
      const keys = name.split(".");
      if (keys[0] === "vehicle" && keys[1] === "dimensions") {
        setFormData((prev) => ({
          ...prev,
          vehicle: {
            ...prev.vehicle,
            dimensions: { ...prev.vehicle.dimensions, [keys[2]]: value },
          },
        }));
      } else if (keys[0] === "vehicle") {
        setFormData((prev) => ({
          ...prev,
          vehicle: { ...prev.vehicle, [keys[1]]: value },
        }));
      } else if (keys[0] === "minAuctionRates") {
        setFormData((prev) => ({
          ...prev,
          minAuctionRates: { ...prev.minAuctionRates, [keys[1]]: value },
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const urls = files.map((file) => URL.createObjectURL(file));
    setImgUrls(urls);
    setImgRefFiles(files);
  };

  const removeImage = (index) => {
    setImgUrls((prev) => prev.filter((_, i) => i !== index));
    setImgRefFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const debounceRef = useRef(
    _.debounce(async (q) => {
      if (!q) return setSuggestions([]);
      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${q}&format=json&addressdetails=1&limit=5`,
        );
        setSuggestions(res.data);
      } catch (err) {
        console.error(err);
      }
    }, 1000),
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    debounceRef.current(val);
  };

  const geocodeAddress = async (address) => {
    try {
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
            result.address_components.find((c) =>
              c.types.includes("postal_code"),
            )?.long_name || address;
          return {
            lat,
            lng,
            formattedAddress: result.formatted_address,
            postalCode,
          };
        }
      }
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
        };
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  const handleZipCodesChange = async (e) => {
    const input = e.target.value;
    setInputValue(input);

    const zipArray = input
      .split(",")
      .map((z) => z.trim())
      .filter(Boolean);
    if (zipArray.length === 0) {
      setZipCodes([]);
      setLocations([]);
      return;
    }

    setZipCodes(zipArray);

    const newLocations = [];
    for (const zip of zipArray) {
      const data = await geocodeAddress(zip);
      if (data) {
        newLocations.push({
          lat: data.lat,
          lng: data.lng,
          name: data.formattedAddress,
          zip: data.postalCode,
        });
      }
    }

    setLocations(newLocations);

    setFormData((prev) => ({
      ...prev,
      additionalLocations: newLocations.map((loc) => ({
        zip: loc.zip,
        name: loc.name,
        latitude: loc.lat,
        longitude: loc.lng,
        type: "Point",
      })),
    }));
  };

  const handleLocationSelect = async (location) => {
    const zip = location.address?.postcode || "";
    const newZipCodes = [...new Set([...zipCodes, zip])].filter(Boolean);
    setZipCodes(newZipCodes);
    setInputValue(newZipCodes.join(", "));

    const newLocation = {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
      name: location.display_name || "",
      zip: zip || "",
    };

    const updatedLocations = [...locations, newLocation];
    setLocations(updatedLocations);

    setFormData((prev) => ({
      ...prev,
      additionalLocations: updatedLocations.map((loc) => ({
        zip: loc.zip,
        name: loc.name,
        latitude: loc.lat,
        longitude: loc.lng,
        type: "Point",
      })),
    }));
    setSuggestions([]);
    setQuery("");
  };

  const removeLocation = (index) => {
    const newLocations = locations.filter((_, i) => i !== index);
    const newZips = newLocations.map((l) => l.zip).filter(Boolean);
    setLocations(newLocations);
    setZipCodes(newZips);
    setInputValue(newZips.join(", "));

    setFormData((prev) => ({
      ...prev,
      additionalLocations: newLocations.map((loc) => ({
        zip: loc.zip,
        name: loc.name,
        latitude: loc.lat,
        longitude: loc.lng,
        type: "Point",
      })),
    }));
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

            const newLocation = {
              lat: latitude,
              lng: longitude,
              name: locationName,
              zip: newZip,
            };

            const updatedLocations = [...locations, newLocation];
            setLocations(updatedLocations);
            setZipCodes(updatedLocations.map((l) => l.zip).filter(Boolean));
            setInputValue(
              updatedLocations
                .map((l) => l.zip)
                .filter(Boolean)
                .join(", "),
            );

            setFormData((prev) => ({
              ...prev,
              additionalLocations: updatedLocations.map((loc) => ({
                zip: loc.zip,
                name: loc.name,
                latitude: loc.lat,
                longitude: loc.lng,
                type: "Point",
              })),
            }));

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

  const handleProductUpload = async (e) => {
    e.preventDefault();
    setUploadLoading(true);

    if (
      !formData.name ||
      !formData.description ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.vehicleType
    ) {
      toast.error("Please fill all required fields");
      setUploadLoading(false);
      return;
    }

    if (!formData.location.latitude || !formData.location.longitude) {
      toast.error("Main location is required");
      setUploadLoading(false);
      return;
    }

    const data = new FormData();

    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("startTime", formData.startTime);
    data.append("endTime", formData.endTime);
    data.append("vehicleType", formData.vehicleType);

    // Main location
    data.append("location[type]", "Point");
    data.append(
      "location[coordinates][0]",
      parseFloat(formData.location.longitude),
    );
    data.append(
      "location[coordinates][1]",
      parseFloat(formData.location.latitude),
    );
    data.append("location[name]", formData.location.name || "");
    data.append("location[zip]", formData.location.zip || "");

    // Min Auction Rates
    data.append(
      "minAuctionRates[fullWrap]",
      formData.minAuctionRates.fullWrap || "0",
    );
    data.append(
      "minAuctionRates[oneSide]",
      formData.minAuctionRates.oneSide || "0",
    );
    data.append(
      "minAuctionRates[bothSides]",
      formData.minAuctionRates.bothSides || "0",
    );
    data.append(
      "minAuctionRates[rearDoors]",
      formData.minAuctionRates.rearDoors || "0",
    );

    // Additional locations
    if (formData.additionalLocations.length > 0) {
      const formatted = formData.additionalLocations
        .filter((loc) => loc.latitude && loc.longitude)
        .map((loc) => ({
          type: "Point",
          coordinates: [parseFloat(loc.longitude), parseFloat(loc.latitude)],
          name: loc.name || "",
          zip: loc.zip || "",
        }));
      if (formatted.length > 0) {
        data.append("additionalLocations", JSON.stringify(formatted));
      }
    }

    // Vehicle
    data.append("vehicle[country]", formData.vehicle.country || "");
    data.append(
      "vehicle[yearofmanufacture]",
      formData.vehicle.yearofmanufacture || "",
    );
    data.append("vehicle[manufacturer]", formData.vehicle.manufacturer || "");
    data.append("vehicle[model]", formData.vehicle.model || "");
    data.append(
      "vehicle[manufacturerLink]",
      formData.vehicle.manufacturerLink || "",
    );

    Object.entries(formData.vehicle.dimensions || {}).forEach(([k, v]) => {
      data.append(`vehicle[dimensions][${k}]`, v || "");
    });

    data.append(
      "campingAvailability",
      JSON.stringify(formData.campingAvailability),
    );

    // Images
    if (imgRefFiles.length > 0) {
      imgRefFiles.forEach((file) => {
        if (file.size > 1024 * 1024) {
          toast.error(`Image ${file.name} size should be less than 1MB`);
          setUploadLoading(false);
          return;
        }
        data.append("images", file);
      });
    } else if (singleAuction?.images && singleAuction.images.length > 0) {
      data.append("existingImages", JSON.stringify(singleAuction.images));
    }

    try {
      await dispatch(updateSingleAuction({ data, id })).unwrap();
      toast.success("Auction updated successfully!");
      dispatch(reset());
      navigate("/user-profile/manage-items");
    } catch (err) {
      toast.error(err.message || "Failed to update auction");
    } finally {
      setUploadLoading(false);
    }
  };

  if (auctionLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-color"></div>
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
              Updating Auction...
            </p>
          </div>
        </div>
      )}

      <form
        // className="flex flex-col lg:flex-row gap-8 justify-center w-full max-w-7xl m-auto px-4 py-15"
        className="max-w-4xl mx-auto px-4 py-8 lg:py-12"
        onSubmit={handleProductUpload}
      >
        {/* Images Section */}
        <div className="text-blue lg:w-1/4 lg:min-w-[350px]">
          <h1 className="text-white text-2xl font-bold mb-4">
            Edit Auction Item
          </h1>

          {/* {imgUrls.length > 0 ? (
            <div className="space-y-4">
              <div className="relative w-full h-80 rounded-lg border-2 border-solid p-2 overflow-hidden">
                <div className="flex flex-col space-y-4 h-full overflow-y-auto">
                  {imgUrls.map((url, index) => (
                    <div key={index} className="relative w-full h-64 flex-shrink-0">
                      <img
                        src={url}
                        alt={`upload ${index}`}
                        className="w-full h-full object-contain"
                        onClick={() => imgRef.current.click()}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => imgRef.current.click()}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Change Images
              </button>
            </div>
          ) : (
            <div
              onClick={() => imgRef.current.click()}
              className="w-full h-80 bg-theme-bg2 rounded-xl border-2 border-dashed border-border-info-color flex items-center justify-center cursor-pointer hover:bg-theme-bg2 transition-colors"
            >
              <div className="text-center flex flex-col items-center gap-2 text-white">
                <IoCloudUploadOutline size={68} className="text-white" />
                <p>Click to Upload Vehicle Images</p>
                <span className="text-white text-sm">
                  PNG, JPG, JPEG | Max Size 1MB | Max 3 Images
                </span>
              </div>
            </div>
          )}

          <input
            type="file"
            className="hidden"
            ref={imgRef}
            onChange={handleImageUpload}
            accept=".png,.jpg,.jpeg,image/png,image/jpg,image/jpeg"
            multiple
          /> */}
        </div>

        {/* Form Fields */}
        <div className="bg-theme-bg2 flex flex-col gap-4 w-full p-8 rounded-2xl border border-border-info-color [&_label]:mb-2 [&_label]:text-white [&_*]:transition-all">
          <div className="grid">
            <label htmlFor="product_name">Product Name *</label>
            <input
              required
              id="product_name"
              name="name"
              type="text"
              placeholder="e.g (Modern Abstract Painting)"
              onChange={handleChange}
              value={formData.name}
              className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color placeholder-body-text-color text-slate-300 bg-theme-bg"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="grid">
              <label htmlFor="vehicleType">Vehicle Type *</label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                required
                onChange={handleChange}
                className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color bg-theme-bg text-slate-300 cursor-pointer"
              >
                <option value="">Select Vehicle Type</option>
                {filteredOptions.vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Min Auction Rates */}
          <div className="bg-theme-bg2 p-4 rounded-md border border-gray-200">
            <h4 className="font-medium text-white mb-3">
              Auction Starting Rates (Minimum Bid per sqm) *
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-white mb-1">
                  Full Wrap
                </label>
                <input
                  name="minAuctionRates.fullWrap"
                  type="number"
                  min="0"
                  required
                  value={formData.minAuctionRates.fullWrap}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border bg-theme-bg border-gray-300 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">
                  One Side
                </label>
                <input
                  name="minAuctionRates.oneSide"
                  type="number"
                  min="0"
                  required
                  value={formData.minAuctionRates.oneSide}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border bg-theme-bg border-gray-300 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">
                  Both Sides
                </label>
                <input
                  name="minAuctionRates.bothSides"
                  type="number"
                  min="0"
                  required
                  value={formData.minAuctionRates.bothSides}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border bg-theme-bg border-gray-300 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">
                  Rear Doors
                </label>
                <input
                  name="minAuctionRates.rearDoors"
                  type="number"
                  min="0"
                  required
                  value={formData.minAuctionRates.rearDoors}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border bg-theme-bg border-gray-300 rounded-md text-white"
                />
              </div>
            </div>
          </div>

          {/* Additional Locations Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-white mb-1">
              Additional Campaign Locations (Zip Codes, comma separated)
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={handleZipCodesChange}
              placeholder="e.g. 400001, 400002"
              className="w-full px-3 py-2 bg-theme-bg border border-border-info-color rounded-md text-white focus:border-theme-color outline-none"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-white mb-1">
              Search Additional Location
            </label>
            <div className="relative w-full">
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search location to add"
                className="w-full bg-theme-bg border border-border-info-color rounded-md px-4 py-2 text-white focus:border-theme-color outline-none"
              />
              <BiCurrentLocation
                size={24}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white"
                onClick={getCurrentLocation}
              />
              {loading && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2 w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              )}
              {suggestions.length > 0 && (
                <ul className="absolute top-full left-0 w-full z-50 bg-theme-bg border border-gray-600 rounded-md mt-1 max-h-48 overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => handleLocationSelect(s)}
                      className="p-2 hover:bg-theme-color cursor-pointer text-white border-b border-gray-600"
                    >
                      {s.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Only Additional Locations List */}
          {locations.length > 0 && (
            <div className="text-white">
              <h4 className="text-sm font-medium text-white mb-2">
                Additional Locations ({locations.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {locations.map((loc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-md bg-info-color text-white"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {index + 1}. {loc.name}
                      </p>
                      {loc.zip && (
                        <p className="text-xs text-gray-300">Zip: {loc.zip}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLocation(index)}
                      className="ml-2 text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auction Times */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="grid">
              <label htmlFor="startTime">Auction Start Time *</label>
              <input
                required
                id="startTime"
                name="startTime"
                type="datetime-local"
                onChange={handleChange}
                value={formData.startTime}
                className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color bg-theme-bg text-slate-300"
              />
            </div>
            <div className="grid">
              <label htmlFor="endTime">Auction End Time *</label>
              <input
                required
                id="endTime"
                name="endTime"
                type="datetime-local"
                onChange={handleChange}
                value={formData.endTime}
                className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color bg-theme-bg text-slate-300"
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid">
            <label htmlFor="description">Description *</label>
            <textarea
              required
              id="description"
              name="description"
              rows="7"
              placeholder="Describe your product"
              onChange={handleChange}
              value={formData.description}
              className="outline-none bg-theme-bg rounded-xl px-3 py-4 border border-border-info-color focus:border-theme-color placeholder-body-text-color text-slate-300"
            />
          </div>

          {/* Vehicle Details */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="grid">
              <label htmlFor="model">Vehicle Model *</label>
              <select
                id="model"
                name="vehicle.model"
                disabled={!formData.vehicleType}
                required
                value={formData.vehicle?.model || ""}
                onChange={handleChange}
                className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color bg-theme-bg text-slate-300 cursor-pointer"
              >
                <option value="">Select Model</option>
                {filteredOptions.models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid">
              <label htmlFor="manufacturer">Vehicle Manufacturer *</label>
              <select
                id="manufacturer"
                name="vehicle.manufacturer"
                required
                disabled={!formData.vehicle?.model}
                value={formData.vehicle?.manufacturer || ""}
                onChange={handleChange}
                className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color bg-theme-bg text-slate-300 cursor-pointer"
              >
                <option value="">Select Manufacturer</option>
                {filteredOptions.manufacturers.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="grid">
              <label htmlFor="yearofmanufacture">Year of Manufacture *</label>
              <select
                id="yearofmanufacture"
                name="vehicle.yearofmanufacture"
                required
                disabled={!formData.vehicle?.manufacturer}
                value={formData.vehicle?.yearofmanufacture || ""}
                onChange={handleChange}
                className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color bg-theme-bg text-slate-300 cursor-pointer"
              >
                <option value="">Select Year</option>
                {filteredOptions.years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid">
              <label htmlFor="country">Vehicle Country *</label>
              <select
                id="country"
                name="vehicle.country"
                required
                disabled={!formData.vehicle?.yearofmanufacture}
                value={formData.vehicle?.country || ""}
                onChange={handleChange}
                className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color bg-theme-bg text-slate-300 cursor-pointer"
              >
                <option value="">Select Country</option>
                {filteredOptions.countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Camping Availability */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Camping Availability *
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
                  className={`flex items-center justify-center cursor-pointer border rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    formData.campingAvailability[field] === "Available"
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-theme-bg text-white border-gray-600 hover:bg-theme-bg2"
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
          </div>

          {/* Dimensions */}
          <h3 className="text-white mt-4 mb-2">
            Dimensions (Auto-filled when vehicle is selected)
          </h3>
          <div className="grid lg:grid-cols-2 gap-4">
            {[
              { id: "length", label: "Length", unit: "cm" },
              { id: "width", label: "Width", unit: "cm" },
              { id: "height", label: "Height", unit: "cm" },
              { id: "wheelbase", label: "Wheelbase", unit: "cm" },
              { id: "cabwidth", label: "Cab Width", unit: "cm" },
              { id: "cabheight", label: "Cab Height", unit: "cm" },
              { id: "bonnetwidth", label: "Bonnet Width", unit: "cm" },
              { id: "bonnetLength", label: "Bonnet Length", unit: "cm" },
              { id: "curbWeight", label: "Curb Weight", unit: "kg" },
              { id: "engineSize", label: "Engine Size", unit: "cc" },
            ].map(({ id, label, unit }) => (
              <div className="grid" key={id}>
                <label htmlFor={id}>{label}</label>
                <input
                  disabled
                  id={id}
                  name={`vehicle.dimensions.${id}`}
                  placeholder={`e.g. in ${unit}`}
                  type="number"
                  value={formData.vehicle?.dimensions?.[id] || ""}
                  onChange={handleChange}
                  className="outline-none px-4 py-3 rounded-xl border border-border-info-color bg-theme-bg text-slate-300"
                />
              </div>
            ))}
          </div>

          {/* Manufacturer Link */}
          <div className="grid">
            <label htmlFor="manufacturerLink">Manufacturer Link</label>
            <input
              id="manufacturerLink"
              name="vehicle.manufacturerLink"
              type="url"
              placeholder="https://example.com"
              onChange={handleChange}
              value={formData.vehicle?.manufacturerLink || ""}
              className="outline-none px-4 py-3 rounded-xl border border-border-info-color focus:border-theme-color bg-theme-bg text-slate-300"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={uploadLoading}
            className="px-3 py-4 rounded-xl text-white font-bold tracking-wide w-full bg-theme-color hover:bg-color-danger flex justify-center items-center"
          >
            {uploadLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update Auction"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAuction;
