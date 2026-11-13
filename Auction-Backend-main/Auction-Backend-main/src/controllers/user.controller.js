import dotenv from "dotenv";
dotenv.config();
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import User from "../models/user.model.js";
import Bid from "../models/bid.model.js";
import bcrypt from "bcryptjs";
import { getEmailTransporter, getFromAddress } from "../utils/emailTransporter.js";
import PaymentMethod from "../models/userPaymentMethod.model.js";
import Stripe from "stripe";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import axios from "axios";
import path from 'path';
import { fileURLToPath } from 'url';

import { allCountries } from "country-telephone-data";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import getEmailTemplate from "../emailTemplate.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");




const registerUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastname, 
    email,
    password,
    position,
    company,
    telephoneAreaCode,
    telephoneNumber,
    state,
    country,
    userType,
    street1,
    street2,
    suburb,
    city,
    postalCode,
    region,
    website,
    employees,
    yearsInBusiness,
    advertiserDetails,
    fleetOwnerDetails,
    wrappingShopDetails,
    location, 
  } = req.body;
  
  if (firstName == "") {
    return res.status(400).json(new ApiResponse(400, "firstName is required"));
  }

  if (
    [
      firstName,
      lastname,
      email,
      password,
      position,
      company,
      country,
      userType,
    ].some((fields) => String(fields)?.trim() === "")
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, "All fields are required"));
  }
  
  const existedUser = await User.findOne({
    $or: [{ email }],
  });

  if (existedUser) {
    return res.status(409).json(new ApiResponse(409, "User already exists"));
  }
  
  let stripeCustomerId = null;
  
  try {
    const customer = await stripe.customers.create({
      email,
      name: `${firstName} ${lastname}`,
      phone: telephoneNumber || null,
    });
    
    stripeCustomerId = customer.id;
  } catch (error) {
    console.error("Stripe customer creation error:", error);
    // Continue with registration even if Stripe customer creation fails
  }
  
  // Seller account id 
  let stripeAccountId = null;
  
  const telephoneCountryCode = telephoneAreaCode && typeof telephoneAreaCode === 'object'
    ? (telephoneAreaCode.phone_code || null) 
    : (typeof telephoneAreaCode === 'string' ? telephoneAreaCode : null);

  const userSelectedCountry = typeof country === 'string' 
    ? country // This will be the full country name from frontend
    : (country?.name || '');

  // FIXED: Removed 'UK' from unsupported list and will convert UK to GB
  const unsupportedExpressCountries = ['IN', 'BD', 'PK', 'AE', 'LK', 'NG', 'VN']; 
  
  function getCountryCodeFromName(countryName) {
    const country = allCountries.find(c => 
      c.name.toLowerCase() === countryName.toLowerCase()
    );
    return country ? country.iso2.toUpperCase() : 'AU';
  }

  let countryCodeForStripe = typeof country === 'string' 
    ? getCountryCodeFromName(country)
    : (country?.iso2 || '').toUpperCase();

  // FIXED: Convert UK to GB (proper ISO code for United Kingdom)
  if (countryCodeForStripe === 'UK') {
    countryCodeForStripe = 'GB';
  }

  // Fixed validation logic
  if (userType === 'seller' || userType === 'fleetOwner') {
    // Validate telephone country code exists and is valid (1-4 digits)
    if (!telephoneCountryCode || !/^\d{1,4}$/.test(telephoneCountryCode.toString())) {
      return res.status(400).json(
        new ApiResponse(400, "Valid telephone country code is required for sellers and fleet owners")
      );
    }

    // Validate we got a valid country code for Stripe (2 letters)
    if (!countryCodeForStripe || countryCodeForStripe.length !== 2) {
      return res.status(400).json(
        new ApiResponse(400, "Valid country is required for sellers and fleet owners")
      );
    }

    // Validate user selected country name exists
    if (!userSelectedCountry || userSelectedCountry.trim() === '') {
      return res.status(400).json(
        new ApiResponse(400, "Valid country name is required for sellers and fleet owners")
      );
    }
    
    try {
      const accountType = unsupportedExpressCountries.includes(countryCodeForStripe) ? 'standard' : 'express';
      

      const accountConfig = {
        type: accountType,
        country: countryCodeForStripe,
        email: email,
      };

      // Add capabilities based on account type
      if (accountType === 'express') {
        accountConfig.capabilities = {
          card_payments: { requested: true },
          transfers: { requested: true }
        };
      } else {
        // For standard accounts, add business type
        accountConfig.business_type = 'individual'; // Can be 'company' or 'individual'
      }

      const account = await stripe.accounts.create(accountConfig);
      stripeAccountId = account.id;
      
      
    } catch (err) {
  console.error("⚠️ Stripe Connect error (non-fatal):", err.message);
  stripeAccountId = null; 
}
  }

  // Create user with whatever Stripe data we have
  const user = await User.create({
    firstName: firstName?.toLowerCase(),
    lastname: lastname?.toLowerCase(),
    email,
    password,
    position,
    company,
    telephoneAreaCode: telephoneAreaCode?.phone_code || telephoneAreaCode || null,
    telephoneNumber: telephoneNumber || null,
    ...((userType === 'seller' || userType === 'fleetOwner') && {
      stripeAccountId,
    }),
    country: userSelectedCountry, // Store the full country name
    countryCode: countryCodeForStripe, // Store the 2-letter code (GB for UK)
    state,
    userType,  
    street1,
    street2,
    suburb,
    city: city || '',
    location: {
      name: location?.name || '', 
      zip: location?.zip || postalCode || '',
      latitude: location?.latitude || null,
      longitude: location?.longitude || null
    },
    postalCode: (location?.zip || postalCode || ''),
    region,
    website,
    employees,
    yearsInBusiness,
    
    ...(userType === 'wrapper' && { 
      wrappingShopDetails: {
        designService: wrappingShopDetails?.designService || "NO",
        fittingTime: {
          smallVan: wrappingShopDetails?.fittingTime?.smallVan || {},
          mediumVan: wrappingShopDetails?.fittingTime?.mediumVan || {},
          largeVan: wrappingShopDetails?.fittingTime?.largeVan || {},
          interCityTruck: wrappingShopDetails?.fittingTime?.interCityTruck || {},
        },
        overnightFitting: wrappingShopDetails?.overnightFitting || "NO"
      }
    }),
    
    ...(userType === 'fleetOwner' && { 
      fleetOwnerDetails: {
        operatingArea: fleetOwnerDetails?.area || null,
        vehicleTypes: {
          deliveryVan: parseInt(fleetOwnerDetails?.deliveryVans) || 0,
          boxVan: parseInt(fleetOwnerDetails?.boxVans) || 0,
          longHaul: parseInt(fleetOwnerDetails?.longHaul) || 0,
        },
        standbyVehicles: fleetOwnerDetails?.standby === "Yes",
        availability: fleetOwnerDetails?.availability || null,
        prohibitedAdvertising: fleetOwnerDetails?.prohibitedAdvertising || {
          gambling: false,
          alcohol: false,
          smoking: false,
          other: false,
          otherSpecify: "",
        },
      }
    }),
    
    ...(userType === 'advertiser' && {
      advertiserDetails: {
        campaignArea: advertiserDetails?.campaignArea || '', 
        brandRecognition: advertiserDetails?.brandRecognition === "Yes",
        specialPromotion: advertiserDetails?.specialPromotion === "Yes", 
        campaignLength: advertiserDetails?.campaignLength || '', 
        potentialVehicleRequirement: advertiserDetails?.potentialVehicleRequirement || '', 
      }
    }),
  });

  const createdUser = await User.findById(user._id).select("-password");
  if (!createdUser) {
    return res.status(500).json(new ApiResponse(500, "Error creating user"));
  }
  
  if (stripeCustomerId) {
    try {
      await PaymentMethod.create({
        stripeCustomerId,
        userId: createdUser._id,
      });
    } catch (paymentMethodError) {
      console.error("Error creating payment method record:", paymentMethodError);
      // Continue anyway - this isn't critical
    }
  }
  
  const emailContent = `
  <p style="font-size: 16px; color: #333333; line-height: 1.5;">Dear <strong style="color: #0056b3;">${firstName} ${lastname}</strong>,</p>
  <p style="font-size: 16px; color: #333333; line-height: 1.5;">Thank you for registering with us!</p>
  
  <div style="margin: 25px auto; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
             padding: 20px; border-radius: 8px; border-left: 4px solid #0056b3;
             box-shadow: 0 2px 4px rgba(0,0,0,0.05); max-width: 80%;">
      <p style="font-size: 15px; color: #28a745; font-weight: 600; margin: 0; line-height: 1.6;">
          🎉 We're excited to have you on board. Enjoy our services!
      </p>
      <p style="font-size: 13px; color: #6c757d; margin: 10px 0 0; line-height: 1.5;">
          If you did not request this, please ignore this email.
      </p>
  </div>
  
  <p style="font-size: 14px; color: #6c757d; margin-top: 20px; line-height: 1.5;">
      Best regards,<br>
      <span style="color: #0056b3;">RULE 7 MEDIA</span>
  </p>
`;

  try {
    const transporter = await getEmailTransporter();
    const fromAddress = await getFromAddress();

    const mailOptions = {
      from: fromAddress,
      to: createdUser.email,
      subject: "Welcome to Our Platform!",
      html: getEmailTemplate("Welcome User ", emailContent),
      attachments: [
        { filename: 'header.png', path: path.join(__dirname, '..', 'header.png'), cid: 'header' },
        { filename: 'footer.png', path: path.join(__dirname, '..', 'footer.png'), cid: 'footer' }
      ]
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Email send error:", err.message);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "User Registered successfully", createdUser));
});

