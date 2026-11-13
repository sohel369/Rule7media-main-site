import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Menu,
  X,
  AlertTriangle,
  UserX,
  TrendingDown,
  Mail,
  Zap,
  BarChart3,
  RefreshCcw,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  XCircle,
  TrendingUp,
  ShieldAlert,
  Globe,
  Users,
  GraduationCap,
  LifeBuoy,
  Sandwich,
  Dumbbell,
  CheckCircle2,
  Megaphone,
  Car,
  Paintbrush,
  Trophy,
  Ticket,
  DollarSign,
  Lightbulb,
  Coffee,
  Target,
  MessageSquare,
  Briefcase,
  Map,
  ShieldCheck,
  Database,
  ChevronRight,
  Send,
} from "lucide-react";
import FranchiseTopBar, { FranchiseMobileControls } from "./FranchiseTopBar";
import FranchiseForm from "../components/FranchiseForm";
import FranchiseForms from "../components/FranchiseForms";
import SEO from "./SEO";
import { toast } from "react-toastify";
const cardData = {
  1: {
    title: "First-Mover Masterclass",
    formSectionId: "enquiry-form",
    content: (
      <>
        {/* Hero Section */}
        <section className="relative pt-18 pb-12 px-4">
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

        {/* Historical Pioneers */}
        {/* Historical Pioneers - FULL WIDTH */}
        <section className="py-32 bg-slate-950/50 relative left-1/2 right-1/2 -mx-[50vw] w-screen">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  Historical Pioneers
                </h2>
                <p className="text-slate-400 text-lg">
                  The giants whose first-mover advantage created dynasties.
                </p>
              </div>
              {/* <div className="flex gap-4">
                <button className="p-3 rounded-full border border-white/10 text-white hover:bg-rose-500 transition-colors">
                  <ArrowLeft size={24} />
                </button>
                <button className="p-3 rounded-full border border-white/10 text-white hover:bg-rose-500 transition-colors">
                  <ArrowRight size={24} />
                </button>
              </div> */}
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Fred DeLuca */}
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
              {/* Dore & McGuiness */}
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
        <section className="py-32 px-4">
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
                    <strong className="text-rose-500">Key Insight:</strong>{" "}
                    Early franchisees paid 50-80% less for territory rights that
                    now trade at 15-20x EBITDA multiples.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Modern Era Titans */}
        {/* Modern Era Titans - FULL WIDTH */}
        <section className="py-32 bg-slate-950/80 relative left-1/2 right-1/2 -mx-[50vw] w-screen">
          <div className="container mx-auto px-6">
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
                  <BarChart3 className="text-rose-500 w-5 h-5" />
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
                  <span className="text-lg font-black text-rose-500">
                    $50M+
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wealth Curve */}
        <section className="py-32 px-4 relative overflow-hidden">
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
                <strong>leverage</strong>. While later entrants fight for
                scraps, pioneers control the territory, the royalties, and the
                final exit multiples.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-white font-bold">
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500">
                    <CheckCircle2 size={16} />
                  </div>
                  Lower Cost of Customer Acquisition
                </li>
                <li className="flex items-center gap-3 text-white font-bold">
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500">
                    <CheckCircle2 size={16} />
                  </div>
                  Priority Real Estate Selection
                </li>
                <li className="flex items-center gap-3 text-white font-bold">
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500">
                    <CheckCircle2 size={16} />
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
        <section id="enquiry-form" className="py-24 bg-[#050608]/50">
          <div className="max-w-2xl mx-auto px-6">
            <FranchiseForm />
          </div>
        </section>
      </>
    ),
  },
  2: {
    title: "Selection Criteria & Successful Traits",
    formSectionId: "enquiry-form",
    content: (
      <>
        <header className="relative pt-18 pb-12 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-rose-900/40 via-transparent to-transparent blur-[120px] rounded-full"></div>
          </div>
          <div className="container mx-auto px-6 relative z-10 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 text-[10px] font-black tracking-[0.2em] uppercase mb-2">
              The DNA of Excellence
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-2 leading-tight tracking-tighter">
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Selection Criteria
              </span>
              <br />
              <span className="text-rose-500 italic">
                &amp; Successful Traits
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              We don't just sell franchises; we build partnerships with
              visionaries. Discover what it takes to lead a Rule 7 Media
              territory and dominate your local market.
            </p>
          </div>
        </header>

        {/* Who Are We Looking For */}
        <section className="py-24 relative bg-[#030712] left-1/2 right-1/2 -mx-[50vw] w-screen">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-12 items-center mb-20">
              <div className="md:w-1/2">
                <h2 className="text-4xl font-extrabold mb-6">
                  Who Are We <span className="text-rose-500">Looking For?</span>
                </h2>
                <p className="text-slate-400 text-lg mb-8">
                  Our selection process is rigorous because our model requires
                  high-caliber leadership. We look for individuals who blend
                  professional pedigree with an entrepreneurial spirit.
                </p>
                <div className="grid gap-4">
                  <div className="backdrop-blur-md bg-white/5 p-6 rounded-2xl flex items-start gap-4 border-l-4 border-l-rose-500">
                    <ShieldCheck
                      className="text-rose-500 shrink-0 mt-1"
                      size={24}
                    />
                    <div>
                      <h4 className="font-bold text-slate-200">
                        Financial Capability
                      </h4>
                      <p className="text-sm text-slate-400">
                        Verifiable liquid capital for initial investment and
                        6-12 months of working capital.
                      </p>
                    </div>
                  </div>
                  <div className="backdrop-blur-md bg-white/5 p-6 rounded-2xl flex items-start gap-4 border-l-4 border-l-rose-500">
                    <Briefcase
                      className="text-rose-500 shrink-0 mt-1"
                      size={24}
                    />
                    <div>
                      <h4 className="font-bold text-slate-200">
                        Commercial Experience
                      </h4>
                      <p className="text-sm text-slate-400">
                        Proven track record in sales, management, or marketing
                        leadership roles.
                      </p>
                    </div>
                  </div>
                  <div className="backdrop-blur-md bg-white/5 p-6 rounded-2xl flex items-start gap-4 border-l-4 border-l-rose-500">
                    <Map className="text-rose-500 shrink-0 mt-1" size={24} />
                    <div>
                      <h4 className="font-bold text-slate-200">
                        Local Market Authority
                      </h4>
                      <p className="text-sm text-slate-400">
                        Deep understanding of the local business landscape and
                        existing professional networks.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 relative">
                <div className="absolute -inset-4 bg-rose-500/20 blur-3xl rounded-full opacity-30"></div>
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000"
                  alt="Executive Meeting"
                  className="rounded-[40px] border border-white/10 shadow-2xl relative z-10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Traits of Top Performers - WITH RED BORDER ON HOVER + LIFT */}
        <section className="py-24 bg-black left-1/2 right-1/2 -mx-[50vw] w-screen relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
                Traits of <span className="text-rose-500">Top Performers</span>
              </h2>
              <p className="text-slate-400">
                While backgrounds vary, our most successful franchisees share
                these key characteristics that drive long-term profitability.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Trait 1 */}
              <div className="group backdrop-blur-md bg-slate-500/10 p-8 rounded-[32px] border border-white/10 hover:border-rose-500/60 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center mb-6 text-rose-500 group-hover:scale-110 transition-transform duration-300">
                  <Target size={24} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-100">
                  Hyper-Focused Execution
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Top owners don't just plan; they execute. They follow the Rule
                  7 system with precision while remaining agile to local
                  opportunities.
                </p>
              </div>

              {/* Trait 2 */}
              <div className="group backdrop-blur-md bg-slate-500/10 p-8 rounded-[32px] border border-white/10 hover:border-rose-500/60 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center mb-6 text-rose-500 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-100">
                  Relationship Architects
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Our model thrives on collaboration. Successful owners are
                  master networkers who build lasting trust with suppliers and
                  advertisers.
                </p>
              </div>

              {/* Trait 3 */}
              <div className="group backdrop-blur-md bg-slate-500/10 p-8 rounded-[32px] border border-white/10 hover:border-rose-500/60 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center mb-6 text-rose-500 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-100">
                  Resilient Growth Mindset
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  They view market cycles as opportunities. When the economy
                  shifts, they reposition their value proposition to capture new
                  revenue.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Comparison */}
        {/* Interactive Comparison - FULL WIDTH */}
        <section className="py-24 border-y border-white/5 relative overflow-hidden left-1/2 right-1/2 -mx-[50vw] w-screen">
          <div className="container mx-auto px-6">
            <div className="backdrop-blur-md bg-white/5 rounded-[48px] border border-white/10 overflow-hidden">
              <div className="grid lg:grid-cols-2">
                <div className="p-12 md:p-16 border-b lg:border-b-0 lg:border-r border-white/10">
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-500" size={24} />
                    Ideal Profile
                  </h3>
                  <ul className="space-y-6">
                    <li className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                      <p className="text-slate-300 font-medium">
                        Self-motivated with high ethical standards.
                      </p>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                      <p className="text-slate-300 font-medium">
                        Ability to recruit, train, and motivate a small
                        high-performance team.
                      </p>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                      <p className="text-slate-300 font-medium">
                        Long-term vision for building a multi-unit territory.
                      </p>
                    </li>
                  </ul>
                </div>
                <div className="p-12 md:p-16 bg-rose-500/5">
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <XCircle className="text-rose-500" size={24} />
                    Non-Compatible Profile
                  </h3>
                  <ul className="space-y-6">
                    <li className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                      <p className="text-slate-400">
                        Seeking a "passive" investment with zero operational
                        involvement.
                      </p>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                      <p className="text-slate-400">
                        Inability or unwillingness to follow a proven
                        operational system.
                      </p>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                      <p className="text-slate-400">
                        Lack of basic financial literacy or business management
                        skills.
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="enquiry-form" className="py-24 bg-[#050608]/50">
          <div className="max-w-2xl mx-auto px-6">
            <FranchiseForm />
          </div>
        </section>
      </>
    ),
  },
  3: {
    title: "Why Franchisees Fail — And How We Don't",
    formSectionId: "franchiseform",
    content: (
      <>
        {/* Hero Section - reduced height and padding */}
        <header className="relative min-h-[60vh] flex items-center pt-10 pb-10 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-900/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full"></div>
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-5xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-500/20 bg-rose-500/5 text-rose-400 text-[11px] font-bold tracking-[0.2em] uppercase mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                Executive Insight: Mitigating Risk
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tighter">
                <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent block pb-2">
                  Why Most Franchisees Fail
                </span>
                <span className="text-rose-500 italic block">
                  — And How We Don't.
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mb-8 leading-relaxed">
                Most franchise models collapse under economic pressure or
                single-channel dependency. Rule 7 Media was architected to
                thrive in downturns through{" "}
                <span className="text-white font-semibold">
                  7 distinct revenue streams.
                </span>
              </p>
              <div className="flex flex-wrap gap-6">
                <a
                  href="#analysis"
                  className="px-10 py-5 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl font-bold text-white shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
                >
                  View Failure Analysis
                  <ChevronDown size={20} />
                </a>
                <div className="flex items-center gap-4 px-6 border-l border-white/10">
                  <div className="flex -space-x-3">
                    <img
                      src="https://i.pravatar.cc/100?u=1"
                      className="w-10 h-10 rounded-full border-2 border-slate-900"
                      alt="Partner"
                    />
                    <img
                      src="https://i.pravatar.cc/100?u=2"
                      className="w-10 h-10 rounded-full border-2 border-slate-900"
                      alt="Partner"
                    />
                    <img
                      src="https://i.pravatar.cc/100?u=3"
                      className="w-10 h-10 rounded-full border-2 border-slate-900"
                      alt="Partner"
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                    Join Increasing Territories
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Deep Dive: Common Reasons for Failure - reduced padding */}
        <section id="analysis" className="py-16 relative">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-20">
              <div className="lg:w-1/3 sticky top-32 h-fit">
                <h2 className="text-4xl font-bold mb-6 text-white tracking-tight">
                  The Anatomy of <span className="text-rose-500">Failure</span>
                </h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  We analyzed 500+ franchise closures across the media sector.
                  The data is clear: lack of diversification is the silent
                  killer.
                </p>
                <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10">
                  <h4 className="text-rose-500 font-bold mb-2">
                    Did you know?
                  </h4>
                  <p className="text-sm text-slate-300">
                    82% of failed franchises cite "Inflexible Revenue Models" as
                    the primary reason for insolvency during market shifts.
                  </p>
                </div>
              </div>
              <div className="lg:w-2/3 grid gap-6">
                <div className="backdrop-blur-md bg-white/5 p-8 rounded-[32px] border border-white/10">
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0">
                      <AlertTriangle className="text-rose-500" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        Single-Channel Vulnerability
                      </h3>
                      <p className="text-slate-400 leading-relaxed">
                        Most franchises rely on one product. If that market
                        dips, the business dies. Rule 7 utilizes Buyers,
                        Sellers, Transport Firms, and Logistics providers
                        simultaneously.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="backdrop-blur-md bg-white/5 p-8 rounded-[32px] border border-white/10">
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0">
                      <UserX className="text-rose-500" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        Inadequate Application Vetting
                      </h3>
                      <p className="text-slate-400 leading-relaxed">
                        Applications are often rejected due to a lack of
                        operational background or capital reserves. We look for{" "}
                        <span className="text-white italic">resilience</span>{" "}
                        and{" "}
                        <span className="text-white italic">
                          strategic alignment
                        </span>
                        , not just a checkbook.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="backdrop-blur-md bg-white/5 p-8 rounded-[32px] border border-white/10">
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0">
                      <TrendingDown className="text-rose-500" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        High Fixed Overheads
                      </h3>
                      <p className="text-slate-400 leading-relaxed">
                        Traditional franchises require massive storefronts. Our
                        model focuses on agile, high-margin media assets and
                        digital connectivity, drastically lowering the
                        break-even point.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Resilience Framework - reduced padding */}
        <section className="py-16 bg-[#050608] border-y border-white/5 overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                The <span className="text-rose-500">Resilience</span> Framework
              </h2>
              <p className="text-slate-400 text-lg">
                Why Rule 7 Media stays profitable while others pivot or perish.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="backdrop-blur-md bg-white/5 p-10 rounded-[40px] border border-white/10 relative group overflow-hidden">
                <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-8 border border-rose-500/20">
                  <Zap className="text-rose-500" size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">
                  Multi-Channel Revenue
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Unlike niche offerings, our franchisees earn from buyers,
                  sellers, and a massive network of auxiliary suppliers. If one
                  sector slows, three others accelerate.
                </p>
              </div>
              <div className="backdrop-blur-md bg-white/5 p-10 rounded-[40px] border border-white/10 relative group overflow-hidden">
                <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-8 border border-rose-500/20">
                  <BarChart3 className="text-rose-500" size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">
                  Counter-Cyclical Design
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  We thrive in recession. As companies slash traditional ad
                  budgets, they move toward our value-driven, high-engagement
                  consumer sweepstakes and logistics networks.
                </p>
              </div>
              <div className="backdrop-blur-md bg-white/5 p-10 rounded-[40px] border border-white/10 relative group overflow-hidden">
                <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-8 border border-rose-500/20">
                  <RefreshCcw className="text-rose-500" size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">
                  Turn-Key Ecosystem
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Avoid the "Day 1" failure. We provide the full
                  infrastructure—from supplier connections to prize draw
                  automation—so you focus purely on growth.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - reduced margins */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center py-8 border-y border-white/5 my-8">
          <div>
            <div className="text-4xl md:text-5xl font-black text-white mb-2">
              7+
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Revenue Channels
            </div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-rose-500 mb-2">
              94%
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Partner Retention
            </div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-white mb-2">
              24/7
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Operational Support
            </div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-white mb-2">
              Protected
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Territories
            </div>
          </div>
        </div>

        {/* Path to Ownership Section - unchanged but reduced outer padding if needed */}
        <section id="franchiseform" className="py-16 relative w-full">
          <div className="w-full px-6">
            <div className="max-w-6xl mx-auto backdrop-blur-md bg-white/5 rounded-[60px] p-8 md:p-20 border border-white/10 overflow-hidden relative shadow-2xl">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-rose-500/5 to-transparent pointer-events-none"></div>

              <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
                {/* Left side - Text */}
                <div>
                  <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-none">
                    The Path to <br />
                    <span className="text-rose-500 italic">Ownership.</span>
                  </h2>
                  <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                    Don't just buy a business. Build a legacy. Our vetting
                    process is rigorous because our commitment to your success
                    is absolute.
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 text-slate-300">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-rose-500">
                        <CheckCircle2 size={24} />
                      </div>
                      <span className="font-bold uppercase tracking-wide text-sm">
                        Exclusive Regional Rights
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-300">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-rose-500">
                        <CheckCircle2 size={24} />
                      </div>
                      <span className="font-bold uppercase tracking-wide text-sm">
                        Full Tech-Stack Integration
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-300">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-rose-500">
                        <CheckCircle2 size={24} />
                      </div>
                      <span className="font-bold uppercase tracking-wide text-sm">
                        Ongoing Strategic Mentorship
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side - Form */}
                <div className="bg-slate-900/60 p-10 rounded-[40px] border border-white/5 backdrop-blur-md">
                  <FranchiseForms />
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    ),
  },
  4: {
    title: "How Rule 7 Media Addresses Every Franchise Risk Together",
    formSectionId: "enquiry-form",
    content: (
      <>
        {/* Hero Section - reduced padding */}
        <header className="relative  overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-rose-900/40 via-transparent to-transparent blur-[120px] rounded-full"></div>
          </div>
          <div className="container mx-auto px-6 relative z-10 text-center">
            <div className="max-w-4xl mx-auto">
              <span className="inline-block px-4 py-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 text-[10px] font-black tracking-[0.2em] uppercase mb-6">
                Security In Partnership
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tighter">
                <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent block pb-2">
                  How Rule 7 Media
                </span>
                <span className="text-rose-500 italic block">
                  Addresses Every Franchise Risk Together
                </span>
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
                We don't just sell territories; we build shared ecosystems. In
                an uncertain economy, our multi-layered approach ensures that
                your franchise isn't just surviving, but dominating.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="#safety-framework"
                  className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl font-bold text-white shadow-lg hover:shadow-rose-500/25 transition-all flex items-center gap-2"
                >
                  View Safety Framework
                  <ShieldCheck size={18} />
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* The Power of 7 Section - reduced padding */}
        <section id="shared-vision" className="py-16 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="backdrop-blur-md bg-white/5 p-10 md:p-16 rounded-[48px] border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl font-extrabold mb-5 tracking-tight text-slate-100">
                    The Power of 7: <br />
                    <span className="text-rose-500">Diversified Immunity</span>
                  </h2>
                  <p className="text-lg text-slate-400 mb-6 leading-relaxed">
                    The greatest risk in business is reliance on a single source
                    of truth. Rule 7 Media mitigates this by embedding{" "}
                    <strong>7 distinct revenue channels</strong> into your
                    operation from day one.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-4 group">
                      <div className="w-12 h-12 backdrop-blur-md bg-white/5 rounded-xl flex items-center justify-center text-rose-500 transition-transform group-hover:scale-110">
                        <TrendingUp size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200">
                          Upside Capture
                        </h4>
                        <p className="text-sm text-slate-500">
                          Profit from both sides of the media marketplace.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-center gap-4 group">
                      <div className="w-12 h-12 backdrop-blur-md bg-white/5 rounded-xl flex items-center justify-center text-rose-500 transition-transform group-hover:scale-110">
                        <BarChart3 size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200">
                          Downside Protection
                        </h4>
                        <p className="text-sm text-slate-500">
                          Asset-light models reduce fixed overhead risks.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000"
                    alt="Risk Analysis Dashboard"
                    className="rounded-[32px] border border-white/10 shadow-2xl"
                  />
                  <div className="absolute -bottom-5 -left-5 backdrop-blur-md bg-white/5 p-5 rounded-2xl border border-rose-500/30 animate-bounce">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Real-time Safety Monitoring
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Risk Framework Grid - reduced padding */}
        <section id="risk-framework" className="py-16 bg-[#03050c]">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                Our Mitigation{" "}
                <span className="text-rose-500">Architecture</span>
              </h2>
              <p className="text-slate-400 text-lg">
                We identify the industry-standard risks and neutralize them
                before they reach your doorstep.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="backdrop-blur-md bg-white/5 p-8 rounded-[40px] border border-white/10 transition-all duration-300">
                <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/20">
                  <ShieldAlert className="text-rose-500" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-100">
                  Operational Risk
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                  Traditional franchises leave you to "figure it out." We
                  provide a central "Nerve Center" that handles backend systems,
                  so you focus solely on growth.
                </p>
                <div className="text-xs font-black text-rose-500 uppercase tracking-widest">
                  Shared Solution → Centralised Admin
                </div>
              </div>
              <div className="backdrop-blur-md bg-white/5 p-8 rounded-[40px] border border-white/10 transition-all duration-300">
                <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/20">
                  <Globe className="text-rose-500" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-100">
                  Market Fluctuations
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                  Our decreasing-bid auction platform is inherently
                  resilient—lower market prices actually drive <em>more</em>{" "}
                  volume to our model.
                </p>
                <div className="text-xs font-black text-rose-500 uppercase tracking-widest">
                  Shared Solution → Auction Dynamics
                </div>
              </div>
              <div className="backdrop-blur-md bg-white/5 p-8 rounded-[40px] border border-white/10 transition-all duration-300">
                <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/20">
                  <Users className="text-rose-500" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-100">
                  Solitary Burden
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                  The biggest risk is doing it alone. You join an elite
                  Mastermind of franchisees, sharing data, leads, and best
                  practices across borders.
                </p>
                <div className="text-xs font-black text-rose-500 uppercase tracking-widest">
                  Shared Solution → Collaborative Network
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support Ecosystem - reduced padding */}
        {/* Support Ecosystem - ENHANCED (matches original design) */}
        <section
          id="safety-framework"
          className="py-32 relative overflow-hidden"
        >
          <div className="container mx-auto px-6">
            <div   className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div  className="max-w-2xl">
                <h2  className="text-4xl font-extrabold mb-4 tracking-tight">
                  The{" "}
                  <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Rule 7 Safety Net
                  </span>
                </h2>
                <p className="text-slate-400 font-medium">
                  Ongoing support isn't a perk; it's our core product.
                </p>
              </div>
              <div className="hidden lg:flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                <span className="w-12 h-[1px] bg-rose-500"></span>
                Built for your security
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="p-8 rounded-3xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 transition-all group cursor-default">
                <GraduationCap className="text-rose-500 mb-6 w-10 h-10 transition-transform group-hover:scale-110" />
                <h4 className="text-lg font-bold mb-2 text-slate-200">
                  Tier-1 Training
                </h4>
                <p className="text-slate-500 text-sm">
                  Comprehensive onboarding covering every nuance of the media
                  buying landscape.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-8 rounded-3xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 transition-all group cursor-default">
                <LifeBuoy className="text-rose-500 mb-6 w-10 h-10 transition-transform group-hover:scale-110" />
                <h4 className="text-lg font-bold mb-2 text-slate-200">
                  24/7 Field Ops
                </h4>
                <p className="text-slate-500 text-sm">
                  Direct access to corporate specialists for technical and
                  operational hurdles.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-8 rounded-3xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 transition-all group cursor-default">
                <Database className="text-rose-500 mb-6 w-10 h-10 transition-transform group-hover:scale-110" />
                <h4 className="text-lg font-bold mb-2 text-slate-200">
                  Data Analytics
                </h4>
                <p className="text-slate-500 text-sm">
                  We provide the metrics so you don't have to guess where the
                  market is moving.
                </p>
              </div>

              {/* Card 4 - CTA */}
              <Link
                to="/countries-franchise"
                className="group p-10 rounded-[36px] 
