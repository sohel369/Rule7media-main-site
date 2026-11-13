// AffiliatePage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AffillateImage from "../assets/Affillate.webp";
import {
  Zap,
  DollarSign,
  Megaphone,
  BarChart3,
  Plus,
  Minus,
} from "lucide-react";
import { useSelector } from "react-redux";
import Header from "../components/Header";
import Footer from "../components/Footer";
const AffiliatePage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const isLoggedIn = !!user;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const faqs = [
    {
      q: "How much can I earn as an affiliate?",
      a: "Your earning potential is limitless! We offer a competitive 22% commission for the first 12 months on any paid customer you refer from our plans.",
    },
    {
      q: "When and how will I get paid?",
      a: "Commissions are processed through our partner platform. Payouts occur monthly for active licenses that have passed our verification period.",
    },
    {
      q: "Do I need a website to join?",
      a: "Not necessarily. You can promote Rule 7 Media through social media, email, or other professional channels as long as you follow our guidelines.",
    },
    {
      q: "What is the cookie duration?",
      a: "Our tracking cookies last for 90 days. If your referral makes a purchase within that window, you get the credit.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* Navbar */}
      {/* <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "py-2 backdrop-blur-xl bg-black/40 border-b border-white/5"
            : "py-4 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-rose-600 rounded-lg flex items-center justify-center font-bold text-white italic text-xl">
              R7
            </div>
            <span className="text-xl font-bold tracking-tight">
              RULE 7 <span className="text-blue-500">MEDIA</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
           <Link to="/" className="hover:text-blue-400 transition-colors">
  Home
</Link>
            <a
              href="#benefits"
              className="hover:text-blue-400 transition-colors"
            >
              Benefits
            </a>
            <a href="#how-to" className="hover:text-blue-400 transition-colors">
              How it Works
            </a>
            <a href="#faq" className="hover:text-blue-400 transition-colors">
              FAQ
            </a>
           {!user && (
  <Link
    to="/register"
    className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
  >
    Instant Sign Up
  </Link>
)}
          </div>
        </div>
      </nav> */}
      {!isLoggedIn && <Header />}
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* You can add subtle grid background via pseudo-element or tailwind bg-[...] */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wider uppercase text-blue-400 mb-8">
            Affiliates Program
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-white bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]">
                  Earn with Rule 7 Media
                </span>

                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-rose-400">
                  With Every Recommendation
                </span>
              </h1>
              <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
                Do you love Rule 7 Media? Partner with us and earn money by
                promoting our innovative advertising solutions. We're looking
                for passionate individuals to join our mission.
              </p>
              <div className="flex flex-wrap gap-4">
               {!user && (
  <a
    href="https://www.refferq.com/"
    target="_blank"
    className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white transition-all flex items-center gap-2 shadow-lg shadow-blue-700/20 hover:shadow-blue-700/40 hover:scale-[1.02]"
  >
    Instant Sign Up
    <Zap className="w-5 h-5" />
  </a>
)}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-3 shadow-2xl animate-float">
              <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5 text-slate-500 italic font-medium">
              <img
  src={AffillateImage}
  alt="Affiliate Dashboard Preview"
  className="w-full h-full object-cover"
/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-24 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                Icon: DollarSign,
                title: "Rewarding Referrals",
                desc: "Earn 22% of all payments for the first 12 months for every new paid advertiser you refer — with no limits!",
              },
              {
                Icon: Megaphone,
                title: "Spread the Word",
                desc: "Share Rule 7 Media with your network and help brands revolutionize their advertising ROI.",
              },
              {
                Icon: BarChart3,
                title: "Transparent Tracking",
                desc: "Monitor your referrals and earnings in real-time with our intuitive partner dashboard.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 border-b-4 border-b-blue-600 hover:-translate-y-3 transition-transform duration-300"
              >
                <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 text-blue-400">
                  <item.Icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-to" className="py-24">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-rose-400">
            Start earning in 3 easy steps
          </h2>
        </div>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          {[
            {
              num: "01",
              title: "Share",
              desc: "Use your unique link on your channels. Access our best practices and promotional guides.",
            },
            {
              num: "02",
              title: "Track",
              desc: "Monitor your impact. Our dashboard shows you exactly how many referrals convert.",
            },
            {
              num: "03",
              title: "Earn",
              desc: "Receive 22% commission on all referral payments for the entire first year.",
            },
          ].map((step, i) => (
            <div
              key={i}
              className="relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <span className="absolute -top-9 left-8 text-7xl font-black text-white/5 select-none">
                {step.num}
              </span>
              <h3 className="text-2xl font-bold mb-4 text-blue-400">
                {step.title}
              </h3>
              <p className="text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-slate-950/30">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-12 text-center">
            Affiliate FAQ
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-lg">{faq.q}</span>
                  {openFaq === i ? (
                    <Minus className="text-blue-500" />
                  ) : (
                    <Plus className="text-blue-500" />
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-6 pt-0 text-slate-400 border-t border-white/5">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="p-12 md:p-16 rounded-[3rem] bg-gradient-to-br from-blue-600/10 to-rose-600/10 border border-white/10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10">
              Ready to Partner?
            </h2>
            <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto relative z-10">
              Join the Rule 7 Media affiliate network and turn your influence
              into revenue.
            </p>
           {!user ? (
  <a
    href="https://www.refferq.com/"
    target="_blank"
    rel="noopener noreferrer"
  >
    <button className="bg-white text-black px-12 py-5 rounded-xl font-bold text-lg hover:bg-slate-200 transition shadow-2xl relative z-10">
      Join the Program
    </button>
  </a>
) : (
  <a
    href="https://www.refferq.com/"
    target="_blank"
    rel="noopener noreferrer"
  >
    <button className="bg-white text-black px-12 py-5 rounded-xl font-bold text-lg hover:bg-slate-200 transition shadow-2xl relative z-10">
      Join the Program
    </button>
  </a>
)}
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="bg-black pt-20 pb-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-rose-600 rounded flex items-center justify-center font-bold text-white italic text-lg">
                  R7
                </div>
                <span className="text-lg font-bold">
                  RULE 7 <span className="text-blue-500">MEDIA</span>
                </span>
              </div>
              <p className="text-slate-500 max-w-sm">
                Maximizing advertising ROI through innovative Buying and Savings
                techniques.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3 text-slate-500 text-sm">
                <li>
                 <Link to="/privacy-policy" 
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms-conditions"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Contact</h4>
              <Link
                to="mailto:affiliates@rule7media.com"
                className="text-slate-500 text-sm hover:text-orange-500"
              >
                affiliates@rule7media.com
              </Link>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 text-center md:text-left text-xs text-slate-600">
            © {new Date().getFullYear()} Rule 7 Media. 6 Marina Promenade,
            Paradise Point, QLD, Australia.
          </div>
        </div>
      </footer> */}
      {!isLoggedIn && <Footer />}
    </div>
  );
};

export default AffiliatePage;
