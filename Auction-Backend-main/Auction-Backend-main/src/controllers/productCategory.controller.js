import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ProductCategory from "../models/productCategory.model.js";
import Auction from "../models/auction.model.js";



const createProductCategory = asyncHandler(async (req, res) => {
    try {
        const { name, description } = req.body;
        const image = req.file?.path;
        
        // Check if fields are empty
        if (!name || !description || !image) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
                statusCode: 400
            });
        }

        // Check if product category exists (case-insensitive)
        const existedProductCategory = await ProductCategory.findOne({ 
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });
        
        if (existedProductCategory) {
            return res.status(409).json({
                success: false,
                message: "Product category already exists",
                statusCode: 409
            });
        }

        // Upload image to cloudinary
        const imgUrlCloudinary = await uploadOnCloudinary(image);
        
        if (!imgUrlCloudinary) {
            return res.status(500).json({
                success: false,
                message: "Error uploading image to cloudinary",
                statusCode: 500
            });
        }

        // Create product category
        const productCategory = await ProductCategory.create({
            name: name.trim(),
            description: description.trim(),
            imageUrl: imgUrlCloudinary.url 
        });

        if (!productCategory) {
            return res.status(500).json({
                success: false,
                message: "Error creating product category",
                statusCode: 500
            });
        }

        // Return success response
        return res.status(201).json({
            success: true,
            message: "Product category created successfully",
            data: productCategory,
            statusCode: 201
        });

    } catch (error) {
        console.error("Create category error:", error);
        
        // Handle specific mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: `Validation Error: ${errors.join(', ')}`,
                statusCode: 400
            });
        }

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Product category with this name already exists",
                statusCode: 409
            });
        }

        // Handle other errors
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
            statusCode: 500
        });
    }
});


const getProductCategory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const productCategory = await ProductCategory.findById(id);

        if (!productCategory) {
            throw new ApiError(404, "Product category not found");
        }
        res.status(200).json(new ApiResponse(200, "Product category retrieved successfully", productCategory));

    } catch (err) {
        throw new ApiError(500, err?.message || "Internal server error");
    }
});




const getAllProductCategories = async ( req, res) => {
    try {
        const productCategories = await ProductCategory.find();
        res.status(200).json(new ApiResponse(200, "Product categories retrieved successfully", productCategories));
    } catch (err) {
        return res.status(500).json(new ApiResponse(500, err?.message || "Internal server error"));
    }
};



const updateProductCategory = asyncHandler(async (req, res) => {

try {
    const { id } = req.params;
    const { name, description } = req.body;
    const image = req.file?.path;
    const productCategory = await ProductCategory.findById(id);

    if (!productCategory) {
        
        return res.status(404).json(new ApiResponse(404, "Product category not found"));
    }
    //Checking for existing image and   updating the image
    if(image){
        const imgUrlCloudinary = await uploadOnCloudinary(image);
        if(!imgUrlCloudinary){
            throw new ApiError(500, "Error uploading image");
        }
        productCategory.imageUrl = imgUrlCloudinary.url;
    } 
    else{
        productCategory.imageUrl = productCategory.imageUrl;
    }
    
    productCategory.name = name ? name : productCategory.name;
    productCategory.description = description ? description : productCategory.description;

    await productCategory.save();

    res.status(201).json(new ApiResponse(201, "Product category updated successfully", productCategory));
    

    
} catch (error) {
    return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error"));
    
    }});



const deleteProductCategory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const productCategory = await ProductCategory.findById(id);
        if (!productCategory) {
            return res.status(404).json(new ApiResponse(404, "Product category not found"));


        }
        await ProductCategory.findByIdAndDelete(id);
        res.status(200).json(new ApiResponse(200, "Product category deleted successfully"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error"));

        
    }
})





const getCatgegoriesMoreDetail = asyncHandler(async (req, res)=>{
    try {

        const totalCategories = await ProductCategory.countDocuments();

        //find a categegory which have most products from Auction Model and get it
        const mostPopulatedCategory = await ProductCategory.aggregate([
            {
                $lookup: {
                    from: "auctions",
                    localField: "_id",
                    foreignField: "category",
                    as: "products"
                }
            },
            {
                $project: {
                    name: 1,
                    products: { $size: "$products" }
                }
            },
            {
                $sort: { 'products': -1 }
            },
            {
                $limit: 1
            }
        ]);

        
        const recentlyAddedCategory = await ProductCategory.findOne().sort({ 'createdAt': -1 });

     
        res.status(200).json(new ApiResponse(200, "Product categories retrieved successfully", {
            totalCategories,
             mostPopulatedCategory ,
            //  leastPopulatedCategory ,
            recentlyAddedCategory
        }));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error"));
    }
})




const getTopCategories = asyncHandler(async (req, res) => {
    try {
        const topCategories = await ProductCategory.aggregate([
            {
                $lookup: {
                    from: "auctions",
                    localField: "_id",
                    foreignField: "category",
                    as: "products"
                }
            },
            {
                $project: {
                    name: 1,
                    products: { $size: "$products" }
                }
            },
            {
                $sort: { 'products': -1 }
            },
            {
                $limit: 5
            }
        ]);
     
        res.status(200).json(new ApiResponse(200, "Top 5 categories retrieved successfully", topCategories));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error"));
    }
})
    



export { 
    createProductCategory
    , getAllProductCategories
    , getProductCategory
    , updateProductCategory
    , deleteProductCategory
    , getCatgegoriesMoreDetail
    , getTopCategories
 };