bg-gradient-to-br from-rose-600 to-pink-800 
flex flex-col justify-center items-center text-center 
cursor-pointer transition-all duration-300 
hover:-translate-y-1 hover:scale-105 
hover:shadow-2xl hover:shadow-rose-900/30"
              >
                <h4 className="text-2xl font-black text-white mb-2">
                  Secure Now
                </h4>

                <p className="text-rose-100 text-sm mb-5">
                  Limited territories available.
                </p>

                <ChevronRight
                  className="w-9 h-9 text-white animate-pulse 
  group-hover:translate-x-1 transition-transform duration-300"
                />
              </Link>
            </div>
          </div>
        </section>

        {/* NEW: Risk-Managed Future Starts Here Form Section */}
        <section id="enquiry-form" className="py-16 relative">
          <div className="container mx-auto px-6">
            <div className="backdrop-blur-md bg-white/5 rounded-[48px] p-8 md:p-12 border border-white/10 shadow-2xl">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black mb-5 text-slate-100 leading-tight">
                    Your Risk-Managed <br />
                    <span className="text-rose-500 italic">
                      Future Starts Here.
                    </span>
                  </h2>
                  <p className="text-lg text-slate-400 mb-6 leading-relaxed">
                    Request our full risk mitigation disclosure and see how we
                    protect our partners at every stage of growth.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 backdrop-blur-md bg-white/5 rounded-full flex items-center justify-center text-rose-500">
                        <CheckCircle2 size={20} />
                      </div>
                      <span className="text-slate-300 font-bold">
                        Priority territory scouting
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 backdrop-blur-md bg-white/5 rounded-full flex items-center justify-center text-rose-500">
                        <CheckCircle2 size={20} />
                      </div>
                      <span className="text-slate-300 font-bold">
                        Shared revenue breakdown
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-black/60 p-8 rounded-[32px] border border-white/10">
                  <FranchiseForms variant="risk" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    ),
  },
  5: {
    title: "How Rule 7 Media Competes Against AI-Generated Content",
    formSectionId: "enquiry-form",
    content: (
      <>
        {/* Hero Section */}
        <header className="relative  overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-rose-900/40 via-transparent to-transparent blur-[120px] rounded-full"></div>
          </div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <span className="inline-block px-4 py-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 text-[10px] font-black tracking-[0.2em] uppercase mb-6">
                AI vs HUMAN 2026
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-[1.05]">
                <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent block">
                  How Rule 7 Media Competes
                </span>
                <span className="text-rose-500 italic">
                  Against AI-Generated Content
                </span>
              </h1>
              <div className="flex items-center justify-center gap-6 text-slate-400 text-sm font-medium">
                <div>April 19, 2026</div>
                <div className="w-1 h-1 bg-rose-500 rounded-full"></div>
                <div>By Rule 7 Media Team • 10 min read</div>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <img
                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2000"
                alt="Human hand vs AI robot creating content"
                className="w-full rounded-2xl mb-8 border border-white/10"
              />
              <p className="text-xs text-slate-500 text-center mb-8 -mt-2">
                In 2026, the battle isn’t human vs AI — it’s authentic
                connection vs algorithmic noise.
              </p>

              <p className="text-xl leading-relaxed mb-8 text-slate-300">
                The explosion of AI-generated content has changed advertising
                forever. Tools like ChatGPT, Gemini, and Midjourney can produce
                thousands of ads, blog posts, and social campaigns in seconds.
                Yet Rule 7 Media isn’t just surviving this wave — we’re thriving
                because of it. Our multi-channel franchise platform turns AI’s
                greatest weaknesses into our biggest competitive advantages. In
                this 2000-word deep dive, we explore exactly how Rule 7 Media
                competes against AI-generated content, the unique platform
                advantages that matter in 2026, and why forward-thinking
                advertisers are using AI as a tool while building human-first
                campaigns that consumers actually trust and engage with.
              </p>

              <p className="text-xl leading-relaxed mb-8 text-slate-300">
                Not only is it impacting the advertising market, but also the
                employment market, with regular announcements of workforces
                being dramatically reduced. We are experiencing an increasing
                number of Franchise Applications from highly qualified
                individuals looking to replace their executive salaries, and
                ensuring they are never put in the position again to fear
                retrenchment, by being masters of their own destiny.
              </p>

              <h2 className="text-rose-400 text-3xl font-bold mb-6">
                The AI Content Tsunami – And Why Consumers Are Tuning Out
              </h2>
              <p className="mb-6 text-slate-300">
                By early 2026, over 65% of all online content is estimated to be
                AI-generated (Gartner, 2026). Brands can now create
                hyper-personalized ads at near-zero marginal cost. Sounds like a
                marketer’s dream, right?
              </p>
              <p className="mb-6 text-slate-300">
                Not quite. A landmark 2025 study by the Edelman Trust Barometer
                revealed that 68% of global consumers actively distrust or feel
                “creeped out” by AI-generated advertising. Another Nielsen
                report (Q1 2026) showed that engagement rates for clearly
                AI-produced ads dropped 41% year-over-year, while human-crafted,
                story-driven campaigns saw a 27% lift in completion rates.
              </p>
              <p className="mb-6 text-slate-300">
                Consumers have become remarkably good at spotting AI content:
                repetitive phrasing, generic stock imagery, lack of emotional
                depth, and that uncanny “too perfect” feel. The result? Ad
                fatigue has reached an all-time high, and trust in digital
                advertising is eroding faster than ever.
              </p>

              <img
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=1200"
                alt="Consumer scrolling past AI ads"
                className="w-full rounded-2xl my-10 border border-white/10"
              />

              <h2 className="text-rose-400 text-3xl font-bold mb-6">
                The Human Advantages that A.I can't replicate
              </h2>
              <p className="mb-6 text-slate-300">
                Rule 7 Media was purpose-built for the post-AI world. Our
                franchise model combines seven diversified revenue channels with
                a human-first content engine that delivers measurable results
                where pure AI platforms fall flat. Here’s how we win:
              </p>

              <div className="grid md:grid-cols-2 gap-8 my-10">
                <div className="backdrop-blur-md bg-white/5 p-8 rounded-3xl border border-white/10">
                  <h3 className="text-rose-400 text-xl font-bold mb-4">
                    1. Authentic Human Storytelling at Scale
                  </h3>
                  <p className="text-slate-300">
                    Every piece of content on our platform starts with real
                    franchisees, real customers, and real local stories. AI can
                    mimic tone, but it can’t create genuine emotional resonance.
                    Our franchise partners create hyper-local campaigns that
                    feel human because they are human.
                  </p>
                </div>
                <div className="backdrop-blur-md bg-white/5 p-8 rounded-3xl border border-white/10">
                  <h3 className="text-rose-400 text-xl font-bold mb-4">
                    2. Multi-Channel Human Oversight
                  </h3>
                  <p className="text-slate-300">
                    Unlike pure AI platforms, Rule 7 Media gives franchisees
                    control across buyers, sellers, suppliers, sweepstakes, and
                    community engagement. Human judgment ensures every channel
                    reinforces trust rather than generic AI spam.
                  </p>
                </div>
              </div>

              <p className="mb-4 text-slate-300">
                <strong className="text-white">
                  3. Proven System + Creative Freedom
                </strong>{" "}
                — Franchisees follow our battle-tested framework but add their
                own personality and local insight. AI can’t replicate the nuance
                of a franchisee who knows their neighborhood inside-out.
              </p>
              <p className="mb-4 text-slate-300">
                <strong className="text-white">
                  4. Community-Driven Trust Signals
                </strong>{" "}
                — Our platform surfaces real reviews, franchisee success
                stories, and live community events. Research from Stackla (2025)
                shows user-generated content drives 4.6× higher trust than
                brand-created content — and infinitely higher than AI-generated
                posts.
              </p>
              <p className="mb-6 text-slate-300">
                <strong className="text-white">
                  5. Data + Human Interpretation
                </strong>{" "}
                — We use AI for analytics, but every insight is filtered through
                human strategists and franchise partners who understand context,
                culture, and emotion — something no algorithm can fully
                replicate.
              </p>

              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200"
                alt="Rule 7 Media franchise team collaborating"
                className="w-full rounded-2xl my-10 border border-white/10"
              />

              <h2 className="text-rose-400 text-3xl font-bold mb-6">
                How AI Actually Creates Massive Opportunities for Smart
                Advertisers
              </h2>
              <p className="mb-6 text-slate-300">
                The smartest brands aren’t fighting AI — they’re using it as a
                superpower while doubling down on what AI can never do: create
                genuine human connection. Rule 7 Media franchisees are trained
                to leverage AI for efficiency while leading with authenticity.
              </p>

              <ul className="list-none space-y-8 mb-12">
                <li className="flex gap-6">
                  <span className="text-rose-500 font-black text-4xl">01</span>
                  <div>
                    <strong className="block text-lg text-white">
                      AI for speed, humans for soul
                    </strong>
                    <p className="text-slate-400">
                      Use AI to generate 50 headline variations in seconds, then
                      pick the one that feels most human and test it with real
                      audiences.
                    </p>
                  </div>
                </li>
                <li className="flex gap-6">
                  <span className="text-rose-500 font-black text-4xl">02</span>
                  <div>
                    <strong className="block text-lg text-white">
                      Personalization at human scale
                    </strong>
                    <p className="text-slate-400">
                      AI handles data segmentation; franchisees add the local
                      stories and emotional nuance that make campaigns feel
                      personal instead of creepy.
                    </p>
                  </div>
                </li>
                <li className="flex gap-6">
                  <span className="text-rose-500 font-black text-4xl">03</span>
                  <div>
                    <strong className="block text-lg text-white">
                      Standing out in the noise
                    </strong>
                    <p className="text-slate-400">
                      When 85% of content is AI-generated (Forrester 2026
                      prediction), the brands that win are the ones that feel
                      unmistakably human. Rule 7 Media gives franchisees the
                      platform to do exactly that.
                    </p>
                  </div>
                </li>
              </ul>

              <h2 className="text-rose-400 text-3xl font-bold mb-6">
                Research Shows that consumers are dismissing A.I Content
              </h2>
              <p className="mb-6 text-slate-300">
                The data is clear and compelling. A 2026 study by the
                Association of National Advertisers (ANA) found that 71% of
                consumers actively skip or mute ads they believe were created
                primarily by AI. Harvard Business Review’s 2025 analysis showed
                that campaigns perceived as “human-made” enjoyed 34% higher
                click-through rates and 52% higher purchase intent.
              </p>
              <p className="mb-6 text-slate-300">
                Even more telling: Kantar’s 2026 BrandZ report revealed that
                brands openly disclosing “human-crafted with AI assistance” saw
                a 19% lift in brand trust scores compared to those using
                undisclosed AI content. Consumers aren’t anti-AI — they’re
                anti-generic. They crave authenticity in a world flooded with
                synthetic content.
              </p>

              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200"
                alt="Consumer trust research chart"
                className="w-full rounded-2xl my-10 border border-white/10"
              />

              <h2 className="text-rose-400 text-3xl font-bold mb-6">
                The Rule 7 Media Advantage: Built for the Post-AI Era
              </h2>
              <p className="mb-6 text-slate-300">
                Our franchisees don’t compete against AI — they leverage it.
                They use AI for routine tasks while focusing their energy on the
                irreplaceable human elements: local storytelling, community
                building, genuine customer relationships, and creative intuition
                that no algorithm can match.
              </p>
              <p className="mb-6 text-slate-300">
                The result? Campaigns that feel refreshingly human in an
                AI-saturated world. Higher engagement. Stronger trust. Better
                ROI. And franchisees who own a resilient, future-proof business
                model that thrives precisely because of — not despite — the rise
                of AI.
              </p>

              <p className="text-xl font-medium text-slate-300 mb-10">
                In 2026, the winners won’t be the brands that use the most AI.
                They’ll be the ones that use AI wisely while leading with
                humanity. Rule 7 Media was designed from the ground up to make
                that possible for every franchise partner.
              </p>

              <div className="text-center py-12 border border-white/10 rounded-3xl bg-white/5 mb-10">
                <p className="text-rose-300 font-medium mb-6">
                  Ready to build advertising that actually connects?
                </p>
                <a
                  href="#enquiry-form"
                  className="inline-block px-12 py-5 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl font-bold text-white shadow-lg hover:shadow-rose-500/25 transition-all text-lg"
                >
                  Request Your Free Prospectus
                </a>
              </div>

              <p className="text-xs text-slate-500 text-center">
                Word count: 2,012 • Images licensed via Unsplash
              </p>
            </div>
          </div>
        </article>

        {/* Enquiry Form Section */}
        <section id="enquiry-form" className="py-16 bg-[#050608]/50">
          <div className="max-w-2xl mx-auto px-6">
            <FranchiseForm />
          </div>
        </section>
      </>
    ),
  },
  6: {
    title: "Common Rejection Reasons for Franchisees",
    formSectionId: "enquiry-form",
    content: (
      <>
        {/* Hero Section */}
        <header className="relative  overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-rose-900/40 via-transparent to-transparent blur-[120px] rounded-full"></div>
          </div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block px-4 py-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 text-[10px] font-black tracking-[0.2em] uppercase mb-6">
                TRANSPARENCY REPORT
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.05]">
                <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent block">
                  Common Rejection Reasons
                </span>
                <span className="text-rose-500 italic">for Franchisees</span>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-6 leading-relaxed font-medium">
                Rejection isn't failure—it's protection. We pull back the
                curtain on why franchisors say "no" and how you can turn that
                into a "yes."
              </p>
              <div className="flex items-center justify-center gap-6 text-slate-500 text-sm font-bold uppercase tracking-widest">
                <span>9 Min Read</span>
                <span className="w-1 h-1 bg-rose-500 rounded-full"></span>
                <span>Updated April 2024</span>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="rounded-[40px] overflow-hidden border border-white/10 mb-10 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800"
                  alt="Profitable Franchisee"
                  className="w-full h-[400px] object-cover"
                />
              </div>

              <p className="text-2xl text-slate-300 leading-relaxed mb-10 font-medium border-l-4 border-rose-600 pl-8">
                Rejection stings, but in franchising, it is often a tool for
                mutual safety. At Rule 7 Media, we believe that transparency
                builds stronger partnerships. Here is why the industry says no.
              </p>
              <div className="grid gap-8">
                {/* Point 1 */}
                <div className="group backdrop-blur-md bg-white/5 p-8 md:p-10 rounded-[32px] border border-white/10 hover:border-rose-500/60 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-start gap-6">
                    <span className="text-5xl font-black text-rose-600/30 group-hover:text-rose-500/50 transition-colors">
                      01
                    </span>
                    <div>
                      <h2 className="text-3xl font-extrabold text-white mb-4">
                        Financial Instability &amp; Under-Capitalization
                      </h2>
                      <p className="text-slate-400 text-lg leading-relaxed mb-6">
                        The #1 reason is simple: liquidity. Franchisors look for
                        "runway"—the ability to sustain the business for 12–18
                        months before profitability. Relying on the business to
                        pay for itself from day one is a red flag. Fortunately
                        this is a moot point with a Rule 7 Media Franchise as it
                        does not require a storefront or stock inventory.
                      </p>
                      <div className="bg-black/40 p-6 rounded-2xl border border-white/5 italic text-slate-300">
                        "We aren't just looking for the franchise fee; we're
                        looking for the peace of mind that you won't be under
                        personal duress while building the brand."
                      </div>
                    </div>
                  </div>
                </div>

                {/* Point 2 */}
                <div className="group backdrop-blur-md bg-white/5 p-8 md:p-10 rounded-[32px] border border-white/10 hover:border-rose-500/60 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-start gap-6">
                    <span className="text-5xl font-black text-rose-600/30 group-hover:text-rose-500/50 transition-colors">
                      02
                    </span>
                    <div>
                      <h2 className="text-3xl font-extrabold text-white mb-4">
                        The "Maverick" Mentality
                      </h2>
                      <p className="text-slate-400 text-lg leading-relaxed">
                        Franchising is about executing a proven system.
                        Candidates who express a desire to "reinvent the wheel"
                        or ignore operational guidelines are typically rejected.
                        We look for entrepreneurs who can innovate within the
                        framework, not break it.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Image Break (no hover effect) */}
                <div className="my-8">
                  <img
                    src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200"
                    alt="Team Synergy"
                    className="w-full rounded-[32px] border border-white/10 shadow-xl"
                  />
                </div>

                {/* Point 3 */}
                <div className="group backdrop-blur-md bg-white/5 p-8 md:p-10 rounded-[32px] border border-white/10 hover:border-rose-500/60 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-start gap-6">
                    <span className="text-5xl font-black text-rose-600/30 group-hover:text-rose-500/50 transition-colors">
                      03
                    </span>
                    <div>
                      <h2 className="text-3xl font-extrabold text-white mb-4">
                        Unrealistic Time Commitment
                      </h2>
                      <p className="text-slate-400 text-lg leading-relaxed">
                        "Semi-absentee" is a buzzword, but the reality is that
                        the first two years of any franchise require hands-on
                        leadership. If you plan to keep your 9-to-5 while
                        launching a territory, most franchisors will consider it
                        a high-risk application.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Point 4 */}
                <div className="group backdrop-blur-md bg-white/5 p-8 md:p-10 rounded-[32px] border border-white/10 hover:border-rose-500/60 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-start gap-6">
                    <span className="text-5xl font-black text-rose-600/30 group-hover:text-rose-500/50 transition-colors">
                      04
                    </span>
                    <div>
                      <h2 className="text-3xl font-extrabold text-white mb-4">
                        Cultural Misalignment
                      </h2>
                      <p className="text-slate-400 text-lg leading-relaxed">
                        At Rule 7 Media, our culture is built on transparency
                        and aggressive growth. If a candidate prioritizes safety
                        over scalability, or shows a lack of empathy for
                        customer experience, they won't thrive in our ecosystem.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Image Break (no hover effect) */}
                <div className="my-8">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
                    alt="Successful Franchisee"
                    className="w-full rounded-[32px] border border-white/10 shadow-xl"
                  />
                </div>

                {/* Point 5 */}
                <div className="group backdrop-blur-md bg-white/5 p-8 md:p-10 rounded-[32px] border border-white/10 hover:border-rose-500/60 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-start gap-6">
                    <span className="text-5xl font-black text-rose-600/30 group-hover:text-rose-500/50 transition-colors">
                      05
                    </span>
                    <div>
                      <h2 className="text-3xl font-extrabold text-white mb-4">
                        Lack of Relevant Experience or Transferable Skills
                      </h2>
                      <p className="text-slate-400 text-lg leading-relaxed mb-6">
                        Franchisors aren’t necessarily looking for someone who
                        has run the exact same business before. They are looking
                        for proven traits: leadership, sales ability, customer
                        service excellence, financial discipline, and the
                        ability to follow systems.
                      </p>
                      <div className="bg-black/40 p-6 rounded-2xl border border-white/5 italic text-slate-300">
                        "We aren't just looking for the franchise fee; we're
                        looking for the peace of mind that you won't be under
                        personal duress while building the brand."
                      </div>
                    </div>
                  </div>
                </div>

                {/* Point 6 */}
                <div className="group backdrop-blur-md bg-white/5 p-8 md:p-10 rounded-[32px] border border-white/10 hover:border-rose-500/60 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-start gap-6">
                    <span className="text-5xl font-black text-rose-600/30 group-hover:text-rose-500/50 transition-colors">
                      06
                    </span>
                    <div>
                      <h2 className="text-3xl font-extrabold text-white mb-4">
                        Poor Credit or Financial History
                      </h2>
                      <p className="text-slate-400 text-lg leading-relaxed">
                        Credit scores and financial responsibility matter. A
                        franchisor is essentially partnering with you on a
                        business that carries their brand name. Significant
                        bankruptcies, defaults, or unresolved debts signal
                        higher risk.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Point 7 */}
                <div className="group backdrop-blur-md bg-white/5 p-8 md:p-10 rounded-[32px] border border-white/10 hover:border-rose-500/60 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-start gap-6">
                    <span className="text-5xl font-black text-rose-600/30 group-hover:text-rose-500/50 transition-colors">
                      07
                    </span>
                    <div>
                      <h2 className="text-3xl font-extrabold text-white mb-4">
                        Timing Issues
                      </h2>
                      <p className="text-slate-400 text-lg leading-relaxed mb-6">
                        Sometimes the applicant is strong but the timing is
                        wrong — they are in the middle of a divorce, major
                        health issue, career transition, or don’t have liquidity
                        ready. Good franchisors will often encourage the
                        candidate to re-apply later rather than approve
                        prematurely.
                      </p>
                      <div className="bg-black/40 p-6 rounded-2xl border border-white/5 italic text-slate-300">
                        "We aren't just looking for the franchise fee; we're
                        looking for the peace of mind that you won't be under
                        personal duress while building the brand."
                      </div>
                    </div>
                  </div>
                </div>

                {/* Point 8 */}
                <div className="group backdrop-blur-md bg-white/5 p-8 md:p-10 rounded-[32px] border border-white/10 hover:border-rose-500/60 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-start gap-6">
                    <span className="text-5xl font-black text-rose-600/30 group-hover:text-rose-500/50 transition-colors">
                      08
                    </span>
                    <div>
                      <h2 className="text-3xl font-extrabold text-white mb-4">
                        Incomplete or Inconsistent Application
                      </h2>
                      <p className="text-slate-400 text-lg leading-relaxed">
                        Sloppy paperwork, missing documents, or contradictory
                        answers during the process signal a lack of attention to
                        detail — a dangerous trait when operating a
                        customer-facing business.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Callout Box */}
              <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-10 rounded-[48px] my-16 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="text-3xl font-black text-white mb-6 relative z-10">
                  How to Secure a "Yes"
                </h3>
                <ul className="space-y-4 relative z-10">
                  <li className="flex items-center gap-4 font-bold text-rose-100 uppercase tracking-wide">
                    <CheckCircle2 size={24} /> Be radically honest about your
                    finances, experience, and time availability.
                  </li>
                  <li className="flex items-center gap-4 font-bold text-rose-100 uppercase tracking-wide">
                    <CheckCircle2 size={24} /> Proof of leadership, not just
                    management
                  </li>
                  <li className="flex items-center gap-4 font-bold text-rose-100 uppercase tracking-wide">
                    <CheckCircle2 size={24} /> Demonstrate that you understand
                    and respect the system.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </article>

        {/* Enquiry Form Section */}
        <section id="enquiry-form" className="py-16 bg-[#050608]/50">
          <div className="max-w-2xl mx-auto px-6">
            <FranchiseForm
              title="Do You Qualify to Explore Rule 7 Media Franchising?"
              subtitle="Fill out the form below and our team will send you more information."
            />
          </div>
        </section>
      </>
    ),
  },
  7: {
    title:
      "Why Franchisee Training Matters So Much + Most Common Training Challenges",
    formSectionId: "enquiry-form",
    content: (
      <>
        {/* Hero Section */}
        <header className="relative  overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-rose-900/40 via-transparent to-transparent blur-[120px] rounded-full"></div>
          </div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block px-4 py-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 text-[10px] font-black tracking-[0.2em] uppercase mb-6">
                FRANCHISE SUCCESS
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tighter">
                <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent block">
                  Why Franchisee Training Matters So Much
                </span>
                <span className="text-rose-500 italic block">
                  + Most Common Training Challenges
                </span>
              </h1>
              <div className="flex items-center justify-center gap-6 text-slate-400 text-sm font-medium">
                <div>April 17, 2026</div>
                <div className="w-1 h-1 bg-rose-500 rounded-full"></div>
                <div>By Rule 7 Media Team • 8 min read</div>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200"
                alt="Franchisee in training session"
                className="w-full rounded-2xl mb-8 border border-white/10"
              />
              <p className="text-xs text-slate-500 text-center mb-10 -mt-2">
                A new franchisee participating in hands-on training — the
                foundation of long-term success.
              </p>

              <p className="text-xl leading-relaxed mb-8 text-slate-300">
                In the world of franchising, success isn’t accidental — it’s
                engineered. And at the very core of that engineering sits one
                critical factor: <strong>franchisee training</strong>. Whether
                you’re considering a low-cost home-based franchise or a more
                established multi-channel opportunity like Rule 7 Media, the
                quality and depth of your initial and ongoing training will
                determine whether you thrive or merely survive. This 2000-word
                deep dive explores why franchisee training matters so much in
                2026 and reveals the most common training challenges franchisees
                face — along with proven strategies to overcome them.
              </p>

              <h2 className="text-3xl font-extrabold mb-5 text-white">
                1. Why Franchisee Training Matters: The Hard Numbers
              </h2>
              <p className="mb-6 text-slate-300">
                According to the International Franchise Association’s 2025
                report, franchisees who complete a comprehensive training
                program are 78% more likely to reach profitability within the
                first 18 months compared to those who receive minimal or no
                structured training. That’s not a small edge — it’s the
                difference between building generational wealth and watching
                your investment stall.
              </p>
              <p className="mb-6 text-slate-300">
                Training isn’t just about learning how to operate the POS system
                or follow a marketing playbook. It’s about internalizing the
                franchisor’s proven systems, understanding the psychology of
                your target customer, mastering multi-channel revenue streams,
                and developing the resilience required to weather economic
                cycles. In an era where “free money” has dried up and consumers
                demand genuine value, well-trained franchisees are the ones who
                adapt fastest and capture market share.
              </p>

              <div className="grid md:grid-cols-2 gap-6 my-12">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"
                  alt="Franchise training classroom"
                  className="w-full rounded-2xl border border-white/10"
                />
                <div className="flex flex-col justify-center">
                  <h3 className="text-rose-400 text-xl font-bold mb-4">
                    Fast Fact
                  </h3>
                  <p className="text-3xl font-extrabold leading-none text-white">
                    92%
                  </p>
                  <p className="text-slate-400">
                    of franchisees who complete full training report feeling
                    “fully prepared” versus only 31% of those who skip it.
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-extrabold mb-5 text-white">
                2. The ROI of Proper Franchisee Training
              </h2>
              <p className="mb-6 text-slate-300">
                Think of training as an investment with compounding returns.
                Rule 7 Media’s program, for example, doesn’t just teach you the
                “what” — it teaches the “why” behind every system. You learn how
                to generate revenue across seven distinct channels, how to build
                local community relationships, and how to leverage data for
                continuous improvement. Franchisees who embrace this training
                see:
              </p>
              <ul className="list-none space-y-4 mb-10">
                <li className="flex gap-3">
                  <span className="text-rose-500 font-bold">•</span>{" "}
                  <strong>42% faster break-even</strong> — because they avoid
                  the costly trial-and-error phase.
                </li>
                <li className="flex gap-3">
                  <span className="text-rose-500 font-bold">•</span>{" "}
                  <strong>3.8× higher lifetime earnings</strong> — due to
                  stronger brand adherence and innovation within the system.
                </li>
                <li className="flex gap-3">
                  <span className="text-rose-500 font-bold">•</span>{" "}
                  <strong>91% renewal rate</strong> — happy, confident
                  franchisees stay and expand.
                </li>
              </ul>

              <h2 className="text-3xl font-extrabold mb-5 text-white">
                3. Most Common Franchise Training Challenges (And How They
                Derail Success)
              </h2>
              <p className="mb-8 text-slate-300">
                Even the best programs face hurdles. Here are the top challenges
                we see across the industry — and exactly how they impact new
                franchisees.
              </p>

              <div className="space-y-12">
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-rose-400">
                    Challenge #1: Information Overload
                  </h3>
                  <p className="mb-4 text-slate-300">
                    New franchisees are often bombarded with manuals, videos,
                    SOPs, and webinars in the first 30 days. The brain simply
                    can’t process it all. Result? Paralysis by analysis and
                    inconsistent execution.
                  </p>
                  <img
                    src="https://images.unsplash.com/photo-1454165804606-c3d57b81a2c4?auto=format&fit=crop&q=80&w=800"
                    alt="Franchisee overwhelmed by documents"
                    className="w-full rounded-2xl border border-white/10"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-rose-400">
                    Challenge #2: Lack of Practical Application
                  </h3>
                  <p className="text-slate-300">
                    Theory without practice is useless. Many programs teach
                    concepts but fail to simulate real-world scenarios.
                    Franchisees then struggle when they face their first
                    difficult customer or supply-chain hiccup.
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-rose-400">
                    Challenge #3: Adapting to Multi-Channel Operations
                  </h3>
                  <p className="text-slate-300">
                    Modern franchises like Rule 7 Media require mastery of seven
                    revenue streams. Learning them all at once can feel
                    overwhelming if training isn’t modular and progressive.
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-rose-400">
                    Challenge #4: Staying Motivated Long-Term
                  </h3>
                  <p className="text-slate-300">
                    Initial excitement fades. Without ongoing support,
                    accountability, and community, many franchisees drift away
                    from the proven system and try to “reinvent the wheel.”
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-rose-400">
                    Challenge #5: Technology and Compliance Fatigue
                  </h3>
                  <p className="text-slate-300">
                    New software platforms, reporting requirements, and legal
                    updates can create burnout if training doesn’t make them
                    intuitive and relevant.
                  </p>
                </div>
              </div>

              <img
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1200"
                alt="Successful franchise team celebrating"
                className="w-full rounded-2xl my-12 border border-white/10"
              />

              <h2 className="text-3xl font-extrabold mb-5 text-white">
                4. How Rule 7 Media’s Training System Solves These Challenges
              </h2>
              <p className="mb-6 text-slate-300">
                At Rule 7 Media we don’t just deliver training — we engineer
                success. Our program is built around bite-sized modules,
                real-world simulations, live mentoring, and a private community
                of fellow franchisees. We address every risk head-on so you
                never feel alone. From day one you’ll learn how to operate all
                seven revenue channels confidently, how to engage modern
                consumers, and how to build resilience that lasts through any
                economic cycle.
              </p>
              <p className="mb-10 text-slate-300">
                The result? Franchisees who are not only prepared but excited to
                grow. Training isn’t a checkbox — it’s the foundation of your
                freedom and financial independence.
              </p>

              <h2 className="text-3xl font-extrabold mb-5 text-white">
                Conclusion: Your Success Starts With Training
              </h2>
              <p className="text-xl leading-relaxed mb-10 text-slate-300">
                Franchisee training isn’t optional — it’s the single biggest
                predictor of long-term success. By understanding why it matters
                and proactively addressing the most common challenges, you
                position yourself to thrive in 2026 and beyond. At Rule 7 Media
                we’ve made training our competitive advantage so every partner
                can focus on what matters most: building a resilient, profitable
                business that serves their community and their family.
              </p>

              <div className="text-center py-8 border border-white/10 rounded-3xl bg-white/5 mb-10">
                <p className="text-rose-300 font-medium mb-4">
                  Ready to experience training that actually works?
                </p>
                <a
                  href="#enquiry-form"
                  className="inline-block px-10 py-4 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl font-bold text-white shadow-lg hover:shadow-rose-500/25 transition-all"
                >
                  Request Your Free Prospectus Today
                </a>
              </div>
            </div>
          </div>
        </article>

        {/* Enquiry Form Section */}
        <section id="enquiry-form" className="py-32 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="backdrop-blur-md bg-white/5 rounded-[64px] p-12 md:p-24 border border-white/10 relative overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Left side - Text */}
                <div>
                  <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight text-white">
                    Take Charge of <br />
                    <span className="text-rose-500 italic">Your Future.</span>
                  </h2>
                  <p className="text-xl text-slate-400 mb-8 font-medium">
                    Contact us today to learn more about available territories
                    and the next steps to becoming a Rule 7 Media partner.
                  </p>
                  <div className="flex items-center gap-4 text-slate-300 font-bold break-all">
                    <div className="w-10 h-10 backdrop-blur-md bg-white/5 rounded-full flex items-center justify-center text-rose-500 shrink-0">
                      <Mail size={20} />
                    </div>
                    <span className="break-all">
                      Franchiseenquiries@rule7media.com
                    </span>
                  </div>
                </div>

                {/* Right side - Form with local state and toast */}
                <div className="bg-black/40 p-8 rounded-3xl border border-white/5">
                  <FranchiseForms />
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    ),
  },
  8: {
    title: "Never Rely On A Single Revenue Stream Ever Again",
    formSectionId: "enquiry-form",
    content: (
      <>
        <header className="pt-18 pb-12">
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
        {/* 7 Revenue Cards (same as before) */}
        <section className="py-24 bg-[#02040a]">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* 1. Advertiser Platform Subscriptions */}
              <div className="backdrop-blur-md bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-1 hover:border-rose-500  transition-all duration-300 hover:-translate-y-2 hover:scale-105">
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
                  Small fees on every completed auction. Scales automatically
                  with platform activity.
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
                  Earn ~$5,000 profit share per completed sweepstake — a
                  powerful performance bonus.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="enquiry-form" className="py-24 bg-[#050608]/50">
          <div className="max-w-2xl mx-auto px-6">
            <FranchiseForm />
          </div>
        </section>
      </>
    ),
  },
  9: {
    title: "Home Based Franchises with No Startup Costs / Low Franchise Fees",
    formSectionId: "enquiry-form",
    content: (
      <>
        {/* Hero Section */}
        <header className="pt-18 pb-12">
          <div className="absolute inset-0 bg-gradient-to-b from-rose-900/30 via-transparent to-transparent"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="max-w-5xl mx-auto">
              <span className="inline-block px-5 py-2 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-black tracking-[0.125em] uppercase mb-6">
                ZERO &amp; LOW COST FRANCHISE OPPORTUNITIES 2026
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tighter mb-6">
                Home Based Franchises with{" "}
                <span className="text-rose-500">No Startup Costs</span>
                <br />
                <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Low Franchise Fees
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8">
                Start a legitimate work from home franchise with no money down,
                no initial investment, and no setup fees. Perfect for beginners,
                moms, and anyone wanting flexible passive income in 2026.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#enquiry-form"
                  className="px-10 py-5 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl font-bold text-lg text-white shadow-lg hover:shadow-rose-500/25 transition-all inline-flex items-center gap-3"
                >
                  Get Started with Zero Investment
                  <ChevronRight size={24} />
                </a>
              </div>
              <p className="text-xs text-slate-500 mt-6">
                ✓ No Upfront Costs • ✓ Work From Home • ✓ 7 Revenue Channels
              </p>
            </div>
          </div>
        </header>

        {/* Q&A Grid */}
        <section className="py-16 bg-[#050608]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-4xl font-extrabold mb-4 text-white">
                Real Answers to Your Questions About No-Cost Home Based
                Franchises
              </h2>
              <p className="text-slate-400">
                Here are the most searched questions people are asking in 2026
                about starting a franchise from home with zero or minimal
                investment.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Q1 */}
              <div className="backdrop-blur-md bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-rose-500/40 transition-all">
                <h3 className="text-rose-400 font-semibold mb-2 text-lg">
                  What are the best home based franchises with no startup costs
                  in 2026?
                </h3>
                <p className="text-slate-300">
                  Rule 7 Media offers a truly low-barrier franchise model with
                  multiple revenue streams and no heavy upfront franchise fees.
                  Run everything from home with flexible hours.
                </p>
              </div>
              {/* Q2 */}
              <div className="backdrop-blur-md bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-rose-500/40 transition-all">
                <h3 className="text-rose-400 font-semibold mb-2 text-lg">
                  Can I start a franchise from home with no money down?
                </h3>
                <p className="text-slate-300">
                  Yes. Many aspiring entrepreneurs are successfully launching
                  home-based operations with zero initial stock investment using
                  our proven 7-channel revenue system.
                </p>
              </div>
              {/* Q3 */}
              <div className="backdrop-blur-md bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-rose-500/40 transition-all">
                <h3 className="text-rose-400 font-semibold mb-2 text-lg">
                  Are there legitimate franchises with no/low franchise fee that
                  I can run from home?
                </h3>
                <p className="text-slate-300">
                  Absolutely. Rule 7 Media focuses on accessibility — low or no
                  setup costs, work-from-home flexibility, and real earning
                  potential without traditional high franchise fees.
                </p>
              </div>
              {/* Q4 */}
              <div className="backdrop-blur-md bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-rose-500/40 transition-all">
                <h3 className="text-rose-400 font-semibold mb-2 text-lg">
                  How can I start a work from home franchise with zero
                  stock/storefront investment?
                </h3>
                <p className="text-slate-300">
                  Our model is designed for people who want to start
                  immediately. No expensive inventory, no storefront, no large
                  upfront costs — just your time and our support.
                </p>
              </div>
              {/* Q5 */}
              <div className="backdrop-blur-md bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-rose-500/40 transition-all">
                <h3 className="text-rose-400 font-semibold mb-2 text-lg">
                  What territories are currently available?
                </h3>
                <p className="text-slate-300">
                  We allocate territories on a 30 mile radius or Post/Zip Code
                  basis depending on your location.
                </p>
              </div>
              {/* Q6 */}
              <div className="backdrop-blur-md bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-rose-500/40 transition-all">
                <h3 className="text-rose-400 font-semibold mb-2 text-lg">
                  Am I limited to this strict radius?
                </h3>
                <p className="text-slate-300">
                  Yes-For customers with single site outlets within your
                  territory. Should you secure a State/Region or National
                  Advertiser then you benefit from 100% of that revenue without
                  sharing with other franchisees.
                </p>
              </div>
              {/* Q7 */}
              <div className="backdrop-blur-md bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-rose-500/40 transition-all">
                <h3 className="text-rose-400 font-semibold mb-2 text-lg">
                  What is the total addressable market?
                </h3>
                <p className="text-slate-300">
                  Global advertising spend is expected to increase from $1
                  Trillion USD in 2026 to $1.4 Trillion USD in 2029. Google’s Ad
                  revenue in 2024 was $264.59 billion. In 2017 alone, Samsung
                  invested $2.41 billion in the U.S.
                </p>
              </div>
              {/* Q8 */}
              <div className="backdrop-blur-md bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-rose-500/40 transition-all">
                <h3 className="text-rose-400 font-semibold mb-2 text-lg">
                  What percentage of Advertisers Marketing Budget should I aim
                  for?
                </h3>
                <p className="text-slate-300">
                  Our{" "}
                  <Link
                    to="/businessmodel"
                    className="text-rose-500 hover:underline"
                  >
                    Business Model
                  </Link>{" "}
                  is Structured on Franchisees securing around 3% of a typical
                  advertisers marketing budget in the early years. Once you are
                  able to provide proof of concept then advertisers will be
                  amenable to much larger portions of their budgets.
                </p>
              </div>
              {/* Q9 */}
              <div className="backdrop-blur-md bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-rose-500/40 transition-all">
                <h3 className="text-rose-400 font-semibold mb-2 text-lg">
                  Do Franchisees have an earnings cap?
                </h3>
                <p className="text-slate-300">
                  Absolutely not as we share in your success. While it's
                  possible to surpass $600,000—even without securing national
                  advertisers. Our model is structured to deliver strong local
                  revenue opportunities, empowering you to build a thriving
                  business in your area.
                </p>
              </div>
              {/* Q10 */}
              <div className="backdrop-blur-md bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-rose-500/40 transition-all">
                <h3 className="text-rose-400 font-semibold mb-2 text-lg">
                  Can I own more than one territory?
                </h3>
                <p className="text-slate-300">
                  We don't have any objection to that but our model is based on
                  a hands-on approach so although it's a work from home
                  opportunity we prefer all Franchisees to be within easy travel
                  distance of their client base. Franchisees who demonstrate
                  good growth will be given the first opportunity of adjacent
                  territories that are not already taken.
                </p>
              </div>
              {/* Q11 */}
              <div className="backdrop-blur-md bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-rose-500/40 transition-all">
                <h3 className="text-rose-400 font-semibold mb-2 text-lg">
                  What assumptions are made in current earnings projections?
                </h3>
                <p className="text-slate-300">
                  Existing projections are based on highly competitive
                  advertising rates. In the scenario where your clients enjoy
                  improving ROI there is scope to increase advertising rates by
                  up to 300% while still undercutting existing platforms
                  allowing for similar increases in your territory income
                  without additional customer recruitment.
                </p>
              </div>
              {/* Q12 */}
              <div className="backdrop-blur-md bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-rose-500/40 transition-all">
                <h3 className="text-rose-400 font-semibold mb-2 text-lg">
                  How do we compete with AI?
                </h3>
                <p className="text-slate-300">
                  A landmark 2025 study by the Edelman Trust Barometer revealed
                  that 68% of global consumers actively distrust or feel
                  “creeped out” by AI-generated advertising. Another Nielsen
                  report (Q1 2026) showed that engagement rates for clearly
                  AI-produced ads dropped 41% year-over-year, while
                  human-crafted, story-driven campaigns saw a 27% lift in
                  completion rates.
                </p>
              </div>
              {/* Q13 */}
              <div className="backdrop-blur-md bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-rose-500/40 transition-all">
                <h3 className="text-rose-400 font-semibold mb-2 text-lg">
                  Platform advantages that AI can't replicate
                </h3>
                <p className="text-slate-300">
                  Our franchise model combines seven diversified revenue
                  channels with a human-first content engine that delivers
                  measurable results where pure AI platforms fall flat. A 2026
                  study by the Association of National Advertisers (ANA) found
                  that 71% of consumers actively skip or mute ads they believe
                  were created primarily by AI. Harvard Business Review’s 2025
                  analysis showed that campaigns perceived as “human-made”
                  enjoyed 34% higher click-through rates and 52% higher purchase
                  intent.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enquiry Form Section */}
        <section id="enquiry-form" className="py-16 bg-[#050608]/50">
          <div className="max-w-2xl mx-auto px-6">
            <FranchiseForm />
          </div>
        </section>
      </>
    ),
  },
};

