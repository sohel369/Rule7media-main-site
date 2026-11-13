import React, { useState } from "react";
import { ChevronDown, HelpCircle,CheckCircle2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../components/Header";
import Footer from "../components/Footer";
const FAQ = () => {
  const dispatch = useDispatch();
  const [active, setActive] = useState(1);
  const { user } = useSelector((state) => state.auth || { user: null });
  const isLoggedIn = !!user;
  const toggle = (id) => {
    setActive(active === id ? null : id);
  };

  return (
    <>
      {!isLoggedIn && <Header />}
      <div className="bg-[#0B0F19] text-white min-h-screen font-['Plus_Jakarta_Sans']">
        <header className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#0F172A] to-[#0B0F19]">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
              Everything you need to know
            </h1>
            <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              Comparing rising digital CPMs with high-impact outdoor mobility.
              Find out why the world's leading brands are pivoting back to the
              physical world.
            </p>
          </div>
        </header>

        {/* FAQ ACCORDION */}
        <main className="max-w-4xl mx-auto px-6 pb-32">
          <div className="space-y-4">
            {/* Question 1 */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-all duration-300 hover:border-red-500/30">
              <button
                onClick={() => toggle(1)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
              >
                <span className="text-lg font-bold pr-8 transition-colors group-hover:text-red-500">
                  1. Why are major brands dedicating more of their budget to
                  offline advertising?
                </span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center transition-all ${active === 1 ? "bg-red-600 border-red-600 rotate-180" : ""}`}
                >
                  <ChevronDown className="w-4 h-4 text-white" />
                </div>
              </button>
              {active === 1 && (
                <div className="p-6 pt-0 text-slate-400 leading-relaxed space-y-4">
                  <p>
                    Recent benchmarks from{" "}
                    <a
                      href="https://triplewhale.com/"
                      target="_blank"
                      className="text-red-400 hover:underline"
                    >
                      triplewhale.com
                    </a>{" "}
                    show that the{" "}
                    <strong className="text-white">
                      average cost per mille (CPM)
                    </strong>{" "}
                    for digital campaigns continues to rise, with averages
                    around <strong className="text-white">$14.29</strong>.
                  </p>
                  <p>
                    In contrast,{" "}
                    <strong className="text-white">
                      outdoor media and mobile billboard advertising deliver
                      CPMs as low as $1.25–$2.88
                    </strong>
                    , offering measurable reach at a fraction of the cost.
                  </p>
                  <p>
                    By reallocating budget toward offline channels, brands can
                    stabilize exposure, combat auction price volatility, and
                    achieve more consistent audience engagement—especially in
                    high footfall areas.
                  </p>
                </div>
              )}
            </div>

            {/* Question 2 */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-all duration-300 hover:border-red-500/30">
              <button
                onClick={() => toggle(2)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
              >
                <span className="text-lg font-bold pr-8 transition-colors group-hover:text-red-500">
                  2. What measurable performance advantages does mobile
                  billboard advertising deliver?
                </span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center transition-all ${active === 2 ? "bg-red-600 border-red-600 rotate-180" : ""}`}
                >
                  <ChevronDown className="w-4 h-4 text-white" />
                </div>
              </button>
              {active === 2 && (
                <div className="p-6 pt-0 text-slate-400 leading-relaxed space-y-4">
                  <p>
                    Mobile billboards offer{" "}
                    <strong className="text-white">
                      verified audience impressions
                    </strong>{" "}
                    through real-time tracking. Campaign performance can be
                    measured by precise route analytics, dwell-time mapping, and
                    engagement correlation via integrated QR codes.
                  </p>
                  <p>
                    Unlike digital ads that can be skipped or blocked, mobile
                    billboards deliver{" "}
                    <strong className="text-white">
                      guaranteed brand exposure
                    </strong>{" "}
                    in physical environments.
                  </p>
                  <p>
                    The combination of movement, size, and locality in high
                    traffic areas, gives advertisers both frequency and
                    memorability that outperform screen only impressions in
                    brand recall studies.
                  </p>
                </div>
              )}
            </div>

            {/* Question 3 */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-all duration-300 hover:border-red-500/30">
              <button
                onClick={() => toggle(3)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
              >
                <span className="text-lg font-bold pr-8 transition-colors group-hover:text-red-500">
                  3. How does this channel complement our existing digital
                  strategy?
                </span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center transition-all ${active === 3 ? "bg-red-600 border-red-600 rotate-180" : ""}`}
                >
                  <ChevronDown className="w-4 h-4 text-white" />
                </div>
              </button>
              {active === 3 && (
                <div className="p-6 pt-0 text-slate-400 leading-relaxed">
                  <p>
                    Outdoor campaigns act as{" "}
                    <strong className="text-white">awareness amplifiers</strong>
                    . By integrating scannable QR codes or localized hashtags,
                    brands can redirect physical views into online conversions.
                    This “offline-to-online” synergy bridges emotional
                    engagement with measurable conversion metrics.
                  </p>
                </div>
              )}
            </div>

            {/* Question 4 */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-all duration-300 hover:border-red-500/30">
              <button
                onClick={() => toggle(4)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
              >
                <span className="text-lg font-bold pr-8 transition-colors group-hover:text-red-500">
                  4. What additional benefits do I get when booking B2B adverts?
                </span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center transition-all ${active === 4 ? "bg-red-600 border-red-600 rotate-180" : ""}`}
                >
                  <ChevronDown className="w-4 h-4 text-white" />
                </div>
              </button>
              {active === 4 && (
                <div className="p-6 pt-0 text-slate-400 leading-relaxed space-y-4">
                  <p>
                    Your brand automatically receives{" "}
                    <strong className="text-white">
                      complimentary placement on our B2C partner network
                    </strong>
                    . This is enhanced with Luxury Sweepstake prizes and the{" "}
                    <strong className="text-white">
                      “Gotta Scan Them All™”
                    </strong>{" "}
                    gamified campaign, doubling the impact of your investment.
                  </p>
                  <p>
                    This integrated system increases both business decision
                    visibility and consumer engagement, producing a multi-fold
                    impact of a single marketing investment.
                  </p>
                </div>
              )}
            </div>

            {/* Question 5 */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-all duration-300 hover:border-red-500/30">
              <button
                onClick={() => toggle(5)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
              >
                <span className="text-lg font-bold pr-8 transition-colors group-hover:text-red-500">
                  5. How do outdoor CPM rates remain stable vs online
                  volatility?
                </span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center transition-all ${active === 5 ? "bg-red-600 border-red-600 rotate-180" : ""}`}
                >
                  <ChevronDown className="w-4 h-4 text-white" />
                </div>
              </button>
              {active === 5 && (
                <div className="p-6 pt-0 text-slate-400 leading-relaxed">
                  <p>
                    Outdoor CPMs are{" "}
                    <strong className="text-white">
                      asset-based and location-driven
                    </strong>{" "}
                    rather than increasing bid auction-based. Because pricing
                    depends on physical routes and traffic data, rates are far
                    less susceptible to dynamic inflation compared to AI-driven
                    digital auctions.
                  </p>
                  <p>
                    Mobile billboards maintain transparency in pricing and
                    measurable delivery. As digital platforms fluctuate due to
                    AI driven algorithms offline CPMs continue to offer
                    predictability and cost efficiency for long term campaigns.
                  </p>
                  <p>
                    Importantly The Rule 7 Media platform relies on Reverse
                    Auction Ability to advertisers and vehicle owners can
                    achieve mutually acceptable pricing.
                  </p>
                </div>
              )}
            </div>

            {/* Question 6 */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-all duration-300 hover:border-red-500/30">
              <button
                onClick={() => toggle(6)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
              >
                <span className="text-lg font-bold pr-8 transition-colors group-hover:text-red-500">
                  6. What types of industries benefit most?
                </span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center transition-all ${active === 6 ? "bg-red-600 border-red-600 rotate-180" : ""}`}
                >
                  <ChevronDown className="w-4 h-4 text-white" />
                </div>
              </button>
              {active === 6 && (
                <div className="p-6 pt-0 text-slate-400 leading-relaxed">
                  <p>
                    It is especially effective for{" "}
                    <strong className="text-white">
                      real estate, automotive, entertainment, tech events, and
                      retail activations
                    </strong>
                    . Brands with high-visibility or geographically concentrated
                    audiences see immediate benefits and high ROI.
                  </p>
                  <p>
                    Additionally because of this paradigm shift in marketing
                    that favours collaboration over competition a diverse range
                    of businesses can benefit when each stage of the purchasing
                    journey is carefully influenced with the combination of
                    Outdoor advertising and on-line carefully structured
                    messaging.
                  </p>
                  <p>
                    A wide range of businesses regardless of local or national
                    reach can benefit including: Apparel &amp; Accessories,
                    Beauty, Home &amp; Garden, Food &amp; Beverage, Sports &amp;
                    Outdoors, Toys, Art &amp; Collectibles, Electronics, Pets
                    &amp; Animals, Health &amp; Wellness, Automotive, Baby,
                    Lifestyle &amp; Boutique, Books &amp; Music, Media &amp;
                    Publishing, Travel Accessories, E-learning, Legal Services,
                    Accounting &amp; Tax Services, Real Estate &amp; Property
                    Agents, Financial and Insurance Services, Medical &amp;
                    Allied Health, Education &amp; Tutoring, Trades &amp; Home
                    Services, Automotive Services, Travel &amp; Tourism,
                    Childcare &amp; Aged Care Providers, IT &amp; Tech Support
                    Services, Printing &amp; Graphic Design, Event &amp; Wedding
                    Services, Fitness &amp; Personal Training, Local Government
                    &amp; Community Organisations, Storage, Logistics and
                    Removalists, Mobile Phone and Telecommunications,
                    Professional Training &amp; Certification, Utilities &amp;
                    Energy, Alarm &amp; Security Services, Childcare &amp;
                    Elderly Care, Recruitment &amp; Employment Agencies,
                    Translation &amp; Interpretation Services, Funeral Services
                    &amp; Bereavement Support, Veterinary Services.
                  </p>
                </div>
              )}
            </div>

            {/* Question 7 */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-all duration-300 hover:border-red-500/30">
              <button
                onClick={() => toggle(7)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
              >
                <span className="text-lg font-bold pr-8 transition-colors group-hover:text-red-500">
                  7. How do we measure return on investment for outdoor
                  campaigns?
                </span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center transition-all ${active === 7 ? "bg-red-600 border-red-600 rotate-180" : ""}`}
                >
                  <ChevronDown className="w-4 h-4 text-white" />
                </div>
              </button>
              {active === 7 && (
                <div className="p-6 pt-0 text-slate-400 leading-relaxed">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />{" "}
                      <span>
                        <strong className="text-white">GPS Reporting:</strong>{" "}
                        Verification of route coverage and duration.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />{" "}
                      <span>
                        <strong className="text-white">QR Mapping:</strong>{" "}
                        Direct engagement tracking through scans.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />{" "}
                      <span>
                        <strong className="text-white">Geo-fencing:</strong>{" "}
                        Cross-referencing with digital impressions.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />{" "}
                      <span>
                        <strong className="text-white">
                          Franchisee Monitoring:
                        </strong>{" "}
                        Our Franchisees are only as successful as their growth
                        in satisfied customers.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />{" "}
                      <span>
                        <strong className="text-white">
                          Cost per mile equivalence dashboards :
                        </strong>{" "}
                        comparing media categories.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />{" "}
                      <span>
                        <strong className="text-white">
                          Comparisons not assumptions :
                        </strong>{" "}
                        This means marketers can evaluate outdoor results
                        against digital campaigns in comparable metrics, not
                        assumptions.
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Question 8 */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-all duration-300 hover:border-red-500/30">
              <button
                onClick={() => toggle(8)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
              >
                <span className="text-lg font-bold pr-8 transition-colors group-hover:text-red-500">
                  8. How does this align with sustainable marketing goals?
                </span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center transition-all ${active === 8 ? "bg-red-600 border-red-600 rotate-180" : ""}`}
                >
                  <ChevronDown className="w-4 h-4 text-white" />
                </div>
              </button>
              {active === 8 && (
                <div className="p-6 pt-0 text-slate-400 leading-relaxed">
                  <p>
                    Modern mobile carriers use{" "}
                    <strong className="text-white">
                      low-emission or electric vehicles
                    </strong>{" "}
                    and energy-efficient digital LED displays. Compared to mass
                    print runs, digital mobile displays reduce material waste
                    while maintaining dynamic creative flexibility.
                  </p>
                </div>
              )}
            </div>

            {/* Question 9 */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-all duration-300 hover:border-red-500/30">
              <button
                onClick={() => toggle(9)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
              >
                <span className="text-lg font-bold pr-8 transition-colors group-hover:text-red-500">
                  9. What creative flexibility do mobile billboards offer?
                </span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center transition-all ${active === 9 ? "bg-red-600 border-red-600 rotate-180" : ""}`}
                >
                  <ChevronDown className="w-4 h-4 text-white" />
                </div>
              </button>
              {active === 9 && (
                <div className="p-6 pt-0 text-slate-400 leading-relaxed">
                  <ul className="grid md:grid-cols-2 gap-4">
                    <li className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                      Daypart-controlled scheduling
                    </li>
                    <li className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                      Geo-targeted creative changes
                    </li>
                    <li className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                      Integration of live campaign data
                    </li>
                    <li className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                      Real-time language adaptation
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Question 10 */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-all duration-300 hover:border-red-500/30">
              <button
                onClick={() => toggle(10)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
              >
                <span className="text-lg font-bold pr-8 transition-colors group-hover:text-red-500">
                  10. What’s the strategic takeaway for management?
                </span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center transition-all ${active === 10 ? "bg-red-600 border-red-600 rotate-180" : ""}`}
                >
                  <ChevronDown className="w-4 h-4 text-white" />
                </div>
              </button>
              {active === 10 && (
                <div className="p-6 pt-0 text-slate-400 leading-relaxed">
                  <p>
                    As{" "}
                    <strong className="text-white">
                      digital CPMs continue rising
                    </strong>{" "}
                    and audiences increasingly filter or block ads, outdoor
                    media provides a stable, high-visibility platform with
                    verifiable results. Major brands are diversifying into{" "}
                    <strong className="text-white">
                      hybrid planning models
                    </strong>{" "}
                    that pair digital analytics with the brand lift of
                    real-world visibility.
                  </p>
                  <p>
                    Ensuring consistent engagement across both physical and
                    virtual touchpoints.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      {!isLoggedIn && <Footer />}
    </>
  );
};

export default FAQ;
