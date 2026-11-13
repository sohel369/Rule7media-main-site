import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createCity, reset } from "../../store/city/citySlice";

const CreateCategory = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { isSuccess } = useSelector((state) => state.city);

  const [formData, setFormData] = useState({
    name: "",
  });

  const handleProductUpload = (e) => {
    e.preventDefault();
    //image data so use new formdata
    const data = new FormData();

    data.append("name", formData.name);

    dispatch(createCity(data));

    if (isSuccess) {
      toast.success("category created successfully");
      dispatch(reset());

      navigate("/admin/city");
    }
    // dispatch(getAllAuctions());
  };

  return (
    <div>
      <form
        className="flex flex-col lg:flex-row gap-8 justify-center lg:w-[100%] m-auto px-4"
        onSubmit={handleProductUpload}
      >
        {/* INPUTS */}
        <div className="flex flex-col gap-4 lg:w-[50%] inputs:outline-none p-8 inputs:px-4 inputs:py-3 inputs:rounded-xl select:px-4 select:py-3 select:rounded-xl select:cursor-pointer border border-border-info-color inputs:bg-theme-bg inputs:border inputs:border-border-info-color focus:inputs:border-theme-color select:border select:border-border-info-color inputs:placeholder-body-text-color text-slate-300 rounded-2xl [&_label]:mb-2 [&_label]:text-body-text-color [&_*]:transition-all">
          <div className="grid">
            <label htmlFor="product_name">City Name</label>
            <input
              required
              id="product_name"
              placeholder="e.g (Modern Abstract Painting)"
              type="text"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              value={formData.name}
            />{" "}
          </div>

          <button
            type="submit"
            className="px-3 py-4 rounded-xl text-white cursor-pointer font-bold tracking-wide w-full bg-theme-color hover:bg-color-danger"
          >
            Upload
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategory;
