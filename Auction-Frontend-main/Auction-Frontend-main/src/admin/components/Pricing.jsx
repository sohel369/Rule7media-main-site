import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPlanes,
  addPlane,
  updatePlane,
  deletePlane,
} from "../../store/pricing/pricingSlice";
import { toast } from "react-toastify";

const AdminPricing = () => {
  const dispatch = useDispatch();
  const { planes, loading, error } = useSelector((state) => state.planes);

  const initialForm = {
    title: "",
    badge: "",
    subtitle: "",
    priceId: "",
    plan: "",
    features: [""],
  };

  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  useEffect(() => {
    dispatch(fetchPlanes());
  }, [dispatch]);

  const handleChange = (e, index = null) => {
    if (index !== null) {
      const newFeatures = [...form.features];
      newFeatures[index] = e.target.value;
      setForm({ ...form, features: newFeatures });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const addFeature = () =>
    setForm({ ...form, features: [...form.features, ""] });
  const removeFeature = (index) =>
    setForm({ ...form, features: form.features.filter((_, i) => i !== index) });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.features.some((f) => f.trim() === "")) {
      alert("Please fill in all features or remove empty ones.");
      return;
    }
    if (editId) {
      dispatch(updatePlane({ id: editId, plan: form })).then(() => {
        toast.success("Plan updated successfully!");
        dispatch(fetchPlanes());
      });
    } else {
      dispatch(addPlane(form)).then(() => {
        toast.success("Plan added successfully!");
        dispatch(fetchPlanes());
      });
    }
    setIsModalOpen(false);
    setForm(initialForm);
    setEditId(null);
  };

  const openAddModal = () => {
    setForm(initialForm);
    setEditId(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setForm({
      title: plan.title || "",
      badge: plan.badge || "",
      subtitle: plan.subtitle || "",
      priceId: plan.priceId || "",
      plan: plan.plan || "",
      features: Array.isArray(plan.features) ? [...plan.features] : [""],
    });
    setEditId(plan._id);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      dispatch(deletePlane(id)).then(() => {
        toast.success("Plan deleted successfully!");
        dispatch(fetchPlanes());
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
          Manage Pricing Plans
        </h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            Error: {error}
          </div>
        )}

        {/* Add New Plan Button */}
        <div className="mb-8 text-center">
          <button
            onClick={openAddModal}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
            aria-label="Add New Plan"
          >
            Add New Plan
          </button>
        </div>

        {/* Plans List */}
        <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
          All Plans
        </h3>
        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : Array.isArray(planes) && planes.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {planes.map((plan) => (
              <div
                key={plan._id}
                className="relative bg-indigo-900 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Badge */}
                {plan.badge && (
                  <span className="absolute top-4 right-4 bg-yellow-400 text-black font-bold px-3 py-1 rounded-full text-sm">
                    {plan.badge}
                  </span>
                )}

                {/* Title */}
                <h4 className="bg-orange-500 px-4 py-2 rounded-md text-sm font-bold uppercase mb-2 inline-block">
                  {plan.title || "No Title"}
                </h4>
                <h4 className="text-lg font-semibold mb-1">
                  {plan.priceId || "No Price Id"}
                </h4>
                {/* Subtitle */}
                <p className="text-lg font-semibold mb-1">
                  {plan.subtitle || ""}
                </p>

                {/* Plan Description */}
                <p className="text-sm mb-4 opacity-80">
                  {plan.plan || "Unnamed Plan"}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {Array.isArray(plan.features) &&
                    plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start text-sm">
                        <svg
                          className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                </ul>
                {/* Admin Actions */}
                <div className="flex justify-between gap-2">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="flex-1 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600"
                    aria-label="Edit Plan"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="flex-1 px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600"
                    aria-label="Delete Plan"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">No plans available</div>
        )}
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] overflow-y-auto">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full m-4 relative z-[10000]">
            <h3 className="text-xl font-bold mb-4">
              {modalMode === "edit" ? "Edit Plan" : "Add New Plan"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title (e.g., BUDGET)
                </label>
                <input
                  name="title"
                  placeholder="Title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Plan Title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Badge (e.g., Save 23%)
                </label>
                <input
                  name="badge"
                  placeholder="Badge"
                  value={form.badge}
                  onChange={handleChange}
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Plan Badge"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subtitle (e.g., Listing Fees of Only $240 per campaign per
                  month)
                </label>
                <input
                  name="subtitle"
                  placeholder="Subtitle"
                  value={form.subtitle}
                  onChange={handleChange}
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Plan Subtitle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price ID{" "}
                </label>
                <input
                  name="priceId"
                  placeholder="priceId"
                  value={form.priceId}
                  onChange={handleChange}
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="price Id"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Plan Description (e.g., Our budget option of 3-month
                  Subscription on our PREMIER PLAN)
                </label>
                <input
                  name="plan"
                  placeholder="Plan Description"
                  value={form.plan}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Plan Description"
                />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Features
                </h4>
                {form.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 mt-2">
                    <input
                      value={f}
                      onChange={(e) => handleChange(e, i)}
                      className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      aria-label={`Feature ${i + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(i)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      aria-label="Remove Feature"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  aria-label="Add Feature"
                >
                  Add Feature
                </button>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  aria-label={modalMode === "edit" ? "Update Plan" : "Add Plan"}
                >
                  {modalMode === "edit" ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPricing;
