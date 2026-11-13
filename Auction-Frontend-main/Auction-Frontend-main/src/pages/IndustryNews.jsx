import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { seoData } from "../seo/seoData";
import { subscribeUser, resetSubscription } from "../store/subscription/subscriptionSlice";
import { fetchBlogsByCountry } from "../store/blog/blogSlice";
import { useDispatch, useSelector } from "react-redux";
import FranchiseForm from "../components/FranchiseForm";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

// ── SEO constants ────────────────────────────────────────────────────────────
const PAGE_TITLE = "Industry Insights & Franchise News | Rule 7 Media";
const PAGE_DESCRIPTION =
  "Expert perspectives on OOH advertising, franchise ownership, and the collaborative economy. Stay ahead with Rule 7 Media's knowledge hub.";
const PAGE_URL = "https://www.rule7media.com/industry-news";

// ── Blog Card ────────────────────────────────────────────────────────────────
function BlogCard({ post }) {
  return (
    <article className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[24px] sm:rounded-[32px] overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 hover:border-rose-500/30 hover:bg-slate-800/60">
      <div className="aspect-video w-full overflow-hidden relative">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-rose-600 text-white text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">
          {post.category}
        </div>
      </div>
      <div className="p-5 sm:p-7 flex flex-col flex-grow">
        <time className="text-xs font-bold text-slate-500 mb-2 tracking-wide">
          {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }).toUpperCase()}
        </time>
        <h3 className="text-lg sm:text-xl font-bold text-slate-200 mb-3 leading-tight hover:text-rose-400 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
          {post.description}
        </p>
        <div className="mt-auto">
          <Link
            to={`/blog/${post._id}`}
            className="inline-flex items-center gap-2 text-rose-500 font-bold hover:gap-3 transition-all duration-300 group text-sm sm:text-base"
          >
            Read Full Article
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function IndustryNews() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const { loading, success, error } = useSelector((state) => state.subscription);
  const { blogs, totalBlogs, isLoading } = useSelector((state) => state.blog);
  const { country } = useSelector((state) => state.country);

  const totalPages = Math.ceil(totalBlogs / postsPerPage);

  countries.registerLocale(enLocale);
  const countryCode = countries.getAlpha2Code(country, "en");

  const scrollToForm = () => {
    document.getElementById("enquiry-form")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    if (country) {
      dispatch(fetchBlogsByCountry({ country: country.toLowerCase(), page: currentPage, limit: postsPerPage }));
    }
  }, [dispatch, country, currentPage]);

  const handleSubscribe = () => {
    if (!email) { toast.error("Please enter email"); return; }
    if (!countryCode) { toast.error("Country missing"); return; }
    dispatch(subscribeUser({ email, countryCode }));
  };

  useEffect(() => {
    if (success) { toast.success("Subscribed successfully!"); setEmail(""); dispatch(resetSubscription()); }
    if (error) { toast.error(error || "Something went wrong"); dispatch(resetSubscription()); }
  }, [success, error, dispatch]);

  return (
    <>
      {/* ── SEO HEAD TAGS ─────────────────────────────────────────────────── */}
      <SEO {...seoData.blog} />

      <Header />

      <div className="min-h-screen bg-[#02040a] font-['Plus_Jakarta_Sans',sans-serif] scroll-smooth">

        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <header className="relative pt-16 sm:pt-24 pb-12 sm:pb-20 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-rose-900/40 via-transparent to-transparent blur-[120px] rounded-full"></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 text-[9px] sm:text-[10px] font-black tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-6 sm:mb-8">
              The Franchise Knowledge Hub
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 sm:mb-6 leading-tight tracking-tighter">
              {/* FIX: Removed shimmer from heading — uses solid gradient instead */}
              <span className="block text-slate-200">
                Industry Insights &amp;
              </span>
              <span className="italic bg-gradient-to-r from-rose-700 via-rose-500 to-rose-700 bg-clip-text text-transparent">
                Strategic Growth.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-xl sm:max-w-2xl mx-auto leading-relaxed px-2">
              Expert perspectives on the intersection of OOH advertising, franchise ownership, and the collaborative economy.
            </p>
          </div>
        </header>

        {/* ── Blog Grid ───────────────────────────────────────────────────── */}
        <section className="py-12 sm:py-20 bg-[#050608]">
          <div className="container mx-auto px-4 sm:px-6">
            {isLoading ? (
              <div className="text-center text-white py-20">Loading blogs...</div>
            ) : blogs?.length === 0 ? (
              <div className="text-center text-slate-400 py-20">No blogs found for your region. Check back soon!</div>
            ) : (
              <>
                {/* FIX: Mobile = 1 col, tablet = 2 col, desktop = 3 col */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                  {blogs.map((post) => <BlogCard key={post._id} post={post} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 sm:mt-20 flex justify-center items-center gap-3 sm:gap-4">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className={`w-11 h-11 sm:w-12 sm:h-12 bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-full flex items-center justify-center transition-colors ${currentPage === 1 ? "text-slate-600 cursor-not-allowed opacity-50" : "text-slate-400 hover:text-rose-500"}`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="px-5 py-2 bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-full text-sm font-bold text-rose-500">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`w-11 h-11 sm:w-12 sm:h-12 bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-full flex items-center justify-center transition-colors ${currentPage === totalPages ? "text-slate-600 cursor-not-allowed opacity-50" : "text-slate-400 hover:text-rose-500"}`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* ── Newsletter CTA ──────────────────────────────────────────────── */}
        <section className="py-16 sm:py-32 bg-black border-t border-white/5">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 p-8 sm:p-12 md:p-20 rounded-[32px] sm:rounded-[48px] text-center relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-rose-600 to-rose-950 opacity-10 blur-3xl"></div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-200 mb-4 sm:mb-6">
                Stay Ahead of the Curve
              </h2>
              <p className="text-slate-400 text-base sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto">
                Get exclusive franchise opportunities and marketing strategies delivered to your inbox weekly.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow px-5 py-3.5 sm:py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-rose-500 transition-colors text-sm sm:text-base"
                />
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-br from-rose-600 to-rose-950 rounded-2xl font-bold text-white text-sm sm:text-base whitespace-nowrap flex-shrink-0"
                >
                  {loading ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ── Enquiry Form ────────────────────────────────────────────────── */}
        <section id="enquiry-form" className="py-16 sm:py-24 bg-[#050608]/50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <FranchiseForm />
          </div>
        </section>

        {/* ── Footer CTA ──────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-32 relative text-center">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto bg-slate-900/40 backdrop-blur-sm border border-white/5 p-8 sm:p-12 md:p-24 rounded-[40px] sm:rounded-[64px]">
              <p className="text-slate-400 mb-6 sm:mb-8 font-medium italic text-sm sm:text-base">
                "At Rule 7 Media, we believe franchising should feel supportive, not sales-driven. Every article above was written with your peace of mind in mind—rooted in honesty and our commitment to your success."
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black mb-8 sm:mb-10 leading-tight tracking-tighter text-slate-200">
                Ready to explore whether this could be your path to{" "}
                <span className="italic bg-gradient-to-r from-rose-700 via-rose-500 to-rose-700 bg-clip-text text-transparent">
                  $150,000 annual rewards?
                </span>
              </h2>
              <button
                onClick={scrollToForm}
                className="inline-block bg-gradient-to-br from-rose-600 to-rose-950 px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-white hover:shadow-[0_0_40px_rgba(225,29,72,0.25)] transition-all text-base sm:text-lg"
              >
                Schedule Discovery Call
              </button>
            </div>
          </div>
        </section>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .animate-in { animation: fadeIn 0.3s ease-in; }
          .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
          @media (max-width: 400px) { .xs\\:block { display: block; } }
        `}</style>
      </div>
      <Footer />
    </>
  );
}