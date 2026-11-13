import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axiosInstance from "../axiosInstance";
import { useSelector, useDispatch } from "react-redux";
import { getCurrentUser } from "../store/auth/authSlice";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import AddressSelector from "./AddressSelector";
import CountrySpecificZipCode from "./CountrySpecificZipCode";
import {
  FaCreditCard,
  FaTrash,
  FaEdit,
  FaCheckCircle,
  FaTimes,
  FaPlus,
  FaStar,
  FaCreditCard as FaCardIcon,
} from "react-icons/fa";

// Popup Modal Component for Adding Address
const AddAddressModal = ({ isOpen, onClose, onSubmit, user }) => {
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [formData, setFormData] = useState({
    country: user?.country || "",
    state: "",
    city: "",
    postalCode: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCountryChange = (countryObj) => {
    setFormData((prev) => ({
      ...prev,
      country: countryObj.name,
      state: "",
      city: "",
      postalCode: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validation
    const validationErrors = {};
    if (!addressLine1.trim())
      validationErrors.addressLine1 = "Address Line 1 is required";
    if (!formData.country.trim())
      validationErrors.country = "Country is required";
    if (!formData.state.trim()) validationErrors.state = "State is required";
    if (!formData.city.trim()) validationErrors.city = "City is required";
    if (!formData.postalCode.trim())
      validationErrors.postalCode = "Postal/ZIP Code is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    // Convert country name to country code
    const getCountryCode = (countryName) => {
      switch (countryName) {
        case "India":
          return "IN";
        case "United States":
          return "US";
        case "United Kingdom":
          return "GB";
        case "Australia":
          return "AU";
        case "Canada":
          return "CA";
        default:
          return countryName.length === 2 ? countryName : "IN";
      }
    };

    const addressData = {
      line1: addressLine1.trim(),
      line2: addressLine2.trim() || "",
      city: formData.city.trim(),
      state: formData.state.trim(),
      postal_code: formData.postalCode.trim(),
      country: getCountryCode(formData.country),
    };

    try {
      await onSubmit(addressData);
      onClose();
    } catch (error) {
      setErrors({ submit: error.message || "Failed to add address" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#0A1628] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 shadow-2xl border border-gray-700">
        <div className="sticky top-0 bg-[#0A1628] border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Add Billing Address</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="123 Main Street, Apt 4B"
              required
              className="w-full px-5 py-3.5 bg-[#0E294D] border border-gray-600 rounded-lg text-white focus:border-theme-color outline-none"
            />
            {errors.addressLine1 && (
              <p className="text-red-400 text-sm mt-1">{errors.addressLine1}</p>
            )}

            <input
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Apartment, suite, unit, building, floor, etc. (Optional)"
              className="w-full mt-3 px-5 py-3.5 bg-[#0E294D] border border-gray-600 rounded-lg text-white focus:border-theme-color outline-none"
            />
          </div>

          <div className="bg-[#0E294D]/40 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6">
              Location Details *
            </h3>
            <AddressSelector
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              updatePhoneCode={() => {}}
              onCountryChange={handleCountryChange}
            />
            {errors.country && (
              <p className="text-red-400 text-sm mt-2">{errors.country}</p>
            )}
            {errors.state && (
              <p className="text-red-400 text-sm mt-2">{errors.state}</p>
            )}
            {errors.city && (
              <p className="text-red-400 text-sm mt-2">{errors.city}</p>
            )}
          </div>

          <div className="bg-[#0E294D]/40 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6">
              Postal / ZIP Code *
            </h3>
            <CountrySpecificZipCode
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              required={true}
            />
            {errors.postalCode && (
              <p className="text-red-400 text-sm mt-2">{errors.postalCode}</p>
            )}
          </div>

          {errors.submit && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-theme-color to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 transition-all font-semibold"
            >
              {isSubmitting ? "Adding..." : "Add Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Card Management Component
const PaymentMethodManager = ({
  paymentMethods,
  currentDefaultId,
  onSetDefault,
  onDelete,
  onAddNew,
  onEdit,
  loading,
  settingDefault,
  deleting,
}) => {
  const getCardBrandIcon = (brand) => {
    const brandIcons = {
      visa: "💳",
      mastercard: "💳",
      amex: "💳",
      discover: "💳",
      diners: "💳",
      jcb: "💳",
      unionpay: "💳",
    };
    return brandIcons[brand?.toLowerCase()] || "💳";
  };

  const formatCardBrand = (brand) => {
    if (!brand) return "Card";
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  const getCountryNameFromCode = (countryCode) => {
    switch (countryCode) {
      case "IN":
        return "India";
      case "US":
        return "United States";
      case "GB":
        return "United Kingdom";
      case "AU":
        return "Australia";
      case "CA":
        return "Canada";
      default:
        return countryCode;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FaCreditCard className="text-theme-color" /> Your Saved Cards
        </h3>
        <button
          onClick={onAddNew}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm flex items-center gap-2"
        >
          <FaPlus size={14} /> Add New Card
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <svg
            className="animate-spin h-8 w-8 text-theme-color"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className={`bg-[#0E294D]/40 rounded-xl p-5 border ${
                pm.isDefault
                  ? "border-green-500 bg-green-900/10"
                  : "border-gray-700"
              } transition-all hover:border-theme-color/50`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">
                    {getCardBrandIcon(pm.card?.brand)}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold">
                        {formatCardBrand(pm.card?.brand)} •••• {pm.card?.last4}
                      </span>
                      {pm.isDefault && (
                        <span className="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded-full border border-green-500/30 flex items-center gap-1">
                          <FaStar size={10} /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      Expires {String(pm.card?.exp_month).padStart(2, "0")}/
                      {pm.card?.exp_year}
                    </p>
                    {pm.billing_details?.name && (
                      <p className="text-gray-300 text-sm mt-1">
                        {pm.billing_details.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(pm)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 rounded-lg transition-all flex items-center gap-1"
                    title="Edit Card Details"
                  >
                    <FaEdit size={16} /> Update
                  </button>

                  {!pm.isDefault && (
                    <button
                      onClick={() => onSetDefault(pm.id)}
                      disabled={settingDefault}
                      className="px-3 py-1.5 bg-blue-600/20 text-blue-400 text-sm rounded-lg hover:bg-blue-600/30 transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      <FaStar size={12} /> Make Default
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(pm.id)}
                    disabled={deleting}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-all disabled:opacity-50"
                    title="Remove Card"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>

              {pm.billing_details?.address?.line1 && (
                <div className="mt-4 pt-4 border-t border-gray-700 text-sm">
                  <p className="text-gray-400 mb-1 flex items-center gap-1">
                    <FaCheckCircle size={12} /> Billing Address:
                  </p>
                  <p className="text-white pl-4">
                    {pm.billing_details.address.line1}
                    {pm.billing_details.address.line2 &&
                      `, ${pm.billing_details.address.line2}`}
                    <br />
                    {pm.billing_details.address.city},{" "}
                    {pm.billing_details.address.state}{" "}
                    {pm.billing_details.address.postal_code}
                    <br />
                    {getCountryNameFromCode(pm.billing_details.address.country)}
                  </p>
                </div>
              )}
            </div>
          ))}

          {paymentMethods.length === 0 && (
            <div className="text-center py-12 bg-[#0E294D]/20 rounded-xl border border-dashed border-gray-700">
              <FaCreditCard className="text-5xl text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-3">No cards saved yet</p>
              <button
                onClick={onAddNew}
                className="px-6 py-2.5 bg-gradient-to-r from-theme-color to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold"
              >
                Add Your First Card
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CheckoutForm = () => {
  const { user } = useSelector((state) => state.auth);
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Payment Method Display States
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [allPaymentMethods, setAllPaymentMethods] = useState([]);
  const [loadingPaymentMethod, setLoadingPaymentMethod] = useState(true);
  const [loadingCards, setLoadingCards] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [settingDefault, setSettingDefault] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showCardManager, setShowCardManager] = useState(false);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");

  const [formData, setFormData] = useState({
    country: "",
    state: "",
    city: "",
    postalCode: "",
  });

  const [redirectToAuction, setRedirectToAuction] = useState(false);
  const [redirectPath, setRedirectPath] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [addressLoaded, setAddressLoaded] = useState(false);

  // Fetch existing payment method
  useEffect(() => {
    fetchPaymentMethod();
  }, [user]);

  useEffect(() => {
    if (showCardManager) {
      fetchAllPaymentMethods();
    }
  }, [showCardManager]);

  const fetchPaymentMethod = async () => {
    if (!user?._id) {
      setLoadingPaymentMethod(false);
      setShowUpdateForm(true);
      return;
    }

    try {
      setLoadingPaymentMethod(true);
      const config = {
        withCredentials: true,
      };

      const response = await axiosInstance.get(
        "/payments/get-payment-method",
        config,
      );

      if (response.data.success && response.data.paymentMethod) {
        const pm = response.data.paymentMethod;
        setPaymentMethod(pm);
        setShowUpdateForm(false);

        // Pre-fill form with existing data
        if (pm.billing_details) {
          setName(pm.billing_details.name || user.name || user.firstName || "");
          setEmail(pm.billing_details.email || user.email || "");

          // Check for address
          if (pm.billing_details.address) {
            const address = pm.billing_details.address;
            setAddressLine1(address.line1 || "");
            setAddressLine2(address.line2 || "");

            // Convert country code to full name
            const countryCode = address.country;
            let countryName = "";

            switch (countryCode) {
              case "IN":
                countryName = "India";
                break;
              case "US":
                countryName = "United States";
                break;
              case "GB":
                countryName = "United Kingdom";
                break;
              case "AU":
                countryName = "Australia";
                break;
              case "CA":
                countryName = "Canada";
                break;
              default:
                countryName = countryCode || "";
            }

            setFormData({
              country: countryName,
              state: address.state || "",
              city: address.city || "",
              postalCode: address.postal_code || "",
            });
            setAddressLoaded(true);
          } else {
            // No address in Stripe, use user's data
            if (user.country) {
              setFormData((prev) => ({ ...prev, country: user.country }));
            }
            setAddressLoaded(false);
          }
        }
      } else {
        // No payment method found
        resetFormFields();
        setShowUpdateForm(true);
      }
    } catch (error) {
      console.error("Error fetching payment method:", error);
      resetFormFields();
      setShowUpdateForm(true);
    } finally {
      setLoadingPaymentMethod(false);
    }
  };

  const fetchAllPaymentMethods = async () => {
    if (!user?._id) return;

    setLoadingCards(true);
    try {
      const response = await axiosInstance.get(
        "/payments/get-all-payment-methods",
        { withCredentials: true },
      );

      if (response.data.success) {
        setAllPaymentMethods(response.data.paymentMethods || []);
      }
    } catch (error) {
      console.error("Error fetching all payment methods:", error);
      toast.error("Failed to load your cards");
    } finally {
      setLoadingCards(false);
    }
  };

  const resetFormFields = () => {
    setName(user?.name || user?.firstName || "");
    setEmail(user?.email || "");
    setAddressLine1("");
    setAddressLine2("");
    if (user?.country) {
      setFormData({
        country: user.country,
        state: "",
        city: "",
        postalCode: "",
      });
    } else {
      setFormData({
        country: "",
        state: "",
        city: "",
        postalCode: "",
      });
    }
    setErrors({});
  };

  const populateFormWithCard = (card) => {
    if (card.billing_details) {
      setName(card.billing_details.name || user?.name || user?.firstName || "");
      setEmail(card.billing_details.email || user?.email || "");

      if (card.billing_details.address) {
        const address = card.billing_details.address;
        setAddressLine1(address.line1 || "");
        setAddressLine2(address.line2 || "");

        const countryCode = address.country;
        let countryName = "";

        switch (countryCode) {
          case "IN":
            countryName = "India";
            break;
          case "US":
            countryName = "United States";
            break;
          case "GB":
            countryName = "United Kingdom";
            break;
          case "AU":
            countryName = "Australia";
            break;
          case "CA":
            countryName = "Canada";
            break;
          default:
            countryName = countryCode || "";
        }

        setFormData({
          country: countryName,
          state: address.state || "",
          city: address.city || "",
          postalCode: address.postal_code || "",
        });
      }
    }
  };

  useEffect(() => {
    const styleLinkButton = () => {
      const linkButton = document.getElementById("link-manage");
      const linkContainer = document.getElementById("link-manage-container");

      if (linkButton) {
        linkButton.style.color = "white";
        linkButton.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
        linkButton.style.borderColor = "rgba(255, 255, 255, 0.3)";
      }

      if (linkContainer) {
        linkContainer.querySelectorAll("span").forEach((span) => {
          span.style.color = "white";
        });

        linkContainer.querySelectorAll("svg").forEach((svg) => {
          svg.style.fill = "white";
        });
      }
    };

    const checkStripe = setInterval(() => {
      if (document.getElementById("link-manage")) {
        styleLinkButton();
        clearInterval(checkStripe);
      }
    }, 500);

    return () => clearInterval(checkStripe);
  }, []);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const fromParam = searchParams.get("from");

    if (fromParam === "add-auction") {
      setRedirectToAuction(true);
      setRedirectPath("/user-profile/add-auction");
    }
  }, [location]);

  const handleCountryChange = (countryObj) => {
    setFormData((prev) => ({
      ...prev,
      country: countryObj.name,
      state: "",
      city: "",
      postalCode: "",
    }));
  };

  const getCountryCode = (countryName) => {
    switch (countryName) {
      case "India":
        return "IN";
      case "United States":
        return "US";
      case "United Kingdom":
        return "GB";
      case "Australia":
        return "AU";
      case "Canada":
        return "CA";
      default:
        return countryName.length === 2 ? countryName : "IN";
    }
  };

  // Handle adding address only (without updating card)
  const handleAddAddressOnly = async (addressData) => {
    try {
      if (!paymentMethod) {
        throw new Error("No payment method found");
      }

      const response = await axiosInstance.post(
        "/payments/update-billing-address",
        {
          paymentMethodId: paymentMethod.id,
          address: addressData,
        },
        { withCredentials: true },
      );

      if (response.data.success) {
        toast.success("Billing address added successfully");
        await fetchPaymentMethod();
        await fetchAllPaymentMethods();
        setShowAddressModal(false);
      } else {
        throw new Error(response.data.message || "Failed to add address");
      }
    } catch (error) {
      console.error("Error adding address:", error);
      throw error;
    }
  };

  const handleSetDefaultCard = async (paymentMethodId) => {
    setSettingDefault(true);
    try {
      const response = await axiosInstance.post(
        "/payments/set-default-payment-method",
        { paymentMethodId },
        { withCredentials: true },
      );

      toast.success("Default payment method updated");
      await fetchPaymentMethod();
      await fetchAllPaymentMethods();
    } catch (error) {
      console.error("Error setting default card:", error);
      toast.error(
        error.response?.data?.message || "Failed to set default card",
      );
    } finally {
      setSettingDefault(false);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodIdToDelete) => {
    const methodToDelete = allPaymentMethods.find(
      (pm) => pm.id === paymentMethodIdToDelete,
    );
    const cardDisplay = methodToDelete?.card
      ? `${methodToDelete.card.brand} •••• ${methodToDelete.card.last4}`
      : "this card";

    if (!window.confirm(`Are you sure you want to remove ${cardDisplay}?`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await axiosInstance.delete(
        "/payments/delete-payment-method",
        {
          withCredentials: true,
          data: { paymentMethodId: paymentMethodIdToDelete },
        },
      );

      toast.success(
        response.data.message || "Payment method removed successfully",
      );

      await fetchAllPaymentMethods();
      await fetchPaymentMethod();

      if (response.data.remainingPaymentMethods === 0) {
        setPaymentMethod(null);
        setShowUpdateForm(true);
        setShowCardManager(false);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error.response?.data?.message || "Failed to remove payment method",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (event, action = "add") => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    if (!stripe || !elements) {
      toast.error("Stripe not initialized");
      setIsSubmitting(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    // Validation
    const validationErrors = {};

    if (!name.trim()) validationErrors.name = "Name is required";
    if (!email.trim()) validationErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      validationErrors.email = "Email is invalid";
    if (!addressLine1.trim())
      validationErrors.addressLine1 = "Address Line 1 is required";
    if (!formData.country.trim())
      validationErrors.country = "Country is required";
    if (!formData.state.trim()) validationErrors.state = "State is required";
    if (!formData.city.trim()) validationErrors.city = "City is required";
    if (!formData.postalCode.trim())
      validationErrors.postalCode = "Postal/ZIP Code is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const countryCode = getCountryCode(formData.country);

      const { error: createError, paymentMethod: newPaymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
          billing_details: {
            name: name.trim(),
            email: email.trim(),
            address: {
              line1: addressLine1.trim(),
              line2: addressLine2.trim() || null,
              city: formData.city.trim(),
              state: formData.state.trim(),
              postal_code: formData.postalCode.trim(),
              country: countryCode,
            },
          },
        });

      if (createError) {
        toast.error(createError.message || "Card validation failed");
        setIsSubmitting(false);
        return;
      }

      const endpoint =
        action === "add"
          ? "/payments/add-payment-method"
          : "/payments/update-payment-method";

      const response = await axiosInstance.post(
        endpoint,
        {
          paymentMethodId: newPaymentMethod.id,
          billingDetails: {
            name: name.trim(),
            email: email.trim(),
            address: {
              line1: addressLine1.trim(),
              line2: addressLine2.trim() || "",
              city: formData.city.trim(),
              state: formData.state.trim(),
              postal_code: formData.postalCode.trim(),
              country: countryCode,
            },
          },
        },
        { withCredentials: true },
      );

      if (response.data.success) {
        toast.success(
          action === "add"
            ? "New card added successfully"
            : "Payment method updated successfully",
        );

        if (cardElement) {
          cardElement.clear();
        }

        await dispatch(getCurrentUser());
        await fetchPaymentMethod();
        await fetchAllPaymentMethods();

        setShowAddCardForm(false);
        setShowUpdateForm(false);
        setEditingCard(null);
        resetFormFields();

        if (redirectToAuction && redirectPath) {
          navigate(redirectPath);
        } else {
          let redirectTo = "/user-profile/payment-method";
          const searchParams = new URLSearchParams(location.search);
          const redirectParam = searchParams.get("redirect");
          if (redirectParam) {
            redirectTo = redirectParam;
          } else if (location.state?.auctionId) {
            const auctionId = location.state.auctionId;
            const fromPage = location.state.from || "";
            redirectTo = fromPage.includes("single-fleet-auction-detail")
              ? `/single-fleet-auction-detail/${auctionId}`
              : `/single-auction-detail/${auctionId}`;
          }
          navigate(redirectTo, { replace: true });
        }
      } else {
        toast.error(
          response.data.message || `Failed to ${action} payment method`,
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCardBrandIcon = (brand) => {
    const brandIcons = {
      visa: "💳",
      mastercard: "💳",
      amex: "💳",
      discover: "💳",
      diners: "💳",
      jcb: "💳",
      unionpay: "💳",
    };
    return brandIcons[brand?.toLowerCase()] || "💳";
  };

  const formatCardBrand = (brand) => {
    if (!brand) return "Card";
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  const getCountryNameFromCode = (countryCode) => {
    switch (countryCode) {
      case "IN":
        return "India";
      case "US":
        return "United States";
      case "GB":
        return "United Kingdom";
      case "AU":
        return "Australia";
      case "CA":
        return "Canada";
      default:
        return countryCode;
    }
  };

  const handleCancelUpdate = () => {
    setShowUpdateForm(false);
    setShowAddCardForm(false);
    setEditingCard(null);
    setErrors({});
    resetFormFields();
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    populateFormWithCard(card);
    setShowAddCardForm(false);
    setShowUpdateForm(true);
    setShowCardManager(false);
  };

  if (loadingPaymentMethod) {
    return (
      <div className="px-7 pt-4 pb-10 w-full bg-theme-bg rounded-2xl">
        <div className="flex items-center justify-center py-12">
          <svg
            className="animate-spin h-10 w-10 text-theme-color"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
    );
  }

  // Card Manager View
  if (showCardManager) {
    return (
      <div className="px-7 pt-4 pb-10 w-full bg-theme-bg rounded-2xl">
        <div className="flex items-center justify-between border-b border-border-info-color pb-4 mb-8">
          <h1 className="text-white font-bold text-2xl flex items-center gap-2">
            <FaCreditCard className="text-theme-color" /> Manage Payment Methods
          </h1>
          <button
            onClick={() => setShowCardManager(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
          >
            Back
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <PaymentMethodManager
            paymentMethods={allPaymentMethods}
            currentDefaultId={paymentMethod?.id}
            onSetDefault={handleSetDefaultCard}
            onDelete={handleDeletePaymentMethod}
            onAddNew={() => {
              setShowCardManager(false);
              setShowAddCardForm(true);
              resetFormFields();
            }}
            onEdit={handleEditCard}
            loading={loadingCards}
            settingDefault={settingDefault}
            deleting={deleting}
          />

          <div className="mt-6 bg-blue-900/20 rounded-lg p-5 border border-blue-800/30">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <FaStar className="text-yellow-400" /> About Payment Methods
            </h4>
            <ul className="text-gray-300 text-sm space-y-2 list-disc pl-5">
              <li>You can add multiple credit/debit cards</li>
              <li>Set your preferred card as the default payment method</li>
              <li>You cannot delete your only card - add a new card first</li>
              <li>
                Your default card will be used for all auction deposits and
                payments
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Add Card Form
  if (showAddCardForm) {
    return (
      <div className="px-7 pt-4 pb-10 w-full bg-theme-bg rounded-2xl">
        <div className="flex items-center justify-between border-b border-border-info-color pb-4 mb-8">
          <h1 className="text-white font-bold text-2xl flex items-center gap-2">
            <FaPlus className="text-green-400" /> Add New Card
          </h1>
          <button
            onClick={handleCancelUpdate}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
        </div>

        <form
          onSubmit={(e) => handleSubmit(e, "add")}
          className="max-w-3xl mx-auto space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name on Card *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full px-5 py-3.5 bg-[#0E294D] border border-gray-600 rounded-lg text-white focus:border-theme-color outline-none"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                className="w-full px-5 py-3.5 bg-[#0E294D] border border-gray-600 rounded-lg text-white focus:border-theme-color outline-none"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="123 Main Street, Apt 4B"
              required
              className="w-full px-5 py-3.5 bg-[#0E294D] border border-gray-600 rounded-lg text-white focus:border-theme-color outline-none"
            />
            {errors.addressLine1 && (
              <p className="text-red-400 text-sm mt-1">{errors.addressLine1}</p>
            )}

            <input
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Apartment, suite, unit, building, floor, etc. (Optional)"
              className="w-full mt-3 px-5 py-3.5 bg-[#0E294D] border border-gray-600 rounded-lg text-white focus:border-theme-color outline-none"
            />
          </div>

          <div className="bg-[#0E294D]/40 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6">
              Billing Location *
            </h3>
            <AddressSelector
              key={formData.country}
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              updatePhoneCode={() => {}}
              onCountryChange={handleCountryChange}
            />
            {errors.country && (
              <p className="text-red-400 text-sm mt-2">{errors.country}</p>
            )}
            {errors.state && (
              <p className="text-red-400 text-sm mt-2">{errors.state}</p>
            )}
            {errors.city && (
              <p className="text-red-400 text-sm mt-2">{errors.city}</p>
            )}
          </div>

          <div className="bg-[#0E294D]/40 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6">
              Postal / ZIP Code *
            </h3>
            <CountrySpecificZipCode
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              required={true}
            />
            {errors.postalCode && (
              <p className="text-red-400 text-sm mt-2">{errors.postalCode}</p>
            )}
          </div>

          <div className="p-3 bg-theme-bg2 rounded-md border border-border-info-color text-white">
            <CardElement
              options={{
                iconStyle: "solid",
                style: {
                  base: {
                    fontSize: "17px",
                    color: "white",
                    iconColor: "white",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                    ":-webkit-autofill": {
                      color: "white",
                    },
                  },
                  invalid: {
                    color: "#ff6b6b",
                    iconColor: "#ff6b6b",
                  },
                },
                hidePostalCode: true,
              }}
            />
            <p className="text-gray-400 text-sm mt-2">
              Enter your new card details. This card will be added to your
              account.
            </p>
          </div>

          <button
            type="submit"
            disabled={!stripe || isSubmitting}
            className="w-full py-5 text-xl font-bold rounded-2xl text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-60 shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Adding Card...
              </>
            ) : (
              <>Save Card</>
            )}
          </button>
        </form>
      </div>
    );
  }

  if (paymentMethod && !showUpdateForm) {
    const { card, billing_details } = paymentMethod;
    const address = billing_details?.address || {};

    return (
      <>
        <AddAddressModal
          isOpen={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          onSubmit={handleAddAddressOnly}
          user={user}
        />

        <div className="px-7 pt-4 pb-10 w-full bg-theme-bg rounded-2xl">
          <div className="flex items-center justify-between border-b border-border-info-color pb-4 mb-8">
            <h1 className="text-white font-bold text-2xl flex items-center gap-2">
              <FaCreditCard className="text-theme-color" /> Payment Methods
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCardManager(true);
                  fetchAllPaymentMethods();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                <FaCreditCard /> Manage Cards
              </button>
            </div>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-[#0E294D]/40 rounded-2xl p-8 shadow-2xl border border-green-500/30">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">
                    {getCardBrandIcon(card?.brand)}
                  </span>
                  <span className="text-white font-semibold text-lg">
                    {formatCardBrand(card?.brand)} •••• {card?.last4}
                  </span>
                </div>
                <span className="px-3 py-1.5 bg-green-600/20 text-green-400 text-sm rounded-full border border-green-500/30 flex items-center gap-1">
                  <FaStar size={12} /> Default
                </span>
              </div>

              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Card Number</p>
                <p className="text-white text-2xl font-mono tracking-wider">
                  •••• •••• •••• {card?.last4}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Expires</p>
                  <p className="text-white font-medium">
                    {String(card?.exp_month).padStart(2, "0")}/{card?.exp_year}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Cardholder</p>
                  <p className="text-white font-medium truncate">
                    {billing_details?.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#0E294D]/40 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FaCheckCircle className="text-theme-color" /> Billing
                  Information
                </h3>
                {!addressLoaded && (
                  <span className="text-yellow-400 text-sm flex items-center gap-1">
                    <FaCheckCircle /> Address not saved
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {billing_details?.email && (
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="text-gray-400">Email</span>
                    <span className="text-white">{billing_details.email}</span>
                  </div>
                )}

                {address.line1 ? (
                  <>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Address</span>
                      <span className="text-white text-right">
                        {address.line1}
                        {address.line2 && <>, {address.line2}</>}
                      </span>
                    </div>

                    {address.city && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">City</span>
                        <span className="text-white">{address.city}</span>
                      </div>
                    )}

                    {address.state && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">State</span>
                        <span className="text-white">{address.state}</span>
                      </div>
                    )}

                    {address.postal_code && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">Postal Code</span>
                        <span className="text-white">
                          {address.postal_code}
                        </span>
                      </div>
                    )}

                    {address.country && (
                      <div className="flex justify-between py-2">
                        <span className="text-gray-400">Country</span>
                        <span className="text-white">
                          {getCountryNameFromCode(address.country)}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-400 mb-3">
                      No billing address saved for this card
                    </p>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="px-6 py-2.5 bg-gradient-to-r from-theme-color to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold"
                    >
                      Add Billing Address
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-900/20 rounded-lg p-5 border border-blue-800/30">
              <div className="flex items-start gap-3">
                <FaCreditCard className="text-blue-400 mt-1" />
                <div>
                  <p className="text-white font-semibold mb-1">
                    Multiple Cards Supported
                  </p>
                  <p className="text-gray-300 text-sm">
                    You can add multiple credit/debit cards and choose your
                    default payment method.
                    <button
                      onClick={() => {
                        setShowCardManager(true);
                        fetchAllPaymentMethods();
                      }}
                      className="ml-2 text-blue-400 hover:text-blue-300 underline font-medium"
                    >
                      Manage your cards
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show Update/Add Form
  return (
    <div className="px-7 pt-4 pb-10 w-full bg-theme-bg rounded-2xl">
      <div className="flex items-center justify-between border-b border-border-info-color pb-4 mb-8">
        <h1 className="text-white font-bold text-2xl flex items-center gap-2">
          <FaEdit className="text-theme-color" />
          {editingCard
            ? "Update Card"
            : paymentMethod
              ? "Update Payment Method"
              : "Add Payment Method"}
        </h1>
        <div className="flex gap-3">
          {paymentMethod && (
            <button
              onClick={handleCancelUpdate}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
          )}
          {!paymentMethod && (
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
            >
              Back
            </button>
          )}
        </div>
      </div>

      <form
        onSubmit={(e) => handleSubmit(e, paymentMethod ? "update" : "add")}
        className="max-w-3xl mx-auto space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name on Card *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full px-5 py-3.5 bg-[#0E294D] border border-gray-600 rounded-lg text-white focus:border-theme-color outline-none"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className="w-full px-5 py-3.5 bg-[#0E294D] border border-gray-600 rounded-lg text-white focus:border-theme-color outline-none"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Street Address *
          </label>
          <input
            type="text"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder="123 Main Street, Apt 4B"
            required
            className="w-full px-5 py-3.5 bg-[#0E294D] border border-gray-600 rounded-lg text-white focus:border-theme-color outline-none"
          />
          {errors.addressLine1 && (
            <p className="text-red-400 text-sm mt-1">{errors.addressLine1}</p>
          )}

          <input
            type="text"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            placeholder="Apartment, suite, unit, building, floor, etc. (Optional)"
            className="w-full mt-3 px-5 py-3.5 bg-[#0E294D] border border-gray-600 rounded-lg text-white focus:border-theme-color outline-none"
          />
        </div>

        <div className="bg-[#0E294D]/40 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-6">
            Billing Location *
          </h3>
          <AddressSelector
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            updatePhoneCode={() => {}}
            onCountryChange={handleCountryChange}
          />
          {errors.country && (
            <p className="text-red-400 text-sm mt-2">{errors.country}</p>
          )}
          {errors.state && (
            <p className="text-red-400 text-sm mt-2">{errors.state}</p>
          )}
          {errors.city && (
            <p className="text-red-400 text-sm mt-2">{errors.city}</p>
          )}
        </div>

        <div className="bg-[#0E294D]/40 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-6">
            Postal / ZIP Code *
          </h3>
          <CountrySpecificZipCode
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            required={true}
          />
          {errors.postalCode && (
            <p className="text-red-400 text-sm mt-2">{errors.postalCode}</p>
          )}
        </div>

        <div className="p-3 bg-theme-bg2 rounded-md border border-border-info-color text-white">
          <CardElement
            options={{
              iconStyle: "solid",
              style: {
                base: {
                  fontSize: "17px",
                  color: "white",
                  iconColor: "white",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                  ":-webkit-autofill": {
                    color: "white",
                  },
                },
                invalid: {
                  color: "#ff6b6b",
                  iconColor: "#ff6b6b",
                },
              },
              hidePostalCode: true,
            }}
          />
          <p className="text-gray-400 text-sm mt-2">
            {editingCard
              ? "To Update your current card, please enter the NEW card details below. Your old card will be removed after saving."
              : paymentMethod
                ? "Enter new card details to Update your current card"
                : "Enter your card details to add this payment method to your account"}
          </p>

          {editingCard && (
            <p className="text-yellow-400 text-sm mt-2 font-medium">
              Note: For security reasons, we cannot show your previous card
              number. You need to enter the full details again.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!stripe || isSubmitting}
          className="w-full py-5 text-xl font-bold rounded-2xl text-white bg-gradient-to-r from-theme-color to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </>
          ) : paymentMethod ? (
            "Update Payment Method"
          ) : (
            "Save Payment Method"
          )}
        </button>
      </form>
    </div>
  );
};

const PaymentMethod = () => {
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
        setStripePromise(stripe);
      } catch (error) {
        console.error("Failed to load Stripe:", error);
        toast.error("Failed to initialize payment system");
      }
    };
    initializeStripe();
  }, []);

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default PaymentMethod;