//////////
// Add this new endpoint to get seller onboarding status
// In your generateOnboardingLink controller
const generateOnboardingLink = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.sellerId);
    
    if (!user || user.userType !== 'seller') {
      return res.status(404).json(new ApiResponse(404, 'Seller not found'));
    }

    // Create Stripe account if it doesn't exist
    if (!user.stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        business_type: 'individual',
        email: user.email, // Ensure email is included
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      user.stripeAccountId = account.id;
      await user.save();
    }

    // Get detailed account information
    const account = await stripe.accounts.retrieve(user.stripeAccountId, {
      expand: ['requirements']
    });

    // More comprehensive status check
    const needsOnboarding = !account.details_submitted || 
                         account.requirements.currently_due.length > 0 ||
                         account.requirements.past_due.length > 0;

    // Generate appropriate link
    const accountLink = await stripe.accountLinks.create({
      account: user.stripeAccountId,
      refresh_url: `${process.env.FRONTEND_URL}/user-profile/SellerOnboarding?reauth=true`,
      return_url: `${process.env.FRONTEND_URL}/user-profile/SellerOnboarding?success=true`,
      type: needsOnboarding ? 'account_onboarding' : 'account_update',
    });

    // Update user status with more detailed information
    let verificationStatus;
    if (account.charges_enabled && account.payouts_enabled) {
      verificationStatus = 'verified';
    } else if (account.details_submitted) {
      verificationStatus = 'pending';
    } else {
      verificationStatus = 'unverified';
    }

    user.stripeOnboardingUrl = accountLink.url;
    user.stripeVerificationStatus = verificationStatus;
    await user.save();

    res.json(new ApiResponse(200, 'Onboarding link generated', {
      onboardingUrl: accountLink.url,
      isUpdate: !needsOnboarding,
      accountId: user.stripeAccountId,
      requirements: account.requirements
    }));
    
  } catch (err) {
    console.error("Onboarding link generation error:", err);
    res.status(500).json(new ApiResponse(500, err.message));
  }
});
const getonboardlink = async (req, res) => {
  try {
    const user = await User.findById(req.params.sellerId);
    
    if (!user || user.userType !== 'seller') {
      return res.status(404).json({ error: 'Seller not found' });
    }

    res.json({
      needsOnboarding: !user.stripeAccountId,
      onboardingUrl: user.stripeOnboardingUrl,
      accountId: user.stripeAccountId
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const checkSellerVerification = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.sellerId);
    
    if (!user || user.userType !== 'seller' || !user.stripeAccountId) {
      return res.status(404).json(new ApiResponse(404, "Seller not found or no Stripe account"));
    }

    // Get the account details from Stripe
    const account = await stripe.accounts.retrieve(user.stripeAccountId);
    
    let verificationStatus = "unverified";
    
    if (account.details_submitted && account.payouts_enabled) {
      verificationStatus = "verified";
    } else if (account.details_submitted) {
      verificationStatus = "pending";
    }
    
    // Update user in database with verification status
    await User.findByIdAndUpdate(user._id, { stripeVerificationStatus: verificationStatus });

    res.json(new ApiResponse(200, "Verification status retrieved", { 
      verificationStatus,
      accountDetails: {
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted
      }
    }));
    
  } catch (err) {
    console.error("Stripe verification check error:", err);
    res.status(500).json(new ApiResponse(500, err.message));
  }
});
export const getPayoutMethods = async (req, res) => {
  const { accountId } = req.params;
  const stripeAccountId = accountId; // Seller's Stripe account ID

  try {
    const account = await stripe.accounts.retrieve(stripeAccountId);
    
  
  } catch (error) {
    console.error("Error retrieving Stripe account:", error);
  }
  try {
    const externalAccounts = await stripe.accounts.listExternalAccounts(accountId, {
      object: 'bank_account', // or 'card'
      limit: 3,
    });
   
    res.json({
      payout_methods: externalAccounts.data.map(account => ({
        id: account.id,
        type: account.object,
        bank_name: account.bank_name || null,
        last4: account.last4,
        currency: account.currency,
        country: account.country,
        status: account.status,
      })),
    });

  } catch (error) {
    console.error("Stripe payout method fetch error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const verifiystripaccount= async (req, res) => {
  try {
    const account = await stripe.accounts.retrieve(req.params.accountId);
    
    // Determine verification status
    const verificationStatus = {
      isVerified: account.charges_enabled && account.payouts_enabled,
      isPending: account.details_submitted && !(account.charges_enabled && account.payouts_enabled),
      requirements: account.requirements,
      capabilities: account.capabilities,
      external_accounts: account.external_accounts
    };

    res.json({
      status: 'success',
      data: {
        ...verificationStatus,
        rawAccount: account // Include full account data if needed
      }
    });
  } catch (error) {
    console.error('Stripe account status check failed:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      code: error.code || 'stripe_error'
    });
  }
};
const generateUpdateLink = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    const user = await User.findOne({ _id: sellerId, userType: 'seller' });

    if (!user || !user.stripeAccountId) {
      return res.status(400).json({
        status: 'error',
        message: 'Seller not found or Stripe account not associated'
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: user.stripeAccountId,
      refresh_url: `${process.env.FRONTEND_URL}/user-profile/SellerOnboarding?redirect_from=stripe&status=reauth`,
      return_url: `${process.env.FRONTEND_URL}/user-profile/SellerOnboarding?redirect_from=stripe&status=success`,
      type: 'account_onboarding',
    });

    res.json({
      status: 'success',
      updateUrl: accountLink.url
    });
  } catch (error) {
    console.error('Error generating Stripe update link:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to generate update link'
    });
  }
};
const getSellerPayouts = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const seller = await User.findById(sellerId);
    
    if (!seller || !seller.stripeAccountId) {
      return res.status(404).json(
        new ApiResponse(404, 'Seller Stripe account not found')
      );
    }

    // 1. Get current balance (available and pending)
    const balance = await stripe.balance.retrieve({
      stripeAccount: seller.stripeAccountId
    });

    // 2. Get all payouts (money already sent to seller)
    const payouts = await stripe.payouts.list({
      limit: 100,
      status: 'paid'
    }, {
      stripeAccount: seller.stripeAccountId
    });

    // 3. Get pending charges (money not yet available for payout)
    const pendingCharges = await stripe.charges.list({
      limit: 100,
      status: 'pending'
    }, {
      stripeAccount: seller.stripeAccountId
    });

    // Calculate totals
    const availableBalance = balance.available.reduce(
      (sum, b) => sum + b.amount, 0) / 100;
    
    const pendingBalance = balance.pending.reduce(
      (sum, b) => sum + b.amount, 0) / 100;
    
    const totalPayouts = payouts.data.reduce(
      (sum, p) => sum + p.amount, 0) / 100;
    
    const totalPendingCharges = pendingCharges.data.reduce(
      (sum, c) => sum + c.amount, 0) / 100;

    // Calculate lifetime earnings
    const lifetimeEarnings = availableBalance + totalPayouts + pendingBalance;

    res.json(new ApiResponse(200, "Earnings calculated", {
      earnings: {
        available: availableBalance,
        pending_clearance: pendingBalance,
        pending_charges: totalPendingCharges,
        already_paid_out: totalPayouts,
        lifetime_total: lifetimeEarnings,
        currency: balance.available[0]?.currency || 'usd'
      },
      breakdown: {
        available_by_currency: balance.available.map(b => ({
          currency: b.currency,
          amount: b.amount / 100
        })),
        pending_by_currency: balance.pending.map(b => ({
          currency: b.currency,
          amount: b.amount / 100
        }))
      }
    }));

  } catch (error) {
    console.error('Error calculating seller earnings:', error);
    res.status(500).json(new ApiResponse(500, error.message));
  }
};
// @desc Login user
// @route POST /api/v1/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!password && !email) {
    res
      .status(400)
      .json(new ApiResponse(400, "Email and password are required"));
    return;
  }


  // Password verification

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json(new ApiResponse(404, "User not found"));
    return;
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(401).json(new ApiResponse(401, "Invalid password"));
    return;
  }

  const JwtToken = user.generateJwtToken();

  const loggedInUser = await User.findById(user._id).select("-password");

  const options = {
    //httpOnly: true,
    secure: true,
    maxAge: 1 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("JwtToken", JwtToken, options)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: loggedInUser,
        JwtToken,
      })
    );
});

