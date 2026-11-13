import React from "react";
import {
  Megaphone,
  Car,
  Smartphone,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import Header from "../components/Header";
import Footer from "../components/Footer";
const MissionStatement = () => {
  const { user } = useSelector((state) => state.auth || { user: null });
  const isLoggedIn = !!user;
  return (
    <>
      {!isLoggedIn && <Header />}

      <div className="bg-[#0B0F19] text-slate-300">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#FF3D00]/10 border border-[#FF3D00]/20 mb-6">
              <span className="text-[#FF3D00] text-xs font-bold tracking-widest uppercase">
                The Future of Mobile Advertising
              </span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
              Empowering Brands, <br />
              <span className="bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent">
                Rewarding Communities.
              </span>
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed font-light">
              Our mission is to redefine outdoor advertising by seamlessly
              connecting brands, vehicle owners, and communities in a mutually
              rewarding ecosystem.
            </p>
          </div>
        </section>

        {/* The Vision Grid */}
        <section className="max-w-7xl mx-auto px-4 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* For Advertisers */}
            <div className="rounded-[2.5rem] p-10 flex flex-col h-full">
              <div className="w-16 h-16 bg-[#FF3D00]/10 rounded-2xl flex items-center justify-center mb-8 border border-[#FF3D00]/20">
                <Megaphone className="text-[#FF3D00] w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">For Advertisers</h3>
              <p className="text-zinc-400 leading-relaxed mb-6">
                Unparalleled brand visibility through high-impact mobile
                campaigns. Reach audiences where they live, work, and play with
                our innovative vinyl wrap solutions that foster brand
                recognition mile after mile.
              </p>
              <ul className="mt-auto space-y-3">
                <li className="flex items-center text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-[#FF3D00]" />{" "}
                  Global Reach
                </li>
                <li className="flex items-center text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-[#FF3D00]" />{" "}
                  Real-world Impact
                </li>
              </ul>
            </div>

            {/* For Vehicle Owners */}
            <div className="rounded-[2.5rem] p-10 flex flex-col h-full bg-zinc-900/50">
              <div className="w-16 h-16 bg-[#FF3D00]/10 rounded-2xl flex items-center justify-center mb-8 border border-[#FF3D00]/20">
                <Car className="text-[#FF3D00] w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">For Vehicle Owners</h3>
              <p className="text-zinc-400 leading-relaxed mb-6">
                Turn your vehicle into a valuable advertising asset. Owners
                become active brand ambassadors, benefiting from incentives and
                rewards while supporting brands they believe in.
              </p>
              <ul className="mt-auto space-y-3">
                <li className="flex items-center text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-[#FF3D00]" /> New
                  Revenue Streams
                </li>
                <li className="flex items-center text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-[#FF3D00]" />{" "}
                  Active Participation
                </li>
              </ul>
            </div>

            {/* For Consumers */}
            <div className="rounded-[2.5rem] p-10 flex flex-col h-full">
              <div className="w-16 h-16 bg-[#FF3D00]/10 rounded-2xl flex items-center justify-center mb-8 border border-[#FF3D00]/20">
                <Smartphone className="text-[#FF3D00] w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">For Consumers</h3>
              <p className="text-zinc-400 leading-relaxed mb-6">
                We go beyond passive advertising. Our platform invites
                individuals to scan, share, and connect with campaigns—earning
                rewards and discovering new brands in ways that are fun and
                community-driven.
              </p>
              <ul className="mt-auto space-y-3">
                <li className="flex items-center text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-[#FF3D00]" />{" "}
                  Interactive Experiences
                </li>
                <li className="flex items-center text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-[#FF3D00]" />{" "}
                  Instant Rewards
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Final Vision Statement */}
        <section className="bg-zinc-900/30 py-24 border-y border-white/5">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <div className="mb-12">
              <Sparkles className="w-12 h-12 text-[#FF3D00] mx-auto opacity-50" />
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-8 italic tracking-tight">
              "Driven by creativity, technology, and collaboration, we strive to
              make advertising more dynamic, inclusive, and effective."
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="h-[1px] w-12 bg-[#FF3D00]"></div>
              <span className="uppercase tracking-[0.3em] text-sm font-bold text-zinc-500">
                The Rule 7 Media Commitment
              </span>
              <div className="h-[1px] w-12 bg-[#FF3D00]"></div>
            </div>
          </div>
        </section>
      </div>
      {!isLoggedIn && <Footer />}
    </>
  );
};

export default MissionStatement;
