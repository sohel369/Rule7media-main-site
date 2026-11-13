import { Link, useNavigate } from "react-router-dom";
import { FaArrowRightLong } from "react-icons/fa6";
import { RiFindReplaceLine } from "react-icons/ri";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { Pagination, Autoplay } from "swiper/modules";
import { useState, useEffect } from "react";
import herovector1 from "../../assets/heroimg1.jpg";
import herovector2 from "../../assets/heroimg2.jpg";
// import SearchLocationCategory from "../SearchLocationCategory";

const HeroHome = () => {
  const logInUser = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null);
  const [filter, setFilter] = useState({
    category: "",
    itemName: "",
    zip: "",
  });

  useEffect(() => {
    if (logInUser) {
      setUserType(logInUser.userType);
    }
  }, [logInUser]);

  const handleSearch = () => {
    navigate("/dashboard");
  };

  const handleRegisterInterest = () => {
    if (!logInUser) {
      // Not logged in → go to register page
      navigate("/register");
      return;
    }

    const role = logInUser.userType?.toLowerCase();

    if (role === "fleetowner") {
      navigate("/user-profile/add-auction");
    } else if (role === "seller") {
      navigate("/user-profile/create-auction");
    } else if (role === "wrapper") {
      navigate("/user-profile/add-ad_gif");
      if (fleetAuctionSection) {
        fleetAuctionSection.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/user-profile/profile");
        setTimeout(() => {
          const section = document.getElementById("livehome");
          section?.scrollIntoView({ behavior: "smooth" });
        }, 500);
      }
    } else if (role === "advertiser" || role === "buyer") {
      navigate("/user-profile/create-campaign");
    } else {
      // Default fallback
      navigate("/user-profile/profile");
    }
  };

  // Banner content based on user type
  const getBannerContent = () => {
    switch (userType) {
      case "advertiser":
        return {
          mainHeading: "Building Enduring Consumer Connections",
          subText:
            "This collaborative strategy creates a unified objective among brands, amplifying each advertiser's reach and positioning consumers as engaged participants in the marketing process. As individuals share branded images within their networks and revisit rewards platforms, a dynamic cycle of engagement develops, strengthening brand recognition.",
          ctaText: "Start Advertising",
        };
      case "fleet":
        return {
          mainHeading: "Transform Your Fleet into Profit Center",
          subText:
            "Fleet management is often associated with significant expense and time commitments, which can adversely affect an organisation's profitability. However, this initiative provides an opportunity to transform the direct and indirect costs of fleet management into a profit center.",
          ctaText: "Monetize Your Fleet",
        };
      case "wrapping":
        return {
          mainHeading: "Premium Wrapping Services",
          subText:
            "Join our network of certified wrapping professionals and get access to premium clients looking for high-quality vehicle wrapping services. Expand your business with our platform.",
          ctaText: "Join as Wrapping Shop",
        };
      default:
        return {
          mainHeading: "Connecting Advertisers with Fleet Managers",
          subText:
            "Presenting a unique but limited opportunity to capitalise on a paradigm shift in marketing strategy which shifts the balance of power back to the advertiser, while repositioning vehicle fleets from cost centres to revenue generating assets.",
          ctaText: "Register Your Interest",
        };
    }
  };

  const bannerContent = getBannerContent();

  return (
    <>
      <div className="relative w-full select-box-wrapper">
        {/* Swiper Carousel with Auto Slide */}
        <div className="relative w-full h-[100vh] md:h-[75vh] lg:h-[85vh]">
          <Swiper
            loop={true}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            modules={[Pagination, Autoplay]}
            className="w-full h-full"
          >
            <SwiperSlide>
              <img
                src={herovector1}
                alt="Hero 1"
                className="w-full h-full object-cover"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src={herovector2}
                alt="Hero 2"
                className="w-full h-full object-cover"
              />
            </SwiperSlide>
          </Swiper>

          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-20 z-5"></div>
        </div>

        {/* Top Content - Dynamic based on user type */}
        <div className="absolute top-0 left-0 w-full flex flex-col items-start justify-start text-white p-4 md:p-6 lg:p-8 z-10">
          <h1 className="text-2xl md:text-3xl lg:text-[40px] tracking-[2px] md:tracking-[5px] py-3 lg:py-5 text-white font-extrabold font-poppins drop-shadow-2xl max-w-[90%] md:max-w-[80%] lg:max-w-[70%]">
            {bannerContent.mainHeading}
          </h1>
          <div className="flex banner-text mt-2">
            <button
              onClick={handleRegisterInterest}
              className="inline-block px-5 py-3 md:px-7 md:py-4 text-white bg-[#C21300] border-2 border-[#C21300] text-base md:text-lg font-extrabold rounded-md transition-all duration-300 hover:bg-white hover:text-[#C21300]"
            >
              {bannerContent.ctaText}
            </button>
          </div>
        </div>

        {/* Bottom Right Content - Dynamic subtext */}
        <div className="absolute bottom-[40%] sm:bottom-[38%] md:bottom-[35%] lg:bottom-[30%] right-0 w-[85%] sm:w-[70%] md:w-[55%] lg:w-[45%] xl:w-[40%] flex flex-col items-end justify-end text-white p-4 md:p-6 lg:p-8 z-20">
          <h2 className="text-right absolute bottom-[35%] text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold drop-shadow-xl leading-relaxed [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
            {bannerContent.subText}
          </h2>
        </div>

        {/* Search Component at Bottom */}
      </div>
      {/* <div className="select-box-mein w-full px-5 md:px-4 left-0 w-full px-2 md:px-4 flex flex-col items-center justify-center z-10 md:py-10">
        <SearchLocationCategory updatedFilter={"empty"} />
      </div> */}
    </>
  );
};

