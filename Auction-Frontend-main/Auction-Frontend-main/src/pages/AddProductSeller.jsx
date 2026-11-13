import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { BiCurrentLocation } from "react-icons/bi";
import { toast } from "react-toastify";
import axios from "axios";
import { getAllCategories } from "../store/category/categorySlice";
import { createProducts } from "../store/product/ProductSlice";
import { fetchUserCountry } from "../store/countary/countrySlice";
import { getContactInfo } from "../store/contact/contactSlice";
import worldData from "../countries+states+cities.json";
const AddProductSeller = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const mapRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsError, setSuggestionsError] = useState("");
  const [zipCodes, setZipCodes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");

  const [selectedState, setSelectedState] = useState("");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [errors, setErrors] = useState({});
  const [product, setProduct] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
    images: [],
    officeLocations: [],
    zipCodes: [],
    locations: [],
    city: "",
    state: "",
    country: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
    images: [],
    officeLocations: [],
    zipCodes: [],
    locations: [],
    city: "",
    state: "",
    country: "",
  });

  const {
    categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    message: categoriesMessage,
  } = useSelector((state) => state.category);
  const { country, currency } = useSelector((state) => state.country);
  const { contact = [], isLoading } = useSelector((state) => state.contactInfo);

  const { user } = useSelector((state) => state.auth);

  const categoryList = categories?.data || categories || [];
  useEffect(() => {
    setCountries(worldData);
  }, []);
  useEffect(() => {
    dispatch(getAllCategories());
    dispatch(getContactInfo());
  }, [dispatch]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debounceRef.current(value);
  };
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = product.images.length + files.length;

    if (totalImages > 4) {
      setImageError("You can upload a maximum of 4 images only.");
      // Take only first 4
      const limitedFiles = files.slice(0, 4 - product.images.length);
      setProduct((prev) => ({
        ...prev,
        images: [...prev.images, ...limitedFiles],
      }));
    } else {
      setImageError("");
      setProduct((prev) => ({
        ...prev,
        images: [...prev.images, ...files],
      }));
    }
    setImageError("");
  };

  const handleOfficeSelect = (e) => {
    const selectedOffice = contact.find(
      (office) =>
        `${office.country} - ${office.officeAddress}` === e.target.value,
    );
    if (selectedOffice) {
      setProduct({
        ...product,
        officeLocations: [
          {
            country: selectedOffice.country,
            address: selectedOffice.officeAddress,
          },
        ],
      });
    }
  };
  const handleZipCodesChange = async (e) => {
    const input = e.target.value;

    try {
      const zipArray = input
        .split(",")
        .map((zip) => zip.trim())
        .filter(Boolean);
      setZipCodes(zipArray);

      // Updated validation for global postal codes
      const invalidZips = zipArray.filter((zip) => {
        // More flexible validation for international postal codes
        // Allow alphanumeric codes (UK: SW1A 1AA, Canada: K1A 0A6, etc.)
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
        }
      }

      if (newLocations.length === 0) {
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
      setFormData((prev) => ({
        ...prev,
        zipCodes: zipArray,
        locations: newLocations.map((loc) => ({
          name: loc.name || "",
          zip: loc.zip || "",
          location: loc.location,
        })),
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
  const debounceRef = useRef(
    _.debounce(async (query) => {
      if (!query || query.length < 3) {
        setSuggestions([]);
        setSuggestionsError("");
        return;
      }

      try {
        setSuggestionsError("");
        setLoading(true);

        // Remove country restriction to allow global search
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query,
          )}&format=json&addressdetails=1&limit=5`,
          // Removed: &countrycodes=${selectedCountry.isoCode.toLowerCase()}
        );

        if (response.data && response.data.length > 0) {
          setSuggestions(response.data);
        } else {
          setSuggestions([]);
          setSuggestionsError(
            "No locations found. Try a different search term.",
          );
        }
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
        setSuggestions([]);
        setSuggestionsError(
          "Failed to fetch location suggestions. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }, 800),
  );
  const handleLocationSelect = async (location) => {
    const zip = location.address?.postcode || "N/A";

    const newLocation = {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
      name: location.display_name,
      zip: zip,
      location: {
        type: "Point",
        coordinates: [parseFloat(location.lon), parseFloat(location.lat)],
      },
    };

    setProduct((prev) => ({
      ...prev,
      locations: [...prev.locations, newLocation],
      zipCodes: [...new Set([...prev.zipCodes, zip])],
    }));

    setQuery("");
    setSuggestions([]);
    //toast.success("Location added!");
  };
  const getCurrentLocation = async () => {
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
            const zip = data.address?.postcode || "N/A";

            const newLocation = {
              lat: latitude,
              lng: longitude,
              name: data.display_name,
              zip: zip,
              location: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
            };

            // यहाँ product में डालो!
            setProduct((prev) => ({
              ...prev,
              locations: [...prev.locations, newLocation],
              zipCodes: [...new Set([...prev.zipCodes, zip])],
            }));

            toast.success("Current location added!");
            setLoading(false);
          } catch (err) {
            toast.error("Failed to get address");
            setLoading(false);
          }
        },
        () => {
          toast.error("Location access denied");
          setLoading(false);
        },
      );
    } else {
      toast.error("Geolocation not supported");
      setLoading(false);
    }
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
  const clearError = (field) => {
    if (errors?.[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  const handleCountryChange = (countryId) => {
    const countryIdNum = parseInt(countryId);
    const country = countries.find((c) => c.id === countryIdNum);

    setSelectedCountry(country);
    setProduct((prev) => ({ ...prev, country: country?.name || "" })); // यहाँ डालो!
    setStates(country?.states || []);
    setCities([]);
  };

  const handleStateChange = (stateId) => {
    const stateIdNum = parseInt(stateId);
    const state = states.find((s) => s.id === stateIdNum);

    setSelectedState(state);
    setProduct((prev) => ({ ...prev, state: state?.name || "" })); // यहाँ डालो!
    setCities(state?.cities || []);
  };

  const handleCityChange = (cityName) => {
    setProduct((prev) => ({ ...prev, city: cityName })); // यहाँ डालो!
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(product.price) <= 0) {
      alert("Price cannot be 0. Please enter a valid price.");
      return;
    }
    if (product.images.length === 0) {
      setImageError("Please upload at least one product image.");
      return;
    }

    setLoading(true);
    setImageError("");

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("category", product.category);
    formData.append("price", product.price);
    formData.append("quantity", product.quantity);
    formData.append("description", product.description);
    formData.append("seller", user._id);
    formData.append("sellerId", user._id);
    product.images.forEach((image) => {
      formData.append("images", image);
    });

    product.officeLocations.forEach((location, index) => {
      formData.append(`officeLocations[${index}][country]`, location.country);
      formData.append(`officeLocations[${index}][address]`, location.address);
    });
    product.country && formData.append("country", product.country);
    product.state && formData.append("state", product.state);
    product.city && formData.append("city", product.city);
    product.locations.forEach((loc, i) => {
      formData.append(`locations[${i}][name]`, loc.name);
      formData.append(`locations[${i}][zip]`, loc.zip);
      formData.append(`locations[${i}][location][type]`, loc.location.type);
      formData.append(
        `locations[${i}][location][coordinates][0]`,
        loc.location.coordinates[0],
      );
      formData.append(
        `locations[${i}][location][coordinates][1]`,
        loc.location.coordinates[1],
      );
    });
    dispatch(createProducts(formData))
      .unwrap()
      .then(() => {
        navigate("/user-profile/add-product");
      })
      .catch((error) => {
        console.error("Error adding product:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="flex flex-col w-full bg-theme-bg text-white rounded-2xl p-6 min-h-screen">
      <div className="max-w-5xl mx-auto w-full">
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <FaSpinner className="text-4xl text-blue-500 animate-spin" />
          </div>
        )}

        <h1 className="text-2xl font-bold mb-6">Add Product</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Image Upload Section */}
          <div className="text-blue lg:w-1/3">
            <label className="block text-sm font-medium mb-2">
              Product Images
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="w-full h-80 bg-theme-bg rounded-xl border-2 border-dashed border-border-info-color flex items-center justify-center cursor-pointer">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  <p className="mb-2 text-sm text-white">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-white">
                    PNG, JPG, GIF (MAX. 5MB each)
                    <br />
                    Maximum 4 images uploaded
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={product.images.length >= 4}
                  className="hidden"
                />
              </label>
            </div>

            {imageError && (
              <div className="text-red-500 text-sm mt-2">{imageError}</div>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
              {product.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`preview-${index}`}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setProduct((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index),
                      }));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Form Fields */}
          <div className="lg:w-2/3">
            <form
              onSubmit={handleSubmit}
              className="bg-theme-bg2 p-6 rounded-lg shadow-lg space-y-4"
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter product name"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-theme-bg border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Category</label>
                <select
                  required
                  onChange={(e) =>
                    setProduct({ ...product, category: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-theme-bg border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {isCategoriesLoading ? (
                    <option disabled>Loading categories...</option>
                  ) : isCategoriesError ? (
                    <option disabled>
                      {categoriesMessage || "Error loading categories"}
                    </option>
                  ) : categoryList.length > 0 ? (
                    categoryList.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No categories available</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Price&nbsp;&nbsp;{currency}
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="price"
                    placeholder={`${currency} Enter price`}
                    onChange={(e) => {
                      if (Number(e.target.value) < 1) return;
                      handleChange(e);
                    }}
                    required
                    className="w-full px-4 py-2 bg-theme-bg border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    name="quantity"
                    placeholder="Enter quantity"
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-theme-bg border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Office Location
                </label>
                <select
                  name="officeLocation"
                  onChange={handleOfficeSelect}
                  required
                  className="w-full px-4 py-2 bg-theme-bg border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="">Select Office Location</option>
                  {isLoading ? (
                    <option disabled>Loading office locations...</option>
                  ) : contact.length > 0 ? (
                    contact.map((office) => (
                      <option
                        key={office._id}
                        value={`${office.country} - ${office.officeAddress}`}
                      >
                        {office.country} - {office.officeAddress}
                      </option>
                    ))
                  ) : (
                    <option disabled>No office locations available</option>
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Campaign Zip Codes (comma separated)*
                </label>
                <input
                  type="text"
                  readOnly
                  value={product.zipCodes.join(", ")}
                  onChange={(e) => {
                    const value = e.target.value;
                    const zipArray = value
                      .split(",")
                      .map((z) => z.trim())
                      .filter(Boolean);

                    setProduct((prev) => ({
                      ...prev,
                      zipCodes: zipArray,
                    }));
                  }}
                  placeholder="e.g. 400001, 110001, 90210"
                  className="w-full px-4 py-2 bg-theme-bg border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="relative md:col-span-3 mt-2">
                <label
                  htmlFor="locationSearch"
                  className="block text-sm font-medium text-white-700 mb-1"
                >
                  Search Zip Codes to Add
                </label>
                <div className="relative w-full mt-2">
                  <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search city, area, zip..."
                    className="w-full px-4 py-2 pr-12 bg-theme-bg border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <BiCurrentLocation
                    size={26}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 cursor-pointer hover:text-blue-300"
                    onClick={getCurrentLocation}
                  />
                  {loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  )}
                  {suggestions.length > 0 && (
                    <ul className="mt-2 max-h-60 overflow-y-auto bg-theme-bg2 border border-gray-700 rounded-lg shadow-xl z-10">
                      {suggestions.map((suggestion, i) => (
                        <li
                          key={i}
                          onClick={() => handleLocationSelect(suggestion)}
                          className="px-4 py-3 hover:bg-theme-bg cursor-pointer border-b border-gray-800 last:border-0"
                        >
                          <div className="text-sm font-medium">
                            {suggestion.display_name.split(",")[0]}
                          </div>
                          <div className="text-xs text-gray-400">
                            {suggestion.display_name}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {suggestionsError && (
                    <div className="mt-2 text-red-500 text-sm">
                      {suggestionsError}
                    </div>
                  )}
                </div>
              </div>
              {product.locations.length > 0 && (
                <div className="mt-6 p-4 bg-theme-bg2 rounded-xl ">
                  {product.locations.map((loc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-theme-bg2 p-3 rounded-lg"
                    >
                      <div>
                        <div className="text-sm text-gray-400">{loc.name}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setProduct((prev) => ({
                            ...prev,
                            locations: prev.locations.filter(
                              (_, i) => i !== index,
                            ),
                            zipCodes: prev.zipCodes.filter(
                              (z) => z !== loc.zip,
                            ),
                          }));
                        }}
                        className="text-red-400 hover:text-red-300 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-theme-bg2 p-4 rounded-lg m-15">
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
                      onChange={(e) => handleCountryChange(e.target.value)}
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

                    {errors?.country && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.country}
                      </p>
                    )}
                  </div>

                  {/* State */}
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

                    {errors?.state && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.state}
                      </p>
                    )}
                  </div>

                  {/* City */}
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
                    {errors?.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  placeholder="Enter product description"
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-4 py-2 bg-theme-bg border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                  loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loading ? "Submitting..." : "Submit Product"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductSeller;
