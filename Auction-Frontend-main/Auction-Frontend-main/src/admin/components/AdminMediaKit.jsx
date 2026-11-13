import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Upload,
  Trash2,
  FileText,
  RefreshCw,
  Layers,
  ChevronRight,
  Users,
  Mail,
  Download,
  History,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Globe,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import baseUrl from "../../config";
import axiosInstance from "../../axiosInstance";
import {
  fetchAdminLanguageKits,
  fetchDownloads,
  fetchKitHistory,
  uploadKit,
  deleteLanguageKit,
  deleteDownloadRecord,
  setDeleteConfirm,
  setDeleteKitConfirmLang,
  setFilterLanguage,
  setSearchQuery,
  resetAdminState,
  clearKitHistory,
  setDownloadsPage,
  setHistoryPage,
} from "../../store/mediakit/mediaKitSlice";

// 11 Supported Languages definition
const SUPPORTED_LANGUAGES_INFO = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", region: "United States / Global" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", region: "India" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", region: "Spain / Latin America" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳", region: "China" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", region: "Japan" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", region: "Germany" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", region: "France / Canada" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷", region: "Brazil / Portugal" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩", region: "Indonesia" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭", region: "Thailand" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳", region: "Vietnam" },
];

// Country config: each country maps to ONLY its relevant languages
// This drives the language grid — admin sees only languages that make sense for that country
const COUNTRY_LANGUAGE_MAP = {
  Global:         { flag: "🌐", langs: ["en"] },
  India:          { flag: "🇮🇳", langs: ["hi", "en"] },
  "United States":{ flag: "🇺🇸", langs: ["en", "es"] },
  "United Kingdom":{ flag: "🇬🇧", langs: ["en"] },
  Australia:      { flag: "🇦🇺", langs: ["en"] },
  Canada:         { flag: "🇨🇦", langs: ["en", "fr"] },
  Germany:        { flag: "🇩🇪", langs: ["de"] },
  France:         { flag: "🇫🇷", langs: ["fr"] },
  Spain:          { flag: "🇪🇸", langs: ["es"] },
  Brazil:         { flag: "🇧🇷", langs: ["pt"] },
  China:          { flag: "🇨🇳", langs: ["zh"] },
  Japan:          { flag: "🇯🇵", langs: ["ja"] },
  Indonesia:      { flag: "🇮🇩", langs: ["id"] },
  Thailand:       { flag: "🇹🇭", langs: ["th"] },
  Vietnam:        { flag: "🇻🇳", langs: ["vi"] },
};

const COUNTRY_LIST = Object.keys(COUNTRY_LANGUAGE_MAP);


const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const getPdfUrl = (storedPath) => {
  if (!storedPath) return "#";
  const filename = storedPath.split(/[/\\]/).pop();
  return `${baseUrl}/api/v1/media-leads/file/${encodeURIComponent(filename)}`;
};