// @desc Forgot password
// @route POST /api/v1/users/forgot-password
// @access Public


const forgetPasswordSendEmail = asyncHandler(async (req, res) => {
  const { email, country } = req.body.email ? req.body.email : req.body;


  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }
  
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: "This email is not registered." });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpExpires = Date.now() + 10 * 60 * 1000;
  user.resetOtp = otp;
  user.resetOtpExpires = otpExpires;
  await user.save({ validateBeforeSave: false });

  const emailContent = `
    <p style="font-size: 16px;">Dear User,</p>
    <p style="font-size: 16px;">Your OTP for password reset is:</p>
    <div style="margin: 30px auto; background: #f3f3f3; padding: 15px; border-radius: 5px; font-size: 32px; font-weight: bold; color: #d9534f; display: inline-block;">
      ${otp}
    </div>
    <p style="font-size: 14px;">This OTP is valid for 10 minutes.</p>
    <p style="font-size: 14px;">If you did not request this, please ignore this email.</p>
  `;

  try {
    const transporter = await getEmailTransporter();
    const fromAddress = await getFromAddress();

    const mailOptions = {
      from: fromAddress,
      to: user.email,
      subject: "Password Reset OTP",
      html: getEmailTemplate("Password Reset", emailContent),
      attachments: [
        { filename: 'header.png', path: path.join(__dirname, '..', 'header.png'), cid: 'header' },
        { filename: 'footer.png', path: path.join(__dirname, '..', 'footer.png'), cid: 'footer' }
      ]
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: `OTP sent to ${user.email}`,
      userId: user._id.toString(),
    });
  } catch (err) {
    console.error("Email Sending Error:", err);
    return res.status(500).json({ success: false, message: "Error sending email" });
  }
});