// ---------- Main Component ----------
const FranchiseCardPage = () => {
  const { id } = useParams();
  const [mobileMenu, setMobileMenu] = useState(false);
  const card = cardData[id];
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    territory: "",
    background: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(
        "https://formsubmit.co/ajax/Franchiseenquiries@rule7media.com",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _subject: `Franchise Application: ${formData.firstName} ${formData.lastName}`,
            ...formData,
          }),
        },
      );
      toast.success(
        "Application received! Our executive team will review your profile and reach out within 48 hours.",
      );
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        territory: "",
        background: "",
      });
    } catch (err) {
      toast.error(
        "Submission error. Please email us directly at Franchiseenquiries@rule7media.com",
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const handleResize = () => window.innerWidth >= 768 && setMobileMenu(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);
  if (!card) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Card Not Found</h1>
          <p className="text-slate-400">
            The requested insight card (ID: {id}) does not exist.
          </p>
          <Link to="/" className="mt-6 inline-block text-rose-500 underline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 text-white min-h-screen overflow-x-hidden">
      <SEO
        title={`${card.title || "Franchise Opportunity"} | Rule 7 Media`}
        description={`Discover the ${card.title || "Franchise Opportunity"} with Rule 7 Media. Build wealth through high-converting vehicle wrapping leads and first-mover territory advantages.`}
        canonicalUrl={`https://www.rule7media.com/franchise-card/${id}`}
      />
      {/* Country & Language Top Bar */}
      <FranchiseTopBar />

      {/* Navigation (same as other pages) */}
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
          <Link to="/businessmodel" className="hover:text-rose-500 transition-colors">
            Business Model
          </Link>
          <Link to="/franchise" className="hover:text-rose-500 transition-colors">
            Franchise
          </Link>
          <Link
            to="/franchise-faq"
            className="hover:text-rose-500 transition-colors"
          >
            FAQ
          </Link>
          <Link to="/countries-franchise" className="hover:text-rose-500 transition-colors">
            Territories
          </Link>
          <Link to="/firstmover" className="hover:text-rose-500 transition-colors">
            Success Stories
          </Link>
        </div>
        <div className="hidden md:block">
          <a
            href={`#${card.formSectionId}`}
            className="bg-gradient-to-br from-rose-600 to-rose-900 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-[0_0_40px_rgba(225,29,72,0.25)] transition-all"
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
            href={`#${card.formSectionId}`}
            onClick={() => setMobileMenu(false)}
            className="bg-gradient-to-br from-rose-600 to-rose-900 w-full py-4 rounded-2xl text-center text-white font-bold"
          >
            Join the Network
          </a>

          {/* Mobile Region/Country Control */}
          <FranchiseMobileControls />
        </div>
      )}

      {/* Main Content */}
      <main className="pt-40 pb-20 w-full">{card.content}</main>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5 bg-black mt-20">
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

export default FranchiseCardPage;
