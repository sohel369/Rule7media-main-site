import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import  User  from "../models/user.model.js";


export const verifyUser = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.JwtToken ||  req.headers.authorization?.split(" ")[1];
 
    if (!token) {
      return res.status(401).json(new ApiResponse(401, "Unauthorized request"));
    }

    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
  

    const user = await User.findById(decodedToken?._id).select("-password");

    if (!user) {
      return res.status(401).json(new ApiResponse(401, "Unauthorized request"));
    }

   

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json(new ApiResponse(401, error?.message || "Unauthorized request"));
  }
});

export const verifySeller = asyncHandler(async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.userType) {
      return res.status(403).json(new ApiResponse(403, "Access denied"));
    }

    if (user.userType !== "seller") {
      return res.status(403).json(new ApiResponse(403, "Access denied"));
    }

    

    next();
  } catch (error) {
    return res.status(401).json(new ApiResponse(401, error?.message || "Unauthorized request"));
  }
});
export const verifyBuyer = asyncHandler(async (req, res, next) => {
  try {

    
    const user = req.user;

    if (!user) {
    
      return res.status(401).json(new ApiResponse(401, "Unauthorized request"));
    }

    if (user.userType !== "buyer") {
      return res.status(403).json(new ApiResponse(403, "Access denied"));
    }

    next();
  } catch (error) {
    console.error("Error in verifyBuyer:", error); // Debug log
    return res.status(401).json(
      new ApiResponse(401, error?.message || "Unauthorized request")
    );
  }
});
export const verifyAdmin = asyncHandler(async (req, res, next) => {
  try {


    const user = req.user;
    if(!user){
      return res.status(401).json(new ApiResponse(401, "Unauthorized request"));
    }


    if (user.userType !== "admin") {
      return res.status(403).json(new ApiResponse(403, "Access denied"));
    }

    next();
  } catch (error) {
    return res.status(401).json(new ApiResponse(401, error?.message || "Unauthorized request"));
  }
});
export const verifyFleetOwner = asyncHandler(async (req, res, next) => {
  try {
    // Ensure user is authenticated first
    if (!req.user) {
      return res.status(401).json(
        new ApiResponse(401, null, "Authentication required")
      );
    }

    // Case-insensitive check
    const userType = req.user.userType?.toLowerCase();
    
    if (userType !== "fleetowner") {
      return res.status(403).json(
        new ApiResponse(403, null, "Fleet owner access required")
      );
    }

    // Check account status if you have such field
    if (req.user.accountStatus && req.user.accountStatus !== "active") {
      return res.status(403).json(
        new ApiResponse(403, null, "Fleet owner account not active")
      );
    }

    // Attach additional fleet owner context
    req.fleetOwner = {
      id: req.user._id,
      company: req.user.company,
      isVerified: req.user.isVerified || false
    };

    next();
  } catch (error) {
    return res.status(401).json(
      new ApiResponse(401, null, error?.message || "Authentication failed")
    );
  }
});
// middlewares/auth.middleware.js
export const verifySellerOrFleetOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { userType } = req.user;
    if (userType !== "seller" && userType !== "fleetOwner") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  } catch (error) {
    console.error("Error in verifySellerOrFleetOwner:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  const user = await User.findOne({ email });

  if (!user || !user.resetOtp || user.resetOtp !== parseInt(otp) || user.resetOtpExpires < Date.now()) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

  return res.status(200).json({
    success: true,
    message: "OTP verified",
    userId: user._id,
    token,
  });
});
export const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token" });
    }

    token = token.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};