const forgetPassword = asyncHandler(async (req, res) => {
  const { userId, password } = req.body;
  if (!userId || !password) {
    return res
      .status(400)
      .json({ success: false, message: "User ID and Password required" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  user.password = password;
  await user.save();

  const updatedUser = await User.findById(userId);

  const isMatch = await bcrypt.compare(password, updatedUser.password);

  return res
    .status(200)
    .json({ success: true, message: "Password reset successfully" });
});

// @desc Reset password
// @route POST /api/v1/users/reset-password/:id/:token
// @access Public

const resetPassword = asyncHandler(async (req, res) => {
  //get user id and reset token
  //check if user exists
  //check if token is valid
  //update user password
  //return response
  const { id, token } = req.params;
  const { password } = req.body;
  if (!id || !token || !password) {
    return res.status(400).json(new ApiResponse(400, "Invalid request"));
  }
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, "User not found"));
  }
  if (!user.resetToken) {
    return res.status(400).json(new ApiResponse(400, "Invalid reset link"));
  }

  if (user.resetToken !== token) {
    return res.status(400).json(new ApiResponse(400, "Invalid reset link"));
  }
  if (user.resetTokenExpire < Date.now()) {
    return res.status(400).json(new ApiResponse(400, "Reset link expired"));
  }

  try {
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();
    return res
      .status(200)
      .json(new ApiResponse(200, "Password reset successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, "Error resetting password"));
  }
});

// @desc Logout user
// @route POST /api/v1/users/logout
// @access Private

const logoutUser = asyncHandler(async (req, res) => {
  //clear cookies
  //return response
  res.clearCookie("JwtToken");
  res.status(200).json(new ApiResponse(200, "User logged out successfully"));
});

// @desc update user profile
// @route POST /api/v1/users/update-user-profile
// @access Private

const updateUserProfile = asyncHandler(async (req, res) => {
  //get user id from token
  //get user details from frontend
  //update user profile
  //return respons

  try {
    const {
      firstName,
      lastname,
      email,
      location,
      userType,
      position,
      company,
      telephoneNumber,
    street1,
    street2,
      country,
      state,
suburb,
      city,
      description,
    } = req.body;


    const profilePath = req.file?.path;
    const userId = req.user?._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json(new ApiResponse(400, "User not found"));
    }
    if (profilePath) {
      var imgUrlCloudinary = await uploadOnCloudinary(profilePath);
   
      if (!imgUrlCloudinary?.url) {
        return res.status(400).json(new ApiResponse(400, "Invalid image"));
      }
    }

    user.firstName = firstName ? firstName : user.firstName;
    user.lastname = lastname ? lastname : user.lastname;
    user.email = email ? email : user.email;
    user.location = location ? location : user.location;
    user.userType = userType ? userType : user.userType;
    user.street1 =street1 ? street1 : user.street1;
     user.street2 =street2 ? street2 : user.street2;
    user.profilePicture = imgUrlCloudinary?.url
      ? imgUrlCloudinary.url
      : user.profilePicture ||
        "https://res.cloudinary.com/dnsxaor2k/image/upload/v1709735601/vsauyvodor9ykjca5zvj.jpg";
    
    user.position = position ? position : user.position;
    user.company = company ? company : user.company;
    user.telephoneNumber = telephoneNumber
      ? telephoneNumber
      : user.telephoneNumber;
    user.country = country ? country : user.country;
    user.state = state ? state : user.state;
    user.suburb = suburb ? suburb : user.suburb ;
    user.city = city ? city : user.city ;
    user.description = description ? description : user.description;

    await user.save();

    res.json(
      new ApiResponse(200, "User profile updated successfully", { user: user })
    );
  } catch (error) {
    console.error(error);
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          error.message || "Internal Server Error"
        )
      );
  }
});

