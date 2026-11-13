import React, { useEffect, useState, lazy, Suspense } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
const ContactUs = lazy(() => import("./pages/ContactUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
import { ToastContainer } from "react-toastify";
const ForgotPassword = lazy(() => import("./pages/auth/ForgatePassword"));
const ResetNewPassword = lazy(() => import("./pages/auth/ResetNewPassword"));
import { generateToken, onMessageListener } from "./firebase";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SingleAuctionDetail = lazy(() => import("./pages/SingleAuctionDetail"));
const FleetAuctionDetails = lazy(() => import("./pages/singlefleetauctindetails"));
const RecommendationsPage = lazy(() => import("./pages/RecommendationsPage"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const EditAuction = lazy(() => import("./pages/EditAuction"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const WhitePaper = lazy(() => import("./pages/WhitePaper"));
import Protected, {
  PublicRoute,
  SellerRoutes,
  AdminRoutes,
} from "./auth/Protected";
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Admin = lazy(() => import("./admin/Admin"));
import { useSelector } from "react-redux";
const AdminFooter = lazy(() => import("./admin/components/Footer"));
const AdminHeader = lazy(() => import("./admin/components/Header"));
const AdminLogin = lazy(() => import("./admin/pages/Login"));
const AdminDashboard = lazy(() => import("./admin/Admin"));
const ManageItems = lazy(() => import("./components/ManageItems"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ChatWidget = lazy(() => import("./components/chatwidget"));
const MyOrder = lazy(() => import("./components/MyOrder"));
const ProductDetails = lazy(() => import("./components/home/ProductDetails"));
const ChoosePaymentMethod = lazy(() => import("./components/ChoosePaymentMethod"));
/* const ProductCart = lazy(() => import("./components/home/ProductCart")); */
const Checkout = lazy(() => import("./components/Checkout"));
const OurProducts = lazy(() => import("./pages/OurProducts"));
const NewPassword = lazy(() => import("./pages/auth/NewPassword"));
import { fetchUserCountry } from "./store/countary/countrySlice";
const OrderSuccess = lazy(() => import("./components/OrderSuccess"));
import { useDispatch } from "react-redux";
const Productpayment = lazy(() => import("./components/ProductPayment"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
import axiosInstance from "./axiosInstance";
import { IoMicCircleOutline } from "react-icons/io5";
const VehicleWrapForm = lazy(() => import("./components/VehicleWrapSlider"));
const Statistics = lazy(() => import("./pages/Statistics"));
const PricingOptions = lazy(() => import("./components/PricingOptions"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const ModernCookieBanner = lazy(() => import("./components/ModernCookieBanner"));
import { Link } from "react-router-dom";
const SubsriptionPaymentSuccess = lazy(() => import("./components/SubsriptionPaymentSuccess"));
const SubscriptionPaymentCancel = lazy(() => import("./components/SubscriptionPaymentCancel"));
const BillboardPage = lazy(() => import("./components/BillboardSlider"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel"));
const FleetOwnerSubscription = lazy(() => import("./pages/FleetOwnerSubscription"));
const WrapperSubscription = lazy(() => import("./pages/WrapperSubscription"));
const ReauthPage = lazy(() => import("./components/ReauthPage"));
const CampaignDetailsPage = lazy(() => import("./pages/CampaignDetailsPage"));
const GifDetails = lazy(() => import("./pages/GifDetails"));
const FleetCampaignsResults = lazy(() => import("./pages/FleetCampaignsResults"));
const EditFleetAuction = lazy(() => import("./pages/EditFleetAuction"));
const CampaignSearchResults = lazy(() => import("./components/SingleCampaigns"));
const ViralEngine = lazy(() => import("./pages/ViralEngine"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Vision = lazy(() => import("./pages/Vision"));
const FAQ = lazy(() => import("./pages/FAQ"));
const SavingsOpportunities = lazy(() => import("./pages/SavingsOpportunities"));
const AdvertiseWithUs = lazy(() => import("./pages/AdvertiseWithUs"));
const LiveAuctions = lazy(() => import("./pages/LiveAuctions"));
const FranchiseLandingPage = lazy(() => import("./pages/FranchiseLandingPage"));
const CountryFranchisePage = lazy(() => import("./pages/CountryFranchisePage"));
const FleetOwnerLandingPage = lazy(() => import("./pages/FleetOwnerLandingPage"));
const BuyerMarketingExecutiveLandingPage = lazy(() => import("./pages/BuyerMarketingExecutiveLandingPage"));
const AncillaryAdvertisersLandingPage = lazy(() => import("./pages/AncillaryAdvertisersLandingPage"));
const WrapperLandingPage = lazy(() => import("./pages/WrapperLandingPage"));
const BuyerMarketSubsriptionPaymentSuccess = lazy(() => import("./components/BuyerMarketSubsriptionPaymentSuccess"));

const AffiliatePage = lazy(() => import("./pages/AffiliatePage"));
const Careers = lazy(() => import("./pages/Careers"));
const CPM = lazy(() => import("./pages/CPM"));
import SEO from "./components/SEO";
import { seoData } from "./seo/seoData";
import ScrollToTop from "./components/scrolltop";
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));
const PricingMethodology = lazy(() => import("./pages/PricingMethodology"));
const BusinessModel = lazy(() => import("./pages/BusinessModel"));
const FranchiseFaq = lazy(() => import("./pages/FranchiseFaq"));
const SuccessStory = lazy(() => import("./pages/SuccessStory"));
const FranchiseCardPage = lazy(() => import("./components/FranchiseCardPage"));
const IndustryNews = lazy(() => import("./pages/IndustryNews"));
const BlogDetail = lazy(() => import("./components/BlogDetail"));
const SearchResults = lazy(() => import("./components/SearchLocationCategory"));
const AdvancedSearchPage = lazy(() => import("./pages/AdvancedSearchPage"));
const HIDDEN_LAYOUT_ROUTES = [
  "/franchise",
  "/franchise-faq",
  "/blog",
  "/AncillaryAdvertisers",
  "/subscriberonly",
  "/businessmodel",
  "/firstmover",
  "/VehicleOwner",
  "/WrapperLandingPage",
  "/BuyerMarketingExecutive",
  "/countries-franchise",
  "/Careers",
  "/Cpm",
];
const isHomePage = location.pathname === "/";
const AppContent = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  const isHiddenLayoutPage =
    HIDDEN_LAYOUT_ROUTES.includes(location.pathname) ||
    location.pathname.startsWith("/franchise-card/") ||
    location.pathname.startsWith("/blog");
  const hasActiveSubscription =
    user?.subscription?.status?.toLowerCase()?.trim() === "active";
  const isLandingPage =
    location.pathname === "/" && (!user || !hasActiveSubscription);
  const shouldShowLayout = !isHiddenLayoutPage && !isLandingPage && user;

 

  useEffect(() => {
    const accepted = localStorage.getItem("cookiesAccepted") === "true";
    const declined = localStorage.getItem("cookiesDeclined") === "true";

    if (!accepted && !declined) {
      const timer = setTimeout(() => {
        setShowCookieBanner(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);


useEffect(() => {
  dispatch(fetchUserCountry());
}, [dispatch]);
  const handleAcceptCookies = (preferences) => {
    localStorage.setItem("cookiesAccepted", "true");
    localStorage.removeItem("cookiesDeclined");
    if (preferences) {
      localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    }

    setShowCookieBanner(false);
  };
  const handleDeclineCookies = () => {
    localStorage.setItem("cookiesDeclined", "true");
    localStorage.removeItem("cookiesAccepted");
    localStorage.removeItem("cookiePreferences");

    setShowCookieBanner(false);
  };

  return (
    <>
      <ScrollToTop />
      {showCookieBanner && (
        <Suspense fallback={null}>
          <ModernCookieBanner
            onAccept={handleAcceptCookies}
            onDecline={handleDeclineCookies}
            onClose={() => setShowCookieBanner(false)}
          />
        </Suspense>
      )}

      {/*{user && user.userType === "admin" ? <AdminHeader /> : <Header />} */}
      <Suspense fallback={<div className="h-16" />}>
        {shouldShowLayout &&
          (user.userType === "admin" ? <AdminHeader /> : <Header />)}
      </Suspense>
      <Suspense fallback={<div className="flex h-[30vh] items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-800 border-t-rose-500"></div></div>}>
            <Routes>
        <Route
          path="/pricing"
          element={
            <>
              <SEO {...seoData.pricing} />
              <PricingOptions />
            </>
          }
        />
        <Route
          path="/"
          element={
            <>
              {user &&
              user?.subscription?.status?.toLowerCase()?.trim() === "active" ? (
                <>
                  <SEO {...seoData.home} />
                  <Home />
                </>
              ) : (
                <>
                  <SEO {...seoData.landing} />
                  <LandingPage />
                </>
              )}
            </>
          }
        />
        <Route
          path="/whitepaper"
          element={
            <>
              <SEO {...seoData.whitepaper} />
              <WhitePaper />
            </>
          }
        />
        <Route
          path="/contact-us"
          element={
            <>
              <SEO {...seoData.contact} />
              <ContactUs />
            </>
          }
        />
        <Route
          path="/Billboard"
          element={
            <>
              <SEO {...seoData.billboard} />
              <BillboardPage />
            </>
          }
        />
        <Route
          path="/fleetowner-subscription"
          element={
            <>
              <SEO {...seoData.fleetOwnerSub} />
              <FleetOwnerSubscription />
            </>
          }
        />
        <Route
          path="/wrapper-subscription"
          element={
            <>
              <SEO {...seoData.wrapperSub} />
              <WrapperSubscription />
            </>
          }
        />
        <Route
          path="/affiliate"
          element={
            <>
              <SEO {...seoData.affiliate} />
              <AffiliatePage />
            </>
          }
        />
        <Route
          path="/VehicleOwner"
          element={
            <>
              <SEO {...seoData.fleetOwner} />
              <FleetOwnerLandingPage />
            </>
          }
        />
        <Route
          path="/BuyerMarketingExecutive"
          element={
            <>
              <SEO {...seoData.buyerMarketing} />
              <BuyerMarketingExecutiveLandingPage />
            </>
          }
        />
        <Route
          path="/AncillaryAdvertisers"
          element={
            <>
              <SEO {...seoData.ancillary} />
              <AncillaryAdvertisersLandingPage />
            </>
          }
        />
        <Route
          path="/WrapperLandingPage"
          element={
            <>
              <SEO {...seoData.wrapperLanding} />
              <WrapperLandingPage />
            </>
          }
        />
        <Route
          path="/pricing-info"
          element={
            <>
              <SEO {...seoData.pricingInfo} />
              <PricingMethodology />
            </>
          }
        />
       
        <Route
          path="/search-results"
          element={
            <>
              <SEO {...seoData.searchResults} />
              <SearchResults />
            </>
          }
        />
        <Route
          path="/franchise"
          element={
            <>
              <SEO {...seoData.franchise} />
              <FranchiseLandingPage />
            </>
          }
        />
        <Route
          path="/countries-franchise"
          element={
            <>
              <SEO {...seoData.countriesFranchise} />
              <CountryFranchisePage />
            </>
          }
        />
        <Route
          path="/viral-engine"
          element={
            <>
              <SEO {...seoData.viralEngine} />
              <ViralEngine />
            </>
          }
        />
        <Route
          path="/how-it-works"
          element={
            <>
              <SEO {...seoData.howItWorks} />
              <HowItWorks />
            </>
          }
        />
        <Route
          path="/missionstatement"
          element={
            <>
              <SEO {...seoData.vision} />
              <Vision />
            </>
          }
        />
        <Route
          path="/faq"
          element={
            <>
              <SEO {...seoData.faq} />
              <FAQ />
            </>
          }
        />
        <Route
          path="/savings"
          element={
            <>
              <SEO {...seoData.savings} />
              <SavingsOpportunities />
            </>
          }
        />
        <Route
          path="/advertise"
          element={
            <>
              <SEO {...seoData.advertise} />
              <AdvertiseWithUs />
            </>
          }
        />
        <Route
          path="/liveauction"
          element={
            <>
              <SEO {...seoData.liveAuctions} />
              <LiveAuctions />
            </>
          }
        />
        <Route
          path="/our-products"
          element={
            <>
              <SEO {...seoData.ourProducts} />
              <OurProducts />
            </>
          }
        />
        <Route
          path="/about-us"
          element={
            <>
              <SEO {...seoData.about} />
              <AboutUs />
            </>
          }
        />
        <Route
          path="/subscriberonly"
          element={
            <>
              <SEO {...seoData.subscriberonly} />
              <SubscriptionPage />
            </>
          }
        />
        <Route
          path="/businessmodel"
          element={
            <>
              <SEO {...seoData.businessModel} />
              <BusinessModel />
            </>
          }
        />
        <Route
          path="/franchise-faq"
          element={
            <>
              <SEO {...seoData.franchiseFaq} />
              <FranchiseFaq />
            </>
          }
        />
        <Route
          path="/firstmover"
          element={
            <>
              <SEO {...seoData.firstmover} />
              <SuccessStory />
            </>
          }
        />
        <Route path="/franchise-card/:id" element={<FranchiseCardPage />} />
        <Route
          path="/privacy-policy"
          element={
            <>
              <SEO {...seoData.privacy} />
              <PrivacyPolicy />
            </>
          }
        />

        <Route
          path="/terms-conditions"
          element={
            <>
              <SEO {...seoData.terms} />
              <TermsPage />
            </>
          }
        />
        <Route
          path="/Cpm"
          element={
            <>
              <SEO {...seoData.cpm} />
              <CPM />
            </>
          }
        />
        <Route
          path="/blog"
          element={
            <>
              <SEO {...seoData.blog} />
              <IndustryNews />
            </>
          }
        />
        <Route
          path="/dashboard"
          element={
            <>
              <SEO {...seoData.dashboard} />
              <Dashboard />
            </>
          }
        />
        <Route path="/ProductDetails/:id" element={<ProductDetails />} />
        <Route path="/MyOrder" element={<MyOrder />} />
        <Route
          path="/Statistics"
          element={
            <>
              <SEO {...seoData.statistics} />
              <Statistics />
            </>
          }
        />

        <Route
          path="/cookie-policy"
          element={
            <>
              <SEO {...seoData.cookiePolicy} />
              <CookiePolicy />
            </>
          }
        />
        <Route path="/product-payment" element={<Productpayment />} />
        <Route
          path="/Careers"
          element={
            <>
              <SEO {...seoData.careers} />
              <Careers />
            </>
          }
        />
        <Route path="/choose-payment" element={<ChoosePaymentMethod />} />
        <Route path="/order-success/:productId" element={<OrderSuccess />} />
        <Route path="/campaign-details/:id" element={ <>
     
      <CampaignDetailsPage />
    </>} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route
          path="/BuyerMarketSubsriptionPaymentSuccess"
          element={
           <>
      <SEO {...seoData.paymentSuccess} />

      {new URLSearchParams(window.location.search).has("session_id") ? (
        <SubsriptionPaymentSuccess />
      ) : (
        <Navigate to="/Billboard" replace />
      )}
    </>
          }
        />
        <Route
          path="/subscriptionpaymentsuccess"
          element={
            <>
      <SEO {...seoData.paymentSuccess} />

      {new URLSearchParams(window.location.search).has("session_id") ? (
        <SubsriptionPaymentSuccess />
      ) : (
        <Navigate to="/Billboard" replace />
      )}
    </>
          }

        />
        <Route
          path="/subscription-cancel"
          element={<SubscriptionPaymentCancel />}
        />
        <Route path="/gif-details/:gifId" element={ <>
      
      <GifDetails />
    </>} />
        <Route path="/fleet-dashboard" element={<FleetCampaignsResults />} />
        <Route path="/reauth" element={<ReauthPage />} />
        <Route
          path="/campaigns-search-results"
          element={ <>
      <SEO {...seoData.searchResults} />
      <CampaignSearchResults />
    </>}
        />
        {/*  <Route path="/cart" element={<ProductCart />}/> */}
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route
          path="/single-auction-detail/:id"
          element={<SingleAuctionDetail />}
        />
        <Route
          path="/single-fleet-auction-detail/:id"
          element={<FleetAuctionDetails />}
        />
        <Route path="/recommendations/:id" element={<RecommendationsPage />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />
        <Route path="*" element={<ErrorPage />} />

        <Route element={<PublicRoute />}>
          <Route
            path="/reset-password/:userId/:token"
            element={<ResetNewPassword />}
          />
          <Route path="/NewPassword/:userId" element={<NewPassword />} />
          <Route
            path="/ForgatePassword/:userId/:token"
            element={<ResetNewPassword />}
          />
          <Route
            path="/forgot-password"
            element={
              <>
                <SEO {...seoData.forgotPassword} />
                <ForgotPassword />
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <SEO {...seoData.login} />
                <Login />
              </>
            }
          />
          <Route
            path="/register"
            element={
              <>
                <SEO {...seoData.register} />
                <Register />
              </>
            }
          />
        </Route>

        <Route element={<Protected />}>
          <Route path="/user-profile/*" element={<UserProfile />} />
          <Route path="/edit-auction/:id" element={<EditAuction />} />
          <Route
            path="/edit-fleet-auction/:id"
            element={<EditFleetAuction />}
          />
          <Route path="/success/:id" element={<PaymentSuccess />} />
          <Route element={<SellerRoutes />}>
            {/* <Route path="/user-profile/manage-items" element={<ManageItems />} /> */}
          </Route>
        </Route>
        {/* <Route element={<AdminRoutes />}> */}
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* </Route> */}
      </Routes>
            </Suspense>
      <Suspense fallback={<div className="h-16" />}>
        {shouldShowLayout &&
          (user.userType === "admin" ? (
            <AdminFooter />
          ) : (
            <Footer setIsChatOpen={setIsChatOpen} />
          ))}
      </Suspense>

      {user && (
        <Suspense fallback={null}>
          <ChatWidget isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
        </Suspense>
      )}

      <ToastContainer />
    </>
  );
};
const App = () => {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </HelmetProvider>
  );
};
export default App;

// import React, { useEffect, useRef, memo } from 'react';
// function TradingViewWidget() {
//   const container = useRef();
//   useEffect(
//     () => {
//       const script = document.createElement("script");
//       script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
//       script.type = "text/javascript";
//       script.async = true;
//       script.innerHTML = `
//         {
//           "autosize": true,
//           "symbol": "NASDAQ:AAPL",
//           "timezone": "Etc/UTC",
//           "theme": "light",
//           "style": "1",
//           "locale": "en",
//           "withdateranges": true,
//           "range": "YTD",
//           "hide_side_toolbar": false,
//           "allow_symbol_change": true,
//           "details": true,
//           "hotlist": true,
//           "support_host": "https://www.tradingview.com"
//         }`;
//       container.current.appendChild(script);
//     },
//     []
//   );
//   return (
//     <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
//       <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
//       <div className="tradingview-widget-copyright"><a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span className="blue-text">Track all markets on TradingView</span></a></div>
//     </div>
//   );
// }
// export default memo(TradingViewWidget);
