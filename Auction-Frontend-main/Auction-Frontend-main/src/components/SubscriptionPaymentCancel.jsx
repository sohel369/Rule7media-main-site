import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaReply } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserCountry } from "../store/countary/countrySlice";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Content for Advertiser/Buyer
const advertiserBuyerContent = [
  `Major global brands such as Nike, Hello Fresh, Tiffany, Wingstop, and Verizon, actually doubled their spend on outdoor in the year-on-year, as a testimony to its effectiveness.`,
  `Employing a modular design in your campaign facilitates the seamless integration of special offers without disrupting core elements allowing for consistent social media updates rather than relying exclusively on paid advertising.`,
  `Avoid becoming indistinguishable in a crowded market or continually adjusting campaigns in response to evolving algorithms that may reduce your reach and impressions. Vehicle wrap advertising enables brands to deliver impactful, creative, and visually appealing campaigns with cost efficiency and extensive visibility.`,
];

// Content for Seller/Fleetowner
const sellerFleetownerContent = [
  {
    title: "Enhanced Fleet Resale Value",
    description:
      "Vinyl wraps provide protection to vehicle paintwork from chips and scratches. Upon removal of these wraps, vehicles can be restored to an almost new condition, significantly improving their resale value.",
  },
  {
    title: "Theft Deterrence",
    description:
      "Vehicles with visible markings are substantially less likely to be stolen, as such assets are more easily traceable and therefore typically avoided by thieves.",
  },
  {
    title: "Employee Satisfaction",
    description:
      "Operators of branded vehicles frequently report elevated levels of job satisfaction, which contributes to a reduction in employee turnover rates.",
  },
  {
    title: "Reduced Insurance Costs",
    description:
      "Vehicles wrapped in bright, noticeable colors are more visible to other road users, resulting in fewer collisions and, consequently, a reduction in insurance claims.",
  },
  {
    title: "Optimized Fleet Renewal and Efficiency",
    description:
      "The additional advertising revenue generated enables fleet owners to replace vehicles more frequently. This practice leads to the adoption of vehicles that are more fuel-efficient and environmentally sustainable.",
  },
];

// Content for Wrapper
const wrapperContent = [
  {
    title:
      "LIST YOUR BUSINESS WITH THE MOST TARGETED GLOBAL DATABASE FOR YOUR INDUSTRY.",
    description: [
      "STREAMLINED SALES AND COMMUNICATION: Many global platforms offer built-in tools for managing communications and sales processes.",
      "• CENTRALIZED INQUIRIES: All leads, and client interactions are tracked in a single location.",
      "• AUTOMATED FOLLOW-UPS: Scheduling and reminders help ensure timely client responses.",
      "• QUOTING TOOLS: Integrated calculators and templates speed up the quote process.",
    ],
  },
  {
    title: "INSIGHTS AND ANALYTICS",
    description: [
      "Access to meaningful data helps businesses make informed decisions.",
      "• MARKET TRENDS: Identify which types of wrap projects are most in demand.",
      "• PERFORMANCE TRACKING: Monitor lead volume, conversion rates, and customer satisfaction.",
      "• COMPETITIVE ANALYSIS: Compare your business with others locally and worldwide.",
    ],
  },
  {
    title: "REDUCED MARKETING EXPENSES",
    description: [
      "Global platforms streamline the acquisition of new customers.",
      "• LOWER COSTS: Qualified leads from the platform reduce the need for expensive outreach.",
      "• BOOSTED DIGITAL PRESENCE: Leverage the platform’s SEO and online authority for greater visibility.",
      "• TARGETED PROMOTIONS: Paid ads or featured listings help reach high-value prospects.",
    ],
  },
  {
    title: "COLLABORATION AND PARTNERSHIPS",
    description: [
      "Platforms foster connections beyond just clients.",
      "• COLLABORATE WITH PROFESSIONALS: Team up with designers and installers for comprehensive services.",
      "• JOINT MARKETING: Take part in campaigns and promotions run by the platform.",
      "• PEER LEARNING: Share experiences and best practices with other providers.",
    ],
  },
  {
    title: "OPERATIONAL EFFICIENCIES",
    description: [
      "Digital tools integrated into the platform help automate business processes.",
      "• ONLINE SCHEDULING: Simplifies management and reduces administrative work.",
      "• EASY PAYMENTS: Secure online payment systems facilitate smooth transactions.",
    ],
  },
  {
    title: "ENHANCED CREDIBILITY AND VISIBILITY",
    description: [
      "Affiliation with a global platform greatly boosts a business’s reputation.",
      "• TRUSTWORTHINESS: Being listed signals high standards and professionalism.",
      "• BRAND AWARENESS: Platform exposure builds recognition among industry stakeholders and decision-makers.",
      "• REPUTATION MANAGEMENT: Client reviews and testimonials help foster a strong, positive reputation.",
    ],
  },
];

