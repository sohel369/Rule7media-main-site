import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaSave,
  FaTimes,
  FaGlobe,
  FaRegEdit,
  FaPlusCircle,
} from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import {
  getAllPRO,
  deleteSingleProductById,
  updateSingleProduct,
} from "../../store/product/ProductSlice";

const ProductPage = () => {
  const [editId, setEditId] = useState(null);
  const [editProduct, setEditProduct] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const dispatch = useDispatch();
  const { product, isLoading, isError, totalPages } = useSelector(
    (state) => state.product,
  );

  useEffect(() => {
    dispatch(getAllPRO({ page: currentPage, limit }));
  }, [dispatch, currentPage, limit]);

  // Updated to use Redux
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?",
    );
    if (!confirmDelete) return;

    try {
      await dispatch(deleteSingleProductById(id)).unwrap();
      dispatch(getAllPRO({ page: currentPage, limit }));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEdit = (product) => {
    setEditId(product._id);
    setEditProduct({
      ...product,
      officeLocations: product.officeLocations || [],
    });
  };

  const handleCancel = () => {
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleOfficeLocationChange = (index, key, value) => {
    setEditProduct((prev) => {
      const updatedLocations = prev.officeLocations
        ? [...prev.officeLocations]
        : [];
      updatedLocations[index] = { ...updatedLocations[index], [key]: value };
      return { ...prev, officeLocations: updatedLocations };
    });
  };

  // Updated to use Redux
  const handleUpdate = async () => {
    try {
      await dispatch(
        updateSingleProduct({
          id: editId,
          data: editProduct,
        }),
      ).unwrap();
      dispatch(getAllPRO({ page: currentPage, limit }));
      setEditId(null);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Product List</h1>
      <Link
        to="/admin/add-product/add"
        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition inline-flex items-center gap-1"
      >
        <FaPlusCircle className="text-sm" /> Add Product
      </Link>

      {isLoading ? (
        <p className="mt-4 text-center text-gray-500">Loading products...</p>
      ) : !product || product.length === 0 ? (
        <p className="mt-4 text-center text-gray-500">No products available.</p>
      ) : (
        <table className="w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2 border">Image</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Quantity</th>
              <th className="p-2 border">Office Locations</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(product) && product.length > 0 ? (
              product.map((product) => (
                <tr key={product._id} className="border">
                  <td className="p-2 border">
                    {product.image && product.image.length > 0 ? (
                      <img
                        src={product.image[0]}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        No image
                      </div>
                    )}
                  </td>
                  <td className="p-2 border">
                    {editId === product._id ? (
                      <input
                        type="text"
                        name="name"
                        value={editProduct.name}
                        onChange={handleChange}
                        className="border p-1 w-full"
                      />
                    ) : (
                      product.name
                    )}
                  </td>
                  <td className="p-2 border">
                    {editId === product._id ? (
                      <input
                        type="text"
                        name="category"
                        value={editProduct.category}
                        onChange={handleChange}
                        className="border p-1 w-full"
                      />
                    ) : (
                      product.category
                    )}
                  </td>
                  <td className="p-2 border">
                    {editId === product._id ? (
                      <input
                        type="number"
                        name="price"
                        value={editProduct.price}
                        onChange={handleChange}
                        className="border p-1 w-full"
                      />
                    ) : (
                      `$${product.price}`
                    )}
                  </td>
                  <td className="p-2 border">
                    {editId === product._id ? (
                      <input
                        type="number"
                        name="quantity"
                        value={editProduct.quantity}
                        onChange={handleChange}
                        className="border p-1 w-full"
                      />
                    ) : (
                      product.quantity
                    )}
                  </td>
                  <td className="p-2 border">
                    {editId === product._id ? (
                      <ul>
                        {editProduct.officeLocations.map((office, index) => (
                          <li key={index} className="mb-2">
                            <span className="flex items-center gap-2 font-bold">
                              <FaGlobe />
                              <input
                                type="text"
                                value={office.country}
                                onChange={(e) =>
                                  handleOfficeLocationChange(
                                    index,
                                    "country",
                                    e.target.value,
                                  )
                                }
                                className="border p-1 w-full"
                              />
                            </span>
                            <input
                              type="text"
                              value={office.address}
                              onChange={(e) =>
                                handleOfficeLocationChange(
                                  index,
                                  "address",
                                  e.target.value,
                                )
                              }
                              className="border p-1 w-full ml-6"
                            />
                          </li>
                        ))}
                      </ul>
                    ) : product.officeLocations &&
                      product.officeLocations.length > 0 ? (
                      <ul>
                        {product.officeLocations.map((office, index) => (
                          <li key={index} className="mb-2">
                            <span className="flex items-center gap-2 font-bold">
                              <FaGlobe /> {office.country}
                            </span>
                            <span className="ml-6">{office.address}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "No office locations"
                    )}
                  </td>
                  <td className="p-2 border">
                    {editId === product._id ? (
                      <textarea
                        name="description"
                        value={editProduct.description}
                        onChange={handleChange}
                        className="border p-1 w-full"
                      />
                    ) : (
                      product.description
                    )}
                  </td>
                  <td className="p-2 border flex space-x-2">
                    {editId === product._id ? (
                      <>
                        <button
                          onClick={handleUpdate}
                          className="inline mt-[-3px] text-theme-color hover:text-white hover:bg-theme-color rounded-lg border-2 border-theme-color px-2 py-[5px] transition-all"
                        >
                          <FaSave /> Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="inline mt-[-3px] text-color-danger hover:text-white hover:bg-color-danger rounded-lg border-2 border-color-danger px-[6px] py-[3px] transition-all"
                        >
                          <FaTimes /> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(product)}>
                          <FaRegEdit
                            size={38}
                            className="inline mt-[-3px] text-theme-color hover:text-white hover:bg-theme-color rounded-lg border-2 border-theme-color px-2 py-[5px] transition-all"
                          />
                        </button>
                        <button onClick={() => handleDelete(product._id)}>
                          <MdDeleteForever
                            size={38}
                            className="inline mt-[-3px] text-color-danger hover:text-white hover:bg-color-danger rounded-lg border-2 border-color-danger px-[6px] py-[3px] transition-all"
                          />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded">
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))
          }
          disabled={currentPage === totalPages || !totalPages}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductPage;
