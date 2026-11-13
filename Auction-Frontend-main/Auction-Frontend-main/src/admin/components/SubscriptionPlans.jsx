import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPlans,
  createPlan,
  updatePlan,
  deletePlan,
  resetSubscriptionState,
} from "../../store/subscriptionplans/subscriptionPlanSlice";
import { Plus, Trash2, X, Check } from "lucide-react";

const SubscriptionPlans = () => {
  const dispatch = useDispatch();
  const { plans, loading, error, success } = useSelector(
    (state) => state.subscriptionPlan,
  );

  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState("all");

  const initialForm = {
    planCode: "",
    name: "",
    description: "",
    userType: "fleetowner",
    durationMonths: 3,
    discountLabel: "",
    features: [""],
  };
  const [formData, setFormData] = useState(initialForm);
  const userTypeLabels = {
    fleetowner: "Vehicle Owner or Fleet Manager",
    advertiser: "Buyer or Marketing Executive",
    wrapper: "Vehicle Wrapping Business",
  };

  const getUserTypeLabel = (type) => {
    if (!type) return "Unknown";
    return (
      userTypeLabels[type.toLowerCase()] ||
      type.charAt(0).toUpperCase() + type.slice(1)
    );
  };
  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setShowForm(false);
      setEditingPlan(null);
      setFormData(initialForm);
      dispatch(resetSubscriptionState());
    }
  }, [success, dispatch]);

  const filteredPlans =
    selectedUserType === "all"
      ? plans
      : plans.filter((plan) => plan.userType === selectedUserType);

  const addFeature = () =>
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));

  const updateFeature = (i, val) => {
    setFormData((prev) => {
      const f = [...prev.features];
      f[i] = val;
      return { ...prev, features: f };
    });
  };

  const removeFeature = (i) =>
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, idx) => idx !== i),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validFeatures = formData.features.filter((f) => f.trim());
    const payload = {
      planCode: formData.planCode.toUpperCase().trim(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      userType: formData.userType,
      durationMonths: Number(formData.durationMonths),
      discountLabel: formData.discountLabel.trim(),
      marketingFeatures:
        validFeatures.length > 0 ? validFeatures : ["Basic Access"],
    };

    if (editingPlan) {
      dispatch(updatePlan({ id: editingPlan._id, planData: payload }));
    } else {
      dispatch(createPlan(payload));
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      planCode: plan.planCode || "",
      name: plan.name || "",
      description: plan.description || "",
      userType: plan.userType || "fleetowner",
      durationMonths: plan.durationMonths || 3,
      discountLabel: plan.discountLabel || "",
      features:
        plan.marketingFeatures?.length > 0 ? [...plan.marketingFeatures] : [""],
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      dispatch(deletePlan(id));
    }
  };

  const openAddForm = () => {
    setEditingPlan(null);
    setFormData(initialForm);
    setShowForm(true);
  };

  if (loading && plans.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-theme-bg">
        <div className="text-2xl font-medium text-purple-600">
          Loading plans...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-theme-bg py-10 px-4 rounded-2xl">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-white">
            Manage Subscription Plans
          </h1>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setSelectedUserType("all")}
              className={`px-6 py-2 rounded-full font-medium transition ${
                selectedUserType === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-theme-bg2 text-white hover:bg-theme-bg"
              }`}
            >
              All Plans
            </button>
            <button
              onClick={() => setSelectedUserType("fleetowner")}
              className={`px-6 py-2 rounded-full font-medium transition ${
                selectedUserType === "fleetowner"
                  ? "bg-purple-600 text-white"
                  : "bg-theme-bg2 text-white hover:bg-theme-bg"
              }`}
            >
              Vehicle Owner or Fleet Manager
            </button>
            <button
              onClick={() => setSelectedUserType("advertiser")}
              className={`px-6 py-2 rounded-full font-medium transition ${
                selectedUserType === "advertiser"
                  ? "bg-purple-600 text-white"
                  : "bg-theme-bg2 text-white hover:bg-theme-bg"
              }`}
            >
              Buyer or Marketing Executive
            </button>
            <button
              onClick={() => setSelectedUserType("wrapper")}
              className={`px-6 py-2 rounded-full font-medium transition ${
                selectedUserType === "wrapper"
                  ? "bg-purple-600 text-white"
                  : "bg-theme-bg2 text-white hover:bg-theme-bg"
              }`}
            >
              Vehicle Wrapping Business
            </button>
          </div>
        </div>

        <button
          onClick={openAddForm}
          className="fixed right-6 top-40 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-2xl transition transform hover:scale-110"
        >
          <Plus size={28} />
        </button>

        {error && (
          <div className="max-w-7xl mx-auto mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          {selectedUserType !== "all" && (
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-white capitalize">
                {getUserTypeLabel(selectedUserType)} Plans
              </h2>
              <p className="text-white mt-2">
                Showing {filteredPlans.length} plan
                {filteredPlans.length !== 1 ? "s" : ""} for {selectedUserType}s
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlans.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-2xl text-white font-medium">
                  {selectedUserType === "all"
                    ? "No plans created yet"
                    : `No plans found for ${selectedUserType}s`}
                </p>
                <p className="text-white mt-3">
                  {selectedUserType === "all"
                    ? "Click the + button to add a new plan"
                    : `Click the + button to add a new plan for ${selectedUserType}s`}
                </p>
              </div>
            ) : (
              filteredPlans.map((plan) => (
                <div
                  key={plan._id}
                  className="bg-theme-bg2 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all relative"
                >
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-full"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        plan.userType === "fleetowner"
                          ? "bg-blue-100 text-blue-700"
                          : plan.userType === "advertiser"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {getUserTypeLabel(plan.userType)}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white pr-10 mt-8">
                    {plan.name}
                  </h3>
                  <code className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded mt-2 inline-block">
                    {plan.planCode}
                  </code>
                  <p className="text-white mt-3 text-sm leading-relaxed">
                    {plan.description}
                  </p>
                  <p className="mt-3 font-semibold text-purple-600">
                    {plan.durationMonths} months
                  </p>

                  {plan.discountLabel && (
                    <span className="inline-block bg-red-500 text-white px-4 py-1 rounded-full text-sm mt-3 font-medium">
                      {plan.discountLabel}%
                    </span>
                  )}

                  <ul className="mt-4 space-y-2">
                    {(plan.marketingFeatures || []).map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-white text-sm"
                      >
                        <Check size={18} className="text-green-500 mt-1" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleEdit(plan)}
                    className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium transition"
                  >
                    Edit Plan
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL FORM — Title ab scroll karega + Placeholder halke gray */}
      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black bg-opacity-70 px-4 overflow-y-auto pt-16">
          <div className="bg-theme-bg2 rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            {/* REMOVED sticky + border-b — ab title bhi scroll karega */}
            <div className="flex justify-between items-center p-6">
              <h2 className="text-2xl font-bold text-white">
                {editingPlan ? "Edit Plan" : "Create New Plan"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-white hover:text-red-600 transition p-1"
              >
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-5">
              {/* Plan Code & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="planCode"
                    className="block text-sm font-medium text-white mb-1"
                  >
                    Plan Code
                  </label>
                  <input
                    id="planCode"
                    required
                    placeholder="e.g. BUDGET, MOST POPULAR"
                    value={formData.planCode}
                    onChange={(e) =>
                      setFormData({ ...formData, planCode: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:border-purple-500 outline-none bg-theme-bg2 text-white placeholder-gray-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="planName"
                    className="block text-sm font-medium text-white mb-1"
                  >
                    Plan Name
                  </label>
                  <input
                    id="planName"
                    required
                    placeholder="e.g. Listing Fees of only $60 per vehicle per month"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:border-purple-500 outline-none bg-theme-bg2 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-white mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  required
                  placeholder="e.g. Our budget option of 3-month Subscription on our PREMIER PLAN"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg focus:border-purple-500 outline-none resize-none bg-theme-bg2 text-white placeholder-gray-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="userType"
                    className="block text-sm font-medium text-white mb-1"
                  >
                    User Type
                  </label>
                  <select
                    id="userType"
                    value={formData.userType}
                    onChange={(e) =>
                      setFormData({ ...formData, userType: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:border-purple-500 outline-none bg-theme-bg2 text-white"
                  >
                    <option value="fleetowner">
                      Vehicle Owner or Fleet Manager
                    </option>
                    <option value="advertiser">
                      Buyer or Marketing Executive
                    </option>
                    <option value="wrapper">Vehicle Wrapping Business</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm font-medium text-white mb-1"
                  >
                    Duration
                  </label>
                  <select
                    id="duration"
                    value={formData.durationMonths}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationMonths: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:border-purple-500 outline-none bg-theme-bg2 text-white"
                  >
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={12}>12 Months</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="discountLabel"
                  className="block text-sm font-medium text-white mb-1"
                >
                  Discount Label (Optional)
                </label>
                <input
                  id="discountLabel"
                  placeholder="e.g. Save 50%"
                  value={formData.discountLabel}
                  onChange={(e) =>
                    setFormData({ ...formData, discountLabel: e.target.value })
                  }
                  className="w-full px-4 py-3 border rounded-lg focus:border-purple-500 outline-none bg-theme-bg2 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Features
                </label>
                {formData.features.map((feat, i) => (
                  <div key={i} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder={`Feature ${i + 1}`}
                      value={feat}
                      onChange={(e) => updateFeature(i, e.target.value)}
                      className="flex-1 px-4 py-3 border rounded-lg focus:border-purple-500 outline-none bg-theme-bg2 text-white placeholder-gray-500"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(i)}
                        className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
                >
                  <Plus size={20} /> Add Feature
                </button>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg disabled:opacity-70"
                >
                  {loading
                    ? "Saving..."
                    : editingPlan
                      ? "Update Plan"
                      : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SubscriptionPlans;
