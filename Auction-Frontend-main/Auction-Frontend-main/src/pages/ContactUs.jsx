import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  IoLocationOutline,
  IoCallOutline,
  IoMailOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import { getContactInfo, sendMessage } from "../store/contact/contactSlice";
import { fetchUserCountry } from "../store/countary/countrySlice";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { FooterLeaderboard, RightSkyscraper } from "../components/AdSlots";
const ContactUs = () => {
  const dispatch = useDispatch();
  const { contact = [], isLoading } = useSelector((state) => state.contactInfo);
  const { user } = useSelector((state) => state.auth);
  const isLoggedIn = !!user;
  const country = useSelector((state) => state.country.country);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    subject: "",
    message: "",
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
  });

  // Find appropriate contact info based on country
  const currentCountryContact =
    Array.isArray(contact) && contact.length > 0
      ? contact.find(
          (item) => item.country?.toLowerCase() === country?.toLowerCase(),
        ) ||
        contact.find((item) => item.country?.toLowerCase() === "australia") ||
        contact[0]
      : null;

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
    dispatch(getContactInfo());

    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [dispatch, country, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formStatus.submitted) {
      setFormStatus({ submitted: false, success: false });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setFormStatus({ submitted: true, success: false });

    dispatch(sendMessage(formData))
      .unwrap()
      .then(() => {
        setFormStatus({ submitted: true, success: true });
        toast.success(
          <div>
            <p className="font-bold">Message sent successfully!</p>
            <p className="text-sm">We've sent a confirmation to your email.</p>
          </div>,
        );
        setFormData((prev) => ({
          name: user?.name || "",
          email: user?.email || "",
          phone: "",
          subject: "",
          message: "",
        }));

        setTimeout(() => {
          setFormStatus({ submitted: false, success: false });
        }, 5000);
      })
      .catch((error) => {
        setFormStatus({ submitted: false, success: false });
        toast.error(
          error?.message || "Failed to send message. Please try again.",
        );
      });
  };

  return (
    <>
      {!isLoggedIn && <Header />}
      <main className="bg-black min-h-screen">
        {/* HERO SECTION - Exactly matching the HTML style */}
        <section className="relative min-h-[60vh] flex items-center justify-center px-4 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/40 via-black to-black"></div>
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                backgroundSize: "30px 30px",
              }}
            ></div>
          </div>

          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-[0.3em] mb-6 animate-pulse">
              Global Connectivity
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter leading-tight text-white">
              Your Vision,
              <br />
              Our Priority.
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              At Rule7Media, we don't just process requests; we forge
              partnerships. Your feedback is the catalyst for our next
              innovation.
            </p>
          </div>
        </section>
        <div class="flex flex-wrap justify-center gap-4">
          <a
            href="#contact-form"
            class="bg-red-600 text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm transition-transform duration-300 hover:-translate-y-1 active:translate-y-1"
          >
            Start a Conversation
          </a>
        </div>
        {/* COMMITMENT MESSAGE SECTION */}
        <section className="py-24 border-y border-gray-800 bg-[#0a0c10]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl font-bold leading-tight text-white">
                  Our Promise to Every Partner
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed">
                  We believe that silence is the enemy of progress. When you
                  reach out to Rule7Media, you aren't just sending an email into
                  a void. You are engaging a dedicated team of strategists and
                  engineers.
                </p>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <IoTimeOutline className="text-red-500 w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">
                        Rapid Response Protocol
                      </h4>
                      <p className="text-gray-500 text-sm">
                        Initial strategy review within 24 business hours. No
                        automated ghosting.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-blue-500 w-6 h-6"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">
                        Human-Centric Feedback
                      </h4>
                      <p className="text-gray-500 text-sm">
                        Every piece of feedback is logged and discussed in our
                        weekly product roadmap meetings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl relative z-10">
                  <h3 className="text-2xl font-bold mb-4 text-white">
                    Feedback Intelligence
                  </h3>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 w-[94%]"></div>
                    </div>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                      <span>Client Satisfaction</span>
                      <span>94%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 w-[88%]"></div>
                    </div>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                      <span>Response Speed</span>
                      <span>88%</span>
                    </div>
                  </div>
                  <div className="mt-8 pt-8 border-t border-gray-800">
                    <p className="italic text-gray-400">
                      "Rule7Media is the only agency that actually treated my
                      feedback as a feature request. Their agility is
                      unmatched."
                    </p>
                    <p className="mt-4 font-bold text-sm text-white">
                      — Director of Operations, TechFlow AU
                    </p>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/20 blur-[100px] rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT INTERFACE SECTION */}
        <section
          id="contact-form"
          className="py-24 relative overflow-hidden bg-black"
        >
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_160px] gap-8">
              {/* Left Column - Contact Cards */}
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl group hover:border-red-500/50 transition-all duration-500">
                  <IoLocationOutline className="text-red-500 w-8 h-8 mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-white">
                    Global HQ
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {currentCountryContact?.officeAddress ||
                      "6 Marina Promenade, Paradise Point, Queensland 4216, Australia"}
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl group hover:border-blue-500/50 transition-all duration-500">
                  <IoCallOutline className="text-blue-500 w-8 h-8 mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-white">
                    Direct Line
                  </h3>
                  <a
                    href={`tel:${(currentCountryContact?.phone || "0123456789").replace(/\s+/g, "")}`}
                    className="text-gray-400 text-sm hover:text-blue-400 transition-colors underline decoration-blue-500/40 hover:decoration-blue-400 underline-offset-4 inline-block"
                  >
                    {currentCountryContact?.phone || "0123456789"}
                  </a>
                  <p className="text-xs text-gray-500 mt-2">
                    Mon-Fri, 9am - 6pm AEST
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl group hover:border-purple-500/50 transition-all duration-500">
                  <IoMailOutline className="text-purple-500 w-8 h-8 mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-white">
                    Email Desk
                  </h3>
                  <a
                    href={`mailto:${currentCountryContact?.email || "Australia@rule7media.com"}`}
                    className="text-gray-400 text-sm hover:text-purple-400 transition-colors underline decoration-purple-500/40 hover:decoration-purple-400 underline-offset-4 block break-all"
                  >
                    {currentCountryContact?.email || "Australia@rule7media.com"}
                  </a>
                </div>
              </div>

              {/* Right Column - Form */}
              <div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-12 rounded-3xl">
                  <div className="mb-10">
                    <h2 className="text-3xl font-bold mb-2 text-white">
                      Send a Secure Message
                    </h2>
                    <p className="text-gray-500">
                      Our team will review and route your request to the
                      appropriate department.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                          Full Identity *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-500 transition-colors placeholder-gray-600"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@company.com"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-500 transition-colors placeholder-gray-600"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+61 400 000 000"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-500 transition-colors placeholder-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                          Subject
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="How can we help?"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-500 transition-colors placeholder-gray-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Your Vision or Feedback *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="6"
                        placeholder="Tell us about your project or how we can improve..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-500 transition-colors resize-none placeholder-gray-600"
                        required
                      ></textarea>
                    </div>

                    {formStatus.submitted && formStatus.success && (
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                        <IoCheckmarkCircleOutline className="text-green-500 text-xl flex-shrink-0" />
                        <p className="text-green-500 text-sm">
                          Message sent successfully! We'll get back to you
                          within 24 hours.
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full glow-button bg-white text-black font-bold py-5 rounded-xl uppercase tracking-widest text-sm hover:bg-red-600 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Dispatching...
                        </span>
                      ) : (
                        "Dispatch Message"
                      )}
                    </button>

                    <p className="text-center text-[10px] text-gray-600 uppercase tracking-widest mt-4">
                      Encrypted transmission secure • No third-party sharing
                    </p>
                  </form>
                </div>
              </div>
              <div className="self-start mt-2">
                <RightSkyscraper />
              </div>
            </div>
            <div className="mt-10 flex justify-center px-4">
              <div className="w-full max-w-[728px]">
                <FooterLeaderboard />
              </div>
            </div>
          </div>
        </section>
      </main>
      {!isLoggedIn && <Footer />}
    </>
  );
};

export default ContactUs;
