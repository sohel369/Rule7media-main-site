import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSingleCategory,
  reset,
  updateCategory,
  getAllCategories,
  getCategoriesMoreDetail,
  getTopCategories,
} from "../../store/category/categorySlice.js";

// import { getAllCategories } from "../../store/category/categorySlice.js";
// import { getAllCities } from "../../store/city/citySlice.js";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { singleCategory, isLoading } = useSelector((state) => state.category);
  const [singleCategoryData, setSingleCategoryData] = useState(singleCategory);
  const [imgUrl, setImgUrl] = useState(singleCategory?.imageUrl || "");
  const imgRef = useRef(null);

  useEffect(() => {
    dispatch(getSingleCategory(id));
  }, [id]);

  useEffect(() => {
    if (singleCategory) {
      setSingleCategoryData(singleCategory);
    }
  }, [singleCategory]);
  useEffect(() => {
    dispatch(getAllCategories());
    dispatch(getCategoriesMoreDetail());
    dispatch(getTopCategories());
  }, [dispatch]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imgUrl: "",
  });

  useEffect(() => {
    setFormData({
      name: singleCategoryData?.name,
      description: singleCategoryData?.description || "",
    });
    setImgUrl(singleCategoryData?.imageUrl || "");
  }, [singleCategoryData]);

  const handleProductUpload = async (e) => {
    e.preventDefault();
    //image data so use new formdata
    const data = new FormData();

    data.append("name", formData.name);

    data.append("description", formData.description);

    if (imgRef.current.files[0]) {
      data.append("image", imgRef.current.files[0]);
    } else {
      data.append("image", imgUrl);
    }

    //print data
    for (var pair of data.entries()) {
    }

    await dispatch(updateCategory({ data: data, id: id })).unwrap();
    toast.success("category updated successfully");
    dispatch(getAllCategories());
    dispatch(getCategoriesMoreDetail());
    dispatch(getTopCategories());
    navigate("/admin/categories");
    dispatch(reset());
  };

  return (
    <div>
      <form
        className="flex flex-col lg:flex-row gap-8 justify-center lg:w-[100%] m-auto px-4 bg-theme-bg rounded-2xl py-8 mb-8"
        onSubmit={handleProductUpload}
      >
        <div className="text-black lg:w-[22%] lg:min-w-[350px]  ">
          <h1 className="text-white text-2xl font-bold mb-4">Upload Item</h1>

          {imgUrl ? (
            <div
              className="relative w-full h-80 cursor-pointer"
              onClick={() => imgRef.current.click()}
            >
              <img
                src={imgUrl}
                alt="upload img"
                className="w-full h-full rounded-lg border-2 border-border-info-color p-2 object-contain bg-theme-bg2"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-white">Click to edit image</p>
              </div>
            </div>
          ) : (
            <div
              onClick={() => imgRef.current.click()}
              className="w-full h-80 rounded-xl border-2 border-dashed border-border-info-color flex items-center justify-center cursor-pointer"
            >
              <p className="text-white">Click to upload</p>
            </div>
          )}

          <input
            type="file"
            className="hidden"
            onChange={(e) => setImgUrl(URL.createObjectURL(e.target.files[0]))}
            ref={imgRef}
          />
        </div>

        <div className="flex flex-col gap-4 lg:w-[80%] inputs:outline-none p-8 inputs:px-4 inputs:py-3 inputs:rounded-xl select:px-4 select:py-3 select:rounded-xl select:cursor-pointer border border-border-info-color inputs:bg-theme-bg2 inputs:border inputs:border-border-info-color focus:inputs:border-theme-color select:border select:border-border-info-color inputs:placeholder-body-text-color text-slate-300 rounded-2xl [&_label]:mb-2 [&_label]:text-body-text-white [&_*]:transition-all">
          <div className="grid">
            <label htmlFor="product_name" className="text-white  mb-1">
              Category Name
            </label>
            <input
              required
              id="product_name"
              type="text"
              className="w-full py-3 mt-2 outline-none border-none rounded-lg"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              value={formData.name}
            />{" "}
          </div>

          <div className="grid">
            <label htmlFor="description">Description</label>
            <textarea
              required
              id="description"
              rows="7"
              className="outline-none bg-theme-bg2 rounded-xl px-3 py-4 border border-border-info-color focus:border-theme-color placeholder-body-text-white"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              value={formData.description}
            />
          </div>

          <button
            type="submit"
            className="px-3 py-4 rounded-xl text-white cursor-pointer font-bold tracking-wide w-full bg-theme-color hover:bg-color-danger"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCategory;
