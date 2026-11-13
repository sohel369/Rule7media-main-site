import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addFranchise,
  resetFranchise,
} from "../store/franchise/franchiseSlice";
import { toast } from "react-toastify";
import {
  Menu,
  X,
  CheckCircle,
  Home,
  ArrowRight,
  Download,
  MapPin,
  FileText,
  Heart,
  Play,
  BrainCircuit,
  UserCheck,
  AlertTriangle,
  ShieldCheck,
  Medal,
  HelpCircle,
  GraduationCap,
  Layers,
  Sparkles,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { getStatisticsByCountry } from "../store/statistic/statisticSlice";
import { fetchUserCountry } from "../store/countary/countrySlice";
import FranchiseTopBar, { FranchiseMobileControls } from "../components/FranchiseTopBar";
const FranchiseFaq = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();
  const { loading, success, error } = useSelector((state) => state.franchise);
  const { statistics, isLoading } = useSelector((state) => state.statistic);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    state: "",
    territories: "",
    formType: "franchisefaq",
  });
const faqVideos =
    statistics
      ?.filter((item) => item.videoType === "franchiseFaq")
      ?.flatMap((item) => item.sources || []) || [];
  const isYouTubeUrl = (url) => {
    return url && (url.includes("youtube.com") || url.includes("youtu.be"));
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    const { country } = useSelector((state) => state.country);
    useEffect(() => {
      dispatch(fetchUserCountry());
    }, [dispatch]);
  useEffect(() => {
    if (country) {
      dispatch(getStatisticsByCountry(country));
    }
  }, [dispatch, country]);
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addFranchise(formData));
  };

  useEffect(() => {
    if (success) {
      setShowThankYou(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        country: "",
        state: "",
        territories: "",
        formType: "franchisefaq",
      });
      dispatch(resetFranchise());
      toast.success("Form submitted successfully!");
    }
    if (error) {
      toast.error(error);
      dispatch(resetFranchise());
    }
  }, [success, error, dispatch]);
  const extractVideoId = (url) => {
    if (!url) return null;

    const cleanUrl = url.trim();

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;

    const match = cleanUrl.match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
  };
  const scrollToForm = () => {
    document
      .getElementById("franchiseform")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const cards = [
    {
      icon: BrainCircuit,
      title: "The Psychology Behind Franchise Exploration",
      description:
        "Many capable professionals feel the weight of starting alone—the fear of the unknown mixed with the desire for real autonomy. Discover what truly drives smart people toward franchising.",
    },
    {
      icon: UserCheck,
      title: "Core Franchisee Selection Criteria",
      description:
        "We look beyond capital to find partners with the right blend of commitment, capability, and values. See the balanced criteria we use to ensure every franchisee has a solid foundation.",
    },
    {
      icon: AlertTriangle,
      title: "The Most Common Reasons Why Franchisees Fail",
      description:
        "Transparency matters. Here are the real, industry-wide reasons franchisees struggle—and how awareness helps you avoid these pitfalls from the very start.",
    },
    {
      icon: ShieldCheck,
      title: "How We Address These Risks Together",
      description:
        "We don't just list the risks; we actively design our model to protect your cash flow and provide personal guidance. Learn how our approach turns pitfalls into shared strengths.",
    },
    {
      icon: Medal,
      title: "Common Traits Among Successful Franchisees",
      description:
        "The qualities that separate thriving partners from the rest are practical and developable. Explore the specific traits we see in every high-performing Rule 7 partner.",
    },
    {
      icon: HelpCircle,
      title: "Discussing Common Rejection Reasons",
      description:
        "We reject candidates not to discourage, but to protect everyone involved. Understand our thoughtful criteria so you can approach the process with confidence.",
    },
    {
      icon: GraduationCap,
      title: "Why Franchisee Training Matters So Much",
      description:
        "Strong training is the bridge between hope and results. See how our comprehensive program shortens the learning curve and builds operational confidence.",
    },
    {
      icon: Layers,
      title: "Most Common Training Challenges Faced",
      description:
        "Training can feel overwhelming. We openly share the frequent hurdles and how our personal, extended support helps you move through them successfully.",
    },
    {
      icon: Sparkles,
      title: "How a Rule 7 Media Franchise Differs",
      description:
        "Lower introductory royalties, weekly founder involvement, and a nimble structure. Discover the advantages of partnering with an emerging leader.",
    },
  ];

  return (
    <div className="bg-[#02040a] text-slate-200 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Country & Language Top Bar */}
      <FranchiseTopBar />

      {/* Navigation */}
      <nav className="fixed w-[94%] sm:w-full z-[100] backdrop-blur-md bg-black/60 border border-white/10 top-14 sm:top-16 left-1/2 -translate-x-1/2 max-w-6xl mx-auto rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-600 to-rose-900 rounded-lg flex items-center justify-center font-extrabold text-xl text-white shadow-lg shadow-rose-900/20">
              R7
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-200 uppercase">
              RULE 7 MEDIA
            </span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide text-slate-400">
          <Link
            to="/businessmodel"
            className="hover:text-rose-500 transition-colors"
          >
            Business Model
          </Link>
          <Link
            to="/franchise"
            className="hover:text-rose-500 transition-colors"
          >
            Franchise
          </Link>
          <Link
            to="/franchise-faq"
            className="text-rose-500 font-bold border-b-2 border-rose-500 pb-1"
          >
            FAQ
          </Link>
          <Link
            to="/countries-franchise"
            className="hover:text-rose-500 transition-colors"
          >
            Territories
          </Link>
          <Link
            to="/firstmover"
            className="hover:text-rose-500 transition-colors"
          >
            Success Stories
          </Link>
        </div>
        <div className="hidden md:block">
          <button
            onClick={scrollToForm}
            className="bg-gradient-to-br from-rose-600 to-rose-900 px-6 py-2.5 rounded-xl text-sm font-bold text-white hover:shadow-[0_0_40px_rgba(225,29,72,0.25)] transition-all"
          >
            Join the Network
          </button>
        </div>
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="md:hidden w-11 h-11 flex items-center justify-center text-white focus:outline-none bg-white/5 rounded-xl border border-white/10"
        >
          {!mobileMenu ? <Menu size={22} /> : <X size={22} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[99] md:hidden pt-28 px-6 flex flex-col items-center justify-start overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenu(false);
          }}
        >
          <div className="w-full max-w-sm flex flex-col gap-3 text-center">
            <Link
              to="/businessmodel"
              onClick={() => setMobileMenu(false)}
              className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-rose-400 transition-all border border-white/5 text-base font-semibold"
            >
              Business Model
            </Link>
            <Link
              to="/franchise"
              onClick={() => setMobileMenu(false)}
              className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-rose-400 transition-all border border-white/5 text-base font-semibold"
            >
              Franchise
            </Link>
            <Link
              to="/franchise-faq"
              onClick={() => setMobileMenu(false)}
              className="py-3 px-4 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 font-bold transition-all text-base"
            >
              FAQ
            </Link>
            <Link
              to="/countries-franchise"
              onClick={() => setMobileMenu(false)}
              className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-rose-400 transition-all border border-white/5 text-base font-semibold"
            >
              Territories
            </Link>
            <Link
              to="/firstmover"
              onClick={() => setMobileMenu(false)}
              className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-rose-400 transition-all border border-white/5 text-base font-semibold"
            >
              Success Stories
            </Link>
            <button
              onClick={() => {
                setMobileMenu(false);
                scrollToForm();
              }}
              className="bg-gradient-to-br from-rose-600 to-rose-900 w-full py-3.5 rounded-xl text-center text-white font-bold shadow-lg shadow-rose-900/30 mt-2 text-base"
            >
              Join the Network
            </button>

            {/* Mobile Region/Country Control */}
            <FranchiseMobileControls />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <header className="relative pt-44 pb-24 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-950"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 text-[10px] font-black tracking-[0.2em] uppercase mb-8">
            Empowering Entrepreneurship
          </span>
          <h1 className="text-4xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tighter">
            <span className="bg-gradient-to-r from-slate-500 via-slate-100 to-slate-500 bg-clip-text text-transparent block">
              Discover a Proven Path to
            </span>
            <span className="bg-gradient-to-r from-rose-700 via-rose-400 to-rose-700 bg-clip-text text-transparent">
              $150,000 Annual Rewards
            </span>
          </h1>
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <span className="px-4 py-2 backdrop-blur-md bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-rose-500" /> No Startup Costs
            </span>
            <span className="px-4 py-2 backdrop-blur-md bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-300 flex items-center gap-2">
              <Home className="w-4 h-4 text-rose-500" /> Work-from-Home Freedom
            </span>
          </div>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
            We understand the courage it takes to explore ownership. At Rule 7
            Media, you gain a complete support system, proven processes, and the
            flexibility to build sustainable income—without the heavy financial
            risk of traditional startups.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={scrollToForm}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-br from-rose-600 to-rose-900 rounded-2xl font-bold text-white hover:shadow-[0_0_40px_rgba(225,29,72,0.25)] transition-all flex items-center justify-center gap-2"
            >
              Apply Now – No Obligation <ArrowRight className="w-5 h-5" />
            </button>
            <button className="w-full md:w-auto px-8 py-4 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl font-bold text-slate-300 hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              Work from Home <Download className="w-5 h-5" />
            </button>
            <Link
              to={"/countries-franchise"}
              className="w-full md:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-slate-300 hover:bg-white/10 transition-all"
            >
              Limited Territories
            </Link>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 text-[10px] font-black uppercase tracking-widest text-slate-500 border-t border-white/5 pt-8">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Limited Territories
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Transparent Disclosure
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" /> Personal Support
            </div>
          </div>
        </div>
      </header>

      {/* Video Panel */}
      {/* YouTube Video Section */}
   <section className="relative -mt-12 mb-24 max-w-5xl mx-auto px-6">
  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[40px] p-4 shadow-2xl overflow-hidden">
    {isLoading ? (
      <div className="text-center text-white py-12">Loading videos...</div>
    ) : faqVideos.length > 0 ? (
      <>
        {/* Conditional Heading - Only show if more than 1 video */}
        {faqVideos.length === 1 ? (
          <div className="text-center py-6">
            <h3 className="text-xl font-bold text-slate-200">
              Watch: A Personal Message from the Founder
            </h3>
          </div>
        ) : (
          <div className="text-center py-6">
            <h3 className="text-xl font-bold text-slate-200">
              Watch: Videos from the Founder
            </h3>
            <p className="text-slate-400 text-sm mt-2">
              {faqVideos.length} videos available
            </p>
          </div>
        )}

        {/* Grid layout - 1 video = single column, 2+ videos = grid with 2 per row */}
        <div className={`${faqVideos.length === 1 ? "" : "grid grid-cols-1 md:grid-cols-2 gap-6"}`}>
          {faqVideos.slice(0, faqVideos.length === 1 ? 1 : undefined).map((video, index) => {
            const videoUrl = Array.isArray(video.url)
              ? video.url[0]?.trim()
              : video.url?.trim();

            const isYoutube = isYouTubeUrl(videoUrl);
            const videoId = isYoutube ? extractVideoId(videoUrl) : null;

            return (
              <div
                key={index}
                className={`overflow-hidden rounded-2xl bg-slate-900/50 ${
                  faqVideos.length === 1 ? "max-w-3xl mx-auto" : ""
                }`}
              >
                <div className="aspect-video bg-slate-900 relative overflow-hidden rounded-t-2xl">
                  {/* YouTube Video */}
                  {isYoutube && videoId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={video.description || `Video ${index + 1}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    /* Uploaded Video */
                    <video controls className="w-full h-full object-cover">
                      <source src={videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>

                <div className="p-5 bg-slate-900/50 rounded-b-2xl">
                  <h4 className="text-white font-bold text-lg">
                    {video.description || `Video ${index + 1}`}
                  </h4>
                  {faqVideos.length > 1 && (
                    <p className="text-slate-400 text-sm mt-2">
                      {video.language ? `Language: ${video.language}` : "Click to watch"}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Show message if more than 2 videos exist */}
        {faqVideos.length > 2 && (
          <div className="text-center mt-8 pt-4 border-t border-white/10">
            <p className="text-slate-400 text-sm">
              + {faqVideos.length - 2} more video{faqVideos.length - 2 !== 1 ? "s" : ""} available
            </p>
          </div>
        )}
      </>
    ) : (
      <div className="text-center text-slate-400 py-12">
        No videos available
      </div>
    )}
  </div>
</section>

      {/* Article Grid */}
      <section className="py-24 bg-[#050608]/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card, idx) => (
              <article
                key={idx}
                className="backdrop-blur-md bg-white/5 border border-white/10 p-8 rounded-[32px] transition-all duration-300 hover:-translate-y-2 hover:bg-rose-500/5 hover:border-rose-500/30 flex flex-col"
              >
                <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 mb-6">
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-200 mb-4 leading-snug">
                  {card.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-grow">
                  {card.description}
                </p>
                <Link
                  to={`/franchise-card/${idx + 1}`}
                  className="text-rose-500 font-bold text-sm flex items-center gap-2 group"
                >
                  Read Full Article
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry Form Section */}
      <section id="enquiry-form" className="py-24 bg-[#050608]/50">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[40px] p-10 md:p-16">
            <h2 className="text-3xl font-bold text-center mb-3">
              Ready to Explore Rule 7 Media Franchising?
            </h2>
            <p className="text-slate-400 text-center mb-10">
              Fill out the form below and our team will send you more
              information.
            </p>

            <form
              id="franchiseform"
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-rose-500 focus:outline-none text-slate-100 placeholder:text-slate-500"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-rose-500 focus:outline-none text-slate-100 placeholder:text-slate-500"
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-rose-500 focus:outline-none text-slate-100 placeholder:text-slate-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Country of Residence
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Australia"
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-rose-500 focus:outline-none text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  State or Area of Interest
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Queensland, Gold Coast"
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-rose-500 focus:outline-none text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Single or Multiple Territories?
                </label>
                <select
                  name="territories"
                  value={formData.territories}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-rose-500 focus:outline-none text-slate-100"
                >
                  <option value="" className="text-black">Select option...</option>
                  <option value="Single" className="text-black">Single Territory</option>
                  <option value="Multiple" className="text-black">Multiple Territories</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-br from-rose-600 to-rose-900 py-5 rounded-2xl font-bold text-xl text-white hover:shadow-[0_0_40px_rgba(225,29,72,0.25)] transition-all flex items-center justify-center gap-3"
              >
                {loading ? "Sending..." : "Send me More Information"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Thank You Modal */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 max-w-md w-full rounded-3xl p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-500/10 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4">
              Thank You for Your Enquiry
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Due to the high volume of enquiries please allow us up to 48 hours
              to respond. If you have not received a response in 48 hours please
              check your Spam or Junk Mail, or in the event of input error
              please email{" "}
              <a
                href="mailto:Franchiseallocations@rule7media.com"
                className="text-rose-400 underline"
              >
                Franchiseallocations@rule7media.com
              </a>
              .
            </p>
            <button
              onClick={() => setShowThankYou(false)}
              className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <section className="py-32 relative text-center">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto backdrop-blur-md bg-white/5 border border-white/10 p-12 md:p-24 rounded-[64px] shadow-3xl">
            <p className="text-slate-400 mb-8 font-medium italic">
              "At Rule 7 Media, we believe franchising should feel supportive,
              not sales-driven. Every article above was written with your peace
              of mind in mind—rooted in honesty and our commitment to your
              success."
            </p>
            <h2 className="text-3xl md:text-5xl font-black mb-10 leading-tight tracking-tighter text-slate-200">
              Ready to explore whether this could be your path to{" "}
              <span className="bg-gradient-to-r from-rose-700 via-rose-400 to-rose-700 bg-clip-text text-transparent italic">
                $150,000 annual rewards?
              </span>
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto px-10 py-5 bg-gradient-to-br from-rose-600 to-rose-900 rounded-2xl font-bold text-xl text-white hover:shadow-[0_0_40px_rgba(225,29,72,0.25)] shadow-2xl flex items-center gap-3">
                <Calendar className="w-6 h-6" /> Schedule Discovery Call
              </button>
              <button className="w-full sm:w-auto px-10 py-5 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl font-bold text-xl text-slate-300 hover:text-white transition-all">
                View Full Disclosure
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-black">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-600 to-rose-900 rounded flex items-center justify-center font-bold text-white shadow-lg">
                R7
              </div>
              <span className="font-bold text-slate-200 uppercase tracking-tighter">
                RULE 7 MEDIA
              </span>
            </div>
            <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-slate-500">
              <Link
                to="/privacy-policy"
                className="hover:text-rose-500 transition-colors"
              >
                Candidate Privacy
              </Link>
              <Link
                to="/terms-conditions"
                className="hover:text-rose-500 transition-colors"
              >
                System Terms
              </Link>
              <Link
                to="/contact-us"
                className="hover:text-rose-500 transition-colors"
              >
                Support Portal
              </Link>
            </div>
            <p className="text-xs font-bold text-slate-600">
              © 2026 RULE 7 MEDIA FRANCHISING. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FranchiseFaq;
