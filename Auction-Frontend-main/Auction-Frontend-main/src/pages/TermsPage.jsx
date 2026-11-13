import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchterms } from "../store/terms/termsSlice";
import linkifyHtml from "linkify-html";
import Header from "../components/Header";
import Footer from "../components/Footer";

const TermsPage = () => {
  const dispatch = useDispatch();
  const { terms, isLoading, isError, message } = useSelector(
    (state) => state.terms,
  );
  const { user } = useSelector((state) => state.auth || { user: null });
  const isLoggedIn = !!user;

  const [countryCode, setCountryCode] = useState("default");
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [processed, setProcessed] = useState(false);
  const contentRef = useRef(null);
  const { contact = [], } = useSelector((state) => state.contactInfo);
  const country = useSelector((state) => state.country.country);
  const selectedContact = contact.find(
    (item) => item.country?.toLowerCase() === country?.toLowerCase()
  );

  // const email = selectedContact?.email || "info@rule7media.com";
const email = "legal@rule7media.com";
  // Icon for headings
  const getIconForHeading = (text) => {
    const lower = (text || "").toLowerCase().trim();

    if (lower.includes("introduction")) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heading-icon"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;
    }
    if (lower.includes("obligation")) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heading-icon"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>`;
    }
    if (lower.includes("rights") || lower.includes("limits")) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heading-icon"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`;
    }
    if (lower.includes("disclaimer") || lower.includes("liability")) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heading-icon"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`;
    }
    if (lower.includes("termination")) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heading-icon"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
    }
    if (
      lower.includes("governing") ||
      lower.includes("dispute") ||
      lower.includes("jurisdiction")
    ) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heading-icon"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`;
    }
    if (lower.includes("general")) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heading-icon"><path d="M14.364 13.634a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506l4.013-4.009a1 1 0 0 0-3.004-3.004z"/><path d="M14.487 7.858A1 1 0 0 1 14 7V2"/><path d="M20 19.645V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l2.516 2.516"/><path d="M8 18h1"/></svg>`;
    }
    if (lower.includes("consent") || lower.includes("release")) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heading-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>`;
    }
    if (lower.includes("contact")) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heading-icon"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heading-icon"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;
  };

  // Get Country Code
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

  // Fetch Terms
  useEffect(() => {
    if (countryCode) dispatch(fetchterms(countryCode));
  }, [dispatch, countryCode]);

  const termsContent = terms?.terms
    ? terms.terms[countryCode] || terms.terms["AU"] || terms.terms["default"]
    : null;

  let linkedContent = termsContent
    ? linkifyHtml(termsContent, {
        defaultProtocol: "https",
        target: "_blank",
        rel: "noopener noreferrer",
      })
    : "";

  linkedContent = linkedContent
    .replace(/(<br\s*\/?>\s*){2,}/gi, "<br>")
    .replace(/<br\s*\/?>/gi, "");

  // Process Content - Fixed infinite loop issue
  const processContent = useCallback(() => {
    if (!contentRef.current || processed) return;
    
    const container = contentRef.current;

    // Clear old modifications
    container
      .querySelectorAll(".heading-icon, .contact-buttons, .dos-donts-wrapper")
      .forEach((el) => el.remove());

    const headingElements = Array.from(container.querySelectorAll("h2"));

    // Add icons to all h2
    headingElements.forEach((h2, index) => {
      if (!h2.textContent?.trim()) {
        h2.style.display = "none";
        return;
      }

      const iconHTML = getIconForHeading(h2.textContent);
      const temp = document.createElement("span");
      temp.innerHTML = iconHTML;
      if (temp.firstChild) h2.prepend(temp.firstChild);

      if (!h2.id) h2.id = `heading-${index}`;
    });

    // DOS & DON'TS SECTION
    const dosDontsHeading = headingElements.find(
      (h2) =>
        h2.textContent.toLowerCase().includes("dos and don'ts") ||
        h2.textContent.toLowerCase().includes("do's and don'ts") ||
        h2.textContent.toLowerCase().includes("dos & don'ts"),
    );

    if (dosDontsHeading) {
      let nextElement = dosDontsHeading.nextElementSibling;
      const contentToWrap = [];

      while (nextElement && nextElement.tagName !== "H2") {
        contentToWrap.push(nextElement);
        nextElement = nextElement.nextElementSibling;
      }

      if (contentToWrap.length > 0) {
        const wrapper = document.createElement("div");
        wrapper.className = "dos-donts-wrapper grid grid-cols-1 lg:grid-cols-2 gap-6 my-10";

        const dosBox = document.createElement("div");
        dosBox.className = "bg-emerald-950 border border-emerald-500/30 rounded-2xl p-6";

        const dontsBox = document.createElement("div");
        dontsBox.className = "bg-red-950 border border-red-500/30 rounded-2xl p-6";

        let isDosSection = true;

        contentToWrap.forEach((el) => {
          const text = (el.textContent || "").toLowerCase();

          if (text.includes("the dos") || text.includes("dos")) {
            isDosSection = true;
          } else if (
            text.includes("the don'ts") ||
            text.includes("don'ts") ||
            text.includes("don’ts")
          ) {
            isDosSection = false;
          }

          const clone = el.cloneNode(true);
          if (isDosSection) {
            dosBox.appendChild(clone);
          } else {
            dontsBox.appendChild(clone);
          }
        });

        dosBox.innerHTML = `
          <div class="flex items-center gap-3 mb-5">
            <span class="text-3xl">👍</span>
            <h3 class="text-2xl font-bold text-emerald-400">The Dos</h3>
          </div>
          ${dosBox.innerHTML}
        `;

        dontsBox.innerHTML = `
          <div class="flex items-center gap-3 mb-5">
            <span class="text-3xl">👎</span>
            <h3 class="text-2xl font-bold text-red-400">The Don'ts</h3>
          </div>
          ${dontsBox.innerHTML}
        `;

        wrapper.appendChild(dosBox);
        wrapper.appendChild(dontsBox);
        dosDontsHeading.after(wrapper);
        contentToWrap.forEach((el) => (el.style.display = "none"));
      }
    }

    // CONTACT BUTTONS
    if (headingElements.length > 0) {
      const contactDiv = document.createElement("div");
      contactDiv.className = "contact-buttons mt-12";

      contactDiv.innerHTML = `
        <div class="flex flex-wrap gap-4">
          <a href="mailto:${email}" class="group inline-flex items-center gap-3 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all duration-300 hover:scale-[1.03]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-[#FF3D00] group-hover:rotate-6 transition-transform">
              <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path>
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            </svg>
            <span class="text-sm font-semibold text-white group-hover:text-[#FF3D00]">Email Legal Dept</span>
          </a>
          <a href="/contact-us" class="group inline-flex items-center gap-3 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all duration-300 hover:scale-[1.03]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-[#FF3D00] group-hover:-rotate-6 transition-transform">
              <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"></path>
            </svg>
            <span class="text-sm font-semibold text-white group-hover:text-[#FF3D00]">Live Support</span>
          </a>
        </div>
      `;
      container.appendChild(contactDiv);
    }

    // Update TOC - IMMEDIATE
    const updatedHeadings = headingElements
      .filter((h2) => h2.textContent?.trim() && h2.style.display !== "none")
      .map((h2, idx) => ({
        id: h2.id || `heading-${idx}`,
        text: h2.textContent.trim(),
      }));

    setHeadings(updatedHeadings);
    setProcessed(true);
  }, [processed, email]);

  // Process content only once when termsContent is available and DOM is ready
  useEffect(() => {
    if (!termsContent || processed) return;
    
    // Wait for DOM to render
    const timer = setTimeout(() => {
      if (contentRef.current) {
        processContent();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [termsContent, processed, processContent]);

  // Reset processed when countryCode changes
  useEffect(() => {
    setProcessed(false);
    setHeadings([]);
  }, [countryCode]);

  // Scroll Spy
  useEffect(() => {
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0.3 },
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleTocClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  };

  return (
    <>
      {!isLoggedIn && <Header />}

      <style>{`
        .terms-page-wrapper {
          background-color: #0a0a0a;
          min-height: 100vh;
          color: #ffffff;
        }
        .terms-content h2 {
          color: #ffffff;
          font-weight: 700;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          margin-top: 2.5rem;
          margin-bottom: 0.75rem;
        }
        .terms-content h2 svg.heading-icon {
          width: 1.75rem;
          height: 1.75rem;
          stroke: #FF3D00;
          stroke-width: 1.8;
          flex-shrink: 0;
          margin-right: 0.75rem;
        }
        .terms-content h2:empty,
        .terms-content h2 br:only-child {
          display: none;
        }
        .terms-content h3 {
          color: #FF3D00;
          font-weight: 600;
          font-size: 1.125rem;
          margin: 1.5rem 0 0.75rem;
        }
        .terms-content p {
          color: #a1a1aa;
          line-height: 1.75;
          margin-bottom: 1rem;
        }
        .dos-donts-wrapper h3 {
          margin: 0;
        }
        .dos-donts-wrapper li {
          margin-bottom: 0.5rem;
          color: #d1d5db;
        }
        .terms-sidebar-link {
          display: block;
          padding: 0.5rem 0 0.5rem 1rem;
          color: #a1a1aa;
          font-size: 0.875rem;
          font-weight: 500;
          border-left: 2px solid transparent;
          transition: all 0.2s ease;
        }
        .terms-sidebar-link:hover,
        .terms-sidebar-link.active {
          color: #FF3D00;
          border-left-color: #FF3D00;
        }
      `}</style>

      <div className={`terms-page-wrapper ${!isLoggedIn ? "pt-24" : ""}`}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar TOC - Shows instantly when headings are available */}
            {headings.length > 0 && (
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-32">
                  <p className="text-[10px] font-bold tracking-widest text-zinc-500 mb-4">
                    TABLE OF CONTENTS
                  </p>
                  <nav className="flex flex-col">
                    {headings.map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        onClick={(e) => handleTocClick(e, heading.id)}
                        className={`terms-sidebar-link ${activeId === heading.id ? "active" : ""}`}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            )}

            {/* Main Content */}
            <div className="flex-1 max-w-4xl">
              <div className="mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 bg-orange-500/10 border border-orange-500/20 text-[#FF3D00] text-xs font-bold">
                  EFFECTIVE APRIL 30, 2025
                </div>
                <h1 className="font-black mb-6 tracking-tight text-4xl md:text-5xl">
                  User Agreement &amp;{" "}
                  <span className="bg-gradient-to-r from-[#FF3D00] to-[#FFB300] bg-clip-text text-transparent">
                    Service Terms
                  </span>
                </h1>
              </div>

              {isError && (
                <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-400">
                  Error: {message}
                </div>
              )}

              <div className="terms-content">
                {isLoading && !termsContent ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin h-12 w-12 border-4 border-zinc-700 border-t-[#FF3D00] rounded-full"></div>
                  </div>
                ) : termsContent ? (
                  <article ref={contentRef}>
                    <div dangerouslySetInnerHTML={{ __html: linkedContent }} />
                  </article>
                ) : (
                  <p className="text-center py-16 text-zinc-500">
                    No content available for your country.
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {!isLoggedIn && <Footer />}
    </>
  );
};

export default TermsPage;