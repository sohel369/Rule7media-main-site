import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaSpinner, FaArrowLeft } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories } from "../store/category/categorySlice";
import {
  updateSingleProduct as updateProduct,
  getSingleProductById as getProductById,
  getProductsBySellerId,
} from "../store/product/ProductSlice";

const EditProductSeller = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [product, setProduct] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
    images: [], // purani images (urls)
    newImages: [], // nayi upload ki gayi files
    officeCountry: "", // sirf ek country
    officeAddress: "", // sirf ek address
  });

  const [imageError, setImageError] = useState("");

  const { categories } = useSelector((state) => state.category);
  const { singleProduct, isLoading: productLoading } = useSelector(
    (state) => state.product,
  );
  const { user } = useSelector((state) => state.auth);

  const categoryList = categories?.data || categories || [];

  // Load data
  useEffect(() => {
    dispatch(getAllCategories());
    dispatch(getProductById(id));
  }, [dispatch, id]);

  // Fill form when product loads
  useEffect(() => {
    if (singleProduct && singleProduct._id === id) {
      const imgArray = Array.isArray(singleProduct.images)
        ? singleProduct.images
        : singleProduct.image
          ? [singleProduct.image]
          : [];

      const office = singleProduct.officeLocations?.[0] || {};

      setProduct({
        name: singleProduct.name || "",
        category: singleProduct.category?._id || singleProduct.category || "",
        price: singleProduct.price || "",
        quantity: singleProduct.quantity || "",
        description: singleProduct.description || "",
        images: imgArray,
        newImages: [],
        officeCountry: office.country || "",
        officeAddress: office.address || office.officeAddress || "",
      });
    }
  }, [singleProduct, id]);

  // Image upload (max 4 total)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalCurrent = product.images.length + product.newImages.length;

    if (totalCurrent + files.length > 4) {
      setImageError("Maximum 4 images allowed");
      const allowed = files.slice(0, 4 - totalCurrent);
      setProduct((prev) => ({
        ...prev,
        newImages: [...prev.newImages, ...allowed],
      }));
    } else {
      setImageError("");
      setProduct((prev) => ({
        ...prev,
        newImages: [...prev.newImages, ...files],
      }));
    }
  };

  const removeImage = (type, index) => {
    if (type === "old") {
      setProduct((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    } else {
      setProduct((prev) => ({
        ...prev,
        newImages: prev.newImages.filter((_, i) => i !== index),
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // FINAL SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (product.images.length + product.newImages.length === 0) {
      setImageError("At least one image is required");
      return;
    }

    setLoading(true);
    const formData = new FormData();

    formData.append("name", product.name);
    formData.append("category", product.category);
    formData.append("price", product.price);
    formData.append("quantity", product.quantity);
    formData.append("description", product.description);

    // Sirf ek office location
    formData.append("officeCountry", product.officeCountry);
    formData.append("officeAddress", product.officeAddress);

    // Existing images (jo delete nahi ki)
    if (product.images.length > 0) {
      formData.append("existingImages", JSON.stringify(product.images));
    }

    // New images
    product.newImages.forEach((file) => {
      formData.append("images", file);
    });

    try {
      await dispatch(updateProduct({ id, data: formData })).unwrap();

      // Refresh list
      dispatch(getProductsBySellerId({ id: user._id, page: 1, limit: 10 }));

      alert("Product updated successfully!");
      navigate("/user-profile/add-product");
    } catch (err) {
      console.error(err);
      alert("Update failed: " + (err.message || "Try again"));
    } finally {
      setLoading(false);
    }
  };

  if (productLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl" />
      </div>
    );
  if (!singleProduct) return <div>Product not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-blue-600"
        >
          <FaArrowLeft /> Back
        </button>

        <h1 className="text-3xl font-bold mb-8">Edit Product</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Images */}
            <div>
              <label className="block font-medium mb-3">
                Product Images (Max 4) -{" "}
                {product.images.length + product.newImages.length}/4
              </label>
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-500">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p>Click to upload new images</p>
              </label>
              {imageError && <p className="text-red-500 mt-2">{imageError}</p>}

              <div className="grid grid-cols-2 gap-4 mt-6">
                {product.images.map((url, i) => (
                  <div key={`old-${i}`} className="relative group">
                    <img
                      src={url}
                      alt=""
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage("old", i)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {product.newImages.map((file, i) => (
                  <div key={`new-${i}`} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage("new", i)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                    <span className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      New
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <input
                name="name"
                value={product.name}
                onChange={handleChange}
                placeholder="Product Name"
                required
                className="w-full px-4 py-3 border rounded-lg"
              />

              <select
                name="category"
                value={product.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg"
              >
                <option value="">Select Category</option>
                {categoryList.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="price"
                  value={product.price}
                  onChange={handleChange}
                  placeholder="Price"
                  required
                  className="px-4 py-3 border rounded-lg"
                />
                <input
                  type="number"
                  name="quantity"
                  value={product.quantity}
                  onChange={handleChange}
                  placeholder="Quantity"
                  required
                  className="px-4 py-3 border rounded-lg"
                />
              </div>

              {/* Office Location - Only One */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="officeCountry"
                  value={product.officeCountry}
                  onChange={handleChange}
                  placeholder="Country"
                  required
                  className="px-4 py-3 border rounded-lg"
                />
                <input
                  name="officeAddress"
                  value={product.officeAddress}
                  onChange={handleChange}
                  placeholder="Full Address"
                  required
                  className="px-4 py-3 border rounded-lg"
                />
              </div>

              <textarea
                name="description"
                value={product.description}
                onChange={handleChange}
                rows="5"
                placeholder="Description"
                required
                className="w-full px-4 py-3 border rounded-lg"
              />

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-70"
                >
                  {loading ? "Updating..." : "Update Product"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-8 py-3 border rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductSeller;
