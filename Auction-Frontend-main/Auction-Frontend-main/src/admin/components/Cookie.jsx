import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCookie, updateCookie } from "../../store/cookie/cookieSlice";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const CookiePage = () => {
  const dispatch = useDispatch();
  const { cookie, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.cookie,
  );

  const [cookieText, setcookieText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [localSuccess, setLocalSuccess] = useState(false);

  useEffect(() => {
    dispatch(getCookie());
  }, [dispatch]);

  useEffect(() => {
    if (cookie) {
      setcookieText(cookie.text || cookie.content || "");
    }
  }, [cookie]);

  useEffect(() => {
    if (isSuccess) {
      setLocalSuccess(true);
      setIsEditing(false);
      setTimeout(() => setLocalSuccess(false), 3000);
    }
  }, [isSuccess]);

  const handleUpdate = async () => {
    if (!cookieText.trim()) {
      alert("Please enter some content before saving");
      return;
    }
    try {
      await dispatch(updateCookie({ content: cookieText })).unwrap();
      toast.success("Cookies updated successfully!");
      setIsEditing(false);
      dispatch(getCookie());
    } catch (error) {
      toast.error("Failed to update cookies.");
      console.error("Update failed:", error);
    }
  };

  const handleEditToggle = () => {
    if (!isEditing && cookie) {
      setcookieText(cookie.text || cookie.content || "");
    }
    setIsEditing(!isEditing);
  };
  const CustomToolbar = () => (
    <div id="toolbar">
      <select
        className="ql-header"
        defaultValue={""}
        onChange={(e) => e.persist()}
      >
        <option value="1" />
        <option value="2" />
        <option value="" />
      </select>
      <button className="ql-bold" />
      <button className="ql-italic" />
      <button className="ql-underline" />
      <button className="ql-list" value="ordered" />
      <button className="ql-list" value="bullet" />
      <button className="ql-link" />
      <button className="ql-image" />
      <button className="ql-removeImage">🗑️</button> {/* custom button */}
      <button className="ql-clean" />
    </div>
  );
  function removeImageHandler() {
    const editor = this.quill;
    const range = editor.getSelection();
    if (range) {
      const [leaf] = editor.getLeaf(range.index);
      if (leaf?.domNode?.tagName === "IMG") {
        editor.deleteText(range.index, 1); // remove the image
      }
    }
  }
  const modules = {
    toolbar: {
      container: "#toolbar",
      handlers: {
        removeImage: removeImageHandler,
      },
    },
  };
  return (
    <div className=" flex-1 p-6 bg-theme-bg rounded-2xl">
      <h1 className="text-2xl font-bold mb-4 text-theme-color">
        Cookie Policy
      </h1>

      {isError && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          Error: {message}
        </div>
      )}

      {isLoading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <>
          <div className="mb-6 border rounded-lg p-4 min-h-64 bg-theme-bg2">
            {isEditing ? (
              <>
                <ReactQuill
                  theme="snow"
                  value={cookieText}
                  onChange={setcookieText}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link", "image"],
                      ["clean"],
                    ],
                  }}
                  formats={[
                    "header",
                    "bold",
                    "italic",
                    "underline",
                    "strike",
                    "list",
                    "bullet",
                    "link",
                    "image",
                  ]}
                />
              </>
            ) : (
              <div
                className="prose  text-white"
                dangerouslySetInnerHTML={{
                  __html: cookieText || "No policy content available.",
                }}
              />
            )}
          </div>

          <div className="flex gap-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-all"
                  disabled={!cookieText.trim() || isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleEditToggle}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-all"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEditToggle}
                className="bg-theme-color text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-all"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Edit cookie"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CookiePage;