// @desc change current password
// @route POST /api/v1/users/change-password
// @access Private

const changeCurrentPassword = asyncHandler(async (req, res) => {
  try {
    //get user id from token
    const userId = req.user._id;
    //get old password and new password from frontend
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json(new ApiResponse(400, "All fields are required"));
    }

    //check if the old password is correct
    const user = await User.findById(userId);

    if (!user || !(await user.comparePassword(oldPassword))) {
      return res.status(401).json(new ApiResponse(401, "Invalid old password"));
    }

    //if everything is ok then update the password
    user.password = newPassword;
    await user.save();

    //return response
    res.json(new ApiResponse(200, "Password changed successfully"));
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          error.message || "Internal Server Error"
        )
      );
  }
});

// @desc get current user
// @route GET /api/v1/users/current-user
// @access Private
const getCurrentUser = asyncHandler(async (req, res) => {
  try {
 
    const user = await User.findById(req.user._id).select("-password");
    return res
      .status(200)
      .json(new ApiResponse(200, "User fetched", { user: user }));
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          error.message || "Internal Server Error"
        )
      );
  }
});

// @desc get all users
// @route GET /api/v1/users
// @access Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json(new ApiResponse(200, "Users fetched successfully", users));
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          error.message || "Internal Server Error"
        )
      );
  }
});
const getAllAdmin = asyncHandler(async (req, res) => {
  try {
    const admins = await User.find({ userType: "admin" }).select("-password"); // Filter only admins
    res.json(new ApiResponse(200, "Admins fetched successfully", admins));
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          error.message || "Internal Server Error"
        )
      );
  }
});
const getSellersForUser = async (userId) => {
  try {
      

      // Check if userId is missing or empty
      if (!userId) {
          throw new Error("User ID is required");
      }

      // If it's an object, extract the actual ID value
      if (typeof userId === "object" && userId._id) {
          userId = userId._id;
      }

      // Convert to string and trim
      const userIdStr = String(userId).trim();
   

      if (!userIdStr) {
          throw new Error("User ID cannot be empty");
      }

      // Validate MongoDB ObjectId format
      if (!mongoose.Types.ObjectId.isValid(userIdStr)) {
          throw new Error(`Invalid User ID format: ${JSON.stringify(userId)}`);
      }

      // Convert to ObjectId
      const userObjectId = new mongoose.Types.ObjectId(userIdStr);

      // Fetch bids
      const bids = await Bid.find({ bidder: userObjectId }).populate({
          path: "auction",
          select: "seller",
          populate: { path: "seller", select: "_id" },
      });

      // Extract unique seller IDs
      const sellerIds = [...new Set(bids.map((bid) => bid.auction?.seller?._id.toString()).filter(Boolean))];

      if (sellerIds.length === 0) {
          return [];
      }

      // Fetch seller details
      const sellers = await User.find({ _id: { $in: sellerIds } }).select("firstName lastName email profilePicture");

      return sellers;
  } catch (error) {
      console.error("Error fetching sellers:", error.message);
      return [];
  }
};


