// src/components/ImageSlider.jsx
import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiImage } from "react-icons/fi";

const ImageSlider = ({ images = [], onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center">
        <FiImage className="text-gray-300" size={20} />
      </div>
    );
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-36 h-16 group">
      {/* Image */}
      <div className="h-full w-full flex items-center justify-center overflow-hidden rounded-md">
        <img
          src={images[currentIndex]}
          alt={`Vehicle ${currentIndex + 1}`}
          className="h-full w-auto max-w-full object-contain rounded-md cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={() => onImageClick(images[currentIndex])}
        />
      </div>

      {/* Left Arrow */}
      {images.length > 1 && (
        <button
          onClick={prevSlide}
          className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <FiChevronLeft size={14} />
        </button>
      )}

      {/* Right Arrow */}
      {images.length > 1 && (
        <button
          onClick={nextSlide}
          className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <FiChevronRight size={14} />
        </button>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-1 h-1 rounded-full transition-all ${
                index === currentIndex ? "bg-blue-500 w-3" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSlider;
