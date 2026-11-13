
import cors from "cors"
import express from "express";
import cookieParser from "cookie-parser";
import "./cronJobs.js"
import Stripe from "stripe";
import net from "net";
import axios from "axios";
const app=express();
app.set("trust proxy", true);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

app.use(cors({origin:['http://localhost:5173', "http://localhost:5174", 'https://rule7media.com', 'https://www.rule7media.com'],credentials:true}));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(express.static("public"))
app.use(cookieParser())
app.set("trust proxy", true);

const cleanIp = (ip) => {
  if (!ip) return null;
  ip = ip.trim();
  if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
  return net.isIP(ip) ? ip : null; // valid IP hi allow
};

const isPrivateIp = (ip) =>
  !ip ||
  ip === "::1" ||
  ip === "127.0.0.1" ||
  ip.startsWith("192.168.") ||
  ip.startsWith("10.") ||
  /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
  ip.startsWith("fc") ||
  ip.startsWith("fd") ||
  ip.startsWith("fe80");

// Headers se pehla public IP nikaalo
const getClientIp = (req) => {
  const candidates = [
    req.headers["cf-connecting-ip"],
    req.headers["x-real-ip"],
    ...(req.headers["x-forwarded-for"]?.split(",") || []),
    req.ip,
    req.socket.remoteAddress,
  ];

  for (const c of candidates) {
    const ip = cleanIp(c);
    if (ip && !isPrivateIp(ip)) return ip;
  }
  return null; // koi public IP nahi mila (local dev)
};

const lookupCountry = async (ip) => {
  // 1st: ipapi.co
  try {
    const { data } = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 4000 });
    if (!data.error && data.country_name) return data.country_name;
  } catch {}

  // 2nd: ipwho.is
  try {
    const { data } = await axios.get(`https://ipwho.is/${ip}`, { timeout: 4000 });
    if (data.success && data.country) return data.country;
  } catch {}

  // 3rd: ip-api.com
  try {
    const { data } = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country`, { timeout: 4000 });
    if (data.status === "success" && data.country) return data.country;
  } catch {}

  return null;
};

app.get("/api/user-country", async (req, res) => {
  res.set("Cache-Control", "no-store");

  try {
    // 1) Production: header wala asli IP
    let ip = getClientIp(req);

    // 2) Local dev fallback: browser ka bheja hua IP
    if (!ip) {
      const hint = cleanIp(req.query.ip);
      if (hint && !isPrivateIp(hint)) ip = hint;
    }

    if (!ip) {
      return res.json({ ip: null, country: "Australia" });
    }

    const country = await lookupCountry(ip);
    res.json({ ip, country: country || "Australia" });
  } catch (err) {
    console.error("❌ user-country error:", err.message);
    res.json({ ip: null, country: "Australia" });
  }
});
import userRouter from "./routes/user.routes.js";
import productCategoryRouter from "./routes/productCategory.routes.js";
import auctionRouter from "./routes/auction.routes.js";
import cityRouter from "./routes/city.routes.js";
import bidRouter from "./routes/bid.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import cartRouter from "./routes/cart.routes.js";
import productRoutes from "./routes/product.routes.js"; 
import MessageRoutes from "./routes/message.routes.js";
import orderRoutes from "./routes/Order.routes.js"; 
import commissionRoutes from "./routes/commission.routes.js";
import executiveRoutes from "./routes/executive.routes.js";
import contactInfoRoutes from "./routes/contactInfo.routes.js";
import privacyRoutes from "./routes/privacy.routes.js";
import termsRoutes from "./routes/terms.routes.js";
import CookieRoutes from "./routes/cookie.routes.js"
import budgetRoutes from "./routes/budget.routes.js";
import fleetownerRoutes from "./routes/fleetowner.routes.js"
import budgetRequestRoutes from "./routes/fleetbudgetrequest.routes.js";
import vehicleRoutes from "./routes/vehical.routes.js";
import clickRoutes from './routes/click.routes.js';
import vehicleWrapRoutes from "./routes/vehiclewrap.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import StatisticRoutes from "./routes/statistics.routes.js";
import mapRoutes from "./routes/googlemap.routes.js"
import CpmComparison from "./routes/cpmComparison.routes.js"
import FleetOwner from "./models/fleetowner.model.js"
import Auction from "./models/auction.model.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import ApiResponse from "./utils/ApiResponse.js";
import wrapperassingorderRoutes from "./routes/wrapperassingorder.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js"
import pricingRoutes from "./routes/pricingPlan.routes.js";
import SubscriptionPlanRoutes from "./routes/subscriptionPlan.routes.js";
import { checkSubscriptionsCron } from "./cronJobs.js";
import campaignRoutes from "./routes/campaign.routes.js";
import AddGifRoutes from "./routes/adGif.routes.js"
import franchiseRoutes from "./routes/franchise.routes.js";
import mediaRoutes from "./routes/mediaLead.routes.js";
import enquiryRoutes from "./routes/enquiry.routes.js";
import backupRoutes from "./routes/backup.routes.js";
import deletedataRoutes from "./routes/deleteData.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import searchRoutes from "./routes/search.routes.js";
import emailSettingsRouter from "./routes/emailSettings.routes.js";
app.get("/", (req, res) => {
  res.status(200).json({
    status: "online",
    message: "Rule 7 Media API Service is running successfully!",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/users",userRouter);
app.use("/api/v1/product-categories",productCategoryRouter);
app.use("/api/v1/auctions",auctionRouter);
app.use("/api/v1/cities",cityRouter);
app.use("/api/v1/bids",bidRouter);
app.use("/api/v1/notifications",notificationRouter);
app.use("/api/v1/payments",paymentRouter);
app.use("/api/v1/cart", cartRouter)
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/Message", MessageRoutes);
app.use("/api/v1/commission", commissionRoutes);
app.use("/api/v1/executive", executiveRoutes);
app.use("/api/v1/contact", contactInfoRoutes);
app.use("/api/v1/privacy", privacyRoutes);
app.use("/api/v1/terms", termsRoutes);
app.use("/api/v1/cookie", CookieRoutes)
app.use("/api/v1/budget", budgetRoutes);
app.use("/api/v1/fleetowner", fleetownerRoutes);
app.use("/api/v1/vehicle", vehicleRoutes);
app.use("/api/v1/budget-requests", budgetRequestRoutes);
app.use('/api/v1/clicks', clickRoutes);
app.use('/api/v1/vehiclewrap', vehicleWrapRoutes);
app.use('/api/v1/subscription', subscriptionRoutes);
app.use('/api/v1/statistics', StatisticRoutes);
app.use('/api/v1/google-map', mapRoutes);
app.use('/api/v1/cpm', CpmComparison);
app.use('/api/v1/wrapperassingorder',wrapperassingorderRoutes)
app.use("/api/v1/dashboard",dashboardRoutes);
app.use("/api/v1/pricing",pricingRoutes);
app.use('/api/v1/subscription-plans',SubscriptionPlanRoutes);
app.use("/api/v1/campaigns",campaignRoutes);
app.use("/api/v1/add-gif",AddGifRoutes)
app.use("/api/v1/franchise", franchiseRoutes);
app.use("/api/v1/media-leads", mediaRoutes);
app.use("/api/v1/enquiries", enquiryRoutes);
app.use("/api/v1/backups", backupRoutes);
app.use("/api/v1/delete-data",deletedataRoutes)
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/admin", emailSettingsRouter);
export {app}