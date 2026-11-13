import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPrivacy,
  updatePrivacy,
  reset,
} from "../../store/privacy/privacySlice";
import { getAllUsers } from "../../store/user/userSlice";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import sanitizeHtml from "sanitize-html";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const PrivacyPolicy = () => {
  const dispatch = useDispatch();
  const { privacy, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.privacy,
  );
  const { currentUser } = useSelector((state) => state.user);

  const [policyText, setPolicyText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [userCountry, setUserCountry] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [localSuccess, setLocalSuccess] = useState(false);
  const [localError, setLocalError] = useState("");

  // Enhanced country list with more regions
  const countries = [
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "AU", name: "Australia" },
    { code: "IN", name: "India" },
    { code: "JP", name: "Japan" },
    { code: "CN", name: "China" },
    { code: "TH", name: "Thailand" },
    { code: "ID", name: "Indonesia" },
    { code: "ES", name: "Spain" },
    { code: "FR", name: "France" },
  ];

  // Fetch user data and current user info
  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(fetchPrivacy());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const country = data.country_code || "US";

        const mappedCountry = mapCountryCode(country);
        setUserCountry(mappedCountry);
        setSelectedCountry(mappedCountry);
      } catch (err) {
        console.error("Failed to fetch country:", err);
        const fallbackCountry = "US";
        setUserCountry(fallbackCountry);
        setSelectedCountry(fallbackCountry);
      }
    };

    fetchUserLocation();
  }, []);

  // Improved country mapping logic
  const mapCountryCode = (countryCode) => {
    const supportedCodes = countries.map((c) => c.code);
    if (supportedCodes.includes(countryCode)) {
      return countryCode;
    }

    // Example EU countries mapping
    const euCountryCodes = [
      "AT",
      "BE",
      "BG",
      "CY",
      "CZ",
      "DE",
      "DK",
      "EE",
      "ES",
      "FI",
      "FR",
      "GR",
      "HR",
      "HU",
      "IE",
      "IT",
      "LT",
      "LU",
      "LV",
      "MT",
      "NL",
      "PL",
      "PT",
      "RO",
      "SE",
      "SI",
      "SK",
    ];
    if (euCountryCodes.includes(countryCode)) {
      return "EU";
    }

    // Default fallback
    return "US";
  };

  // Set policy text when selectedCountry or privacy changes
  useEffect(() => {
    if (privacy?.policies && selectedCountry) {
      const policyContent =
        privacy.policies[selectedCountry] ||
        "No policy content available for this region. Please contact support for more information.";

      setPolicyText(policyContent);
    }
  }, [privacy, selectedCountry]);

  // Handle success and error states
  useEffect(() => {
    if (isSuccess) {
      setLocalSuccess(true);
      setLocalError("");
      setIsEditing(false);
      setTimeout(() => setLocalSuccess(false), 4000);
    }
    if (isError) {
      setLocalError(
        message || "An error occurred while fetching or updating the policy.",
      );
      setTimeout(() => setLocalError(""), 4000);
    }
  }, [isSuccess, isError, message]);

  const handleUpdate = async () => {
    if (!policyText.trim()) {
      setLocalError("Please enter policy content before saving");
      return;
    }

    if (!selectedCountry) {
      setLocalError("Please select a country/region before saving");
      return;
    }

    try {
      // Sanitize the HTML content before saving
      const sanitizedContent = sanitizeHtml(policyText.trim(), {
        allowedTags: [
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "p",
          "a",
          "ul",
          "ol",
          "li",
          "b",
          "i",
          "strong",
          "em",
          "strike",
          "code",
          "hr",
          "br",
          "div",
          "table",
          "thead",
          "tbody",
          "tr",
          "th",
          "td",
          "blockquote",
          "pre",
          "span",
        ],
        allowedAttributes: {
          a: ["href", "target", "rel"],
          "*": ["class", "style"],
        },
        allowedSchemes: ["http", "https", "mailto"],
        transformTags: {
          a: (tagName, attribs) => ({
            tagName: "a",
            attribs: {
              ...attribs,
              target: attribs.target || "_blank",
              rel: "noopener noreferrer",
            },
          }),
        },
      });

      if (!sanitizedContent) {
        setLocalError(
          "Content was stripped during sanitization. Ensure links are valid (http/https).",
        );
        return;
      }

      const resultAction = await dispatch(
        updatePrivacy({
          country: selectedCountry,
          content: sanitizedContent,
        }),
      );

      if (updatePrivacy.fulfilled.match(resultAction)) {
        setLocalSuccess(true);
        setIsEditing(false);
        toast.success("Privacy policy updated successfully!");
        await dispatch(fetchPrivacy());
      } else {
        toast.error("Failed to update policy.");
      }
    } catch (error) {
      console.error("Update failed:", error);
      setLocalError("Failed to update policy. Please try again.");
    }
  };

  const handleEditToggle = (country = null) => {
    if (isEditing) {
      setIsEditing(false);
      setSelectedCountry(userCountry);
      setPolicyText(privacy?.policies?.[userCountry] || "");

      setLocalError("");
    } else {
      setIsEditing(true);
      const countryToEdit = country || userCountry;
      setSelectedCountry(countryToEdit);
      setPolicyText(privacy?.policies?.[countryToEdit] || "");
    }
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    setPolicyText(privacy?.policies?.[country] || "");
  };

  // Simplified ReactQuill modules for link functionality
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"], // Ensure link module is included
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "link",
  ];

  const getCountryName = (code) => {
    const country = countries.find((c) => c.code === code);
    return country ? country.name : code;
  };

  return (
    <div className="min-h-screen bg-theme-bg rounded-2xl">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <style>
          {`
            .ql-editor a {
              color: #1d4ed8;
              text-decoration: underline;
            }
            .ql-editor a:hover {
              color: #1e40af;
            }
            .prose a {
              color: #1d4ed8;
              text-decoration: underline;
            }
            .prose a:hover {
              color: #1e40af;
            }
          `}
        </style>
        {/* Header */}
        <div className="bg-theme-bg2 text-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Privacy Policy Management
              </h1>
              <p className="text-white">
                Manage Privacy Policies For Different Countries
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {!isEditing && (
                <button
                  onClick={() => handleEditToggle()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 font-medium shadow-sm"
                  disabled={isLoading}
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
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Policies
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {localError && (
          <div className="mb-6 p-4 bg-theme-bg2 border-l-4 border-red-400 text-gray-400 rounded-r-lg">
            <div className="flex">
              <svg
                className="w-5 h-5 mr-2 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <strong>Error:</strong> {localError}
              </div>
            </div>
          </div>
        )}
        {/* 
        {localSuccess && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 text-green-700 rounded-r-lg">
            <div className="flex">
              <svg
                className="w-5 h-5 mr-2 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <strong>Success:</strong> Privacy policy updated successfully!
              </div>
            </div>
          </div>
        )} */}

        {isLoading ? (
          <div className="bg-theme-bg rounded-lg shadow-sm border p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-white font-medium">
                Loading privacy policies...
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Country Policies Overview - Only show when not editing */}
            {!isEditing && (
              <div className="bg-theme-bg2 rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-white mb-6">
                  All Privacy Policies
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {countries.map((country) => (
                    <div
                      key={country.code}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:bg-theme-bg2 bg-theme-bg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-medium text-white">
                            {country.name}
                          </h3>
                          <p className="text-sm text-white">{country.code}</p>
                        </div>
                        <button
                          onClick={() => handleEditToggle(country.code)}
                          className="bg-theme-bg2 text-white px-3 py-1 rounded-md hover:bg-theme-bg transition-all text-sm font-medium"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="text-sm">
                        {privacy?.policies?.[country.code] ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-theme-bg2 text-white">
                            Policy exists
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-theme-bg2 text-white">
                            No policy set
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Editing Mode */}
            {isEditing && (
              <div className="bg-theme-bg rounded-lg shadow-sm border overflow-hidden">
                {/* Country Selector */}
                <div className="bg-theme-bg2 px-6 py-4 border-b border-gray-200">
                  <label className="block text-sm font-medium text-white mb-2">
                    Select Country/Region to Edit:
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-theme-bg text-white"
                    required
                  >
                    <option value="" disabled>
                      Choose a country or region...
                    </option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} ({country.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Editor Header */}
                <div className="bg-theme-bg2 px-6 py-3 border-b border-blue-200">
                  <h3 className="font-semibold text-white">
                    Editing Privacy Policy for {getCountryName(selectedCountry)}
                  </h3>
                </div>

                {/* Editor Content */}
                <div className="p-6 text-white bg-theme-bg2">
                  <div className="mb-4 text-sm text-white bg-theme-bg p-4 rounded-lg border ">
                    <strong>Tip:</strong> To add a link, highlight text, click
                    the link icon in the toolbar, and enter a valid URL (e.g.,
                    https://gdpr.eu/). Links will be preserved and rendered
                    correctly.
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={policyText}
                      onChange={(value) => {
                        setPolicyText(value);
                      }}
                      modules={modules}
                      formats={formats}
                      style={{ minHeight: "400px" }}
                      placeholder="Enter privacy policy content for this region..."
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="bg-theme-bg2 px-6 py-4 border-t border-gray-200 flex justify-end gap-4">
                  <button
                    onClick={() => handleEditToggle()}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-all font-medium"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={
                      !policyText.trim() || !selectedCountry || isLoading
                    }
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Policy Preview - Show when not editing */}
            {!isEditing && selectedCountry && (
              <div className="bg-theme-bg2 rounded-lg shadow-sm border overflow-hidden">
                <div className="bg-theme-bg2 px-6 py-4 border-b border-gray-200">
                  <h3 className="font-semibold text-white">
                    Privacy Policy Preview - {getCountryName(selectedCountry)}
                  </h3>
                </div>

                <div className="p-6 text-white">
                  <div
                    className="prose max-w-none prose-blue prose-lg"
                    dangerouslySetInnerHTML={{
                      __html:
                        policyText ||
                        "<p class='text-white italic'>No policy content available for this region.</p>",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacyPolicy;

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchPrivacy, updatePrivacy } from "../../store/privacy/privacySlice";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";

// const PrivacyPolicy = () => {
//   const dispatch = useDispatch();
//   const { privacy, isLoading, isSuccess, isError, message } = useSelector(
//     (state) => state.privacy
//   );
//   const [policyText, setPolicyText] = useState("");
//   const [isEditing, setIsEditing] = useState(false);
//   const [localSuccess, setLocalSuccess] = useState(false);

//   useEffect(() => {
//     dispatch(fetchPrivacy());
//   }, [dispatch]);

//   useEffect(() => {
//     if (privacy) {
//       setPolicyText(privacy.text || privacy.content || "");
//     }
//   }, [privacy]);

//   useEffect(() => {
//     if (isSuccess) {
//       setLocalSuccess(true);
//       setIsEditing(false);
//       setTimeout(() => setLocalSuccess(false), 3000);
//     }
//   }, [isSuccess]);

//   const handleUpdate = async () => {
//     if (!policyText.trim()) {
//       alert("Please enter some content before saving");
//       return;
//     }
//     try {
//       await dispatch(
//         updatePrivacy({ text: policyText, content: policyText })
//       ).unwrap();

//       setIsEditing(false);
//       dispatch(fetchPrivacy());
//     } catch (error) {
//       console.error("Update failed:", error);
//     }
//   };

//   const handleEditToggle = () => {
//     if (!isEditing && privacy) {
//       setPolicyText(privacy.text || privacy.content || "");
//     }
//     setIsEditing(!isEditing);
//   };
//   const CustomToolbar = () => (
//     <div id="toolbar">
//       <select className="ql-header" defaultValue={''} onChange={(e) => e.persist()}>
//         <option value="1" />
//         <option value="2" />
//         <option value="" />
//       </select>
//       <button className="ql-bold" />
//       <button className="ql-italic" />
//       <button className="ql-underline" />
//       <button className="ql-list" value="ordered" />
//       <button className="ql-list" value="bullet" />
//       <button className="ql-link" />
//       <button className="ql-image" />
//       <button className="ql-removeImage">🗑️</button> {/* custom button */}
//       <button className="ql-clean" />
//     </div>
//   );function removeImageHandler() {
//     const editor = this.quill;
//     const range = editor.getSelection();
//     if (range) {
//       const [leaf] = editor.getLeaf(range.index);
//       if (leaf?.domNode?.tagName === 'IMG') {
//         editor.deleteText(range.index, 1); // remove the image
//       }
//     }
//   }const modules = {
//   toolbar: {
//     container: "#toolbar",
//     handlers: {
//       removeImage: removeImageHandler,
//     },
//   },
// };
//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4 text-theme-color">
//         Privacy Policy
//       </h1>

//       {isError && (
//         <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
//           Error: {message}
//         </div>
//       )}

//       {isLoading ? (
//         <p className="text-gray-600">Loading...</p>
//       ) : (
//         <>
//           <div className="mb-6 border rounded-lg p-4 min-h-64">
//             {isEditing ? (
//               <>
//                 <ReactQuill
//                   theme="snow"
//                   value={policyText}
//                   onChange={setPolicyText}
//                   modules={{
//                     toolbar: [
//                       [{ header: [1, 2, 3, false] }],
//                       ["bold", "italic", "underline", "strike"],
//                       [{ list: "ordered" }, { list: "bullet" }],
//                       ["link", "image"],
//                       ["clean"],
//                     ],
//                   }}
//                   formats={[
//                     "header",
//                     "bold",
//                     "italic",
//                     "underline",
//                     "strike",
//                     "list",
//                     "bullet",
//                     "link",
//                     "image",
//                   ]}
//                 />
//               </>
//             ) : (
//               <div
//                 className="prose max-w-full"
//                 dangerouslySetInnerHTML={{
//                   __html: policyText || "No policy content available.",
//                 }}
//               />
//             )}
//           </div>

//           <div className="flex gap-4">
//             {isEditing ? (
//               <>
//                 <button
//                   onClick={handleUpdate}
//                   className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-all"
//                   disabled={!policyText.trim() || isLoading}
//                 >
//                   {isLoading ? "Saving..." : "Save Changes"}
//                 </button>
//                 <button
//                   onClick={handleEditToggle}
//                   className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-all"
//                   disabled={isLoading}
//                 >
//                   Cancel
//                 </button>
//               </>
//             ) : (
//               <button
//                 onClick={handleEditToggle}
//                 className="bg-theme-color text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-all"
//                 disabled={isLoading}
//               >
//                 {isLoading ? "Loading..." : "Edit Policy"}
//               </button>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default PrivacyPolicy;
