import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  fetchVehicles,
  createVehiclebyfleetower,
  deleteVehicle,
  fetchVehiclesbyfleetOwner,
  updateVehicle,
  uploadVehicleCSVByFleetOwner,
  deleteVehiclbyfleetower,
} from "../store/vehicle/vehicleSlice";
import { getAllUsers } from "../store/user/userSlice";
import {
  getPublicGifs,
  trackImpression,
  trackClick,
} from "../store/gif/gifSlice";
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
} from "react-icons/fi";
import { IoCloudUploadOutline, IoDocumentTextOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImageSlider from "./ImageSlider";
import measurementGuide from "../assets/Dimension labeled_page-0001.jpg";
import worldData from "../countries+states+cities.json";
import { HeaderLeaderboard } from "./AdSlots";

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

const AddVehicleDimensions = () => {
  const tableContainerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    list = [],
    fleetvehclelist = [],
    loading = false,
    error = null,
  } = useSelector((state) => state.vehicles || {});

  const { user } = useSelector((state) => state.auth);
  const { publicGifs, loading: gifLoading } = useSelector((state) => state.gif);

  const [formData, setFormData] = useState({
    _id: null,
    country: "",
    vehicle: "",
    model: "",
    yearOfManufacture: "",
    manufacturer: "",
    registrationPlate: "",
    dailyMileage: "",
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
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageForView, setSelectedImageForView] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [showMeasurementGuide, setShowMeasurementGuide] = useState(false);
  const [showGifModal, setShowGifModal] = useState(false);
  const [currentGifPage, setCurrentGifPage] = useState(1);
  const [approvedVehicles, setApprovedVehicles] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [filteredVehicleTypes, setFilteredVehicleTypes] = useState([]);
  const [autoSelectedImages, setAutoSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [showTemplateGuide, setShowTemplateGuide] = useState(false);
  const [filteredModels, setFilteredModels] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  const [filteredYears, setFilteredYears] = useState([]);
  const [filteredManufacturers, setFilteredManufacturers] = useState([]);
  const gifsPerPage = 20;
  const fleetOwnerId = user?._id;

  useEffect(() => {
    dispatch(getPublicGifs());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  useEffect(() => {
    if (fleetOwnerId) {
      dispatch(fetchVehiclesbyfleetOwner(fleetOwnerId));
    }
  }, [fleetOwnerId, dispatch]);

  useEffect(() => {
    if (!Array.isArray(list)) return;

    const approved = list.filter((v) => {
      if (!v || typeof v !== "object") return false;
      const isApproved = v?.isApproved === true;
      const addedBy = v?.addedBy?.toString();
      const fleetOwner = v?.fleetOwner?.toString();
      return (
        isApproved &&
        addedBy !== fleetOwnerId &&
        (!fleetOwner || fleetOwner !== fleetOwnerId)
      );
    });

    setApprovedVehicles(approved);
    const uniqueMfg = [
      ...new Set(approved.map((v) => v.manufacturer).filter(Boolean)),
    ].sort();
    setFilteredManufacturers(uniqueMfg);
  }, [list, fleetOwnerId]);

  useEffect(() => {
    if (selectedCountry && approvedVehicles.length > 0) {
      const vehiclesInCountry = approvedVehicles.filter(
        (v) => v.country === selectedCountry,
      );

      // Get unique vehicle types
      const uniqueVehicleTypes = [
        ...new Set(vehiclesInCountry.map((v) => v.vehicle)),
      ];
      setFilteredVehicleTypes(uniqueVehicleTypes);
    } else {
      setFilteredVehicleTypes([]);
    }
  }, [selectedCountry, approvedVehicles]);

  // Auto-fill form when vehicle type is selected
  const handleVehicleTypeSelect = (vehicleType) => {
    if (!vehicleType || !selectedCountry) return;

    // Find the vehicle data
    const vehicleData = approvedVehicles.find(
      (v) => v.vehicle === vehicleType && v.country === selectedCountry,
    );

    if (vehicleData) {
      setFormData((prev) => ({
        ...prev,
        vehicle: vehicleData.vehicle,
        model: vehicleData.model,
        yearOfManufacture: vehicleData.yearOfManufacture,
        manufacturer: vehicleData.manufacturer,
        dimensions: {
          length: vehicleData.dimensions?.length || "",
          width: vehicleData.dimensions?.width || "",
          height: vehicleData.dimensions?.height || "",
          wheelbase: vehicleData.dimensions?.wheelbase || "",
          curbWeight: vehicleData.dimensions?.curbWeight || "",
          engineSize: vehicleData.dimensions?.engineSize || "",
          cabwidth: vehicleData.dimensions?.cabwidth || "",
          cabheight: vehicleData.dimensions?.cabheight || "",
          bonnetwidth: vehicleData.dimensions?.bonnetwidth || "",
          bonnetLength: vehicleData.dimensions?.bonnetLength || "",
        },
        // Registration plate is NOT auto-filled
      }));

      if (vehicleData.images && vehicleData.images.length > 0) {
        setAutoSelectedImages(vehicleData.images);
      } else {
        setAutoSelectedImages([]);
      }

      toast.success(
        "Vehicle data auto-filled! Please enter registration plate and Daily Mileage.",
      );
    }
  };

  const handleGifClick = (gifId) => {
    dispatch(trackImpression(gifId));
    dispatch(trackClick(gifId));
    navigate(`/gif-details/${gifId}`);
  };

  const filteredVehicles = Array.isArray(fleetvehclelist)
    ? fleetvehclelist
        .slice() // Create a copy to avoid mutating original
        .reverse() // Reverse to show latest first
        .filter((vehicle) => {
          if (!vehicle || typeof vehicle !== "object") return false;
          if (!searchTerm) return true;
          const searchLower = searchTerm.toLowerCase();
          return (
            // (vehicle.country || "").toLowerCase().includes(searchLower) ||
            (vehicle.vehicle || "").toLowerCase().includes(searchLower) ||
            (vehicle.model || "").toLowerCase().includes(searchLower) ||
            (vehicle.manufacturer || "").toLowerCase().includes(searchLower) ||
            (vehicle.registrationPlate || "")
              .toLowerCase()
              .includes(searchLower) ||
            (vehicle.dailyMileage || "").toString().includes(searchLower)
          );
        })
    : [];

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

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
      updateScrollerPosition();

      return () => {
        tableContainer.removeEventListener("scroll", updateScrollerPosition);
      };
    }
  }, [currentVehicles]);
  const handleOpenTemplateGuide = () => {
    setShowTemplateGuide(true);
  };
  const downloadTemplate = () => {
    // Display headers (shown in Excel - professional formatting)
    const displayHeaders = [
      "Vehicle",
      "Model",
      "Year Of Manufacture",
      "Manufacturer",
      "Registration Plate",
      "Daily Mileage (km/day)",
      "Length (cm)",
      "Width (cm)",
      "Height (cm)",
      "Wheelbase (cm)",
      "Curb Weight (kg)",
      "Engine Size",
      "Cab Width (cm)",
      "Cab Height (cm)",
      "Bonnet Width (cm)",
      "Bonnet Length (cm)",
      "Image URL 1",
      "Image URL 2",
      "Image URL 3",
      "Image URL 4",
      "Image URL 5",
    ];

    // Actual CSV keys used by the parser (must match exactly)
    const csvKeys = [
      "vehicle",
      "model",
      "yearOfManufacture",
      "manufacturer",
      "registrationPlate",
      "dailyMileage",
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
      "Outlander",
      "CX5",
      "2023",
      "Mitsubishi",
      "MH02AB1234",
      "150",
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

    const escapeCSV = (value) => {
      if (value === "" || value === null || value === undefined) return "";
      const str = String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const instructions = [
      "# Vehicle Bulk Upload Template",
      "# All dimensions in centimeters (cm) except Curb Weight (kg) and Engine Size (text)",
      "# IMPORTANT: Delete all instruction rows (lines starting with #) before uploading",
      "# Row 1 (after instructions) = display capital headers — Delete before uploading",
      "# Row 2 (after instructions) = actual CSV keys — DO NOT delete or edit",
      "# Row 3 onwards = your vehicle data",
      "#",
    ].join("\n");

    const displayHeaderRow = displayHeaders.map(escapeCSV).join(",");
    const csvKeyRow = csvKeys.map(escapeCSV).join(",");
    const dataRow = sampleRow.map(escapeCSV).join(",");

    const csvContent = [
      instructions,
      displayHeaderRow,
      csvKeyRow,
      dataRow,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "vehicle_bulk_upload_template.csv");

    toast.success(
      "Template downloaded! Delete instruction lines (starting with #) before uploading.",
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "dailyMileage") {
      const numericValue = value.replace(/[^\d.]/g, "");

      const parts = numericValue.split(".");
      const sanitizedValue =
        parts.length > 2
          ? parts[0] + "." + parts.slice(1).join("")
          : numericValue;

      setFormData((prev) => ({
        ...prev,
        [name]: sanitizedValue,
      }));
    } else if (name in formData.dimensions) {
      setFormData((prev) => ({
        ...prev,
        dimensions: { ...prev.dimensions, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
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

      vehicle: "",
      model: "",
      yearOfManufacture: "",
      manufacturer: "",
      registrationPlate: "",
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
    // setSelectedCountry("");
    setFilteredVehicleTypes([]);
    setAutoSelectedImages([]);
  };
  const handleVehicleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      vehicle: type,
      model: "",
      yearOfManufacture: "",
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
    }));

    if (type && formData.manufacturer && approvedVehicles.length > 0) {
      const filtered = approvedVehicles.filter(
        (v) => v.manufacturer === formData.manufacturer && v.vehicle === type,
      );
      const models = [...new Set(filtered.map((v) => v.model))].sort();
      setFilteredModels(models);
    } else {
      setFilteredModels([]);
    }

    setAutoSelectedImages([]);
  };

  const handleModelChange = (model) => {
    if (
      model &&
      formData.manufacturer &&
      formData.vehicle &&
      approvedVehicles.length > 0
    ) {
      const filteredVehicles = approvedVehicles.filter(
        (v) =>
          v.manufacturer === formData.manufacturer &&
          v.vehicle === formData.vehicle &&
          v.model === model,
      );

      // मॉडल के आधार पर वर्ष फ़िल्टर करें
      const years = [
        ...new Set(filteredVehicles.map((v) => v.yearOfManufacture)),
      ].sort();
      setFilteredYears(years);

      // पहला मिलान ढूँढें (auto-fill के लिए)
      const match = filteredVehicles[0];
      if (match) {
        setFormData((prev) => ({
          ...prev,
          model,
          yearOfManufacture: match.yearOfManufacture || "",
          dimensions: {
            length: match.dimensions?.length || "",
            width: match.dimensions?.width || "",
            height: match.dimensions?.height || "",
            wheelbase: match.dimensions?.wheelbase || "",
            curbWeight: match.dimensions?.curbWeight || "",
            engineSize: match.dimensions?.engineSize || "",
            cabwidth: match.dimensions?.cabwidth || "",
            cabheight: match.dimensions?.cabheight || "",
            bonnetwidth: match.dimensions?.bonnetwidth || "",
            bonnetLength: match.dimensions?.bonnetLength || "",
          },
        }));

        setAutoSelectedImages(match.images?.filter(Boolean) || []);
        toast.success("Vehicle details auto-filled!");
      } else {
        // अगर match नहीं मिला
        setFormData((prev) => ({
          ...prev,
          model,
          yearOfManufacture: "",
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
        }));
        setAutoSelectedImages([]);
      }
    } else {
      // Fallback
      setFormData((prev) => ({
        ...prev,
        model,
        yearOfManufacture: "",
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
      }));
      setAutoSelectedImages([]);
      setFilteredYears([]);
    }
  };
  const handleYearOfManufactureChange = (year) => {
    if (
      year &&
      formData.manufacturer &&
      formData.vehicle &&
      formData.model &&
      approvedVehicles.length > 0
    ) {
      const match = approvedVehicles.find(
        (v) =>
          v.manufacturer === formData.manufacturer &&
          v.vehicle === formData.vehicle &&
          v.model === formData.model &&
          v.yearOfManufacture === year,
      );

      if (match) {
        setFormData((prev) => ({
          ...prev,
          yearOfManufacture: year,
          dimensions: {
            length: match.dimensions?.length || "",
            width: match.dimensions?.width || "",
            height: match.dimensions?.height || "",
            wheelbase: match.dimensions?.wheelbase || "",
            curbWeight: match.dimensions?.curbWeight || "",
            engineSize: match.dimensions?.engineSize || "",
            cabwidth: match.dimensions?.cabwidth || "",
            cabheight: match.dimensions?.cabheight || "",
            bonnetwidth: match.dimensions?.bonnetwidth || "",
            bonnetLength: match.dimensions?.bonnetLength || "",
          },
        }));

        if (match.images && match.images.length > 0) {
          setAutoSelectedImages(match.images);
        } else {
          setAutoSelectedImages([]);
        }

        toast.success(`Dimensions loaded for ${year} model`);
      } else {
        setFormData((prev) => ({
          ...prev,
          yearOfManufacture: year,
        }));
        //toast.info("No dimension data available for this year");
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        yearOfManufacture: year,
      }));
    }
  };

  const handleManufacturerChange = (mfg) => {
    setFormData((prev) => ({
      ...prev,
      manufacturer: mfg,
      vehicle: "",
      model: "",
      yearOfManufacture: "",
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
    }));

    if (mfg && approvedVehicles.length > 0) {
      const mfgVehicles = approvedVehicles.filter(
        (v) => v.manufacturer === mfg,
      );
      const types = [...new Set(mfgVehicles.map((v) => v.vehicle))].sort();
      setFilteredVehicleTypes(types);
    } else {
      setFilteredVehicleTypes([]);
    }

    setFilteredModels([]);
    setAutoSelectedImages([]);
  };
  const openAddModal = () => {
    setIsEditMode(false);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (vehicle) => {
    setIsEditMode(true);
    setFormData({
      ...vehicle,
      registrationPlate: vehicle.registrationPlate || "",
      dimensions: {
        length: vehicle.dimensions?.length || "",
        width: vehicle.dimensions?.width || "",
        height: vehicle.dimensions?.height || "",
        wheelbase: vehicle.dimensions?.wheelbase || "",
        curbWeight: vehicle.dimensions?.curbWeight || "",
        engineSize: vehicle.dimensions?.engineSize || "",
        cabwidth: vehicle.dimensions?.cabwidth || "",
        cabheight: vehicle.dimensions?.cabheight || "",
        bonnetwidth: vehicle.dimensions?.bonnetwidth || "",
        bonnetLength: vehicle.dimensions?.bonnetLength || "",
      },
    });
    // setSelectedCountry(vehicle.country);
    if (vehicle.images && vehicle.images.length > 0) {
      setAutoSelectedImages(vehicle.images);
    } else {
      setAutoSelectedImages([]);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fleetOwnerId) {
      toast.error("Fleet Owner not found");
      return;
    }
    const cleanRegistrationPlate = formData.registrationPlate
      .trim()
      .toUpperCase();
    const isDuplicate = fleetvehclelist.some(
      (v) =>
        v._id !== formData._id &&
        v.registrationPlate?.toUpperCase() === cleanRegistrationPlate,
    );

    // if (isDuplicate) {
    //   toast.error(
    //     `Vehicle with registration plate "${cleanRegistrationPlate}" already exists in your fleet.`,
    //   );
    //   return;
    // }

    if (
      // !formData.country ||
      !formData.vehicle ||
      !formData.model ||
      !formData.yearOfManufacture ||
      !formData.manufacturer ||
      !formData.registrationPlate ||
      !formData.dailyMileage
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (isNaN(formData.dailyMileage) || Number(formData.dailyMileage) < 1) {
      toast.error("Daily Mileage must be a valid number greater than 0");
      return;
    }
    const dimensions = formData.dimensions;

    if (!dimensions.engineSize || dimensions.engineSize.trim() === "") {
      toast.error("Engine Size is required (e.g., 2.0L 4-Cylinder Diesel)");
      return;
    }

    const requiredDimensionFields = [
      "length",
      "width",
      "height",
      "cabwidth",
      "cabheight",
      "bonnetwidth",
      "bonnetLength",
    ];

    for (const key of requiredDimensionFields) {
      const value = dimensions[key];
      if (!value || value === "" || isNaN(value) || Number(value) < 0) {
        toast.error(
          `${key.charAt(0).toUpperCase() + key.slice(1)} is required and must be a valid number`,
        );
        return;
      }
    }

    if (
      dimensions.curbWeight &&
      (isNaN(dimensions.curbWeight) || Number(dimensions.curbWeight) < 500)
    ) {
      toast.error("Curb weight should be realistic (500kg+)");
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
      submitFormData.append(
        "registrationPlate",
        formData.registrationPlate.trim().toUpperCase(),
      );
      submitFormData.append("dailyMileage", formData.dailyMileage);
      Object.entries(formData.dimensions).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          if (key === "engineSize") {
            submitFormData.append(`dimensions[${key}]`, String(value).trim());
          } else {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              submitFormData.append(`dimensions[${key}]`, numValue.toString());
            }
          }
        }
      });

      if (autoSelectedImages.length > 0) {
        autoSelectedImages.forEach((imageUrl, index) => {
          submitFormData.append(`images[${index}]`, imageUrl);
        });
      }

      if (isEditMode) {
        await dispatch(
          updateVehicle({ id: formData._id, data: submitFormData }),
        ).unwrap();
        toast.success("Vehicle updated successfully!");
      } else {
        await dispatch(
          createVehiclebyfleetower({ fleetOwnerId, formData: submitFormData }),
        ).unwrap();
        toast.success("Vehicle added successfully!");
      }

      setShowModal(false);
      resetForm();
      await dispatch(fetchVehiclesbyfleetOwner(fleetOwnerId));
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Error saving vehicle: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id || typeof id !== "string") {
      console.error("Cannot delete: Invalid vehicle ID", id);
      toast.error("Cannot delete vehicle – invalid ID");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this vehicle?")) {
      return;
    }

    try {
      await dispatch(deleteVehiclbyfleetower(id)).unwrap();
      toast.success("Vehicle deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(
        "Error deleting vehicle: " + (err.message || "Unknown error"),
      );
    }
  };
  const parseCSV = async (file) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((line) => {
      const trimmed = line.trim();
      return trimmed !== "" && !trimmed.startsWith("#");
    });

    if (lines.length < 2) {
      throw new Error(
        "CSV file must have at least a header row and one data row",
      );
    }

    const parseLine = (line) => {
      const result = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    // Actual CSV keys jo parser samjhta hai
    const KNOWN_KEYS = [
      "vehicle",
      "model",
      "yearOfManufacture",
      "manufacturer",
      "registrationPlate",
      "dailyMileage",
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

    // Wo row dhundo jisme actual CSV keys hain
    let headerRowIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      const cols = parseLine(lines[i]).map((c) => c.trim());
      const matchCount = cols.filter((c) => KNOWN_KEYS.includes(c)).length;
      if (matchCount >= 5) {
        // kam se kam 5 keys match honi chahiye
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error(
        "Could not find valid header row with CSV keys (e.g. vehicle, model, dimensions.length...)",
      );
    }

    const headers = parseLine(lines[headerRowIndex]).map((c) => c.trim());
    const dataRows = lines.slice(headerRowIndex + 1).map(parseLine);

    const rows = dataRows.map((row) => {
      const rowObj = {};
      headers.forEach((header, i) => {
        rowObj[header] = row[i] || "";
      });
      return rowObj;
    });

    return { headers, rows };
  };
  // const handleCountryChange = (e) => {
  //     const country = e.target.value;
  //     setSelectedCountry(country);
  //     setFormData(prev => ({ ...prev, country }));
  //   };
  const handleBulkUpload = async () => {
    if (!csvFile) return toast.error("Please select a CSV file first.");
    if (!fleetOwnerId) return toast.error("Fleet Owner ID is missing.");

    setCsvUploading(true);

    try {
      const { headers, rows } = await parseCSV(csvFile);

      const normalizeHeader = (h) => {
        return h
          .trim()
          .toLowerCase()
          .replace(/\s*\([^)]*\)/g, "")
          .trim();
      };

      const headerMap = {};
      headers.forEach((h, index) => {
        const normalized = normalizeHeader(h);
        headerMap[normalized] = h;
      });

      const idx = (h) => {
        const normalized = normalizeHeader(h);
        const originalHeader = headerMap[normalized];
        return originalHeader ? headers.indexOf(originalHeader) : -1;
      };

      const requiredHeaders = [
        "vehicle",
        "yearOfManufacture",
        "manufacturer",
        "model",
        "registrationPlate",
        "dailyMileage",
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
      ];

      const missingHeaders = requiredHeaders.filter((h) => idx(h) === -1);
      if (missingHeaders.length) {
        toast.error("Missing headers: " + missingHeaders.join(", "));
        setCsvUploading(false);
        return;
      }

      const vehicles = rows.map((row, rowIndex) => {
        const getRowValue = (headerName) => {
          const normalized = normalizeHeader(headerName);
          const originalHeader = headerMap[normalized];
          return originalHeader ? row[originalHeader] : undefined;
        };

        return {
          rowNumber: rowIndex + 1,
          vehicle: getRowValue("vehicle"),
          yearOfManufacture: getRowValue("yearOfManufacture"),
          manufacturer: getRowValue("manufacturer"),
          model: getRowValue("model"),
          registrationPlate: getRowValue("registrationPlate"),
          dailyMileage: getRowValue("dailyMileage"),
          "dimensions[length]": getRowValue("dimensions.length"),
          "dimensions[width]": getRowValue("dimensions.width"),
          "dimensions[height]": getRowValue("dimensions.height"),
          "dimensions[wheelbase]": getRowValue("dimensions.wheelbase"),
          "dimensions[curbWeight]": getRowValue("dimensions.curbWeight"),
          "dimensions[engineSize]": getRowValue("dimensions.engineSize")
            ? String(getRowValue("dimensions.engineSize")).trim()
            : "",
          "dimensions[cabwidth]": getRowValue("dimensions.cabwidth"),
          "dimensions[cabheight]": getRowValue("dimensions.cabheight"),
          "dimensions[bonnetwidth]": getRowValue("dimensions.bonnetwidth"),
          "dimensions[bonnetLength]": getRowValue("dimensions.bonnetLength"),
          images: headers
            .map((h) => {
              const normalized = normalizeHeader(h);
              return normalized.startsWith("images") ? row[h] : null;
            })
            .filter((x) => x && x.trim().length > 0),
        };
      });

      // ✅ STEP 1: Validate all vehicles data first
      const validationErrors = [];

      for (let i = 0; i < vehicles.length; i++) {
        const v = vehicles[i];
        const requiredFields = [
          "vehicle",
          "yearOfManufacture",
          "manufacturer",
          "model",
          "registrationPlate",
          "dimensions[length]",
          "dimensions[width]",
          "dimensions[height]",
          "dimensions[engineSize]",
          "dimensions[cabwidth]",
          "dimensions[cabheight]",
          "dimensions[bonnetwidth]",
          "dimensions[bonnetLength]",
        ];

        for (const field of requiredFields) {
          if (v[field] === undefined || v[field] === null || v[field] === "") {
            validationErrors.push(`Row ${v.rowNumber}: Missing ${field}`);
            break;
          }

          if (field === "dimensions[engineSize]") {
            if (typeof v[field] !== "string" || v[field] === "") {
              validationErrors.push(
                `Row ${v.rowNumber}: Invalid engine size - must be non-empty text`,
              );
              break;
            }
          } else if (
            field.startsWith("dimensions[") &&
            field !== "dimensions[engineSize]"
          ) {
            const numValue = Number(v[field]);
            if (isNaN(numValue) || numValue < 0) {
              validationErrors.push(
                `Row ${v.rowNumber}: Invalid numeric value for ${field}`,
              );
              break;
            }
          }
        }
      }

      if (validationErrors.length > 0) {
        let errorMsg = `CSV validation failed:\n${validationErrors.slice(0, 5).join("\n")}`;
        if (validationErrors.length > 5) {
          errorMsg += `\n...and ${validationErrors.length - 5} more errors`;
        }
        toast.error(errorMsg);
        setCsvUploading(false);
        return;
      }

      // ✅ STEP 2: Check for duplicates INSIDE CSV (CRITICAL - NO SKIP)
      const plateMap = new Map();
      const csvDuplicates = [];

      for (let i = 0; i < vehicles.length; i++) {
        const v = vehicles[i];
        const plate = v.registrationPlate?.trim().toUpperCase();

        if (!plate) continue;

        if (plateMap.has(plate)) {
          csvDuplicates.push({
            plate: plate,
            row: v.rowNumber,
            previousRow: plateMap.get(plate),
          });
        } else {
          plateMap.set(plate, v.rowNumber);
        }
      }

      if (csvDuplicates.length > 0) {
        const duplicateList = csvDuplicates
          .map(
            (d) =>
              `Row ${d.row}: ${d.plate} (duplicate of row ${d.previousRow})`,
          )
          .join("\n");

        toast.error(
          `CSV contains duplicate registration plates. Please fix before uploading:\n${duplicateList}`,
        );
        setCsvUploading(false);
        return;
      }

      // ✅ STEP 3: Check for duplicates in DATABASE (CRITICAL - NO SKIP)
      const existingVehicles = fleetvehclelist || [];
      const existingPlates = new Set(
        existingVehicles.map((v) => v.registrationPlate?.toUpperCase()),
      );

      const databaseDuplicates = vehicles.filter(
        (v) =>
          v.registrationPlate &&
          existingPlates.has(v.registrationPlate.trim().toUpperCase()),
      );

      if (databaseDuplicates.length > 0) {
        const duplicatePlates = databaseDuplicates
          .map((d) => ` ${d.registrationPlate}`)
          .join("\n");

        toast.error(
          `The following registration plates ${duplicatePlates} already exist in your fleet. Upload cancelled`,
        );
        setCsvUploading(false);
        return;
      }

      // ✅ STEP 4: Only upload if ALL checks pass (ALL-OR-NOTHING)
      try {
        const result = await dispatch(
          uploadVehicleCSVByFleetOwner({
            vehicles,
            fleetOwnerId,
            strictMode: true,
          }),
        ).unwrap();

        if (result.success) {
          toast.success(
            `Upload successful! ${result.summary.saved} vehicles added.`,
          );
          if (result.summary.skipped > 0) {
            toast.warning(`${result.summary.skipped} vehicles were skipped.`);
          }
        } else {
          toast.error(result.message || "Upload failed.");
        }

        setCsvFile(null);
        await dispatch(fetchVehiclesbyfleetOwner(fleetOwnerId));
      } catch (err) {
        console.error("CSV upload error:", err);

        // Redux thunkAPI.rejectWithValue se aaya error directly string/object hota hai
        if (typeof err === "string") {
          toast.error(`Upload failed: ${err}`);
        } else if (err?.message) {
          toast.error(`Upload failed: ${err.message}`);
        } else if (err?.details?.existingDuplicates?.length > 0) {
          const dupPlates = err.details.existingDuplicates
            .map((d) => `${d.plate} (Row ${d.row})`)
            .join(", ");
          toast.error(`Duplicate plates found: ${dupPlates}`);
        } else {
          toast.error("Upload failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("CSV parsing error:", err);
      toast.error("Invalid CSV file: " + (err.message || "Cannot parse CSV"));
    } finally {
      setCsvUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file only");
      e.target.value = null;
      return;
    }
    setCsvFile(file);
  };

  const viewImage = (imageUrl) => {
    setSelectedImageForView(imageUrl);
    setShowImageModal(true);
  };

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
        className={`px-2 py-1 sm:px-3 sm:py-2 mx-1 rounded text-sm ${
          currentPage === 1 || loading || isSubmitting
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
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
          className={`px-2 py-1 sm:px-3 sm:py-2 mx-1 rounded text-sm ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
        className={`px-2 py-1 sm:px-3 sm:py-2 mx-1 rounded text-sm ${
          currentPage === totalPages || loading || isSubmitting
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        <FiChevronRight />
      </button>,
    );
    return pages;
  };

  const gifStartIndex = (currentGifPage - 1) * gifsPerPage;
  const gifEndIndex = gifStartIndex + gifsPerPage;
  const currentGifs = publicGifs.slice(gifStartIndex, gifEndIndex);
  const totalGifPages = Math.ceil(publicGifs.length / gifsPerPage);

  const handleGifPageChange = (page) => {
    setCurrentGifPage(page);
  };

  const renderGifPagination = () => {
    if (totalGifPages <= 1) return null;
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      currentGifPage - Math.floor(maxVisiblePages / 2),
    );
    let endPage = Math.min(totalGifPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    pages.push(
      <button
        key="prev"
        onClick={() => handleGifPageChange(currentGifPage - 1)}
        disabled={currentGifPage === 1 || gifLoading}
        className={`px-2 py-1 sm:px-3 sm:py-2 mx-1 rounded text-sm ${
          currentGifPage === 1 || gifLoading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        <FiChevronLeft />
      </button>,
    );
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handleGifPageChange(i)}
          className={`px-2 py-1 sm:px-3 sm:py-2 mx-1 rounded text-sm ${
            currentGifPage === i
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          disabled={gifLoading}
        >
          {i}
        </button>,
      );
    }
    pages.push(
      <button
        key="next"
        onClick={() => handleGifPageChange(currentGifPage + 1)}
        disabled={currentGifPage === totalGifPages || gifLoading}
        className={`px-2 py-1 sm:px-3 sm:py-2 mx-1 rounded text-sm ${
          currentGifPage === totalGifPages || gifLoading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        <FiChevronRight />
      </button>,
    );
    return pages;
  };

  return (
    <div className="p-4 flex-1 mx-auto relative overflow-x-hidden bg-theme-bg rounded-2xl">
      {showTemplateGuide && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10002] p-3 sm:p-4 cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowTemplateGuide(false);
          }}
        >
          <div className="bg-theme-bg rounded-2xl w-full max-w-[95%] sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl cursor-default border border-gray-700/50">
            {/* Header - Sticky */}
            <div className="sticky top-0 bg-theme-bg z-10 flex justify-between items-center p-4 sm:p-5 border-b border-gray-700">
              <h3 className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-2 text-white">
                <span className="text-xl sm:text-2xl">📋</span>
                <span className="hidden sm:inline">CSV Upload Guide</span>
                <span className="inline sm:hidden">Guide</span>
              </h3>
              <button
                onClick={() => setShowTemplateGuide(false)}
                className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
              {/* Step 1 - How to fill CSV */}
              <div className="bg-blue-900/20 border border-blue-500/30 p-3 sm:p-4 rounded-xl hover:bg-blue-900/30 transition-colors">
                <p className="text-sm sm:text-base font-bold mb-2 flex items-center gap-2 text-blue-300">
                  <span className="text-base sm:text-lg">📌</span>
                  <span>How to fill CSV:</span>
                </p>
                <ol className="text-xs sm:text-sm space-y-1.5 pl-4 sm:pl-5 list-decimal text-gray-200">
                  <li className="leading-relaxed">
                    Row 1 (after instructions) = DISPLAY CAPITAL HEADERS
                    <span className="text-red-400">
                      (delete before uploading)
                    </span>
                  </li>

                  <li className="leading-relaxed">
                    Row 2 (after instructions) = ACTUAL CSV KEYS
                    <span className="text-yellow-400">
                      (don't delete or edit)
                    </span>
                  </li>

                  <li className="leading-relaxed">Add one vehicle per row</li>

                  <li className="leading-relaxed">Fill all required fields</li>

                  <li className="leading-relaxed">
                    Delete instruction lines before upload
                  </li>
                </ol>
              </div>

              {/* Step 2 - Important Image Warning */}
              <div className="bg-red-900/20 border-l-4 border-red-500 p-3 sm:p-4 rounded-r-xl">
                <p className="text-sm sm:text-base font-bold text-red-300 mb-1 flex items-center gap-2">
                  <span className="text-base sm:text-lg">⚠️</span>
                  <span>Important for Images:</span>
                </p>
                <p className="text-xs sm:text-sm text-red-200 leading-relaxed">
                  CSV file{" "}
                  <strong className="text-red-400">
                    cannot upload PNG/JPG directly
                  </strong>
                  .<br />
                  You{" "}
                  <strong className="text-yellow-400">
                    MUST use Image URLs
                  </strong>{" "}
                  <span className="text-gray-400">(.jpg, .png, .jpeg)</span>
                </p>
              </div>

              {/* Step 3 - How to get Image URL */}
              <div className="bg-purple-900/20 border border-purple-500/30 p-3 sm:p-4 rounded-xl hover:bg-purple-900/30 transition-colors">
                <p className="text-sm sm:text-base font-bold mb-2 flex items-center gap-2 text-purple-300">
                  <span className="text-base sm:text-lg">🖼️</span>
                  <span>How to get Image URL:</span>
                </p>
                <ol className="text-xs sm:text-sm space-y-1.5 pl-4 sm:pl-5 list-decimal text-gray-200">
                  <li className="leading-relaxed">
                    Upload image to{" "}
                    <span className="text-blue-300 font-medium">Imgur.com</span>{" "}
                    or{" "}
                    <span className="text-blue-300 font-medium">
                      Postimages.org
                    </span>
                  </li>
                  <li className="leading-relaxed">
                    Copy the{" "}
                    <strong className="text-yellow-400">
                      direct image link
                    </strong>
                  </li>
                  <li className="leading-relaxed">
                    Paste link in CSV (
                    <span className="text-green-400">images[0]</span>,{" "}
                    <span className="text-green-400">images[1]</span>)
                  </li>
                </ol>
                <div className="mt-3 p-2 sm:p-3 bg-gray-800/70 rounded-lg border border-gray-700">
                  <span className="text-green-400 text-xs sm:text-sm font-medium block mb-1">
                    ✅ Example URL:
                  </span>
                  <code className="block text-xs text-yellow-300 break-all bg-gray-900/50 p-2 rounded font-mono">
                    https://i.imgur.com/AbCdEfG.jpg
                  </code>
                </div>
              </div>

              {/* Step 4 - Alternative Method */}
              <div className="bg-green-900/20 border border-green-500/30 p-3 sm:p-4 rounded-xl hover:bg-green-900/30 transition-colors">
                <p className="text-sm sm:text-base font-bold mb-1 flex items-center gap-2 text-green-300">
                  <span className="text-base sm:text-lg">✅</span>
                  <span>No URLs? Try this:</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-200">
                  Use{" "}
                  <strong className="text-green-400 bg-green-900/50 px-2 py-0.5 rounded">
                    "Add Vehicle"
                  </strong>{" "}
                  button to upload PNG/JPG directly
                </p>
              </div>

              {/* Supported Formats */}
              <div className="bg-gray-800/50 p-2 sm:p-3 rounded-xl text-center">
                <p className="text-xs sm:text-sm text-gray-300">
                  <span className="font-bold text-white">Supported:</span> PNG |
                  JPG | JPEG
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  onClick={() => setShowTemplateGuide(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={downloadTemplate}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <span>📥</span>
                  Download Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Heading */}
      <h1 className="text-2xl font-bold text-white whitespace-nowrap mb-2">
        Vehicle Management
      </h1>
      {(loading || csvUploading || isSubmitting) && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[10001]">
          <LoadingSpinner size="large" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Button - fixed small width */}
        <button
          onClick={() => setShowGifModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 font-medium whitespace-nowrap"
        >
          Unlock Exclusive Vehicle Wrapping/Fleet Services Deals Near You –
          Click to Discover!
        </button>

        {/* Header Ad - takes remaining space, full size */}
        <div className="flex-1 min-w-0">
          <HeaderLeaderboard />
        </div>
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[180px] bg-theme-bg2">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 text-white rounded-lg bg-theme-bg2 placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading || isSubmitting || csvUploading}
          />
        </div>

        {/* Buttons Group */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            onClick={openAddModal}
            disabled={loading || isSubmitting || csvUploading}
          >
            <FiPlus className="text-lg" />
            <span>Add Vehicle</span>
          </button>

          <label className="relative cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center">
            {csvFile ? csvFile.name : "Bulk Upload"}
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
            className={`px-4 py-2 rounded-lg text-white font-medium transition ${
              csvFile && !csvUploading && !isSubmitting && !loading
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!csvFile || csvUploading || isSubmitting || loading}
          >
            <FiUpload className="inline mr-1" />
            Upload
          </button>

          <button
            onClick={handleOpenTemplateGuide}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
          >
            <IoDocumentTextOutline />
            Download Template
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      <div className="hidden md:block relative bg-theme-bg2 rounded-2xl p-2">
        <div
          ref={tableContainerRef}
          style={{
            scrollbarWidth: "auto",
          }}
          className="w-full overflow-x-auto custom-scrollbar"
        >
          <table className="w-full border-collapse text-left text-white [&_th]:text-white [&_td]:text-white">
            <thead className="bg-theme-bg2">
              <tr>
                <th className="p-3 border text-sm font-semibold whitespace-nowrap">
                  Images
                </th>
                {/* <th className="p-3 border text-sm font-semibold whitespace-nowrap">
                  Country
                </th> */}
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
                  Daily Kilometers (km/day)
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
                  Wheel Base
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
                <th className="p-3 border text-sm font-semibold whitespace-nowrap text-center">
                  Approval Status
                </th>
                <th className="p-3 border text-sm font-semibold whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentVehicles.length > 0 ? (
                currentVehicles.map((v) => (
                  <tr
                    key={v._id}
                    className="hover:bg-theme-bg transition duration-200 border-b border-gray-600"
                  >
                    <td className="p-3 border text-sm w-48 max-w-48">
                      <ImageSlider images={v.images} onImageClick={viewImage} />
                    </td>
                    {/* <td className="p-3 border text-sm">{v.country || "-"}</td> */}
                    <td className="p-3 border text-sm">{v.vehicle || "-"}</td>
                    <td className="p-3 border text-sm">{v.model || "-"}</td>
                    <td className="p-3 border text-sm">
                      {v.registrationPlate || "-"}
                    </td>
                    <td className="p-3 border text-sm">
                      {v.dailyMileage || "-"} km/day
                    </td>
                    <td className="p-3 border text-sm">
                      {v.yearOfManufacture || "-"}
                    </td>
                    <td className="p-3 border text-sm">
                      {v.manufacturer || "-"}
                    </td>
                    <td className="p-3 border text-sm">
                      {v.dimensions?.length || "-"}
                    </td>
                    <td className="p-3 border text-sm">
                      {v.dimensions?.width || "-"}
                    </td>
                    <td className="p-3 border text-sm">
                      {v.dimensions?.height || "-"}
                    </td>
                    <td className="p-3 border text-sm">
                      {v.dimensions?.wheelbase || "-"}
                    </td>
                    <td className="p-3 border text-sm">
                      {v.dimensions?.curbWeight || "-"}
                    </td>
                    <td className="p-3 border text-sm">
                      {v.dimensions?.engineSize || "-"}
                    </td>
                    <td className="p-3 border text-sm">
                      {v.dimensions?.cabwidth || "-"}
                    </td>
                    <td className="p-3 border text-sm">
                      {v.dimensions?.cabheight || "-"}
                    </td>
                    <td className="p-3 border text-sm">
                      {v.dimensions?.bonnetwidth || "-"}
                    </td>
                    <td className="p-3 border text-sm">
                      {v.dimensions?.bonnetLength || "-"}
                    </td>
                    <td className="p-3 border text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          v.isApproved
                            ? "bg-green-600 text-white"
                            : "bg-yellow-600 text-white"
                        }`}
                      >
                        {v.isApproved ? "Approved" : "Pending Approval"}
                      </span>
                    </td>
                    <td className="p-3 border text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(v)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition disabled:opacity-50"
                          disabled={loading || isSubmitting || csvUploading}
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(v._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition disabled:opacity-50"
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
                  <td colSpan="19" className="p-4 text-center text-gray-300">
                    {searchTerm
                      ? "No vehicles found matching your search"
                      : "No vehicles found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden">
        <div className="space-y-4">
          {currentVehicles.length > 0 ? (
            currentVehicles
              .map((v) => {
                if (!v || typeof v !== "object") {
                  console.warn("Skipping invalid vehicle in mobile view:", v);
                  return null;
                }
                return (
                  <div
                    key={v._id || Math.random()}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-800">
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
                        <button
                          onClick={() => openEditModal(v)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition disabled:opacity-50"
                          disabled={loading || isSubmitting || csvUploading}
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(v._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition disabled:opacity-50"
                          disabled={loading || isSubmitting || csvUploading}
                        >
                          <FiTrash />
                        </button>
                      </div>
                    </div>
                    {v.images && v.images.length > 0 && (
                      <div className="mb-3 flex justify-center">
                        <div className="w-32">
                          <ImageSlider
                            images={v.images}
                            onImageClick={viewImage}
                          />
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {/* <div>
                        <span className="font-medium">Country:</span>{" "}
                        {v.country || "-"}
                      </div> */}
                      <div>
                        <span className="font-medium">Registration:</span>{" "}
                        {v.registrationPlate || "-"}
                      </div>
                      <div>
                        <span className="font-medium">Year:</span>{" "}
                        {v.yearOfManufacture || "-"}
                      </div>
                      <div>
                        <span className="font-medium">Length:</span>{" "}
                        {v.dimensions?.length || "-"}
                      </div>
                      <div>
                        <span className="font-medium">Width:</span>{" "}
                        {v.dimensions?.width || "-"}
                      </div>
                      <div>
                        <span className="font-medium">Height:</span>{" "}
                        {v.dimensions?.height || "-"}
                      </div>
                      <div>
                        <span className="font-medium">Wheel Base:</span>{" "}
                        {v.dimensions?.wheelbase || "-"}
                      </div>
                      <div>
                        <span className="font-medium">Curb Weight:</span>{" "}
                        {v.dimensions?.curbWeight || "-"}
                      </div>
                      <div>
                        <span className="font-medium">Engine Size:</span>{" "}
                        {v.dimensions?.engineSize || "-"}
                      </div>
                      <div>
                        <span className="font-medium">Cab Width:</span>{" "}
                        {v.dimensions?.cabwidth || "-"}
                      </div>
                      <div>
                        <span className="font-medium">Cab Height:</span>{" "}
                        {v.dimensions?.cabheight || "-"}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Bonnet Width:</span>{" "}
                        {v.dimensions?.bonnetwidth || "-"}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Bonnet Length:</span>{" "}
                        {v.dimensions?.bonnetLength || "-"}
                      </div>
                    </div>
                  </div>
                );
              })
              .filter(Boolean)
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm
                ? "No vehicles found matching your search"
                : "No vehicles found"}
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredVehicles.length)} of{" "}
            {filteredVehicles.length} vehicles
          </div>
          <div className="flex justify-center flex-wrap">
            {renderPagination()}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-theme-bg rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto text-white">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {isEditMode ? "Edit Vehicle" : "Add Vehicle"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-red-500 hover:text-red-700"
                  disabled={isSubmitting}
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowMeasurementGuide(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-lg transition transform hover:scale-105"
                >
                  <FiImage className="text-xl" />
                  How to Take Accurate Vehicle Measurements (Click to View
                  Guide)
                </button>
              </div>
              {showMeasurementGuide && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-80 p-4">
                  <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
                    <div className="sticky top-0 z-10 flex justify-end p-4 bg-white/90 backdrop-blur">
                      <button
                        onClick={() => setShowMeasurementGuide(false)}
                        className="bg-red-600 hover:bg-red-700 text-white text-4xl font-bold rounded-full w-12 h-12 flex items-center justify-center shadow-xl transition"
                      >
                        ×
                      </button>
                    </div>
                    <div className="p-4 overflow-y-auto max-h-[85vh]">
                      <img
                        src={measurementGuide}
                        alt="How to measure vehicle dimensions"
                        className="w-full h-auto rounded-xl shadow-lg"
                      />
                    </div>
                    <div className="p-4 text-center">
                      <p className="text-gray-700 font-medium">
                        Tip: All measurements in{" "}
                        <strong>centimeters (cm)</strong> except Curb Weight
                        (kg) & Engine Size (cc)
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {autoSelectedImages.length > 0 && (
                  <div className="border-2 border-dashed border-bg-theme-bg2 rounded-lg p-4 bg-theme-bg2 bg-opacity-10">
                    <h4 className="text-md font-semibold mb-2 text-white">
                      Auto-Selected Vehicle Images
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {autoSelectedImages.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Auto-selected ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-blue-500"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/150x100?text=Image+Not+Found";
                            }}
                          />
                          <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* 
{!isEditMode && formData.vehicle && autoSelectedImages.length === 0 && (
  <div className="border-2 border-dashed border-yellow-300 rounded-lg p-4 bg-yellow-50 bg-opacity-10">
    <h4 className="text-md font-semibold mb-2 text-yellow-400">
      No Images Available
    </h4>
    <p className="text-sm text-yellow-300">
      No images available for the selected vehicle template. The vehicle will be saved without images.
    </p>
  </div>
)} */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white">
                  {/* <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <select
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  className="w-full p-3 rounded border bg-theme-bg2 text-white"
                >
                  <option value="">Select Country </option>
                  {worldData.sort((a, b) => a.name.localeCompare(b.name)).map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div> */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Manufacturer *
                    </label>
                    <select
                      value={formData.manufacturer}
                      onChange={(e) => handleManufacturerChange(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full p-3 rounded border bg-theme-bg2 text-white"
                    >
                      <option value="">Select Manufacturer</option>
                      {filteredManufacturers.map((m, i) => (
                        <option key={i} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Vehicle Type - Second */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Vehicle Type *
                    </label>
                    <select
                      value={formData.vehicle}
                      onChange={(e) => handleVehicleTypeChange(e.target.value)}
                      required
                      disabled={isSubmitting || !formData.manufacturer}
                      className="w-full p-3 rounded border bg-theme-bg2 text-white"
                    >
                      <option value="">
                        {!formData.manufacturer
                          ? "Select manufacturer first"
                          : "Select Vehicle Type"}
                      </option>
                      {filteredVehicleTypes.map((t, i) => (
                        <option key={i} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 4. Model - Third */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Model *
                    </label>
                    <select
                      value={formData.model}
                      onChange={(e) => handleModelChange(e.target.value)}
                      required
                      disabled={isSubmitting || !formData.vehicle}
                      className="w-full p-3 rounded border bg-theme-bg2 text-white"
                    >
                      <option value="">
                        {!formData.vehicle
                          ? "Select vehicle type first"
                          : "Select Model"}
                      </option>
                      {filteredModels.map((m, i) => (
                        <option key={i} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Year of Manufacture *
                    </label>

                    <input
                      list="manufacture-years"
                      value={formData.yearOfManufacture}
                      onChange={(e) =>
                        handleYearOfManufactureChange(e.target.value)
                      }
                      required
                      disabled={isSubmitting || !formData.model}
                      placeholder={
                        !formData.model
                          ? "Select model first"
                          : "Select or type Year of Manufacture"
                      }
                      className="w-full p-3 rounded border bg-theme-bg2 text-white"
                    />

                    <datalist id="manufacture-years">
                      {filteredYears.map((y, i) => (
                        <option key={i} value={y} />
                      ))}
                    </datalist>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-white">
                      Registration Plate*
                    </label>

                    <input
                      name="registrationPlate"
                      value={formData.registrationPlate || ""}
                      onChange={handleChange}
                      placeholder="e.g. MH02AB1234"
                      className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-bg2 text-white"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-white">
                      Daily Kilometers (km/day)*
                    </label>
                    <input
                      name="dailyMileage"
                      value={formData.dailyMileage || ""}
                      onChange={handleChange}
                      placeholder="Daily Kilometers (km/day) *"
                      type="text"
                      min="1"
                      step="1"
                      className="border border-gray-300 p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-theme-bg2 text-white"
                      required
                      disabled={isSubmitting}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
                      km/day
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-white">
                      Length (cm)*
                    </label>
                    <input
                      name="length"
                      value={formData.dimensions.length}
                      onChange={handleChange}
                      readOnly
                      placeholder="Length (cm) *"
                      type="number"
                      min="1"
                      step="1"
                      className="border border-gray-300 p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-theme-bg2 text-white"
                      disabled={isSubmitting}
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
                      cm
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-white">
                      Width (cm) *
                    </label>
                    <input
                      name="width"
                      value={formData.dimensions.width}
                      onChange={handleChange}
                      readOnly
                      placeholder="Width (cm) *"
                      type="number"
                      min="1"
                      step="1"
                      className="border border-gray-300 p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-theme-bg2 text-white"
                      disabled={isSubmitting}
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
                      cm
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-white">
                      Height (cm) *
                    </label>
                    <input
                      name="height"
                      value={formData.dimensions.height}
                      readOnly
                      onChange={handleChange}
                      placeholder="Height (cm) *"
                      type="number"
                      min="1"
                      step="1"
                      className="border border-gray-300 p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-theme-bg2 text-white"
                      disabled={isSubmitting}
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
                      cm
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-white">
                      Wheelbase (cm) *
                    </label>
                    <input
                      name="wheelbase"
                      value={formData.dimensions.wheelbase}
                      onChange={handleChange}
                      readOnly
                      placeholder="Wheelbase (cm) "
                      type="number"
                      min="1"
                      step="1"
                      className="border border-gray-300 p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-theme-bg2 text-white"
                      disabled={isSubmitting}
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
                      cm
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-white">
                      Curb Weight (kg) *
                    </label>
                    <input
                      name="curbWeight"
                      value={formData.dimensions.curbWeight}
                      onChange={handleChange}
                      readOnly
                      placeholder="Curb Weight (kg) "
                      type="number"
                      min="500"
                      step="10"
                      className="border border-gray-300 p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-theme-bg2 text-white"
                      disabled={isSubmitting}
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
                      kg
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-white">
                      Engine Size (cc) *
                    </label>
                    <input
                      name="engineSize"
                      value={formData.dimensions.engineSize}
                      onChange={handleChange}
                      readOnly
                      placeholder="Engine Size (e.g., 2.0L 4-Cylinder) *"
                      type="text"
                      className="border border-gray-300 p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-theme-bg2 text-white"
                      disabled={isSubmitting}
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
                      cc
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-white">
                      Cab Width (cm) *
                    </label>
                    <input
                      name="cabwidth"
                      value={formData.dimensions.cabwidth}
                      onChange={handleChange}
                      readOnly
                      placeholder="Cab Width (cm) *"
                      type="number"
                      min="1"
                      step="1"
                      className="border border-gray-300 p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-theme-bg2 text-white"
                      disabled={isSubmitting}
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
                      cm
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-white">
                      Cab Height (cm) *
                    </label>
                    <input
                      name="cabheight"
                      value={formData.dimensions.cabheight}
                      onChange={handleChange}
                      readOnly
                      placeholder="Cab Height (cm) *"
                      type="number"
                      min="1"
                      step="1"
                      className="border border-gray-300 p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-theme-bg2 text-white"
                      disabled={isSubmitting}
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
                      cm
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-white">
                      Bonnet Width (cm) *
                    </label>
                    <input
                      name="bonnetwidth"
                      value={formData.dimensions.bonnetwidth}
                      onChange={handleChange}
                      readOnly
                      placeholder="Bonnet Width (cm) *"
                      type="number"
                      min="1"
                      step="1"
                      className="border border-gray-300 p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-theme-bg2 text-white"
                      disabled={isSubmitting}
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
                      cm
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-white">
                      Bonnet Length (cm) *
                    </label>
                    <input
                      name="bonnetLength"
                      value={formData.dimensions.bonnetLength}
                      onChange={handleChange}
                      readOnly
                      placeholder="Bonnet Length (cm) *"
                      type="number"
                      min="1"
                      step="1"
                      className="border border-gray-300 p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-theme-bg2 text-white"
                      disabled={isSubmitting}
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
                      cm
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
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
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {showGifModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-theme-bg rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto text-white">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">Advertisement GIFs</h3>
                <button
                  onClick={() => {
                    setShowGifModal(false);
                    setCurrentGifPage(1);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiX size={24} />
                </button>
              </div>
              {gifLoading ? (
                <div className="text-center py-12">
                  <LoadingSpinner size="medium" />
                </div>
              ) : publicGifs && publicGifs.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {currentGifs.map((gifItem) => (
                      <div
                        key={gifItem._id}
                        onClick={() => handleGifClick(gifItem._id)}
                        className="bg-theme-bg2 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-700"
                      >
                        <div className="aspect-square relative overflow-hidden">
                          <img
                            src={gifItem.gifs[0]}
                            alt={gifItem.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                            <h3 className="text-white font-semibold text-sm truncate">
                              {gifItem.title}
                            </h3>
                            <p className="text-gray-300 text-xs">
                              {gifItem.gifs.length} GIF
                              {gifItem.gifs.length > 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="absolute top-2 right-2 bg-black/50 rounded-full p-2">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M8 5v10l7-5z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalGifPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      {renderGifPagination()}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg">No public GIFs available yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddVehicleDimensions;

// import React, { useEffect, useState, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import ExcelJS from 'exceljs';
// import { saveAs } from 'file-saver';
// import {

//   createVehiclebyfleetower,
//   deleteVehicle,
//   fetchVehiclesbyfleetOwner,
//   updateVehicle,
//   uploadVehicleCSVByFleetOwner,
// } from "../store/vehicle/vehicleSlice";
// import { getAllUsers } from "../store/user/userSlice";
// import {
//   getPublicGifs,
//   trackImpression,
//   trackClick,
// } from "../store/gif/gifSlice";
// import {
//   FiPlus,
//   FiUpload,
//   FiEdit,
//   FiTrash,
//   FiChevronLeft,
//   FiChevronRight,
//   FiSearch,
//   FiX,
//   FiImage,
// } from "react-icons/fi";
// import { IoCloudUploadOutline, IoDocumentTextOutline } from "react-icons/io5";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import ImageSlider from "./ImageSlider";
// import measurementGuide from "../assets/Dimension labeled_page-0001.jpg";
// import worldData from "../countries+states+cities.json";
// const LoadingSpinner = ({ size = "medium" }) => {
//   const sizes = {
//     small: "w-5 h-5",
//     medium: "w-8 h-8",
//     large: "w-12 h-12",
//   };
//   return (
//     <div
//       className={`animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-blue-600 ${sizes[size]}`}
//     />
//   );
// };

// const AddVehicleDimensions = () => {
//   const tableContainerRef = useRef(null);
//   const scrollContainerRef = useRef(null);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const {
//     list = [],
//     loading = false,
//     error = null,
//   } = useSelector((state) => state.vehicles || {});

//   const { user } = useSelector((state) => state.auth);
//   const { publicGifs, loading: gifLoading } = useSelector((state) => state.gif);

//   const [formData, setFormData] = useState({
//     _id: null,
//     country: "",
//     vehicle: "",
//     model: "",
//     yearOfManufacture: "",
//     manufacturer: "",
//     dimensions: {
//       length: "",
//       width: "",
//       height: "",
//       wheelbase: "",
//       curbWeight: "",
//       engineSize: "",
//       cabwidth: "",
//       cabheight: "",
//       bonnetwidth: "",
//       bonnetLength: "",
//     },
//   });

//   const [showModal, setShowModal] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [csvFile, setCsvFile] = useState(null);
//   const [csvUploading, setCsvUploading] = useState(false);
//   const [selectedImages, setSelectedImages] = useState([]);
//   const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [selectedImageForView, setSelectedImageForView] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [uploadResult, setUploadResult] = useState(null);
//   const [showMeasurementGuide, setShowMeasurementGuide] = useState(false);

//   // New states for GIF modal and pagination
//   const [showGifModal, setShowGifModal] = useState(false);
//   const [currentGifPage, setCurrentGifPage] = useState(1);
//   const gifsPerPage = 20;

//   const fleetOwnerId = user?._id;

//   useEffect(() => {
//     dispatch(getPublicGifs());
//   }, [dispatch]);

//   useEffect(() => {
//     dispatch(getAllUsers());
//   }, [dispatch]);

//   useEffect(() => {
//     if (fleetOwnerId) {
//       dispatch(fetchVehiclesbyfleetOwner(fleetOwnerId));
//     }
//   }, [fleetOwnerId, dispatch]);

//   const handleGifClick = (gifId) => {
//     dispatch(trackImpression(gifId));
//     dispatch(trackClick(gifId));
//     navigate(`/gif-details/${gifId}`);
//   };

//   const filteredVehicles = Array.isArray(list)
//     ? list.filter((vehicle) => {
//         if (!vehicle || typeof vehicle !== "object") return false;
//         if (!searchTerm) return true;
//         const searchLower = searchTerm.toLowerCase();
//         return (
//           (vehicle.country || "").toLowerCase().includes(searchLower) ||
//           (vehicle.vehicle || "").toLowerCase().includes(searchLower) ||
//           (vehicle.model || "").toLowerCase().includes(searchLower) ||
//           (vehicle.manufacturer || "").toLowerCase().includes(searchLower)
//         );
//       })
//     : [];

//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const currentVehicles = filteredVehicles.slice(startIndex, endIndex);
//   const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

//   useEffect(() => {
//     const tableContainer = tableContainerRef.current;
//     const scrollContainer = scrollContainerRef.current;

//     const updateScrollerPosition = () => {
//       if (!tableContainer || !scrollContainer) return;

//       const scrollPercentage =
//         tableContainer.scrollLeft /
//         (tableContainer.scrollWidth - tableContainer.clientWidth);

//       const thumb = scrollContainer.querySelector(".scroller-thumb");
//       if (!thumb) return;

//       const thumbMinWidth = 30;
//       const thumbMaxWidth = scrollContainer.clientWidth * 0.3;
//       const thumbWidth = Math.max(thumbMinWidth, thumbMaxWidth);
//       thumb.style.width = `${thumbWidth}px`;

//       const availableWidth = scrollContainer.clientWidth - thumbWidth;
//       thumb.style.left = `${scrollPercentage * availableWidth}px`;
//     };

//     if (tableContainer) {
//       tableContainer.addEventListener("scroll", updateScrollerPosition);
//       updateScrollerPosition();

//       return () => {
//         tableContainer.removeEventListener("scroll", updateScrollerPosition);
//       };
//     }
//   }, [currentVehicles]);

// const downloadTemplate = () => {
//   const headers = [
//     "country",
//     "vehicle",
//     "model",
//     "yearOfManufacture",
//     "manufacturer",
//     "registrationPlate",
//     "dimensions.length",
//     "dimensions.width",
//     "dimensions.height",
//     "dimensions.wheelbase",
//     "dimensions.curbWeight",
//     "dimensions.engineSize",
//     "dimensions.cabwidth",
//     "dimensions.cabheight",
//     "dimensions.bonnetwidth",
//     "dimensions.bonnetLength",
//     "images[0]",
//     "images[1]",
//     "images[2]",
//     "images[3]",
//     "images[4]",
//   ];

//   const sampleRow = [
//     "Australia",
//     "Outlander",
//     "CX5",
//     "2023",
//     "Mitsubishi",
//     "MH02AB1234",
//     "480",
//     "185",
//     "168",
//     "270",
//     "1650",
//     "2.0L 4-Cylinder Diesel",
//     "180",
//     "145",
//     "160",
//     "110",
//     "https://example.com/front.jpg",
//     "https://example.com/side.jpg",
//     "",
//     "",
//     ""
//   ];

//   // CSV content with instructions as comments
//   const instructions = [
//     "# Vehicle Bulk Upload Template",
//     "# All dimensions in centimeters (cm) except Curb Weight (kg) and Engine Size (text)",
//     "# IMPORTANT: Delete all instruction rows (lines starting with #) before uploading",
//     "# Images: Provide up to 5 hosted image URLs. Recommended: Front, Side + optional 3D views. Max 2MB per image",
//     "#",
//   ].join("\n");

//   // Properly escape CSV values (wrap in quotes if they contain commas)
//   const escapeCSV = (value) => {
//     if (value === "" || value === null || value === undefined) return "";
//     const str = String(value);
//     if (str.includes(",") || str.includes('"') || str.includes("\n")) {
//       return `"${str.replace(/"/g, '""')}"`;
//     }
//     return str;
//   };

//   const headerRow = headers.map(escapeCSV).join(",");
//   const dataRow = sampleRow.map(escapeCSV).join(",");

//   const csvContent = [
//     instructions,
//     headerRow,
//     dataRow
//   ].join("\n");

//   // Create and download CSV
//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//   saveAs(blob, 'vehicle_bulk_upload_template.csv');

//   toast.success("CSV template downloaded! Delete instruction lines (starting with #) before uploading.");
// };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (name in formData.dimensions) {
//       setFormData((prev) => ({
//         ...prev,
//         dimensions: { ...prev.dimensions, [name]: value },
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleImageSelect = (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length > 5) {
//       toast.error("You can only upload up to 5 images");
//       return;
//     }
//     setSelectedImages(files);
//     const previewUrls = files.map((file) => URL.createObjectURL(file));
//     setImagePreviewUrls(previewUrls);
//   };

//   const removeImage = (index) => {
//     const newImages = selectedImages.filter((_, i) => i !== index);
//     const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
//     URL.revokeObjectURL(imagePreviewUrls[index]);
//     setSelectedImages(newImages);
//     setImagePreviewUrls(newPreviewUrls);
//   };

//   const clearImages = () => {
//     imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
//     setSelectedImages([]);
//     setImagePreviewUrls([]);
//   };

//   const resetForm = () => {
//     setFormData({
//       _id: null,
//       country: "",
//       vehicle: "",
//       model: "",
//       yearOfManufacture: "",
//       manufacturer: "",
//       dimensions: {
//         length: "",
//         width: "",
//         height: "",
//         wheelbase: "",
//         curbWeight: "",
//         engineSize: "",
//         cabwidth: "",
//         cabheight: "",
//         bonnetwidth: "",
//         bonnetLength: "",
//       },
//     });
//     clearImages();
//   };

//   const openAddModal = () => {
//     setIsEditMode(false);
//     resetForm();
//     setShowModal(true);
//   };

//   const openEditModal = (vehicle) => {
//     setIsEditMode(true);
//     setFormData({
//       ...vehicle,
//       dimensions: {
//         length: vehicle.dimensions?.length || "",
//         width: vehicle.dimensions?.width || "",
//         height: vehicle.dimensions?.height || "",
//         wheelbase: vehicle.dimensions?.wheelbase || "",
//         curbWeight: vehicle.dimensions?.curbWeight || "",
//         engineSize: vehicle.dimensions?.engineSize || "",
//         cabwidth: vehicle.dimensions?.cabwidth || "",
//         cabheight: vehicle.dimensions?.cabheight || "",
//         bonnetwidth: vehicle.dimensions?.bonnetwidth || "",
//         bonnetLength: vehicle.dimensions?.bonnetLength || "",
//       },
//     });
//     clearImages();
//     setShowModal(true);
//   };

//  const handleSubmit = async (e) => {
//   e.preventDefault();

//   if (!fleetOwnerId) {
//     toast.error("Fleet Owner not found");
//     return;
//   }

//   if (
//     !formData.country ||
//     !formData.vehicle ||
//     !formData.model ||
//     !formData.yearOfManufacture ||
//     !formData.manufacturer|| !formData.registrationPlate
//   ) {
//     toast.error("Please fill all required fields");
//     return;
//   }

//   if (!isEditMode && selectedImages.length === 0) {
//     toast.error("Please select at least one image");
//     return;
//   }

//   const dimensions = formData.dimensions;

//   // Engine Size required check (string, not number)
//   if (!dimensions.engineSize || dimensions.engineSize.trim() === "") {
//     toast.error("Engine Size is required (e.g., 2.0L 4-Cylinder Diesel)");
//     return;
//   }

//   // Numeric dimensions required + valid number check
//   const requiredDimensionFields = [
//     "length",
//     "width",
//     "height",
//     "wheelbase",
//     "curbWeight",
//     "cabwidth",
//     "cabheight",
//     "bonnetwidth",
//     "bonnetLength",
//   ];

//   for (const key of requiredDimensionFields) {
//     const value = dimensions[key];
//     if (!value || value === "" || isNaN(value) || Number(value) < 0) {
//       toast.error(`${key.charAt(0).toUpperCase() + key.slice(1)} is required and must be a valid number`);
//       return;
//     }
//   }

//   // Curb weight realistic check
//   if (dimensions.curbWeight && (isNaN(dimensions.curbWeight) || Number(dimensions.curbWeight) < 500)) {
//     toast.error("Curb weight should be realistic (500kg+)");
//     return;
//   }

//   setIsSubmitting(true);

//   try {
//     const submitFormData = new FormData();

//     submitFormData.append("country", formData.country);
//     submitFormData.append("vehicle", formData.vehicle);
//     submitFormData.append("model", formData.model);
//     submitFormData.append("yearOfManufacture", formData.yearOfManufacture);
//     submitFormData.append("manufacturer", formData.manufacturer);
// submitFormData.append("registrationPlate", formData.registrationPlate.trim().toUpperCase());
//     // Dimensions append with proper handling
//  Object.entries(formData.dimensions).forEach(([key, value]) => {
//   if (value !== "" && value !== null && value !== undefined) {
//     if (key === "engineSize") {
//       // Send as string - no conversion needed
//       submitFormData.append(`dimensions[${key}]`, String(value).trim());
//     } else {
//       // Convert to number for numeric fields
//       const numValue = parseFloat(value);
//       if (!isNaN(numValue)) {
//         submitFormData.append(`dimensions[${key}]`, numValue.toString());
//       }
//     }
//   }
// });

//     // Images append
//     selectedImages.forEach((image) => submitFormData.append("images", image));

//     // Dispatch based on mode
//     if (isEditMode) {
//       await dispatch(updateVehicle({ id: formData._id, data: submitFormData })).unwrap();
//       toast.success("Vehicle updated successfully!");
//     } else {
//       await dispatch(createVehiclebyfleetower({ fleetOwnerId, formData: submitFormData })).unwrap();
//       toast.success("Vehicle added successfully!");
//     }

//     // Success cleanup
//     setShowModal(false);
//     resetForm();
//     await dispatch(fetchVehiclesbyfleetOwner(fleetOwnerId));
//   } catch (err) {
//     console.error("Save error:", err);
//     toast.error("Error saving vehicle: " + (err.message || "Unknown error"));
//   } finally {
//     setIsSubmitting(false);
//   }
// };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this vehicle?")) {
//       try {
//         await dispatch(deleteVehicle(id)).unwrap();
//         toast.success("Vehicle deleted successfully!");
//       } catch (err) {
//         toast.error("Error deleting vehicle: " + (err.message || "Unknown error"));
//       }
//     }
//   };

// const parseCSV = async (file) => {
//   const text = await file.text();
//   const lines = text
//     .split(/\r?\n/)
//     .filter((line) => {
//       const trimmed = line.trim();
//       return trimmed !== "" && !trimmed.startsWith("#"); // Skip empty and comment lines
//     });

//   if (lines.length < 2) {
//     throw new Error("CSV file must have at least a header row and one data row");
//   }

//   const parseLine = (line) => {
//     const result = [];
//     let current = "";
//     let inQuotes = false;

//     for (let i = 0; i < line.length; i++) {
//       const char = line[i];
//       const nextChar = line[i + 1];

//       if (char === '"') {
//         if (inQuotes && nextChar === '"') {
//           current += '"';
//           i++; // Skip next quote
//         } else {
//           inQuotes = !inQuotes;
//         }
//       } else if (char === "," && !inQuotes) {
//         result.push(current.trim());
//         current = "";
//       } else {
//         current += char;
//       }
//     }
//     result.push(current.trim());
//     return result;
//   };

//   const headers = parseLine(lines[0]);
//   const dataRows = lines.slice(1).map(parseLine);

//   // Create row objects with original headers as keys
//   const rows = dataRows.map((row) => {
//     const rowObj = {};
//     headers.forEach((header, i) => {
//       rowObj[header] = row[i] || "";
//     });
//     return rowObj;
//   });

//   return { headers, rows };
// };

// const handleBulkUpload = async () => {
//   if (!csvFile) return toast.error("Please select a CSV file first.");
//   if (!fleetOwnerId) return toast.error("Fleet Owner ID is missing.");

//   setCsvUploading(true);

//   try {
//     const { headers, rows } = await parseCSV(csvFile);

//     // Normalize headers by removing units in parentheses and trimming
//     const normalizeHeader = (h) => {
//       return h.trim().toLowerCase().replace(/\s*\([^)]*\)/g, '').trim();
//     };

//     // Create a mapping of normalized headers to original headers
//     const headerMap = {};
//     headers.forEach((h, index) => {
//       const normalized = normalizeHeader(h);
//       headerMap[normalized] = h;
//     });

//     // Function to find header index by normalized name
//     const idx = (h) => {
//       const normalized = normalizeHeader(h);
//       const originalHeader = headerMap[normalized];
//       return originalHeader ? headers.indexOf(originalHeader) : -1;
//     };

//     const requiredHeaders = [
//       "country",
//       "vehicle",
//       "yearOfManufacture",
//       "manufacturer",
//       "model",
//       "registrationPlate",
//       "dimensions.length",
//       "dimensions.width",
//       "dimensions.height",
//       "dimensions.wheelbase",
//       "dimensions.curbWeight",
//       "dimensions.engineSize",
//       "dimensions.cabwidth",
//       "dimensions.cabheight",
//       "dimensions.bonnetwidth",
//       "dimensions.bonnetLength",
//     ];

//     const missingHeaders = requiredHeaders.filter((h) => idx(h) === -1);
//     if (missingHeaders.length) {
//       toast.error("Missing headers: " + missingHeaders.join(", "));
//       setCsvUploading(false);
//       return;
//     }

//     // Map rows using normalized header lookups
//     const vehicles = rows.map((row) => {
//       const getRowValue = (headerName) => {
//         const normalized = normalizeHeader(headerName);
//         const originalHeader = headerMap[normalized];
//         return originalHeader ? row[originalHeader] : undefined;
//       };

//       return {
//         country: getRowValue("country"),
//         vehicle: getRowValue("vehicle"),
//         yearOfManufacture: getRowValue("yearOfManufacture"),
//         manufacturer: getRowValue("manufacturer"),
//         model: getRowValue("model"),
//         registrationPlate: getRowValue("registrationPlate"),
//         "dimensions[length]": getRowValue("dimensions.length"),
//         "dimensions[width]": getRowValue("dimensions.width"),
//         "dimensions[height]": getRowValue("dimensions.height"),
//         "dimensions[wheelbase]": getRowValue("dimensions.wheelbase"),
//         "dimensions[curbWeight]": getRowValue("dimensions.curbWeight"),
//         "dimensions[engineSize]": getRowValue("dimensions.engineSize")
//           ? String(getRowValue("dimensions.engineSize")).trim()
//           : "",
//         "dimensions[cabwidth]": getRowValue("dimensions.cabwidth"),
//         "dimensions[cabheight]": getRowValue("dimensions.cabheight"),
//         "dimensions[bonnetwidth]": getRowValue("dimensions.bonnetwidth"),
//         "dimensions[bonnetLength]": getRowValue("dimensions.bonnetLength"),
//         images: headers
//           .map((h) => {
//             const normalized = normalizeHeader(h);
//             return normalized.startsWith("images") ? row[h] : null;
//           })
//           .filter((x) => x && x.trim().length > 0),
//       };
//     });

//     // Validation
//     for (const v of vehicles) {
//       const requiredFields = [
//         "country",
//         "vehicle",
//         "yearOfManufacture",
//         "manufacturer",
//         "model",
//         "registrationPlate",
//         "dimensions[length]",
//         "dimensions[width]",
//         "dimensions[height]",
//         "dimensions[wheelbase]",
//         "dimensions[curbWeight]",
//         "dimensions[engineSize]",
//         "dimensions[cabwidth]",
//         "dimensions[cabheight]",
//         "dimensions[bonnetwidth]",
//         "dimensions[bonnetLength]",
//       ];

//       for (const field of requiredFields) {
//         // Check if value exists
//         if (v[field] === undefined || v[field] === null) {
//           throw new Error(
//             `Missing value for ${field} in row ${vehicles.indexOf(v) + 1}`
//           );
//         }

//         // Special handling for engineSize - it's a string
//         if (field === "dimensions[engineSize]") {
//           if (typeof v[field] !== 'string' || v[field] === '') {
//             throw new Error(
//               `Invalid engine size for ${field} in row ${vehicles.indexOf(v) + 1} - must be non-empty text`
//             );
//           }
//         }

//         // For numeric fields (except engineSize), check they are valid numbers
//         else if (field.startsWith("dimensions[") && field !== "dimensions[engineSize]") {
//           const numValue = Number(v[field]);
//           if (isNaN(numValue) || numValue < 0) {
//             throw new Error(
//               `Invalid numeric value for ${field} in row ${vehicles.indexOf(v) + 1}`
//             );
//           }
//         }
//       }
//     }

//     const result = await dispatch(
//       uploadVehicleCSVByFleetOwner({ vehicles, fleetOwnerId })
//     ).unwrap();
//     toast.success(
//       `Upload successful! ${result.vehicles.length} vehicles added.`
//     );
//     setCsvFile(null);
//     await dispatch(fetchVehiclesbyfleetOwner(fleetOwnerId));
//   } catch (err) {
//     console.error("CSV upload error:", err);
//     toast.error("CSV upload failed: " + (err.message || "Unknown error"));
//   } finally {
//     setCsvUploading(false);
//   }
// };

//  const handleFileChange = (e) => {
//   const file = e.target.files[0];
//   if (file && !file.name.endsWith('.csv')) {
//     toast.error("Please upload a CSV file only");
//     e.target.value = null;
//     return;
//   }
//   setCsvFile(file);
// }

//   const viewImage = (imageUrl) => {
//     setSelectedImageForView(imageUrl);
//     setShowImageModal(true);
//   };

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };

//   const renderPagination = () => {
//     if (totalPages <= 1) return null;
//     const pages = [];
//     const maxVisiblePages = 5;
//     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
//     let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
//     if (endPage - startPage + 1 < maxVisiblePages) {
//       startPage = Math.max(1, endPage - maxVisiblePages + 1);
//     }
//     pages.push(
//       <button
//         key="prev"
//         onClick={() => handlePageChange(currentPage - 1)}
//         disabled={currentPage === 1 || loading || isSubmitting}
//         className={`px-2 py-1 sm:px-3 sm:py-2 mx-1 rounded text-sm ${
//           currentPage === 1 || loading || isSubmitting
//             ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//             : "bg-blue-600 text-white hover:bg-blue-700"
//         }`}
//       >
//         <FiChevronLeft />
//       </button>
//     );
//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(
//         <button
//           key={i}
//           onClick={() => handlePageChange(i)}
//           className={`px-2 py-1 sm:px-3 sm:py-2 mx-1 rounded text-sm ${
//             currentPage === i
//               ? "bg-blue-600 text-white"
//               : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//           }`}
//           disabled={loading || isSubmitting}
//         >
//           {i}
//         </button>
//       );
//     }
//     pages.push(
//       <button
//         key="next"
//         onClick={() => handlePageChange(currentPage + 1)}
//         disabled={currentPage === totalPages || loading || isSubmitting}
//         className={`px-2 py-1 sm:px-3 sm:py-2 mx-1 rounded text-sm ${
//           currentPage === totalPages || loading || isSubmitting
//             ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//             : "bg-blue-600 text-white hover:bg-blue-700"
//         }`}
//       >
//         <FiChevronRight />
//       </button>
//     );
//     return pages;
//   };

//   // GIF Pagination in Modal
//   const gifStartIndex = (currentGifPage - 1) * gifsPerPage;
//   const gifEndIndex = gifStartIndex + gifsPerPage;
//   const currentGifs = publicGifs.slice(gifStartIndex, gifEndIndex);
//   const totalGifPages = Math.ceil(publicGifs.length / gifsPerPage);

//   const handleGifPageChange = (page) => {
//     setCurrentGifPage(page);
//   };

//   const renderGifPagination = () => {
//     if (totalGifPages <= 1) return null;
//     const pages = [];
//     const maxVisiblePages = 5;
//     let startPage = Math.max(1, currentGifPage - Math.floor(maxVisiblePages / 2));
//     let endPage = Math.min(totalGifPages, startPage + maxVisiblePages - 1);
//     if (endPage - startPage + 1 < maxVisiblePages) {
//       startPage = Math.max(1, endPage - maxVisiblePages + 1);
//     }
//     pages.push(
//       <button
//         key="prev"
//         onClick={() => handleGifPageChange(currentGifPage - 1)}
//         disabled={currentGifPage === 1 || gifLoading}
//         className={`px-2 py-1 sm:px-3 sm:py-2 mx-1 rounded text-sm ${
//           currentGifPage === 1 || gifLoading
//             ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//             : "bg-blue-600 text-white hover:bg-blue-700"
//         }`}
//       >
//         <FiChevronLeft />
//       </button>
//     );
//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(
//         <button
//           key={i}
//           onClick={() => handleGifPageChange(i)}
//           className={`px-2 py-1 sm:px-3 sm:py-2 mx-1 rounded text-sm ${
//             currentGifPage === i
//               ? "bg-blue-600 text-white"
//               : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//           }`}
//           disabled={gifLoading}
//         >
//           {i}
//         </button>
//       );
//     }
//     pages.push(
//       <button
//         key="next"
//         onClick={() => handleGifPageChange(currentGifPage + 1)}
//         disabled={currentGifPage === totalGifPages || gifLoading}
//         className={`px-2 py-1 sm:px-3 sm:py-2 mx-1 rounded text-sm ${
//           currentGifPage === totalGifPages || gifLoading
//             ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//             : "bg-blue-600 text-white hover:bg-blue-700"
//         }`}
//       >
//         <FiChevronRight />
//       </button>
//     );
//     return pages;
//   };

//   return (
//     <div className="p-4 flex-1 mx-auto relative overflow-x-hidden bg-theme-bg rounded-2xl">
//       {(loading || csvUploading || isSubmitting) && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[10001]">
//           <LoadingSpinner size="large" />
//         </div>
//       )}
//       <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
//         <h1 className="text-2xl font-bold text-white">Vehicle Management</h1>
//         <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
//           <button
//             className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50"
//             onClick={openAddModal}
//             disabled={loading || isSubmitting || csvUploading}
//           >
//             <FiPlus className="text-lg" />
//             <span>Add Vehicle</span>
//           </button>
//           <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center">
//             <label className="relative cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-center">
//               {csvFile ? csvFile.name : "Bulk Upload"}
//               <input
//                 type="file"
//                 accept=".csv"
//                 onChange={handleFileChange}
//                 className="absolute inset-0 opacity-0 cursor-pointer"
//                 disabled={loading || isSubmitting || csvUploading}
//               />
//             </label>

//             <button
//               onClick={handleBulkUpload}
//               className={`px-4 py-2 rounded-lg text-white font-medium transition duration-200 ${
//                 csvFile && !csvUploading && !isSubmitting && !loading
//                   ? "bg-blue-600 hover:bg-blue-700"
//                   : "bg-gray-300 text-gray-500 cursor-not-allowed"
//               }`}
//               disabled={!csvFile || csvUploading || isSubmitting || loading}
//             >
//               <FiUpload className="inline-block mr-1" />
//               Upload
//             </button>

//             <button
//               onClick={downloadTemplate}
//               className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-200 flex items-center gap-1"
//             >
//               <IoDocumentTextOutline />
//               Download Template
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* New Button at Top for GIF Modal */}
//       <button
//         onClick={() => setShowGifModal(true)}
//         className="mb-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 font-medium"
//       >
//         View  GIFs
//       </button>

//       <div className="mb-4">
//         <div className="relative max-w-md bg-theme-bg2">
//           <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white placeholder-white" />
//           <input
//             type="text"
//             placeholder="Search vehicles..."
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value);
//               setCurrentPage(1);
//             }}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 text-white rounded-lg bg-theme-bg2 placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//             disabled={loading || isSubmitting || csvUploading}
//           />
//         </div>
//       </div>

//       {error && (
//         <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
//           Error: {error}
//         </div>
//       )}

//       <div className="hidden md:block relative bg-theme-bg2 rounded-2xl p-2">
//         <div
//           ref={tableContainerRef}
//           style={{
//             scrollbarWidth: "auto",
//           }}
//           className="w-full overflow-x-auto custom-scrollbar"
//         >
//           <table className="w-full border-collapse text-left text-white [&_th]:text-white [&_td]:text-white">
//             <thead className="bg-theme-bg2">
//               <tr>
//                 <th className="p-3 border text-sm font-semibold whitespace-nowrap">
//                   Images
//                 </th>
//                 <th className="p-3 border text-sm font-semibold whitespace-nowrap">
//                   Country
//                 </th>
//                 <th className="p-3 border text-sm font-semibold whitespace-nowrap">
//                   Vehicle
//                 </th>
//                 <th className="p-3 border text-sm font-semibold whitespace-nowrap">
//                   Model
//                 </th>
//                  <th className="p-3 border text-sm font-semibold whitespace-nowrap">
//                   Registration Plate No.
//                 </th>
//                 <th className="p-3 border text-sm font-semibold whitespace-nowrap">
//                   Year
//                 </th>
//                 <th className="p-3 border text-sm font-semibold whitespace-nowrap">
//                   Manufacturer
//                 </th>
//                 <th className="p-3 border text-sm font-semibold whitespace-nowrap">
//                   Length
//                 </th>
//                 <th className="p-3 border text-sm font-semibold whitespace-nowrap">
//                   Width
//                 </th>
//                 <th className="p-3 border text-sm font-semibold whitespace-nowrap">
//                   Height
//                 </th>
//                 <th className="p-3 border text-sm font-semibold whitespace-nowrap">
//                   Wheel Base
//                 </th>
//                 <th className="p-3 border text-sm font-semibold whitespace-nowrap">
//                   Curb Weight
//                 </th>
//                 <th className="p-3 border text-sm font-semibold whitespace-nowrap">
//                   Engine Size
//                 </th>
//                 <th className="p-3 border text-sm font-semibold whitespace-nowrap">
//                   Cab Width
//                 </th>
//                 <th className="p-3 border text-sm font-semibold whitespace-nowrap">
//                   Cab Height
//                 </th>
//                 <th className="p-3 border text-sm font-semibold whitespace-nowrap">
//                   Bonnet Width
//                 </th>
//                 <th className="p-3 border text-sm font-semibold whitespace-nowrap">
//                   Bonnet Length
//                 </th>
//                 <th className="p-3 border text-sm font-semibold whitespace-nowrap text-center">
//       Approval Status
//     </th>
//                 <th className="p-3 border text-sm font-semibold whitespace-nowrap">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentVehicles.length > 0 ? (
//                 currentVehicles.map((v) => (
//                   <tr
//                     key={v._id}
//                     className="hover:bg-theme-bg transition duration-200 border-b border-gray-600"
//                   >
//                     <td className="p-3 border text-sm w-48 max-w-48">
//                       <ImageSlider images={v.images} onImageClick={viewImage} />
//                     </td>
//                     <td className="p-3 border text-sm">{v.country || "-"}</td>
//                     <td className="p-3 border text-sm">{v.vehicle || "-"}</td>
//                     <td className="p-3 border text-sm">{v.model || "-"}</td>
//                     <td className="p-3 border text-sm">{v.registrationPlate || "-"}</td>
//                     <td className="p-3 border text-sm">
//                       {v.yearOfManufacture || "-"}
//                     </td>
//                     <td className="p-3 border text-sm">
//                       {v.manufacturer || "-"}
//                     </td>
//                     <td className="p-3 border text-sm">
//                       {v.dimensions?.length || "-"}
//                     </td>
//                     <td className="p-3 border text-sm">
//                       {v.dimensions?.width || "-"}
//                     </td>
//                     <td className="p-3 border text-sm">
//                       {v.dimensions?.height || "-"}
//                     </td>
//                     <td className="p-3 border text-sm">
//                       {v.dimensions?.wheelbase || "-"}
//                     </td>
//                     <td className="p-3 border text-sm">
//                       {v.dimensions?.curbWeight || "-"}
//                     </td>
//                     <td className="p-3 border text-sm">
//                       {v.dimensions?.engineSize || "-"}
//                     </td>
//                     <td className="p-3 border text-sm">
//                       {v.dimensions?.cabwidth || "-"}
//                     </td>
//                     <td className="p-3 border text-sm">
//                       {v.dimensions?.cabheight || "-"}
//                     </td>
//                     <td className="p-3 border text-sm">
//                       {v.dimensions?.bonnetwidth || "-"}
//                     </td>
//                     <td className="p-3 border text-sm">
//                       {v.dimensions?.bonnetLength || "-"}
//                     </td>
//                     <td className="p-3 border text-center">
//           <span
//             className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
//               v.isApproved
//                 ? "bg-green-600 text-white"
//                 : "bg-yellow-600 text-white"
//             }`}
//           >
//             {v.isApproved ? "Approved" : "Pending Approval"}
//           </span>
//         </td>
//                     <td className="p-3 border text-sm">
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => openEditModal(v)}
//                           className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition disabled:opacity-50"
//                           disabled={loading || isSubmitting || csvUploading}
//                         >
//                           <FiEdit />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(v._id)}
//                           className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition disabled:opacity-50"
//                           disabled={loading || isSubmitting || csvUploading}
//                         >
//                           <FiTrash />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="17" className="p-4 text-center text-gray-300">
//                     {searchTerm
//                       ? "No vehicles found matching your search"
//                       : "No vehicles found"}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       <div className="md:hidden">
//         <div className="space-y-4">
//           {currentVehicles.length > 0 ? (
//             currentVehicles
//               .map((v) => {
//                 if (!v || typeof v !== "object") {
//                   console.warn("Skipping invalid vehicle in mobile view:", v);
//                   return null;
//                 }
//                 return (
//                   <div
//                     key={v._id || Math.random()}
//                     className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
//                   >
//                     <div className="flex justify-between items-start mb-3">
//                       <div className="flex-1">
//                         <h3 className="font-semibold text-lg text-gray-800">
//                           {v.vehicle || "Unknown Vehicle"}
//                         </h3>
//                         <p className="text-md text-gray-700">
//                           {v.model || "Unknown Model"}
//                         </p>
//                         <p className="text-sm text-gray-600">
//                           {v.manufacturer || "Unknown Manufacturer"}
//                         </p>
//                       </div>
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => openEditModal(v)}
//                           className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition disabled:opacity-50"
//                           disabled={loading || isSubmitting || csvUploading}
//                         >
//                           <FiEdit />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(v._id)}
//                           className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition disabled:opacity-50"
//                           disabled={loading || isSubmitting || csvUploading}
//                         >
//                           <FiTrash />
//                         </button>
//                       </div>
//                     </div>
//                     {v.images && v.images.length > 0 && (
//                       <div className="mb-3 flex justify-center">
//                         <div className="w-32">
//                           <ImageSlider images={v.images} onImageClick={viewImage} />
//                         </div>
//                       </div>
//                     )}
//                     <div className="grid grid-cols-2 gap-2 text-sm">
//                       <div>
//                         <span className="font-medium">Country:</span>{" "}
//                         {v.country || "-"}
//                       </div>
//                       <div>
//                         <span className="font-medium">Year:</span>{" "}
//                         {v.yearOfManufacture || "-"}
//                       </div>
//                       <div>
//                         <span className="font-medium">Length:</span>{" "}
//                         {v.dimensions?.length || "-"}
//                       </div>
//                       <div>
//                         <span className="font-medium">Width:</span>{" "}
//                         {v.dimensions?.width || "-"}
//                       </div>
//                       <div>
//                         <span className="font-medium">Height:</span>{" "}
//                         {v.dimensions?.height || "-"}
//                       </div>
//                       <div>
//                         <span className="font-medium">Wheel Base:</span>{" "}
//                         {v.dimensions?.wheelbase || "-"}
//                       </div>
//                       <div>
//                         <span className="font-medium">Curb Weight:</span>{" "}
//                         {v.dimensions?.curbWeight || "-"}
//                       </div>
//                       <div>
//                         <span className="font-medium">Engine Size:</span>{" "}
//                         {v.dimensions?.engineSize || "-"}
//                       </div>
//                       <div>
//                         <span className="font-medium">Cab Width:</span>{" "}
//                         {v.dimensions?.cabwidth || "-"}
//                       </div>
//                       <div>
//                         <span className="font-medium">Cab Height:</span>{" "}
//                         {v.dimensions?.cabheight || "-"}
//                       </div>
//                       <div className="col-span-2">
//                         <span className="font-medium">Bonnet Width:</span>{" "}
//                         {v.dimensions?.bonnetwidth || "-"}
//                       </div>
//                       <div className="col-span-2">
//                         <span className="font-medium">Bonnet Length:</span>{" "}
//                         {v.dimensions?.bonnetLength || "-"}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })
//               .filter(Boolean)
//           ) : (
//             <div className="text-center py-8 text-gray-500">
//               {searchTerm
//                 ? "No vehicles found matching your search"
//                 : "No vehicles found"}
//             </div>
//           )}
//         </div>
//       </div>

//       {totalPages > 1 && (
//         <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
//           <div className="text-sm text-gray-600">
//             Showing {startIndex + 1} to{" "}
//             {Math.min(endIndex, filteredVehicles.length)} of{" "}
//             {filteredVehicles.length} vehicles
//           </div>
//           <div className="flex justify-center flex-wrap">
//             {renderPagination()}
//           </div>
//         </div>
//       )}

//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
//           <div className="bg-theme-bg rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto text-white">
//             <div className="p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-semibold">
//                   {isEditMode ? "Edit Vehicle" : "Add Vehicle"}
//                 </h3>
//                 <button
//                   onClick={() => setShowModal(false)}
//                   className="text-red-500 hover:text-red-700"
//                   disabled={isSubmitting}
//                 >
//                   <FiX size={20} />
//                 </button>
//               </div>
//               <div className="mb-6">
//                 <button
//                   type="button"
//                   onClick={() => setShowMeasurementGuide(true)}
//                   className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-lg transition transform hover:scale-105"
//                 >
//                   <FiImage className="text-xl" />
//                   How to Take Accurate Vehicle Measurements (Click to View Guide)
//                 </button>
//               </div>
//               {showMeasurementGuide && (
//                 <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-80 p-4">
//                   <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
//                     <div className="sticky top-0 z-10 flex justify-end p-4 bg-white/90 backdrop-blur">
//                       <button
//                         onClick={() => setShowMeasurementGuide(false)}
//                         className="bg-red-600 hover:bg-red-700 text-white text-4xl font-bold rounded-full w-12 h-12 flex items-center justify-center shadow-xl transition"
//                       >
//                         ×
//                       </button>
//                     </div>
//                     <div className="p-4 overflow-y-auto max-h-[85vh]">
//                       <img
//                         src={measurementGuide}
//                         alt="How to measure vehicle dimensions"
//                         className="w-full h-auto rounded-xl shadow-lg"
//                       />
//                     </div>
//                     <div className="p-4 text-center">
//                       <p className="text-gray-700 font-medium">
//                         Tip: All measurements in <strong>centimeters (cm)</strong> except Curb Weight (kg) & Engine Size (cc)
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
//                   <h4 className="text-md font-semibold mb-2">
//                     Vehicle Images {isEditMode ? "(Optional)" : "(Required)"}
//                   </h4>
//                   <div className="flex flex-col gap-4">
//                     <label className="cursor-pointer bg-theme-bg2 hover:bg-theme-bg  rounded-lg p-4 text-center transition duration-200">
//                       <FiUpload className="mx-auto mb-2 text-2xl text-white" />
//                       <span className="text-blue-700 font-medium">
//                         Click to upload images (Max 5 files)
//                       </span>
//                       <input
//                         type="file"
//                         multiple
//                         accept="image/*"
//                         onChange={handleImageSelect}
//                         className="hidden"
//                         disabled={isSubmitting}
//                       />
//                     </label>
//                     {imagePreviewUrls.length > 0 && (
//                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
//                         {imagePreviewUrls.map((url, index) => (
//                           <div key={index} className="relative group">
//                             <img
//                               src={url}
//                               alt={`Preview ${index + 1}`}
//                               className="w-full h-24 object-cover rounded-lg"
//                             />
//                             <button
//                               type="button"
//                               onClick={() => removeImage(index)}
//                               className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
//                               disabled={isSubmitting}
//                             >
//                               <FiX size={12} />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white">
//    <div>

//   <select
//     value={formData.country}
//     onChange={(e) => {
//       setFormData((prev) => ({ ...prev, country: e.target.value }));
//     }}
//     required
//     disabled={isSubmitting}
//     className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-bg2 text-white"
//   >
//     <option value="">Select Country</option>
//     {worldData
//       .slice()
//       .sort((a, b) => a.name.localeCompare(b.name)) // A to Z sorted
//       .map((country) => (
//         <option key={country.id} value={country.name}>
//           {country.name}
//         </option>
//       ))}
//   </select>
// </div>
//                     <input
//                     name="vehicle"
//                     value={formData.vehicle}
//                     onChange={handleChange}
//                     placeholder="Vehicle"
//                     className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-bg2 text-white"
//                     required
//                     disabled={isSubmitting}
//                   />
//                   <input
//                     name="model"
//                     value={formData.model}
//                     onChange={handleChange}
//                     placeholder="Model"
//                     className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-bg2 text-white"
//                     required
//                     disabled={isSubmitting}
//                   />
//                   <input
//                     name="yearOfManufacture"
//                     value={formData.yearOfManufacture}
//                     onChange={handleChange}
//                     placeholder="Year of Manufacture"
//                     type="number"
//                     min="1"
//                     step={1}
//                     className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-bg2 text-white"
//                     required
//                     disabled={isSubmitting}
//                   />
//                   <input
//                     name="manufacturer"
//                     value={formData.manufacturer}
//                     onChange={handleChange}
//                     placeholder="Manufacturer"
//                     className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-bg2 text-white"
//                     required
//                     disabled={isSubmitting}
//                   />
//                   <input
//   name="registrationPlate"
//   value={formData.registrationPlate || ""}
//   onChange={handleChange}
//   placeholder="Registration Plate (e.g., MH02AB1234)"
//   className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-bg2 text-white"
//   required
//   disabled={isSubmitting}
// />
//                   <div className="relative">
//                     <input
//                       name="length"
//                       value={formData.dimensions.length}
//                       onChange={handleChange}
//                       placeholder="Length (cm)"
//                       type="number"
//                       min="1"
//                       step="1"
//                       className="border border-gray-300 p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-theme-bg2 text-white"
//                       disabled={isSubmitting}
//                     />
//                     <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
//                       cm
//                     </span>
//                   </div>
//                   <div className="relative">
//                     <input
//                       name="width"
//                       value={formData.dimensions.width}
//                       onChange={handleChange}
//                       placeholder="Width (cm)"
//                       type="number"
//                       min={1}
//                       step="1"
//                       className="border border-gray-300 p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-theme-bg2 text-white"
//                       disabled={isSubmitting}
//                     />
//                     <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
//                       cm
//                     </span>
//                   </div>
//                   <div className="relative">
//                     <input
//                       name="height"
//                       value={formData.dimensions.height}
//                       onChange={handleChange}
//                       placeholder="Height (cm)"
//                       type="number"
//                       min={1}
//                       step="1"
//                       className="border border-gray-300 p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-theme-bg2 text-white"
//                       disabled={isSubmitting}
//                     />
//                     <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
//                       cm
//                     </span>
//                   </div>
//                   <div className="relative">
//                     <input
//                       name="wheelbase"
//                       value={formData.dimensions.wheelbase}
//                       onChange={handleChange}
//                       placeholder="Wheelbase (cm)"
//                       type="number"
//                       min={1}
//                       step="1"
//                       className="border border-gray-300 p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-theme-bg2 text-white"
//                       disabled={isSubmitting}
//                     />
//                     <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
//                       cm
//                     </span>
//                   </div>
//                   <div className="relative">
//                     <input
//                       name="curbWeight"
//                       value={formData.dimensions.curbWeight}
//                       onChange={handleChange}
//                       placeholder="Curb Weight (kg)"
//                       type="number"
//                       min="1000"
//                       step="50"
//                       className="border border-gray-300 p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-theme-bg2 text-white"
//                       disabled={isSubmitting}
//                     />
//                     <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
//                       kg
//                     </span>
//                   </div>
//                  <div className="relative">
//                     <input
//                       name="engineSize"
//                       value={formData.dimensions.engineSize}
//                       onChange={handleChange}
//                       placeholder="Engine Size (e.g., 2.0L 4-Cylinder Diesel)"
//                       type="text"

//                       className="bg-theme-bg2  text-white border border-gray-300 p-3 pr-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
//                       disabled={isSubmitting}
//                     />
//                     <span className="absolute right-3 top-1/2 -translate-y-1/2  text-white">
//                       cc
//                     </span>
//                   </div>
//                   <div className="relative">
//                     <input
//                       name="cabwidth"
//                       value={formData.dimensions.cabwidth}
//                       onChange={handleChange}
//                       placeholder="Cab Width (cm)"
//                       type="number"
//                       step="1"
//                       min={1}
//                       className="border border-gray-300 p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-theme-bg2 text-white"
//                       disabled={isSubmitting}
//                     />
//                     <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
//                       cm
//                     </span>
//                   </div>
//                   <div className="relative">
//                     <input
//                       name="cabheight"
//                       value={formData.dimensions.cabheight}
//                       onChange={handleChange}
//                       placeholder="Cab Height (cm)"
//                       type="number"
//                       min={1}
//                       step="1"
//                       className="border border-gray-300 p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-theme-bg2 text-white"
//                       disabled={isSubmitting}
//                     />
//                     <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
//                       cm
//                     </span>
//                   </div>
//                   <div className="relative">
//                     <input
//                       name="bonnetwidth"
//                       value={formData.dimensions.bonnetwidth}
//                       onChange={handleChange}
//                       placeholder="Bonnet Width (cm)"
//                       type="number"
//                       step="1"
//                       min={1}
//                       className="border border-gray-300 p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-theme-bg2 text-white"
//                       disabled={isSubmitting}
//                     />
//                     <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
//                       cm
//                     </span>
//                   </div>
//                   <div className="relative">
//                     <input
//                       name="bonnetLength"
//                       value={formData.dimensions.bonnetLength}
//                       onChange={handleChange}
//                       placeholder="Bonnet Length (cm)"
//                       type="number"
//                       step="1"
//                       min={1}
//                       className="border border-gray-300 p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-theme-bg2 text-white"
//                       disabled={isSubmitting}
//                     />
//                     <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
//                       cm
//                     </span>
//                   </div>
//                 </div>
//                 <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
//                   <button
//                     type="button"
//                     onClick={() => setShowModal(false)}
//                     className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
//                     disabled={isSubmitting}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
//                     disabled={isSubmitting}
//                   >
//                     {isSubmitting ? (
//                       <>
//                         <LoadingSpinner size="small" />
//                         Saving...
//                       </>
//                     ) : isEditMode ? (
//                       "Update"
//                     ) : (
//                       "Add"
//                     )}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {showImageModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
//           <div className="relative max-w-4xl max-h-[90vh]">
//             <button
//               onClick={() => setShowImageModal(false)}
//               className="absolute -top-10 right-0 text-white hover:text-gray-300"
//               disabled={isSubmitting}
//             >
//               <FiX size={24} />
//             </button>
//             <img
//               src={selectedImageForView}
//               alt="Vehicle"
//               className="max-w-full max-h-[85vh] object-contain rounded-lg"
//             />
//           </div>
//         </div>
//       )}

//       {/* GIF Modal with Pagination */}
//       {showGifModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
//           <div className="bg-theme-bg rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto text-white">
//             <div className="p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-2xl font-bold"> Advertisement GIFs</h3>
//                 <button
//                   onClick={() => {
//                     setShowGifModal(false);
//                     setCurrentGifPage(1);
//                   }}
//                   className="text-red-500 hover:text-red-700"
//                 >
//                   <FiX size={24} />
//                 </button>
//               </div>
//               {gifLoading ? (
//                 <div className="text-center py-12">
//                   <LoadingSpinner size="medium" />
//                 </div>
//               ) : publicGifs && publicGifs.length > 0 ? (
//                 <>
//                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
//                     {currentGifs.map((gifItem) => (
//                       <div
//                         key={gifItem._id}
//                         onClick={() => handleGifClick(gifItem._id)}
//                         className="bg-theme-bg2 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-700"
//                       >
//                         <div className="aspect-square relative overflow-hidden">
//                           <img
//                             src={gifItem.gifs[0]}
//                             alt={gifItem.title}
//                             className="w-full h-full object-cover"
//                           />
//                           <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
//                             <h3 className="text-white font-semibold text-sm truncate">
//                               {gifItem.title}
//                             </h3>
//                             <p className="text-gray-300 text-xs">
//                               {gifItem.gifs.length} GIF{gifItem.gifs.length > 1 ? "s" : ""}
//                             </p>
//                             {/* <div className="flex flex-wrap gap-2 mt-2 text-xs">
//                               <span className="text-gray-200">Impressions: {gifItem.impressions || 0}</span>
//                               <span className="text-green-400">Clicks: {gifItem.clicks || 0}</span>
//                             </div>
//                             {gifItem.ctr !== undefined && (
//                               <p className="text-yellow-400 text-xs mt-1">
//                                 CTR: {(gifItem.ctr || 0).toFixed(2)}%
//                               </p>
//                             )} */}
//                           </div>
//                           <div className="absolute top-2 right-2 bg-black/50 rounded-full p-2">
//                             <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
//                               <path d="M8 5v10l7-5z" />
//                             </svg>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                   {totalGifPages > 1 && (
//                     <div className="mt-6 flex justify-center">
//                       {renderGifPagination()}
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 <div className="text-center py-12 text-gray-400">
//                   <p className="text-lg">No public GIFs available yet.</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// export default AddVehicleDimensions;
