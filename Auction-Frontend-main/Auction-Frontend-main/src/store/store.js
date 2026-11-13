import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import auctionReducer from "./auction/auctionSlice";
import productReducer from "./product/ProductSlice";
import orderReducer from "./order/OrderSlice";
import categoryReducer from "./category/categorySlice";
import cityReducer from "./city/citySlice";
import bidReducer from "./bid/bidSlice";
import notificationReducer from "./notification/notificationSlice";
import cartReducer from "./cart/cartSlice";
import userReducer from "./user/userSlice";
import countryReducer from "./countary/countrySlice";
import commissionReducer from "./commission/commissionSlice";
import executiveReducer from "./executives/executiveSlice";
import contactReducer from "./contact/contactSlice";
import privacyReducer from "./privacy/privacySlice";
import termsReducer from "./terms/termsSlice";
import cookieReducer from "./cookie/cookieSlice";
import paymentReducer from "./payment/paymentSlice";
import sellerOrderReducer from "./sellerOrder/sellerOrderSlice";
import budgetReducer from "./budget/budgetSlice";
import fleetownerReducer from "./fleetowner/fleetownerSlice";
import vehicleReducer from "./vehicle/vehicleSlice";
import fleetBudgetReducer from "./fleetbudgetrequest/fleetbudgetslice";
import clickReducer from "./click/clickSlice";
import adminBudgetReducer from "./adminbudgetrequest/adminbudgetSlice";
import vehicleWrapperReducer from "./vehicalwrapper/vehicalwrapperSlice";
import subscriptionReducer from "./subscription/subscriptionSlice";
import statisticReducer from "./statistic/statisticSlice";
import googleMapReducer from "./googlemap/googlemapService";
import cpmReducer from "./cpm/cpmSlice";
import wrapperReducer from "./wrapperassignorders/wrapperassignorderSlice";
import dashboardReducer from "./dashboard/dashboardSlice";
import pricingPlanReducer from "./pricing/pricingSlice";
import subscriptionPlanReducer from "./subscriptionplans/subscriptionPlanSlice";
import campaignReducer from "./campaign/campaignSlice";
import gifReducer from "./gif/gifSlice";
import franchiseReducer from "./franchise/franchiseSlice";
import mediaKitReducer from "./mediakit/mediaKitSlice";
import enquiryReducer from "./enquiry/enquirySlice";
import backupReducer from "./backup/backupSlice";
import deleteDataReducer from "./deleteData/deleteDataSlice"
import blogReducer from "./blog/blogSlice";
import searchReducer from "./Search/Searchslice";
import emailSettingsReducer from "./emailSettings/emailSettingsSlice";
export const store = configureStore({
  reducer: {
    //reducers
    auth: authReducer,
    auction: auctionReducer,
    product: productReducer,
    order: orderReducer,
    category: categoryReducer,
    city: cityReducer,
    bid: bidReducer,
    notification: notificationReducer,
    cart: cartReducer,
    user: userReducer,
    country: countryReducer,
    commission: commissionReducer,
    executives: executiveReducer,
    contactInfo: contactReducer,
    privacy: privacyReducer,
    terms: termsReducer,
    cookie: cookieReducer,
    payment: paymentReducer,
    sellerOrders: sellerOrderReducer,
    budget: budgetReducer,
    fleetOwner: fleetownerReducer,
    vehicles: vehicleReducer,
    fleetbudget: fleetBudgetReducer,
    adminbudget: adminBudgetReducer,
    click: clickReducer,
    vehiclewrapper: vehicleWrapperReducer,
    subscription: subscriptionReducer,
    statistic: statisticReducer,
    googleMap: googleMapReducer,
    cpm: cpmReducer,
    wrappers: wrapperReducer,
    dashboard: dashboardReducer,
    planes: pricingPlanReducer,
    subscriptionPlan: subscriptionPlanReducer,
    campaigns: campaignReducer,
    gif: gifReducer,
    franchise: franchiseReducer,
    mediaKit: mediaKitReducer,
    enquiry: enquiryReducer,
    backup: backupReducer,
    deleteData:deleteDataReducer,
    blog: blogReducer,
    search: searchReducer,
    emailSettings: emailSettingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
