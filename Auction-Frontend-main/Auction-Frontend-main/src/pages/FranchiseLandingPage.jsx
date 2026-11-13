import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  ArrowRight,
  ArrowRightCircle,
  Gift,
  ShieldCheck,
  Layers,
  Network,
  Ticket,
  GraduationCap,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  addFranchise,
  resetFranchise,
} from "../store/franchise/franchiseSlice";
import { toast } from "react-toastify";
import FranchiseTopBar, { FranchiseMobileControls } from "../components/FranchiseTopBar";
const FranchiseLandingPage = () => {
  const dispatch = useDispatch();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    territory: "",
    background: "",
    formType: "franchise_kit",
  });
  const formRef = useRef(null);
  const {
    loading: franchiseLoading,
    error: franchiseError,
    success,
  } = useSelector((state) => state.franchise);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenu(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setMobileMenu(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(addFranchise(formData));
  };

  // Reset form on successful submission
  useEffect(() => {
    if (success) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        territory: "",
        background: "",
        formType: "enquiry",
      });
      toast.success(
        "Thank you! Your inquiry for a no-startup-cost home franchise has been received. We will contact you shortly with the prospectus.",
      );
      dispatch(resetFranchise());
    }
  }, [success, dispatch]);

  // Optional: show error message
  useEffect(() => {
    if (franchiseError) {
      toast(
        `Submission failed: ${franchiseError}. Please email Franchiseenquiries@rule7media.com directly.`,
      );
      dispatch(resetFranchise());
    }
  }, [franchiseError, dispatch]);

  return (
    <div className="bg-gray-950 text-white overflow-x-hidden">
      {/* Country & Language Top Bar */}
      <FranchiseTopBar />

      {/* Navigation */}
      <nav className="fixed w-full z-50 top-14 sm:top-16 left-1/2 -translate-x-1/2 max-w-6xl mx-auto rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl backdrop-blur-md bg-black/50 border border-white/10">
        <div className="flex items-center gap-2">
          <Link to={"/"} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center font-extrabold text-xl text-white shadow-lg shadow-rose-900/20">
              R7
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-200 uppercase">
              RULE 7 MEDIA
            </span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide text-slate-400">
          <Link
            to={"/businessmodel"}
            className="hover:text-rose-500 transition-colors"
          >
            Business Model
          </Link>
          <Link
            to={"/franchise"}
            className="text-rose-500 font-bold border-b-2 border-rose-500 pb-1"
          >
            Franchise
          </Link>
          <Link
            to={"/franchise-faq"}
            className="hover:text-rose-500 transition-colors"
          >
            FAQ
          </Link>
          <Link
            to={"/countries-franchise"}
            className="hover:text-rose-500 transition-colors"
          >
            Territories
          </Link>
          <Link
            to={"/firstmover"}
            className="hover:text-rose-500 transition-colors"
          >
            {" "}
            Success Stories
          </Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <button
            onClick={scrollToForm}
            className="bg-gradient-to-br from-rose-500 to-pink-600 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-rose-500/25 transition-all"
          >
            Request Prospectus
          </button>
        </div>

        {/* Hamburger Button */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="md:hidden w-11 h-11 flex items-center justify-center text-white focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {!mobileMenu ? (
              <>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </>
            ) : (
              <>
                <path d="M6 18L18 6M6 6h12v12" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div
          className="fixed inset-0 bg-black/95 z-[60] md:hidden pt-28 px-6 overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && setMobileMenu(false)}
        >
          <div className="flex flex-col items-center gap-8 text-2xl font-semibold text-center">
            <Link
              to={"/businessmodel"}
              onClick={() => setMobileMenu(false)}
              className="hover:text-rose-500 transition-colors"
            >
              Business Model
            </Link>
            <Link
              to={"/franchise"}
              onClick={() => setMobileMenu(false)}
              className="text-rose-500 font-bold"
            >
              Franchise
            </Link>
            <Link
              to={"/franchise-faq"}
              onClick={() => setMobileMenu(false)}
              className="hover:text-rose-500 transition-colors"
            >
              FAQ
            </Link>
            <Link
              to={"/countries-franchise"}
              onClick={() => setMobileMenu(false)}
              className="hover:text-rose-500 transition-colors"
            >
              Territories
            </Link>
            <Link
              to={"/firstmover"}
              onClick={() => setMobileMenu(false)}
              className="hover:text-rose-500 transition-colors"
            >
              Success Stories
            </Link>
            <button
              onClick={scrollToForm}
              className="mt-4 bg-gradient-to-br from-rose-500 to-pink-600 py-3.5 px-10 rounded-2xl text-lg font-bold text-white shadow-lg w-full max-w-sm"
            >
              Request Prospectus
            </button>

            {/* Mobile Country & Region Control */}
            <FranchiseMobileControls />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <header className="relative pt-44 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-rose-900/40 via-transparent to-transparent blur-[120px] rounded-full" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <span className="inline-block px-4 py-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 text-[10px] font-black tracking-[0.2em] uppercase mb-8">
              Partnership Opportunity
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tighter">
              <span className="block bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Resilient Growth in
              </span>
              <span className="italic bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
                Every Economic Cycle.
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed font-medium">
              The world doesn't stop for a downturn – and neither should your
              ambitions. Join a franchise built for all seasons and maximize
              your earning potential, with 7 Different Revenue Channels.
            </p>
            <div className="flex gap-4">
              <button
                onClick={scrollToForm}
                className="px-8 py-4 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl font-bold text-white shadow-lg hover:shadow-rose-500/25 transition-all flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Multi-Income Streams */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-rose-500/10 blur-3xl rounded-full" />
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000"
                alt="Data visualization"
                className="relative rounded-[40px] border border-white/10 shadow-2xl"
              />
            </div>
            <div>
              <h2 className="text-4xl font-extrabold mb-6 tracking-tight text-slate-200">
                Multiple Income Streams
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Our unique model allows franchisees to generate revenue from a
                variety of channels – including buyers, sellers, and a robust
                network of suppliers in a niche market.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <ArrowRightCircle className="w-6 h-6 text-rose-500 shrink-0" />
                  <p className="text-slate-300">
                    <strong>Buyers &amp; Sellers:</strong> Capture both sides of
                    the marketplace transaction.
                  </p>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <ArrowRightCircle className="w-6 h-6 text-rose-500 shrink-0" />
                  <p className="text-slate-300">
                    <strong>Supplier Network:</strong> Monetize connections with
                    transport and logistics providers.
                  </p>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <ArrowRightCircle className="w-6 h-6 text-rose-500 shrink-0" />
                  <p className="text-slate-300">
                    <strong>Efficiency Solutions:</strong> Earn by helping
                    partners cut costs and boost performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Consumers & Resilience */}
      <section className="py-24 bg-[#050608] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
              Built for the{" "}
              <span className="bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
                Modern Market.
              </span>
            </h2>
            <p className="text-slate-400 text-lg">
              In an era where 'free money' has ended, value-driven solutions and
              engagement-led models are the new gold standard.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="backdrop-blur-md bg-white/5 p-10 rounded-[40px] border border-white/10 transition-all duration-300 hover:bg-white/10">
              <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-8 border border-rose-500/20">
                <Gift className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-100">
                Engage Modern Consumers
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Today's consumers are more value-conscious. Our franchise taps
                into the trend of supplemental income and luxury sweepstakes,
                keeping your audience engaged while supporting your business
                growth.
              </p>
            </div>
            <div className="backdrop-blur-md bg-white/5 p-10 rounded-[40px] border border-white/10 transition-all duration-300 hover:bg-white/10">
              <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-8 border border-rose-500/20">
                <ShieldCheck className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-100">
                Market Cycle Resilience
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Economic downturns reward those prepared to reposition. Rule 7
                is built to empower you to capture revenue streams as needs
                evolve, serving both suppliers and consumers when they need
                value most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Grid */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-extrabold mb-4 tracking-tight">
                Why Choose Our{" "}
                <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Franchise?
                </span>
              </h2>
              <p className="text-slate-400 font-medium">
                A turn-key system designed for ambitious entrepreneurs.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 transition-colors group">
              <div className="text-rose-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Layers className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-slate-200">
                Multi-channel Revenue
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Earn through a diversified mix of buyers, sellers, and strategic
                supplier partnerships.
              </p>
            </div>
            <div className="p-8 rounded-3xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 transition-colors group">
              <div className="text-rose-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Network className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-slate-200">
                Ancillary Supplier Network
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Connect with and monetize a broad range of related niche
                businesses and transport firms.
              </p>
            </div>
            <div className="p-8 rounded-3xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 transition-colors group">
              <div className="text-rose-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Ticket className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-slate-200">
                Consumer Sweepstakes
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                High-engagement prize draws to attract and retain a loyal,
                value-conscious customer base.
              </p>
            </div>
            <div className="p-8 rounded-3xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 transition-colors group">
              <div className="text-rose-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-slate-200">
                Proven Support
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Access to world-class ongoing training, operational systems, and
                a professional community.
              </p>
            </div>
            <div className="p-8 rounded-3xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 transition-colors group">
              <div className="text-rose-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-slate-200">
                Exclusive Territory
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Build your business in your own protected area with significant
                room for regional growth.
              </p>
            </div>
            <button
              onClick={scrollToForm}
              className="p-8 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 flex flex-col justify-center items-center text-center group cursor-pointer shadow-xl shadow-rose-900/20 hover:scale-[1.02] transition-all"
            >
              <h4 className="text-2xl font-black text-white mb-2">
                Ready to Start?
              </h4>
              <p className="text-rose-100 text-sm mb-6">
                Inquire about availability in your area.
              </p>
              <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Contact / Enquiry Form */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          {/* Reduced padding on mobile: p-6 instead of p-12 */}
          <div className="backdrop-blur-md bg-white/5 rounded-[64px] p-6 md:p-12 lg:p-24 relative overflow-hidden border border-white/10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight text-slate-200">
                  Take Charge of <br />
                  <span className="bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent italic">
                    Your Future.
                  </span>
                </h2>
                <p className="text-xl text-slate-400 mb-8 font-medium">
                  Contact us today to learn more about available territories and
                  the next steps to becoming a Rule 7 Media partner.
                </p>
                <div className="flex items-center gap-4 text-slate-300 font-bold break-words">
                  <div className="w-10 h-10 backdrop-blur-md bg-white/10 rounded-full flex items-center justify-center text-rose-500 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="break-all">
                    Franchiseenquiries@rule7media.com
                  </span>
                </div>
              </div>

              {/* Form card - centered on mobile with full width */}
              <div className="bg-black/40 p-6 sm:p-8 rounded-3xl border border-white/5 w-full mx-auto">
                <form
                  onSubmit={handleSubmit}
                  ref={formRef}
                  id="franchiseform"
                  className="space-y-4"
                >
                  {/* Responsive grid: 1 column on mobile, 2 columns on small screens and up */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-rose-500/50 transition-all"
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-rose-500/50 transition-all"
                    />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-rose-500/50 transition-all"
                  />
                  <input
                    type="text"
                    name="territory"
                    placeholder="Desired Territory"
                    required
                    value={formData.territory}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-rose-500/50 transition-all"
                  />
                  <textarea
                    name="background"
                    placeholder="Tell us about your background..."
                    rows="4"
                    required
                    value={formData.background}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-rose-500/50 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={franchiseLoading}
                    className="w-full py-4 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl font-bold text-white shadow-lg hover:shadow-rose-500/25 transition-all disabled:opacity-70"
                  >
                    {franchiseLoading ? "Sending..." : "Send Inquiry"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <Link to={"/privacy-policy"} className="hover:text-rose-500">
                Privacy Policy
              </Link>
              <Link to={"/contact-us"} className="hover:text-rose-500">
                Contact
              </Link>
              <Link to={"/Careers"} className="hover:text-rose-500">
                Careers
              </Link>
            </div>
            <p className="text-xs font-bold text-slate-600">
              © 2026 RULE 7 MEDIA GROUP. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FranchiseLandingPage;

// import React, { useState, useRef ,useEffect} from 'react';
// import {Link} from 'react-router-dom'
// import { useDispatch, useSelector } from 'react-redux';
// import { Menu, X, ArrowRight } from 'lucide-react';
// import { addFranchise, resetFranchise } from '../store/franchise/franchiseSlice';
// import { toast } from "react-toastify";
// const FranchiseLandingPage = () => {
//    const dispatch = useDispatch();
//   const { loading: franchiseLoading, error: franchiseError, success } = useSelector((state) => state.franchise);
//   const [mobileMenu, setMobileMenu] = useState(false);

//   const franchiseSectionRef = useRef(null);
// const [enquiryForm, setEnquiryForm] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     territory: "",
//       background: "",
//     formType: "franchise_kit",
//   });

//   const scrollToForm = () => {
//     franchiseSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     setMobileMenu(false);
//   };

// const handleChange = (e) => {
//     const { name, value } = e.target;
//     setEnquiryForm((prev) => ({ ...prev, [name]: value }));
//   };

// const handleSubmit = (e) => {
//   e.preventDefault();

//   dispatch(addFranchise(enquiryForm)); // direct form bhej
// };

//   // Reset form on successful submission
//   useEffect(() => {
//     if (success) {
//       setEnquiryForm({
//         firstName: "",
//         lastName: "",
//         email: "",
//         territory: "",
//          background: "",
//         formType: "enquiry",
//       });
//      toast.success('Thank you! Your inquiry for a no-startup-cost home franchise has been received. We will contact you shortly with the prospectus.');
//       dispatch(resetFranchise());
//     }
//   }, [success, dispatch]);

//   // Optional: show error message
//   useEffect(() => {
//     if (franchiseError) {
//       toast(`Submission failed: ${franchiseError}. Please email Franchiseenquiries@rule7media.com directly.`);
//       dispatch(resetFranchise());
//     }
//   }, [franchiseError, dispatch]);

//   return (
//     <div className="bg-black text-white min-h-screen font-sans antialiased">
//       {/* Custom CSS for special effects */}
//       <style jsx>{`
//         .glass {
//           background: rgba(255, 255, 255, 0.05);
//           backdrop-filter: blur(12px);
//           border: 1px solid rgba(255, 255, 255, 0.1);
//         }
//         .accent-gradient {
//           background: linear-gradient(135deg, #e11d48, #be123c);
//         }
//         .ruby-shine {
//           background: linear-gradient(135deg, #fb7185, #e11d48);
//           -webkit-background-clip: text;
//           background-clip: text;
//           color: transparent;
//           text-shadow: 0 0 8px rgba(244, 63, 94, 0.3);
//         }
//         .floodlight-text {
//           background: linear-gradient(135deg, #ffffff, #f43f5e);
//           -webkit-background-clip: text;
//           background-clip: text;
//           color: transparent;
//           text-shadow: 0 0 15px rgba(244, 63, 94, 0.5);
//         }
//         .glow-hover:hover {
//           box-shadow: 0 0 20px rgba(225, 29, 72, 0.5);
//           transform: scale(1.02);
//           transition: all 0.2s ease;
//         }
//         @keyframes subtle-pulse {
//           0% { opacity: 0.8; }
//           100% { opacity: 1; }
//         }
//       `}</style>

//       {/* Navigation */}
//       <nav className="fixed w-full z-50 glass top-4 left-1/2 -translate-x-1/2 max-w-6xl mx-auto rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl">
//         <div className="flex items-center gap-2">
//           <Link to={"/"} className="flex items-center gap-2">
//             <div className="w-10 h-10 accent-gradient rounded-lg flex items-center justify-center font-extrabold text-xl text-white shadow-lg shadow-rose-900/20">R7</div>
//             <span className="font-bold text-xl tracking-tight text-slate-200 uppercase">RULE 7 MEDIA</span>
//           </Link>
//         </div>

//         <div className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide text-slate-400">
//           <Link to={"/businessmodel"} className="hover:text-rose-500 transition-colors">Business Model</Link>
//           <Link to={"franchise"} className="text-rose-500 font-bold border-b-2 border-rose-500 pb-1">Franchise</Link>
//           <Link to={"/franchise-faq"} className="hover:text-rose-500 transition-colors">FAQ</Link>
//           <Link to={"/countries-franchise"} className="hover:text-rose-500 transition-colors">Territories</Link>
//         </div>

//         <div className="hidden md:block">
//           <button onClick={scrollToForm} className="accent-gradient px-6 py-2.5 rounded-xl text-sm font-bold text-white glow-hover transition-all">
//             Request Prospectus
//           </button>
//         </div>

//         <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden w-11 h-11 flex items-center justify-center text-white">
//           {mobileMenu ? <X size={28} /> : <Menu size={28} />}
//         </button>
//       </nav>

//       {/* Mobile Menu */}
//       {mobileMenu && (
//         <div className="fixed inset-0 bg-black/95 z-[60] md:hidden pt-28 px-6" onClick={(e) => e.target === e.currentTarget && setMobileMenu(false)}>
//           <div className="flex flex-col items-center gap-10 text-2xl font-semibold text-center">
//             <Link to={"/businessmodel"} onClick={() => setMobileMenu(false)}>Business Model</Link>
//             <Link to={"/franchise"} onClick={() => setMobileMenu(false)} className="text-rose-500">Franchise</Link>
//             <Link to={"/franchise-faq"} onClick={() => setMobileMenu(false)}>FAQ</Link>
//             <Link to={"/countries-franchise"} onClick={() => setMobileMenu(false)}>Territories</Link>
//             <button onClick={scrollToForm} className="mt-8 accent-gradient py-5 px-12 rounded-2xl text-xl font-bold text-white glow-hover">
//               Request Prospectus
//             </button>
//           </div>
//         </div>
//       )}

//       {/* HERO SECTION */}
//       <header className="relative pt-44 pb-24 overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-b from-rose-900/30 via-transparent to-transparent"></div>
//         <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl">
//           <span className="inline-block px-5 py-2 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-black tracking-[0.125em] uppercase mb-6">
//             ZERO &amp; LOW COST FRANCHISE OPPORTUNITIES 2026
//           </span>
//           <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tighter mb-8">
//             Home Based Franchises with <span className="ruby-shine">No Startup Costs</span><br />
//             <span className="floodlight-text">Zero Franchise Fees</span>
//           </h1>
//           <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12">
//             Start a legitimate work from home franchise with no money down, no initial investment, and no setup fees.
//             Perfect for beginners, moms, and anyone wanting flexible passive income in 2026.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <button onClick={scrollToForm} className="px-10 py-5 accent-gradient rounded-2xl font-bold text-lg text-white glow-hover inline-flex items-center gap-3">
//               Get Started with Zero Investment
//               <ArrowRight size={24} strokeWidth={3} />
//             </button>
//           </div>
//           <p className="text-xs text-slate-500 mt-6">✓ No Upfront Costs • ✓ Work From Home • ✓ 7 Revenue Channels</p>
//         </div>
//       </header>

//       {/* LONG-TAIL KEYWORD RICH CONTENT */}
//       <section className="py-20 bg-[#050608]">
//         <div className="container mx-auto px-6">
//           <div className="max-w-4xl mx-auto text-center mb-16">
//             <h2 className="text-4xl font-extrabold mb-4">Real Answers to Your Questions About No-Cost Home Based Franchises</h2>
//             <p className="text-slate-400">Here are the most searched questions people are asking in 2026 about starting a franchise from home with zero or minimal investment.</p>
//           </div>

//           <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
//             <div className="glass p-8 rounded-3xl">
//               <h3 className="text-rose-400 font-semibold mb-3">What are the best home based franchises with no startup costs in 2026?</h3>
//               <p className="text-slate-300">Rule 7 Media offers a truly low-barrier franchise model with multiple revenue streams and no heavy upfront franchise fees. Run everything from home with flexible hours.</p>
//             </div>
//             <div className="glass p-8 rounded-3xl">
//               <h3 className="text-rose-400 font-semibold mb-3">Can I start a franchise from home with no money down?</h3>
//               <p className="text-slate-300">Yes. Many aspiring entrepreneurs are successfully launching home-based operations with zero initial investment using our proven 7-channel revenue system.</p>
//             </div>
//             <div className="glass p-8 rounded-3xl">
//               <h3 className="text-rose-400 font-semibold mb-3">Are there legitimate franchises with no franchise fee that I can run from home?</h3>
//               <p className="text-slate-300">Absolutely. Rule 7 Media focuses on accessibility — low or no setup costs, work-from-home flexibility, and real earning potential without traditional high franchise fees.</p>
//             </div>
//             <div className="glass p-8 rounded-3xl">
//               <h3 className="text-rose-400 font-semibold mb-3">How can I start a work from home franchise with zero investment?</h3>
//               <p className="text-slate-300">Our model is designed for people who want to start immediately. No expensive inventory, no storefront, no large upfront costs — just your time and our support.</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* FRANCHISE FORM SECTION */}
//       <section ref={franchiseSectionRef} id="franchise-section" className="py-32 relative">
//         <div className="container mx-auto px-6">
//           <div className="glass rounded-[64px] p-12 md:p-24">
//             <div className="grid lg:grid-cols-2 gap-16 items-center">
//               <div>
//                 <h2 className="text-5xl font-black leading-tight mb-6">Ready to Start a Home Based Franchise with <span className="ruby-shine">No Startup Costs?</span></h2>
//                 <p className="text-xl text-slate-300 mb-10">Tell us about your goals and desired territory. Our team will send you the full prospectus and discuss zero-investment options available in your area.</p>
//                 <div className="flex items-center gap-4 text-slate-300">
//                   <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-rose-400">✉️</div>
//                   <div>
//                     <div className="font-semibold">Franchiseenquiries@rule7media.com</div>
//                     <div className="text-sm text-slate-400">Fast response • Confidential</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-black/40 p-8 rounded-3xl border border-white/5">
//                  <form onSubmit={handleSubmit} className="space-y-6">
//                   <div className="grid grid-cols-2 gap-4">
//                     <input
//                       type="text"
//                       name="firstName"
//                       placeholder="First Name"
//                       required
//                       value={enquiryForm.firstName}
//                      onChange={handleChange}
//                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-slate-200 focus:outline-none focus:border-rose-500 transition-all"
//                     />
//                     <input
//                       type="text"
//                       name="lastName"
//                       placeholder="Last Name"
//                       required
//                       value={enquiryForm.lastName}
//                       onChange={handleChange}
//                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-slate-200 focus:outline-none focus:border-rose-500 transition-all"
//                     />
//                   </div>
//                   <input
//                     type="email"
//                     name="email"
//                     placeholder="Email Address"
//                     required
//                     value={enquiryForm.email}
//                      onChange={handleChange}
//                     className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-slate-200 focus:outline-none focus:border-rose-500 transition-all"
//                   />
//                   <input
//                     type="text"
//                     name="territory"
//                     placeholder="Desired Territory (City &amp; State)"
//                     required
//                     value={enquiryForm.territory}
//                     onChange={handleChange}
//                     className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-slate-200 focus:outline-none focus:border-rose-500 transition-all"
//                   />
//                   <textarea
//                     name="background"
//                     placeholder="Tell us why you're interested in a no-startup-cost home franchise..."
//                     rows="5"
//                     required
//     value={enquiryForm.background}
//   onChange={handleChange}
//                     className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-slate-200 focus:outline-none focus:border-rose-500 transition-all"
//                   ></textarea>

//                   <button
//                     type="submit"
//                     disabled={franchiseLoading}
//                     className="w-full py-5 accent-gradient rounded-2xl font-bold text-white text-lg glow-hover transition-all disabled:opacity-70 disabled:cursor-not-allowed"
//                   >
//                     {franchiseLoading ? 'Sending...' : 'Send My Free Prospectus Inquiry'}
//                   </button>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="py-20 border-t border-white/5 bg-black">
//         <div className="container mx-auto px-6 text-center md:text-left">
//           <div className="flex flex-col md:flex-row justify-between items-center gap-8">
//             <div className="flex items-center gap-3">
//               <div className="w-9 h-9 accent-gradient rounded-xl flex items-center justify-center font-bold text-white text-xl">R7</div>
//               <span className="font-bold text-slate-200 uppercase tracking-tighter">RULE 7 MEDIA</span>
//             </div>
//             <p className="text-xs text-slate-500">© 2026 Rule 7 Media Group. All Rights Reserved. • Low Cost Home Based Franchise Opportunities</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default FranchiseLandingPage;

// // import { useState, useEffect } from "react";
// // import { Link } from "react-router-dom";
// // import { useDispatch, useSelector } from "react-redux";
// // import { toast } from "react-toastify";
// // import prospectusPDF from "../assets/prospectus.pdf";
// // import {
// //   ShieldCheck,
// //   TrendingUp,
// //   Download,
// //   Users,
// //   ShoppingBag,
// //   Truck,
// //   Info,
// //   CheckCircle2,
// //   Gift,
// //   BarChart3,
// //   Smartphone,
// //   Zap,
// //   Check,
// //   Mail,
// //   Globe,
// //   X
// // } from "lucide-react";

// // import {
// //   addFranchise,
// //   resetFranchise,
// // } from "../store/franchise/franchiseSlice";
// // import FranchiseImage from "../assets/franchise.jpg";
// // const FranchiseLandingPage = () => {
// //   const dispatch = useDispatch();
// //  const { country: userCountry, isLoading: countryLoading } = useSelector((state) => state.country);

// //   const { loading, success, error, message } = useSelector(
// //     (state) => state.franchise,
// //   );
// //     const countryList = [
// //     "Australia", "Argentina", "Austria", "Bangladesh", "Belgium", "Brazil",
// //     "Canada", "Chile", "China", "Colombia", "Czech Republic", "Denmark",
// //     "Egypt", "Finland", "France", "Germany", "Hungary", "India", "Indonesia",
// //     "Iran", "Ireland (Eire)", "Italy", "Japan", "Mexico", "Middle East",
// //     "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Peru",
// //     "Philippines", "Poland", "Portugal", "Russia", "Other South America",
// //     "South Korea", "Spain", "Sweden", "Thailand", "Turkey", "United Kingdom",
// //     "USA", "Vietnam", "Ethiopia", "Tanzania", "South Africa", "Ukraine",
// //     "Venezuela", "Ecuador", "Bolivia", "DR Congo", "Kenya", "Sudan",
// //     "Algeria", "Morocco", "Mozambique", "Other Africa"
// //   ];
// // const [enquiryForm, setEnquiryForm] = useState({
// //     firstName: "",
// //     lastName: "",
// //     email: "",
// //     country: userCountry || "",
// //     formType: "enquiry",
// //   });

// //   // Form 2: Franchise Kit (CTA)
// //   const [franchiseKitForm, setFranchiseKitForm] = useState({
// //     firstName: "",
// //     lastName: "",
// //     email: "",
// //     territory: "",
// //     formType: "franchise_kit",
// //   });
// //   const [isModalOpen, setIsModalOpen] = useState(false);
// //  const getFilteredCountries = () => {
// //     if (userCountry && countryList.includes(userCountry)) {
// //       return [userCountry];
// //     }
// //     return countryList;
// //   };

// //   const filteredCountries = getFilteredCountries();
// //   const isCountryDisabled = userCountry && countryList.includes(userCountry);
// //    useEffect(() => {
// //     if (userCountry) {
// //       setEnquiryForm(prev => ({ ...prev, country: userCountry }));
// //     }
// //   }, [userCountry]);

// //   // Handle success/error for both forms
// //   useEffect(() => {
// //     if (success) {
// //       toast.success("Form submitted successfully!");

// //       setEnquiryForm({
// //         firstName: "",
// //         lastName: "",
// //         email: "",
// //         country: userCountry || "",
// //         formType: "enquiry",
// //       });
// //       setFranchiseKitForm({
// //         firstName: "",
// //         lastName: "",
// //         email: "",
// //         territory: "",
// //         formType: "franchise_kit",
// //       });
// //       setIsModalOpen(false);
// //       dispatch(resetFranchise());
// //     }
// //     if (error) {
// //       toast.error(error);
// //     }
// //   }, [success, error, dispatch, userCountry]);

// //   // Handlers
// //   const handleEnquirySubmit = (e) => {
// //     e.preventDefault();
// //     dispatch(addFranchise(enquiryForm));
// //   };

// //   const handleFranchiseKitSubmit = (e) => {
// //     e.preventDefault();
// //     dispatch(addFranchise(franchiseKitForm));
// //   };

// // const handleDownload = () => {
// //   const link = document.createElement("a");
// //   link.href = prospectusPDF;
// //   link.download = "prospectus.pdf";
// //   document.body.appendChild(link);
// //   link.click();
// //   document.body.removeChild(link);
// // };

// //   const handleEnquiryChange = (e) => {
// //   setEnquiryForm({ ...enquiryForm, [e.target.name]: e.target.value });
// // };

// // // Franchise Kit form ke liye
// // const handleFranchiseKitChange = (e) => {
// //   setFranchiseKitForm({ ...franchiseKitForm, [e.target.name]: e.target.value });
// // };

// //   return (
// //     <div className="bg-black text-white min-h-screen font-sans">
// //       {/* ─── NAVBAR ─── */}
// //       <nav className="sticky top-0 z-50 bg-black border-b border-gray-900 px-6 md:px-12 py-4 flex items-center justify-between">
// //         <div className="group flex items-center gap-2 cursor-pointer">
// //           <div
// //             className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center
// //                   transition-transform duration-300
// //                   group-hover:translate-x-[3px]"
// //           >
// //             <ShieldCheck
// //               className="text-white w-6 h-6 transition-transform duration-300
// //                             group-hover:-translate-x-[1px]"
// //             />
// //           </div>

// //           <span className="font-bold text-sm tracking-wide">RULE7MEDIA</span>
// //         </div>
// //         <div className="hidden md:flex items-center gap-8">
// //           <Link
// //             to="#"
// //             className="text-gray-400 text-sm font-medium hover:text-white transition-colors"
// //           >
// //             Business Model
// //           </Link>

// //           <Link
// //             to="#"
// //             className="text-gray-400 text-sm font-medium hover:text-white transition-colors"
// //           >
// //             Revenue Streams
// //           </Link>

// //           <Link
// //             to="/contact-us"
// //             className="text-gray-400 text-sm font-medium hover:text-white transition-colors"
// //           >
// //             Support
// //           </Link>
// //           <button  onClick={() => setIsModalOpen(true)} className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-blue-500 hover:text-white transition-all">
// //             Enquire Now
// //           </button>
// //         </div>
// //        <button
// //   onClick={() => setIsModalOpen(true)}
// //   className="md:hidden bg-white text-black text-xs font-semibold px-4 py-2 rounded-md"
// // >
// //   Enquire
// // </button>
// //       </nav>
// // {/* ─── ENQUIRE NOW MODAL ─── */}
// //   {isModalOpen && (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
// //           <div className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/10 shadow-2xl p-6">
// //             <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
// //               <X className="w-5 h-5" />
// //             </button>
// //             <h3 className="text-2xl font-bold text-white mb-2">Enquire Now</h3>
// //             <p className="text-gray-400 text-sm mb-6">Fill the form and we'll get back to you.</p>

// //             <form onSubmit={handleEnquirySubmit} className="space-y-4">
// //               <div className="grid grid-cols-2 gap-3">
// //                 <input
// //                   type="text"
// //                   name="firstName"
// //                   value={enquiryForm.firstName}
// //                   onChange={handleEnquiryChange}
// //                   placeholder="First Name"
// //                   required
// //                   className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //                 />
// //                 <input
// //                   type="text"
// //                   name="lastName"
// //                   value={enquiryForm.lastName}
// //                   onChange={handleEnquiryChange}
// //                   placeholder="Last Name"
// //                   required
// //                   className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //                 />
// //               </div>
// //               <input
// //                 type="email"
// //                 name="email"
// //                 value={enquiryForm.email}
// //                 onChange={handleEnquiryChange}
// //                 placeholder="Work Email"
// //                 required
// //                 className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //               />

// //               {/* Country dropdown - only shows user's detected country */}
// //               <select
// //                 name="country"
// //                 value={enquiryForm.country}
// //                onChange={handleEnquiryChange}
// //                 required
// //                 disabled={isCountryDisabled}
// //                 className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/10 text-white focus:outline-none disabled:opacity-60"
// //               >
// //                 {!userCountry && <option value="">Select Your Country</option>}
// //                 {filteredCountries.map((c) => (
// //                   <option key={c} value={c} className="text-black">{c}</option>
// //                 ))}
// //               </select>

// //               <button
// //                 type="submit"
// //                 disabled={loading}
// //                 className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50"
// //               >
// //                 {loading ? "Submitting..." : "Submit Enquiry"}
// //               </button>
// //               <p className="text-[10px] text-gray-400 text-center">
// //                 By submitting, you agree to our privacy policy.
// //               </p>
// //             </form>
// //           </div>
// //         </div>
// //       )}
// //       <section className="max-w-[1400px] mx-auto px-6 grid lg:grid-cols-2 gap-8 items-center">
// //         <div className="flex-1 pl-6">
// //           <span className="inline-flex items-center gap-1 bg-blue-900 bg-opacity-40 border border-blue-700 border-opacity-50 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
// //             ★ Limited Territories Available
// //           </span>
// //           <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
// //             Thrive in Every
// //             <br />
// //             <span className="text-blue-400">Economic Climate</span>
// //           </h1>
// //           <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8 max-w-sm">
// //             Adapt, prosper, and grow with a multi-channel franchise model
// //             designed to perform in all market conditions—not just the boom
// //             times.
// //           </p>
// //           <div className="flex flex-wrap items-center gap-4">
// //             <button
// //               onClick={handleDownload}
// //               className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl
// //              hover:bg-blue-500 transition-all
// //              shadow-lg shadow-blue-600/25
// //              flex items-center justify-center gap-3 group"
// //             >
// //               Download Prospectus
// //               <Download className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-1" />
// //             </button>
// //             <Link to="/countries-franchise">
// //   <button className="px-8 py-4 bg-white/5 text-white border border-white/10 font-bold rounded-xl hover:bg-white/10 transition-all">
// //     View Available Areas
// //   </button>
// // </Link>
// //           </div>
// //         </div>

// //         <div className="flex-1 w-full md:pl-16">
// //           <div className="relative glass-panel rounded-3xl p-4 border-white/10 overflow-hidden shadow-2xl">
// //             <img
// //               src={FranchiseImage}
// //               alt="Franchise"
// //               className="rounded-2xl grayscale hover:grayscale-0 transition-all duration-700 object-cover aspect-video lg:aspect-square"
// //             />

// //             <div
// //               className="absolute bottom-10 left-10 right-10
// //                 p-6 glass-panel rounded-2xl border border-white/20
// //                 backdrop-blur-xl bg-black/60"
// //             >
// //               <div className="flex items-center gap-4">
// //                 <div
// //                   className="w-12 h-12 bg-green-500/20
// //                     rounded-full flex items-center justify-center
// //                     text-green-500"
// //                 >
// //                   <TrendingUp className="w-6 h-6" />
// //                 </div>

// //                 {/* Text Content */}
// //                 <div>
// //                   <p className="text-white font-bold text-lg">
// //                     Resilient Model
// //                   </p>
// //                   <p className="text-xs text-gray-400">
// //                     Engineered for the 2024-2026 economic cycle.
// //                   </p>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* ─── REVENUE SECTION ─── */}
// //       <section className="bg-gray-950 py-20">
// //         <div className="max-w-[1400px] mx-auto px-6">
// //           {/* Header Row */}
// //           <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
// //             <div className="max-w-2xl">
// //               <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
// //                 A Diversified Engine for{" "}
// //                 <span className="text-blue-500">Unstoppable Revenue</span>
// //               </h2>
// //               <p className="text-gray-400 text-lg">
// //                 Our unique model allows franchisees to generate revenue from a
// //                 variety of channels. You're never reliant on a single source of
// //                 income.
// //               </p>
// //             </div>

// //             <div className="flex items-center gap-4 text-sm text-gray-500 border border-white/5 p-4 rounded-xl">
// //               <Info className="w-5 h-5 text-blue-500" />
// //               <span>Multi-stream earnings across 3 distinct verticals.</span>
// //             </div>
// //           </div>

// //           {/* Cards Grid */}
// //           <div className="grid md:grid-cols-3 gap-8">
// //             {/* Card 1 */}
// //             <div
// //               className="group glass-panel p-10 rounded-[2.5rem] border border-white/5
// //                       transition-all hover:bg-white/[0.03] hover:border-blue-500/30"
// //             >
// //               <div
// //                 className="w-16 h-16 bg-blue-600/10 rounded-2xl
// //                         flex items-center justify-center
// //                         text-blue-500 mb-8
// //                         group-hover:scale-110 transition-transform"
// //               >
// //                 <Users className="w-8 h-8" />
// //               </div>

// //               <h3 className="text-2xl font-bold text-white mb-4">
// //                 Market Buyers
// //               </h3>

// //               <p className="text-gray-400 leading-relaxed mb-6">
// //                 Capture the value-conscious consumer market seeking high-impact
// //                 rewards and supplemental income opportunities.
// //               </p>

// //               <ul className="space-y-3 text-sm text-gray-500">
// //                 <li className="flex items-center gap-2">
// //                   <CheckCircle2 className="w-4 h-4 text-blue-500" />
// //                   High retention rates
// //                 </li>
// //                 <li className="flex items-center gap-2">
// //                   <CheckCircle2 className="w-4 h-4 text-blue-500" />
// //                   Recession-proof demand
// //                 </li>
// //               </ul>
// //             </div>

// //             {/* Card 2 */}
// //             <div
// //               className="group glass-panel p-10 rounded-[2.5rem] border border-white/5
// //                       transition-all hover:bg-white/[0.03] hover:border-purple-500/30"
// //             >
// //               <div
// //                 className="w-16 h-16 bg-purple-600/10 rounded-2xl
// //                         flex items-center justify-center
// //                         text-purple-500 mb-8
// //                         group-hover:scale-110 transition-transform"
// //               >
// //                 <ShoppingBag className="w-8 h-8" />
// //               </div>

// //               <h3 className="text-2xl font-bold text-white mb-4">
// //                 Network Sellers
// //               </h3>

// //               <p className="text-gray-400 leading-relaxed mb-6">
// //                 Partner with local and national sellers looking to offload
// //                 inventory and reach ready-to-buy audiences instantly.
// //               </p>

// //               <ul className="space-y-3 text-sm text-gray-500">
// //                 <li className="flex items-center gap-2">
// //                   <CheckCircle2 className="w-4 h-4 text-purple-500" />
// //                   Performance-based fees
// //                 </li>
// //                 <li className="flex items-center gap-2">
// //                   <CheckCircle2 className="w-4 h-4 text-purple-500" />
// //                   B2B partnership growth
// //                 </li>
// //               </ul>
// //             </div>

// //             {/* Card 3 */}
// //             <div
// //               className="group glass-panel p-10 rounded-[2.5rem] border border-white/5
// //                       transition-all hover:bg-white/[0.03] hover:border-green-500/30"
// //             >
// //               <div
// //                 className="w-16 h-16 bg-green-600/10 rounded-2xl
// //                         flex items-center justify-center
// //                         text-green-500 mb-8
// //                         group-hover:scale-110 transition-transform"
// //               >
// //                 <Truck className="w-8 h-8" />
// //               </div>

// //               <h3 className="text-2xl font-bold text-white mb-4">
// //                 Ancillary Suppliers
// //               </h3>

// //               <p className="text-gray-400 leading-relaxed mb-6">
// //                 Provide efficiency solutions to transport companies and
// //                 logistics suppliers seeking to cut operational costs.
// //               </p>

// //               <ul className="space-y-3 text-sm text-gray-500">
// //                 <li className="flex items-center gap-2">
// //                   <CheckCircle2 className="w-4 h-4 text-green-500" />
// //                   High-margin service fees
// //                 </li>
// //                 <li className="flex items-center gap-2">
// //                   <CheckCircle2 className="w-4 h-4 text-green-500" />
// //                   Infinite scalability
// //                 </li>
// //               </ul>
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* ─── CONSUMER SECTION ─── */}
// //       <section className="py-20 bg-[#050505]">
// //         <div className="max-w-[1400px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
// //           {/* LEFT SIDE - CARDS */}
// //           <div className="order-2 lg:order-1 relative">
// //             <div className="grid grid-cols-2 gap-4">
// //               {/* Column 1 */}
// //               <div className="space-y-4 pt-12">
// //                 <div className="glass-panel p-6 rounded-2xl border border-white/10 animate-float">
// //                   <Gift className="text-blue-500 w-10 h-10 mb-4" />
// //                   <h4 className="text-white font-bold">Luxury Rewards</h4>
// //                   <p className="text-xs text-gray-500 mt-2">
// //                     Attract consumers with high-value prize draws.
// //                   </p>
// //                 </div>

// //                 <div className="glass-panel p-6 rounded-2xl border border-white/10">
// //                   <BarChart3 className="text-blue-500 w-10 h-10 mb-4" />
// //                   <h4 className="text-white font-bold">Viral Engagement</h4>
// //                   <p className="text-xs text-gray-500 mt-2">
// //                     Built-in social sharing and loyalty mechanics.
// //                   </p>
// //                 </div>
// //               </div>

// //               {/* Column 2 */}
// //               <div className="space-y-4">
// //                 <div className="glass-panel p-6 rounded-2xl border border-white/10">
// //                   <Smartphone className="text-blue-500 w-10 h-10 mb-4" />
// //                   <h4 className="text-white font-bold">App-First Experience</h4>
// //                   <p className="text-xs text-gray-500 mt-2">
// //                     Mobile-optimized consumer interaction.
// //                   </p>
// //                 </div>

// //                 <div
// //                   className="glass-panel p-6 rounded-2xl border border-white/10 animate-float"
// //                   style={{ animationDelay: "1s" }}
// //                 >
// //                   <Zap className="text-blue-500 w-10 h-10 mb-4" />
// //                   <h4 className="text-white font-bold">Instant Feedback</h4>
// //                   <p className="text-xs text-gray-500 mt-2">
// //                     Real-time data for franchise optimization.
// //                   </p>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* RIGHT SIDE - TEXT */}
// //           <div className="order-1 lg:order-2 space-y-8">
// //             <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
// //               Engaging the <br />
// //               <span className="text-blue-500">Modern Value-Conscious</span>{" "}
// //               Consumer
// //             </h2>

// //             <p className="text-gray-400 text-lg leading-relaxed">
// //               Today’s consumers are keen to supplement their income or win big
// //               with free-to-enter sweepstake draws for luxury prizes they may not
// //               otherwise afford.
// //             </p>

// //             <p className="text-gray-400 text-lg leading-relaxed">
// //               Our franchise taps directly into this trend, offering regular
// //               chances for consumers to win coveted rewards while maintaining a
// //               constant stream of engagement for your local business territory.
// //             </p>

// //             {/* Avatars */}
// //             <div className="pt-4">
// //               <div className="flex items-center gap-4 mb-4">
// //                 <div className="flex -space-x-2">
// //                   <img
// //                     src="https://i.pravatar.cc/100?u=1"
// //                     className="w-10 h-10 rounded-full border-2 border-[#050505]"
// //                   />
// //                   <img
// //                     src="https://i.pravatar.cc/100?u=2"
// //                     className="w-10 h-10 rounded-full border-2 border-[#050505]"
// //                   />
// //                   <img
// //                     src="https://i.pravatar.cc/100?u=3"
// //                     className="w-10 h-10 rounded-full border-2 border-[#050505]"
// //                   />
// //                 </div>

// //                 <p className="text-sm font-medium text-white">
// //                  Want to be One of Our Successful Franchisees ?
// //                 </p>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* ─── CTA / FORM SECTION ─── */}
// //       <section className="px-6 py-20">
// //         <div className="max-w-[1400px] mx-auto">
// //           <div className="relative bg-blue-600 rounded-[3rem] p-8 lg:p-20 overflow-hidden">
// //             <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
// //               {/* LEFT CONTENT */}
// //               <div>
// //                 <h2 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tight mb-6">
// //                   Take Charge of <br /> Your Future
// //                 </h2>

// //                 <div className="space-y-4">
// //                   {[
// //                     "Exclusive Territory Ownership",
// //                     "Full Operational Support & Training",
// //                     "Ready-to-Launch Marketing Suite",
// //                   ].map((item) => (
// //                     <div
// //                       key={item}
// //                       className="flex items-center gap-4 text-white"
// //                     >
// //                       <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
// //                         <Check className="w-5 h-5" />
// //                       </div>
// //                       <span className="font-bold">{item}</span>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>

// //               {/* RIGHT FORM */}
// //               <div className="glass-panel p-8 rounded-3xl border-white/20 bg-white/5 backdrop-blur-xl">
// //                 <form onSubmit={handleFranchiseKitSubmit} className="space-y-4">
// //                   <div className="grid grid-cols-2 gap-4">
// //                     <input
// //                       type="text"
// //                       name="firstName"
// //                       value={franchiseKitForm.firstName}
// //                       onChange={handleFranchiseKitChange}
// //                       placeholder="First Name"
// //                       required
// //                       className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/60 focus:outline-none"
// //                     />

// //                     <input
// //                       type="text"
// //                       name="lastName"
// //                        value={franchiseKitForm.lastName}
// //                       onChange={handleFranchiseKitChange}
// //                       placeholder="Last Name"
// //                       required
// //                       className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/60 focus:outline-none"
// //                     />
// //                   </div>
// //                   <input
// //                     type="email"
// //                     name="email"
// //                      value={franchiseKitForm.email}
// //                     onChange={handleFranchiseKitChange}
// //                     placeholder="Work Email"
// //                     required
// //                     className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/60 focus:outline-none"
// //                   />

// //                   <select
// //                     name="territory"
// //                    value={franchiseKitForm.territory}
// //                     onChange={handleFranchiseKitChange}
// //                     required
// //                     className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/10 text-white focus:outline-none"
// //                   >
// //                     <option value="" className="text-black">
// //                       Select Preferred Territory
// //                     </option>
// //                     <option value="North America" className="text-black">
// //                       North America
// //                     </option>
// //                     <option value="Europe / UK" className="text-black">
// //                       Europe / UK
// //                     </option>
// //                     <option value="Asia Pacific" className="text-black">
// //                       Asia Pacific
// //                     </option>
// //                     <option value="Middle East" className="text-black">
// //                       Middle East
// //                     </option>
// //                   </select>

// //                   <button
// //                     type="submit"
// //                     className="w-full py-5 bg-white text-blue-600 font-black rounded-xl hover:bg-gray-100 transition-all uppercase tracking-widest shadow-xl"
// //                   >
// //                     Request Franchise Kit
// //                   </button>

// //                   <p className="text-[10px] text-blue-200 text-center px-4 uppercase tracking-widest">
// //                     By clicking, you agree to our privacy policy and data terms.
// //                   </p>
// //                 </form>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* ─── FOOTER ─── */}
// //       <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10 px-6">
// //         <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
// //           <div className="space-y-6">
// //             <div className="flex items-center gap-2">
// //               <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
// //                 <ShieldCheck className="w-5 h-5 text-white" />
// //               </div>
// //               <span className="text-lg font-bold tracking-tighter text-white uppercase">
// //                 Rule7Media
// //               </span>
// //             </div>

// //             <p className="text-gray-500 text-sm leading-relaxed">
// //               Pioneering resilient business models for a changing world. Since
// //               2018, Rule7Media has empowered entrepreneurs to scale with
// //               intelligence.
// //             </p>
// //           </div>

// //           {/* PARTNERSHIP */}
// //           <div>
// //             <h4 className="text-white font-bold mb-6">Partnership</h4>

// //             <ul className="space-y-4 text-sm text-gray-500">
// //               {[
// //                 { label: "Territory Map", path: "/countries-franchise" },
// //                 { label: "Financial Requirements", path: "/contact-us" },
// //                 { label: "Case Studies", path: "#" },
// //               ].map((item) => (
// //                 <li key={item.path}>
// //                   <Link
// //                     to={item.path}
// //                     className="hover:text-blue-500 transition-colors"
// //                   >
// //                     {item.label}
// //                   </Link>
// //                 </li>
// //               ))}
// //             </ul>
// //           </div>

// //           {/* SUPPORT */}
// //           <div>
// //             <h4 className="text-white font-bold mb-6">Support</h4>

// //             <ul className="space-y-4 text-sm text-gray-500">
// //               {["Training Portal", "Supplier Network", "Compliance"].map(
// //                 (item) => (
// //                   <li key={item}>
// //                     <Link
// //                       to="/contact-us"
// //                       className="hover:text-blue-500 transition-colors"
// //                     >
// //                       {item}
// //                     </Link>
// //                   </li>
// //                 ),
// //               )}
// //             </ul>
// //           </div>

// //           {/* CONTACT */}
// //           <div>
// //             <h4 className="text-white font-bold mb-6">Contact</h4>
// //             <ul className="space-y-4 text-sm text-gray-500">
// //               <li className="flex items-center gap-3">
// //                 <Mail className="w-4 h-4 text-blue-500" />
// //                 <a
// //                   href="mailto:franchise@rule7media.com"
// //                   className="hover:text-blue-500 transition-colors"
// //                 >
// //                   franchise@rule7media.com
// //                 </a>
// //               </li>

// //               <li className="flex items-center gap-3">
// //                 <Globe className="w-4 h-4 text-blue-500" />
// //                 <a
// //                   href="https://www.rule7media.com/franchise"
// //                   target="_blank"
// //                   rel="noopener noreferrer"
// //                   className="hover:text-blue-500 transition-colors"
// //                 >
// //                   rule7media.com/franchise
// //                 </a>
// //               </li>
// //             </ul>
// //           </div>
// //         </div>

// //         {/* BOTTOM COPYRIGHT */}
// //         <div className="text-center text-[10px] text-gray-600 uppercase tracking-[0.2em] border-t border-white/5 pt-10">
// //           © 2026 RULE7MEDIA INTELLIGENCE DIVISION. ADAPT, PROSPER, GROW.
// //         </div>
// //       </footer>
// //     </div>
// //   );
// // };
// // export default FranchiseLandingPage;
