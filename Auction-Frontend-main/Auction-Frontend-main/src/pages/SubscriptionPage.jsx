import React, { useState, useRef, useEffect } from "react";
import {
  Lock,
  ShieldCheck,
  EyeOff,
  ShieldAlert,
  Star,
  CheckCircle2,
  UserCheck,
  X,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef(null);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const userType = user?.userType?.toLowerCase() || "";

  // User type to plan page mapping
  const userTypePlanMapping = {
    fleetowner: "/pricing?type=fleetowner",
    seller: "/pricing?type=seller",
    advertiser: "/pricing?type=advertiser",
    buyer: "/pricing?type=buyer",
    wrapper: "/pricing?type=wrapper",
    default: "/pricing",
  };

  // ✅ Button 1: Unlock Exclusive Auctions - Register page pe le jaaye
  const handleUnlockAuctions = () => {
    navigate("/register");
  };

  // ✅ Button 2: View Pricing Plans - Pricing page pe le jaaye
  const handleViewPricing = () => {
    if (isAuthenticated && user) {
      // User logged in - go to pricing with type
      const redirectPath =
        userTypePlanMapping[userType] || userTypePlanMapping.default;
      navigate(redirectPath);
    } else {
      // User not logged in - go to login first
      navigate("/login", {
        state: { from: "/subscriberonly", viewPlans: true },
      });
    }
  };

  // Subscribe Now button (navbar)
  const handleSubscribeClick = () => {
    if (isAuthenticated && user) {
      const redirectPath =
        userTypePlanMapping[userType] || userTypePlanMapping.default;
      navigate(redirectPath);
    } else {
      navigate("/register", { state: { from: "/subscriberonly" } });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setModalOpen(false);
      }
    };
    if (modalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalOpen]);

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modalOpen]);

  const registerSubscription = () => {
    navigate("/register");
  };

  return (
    <div className="mesh-bg min-h-screen">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #02040a;
            color: #e2e8f0;
          }
          .glass {
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.05);
          }
          .accent-gradient {
            background: linear-gradient(135deg, #e11d48 0%, #881337 100%);
          }
          .ruby-shine {
            background: linear-gradient(
              90deg, 
              #9f1239 0%, 
              #f43f5e 20%, 
              #fb7185 50%, 
              #f43f5e 80%, 
              #9f1239 100%
            );
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shine 6s linear infinite;
          }
          @keyframes shine {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          .glow-hover:hover {
            box-shadow: 0 0 40px rgba(225, 29, 72, 0.3);
            transform: translateY(-2px);
          }
          .mesh-bg {
            background-image: 
              radial-gradient(at 0% 0%, rgba(225, 29, 72, 0.15) 0, transparent 50%), 
              radial-gradient(at 100% 100%, rgba(136, 19, 55, 0.1) 0, transparent 50%);
          }
        `}
      </style>

      {/* Navigation */}
      <nav className="fixed w-full z-50 glass top-4 left-1/2 -translate-x-1/2 max-w-6xl mx-auto rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 accent-gradient rounded-lg flex items-center justify-center font-extrabold text-xl text-white">
            R7
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-200 uppercase">
            RULE 7 MEDIA
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            to="/contact-us"
            className="hidden sm:block text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors"
          >
            Support
          </Link>
          <button
            onClick={handleSubscribeClick}
            className="accent-gradient px-6 py-2.5 rounded-xl text-sm font-bold text-white glow-hover transition-all"
          >
            Subscribe Now
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 mb-8 animate-pulse">
            <Lock className="w-10 h-10 text-rose-500" />
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Unlock <span className="ruby-shine italic">Premium</span> Auction
            Intelligence
          </h1>

          {/* Restricted Access Message */}
          <div className="glass p-8 md:p-12 rounded-[40px] border-rose-500/20 shadow-2xl mb-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-24 h-24 text-rose-500" />
            </div>

            <p className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed mb-8">
              In order to protect the privacy and eliminate spamming of our
              partners this facility is only available to{" "}
              <span className="text-white font-bold border-b-2 border-rose-500/50">
                paid subscribers
              </span>
              .
            </p>

            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 text-rose-400 font-bold hover:text-rose-300 transition-all text-base sm:text-lg group whitespace-nowrap"
            >
              LEARN MORE
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Value Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="glass p-6 rounded-3xl text-left border-white/5">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4">
                <EyeOff className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">
                Absolute Privacy
              </h3>
              <p className="text-slate-400 text-sm">
                Ensuring auction details remain confidential and only visible to
                verified bidders.
              </p>
            </div>
            <div className="glass p-6 rounded-3xl text-left border-white/5">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4">
                <ShieldAlert className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">
                Anti-Spam Filter
              </h3>
              <p className="text-slate-400 text-sm">
                Removing data scrapers and unsolicited communications from your
                professional space.
              </p>
            </div>
            <div className="glass p-6 rounded-3xl text-left border-white/5">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">
                Exclusive Reach
              </h3>
              <p className="text-slate-400 text-sm">
                Gain priority access to high-value opportunities not available
                on public boards.
              </p>
            </div>
          </div>

          {/* ✅ Primary CTAs - TWO WORKING BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Button 1: Unlock Exclusive Auctions - Goes to Register */}
            <button
              onClick={handleUnlockAuctions}
              className="w-full sm:w-auto px-10 py-5 accent-gradient rounded-2xl font-bold text-xl text-white glow-hover shadow-2xl transition-all flex items-center justify-center gap-3"
            >
              Unlock Exclusive Auctions
            </button>

            {/* Button 2: View Pricing Plans */}
            <button
              onClick={handleViewPricing}
              className="w-full sm:w-auto px-10 py-5 glass rounded-2xl font-bold text-xl text-slate-300 hover:bg-slate-800 transition-all"
            >
              View Pricing Plans
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">
                ISO 27001 SECURE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">
                VERIFIED PARTNERS
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">
                AES-256 ENCRYPTED
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
          {/* Modal Content */}
          <div
            ref={modalRef}
            className="bg-[#0a0f1a] border border-white/10 w-full max-w-3xl rounded-[32px] overflow-hidden shadow-3xl relative transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setModalOpen(false)}
              className="sticky top-4 float-right mr-4 mt-4 z-10 text-slate-500 hover:text-white transition-colors bg-[#0a0f1a] rounded-full p-1"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8 md:p-12 pt-0">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 accent-gradient rounded-xl flex items-center justify-center text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  Access Philosophy
                </h2>
              </div>

              <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
                <p>
                  Restricting access to auction viewing for paid subscribers is
                  a crucial measure that serves several important purposes.
                  Firstly, it helps{" "}
                  <strong className="text-rose-400">
                    safeguard the privacy of our partners
                  </strong>{" "}
                  by ensuring that their information and auction details are
                  only visible to a verified, committed audience. This reduces
                  the risk of unwanted attention, data scraping, or unsolicited
                  communications, which can often arise when sensitive business
                  information is freely accessible to the public.
                </p>
                <p>
                  Furthermore, limiting access to paid subscribers acts as an{" "}
                  <strong className="text-rose-400">
                    effective deterrent against spamming
                  </strong>{" "}
                  and fraudulent activities. By implementing a paid registration
                  barrier, we ensure that only genuine, invested participants
                  are able to interact with auction listings, thereby
                  maintaining the integrity of the platform and fostering a
                  trustworthy environment for all stakeholders.
                </p>
                <p>
                  This approach also adds value for subscribers, as they gain
                  exclusive access to high-quality auction opportunities that
                  are not available elsewhere. It encourages a sense of
                  community and commitment among members, while allowing us to
                  provide enhanced support and resources tailored specifically
                  to their needs.
                </p>
                <div className="p-6 bg-rose-500/10 rounded-2xl border border-rose-500/20 italic">
                  In summary, restricting auction viewing to paid subscribers
                  protects partner privacy, minimises spam and abuse, and
                  ensures that our auctions are conducted within a secure and
                  professional environment.
                </div>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={registerSubscription}
                  className="flex-1 px-8 py-4 accent-gradient rounded-xl font-bold text-white glow-hover shadow-lg"
                >
                  Subscribe Now
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-slate-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-10 border-t border-white/5 bg-black/40">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            © 2026 RULE 7 MEDIA. SECURE ENVIRONMENT.
          </p>
          <div className="flex gap-6 text-xs font-black uppercase tracking-widest text-slate-500">
            <Link to="/terms-conditions" className="hover:text-rose-500">
              Security Terms
            </Link>
            <Link to="/privacy-policy" className="hover:text-rose-500">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SubscriptionPage;
