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
  Megaphone,
  Car,
  Paintbrush,
  Trophy,
  Ticket,
  DollarSign,
} from "lucide-react";

import FranchiseForm from "../components/FranchiseForm";
import FranchiseTopBar, { FranchiseMobileControls } from "../components/FranchiseTopBar";

const BusinessModel = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();
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

  const handleChange = (e) => {
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
      //toast.success("Form submitted successfully!");
    }
    if (error) {
      toast.error(error);
      dispatch(resetFranchise());
    }
  }, [success, error, dispatch]);
  const scrollToForm = () => {
    document
      .getElementById("enquiry-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="min-h-screen bg-[#02040a] text-white overflow-x-hidden">
      {/* Country & Language Top Bar */}
      <FranchiseTopBar />

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
            className="text-rose-500 font-bold border-b-2 border-rose-500 pb-1"
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
              className="py-3 px-4 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 font-bold transition-all text-base"
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
              className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-rose-400 transition-all border border-white/5 text-base font-semibold"
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
      {/* Hero Section - EXACT SAME AS CARD 8 */}
      <header className="pt-32 pb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-900/30 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <span className="inline-block px-5 py-2 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-black tracking-widest mb-6">
            7 POWERFUL REVENUE STREAMS
          </span>

          <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.2] mb-4">
            Never Rely On
            <br />
            <span
              className="relative inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #cbd5e1 0%, #cbd5e1 45%, #ffffff 50%, #cbd5e1 55%, #cbd5e1 100%)",
                backgroundSize: "200% 100%",
                animation: "shineText 6s ease-in-out infinite",
              }}
            >
              A Single Revenue Stream
            </span>
            <br />
            <span
              className="relative inline-block bg-clip-text text-transparent italic"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #f43f5e 0%, #f43f5e 45%, #ffffff 50%, #f43f5e 55%, #f43f5e 100%)",
                backgroundSize: "200% 100%",
                animation: "shineText 6s ease-in-out infinite",
              }}
            >
              Ever Again
            </span>
            <style>
              {`
                @keyframes shineText {
                  0% { background-position: -200% 0; }
                  100% { background-position: 200% 0; }
                }
              `}
            </style>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-slate-400">
            Rule 7 Media franchisees earn from 7 different, recurring revenue
            streams simultaneously — giving you true financial resilience no
            matter what the economy does.
          </p>

          <a
            href="#enquiry-form"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("enquiry-form")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className="mt-10 inline-flex items-center gap-3 bg-gradient-to-r from-rose-500 to-pink-600 px-10 py-4 rounded-2xl font-bold text-white shadow-lg hover:shadow-rose-500/25 transition-all text-lg"
          >
            See How It Works <span className="text-xl">↓</span>
          </a>
        </div>
      </header>

      {/* 7 Revenue Cards - EXACT SAME AS CARD 8 */}
      <section className="py-24 bg-[#02040a]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 1. Advertiser Platform Subscriptions */}
            <div className="backdrop-blur-md bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-1 hover:border-rose-500 transition-all duration-300 hover:-translate-y-2 hover:scale-105">
              <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 text-rose-500">
                <Megaphone size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3">
                1. Advertiser Platform Subscriptions
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Brands pay monthly to advertise on vehicles in your territory.
                Steady recurring revenue from targeted mobile exposure.
              </p>
            </div>

            {/* 2. Vehicle Owner Subscriptions */}
            <div className="backdrop-blur-md bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-1 hover:border-rose-500 transition-all duration-300 hover:-translate-y-2 hover:scale-105">
              <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 text-rose-500">
                <Car size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3">
                2. Vehicle Owner Subscriptions
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Vehicle owners pay to list their cars and earn up to
                $100,000/year. You earn on every successful listing.
              </p>
            </div>

            {/* 3. Vehicle Wrapping Business Subscriptions */}
            <div className="backdrop-blur-md bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-1 hover:border-rose-500 transition-all duration-300 hover:-translate-y-2 hover:scale-105">
              <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 text-rose-500">
                <Paintbrush size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3">
                3. Vehicle Wrapping Business Subscriptions
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Wrapping companies subscribe to bid on jobs. Recurring fees as
                they compete for vehicle owners.
              </p>
            </div>

            {/* 4. Final Value Fees on Auctions */}
            <div className="backdrop-blur-md bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-1 hover:border-rose-500 transition-all duration-300 hover:-translate-y-2 hover:scale-105">
              <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 text-rose-500">
                <Trophy size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3">
                4. Final Value Fees on Auctions
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Small fees on every completed auction. Scales automatically with
                platform activity.
              </p>
            </div>

            {/* 5. Automotive Advertiser Fees */}
            <div className="backdrop-blur-md bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-1 hover:border-rose-500 transition-all duration-300 hover:-translate-y-2 hover:scale-105">
              <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 text-rose-500">
                <Car size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3">
                5. Automotive Advertiser Fees
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Up to 41 automotive brands pay to reach highly engaged bidders
                on the reverse auction site.
              </p>
            </div>

            {/* 6. Sweepstakes Site Advertising Fees */}
            <div className="backdrop-blur-md bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-1 hover:border-rose-500 transition-all duration-300 hover:-translate-y-2 hover:scale-105">
              <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 text-rose-500">
                <Ticket size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3">
                6. Sweepstakes Site Advertising Fees
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Up to 25 non-automotive brands pay flat rates on the
                high-traffic sweepstakes platform.
              </p>
            </div>

            {/* 7. Franchisee Profit Share from Sweepstakes */}
            <div className="backdrop-blur-md bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-1 hover:border-rose-500 transition-all duration-300 hover:-translate-y-2 hover:scale-105 lg:col-span-3 lg:max-w-md lg:mx-auto">
              <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 text-rose-500">
                <DollarSign size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3">
                7. Franchisee Profit Share from Sweepstakes
              </h3>
              <p className="text-slate-400 leading-relaxed text-center">
                Earn ~$5,000 profit share per completed sweepstake — a powerful
                performance bonus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry Form - EXACT SAME AS CARD 8 */}
      <section id="enquiry-form" className="py-24 bg-[#050608]/50">
        <div className="max-w-2xl mx-auto px-6">
          <FranchiseForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5 bg-black">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
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
              <Link to="/franchise" className="hover:text-rose-500">
                Franchise
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

export default BusinessModel;