// @desc get current user
// @route GET /api/v1/users/:userid
// @access Admin
const getUserById = asyncHandler(async (req, res) => {
  try {
   
    const user = await User.findById(req.params.userid).select("-password");
    return res
      .status(200)
      .json(new ApiResponse(200, "User fetched", { user: user }));
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          error.message || "Internal Server Error"
        )
      );
  }
});

// @desc update user profile by id
// @route POST /api/v1/users/update-user/:id
// @access Admin

const updateUserById = asyncHandler(async (req, res) => {
  try {
    const {
      firstName,
      lastname,
      email,
      location,
      userType,
      telephoneNumber, 
      address,
      city,
      suburb,
      street1,
      street2,
      description,
      position,
      company,
      state,
      country,
      role
    } = req.body;
    
    
    const profilePath = req.file?.path;
    const userId = req?.params?.id;
   
    // Check user id is correct format which is for models not any other like string
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json(new ApiResponse(400, "Invalid user id"));
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json(new ApiResponse(400, "User not found"));
    }
    
    if (profilePath) {
      var imgUrlCloudinary = await uploadOnCloudinary(profilePath);
      if (!imgUrlCloudinary?.url) {
        return res.status(400).json(new ApiResponse(400, "Invalid image"));
      }
    }

    // Update all fields that are being sent from frontend
    user.firstName = firstName ? firstName : user.firstName;
    user.lastname = lastname ? lastname : user.lastname; // Added
    user.email = email ? email : user.email;
    user.location = location ? location : user.location;
    user.userType = userType ? userType : user.userType;
    user.role = role ? role : user.role; // Added
    user.profilePicture = imgUrlCloudinary?.url
      ? imgUrlCloudinary.url
      : user.profilePicture ||
        "https://res.cloudinary.com/dnsxaor2k/image/upload/v1709735601/vsauyvodor9ykjca5zvj.jpg";
    user.telephoneNumber = telephoneNumber ? telephoneNumber : user.telephoneNumber; // Updated field name
    user.address = address ? address : user.address;
    user.city = city ? city : user.city;
    user.suburb = suburb ? suburb : user.suburb;
    user.street1 = street1 ? street1 : user.street1;
    user.street2 = street2 ? street2 : user.street2;
   
    user.description = description ? description : user.description;
    user.position = position ? position : user.position; // Added
    user.company = company ? company : user.company; // Added
    user.state = state ? state : user.state; // Added
    user.country = country ? country : user.country; // Added

    await user.save();

    res.json(
      new ApiResponse(200, "User profile updated successfully", { user: user })
    );
  } catch (error) {
    console.error(error);
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          error.message || "Internal Server Error"
        )
      );
  }
});

