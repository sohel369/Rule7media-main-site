import { useState, useRef } from "react";
import CreateEarnHome from "../components/home/CreateEarnHome";
import HeroHome from "../components/home/HeroHome";
import LiveHome from "../components/home/LiveHome";
import ProcessHome from "../components/home/ProcessHome";
import UpcommingHome from "../components/home/UpcommingHome";
import EndingHome from "../components/home/EndingHome";
import FleetAuction from "../components/home/FleetAuction";
import Campaign from "../components/home/Campaign";
import Gifs from "../components/home/gif";
import { register } from "swiper/element/bundle";
import VehicleWrapForm from "../components/VehicleWrapSlider";
import WrappedVehiclesSlider from "../components/WrappedVehiclesSlider";

// register Swiper custom elements
register();

const Home = () => {
  const [selectedFilter, setSelectedFilter] = useState("Live");
  const liveRef = useRef(null);

  const scrollToLive = () => {
    setSelectedFilter("Live");
    setTimeout(() => {
      liveRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <>
      <HeroHome />
      <div className="px-5 lg:px-10 flex bg-white rounded-lg flex-col py-10 mt-5">
        <div className="flex justify-between items-center flex-col md:flex-row">
          <h2 className="custom-h2 section-title text-black leading-[58px] text-[#242424] font-extrabold font-poppins mb-0 relative text-[30px] sm:text-[35px] md:text-[45px] lg:text-[45px]">
            REVOLUTIONIZE YOUR BUSINESS
          </h2>
          <ul
            className="portfolio-filters isotope-filters aos-init aos-animate flex justify-end gap-2"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <li
              className={`cursor-pointer inline-block p-0 mx-2 my-1 text-[15px] lg:text-[18px] font-semibold transition-all ease-in-out duration-300 hover:text-red-500 ${
                selectedFilter === "Live"
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-[#999]"
              }`}
              onClick={() => setSelectedFilter("Live")}
            >
              Live Auctions
            </li>
            <li
              className={`cursor-pointer inline-block p-0 mx-2 my-1 text-[15px] lg:text-[18px] font-semibold transition-all ease-in-out duration-300 hover:text-red-500 ${
                selectedFilter === "upcoming"
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-[#999]"
              }`}
              onClick={() => setSelectedFilter("upcoming")}
            >
              Upcoming
            </li>
            <li
              className={`cursor-pointer inline-block p-0 mx-2 my-1 text-[15px] lg:text-[18px] font-semibold transition-all ease-in-out duration-300 hover:text-red-500 ${
                selectedFilter === "ending"
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-[#999]"
              }`}
              onClick={() => setSelectedFilter("ending")}
            >
              Ended
            </li>
          </ul>
        </div>

        {/* Main content area */}
        <div ref={liveRef}>
          {selectedFilter === "Live" && <LiveHome />}
          {selectedFilter === "upcoming" && <UpcommingHome />}
          {selectedFilter === "ending" && <EndingHome />}
        </div>

        {/* Static components */}
        <FleetAuction />
        <Campaign />
        {/* <Gifs/> */}
        <WrappedVehiclesSlider />
      </div>

      <ProcessHome />

      {/* <div className="text-white flex flex-col gap-8">
        <CreateEarnHome onGetStartedClick={scrollToLive} />
      </div> */}
      <div className="text-white flex flex-col gap-8">
        <CreateEarnHome />
      </div>
    </>
  );
};

export default Home;

// import { useState,useRef } from "react";
// import CreateEarnHome from "../components/home/CreateEarnHome";
// import HeroHome from "../components/home/HeroHome";
// import LiveHome from "../components/home/LiveHome";
// import ProcessHome from "../components/home/ProcessHome";
// import UpcommingHome from "../components/home/UpcommingHome";
// import FleetAuction from "../components/home/FleetAuction";
// import { register } from "swiper/element/bundle";
// import VehicleWrapForm from "../components/VehicleWrapSlider";
// import WrappedVehiclesSlider from '../components/WrappedVehiclesSlider'
// // register Swiper custom elements
// register();

// const Home = () => {
//   const [selectedFilter, setSelectedFilter] = useState('Live');
//  const liveRef = useRef(null);
//  const scrollToLive = () => {
//     setSelectedFilter("Live");
//     setTimeout(() => {
//       liveRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
//     }, 100); // wait for LiveHome to render if it's conditional
//   };
//   return (
//     <>
//       <HeroHome />
//       <div className="px-5 lg:px-10 flex bg-white flex-col py-10 mt-5">
//         <div className="flex justify-between items-center flex-col md:flex-row">
//           <h2 className="custom-h2 section-title  leading-[58px] text-[#242424] font-extrabold font-poppins mb-0 relative text-[30px] sm:text-[35px] md:text-[45px] lg:text-[45px]">
//           REVOLUTIONIZE YOUR BUSINESS
//           </h2>
//           <ul className="portfolio-filters isotope-filters aos-init aos-animate flex justify-end" data-aos="fade-up" data-aos-delay="100">
//             <li
//               data-filter=".filter-inside"
//               className={`cursor-pointer inline-block p-0 mx-2 my-1
//         leading-none text-[15px] lg:text-[18px] leading-[10px] font-semibold transition-all
//          ease-in-out duration-300 hover:text-black ${selectedFilter === 'Live' ? 'text-black' : 'text-[#999]'}`}
//               onClick={() => setSelectedFilter('Live')}
//             >
//               Live Auctions
//             </li>
//             <li
//               data-filter=".upcoming"
//               className={`cursor-pointer inline-block p-0 mx-2 my-1 leading-none text-[18px]
//         leading-[10px] font-semibold transition-all ease-in-out
//         duration-300 hover:text-black ${selectedFilter === 'upcoming' ? 'text-black' : 'text-[#999]'}`}
//               onClick={() => setSelectedFilter('upcoming')}
//             >
//               Upcoming
//             </li>
//             <li
//               data-filter=".filter-product"
//               className={`cursor-pointer inline-block p-0 mx-2 my-1 leading-none text-[18px]
//          leading-[10px]  font-semibold transition-all
//           ease-in-out duration-300 hover:text-black ${selectedFilter === 'end' ? 'text-black' : 'text-[#999]'}`}
//               onClick={() => setSelectedFilter('ending')}
//             >
//               Ending Soon
//             </li>
//           </ul>
//         </div>
//         <div ref={liveRef}>
//             {selectedFilter == "Live" &&
//           <LiveHome />
//         }
//         </div>

//           <FleetAuction />
//             <WrappedVehiclesSlider/>
//         {selectedFilter == "upcoming" &&
//           <UpcommingHome />
//         }

//          {selectedFilter == "end" &&
//           <UpcommingHome />
//         }
//         </div>

//         <ProcessHome />

//            <div className="text-white flex flex-col gap-8">
//         <CreateEarnHome onGetStartedClick={scrollToLive} />
//       </div>

//     </>
//   );
// };

// export default Home;
