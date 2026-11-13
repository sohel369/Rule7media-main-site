import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories } from "../../store/category/categorySlice";
import { createProducts } from "../../store/product/ProductSlice";

const AddProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [product, setProduct] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
    images: [],
    officeLocations: [],
  });

  // Fetch categories from Redux store
  const { categories, isLoading, isError, message } = useSelector(
    (state) => state.category,
  );

  const categoryList = categories?.data || categories || [];

  // Fetch all categories on component mount
  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files); // Convert FileList to Array
    setProduct((prev) => ({
      ...prev,
      images: [...prev.images, ...files], // Append new images
    }));
  };
  const handleOfficeSelect = (e) => {
    const selectedOffice = offices.find(
      (office) => office.name === e.target.value,
    );
    if (selectedOffice) {
      const [country, address] = selectedOffice.name.split(" - ");
      setProduct({
        ...product,
        officeLocations: [{ country, address }],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("category", product.category);
    formData.append("price", product.price);
    formData.append("quantity", product.quantity);
    formData.append("description", product.description);
    product.images.forEach((image) => {
      formData.append("images", image); // Append all images
    });

    product.officeLocations.forEach((location, index) => {
      formData.append(`officeLocations[${index}][country]`, location.country);
      formData.append(`officeLocations[${index}][address]`, location.address);
    });

    dispatch(createProducts(formData))
      .unwrap()
      .then(() => {
        navigate("/admin/add-product");
      })
      .catch((error) => {
        console.error("Error adding product:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const offices = [
    { id: 1, name: "United States - 307 W 38th St, New York, NY 10018, USA" },
    {
      id: 2,
      name: "Canada - 5307 Victoria Drive, Vancouver, BC V5P 3V6, Canada",
    },
    {
      id: 3,
      name: "Australia - 6106/6 Marina Promenade, Paradise Point, Queensland 4216, Australia",
    },
    {
      id: 4,
      name: "China - Changanqu, Wanke Mianhua 15-1912, 710119 Xi'an (Shaanxi), China",
    },
    {
      id: 5,
      name: "Japan - 7F Fuji Building 40, 15-14 Sakuragaokacho, Shibuya-ku, Tokyo, 150-0031, Japan",
    },
    {
      id: 6,
      name: "India - 218, 2nd Floor, Unitech Arcadia Building, 122018 Gurgaon (HR), India",
    },
    {
      id: 7,
      name: "Thailand - No.8 Narathiwas Rajanagarindra Road, 10120 Bangkok, Thailand",
    },
    {
      id: 8,
      name: "Indonesia - Menara Cakrawala, 9th floor, North Wing, Unit 904, 10340 Central Jakarta (JK), Indonesia",
    },
    { id: 9, name: "Spain - Calle Purisima 5, 46540 El Puig, V, Spain" },
    {
      id: 10,
      name: "France - Société AirSelli, 2 Rue Alexandre Ribot, Nogent-sur-Oise 60180, France",
    },
    { id: 11, name: "United Kingdom - 128 City Road, London, EC1V 2NX, UK" },
  ];

  return (
    <div className="p-5">
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white bg-opacity-80 z-50">
          <FaSpinner className="text-4xl text-blue-500 animate-spin" />
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 shadow-md rounded-md"
      >
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          onChange={handleChange}
          required
          className="border p-2 w-full mb-2"
        />

        <select
          required
          className="border p-2 w-full mb-2"
          onChange={(e) => setProduct({ ...product, category: e.target.value })}
        >
          <option value="">Select Category</option>
          {isLoading ? (
            <option disabled>Loading categories...</option>
          ) : isError ? (
            <option disabled>{message || "Error loading categories"}</option>
          ) : categoryList.length > 0 ? (
            categoryList.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))
          ) : (
            <option disabled>No categories available</option>
          )}
        </select>

        <input
          type="number"
          name="price"
          placeholder="Price"
          onChange={handleChange}
          required
          className="border p-2 w-full mb-2"
        />

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          onChange={handleChange}
          required
          className="border p-2 w-full mb-2"
        />

        <select
          name="officeLocation"
          onChange={handleOfficeSelect}
          required
          className="border p-2 w-full mb-2"
        >
          <option value="">Select Office Location</option>
          {offices.map((office) => (
            <option key={office.id} value={office.name}>
              {office.name}
            </option>
          ))}
        </select>

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          required
          className="border p-2 w-full mb-2"
        ></textarea>

        <input
          type="file"
          accept="image/*"
          multiple // Allow multiple file selection
          onChange={handleImageUpload}
          className="border p-2 w-full mb-2"
        />

        {/* Show selected images */}
        <div className="flex gap-2 flex-wrap">
          {product.images.map((image, index) => (
            <img
              key={index}
              src={URL.createObjectURL(image)}
              alt={`preview-${index}`}
              className="w-20 h-20 object-cover rounded-md"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
