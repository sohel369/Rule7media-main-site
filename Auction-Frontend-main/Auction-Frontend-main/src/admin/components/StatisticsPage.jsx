import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  createStatistic,
  getStatistics,
  reset,
  updateStatistic,
  deleteStatistic,
} from "../../store/statistic/statisticSlice";
import {
  FaPlus,
  FaSyncAlt,
  FaEdit,
  FaExternalLinkAlt,
  FaTimes,
  FaTrash,
  FaYoutube,
  FaPlay,
  FaGlobe,
  FaBuilding,
  FaChevronLeft,
  FaChevronRight,
  FaVideo,
  FaCodeBranch,
  FaTachometerAlt,
  FaEllipsisV,
  FaShoppingCart,
  FaDollarSign,
  FaQuestionCircle,
  FaChevronDown,
} from "react-icons/fa";

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "th", name: "Thai" },
  { code: "id", name: "Indonesian" },
  { code: "hi", name: "Hindi" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "vi", name: "Vietnamese" },
  { code: "fil", name: "Filipino" },
];

const VIDEO_TYPES = [
  {
    value: "wrapper",
    label: "Wrapper Landing Page",
    icon: FaCodeBranch,
    color: "purple",
  },
  { value: "cpm", label: "CPM Page", icon: FaTachometerAlt, color: "blue" },
  { value: "global", label: "Statistics Pages", icon: FaGlobe, color: "green" },
  {
    value: "buyerMarket",
    label: "Buyer Marketing Executive",
    icon: FaShoppingCart,
    color: "orange",
    page: "/buyer-market",
    description: "Buyer market related videos",
  },
  {
    value: "pricingMethodology",
    label: "Pricing Methodology Page",
    icon: FaDollarSign,
    color: "emerald",
    page: "/pricing-methodology",
    description: "Pricing methodology related videos",
  },
  {
    value: "howItWork",
    label: "How It Works Page",
    icon: FaQuestionCircle,
    color: "pink",
    page: "/how-it-work",
    description: "How it works explanation videos",
  },
  {
    value: "franchiseFaq",
    label: "Franchise FAQ Page",
    icon: FaQuestionCircle,
    color: "cyan",
    page: "/franchise-faq",
    description: "Franchise FAQ related videos",
  },
  {
    value: "fleetOwner",
    label: "Fleet Owner Landing Page",
    icon: FaBuilding,
    color: "yellow",
    page: "/fleet-owner",
    description: "Fleet owner related videos",
  },
];

const LANGUAGE_MAP = SUPPORTED_LANGUAGES.reduce((acc, lang) => {
  acc[lang.code] = lang.name;
  return acc;
}, {});

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const isValidYouTubeUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const regExp =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return regExp.test(url);
};

const getYouTubeVideoId = (url) => {
  let urlString = url;
  if (Array.isArray(url)) {
    if (url.length === 0) return null;
    urlString = url[0];
  }
  if (!urlString || typeof urlString !== "string") return null;
  const regExp =
    /(?:youtube\.com\/(?:[^\/]+\/.*\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = urlString.match(regExp);
  return match && match[1] && match[1].length === 11 ? match[1] : null;
};

const FileSizeWarning = ({ currentSize, maxSize }) => {
  if (currentSize < maxSize * 0.8) return null;
  const percentage = (currentSize / maxSize) * 100;
  return (
    <div
      className={`mt-2 p-3 rounded-lg border-l-4 ${
        percentage > 100
          ? "bg-red-900/30 border-red-500 text-red-400"
          : percentage > 80
            ? "bg-yellow-900/30 border-yellow-500 text-yellow-400"
            : "bg-blue-900/30 border-blue-500 text-blue-400"
      }`}
    >
      <p className="text-sm font-medium">
        {percentage > 100
          ? "File size exceeds limit!"
          : percentage > 80
            ? "File size approaching limit"
            : "File size within limits"}
      </p>
      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
        <div
          className={`h-2 rounded-full ${
            percentage > 100
              ? "bg-red-500"
              : percentage > 80
                ? "bg-yellow-500"
                : "bg-blue-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-xs mt-1">
        {(currentSize / (1024 * 1024)).toFixed(2)}MB / {maxSize / (1024 * 1024)}
        MB
      </p>
    </div>
  );
};

// ✅ Video Type Filter Dropdown
const VideoTypeFilter = ({ selectedVideoType, onVideoTypeChange, counts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedType = VIDEO_TYPES.find((t) => t.value === selectedVideoType);
  const SelectedIcon = selectedType?.icon || FaVideo;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition text-white"
      >
        <SelectedIcon size={14} />
        <span>{selectedType?.label || "All Pages"}</span>
        <span className="text-xs text-gray-400">
          ({counts[selectedVideoType] || 0})
        </span>
        <FaChevronDown
          size={12}
          className={`ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          <button
            onClick={() => {
              onVideoTypeChange("all");
              setIsOpen(false);
            }}
            className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition flex items-center justify-between ${
              selectedVideoType === "all"
                ? "bg-indigo-600/20 text-indigo-400"
                : "text-gray-300"
            }`}
          >
            <span>All Pages</span>
            <span className="text-xs text-gray-400">({counts.all})</span>
          </button>

          {VIDEO_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => {
                  onVideoTypeChange(type.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition flex items-center justify-between ${
                  selectedVideoType === type.value
                    ? "bg-indigo-600/20 text-indigo-400"
                    : "text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={14} />
                  <span>{type.label}</span>
                </div>
                <span className="text-xs text-gray-400">
                  ({counts[type.value] || 0})
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ✅ Language Filter Dropdown
const LanguageFilter = ({ selectedLanguage, onLanguageChange, counts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLang = SUPPORTED_LANGUAGES.find(
    (l) => l.code === selectedLanguage,
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition text-white"
      >
        <FaGlobe size={14} />
        <span>
          {selectedLanguage === "all" ? "All Languages" : selectedLang?.name}
        </span>
        <span className="text-xs text-gray-400">
          ({counts[selectedLanguage] || 0})
        </span>
        <FaChevronDown
          size={12}
          className={`ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          <button
            onClick={() => {
              onLanguageChange("all");
              setIsOpen(false);
            }}
            className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition flex items-center justify-between ${
              selectedLanguage === "all"
                ? "bg-indigo-600/20 text-indigo-400"
                : "text-gray-300"
            }`}
          >
            <span>All Languages</span>
            <span className="text-xs text-gray-400">({counts.all})</span>
          </button>

          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onLanguageChange(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition flex items-center justify-between ${
                selectedLanguage === lang.code
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "text-gray-300"
              }`}
            >
              <span>{lang.name}</span>
              <span className="text-xs text-gray-400">
                ({counts[lang.code] || 0})
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const StatisticForm = ({ onClose, currentStatistic }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.statistic);

  const [formData, setFormData] = useState({
    videoType: "global",
    sources: [
      { url: "", description: "", type: "external", file: null, language: "" },
    ],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentStatistic?._id && typeof currentStatistic._id === "string") {
      const clonedSources =
        Array.isArray(currentStatistic.sources) &&
        currentStatistic.sources.length
          ? currentStatistic.sources.map((src) => ({
              url: Array.isArray(src.url)
                ? src.url[0] || ""
                : typeof src.url === "string"
                  ? src.url
                  : "",
              description: src.description || "",
              type: src.type || "external",
              file: null,
              language: src.language || "",
            }))
          : [
              {
                url: "",
                description: "",
                type: "external",
                file: null,
                language: "",
              },
            ];
      setFormData({
        videoType: currentStatistic.videoType || "global",
        sources: clonedSources,
      });
    } else {
      setFormData({
        videoType: "global",
        sources: [
          {
            url: "",
            description: "",
            type: "external",
            file: null,
            language: "",
          },
        ],
      });
    }
  }, [currentStatistic]);

  const validateForm = () => {
    const newErrors = {};
    const validSources = formData.sources.filter((source) => {
      if (source.type === "external") {
        const url = typeof source.url === "string" ? source.url : "";
        if (!url.trim() || !source.description.trim() || !source.language)
          return false;
        if (!isValidYouTubeUrl(url)) {
          toast.error("All external URLs must be valid YouTube links!");
          newErrors.sources = "All external URLs must be valid YouTube links";
          return false;
        }
        return true;
      } else if (source.type === "uploaded") {
        return (
          (source.file || source.url) &&
          source.description.trim() &&
          source.language
        );
      }
      return false;
    });
    if (validSources.length === 0 && !newErrors.sources) {
      newErrors.sources =
        "At least one complete source with language is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSourceChange = (index, field, value) => {
    const newSources = formData.sources.map((source, i) =>
      i === index ? { ...source, [field]: value } : source,
    );
    setFormData((prev) => ({ ...prev, sources: newSources }));
    if (errors.sources) setErrors((prev) => ({ ...prev, sources: "" }));
  };

  const handleFileChange = (index, file) => {
    if (file && file.size > MAX_FILE_SIZE) {
      toast.error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
      return;
    }
    const newSources = formData.sources.map((source, i) =>
      i === index
        ? {
            ...source,
            file,
            type: file ? "uploaded" : source.type,
            url: file ? "" : source.url,
          }
        : source,
    );
    setFormData((prev) => ({ ...prev, sources: newSources }));
    if (errors.sources) setErrors((prev) => ({ ...prev, sources: "" }));
  };

  const addSource = () => {
    setFormData((prev) => ({
      ...prev,
      sources: [
        ...prev.sources,
        {
          url: "",
          description: "",
          type: "external",
          file: null,
          language: "",
        },
      ],
    }));
  };

  const removeSource = (index) => {
    if (formData.sources.length > 1) {
      setFormData((prev) => ({
        ...prev,
        sources: prev.sources.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const totalFileSize = formData.sources.reduce(
      (total, source) => total + (source.file ? source.file.size : 0),
      0,
    );
    if (totalFileSize > MAX_FILE_SIZE) {
      toast.error(
        `Total file size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
      );
      return;
    }

    const formDataToSend = new FormData();
    const validSources = formData.sources.filter((source) => {
      if (source.type === "external")
        return (
          source.url.trim() && source.description.trim() && source.language
        );
      if (source.type === "uploaded")
        return (
          (source.file || source.url) &&
          source.description.trim() &&
          source.language
        );
      return false;
    });

    const statisticData = {
      sources: validSources,
      videoType: formData.videoType,
    };

    formDataToSend.append("sources", JSON.stringify(statisticData.sources));
    formDataToSend.append("videoType", statisticData.videoType);
    validSources.forEach((source) => {
      if (source.file) formDataToSend.append("videos", source.file);
    });

    try {
      if (currentStatistic?._id) {
        await dispatch(
          updateStatistic({
            id: currentStatistic._id,
            statisticData: formDataToSend,
          }),
        ).unwrap();
        toast.success("Statistic updated successfully!");
      } else {
        await dispatch(createStatistic(formDataToSend)).unwrap();
        toast.success("Statistic created successfully!");
      }
      onClose();
      dispatch(getStatistics());
    } catch (error) {
      if (error?.response?.status === 413) {
        toast.error(
          error?.response?.data?.message ||
            "File too large! Maximum allowed size is 100MB.",
        );
      } else if (
        error?.code === "ECONNABORTED" ||
        error?.message?.includes("timeout")
      ) {
        toast.error("Upload timed out. Please try a smaller file.");
      } else if (error?.message === "Network Error") {
        toast.error(
          "Network error — file may be too large or server unreachable.",
        );
      } else {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Upload failed. Please try again.",
        );
      }
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
      <div className="bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {currentStatistic ? <FaEdit /> : <FaPlus />}
            {currentStatistic ? "Edit Statistic" : "Add New Statistic"}
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition p-1"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Video Type *
            </label>
            <select
              value={formData.videoType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  videoType: e.target.value,
                }))
              }
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              required
            >
              {VIDEO_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <FaGlobe className="text-indigo-400" /> Video Sources
              </label>
              <button
                type="button"
                onClick={addSource}
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1 transition"
              >
                <FaPlus size={12} /> Add Source
              </button>
            </div>
            {errors.sources && (
              <p className="text-red-400 text-sm mb-3">{errors.sources}</p>
            )}
            <div className="space-y-5">
              {formData.sources.map((source, index) => (
                <div
                  key={index}
                  className="border border-gray-700 rounded-xl p-5 bg-gray-800/50 hover:bg-gray-800 transition"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-semibold text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
                      Source {index + 1}
                    </span>
                    {formData.sources.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSource(index)}
                        className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition"
                      >
                        <FaTrash size={12} /> Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Source Type
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleSourceChange(index, "type", "external")
                          }
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition ${
                            source.type === "external"
                              ? "bg-indigo-600/20 border-indigo-500 text-indigo-400"
                              : "bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600"
                          }`}
                        >
                          <FaYoutube size={14} /> YouTube
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleSourceChange(index, "type", "uploaded")
                          }
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition ${
                            source.type === "uploaded"
                              ? "bg-indigo-600/20 border-indigo-500 text-indigo-400"
                              : "bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600"
                          }`}
                        >
                          <FaPlay size={14} /> Upload
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Language *
                      </label>
                      <select
                        value={source.language}
                        onChange={(e) =>
                          handleSourceChange(index, "language", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-white"
                        required
                      >
                        <option value="">Select Language</option>
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {source.type === "external" ? (
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        YouTube URL *
                      </label>
                      <input
                        type="url"
                        value={source.url}
                        onChange={(e) =>
                          handleSourceChange(index, "url", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-white"
                        placeholder="https://www.youtube.com/watch?v=..."
                        required={source.type === "external"}
                      />
                    </div>
                  ) : (
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Upload Video * (Max: {MAX_FILE_SIZE / (1024 * 1024)}MB)
                      </label>
                      {source.url && (
                        <div className="mb-2 text-sm text-gray-400">
                          Current:{" "}
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:underline"
                          >
                            View Video
                          </a>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/ogg"
                        onChange={(e) =>
                          handleFileChange(index, e.target.files[0])
                        }
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 transition cursor-pointer"
                        required={
                          source.type === "uploaded" &&
                          !source.url &&
                          !source.file
                        }
                      />
                      {source.file && (
                        <>
                          <p className="text-xs text-gray-400 mt-1">
                            Selected: {source.file.name} (
                            {(source.file.size / (1024 * 1024)).toFixed(2)}MB)
                          </p>
                          <FileSizeWarning
                            currentSize={source.file.size}
                            maxSize={MAX_FILE_SIZE}
                          />
                        </>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Video Title *
                    </label>
                    <input
                      type="text"
                      value={source.description}
                      onChange={(e) =>
                        handleSourceChange(index, "description", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-white"
                      placeholder="Enter video title..."
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-600 transition flex items-center justify-center gap-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                "Saving..."
              ) : (
                <>{currentStatistic ? "Update" : "Create"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Video Card Component with Edit/Delete buttons
const VideoCard = ({ source, type, onEdit, onDelete, videoTypeInfo }) => {
  const getVideoUrl = () => {
    if (!source.url) return null;
    if (typeof source.url === "string") return source.url;
    if (Array.isArray(source.url) && source.url.length > 0)
      return source.url[0];
    return null;
  };

  const videoUrl = getVideoUrl();
  const videoId = type === "youtube" ? getYouTubeVideoId(videoUrl) : null;
  const isUploadedVideo = type === "uploaded" && videoUrl;

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-700">
      <div className="relative bg-gray-900 aspect-video">
        {type === "youtube" && videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={source.description}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : isUploadedVideo ? (
          <video
            src={videoUrl}
            controls
            className="absolute inset-0 w-full h-full object-contain"
            title={source.description}
            onError={(e) => {
              console.error("Video load error:", videoUrl);
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            {type === "youtube" ? (
              <FaYoutube className="text-gray-600 text-5xl" />
            ) : (
              <FaPlay className="text-gray-600 text-4xl" />
            )}
          </div>
        )}

        {/* Video Type Badge */}
        {videoTypeInfo && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-green-600 text-xs font-medium flex items-center gap-1">
            <videoTypeInfo.icon size={10} /> {videoTypeInfo.label}
          </div>
        )}

        {/* Action Buttons - Edit & Delete */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(source)}
            className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-lg"
            title="Edit Video"
          >
            <FaEdit size={12} />
          </button>
          <button
            onClick={() => onDelete(source)}
            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition shadow-lg"
            title="Delete Video"
          >
            <FaTrash size={12} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <h4 className="text-sm font-semibold text-white line-clamp-2 mb-1">
          {source.description}
        </h4>
        <p className="text-xs text-gray-400">
          {LANGUAGE_MAP[source.language] || "Unknown"}
        </p>
        {type === "youtube" && videoUrl && (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-2"
          >
            Watch on YouTube <FaExternalLinkAlt size={10} />
          </a>
        )}
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <FaChevronLeft size={14} />
      </button>
      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            currentPage === page
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <FaChevronRight size={14} />
      </button>
    </div>
  );
};

const StatisticsPage = () => {
  const dispatch = useDispatch();
  const { statistics, isLoading, isError, message } = useSelector(
    (state) => state.statistic,
  );

  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [statToDelete, setStatToDelete] = useState(null);
  const [currentStatistic, setCurrentStatistic] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedVideoType, setSelectedVideoType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    dispatch(getStatistics());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const getUrlString = (url) => {
    if (!url) return "";
    if (typeof url === "string") return url;
    if (Array.isArray(url) && url.length > 0) return url[0];
    return "";
  };

  // Extract all videos from statistics with language info - SORTED BY DATE (newest first)
  const allVideos = useMemo(() => {
    const videos = [];
    statistics.forEach((stat) => {
      if (stat.sources && Array.isArray(stat.sources)) {
        stat.sources.forEach((source, idx) => {
          const urlString = getUrlString(source.url);

          let type = "uploaded";
          if (
            source.type === "external" &&
            urlString &&
            isValidYouTubeUrl(urlString)
          ) {
            type = "youtube";
          } else if (source.type === "external" && urlString) {
            type = "external";
          } else if (source.type === "uploaded") {
            type = "uploaded";
          }

          videos.push({
            ...source,
            url: urlString,
            type: type,
            videoType: stat.videoType,
            statId: stat._id,
            createdAt: stat.createdAt || new Date().toISOString(),
            sourceIndex: idx,
          });
        });
      }
    });

    // Sort by createdAt date (newest first)
    return videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [statistics]);

  const videoTypeCounts = useMemo(() => {
    const counts = { all: allVideos.length };
    VIDEO_TYPES.forEach((type) => {
      counts[type.value] = allVideos.filter(
        (v) => v.videoType === type.value,
      ).length;
    });
    return counts;
  }, [allVideos]);

  // Filter videos by language and video type
  const filteredVideos = useMemo(() => {
    let videos = allVideos;

    // Language Filter
    if (selectedLanguage !== "all") {
      videos = videos.filter((video) => video.language === selectedLanguage);
    }

    // Video Type Filter
    if (selectedVideoType !== "all") {
      videos = videos.filter((video) => video.videoType === selectedVideoType);
    }

    return videos;
  }, [allVideos, selectedLanguage, selectedVideoType]);

  // Paginate videos
  const paginatedVideos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredVideos.slice(start, end);
  }, [filteredVideos, currentPage]);

  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLanguage, selectedVideoType]);

  const languageCounts = useMemo(() => {
    const counts = { all: allVideos.length };
    SUPPORTED_LANGUAGES.forEach((lang) => {
      counts[lang.code] = allVideos.filter(
        (v) => v.language === lang.code,
      ).length;
    });
    return counts;
  }, [allVideos]);

  const handleEditVideo = (video) => {
    const statistic = statistics.find((stat) => stat._id === video.statId);
    if (statistic) {
      setCurrentStatistic(statistic);
      setShowForm(true);
    } else {
      toast.error("Cannot edit: Statistic not found");
    }
  };

  const handleDeleteVideo = (video) => {
    const statistic = statistics.find((stat) => stat._id === video.statId);
    if (statistic) {
      setStatToDelete(statistic);
      setShowDeleteModal(true);
    } else {
      toast.error("Cannot delete: Statistic not found");
    }
  };

  const confirmDelete = async () => {
    if (statToDelete) {
      try {
        await dispatch(deleteStatistic(statToDelete._id)).unwrap();
        toast.success("Video deleted successfully!");
        dispatch(getStatistics());
        setShowDeleteModal(false);
        setStatToDelete(null);
      } catch (error) {
        toast.error("Failed to delete video!");
      }
    }
  };

  const getVideoTypeInfo = (videoType) => {
    const type = VIDEO_TYPES.find((t) => t.value === videoType);
    if (type) {
      const Icon = type.icon;
      return { icon: Icon, color: type.color, label: type.label };
    }
    return { icon: FaVideo, color: "gray", label: "Unknown" };
  };

  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
      <div className="bg-gray-900 rounded-xl w-full max-w-md p-6 shadow-2xl border border-gray-700">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 mb-4">
            <FaTrash className="text-red-400" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Delete Video
          </h3>
          <p className="text-gray-400 mb-6">
            Are you sure you want to delete this video? This action cannot be
            undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Media Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your video statistics and content library
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Videos</p>
                <p className="text-2xl font-bold text-white">
                  {allVideos.length}
                </p>
              </div>
              <div className="p-3 bg-indigo-600/20 rounded-full">
                <FaVideo className="text-indigo-400 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Languages</p>
                <p className="text-2xl font-bold text-white">
                  {SUPPORTED_LANGUAGES.length}
                </p>
              </div>
              <div className="p-3 bg-purple-600/20 rounded-full">
                <FaGlobe className="text-purple-400 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Video Library</h2>
            <p className="text-gray-400 text-sm">
              Browse and manage all your videos
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setCurrentStatistic(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition shadow-lg"
            >
              <FaPlus size={14} /> Add Statistic
            </button>
            <button
              onClick={() => dispatch(getStatistics())}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition shadow-lg"
            >
              <FaSyncAlt
                className={isLoading ? "animate-spin" : ""}
                size={14}
              />{" "}
              Refresh
            </button>
          </div>
        </div>

        {/* ✅ IMPROVED: Filter Bar with Dropdowns */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <VideoTypeFilter
            selectedVideoType={selectedVideoType}
            onVideoTypeChange={setSelectedVideoType}
            counts={videoTypeCounts}
          />

          <LanguageFilter
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            counts={languageCounts}
          />

          {/* Clear Filters Button */}
          {(selectedVideoType !== "all" || selectedLanguage !== "all") && (
            <button
              onClick={() => {
                setSelectedVideoType("all");
                setSelectedLanguage("all");
              }}
              className="px-3 py-2 text-sm text-gray-400 hover:text-white transition flex items-center gap-1"
            >
              <FaTimes size={12} /> Clear filters
            </button>
          )}
        </div>

        {/* Active Filters Badges */}
        {(selectedVideoType !== "all" || selectedLanguage !== "all") && (
          <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-gray-700">
            <span className="text-xs text-gray-400">Active filters:</span>
            {selectedVideoType !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-600/20 text-indigo-400 rounded-md text-xs">
                {VIDEO_TYPES.find((t) => t.value === selectedVideoType)?.label}
                <button
                  onClick={() => setSelectedVideoType("all")}
                  className="hover:text-white"
                >
                  <FaTimes size={10} />
                </button>
              </span>
            )}
            {selectedLanguage !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600/20 text-purple-400 rounded-md text-xs">
                {
                  SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)
                    ?.name
                }
                <button
                  onClick={() => setSelectedLanguage("all")}
                  className="hover:text-white"
                >
                  <FaTimes size={10} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Video Grid */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {isError && (
          <div className="bg-red-900/30 border-l-4 border-red-500 text-red-400 p-4 rounded-lg mb-6">
            <p className="font-medium">Error: {message}</p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {filteredVideos.length === 0 ? (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
                <FaVideo className="text-gray-600 text-5xl mx-auto mb-4" />
                <p className="text-gray-400 font-medium">No videos found</p>
                <p className="text-gray-500 text-sm mt-1">
                  Try changing your filters or add a new statistic!
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedVideos.map((video, index) => {
                    const videoTypeInfo = getVideoTypeInfo(video.videoType);
                    return (
                      <VideoCard
                        key={`${video.statId}-${index}`}
                        source={video}
                        type={video.type}
                        onEdit={handleEditVideo}
                        onDelete={handleDeleteVideo}
                        videoTypeInfo={videoTypeInfo}
                      />
                    );
                  })}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </>
        )}

        {/* Modals */}
        {showForm && (
          <StatisticForm
            onClose={() => {
              setShowForm(false);
              setCurrentStatistic(null);
            }}
            currentStatistic={currentStatistic}
          />
        )}
        {showDeleteModal && <DeleteModal />}
      </div>
    </div>
  );
};

export default StatisticsPage;
