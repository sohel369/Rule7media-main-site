import Truck from "../../assets/truck.png";
import Icons from "../../assets/icons.png";
import Truck2 from "../../assets/truck2.png";
import Arrow from "../../assets/arrow_1.png";
import Arrow2 from "../../assets/arrow_2.png";

const ProcessHome = () => {
  return (
    <>
      <section
        className="about-us md:py-10 lg:py-20"
        style={{ backgroundColor: "#bbbfc2", width: "100%" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-1/2 lg:w-1/2 px-5 pt-5">
              <div className="about-image relative pb-[56.25%] overflow-hidden rounded-lg">
                {" "}
                {/* 16:9 aspect ratio container */}
                <img
                  src={Truck}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  alt="About Us"
                />
              </div>
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 lg:w-1/2 pt-5">
              <div className="about-content">
                <h4 className="text-lg font-semibold text-[#c21300]">
                  About Us
                </h4>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mt-2">
                  Throughout history, most industries undergo significant
                  change. Market Participants who do not embrace change are left
                  on the sidelines, watching their competitors thrive.
                </h2>
                <p className="pt-5 text-gray-600 leading-relaxed">
                  There is no better example of this than the marketing and
                  advertising industry. Traditional media formats such as
                  newsprint, television, radio, and email marketing are
                  increasingly saturated markets. Similarly, social media
                  promotion contributes to the complexity, which often results
                  in consumers feeling bewildered and inundated with
                  information.
                </p>

                {/* List Section */}
                <ul className="pt-3 space-y-2">
                  <li>
                    <strong className="text-gray-900">
                      Diverse Inventory:
                    </strong>{" "}
                    A wide range of vehicle sizes and locations to accommodate
                    both large and small campaigns.
                  </li>
                  <li>
                    <strong className="text-gray-900">Live Auctions:</strong>{" "}
                    Aligning advertisers' budgets with fleet managers' profit
                    objectives.
                  </li>
                  <li>
                    <strong className="text-gray-900">Transparency:</strong>{" "}
                    Open availability of coverage, reach, and impressions data.
                  </li>
                  <li>
                    <strong className="text-gray-900">
                      User-Friendly Platform:
                    </strong>{" "}
                    Designed for ease of use by both advertisers and fleet
                    managers.
                  </li>
                  <li>
                    <strong className="text-gray-900">
                      Secure Transactions:
                    </strong>{" "}
                    Payments held in escrow until proof of campaign application
                    is provided, ensuring risk-free transactions.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="about section py-20 bg-white">
        {/* Section Title */}
        <div className="container mx-auto text-center" data-aos="fade-up">
          <h4 className="text-lg font-semibold text-[#c21300]">Start Now</h4>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mt-2">
            How it Works
          </h2>
        </div>

        {/* Steps Section */}
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}

            <div className="relative text-center">
              <span className="inline-block">
                <img src={Icons} className="mx-auto w-20 h-20" alt="Icon" />
              </span>
              <div className="mt-5">
                <h4 className="text-xl font-semibold text-gray-800">
                  <a href="" className="stretched-link">
                    Registration and Account
                  </a>
                </h4>
                <p className="text-gray-600 mt-2">
                  Registration is straightforward, free of charge, and
                  accessible to Fleet Managers, Single Vehicle Owners,
                  Advertisers, and Vehicle Wrapping Businesses. Our Privacy
                  Policy explicitly states that we will never sell your data to
                  any third parties.
                </p>
              </div>
              <img
                src={Arrow}
                className="hidden lg:block hidden absolute top-5 right-0 mx-auto w-20 h-10 lg:w-40 lg:h-20"
                alt="Arrow"
              />
            </div>

            {/* Step 2 */}
            <div className="text-center relative">
              <span className="inline-block">
                <img src={Icons} className="mx-auto w-20 h-20" alt="Icon" />
              </span>
              <div className="mt-5">
                <h4 className="text-xl font-semibold text-gray-800">
                  <a href="" className="stretched-link">
                    Browse and Select a Vehicle
                  </a>
                </h4>
                <p className="text-gray-600 mt-2">
                  Advertisers are able to browse and select vehicles based on
                  size and geographical location targets, and can place bids
                  through Auctions or Buy Now options. Fleet Managers or vehicle
                  owners have the ability to accept auction bids or set minimum
                  requirements for the Buy Now option, thereby converting their
                  fleet from a cost center into a profit center.
                </p>
              </div>
              <img
                src={Arrow2}
                className="hidden lg:block hidden absolute top-50 right-0 w-20 h-10 lg:w-40 lg:h-20 mx-auto"
                alt="Arrow2"
              />
            </div>

            {/* Step 3 */}
            <div className="text-center relative">
              <span className="inline-block">
                <img src={Icons} className="mx-auto w-20 h-20" alt="Icon" />
              </span>
              <div className="mt-5">
                <h4 className="text-xl font-semibold text-gray-800">
                  <a href="" className="stretched-link">
                    Place Bids and Monitor
                  </a>
                </h4>
                <p className="text-gray-600 mt-2">
                  Bids are placed om the basis of square metre of coverage,
                  offering options of 100% of the vehicle or only partial
                  coverage, facilitating more vehicles in concentrated areas for
                  highly targeted campaigns. Both advertisers and vehicle
                  operators can adjust bids in the auction process.
                </p>
              </div>
              <img
                src={Arrow}
                className="hidden lg:block hidden absolute top-5 right-0 mx-auto w-20 h-10 lg:w-40 lg:h-20"
                alt="Arrow"
              />
            </div>

            {/* Step 4 */}
            <div className="text-center relative">
              <span className="inline-block">
                <img src={Icons} className="mx-auto w-20 h-20" alt="Icon" />
              </span>
              <div className="mt-5">
                <h4 className="text-xl font-semibold text-gray-800">
                  <a href="" className="stretched-link">
                    Watch your campaign go viral
                  </a>
                </h4>
                <p className="text-gray-600 mt-2">
                  This is the sole form of marketing that enables your marketing
                  message to be disseminated extensively on social media,
                  without requiring a direct Social Media budget.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <section className="new_offer py-5 bg-[#f2f2f2]">
        <div className="container mx-auto px-4 sm:pt-3">
          <div className="flex flex-wrap items-center lg:px-4">
         
            <div className="w-full md:w-1/2 pt-5 sm:pt-3 lg:pr-10">
              <div className="section-title">
                <h4 className="text-lg font-semibold text-[#c21300] py-3">
               New Offer
                </h4>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mt-2">
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit
                </h2>
                <p className="pt-5 text-gray-600">
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt
                  nulla enim neque voluptas natus, necessitatibus in maiores
                  minima consectetur tempore cum voluptatem voluptate at porro,
                  odio error vitae animi ea.
                </p>

             
                <ul className="py-3 space-y-2">
                  <li>
                    <strong>Year:</strong> 2025
                  </li>
                  <li>
                    <strong>Mileage:</strong> 15,000 miles
                  </li>
                  <li>
                    <strong>Color:</strong> Midnight Black
                  </li>
                  <li>
                    <strong>Condition:</strong> Excellent
                  </li>
                  <li>
                    <strong>Engine:</strong> 3.0L V6 Twin Turbo
                  </li>
                  <li>
                    <strong>Transmission:</strong> Speed Automatic
                  </li>
                </ul>

                
                <a
                  href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-extrabold mt-6 text-lg inline-block px-8 py-[12px] rounded-md bg-red-700 transition duration-300 text-white border border-red-700 hover:bg-red-800"
                >
                  Watch Explanatory Video
                </a>
              </div>
            </div>

          
            <div className="w-full md:w-1/2 pt-5 sm:pt-3">
              <div className="about-image">
                <img src={Truck2} className="w-full h-9/10" alt="Truck" />
              </div>
            </div>
          </div>
        </div>
      </section> */}
      <section className="new_offer py-10 bg-[#f2f2f2]">
        <div className="container mx-auto px-4 sm:pt-3">
          <div className="flex flex-wrap items-center lg:px-4">
            {/* Left Content Section */}
            <div className="w-full md:w-1/2 pt-5 sm:pt-3 lg:pr-10">
              <div className="section-title">
                <h4 className="text-lg font-semibold text-[#c21300] py-3">
                  Additional Benefits
                </h4>

                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mt-2">
                  Advertisers Enjoy
                </h2>

                <ul className="pt-5 text-gray-700 space-y-2 list-disc list-inside">
                  <li>Positive Advertiser Experience</li>
                  <li>
                    Projected fastest-growing advertising medium in the near
                    future
                  </li>
                  <li>Decreased Marketing Expenses of 80% or more</li>
                  <li>High Visibility</li>
                  <li>Creative Freedom</li>
                  <li>Multiple repeat impressions</li>
                  <li>Highly targeted campaigns</li>
                  <li>Enhanced Awareness</li>
                  <li>Extended Audience Attention</li>
                  <li>Enhanced message recall</li>
                  <li>Reinforces Traditional Media campaigns</li>
                  <li>
                    Overcomes Declining consumer engagement with traditional
                    media
                  </li>
                  <li>Social Media Gold</li>
                  <li>Stand out from the Crowd</li>
                </ul>

                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mt-10">
                  Vehicle or Fleet Owners Enjoy
                </h2>

                <ul className="pt-5 text-gray-700 space-y-2 list-disc list-inside">
                  <li>
                    Fleets transformed from Cost Centres to Profit Centres
                  </li>
                  <li>Enhanced bottom line allows expansion or debt service</li>
                  <li>Enhanced Fleet Resale Value</li>
                  <li>Theft Deterrent</li>
                  <li>Reduced Insurance costs</li>
                  <li>Employee Pride</li>
                </ul>

                {/* Watch Video Button */}
                {/* <a
                  href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" // replace with your real video link
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold mt-8 inline-block px-8 py-3 rounded-md bg-red-700 text-white border border-red-700 hover:bg-red-800 transition duration-300"
                >
                  Watch Explanatory Video
                </a> */}
                <div className="relative inline-block">
                  <a
                    href={"/Statistics"}
                    rel="noopener noreferrer"
                    className={`font-bold mt-8 inline-block px-8 py-3 rounded-md border transition duration-300 bg-red-700 text-white border-red-700 hover:bg-red-800
                    `}
                  >
                    EXPLAINER VIDEO
                  </a>
                </div>
              </div>
            </div>

            {/* Right Image Section */}
            <div className="w-full md:w-1/2 pt-5 sm:pt-3">
              <div className="about-image">
                <img src={Truck2} className="w-full h-auto " alt="Truck" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProcessHome;
