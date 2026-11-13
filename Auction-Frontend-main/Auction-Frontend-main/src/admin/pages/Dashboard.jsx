import { Link, Route, Routes } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ProfileComponent from "../components/ProfileComponent";
import AllUsers from "../components/AllUsers";
import EditUser from "../components/EditUser";
import AllAuctions from "../components/AllAuctions";
import EditAuction from "../components/EditAuction";
// import ChangePassword from "./auth/ChangePassword";
// import ProfileComponent from "../components/ProfileComponent";
// import ManageItems from "../components/ManageItems";
// import BidsItem from "../components/BidsItem";
// import Notifications from "../components/Notifications";
// import AccountSetting from "../components/AccountSetting";
// import {SellerRoutes} from '../auth/Protected'
// import PaymentMethod from "../components/PaymentMethod";
// import Cart from "../components/Cart";
import ErrorPage from "./ErrorPage";
import AllCategories from "../components/AllCategories";
import ALLCity from "../components/AllCity";
import EditCategory from "../components/EditCategory";
import CreateCategory from "../components/CreateCategory";
import CreateCity from "../components/CreateCity";
import SingleAuctionDetail from "../../pages/SingleAuctionDetail";
import ProductPage from "../components/ProductPage";
import AddProduct from "../components/AddProduct";
import OrderPage from "../components/OrderPage";
import CommissionAdmin from "../components/CommissionAdmin.";
import AddExecutiveMember from "../components/AddExecutiveMember";
import UpdateContactInfo from "../components/updateaddress";
import PrivacyPolicy from "../components/PrivacyPolicy";
import TermsPage from "../components/TermsPage";
import CookiePage from "../components/Cookie";
import AuctionWinner from "../components/AuctionWinner";
import Vehicle from "../components/VehicleList";
import AdminCTRTable from "../components/AdminCTRTable";
import Notifications from "../../components/Notifications";
import AdminBudgetRequests from "../components/AdminBudgetRequest";
import FleetAuctionApproval from "../components/FleetAuctionApproval";
import StatisticsPage from "../components/StatisticsPage";
import VehicleWrapForm from "../../components/VehicleWrapSlider";
import SingleBudgetRequestPage from "../components/SingleBudgetRequestPage";
import TopFleetAuctions from "../components/TopFleetAuctions";
import UserListByType from "../components/UserListByType";
import CpmTable from "../components/CpmTable";
import AssignWrapperPage from "../components/AssignWrapperPage";
import SubscriptionPlans from "../components/SubscriptionPlans";
import AdminFranchise from "../components/AdminFranchise";
import BackupManager from "../components/BackupManager";
import AdminDeleteData from "../components/AdminDeleteData";
import AdminMediaKit from "../components/AdminMediaKit";
import BlogManagement from "../components/BlogManagement";
import EmailSettings from "./EmailSettings";
const Dashboard = () => {
  return (
    <div className=" ">
      <div className="flex gap-4 px-5 py-5 flex-wrap lg:flex-nowrap">
        <Sidebar />

        <div className=" w-full overflow-hidden">
          <Routes>
            {/* <Route path="/dashboard" element={<ProfileComponent />}></Route> */}
            <Route path="/users/*" element={<AllUsers />} />
            <Route path="/users/profile/:id" element={<ProfileComponent />} />
            <Route path="/auction-winner" element={<AuctionWinner />} />
            <Route path="/users/edit/:id" element={<EditUser />} />
            <Route path="/auctions/*" element={<AllAuctions />} />
            <Route path="/auctions/edit/:id" element={<EditAuction />} />
            <Route
              path="/singlebudgetrequest/:id"
              element={<SingleBudgetRequestPage />}
            />
            <Route
              path="/auctions/view/:id"
              element={<SingleAuctionDetail noPadding />}
            />
            <Route path="/categories/*" element={<AllCategories />} />
            <Route path="/add-product/*" element={<ProductPage />} />
            <Route path="/add-product/add/*" element={<AddProduct />} />
            <Route path="/orders/*" element={<OrderPage />} />
            <Route path="/commission" element={<CommissionAdmin />} />
            <Route path="/executive-member" element={<AddExecutiveMember />} />
            <Route path="/update-address" element={<UpdateContactInfo />} />
            <Route path="/categories/edit/:id" element={<EditCategory />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookie" element={<CookiePage />} />
            <Route path="/CpmTable" element={<CpmTable />} />
            <Route path="/media-kit" element={<AdminMediaKit />} />
            <Route
              path="/assign-wrapper/:orderId"
              element={<AssignWrapperPage />}
            />
            <Route path="/vehicles" element={<Vehicle />} />
            <Route path="/adminctrtable" element={<AdminCTRTable />} />
            <Route path="/subscription-plans" element={<SubscriptionPlans />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/franchise" element={<AdminFranchise />} />
            <Route path="/backup" element={<BackupManager />} />
            <Route path="/blogs" element={<BlogManagement />} />
            <Route path="/dropcollections" element={<AdminDeleteData/>}/>
            <Route path="/email-settings" element={<EmailSettings />} />
            <Route
              path="/admin/users/sellers"
              element={<UserListByType type="seller" />}
            />
            <Route
              path="/users/buyers"
              element={<UserListByType type="buyer" />}
            />
            <Route
              path="/users/fleet-owners"
              element={<UserListByType type="fleetOwner" />}
            />
            <Route
              path="/users/advertisers"
              element={<UserListByType type="advertiser" />}
            />
            <Route
              path="/users/wrappers"
              element={<UserListByType type="wrapper" />}
            />
            <Route
              path="/users/verified"
              element={<UserListByType verified={true} />}
            />
            <Route
              path="/users/new"
              element={<UserListByType newUsers={true} />}
            />
            <Route
              path="/FleetAuctionApproval"
              element={<FleetAuctionApproval />}
            />

            <Route path="/TopFleetAuctions" element={<TopFleetAuctions />} />

            <Route path="/VehicleWrapForm" element={<VehicleWrapForm />} />
            <Route path="/Statistics" element={<StatisticsPage />} />
            <Route path="/budget-requests" element={<AdminBudgetRequests />} />
            <Route
              path="/categories/create-category"
              element={<CreateCategory />}
            />
            <Route path="/city/*" element={<ALLCity />} />
            <Route path="/city/edit/:id" element={<EditCategory />} />
            <Route path="/city/create-city" element={<CreateCity />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
