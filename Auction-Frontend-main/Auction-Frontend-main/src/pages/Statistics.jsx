import React, { useEffect, useRef, useState, useMemo } from "react";
import { Globe2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  getStatisticsByCountry,
  getStatistics,
  reset,
} from "../store/statistic/statisticSlice";
import { fetchUserCountry } from "../store/countary/countrySlice";
import Header from "../components/Header";
import Footer from "../components/Footer";
const LANGUAGE_TABS = [
  { code: "en", label: "EN", name: "English" },
  { code: "es", label: "ES", name: "Spanish" },
  { code: "zh", label: "ZH", name: "Chinese" },
  { code: "ja", label: "JA", name: "Japanese" },
  { code: "de", label: "DE", name: "German" },
  { code: "fr", label: "FR", name: "French" },
  { code: "pt", label: "PT", name: "Portuguese" },
  { code: "hi", label: "HI", name: "Hindi" },
  { code: "id", label: "ID", name: "Indonesian" },
  { code: "th", label: "TH", name: "Thai" },
  { code: "vi", label: "VI", name: "Vietnamese" },
  { code: "it", label: "IT", name: "Italian" },
];

const LANGUAGE_MAP = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  zh: "Chinese",
  ja: "Japanese",
  ar: "Arabic",
  hi: "Hindi",
  th: "Thai",
  id: "Indonesian",
  it: "Italian",
  pt: "Portuguese",
  vi: "Vietnamese",
  tl: "Philippines",
  Unknown: "Other Languages",
};

// Country to language priority mapping (using language names)
const COUNTRY_LANGUAGE_PRIORITY_NAMES = {
  // South Asia - Multiple variations for India
  IN: ["Hindi", "English"],
  IND: ["Hindi", "English"],
  INDIA: ["Hindi", "English"],
  in: ["Hindi", "English"],
  india: ["Hindi", "English"],
  PK: ["Urdu", "English"],
  BD: ["Bengali", "English"],
  LK: ["Sinhala", "English", "Tamil"],
  NP: ["Nepali", "English"],

  // North America
  US: ["English", "Spanish"],
  USA: ["English", "Spanish"],
  us: ["English", "Spanish"],
  CA: ["English", "French"],

  // Europe
  GB: ["English"],
  UK: ["English"],
  gb: ["English"],
  uk: ["English"],
  ES: ["Spanish", "English"],
  SPAIN: ["Spanish", "English"],
  es: ["Spanish", "English"],
  FR: ["French", "English"],
  FRANCE: ["French", "English"],
  DE: ["German", "English"],
  GERMANY: ["German", "English"],
  IT: ["Italian", "English"],
  ITALY: ["Italian", "English"],
  PT: ["Portuguese", "English"],
  PORTUGAL: ["Portuguese", "English"],

  // Asia
  CN: ["Chinese", "English"],
  CHINA: ["Chinese", "English"],
  JP: ["Japanese", "English"],
  JAPAN: ["Japanese", "English"],
  TH: ["Thai", "English"],
  THAILAND: ["Thai", "English"],
  ID: ["Indonesian", "English"],
  INDONESIA: ["Indonesian", "English"],
  VN: ["Vietnamese", "English"],
  VIETNAM: ["Vietnamese", "English"],
  PH: ["Philippines", "English"],
  PHILIPPINES: ["Philippines", "English"],

  // Middle East
  SA: ["Arabic", "English"],
  UAE: ["Arabic", "English"],
  AE: ["Arabic", "English"],
  EG: ["Arabic", "English"],
  KUWAIT: ["Arabic", "English"],
  QATAR: ["Arabic", "English"],
  OMAN: ["Arabic", "English"],
  BAHRAIN: ["Arabic", "English"],

  // Latin America
  MX: ["Spanish", "English"],
  MEXICO: ["Spanish", "English"],
  AR: ["Spanish", "English"],
  ARGENTINA: ["Spanish", "English"],
  BR: ["Portuguese", "English"],
  BRAZIL: ["Portuguese", "English"],
  CO: ["Spanish", "English"],
  COLOMBIA: ["Spanish", "English"],
  CL: ["Spanish", "English"],
  CHILE: ["Spanish", "English"],
  PE: ["Spanish", "English"],
  PERU: ["Spanish", "English"],

  // Australia
  AU: ["English"],
  AUSTRALIA: ["English"],
  NZ: ["English"],
  NEWZEALAND: ["English"],

  // Default
  DEFAULT: ["English"],
};

