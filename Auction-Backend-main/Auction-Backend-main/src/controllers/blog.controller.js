import { Blog } from "../models/blog.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// ─── PUBLIC: Get blogs by country ────────────────────────────────────────
export const getBlogsByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    // Agar country "global" hai to sabhi blogs, warna country specific
    const query = country === "global" 
      ? {} 
      : { $or: [{ country: country.toLowerCase() }, { country: "global" }] };

    const blogs = await Blog.find(query)
      .sort({  createdAt: -1  })
      .skip(skip)
      .limit(limit);

    const totalBlogs = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      blogs,
      totalBlogs,
      currentPage: page,
      totalPages: Math.ceil(totalBlogs / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN: Create blog ─────────────────────────────────────────────────
export const createBlog = async (req, res) => {
  try {
    const { title, description, category, country, date, content, headings } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }
    
    const cloudinaryResult = await uploadOnCloudinary(req.file.path);
    
    const blog = await Blog.create({
      title,
      description,
      category,
      imageUrl: cloudinaryResult.secure_url,
      country: country || "global",
      date: date || new Date(),
      content: content || "", // Save the generated HTML content
      headings: headings || "[]", // Save headings as JSON string
    });
    
    res.status(201).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN: Update blog ─────────────────────────────────────────────────
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, country, date, content, headings } = req.body;
    
    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    
    let imageUrl = existingBlog.imageUrl;
    
    if (req.file) {
      const cloudinaryResult = await uploadOnCloudinary(req.file.path);
      imageUrl = cloudinaryResult.secure_url;
    }
    
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { 
        title, 
        description, 
        category, 
        imageUrl, 
        country, 
        date,
        content: content || existingBlog.content,
        headings: headings || existingBlog.headings,
      },
      { new: true }
    );
    
    res.status(200).json({ success: true, blog: updatedBlog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─── ADMIN: Delete blog ─────────────────────────────────────────────────
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    await Blog.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Blog deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN: Get all blogs ────────────────────────────────────────────────
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { country, category } = req.query;
    
    const query = {};
    if (country && country !== "all") query.country = country;
    if (category && category !== "all") query.category = category;
    
    const blogs = await Blog.find(query)
      .sort({  createdAt: -1  })
      .skip(skip)
      .limit(limit);
    
    const totalBlogs = await Blog.countDocuments(query);
    const categories = await Blog.distinct("category");
    
    res.status(200).json({
      success: true,
      blogs,
      totalBlogs,
      currentPage: page,
      totalPages: Math.ceil(totalBlogs / limit),
      categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};