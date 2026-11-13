import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoCloudUploadOutline } from "react-icons/io5";
import { createCategory, reset } from "../../store/category/categorySlice";

const CreateCategory = () => {
  const dispatch = useDispatch();
  const [imgUrl, setImgUrl] = useState("");
  const imgRef = useRef(null);
  const navigate = useNavigate();

  // Add a flag to track if form was submitted
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const { isSuccess, isError, isLoading, message } = useSelector(
    (state) => state.category,
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Clear any previous state when component mounts
  useEffect(() => {
    dispatch(reset());
  }, [dispatch]);

  // Handle success and error states ONLY after form submission
  useEffect(() => {
    if (isFormSubmitted) {
      if (isSuccess) {
        toast.success("Category created successfully");
        dispatch(reset());
        setIsFormSubmitted(false);
        navigate("/admin/categories");
      }

      if (isError) {
        toast.error(message || "Failed to create category");
        dispatch(reset());
        setIsFormSubmitted(false);
      }
    }
  }, [isSuccess, isError, isFormSubmitted, message, dispatch, navigate]);

  const handleProductUpload = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (!imgRef.current.files[0]) {
      toast.error("Image is required");
      return;
    }

    if (imgRef.current.files[0].size > 1024 * 1024) {
      toast.error("Image size should be less than 1MB");
      return;
    }

    // Create form data
    const data = new FormData();
    data.append("name", formData.name.trim());
    data.append("description", formData.description.trim());
    data.append("image", imgRef.current.files[0]);

    // Set form submitted flag before dispatching
    setIsFormSubmitted(true);

    // Dispatch the action
    try {
      await dispatch(createCategory(data)).unwrap();
      // Success will be handled by useEffect
    } catch (error) {
      // Error will be handled by useEffect
      console.error("Create category error:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a PNG, JPG, or JPEG image");
        return;
      }

      // Validate file size
      if (file.size > 1024 * 1024) {
        toast.error("Image size should be less than 1MB");
        return;
      }

      setImgUrl(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setImgUrl("");
    setIsFormSubmitted(false);
    if (imgRef.current) {
      imgRef.current.value = "";
    }
    // Clear any Redux state
    dispatch(reset());
  };

  return (
    <div>
      <form
        className="flex flex-col lg:flex-row gap-8 justify-center lg:w-[100%] m-auto px-4"
        onSubmit={handleProductUpload}
      >
        <div className="text-black lg:w-[22%] lg:min-w-[350px]">
          <h1 className="text-black text-2xl font-bold mb-4">Upload Item</h1>

          {imgUrl ? (
            <img
              src={imgUrl}
              alt="upload img"
              onClick={() => imgRef.current.click()}
              className="w-full h-80 rounded-lg border-2 border-solid p-2 object-contain cursor-pointer"
            />
          ) : (
            <div
              onClick={() => imgRef.current.click()}
              className="w-full h-80 rounded-xl bg-theme-bg border-2 border-dashed border-border-info-color flex items-center justify-center cursor-pointer"
            >
              <div className="text-center flex flex-col items-center gap-2">
                <IoCloudUploadOutline size={68} className="text-theme-color" />
                <p className="text-white">Click to Upload</p>
                <span className="text-body-text-color text-white">
                  PNG,JPG,JPEG | Max Size 1MB
                </span>
              </div>
            </div>
          )}

          <input
            type="file"
            className="hidden"
            onChange={handleImageChange}
            ref={imgRef}
            accept=".png, .jpg, .jpeg"
          />
        </div>

        {/* INPUTS */}
        <div className="flex flex-col gap-4 lg:w-[50%] bg-theme-bg inputs:outline-none p-8 inputs:px-4 inputs:py-3 inputs:rounded-xl select:px-4 select:py-3 select:rounded-xl select:cursor-pointer border border-border-info-color inputs:bg-theme-bg inputs:border inputs:border-border-info-color focus:inputs:border-theme-color select:border select:border-border-info-color inputs:placeholder-body-text-color text-slate-300 rounded-2xl [&_label]:mb-2 [&_label]:text-body-text-color [&_*]:transition-all">
          <div className="grid text-white">
            <label htmlFor="product_name" className="!text-white">
              Category Name
            </label>
            <input
              required
              id="product_name"
              placeholder="e.g (Modern Abstract Painting)"
              type="text"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              value={formData.name}
              disabled={isLoading}
            />
          </div>

          <div className="grid">
            <label htmlFor="description" className="!text-white">
              Description
            </label>
            <textarea
              placeholder="Describe your product, art, etc."
              required
              id="description"
              rows="7"
              className="outline-none bg-theme-bg rounded-xl px-3 py-4 border border-border-info-color focus:border-theme-color placeholder-body-text-color"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              value={formData.description}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-3 py-4 rounded-xl text-white cursor-pointer font-bold tracking-wide flex-1 bg-theme-color hover:bg-color-danger disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Upload"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={isLoading}
              className="px-3 py-4 rounded-xl text-white cursor-pointer font-bold tracking-wide bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateCategory;
