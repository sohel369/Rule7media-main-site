import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import _ from "lodash";
import { BiCurrentLocation } from "react-icons/bi";
import { toast } from "react-toastify";

const CountrySpecificZipCode = ({
  formData,
  setFormData,
  errors,
  setErrors,
  required = true,
  label = "Postal/Zip Code",
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [currentCountryCode, setCurrentCountryCode] = useState(null);

  const getCountryCode = () => {
    if (!formData.country) return null;

    // If country is stored as an object with iso2/isoCode
    if (typeof formData.country === "object" && formData.country !== null) {
      return formData.country.iso2 || formData.country.isoCode || null;
    }

    // If country is stored as a string name, we need the iso2 from countryData
    // This should be passed from AddressSelector component
    if (formData.countryData && formData.countryData.iso2) {
      return formData.countryData.iso2;
    }

    // Fallback: basic mapping for common countries
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

  // Get country name for display
  const getCountryName = () => {
    if (!formData.country) return "";

    if (typeof formData.country === "object") {
      return formData.country.name;
    }
    return formData.country;
  };

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
        // Search with country filter
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search`,
          {
            params: {
              q: searchQuery,
              format: "json",
              addressdetails: 1,
              limit: 10,
              countrycodes: countryCode.toLowerCase(), // Filter by selected country
            },
          },
        );

        // Additional filtering to ensure results are from selected country
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

    // Verify the selected location is from the correct country
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
      zipPostalCode: address.postcode || "",
      location: locationData,
    }));

    setQuery(suggestion.display_name);
    setSuggestions([]);
    setValidationMessage("");

    if (setErrors) {
      setErrors((prev) => ({ ...prev, postalCode: "", zipPostalCode: "" }));
    }

    // toast.success(`✓ Location selected from ${countryName}: ${address.postcode || "Zip code found"}`, {
    //   autoClose: 2000,
    // });
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

            // Verify location is in selected country
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
              zipPostalCode: address.postcode || "",
              location: locationData,
            }));

            setQuery(data.display_name);
            setValidationMessage("");
            setLoading(false);

            // toast.success(`✓ Current location detected in ${countryName}: ${address.postcode || "Location found"}`, {
            //   autoClose: 2000,
            // });
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
          let errorMessage = "Location access failed";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enable location permissions in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                "Location information is unavailable at the moment.";
              break;
            case error.TIMEOUT:
              errorMessage =
                "The request to get your location timed out. Please try again.";
              break;
            default:
              errorMessage =
                "An unknown error occurred while fetching location.";
          }

          setValidationMessage(errorMessage);
          toast.error(errorMessage, { autoClose: 3000 });
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
  const prevCountryRef = useRef();

  useEffect(() => {
    const newCountryCode = getCountryCode();
    const prevCountryCode = prevCountryRef.current;

    // Sirf tab clear karo jab country actual mein badli ho (aur initial render na ho)
    if (prevCountryCode !== undefined && prevCountryCode !== newCountryCode) {
      setQuery("");
      setSuggestions([]);
      setValidationMessage("");

      // Sirf tab setFormData call karo agar postalCode already empty nahi hai
      if (
        formData.postalCode ||
        formData.zipPostalCode ||
        formData.location?.zip
      ) {
        setFormData((prev) => ({
          ...prev,
          postalCode: "",
          zipPostalCode: "",
          location: { ...prev.location, zip: "" },
        }));
      }
    }

    prevCountryRef.current = newCountryCode;
  }, [formData.country]); // dependency same rakho

  const isDisabled = !formData.country;

  return (
    <div className="w-full">
      <label className="block mb-1 text-white">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {isDisabled && (
        <div className="mb-2 p-2 bg-yellow-900/30 border border-yellow-600/50 rounded text-yellow-400 text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>
            Please select a country first from the address section to enable zip
            code entry
          </span>
        </div>
      )}

      {/* {!isDisabled && formData.country && (
        <div className="mb-2 p-2 bg-blue-900/30 border border-blue-600/50 rounded text-blue-300 text-sm flex items-center gap-2">
          <span>ℹ️</span>
          <span>You can only add zip codes from: <strong>{getCountryName()}</strong></span>
        </div>
      )} */}

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
          required={required}
          className={`w-full pl-3 pr-10 py-3 rounded text-white bg-[#0E294D] placeholder-gray-400 outline-none border ${
            errors?.postalCode || errors?.zipPostalCode || validationMessage
              ? "border-red-500"
              : "border-border-info-color"
          } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""} focus:border-blue-500`}
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
          <ul className="absolute top-full left-0 w-full z-50 rounded-md border border-gray-300 bg-[rgb(7,27,54)] text-white shadow-lg max-h-60 overflow-y-auto mt-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleLocationSelect(suggestion)}
                className="cursor-pointer p-3 bg-theme-bg hover:bg-theme-bg2 border-b border-gray-700 last:border-b-0 transition-colors"
              >
                <div className="font-medium text-sm">
                  {suggestion.display_name}
                </div>
                {/* {suggestion.address?.postcode && (
                  <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
                    <span>📍</span>
                    <span>Postal Code: {suggestion.address.postcode}</span>
                  </div>
                )} */}
                <div className="text-xs text-gray-400 mt-1">
                  {suggestion.address?.country || getCountryName()}
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

      {(errors?.postalCode || errors?.zipPostalCode) && (
        <p className="text-red-500 text-sm mt-2">
          {errors.postalCode || errors.zipPostalCode}
        </p>
      )}

      {/* {formData.postalCode && !validationMessage && (
        <p className="text-green-400 text-sm mt-2 flex items-center gap-2">
          <span>✓</span>
          <span>Selected Postal Code: <strong>{formData.postalCode}</strong> from {getCountryName()}</span>
        </p>
      )} */}
    </div>
  );
};

export default CountrySpecificZipCode;
