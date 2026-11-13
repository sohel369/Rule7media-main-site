import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getContactInfo,
  updateContactInfo,
  CreateContactInfo,
  deleteContactInfo,
} from "../../store/contact/contactSlice";
import { toast } from "react-toastify";

// Memoized InputField component to prevent re-creation
const InputField = React.memo(
  ({ label, name, type = "text", value, onChange, formErrors }) => (
    <div>
      <label className="block text-sm font-medium text-white mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-theme-bg2 text-white placeholder-gray-400 ${
          formErrors[name] ? "border-red-500" : "border-gray-300"
        }`}
        placeholder={`Enter ${label.toLowerCase()}`}
        aria-invalid={formErrors[name] ? "true" : "false"}
        aria-describedby={formErrors[name] ? `${name}-error` : undefined}
      />
      {formErrors[name] && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-500">
          {formErrors[name]}
        </p>
      )}
    </div>
  ),
);

// Memoized ModalContent component for stable modal rendering
const ModalContent = React.memo(
  ({ isOpen, onClose, title, children, onSubmit, isLoading }) => {
    if (!isOpen) return null;
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="bg-theme-bg rounded-xl p-6 w-full max-w-lg shadow-2xl">
          <h2
            id="modal-title"
            className="text-xl sm:text-2xl font-bold text-white mb-6"
          >
            {title}
          </h2>
          {children}
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-theme-bg2 hover:bg-theme-bg text-white rounded-lg transition-colors"
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={isLoading}
              aria-label="Submit"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  },
);

const UpdateContactInfo = () => {
  const dispatch = useDispatch();
  const { contact, isLoading } = useSelector((state) => state.contactInfo);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    officeAddress: "",
    country: "",
    phone: "",
    email: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Prevent body scroll when modals are open and focus first input
  useEffect(() => {
    if (isCreateModalOpen || isEditModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCreateModalOpen, isEditModalOpen]);

  // Fetch contact info on mount
  useEffect(() => {
    dispatch(getContactInfo());
  }, [dispatch]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.email.includes("@")) errors.email = "Valid email is required";
    if (!formData.phone) errors.phone = "Phone number is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create contact
  const handleCreate = async () => {
    if (!validateForm()) return;
    try {
      await dispatch(CreateContactInfo(formData)).unwrap();
      toast.success("Address Created Successfully");
      setIsCreateModalOpen(false);
      setFormData({
        officeAddress: "",
        country: "",
        phone: "",
        email: "",
      });
      setFormErrors({});
      dispatch(getContactInfo());
    } catch (err) {
      console.error("Create error:", err);
      const errorMessage = err?.message || "Failed to create Address";
      toast.error(errorMessage);
    }
  };

  // Handle update contact
  const handleUpdate = async () => {
    if (!validateForm()) return;
    try {
      await dispatch(
        updateContactInfo({
          id: editingId,
          ...formData,
        }),
      ).unwrap();
      toast.success("Address Updated Successfully");
      setIsEditModalOpen(false);
      setEditingId(null);
      setFormData({
        officeAddress: "",
        country: "",
        phone: "",
        email: "",
      });
      setFormErrors({});
      dispatch(getContactInfo());
    } catch (err) {
      toast.error("Failed to update Address");
    }
  };

  // Handle delete contact
  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this Address information?",
      )
    ) {
      try {
        await dispatch(deleteContactInfo(id)).unwrap();
        toast.success("Address Deleted Successfully");
        dispatch(getContactInfo());
      } catch (err) {
        toast.error("Failed to delete Address");
      }
    }
  };

  // Handle edit contact
  const handleEdit = (contactItem) => {
    setEditingId(contactItem._id);
    setFormData({
      officeAddress: contactItem.officeAddress || "",
      country: contactItem.country || "",
      phone: contactItem.phone || "",
      email: contactItem.email || "",
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Handle input change without debounce
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingId(null);
    setFormData({
      officeAddress: "",
      country: "",
      phone: "",
      email: "",
    });
    setFormErrors({});
  };

  return (
    <div className="min-h-screen bg-theme-bg rounded-2xl py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="p-4 sm:p-6 bg-theme-bg2 rounded-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Address Information
              </h1>
              <p className="text-blue-100 mt-2 text-sm sm:text-base">
                Manage your business Address details efficiently
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-theme-bg hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mt-4 sm:mt-0"
              aria-label="Add new contact"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Address
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
            </div>
          ) : contact && contact.length > 0 ? (
            <div
              className="overflow-x-auto overflow-y-auto max-h-[400px] rounded-xl border border-gray-700"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#4b5563 #1f2937",
              }}
            >
              <style>{`
                  .overflow-x-auto::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                  }
                  .overflow-x-auto::-webkit-scrollbar-track {
                    background: #1f2937;
                  }
                  .overflow-x-auto::-webkit-scrollbar-thumb {
                    background: #4b5563;
                    border-radius: 4px;
                  }
                  .overflow-x-auto::-webkit-scrollbar-thumb:hover {
                    background: #6b7280;
                  }
                `}</style>
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-theme-primary">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Office Address
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-theme-bg2 divide-y divide-gray-700">
                  {contact.map((item, index) => (
                    <tr
                      key={item._id}
                      className="hover:bg-theme-bg transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {item.officeAddress || "Not provided"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {item.country || "Not provided"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {item.phone || "Not provided"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {item.email || "Not provided"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150"
                            aria-label="Edit contact"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150"
                            aria-label="Delete contact"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-75 text-white text-xs px-2 py-1 rounded-md pointer-events-none">
                ←→ Scroll horizontally
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No Contacts Found
              </h3>
              <p className="text-white mb-6">
                Start by adding a new contact entry.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                aria-label="Add new contact"
              >
                Add Contact
              </button>
            </div>
          )}
        </div>

        <ModalContent
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Add New Address"
          onSubmit={handleCreate}
          isLoading={isLoading}
        >
          <div className="space-y-4">
            <InputField
              label="Office Address"
              name="officeAddress"
              value={formData.officeAddress}
              onChange={handleChange}
              formErrors={formErrors}
            />
            <InputField
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              formErrors={formErrors}
            />
            <InputField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              formErrors={formErrors}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              formErrors={formErrors}
            />
          </div>
        </ModalContent>

        <ModalContent
          isOpen={isEditModalOpen}
          onClose={handleCancelEdit}
          title="Edit Contact"
          onSubmit={handleUpdate}
          isLoading={isLoading}
        >
          <div className="space-y-4">
            <InputField
              label="Office Address"
              name="officeAddress"
              value={formData.officeAddress}
              onChange={handleChange}
              formErrors={formErrors}
            />
            <InputField
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              formErrors={formErrors}
            />
            <InputField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              formErrors={formErrors}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              formErrors={formErrors}
            />
          </div>
        </ModalContent>
      </div>
    </div>
  );
};

export default UpdateContactInfo;
