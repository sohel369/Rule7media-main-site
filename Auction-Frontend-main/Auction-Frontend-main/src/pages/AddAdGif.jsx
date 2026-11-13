import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { MdAdd, MdAnimation } from "react-icons/md";
import { FiUpload, FiTrash2, FiX, FiEye } from "react-icons/fi";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  getGifs,
  addGif,
  deleteGifById,
  resetGif,
} from "../store/gif/gifSlice";
import {
  getGifLimits,
  formatFileSize,
  getRecommendedSizes,
} from "../utils/gifLimits";

const MyGifAds = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    gifs,
    loading: listLoading,
    success,
    error,
    message,
  } = useSelector((state) => state.gif);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGifs, setSelectedGifs] = useState([]);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const subscription = user?.subscription;

  const gifLimits = getGifLimits(subscription);
  const recommendedSizesMessage = getRecommendedSizes(gifLimits);

  // ✅ Server limit (should match backend)
  const SERVER_MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB

  useEffect(() => {
    dispatch(getGifs());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success(message || "✅ GIF campaign uploaded successfully!");
      setIsModalOpen(false);
      resetForm();
      dispatch(getGifs());
    }
    if (error) {
      // ✅ Handle 413 error specifically
      const errorMsg = typeof error === 'string' ? error : error?.message || error?.payload?.message || '';
      
      if (errorMsg.includes("413") || errorMsg.includes("too large") || errorMsg.includes("Request Entity Too Large")) {
        toast.error("❌ File too large! Maximum size exceeded. Please compress your GIFs or upload fewer files.");
        setUploadError("413: Request Entity Too Large. Please reduce file sizes.");
      } else if (errorMsg.includes("limit reached")) {
        toast.error(`❌ ${errorMsg}`);
        setUploadError(errorMsg);
      } else {
        toast.error(errorMsg || "Upload failed. Please try again.");
        setUploadError(errorMsg);
      }
    }
    dispatch(resetGif());
  }, [success, error, dispatch]);

  const resetForm = () => {
    // ✅ Revoke object URLs to prevent memory leaks
    selectedGifs.forEach((gif) => {
      if (gif.preview) URL.revokeObjectURL(gif.preview);
    });
    setSelectedGifs([]);
    setTitle("");
    setUploadError(null);
  };

  const canCreateCampaign = gifs.length < gifLimits.maxCampaigns;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/gif": [".gif"] },
    multiple: true,
    maxFiles: gifLimits.maxGifsPerCampaign,
    onDrop: (acceptedFiles, rejectedFiles) => {
      // ✅ Handle rejected files
      if (rejectedFiles && rejectedFiles.length > 0) {
        rejectedFiles.forEach((rejection) => {
          if (rejection.errors) {
            rejection.errors.forEach((err) => {
              if (err.code === "file-invalid-type") {
                toast.error(`${rejection.file.name} is not a valid GIF file.`);
              } else if (err.code === "too-many-files") {
                toast.error(`Maximum ${gifLimits.maxGifsPerCampaign} GIFs allowed per campaign.`);
              }
            });
          }
        });
        return;
      }

      if (acceptedFiles.length === 0) return;

      const available = gifLimits.maxGifsPerCampaign - selectedGifs.length;
      if (available <= 0) {
        toast.error(
          `Your ${gifLimits.label} allows maximum ${gifLimits.maxGifsPerCampaign} GIFs per campaign`,
        );
        return;
      }

      let files = acceptedFiles.slice(0, available);
      const validFiles = [];
      let totalSize = 0;

      // ✅ Calculate total size first
      files.forEach((file) => {
        totalSize += file.size;
      });

      // ✅ Check total size limit
      if (totalSize > SERVER_MAX_TOTAL_SIZE) {
        toast.error(
          `❌ Total size (${formatFileSize(totalSize)}) exceeds server limit of ${formatFileSize(SERVER_MAX_TOTAL_SIZE)}. Please compress your GIFs or upload fewer files.`
        );
        setUploadError(`Total size too large: ${formatFileSize(totalSize)} / ${formatFileSize(SERVER_MAX_TOTAL_SIZE)}`);
        return;
      }

      for (const file of files) {
        if (file.size > gifLimits.maxFileSize) {
          toast.error(
            `${file.name} is too large (${formatFileSize(file.size)}). Your ${gifLimits.label} allows GIFs up to ${formatFileSize(gifLimits.maxFileSize)}`,
          );
          continue;
        }

        validFiles.push({
          file,
          preview: URL.createObjectURL(file),
        });
      }

      if (validFiles.length === 0) return;

      setSelectedGifs((prev) => [...prev, ...validFiles]);
      setUploadError(null);
    },
  });

  const removeGif = (index) => {
    setSelectedGifs((prev) => {
      const newGifs = [...prev];
      if (newGifs[index]?.preview) {
        URL.revokeObjectURL(newGifs[index].preview);
      }
      newGifs.splice(index, 1);
      return newGifs;
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError(null);

    if (selectedGifs.length === 0) {
      return toast.error("Please select at least one GIF");
    }

    if (!title.trim()) {
      return toast.error("Title is required");
    }

    if (!canCreateCampaign) {
      return toast.error(
        `Campaign limit reached! Your ${gifLimits.label} allows ${gifLimits.maxCampaigns} campaigns. Please upgrade to create more.`,
      );
    }

    // ✅ Double-check total size before upload
    let totalSize = 0;
    selectedGifs.forEach((gif) => {
      totalSize += gif.file.size;
    });

    if (totalSize > SERVER_MAX_TOTAL_SIZE) {
      toast.error(
        `❌ Total size (${formatFileSize(totalSize)}) exceeds server limit. Please reduce file sizes.`
      );
      setUploadError(`Total size too large: ${formatFileSize(totalSize)}`);
      return;
    }

    const formData = new FormData();
    selectedGifs.forEach((gif) => formData.append("gifs", gif.file));
    formData.append("title", title);

    setUploading(true);
    try {
      const result = await dispatch(addGif(formData)).unwrap();
      // Success will be handled by useEffect
    } catch (err) {
      // ✅ Handle 413 error specifically
      const errorMsg = typeof err === 'string' ? err : err?.message || err?.payload?.message || '';
      
      if (errorMsg.includes("413") || errorMsg.includes("too large") || errorMsg.includes("Request Entity Too Large") || err?.status === 413) {
        //toast.error("❌ File too large! Please compress your GIFs or upload fewer files.");
        setUploadError("413: Request Entity Too Large. Please reduce file sizes.");
      } else {
        toast.error(errorMsg || "Upload failed. Please try again.");
        setUploadError(errorMsg);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this GIF campaign?")) {
      dispatch(deleteGifById(id));
    }
  };

  // ✅ Calculate total size for display
  const getTotalSize = () => {
    let total = 0;
    selectedGifs.forEach((gif) => {
      total += gif.file.size;
    });
    return total;
  };

  return (
    <div className="overflow-auto px-7 py-4 w-full bg-theme-bg text-white rounded-2xl">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <p className="items-center text-4xl md:text-2xl text-white">
            My GIF Advertisements
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-8 py-4 bg-theme-bg2 rounded-full font-bold text-xl hover:scale-105 transition shadow-xl"
          >
            <MdAdd className="text-2xl" />
            Add New GIF Campaign
          </button>
        </div>

        {/* List */}
        {listLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto"></div>
          </div>
        ) : gifs.length === 0 ? (
          <div className="text-center py-20">
            <MdAnimation className="text-9xl text-gray-600 mx-auto mb-6 opacity-50" />
            <p className="text-2xl text-gray-400 mb-8">
              No GIF advertisements yet
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-10 py-4 bg-theme-bg2 rounded-full font-bold text-xl"
            >
              Upload Your First GIFs
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gifs.map((ad) => (
              <motion.div
                key={ad._id}
                whileHover={{ scale: 1.05 }}
                className="bg-theme-bg2 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-gray-800 relative"
              >
                <div className="absolute top-0 right-4 z-10 flex gap-2">
                  <button
                    onClick={() => navigate(`/gif-details/${ad._id}`)}
                    className="bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition shadow-lg"
                    title="View Campaign"
                  >
                    <FiEye className="text-white text-lg" />
                  </button>

                  <button
                    onClick={() => handleDelete(ad._id)}
                    className="bg-red-600 p-2 rounded-full hover:bg-red-700 transition shadow-lg"
                    title="Delete Campaign"
                  >
                    <FiTrash2 className="text-white text-lg" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 p-4 bg-black/40">
                  {(ad.gifs || []).slice(0, 4).map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="GIF"
                      className="w-full h-32 object-cover rounded-lg border border-gray-700"
                    />
                  ))}
                  {ad?.gifs?.length > 4 && (
                    <div className="flex items-center justify-center h-32 bg-black/60 rounded-lg">
                      <p className="text-gray-400 text-lg">
                        +{ad.gifs.length - 4}
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-purple-300">
                    {ad.title}
                  </h3>
                  <p className="text-sm text-purple-400">
                    {ad?.gifs?.length} GIF{ad?.gifs?.length > 1 ? "s" : ""}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-theme-bg2 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 border border-gray-800"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <MdAnimation className="text-purple-400 text-4xl" />
                Upload New GIF Campaign
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-3xl text-gray-400 hover:text-white"
              >
                <FiX />
              </button>
            </div>

            {/* ✅ Error Display */}
            {/* {uploadError && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-xl text-red-200">
                <p className="font-semibold">❌ Upload Error:</p>
                <p className="text-sm">{uploadError}</p>
                {uploadError.includes("413") && (
                  <div className="mt-2 text-sm text-red-300">
                    <p>💡 Tips to fix this:</p>
                    <ul className="list-disc list-inside ml-2">
                      <li>Compress your GIFs using tools like <a href="https://ezgif.com/optimize" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">EZGIF</a></li>
                      <li>Upload fewer GIFs at a time</li>
                      <li>Reduce GIF dimensions (max width: 1080px)</li>
                      <li>Reduce GIF frame count</li>
                    </ul>
                  </div>
                )}
              </div>
            )} */}

            <form onSubmit={handleUpload} className="space-y-8">
              <div>
                <label className="block text-lg font-medium mb-3">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Flash Sale GIFs"
                  className="w-full px-6 py-4 bg-[#0E294D] border border-gray-700 rounded-xl focus:border-purple-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-medium mb-4">
                  Select GIFs ({selectedGifs.length}/
                  {gifLimits.maxGifsPerCampaign})
                </label>

                {/* ✅ Size Info Display */}
                {selectedGifs.length > 0 && (
                  <div className="mb-4 p-3 bg-[#0E294D] rounded-lg flex flex-wrap justify-between items-center gap-2">
                    <span className="text-sm text-gray-300">
                      Total Size: <span className={`font-bold ${getTotalSize() > SERVER_MAX_TOTAL_SIZE ? 'text-red-400' : 'text-white'}`}>{formatFileSize(getTotalSize())}</span>
                    </span>
                    <span className="text-sm text-gray-300">
                      Max Allowed: <span className="font-bold text-green-400">{formatFileSize(SERVER_MAX_TOTAL_SIZE)}</span>
                    </span>
                    {getTotalSize() > SERVER_MAX_TOTAL_SIZE * 0.8 && getTotalSize() <= SERVER_MAX_TOTAL_SIZE && (
                      <span className="text-xs text-yellow-400 font-bold">
                        ⚠️ Close to limit!
                      </span>
                    )}
                    {getTotalSize() > SERVER_MAX_TOTAL_SIZE && (
                      <span className="text-xs text-red-400 font-bold">
                        ❌ Exceeds limit!
                      </span>
                    )}
                  </div>
                )}

                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition 
                    ${
                      isDragActive
                        ? "border-[#9B5DE5] bg-[#9B5DE520]"
                        : "border-gray-600 bg-theme-bg hover:bg-[#0E294D]/60"
                    }`}
                >
                  <input {...getInputProps()} />
                  <FiUpload className="mx-auto text-8xl text-gray-500 mb-6" />
                  <p className="text-xl font-medium text-gray-300">
                    {isDragActive
                      ? "Drop the GIFs here..."
                      : "Drag & drop GIFs here, or click to select"}
                  </p>
                  <p className="text-sm text-gray-500 mt-3">
                    Only .gif • Max {gifLimits.maxGifsPerCampaign} files
                  </p>
                  <p className="text-xs text-blue-400 mt-2">
                    Tip: {recommendedSizesMessage}
                  </p>
                  <p className="text-xs text-red-400 mt-1">
                    ⚠️ Max total size: {formatFileSize(SERVER_MAX_TOTAL_SIZE)}
                  </p>
                </div>

                {selectedGifs.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-8">
                    {selectedGifs.map((gif, index) => (
                      <div
                        key={index}
                        className="relative rounded-xl overflow-hidden border-2 border-purple-600"
                      >
                        <img
                          src={gif.preview}
                          alt="preview"
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 text-center">
                          <span className="text-xs text-gray-300">
                            {formatFileSize(gif.file.size)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeGif(index)}
                          className="absolute top-2 right-2 bg-red-600 p-2 rounded-full hover:bg-red-700"
                        >
                          <FiTrash2 className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    uploading ||
                    selectedGifs.length === 0 ||
                    getTotalSize() > SERVER_MAX_TOTAL_SIZE
                  }
                  className={`flex-1 py-4 rounded-xl font-bold text-lg transition shadow-xl ${
                    uploading || selectedGifs.length === 0 || getTotalSize() > SERVER_MAX_TOTAL_SIZE
                      ? "bg-gray-600 cursor-not-allowed opacity-60"
                      : "bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-700 hover:to-blue-500"
                  }`}
                >
                  {uploading
                    ? "Uploading..."
                    : getTotalSize() > SERVER_MAX_TOTAL_SIZE
                    ? "Size Exceeds Limit"
                    : `Upload ${selectedGifs.length} GIF${selectedGifs.length > 1 ? "s" : ""}`}
                </button>
              </div>

              {/* ✅ Size warning */}
              {getTotalSize() > SERVER_MAX_TOTAL_SIZE && (
                <div className="text-center text-red-400 text-sm font-bold p-3 bg-red-900/30 rounded-xl border border-red-500">
                  ❌ Total size ({formatFileSize(getTotalSize())}) exceeds limit ({formatFileSize(SERVER_MAX_TOTAL_SIZE)}). Please remove some files or compress them.
                </div>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyGifAds;