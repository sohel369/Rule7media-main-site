import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPrivacy } from "../store/privacy/privacySlice";
import linkifyHtml from "linkify-html";
import Header from "../components/Header";
import Footer from "../components/Footer";

const PrivacyPolicy = () => {
  const dispatch = useDispatch();
  const { privacy, isLoading, isError, message } = useSelector(
    (state) => state.privacy,
  );

  const [countryCode, setCountryCode] = useState("default");

  const countryNames = {
    US: "United States",
    CA: "Canada",
    AU: "Australia",
    CN: "China",
    JP: "Japan",
    IN: "India",
    TH: "Thailand",
    ID: "Indonesia",
    ES: "Spain",
    FR: "France",
    GB: "United Kingdom",
    default: "Australia",
  };

  useEffect(() => {
    const getCountry = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        setCountryCode(data.country_code?.toUpperCase() || "default");
      } catch {
        setCountryCode("default");
      }
    };
    getCountry();
  }, []);

  useEffect(() => {
    if (countryCode) dispatch(fetchPrivacy(countryCode));
  }, [dispatch, countryCode]);

  const { user } = useSelector((state) => state.auth || { user: null });
  const isLoggedIn = !!user;

  const privacyContent = privacy?.policies
    ? privacy.policies[countryCode] ||
      privacy.policies["AU"] ||
      privacy.policies["default"]
    : null;

  const linkedContent = privacyContent
    ? linkifyHtml(privacyContent, {
        defaultProtocol: "https",
        target: "_blank",
        rel: "noopener noreferrer",
      })
    : "";

  return (
    <>
      {!isLoggedIn && <Header />}

      <div className="bg-black min-h-screen text-white">
        {/* Hero Section */}
        <section className="text-center py-20 px-6 border-b border-zinc-800">
          <div className="max-w-5xl mx-auto">
            <div className="inline-block px-5 py-2 rounded-full border border-[#FF3D00]/30 bg-[#FF3D00]/10 text-[#FF3D00] text-xs font-bold uppercase tracking-widest mb-6">
              LEGAL DOCUMENTATION
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              Privacy{" "}
              <span className="bg-gradient-to-r from-[#FF3D00] to-[#FFB300] bg-clip-text text-transparent">
                Policy
              </span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              How we collect, manage, and protect your personal information at
              Rule 7 Media ™.
            </p>
          </div>
        </section>

        <main className="max-w-5xl mx-auto px-6 py-16 space-y-12">
          {isError && (
            <div className="p-5 bg-red-900/30 border border-red-500/50 text-red-400 rounded-2xl">
              Error: {message}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin h-14 w-14 border-4 border-zinc-700 border-t-[#FF3D00] rounded-full"></div>
            </div>
          ) : (
            <>
              {/* Dynamic Content Section (Introduction + All Backend Content) */}
              {privacyContent ? (
                <div className="bg-zinc-900/95 border border-white/10 rounded-3xl p-10 md:p-14">
                  <div
                    className="policy-section prose prose-invert max-w-none text-zinc-200 leading-relaxed text-[15.5px]"
                    dir="ltr"
                    style={{ direction: "ltr", textAlign: "left" }}
                    dangerouslySetInnerHTML={{ __html: linkedContent }}
                  />
                </div>
              ) : (
                <div className="text-center py-20 text-zinc-500 text-lg bg-zinc-900/70 border border-white/10 rounded-3xl p-12">
                  No privacy policy content available for your country at this
                  time.
                </div>
              )}

              {/* Fixed Styled Sections - Same as Screenshot */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-zinc-900/95 border border-white/10 rounded-3xl p-9">
                  <h2 className="text-[#FF3D00] text-xl font-bold mb-6 flex items-center gap-4">
                    <span className="text-3xl">📋</span> INFORMATION WE COLLECT
                  </h2>
                  <ul className="space-y-4 text-zinc-400 text-[15px]">
                    <li>• Name, title, and contact details</li>
                    <li>• Age, date of birth, and demographics</li>
                    <li>• Location data and interaction history</li>
                    <li>• Passwords and sensitive survey info</li>
                  </ul>
                </div>

                <div className="bg-zinc-900/95 border border-white/10 rounded-3xl p-9">
                  <h2 className="text-[#FF3D00] text-xl font-bold mb-6 flex items-center gap-4">
                    <span className="text-3xl">🔒</span> SECURITY MEASURES
                  </h2>
                  <p className="text-zinc-400 leading-relaxed">
                    We implement physical, electronic, and managerial procedures
                    including VPNs, firewalls, and secure servers to protect
                    your data from unauthorized access.
                  </p>
                </div>
              </div>

              {/* Marketing Section */}
              <div className="bg-zinc-900/95 border border-l-4 border-l-[#FF3D00] border-white/10 rounded-3xl p-10">
                <h2 className="text-[#FF3D00] text-xl font-bold mb-6">
                  MARKETING &amp; ADVERTISING
                </h2>
                <p className="text-zinc-400 mb-8">
                  We target and measure the performance of ads to users using
                  technologies like web beacons, pixels, ad tags, and cookies.
                </p>
                <div className="bg-black/70 rounded-2xl p-6">
                  <h4 className="text-white font-semibold mb-4">
                    Targeting Partners:
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {["Google AdX", "Nielsen", "Roy Morgan", "Criteo"].map(
                      (partner) => (
                        <span
                          key={partner}
                          className="px-5 py-2 bg-zinc-800 rounded-full text-sm text-zinc-300"
                        >
                          {partner}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* Your Rights */}
              <div className="bg-zinc-900/95 border border-white/10 rounded-3xl p-10">
                <h2 className="text-[#FF3D00] text-xl font-bold mb-8">
                  YOUR RIGHTS
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div>
                    <h4 className="font-semibold text-white mb-3">Access</h4>
                    <p className="text-zinc-400 text-sm">
                      Request a copy of your personal data stored in our systems
                      at any time via email.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-3">
                      Correction
                    </h4>
                    <p className="text-zinc-400 text-sm">
                      Notify us to rectify inaccurate, out-of-date, or
                      incomplete information free of charge.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-3">Deletion</h4>
                    <p className="text-zinc-400 text-sm">
                      Permanently delete your account. Data removal may take up
                      to 90 days from backup systems.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-3xl p-12 text-center">
                <h3 className="text-3xl font-bold mb-4">
                  Want to manage your preferences?
                </h3>
                <p className="text-zinc-400 max-w-md mx-auto mb-8">
                  You can opt out of receiving communications by clicking the
                  "unsubscribe" link in our emails or by contacting our support
                  team.
                </p>
                <a
                  href="mailto:privacy@rule7media.com"
                  className="inline-block bg-[#FF3D00] hover:bg-orange-600 transition-colors px-10 py-4 rounded-full font-bold text-lg"
                >
                  Contact Privacy Officer
                </a>
              </div>
            </>
          )}
        </main>
      </div>

      {!isLoggedIn && <Footer />}
    </>
  );
};

export default PrivacyPolicy;
