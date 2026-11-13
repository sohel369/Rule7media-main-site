// src/pages/user-profile/GifDetails.jsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { getGifById, trackClick } from "../store/gif/gifSlice";
import SEO from "../components/SEO";
const GifDetails = () => {
  const { gifId } = useParams();
  const dispatch = useDispatch();
  const { singleGif } = useSelector((state) => state.gif);

  useEffect(() => {
    dispatch(getGifById(gifId));
  }, [gifId, dispatch]);

  if (!singleGif) {
    return (
      <div className="py-32 text-center bg-theme-bg">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto mb-6"></div>
        <p className="text-xl text-gray-400">Loading GIF details...</p>
      </div>
    );
  }

  const seoData = {
    title: singleGif?.name
      ? `${singleGif.name} | GIF Details`
      : "GIF Details | Fleet Marketing",
    description:
      singleGif?.description?.substring(0, 160) || "View GIF animation details",
    keywords: `gif, animation, ${singleGif?.category || "marketing"}, creative`,
  };
  return (
    <>
      <SEO {...seoData} />
      <div className="overflow-auto px-7 py-4 w-full mx-auto  text-black rounded-2xl">
        <div className="mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-center">
              {singleGif.title}
            </h1>
            {/* <p className="text-lg md:text-xl text-black">
            Your Animated GIF Advertisement Campaign
          </p> */}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {singleGif.gifs.map((url, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
                className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-transparent hover:border-purple-500 transition-all duration-500 cursor-pointer"
                onClick={() => dispatch(trackClick(singleGif._id))}
              >
                <img
                  src={url}
                  alt={`GIF ${index + 1}`}
                  className="w-full h-80 md:h-96 object-contain"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default GifDetails;
