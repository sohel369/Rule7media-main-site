import React, { useState, useEffect, useRef } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { allCountries } from "country-telephone-data";
import { ChevronDown, Search } from "lucide-react";

// Function to get flag emoji from country code (iso2)
const getFlagEmoji = (countryCode) => {
  if (!countryCode) return "🇬🇧";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((ch) => 127397 + ch.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const CountryPhoneSelector = ({
  value = "",
  onChange,
  onCountryChange,
  placeholder = "Phone Number",
  required = false,
  error = "",
  className = "",
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch default country by IP on mount
  useEffect(() => {
    const fetchDefaultCountry = async () => {
      try {
        const res = await fetch("https://ip-api.com/json/");
        const data = await res.json();
        const countryCode = data.countryCode; // 'GB', 'IN', etc.
        const country = allCountries.find((c) => c.iso2 === countryCode);
        if (country) {
          setSelectedCountry(country);
          onCountryChange?.(country.iso2, country.dialCode.replace("+", ""));
        } else {
          // fallback to UK
          const uk = allCountries.find((c) => c.iso2 === "GB");
          setSelectedCountry(uk);
          onCountryChange?.("GB", "44");
        }
      } catch (err) {
        console.error("IP detection failed", err);
        const uk = allCountries.find((c) => c.iso2 === "GB");
        setSelectedCountry(uk);
        onCountryChange?.("GB", "44");
      }
    };
    fetchDefaultCountry();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchQuery("");
    onCountryChange?.(country.iso2, country.dialCode.replace("+", ""));
  };

  const filteredCountries = allCountries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery),
  );

  // Phone number change – only numeric value
  const handlePhoneChange = (phoneValue, countryData) => {
    const numericOnly = phoneValue.replace(/\D/g, "");
    onChange?.(numericOnly);
  };

  // Get flag for selected country
  const selectedFlag = selectedCountry?.iso2
    ? getFlagEmoji(selectedCountry.iso2)
    : "🇬🇧";
  const selectedDialCode = selectedCountry?.dialCode || "44";

  return (
    <div className={`w-full ${className}`} ref={dropdownRef}>
      <div className="flex items-stretch">
        {/* Country Code Dropdown Button */}
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 bg-[#0E294D] border border-border-info-color rounded-l px-3 py-2 text-white min-w-[120px] justify-between hover:bg-[#1a3a5c] transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{selectedFlag}</span>
            <span className="font-medium">+{selectedDialCode}</span>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </button>

        {/* Phone Number Input */}
        <div className="flex-1 relative">
          <PhoneInput
            country={selectedCountry?.iso2?.toLowerCase() || "gb"}
            value={value}
            onChange={handlePhoneChange}
            placeholder={placeholder}
            inputProps={{ required }}
            disableDropdown={true}
            disableCountryCode={true}
            disableSearchIcon={true}
            enableSearch={false}
            containerStyle={{ width: "100%", height: "100%" }}
            inputStyle={{
              width: "100%",
              background: "#0E294D",
              color: "white",
              border: error ? "1px solid #ef4444" : "1px solid #4B6A8A",
              borderLeft: "none",
              borderRadius: "0 4px 4px 0",
              height: "50px",
              fontSize: "14px",
              paddingLeft: "14px",
            }}
            buttonStyle={{ display: "none" }}
          />
        </div>
      </div>

      {/* Country Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute z-50 mt-2 w-80 bg-[#0E294D] border border-border-info-color rounded-xl shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-border-info-color">
            <div className="relative">
              <input
                type="text"
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/30 border border-border-info-color rounded-lg px-4 py-2 text-white text-sm focus:border-blue-500 outline-none pl-10"
                autoFocus
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.iso2}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full text-left px-4 py-2 hover:bg-[#1a3a5c] transition-colors flex items-center gap-3 ${
                    selectedCountry?.iso2 === country.iso2
                      ? "bg-blue-600/20"
                      : ""
                  }`}
                >
                  <span className="text-2xl">{getFlagEmoji(country.iso2)}</span>
                  <div>
                    <div className="text-white text-sm font-medium">
                      {country.name}
                    </div>
                    <div className="text-gray-400 text-xs">
                      +{country.dialCode}
                    </div>
                  </div>
                  {selectedCountry?.iso2 === country.iso2 && (
                    <span className="ml-auto text-blue-400 text-xs">✓</span>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default CountryPhoneSelector;
