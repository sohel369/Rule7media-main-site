import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom"; // <-- ये import missing था
import Loading from "../components/Loading";

const FleetCampaignsResults = () => {
  const { id } = useParams();
  const { searchedCampaigns, searchLoading } = useSelector(
    (state) => state.fleetOwner,
  );

  if (searchLoading) {
    return <Loading />;
  }
  if (!searchedCampaigns || searchedCampaigns.length === 0) {
    return (
      <div className="text-center p-8 text-xl text-gray-600">
        No campaigns found matching your search.
      </div>
    );
  }

  return (
    <div className="container-xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8 text-center md:text-left">
        Available Advertising Campaigns
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {searchedCampaigns.map((campaign) => (
          <Link
            key={campaign._id}
            to={`/single-fleet-auction-detail/${campaign._id}`}
            className="block transform hover:scale-105 transition duration-300 no-underline text-inherit"
          >
            <div className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl">
              {campaign.images && campaign.images.length > 0 ? (
                <img
                  src={campaign.images[0].url}
                  alt={campaign.company || "Campaign"}
                  className="w-full h-64 object-cover"
                  onError={(e) => (e.target.src = "/fallback-image.jpg")}
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {campaign.townOrCity}, {campaign.state}
                </h3>
                <p className="text-gray-600 mt-2">
                  Vehicle: {campaign.vehicleType || "N/A"}
                </p>
                <p className="text-gray-600">
                  Company: {campaign.company || "N/A"}
                </p>

                {/* <div className="mt-4">
                  <p className="text-lg font-semibold text-red-700">
                    CPM Rates: Full Wrap £{campaign.vehicleWrapCpms?.fullWrap || "N/A"}
                  </p>
                  {campaign.vehicleWrapCpms?.sideWrap && (
                    <p className="text-sm text-gray-500">
                      Side Wrap: £{campaign.vehicleWrapCpms.sideWrap}
                    </p>
                  )}
                </div> */}

                <button className="mt-6 w-full bg-red-700 text-white py-3 rounded-lg hover:bg-red-800 transition font-semibold">
                  View Details & Bid
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FleetCampaignsResults;
