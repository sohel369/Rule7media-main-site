import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaArrowRightLong } from "react-icons/fa6";
const CreateEarnHome = () => {
  const navigate = useNavigate();

  const logInUser = JSON.parse(localStorage.getItem("user"));
  const onGetStartedClick = () => {
    if (!logInUser) {
      navigate("/register");
      return;
    }

    const role = logInUser.userType?.toLowerCase();

    if (role === "advertiser") {
      navigate("/user-profile/create-campaign");
    } else if (role === "fleetowner") {
      navigate("/user-profile/add-auction");
    } else if (role === "seller") {
      navigate("/user-profile/create-auction");
    } else if (role === "wrapper") {
      navigate("/user-profile/profile");
    } else {
      // fallback
      navigate("/user-profile/profile");
    }
  };

  return (
    <div className="relative flex flex-col gap-4 mb-10 px-5 py-20 mt-0 justify-center bg-red rounded-[20px] bg-hero-img  bg-cover bg-center bg-fixed w-full h-[400px] ">
      <div className="absolute inset-0 bg-black bg-opacity-40 z-0;"></div>
      <div className="container mx-auto lg:px-4">
        <div className="relative z-0">
          <h2 className="mb-2 font-mediumclass= text-3xl md:text-4xl font-bold text-white leading-tight mt-2">
            Create, Sell & Earn at{" "}
            <span className="uppercase text-[#c21300]">B</span>id
            <span className="uppercase text-[#c21300]">F</span>air
          </h2>
          <span className="text-white">
            Start Selling your Amazing Products now!
          </span>
        </div>
        <button
          onClick={onGetStartedClick}
          className="group hover:scale-105 bg-red-700 px-5 py-3 rounded-md 
             text-white cursor-pointer font-bold text-lg tracking-wide 
             hover:bg-white hover:text-red-700 w-fit z-20 relative inline-block mt-5"
        >
          <div className="flex items-center gap-2">
            <span className="group-hover:hover:text-red-700">Get Started</span>
            <FaArrowRightLong className="group-hover:text-red-700" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default CreateEarnHome;
