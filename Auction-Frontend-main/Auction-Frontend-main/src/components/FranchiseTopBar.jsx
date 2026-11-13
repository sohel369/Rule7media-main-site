import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactCountryFlag from "react-country-flag";
import { fetchUserCountry, setCountry } from "../store/countary/countrySlice";
import { Globe, ShieldCheck } from "lucide-react";
import { clearNonEnglishSourceTranslateCookies } from "../utils/googleTranslate";

const countries = [
  "United States",
  "Canada",
  "Australia",
  "China",
  "Japan",
  "India",
  "Thailand",
  "Indonesia",
  "Spain",
  "France",
  "United Kingdom",
  "Germany",
  "Vietnam",
  "Philippines",
  "Brazil",
];

const countryToCodeMap = {
  "United States": "US",
  Canada: "CA",
  Australia: "AU",
  China: "CN",
  Japan: "JP",
  India: "IN",
  Thailand: "TH",
  Indonesia: "ID",
  Spain: "ES",
  France: "FR",
  "United Kingdom": "GB",
  Germany: "DE",
  Vietnam: "VN",
  Philippines: "PH",
  Brazil: "BR",
};

const TRANSLATE_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "es", name: "Spanish" },
  { code: "zh-CN", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "pt", name: "Portuguese" },
  { code: "id", name: "Indonesian" },
  { code: "th", name: "Thai" },
  { code: "vi", name: "Vietnamese" },
];

// Helper to get active language from cookie
const getActiveLanguage = () => {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/googtrans=\/([a-zA-Z-]+)\/([a-zA-Z-]+)/);
  return match && match[1] === "en" ? match[2] : "en";
};

const FranchiseTopBar = () => {
  const dispatch = useDispatch();
  const country = useSelector((state) => state.country.country);
  const googleTranslateRef = useRef(null);
  const [currentLang, setCurrentLang] = useState(getActiveLanguage());

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  // Ensure Google Translate script is loaded in background
  useEffect(() => {
    clearNonEnglishSourceTranslateCookies();

    const initTranslate = () => {
      if (window.google?.translate?.TranslateElement) {
        const container = document.getElementById("franchise_google_translate_element");
        if (container) {
          container.innerHTML = "";
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,hi,id,ja,zh-CN,es,fr,de,th,vi,pt",
              layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
              autoDisplay: false,
            },
            "franchise_google_translate_element"
          );
        }
      }
    };

    window.googleTranslateElementInit = initTranslate;
    const hasScript = document.querySelector('script[src*="translate_a/element.js"]');
    if (!hasScript) {
      const script = document.createElement("script");
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if (window.google?.translate?.TranslateElement) {
          initTranslate();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    if (selectedCountry) dispatch(setCountry(selectedCountry));
  };

  const handleLanguageChange = (e) => {
    const langCode = e.target.value;
    setCurrentLang(langCode);

    // 1. Set Google Translate cookies
    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain};`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${domain};`;

    // 2. Trigger combo if present in DOM
    const combo = document.querySelector(".goog-te-combo");
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      // Reload to apply translation immediately if widget hasn't attached yet
      window.location.reload();
    }
  };

  return (
    <div className="w-full bg-[#0a0f1d] border-b border-slate-800 text-slate-300 py-2.5 sm:py-3 px-4 sm:px-8 text-xs relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Side: Desktop Only Franchise Network Tag (Hidden on mobile to prevent overflow) */}
        <div className="hidden md:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-bold text-slate-300 uppercase tracking-widest text-[11px] truncate">
            Global Franchise Network
          </span>
        </div>

        {/* Both Dropdowns: Centered on Mobile, Right-aligned on Desktop */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          {/* Country Display (Auto-detected via IP, Disabled like Main Header) */}
          <div className="flex items-center gap-2 bg-[#1a2637] border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 opacity-90 cursor-not-allowed flex-shrink-0">
            <ReactCountryFlag
              countryCode={countryToCodeMap[country] || "US"}
              svg
              style={{ width: "18px", height: "14px", borderRadius: "2px" }}
            />
            <select
              value={country || "United States"}
              disabled
              onChange={handleCountryChange}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-not-allowed pr-1 opacity-90 w-auto"
              title="Country auto-detected from IP"
            >
              <option value="" className="bg-slate-900 text-white">Country</option>
              {countries.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Instant Language Selector (Always Visible, 0ms Delay, No Refresh Needed) */}
          <div className="flex items-center gap-1.5 bg-[#1a2637] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 flex-shrink-0">
            <Globe size={14} className="text-rose-400 flex-shrink-0" />
            <select
              value={currentLang}
              onChange={handleLanguageChange}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1 w-auto"
              title="Select Language"
            >
              <option value="en" className="bg-[#1a2637] text-white">Select Language</option>
              {TRANSLATE_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-[#1a2637] text-white">
                  {l.name}
                </option>
              ))}
            </select>

            {/* Hidden native container for Google Translate engine */}
            <div
              id="franchise_google_translate_element"
              ref={googleTranslateRef}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Mobile Menu Country & Language Widget ────────────────────────────────────
export const FranchiseMobileControls = () => {
  const dispatch = useDispatch();
  const country = useSelector((state) => state.country.country);
  const [currentLang, setCurrentLang] = useState(getActiveLanguage());

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  const handleLanguageChange = (e) => {
    const langCode = e.target.value;
    setCurrentLang(langCode);

    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain};`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${domain};`;

    const combo = document.querySelector(".goog-te-combo");
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="w-full max-w-sm mt-6 pt-5 border-t border-white/10 flex flex-col gap-3 text-left">
      <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 px-1">
        <ShieldCheck size={14} className="text-rose-400" /> Region & Language
      </div>

      {/* Country Card */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-lg">
        <div className="flex items-center gap-3">
          <ReactCountryFlag
            countryCode={countryToCodeMap[country] || "US"}
            svg
            style={{ width: "24px", height: "18px", borderRadius: "4px" }}
          />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Detected Country</div>
            <div className="text-sm font-bold text-white truncate max-w-[140px]">{country || "United States"}</div>
          </div>
        </div>

        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
          IP Locked
        </span>
      </div>

      {/* Language Selector Card */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <Globe size={16} className="text-rose-400" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Select Language</div>
            <div className="text-xs font-bold text-white">
              {TRANSLATE_LANGUAGES.find((l) => l.code === currentLang)?.name || "English"}
            </div>
          </div>
        </div>

        <select
          value={currentLang}
          onChange={handleLanguageChange}
          className="bg-slate-800 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-rose-500 cursor-pointer"
        >
          {TRANSLATE_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} className="bg-slate-900 text-white">
              {l.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FranchiseTopBar;

