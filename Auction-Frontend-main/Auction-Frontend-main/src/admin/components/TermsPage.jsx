import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchterms, updateterms, reset } from "../../store/terms/termsSlice";
import { getAllUsers } from "../../store/user/userSlice";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import sanitizeHtml from "sanitize-html";
import { toast } from "react-toastify";

const TermsPage = () => {
  const dispatch = useDispatch();
  const { terms, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.terms,
  );
  const { currentUser } = useSelector((state) => state.user);

  const [policyText, setPolicyText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [userCountry, setUserCountry] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [localSuccess, setLocalSuccess] = useState(false);
  const [localError, setLocalError] = useState("");

  // Country list (same as before)
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

  // Fetch data
  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(fetchterms());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  // Detect user location
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const country = data.country_code || "US";
        const mappedCountry = mapCountryCode(country);
        setUserCountry(mappedCountry);
        setSelectedCountry(mappedCountry);
      } catch (err) {
        console.error("Failed to fetch country:", err);
        setUserCountry("US");
        setSelectedCountry("US");
      }
    };
    fetchUserLocation();
  }, []);

  const mapCountryCode = (countryCode) => {
    const supportedCodes = countries.map((c) => c.code);
    if (supportedCodes.includes(countryCode)) return countryCode;
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
    if (euCountryCodes.includes(countryCode)) return "EU";
    return "US";
  };

  // Set policy text when country changes
  useEffect(() => {
    if (terms?.terms && selectedCountry) {
      const policyContent =
        terms.terms[selectedCountry] ||
        "No policy content available for this region. Please contact support for more information.";
      setPolicyText(policyContent);
    }
  }, [terms, selectedCountry]);

  // Handle success/error messages
  useEffect(() => {
    if (isSuccess) {
      setLocalSuccess(true);
      setLocalError("");
      setIsEditing(false);
      setTimeout(() => setLocalSuccess(false), 4000);
    }
    if (isError) {
      setLocalError(
        message || "An error occurred while fetching or updating the terms.",
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
        updateterms({
          country: selectedCountry,
          content: sanitizedContent,
        }),
      );

      if (updateterms.fulfilled.match(resultAction)) {
        setLocalSuccess(true);
        setIsEditing(false);
        toast.success("Terms & Condition updated successfully!");
        await dispatch(fetchterms());
      } else {
        toast.error("Failed to update terms.");
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
      setPolicyText(terms?.terms?.[userCountry] || "");
      setLocalError("");
    } else {
      setIsEditing(true);
      const countryToEdit = country || userCountry;
      setSelectedCountry(countryToEdit);
      setPolicyText(terms?.terms?.[countryToEdit] || "");
    }
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    setPolicyText(terms?.terms?.[country] || "");
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
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
  const getCountryName = (code) =>
    countries.find((c) => c.code === code)?.name || code;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Terms & Conditions Manager
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Manage regional terms and conditions – changes reflect
                immediately on the public page.
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={() => handleEditToggle()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md"
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
                Edit Terms
              </button>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {localError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-r-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{localError}</span>
            </div>
          </div>
        )}

        {localSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 rounded-r-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Terms updated successfully!</span>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Loading terms...
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* Country Cards Overview (when not editing) */}
            {!isEditing && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  All Regions
                </h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {countries.map((country) => (
                    <div
                      key={country.code}
                      className="group bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {country.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {country.code}
                          </p>
                        </div>
                        <button
                          onClick={() => handleEditToggle(country.code)}
                          className="text-orange-600 dark:text-orange-400 hover:text-orange-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="mt-2">
                        {terms?.terms?.[country.code] ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                            ✓ Policy exists
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
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
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Country Selector */}
                <div className="border-b border-gray-100 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Select Country / Region
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    className="w-full md:w-96 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="" disabled>
                      Choose a country...
                    </option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} ({country.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Editor */}
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
                    <svg
                      className="w-5 h-5 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      Tip: Highlight text and click the link icon to add URLs.
                      All links will open in a new tab.
                    </span>
                  </div>

                  <div className="custom-quill">
                    <ReactQuill
                      theme="snow"
                      value={policyText}
                      onChange={setPolicyText}
                      modules={modules}
                      formats={formats}
                      style={{ minHeight: "450px" }}
                      placeholder={`Enter terms & conditions for ${getCountryName(selectedCountry)}...`}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-100 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-4">
                  <button
                    onClick={() => handleEditToggle()}
                    className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={
                      !policyText.trim() || !selectedCountry || isLoading
                    }
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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

            {/* Preview Mode (when not editing) */}
            {!isEditing && selectedCountry && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="border-b border-gray-100 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Preview — {getCountryName(selectedCountry)}
                  </h3>
                </div>
                <div className="p-6 prose prose-gray dark:prose-invert max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        policyText ||
                        "<p class='text-gray-500 italic'>No content available for this region.</p>",
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TermsPage;
