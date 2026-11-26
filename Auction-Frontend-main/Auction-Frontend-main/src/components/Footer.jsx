import { useState, useEffect } from "react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaArrowRight,
  FaShieldAlt,
  FaLock,
  FaPhone,
} from "react-icons/fa";
import { useLocation } from "react-router-dom";
import Truck from "../assets/truck2.png";
import { Clapperboard } from "lucide-react";
import logo from "../assets/logo2.jpg";
import { useDispatch, useSelector } from "react-redux";
import { getContactInfo } from "../store/contact/contactSlice";
import { Link } from "react-router-dom";
import {
  subscribeUser,
  resetSubscription,
} from "../store/subscription/subscriptionSlice";
import { fetchUserCountry } from "../store/countary/countrySlice";
import enLocale from "i18n-iso-countries/langs/en.json";
import countries from "i18n-iso-countries";
import { setCountry } from "../store/countary/countrySlice";
import { Line } from "react-chartjs-2";
import { toast } from "react-toastify";

const Footer = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const { pathname } = useLocation();
  const { contact = [] } = useSelector((state) => state.contactInfo);

  const { loading, success, error } = useSelector(
    (state) => state.subscription,
  );
  const country = useSelector((state) => state.country.country);

  countries.registerLocale(enLocale);
  const countryCode = countries.getAlpha2Code(country, "en");

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [country, dispatch]);

  useEffect(() => {
    dispatch(getContactInfo());
  }, [dispatch]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  const [isFooterSubmitting, setIsFooterSubmitting] = useState(false);

  const handleSubscribe = () => {
    if (email && countryCode) {
      setIsFooterSubmitting(true);
      dispatch(subscribeUser({ email, countryCode }));
    }
  };

  useEffect(() => {
    if (success && isFooterSubmitting) {
      toast.success("Subscribed successfully!");
      setEmail("");
      setIsFooterSubmitting(false);
      dispatch(resetSubscription());
    }
    if (error && isFooterSubmitting) {
      toast.error(`Error: ${error}`);
      setIsFooterSubmitting(false);
      dispatch(resetSubscription());
    }
  }, [success, error, isFooterSubmitting, dispatch]);

  const navigation = [
    { name: "Case Studies", link: "/firstmover" },
    { name: "White Paper", link: "/whitepaper" },
    { name: "Global Offices", link: "/about-us#global-offices" },
    { name: "How it Works", link: "/how-it-works" },
    { name: "Live Auctions", link: "/liveauction" },
    { name: "Pricing Methodology", link: "/pricing-info" },
  ];

  const resources = [
    { name: "Franchise Opportunities", link: "/franchise" },
    { name: "Advertise with Us", link: "/AncillaryAdvertisers" },
    { name: "Affiliate Program", link: "/affiliate" },
    { name: "Industry News", link: "/blog" },
    { name: "Client Portal", link: "/login" },
    { name: "Campaign Monitoring", link: "/liveauction" },
    { name: "Audience Targeting", link: "/pricing-info" },
  ];

  const protocol = [
    { name: "Terms of Use", link: "/terms-conditions" },
    { name: "Privacy Policy", link: "/privacy-policy" },
    { name: "Career Hub", link: "/Careers" },
    { name: "Contact Us", link: "/contact-us" },
    { name: "Help Centre", link: "/contact-us" },
  ];

  return (
    <footer className="bg-[#08121c] text-white">
      {/* Subscribe Section */}
      {/* <section className="relative bg-gradient-to-r from-red-700 to-red-800 py-12 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-1/2 px-4 py-6">
              <div className="max-w-lg">
                <p className="text-lg font-semibold text-white opacity-90">
                  Right into Your Mailbox
                </p>
                <h2 className="text-3xl lg:text-4xl font-bold text-white uppercase py-3">
                  Subscribe to Isuzu News & Offers
                </h2>

                <div className="mt-8 relative">
                  <div className="flex flex-col sm:flex-row">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-5 py-4 rounded-l-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600 border-0"
                    />
                    <button
                      onClick={handleSubscribe}
                      disabled={loading}
                      className="bg-black text-white font-bold px-6 py-4 rounded-r-lg hover:bg-gray-900 transition duration-300 mt-2 sm:mt-0 flex items-center justify-center"
                    >
                      {loading ? "Subscribing..." : "Subscribe"}
                      <FaArrowRight className="ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 px-4">
              <div className="relative">
                <img
                  src={Truck}
                  className="w-full object-cover"
                  alt="Isuzu Truck"
                />
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Main Footer - 4:3 Ratio */}
      <div className="w-full px-10 lg:px-20 py-16">
        <div className="flex flex-col lg:flex-row gap-14">
          {/* LEFT SECTION - 4 parts */}
          <div className="lg:w-[50%] space-y-6">
            <Link to="/" className="relative inline-flex flex-col items-start group cursor-pointer">
              <div className="flex items-center gap-3 relative z-10">
                {/* Icon instead of img */}
                <div className="w-10 h-10 flex items-center justify-center bg-red-600 rounded-xl text-white shadow-lg shadow-red-200 transition-transform group-hover:rotate-12">
                  <Clapperboard className="lucide lucide-clapperboard w-8 h-8" />
                </div>

                {/* Logo Text */}
                <h2 className="text-3xl font-bold tracking-wide">
                  <span className="text-white">Rule7</span>
                  <span className="text-red-600">Media</span>
                </h2>
              </div>

              {/* Glow / shadow effect below logo */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-32 h-6 bg-red-600/50 blur-2xl rounded-full"></div>
            </Link>

            <p className="text-1xl font-semibold leading-tight">
              A global ecosystem for high end digital storytelling and
              operational excellence.
            </p>

            <p className="text-gray-400 text-base">
              Revolutionising the Advertising Landscape through collaborative
              mobility and transparent auction based pricing.
            </p>

            <p className="border-l-4 border-red-600 pl-4 text-gray-300 text-base">
              Redefining Contextual Advertising Solutions. Driven by First Party
              Data. Powered by Human Curated Ad Channels.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-gray-300">
              <a
                href="tel:+61449532492"
                className="inline-flex items-center gap-3 text-white hover:text-red-500 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                  <FaPhone className="text-red-500 group-hover:text-white text-xs transition-colors" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-gray-400">Direct Line & Support</span>
                  <span className="font-bold tracking-wide text-sm">+61 449 532 492</span>
                </div>
              </a>
            </div>
          </div>

          {/* RIGHT SECTION - 3 parts (divided into 4 columns) */}
          <div className="lg:w-[50%]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* NAVIGATION */}
              <div>
                <h3 className="font-bold mb-5 uppercase text-sm tracking-wider text-white">
                  Navigation
                </h3>
                <ul className="space-y-3 text-gray-400">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.link}
                        className="hover:text-red-600 transition text-sm"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* RESOURCES */}
              <div>
                <h3 className="font-bold mb-5 uppercase text-sm tracking-wider text-white">
                  Resources
                </h3>
                <ul className="space-y-3 text-gray-400">
                  {resources.map((item) => (
                    <li key={item.name}>
                      {item.link.startsWith("http") ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-red-600 transition text-sm"
                        >
                          {item.name}
                        </a>
                      ) : (
                        <Link
                          to={item.link}
                          className="hover:text-red-600 transition text-sm"
                        >
                          {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* PROTOCOL + SECURITY */}
              <div>
                <h3 className="font-bold mb-5 uppercase text-sm tracking-wider text-white">
                  Protocol
                </h3>
                <ul className="space-y-3 text-gray-400">
                  {protocol.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.link}
                        className="hover:text-red-600 transition text-sm"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 space-y-1 text-[10px] text-gray-400 uppercase tracking-tight">
                  <div className="flex items-center gap-1.5 opacity-80">
                    <FaShieldAlt className="text-green-600 text-xs" />
                    ISO 27001 Secure
                  </div>

                  <div className="flex items-center gap-1.5 opacity-80">
                    <FaLock className="text-green-600 text-xs" />
                    AES-256 Encryption
                  </div>
                </div>
              </div>

              {/* SOCIAL CONNECT */}
              <div>
                <h3 className="font-bold mb-5 uppercase text-sm tracking-wider text-white">
                  Social Connect
                </h3>
                <div className="flex flex-col gap-3 text-gray-400">
                  <a
                    href="https://www.facebook.com/people/Rule-7-Media/61578118663553/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-red-600 transition text-sm"
                  >
                    <FaFacebook /> Facebook
                  </a>
                  <a
                    href="https://www.instagram.com/rule.7media"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-red-600 transition text-sm"
                  >
                    <FaInstagram /> Instagram
                  </a>
                  <a
                    href="https://www.youtube.com/@Rule7Media"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-red-600 transition text-sm"
                  >
                    <FaYoutube /> YouTube
                  </a>
                  <a
                    href="https://x.com/Rule7Media"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-red-600 transition text-sm"
                  >
                    <FaTwitter /> X
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Exactly as in image */}
      <div className="border-t border-gray-700 py-6 text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left uppercase tracking-wide">
            © RULE7MEDIA. All Rights Reserved.
          </div>

          <div className="flex items-center gap-6 text-xs tracking-wide">
            <span>Cinematic Quality</span>
            <span className="opacity-40">|</span>
            <span>Digital Precision</span>
            <span className="opacity-40">|</span>
            <span>Global Impact</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
