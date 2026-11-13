import { useEffect, useState, useRef } from "react";
import { register } from "swiper/element/bundle";

import {
  Menu,
  ArrowRight,
  Truck,
  Gavel,
  Layers,
  Share2,
  TrendingDown,
  Facebook,
  Twitter,
  Instagram,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

import banner1 from "../assets/1.png";
import banner2 from "../assets/2.png";
import banner3 from "../assets/3.png";
import banner4 from "../assets/4.png";
import banner5 from "../assets/5.png";


const images = [banner5,banner1, banner2, banner3, banner4,];
register();

const LandingPage = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}

      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
          {/* Background blur elements */}
          <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-rose-600/20 rounded-full blur-[120px]"></div>

          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-widest uppercase text-blue-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Alternative Marketing Platforms
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent block">
                  Revolutionise Your Advertising
                </span>{" "}
                –{" "}
                <span className="bg-gradient-to-r from-blue-400 to-rose-400 bg-clip-text text-transparent">
                  The Collaborative Way
                </span>
              </h1>
              <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
                Boost your digital marketing ROI with innovative media buying.
                Turn your marketing spend into a partnership and unlock dramatic
                savings techniques.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white transition flex items-center gap-2 shadow-lg hover:shadow-blue-600/25"
                >
                  Get Started Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to={"/Cpm"}
                  className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition"
                >
                  See Savings
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-black flex items-center justify-center text-[10px] font-bold">
                    AD
                  </div>
                  <div className="w-10 h-10 rounded-full bg-rose-500 border-2 border-black flex items-center justify-center text-[10px] font-bold">
                    VO
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center text-[10px] font-bold">
                    SM
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  Cross-channel marketing optimisation for 500+ Global Partners
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="animate-float bg-white/5 backdrop-blur-lg rounded-3xl p-4 overflow-hidden shadow-2xl border border-white/10">
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center relative group overflow-hidden">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImage ? "opacity-100" : "opacity-0"
                        }`}
                    >
                      <img
                        src={img}
                        alt={`Banner ${index + 1}`}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </div>
                  ))}

                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImage(index)}
                        className={`transition-all duration-300 ${index === currentImage
                            ? "w-8 h-1.5 bg-blue-500 rounded-full"
                            : "w-1.5 h-1.5 bg-white/50 rounded-full hover:bg-white/80"
                          }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-blue-400 font-bold text-2xl">
                      Up to 96%
                    </div>
                    <div className="text-[10px] uppercase text-slate-500 tracking-tighter">
                      Marketing Cost Reduction
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-rose-400 font-bold text-2xl">
                      Viral
                    </div>
                    <div className="text-[10px] uppercase text-slate-500 tracking-tighter">
                      Targeted Reach
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-black/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-bold mb-4 text-white">
                The Collaborative Model
              </h2>
              <p className="text-slate-400">
                Data-driven marketing decisions that empower brand-safe media
                placements and direct audience targeting.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Gavel,
                  color: "blue",
                  title: "Cost-Effective Channels",
                  desc: "Advertisers post campaigns, and vehicle owners bid to represent the brand, ensuring budget-friendly marketing strategies at the local level.",
                },
                {
                  icon: Layers,
                  color: "purple",
                  title: "Quality Inventory",
                  desc: "Selected partners receive high-quality vinyl wraps. Their daily commute becomes your premium publisher partnership reaching high-intent areas.",
                },
                {
                  icon: Share2,
                  color: "rose",
                  title: "Viral Engagement",
                  desc: "Interactive ads and social sweepstakes turn every sighting into a digital touchpoint and authentic branding moment.",
                },
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className={`bg-white/5 backdrop-blur-lg p-8 rounded-3xl border-t-4 border-t-${item.color}-500 border border-white/10`}
                  >
                    <div
                      className={`w-12 h-12 bg-${item.color}-500/20 rounded-full flex items-center justify-center mb-6`}
                    >
                      <IconComponent
                        className={`w-6 h-6 text-${item.color}-400`}
                      />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-white">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Savings Section */}
        <section id="savings" className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-[3rem] p-8 md:p-16 border border-white/10 relative">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl font-bold mb-6 text-white">
                    Maximise Your{" "}
                    <span className="text-rose-500 italic">
                      Advertising ROI
                    </span>
                  </h2>
                  <p className="text-slate-400 mb-8 leading-relaxed">
                    Traditional digital and outdoor media costs are
                    skyrocketing. Rule 7 Media provides performance marketing
                    solutions with 80-96% measurable savings on CPM.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                      <TrendingDown className="w-6 h-6 text-emerald-400" />
                      <div>
                        <div className="font-bold text-white">
                          ROI-Driven Campaigns
                        </div>
                        <div className="text-sm text-slate-500">
                          Advertising efficiency tools for modern brands
                        </div>
                      </div>
                      <div className="ml-auto text-2xl font-bold text-emerald-400">
                        -80 to 96%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-slate-500 text-xs uppercase tracking-widest border-b border-white/10">
                        <th className="pb-4 font-medium">Media Type</th>
                        <th className="pb-4 font-medium">Estimated CPM</th>
                        <th className="pb-4 font-medium">Flexibility</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-white/5">
                        <td className="py-4 font-semibold text-slate-300">
                          Programmatic Advertising
                        </td>
                        <td className="py-4 text-slate-400">$20-30</td>
                        <td className="py-4 text-slate-400">Low</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-4 font-semibold text-slate-300">
                          Google Ads
                        </td>
                        <td className="py-4 text-slate-400">$38.40</td>
                        <td className="py-4 text-slate-400">Medium</td>
                      </tr>
                      <tr className="bg-blue-600/10 rounded-lg">
                        <td className="py-4 pl-2 font-bold text-blue-400">
                          Rule 7 CPM
                        </td>
                        <td className="py-4 font-bold text-blue-400">
                          $1.25-2.88
                        </td>
                        <td className="py-4 font-bold text-blue-400">
                          Extreme
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="p-12 rounded-[3rem] bg-gradient-to-br from-blue-600 to-rose-600 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                  backgroundSize: "40px 40px",
                }}
              ></div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Start Your ROI-Driven Ad Campaign
                </h2>
                <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                  Leverage first-party data campaigns and quality inventory
                  selection. Rule 7 Media is your partner in growth.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/BuyerMarketingExecutive">
                    <button className="bg-black text-white px-10 py-4 rounded-xl font-bold hover:bg-slate-900 transition shadow-xl">
                      I'm an Advertiser
                    </button>
                  </Link>
                  <Link to="/VehicleOwner">
                    <button className="bg-white text-black px-10 py-4 rounded-xl font-bold hover:bg-slate-100 transition shadow-xl">
                      I'm a Vehicle Owner
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
