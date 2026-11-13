import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getExecutives,
  addExecutive,
  updateExecutiveById,
  deleteExecutiveById,
} from "../../store/executives/executiveSlice";
import baseUrl from "../../config.js";

const ExecutiveManager = () => {
  const dispatch = useDispatch();
  const {
    data: executives,
    loading,
    error,
  } = useSelector((state) => state.executives);

  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    photo: null,
    bio: "",
  });
  const [editId, setEditId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    dispatch(getExecutives());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        photo: file,
      }));

      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("position", formData.position);
    data.append("bio", formData.bio);
    if (formData.photo) data.append("photo", formData.photo);

    const action = editId
      ? updateExecutiveById({ id: editId, data })
      : addExecutive(data);

    dispatch(action)
      .unwrap()
      .then(() => {
        dispatch(getExecutives());
        resetForm();
      })
      .catch((error) => {
        console.error("Failed to save executive:", error);
      });
  };

  const resetForm = () => {
    setFormData({ name: "", position: "", photo: null, bio: "" });
    setEditId(null);
    setFormVisible(false);
    setPreviewImage(null);
  };

  const handleEdit = (executive) => {
    setFormData({
      name: executive.name,
      position: executive.position,
      bio: executive.bio,
      photo: null, // Reset photo when editing
    });
    setEditId(executive._id);
    setFormVisible(true);
    setPreviewImage(executive.photoUrl);
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (
      window.confirm("Are you sure you want to delete this executive member?")
    ) {
      dispatch(deleteExecutiveById(id));
    }
  };

  const getImageUrl = (photoUrl) => {
    if (!photoUrl) {
      return "https://via.placeholder.com/150?text=No+Image";
    }

    // अगर पहले से http/https से शुरू होता है (Cloudinary URL) → सीधे return करो
    if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
      return photoUrl;
    }

    if (photoUrl.startsWith("data:")) {
      return photoUrl;
    }

    const path = photoUrl.startsWith("/") ? photoUrl : `/${photoUrl}`;
    return `${baseUrl}${path}`;
  };

  return (
    <div className="px-7 py-4 w-full bg-theme-bg text-slate-300 rounded-2xl min-h-[100vh]">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-semibold text-theme-color">
          Executive Members
        </h2>
        <button
          onClick={() => {
            formVisible ? resetForm() : setFormVisible(true);
          }}
          className="bg-theme-color text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition duration-200"
        >
          {formVisible ? "Close Form" : "Add New"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {formVisible && (
        <form
          onSubmit={handleSubmit}
          className="bg-theme-bg2 p-6 rounded-lg shadow-md mb-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 text-white-700">
                Full Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded-md focus:ring-2 bg-theme-bg2 text-white placeholder-gray-400  focus:ring-theme-color focus:border-theme-color"
                placeholder="Enter member name"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-white-700">
                Position
              </label>
              <input
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded-md focus:ring-2 bg-theme-bg2 text-white placeholder-gray-400   focus:ring-theme-color focus:border-theme-color"
                placeholder="Enter position"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 bg-theme-bg2 text-white placeholder-gray-400  text-gray-700">
                Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required={!editId}
                className="w-full border p-2 rounded-md bg-theme-bg2 text-white placeholder-gray-400 "
              />
              {editId && (
                <p className="text-sm text-gray-500 mt-1">
                  Upload new photo only if you want to change it
                </p>
              )}
            </div>

            <div>
              {previewImage && (
                <div className="mt-2">
                  <p className="block font-medium mb-1 text-gray-700">
                    Image Preview
                  </p>
                  <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-200">
                    <img
                      src={getImageUrl(previewImage)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Image failed to load:", previewImage);
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/150?text=No+Image";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1 text-white-700">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              required
              className="w-full border p-2 rounded-md focus:ring-2 bg-theme-bg2 text-white placeholder-gray-400  focus:ring-theme-color focus:border-theme-color"
              placeholder="Enter brief bio"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="border border-gray-300 bg-white text-gray-700 py-2 px-6 rounded-md hover:bg-gray-50 transition duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-theme-color text-white py-2 px-6 rounded-md hover:bg-opacity-90 transition duration-200 font-medium"
            >
              {editId ? "Update Member" : "Add Member"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Loading executives...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {executives && Array.isArray(executives) && executives.length > 0 ? (
            executives.map(
              (ex) =>
                ex && (
                  <div
                    key={ex._id}
                    className="bg-theme-bg2 border rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      {ex.photoUrl && (
                        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 ml-4">
                          <img
                            src={getImageUrl(ex.photoUrl)}
                            alt={ex.name || "Executive"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error(
                                "Image failed to load:",
                                ex.photoUrl,
                              );
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/150?text=No+Image";
                            }}
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-white-800">
                          {ex.name}
                        </h3>
                        <p className="text-sm font-medium text-theme-color">
                          {ex.position}
                        </p>
                        <p className="text-sm text-white-600 mt-1 line-clamp-2">
                          {ex.bio}
                        </p>
                      </div>
                    </div>
                    <div className="space-x-3 flex">
                      <button
                        onClick={() => handleEdit(ex)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ex._id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ),
            )
          ) : (
            <div className="text-center p-8 bg-white rounded-lg border">
              <p className="text-gray-600">
                No executives found. Add your first member!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExecutiveManager;
