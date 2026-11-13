import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getPublicGifs } from "../../store/gif/gifSlice";
import { trackImpression, trackClick } from "../../store/gif/gifSlice";
import { FaExternalLinkAlt } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";

const MyGifsSwiper = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { publicGifs, loading: listLoading } = useSelector(
    (state) => state.gif,
  );

  useEffect(() => {
    dispatch(getPublicGifs());
  }, [dispatch]);

  const handleShowDetails = (gifId) => {
    dispatch(trackImpression(gifId));
    dispatch(trackClick(gifId));
    navigate(`/gif-details/${gifId}`);
  };

  const handleGifClick = (gifId) => {
    dispatch(trackClick(gifId));
  };

  if (listLoading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500 mx-auto"></div>
      </div>
    );
  }

  if (!publicGifs || publicGifs.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-xl text-gray-400">No GIF advertisements yet</p>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <span className="absolute animate-ping inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
          </div>
          <h2 className="text-2xl font-bold text-black">Active GIFs</h2>
        </div>
      </div>

      {/* Swiper using Web Component (correct syntax) */}
      <swiper-container
        navigation="true"
        slides-per-view="1"
        space-between="16"
        breakpoints={JSON.stringify({
          640: { slidesPerView: 2, spaceBetween: 16 },
          768: { slidesPerView: 3, spaceBetween: 16 },
          1024: { slidesPerView: 4, spaceBetween: 20 },
        })}
        style={{
          "--swiper-navigation-color": "#9333ea",
          "--swiper-navigation-size": "44px",
        }}
      >
        {publicGifs.map((gif) => (
          <swiper-slide key={gif._id}>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl hover:border-purple-400 transition-all duration-300 overflow-hidden h-full flex flex-col">
              <div
                className="h-48 bg-gray-100 relative overflow-hidden cursor-pointer"
                onClick={() => handleGifClick(gif._id)}
              >
                {gif.gifs && gif.gifs.length > 0 ? (
                  <img
                    src={gif.gifs[0]}
                    alt={gif.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/400x300/e5e7eb/6b7280?text=GIF+Not+Found";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-gray-500 font-medium">No GIF</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2">
                  {gif.title || "Untitled GIF Campaign"}
                </h3>

                <div className="mt-auto">
                  <button
                    onClick={() => handleShowDetails(gif._id)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <FaExternalLinkAlt />
                    Show Details
                  </button>
                </div>
              </div>
            </div>
          </swiper-slide>
        ))}
      </swiper-container>
    </div>
  );
};

export default MyGifsSwiper;
