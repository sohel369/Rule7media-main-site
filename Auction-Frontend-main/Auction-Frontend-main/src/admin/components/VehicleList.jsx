import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createVehicle,
  deleteVehicle,
  fetchVehicles,
  updateVehicle,
  uploadVehiclesFromCsv,
  approveVehicle,
} from "../../store/vehicle/vehicleSlice";
import {
  FiPlus,
  FiUpload,
  FiEdit,
  FiTrash,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiX,
  FiImage,
  FiCheck,
} from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoCloudUploadOutline, IoDocumentTextOutline } from "react-icons/io5";
import { saveAs } from "file-saver";
import worldData from "../../countries+states+cities.json";
const LoadingSpinner = ({ size = "medium" }) => {
  const sizes = {
    small: "w-5 h-5",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };
  return (
    <div
      className={`animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-blue-600 ${sizes[size]}`}
    />
  );
};

const AddVehicleForm = () => {
  const tableContainerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const dispatch = useDispatch();
  const {
    list = [],
    loading = false,
    error = null,
  } = useSelector((state) => state.vehicles || {});
  const { user } = useSelector((state) => state.auth || {});
  const userId = user?._id;
  const userType = user?.userType;

  const [formData, setFormData] = useState({
    _id: null,
    //country: "",
    vehicle: "",
    model: "",
    yearOfManufacture: "",
    manufacturer: "",
    dimensions: {
      length: "",
      width: "",
      height: "",
      wheelbase: "",
      curbWeight: "",
      engineSize: "",
      cabwidth: "",
      cabheight: "",
      bonnetwidth: "",
      bonnetLength: "",
    },
  });
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageForView, setSelectedImageForView] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState("unapproved");

  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch, refresh]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.dimensions) {
      setFormData((prev) => ({
        ...prev,
        dimensions: { ...prev.dimensions, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleApprove = async (vehicleId) => {
    try {
      await dispatch(approveVehicle({ vehicleId })).unwrap();
      toast.success("Vehicle approved successfully!");
      setRefresh((prev) => !prev);
    } catch (err) {
      toast.error(
        "Error approving vehicle: " + (err.message || "Unknown error"),
      );
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error("You can only upload up to 5 images");
      return;
    }
    setSelectedImages(files);
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(previewUrls);
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setSelectedImages(newImages);
    setImagePreviewUrls(newPreviewUrls);
  };

  const clearImages = () => {
    imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setImagePreviewUrls([]);
  };

  const resetForm = () => {
    setFormData({
      _id: null,
      //country: "",
      vehicle: "",
      model: "",
      yearOfManufacture: "",
      manufacturer: "",
      dimensions: {
        length: "",
        width: "",
        height: "",
        wheelbase: "",
        curbWeight: "",
        engineSize: "",
        cabwidth: "",
        cabheight: "",
        bonnetwidth: "",
        bonnetLength: "",
      },
    });
    clearImages();
  };

  const openAddModal = () => {
    setIsEditMode(false);
    resetForm();
    setShowModal(true);
  };
  const downloadTemplate = () => {
    const headers = [
      // "country",
      "vehicle",
      "model",
      "yearOfManufacture",
      "manufacturer",
      "dimensions.length",
      "dimensions.width",
      "dimensions.height",
      "dimensions.wheelbase",
      "dimensions.curbWeight",
      "dimensions.engineSize",
      "dimensions.cabwidth",
      "dimensions.cabheight",
      "dimensions.bonnetwidth",
      "dimensions.bonnetLength",
      "images[0]",
      "images[1]",
      "images[2]",
      "images[3]",
      "images[4]",
    ];

    const sampleRow = [
      "Australia",
      "Outlander",
      "CX5",
      "2023",
      "Mitsubishi",
      "480",
      "185",
      "168",
      "270",
      "1650",
      "2.0L 4-Cylinder Diesel",
      "180",
      "145",
      "160",
      "110",
      "https://example.com/front.jpg",
      "https://example.com/side.jpg",
      "",
      "",
      "",
    ];

    // CSV content with instructions as comments
    const instructions = [
      "# Vehicle Bulk Upload Template",
      "# All dimensions in centimeters (cm) except Curb Weight (kg) and Engine Size (text)",
      "# IMPORTANT: Delete all instruction rows (lines starting with #) before uploading",
      "# Images: Provide up to 5 hosted image URLs. Recommended: Front, Side + optional 3D views. Max 2MB per image",
      "#",
    ].join("\n");

    // Properly escape CSV values (wrap in quotes if they contain commas)
    const escapeCSV = (value) => {
      if (value === "" || value === null || value === undefined) return "";
      const str = String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headerRow = headers.map(escapeCSV).join(",");
    const dataRow = sampleRow.map(escapeCSV).join(",");

    const csvContent = [instructions, headerRow, dataRow].join("\n");

    // Create and download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "vehicle_bulk_upload_template.csv");

    toast.success(
      "CSV template downloaded! Delete instruction lines (starting with #) before uploading.",
    );
  };

  const openEditModal = (vehicle) => {
    setIsEditMode(true);
    setFormData({
      ...vehicle,
      dimensions: {
        length: vehicle.dimensions?.length || "",
        width: vehicle.dimensions?.width || "",
        height: vehicle.dimensions?.height || "",
        wheelbase: vehicle.dimensions?.wheelbase || "",
        curbWeight: vehicle.dimensions?.curbWeight || "",
        engineSize: vehicle.dimensions?.engineSize || "",
        cabwidth: vehicle.dimensions?.cabwidth || vehicle.cabwidth || "",
        cabheight: vehicle.dimensions?.cabheight || vehicle.cabheight || "",
        bonnetwidth:
          vehicle.dimensions?.bonnetwidth || vehicle.bonnetwidth || "",
        bonnetLength: vehicle.dimensions?.bonnetLength || "",
      },
    });
    clearImages();
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditMode && selectedImages.length === 0) {
      toast.error("Please select at least one image");
      return;
    }
    setIsSubmitting(true);
    try {
      const submitFormData = new FormData();
      // submitFormData.append("country", formData.country);
      submitFormData.append("vehicle", formData.vehicle);
      submitFormData.append("model", formData.model);
      submitFormData.append("yearOfManufacture", formData.yearOfManufacture);
      submitFormData.append("manufacturer", formData.manufacturer);

      Object.entries(formData.dimensions).forEach(([key, value]) => {
        if (value !== "") {
          submitFormData.append(`dimensions[${key}]`, value);
        }
      });
      selectedImages.forEach((image) => {
        submitFormData.append("images", image);
      });

      if (user) {
        submitFormData.append("userId", user._id);
        submitFormData.append("userType", user.userType);
      }

      if (isEditMode) {
        await dispatch(
          updateVehicle({ id: formData._id, data: submitFormData }),
        ).unwrap();
        toast.success("Vehicle updated successfully!");
      } else {
        await dispatch(createVehicle(submitFormData)).unwrap();
        toast.success("Vehicle added successfully!");
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      toast.error("Error saving vehicle: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await dispatch(deleteVehicle(id)).unwrap();
        toast.success("Vehicle deleted successfully!");
      } catch (err) {
        toast.error(
          "Error deleting vehicle: " + (err.message || "Unknown error"),
        );
      }
    }
  };

  const parseCSV = async (file) => {
    const text = await file.text();

    // Filter out comment lines and empty lines
    const lines = text.split(/\r?\n/).filter((line) => {
      const trimmed = line.trim();
      return trimmed !== "" && !trimmed.startsWith("#");
    });

    if (lines.length < 2) {
      throw new Error(
        "CSV file must have at least a header row and one data row",
      );
    }

    // Better delimiter detection
    const firstLine = lines[0];
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const delimiter = tabCount > commaCount ? "\t" : ",";

    const parseLine = (line) => {
      if (delimiter === "\t") {
        return line.split("\t").map((field) => field.trim());
      } else {
        const result = [];
        let inQuotes = false;
        let currentField = "";

        for (let i = 0; i < line.length; i++) {
          const char = line[i];

          if (char === '"' && (i === 0 || line[i - 1] !== "\\")) {
            inQuotes = !inQuotes;
          } else if (char === delimiter && !inQuotes) {
            result.push(currentField.trim());
            currentField = "";
          } else {
            currentField += char;
          }
        }
        result.push(currentField.trim());

        return result.map((field) =>
          field.startsWith('"') && field.endsWith('"')
            ? field.slice(1, -1)
            : field,
        );
      }
    };

    // Parse headers - keep original case for now
    const rawHeaders = parseLine(lines[0]);
    const dataRows = lines.slice(1).map(parseLine);

    // Process rows with ORIGINAL headers as keys
    const processedRows = dataRows.map((row) => {
      const processed = {};
      rawHeaders.forEach((header, i) => {
        let value = i < row.length ? row[i] || "" : "";

        if (value && value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }

        processed[header] = value;
      });
      return processed;
    });

    return { headers: rawHeaders, rows: processedRows };
  };

  const handleBulkUpload = async () => {
    if (!csvFile) return toast.error("Please select a CSV file first.");
    setCsvUploading(true);

    try {
      const { headers, rows } = await parseCSV(csvFile);

      if (rows.length === 0) {
        toast.error("No data found in CSV file");
        setCsvUploading(false);
        return;
      }

      // Normalize function - remove units, spaces, lowercase
      const normalizeHeader = (h) => {
        return h
          .trim()
          .toLowerCase()
          .replace(/\s*\([^)]*\)/g, "")
          .replace(/\s+/g, "");
      };

      // Create mapping: normalized -> original header
      const headerMap = {};
      headers.forEach((h) => {
        const normalized = normalizeHeader(h);
        headerMap[normalized] = h;
      });

      // Expected headers (normalized)
      const expectedHeaders = [
        // 'country',
        "vehicle",
        "model",
        "yearofmanufacture",
        "manufacturer",
        "dimensions.length",
        "dimensions.width",
        "dimensions.height",
        "dimensions.wheelbase",
        "dimensions.curbweight",
        "dimensions.enginesize",
        "dimensions.cabwidth",
        "dimensions.cabheight",
        "dimensions.bonnetwidth",
        "dimensions.bonnetlength",
      ];

      // Check missing headers
      const missingHeaders = expectedHeaders.filter(
        (expected) => !headerMap[expected],
      );

      if (missingHeaders.length > 0) {
        console.error("Missing headers:", missingHeaders);
        console.error("Available normalized headers:", Object.keys(headerMap));
        toast.error(`Missing required headers: ${missingHeaders.join(", ")}`);
        setCsvUploading(false);
        return;
      }

      // Helper to get value from row using normalized key
      const getValue = (row, normalizedKey) => {
        const originalHeader = headerMap[normalizedKey];
        if (!originalHeader) {
          console.warn(`No original header found for: ${normalizedKey}`);
          return "";
        }
        return row[originalHeader] || "";
      };

      // Parse functions
      const parseNumber = (str) => {
        if (!str || str.toString().trim() === "") return 0;
        const cleaned = str.toString().replace(/[^\d.-]/g, "");
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
      };

      const parseCurbWeight = (str) => {
        if (!str) return "0";
        const cleaned = str.toString().replace(/[^\d]/g, "");
        const num = parseInt(cleaned, 10);
        if (isNaN(num)) return "0";
        return new Intl.NumberFormat("en-US").format(num);
      };

      const parseYear = (str) => {
        const num = parseNumber(str);
        return num > 1900 && num < 2100 ? num : new Date().getFullYear();
      };

      // Process vehicles
      const vehicles = rows
        .map((row) => {
          // Collect images
          const images = [];
          for (let i = 0; i < 5; i++) {
            const imageHeader = `images[${i}]`;
            if (row[imageHeader] && row[imageHeader].trim()) {
              const imgUrl = row[imageHeader].trim();
              if (imgUrl && imgUrl.startsWith("http")) {
                images.push(imgUrl);
              }
            }
          }

          return {
            // country: getValue(row, 'country') || "Unknown",
            vehicle: getValue(row, "vehicle") || "Unknown",
            model: getValue(row, "model") || "Unknown",
            yearOfManufacture: parseYear(getValue(row, "yearofmanufacture")),
            manufacturer: getValue(row, "manufacturer") || "Unknown",
            "dimensions[length]": parseNumber(
              getValue(row, "dimensions.length"),
            ),
            "dimensions[width]": parseNumber(getValue(row, "dimensions.width")),
            "dimensions[height]": parseNumber(
              getValue(row, "dimensions.height"),
            ),
            "dimensions[wheelbase]": parseNumber(
              getValue(row, "dimensions.wheelbase"),
            ),
            "dimensions[curbWeight]": parseCurbWeight(
              getValue(row, "dimensions.curbweight"),
            ),
            "dimensions[engineSize]":
              getValue(row, "dimensions.enginesize") || "",
            "dimensions[cabwidth]": parseNumber(
              getValue(row, "dimensions.cabwidth"),
            ),
            "dimensions[cabheight]": parseNumber(
              getValue(row, "dimensions.cabheight"),
            ),
            "dimensions[bonnetwidth]": parseNumber(
              getValue(row, "dimensions.bonnetwidth"),
            ),
            "dimensions[bonnetLength]": parseNumber(
              getValue(row, "dimensions.bonnetlength"),
            ),
            images,
          };
        })
        .filter(
          (v) => v.model && v.model.trim() !== "" && v.model !== "Unknown",
        );

      // Validation
      const errors = [];
      vehicles.forEach((v, i) => {
        if (!v.model || v.model.trim() === "" || v.model === "Unknown") {
          errors.push(`Row ${i + 2}: Model is required`);
        }
        if (!v.vehicle || v.vehicle === "Unknown") {
          errors.push(`Row ${i + 2}: Vehicle type is required`);
        }
        if (!v.manufacturer || v.manufacturer === "Unknown") {
          errors.push(`Row ${i + 2}: Manufacturer is required`);
        }
        if (
          !v["dimensions[engineSize]"] ||
          v["dimensions[engineSize]"].trim() === ""
        ) {
          errors.push(`Row ${i + 2}: Engine size is required`);
        }
      });

      if (errors.length > 0) {
        throw new Error(
          errors.slice(0, 5).join(", ") +
            (errors.length > 5
              ? ` ...and ${errors.length - 5} more errors`
              : ""),
        );
      }

      if (vehicles.length === 0) {
        toast.error("No valid vehicles found in CSV");
        setCsvUploading(false);
        return;
      }

      const result = await dispatch(
        uploadVehiclesFromCsv({ vehicles, userId, userType }),
      ).unwrap();

      toast.success(`Successfully uploaded ${vehicles.length} vehicles!`);
      setCsvFile(null);

      setTimeout(() => {
        dispatch(fetchVehicles());
        setRefresh((prev) => !prev);
      }, 1000);
    } catch (err) {
      console.error("CSV upload error:", err);
      toast.error("CSV upload failed: " + (err.message || "Unknown error"));
    } finally {
      setCsvUploading(false);
    }
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const viewImage = (imageUrl) => {
    setSelectedImageForView(imageUrl);
    setShowImageModal(true);
  };

  const filteredVehicles = Array.isArray(list)
    ? list.filter(
        (vehicle) =>
          (vehicle.country || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (vehicle.vehicle || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (vehicle.model || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (vehicle.manufacturer || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      )
    : [];

  const approvedVehicles = filteredVehicles.filter((v) => v.isApproved);
  const unapprovedVehicles = filteredVehicles.filter((v) => !v.isApproved);
  const currentVehicles =
    activeTab === "unapproved" ? unapprovedVehicles : approvedVehicles;

  const totalPages = Math.ceil(currentVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVehicles = currentVehicles.slice(startIndex, endIndex);
  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    const scrollContainer = scrollContainerRef.current;

    const updateScrollerPosition = () => {
      if (!tableContainer || !scrollContainer) return;

      const scrollPercentage =
        tableContainer.scrollLeft /
        (tableContainer.scrollWidth - tableContainer.clientWidth);

      const thumb = scrollContainer.querySelector(".scroller-thumb");
      if (!thumb) return;

      const thumbMinWidth = 30;
      const thumbMaxWidth = scrollContainer.clientWidth * 0.3;
      const thumbWidth = Math.max(thumbMinWidth, thumbMaxWidth);
      thumb.style.width = `${thumbWidth}px`;

      const availableWidth = scrollContainer.clientWidth - thumbWidth;
      thumb.style.left = `${scrollPercentage * availableWidth}px`;
    };

    if (tableContainer) {
      tableContainer.addEventListener("scroll", updateScrollerPosition);
      updateScrollerPosition(); // Initial position

      return () => {
        tableContainer.removeEventListener("scroll", updateScrollerPosition);
      };
    }
  }, [currentVehicles]);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading || isSubmitting}
        className={`px-3 py-1 mx-1 rounded-md transition-colors ${
          currentPage === 1 || loading || isSubmitting
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        <FiChevronLeft />
      </button>,
    );
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded-md transition-colors ${
            currentPage === i
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          disabled={loading || isSubmitting}
        >
          {i}
        </button>,
      );
    }
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading || isSubmitting}
        className={`px-3 py-1 mx-1 rounded-md transition-colors ${
          currentPage === totalPages || loading || isSubmitting
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        <FiChevronRight />
      </button>,
    );
    return pages;
  };

  return (
    <div className="p-6 flex-1 bg-gray-50 min-h-screen bg-theme-bg rounded-2xl">
      {(loading || csvUploading || isSubmitting) && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[10001]">
          <LoadingSpinner size="large" />
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-white">Vehicle Management</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
            disabled={loading || isSubmitting || csvUploading}
          >
            <FiPlus className="text-lg" />
            Add Vehicle
          </button>
          <div className="flex items-center gap-3">
            <label className="relative cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
              <span className="text-sm truncate max-w-[120px] block">
                {csvFile ? csvFile.name : "Bulk Upload"}
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={loading || isSubmitting || csvUploading}
              />
            </label>
            <button
              onClick={handleBulkUpload}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                csvFile && !csvUploading && !isSubmitting && !loading
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!csvFile || csvUploading || isSubmitting || loading}
            >
              <FiUpload className="text-lg" />
              Upload
            </button>
          </div>
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-200 flex items-center gap-1"
          >
            <IoDocumentTextOutline />
            Download Template
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md bg-theme-bg2">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border bg-theme-bg2 placeholder-white border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            disabled={loading || isSubmitting || csvUploading}
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab("unapproved");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 font-medium text-white ${
              activeTab === "unapproved"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600 hover:text-blue-500"
            }`}
          >
            Unapproved ({unapprovedVehicles.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("approved");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 font-medium text-white ${
              activeTab === "approved"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600 hover:text-blue-500"
            }`}
          >
            Approved ({approvedVehicles.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
          Error: {error}
        </div>
      )}

      <div className="hidden md:block overflow-x-auto bg-theme-bg2">
        <div
          ref={tableContainerRef}
          style={{
            scrollbarWidth: "auto", // for Firefox
          }}
          className="w-full overflow-x-auto custom-scrollbar"
        >
          <table className="w-full border border-gray-200 rounded-md shadow-sm bg-white">
            <thead className="bg-theme-bg2 text-white">
              <tr>
                <th className="p-3 border text-sm font-semibold whitespace-nowrap">
                  Images
                </th>
                {/* <th className="p-3 text-sm font-semibold border-r">Country</th> */}
                <th className="p-3 border text-sm font-semibold whitespace-nowrap">
                  Vehicle
                </th>
                <th className="p-3 border text-sm font-semibold whitespace-nowrap">
                  Model
                </th>
                <th className="p-3 border text-sm font-semibold whitespace-nowrap">
                  Registration Plate No.
                </th>
                <th className="p-3 border text-sm font-semibold whitespace-nowrap">
                  Year
                </th>
                <th className="p-3 border text-sm font-semibold whitespace-nowrap">
                  Manufacturer
                </th>
                <th className="p-3 border text-sm font-semibold whitespace-nowrap">
                  Length
                </th>
                <th className="p-3 border text-sm font-semibold whitespace-nowrap">
                  Width
                </th>
                <th className="p-3 border text-sm font-semibold whitespace-nowrap">
                  Height
                </th>
                <th className="p-3 border text-sm font-semibold whitespace-nowrap">
                  Wheelbase
                </th>
                <th className="p-3 border text-sm font-semibold whitespace-nowrap">
                  Curb Weight
                </th>
                <th className="p-3 border text-sm font-semibold whitespace-nowrap">
                  Engine Size
                </th>
                <th className="p-3 border text-sm font-semibold whitespace-nowrap">
                  Cab Width
                </th>
                <th className="p-3 border text-sm font-semibold whitespace-nowrap">
                  Cab Height
                </th>
                <th className="p-3 border text-sm font-semibold whitespace-nowrap">
                  Bonnet Width
                </th>
                <th className="p-3 border text-sm font-semibold whitespace-nowrap">
                  Bonnet Length
                </th>
                <th className="p-3 border text-sm font-semibold whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-theme-bg2 text-white">
              {paginatedVehicles.length > 0 ? (
                paginatedVehicles.map((v) => (
                  <tr key={v._id} className="hover:bg-theme-bg">
                    <td className="p-3 border-r text-sm w-48">
                      {v.images && v.images.length > 0 ? (
                        <div className="flex items-center gap-2 overflow-x-auto">
                          {v.images.slice(0, 3).map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt={`Vehicle ${index + 1}`}
                              className="w-12 h-12 object-cover rounded-md cursor-pointer hover:opacity-80"
                              onClick={() => viewImage(img)}
                            />
                          ))}
                          {v.images.length > 3 && (
                            <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-600 font-semibold text-sm">
                              +{v.images.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                          <FiImage className="text-gray-400" size={20} />
                        </div>
                      )}
                    </td>
                    {/* <td className="p-3 border-r text-sm">{v.country || "-"}</td> */}
                    <td className="p-3 border-r text-sm">{v.vehicle || "-"}</td>
                    <td className="p-3 border-r text-sm">{v.model || "-"}</td>
                    <td className="p-3 border text-sm">
                      {v.registrationPlate || "-"}
                    </td>
                    <td className="p-3 border-r text-sm">
                      {v.yearOfManufacture || "-"}
                    </td>
                    <td className="p-3 border-r text-sm">
                      {v.manufacturer || "-"}
                    </td>
                    <td className="p-3 border-r text-sm">
                      {v.dimensions?.length || v.length || "-"}
                    </td>
                    <td className="p-3 border-r text-sm">
                      {v.dimensions?.width || v.width || "-"}
                    </td>
                    <td className="p-3 border-r text-sm">
                      {v.dimensions?.height || v.height || "-"}
                    </td>
                    <td className="p-3 border-r text-sm">
                      {v.dimensions?.wheelbase || v.wheelbase || "-"}
                    </td>
                    <td className="p-3 border-r text-sm">
                      {v.dimensions?.curbWeight || v.curbWeight || "-"}
                    </td>
                    <td className="p-3 border-r text-sm">
                      {v.dimensions?.engineSize || v.engineSize || "-"}
                    </td>
                    <td className="p-3 border-r text-sm">
                      {v.dimensions?.cabwidth || v.cabwidth || "-"}
                    </td>
                    <td className="p-3 border-r text-sm">
                      {v.dimensions?.cabheight || v.cabheight || "-"}
                    </td>
                    <td className="p-3 border-r text-sm">
                      {v.dimensions?.bonnetwidth || v.bonnetwidth || "-"}
                    </td>
                    <td className="p-3 border-r text-sm">
                      {v.dimensions?.bonnetLength || v.bonnetLength || "-"}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {!v.isApproved && (
                          <button
                            onClick={() => handleApprove(v._id)}
                            className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                            disabled={loading || isSubmitting || csvUploading}
                          >
                            <FiCheck className="text-sm" />
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(v)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50"
                          disabled={loading || isSubmitting || csvUploading}
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(v._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                          disabled={loading || isSubmitting || csvUploading}
                        >
                          <FiTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="17" className="p-4 text-center text-gray-500">
                    {searchTerm
                      ? "No vehicles found matching your search"
                      : "No vehicles found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4">
          {paginatedVehicles.length > 0 ? (
            paginatedVehicles.map((v) => (
              <div
                key={v._id}
                className="bg-white border border-gray-200 rounded-md p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {v.vehicle || "Unknown Vehicle"}
                    </h3>
                    <p className="text-md text-gray-700">
                      {v.model || "Unknown Model"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {v.manufacturer || "Unknown Manufacturer"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!v.isApproved && (
                      <button
                        onClick={() => handleApprove(v._id)}
                        className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                        disabled={loading || isSubmitting || csvUploading}
                      >
                        <FiCheck className="text-sm" />
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(v)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50"
                      disabled={loading || isSubmitting || csvUploading}
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(v._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                      disabled={loading || isSubmitting || csvUploading}
                    >
                      <FiTrash />
                    </button>
                  </div>
                </div>
                {v.images && v.images.length > 0 && (
                  <div className="mb-3 flex gap-2 flex-wrap">
                    {v.images.slice(0, 4).map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt="Vehicle"
                        className="w-16 h-16 object-cover rounded-md cursor-pointer hover:opacity-80"
                        onClick={() => viewImage(img)}
                      />
                    ))}
                    {v.images.length > 4 && (
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-sm">
                        +{v.images.length - 4}
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {/* <div>
                  <span className="font-medium">Country:</span>{" "}
                  {v.country || "-"}
                </div> */}
                  <div>
                    <span className="font-medium">Year:</span>{" "}
                    {v.yearOfManufacture || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Length:</span>{" "}
                    {v.dimensions?.length || v.length || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Width:</span>{" "}
                    {v.dimensions?.width || v.width || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Height:</span>{" "}
                    {v.dimensions?.height || v.height || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Wheelbase:</span>{" "}
                    {v.dimensions?.wheelbase || v.wheelbase || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Curb Weight:</span>{" "}
                    {v.dimensions?.curbWeight || v.curbWeight || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Engine Size:</span>{" "}
                    {v.dimensions?.engineSize || v.engineSize || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Cab Width:</span>{" "}
                    {v.dimensions?.cabwidth || v.cabwidth || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Cab Height:</span>{" "}
                    {v.dimensions?.cabheight || v.cabheight || "-"}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Bonnet Width:</span>{" "}
                    {v.dimensions?.bonnetwidth || v.bonnetwidth || "-"}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Bonnet Length:</span>{" "}
                    {v.dimensions?.bonnetLength || v.bonnetLength || "-"}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm
                ? "No vehicles found matching your search"
                : "No vehicles found"}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, currentVehicles.length)} of{" "}
              {currentVehicles.length} vehicles
            </div>
            <div className="flex justify-center flex-wrap gap-1">
              {renderPagination()}
            </div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-theme-bg rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    {isEditMode ? "Edit Vehicle" : "Add Vehicle"}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:text-white"
                    disabled={isSubmitting}
                  >
                    <FiX size={24} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="border-2 border-dashed border-gray-200 rounded-md p-4">
                    <h4 className="text-md font-semibold mb-3 text-white">
                      Vehicle Images {isEditMode ? "(Optional)" : "(Required)"}
                    </h4>
                    <div className="flex flex-col gap-4">
                      <label className="cursor-pointer bg-theme-bg2 hover:bg-theme-bg border-2 border-blue-200 rounded-md p-4 text-center transition-colors">
                        <FiUpload className="mx-auto mb-2 text-2xl text-blue-500" />
                        <span className="text-blue-600 font-medium">
                          Upload Images (Max 5)
                        </span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          disabled={isSubmitting}
                        />
                      </label>
                      {imagePreviewUrls.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                          {imagePreviewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={isSubmitting}
                              >
                                <FiX size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* <div>
 
  <select
    value={formData.country}
    onChange={(e) => {
      setFormData((prev) => ({ ...prev, country: e.target.value }));
    }}
    required
    disabled={isSubmitting}
    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-bg2 text-white"
  >
    <option value="">Select Vehicle Manufacture Country</option>
    {worldData
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name)) // A to Z sorted
      .map((country) => (
        <option key={country.id} value={country.name}>
          {country.name}
        </option>
      ))}
  </select>
</div> */}
                    <input
                      name="vehicle"
                      value={formData.vehicle}
                      onChange={handleChange}
                      placeholder="Vehicle"
                      className="bg-theme-bg2  text-white border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isSubmitting}
                    />
                    <input
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      placeholder="Model"
                      className="bg-theme-bg2  text-white border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isSubmitting}
                    />
                    <input
                      name="yearOfManufacture"
                      value={formData.yearOfManufacture}
                      onChange={handleChange}
                      placeholder="Year of Manufacture"
                      type="number"
                      min="1"
                      step={1}
                      className="bg-theme-bg2  text-white border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isSubmitting}
                    />
                    <input
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleChange}
                      placeholder="Manufacturer"
                      className="bg-theme-bg2  text-white border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isSubmitting}
                    />
                    <div className="relative">
                      <input
                        name="length"
                        value={formData.dimensions.length}
                        onChange={handleChange}
                        placeholder="Length (cm)"
                        type="number"
                        min="1"
                        step="1"
                        className="bg-theme-bg2 text-white  border border-gray-300 p-3 pr-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                        disabled={isSubmitting}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2  text-white">
                        cm
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        name="width"
                        value={formData.dimensions.width}
                        onChange={handleChange}
                        placeholder="Width (cm)"
                        type="number"
                        min={1}
                        step="1"
                        className="bg-theme-bg2 border  text-white border-gray-300 p-3 pr-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                        disabled={isSubmitting}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2  text-white">
                        cm
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        name="height"
                        value={formData.dimensions.height}
                        onChange={handleChange}
                        placeholder="Height (cm)"
                        type="number"
                        min={1}
                        step="1"
                        className=" bg-theme-bg2  text-white border border-gray-300 p-3 pr-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                        disabled={isSubmitting}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2  text-white">
                        cm
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        name="wheelbase"
                        value={formData.dimensions.wheelbase}
                        onChange={handleChange}
                        placeholder="Wheelbase (cm)"
                        type="number"
                        min={1}
                        step="1"
                        className="bg-theme-bg2  text-white border border-gray-300 p-3 pr-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                        disabled={isSubmitting}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2  text-white">
                        cm
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        name="curbWeight"
                        value={formData.dimensions.curbWeight}
                        onChange={handleChange}
                        placeholder="Curb Weight (kg)"
                        type="number"
                        min="1000"
                        step="50"
                        className="bg-theme-bg2 border  text-white border-gray-300 p-3 pr-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                        disabled={isSubmitting}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2  text-white">
                        kg
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        name="engineSize"
                        value={formData.dimensions.engineSize}
                        onChange={handleChange}
                        placeholder="Engine Size (cc)"
                        type="text"
                        step="1"
                        min="1000"
                        className="bg-theme-bg2  text-white border border-gray-300 p-3 pr-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                        disabled={isSubmitting}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2  text-white">
                        cc
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        name="cabwidth"
                        value={formData.dimensions.cabwidth}
                        onChange={handleChange}
                        placeholder="Cab Width (cm)"
                        type="number"
                        step="1"
                        min={1}
                        className="bg-theme-bg2  text-white border border-gray-300 p-3 pr-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                        disabled={isSubmitting}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2  text-white">
                        cm
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        name="cabheight"
                        value={formData.dimensions.cabheight}
                        onChange={handleChange}
                        placeholder="Cab Height (cm)"
                        type="number"
                        min={1}
                        step="1"
                        className=" text-white bg-theme-bg2 border border-gray-300 p-3 pr-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                        disabled={isSubmitting}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2  text-white">
                        cm
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        name="bonnetwidth"
                        value={formData.dimensions.bonnetwidth}
                        onChange={handleChange}
                        placeholder="Bonnet Width (cm)"
                        type="number"
                        step="1"
                        min={1}
                        className="bg-theme-bg2 text-white border border-gray-300 p-3 pr-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                        disabled={isSubmitting}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2  text-white">
                        cm
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        name="bonnetLength"
                        value={formData.dimensions.bonnetLength}
                        onChange={handleChange}
                        placeholder="Bonnet Length (cm)"
                        type="number"
                        step="1"
                        min={1}
                        className="bg-theme-bg2 text-white  border border-gray-300 p-3 pr-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                        disabled={isSubmitting}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white">
                        cm
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner size="small" />
                          Saving...
                        </>
                      ) : isEditMode ? (
                        "Update"
                      ) : (
                        "Add"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showImageModal && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[9999] p-4">
            <div className="relative max-w-4xl max-h-[90vh]">
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300"
                disabled={isSubmitting}
              >
                <FiX size={24} />
              </button>
              <img
                src={selectedImageForView}
                alt="Vehicle"
                className="max-w-full max-h-[85vh] object-contain rounded-md"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddVehicleForm;
