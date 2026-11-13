import React, { useState } from "react";
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

const SubscriptionlandingPage = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="bg-[#02040a] min-h-screen relative overflow-hidden">
      {/* Mesh Background Effect - Pure Tailwind */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_40%_20%,rgba(244,63,94,0.05)_0px,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(at_80%_50%,rgba(139,92,246,0.03)_0px,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(at_0%_80%,rgba(59,130,246,0.03)_0px,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(at_90%_90%,rgba(244,63,94,0.05)_0px,transparent_50%)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.01)_0px,rgba(255,255,255,0.01)_1px,transparent_1px,transparent_20px)]" />
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 top-4 left-1/2 -translate-x-1/2 max-w-6xl mx-auto">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center font-extrabold text-xl text-white">
              R7
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-200 uppercase">
              RULE 7 MEDIA
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="hidden sm:block text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors"
            >
              Support
            </a>
            <button className="bg-gradient-to-br from-rose-500 to-rose-600 px-6 py-2.5 rounded-xl text-sm font-bold text-white hover:shadow-[0_0_30px_rgba(244,63,94,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300">
              Subscribe Now
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 mb-8 animate-pulse">
            <Lock className="w-10 h-10 text-rose-500" />
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight text-slate-200">
            Unlock{" "}
            <span className="bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 bg-[length:200%_auto] bg-clip-text text-transparent animate-[shine_4s_linear_infinite] italic">
              Premium
            </span>{" "}
            Auction Intelligence
          </h1>

          {/* Restricted Access Message */}
          <div className="bg-white/5 backdrop-blur-md border border-rose-500/20 rounded-[40px] p-8 md:p-12 shadow-2xl mb-12 relative overflow-hidden group">
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
              className="inline-flex items-center gap-2 text-rose-400 font-bold hover:text-rose-300 transition-all text-lg group"
            >
              LEARN MORE
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Value Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white/5 backdrop-blur-sm border border-white/5 p-6 rounded-3xl text-left hover:border-rose-500/30 transition-colors">
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

            <div className="bg-white/5 backdrop-blur-sm border border-white/5 p-6 rounded-3xl text-left hover:border-rose-500/30 transition-colors">
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

            <div className="bg-white/5 backdrop-blur-sm border border-white/5 p-6 rounded-3xl text-left hover:border-rose-500/30 transition-colors">
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

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="w-full sm:w-auto px-10 py-5 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl font-bold text-xl text-white hover:shadow-[0_0_30px_rgba(244,63,94,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-2xl flex items-center justify-center gap-3">
              Unlock Exclusive Auctions
            </button>
            <button className="w-full sm:w-auto px-10 py-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl font-bold text-xl text-slate-300 hover:bg-slate-800/50 transition-all">
              View Pricing Plans
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 hover:opacity-100 transition-opacity duration-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-slate-400" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                ISO 27001 SECURE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-slate-400" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                VERIFIED PARTNERS
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-400" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                AES-256 ENCRYPTED
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Overlay */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          {/* Modal Content */}
          <div
            className="bg-[#0a0f1a] border border-white/10 w-full max-w-3xl rounded-[32px] overflow-hidden shadow-3xl relative animate-[fadeIn_0.3s_ease-out,_zoomIn_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8 md:p-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center text-white">
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
                <button className="flex-1 px-8 py-4 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl font-bold text-white hover:shadow-[0_0_30px_rgba(244,63,94,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-lg">
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
      <footer className="relative z-10 py-10 border-t border-white/5 bg-black/40">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            © 2026 RULE 7 MEDIA. SECURE ENVIRONMENT.
          </p>
          <div className="flex gap-6 text-xs font-black uppercase tracking-widest text-slate-500">
            <a href="#" className="hover:text-rose-500 transition-colors">
              Security Policy
            </a>
            <a href="#" className="hover:text-rose-500 transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>

      {/* Keyframes Animation - Added as inline style for Tailwind */}
      <style>{`
        @keyframes shine {
          to {
            background-position: 200% center;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default SubscriptionlandingPage;
