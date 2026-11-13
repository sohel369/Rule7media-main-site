import React, { useState } from "react";
import {
  Clapperboard,
  ChevronDown,
  Zap,
  Settings,
  Eye,
  HelpCircle,
  Globe,
  TrendingDown,
  Megaphone,
  Gavel,
  Menu,
  X,
  CheckCircle2,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
const Careers = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeJob, setActiveJob] = useState(null);

  const jobs = [
    {
      id: 1,
      country: "Australia",
      flag: "🇦🇺",
      title: "Senior Web Architect",
      cat: "Web Development",
      level: "Senior",
      desc: "Directing full-stack architecture for high-traffic Australian media assets.",
      details:
        "Lead the technical roadmap for our Sydney and Melbourne digital hubs. Requires 8+ years Experience in React/Next.js. Must be Australian based for time-zone alignment.",
      requirements: [
        "Architectural Design",
        "Team Mentorship",
        "Performance Optimization",
      ],
      lang: "English (Native/Fluent)",
    },
    {
      id: 2,
      country: "United Kingdom",
      flag: "🇬🇧",
      title: "Marketing Strategist",
      cat: "Marketing",
      level: "Middle Management",
      desc: "Driving brand growth across EMEA markets from a UK remote base.",
      details:
        "Managing cross-channel campaigns for UK-tier clients. Developing localized content strategies and overseeing junior executive output.",
      requirements: ["Data Analytics", "Brand Strategy", "Budget Management"],
      lang: "English",
    },
    {
      id: 3,
      country: "USA",
      flag: "🇺🇸",
      title: "Sweepstake Manager",
      cat: "Sweepstake Management",
      level: "Senior",
      desc: "Managing high-stakes compliance and digital entry systems for US promotions.",
      details:
        "Ensure legal compliance across 50 states for major digital giveaways. Technical oversight of randomized selection algorithms.",
      requirements: ["Legal Compliance", "Backend Logic", "Auditing"],
      lang: "English",
    },
    {
      id: 4,
      country: "Canada",
      flag: "🇨🇦",
      title: "Affiliate Associate",
      cat: "Affiliate Marketing",
      level: "Junior",
      desc: "Entry-level role managing partner relations and link tracking.",
      details:
        "Support the North American affiliate team with daily reporting and partner onboarding. Perfect for recent graduates.",
      requirements: [
        "Excel Proficiency",
        "Communication",
        "Attention to Detail",
      ],
      lang: "English / French Bilingual preferred",
    },
    {
      id: 5,
      country: "China",
      flag: "🇨🇳",
      title: "Social Media Expert",
      cat: "Social Media",
      level: "Middle Management",
      desc: "Navigating the WeChat and Douyin ecosystem for global brands.",
      details:
        "Strategic management of Chinese social platforms. Interfacing between global HQ and regional user bases.",
      requirements: [
        "Mandarin Proficiency",
        "Platform Expertise",
        "Viral Content Creation",
      ],
      lang: "Mandarin / English",
    },
    {
      id: 6,
      country: "Japan",
      flag: "🇯🇵",
      title: "Franchise Coordinator",
      cat: "Franchise",
      level: "Middle Management",
      desc: "Expanding Rule7Media licensing within the East Asian market.",
      details:
        "Identify and vet potential franchise partners in Tokyo and Osaka. Localize franchise agreements for Japanese regulatory compliance.",
      requirements: ["Negotiation", "Market Research", "B2B Sales"],
      lang: "Japanese (N1) / English",
    },
    {
      id: 7,
      country: "India",
      flag: "🇮🇳",
      title: "Backend Developer",
      cat: "Web Development",
      level: "Middle Management",
      desc: "Scaling high-concurrency Node.js services for global traffic.",
      details:
        "Work with our Gurgaon-linked remote team to optimize database queries and server-side logic for the Viral Engine.",
      requirements: ["Node.js", "PostgreSQL", "Microservices"],
      lang: "English / Hindi",
    },
    {
      id: 8,
      country: "France",
      flag: "🇫🇷",
      title: "Marketing Creative",
      cat: "Marketing",
      level: "Junior",
      desc: "Designing visual narratives for the European market.",
      details:
        "Supporting the creative director with localized assets for French-speaking territories. Focus on high-impact visual storytelling.",
      requirements: ["Adobe Suite", "Creativity", "Typography"],
      lang: "French (Native) / English",
    },
    {
      id: 9,
      country: "Spain",
      flag: "🇪🇸",
      title: "Social Community Lead",
      cat: "Social Media",
      level: "Middle Management",
      desc: "Engaging the Spanish-speaking digital audience.",
      details:
        "Managing moderation and engagement across Twitter and Instagram for our Spanish ventures. High level of autonomy.",
      requirements: ["Copywriting", "Moderation", "Engagement Metrics"],
      lang: "Spanish (Native) / English",
    },
    {
      id: 10,
      country: "Germany",
      flag: "🇩🇪",
      title: "Web Security Lead",
      cat: "Web Development",
      level: "Senior",
      desc: "Securing our European infrastructure with German precision.",
      details:
        "Implementing ISO-standard security protocols across all remote environments. Leading security audits and vulnerability testing.",
      requirements: ["Cybersecurity", "Network Architecture", "Compliance"],
      lang: "German / English",
    },
    {
      id: 11,
      country: "Italy",
      flag: "🇮🇹",
      title: "Affiliate Director",
      cat: "Affiliate Marketing",
      level: "Senior",
      desc: "Leading the Southern European affiliate network.",
      details:
        "Strategic oversight of high-value partnerships in Italy and surrounding regions. Responsible for multimillion-euro revenue streams.",
      requirements: ["Leadership", "Strategic Planning", "Network Growth"],
      lang: "Italian / English",
    },
    {
      id: 12,
      country: "Latin America",
      flag: "🌎",
      title: "Regional Franchise Manager",
      cat: "Franchise",
      level: "Senior",
      desc: "Driving growth across LATAM territories.",
      details:
        "Coordinate with local entrepreneurs to establish Rule7Media hubs in Brazil, Mexico, and Argentina.",
      requirements: ["Cross-cultural Communication", "Strategy", "Expansion"],
      lang: "Spanish / Portuguese / English",
    },
    {
      id: 13,
      country: "Indonesia",
      flag: "🇮🇩",
      title: "Content Developer",
      cat: "Social Media",
      level: "Junior",
      desc: "Creating mobile-first content for the SE Asia market.",
      details:
        "Focus on short-form video production and local trend analysis for the Indonesian demographic.",
      requirements: ["Video Editing", "Trend Spotting", "Agility"],
      lang: "Indonesian / English",
    },
    {
      id: 14,
      country: "Thailand",
      flag: "🇹🇭",
      title: "SEO Specialist",
      cat: "Marketing",
      level: "Middle Management",
      desc: "Optimizing regional reach in South East Asia.",
      details:
        "Technical SEO and keyword strategy for the Thai-speaking web. Linking global campaigns to local search intent.",
      requirements: ["SEO Tools", "Analytics", "Keyword Mapping"],
      lang: "Thai / English",
    },
    {
      id: 15,
      country: "Philippines",
      flag: "🇵🇭",
      title: "QA Engineer",
      cat: "Web Development",
      level: "Middle Management",
      desc: "Ensuring flawless execution of all web platforms.",
      details:
        "Remote testing lead based in the Philippines. Automated and manual testing for all production releases.",
      requirements: ["Selenium", "Bug Tracking", "Test Cases"],
      lang: "English / Tagalog",
    },
    {
      id: 16,
      country: "Africa",
      flag: "🌍",
      title: "Digital Growth Lead",
      cat: "Marketing",
      level: "Senior",
      desc: "Leading market entry strategies for emerging African economies.",
      details:
        "Identifying high-growth opportunities in Nigeria, Kenya, and South Africa. Orchestrating digital penetration strategies.",
      requirements: ["Market Entry", "Networking", "Digital Transformation"],
      lang: "English / Regional Dialects",
    },
    {
      id: 17,
      country: "Eastern Europe",
      flag: "🇪🇺",
      title: "Full Stack Dev",
      cat: "Web Development",
      level: "Senior",
      desc: "Building complex logic for auction systems.",
      details:
        "High-level engineering role focusing on our proprietary auction-based pricing engines. Requires deep technical mastery.",
      requirements: ["TypeScript", "Rust", "Cloud Infrastructure"],
      lang: "Regional Language / English",
    },
    {
      id: 18,
      country: "Scandinavia",
      flag: "🇩🇰",
      title: "Affiliate Analyst",
      cat: "Affiliate Marketing",
      level: "Middle Management",
      desc: "Data-driven partner optimization for Nordic regions.",
      details:
        "Statistical analysis of affiliate performance across Sweden, Norway, and Denmark. Delivering actionable insights to the board.",
      requirements: ["Statistics", "Tableau", "Reporting"],
      lang: "Nordic Language / English",
    },
    {
      id: 19,
      country: "Russia",
      flag: "🇷🇺",
      title: "Network Admin",
      cat: "Web Development",
      level: "Middle Management",
      desc: "Maintaining robust connectivity and uptime.",
      details:
        "Managing server clusters and Ensuring 99.9% uptime for localized media mirrors.",
      requirements: ["Linux", "Docker", "Network Security"],
      lang: "Russian / English",
    },
    {
      id: 20,
      country: "Pakistan",
      flag: "🇵🇰",
      title: "Social Media Manager",
      cat: "Social Media",
      level: "Middle Management",
      desc: "Managing community growth and engagement.",
      details:
        "Leading social strategy for regional campaigns. Coordinating with influencers and content creators.",
      requirements: ["Content Strategy", "Influencer Management", "Analytics"],
      lang: "Urdu / English",
    },
    {
      id: 21,
      country: "Bangladesh",
      flag: "🇧🇩",
      title: "Frontend Developer",
      cat: "Web Development",
      level: "Junior",
      desc: "Crafting beautiful UI for global applications.",
      details:
        "Implementing modern, responsive designs using Tailwind CSS and modern JS frameworks.",
      requirements: ["CSS/HTML", "JavaScript", "Design Eye"],
      lang: "Bengali / English",
    },
  ];

  // Get unique countries for grouping
  const countries = [...new Set(jobs.map((job) => job.country))];

  // Dropdown state
  const [collabOpen, setCollabOpen] = useState(false);
  const [benefitsOpen, setBenefitsOpen] = useState(false);
  const [opportunitiesOpen, setOpportunitiesOpen] = useState(false);

  return (
    <body className="page-dark-bg text-white antialiased bg-[#0B0F19]">
      <Header />
      {/* <nav className="dark-glass-nav fixed w-full z-[100] top-0 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
   
          <a
            href="https://rule7media.com"
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200 group-hover:rotate-12 transition-transform">
              <Clapperboard className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Rule7<span className="text-red-600">Media</span>
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-red-500 transition-colors uppercase tracking-wider"
            >
              Home
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setCollabOpen(true)}
              onMouseLeave={() => setCollabOpen(false)}
            >
              <button className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-red-500 transition-colors flex items-center gap-1 uppercase tracking-wider">
                Collaborative{" "}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${collabOpen ? "rotate-180" : ""}`}
                />
              </button>
              {collabOpen && (
                <div className="absolute top-full left-0 w-64 pt-4">
                  <div className="bg-[#161B26] rounded-2xl shadow-2xl border border-slate-800 p-2 overflow-hidden">
                    <a
                      href="https://scanthemall.com"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-sm font-semibold text-slate-300 hover:text-red-500 transition-all"
                    >
                      <div className="w-8 h-8 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4" />
                      </div>
                      Viral Engine
                    </a>

                    <Link
                      to="/how-it-works"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-sm font-semibold text-slate-300 hover:text-red-500 transition-all"
                    >
                      <div className="w-8 h-8 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center">
                        <Settings className="w-4 h-4" />
                      </div>
                      How it Works
                    </Link>

                    <Link
                      to="/missionstatement"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-sm font-semibold text-slate-300 hover:text-red-500 transition-all"
                    >
                      <div className="w-8 h-8 bg-purple-500/10 text-purple-500 rounded-lg flex items-center justify-center">
                        <Eye className="w-4 h-4" />
                      </div>
                      Vision
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setBenefitsOpen(true)}
              onMouseLeave={() => setBenefitsOpen(false)}
            >
              <button className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-red-500 transition-colors flex items-center gap-1 uppercase tracking-wider">
                Benefits{" "}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${benefitsOpen ? "rotate-180" : ""}`}
                />
              </button>
              {benefitsOpen && (
                <div className="absolute top-full left-0 w-72 pt-4">
                  <div className="bg-[#161B26] rounded-2xl shadow-2xl border border-slate-800 p-2">
                    <Link
                      to="/faq"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-sm font-semibold text-slate-300 hover:text-red-500 transition-all"
                    >
                      <div className="w-8 h-8 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      FAQ
                    </Link>

                    <Link
                      to="/Statistics"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-sm font-semibold text-slate-300 hover:text-red-500 transition-all"
                    >
                      <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                      </div>
                      Global Explainer Videos
                    </Link>

                    <Link
                      to="/Cpm" 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-sm font-semibold text-slate-300 hover:text-red-500 transition-all"
                    >
                      <div className="w-8 h-8 bg-pink-500/10 text-pink-500 rounded-lg flex items-center justify-center">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                      Savings Opportunities
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setOpportunitiesOpen(true)}
              onMouseLeave={() => setOpportunitiesOpen(false)}
            >
              <button className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-red-500 transition-colors flex items-center gap-1 uppercase tracking-wider">
                Opportunities{" "}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${opportunitiesOpen ? "rotate-180" : ""}`}
                />
              </button>
              {opportunitiesOpen && (
                <div className="absolute top-full right-0 w-64 pt-4">
                  <div className="bg-[#161B26] rounded-2xl shadow-2xl border border-slate-800 p-2">
                    <Link
                      to="/advertise"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-sm font-semibold text-slate-300 hover:text-red-500 transition-all"
                    >
                      <div className="w-8 h-8 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center">
                        <Megaphone className="w-4 h-4" />
                      </div>
                      Advertise with Us
                    </Link>

                    <Link
                      to="/liveauction"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-sm font-semibold text-slate-300 hover:text-red-500 transition-all"
                    >
                      <div className="w-8 h-8 bg-orange-500/10 text-orange-500 rounded-lg flex items-center justify-center">
                        <Gavel className="w-4 h-4" />
                      </div>
                      Live Auctions
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="ml-4">
              <Link to={"#"}

                className="px-6 py-2.5 bg-red-600 text-white text-sm font-bold rounded-full hover:bg-red-700 transition-all shadow-lg"
              >
                Join Elite
              </Link>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white"
          >
            {!mobileMenuOpen ? (
              <Menu className="w-6 h-6" />
            ) : (
              <X className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav> */}

      {/* TASK 4 & 5: Page Body Content */}
      <main className="pt-32 pb-20">
        <header className="max-w-7xl mx-auto px-6 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            We are Hiring Globally
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 tracking-tight">
            Join Our <span className="text-red-600">Global Team</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-3xl leading-relaxed">
            Rule7 Media is expanding its remote workforce across 20+ countries.
            We believe in talent without borders, offering high-impact IT and
            media careers from the comfort of your home.
          </p>
        </header>

        {/* Countries Grid */}
        <div className="max-w-7xl mx-auto px-6 space-y-24">
          {countries.map((country) => (
            <div key={country} className="reveal active">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
                <span className="text-4xl">
                  {jobs.find((j) => j.country === country).flag}
                </span>
                <h2 className="text-3xl font-bold tracking-tight">{country}</h2>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                  {jobs.filter((j) => j.country === country).length} Open
                  Positions
                </span>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs
                  .filter((job) => job.country === country)
                  .map((job) => (
                    <div
                      key={job.id}
                      onClick={() => setActiveJob(job)}
                      className="job-card p-6 rounded-3xl cursor-pointer group bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 rounded-lg bg-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-tighter">
                          {job.cat}
                        </span>
                        <span className="text-slate-500 text-[10px] font-bold uppercase">
                          {job.level}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-red-500 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-slate-400 text-sm mb-4 font-medium">
                        {job.desc}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <CheckCircle2 className="w-3 h-3 text-red-600" />
                          <span>Full Remote Opportunity</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <CheckCircle2 className="w-3 h-3 text-red-600" />
                          <span>{job.lang}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <CheckCircle2 className="w-3 h-3 text-red-600" />
                          <span>Competitive Global Salary</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* TASK 6: Expandable Job Details (Modal) */}
      {activeJob && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 transition-opacity duration-300 ease-out">
          <div
            className="absolute inset-0 bg-[#0B0F19]/90 backdrop-blur-md"
            onClick={() => setActiveJob(null)}
          ></div>

          <div className="relative bg-[#161B26] w-full max-w-2xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-white/5 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{activeJob.flag}</span>
                  <span className="text-red-500 font-bold uppercase tracking-widest text-xs">
                    {activeJob.country}
                  </span>
                </div>
                <h2 className="text-3xl font-black">{activeJob.title}</h2>
              </div>
              <button
                onClick={() => setActiveJob(null)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid gap-8">
                <section>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
                    Position Overview
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-lg">
                    {activeJob.details}
                  </p>
                </section>

                <section className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
                      Key Requirements
                    </h4>
                    <ul className="space-y-3">
                      {activeJob.requirements.map((req, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-slate-300"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
                      Language Profile
                    </h4>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-slate-200 font-bold">
                        {activeJob.lang}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Must be proficient for regional collaboration in{" "}
                        {activeJob.country}.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="p-8 bg-[#0B0F19] border-t border-white/5 flex flex-col sm:flex-row gap-4">
              <a
                href={`mailto:Careers@rule7media.com?subject=Application: ${activeJob.title} (${activeJob.country})`}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl text-center transition-all shadow-xl shadow-red-600/20"
              >
                Apply Now
              </a>
              <button
                onClick={() => setActiveJob(null)}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TASK 2: Replicated Footer */}
      <Footer />
      {/* <footer
        className="bg-[#0B0F19] pt-24 pb-12 px-6 border-t border-slate-800"
        role="contentinfo"
        aria-label="Rule7Media Footer"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 mb-20">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                  <Clapperboard className="w-6 h-6" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-white">
                  Rule7<span className="text-red-600">Media</span>
                </span>
              </div>
              <div className="space-y-6">
                <p className="text-xl font-bold text-white leading-tight">
                  A global ecosystem for high end digital storytelling and
                  operational excellence.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Revolutionising the Advertising Landscape through
                  collaborative mobility and transparent auction based pricing.
                </p>
                <p className="text-slate-300 font-medium border-l-4 border-red-600 pl-4">
                  Redefining Contextual Advertising Solutions. Driven by First
                  Party Data. Powered by Human Curated Add Channels
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
              <nav aria-labelledby="footer-nav-heading">
                <h5
                  id="footer-nav-heading"
                  className="font-black text-slate-100 mb-6 uppercase tracking-widest text-[10px]"
                >
                  Navigation
                </h5>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="https://www.rule7media.com/CaseStudies"
                      className="text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      Case Studies
                    </a>
                  </li>
                  <li>
                    <a
                      href="/whitepaper"
                      className="text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      White Paper
                    </a>
                  </li>
                  <li>
                    <a
                      href="/about-us"
                      className="text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      Global Offices
                    </a>
                  </li>
                  <li>
                    <a
                      href="/about-us"
                      className="text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      Meet the Team
                    </a>
                  </li>
                  <li>
                    <a
                      href=""
                      className="text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      How it Works
                    </a>
                  </li>
                  <li>
                    <a
                      href=""
                      className="text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      Live Auctions
                    </a>
                  </li>
                  <li>
                    <a
                      href=""
                      className="text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      Pricing Methodology
                    </a>
                  </li>
                </ul>
              </nav>
              <nav aria-labelledby="footer-res-heading">
                <h5
                  id="footer-res-heading"
                  className="font-black text-slate-100 mb-6 uppercase tracking-widest text-[10px]"
                >
                  Resources
                </h5>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="/franchise"
                      className="text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      Franchise Opportunities
                    </a>
                  </li>
                  <li>
                    <a
                      href=""
                      className="text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      Advertise with Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="/affiliate"
                      className="text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      Affiliate Program
                    </a>
                  </li>
                  <li>
                    <a
                      href=""
                      className="text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      Industry News
                    </a>
                  </li>
                  <li>
                    <a
                      href=""
                      className="text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      Client Portal
                    </a>
                  </li>
                  <li>
                    <a
                      href=""
                      className="text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      Campaign Monitoring
                    </a>
                  </li>
                  <li>
                    <a
                      href=""
                      className="text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      Audience Targeting
                    </a>
                  </li>
                </ul>
              </nav>
              <nav aria-labelledby="footer-proto-heading">
                <h5
                  id="footer-proto-heading"
                  className="font-black text-slate-100 mb-6 uppercase tracking-widest text-[10px]"
                >
                  Protocol
                </h5>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="/terms-conditions"
                      className="text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      Terms of Use
                    </a>
                  </li>
                  <li>
                    <a
                      href="/privacy-policy"
                      className="text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="/cookie-policy"
                      className="text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      Cookie Strategy
                    </a>
                  </li>
                  <li>
                    <a
                      href="/Careers"
                      className="text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      Career Hub
                    </a>
                  </li>
                </ul>
              </nav>
              <nav aria-labelledby="footer-social-heading">
                <h5
                  id="footer-social-heading"
                  className="font-black text-slate-100 mb-6 uppercase tracking-widest text-[10px]"
                >
                  Social Connect
                </h5>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="https://www.facebook.com/rule7media"
                      className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      <Facebook className="w-4 h-4" /> Facebook
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.instagram.com/rule.7media"
                      className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      <Instagram className="w-4 h-4" /> Instagram
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.youtube.com/@Rule7Media"
                      className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      <Youtube className="w-4 h-4" /> You Tube
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://x.com/Rule7Media"
                      className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-sm transition-colors font-medium"
                    >
                      <Twitter className="w-4 h-4" /> X
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              ©Colt Telecom Pty Ltd. All Rights Reserved.
            </p>
            <div className="flex gap-8">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                Cinematic Quality
              </span>
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                Digital Precision
              </span>
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                Global Impact
              </span>
            </div>
          </div>
        </div>
      </footer> */}
    </body>
  );
};

export default Careers;
