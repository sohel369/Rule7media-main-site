import { useEffect } from "react";
import { FaUserPlus } from "react-icons/fa6";
import { FaRegEdit, FaArrowLeft } from "react-icons/fa";

import { AiFillLike } from "react-icons/ai";
import { BsCurrencyExchange } from "react-icons/bs";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUserById, reset, getAllUsers } from "../../store/user/userSlice";

const ProfileComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { singleUser, allUser } = useSelector((state) => state.user);
  useEffect(() => {
    dispatch(getUserById(id));
    dispatch(getAllUsers());
  }, [dispatch, id]);
  useEffect(() => {}, [singleUser]);
  const userTypeLabels = {
    seller: "Ancillary Advertiser",
    fleetOwner: "Vehicle Owner or Fleet Manager",
    wrapper: "Vehicle Wrapping Business",
    advertiser: "Buyer or Marketing Executive",
  };

  // Helper function to get readable label
  const getUserTypeLabel = (type) => {
    return (
      userTypeLabels[type] ||
      (type ? type.charAt(0).toUpperCase() + type.slice(1) : "-")
    );
  };
  return (
    <>
      <div className="flex flex-col gap-4 w-full">
        <div className="flex min-h-[400px] flex-wrap gap-4 lg:flex-nowrap">
          <div className="px-7 py-4 w-full bg-theme-bg text-white rounded-2xl">
            <div className="font-bold flex items-center gap-3 border-b border-border-info-color pb-3 mb-5">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-theme-bg2 transition-all"
                title="Go Back"
              >
                <FaArrowLeft size={18} />
              </button>

              <h2 className="text-xl">Personal Info</h2>
            </div>
            <ul className="flex flex-col gap-3 font-medium text-body-text-color">
              <li>
                Name:{" "}
                <span className="float-right font-normal">
                  {singleUser?.firstName ? singleUser?.firstName : "-"}
                </span>
              </li>
              {/* <li>
                Username:{" "}
                <span className="float-right font-normal">@bratten65</span>
              </li> */}
              <li>
                Email:{" "}
                <span className="float-right font-normal">
                  {singleUser?.email ? singleUser.email : "-"}
                </span>
              </li>
              <li>
                Phone:{" "}
                <span className="float-right font-normal">
                  {singleUser?.telephoneNumber
                    ? singleUser.telephoneNumber
                    : "-"}
                </span>
              </li>
              <li>
                Company:{" "}
                <span className="float-right font-normal">
                  {singleUser?.company ? singleUser.company : "-"}
                </span>
              </li>
              <li>
                Website:{" "}
                <span className="float-right font-normal">
                  {singleUser?.website ? singleUser.website : "-"}
                </span>
              </li>
              <li>
                position:{" "}
                <span className="float-right font-normal">
                  {singleUser?.position ? singleUser.position : "-"}
                </span>
              </li>

              <li>
                Location:{" "}
                <span className="float-right font-normal">
                  {singleUser?.location?.name ?? "-"}
                </span>
              </li>
              <li>
                Street 1:{" "}
                <span className="float-right font-normal">
                  {singleUser?.street1 ?? "-"}
                </span>
              </li>
              <li>
                Street 2:{" "}
                <span className="float-right font-normal">
                  {singleUser?.street2 ?? "-"}
                </span>
              </li>
              <li>
                Suburb:{" "}
                <span className="float-right font-normal">
                  {singleUser?.suburb ?? "-"}
                </span>
              </li>
              <li>
                State:{" "}
                <span className="float-right font-normal">
                  {singleUser?.state || "-"}
                </span>
              </li>
              <li>
                Country:{" "}
                <span className="float-right font-normal">
                  {singleUser?.country || "-"}
                </span>
              </li>
              {/* <li>
                User Type:{" "}
                <span className="float-right font-normal">
                  {singleUser?.userType ? singleUser?.userType : "-"}
                </span>
              </li> */}
              <li>
                User Type:{" "}
                <span className="float-right font-normal">
                  {getUserTypeLabel(singleUser?.userType)}
                </span>
              </li>
              <li>
                Join Date:{" "}
                <span className="float-right font-normal">
                  {singleUser?.createdAt
                    ? new Date(singleUser.createdAt).toLocaleDateString()
                    : "--"}
                </span>
              </li>
            </ul>
          </div>
          <div className="px-7 py-4 w-full bg-theme-bg text-white rounded-2xl">
            <div className="font-bold flex justify-between items-center border-b border-border-info-color pb-3 mb-5 ">
              <h2 className="text-xl ">Your Bio</h2>
              {/* {singleUser?.userType !== "admin" && (
                <Link
                  to="/user-profile/account-settings"
                  className=" flex items-center gap-1 px-4 py-2 bg-theme-color hover:bg-color-danger rounded-xl"
                >
                  <FaRegEdit size={16} /> <span>Edit</span>
                </Link>
              )} */}
            </div>
            <p className="text-body-text-color">
              {singleUser?.description
                ? singleUser.description
                : "No bio available"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileComponent;
