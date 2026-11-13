import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ShieldCheck,
  CheckCircle2,
  Zap,
  TrendingUp,
  Share2,
  Users,
  MapPin,
} from "lucide-react";
import SEO from "../components/SEO";
import { seoData } from "../seo/seoData";
import { getStatisticsByCountry } from "../store/statistic/statisticSlice";
import { fetchUserCountry } from "../store/countary/countrySlice";
import Headers from "../components/Header";
import Footer from "../components/Footer";
import axiosInstance from "../axiosInstance";
const WrapperLandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { country } = useSelector((state) => state.country);
  const { statistics, isLoading } = useSelector((state) => state.statistic);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  useEffect(() => {
    if (country) {
      dispatch(getStatisticsByCountry(country));
    }
  }, [dispatch, country]);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axiosInstance.post("/franchise/secure-spot", {
        businessName: formData.businessName,
        email: formData.email,
        country: country || "Unknown",
      });

      if (res.data?.success) {
        toast.success(
          "Thank you for your enquiry. We will advise on the availability of your chosen territory shortly.",
        );

        setFormData({ businessName: "", email: "" });
      } else {
        toast.error(res.data?.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);

      if (err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Server error");
      }
    } finally {
      setLoading(false);
    }
  };

  const allVideoSources =
    statistics
      ?.filter((stat) => stat.videoType === "wrapper")
      ?.flatMap((stat) => stat.sources || []) || [];

  return (
    <>
      <SEO {...seoData.wrapperLanding} />
      <div className="bg-black text-white selection:bg-amber-500/30 min-h-screen">
        {/* Navigation */}
        {/* <nav
        className={`fixed top-0 w-full z-50 px-6 py-4 transition-all duration-300 ${isScrolled ? "bg-black/80 backdrop-blur-lg" : ""}`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/5 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-white uppercase">
              Rule 7 Media
            </span>
          </div>
          <div className="hidden md:flex gap-8 font-semibold text-sm uppercase tracking-wider text-slate-400">
            <a
              href="#market"
              className="hover:text-amber-500 transition-colors"
            >
              Market Expansion
            </a>
            <a href="#viral" className="hover:text-amber-500 transition-colors">
              Viral Potential
            </a>
            <a
              href="#exclusivity"
              className="hover:text-amber-500 transition-colors"
            >
              Exclusivity
            </a>
          </div>
          <Link
            to="/register?role=wrapping-shop"
            className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-500 transition-all shadow-lg shadow-red-900/20 uppercase tracking-tight"
          >
            Claim Territory
          </Link>
        </div>
      </nav> */}
        <Headers />
        <main className="bg-black">
          {/* Hero Section */}
          <section className="relative pt-40 pb-20 px-6 bg-black">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-amber-500/5 blur-[120px] rounded-full -z-10"></div>
            <div className="max-w-7xl mx-auto text-center">
              <div className="z-10 max-w-4xl mx-auto">
                <span className="inline-block py-1 px-4 rounded-full bg-amber-500/10 text-amber-500 font-bold text-xs uppercase tracking-widest mb-6 border border-amber-500/20 italic">
                  Elite Network: Limited Availability
                </span>
                <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] mb-8 tracking-tighter text-white">
                  Unlock{" "}
                  <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                    Explosive Growth
                  </span>
                  : Join the Exclusive Global Vehicle Wrapping Platform
                </h1>
                <p className="text-xl text-amber-100/70 mb-10 leading-relaxed max-w-2xl mx-auto font-medium">
                  A first-of-its-kind resource connecting reputable Local
                  wrapping specialists with high-value, local, national and
                  global fleet managers and advertisers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to={"/register?role=wrapping-shop"}
                    className="flex items-center justify-center gap-2 bg-amber-500 text-black px-8 py-5 rounded-2xl font-bold text-lg hover:bg-amber-400 transition-all shadow-xl shadow-amber-900/20 group"
                  >
                    Secure Your 30-Mile (50 kms) Spot
                    <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Optimized YouTube Section */}
          <section className="py-20 px-6 bg-black border-y border-white/5">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Global <span className="text-amber-500">Video Library</span>
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Watch our latest videos and tutorials from around the world.
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                </div>
              ) : allVideoSources.length > 0 ? (
                <div className="grid lg:grid-cols-2 gap-12">
                  {allVideoSources.slice(0, 4).map((source, index) => {
                    const videoUrl = (
                      Array.isArray(source.url) ? source.url[0] : source.url
                    )?.trim();
                    const isYouTube =
                      videoUrl?.includes("youtube.com") ||
                      videoUrl?.includes("youtu.be");

                    // Extract YouTube ID
                    const getYouTubeId = (url) => {
                      const regExp =
                        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                      const match = url?.match(regExp);
                      return match && match[2].length === 11 ? match[2] : null;
                    };

                    const videoId = isYouTube ? getYouTubeId(videoUrl) : null;

                    return (
                      <div key={index}>
                        <div className="relative w-full pb-[56.25%] h-0 mb-6 shadow-2xl shadow-amber-900/10 rounded-2xl overflow-hidden bg-gray-900">
                          {isYouTube && videoId ? (
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}`}
                              title={source.description || `Video ${index + 1}`}
                              className="absolute top-0 left-0 w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          ) : source.type === "uploaded" ? (
                            <video
                              controls
                              className="absolute top-0 left-0 w-full h-full object-cover"
                            >
                              <source src={videoUrl} type="video/mp4" />
                            </video>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-gray-500">
                                Video unavailable
                              </span>
                            </div>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-amber-500 px-2 italic uppercase tracking-tight">
                          {source.description || `Video Title ${index + 1}`}
                        </h3>
                        {/* {source.language && (
                    <p className="text-sm text-gray-400 px-2 mt-1">
                      Language: {source.language}
                    </p>
                  )} */}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-400">
                    No videos available in your region yet.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Market Expansion Section */}
          <section id="market" className="py-24 px-6 bg-black">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <span className="text-amber-500 font-bold uppercase tracking-widest text-sm italic">
                    New Revenue Stream
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black mt-4 mb-8 text-white tracking-tight uppercase">
                    Access the <span className="text-amber-500">Untapped</span>{" "}
                    Ad-Hoc Market
                  </h2>
                  <p className="text-slate-400 text-lg leading-relaxed mb-8">
                    Reach an entirely new segment of businesses eager to promote
                    products but lacking their own vehicles. We bridge the gap,
                    bringing high-intent advertisers directly to your doorstep.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-white font-semibold">
                      <CheckCircle2 className="text-amber-500 w-6 h-6" /> Direct
                      Fleet Manager Pipeline
                    </li>
                    <li className="flex items-center gap-3 text-white font-semibold">
                      <CheckCircle2 className="text-amber-500 w-6 h-6" /> No
                      Vehicle? No Problem Advertising Leads
                    </li>
                    <li className="flex items-center gap-3 text-white font-semibold">
                      <CheckCircle2 className="text-amber-500 w-6 h-6" /> Rapid
                      Scalability for Local Businesses
                    </li>
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/20 text-center">
                    <div className="text-4xl font-black text-amber-500 mb-2">
                      10X
                    </div>
                    <div className="text-xs uppercase font-bold tracking-widest text-slate-500">
                      Market Reach
                    </div>
                  </div>
                  <div className="p-8 rounded-[2rem] bg-slate-900/40 border border-white/10 text-center mt-8">
                    <div className="text-4xl font-black text-white mb-2">0</div>
                    <div className="text-xs uppercase font-bold tracking-widest text-slate-500">
                      Competition In Zone
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Viral Potential Section */}
          <section id="viral" className="py-24 px-6 bg-black">
            <div className="max-w-7xl mx-auto bg-gradient-to-br from-amber-600 to-amber-800 rounded-[3.5rem] p-8 md:p-20 relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10">
                <Zap className="w-96 h-96 -mr-20 -mt-20 text-black" />
              </div>
              <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                <div>
                  <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">
                    The Gotta Scan Them All{" "}
                    <span className="text-sm align-top">™</span>
                  </h2>
                  <p className="text-amber-50 text-xl leading-relaxed mb-8">
                    Our game-changing viral initiative turns every wrapped
                    vehicle into a lead-generating powerhouse. We drive
                    word-of-mouth referrals through interactive engagement,
                    turning road-time into a viral event.
                  </p>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
                      <Share2 className="w-6 h-6" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="bg-black/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
                  <h4 className="text-white font-bold text-2xl mb-4 italic">
                    Instant Lead Generation
                  </h4>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold uppercase tracking-widest text-amber-200">
                        Viral Engagement
                      </span>
                      <span className="text-amber-100 font-black">98%</span>
                    </div>
                    <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-white w-[98%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Exclusivity Section */}
          <section id="exclusivity" className="py-24 px-6 bg-black text-center">
            <div className="max-w-4xl mx-auto">
              <MapPin className="w-16 h-16 text-red-600 mx-auto mb-8" />
              <h2 className="text-4xl md:text-6xl font-black mb-8 text-white uppercase tracking-tighter italic">
                Strict 30-Mile (50 kms){" "}
                <span className="text-amber-500">Territory Lock.</span>
              </h2>
              <p className="text-xl text-slate-400 mb-12 leading-relaxed">
                Participation is restricted to a limited number of businesses
                per radius. We guarantee minimal competition and maximum market
                share for our early adopters.
              </p>
              <div className="bg-red-600/10 border border-red-600/30 p-8 rounded-[2rem] inline-block animate-pulse">
                <Link
                  to={"/register?role=wrapping-shop"}
                  className="text-2xl font-black text-red-500 uppercase tracking-widest"
                >
                  Urgent: Secure Your Zone Now
                </Link>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section id="cta" className="py-24 px-6 bg-black">
            <div className="max-w-5xl mx-auto bg-slate-900/40 rounded-[3.5rem] p-12 md:p-24 text-center border border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-amber-500/5"></div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter">
                  Claim Your Future.
                </h2>
                <p className="text-xl text-amber-100/70 mb-12 max-w-2xl mx-auto italic">
                  Don't let your competitors own the territory. Join the elite
                  network today.
                </p>
                <form
                  onSubmit={handleSubmit}
                  className="max-w-md mx-auto space-y-4"
                >
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Business Name"
                    className="w-full px-8 py-5 rounded-2xl bg-black border border-white/10 text-white font-bold focus:ring-4 focus:ring-amber-500/50 text-lg transition-all"
                    required
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full px-8 py-5 rounded-2xl bg-black border border-white/10 text-white font-bold focus:ring-4 focus:ring-amber-500/50 text-lg transition-all"
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 text-white px-8 py-5 rounded-2xl font-black text-xl hover:bg-red-500 transition-all uppercase shadow-2xl shadow-red-900/30"
                  >
                    {loading ? "Submitting..." : "Secure Spot Now"}
                  </button>
                </form>
                <p className="mt-8 text-slate-500 text-sm font-bold uppercase tracking-widest italic">
                  Fast-track Approval for Established Providers
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        {/* <footer className="py-12 px-6 border-t border-white/10 bg-black text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight text-white uppercase">
              Rule 7 Media
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 Rule 7 Media Global Platforms. All Territory Rights Reserved.
          </p>
          <div className="flex gap-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <Link
              to="/privacy-policy"
              className="hover:text-amber-500 transition"
            >
              Privacy
            </Link>
            <Link
              to="/terms-conditions"
              className="hover:text-amber-500 transition"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer> */}
      </div>
      <Footer />
    </>
  );
};

export default WrapperLandingPage;