const LANGUAGE_COUNTRIES = {
  English: [
    "GB",
    "US",
    "IE",
    "CA",
    "AU",
    "NZ",
    "NG",
    "PH",
    "ZA",
    "UG",
    "SD",
    "GH",
    "BD",
    "MY",
    "LK",
  ],
  Spanish: ["ES", "MX", "AR", "CO", "CL", "PE", "VE", "EC", "GT", "CU"],
  Chinese: ["CN", "TW", "HK", "SG", "MY"],
  Japanese: ["JP"],
  German: ["DE", "AT", "CH", "LU", "LI"],
  French: ["FR", "BE", "CH", "CA", "SN", "CI"],
  Portuguese: ["PT", "BR", "AO", "MZ", "CV"],
  Hindi: ["IN", "FJ", "TT", "GY", "SR"],
  Indonesian: ["ID"],
  Thai: ["TH"],
  Vietnamese: ["VN"],
  Italian: ["IT", "SM", "VA", "CH"],
  Philippines: ["PH"],
  Arabic: [
    "SA",
    "EG",
    "AE",
    "IQ",
    "SY",
    "JO",
    "LB",
    "KW",
    "QA",
    "BH",
    "OM",
    "YE",
    "LY",
    "DZ",
    "MA",
    "TN",
    "SD",
  ],
};

const VIDEOS_PER_LANGUAGE = 9;

// Function to normalize country code
const normalizeCountryCode = (countryCode) => {
  if (!countryCode) return null;

  // Convert to string and trim
  const code = String(countryCode).trim();

  // Check if it's already in our mapping
  if (COUNTRY_LANGUAGE_PRIORITY_NAMES[code]) {
    return code;
  }

  // Try uppercase
  const upperCode = code.toUpperCase();
  if (COUNTRY_LANGUAGE_PRIORITY_NAMES[upperCode]) {
    return upperCode;
  }

  // Try lowercase
  const lowerCode = code.toLowerCase();
  if (COUNTRY_LANGUAGE_PRIORITY_NAMES[lowerCode]) {
    return lowerCode;
  }

  // If not found, return uppercase for default
  return upperCode;
};

