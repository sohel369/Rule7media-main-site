import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // Common fields for all user types
    firstName: { type: String, required: true },
    lastname: { type: String, required: true },
    password: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    position: { type: String, required: true },
    company: { type: String, required: true },
    telephoneAreaCode: { type: mongoose.Schema.Types.Mixed, default: null },
    telephoneNumber: { type: String, default: null },
    state: { type: mongoose.Schema.Types.Mixed, },
    country: { type: mongoose.Schema.Types.Mixed, required: true },
    userType: { 
      type: String, 
      required: true,
      enum: ['seller', 'buyer', 'fleetOwner', 'advertiser', 'wrapper','admin'],
      default: "advertiser" 
    },
    
    stripeAccountId: { type: String, default: null },
    stripeOnboardingUrl: { type: String, default: null },
    stripeCustomerId: { type: String, default: null },
    subscription: {
    stripeSubscriptionId: { type: String },
    campaignId: { type: String },
    subscribedAt: { type: Date },
     status: {
    type: String,
      enum: ["active", "canceled", "past_due", "unpaid", "inactive"], 
  default: null
  },
    durationMonths: { type: String },
  },
 location: {
    name: String,
    zip: String,
    latitude: Number,
    longitude: Number
  },
    profilePicture: {
      type: String,
      default: "https://res.cloudinary.com/dnsxaor2k/image/upload/v1721403078/r4s3ingo0ysqq5hzsqal.jpg",
    },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    gender: { type: String },
    description: { type: String },
    paymentVerified: { type: Boolean, default: false },
    
    resetToken: { type: String },
    resetTokenExpire: { type: Date },
    fcmToken: String,
    resetOtp: { type: Number },
    resetOtpExpires: { type: Date },
    
    // References to other collections
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    bids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bid" }],
    auctions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Auction" }],
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],
    balance: { type: Number, default: 0 },
    
    // Address fields (common to most types)
    street1: { type: String },
    street2: { type: String },
    suburb: { type: String },
    postalCode: { type: String },
    region: { type: String },
    website: { type: String },
    employees: { type: Number },
    yearsInBusiness: { type: Number },
    
    // Fields specific to advertiser
    advertiserDetails: {
      campaignArea: { type: String, enum: ['Local', 'State/County Wide', 'National'] },
      brandRecognition: { type: String },
      specialPromotion: { type: String },
      campaignLength: { type: String, enum: ['3 Months', '6 Months', '12 Months','24 Months'] },
      potentialVehicleCount: { type: String },
    },
    
    // Fields specific to fleetOwner
    fleetOwnerDetails: {
      operatingArea: { type: String, enum: ['Local', 'State/County Wide', 'National'] },
      vehicleTypes: {
        deliveryVan: Number,
        boxVan: Number,
        longHaul: Number,
      },
      standbyVehicles: { type: Boolean },
      availability: { type: String, enum: ['3 Months', '6 Months', '12 Months','24 Months'] },
     prohibitedAdvertising: {
    gambling: Boolean, 
    alcohol: Boolean,
    smoking: Boolean,
    other: Boolean,
    otherSpecify: String,
  },
    },
    
    // Fields specific to wrappingShop
    wrappingShopDetails: {
      designService: { type: String, enum: ["YES", "NO"] },
      fittingTime: {
        smallVan: {
          oneSide: String,
          twoSide: String,
          rear: String,
          fullWrap: String
        },
        mediumVan: {
          oneSide: String,
          twoSide: String,
          rear: String,
          fullWrap: String
        },
        largeVan: {
          oneSide: String,
          twoSide: String,
          rear: String,
          fullWrap: String
        },
        interCityTruck: {
          oneSide: String,
          twoSide: String,
          rear: String,
          fullWrap: String
        },
      },
      overnightFitting: { type: String, enum: ["YES", "NO"] }
    }
  },
  {
    timestamps: true,
  }
);

// Password comparison method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// JWT token generation method
userSchema.methods.generateJwtToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      firstName: this.firstName,
      email: this.email,
      location: this.location,
      userType: this.userType,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

// Reset token generation method
userSchema.methods.generateResetToken = function () {
  const resetToken = jwt.sign(
    { _id: this._id },
    process.env.RESET_TOKEN_SECRET,
    { expiresIn: "10m" }
  );
  this.resetToken = resetToken;
  this.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 mins from now
  return resetToken;
};

userSchema.methods.compareTwoToken = (token) =>
  jwt.verify(token, process.env.RESET_TOKEN_SECRET);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);

export default User;