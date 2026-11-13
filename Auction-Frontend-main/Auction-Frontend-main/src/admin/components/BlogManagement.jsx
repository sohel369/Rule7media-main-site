import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllBlogsAdmin,
  createBlog,
  updateBlog,
  deleteBlog,
  resetSubmitState,
} from "../../store/blog/blogSlice";
import { toast } from "react-toastify";
import { 
  Plus, Edit, Trash2, X, Upload, ChevronRight, Search, 
  PlusCircle, MinusCircle, Bold, Italic, List, ListOrdered,
  Image, Link as LinkIcon, Code, Eye
} from "lucide-react";
import worldData from "../../countries+states+cities.json";

const getAllCountries = () => {
  const countriesList = [
    { code: "global", name: "Global (Everyone)" },
  ];
  if (worldData && Array.isArray(worldData)) {
    worldData.forEach((country) => {
      if (country.name) {
        countriesList.push({
          code: country.code?.toLowerCase() || country.name.toLowerCase(),
          name: country.name,
          emoji: country.emoji,
        });
      }
    });
  }
  return countriesList;
};

const allCountries = getAllCountries();

const headingLevels = [
  { value: "h2", label: "Heading 2 (Main Section)" },
  { value: "h3", label: "Heading 3 (Sub Section)" },
];

// Rich Text Toolbar
function RichTextToolbar({ onFormat, onAddImage }) {
  return (
    <div className="flex flex-wrap gap-1 p-2 bg-slate-700 rounded-t-lg border-b border-slate-600">
      <button type="button" onClick={() => onFormat('bold')} className="p-1.5 hover:bg-slate-600 rounded text-slate-300" title="Bold">
        <Bold className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => onFormat('italic')} className="p-1.5 hover:bg-slate-600 rounded text-slate-300" title="Italic">
        <Italic className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-slate-600 mx-1"></div>
      <button type="button" onClick={() => onFormat('insertUnorderedList')} className="p-1.5 hover:bg-slate-600 rounded text-slate-300" title="Bullet List">
        <List className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => onFormat('insertOrderedList')} className="p-1.5 hover:bg-slate-600 rounded text-slate-300" title="Numbered List">
        <ListOrdered className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-slate-600 mx-1"></div>
      <button type="button" onClick={onAddImage} className="p-1.5 hover:bg-slate-600 rounded text-slate-300" title="Add Image">
        <Image className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => onFormat('insertLink')} className="p-1.5 hover:bg-slate-600 rounded text-slate-300" title="Insert Link">
        <LinkIcon className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => onFormat('insertCode')} className="p-1.5 hover:bg-slate-600 rounded text-slate-300" title="Code Block">
        <Code className="w-4 h-4" />
      </button>
    </div>
  );
}

