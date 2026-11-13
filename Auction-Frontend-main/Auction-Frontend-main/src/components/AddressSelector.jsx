import React, { useState, useEffect } from "react";
import worldData from "../countries+states+cities.json";

const AddressSelector = ({
  formData,
  setFormData,
  errors,
  setErrors,
  updatePhoneCode,
  onCountryChange,
}) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);

  useEffect(() => {
    setCountries(worldData);
  }, []);

  // ✅ Initialize from formData on mount and when formData changes
  useEffect(() => {
    if (formData.country && countries.length > 0) {
      const country = countries.find((c) => c.name === formData.country);
      if (country && (!selectedCountry || selectedCountry.id !== country.id)) {
        setSelectedCountry(country);
        setStates(country.states || []);
        
        // Agar state bhi pre-filled hai toh usko bhi set karo
        if (formData.state) {
          const state = country.states?.find((s) => s.name === formData.state);
          if (state) {
            setSelectedState(state);
            setCities(state.cities || []);
          }
        } else {
          setCities([]);
        }
      }
    }
  }, [formData.country, formData.state, countries]);

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

    if (onCountryChange && country) {
      onCountryChange(country);
    }

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Country */}
      <div>
        <label className="block mb-1 text-white">
          Country <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedCountry?.id || ""}
          required
          onChange={(e) => handleCountryChange(e.target.value)}
          className={`w-full pl-5 py-3 rounded text-white bg-[#0E294D] outline-none border ${
            errors?.country ? "border-red-500" : "border-border-info-color"
          } focus:border-blue-500`}
        >
          <option value="">Select Country</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors?.country && (
          <p className="text-red-500 text-sm mt-1">{errors.country}</p>
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
          className={`w-full pl-5 py-3 rounded text-white bg-[#0E294D] outline-none border ${
            errors?.state ? "border-red-500" : "border-border-info-color"
          } ${!selectedCountry ? "opacity-50 cursor-not-allowed" : ""} focus:border-blue-500`}
        >
          <option value="">Select State</option>
          {states.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {errors?.state && (
          <p className="text-red-500 text-sm mt-1">{errors.state}</p>
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
          disabled={!selectedState}
          className={`w-full pl-5 py-3 rounded text-white bg-[#0E294D] outline-none border ${
            errors?.city ? "border-red-500" : "border-border-info-color"
          } ${!selectedState ? "opacity-50 cursor-not-allowed" : ""} focus:border-blue-500`}
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
  );
};

export default AddressSelector;