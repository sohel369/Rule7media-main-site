// controllers/productController.js

import Product from "../models/Product.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({ storage });

// Create Product
export const createProduct = async (req, res) => {
  try {
    const seller = await User.findById(req.body.seller);
    if (!seller) {
      return res.status(400).json({ error: "Invalid seller ID" });
    }
    const imageUrls = req.files.map((file) => {
      return file.path;
    });
    const newProduct = new Product({
      ...req.body,
      image: imageUrls, 
      seller: req.body.seller,
      sellerId: req.body.seller
    });
    
    const savedProduct = await newProduct.save();
    return res.status(201).json(new ApiResponse(201, savedProduct, "Product created successfully"));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

//get all products for seller


export const getProductsBySeller = async (req, res) => {
  try {
    const sellerId = req.params.UserId;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ message: "Invalid seller ID" });
    }
  
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate seller exists
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ 
        success: false, 
        message: "Seller not found" 
      });
    }

    // Get total count of products
    const totalProducts = await Product.countDocuments({ seller: sellerId });

    // Get paginated products with populated details
    const products = await Product.find({ seller: sellerId })
      .populate('category', 'name')
      .populate('seller', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
      productsPerPage: limit,
      data: products
    });

  } catch (error) {
    console.error("Error fetching seller products:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
}
// Get All Products
export const getAllProducts = async (req, res) => {
  try {
    let { page, limit, country } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const countryName = country || "United States";

    const filter = { 
      "officeLocations.country": { $regex: new RegExp(`^${countryName}$`, "i") }
    };

    const totalProducts = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const updatedData = { ...req.body };
 
    if (req.file) updatedData.image = req.file.path;

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Filter Products by Category and Name
// controllers/productController.js

export const filterProducts = async (req, res) => {
  try {
    const { category, name, zip, postCodes } = req.body; 

    let filter = {};

    if (category) {
      filter.category = { $regex: category.trim(), $options: "i" };
    }

    if (name) {
      filter.name = { $regex: name.trim(), $options: "i" };
    }
    if (zip || (postCodes && Array.isArray(postCodes) && postCodes.length > 0)) {
      let zipList = [];

      if (zip) {
        zipList.push(zip.trim());
      }

      if (postCodes && Array.isArray(postCodes)) {
        zipList = [...zipList, ...postCodes.map(z => z.trim()).filter(z => z)];
      }

      zipList = [...new Set(zipList)];

      if (zipList.length > 0) {
        filter["locations.zip"] = { $in: zipList };
      }
    }

    const products = await Product.find(filter)
      .populate("category", "name") 
      .populate("seller", "name email") 
      .sort({ createdAt: -1 });

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found matching your search criteria.",
        data: []
      });
    }

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      count: products.length,
      data: products
    });

  } catch (error) {
    console.error("Error in filterProducts:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal server error"
    });
  }
};
////////admin page product fetch 

export const getAllPro = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = Math.max(parseInt(page), 1);
    limit = Math.max(parseInt(limit), 1);

    const totalProducts = await Product.countDocuments();
    const products = await Product.find()
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ 
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      limit
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};
  