// Country Dropdown
function CountryDropdown({ value, onChange, placeholder = "All Countries" }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const filtered = search.trim()
    ? allCountries.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : allCountries.slice(0, 100);

  const getLabel = (val) => {
    if (!val || val === "all") return ` ${placeholder}`;
    if (val === "global") return "🌍 Global (Everyone)";
    const found = allCountries.find((c) => c.code === val);
    return found ? `${found.emoji} ${found.name}` : ` ${placeholder}`;
  };

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((p) => !p)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-base text-left flex justify-between items-center">
        <span className="truncate">{getLabel(value)}</span>
        <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-2xl z-[999]">
          <div className="p-2 border-b border-slate-600 bg-slate-700 rounded-t-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search country..." value={search} onChange={(e) => setSearch(e.target.value)} onClick={(e) => e.stopPropagation()} autoFocus className="w-full pl-9 pr-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm outline-none" />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {placeholder === "All Countries" && (
              <div onClick={() => { onChange("all"); setOpen(false); setSearch(""); }} className={`px-4 py-2 cursor-pointer text-sm hover:bg-slate-600 ${value === "all" ? "bg-blue-600/30 text-blue-300" : "text-slate-200"}`}>
                🌍 All Countries
              </div>
            )}
            {filtered.map((country) => (
              <div key={country.code} onClick={() => { onChange(country.code); setOpen(false); setSearch(""); }} className={`px-4 py-2 cursor-pointer text-sm hover:bg-slate-600 ${value === country.code ? "bg-blue-600/30 text-blue-300" : "text-slate-200"}`}>
                {country.code === "global" ? "🌍 Global (Everyone)" : `${country.emoji} ${country.name}`}
              </div>
            ))}
            {filtered.length === 0 && <div className="px-4 py-3 text-slate-500 text-sm text-center">No country found</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// Markdown to HTML converter
function markdownToHtml(text) {
  if (!text) return "";
  let content = text;

  const imgTags = [];
  content = content.replace(/<img[^>]*>/g, (match) => {
    imgTags.push(match);
    return `__IMG_TAG_${imgTags.length - 1}__`;
  });

  content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  content = content.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
  content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>');

  const lines = content.split("\n");
  const result = [];
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    line = line.replace(/__IMG_TAG_(\d+)__/g, (match, index) => imgTags[parseInt(index)]);

    if (line.match(/^- (.+)/)) {
      if (!inUl) { result.push("<ul>"); inUl = true; }
      if (inOl) { result.push("</ol>"); inOl = false; }
      result.push(`<li>${line.replace(/^- /, "")}</li>`);
    } else if (line.match(/^\d+\. (.+)/)) {
      if (!inOl) { result.push("<ol>"); inOl = true; }
      if (inUl) { result.push("</ul>"); inUl = false; }
      result.push(`<li>${line.replace(/^\d+\. /, "")}</li>`);
    } else {
      if (inUl) { result.push("</ul>"); inUl = false; }
      if (inOl) { result.push("</ol>"); inOl = false; }

      if (line.trim().startsWith("<img")) {
        result.push(`<figure class="my-6">${line.trim()}<figcaption class="text-sm text-slate-500 text-center mt-2">Image</figcaption></figure>`);
      } else if (line.trim() === "") {
        result.push("<br />");
      } else {
        result.push(`<p>${line}</p>`);
      }
    }
  }

  if (inUl) result.push("</ul>");
  if (inOl) result.push("</ol>");

  return result.join("\n");
}

// Preview renderer
function HeadingPreview({ heading }) {
  const htmlContent = markdownToHtml(heading.content);
  return (
    <div className="mb-8">
      {heading.level === "h2" ? (
        <h2 className="text-2xl font-bold text-rose-400 mt-8 mb-4 pb-2 border-b border-rose-500/30">
          {heading.text || "(No heading)"}
        </h2>
      ) : (
        <h3 className="text-xl font-semibold text-rose-300 mt-6 mb-3">
          {heading.text || "(No heading)"}
        </h3>
      )}
      <div className="blog-preview-body" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}

// Main Component
export default function BlogManagement() {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [viewBlog, setViewBlog] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const {
    adminBlogs,
    adminTotalBlogs,
    adminTotalPages,
    adminLoading,
    adminCategories,
    isSubmitting,
    submitSuccess,
  } = useSelector((state) => state.blog);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [headings, setHeadings] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    country: "global",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => { loadBlogs(); }, [dispatch, currentPage, filterCountry, filterCategory]);

  useEffect(() => {
    if (submitSuccess) {
      toast.success(editingBlog ? "Blog updated!" : "Blog created!");
      dispatch(resetSubmitState());
      closeModal();
      loadBlogs();
    }
  }, [submitSuccess]);

  const loadBlogs = () => {
    dispatch(getAllBlogsAdmin({ page: currentPage, limit: 10, country: filterCountry, category: filterCategory }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const applyFormatting = (textareaId, command) => {
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let replacement = textarea.value;

    switch (command) {
      case "bold":
        replacement = textarea.value.substring(0, start) + `**${selectedText}**` + textarea.value.substring(end);
        break;
      case "italic":
        replacement = textarea.value.substring(0, start) + `*${selectedText}*` + textarea.value.substring(end);
        break;
      case "insertUnorderedList":
        replacement = textarea.value.substring(0, start) + selectedText.split("\n").map((l) => `- ${l}`).join("\n") + textarea.value.substring(end);
        break;
      case "insertOrderedList":
        replacement = textarea.value.substring(0, start) + selectedText.split("\n").map((l, i) => `${i + 1}. ${l}`).join("\n") + textarea.value.substring(end);
        break;
      case "insertLink":
        const url = prompt("Enter URL:");
        if (url) {
          replacement = textarea.value.substring(0, start) + `[${selectedText || "link"}](${url})` + textarea.value.substring(end);
        }
        break;
      case "insertCode":
        replacement = textarea.value.substring(0, start) + "`" + selectedText + "`" + textarea.value.substring(end);
        break;
      default:
        return;
    }

    textarea.value = replacement;
    textarea.focus();
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  };

  // Sirf image link wala function - NO UPLOAD
  const addInlineImage = (index) => {
    const imageUrl = prompt("Enter image URL:", "https://");
    if (imageUrl && imageUrl.trim() && imageUrl !== "https://") {
      const textarea = document.getElementById(`content-${index}`);
      if (textarea) {
        const start = textarea.selectionStart;
        const imgTag = `<img src="${imageUrl.trim()}" alt="Image" class="max-w-full rounded-lg my-4" loading="lazy" />`;
        const newValue = textarea.value.substring(0, start) + imgTag + textarea.value.substring(textarea.selectionEnd);
        textarea.value = newValue;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        updateHeading(index, "content", newValue);
        toast.success('Image added successfully!');
      }
    } else if (imageUrl === "https://") {
      toast.error('Please enter a valid image URL');
    }
  };

  const addHeading = () => {
    setHeadings([...headings, { 
      id: `heading-${Date.now()}-${headings.length}`, 
      level: "h2", 
      text: "", 
      content: "", 
      order: headings.length 
    }]);
    // Scroll to bottom after adding section
    setTimeout(() => {
      const container = document.getElementById('sections-container');
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    }, 100);
  };

  const removeHeading = (index) => {
    setHeadings(headings.filter((_, i) => i !== index).map((h, i) => ({ ...h, order: i })));
  };

  const renderImagePreviewsInEditor = (content, sectionIndex) => {
    if (!content) return null;
    
    const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/g;
    const matches = [];
    let match;
    
    while ((match = imgRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    
    if (matches.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mb-3 p-2 bg-slate-700/30 rounded-lg">
        {matches.map((url, idx) => (
          <div key={idx} className="relative group">
            <img 
              src={url} 
              alt={`Preview ${idx + 1}`} 
              className="h-16 w-auto object-cover rounded border-2 border-slate-600 hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => window.open(url, '_blank')}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.style.display = 'none';
              }}
            />
            <button
              type="button"
              onClick={() => {
                const textarea = document.getElementById(`content-${sectionIndex}`);
                if (textarea) {
                  const imgTagRegex = new RegExp(`<img[^>]+src="${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'g');
                  const newContent = textarea.value.replace(imgTagRegex, '');
                  textarea.value = newContent;
                  textarea.dispatchEvent(new Event('input', { bubbles: true }));
                  updateHeading(sectionIndex, "content", newContent);
                  toast.success('Image removed');
                }
              }}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const updateHeading = (index, field, value) => {
    const updated = [...headings];
    updated[index][field] = value;
    setHeadings(updated);
  };

  const generateHtmlContent = () => {
    let html = "";
    headings.forEach((heading) => {
      if (heading.text.trim()) {
        const headingId = heading.text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        html += `<${heading.level} id="${headingId}" class="scroll-mt-20">${heading.text}</${heading.level}>\n`;
        if (heading.content.trim()) {
          html += `<div class="blog-section-content my-6">\n${markdownToHtml(heading.content)}\n</div>\n`;
        }
      }
    });
    return html;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalContent = generateHtmlContent();
    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    fd.append("category", formData.category);
    fd.append("country", formData.country);
    fd.append("date", formData.date);
    fd.append("content", finalContent);
    fd.append("headings", JSON.stringify(headings));
    if (selectedImage) fd.append("image", selectedImage);

    if (editingBlog) {
      await dispatch(updateBlog({ id: editingBlog._id, blogData: fd }));
    } else {
      if (!selectedImage) { toast.error("Please select an image"); return; }
      await dispatch(createBlog(fd));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this blog?")) {
      await dispatch(deleteBlog(id));
      toast.success("Blog deleted!");
      loadBlogs();
    }
  };

  const openViewModal = (blog) => {
    setViewBlog(blog);
    setIsViewModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewBlog(null);
    document.body.style.overflow = "unset";
  };

  const openModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({ title: blog.title, description: blog.description, category: blog.category, country: blog.country, date: blog.date?.split("T")[0] || new Date().toISOString().split("T")[0] });
      setImagePreview(blog.imageUrl);
      setSelectedImage(null);
      try { setHeadings(JSON.parse(blog.headings || "[]")); } catch { setHeadings([]); }
    } else {
      setEditingBlog(null);
      setFormData({ title: "", description: "", category: "", country: "global", date: new Date().toISOString().split("T")[0] });
      setImagePreview(null);
      setSelectedImage(null);
      setHeadings([]);
    }
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
    setImagePreview(null);
    setSelectedImage(null);
    setHeadings([]);
    setPreviewMode(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    document.body.style.overflow = "unset";
  };

  const goToPage = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(adminTotalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) startPage = Math.max(1, endPage - maxVisible + 1);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="min-h-screen bg-black rounded-2xl p-6">
      <style>{`
        .blog-preview-body p { color: #cbd5e1; margin-bottom: 0.75rem; line-height: 1.75; }
        .blog-preview-body strong { color: #ffffff; font-weight: 700; }
        .blog-preview-body em { color: #e2e8f0; font-style: italic; }
        .blog-preview-body ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.75rem 0; }
        .blog-preview-body ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.75rem 0; }
        .blog-preview-body li { color: #cbd5e1; margin: 0.25rem 0; line-height: 1.6; }
        .blog-preview-body img { border-radius: 0.5rem; max-width: 100%; margin: 1rem 0; }
        .blog-preview-body div { margin: 0.5rem 0; }
      `}</style>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Blog Management</h1>
            <p className="text-slate-400 text-base mt-1">Create rich content with text, images, lists, and formatting</p>
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-base">
            <Plus className="w-5 h-5" /> Add Blog
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Blogs", value: adminTotalBlogs, color: "text-white" },
            { label: "Categories", value: adminCategories?.length || 0, color: "text-blue-400" },
            { label: "Active Blogs", value: adminBlogs?.length || 0, color: "text-green-400" },
          ].map((s, i) => (
            <div key={i} className="bg-slate-800 rounded-xl p-4">
              <p className="text-slate-400 text-sm">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6 flex flex-wrap gap-4 overflow-visible">
          <div className="w-64">
            <label className="block text-sm text-slate-400 mb-1">Filter by Country</label>
            <CountryDropdown value={filterCountry} onChange={(val) => { setFilterCountry(val); setCurrentPage(1); }} placeholder="All Countries" />
          </div>
          <div className="w-56">
            <label className="block text-sm text-slate-400 mb-1">Filter by Category</label>
            <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }} className="w-full bg-slate-900 text-white px-3 py-2 rounded-lg text-base border border-slate-700">
              <option value="all">📂 All Categories</option>
              {adminCategories?.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  {["Image", "Title", "Category", "Country", "Date", "Sections", "Actions"].map((h, i) => (
                    <th key={i} className={`px-4 py-3 text-sm font-semibold text-slate-300 ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adminLoading ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading...</td></tr>
                ) : adminBlogs?.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">No blogs found</td></tr>
                ) : (
                  adminBlogs?.map((blog) => (
                    <tr key={blog._id} className="border-t border-slate-700 hover:bg-slate-700/30">
                      <td className="px-4 py-3">
                        <img src={blog.imageUrl} alt={blog.title} className="w-10 h-10 object-cover rounded-lg" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white text-base font-medium">{blog.title}</div>
                        <div className="text-slate-400 text-sm truncate max-w-[200px]">{blog.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">{blog.category}</span>
                      </td>
                      <td className="px-4 py-3 text-base text-slate-300">
                        {blog.country === "global" ? "🌍 Global" : blog.country?.toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-base text-slate-400">
                        {new Date(blog.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-400">
                          {blog.headings ? (() => { try { return JSON.parse(blog.headings)?.length || 0; } catch { return 0; } })() : 0} sections
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button onClick={() => openViewModal(blog)} className="text-green-400 hover:text-green-300 p-1" title="View Blog">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button onClick={() => openModal(blog)} className="text-blue-400 hover:text-blue-300 p-1" title="Edit Blog">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(blog._id)} className="text-red-400 hover:text-red-300 p-1" title="Delete Blog">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {adminTotalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-slate-700 rounded-lg text-base disabled:opacity-50 hover:bg-slate-600">Prev</button>
            {getPageNumbers().map((page, i) => (
              <button key={i} onClick={() => goToPage(page)} className={`px-4 py-2 rounded-lg text-base ${currentPage === page ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>{page}</button>
            ))}
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === adminTotalPages} className="px-4 py-2 bg-slate-700 rounded-lg text-base disabled:opacity-50 hover:bg-slate-600">Next</button>
          </div>
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && viewBlog && (
        <div className="fixed inset-0 bg-black/90 z-[9999] overflow-y-auto" onClick={closeViewModal}>
          <div className="flex min-h-full items-center justify-center p-4 py-10">
            <div className="bg-slate-900 rounded-xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="bg-slate-800 px-5 py-4 border-b border-slate-700 flex justify-between items-center rounded-t-xl sticky top-0 z-10">
                <h2 className="text-xl font-bold text-white">Preview Blog</h2>
                <div className="flex gap-2">
                  <button onClick={() => { closeViewModal(); openModal(viewBlog); }} className="px-3 py-1 text-sm bg-blue-600 rounded-lg text-white hover:bg-blue-500">Edit Blog</button>
                  <button onClick={closeViewModal} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
              </div>

              <div className="p-8">
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 text-rose-400">
                  {viewBlog.title}
                </h1>

                <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm text-slate-500">
                  <span>{new Date(viewBlog.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                  <span>•</span>
                  <span>{viewBlog.author || "Rule 7 Media"}</span>
                  <span>•</span>
                  <span>{viewBlog.category}</span>
                </div>

                {viewBlog.imageUrl && (
                  <div className="w-full overflow-hidden mb-8 rounded-2xl">
                    <img src={viewBlog.imageUrl} alt={viewBlog.title} className="w-full h-auto object-cover rounded-2xl" />
                  </div>
                )}

                {viewBlog.description && (
                  <div className="mb-8 p-6 bg-white/5 border-l-4 border-rose-500 rounded-r-2xl italic text-slate-300 text-lg">
                    {viewBlog.description}
                  </div>
                )}

                {viewBlog.headings && (() => {
                  try {
                    return JSON.parse(viewBlog.headings).map((heading, idx) => (
                      <HeadingPreview key={idx} heading={heading} />
                    ));
                  } catch { return null; }
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-[9999] overflow-y-auto" onClick={closeModal}>
          <div className="flex min-h-full items-center justify-center p-4 py-10">
            <div className="bg-slate-800 rounded-xl w-full max-w-5xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="bg-slate-800 px-5 py-4 border-b border-slate-700 flex justify-between items-center rounded-t-xl sticky top-0 z-10">
                <h2 className="text-xl font-bold text-white">{editingBlog ? "Edit Blog" : "Create New Blog"}</h2>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setPreviewMode(!previewMode)} className="px-3 py-1 text-sm bg-slate-700 rounded-lg text-slate-300 hover:text-white">
                    {previewMode ? "Edit Mode" : "Preview"}
                  </button>
                  <button type="button" onClick={closeModal} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {!previewMode ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-base font-medium text-slate-300 mb-1">Title *</label>
                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-base outline-none focus:border-blue-500" placeholder="Blog title" />
                      </div>
                      <div>
                        <label className="block text-base font-medium text-slate-300 mb-1">Category *</label>
                        <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-base outline-none focus:border-blue-500" placeholder="Category" list="categories" />
                        <datalist id="categories">{adminCategories?.map((c, i) => <option key={i} value={c} />)}</datalist>
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-slate-300 mb-1">Description *</label>
                      <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={2} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-base outline-none focus:border-blue-500 resize-none" placeholder="Short description" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-base font-medium text-slate-300 mb-1">Date *</label>
                        <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-base outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-base font-medium text-slate-300 mb-1">Target Country *</label>
                        <CountryDropdown value={formData.country} onChange={(val) => setFormData({ ...formData, country: val })} placeholder="Select country" />
                      </div>
                    </div>

                    {/* Featured Image Upload */}
                    <div>
                      <label className="block text-base font-medium text-slate-300 mb-1">Featured Image *</label>
                      <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                        {imagePreview ? (
                          <div className="relative inline-block">
                            <img src={imagePreview} alt="Preview" className="h-32 w-auto object-cover rounded-lg" />
                            <button type="button" onClick={(e) => { e.stopPropagation(); setImagePreview(null); setSelectedImage(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                            <span className="text-blue-400 text-base hover:text-blue-300">Click to upload image</span>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                            <p className="text-sm text-slate-500 mt-2">PNG, JPG, JPEG, AVIF up to 5MB</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Content Sections */}
                    <div className="border-t border-slate-700 pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-base font-medium text-slate-300">Blog Content Sections</label>
                        <button type="button" onClick={addHeading} className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm">
                          <PlusCircle className="w-4 h-4" /> Add Section
                        </button>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">
                        💡 Use <code className="bg-slate-700 px-1 rounded">**bold**</code>, <code className="bg-slate-700 px-1 rounded">*italic*</code>, <code className="bg-slate-700 px-1 rounded">- item</code> for bullets, <code className="bg-slate-700 px-1 rounded">1. item</code> for numbered lists.
                      </p>

                      {headings.length === 0 ? (
                        <div className="text-center py-8 bg-slate-700/30 rounded-lg border border-dashed border-slate-600">
                          <p className="text-slate-400">No sections added yet.</p>
                          <button type="button" onClick={addHeading} className="mt-2 text-blue-400 hover:text-blue-300">Click here to add your first section</button>
                        </div>
                      ) : (
                        <>
                          <div id="sections-container" className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {headings.map((heading, idx) => (
                              <div key={heading.id} className="bg-slate-700/50 rounded-lg border border-slate-600">
                                <div className="flex justify-between items-start p-4 pb-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-400">Section {idx + 1}</span>
                                    <select value={heading.level} onChange={(e) => updateHeading(idx, "level", e.target.value)} className="px-2 py-1 bg-slate-600 border border-slate-500 rounded text-sm text-white">
                                      {headingLevels.map((level, i) => <option key={i} value={level.value}>{level.label}</option>)}
                                    </select>
                                  </div>
                                  <button type="button" onClick={() => removeHeading(idx)} className="text-red-400 hover:text-red-300"><MinusCircle className="w-5 h-5" /></button>
                                </div>
                                <div className="p-4 pt-2">
                                  <input type="text" value={heading.text} onChange={(e) => updateHeading(idx, "text", e.target.value)} placeholder="Section Heading" className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-base mb-3" required />
                                  <RichTextToolbar onFormat={(cmd) => applyFormatting(`content-${idx}`, cmd)} onAddImage={() => addInlineImage(idx)} />
                                  {renderImagePreviewsInEditor(heading.content, idx)}
                                  <textarea
                                    id={`content-${idx}`}
                                    value={heading.content}
                                    onChange={(e) => updateHeading(idx, "content", e.target.value)}
                                    placeholder={"Write your content here...\n\nFormatting tips:\n**bold text** → bold\n*italic text* → italic\n- item → bullet point\n1. item → numbered list"}
                                    rows={6}
                                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-b-lg text-white text-base resize-y font-mono text-sm"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Bottom Add Section Button */}
                          <div className="mt-4 pt-4 border-t border-slate-600">
                            <button 
                              type="button" 
                              onClick={addHeading} 
                              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <PlusCircle className="w-5 h-5" /> Add New Section Below
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  // Preview Mode
                  <div className="p-6 bg-slate-900 rounded-lg max-h-[70vh] overflow-y-auto">
                    <h1 className="text-3xl font-bold text-rose-400 mb-2">{formData.title || "Untitled"}</h1>
                    {formData.description && (
                      <p className="italic text-slate-400 mb-6 border-l-4 border-rose-500 pl-4">{formData.description}</p>
                    )}
                    {headings.map((heading, idx) => (
                      <HeadingPreview key={idx} heading={heading} />
                    ))}
                    {headings.length === 0 && (
                      <p className="text-slate-500 text-center py-10">No sections yet — add sections in Edit Mode.</p>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-700 sticky bottom-0 bg-slate-800 py-4 -mb-5 -mx-5 px-5 mt-4">
                  <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-2.5 rounded-lg text-base font-medium">
                    {isSubmitting ? "Saving..." : editingBlog ? "Update Blog" : "Create Blog"}
                  </button>
                  <button type="button" onClick={closeModal} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg text-base font-medium">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}