const AdminMediaKit = () => {
  const dispatch = useDispatch();

  // Active view tab: "languages", "leads", "history"
  const [activeTab, setActiveTab] = useState("languages");

  // Selected Country for Language Matrix
  const [selectedAdminCountry, setSelectedAdminCountry] = useState("all");

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedCountryForUpload, setSelectedCountryForUpload] = useState("Global");
  const [selectedLanguageForUpload, setSelectedLanguageForUpload] = useState("en");
  const [uploadFile, setUploadFile] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // PDF Preview modal state
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const openPreviewModal = (pdfPath, title) => {
    const url = getPdfUrl(pdfPath);
    setPreviewUrl(url);
    setPreviewTitle(title || "Media Kit Preview");
  };

  const closePreviewModal = () => {
    setPreviewUrl(null);
    setPreviewTitle("");
  };

  // Redux state
  const {
    languageKits,
    totalSupported,
    totalActiveLanguages,
    downloads,
    totalDownloads,
    downloadsCurrentPage,
    downloadsTotalPages,
    selectedFilterLanguage,
    searchQuery,
    kitHistory,
    totalKits,
    historyCurrentPage,
    historyTotalPages,
    adminLoading,
    uploadLoading,
    historyLoading,
    deleteConfirmId,
    deleteKitConfirmLang,
    adminError,
  } = useSelector((state) => state.mediaKit);

  // Initial load
  useEffect(() => {
    dispatch(fetchAdminLanguageKits(selectedAdminCountry));
    dispatch(fetchDownloads({ page: 1, limit: 10, language: "all", search: "" }));
    dispatch(fetchKitHistory({ page: 1, limit: 10, language: "all" }));

    return () => {
      dispatch(resetAdminState());
    };
  }, [dispatch, selectedAdminCountry]);

  // Handle errors
  useEffect(() => {
    if (adminError) {
      toast.error(adminError);
      dispatch(resetAdminState());
    }
  }, [adminError, dispatch]);

  // Refresh current data
  const handleRefresh = () => {
    dispatch(fetchAdminLanguageKits(selectedAdminCountry));
    dispatch(
      fetchDownloads({
        page: downloadsCurrentPage,
        limit: 10,
        language: selectedFilterLanguage,
        search: searchQuery,
      })
    );
    dispatch(
      fetchKitHistory({
        page: historyCurrentPage,
        limit: 10,
        language: selectedFilterLanguage,
      })
    );
  };

  // Open upload modal for a specific language
  const openUploadModal = (langCode = "en", country = null) => {
    let targetCountry = country;
    if (!targetCountry || targetCountry === "all") {
      targetCountry = Object.keys(COUNTRY_LANGUAGE_MAP).find(
        (c) => c !== "Global" && COUNTRY_LANGUAGE_MAP[c].langs.includes(langCode)
      ) || "Global";
    }
    setSelectedCountryForUpload(targetCountry);
    setSelectedLanguageForUpload(langCode);
    setUploadFile(null);
    setUploadModalOpen(true);
  };

  // Execute Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.warning("Please select a file first");
      return;
    }
    const ext = uploadFile.name.split(".").pop().toLowerCase();
    const allowedExts = ["pdf", "doc", "docx", "ppt", "pptx"];
    if (!allowedExts.includes(ext)) {
      toast.error("Only PDF, DOC, DOCX, PPT, or PPTX files are allowed");
      return;
    }

    setUploadProgress(0);
    const langObj = SUPPORTED_LANGUAGES_INFO.find((l) => l.code === selectedLanguageForUpload);
    const result = await dispatch(
      uploadKit({
        file: uploadFile,
        country: selectedCountryForUpload || "Global",
        language: selectedLanguageForUpload,
        languageName: langObj?.name || selectedLanguageForUpload.toUpperCase(),
        onProgress: (pct) => setUploadProgress(pct),
      })
    );

    if (uploadKit.fulfilled.match(result)) {
      toast.success(
        result.payload.message ||
          `Media kit for ${selectedCountryForUpload} (${langObj?.name}) uploaded successfully!`
      );
      setUploadModalOpen(false);
      setUploadFile(null);
      setUploadProgress(0);
      dispatch(fetchAdminLanguageKits(selectedAdminCountry));
      dispatch(fetchKitHistory({ page: 1, limit: 10, language: selectedLanguageForUpload }));
    } else if (uploadKit.rejected.match(result)) {
      toast.error(result.payload || "Upload failed");
      setUploadProgress(0);
    }
  };

  // Delete language kit
  const handleDeleteLanguageKit = async (langCode) => {
    const result = await dispatch(
      deleteLanguageKit({
        language: langCode,
        country: selectedAdminCountry,
      })
    );
    if (deleteLanguageKit.fulfilled.match(result)) {
      toast.success(`Media kit for ${selectedAdminCountry} (${langCode.toUpperCase()}) removed`);
      dispatch(fetchAdminLanguageKits(selectedAdminCountry));
    } else if (deleteLanguageKit.rejected.match(result)) {
      toast.error(result.payload || "Delete failed");
    }
  };

  // Delete download lead
  const handleDeleteDownload = async (id) => {
    const result = await dispatch(deleteDownloadRecord(id));
    if (deleteDownloadRecord.fulfilled.match(result)) {
      toast.success("Download record deleted");
      dispatch(
        fetchDownloads({
          page: downloadsCurrentPage,
          limit: 10,
          language: selectedFilterLanguage,
          search: searchQuery,
        })
      );
    }
  };

  // Filter & search handlers for downloads
  const handleLanguageFilterChange = (lang) => {
    dispatch(setFilterLanguage(lang));
    dispatch(fetchDownloads({ page: 1, limit: 10, language: lang, search: searchQuery }));
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    dispatch(setSearchQuery(query));
    dispatch(fetchDownloads({ page: 1, limit: 10, language: selectedFilterLanguage, search: query }));
  };

  // Use the backend streaming API endpoint to serve PDF files
  // This avoids 404s from direct /uploads/ static paths that Nginx may not serve
  // Route: GET /api/media-leads/file/:filename  → streams the actual file
  const getPdfUrl = (storedPath) => {
    if (!storedPath) return "#";
    if (storedPath.startsWith("http")) return storedPath;
    // Extract just the filename from the stored path (e.g. "uploads/1234-file.pdf" → "1234-file.pdf")
    const filename = storedPath.replace(/\\/g, "/").split("/").pop();
    // Use the API streaming endpoint — baseUrl is e.g. "https://www.rule7media.com/api"
    return `${axiosInstance.defaults.baseURL.replace(/\/$/, "")}/media-leads/file/${encodeURIComponent(filename)}`;
  };


  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-200 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 flex-shrink-0">
            <Globe size={22} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Multilingual Media Kit Hub
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                11 Languages
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Manage database-driven localized media kits with automated IP country routing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={adminLoading}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-all"
          >
            <RefreshCw size={14} className={adminLoading ? "animate-spin text-blue-400" : ""} />
            Refresh
          </button>
          <button
            onClick={() => openUploadModal("en")}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all"
          >
            <Plus size={15} />
            Upload Kit
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Language Coverage</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {totalActiveLanguages} <span className="text-slate-500 text-base sm:text-lg font-normal">/ {totalSupported}</span>
              </h3>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Globe size={20} />
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(totalActiveLanguages / totalSupported) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Leads & Downloads</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{totalDownloads}</h3>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Download size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-400" />
            Automatic localized email delivery active
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Smart IP Routing</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">Multi-Language</h3>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            India (Hindi + EN), US (EN + ES), Canada (EN + FR)
          </p>
        </div>
      </div>

      {/* Tabs Navigation (Responsive horizontal scroll) */}
      <div className="flex border-b border-slate-800 gap-4 sm:gap-6 text-xs sm:text-sm font-semibold overflow-x-auto scrollbar-hide pb-0.5 whitespace-nowrap">
        <button
          onClick={() => setActiveTab("languages")}
          className={`pb-3 transition-all flex items-center gap-2 border-b-2 flex-shrink-0 ${
            activeTab === "languages"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Globe size={15} />
          11 Languages Matrix ({totalActiveLanguages}/{totalSupported})
        </button>
        <button
          onClick={() => setActiveTab("leads")}
          className={`pb-3 transition-all flex items-center gap-2 border-b-2 flex-shrink-0 ${
            activeTab === "leads"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users size={15} />
          Download Requests ({totalDownloads})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 transition-all flex items-center gap-2 border-b-2 flex-shrink-0 ${
            activeTab === "history"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <History size={15} />
          Kit Versions & History ({totalKits})
        </button>
      </div>

      {/* ─── TAB 1: 11 LANGUAGES MATRIX ────────────────────────────────────────── */}
      {activeTab === "languages" && (
        <div className="space-y-6">
          {/* Header filter for country */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-white">Media Kit Editions</h2>
              <p className="text-xs text-slate-400">
                Manage PDF media kits for different countries. Missing kits will use the default English kit fallback.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                Filter by Country:
              </label>
              <select
                value={selectedAdminCountry}
                onChange={(e) => setSelectedAdminCountry(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Countries</option>
                {COUNTRY_LIST.map((c) => (
                  <option key={c} value={c}>
                    {COUNTRY_LANGUAGE_MAP[c].flag} {c}
                  </option>
                ))}
              </select>
              <button
                onClick={() => openUploadModal("en")}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/25"
              >
                <Upload size={13} />
                Upload New Kit
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {SUPPORTED_LANGUAGES_INFO.map((lang) => {
              // Find matching active kit for this language from redux store (matching language matrix status)
              const serverLangData = languageKits.find((l) => l.code === lang.code);
              const activeKit = serverLangData?.activeKit;
              const hasKit = !!activeKit;

              return (
                <div
                  key={lang.code}
                  className={`rounded-3xl border transition-all duration-300 p-6 flex flex-col justify-between ${
                    hasKit
                      ? "bg-slate-900/90 border-slate-700/70 shadow-lg shadow-black/30 hover:border-blue-500/50"
                      : "bg-slate-900/40 border-dashed border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Header */}
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-1 bg-slate-800/80 rounded-xl">{lang.flag}</span>
                        <div>
                          <h3 className="font-bold text-lg text-white flex items-center gap-2">
                            {lang.name}
                            <span className="text-xs font-normal text-slate-400">({lang.nativeName})</span>
                          </h3>
                          <p className="text-xs text-slate-400">{lang.region}</p>
                        </div>
                      </div>

                      {hasKit ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <AlertCircle size={12} />
                          Missing Kit
                        </span>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="mt-5 bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/50 text-xs space-y-1.5">
                      {hasKit ? (
                        <>
                          <div className="flex items-center justify-between text-slate-350">
                            <span className="text-slate-450 font-medium">Territory:</span>
                            <span className="text-slate-200 font-semibold">{activeKit.country || "Global"}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-350">
                            <span className="text-slate-455 font-medium">File:</span>
                            <span className="text-slate-200 font-semibold truncate max-w-[180px]" title={activeKit.pdfFilename}>
                              {activeKit.pdfFilename}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-350">
                            <span className="text-slate-455 font-medium">Size:</span>
                            <span className="text-slate-200">{formatBytes(activeKit.fileSize)}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-350">
                            <span className="text-slate-455 font-medium">Updated:</span>
                            <span className="text-slate-200">{new Date(activeKit.uploadedAt || activeKit.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-slate-400 py-1 text-center italic">
                          No PDF uploaded yet. System will use English fallback.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                    {hasKit ? (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={() => openPreviewModal(activeKit.pdfPath, `${lang.name} — ${activeKit.country || "Global"} Media Kit`)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all"
                        >
                          <ExternalLink size={13} />
                          Preview PDF
                        </button>
                        <button
                          onClick={() => openUploadModal(lang.code, activeKit.country)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
                        >
                          <Upload size={13} />
                          Replace
                        </button>
                        {deleteKitConfirmLang === lang.code ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteLanguageKit(lang.code)}
                              className="px-2.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => dispatch(setDeleteKitConfirmLang(null))}
                              className="px-2 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => dispatch(setDeleteKitConfirmLang(lang.code))}
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                            title="Delete Kit"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => openUploadModal(lang.code)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all"
                      >
                        <Upload size={14} />
                        Upload {lang.name} PDF
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 2: DOWNLOAD LEADS / REQUESTS ──────────────────────────────────── */}

      {activeTab === "leads" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          {/* Filter and search bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search leads by name, email, country..."
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-semibold text-slate-400 whitespace-nowrap">Filter Language:</label>
              <select
                value={selectedFilterLanguage}
                onChange={(e) => handleLanguageFilterChange(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Languages</option>
                {SUPPORTED_LANGUAGES_INFO.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Company & Industry</th>
                  <th className="py-3.5 px-4">Country & IP</th>
                  <th className="py-3.5 px-4">Requested Kit</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {downloads && downloads.length > 0 ? (
                  downloads.map((lead) => {
                    const langInfo = SUPPORTED_LANGUAGES_INFO.find((l) => l.code === lead.language);
                    return (
                      <tr key={lead._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white text-sm">{lead.name}</p>
                          <p className="text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail size={12} className="text-blue-400" />
                            {lead.email}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          <p className="font-medium text-slate-200">{lead.company || "—"}</p>
                          <p className="text-slate-500 text-[11px]">{lead.industry || "—"}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-medium">
                            <Globe size={12} className="text-cyan-400" />
                            {lead.country || "Global"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                            <span>{langInfo?.flag || "🇺🇸"}</span>
                            <span>{lead.languageName || langInfo?.name || "English"}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(lead.downloadedAt || lead.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {deleteConfirmId === lead._id ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleDeleteDownload(lead._id)}
                                className="px-2 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => dispatch(setDeleteConfirm(null))}
                                className="px-2 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => dispatch(setDeleteConfirm(lead._id))}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Delete Lead"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500 italic">
                      No download requests recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {downloadsTotalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
              <span className="text-slate-400">
                Page {downloadsCurrentPage} of {downloadsTotalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={downloadsCurrentPage <= 1}
                  onClick={() => {
                    const prev = downloadsCurrentPage - 1;
                    dispatch(setDownloadsPage(prev));
                    dispatch(
                      fetchDownloads({
                        page: prev,
                        limit: 10,
                        language: selectedFilterLanguage,
                        search: searchQuery,
                      })
                    );
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
                >
                  Previous
                </button>
                <button
                  disabled={downloadsCurrentPage >= downloadsTotalPages}
                  onClick={() => {
                    const next = downloadsCurrentPage + 1;
                    dispatch(setDownloadsPage(next));
                    dispatch(
                      fetchDownloads({
                        page: next,
                        limit: 10,
                        language: selectedFilterLanguage,
                        search: searchQuery,
                      })
                    );
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: KIT HISTORY ────────────────────────────────────────────────── */}
      {activeTab === "history" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Media Kit Version Archive</h3>
            <span className="text-xs text-slate-400">{totalKits} Total Uploads Recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">PDF Filename</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Uploaded At</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {kitHistory && kitHistory.length > 0 ? (
                  kitHistory.map((kit) => {
                    const langInfo = SUPPORTED_LANGUAGES_INFO.find((l) => l.code === kit.language);
                    return (
                      <tr key={kit._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                          <span>{langInfo?.flag || "🇺🇸"}</span>
                          <span>{kit.languageName || langInfo?.name || kit.language}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-200">{kit.pdfFilename}</td>
                        <td className="py-3.5 px-4 text-slate-400">{formatBytes(kit.fileSize)}</td>
                        <td className="py-3.5 px-4">
                          {kit.isActive ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-500">
                              Archived
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(kit.uploadedAt || kit.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <a
                            href={getPdfUrl(kit.pdfPath)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold"
                          >
                            <ExternalLink size={12} />
                            View
                          </a>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500 italic">
                      No kit history records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── UPLOAD MODAL ──────────────────────────────────────────────────────── */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 relative text-slate-100">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Upload size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Upload Media Kit</h3>
                <p className="text-xs text-slate-400">
                  {COUNTRY_LANGUAGE_MAP[selectedCountryForUpload]?.flag || "🌐"}{" "}
                  <span className="font-semibold text-slate-300">{selectedCountryForUpload}</span>
                  {" — "}
                  {SUPPORTED_LANGUAGES_INFO.find((l) => l.code === selectedLanguageForUpload)?.name || "English"} Edition
                </p>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 mt-6">
              {/* Country badge — derived from sidebar selection, not editable in modal */}
              {/* Country Selection Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-350 mb-1.5">
                  Target Territory / Country
                </label>
                <select
                  value={selectedCountryForUpload}
                  onChange={(e) => {
                    const newCountry = e.target.value;
                    setSelectedCountryForUpload(newCountry);
                    // Automatically pre-select the first language of the new country
                    const countryLangs = COUNTRY_LANGUAGE_MAP[newCountry]?.langs || ["en"];
                    setSelectedLanguageForUpload(countryLangs[0]);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {COUNTRY_LIST.map((c) => (
                    <option key={c} value={c}>
                      {COUNTRY_LANGUAGE_MAP[c].flag} {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language selector — only shows languages valid for this country */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Language Edition
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(COUNTRY_LANGUAGE_MAP[selectedCountryForUpload]?.langs || ["en"]).map((code) => {
                    const langInfo = SUPPORTED_LANGUAGES_INFO.find((l) => l.code === code);
                    if (!langInfo) return null;
                    const isSelected = selectedLanguageForUpload === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setSelectedLanguageForUpload(code)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30"
                            : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200"
                        }`}
                      >
                        <span className="text-lg leading-none">{langInfo.flag}</span>
                        {langInfo.name}
                        <span className="text-xs opacity-70">({langInfo.nativeName})</span>
                      </button>
                    );
                  })}
                </div>
              </div>



              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Media Kit PDF File
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    ref={fileInputRef}
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="modal-pdf-upload"
                  />
                  <label htmlFor="modal-pdf-upload" className="cursor-pointer flex flex-col items-center">
                    <FileText size={32} className="text-blue-400 mb-2" />
                    {uploadFile ? (
                      <>
                        <p className="text-sm font-semibold text-emerald-400">{uploadFile.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatBytes(uploadFile.size)}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-white">Click to browse or drag file here</p>
                        <p className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX, PPT, PPTX — up to 100MB</p>
                      </>
                    )}
                  </label>
                </div>
                {/* Upload Progress */}
                {uploadLoading && uploadProgress > 0 && (
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Uploading...</span>
                      <span className="text-blue-400 font-bold">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading || !uploadFile}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-600/25 disabled:opacity-50 flex items-center gap-2"
                >
                  {uploadLoading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Save & Activate Kit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── PDF PREVIEW MODAL ────────────────────────────────────────────────────── */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col bg-black/90 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closePreviewModal(); }}
        >
          {/* Header bar */}
          <div className="relative z-10 flex items-center justify-between bg-slate-900 border-b border-slate-700 px-6 py-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-blue-400" />
              <span className="text-sm font-bold text-white truncate max-w-[500px]">{previewTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={previewUrl}
                download
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all"
              >
                <Download size={13} />
                Download
              </a>
              <button
                onClick={closePreviewModal}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                title="Close Preview"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* PDF Iframe */}
          <div className="flex-1 relative bg-slate-950">
            <iframe
              key={previewUrl}
              src={previewUrl}
              title={previewTitle}
              className="w-full h-full border-0"
              onError={() => toast.error("Could not load PDF preview. Try downloading directly.")}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMediaKit;