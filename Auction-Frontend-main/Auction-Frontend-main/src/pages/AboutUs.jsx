import { Link, useLocation } from "react-router-dom";
import {
  IoLocationOutline,
  IoCallOutline,
  IoMailOutline,
  IoMenu,
  IoClose,
} from "react-icons/io5";
import { useEffect, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Truck2 from "../assets/truck2.png";
import About from "../assets/about-banner.jpg";
import Abouts from "../assets/about.jpg";
import { useDispatch, useSelector } from "react-redux";
import { getExecutives } from "../store/executives/executiveSlice";
import baseUrl from "../config.js";
import { getContactInfo } from "../store/contact/contactSlice";
import { fetchUserCountry } from "../store/countary/countrySlice";
import { setCountry } from "../store/countary/countrySlice";
import GlobalHubsGlobe from "../components/GlobalHubsGlobe";
import {
  FaFilm,
  FaTv,
  FaBroadcastTower,
  FaLayerGroup,
  FaCamera,
  FaGlobe,
  FaArrowRight,
  FaUser,
} from "react-icons/fa";
import { Clapperboard } from "lucide-react";
import { FiMapPin, FiMail, FiPhone } from "react-icons/fi";
import { LeftSkyscraper, RightSkyscraper } from "../components/AdSlots.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const AboutUs = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  
  // Contact Modal State
  const [selectedContact, setSelectedContact] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Executive Modal State
  const [selectedExecutive, setSelectedExecutive] = useState(null);
  const [isExecutiveModalOpen, setIsExecutiveModalOpen] = useState(false);
  
  const {
    data: executives,
    loading,
    error,
  } = useSelector((state) => state.executives);
  const country = useSelector((state) => state.country.country);
  const { user } = useSelector((state) => state.auth || { user: null });
  const isLoggedIn = !!user;
  const { contact, isLoading } = useSelector((state) => state.contactInfo);
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
      fetch("https://ipapi.co/json/")
        .then((res) => res.json())
        .then((data) => {
          if (data.country_name) {
            dispatch(setCountry(data.country_name));
          }
        })
        .catch(() => {
          dispatch(setCountry("Australia"));
        });
    }
  }, [country, dispatch]);
  
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);
  
  useEffect(() => {
    dispatch(getExecutives());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getContactInfo());
  }, [dispatch]);

  const getImageUrl = (photoUrl) => {
    if (!photoUrl) return "https://via.placeholder.com/150?text=No+Image";
    if (photoUrl.startsWith("http") || photoUrl.startsWith("data:"))
      return photoUrl;
    const path = photoUrl.startsWith("/") ? photoUrl : `/${photoUrl}`;
    return `${baseUrl}${path}`;
  };

  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();
    emailjs
      .sendForm("example_service", "example_template", form.current, {
        publicKey: "example_public_key",
      })
      .then(
        () => {
          toast.success("Email Sent Successfully.", { autoClose: 1000 });
          form.current.reset();
        },
        () => {
          toast.error("Error Sending Email.");
        },
      );
  };

  // Contact Modal Component - Sirf Executive ke liye, Global Offices ke liye nahi
  const ContactModalJSX = () => {
    if (!isModalOpen || !selectedContact) return null;
    
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        ></div>
        <div className="relative bg-[#0a0f1f] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl p-8 md:p-10">
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
          >
            <IoClose className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center">
              <FiMapPin className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{selectedContact.country}</h3>
              <p className="text-slate-400 text-sm">Office Location</p>
            </div>
          </div>

          {selectedContact.image && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-slate-800">
              <img 
                src={selectedContact.image.startsWith('http') ? selectedContact.image : `${baseUrl}${selectedContact.image}`}
                alt={selectedContact.country}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          <div className="mb-6">
            <h4 className="text-sm font-bold text-rose-500 uppercase tracking-wider mb-3">
              About This Office
            </h4>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">
              {selectedContact.description || "No description available for this location."}
            </p>
          </div>

          <div className="space-y-4 border-t border-slate-800 pt-6">
            <div className="flex items-start gap-3">
              <FiMail className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider">Email</p>
                <a href={`mailto:${selectedContact.email}`} className="text-white hover:text-rose-500 transition-colors">
                  {selectedContact.email}
                </a>
              </div>
            </div>
            
            {selectedContact.phone && (
              <div className="flex items-start gap-3">
                <FiPhone className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider">Phone</p>
                  <a href={`tel:${selectedContact.phone}`} className="text-white hover:text-rose-500 transition-colors">
                    {selectedContact.phone}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <FiMapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider">Address</p>
                <p className="text-white">{selectedContact.officeAddress}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Executive Modal Component
  const ExecutiveModalJSX = () => {
    if (!isExecutiveModalOpen || !selectedExecutive) return null;
    
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsExecutiveModalOpen(false)}
        ></div>
        <div className="relative bg-[#0a0f1f] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl p-8 md:p-10">
          <button
            onClick={() => setIsExecutiveModalOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
          >
            <IoClose className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-800 border-2 border-rose-500/30">
              {selectedExecutive.photoUrl ? (
                <img
                  src={getImageUrl(selectedExecutive.photoUrl)}
                  alt={selectedExecutive.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaUser className="w-10 h-10 text-slate-600" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{selectedExecutive.name}</h3>
              <p className="text-rose-500 font-bold text-sm uppercase tracking-wider">
                {selectedExecutive.position}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-bold text-rose-500 uppercase tracking-wider mb-3">
              Biography
            </h4>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">
              {selectedExecutive.bio || "No biography available for this executive."}
            </p>
          </div>

          {selectedExecutive.email && (
            <div className="flex items-start gap-3 border-t border-slate-800 pt-6">
              <FiMail className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider">Email</p>
                <a href={`mailto:${selectedExecutive.email}`} className="text-white hover:text-rose-500 transition-colors">
                  {selectedExecutive.email}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-[#020617] text-slate-200 overflow-x-hidden">
        {!isLoggedIn && <Header />}
        
        <div className="flex">
          <div className="hidden xl:block w-[160px] sticky top-20 h-screen ml-10">
            <LeftSkyscraper />
          </div>

          <div className="flex-1">
            <section className="pt-32 pb-20 hero-gradient relative">
              <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                <div className="reveal active">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold uppercase tracking-wider mb-6 border border-rose-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    Global Creative Leadership
                  </div>
                  <h1 className="text-6xl lg:text-7xl font-bold leading-[1.1] serif mb-8 text-white">
                    Crafting <span className="italic text-rose-500">Human</span>{" "}
                    Experiences in a Digital World.
                  </h1>
                  <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-lg">
                    Rule7Media is a global collective of strategists, financiers
                    marketing executives, movie industry veterans, and
                    technologists. We build bridge between brands and their
                    audiences through storytelling that breathes.
                  </p>
                </div>

                <div
                  className="relative reveal active"
                  style={{ transitionDelay: "200ms" }}
                >
                  <div className="aspect-square bg-slate-900 rounded-[3rem] overflow-hidden relative floating shadow-2xl border border-slate-800">
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <GlobalHubsGlobe contacts={contact} />
                    </div>

                    <div className="absolute bottom-8 left-8 right-8 bg-slate-950/90 backdrop-blur p-6 rounded-2xl shadow-lg border border-slate-800">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 text-emerald-400 rounded-full flex items-center justify-center">
                          <FaGlobe className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            Global Coverage
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            {contact?.length || 0} Global Hubs & Growing
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-6 -right-6 w-32 h-32 bg-rose-500/10 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-pulse"></div>
                  <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/10 rounded-full mix-blend-screen filter blur-xl opacity-70"></div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <section className="py-12 border-y border-slate-900 bg-[#020617] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-600 mb-10 italic">
              Trusted by world-leading entertainment partners
            </p>

            <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-40">
              <div className="flex items-center gap-2 font-black text-xl text-white">
                <FaFilm className="w-6 h-6" />
                STUDIO 24
              </div>

              <div className="flex items-center gap-2 font-black text-xl text-white">
                <FaTv className="w-6 h-6" />
                METRO NET
              </div>

              <div className="flex items-center gap-2 font-black text-xl text-white">
                <FaBroadcastTower className="w-6 h-6" />
                GLOBAL BROADCAST
              </div>

              <div className="flex items-center gap-2 font-black text-xl text-white">
                <FaLayerGroup className="w-6 h-6" />
                VIRTUAL CORE
              </div>

              <div className="flex items-center gap-2 font-black text-xl text-white">
                <FaCamera className="w-6 h-6" />
                LENS MASTER
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 lg:py-16 my-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <img src={About} className="w-full rounded-xl" alt="About Us" />
            <div>
              <h2 className="text-4xl font-bold mb-4">Who We Are</h2>
              <p className="text-lg text-gray-600">
                We are a globally recognized company committed to excellence in
                service, innovation, and customer satisfaction. Our mission is
                to empower businesses and individuals through cutting-edge
                solutions.
              </p>
            </div>
          </div>
        </div>

        {/* Executive Section with Read More Button */}
        <section className="py-24 bg-[#020617]" id="team">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 reveal active">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-bold serif mb-6 text-white">
                  Led by <span className="text-rose-500">Visionaries</span>
                </h2>
                <p className="text-lg text-slate-400">
                  Our executive team combines decades of Hollywood-grade
                  production and marketing experience with revolutionary
                  disruptive energy.
                </p>
              </div>
              <div className="mt-8 md:mt-0">
                <Link
                  to="/Careers"
                  className="text-rose-500 font-bold flex items-center gap-2 hover:gap-4 transition-all"
                >
                  Join Our Collective
                  <FaArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-16">
              {executives?.map((executive, index) => {
                // Short bio preview
                const shortBio = executive.bio 
                  ? executive.bio.length > 80 
                    ? executive.bio.substring(0, 80) + '...' 
                    : executive.bio
                  : 'No biography available';

                return (
                  <div
                    key={executive.id}
                    className="group reveal active flex flex-col h-full"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 aspect-[4/5] mb-6 shadow-inner border border-slate-800">
                      {executive.photoUrl ? (
                        <img
                          src={getImageUrl(executive.photoUrl)}
                          alt={executive.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center italic text-slate-700 font-serif">
                          <FaUser className="w-16 h-16 opacity-30 text-slate-600" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-1 text-white">
                      {executive.name}
                    </h3>
                    <p className="text-rose-500 font-bold text-sm uppercase tracking-wider mb-3">
                      {executive.position}
                    </p>
                    
                    {/* Bio preview */}
                    <p className="text-slate-400 text-sm leading-relaxed flex-grow mb-4">
                      {shortBio}
                    </p>
                    
                    {/* Read More Button - Only for Executives */}
                    <button
                      onClick={() => {
                        setSelectedExecutive(executive);
                        setIsExecutiveModalOpen(true);
                      }}
                      className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-rose-900/20"
                    >
                      <span>Read More</span>
                      <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="relative w-full h-[500px]">
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387190.2799073944!2d-74.25987564068354!3d40.6976700631197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259ad18c3ef97%3A0x4fdd83e3e687f1a!2s307%20W%2038th%20St%2C%20New%20York%2C%20NY%2010018%2C%20USA!5e0!3m2!1sen!2sus!4v1712345678901"
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>

        {/* Global Offices Section - Without View Details Button */}
        <section id="global-offices" className="py-24 relative">
          <div className="max-w-[1600px] mx-auto px-10 grid grid-cols-1 xl:grid-cols-[1fr_160px] gap-6">
            <div>
              <div className="text-center mb-20 reveal active">
                <h2 className="text-4xl md:text-5xl font-bold serif mb-6 text-white">
                  Our Global <span className="text-rose-500">Pulse</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Strategically located to serve the world's most dynamic
                  markets.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 reveal active">
                {contact?.map((item, index) => {
                  const colors = [
                    "bg-rose-500/10 text-rose-500",
                    "bg-blue-500/10 text-blue-500",
                    "bg-amber-500/10 text-amber-500",
                    "bg-emerald-500/10 text-emerald-500",
                  ];

                  return (
                    <div
                      key={item._id}
                      className="p-8 bg-slate-900/40 rounded-3xl backdrop-blur border border-transparent transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl hover:bg-slate-800/60 hover:border-red-500/40"
                    >
                      <div
                        className={`w-12 h-12 ${colors[index % 4]} rounded-2xl flex items-center justify-center mb-6`}
                      >
                        <FiMapPin className="w-6 h-6" />
                      </div>

                      <h4 className="text-xl font-bold mb-2 text-white">
                        {item.country}
                      </h4>

                      <p className="text-slate-400 text-sm whitespace-pre-line">
                        {item.officeAddress}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <div className="sticky top-24 w-full lg:w-[160px]">
                <RightSkyscraper />
              </div>
            </div>
          </div>
        </section>

        {!isLoggedIn && <Footer />}
        
        {/* Modals */}
        <ContactModalJSX />
        <ExecutiveModalJSX />
        

      </div>
    </>
  );
};

export default AboutUs;