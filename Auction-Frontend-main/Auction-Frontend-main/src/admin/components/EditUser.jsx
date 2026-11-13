import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserById, updateUserById, reset } from "../../store/user/userSlice";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const EditUser = () => {
  const location = useLocation();
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fromRef = useRef(location.state?.from || "/admin/users");

  const { singleUser, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.user,
  );

  const [formData, setFormData] = useState({
    firstName: "",
    lastname: "",
    email: "",
    location: "",
    zip: "",
    city: "",
    role: "",
    description: "",
    phone: "",
    position: "",
    company: "",
    suburb: "",
    state: "",
    country: "",
  });

  const [imgUrl, setImgUrl] = useState(null);
  const imgRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Reset state when component mounts
  useEffect(() => {
    dispatch(reset());
    dispatch(getUserById(id));
  }, [id, dispatch]);

  // Clear success state when leaving the page
  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (singleUser) {
      setFormData({
        firstName: singleUser.firstName || "",
        lastname: singleUser.lastname || "",
        email: singleUser.email || "",
        location: singleUser.location?.name || "",
        zip: singleUser.location?.zip || "",
        city: singleUser.city || "",
        role: singleUser.role || "",
        description: singleUser.description || "",
        phone: singleUser.telephoneNumber || "",
        position: singleUser.position || "",
        company: singleUser.company || "",
        suburb: singleUser.suburb || "",
        state: singleUser.state || "",
        country: singleUser.country || "",
      });
      setImgUrl(singleUser.profilePicture || null);
    }
  }, [singleUser]);

  useEffect(() => {
    if (isSuccess && updateSuccess) {
      toast.success("User updated successfully");
      setIsSubmitting(false);

      setTimeout(() => {
        dispatch(reset());
        navigate(fromRef.current);
      }, 1500);
    }

    if (isError && message) {
      toast.error(message || "Update failed");
      setIsSubmitting(false);
      setUpdateSuccess(false);
    }
  }, [isSuccess, isError, message, navigate, dispatch, updateSuccess]);

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.email) {
      toast.error("Please fill required fields");
      return;
    }

    setIsSubmitting(true);
    setUpdateSuccess(true);

    const data = new FormData();
    data.append("firstName", formData.firstName);
    data.append("lastname", formData.lastname);
    data.append("email", formData.email);
    data.append("location[name]", formData.location);
    data.append("location[zip]", formData.zip);
    data.append("city", formData.city);
    data.append("role", formData.role);
    data.append("description", formData.description);
    data.append("telephoneNumber", formData.phone);
    data.append("position", formData.position);
    data.append("company", formData.company);
    data.append("suburb", formData.suburb);
    data.append("state", formData.state);
    data.append("country", formData.country);

    if (imgRef.current?.files[0]) {
      data.append("profilePicture", imgRef.current.files[0]);
    }

    for (let [key, value] of data.entries()) {
    }

    dispatch(updateUserById({ data, id }));
  };

  if (isLoading && !singleUser) {
    return (
      <div className="px-7 py-4 w-full bg-theme-bg text-slate-300 rounded-2xl">
        <div className="text-white text-center py-8">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="px-7 py-4 w-full bg-theme-bg text-slate-300 rounded-2xl">
      <h2 className="text-white font-bold text-xl border-b border-border-info-color pb-3 mb-5">
        Account Settings
      </h2>

      {isError && message && <p className="text-red-500 mb-4">{message}</p>}

      <form onSubmit={handleFormSubmit}>
        <div
          className="relative overflow-hidden w-fit h-fit rounded-lg cursor-pointer mb-10"
          onClick={() => imgRef.current.click()}
        >
          <img
            src={
              imgUrl ||
              singleUser?.profilePicture ||
              "https://res.cloudinary.com/dnsxaor2k/image/upload/v1721403078/r4s3ingo0ysqq5hzsqal.jpg"
            }
            alt="Profile"
            className="lg:w-full w-[100px] object-contain max-w-xs"
          />
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <p className="text-white font-bold">Change Profile Picture</p>
          </div>
        </div>

        <input
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files[0]) {
              setImgUrl(URL.createObjectURL(e.target.files[0]));
            }
          }}
          ref={imgRef}
        />

        <div className="flex flex-col gap-4 inputs:outline-none inputs:px-3 inputs:py-4 inputs:rounded-xl inputs:bg-theme-bg2 [&_input[type=submit]]:bg-theme-color [&_input:hover[type=submit]]:bg-color-danger inputs:border inputs:border-border-info-color focus:inputs:border-theme-color select:border select:border-border-info-color inputs:placeholder-body-text-color [&_*]:transition-all">
          <div className="grid lg:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              name="firstName"
              required
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastname}
              name="lastname"
              required
              onChange={(e) =>
                setFormData({ ...formData, lastname: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              name="email"
              required
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Position"
              value={formData.position}
              name="position"
              required
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Company"
              value={formData.company}
              name="company"
              required
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Suburb"
              value={formData.suburb}
              name="suburb"
              required
              onChange={(e) =>
                setFormData({ ...formData, suburb: e.target.value })
              }
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="State"
              value={formData.state}
              name="state"
              required
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Country"
              value={formData.country}
              name="country"
              required
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Address"
              value={formData.location}
              name="location"
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Zip Code"
              value={formData.zip}
              name="zip"
              onChange={(e) =>
                setFormData({ ...formData, zip: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              name="city"
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />
          </div>

          <input
            type="number"
            placeholder="Phone Number"
            value={formData.phone}
            name="phone"
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />

          <textarea
            className="outline-none bg-theme-bg2 rounded-xl px-3 py-4 border border-border-info-color focus:border-theme-color placeholder-body-text-color"
            cols="30"
            rows="10"
            placeholder="Description"
            value={formData.description}
            name="description"
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          ></textarea>

          <input
            className="text-white cursor-pointer font-bold tracking-wide"
            type="submit"
            value={isSubmitting ? "Updating..." : "Update"}
            disabled={isSubmitting || isLoading}
          />
        </div>
      </form>
    </div>
  );
};

export default EditUser;
