import React, { useState, useEffect } from "react";
import {
  Layers,
  Menu,
  X,
  TrendingUp,
  Download,
  Users,
  RefreshCw,
  MapPin,
  Zap,
  User,
  Youtube,
  Instagram,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { downloadKit, fetchAvailableKits } from "../store/mediakit/mediaKitSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SEO from "../components/SEO";
import { seoData } from "../seo/seoData";
import {
  SUPPORTED_LANGUAGES,
  COUNTRY_LANGUAGE_MAP,
} from "../components/MediaKitDownloadModal";
import { fetchUserCountry } from "../store/countary/countrySlice";
import baseUrl from "../config.js";
import axiosInstance from "../axiosInstance";

const AncillaryAdvertisersLandingPage = () => {
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const countryFromStore = useSelector((state) => state.country?.country);
  const { loading: downloadLoading, activeLanguages = [] } = useSelector((state) => state.mediaKit || {});

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    industry: "",
    language: "en",
  });

  const [suggestedLangs, setSuggestedLangs] = useState(["en"]);

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

  useEffect(() => {
    if (!countryFromStore) {
      dispatch(fetchUserCountry());
    }
  }, [countryFromStore, dispatch]);

  useEffect(() => {
    if (countryFromStore) {
      const mapped =
        COUNTRY_LANGUAGE_MAP[countryFromStore] ||
        COUNTRY_LANGUAGE_MAP[countryFromStore.toUpperCase()] || ["en"];
      setSuggestedLangs(mapped);
      setForm((prev) => ({
        ...prev,
        language: mapped[0] || "en",
      }));
      dispatch(fetchAvailableKits(countryFromStore));
    }
  }, [countryFromStore, dispatch]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/how-it-works", label: "How it Works" },
    { path: "#", label: "Exclusivity" },
    { path: "/franchise", label: "Market Expansion" },
    {
      path: "https://digital-ocean-production-01ee.up.railway.app/login",
      label: "Advertise with Us",
      isActive: true,
      isBold: true,
      isBlue: true,
    },
    {
      path: "https://scanthemall.com",
      label: "Viral Engine",
      isBold: true,
      isBlue: true,
      external: true,
    },
  ];

  const industrySectors = [
    "Tyres and wheels",
    "Vehicle servicing and maintenance",
    "Panel beating and smash repairs",
    "Automotive finance solutions",
    "Vehicle insurance products",
    "Auto parts, tools, and accessories",
    "Fleet management tools",
    "Workshop technology and equipment",
    "Telematics systems and vehicle tracking solutions",
    "Fuel cards and fuel management services",
    "Vehicle cleaning and detailing services",
    "Logistics and scheduling software",
    "Safety and compliance solutions",
    "Driver training and induction programs",
    "Roadside assistance programs",
    "GPS navigation and route optimisation tools",
    "EV charging infrastructure and electric vehicle solutions",
    "Mobile device integration and communications equipment",
    "Asset recovery and anti-theft technologies",
  ];

  const footerLinks = {
    platform: [
      { path: "/statistics", label: "Explainers" },
      { path: "/affiliate", label: "Affiliate Program" },
      { path: "/blog", label: "Industry News" },
    ],
    partners: [
      {
        path: "https://digital-ocean-production-01ee.up.railway.app/login",
        label: "Advertise with Us",
        isBold: true,
        isBlue: true,
      },
      { path: "/about-us", label: "Meet the Team" },
      { path: "/about-us#global-offices", label: "Global Offices" },
    ],
    support: [
      { path: "/contact-us", label: "Help Centre" },
      { path: "/terms-conditions", label: "Terms of Service" },
      { path: "/privacy-policy", label: "Privacy Policy" },
      { path: "/contact-us", label: "Contact Us" },
    ],
  };

  const socialLinks = [
    { href: "https://x.com/Rule7Media", icon: X, label: "X (Twitter)" },
    {
      href: "https://www.youtube.com/@Rule7Media",
      icon: Youtube,
      label: "YouTube",
    },
    {
      href: "https://www.instagram.com/rule.7media",
      icon: Instagram,
      label: "Instagram",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Downloading Media Kit...");
    try {
      const selectedLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === form.language);
      const payload = {
        ...form,
        country: countryFromStore || "Global",
      };

      const result = await dispatch(downloadKit(payload)).unwrap();
      const targetFilename = result?.filename || `Rule7_MediaKit_${form.language || "en"}.pdf`;
      const getMediaKitUrl = (downloadPath) => {
        if (!downloadPath) return null;
        if (/^https?:\/\//i.test(downloadPath)) return downloadPath;
        const apiBase = axiosInstance.defaults.baseURL.replace(/\/$/, "");
        const routePath = downloadPath.replace(/^\/api\/v1/, "");
        return `${apiBase}${routePath.startsWith("/") ? routePath : `/${routePath}`}`;
      };

      // Fetch and download real PDF blob directly via axiosInstance
      try {
        const fileUrl = result?.downloadUrl
          ? getMediaKitUrl(result.downloadUrl)
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
        // Fallback to static URL
        if (result?.downloadUrl) {
          const link = document.createElement("a");
          link.href = getMediaKitUrl(result.downloadUrl);
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
        autoClose: 5000,
      });

      setForm({ name: "", email: "", company: "", industry: "", language: form.language });
      toast.info(`📥 Download started! A copy has also been sent to ${payload.email}.`);
    } catch (error) {
      toast.update(toastId, {
        render: typeof error === "string" ? error : "❌ Failed. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };
  const renderNavLink = (link, index, isMobile = false) => {
    const baseClass = isMobile
      ? `text-lg ${link.isActive || link.isBlue ? "font-bold text-blue-400" : "font-medium text-slate-300"}`
      : `text-sm font-medium transition-colors ${
          link.isActive
            ? "text-blue-400 border-b-2 border-blue-400 pb-1 font-bold"
            : link.isBlue
              ? "text-blue-400 font-bold hover:text-blue-300"
              : "text-slate-400 hover:text-white"
        }`;

    // 🔥 External link (same logic desktop + mobile dono me kaam karega)
    if (link.path.startsWith("http")) {
      return (
        <a
          key={index}
          href={link.path}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClass}
        >
          {link.label}
        </a>
      );
    }

    // ✅ Internal link
    return (
      <Link key={index} to={link.path} className={baseClass}>
        {link.label}
      </Link>
    );
  };

  // Render footer link
  const renderFooterLink = (link, index) => {
    if (link.path.startsWith("http")) {
      return (
        <li key={index}>
          <a
            href={link.path}
            target="_blank"
            rel="noopener noreferrer"
            className={`hover:text-blue-400 transition-colors ${
              link.isBlue ? "font-bold text-blue-400" : ""
            }`}
          >
            {link.label}
          </a>
        </li>
      );
    }

    return (
      <li key={index}>
        <Link
          to={link.path}
          className={`hover:text-blue-400 transition-colors ${
            link.isBlue ? "font-bold text-blue-400" : ""
          }`}
        >
          {link.label}
        </Link>
      </li>
    );
  };

  return (
    <>
      <SEO {...seoData.ancillary} />
      <div className="bg-[#0f172a] text-slate-200 antialiased min-h-screen">
        {/* Navigation */}
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md">
          <div className="container mx-auto flex h-20 items-center justify-between px-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                <Layers size={24} />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Rule 7 <span className="text-blue-500">Media</span>
              </span>
            </Link>

            <nav className="hidden space-x-6 lg:flex items-center">
              {navLinks.map((link, index) => renderNavLink(link, index))}
            </nav>

            <div className="flex items-center gap-4">
              <a
                href="https://digital-ocean-production-01ee.up.railway.app/login"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden text-sm font-semibold text-slate-300 sm:block hover:text-white"
              >
                Sign In
              </a>

              {/* <Link
               href="https://digital-ocean-production-01ee.up.railway.app/login"
                //to="/register?role=seller"
                className="hidden lg:block rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 text-center"
              >
                Create an Account
              </Link> */}
<a
  href="https://digital-ocean-production-01ee.up.railway.app/login"
  target="_blank"
  rel="noopener noreferrer"
  className="hidden lg:block rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-500"
>
  Create an Account
</a>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-slate-300 hover:text-white p-2"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden absolute top-20 left-0 w-full bg-[#0f172a] border-b border-white/10 px-6 py-8 space-y-6 shadow-2xl">
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link, index) =>
                  renderNavLink(link, index, true),
                )}
              </nav>
              <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
                <a
                  href="https://digital-ocean-production-01ee.up.railway.app/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-full bg-blue-600 py-4 text-center font-bold text-white"
                >
                 Create an Account
                </a>
               <a
  href="https://digital-ocean-production-01ee.up.railway.app/login"
  target="_blank"
  rel="noopener noreferrer"
  className="w-full text-center font-semibold text-slate-300"
  onClick={() => setMobileMenuOpen(false)}
>
  Sign In
</a>
              </div>
            </div>
          )}
        </header>

        <main>
          {/* Hero Section */}
          <section className="relative overflow-hidden py-24 lg:py-32">
            <div className="absolute -top-24 -left-24 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.15)_0%,transparent_70%)] rounded-full blur-[60px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.15)_0%,transparent_70%)] rounded-full blur-[60px] pointer-events-none"></div>

            <div className="container mx-auto px-6 text-center">
              <div className="inline-flex items-center rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-400 border border-blue-500/20 mb-8">
                <TrendingUp className="mr-2 h-4 w-4" />
                Targeting Over 500k Monthly Active Industry Professionals
              </div>
              <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-white lg:text-7xl">
                <span className="bg-gradient-to-r from-transparent via-white/80 to-transparent bg-[length:1000px_100%] animate-[shimmer_6s_infinite_linear] bg-clip-text text-transparent">
                  Drive Your Brand
                </span>{" "}
                into the{" "}
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  Fast Lane
                </span>
                .
              </h1>
              <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-400">
                Connect with a high-intent audience of mechanics, fleet
                managers, and dealership principals. From local workshops to
                global enterprises, Rule 7 Media puts your solutions in front of
                the decision makers.
              </p>
              <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="#contact"
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-blue-500 hover:shadow-xl active:scale-95"
                >
                  Download Media Kit <Download className="h-5 w-5" />
                </a>
                <Link
                  to="/pricing-info"
                  className="rounded-full border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white/10"
                >
                  View CPM Rates
                </Link>
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="container mx-auto px-6 pb-24">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center hover:bg-white/10 hover:border-blue-500/20 hover:-translate-y-1 transition-all">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400">
                  <Users size={24} />
                </div>
                <div className="text-4xl font-extrabold text-white">92%</div>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Decision Makers
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center hover:bg-white/10 hover:border-blue-500/20 hover:-translate-y-1 transition-all">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <RefreshCw size={24} />
                </div>
                <div className="text-4xl font-extrabold text-white">7.4x</div>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Avg. Monthly Visits
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center hover:bg-white/10 hover:border-blue-500/20 hover:-translate-y-1 transition-all">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400">
                  <MapPin size={24} />
                </div>
                <div className="text-4xl font-extrabold text-white">
                  50Kms(30mi)
                </div>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Hyper-Local Targeting
                </p>
              </div>
            </div>
          </section>

          {/* Who Should Advertise? (The List) */}
          <section className="bg-[#0b1221] py-24 border-y border-white/5">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  Targeted Industry Sectors
                </h2>
                <p className="mt-4 text-slate-400">
                  If your business provides these solutions, Rule 7 Media is
                  your marketplace.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-4">
                {industrySectors.map((sector, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                  >
                    <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                    <span className="text-slate-300 font-medium">{sector}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Principle / Contact */}
          <section className="py-24 bg-[#0f172a]" id="contact">
            <div className="container mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-4xl font-extrabold text-white tracking-tight">
                    The Rule of 7 Principle.
                  </h2>
                  <p className="mt-6 text-lg text-slate-400">
                    Industry research shows a professional needs to see your
                    brand seven times before they take action. Rule 7 Media
                    provides those touchpoints across our ecosystem. With the
                    added benefit of multiple exposures direct to consumers in
                    our Gotta Scan Them All™ Sweepstakes
                  </p>

                  <div className="mt-12 space-y-8">
                    <blockquote className="border-l-4 border-blue-600 pl-6 py-2">
                      <p className="text-xl italic font-medium text-slate-300">
                        "Rule 7 Media is transforming how automotive suppliers
                        reach fleet managers. The precision targeting is unlike
                        anything else in the automotive space."
                      </p>
                      <footer className="mt-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <div className="font-bold text-white">John Paton</div>
                          <div className="text-sm text-slate-500">
                            Director, SignBiz Australia
                          </div>
                        </div>
                      </footer>
                    </blockquote>
                  </div>
                </div>
                <div id="contact" className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-8 sm:p-12 text-white overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-8 opacity-15">
                    <Zap className="w-32 h-32" />
                  </div>
                
                  <h3 className="text-3xl font-bold mb-2">Request Media Kit</h3>
                  <p className="text-blue-100 mb-4 text-sm">
                    Receive localized advertising rates, vehicle wrap inventory, and ROI analytics for your region.
                  </p>

                  {/* 🌍 Large, clear and beautiful country/language indicator */}
                  <div className="bg-black/35 border border-white/10 rounded-2xl p-4 mb-6 space-y-2 text-left">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-blue-200">
                      Media Kit to Download:
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {SUPPORTED_LANGUAGES.find((l) => l.code === form.language)?.flag || "🌐"}
                      </span>
                      <div>
                        <div className="text-sm font-extrabold text-white flex items-center gap-2">
                          <span>{countryFromStore || "Global"} Edition</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-350 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Language: <span className="text-white font-semibold">{SUPPORTED_LANGUAGES.find((l) => l.code === form.language)?.name || "English"}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Language Edition Selector ONLY when multiple active kits exist for this country */}
                    {uploadedSuggestedLangs && uploadedSuggestedLangs.length > 1 && (
                      <div className="text-left">
                        <label className="block text-xs font-semibold text-blue-100 mb-1.5 ml-1">
                          Select Language Edition:
                        </label>
                        <div className="flex gap-2">
                          {uploadedSuggestedLangs.map((langObj) => {
                            const isSelected = form.language === langObj.code;
                            return (
                              <button
                                key={langObj.code}
                                type="button"
                                onClick={() => setForm({ ...form, language: langObj.code })}
                                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                  isSelected
                                    ? "bg-white text-blue-900 border-white shadow-md"
                                    : "bg-blue-900/40 text-blue-200 border-blue-400/30 hover:bg-blue-900/70"
                                }`}
                              >
                                <span>{langObj.flag}</span>
                                <span>{langObj.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      required
                      onChange={handleChange}
                      placeholder="Full Name"
                      className="w-full bg-blue-700/50 border border-blue-400/30 rounded-xl px-5 py-3 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white text-sm"
                    />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="Business Email"
                      className="w-full bg-blue-700/50 border border-blue-400/30 rounded-xl px-5 py-3 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white text-sm"
                    />
                    <input
                      type="text"
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="Company Name (Optional)"
                      className="w-full bg-blue-700/50 border border-blue-400/30 rounded-xl px-5 py-3 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white text-sm"
                    />
                    <select
                      name="industry"
                      required
                      value={form.industry}
                      onChange={handleChange}
                      className="w-full bg-blue-700/50 border border-blue-400/30 rounded-xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white text-sm"
                    >
                      <option value="" className="text-slate-900">Select Your Industry</option>
                      {industrySectors.map((sector, index) => (
                        <option key={index} value={sector} className="text-slate-900">
                          {sector}
                        </option>
                      ))}
                      <option className="text-slate-900">Finance & Insurance</option>
                      <option className="text-slate-900">Fleet Management</option>
                      <option className="text-slate-900">Technology Solutions</option>
                    </select>
                    <button
                      type="submit"
                      disabled={downloadLoading}
                      className="w-full bg-white text-blue-600 font-extrabold py-4 rounded-xl shadow-lg hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-60 text-sm flex items-center justify-center gap-2"
                    >
                      <Download size={18} />
                      {downloadLoading
                        ? "Processing Media Kit..."
                        : `Download ${countryFromStore || "Global"} Media Kit (${SUPPORTED_LANGUAGES.find((l) => l.code === form.language)?.name || "English"} PDF)`}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-[#0b1221] py-12">
          <div className="container mx-auto px-6">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Link to="/" className="flex items-center gap-2 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Layers size={20} />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-white">
                    Rule 7 <span className="text-blue-500">Media</span>
                  </span>
                </Link>
                <p className="text-sm text-slate-500">
                  The premier automotive professional and supplier network.
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-4 text-white">Platform</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  {footerLinks.platform.map((link, index) =>
                    renderFooterLink(link, index),
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4 text-white">Partners</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  {footerLinks.partners.map((link, index) =>
                    renderFooterLink(link, index),
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4 text-white">Support</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  {footerLinks.support.map((link, index) =>
                    renderFooterLink(link, index),
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-12 border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-slate-500">
                © 2026 Rule 7 Media. All Rights Reserved.
              </p>
              <div className="flex gap-6 text-slate-500">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-400 transition-colors"
                      aria-label={social.label}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </footer>

        <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
      `}</style>
      </div>
    </>
  );
};

export default AncillaryAdvertisersLandingPage;
