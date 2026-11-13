import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Mail,
  Building,
  User,
  Briefcase,
  Globe2,
  CheckCircle,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { downloadKit, fetchAvailableKits, resetDownloadState } from "../store/mediakit/mediaKitSlice";
import { fetchUserCountry } from "../store/countary/countrySlice";
import baseUrl from "../config.js";
import axiosInstance from "../axiosInstance";

// 11 Supported languages with native labels and flags
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
];

// Country to multi-language priority mapping
export const COUNTRY_LANGUAGE_MAP = {
  India: ["hi", "en"],
  IN: ["hi", "en"],
  Canada: ["en", "fr"],
  CA: ["en", "fr"],
  "United States": ["en", "es"],
  USA: ["en", "es"],
  US: ["en", "es"],
  Spain: ["es", "en"],
  ES: ["es", "en"],
  Mexico: ["es", "en"],
  MX: ["es", "en"],
  France: ["fr", "en"],
  FR: ["fr", "en"],
  Belgium: ["fr", "en"],
  BE: ["fr", "en"],
  Germany: ["de", "en"],
  DE: ["de", "en"],
  Austria: ["de", "en"],
  AT: ["de", "en"],
  Switzerland: ["de", "fr", "en"],
  CH: ["de", "fr", "en"],
  China: ["zh", "en"],
  CN: ["zh", "en"],
  Taiwan: ["zh", "en"],
  TW: ["zh", "en"],
  Japan: ["ja", "en"],
  JP: ["ja", "en"],
  Brazil: ["pt", "en"],
  BR: ["pt", "en"],
  Portugal: ["pt", "en"],
  PT: ["pt", "en"],
  Indonesia: ["id", "en"],
  ID: ["id", "en"],
  Thailand: ["th", "en"],
  TH: ["th", "en"],
  Vietnam: ["vi", "en"],
  VN: ["vi", "en"],
  Australia: ["en"],
  AU: ["en"],
  "United Kingdom": ["en"],
  UK: ["en"],
  GB: ["en"],
};

