import { Link, Route, Routes } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ChangePassword from "./auth/ChangePassword";
import ProfileComponent from "../components/ProfileComponent";
import ManageItems from "../components/ManageItems";
import BidsItem from "../components/BidsItem";
import Notifications from "../components/Notifications";
import AccountSetting from "../components/AccountSetting";
import { SellerRoutes } from "../auth/Protected";
import PaymentMethod from "../components/PaymentMethod";
import Cart from "../components/Cart";
import ErrorPage from "./ErrorPage";
import MyOrder from "../components/MyOrder";
import SellerOnboarding from "../components/SellerOnboarding";
import AddProductSeller from "../pages/AddProductSeller";
import ProductPageSeller from "../pages/ProductPageSeller";
import UploadItem from "../pages/UploadItem";
import SellersOrders from "../pages/SellersOrders";
import SellerBudgetRequests from "../components/BudgetRequest";
import FleetOwnerForm from "../components/fleetowner";
import FleetBudgetRequest from "../components/FleetBudgetRequest";
import VehicleWrapForm from "../components/VehicleWrapSlider";
import ManageFleetAuction from "../components/ManageFleetAuction";
import OrderDetails from "../components/OrderDetails";
import WrapperOrders from "../components/WrapperOrders";
import AddVehicleDimensions from "../components/AddVehicleDimensions";
import CancelSubscriptionPage from "../pages/CancelSubscriptionPage";
import EditProductSeller from "../components/EditProductSeller";
import CreateCampaign from "./AddCampaign";
import MyCampaigns from "./MyCampaigns";
import AddAdGif from "./AddAdGif";
import MyGifAdsStatistics from "./MyAdStatistics";
import ForgotPasswordUserLogin from "../pages/ForgotPasswordUserLogin";
import AdvancedSearchPage  from "./AdvancedSearchPage";
const UserProfile = () => {
  return (
    <div className="bg-black min-h-screen">
      <div className="profile0 flex flex-col lg:flex-row gap-4 px-3 sm:px-6 py-4 sm:py-8 max-w-[1600px] mx-auto">
        <Sidebar />
        <div className="flex-1 w-full overflow-hidden">
          <Routes>
          <Route path="/profile" element={<ProfileComponent />} />

          <Route element={<SellerRoutes />}>
            <Route path="/manage-items" element={<ManageItems />} />
          </Route>
          <Route path="/bids-items" element={<BidsItem />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/myorder" element={<MyOrder />} />
          <Route path="/wrapper-orders" element={<WrapperOrders />} />
          <Route path="/wrapper-order-details/:id" element={<OrderDetails />} />
   <Route path="/search" element={<AdvancedSearchPage />} />
          <Route path="/account-settings" element={<AccountSetting />} />
          <Route path="/SellerOnboarding" element={<SellerOnboarding />} />
          <Route path="/add-product/" element={<ProductPageSeller />} />
          <Route path="/add-product/add" element={<AddProductSeller />} />
          <Route path="/create-auction" element={<UploadItem />} />
          <Route path="/budget-request" element={<SellerBudgetRequests />} />
          <Route path="/create-campaign" element={<CreateCampaign />} />
          <Route path="/create-campaign/:id" element={<CreateCampaign />} />
          <Route path="/my-campaign" element={<MyCampaigns />} />
          <Route path="orders*" element={<SellersOrders />} />
          <Route
            path="/Cancel-Subscription"
            element={<CancelSubscriptionPage />}
          />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route
            path="forgot-password-userlogin"
            element={<ForgotPasswordUserLogin />}
          />
          <Route path="/payment-method" element={<PaymentMethod />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/add-auction" element={<FleetOwnerForm />} />
          <Route
            path="/add-vehicle-dimensions"
            element={<AddVehicleDimensions />}
          />

          <Route
            path="/fleet-budget-request"
            element={<FleetBudgetRequest />}
          />
          <Route path="/VehicleWrapForm" element={<VehicleWrapForm />} />
          <Route path="/edit-product/:id" element={<EditProductSeller />} />
          <Route path="/manage-fleetauction" element={<ManageFleetAuction />} />
          <Route path="/add-ad_gif" element={<AddAdGif />} />
          <Route path="/my-ad-statistics" element={<MyGifAdsStatistics />} />
          <Route path="/logout" element={<ChangePassword />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
