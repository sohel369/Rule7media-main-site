import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  createVehicleWrap,
  modifyVehicleWrap,
  removeVehicleWrap,
  setCurrentWrap,
  reset,
  fetchVehicleWrapById,
  fetchVehicleWraps,
} from "../store/vehicalwrapper/vehicalwrapperSlice";
import { getAllCategories } from "../store/category/categorySlice.js";
import { fetchVehicles } from "../store/vehicle/vehicleSlice";

const VehicleWrapForm = ({ wrapId }) => {
  const dispatch = useDispatch();
  const {
    currentWrap,
    isSuccess,
    isLoading,
    isError,
    message,
    wraps: allWraps = [],
  } = useSelector((state) => state.vehiclewrapper);

  const { list = [] } = useSelector((state) => state.vehicles || {});

  const { categories } = useSelector((state) => state.category);

  const [formData, setFormData] = useState({
    description: "",
    vehicleType: "",
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Create ref for the form section
  const formRef = useRef(null);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchVehicles());
    dispatch(fetchVehicleWraps());
    dispatch(getAllCategories());
  }, [dispatch]);
  // Handle wrapId prop changes
  useEffect(() => {
    if (wrapId) {
      const existingWrap = allWraps.find((wrap) => wrap._id === wrapId);
      if (existingWrap) {
        populateForm(existingWrap);
      } else {
        dispatch(fetchVehicleWrapById(wrapId));
      }
    } else {
      resetForm();
    }
  }, [wrapId, allWraps, dispatch]);

  // Handle currentWrap changes from Redux
  useEffect(() => {
    if (currentWrap && wrapId && currentWrap._id === wrapId) {
      populateForm(currentWrap);
    }
  }, [currentWrap, wrapId]);

  // Auto-scroll to form when it becomes visible
  useEffect(() => {
    if (showForm && formRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        formRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [showForm]);

  // Function to populate form with wrap data
  const populateForm = (wrap) => {
    setFormData({
      description: wrap.description || "",
      vehicleType: wrap.vehicleType || "",
    });
    setImagePreviews(wrap.image || []);
    setImageFiles([]); // Reset file inputs for editing
    setRemovedImages([]); // Reset removed images
    setShowForm(true);
  };

  const resetForm = () => {
    dispatch(setCurrentWrap(null));
    setFormData({
      description: "",
      vehicleType: "",
    });
    setImagePreviews([]);
    setImageFiles([]);
    setRemovedImages([]);
    setShowForm(false);
  };
  const categoryList = Array.isArray(categories?.data) ? categories.data : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFilePreviews = files.map((file) => URL.createObjectURL(file));

      setImageFiles((prev) => [...prev, ...files]);
      setImagePreviews((prev) => [...prev, ...newFilePreviews]);
    }
  };

  const removeImage = (index) => {
    const imageToRemove = imagePreviews[index];

    // Check if it's an existing image (URL string) or a new file (blob URL)
    if (typeof imageToRemove === "string" && imageToRemove.startsWith("http")) {
      // It's an existing image from the server
      setRemovedImages((prev) => [...prev, imageToRemove]);
    } else {
      // It's a new file, find its position in imageFiles
      const fileIndex = imageFiles.findIndex((_, i) => {
        const totalExistingImages = (currentWrap?.image || []).length;
        return i === index - totalExistingImages;
      });

      if (fileIndex !== -1) {
        // Clean up the object URL
        URL.revokeObjectURL(imageToRemove);
        setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      }
    }

    // Remove from previews
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate that we have at least one image
    const remainingImages = imagePreviews.filter(
      (img) => !removedImages.includes(img),
    );

    if (remainingImages.length === 0 && imageFiles.length === 0) {
      alert("At least one image is required");
      return;
    }

    const formPayload = new FormData();
    formPayload.append("description", formData.description);
    formPayload.append("vehicleType", formData.vehicleType);

    // Append new image files
    imageFiles.forEach((file) => {
      formPayload.append("image", file);
    });

    // Append removed images for backend processing
    removedImages.forEach((url) => {
      formPayload.append("removedImages", url);
    });

    // Debug logging

    if (currentWrap) {
      dispatch(modifyVehicleWrap({ id: currentWrap._id, data: formPayload }));
    } else {
      dispatch(createVehicleWrap(formPayload));
    }

    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle wrap?")) {
      dispatch(removeVehicleWrap(id));
    }
  };

  const handleEdit = (wrap) => {
    dispatch(setCurrentWrap(wrap));
    populateForm(wrap);
  };

  const handleCreateNew = () => {
    resetForm();
    setShowForm(true);
  };

  // Reset success/error states after successful operations
  useEffect(() => {
    if (isSuccess) {
      resetForm();
      dispatch(fetchVehicleWraps()); // Refresh the list
      const timer = setTimeout(() => {
        dispatch(reset());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, dispatch]);

  if (isLoading && !showForm)
    return <div className="text-center p-5">Loading...</div>;

  return (
    <div className=" flex-1 p-6 bg-theme-bg rounded-2xl">
      {/* Header and Create Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          Vehicle Wraps Management
        </h1>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create New Wrap
        </button>
      </div>

      {/* Success/Error Messages */}
      {/* {isSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}
      {isError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {message}
        </div>
      )} */}

      {/* Form Section (conditionally rendered) */}
      {showForm && (
        <div
          ref={formRef}
          className="bg-theme-bg2 rounded-lg shadow p-6 mb-8 border-2 border-blue-200"
        >
          <h2 className="text-xl font-bold mb-4 text-white">
            {currentWrap ? "Edit Vehicle Wrap" : "Create New Vehicle Wrap"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            encType="multipart/form-data"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6  text-white">
              <div>
                <div className="mb-4">
                  <label className="block mb-2 font-medium  text-white">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    className="w-full bg-theme-bg p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparentt"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-medium">Vehicle Type</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="w-full bg-theme-bg p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Vehicle Type</option>
                    {categoryList.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <label className="block mb-2 font-medium">
                    Vehicle Images
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      name="image"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                      accept="image/*"
                      multiple
                      required={!currentWrap && imagePreviews.length === 0}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="mt-2 text-white">Click to upload images</p>
                    </label>
                  </div>
                </div>

                {imagePreviews.length > 0 && (
                  <div>
                    <p className="font-medium mb-3">Image Previews:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/default-car.jpg";
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <div>
                {currentWrap && (
                  <button
                    type="button"
                    onClick={() => handleDelete(currentWrap._id)}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete Wrap
                  </button>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border border-gray-300 text-white rounded-lg hover:bg-theme-bg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Processing..."
                    : currentWrap
                      ? "Update Wrap"
                      : "Create Wrap"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Wraps Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allWraps.map((wrap) => (
          <div
            key={wrap._id}
            className="bg-theme-bg2 rounded-lg shadow overflow-hidden"
          >
            {wrap.image?.[0] && (
              <div className="h-48 bg-gray-100 overflow-hidden">
                <img
                  src={wrap.image[0]}
                  alt={wrap.description}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-car.jpg";
                  }}
                />
              </div>
            )}
            <div className="p-4">
              <div className="mb-2">
                <span className="text-sm font-medium text-white">
                  {wrap.vehicleType}
                </span>
              </div>
              <p className="text-white text-sm mb-4 line-clamp-2">
                {wrap.description}
              </p>
              <div className="flex justify-between items-center">
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(wrap)}
                    className="px-3 py-1 bg-theme-bg text-white  rounded text-sm hover:bg-theme-bg2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(wrap._id)}
                    className="px-3 py-1 bg-theme-bg text-white rounded text-sm hover:bg-theme-bg2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleWrapForm;
