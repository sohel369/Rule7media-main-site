// src/components/AdSlots.jsx

import React from "react";

export const HeaderLeaderboard = () => (
  <div className="w-full max-w-[728px] mx-auto pt-6 pb-4 px-4">
    {/* Desktop Version */}
    <div className="hidden sm:block">
      <div className="h-[90px] bg-zinc-900 border border-zinc-700 rounded-2xl flex items-center justify-center text-xs text-zinc-400">
        728×90 HEADER LEADERBOARD
      </div>
    </div>
    {/* Mobile Version */}
    <div className="block sm:hidden">
      <div className="h-[50px] bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center text-[10px] text-zinc-400">
        320×50 HEADER LEADERBOARD
      </div>
    </div>
  </div>
);

// Right Skyscraper - Desktop + Mobile Responsive
// Right Skyscraper - Desktop + Mobile Responsive
export const RightSkyscraper = () => {
  return (
    <>
      {/* Desktop Version - Visible on lg and above */}
      <div className="hidden lg:block sticky top-24">
        <div className="h-[600px] w-[160px] bg-zinc-900 border border-zinc-700 rounded-2xl flex items-center justify-center">
          <span className="text-xs text-zinc-400 text-center leading-tight">
            160×600 <br /> RIGHT SKYSCRAPER
          </span>
        </div>
      </div>

      {/* Mobile Version - Visible below lg */}
      <div className="block lg:hidden w-full px-4 my-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-3">
          <p className="text-[10px] text-blue-400 uppercase tracking-wider text-center mb-2">
            Advertisement
          </p>
          <div className="h-[80px] flex items-center justify-center">
            <span className="text-xs text-zinc-400 text-center">
              📱 Mobile Banner
              <br />
              320×100 - Campaign Ad
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
export const LeftSkyscraper = () => {
  return (
    <>
      {/* Desktop Version - Visible on xl and above */}
      <div className="hidden xl:block w-[160px] sticky top-28 self-start mr-6">
        <div className="h-[600px] bg-zinc-900 border border-zinc-700 rounded-2xl flex items-center justify-center text-xs text-zinc-400 text-center">
          LEFT SKYSCRAPER
          <br />
          (160×600)
        </div>
      </div>

      {/* Mobile Version - Visible below xl, Center kiya */}
      <div className="block xl:hidden w-full px-4 my-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-3 text-center">
          <p className="text-[10px] text-blue-400 uppercase tracking-wider text-center mb-2">
            Advertisement
          </p>
          <div className="h-[80px] flex items-center justify-center">
            <span className="text-xs text-zinc-400 text-center">
              📱 Mobile Banner
              <br />
              320×100 - Campaign Ad
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

// Medium Rectangle - Responsive
export const MediumRectangle = ({ className = "" }) => (
  <div className={`my-12 mx-auto max-w-[300px] lg:max-w-[336px] ${className}`}>
    {/* Desktop Version */}
    <div className="hidden sm:block">
      <div className="h-[250px] bg-zinc-900 border border-dashed border-zinc-600 rounded-2xl flex items-center justify-center text-xs text-rose-500/70 text-center">
        300×250 MEDIUM RECTANGLE
        <br />
        Contextual Ad
      </div>
    </div>
    {/* Mobile Version */}
    <div className="block sm:hidden">
      <div className="h-[200px] bg-zinc-900 border border-dashed border-zinc-600 rounded-xl flex items-center justify-center text-[10px] text-rose-500/70 text-center">
        250×200 MEDIUM RECTANGLE
        <br />
        Contextual Ad
      </div>
    </div>
  </div>
);

// Footer Leaderboard - Responsive
export const FooterLeaderboard = () => (
  <div className="w-full max-w-[728px] mx-auto mt-12 mb-8 px-4">
    {/* Desktop Version */}
    <div className="hidden sm:block">
      <div className="h-[90px] bg-zinc-900 border border-zinc-700 rounded-2xl flex items-center justify-center text-xs text-zinc-400">
        728×90 FOOTER LEADERBOARD — Retargeting
      </div>
    </div>
    {/* Mobile Version */}
    <div className="block sm:hidden">
      <div className="h-[60px] bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center text-[10px] text-zinc-400">
        320×60 FOOTER LEADERBOARD — Retargeting
      </div>
    </div>
  </div>
);

// Mobile Sticky Leaderboard
export const MobileStickyLeaderboard = () => (
  <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-14 bg-zinc-950 border-t border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500">
    MOBILE LEADERBOARD (320×50)
  </div>
);
