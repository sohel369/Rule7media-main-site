import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getCurrentUser, updateProfile } from "../store/auth/authSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import { FooterLeaderboard, HeaderLeaderboard } from "./AdSlots";

const AccountSetting = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: "",
    lastname: "",
    email: "",
    suburb: "",
    city: "",
    street1: "",
    street2: "",
    role: "",
    userType: "",
    description: "",
    telephoneNumber: "",
    position: "",
    company: "",
    state: "",
    country: "",
  });

  const [imgUrl, setImgUrl] = useState("");
  const imgRef = useRef(null);

  // Initialize form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastname: user.lastname || "",
        email: user.email || "",
        city: user.city || "",
        suburb: user.suburb || "",
        street1: user.street1 || "",
        street2: user.street2 || "",
        role: user.role || "",
        userType: user.userType || "",
        description: user.description || "",
        telephoneNumber: user.telephoneNumber || "",
        position: user.position || "",
        company: user.company || "",
        state: user.state || "",
        country: user.country || "",
      });
      setImgUrl(user.profilePicture || "");
    }
  }, [user]);

  // Load current user on mount
  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImgUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    if (imgRef.current?.files[0]) {
      data.append("profilePicture", imgRef.current.files[0]);
    } else if (imgUrl) {
      data.append("profilePicture", imgUrl);
    }

    try {
      const result = await dispatch(updateProfile(data)).unwrap();

      toast.success(result.message || "Profile updated successfully", {
        autoClose: 2000,
        onClose: () => navigate("/user-profile/profile"),
      });

      // Refresh user data
      await dispatch(getCurrentUser());
    } catch (error) {
      toast.error(error.message || "Failed to update profile", {
        autoClose: 2000,
      });
    }
  };

  if (isLoading && !user) return <Loading />;

  return (
    <div className="px-7 py-4 w-full bg-theme-bg text-slate-300 rounded-2xl">
      <h2 className="text-white font-bold text-xl border-b border-border-info-color pb-3 mb-5">
        Account Settings
      </h2>

      <form onSubmit={handleFormSubmit}>
        <div className="flex items-start justify-between gap-6 mb-10">
          {/* Profile Image */}
          <div
            className="relative overflow-hidden w-[120px] h-[120px] rounded-lg cursor-pointer"
            onClick={() => imgRef.current.click()}
          >
            <img
              src={
                imgUrl ||
                user?.profilePicture ||
                "https://res.cloudinary.com/dnsxaor2k/image/upload/v1709735601/vsauyvodor9ykjca5zvj.jpg"
              }
              alt="profile"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <p className="text-white font-bold text-sm text-center">
                Change Profile Picture
              </p>
            </div>
          </div>

          {/* Ad Slot */}
          <div className="flex-1">
            <HeaderLeaderboard />
          </div>
        </div>

        <input
          type="file"
          className="hidden"
          onChange={handleImageChange}
          ref={imgRef}
          accept="image/*"
        />

        <div className="flex flex-col gap-4 [&_input]:outline-none [&_input]:px-3 [&_input]:py-2 [&_input]:rounded-lg [&_input]:bg-theme-bg2 [&_input:disabled]:opacity-50 [&_input[type=submit]]:bg-theme-color [&_input:hover[type=submit]]:bg-color-danger [&_input]:border [&_input]:border-border-info-color [&_input:focus]:border-theme-color [&_input]:placeholder-body-text-color">
          <div className="grid lg:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastname}
              onChange={(e) =>
                setFormData({ ...formData, lastname: e.target.value })
              }
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              disabled
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.telephoneNumber}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, ""); // remove non-numbers
                setFormData({ ...formData, telephoneNumber: numericValue });
              }}
            />
            <input
              type="text"
              placeholder="Street 1"
              value={formData.street1}
              onChange={(e) =>
                setFormData({ ...formData, street1: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Street 2"
              value={formData.street2}
              onChange={(e) =>
                setFormData({ ...formData, street2: e.target.value })
              }
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Position"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Company"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Suburb"
              value={formData.suburb}
              onChange={(e) =>
                setFormData({ ...formData, suburb: e.target.value })
              }
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="State"
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Country"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
            />
          </div>

          <textarea
            className="outline-none bg-theme-bg2 rounded-xl px-3 py-2 border border-border-info-color focus:border-theme-color placeholder-body-text-color min-h-[120px]"
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <button
            type="submit"
            className="bg-theme-color text-white font-bold py-2 px-4 rounded-lg hover:bg-color-danger transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </button>
        </div>
        <FooterLeaderboard />
      </form>
    </div>
  );
};

export default AccountSetting;
