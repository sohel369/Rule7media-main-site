import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createAuctionsFromCSV } from "../store/auction/auctionSlice";
import { toast } from "react-toastify";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import Papa from "papaparse";

const CSVUpload = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [csvLoading, setCsvLoading] = useState(false);
  const csvRef = useRef(null);

  // Sample CSV template data
  const templateData = [
    {
      name: "Sample Vehicle",
      description: "A sample vehicle description",
      category: "Car",
      vehicleType: "Sedan",
      startTime: "2025-10-01T10:00:00",
      endTime: "2025-10-07T10:00:00",
      startingPrice: 10000,
      "location.zip": "12345",
      "location.name": "Sample City",
      images: "http://example.com/image1.jpg,http://example.com/image2.jpg",
      "vehicle.country": "USA",
      "vehicle.yearofmanufacture": 2020,
      "vehicle.manufacturer": "Toyota",
      "vehicle.model": "Camry",
      "vehicle.dimensions.length": 4885,
      "vehicle.dimensions.width": 1840,
      "vehicle.dimensions.height": 1455,
      "vehicle.dimensions.wheelbase": 2825,
      "vehicle.dimensions.curbWeight": 1500,
      "vehicle.dimensions.engineSize": 2500,
      "vehicle.dimensions.cabwidth": 0,
      "vehicle.dimensions.cabheight": 0,
      "vehicle.dimensions.bonnetwidth": 0,
      "vehicle.dimensions.bonnetLength": 0,
      "vehicle.manufacturerLink": "http://example.com/toyota",
    },
  ];

  // Function to download CSV template
  const downloadTemplate = () => {
    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "auction_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvLoading(true);

    try {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const csvData = results.data
            .filter((row) => Object.values(row).some((val) => val))
            .map((row) => ({
              ...row,
              sellerId: user._id,
              name: row.name,
              description: row.description,
              category: row.category,
              vehicleType: row.vehicleType,
              startTime: row.startTime,
              endTime: row.endTime,
              startingPrice: parseFloat(row.startingPrice),
              location: {
                zip: row["location.zip"],
                name: row["location.name"],
              },
              images: row.images
                ? row.images.split(",").map((url) => url.trim())
                : [],
              vehicle: {
                country: row["vehicle.country"],
                yearofmanufacture: row["vehicle.yearofmanufacture"],
                manufacturer: row["vehicle.manufacturer"],
                model: row["vehicle.model"],
                dimensions: {
                  length: parseFloat(row["vehicle.dimensions.length"] || 0),
                  width: parseFloat(row["vehicle.dimensions.width"] || 0),
                  height: parseFloat(row["vehicle.dimensions.height"] || 0),
                  wheelbase: parseFloat(
                    row["vehicle.dimensions.wheelbase"] || 0,
                  ),
                  curbWeight: parseFloat(
                    row["vehicle.dimensions.curbWeight"] || 0,
                  ),
                  engineSize: parseFloat(
                    row["vehicle.dimensions.engineSize"] || 0,
                  ),
                  cabwidth: parseFloat(row["vehicle.dimensions.cabwidth"] || 0),
                  cabheight: parseFloat(
                    row["vehicle.dimensions.cabheight"] || 0,
                  ),
                  bonnetwidth: parseFloat(
                    row["vehicle.dimensions.bonnetwidth"] || 0,
                  ),
                  bonnetLength: parseFloat(
                    row["vehicle.dimensions.bonnetLength"] || 0,
                  ),
                },
                manufacturerLink: row["vehicle.manufacturerLink"] || "",
              },
            }));

          if (csvData.length === 0) {
            toast.error("CSV file is empty or invalid format");
            setCsvLoading(false);
            return;
          }

          const response = await dispatch(
            createAuctionsFromCSV(csvData),
          ).unwrap();

          setCsvLoading(false);

          if (response.error) {
            toast.error(
              "Error uploading CSV: " +
                (response.payload?.message || "Unknown error"),
            );
          } else {
            const resultData = response.payload?.data;
            if (resultData?.errorCount > 0) {
              toast.warning(
                `Successfully created items, ` +
                  `${resultData.errorCount} failed`,
              );
              console.error("CSV errors:", resultData.errors);
            } else {
              toast.success(`Successfully uploaded items from CSV`);
            }
          }
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          toast.error("Error parsing CSV: " + error.message);
          setCsvLoading(false);
        },
      });
    } catch (error) {
      console.error("Error processing CSV:", error);
      toast.error("Error processing CSV: " + error.message);
      setCsvLoading(false);
    } finally {
      setCsvLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="bg-theme-bg p-8 rounded-2xl border border-border-info-color w-full max-w-2xl mx-auto my-10">
      <h2 className="text-2xl font-bold text-white mb-6">Upload CSV</h2>
      <div className="flex flex-col items-center gap-4">
        <div
          onClick={() => csvRef.current.click()}
          className="w-full h-40 bg-theme-bg2 rounded-xl border-2 border-dashed border-border-info-color flex items-center justify-center cursor-pointer hover:bg-theme-bg3 transition-colors"
        >
          <div className="text-center flex flex-col items-center gap-2 text-white">
            <IoDocumentTextOutline size={48} className="text-theme-color" />
            <p>Click to Upload CSV File</p>
            <span className="text-sm">CSV Format Only</span>
          </div>
        </div>
        <input
          type="file"
          ref={csvRef}
          onChange={handleCSVUpload}
          accept=".csv"
          className="hidden"
        />
        <div className="flex gap-4">
          <button
            onClick={() => csvRef.current.click()}
            className="px-6 py-3 bg-theme-color text-white rounded-lg flex items-center gap-2 hover:bg-color-danger"
            disabled={csvLoading}
          >
            {csvLoading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <>
                <IoDocumentTextOutline size={20} />
                Upload CSV
              </>
            )}
          </button>
          <button
            onClick={downloadTemplate}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <IoDocumentTextOutline size={20} />
            Download Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSVUpload;