const Statistics = () => {
  const dispatch = useDispatch();
  const { statistics, isLoading, isError, message } = useSelector(
    (state) => state.statistic,
  );
  const { country, isLoading: countryLoading } = useSelector(
    (state) => state.country,
  );
  const { user } = useSelector((state) => state.auth || { user: null });
  const isLoggedIn = !!user;
  const [activeTab, setActiveTab] = useState(null);
  const videoRefs = useRef({});

  useEffect(() => {
    if (!country && !countryLoading) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country, countryLoading]);

  useEffect(() => {
    dispatch(getStatistics());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  // Get prioritized languages based on country
  const getPrioritizedLanguages = useMemo(() => {
    const normalizedCountry = normalizeCountryCode(country);
    const priorityNames =
      COUNTRY_LANGUAGE_PRIORITY_NAMES[normalizedCountry] ||
      COUNTRY_LANGUAGE_PRIORITY_NAMES.DEFAULT;

    // Create a map for priority order
    const priorityMap = new Map();
    priorityNames.forEach((name, index) => {
      priorityMap.set(name, index);
    });

    // Sort LANGUAGE_TABS based on priority
    const sortedTabs = [...LANGUAGE_TABS].sort((a, b) => {
      const priorityA = priorityMap.get(a.name);
      const priorityB = priorityMap.get(b.name);

      // If both have priority, sort by priority index
      if (priorityA !== undefined && priorityB !== undefined) {
        return priorityA - priorityB;
      }
      // If only A has priority, A comes first
      if (priorityA !== undefined) return -1;
      // If only B has priority, B comes first
      if (priorityB !== undefined) return 1;
      // If neither has priority, maintain original order
      return 0;
    });

    return sortedTabs;
  }, [country]);

  const isYouTubeUrl = (url) =>
    url && (url.includes("youtube.com") || url.includes("youtu.be"));

  const extractVideoId = (url) => {
    if (!url) return null;

    const cleanUrl = url.trim(); // IMPORTANT

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;

    const match = cleanUrl.match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
  };
  const getEmbedUrl = (videoId) => `https://www.youtube.com/embed/${videoId}`;

  const allVideoSources = statistics
    .filter((stat) => stat.videoType?.toLowerCase() === "global")
    .flatMap((stat) => stat.sources || []);

  const buildVideosWithPlaceholders = () => {
    const sourcesByLang = new Map();

    allVideoSources.forEach((source) => {
      const language = LANGUAGE_MAP[source.language] || LANGUAGE_MAP.Unknown;
      if (!sourcesByLang.has(language)) {
        sourcesByLang.set(language, []);
      }
      sourcesByLang.get(language).push(source);
    });

    const result = new Map();
    for (let [lang, sources] of sourcesByLang.entries()) {
      const padded = [...sources];
      while (padded.length < VIDEOS_PER_LANGUAGE) {
        padded.push({ type: "placeholder" });
      }
      result.set(lang, padded.slice(0, VIDEOS_PER_LANGUAGE));
    }

    const allPossibleLanguages = new Set(Object.values(LANGUAGE_MAP));
    for (let lang of allPossibleLanguages) {
      if (!result.has(lang)) {
        const placeholders = Array(VIDEOS_PER_LANGUAGE).fill({
          type: "placeholder",
        });
        result.set(lang, placeholders);
      }
    }

    return result;
  };

  const videosWithPlaceholders = buildVideosWithPlaceholders();

  // Get filtered entries with priority order
  const getFilteredEntriesWithPriority = () => {
    let entries;

    if (!activeTab) {
      entries = Array.from(videosWithPlaceholders.entries());

      // Get priority order based on country
      const normalizedCountry = normalizeCountryCode(country);
      const priorityNames =
        COUNTRY_LANGUAGE_PRIORITY_NAMES[normalizedCountry] ||
        COUNTRY_LANGUAGE_PRIORITY_NAMES.DEFAULT;

      // Create priority map for sorting
      const priorityMap = new Map();
      priorityNames.forEach((name, index) => {
        priorityMap.set(name, index);
      });

      // Sort entries by priority
      entries.sort((a, b) => {
        const langA = a[0];
        const langB = b[0];

        const priorityA = priorityMap.get(langA);
        const priorityB = priorityMap.get(langB);

        // If both have priority, sort by priority index
        if (priorityA !== undefined && priorityB !== undefined) {
          return priorityA - priorityB;
        }
        // If only A has priority, A comes first
        if (priorityA !== undefined) return -1;
        // If only B has priority, B comes first
        if (priorityB !== undefined) return 1;
        // If no priority, keep as is
        return 0;
      });
    } else {
      const langName = LANGUAGE_MAP[activeTab];
      if (langName && videosWithPlaceholders.has(langName)) {
        entries = [[langName, videosWithPlaceholders.get(langName)]];
      } else {
        entries = [];
      }
    }

    return entries;
  };

  const filteredEntries = getFilteredEntriesWithPriority();

  const handleVideoError = (e, index) => {
    console.error(`Video ${index + 1} failed:`, e.target.error);
  };

  useEffect(() => {
    allVideoSources.forEach((source, index) => {
      if (source.type === "uploaded" && videoRefs.current[index]) {
        videoRefs.current[index].play().catch(() => {});
      }
    });
  }, [allVideoSources]);

  const handleTabClick = (code) => {
    setActiveTab((prev) => (prev === code ? null : code));
    const langName = LANGUAGE_MAP[code];
    if (langName) {
      setTimeout(() => {
        const el = document.getElementById(`section-${langName}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <div className="w-10 h-10 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin mb-4" />
        <p className="text-sm text-slate-400">Loading videos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="bg-slate-900 border border-red-500/20 rounded-xl p-8 max-w-sm text-center">
          <p className="text-red-400 font-semibold mb-2">
            Error Loading Videos
          </p>
          <p className="text-slate-400 text-sm mb-5">{message}</p>
          <button
            onClick={() => dispatch(getStatistics())}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 antialiased flex flex-col">
      {!isLoggedIn && <Header />}
      <main className="pt-24 md:pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <header className="mb-16 text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 uppercase">
              Global <span className="text-blue-500">Masterclass Library</span>
            </h1>
            <p className="text-slate-400 max-w-3xl text-lg leading-relaxed mb-6">
              Localized video resources across 12 linguistic territories. All
              core modules
              <br />
              replicated for international application. Simply use the top menu
              to move <br />
              directly to your preferred language.
            </p>

            {/* Language Buttons - Ab pehle dikhenge */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 md:gap-x-5 gap-y-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              {getPrioritizedLanguages.map(({ code, label, name }) => {
                const langName = LANGUAGE_MAP[code];
                const hasVideos =
                  langName && videosWithPlaceholders.has(langName);
                const isActive = activeTab === code;
                const isPriority =
                  country &&
                  COUNTRY_LANGUAGE_PRIORITY_NAMES[
                    normalizeCountryCode(country)
                  ]?.includes(name);

                return (
                  <button
                    key={code}
                    onClick={() => handleTabClick(code)}
                    disabled={!hasVideos}
                    className={`hover:text-blue-400 transition-colors relative ${
                      isActive ? "text-blue-400" : ""
                    } ${!hasVideos ? "opacity-50 cursor-not-allowed" : ""} ${
                      isPriority && !isActive ? "text-blue-300" : ""
                    }`}
                  >
                    {label}
                    {isPriority && !isActive && (
                      <span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Your Region - Ab niche shift kiya */}
            {country && (
              <div className="mt-6 inline-flex items-center gap-2 bg-slate-800/50 rounded-full px-4 py-2">
                <span className="text-xs text-slate-400">Your region:</span>
                <span className="text-xs font-semibold text-blue-400 uppercase">
                  {country}
                </span>
              </div>
            )}

            {/* Divider line for visual separation */}
            <div className="mt-8 border-t border-slate-800/50"></div>
          </header>

          {/* Language Sections */}
          <div className="space-y-32 md:space-y-40">
            <AnimatePresence mode="wait">
              {filteredEntries.length > 0 ? (
                <motion.div
                  key={activeTab || "all"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {filteredEntries.map(([language, sources]) => {
                    const countryBadges = LANGUAGE_COUNTRIES[language] || [];
                    const isPriorityLanguage =
                      country &&
                      COUNTRY_LANGUAGE_PRIORITY_NAMES[
                        normalizeCountryCode(country)
                      ]?.includes(language);

                    return (
                      <section
                        key={language}
                        id={`section-${language}`}
                        className="scroll-mt-32 md:scroll-mt-24 mb-16 last:mb-0"
                      >
                        {/* Language Header with Flags */}
                        <div
                          className={`flex flex-col md:flex-row md:items-end justify-between mb-10 border-b pb-8 gap-8 ${
                            isPriorityLanguage
                              ? "border-blue-500/50"
                              : "border-slate-800"
                          }`}
                        >
                          <h2
                            className={`text-3xl font-bold ${
                              isPriorityLanguage
                                ? "text-blue-400"
                                : "text-white"
                            }`}
                          >
                            {language}
                          </h2>
                          <div className="flex flex-wrap gap-2">
                            {countryBadges.map((cc) => (
                              <span
                                key={cc}
                                className={`w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden ${
                                  cc === country ||
                                  cc === country?.toUpperCase()
                                    ? "ring-2 ring-blue-500"
                                    : ""
                                }`}
                                title={cc}
                              >
                                <img
                                  src={`https://flagcdn.com/${cc.toLowerCase()}.svg`}
                                  alt={cc}
                                  className="w-full h-full object-cover"
                                />
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Video Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {sources.map((source, idx) => {
                            const isPlaceholder = source.type === "placeholder";
                            const isUploaded = source.type === "uploaded";
                            const url = !isPlaceholder
                              ? Array.isArray(source.url)
                                ? source.url[0]?.trim()
                                : source.url?.trim()
                              : null;
                            const secureUrl =
                              url && url.startsWith("https://")
                                ? url
                                : url && url.startsWith("http://")
                                  ? url.replace("http://", "https://")
                                  : null;
                            const videoId =
                              !isPlaceholder &&
                              !isUploaded &&
                              isYouTubeUrl(secureUrl)
                                ? extractVideoId(secureUrl)
                                : null;
                            const globalIndex = allVideoSources.findIndex(
                              (s) => s === source,
                            );

                            return (
                              <div key={idx} className="group flex flex-col">
                                {/* Video Container */}
                                <div
                                  className={`w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border transition-all duration-300 ${
                                    !isPlaceholder
                                      ? isPriorityLanguage
                                        ? "group-hover:border-blue-500 border-blue-500/30"
                                        : "group-hover:border-blue-500 border-slate-800"
                                      : "border-slate-800"
                                  }`}
                                >
                                  {isPlaceholder ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-600">
                                        Coming Soon
                                      </span>
                                    </div>
                                  ) : isUploaded && secureUrl ? (
                                    <video
                                      ref={(el) =>
                                        (videoRefs.current[globalIndex] = el)
                                      }
                                      controls
                                      className="w-full h-full object-cover"
                                      title={
                                        source.description || `Video ${idx + 1}`
                                      }
                                      onError={(e) =>
                                        handleVideoError(e, globalIndex)
                                      }
                                    >
                                      <source
                                        src={secureUrl}
                                        type="video/mp4"
                                      />
                                    </video>
                                  ) : videoId ? (
                                    <iframe
                                      src={getEmbedUrl(videoId)}
                                      title={
                                        source.description || `Video ${idx + 1}`
                                      }
                                      className="w-full h-full border-0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-600">
                                        Coming Soon
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {/* Title */}
                                {!isPlaceholder && (
                                  <div className="pt-3">
                                    {source.description && (
                                      <p className="text-sm font-medium text-white leading-snug line-clamp-2">
                                        {source.description}
                                      </p>
                                    )}
                                    {videoId && secureUrl && (
                                      <a
                                        href={secureUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                      >
                                        <svg
                                          className="w-3 h-3"
                                          viewBox="0 0 24 24"
                                          fill="currentColor"
                                        >
                                          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.43.029 5.804 0 12c.029 6.196.488 8.57 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.57 23.971 18.196 24 12c-.029-6.196-.488-8.57-4.385-8.816zM9 16V8l8 4-8 4z" />
                                        </svg>
                                        Watch on YouTube
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-32 text-center"
                >
                  <svg
                    className="w-12 h-12 text-slate-700 mb-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                  <p className="text-slate-500 font-semibold mb-1">
                    No videos found
                  </p>
                  <p className="text-slate-600 text-sm">
                    Check back later for new content!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {!isLoggedIn && <Footer />}
    </div>
  );
};

export default Statistics;