const MediaKitDownloadModal = ({ isOpen, onClose, initialLanguage }) => {
  const dispatch = useDispatch();
  const countryFromStore = useSelector((state) => state.country?.country);
  const { loading, activeLanguages } = useSelector((state) => state.mediaKit);

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    industry: "",
    country: "",
    language: "en",
  });

  const [suggestedLangs, setSuggestedLangs] = useState(["en"]);
  const [detectedCountryName, setDetectedCountryName] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Filter which of the country's suggested languages are actually uploaded/available on the server
  const uploadedSuggestedLangs = activeLanguages.filter(
    (lang) => lang.isAvailable && lang.isSuggestedForCountry
  );

  // Auto-select language when active languages are fetched
  useEffect(() => {
    if (uploadedSuggestedLangs.length === 1) {
      setForm((prev) => ({ ...prev, language: uploadedSuggestedLangs[0].code }));
    } else if (uploadedSuggestedLangs.length > 1) {
      const exists = uploadedSuggestedLangs.some((l) => l.code === form.language);
      if (!exists) {
        setForm((prev) => ({ ...prev, language: uploadedSuggestedLangs[0].code }));
      }
    }
  }, [activeLanguages]);

  // Initialize and detect user's country
  useEffect(() => {
    if (isOpen) {
      if (!countryFromStore) {
        dispatch(fetchUserCountry());
      }
      setIsSuccess(false);
    }
  }, [isOpen, countryFromStore, dispatch]);

  // Set country and suggested languages when country is available
  useEffect(() => {
    if (countryFromStore) {
      setDetectedCountryName(countryFromStore);
      const mapped = COUNTRY_LANGUAGE_MAP[countryFromStore] ||
        COUNTRY_LANGUAGE_MAP[countryFromStore.toUpperCase()] || ["en"];
      setSuggestedLangs(mapped);

      // Set default selected language based on country priority
      const defaultLang = initialLanguage || mapped[0] || "en";
      setForm((prev) => ({
        ...prev,
        country: countryFromStore,
        language: defaultLang,
      }));

      // Fetch server availability
      dispatch(fetchAvailableKits(countryFromStore));
    }
  }, [countryFromStore, initialLanguage, dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLanguageSelect = (langCode) => {
    setForm((prev) => ({ ...prev, language: langCode }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please provide both your name and email address.");
      return;
    }

    const toastId = toast.loading("Downloading Media Kit...");
    try {
      const selectedLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === form.language);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        industry: form.industry.trim(),
        country: form.country || detectedCountryName || "Global",
        language: form.language,
      };

      const result = await dispatch(downloadKit(payload)).unwrap();
      const targetFilename = result?.filename || `Rule7_MediaKit_${form.language || "en"}.pdf`;

      // Fetch and download real PDF blob directly via axiosInstance
      try {
        const fileUrl = result?.downloadUrl
          ? new URL(result.downloadUrl, axiosInstance.defaults.baseURL).toString()
          : `${axiosInstance.defaults.baseURL}/media-leads/file/${encodeURIComponent(targetFilename)}`;
        const response = await axiosInstance.get(fileUrl, {
          responseType: "blob",
        });

        const blob = new Blob([response.data], { type: "application/pdf" });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", targetFilename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 5000);
      } catch (downloadErr) {
        console.warn("Direct blob download fallback:", downloadErr);
        if (result?.downloadUrl) {
          const link = document.createElement("a");
          link.href = new URL(result.downloadUrl, axiosInstance.defaults.baseURL).toString();
          link.setAttribute("download", targetFilename);
          link.setAttribute("target", "_blank");
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      }

      toast.update(toastId, {
        render: `✅ ${selectedLangObj?.name ? `${selectedLangObj.name} ` : ""}Media Kit Downloaded Successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 4000,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        dispatch(resetDownloadState());
      }, 2500);
    } catch (error) {
      toast.update(toastId, {
        render: typeof error === "string" ? error : "Failed to download. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-8"
        >
          {/* Header Gradient */}
          <div className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 px-6 py-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
                <Sparkles size={13} className="text-yellow-300" /> Multilingual Media Kit
              </span>
              {detectedCountryName && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-black/20 backdrop-blur-md">
                  <Globe2 size={13} /> {detectedCountryName}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Download Official Media Kit</h2>
            <p className="text-blue-100 text-sm mt-1">
              Localized advertising insights, fleet inventory & verified campaign ROI.
            </p>
          </div>

          {isSuccess ? (
            <div className="p-10 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle size={36} />
              </div>
              <h3 className="text-xl font-bold text-white">Media Kit Downloaded!</h3>
              <p className="text-sm text-slate-300 max-w-md">
                Your download has started. A copy has also been sent to <span className="text-blue-400 font-semibold">{form.email}</span>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* 🌍 Large, clear and beautiful country/language indicator */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-2 text-left">
                <p className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                  Media Kit to Download:
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {SUPPORTED_LANGUAGES.find((l) => l.code === form.language)?.flag || "🌐"}
                  </span>
                  <div>
                    <div className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span>{detectedCountryName || "Global"} Edition</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Language: <span className="text-white font-semibold">{SUPPORTED_LANGUAGES.find((l) => l.code === form.language)?.name || "English"}</span>
                    </p>
                  </div>
                </div>
              </div>
              {/* Language Edition Selector ONLY when multiple active kits exist for this country */}
              {uploadedSuggestedLangs.length > 1 && (
                <div className="text-left bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Choose Language Edition / भाषा संस्करण चुनें:
                  </label>
                  <div className="flex gap-2">
                    {uploadedSuggestedLangs.map((lang) => {
                      const isSelected = form.language === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => handleLanguageSelect(lang.code)}
                          className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? "bg-white text-blue-900 border-white shadow-md"
                              : "bg-slate-800 text-slate-350 border-slate-700 hover:bg-slate-750"
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* User Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User size={13} className="text-blue-400" /> Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Mail size={13} className="text-blue-400" /> Business Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@company.com"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Building size={13} className="text-blue-400" /> Company Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Your Brand / Agency"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Briefcase size={13} className="text-blue-400" /> Industry
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={form.industry}
                    onChange={handleChange}
                    placeholder="e.g. Automotive, FMCG"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Submit & Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-xl shadow-blue-600/30 transition-all transform active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing Localized Kit...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Download {SUPPORTED_LANGUAGES.find((l) => l.code === form.language)?.name || "English"} Media Kit (PDF)
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-500 mt-2">
                  🔒 We respect your privacy. A high-resolution copy will be sent to your email directly.
                </p>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MediaKitDownloadModal;