// @desc delete a user by id
// @route DELETE /api/v1/users/:id
// @access Admin

const deleteUserById = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json(new ApiResponse(400, "Invalid user id"));
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json(new ApiResponse(404, "User not found"));
    }
    return res.json(new ApiResponse(200, "User deleted successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          error.message || "Internal Server Error"
        )
      );
  }
});

// @desc TOP 5 SELLERS WHO UPLOADED MORE ITEMS AND SOLD(STATUS IS PAID)
// @route GET /api/v1/users/top-sellers
// @access Admin

const getTopSellers = asyncHandler(async (req, res) => {
  try {
    const topSellers = await User.aggregate([
      {
        $lookup: {
          from: "auctions",
          localField: "_id",
          foreignField: "seller",
          as: "auctions",
        },
      },
      {
        $match: {
          "auctions.paid": true,
        },
      },
      {
        $project: {
          firstName: 1,
          email: 1,
          profilePicture: 1,
          totalAuctions: { $size: "$auctions" },
          paidAuctions: {
            $size: {
              $filter: {
                input: "$auctions",
                as: "auction",
                cond: { $eq: ["$$auction.paid", true] },
              },
            },
          },
        },
      },

      {
        $sort: { totalAuctions: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    res.json(
      new ApiResponse(200, "Top sellers fetched successfully", topSellers)
    );
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          error.message || "Internal Server Error"
        )
      );
  }
});

// @desc TOP FIVE CITIES WHICH HAVE MOST USERS
// @route GET /api/v1/users/top-cities
// @access Admin

const getTopCities = asyncHandler(async (req, res) => {
  try {
    const topCities = await User.aggregate([
      {
        $group: {
          _id: "$city",
          totalUsers: { $sum: 1 },
        },
      },
      {
        $sort: { totalUsers: -1 },
      },
      {
        $limit: 6,
      },
    ]);
    //remove first item
    topCities.splice(0, 1);
    res.json(
      new ApiResponse(200, "Top cities fetched successfully", topCities)
    );
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          error.message || "Internal Server Error"
        )
      );
  }
});

// In your user routes
// In userController.js
// In your user controller
 const saveFCMToken = async (req, res) => {
  const { userId, fcmToken } = req.body;

  // Validate input
  if (!userId || !fcmToken) {
    return res.status(400).json({
      success: false,
      message: "userId and fcmToken are required",
    });
  }

  try {
    // Update user's FCM token
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fcmToken },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FCM token saved successfully",
    });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



export {
  registerUser,
  loginUser,
  forgetPasswordSendEmail,
  resetPassword,
  logoutUser,
  updateUserProfile,
  changeCurrentPassword,
  getCurrentUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getTopSellers,
  getTopCities,
  forgetPassword,
  getAllAdmin,
  getSellersForUser,
  getonboardlink,
  checkSellerVerification,
  generateOnboardingLink,
  generateUpdateLink,
  verifiystripaccount,
  getSellerPayouts,
  saveFCMToken
};
