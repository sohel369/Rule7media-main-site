import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addFranchise,
  resetFranchise,
} from "../store/franchise/franchiseSlice";
import { toast } from "react-toastify";
import {
  Menu,
  X,
  ArrowLeft,
  ArrowRight,
  Sandwich,
  Dumbbell,
  Zap,
  Coffee,
  TrendingUp,
  Check,
  CheckCircle,
  Lightbulb,
} from "lucide-react";
import FranchiseTopBar, { FranchiseMobileControls } from "../components/FranchiseTopBar";

const SuccessStory = () => {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.franchise);
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

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenu(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
  return (
    <div className="antialiased overflow-x-hidden bg-gray-950 text-white">
      {/* Country & Language Top Bar */}
      <FranchiseTopBar />

      {/* Navigation */}
      <nav className="fixed w-full z-[100] top-14 sm:top-16 left-1/2 -translate-x-1/2 max-w-6xl mx-auto rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl backdrop-blur-md bg-black/50 border border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center font-extrabold text-xl text-white shadow-lg shadow-rose-900/20">
            R7
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-200 uppercase">
            RULE 7 MEDIA
          </span>
        </Link>

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
            className="hover:text-rose-500 transition-colors"
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
            className="text-rose-500 font-bold border-b-2 border-rose-500 pb-1"
          >
            Success Stories
          </Link>
        </div>

        <div className="hidden md:block">
          <a
            href="#enquiry-form"
            className="bg-gradient-to-br from-rose-500 to-pink-600 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-rose-500/25 transition-all"
          >
            Join the Network
          </a>
        </div>

        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="md:hidden w-11 h-11 flex items-center justify-center text-white focus:outline-none"
        >
          {!mobileMenu ? <Menu size={24} /> : <X size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="fixed inset-0 bg-black/95 z-[90] md:hidden pt-32 px-6 flex flex-col items-center gap-8 text-2xl font-bold">
          <Link
            to="/businessmodel"
            onClick={() => setMobileMenu(false)}
            className="hover:text-rose-500"
          >
            Business Model
          </Link>
          <Link
            to="/franchise"
            onClick={() => setMobileMenu(false)}
            className="hover:text-rose-500"
          >
            Franchise
          </Link>
          <Link
            to="/franchise-faq"
            onClick={() => setMobileMenu(false)}
            className="hover:text-rose-500"
          >
            FAQ
          </Link>
          <Link
            to="/countries-franchise"
            onClick={() => setMobileMenu(false)}
            className="hover:text-rose-500"
          >
            Territories
          </Link>
          <Link
            to="/firstmover"
            onClick={() => setMobileMenu(false)}
            className="hover:text-rose-500"
          >
            Success Stories
          </Link>
          <a
            href="#enquiry-form"
            onClick={() => setMobileMenu(false)}
            className="bg-gradient-to-br from-rose-500 to-pink-600 w-full py-4 rounded-2xl text-center text-white font-bold"
          >
            Join the Network
          </a>

          {/* Mobile Region/Country Control */}
          <FranchiseMobileControls />
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 via-transparent to-transparent blur-[120px]"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-500/20 bg-rose-500/5 mb-10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-rose-400 text-[10px] font-black tracking-[0.2em] uppercase">
              First-Mover Masterclass
            </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.05] tracking-tighter">
            <span className="text-white block">
              Build Generational Wealth
            </span>
            <span className="text-rose-500 italic">Early Adoption.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Unlock the blueprint used by Fred DeLuca and modern multi-unit
            titans to turn single-digit investments into{" "}
            <strong>$10M+ portfolios</strong> before the market saturates.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto mt-20 p-8 backdrop-blur-md bg-white/5 rounded-[32px] border border-white/10">
            <div>
              <div className="text-3xl font-black text-white">$2.5B+</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                Subway Peak
              </div>
            </div>
            <div className="border-l border-white/5 pl-4 md:pl-0 md:border-l md:pl-8">
              <div className="text-3xl font-black text-rose-500">22x</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                Avg. Return
              </div>
            </div>
            <div className="border-l border-white/5 pl-4 md:pl-0 md:border-l md:pl-8">
              <div className="text-3xl font-black text-white">$400k</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                Annual Unit Net
              </div>
            </div>
            <div className="border-l border-white/5 pl-4 md:pl-0 md:border-l md:pl-8">
              <div className="text-3xl font-black text-rose-500">80%</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                Lower Entry Fee
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section id="success-stories" className="py-32 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Historical Pioneers
              </h2>
              <p className="text-slate-400 text-lg">
                The giants whose first-mover advantage created dynasties.
              </p>
            </div>
            <div className="flex gap-4">
              <button className="p-3 rounded-full border border-white/10 text-white hover:bg-rose-500 transition-colors">
                <ArrowLeft size={24} />
              </button>
              <button className="p-3 rounded-full border border-white/10 text-white hover:bg-rose-500 transition-colors">
                <ArrowRight size={24} />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Subway Card */}
            <div className="group backdrop-blur-md bg-white/5 p-10 rounded-[40px] border border-white/10 hover:border-rose-500/40 transition-all duration-500">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-rose-500 font-bold tracking-widest text-[10px] uppercase">
                    Est. 1965
                  </span>
                  <h3 className="text-3xl font-black text-white mt-2">
                    Fred DeLuca
                  </h3>
                  <p className="text-slate-400 font-bold">
                    Subway Founder/First Franchisee
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                  <Sandwich size={32} />
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed mb-8">
                Started with a $1,000 loan. By moving first into the "healthy
                fast food" niche, he built a global empire of 11,000+ stores,
                proving that early control equals exponential royalties.
              </p>
              <div className="grid grid-cols-2 gap-4 py-6 border-t border-white/5">
                <div>
                  <div className="text-xs text-slate-500 uppercase font-black mb-1">
                    Financial Outcome
                  </div>
                  <div className="text-2xl font-black text-rose-500">
                    $2.5B+ Portfolio
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-black mb-1">
                    Entry Cost
                  </div>
                  <div className="text-2xl font-black text-white">
                    $20,000 (Early)
                  </div>
                </div>
              </div>
            </div>

            {/* Planet Fitness Card */}
            <div className="group backdrop-blur-md bg-white/5 p-10 rounded-[40px] border border-white/10 hover:border-rose-500/40 transition-all duration-500">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-rose-500 font-bold tracking-widest text-[10px] uppercase">
                    Est. 2003
                  </span>
                  <h3 className="text-3xl font-black text-white mt-2">
                    Dore &amp; McGuiness
                  </h3>
                  <p className="text-slate-400 font-bold">
                    Planet Fitness Franchisees
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                  <Dumbbell size={32} />
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed mb-8">
                They took the "Judgement Free" model to Florida as early
                adopters. Their 22-club portfolio scaled to 130k members,
                allowing them to exit with tens of millions during the IPO.
              </p>
              <div className="grid grid-cols-2 gap-4 py-6 border-t border-white/5">
                <div>
                  <div className="text-xs text-slate-500 uppercase font-black mb-1">
                    Financial Outcome
                  </div>
                  <div className="text-2xl font-black text-rose-500">
                    $30M+ Portfolio
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-black mb-1">
                    Annual Profit
                  </div>
                  <div className="text-2xl font-black text-white">
                    $1M+ Year
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Table */}
      <section id="financial-outcomes" className="py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">
              The Early Entrant Advantage
            </h2>
            <p className="text-slate-400">
              Comparing the cost of entry then vs. the massive equity now.
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/5 rounded-[40px] border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Franchise Brand
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-rose-500">
                      Entry (Then)
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Entry (Now)
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Avg. Portfolio Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6 font-bold text-white">
                      Jersey Mike's Subs
                    </td>
                    <td className="px-8 py-6 text-rose-400 font-bold">
                      $12,500
                    </td>
                    <td className="px-8 py-6 text-slate-400">$300,000+</td>
                    <td className="px-8 py-6 font-black text-white">
                      $40,000,000
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6 font-bold text-white">
                      Crumbl Cookies
                    </td>
                    <td className="px-8 py-6 text-rose-400 font-bold">
                      $225,000
                    </td>
                    <td className="px-8 py-6 text-slate-400">$450,000+</td>
                    <td className="px-8 py-6 font-black text-white">
                      $15,000,000
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6 font-bold text-white">
                      Orangetheory Fitness
                    </td>
                    <td className="px-8 py-6 text-rose-400 font-bold">
                      $300,000
                    </td>
                    <td className="px-8 py-6 text-slate-400">$650,000+</td>
                    <td className="px-8 py-6 font-black text-white">
                      $50,000,000
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6 font-bold text-white">
                      7 Brew Coffee
                    </td>
                    <td className="px-8 py-6 text-rose-400 font-bold">
                      $600,000
                    </td>
                    <td className="px-8 py-6 text-slate-400">$850,000+</td>
                    <td className="px-8 py-6 font-black text-white">
                      $25,000,000
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-8 bg-rose-500/5 border-t border-rose-500/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0">
                  <Lightbulb size={20} />
                </div>
                <p className="text-sm font-semibold text-slate-300">
                  <strong className="text-rose-500">Key Insight:</strong> Early
                  franchisees paid 50-80% less for territory rights that now
                  trade at 15-20x EBITDA multiples.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Success Stories */}
      <section id="modern-stories" className="py-32 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Modern Era Titans
            </h2>
            <p className="text-slate-400 text-lg font-medium italic">
              Building fortunes in the 2020s landscape.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Crumbl */}
            <div className="p-8 rounded-[32px] backdrop-blur-md bg-white/5 border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl group-hover:bg-rose-500/20 transition-all"></div>
              <div className="flex items-center gap-3 mb-6">
                <Zap className="text-rose-500 w-5 h-5" />
                <span className="text-xs font-black uppercase text-slate-500 tracking-widest">
                  Growth Phase
                </span>
              </div>
              <h4 className="text-2xl font-black text-white mb-4">
                Crumbl Evolution
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Hargis family entered when it was an Instagram novelty. They
                secured regional territory rights before the brand restricted
                expansion, creating an 8-figure exit window.
              </p>
              <div className="bg-slate-900/50 p-4 rounded-2xl flex justify-between items-center">
                <span className="text-xs text-slate-500 font-bold uppercase">
                  Store Rev.
                </span>
                <span className="text-lg font-black text-rose-500">
                  $2M/Year
                </span>
              </div>
            </div>

            {/* 7 Brew */}
            <div className="p-8 rounded-[32px] backdrop-blur-md bg-white/5 border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl group-hover:bg-rose-500/20 transition-all"></div>
              <div className="flex items-center gap-3 mb-6">
                <Coffee className="text-rose-500 w-5 h-5" />
                <span className="text-xs font-black uppercase text-slate-500 tracking-widest">
                  Emerging Tech
                </span>
              </div>
              <h4 className="text-2xl font-black text-white mb-4">
                7 Brew Momentum
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Post-2021 adopters capitalized on the drive-thru beverage boom
                early. Venture-capital style returns are being realized as
                multi-unit territories go live.
              </p>
              <div className="bg-slate-900/50 p-4 rounded-2xl flex justify-between items-center">
                <span className="text-xs text-slate-500 font-bold uppercase">
                  Proj. Portfolio
                </span>
                <span className="text-lg font-black text-rose-500">
                  $15-30M
                </span>
              </div>
            </div>

            {/* Orangetheory */}
            <div className="p-8 rounded-[32px] backdrop-blur-md bg-white/5 border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl group-hover:bg-rose-500/20 transition-all"></div>
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-rose-500 w-5 h-5" />
                <span className="text-xs font-black uppercase text-slate-500 tracking-widest">
                  Brand Equity
                </span>
              </div>
              <h4 className="text-2xl font-black text-white mb-4">
                Orangetheory Peak
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Paul Marcus secured exclusive territories early. This allowed
                for a massive buyout when Roark Capital moved to acquire the
                enterprise value he built.
              </p>
              <div className="bg-slate-900/50 p-4 rounded-2xl flex justify-between items-center">
                <span className="text-xs text-slate-500 font-bold uppercase">
                  Exited For
                </span>
                <span className="text-lg font-black text-rose-500">$50M+</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Wealth Section */}
      <section id="patterns" className="py-32 px-4 relative overflow-hidden">
        <div className="max-w-6xl mx-auto backdrop-blur-md bg-white/5 rounded-[64px] p-12 md:p-24 border border-white/10 flex flex-col md:flex-row items-center gap-20">
          <div className="w-full md:w-1/2 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
              The Wealth <br />
              <span className="text-rose-500 italic uppercase tracking-tighter">
                Curve.
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Early adopters don't just buy a business; they buy{" "}
              <strong>leverage</strong>. While later entrants fight for scraps,
              pioneers control the territory, the royalties, and the final exit
              multiples.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-white font-bold">
                <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500">
                  <Check size={16} />
                </div>
                Lower Cost of Customer Acquisition
              </li>
              <li className="flex items-center gap-3 text-white font-bold">
                <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500">
                  <Check size={16} />
                </div>
                Priority Real Estate Selection
              </li>
              <li className="flex items-center gap-3 text-white font-bold">
                <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500">
                  <Check size={16} />
                </div>
                Favored Nation Royalty Structures
              </li>
            </ul>
            <a
              href="#enquiry-form"
              className="inline-block bg-gradient-to-br from-rose-500 to-pink-600 px-10 py-5 rounded-2xl text-lg font-black text-white shadow-lg hover:shadow-rose-500/25 transition-all mt-8"
            >
              Claim Your First-Mover Guide
            </a>
          </div>

          <div className="w-full md:w-1/2 bg-slate-900/40 p-10 rounded-[40px] border border-white/5 relative">
            <div className="space-y-10">
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">
                  Early Adopter Returns
                </div>
                <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-pink-600 w-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">
                  Market Saturated Entrant
                </div>
                <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-600 w-1/4"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">
                  Traditional Stock Market
                </div>
                <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-700 w-1/6"></div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 p-6 bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl text-center shadow-2xl">
              <div className="text-3xl font-black text-white">20x</div>
              <div className="text-[8px] font-black uppercase tracking-widest text-white/70">
                Wealth Multiplier
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry Form Section */}
      <section id="enquiry-form" className="py-24 bg-[#050608]/50">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="backdrop-blur-md bg-white/5 rounded-[40px] p-10 md:p-16 border border-white/10">
            <h2 className="text-3xl font-bold text-center mb-3">
              Ready to Explore Rule 7 Media Franchising?
            </h2>
            <p className="text-slate-400 text-center mb-10">
              Fill out the form below and our team will send you more
              information.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-6 py-4 bg-slate-900 border border-white/10 rounded-2xl focus:border-rose-500 focus:outline-none text-slate-100"
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
                    onChange={handleInputChange}
                    required
                    className="w-full px-6 py-4 bg-slate-900 border border-white/10 rounded-2xl focus:border-rose-500 focus:outline-none text-slate-100"
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
                  onChange={handleInputChange}
                  required
                  className="w-full px-6 py-4 bg-slate-900 border border-white/10 rounded-2xl focus:border-rose-500 focus:outline-none text-slate-100"
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
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Australia"
                  className="w-full px-6 py-4 bg-slate-900 border border-white/10 rounded-2xl focus:border-rose-500 focus:outline-none text-slate-100"
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
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Queensland, Gold Coast"
                  className="w-full px-6 py-4 bg-slate-900 border border-white/10 rounded-2xl focus:border-rose-500 focus:outline-none text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Single or Multiple Territories?
                </label>
                <select
                  name="territories"
                  value={formData.territories}
                  onChange={handleInputChange}
                  required
                  className="w-full px-6 py-4 bg-slate-900 border border-white/10 rounded-2xl focus:border-rose-500 focus:outline-none text-slate-100"
                >
                  <option value="">Select option...</option>
                  <option value="Single">Single Territory</option>
                  <option value="Multiple">Multiple Territories</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-br from-rose-500 to-pink-600 py-5 rounded-2xl font-bold text-xl text-white shadow-lg hover:shadow-rose-500/25 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
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
          <div className="backdrop-blur-md bg-white/5 max-w-md w-full rounded-3xl p-10 text-center border border-white/10">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-500/10 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">
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

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-black">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded flex items-center justify-center font-bold text-white">
                R7
              </div>
              <span className="font-bold text-slate-200 uppercase tracking-tighter">
                RULE 7 MEDIA
              </span>
            </div>
            <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-slate-500">
              <Link to="/privacy-policy" className="hover:text-rose-500">
                Privacy Policy
              </Link>
              <Link to="/contact-us" className="hover:text-rose-500">
                Contact
              </Link>
              <Link to="/Careers" className="hover:text-rose-500">
                Careers
              </Link>
            </div>
            <p className="text-xs font-bold text-slate-600">
              © 2026 RULE 7 MEDIA. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SuccessStory;
