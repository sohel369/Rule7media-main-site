// src/components/BlogDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogById } from "../store/blog/blogSlice";
import { Helmet } from "react-helmet-async";
import { Calendar, User, Clock, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function BlogDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [activeSection, setActiveSection] = useState("");
  const [sections, setSections] = useState([]);

  const { blog, isLoading } = useSelector((state) => state.blog);
  const { user } = useSelector((state) => state.auth);
  const isLoggedIn = !!user;

  useEffect(() => {
    if (id) dispatch(fetchBlogById(id));
    window.scrollTo(0, 0);
  }, [dispatch, id]);

  // Build TOC from rendered content
  useEffect(() => {
    if (blog?.content && typeof blog.content === "string" && blog.content.trim()) {
      try {
        const tmp = document.createElement("div");
        tmp.innerHTML = blog.content;
        const headingEls = tmp.querySelectorAll("h2, h3");
        const extracted = [];
        let h2Count = 1;
        headingEls.forEach((el) => {
          let hid = el.id || el.textContent.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          extracted.push({ id: hid, title: el.textContent, level: el.tagName.toLowerCase(), number: el.tagName === "H2" ? String(h2Count++) : null });
        });
        setSections(extracted);
      } catch { setSections([]); }
    } else {
      setSections([]);
    }
  }, [blog]);

  // Active section on scroll
  useEffect(() => {
    const onScroll = () => {
      const els = document.querySelectorAll("h2[id], h3[id]");
      let current = "";
      els.forEach((el) => { if (el.getBoundingClientRect().top <= 200) current = el.id; });
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const formatDate = (d) => {
    if (!d) return "Recent";
    try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); }
    catch { return "Recent"; }
  };

  const getSafeContent = () => {
    if (blog?.content && typeof blog.content === "string" && blog.content.trim()) {
      return { __html: blog.content };
    }
    return { __html: '<div class="text-slate-400 text-center py-10 italic">No content available for this article.</div>' };
  };

  // ── SEO helpers ─────────────────────────────────────────────────────────────
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://rule7media.com";
  const canonicalUrl = `${siteUrl}/blog/${id}`;
  const metaTitle = blog ? `${blog.title} | Rule 7 Media` : "Blog | Rule 7 Media";
  const metaDescription = blog?.description || "Expert insights on OOH advertising, franchise ownership, and the collaborative economy.";
  const ogImage = blog?.imageUrl || `${siteUrl}/og-default.jpg`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <p className="text-slate-400 mb-4">Blog post not found. <Link to="/industry-news" className="text-rose-500 hover:text-rose-400">Back to articles</Link></p>
      </div>
    );
  }

  return (
    <>
      {/* ── SEO HEAD TAGS ─────────────────────────────────────────────────────
          Requires: npm install react-helmet-async
          In main.jsx / App.jsx wrap your app with <HelmetProvider>
      ─────────────────────────────────────────────────────────────────────── */}
      <Helmet>
        {/* Primary SEO */}
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph (Facebook, LinkedIn, WhatsApp previews) */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Rule 7 Media" />
        {blog?.date && <meta property="article:published_time" content={new Date(blog.date).toISOString()} />}
        {blog?.category && <meta property="article:section" content={blog.category} />}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImage} />

        {/* JSON-LD Structured Data (Google Rich Results) */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": blog?.title,
          "description": metaDescription,
          "image": ogImage,
          "author": { "@type": "Organization", "name": blog?.author || "Rule 7 Media", "url": siteUrl },
          "publisher": {
            "@type": "Organization",
            "name": "Rule 7 Media",
            "logo": { "@type": "ImageObject", "url": `${siteUrl}/logo.png` }
          },
          "datePublished": blog?.date ? new Date(blog.date).toISOString() : undefined,
          "dateModified": blog?.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined,
          "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
          "keywords": blog?.tags?.join(", ") || blog?.category,
          "articleSection": blog?.category,
          "url": canonicalUrl,
        })}</script>
      </Helmet>

      {/* Blog body styles — plain CSS needed because Tailwind JIT cannot
          scan dynamically-injected innerHTML strings at build time.
          These target the HTML tags produced by markdownToHtml(). */}
      <style>{`
        .blog-body h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #f43f5e;
          margin-top: 2.5rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(244,63,94,0.3);
          scroll-margin-top: 6rem;
          display: block;
        }
        .blog-body h3 {
          font-size: 1.375rem;
          font-weight: 600;
          color: #fb7185;
          margin-top: 1.75rem;
          margin-bottom: 1rem;
          scroll-margin-top: 6rem;
          display: block;
        }
        .blog-body p {
          color: #cbd5e1;
          margin-bottom: 1rem;
          line-height: 1.75;
          font-size: 1rem;
        }
        .blog-body strong {
          color: #ffffff;
          font-weight: 700;
        }
        .blog-body em {
          color: #e2e8f0;
          font-style: italic;
        }
        .blog-body ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }
        .blog-body ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }
        .blog-body li {
          color: #cbd5e1;
          margin-top: 0.375rem;
          margin-bottom: 0.375rem;
          line-height: 1.7;
        }
        .blog-body a {
          color: #f43f5e;
          text-decoration: underline;
        }
        .blog-body a:hover { color: #fb7185; }
        .blog-body blockquote {
          border-left: 4px solid #f43f5e;
          padding-left: 1.25rem;
          margin: 1.25rem 0;
          font-style: italic;
          color: #94a3b8;
        }
        .blog-body code {
          background: rgba(255,255,255,0.1);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          color: #fda4af;
        }
        .blog-body pre {
          background: rgba(0,0,0,0.4);
          padding: 1rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 1.25rem 0;
          font-size: 0.875rem;
        }
        .blog-body img {
          border-radius: 0.75rem;
          margin: 1.5rem auto;
          max-width: 100%;
          height: auto;
          display: block;
        }
        .blog-body div {
          margin-top: 1rem;
          margin-bottom: 1rem;
        }
        .blog-body br {
          display: block;
          margin: 0.5rem 0;
        }
      `}</style>

      <Header />
      <div className="min-h-screen bg-[#02040a]">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 sm:pt-28">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

            {/* ── Sidebar TOC (desktop only) ─────────────────────────────── */}
            <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
              <div className="sticky top-32 bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Table of Contents
                </p>
                <nav className="flex flex-col space-y-1">
                  {sections.length > 0 ? (
                    sections.map((s, idx) => (
                      <a
                        key={s.id}
                        href={`#${s.id}`}
                        className={`py-1.5 text-sm font-medium transition-all duration-200 block ${
                          s.level === "h3" ? "pl-4 text-xs" : ""
                        } ${
                          activeSection === s.id
                            ? "text-rose-400 pl-3 border-l-2 border-rose-500"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {idx + 1}. {s.title}
                      </a>
                    ))
                  ) : (
                    <p className="text-slate-500 text-xs">No sections found</p>
                  )}
                </nav>
              </div>
            </aside>

            {/* ── Main Content ────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 max-w-3xl mx-auto w-full">

              {/* Category badge */}
              {blog.category && (
                <div className="mb-5 text-center">
                  <span className="inline-block px-4 py-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-bold uppercase tracking-wider">
                    {blog.category}
                  </span>
                </div>
              )}

              {/* FIX: Title — solid rose, NO shimmer, NO animate-pulse */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 text-rose-500 leading-tight">
                {blog.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-10 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{formatDate(blog.date || blog.createdAt)}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{blog.author || "Rule 7 Media"}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{Math.max(1, Math.ceil((blog.content?.length || 0) / 1000))} min read</span>
                </div>
              </div>

              {/* Featured Image */}
              <div className="w-full mb-10 rounded-2xl overflow-hidden bg-slate-800/50 border border-slate-700">
                {blog.imageUrl ? (
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <span>No image available</span>
                  </div>
                )}
              </div>

              {/* Description callout */}
              {blog.description && (
                <div className="mb-8 p-5 bg-white/5 border-l-4 border-rose-500 rounded-r-2xl text-slate-300 text-base sm:text-lg italic">
                  {blog.description}
                </div>
              )}

              {/* ── Blog Body ─────────────────────────────────────────────
                  FIX: Headings use solid colours, NOT gradients.
                  All prose styles are explicit and mobile-safe.
              ──────────────────────────────────────────────────────────── */}
              <div
                className="blog-body"
                dangerouslySetInnerHTML={getSafeContent()}
              />

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Back link */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <Link to="/blog" className="inline-flex items-center gap-2 text-rose-500 hover:text-rose-400 font-semibold transition-colors">
                  ← Back to all articles
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}