// CPM Data for Advertiser/Buyer
const cpmData = [
  {
    industry: "Real Estate",
    google: "$2.00 - $15.00",
    wrap: "$1.25",
    saving: "92%",
  },
  { industry: "Legal", google: "$6.00 - $15.00", wrap: "$1.25", saving: "92%" },
  {
    industry: "Finance/Insurance",
    google: "$5.00 - $12.00",
    wrap: "$1.25",
    saving: "90%",
  },
  { industry: "B2B", google: "$4.00 - $9.00", wrap: "$1.25", saving: "86%" },
  {
    industry: "Education",
    google: "$1.00 - $8.00",
    wrap: "$1.25",
    saving: "84%",
  },
  {
    industry: "Technology",
    google: "$3.00 - $8.00",
    wrap: "$1.25",
    saving: "84%",
  },
  {
    industry: "Healthcare",
    google: "$2.50 - $6.50",
    wrap: "$1.25",
    saving: "81%",
  },
  { industry: "Travel", google: "$1.50 - $4.00", wrap: "$1.25", saving: "69%" },
  {
    industry: "Retail/ECommerce",
    google: "$0.50 - $2.00",
    wrap: "$1.25",
    saving: "38%",
  },
];

const AbandonedCartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { country, currency } = useSelector((state) => state.country);
  const { user } = useSelector((state) => state.auth);
  const userType = user?.userType;

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  const handleHomeClick = () => {
    navigate("/user-profile/profile");
  };

  const handleCheckoutClick = () => {
    if (userType === "fleetOwner" || userType === "seller") {
      navigate("/pricing");
    } else if (userType === "advertiser" || userType === "buyer") {
      navigate("/pricing");
    } else if (userType === "wrapper") {
      navigate("/pricing");
    } else {
      navigate("/pricing");
    }
  };

  const getContent = () => {
    switch (userType) {
      case "advertiser":
      case "buyer":
        return {
          sliderContent: advertiserBuyerContent,
          showTable: true,
          title: "Google Advertising vs. Vehicle Wrap CPM",
        };
      case "seller":
      case "fleetOwner":
        return {
          sliderContent: sellerFleetownerContent,
          showTable: false,
        };
      case "wrapper":
        return {
          sliderContent: wrapperContent,
          showTable: false,
          title:
            "List Your Business with the Most Targeted Global Database for Your Industry",
        };
      default:
        return {
          sliderContent: [],
          showTable: false,
          title: "Abandoned Cart",
        };
    }
  };

  const { sliderContent, showTable, title } = getContent();

  const formattedCpmData = cpmData.map((item) => ({
    ...item,
    google: `${currency} ${item.google.split(" - ")[0].slice(1)} - ${currency} ${item.google.split(" - ")[1].slice(1)}`,
    wrap: `${currency} ${item.wrap.slice(1)}`,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-start p-4 text-white">
      {/* Slider Section */}
      {/* Slider Section */}
      <div className="w-full max-w-4xl mb-8">
        {["advertiser", "buyer"].includes(userType) ? (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            loop={true}
            autoplay={{ delay: 8000, disableOnInteraction: false }}
            speed={1000}
            className="shadow-lg rounded-xl overflow-hidden"
          >
            {sliderContent.map((item, index) => (
              <SwiperSlide key={index}>
                <div className="bg-gray-800 p-6 rounded-xl text-center text-sm md:text-base leading-relaxed">
                  <p className="max-w-2xl mx-auto">{item}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          // FleetOwner/Seller or Wrapper → static content
          <div className="space-y-6">
            {sliderContent.map((item, index) => (
              <div
                key={index}
                className="bg-gray-800 p-6 rounded-xl text-center text-sm md:text-base leading-relaxed"
              >
                <h3 className="text-xl font-semibold text-purple-300 mb-4">
                  {item.title}
                </h3>
                <p className="max-w-2xl mx-auto">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CPM Comparison Table (Advertiser/Buyer only) */}
      {showTable && (
        <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-purple-300 mb-6 text-center">
            {title}
          </h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-purple-700/50">
                <th className="px-4 py-2 font-semibold">Industry</th>
                <th className="px-4 py-2 font-semibold">
                  Google Advertising CPM
                </th>
                <th className="px-4 py-2 font-semibold">Vehicle Wrap CPM</th>
                <th className="px-4 py-2 font-semibold">Measurable Saving</th>
              </tr>
            </thead>
            <tbody>
              {formattedCpmData.map((item, index) => (
                <tr
                  key={index}
                  className={
                    index % 2 === 0 ? "bg-gray-700/30" : "bg-gray-800/30"
                  }
                >
                  <td className="px-4 py-2">{item.industry}</td>
                  <td className="px-4 py-2">{item.google}</td>
                  <td className="px-4 py-2 text-green-300">{item.wrap}</td>
                  <td className="px-4 py-2 text-yellow-300">{item.saving}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Title for Seller/Fleetowner or Wrapper */}
      {!showTable && sliderContent.length > 0 && (
        <h2 className="text-2xl font-bold text-purple-300 mb-6 text-center">
          {title}
        </h2>
      )}

      {/* Buttons */}
      <div className="mt-8 flex gap-4">
        {/* <button
          onClick={handleHomeClick}
          className="bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 flex items-center gap-2"
        >
          <FaHome size={18} /> Dashboard
        </button> */}
        <button
          onClick={handleCheckoutClick}
          className="bg-yellow-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-yellow-600 transition duration-300 flex items-center gap-2"
        >
          <FaReply size={18} /> Return to Checkout
        </button>
      </div>
    </div>
  );
};

export default AbandonedCartPage;