export default HeroHome;

// import { Link, useNavigate } from "react-router-dom";
// import { FaArrowRightLong } from "react-icons/fa6";
// import { RiFindReplaceLine } from "react-icons/ri";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import "swiper/css/pagination";
// import "swiper/css/autoplay";
// import { Pagination, Autoplay } from "swiper/modules";
// import { useState } from "react";
// import herovector1 from "../../assets/heroimg1.jpg";
// import herovector2 from "../../assets/heroimg2.jpg";
// import SearchLocationCategory from "../SearchLocationCategory";

// const HeroHome = () => {
//   const logInUser = JSON.parse(localStorage.getItem("user"));
//   const navigate = useNavigate();
//   const [filter, setFilter] = useState({
//     category: "",
//     itemName: "",
//     zip: "",
//   });

//   const handleSearch = () => {
//     navigate("/dashboard");
//   };

//   const handleRegisterInterest = () => {
//     if (logInUser) {
//       // If user is logged in, navigate to products page
//       navigate("/our-products");
//     } else {
//       // If user is not logged in, navigate to signup page
//       navigate("/register");
//     }
//   };

//   return (
//     <div className="relative w-full min-h-[100vh] mb-36 sm:mb-32 md:mb-28 lg:mb-20 select-box-wrapper">
//       {/* Swiper Carousel with Auto Slide */}
//       <div className="relative w-full h-[70vh] md:h-[75vh] lg:h-[80vh]">
//         <Swiper
//           loop={true}
//           pagination={{ clickable: true }}
//           autoplay={{ delay: 5000, disableOnInteraction: false }}
//           modules={[Pagination, Autoplay]}
//           className="w-full h-full"
//         >
//           <SwiperSlide>
//             <img
//               src={herovector1}
//               alt="Hero 1"
//               className="w-full h-full object-cover"
//             />
//           </SwiperSlide>
//           <SwiperSlide>
//             <img
//               src={herovector2}
//               alt="Hero 2"
//               className="w-full h-full object-cover"
//             />
//           </SwiperSlide>
//         </Swiper>

//         {/* Overlay for better text readability */}
//         <div className="absolute inset-0 bg-black bg-opacity-20 z-5"></div>
//       </div>

//       {/* Top Content - Main Heading and CTA Button */}
//       <div className="absolute top-0 left-0 w-full flex flex-col items-start justify-start text-white p-4 md:p-6 lg:p-8 z-10">
//         <h1 className="text-2xl md:text-3xl lg:text-[40px] tracking-[2px] md:tracking-[5px] py-3 lg:py-5 text-white font-extrabold font-poppins drop-shadow-2xl max-w-[90%] md:max-w-[80%] lg:max-w-[70%]">
//           Connecting Advertisers with Fleet Managers
//         </h1>
//         <div className="flex banner-text mt-2">
//           <button
//             onClick={handleRegisterInterest}
//             className="inline-block px-5 py-3 md:px-7 md:py-4 text-white bg-[#C21300] border-2 border-[#C21300] text-base md:text-lg font-extrabold rounded-md transition-all duration-300 hover:bg-white hover:text-[#C21300]"
//           >
//             Register Your Interest
//           </button>
//         </div>
//       </div>

//       {/* Bottom Right Content - Marketing Tagline with improved positioning */}
//       <div className="absolute bottom-[40%] sm:bottom-[38%] md:bottom-[35%] lg:bottom-[30%] right-0 w-[85%] sm:w-[70%] md:w-[55%] lg:w-[45%] xl:w-[40%] flex flex-col items-end justify-end text-white p-4 md:p-6 lg:p-8 z-20">
//         {/* Background overlay for better text readability */}

//         <h2 className="text-right absolute bottom-[35%] text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold drop-shadow-xl leading-relaxed">
//           Presenting a unique but limited opportunity to capitalise on a paradigm shift in marketing strategy which shifts the balance of power back to the advertiser, while repositioning vehicle fleets from cost centres to revenue generating assets.
//         </h2>
//       </div>

//       {/* Search Component at Bottom - Positioned appropriately for mobile and desktop */}
//       <div className="select-box-mein absolute bottom-[2%] sm:bottom-[2%] md:bottom-[2%] lg:bottom-[2%] left-0 w-full px-2 md:px-4 flex flex-col items-center justify-center z-10">
//         <SearchLocationCategory updatedFilter={"empty"} />
//       </div>
//     </div>
//   );
// };

// export default HeroHome;
