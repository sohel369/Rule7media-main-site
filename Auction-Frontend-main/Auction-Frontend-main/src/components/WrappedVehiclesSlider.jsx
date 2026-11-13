import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVehicleWraps } from "../store/vehicalwrapper/vehicalwrapperSlice";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const WrappedVehiclesSlider = () => {
  const dispatch = useDispatch();
  const { wraps, isLoading } = useSelector((state) => state.vehiclewrapper);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentVehicle, setCurrentVehicle] = useState(null);

  useEffect(() => {
    dispatch(fetchVehicleWraps());
  }, [dispatch]);

  // Image click handler
  const handleImageClick = (vehicle, imageIndex = 0) => {
    setCurrentVehicle(vehicle);
    setCurrentImageIndex(imageIndex);
    setIsPopupOpen(true);
    // Prevent body scrolling when popup is open
    document.body.style.overflow = "hidden";
  };

  // Close popup
  const closePopup = () => {
    setIsPopupOpen(false);
    setCurrentVehicle(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = "auto";
  };

  // Navigate to previous image
  const previousImage = () => {
    if (currentVehicle?.image?.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? currentVehicle.image.length - 1 : prev - 1,
      );
    }
  };

  // Navigate to next image
  const nextImage = () => {
    if (currentVehicle?.image?.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === currentVehicle.image.length - 1 ? 0 : prev + 1,
      );
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPopupOpen) {
        if (e.key === "Escape") closePopup();
        if (e.key === "ArrowLeft") previousImage();
        if (e.key === "ArrowRight") nextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPopupOpen, currentVehicle]);

  if (isLoading)
    return <p className="text-center py-12">Loading vehicles...</p>;

  return (
    <>
      <div className="p-4 bg-black rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition duration-300 group relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl text-white font-bold mb-2 text-center">
            CREATIVE WRAPS
          </h2>
          {wraps && wraps.length > 0 ? (
            <Swiper
              slidesPerView={1}
              spaceBetween={20}
              navigation={true}
              pagination={{ clickable: true }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              modules={[Navigation, Pagination, Autoplay]}
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              className="pb-12"
            >
              {wraps &&
                wraps.map((vehicle) => (
                  <SwiperSlide key={vehicle._id}>
                    <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                      <div
                        className="relative w-full h-64 overflow-hidden cursor-pointer group"
                        onClick={() => handleImageClick(vehicle, 0)}
                      >
                        <img
                          src={vehicle?.image?.[0] || "/default-car.jpg"}
                          alt={vehicle?.title || "Wrapped vehicle"}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-car.jpg";
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <h3 className="text-white text-lg font-semibold">
                            {vehicle?.vehicleType || "Premium Wrap"}
                          </h3>
                          {vehicle?.image?.length > 1 && (
                            <p className="text-white/80 text-sm mt-1">
                              {vehicle?.image.length} images
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
            </Swiper>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl">
              <p className="text-xl text-gray-500">
                No featured vehicles found
              </p>
              <button
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => dispatch(fetchVehicleWraps())}
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>

      {isPopupOpen && currentVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <button
            onClick={closePopup}
            className="absolute top-4 right-4 z-60 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {currentVehicle?.image?.length > 1 && (
            <>
              <button
                onClick={previousImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-60 p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-60 p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          <div className="relative w-full max-w-5xl mx-4 bg-gray-100 rounded-lg overflow-hidden shadow-2xl">
            <div className="relative pt-[56.25%]">
              <img
                src={
                  currentVehicle?.image?.[currentImageIndex] ||
                  "/default-car.jpg"
                }
                alt={`${currentVehicle?.vehicleType || "Vehicle"} - Image ${currentImageIndex + 1}`}
                className="absolute top-0 left-0 w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-car.jpg";
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-white text-2xl font-bold mb-1">
                    {currentVehicle?.vehicleType || "Premium Wrap"}
                  </h3>
                  <p className="text-white/90 text-lg mb-2">
                    {currentVehicle?.description || "High-quality vehicle wrap"}
                  </p>
                  {currentVehicle?.image?.length > 1 && (
                    <div className="flex items-center text-white/80">
                      <span className="mr-2">
                        {currentImageIndex + 1}/{currentVehicle?.image?.length}
                      </span>
                      <div className="flex space-x-1">
                        {currentVehicle?.image.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-2 h-2 rounded-full ${currentImageIndex === idx ? "bg-white" : "bg-white/50"}`}
                            aria-label={`Go to image ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {currentVehicle?.image?.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/50 p-2 rounded-lg gap-5">
              {currentVehicle?.image.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-12 h-12 rounded-lg overflow-hidden transition-all duration-200 ${
                    index === currentImageIndex
                      ? "ring-2 ring-white scale-110"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-car.jpg";
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          <div className="absolute inset-0 -z-10" onClick={closePopup} />
        </div>
      )}

      <style jsx>{`
        .swiper-button-prev,
        .swiper-button-next {
          background-color: #2563eb; /* Vibrant blue background */
          color: #ffffff; /* White arrow */
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s ease;
        }
        .swiper-button-prev:hover,
        .swiper-button-next:hover {
          background-color: #1d4ed8; /* Darker blue on hover */
        }
        .swiper-button-prev:after,
        .swiper-button-next:after {
          font-size: 20px; /* Adjust arrow size */
          font-weight: bold;
        }
        .swiper-button-prev {
          left: 10px; /* Adjust position */
        }
        .swiper-button-next {
          right: 10px; /* Adjust position */
        }
      `}</style>
    </>
  );
};

export default WrappedVehiclesSlider;
