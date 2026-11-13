import axiosInstance from "../../axiosInstance";

const getAllVehicles = async () => {
  const response = await axiosInstance.get(`/vehicle/admin/vehicles`);
  return response.data.data;
};

const addVehicle = async (formData) => {
  const response = await axiosInstance.post(
    `/vehicle/admin/vehicles`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data;
};
const gatVehicalDetails = async (vehicle) => {
  const response = await axiosInstance.get(`/vehicle/model-details/${vehicle}`);
  return response.data;
};

const uploadCsvData = async (vehicles) => {
  const response = await axiosInstance.post(
    "/vehicle/upload",
    { vehicles },
    {
      headers: { "Content-Type": "application/json" },
    },
  );
  return response.data;
};

const updateVehicle = async (id, formData) => {
  const response = await axiosInstance.put(
    `/vehicle/admin/vehicles/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data.data;
};
const deleteVehicle = async (id) => {
  const res = await axiosInstance.delete(`/vehicle/admin/vehicles/${id}`);
  return res.data.data;
};

const approveVehicle = async (vehicleId) => {
  const response = await axiosInstance.put(
    `/vehicle/admin/approve/${vehicleId}`,
  );
  return response.data.data;
};

////fleetowner

const getVehiclesbyfleetower = async (fleetOwnerId) => {
  const response = await axiosInstance.get(
    `/vehicle/fleetOwner/${fleetOwnerId}`,
  );

  return response.data;
};

const createVehiclebyfleetower = async (fleetOwnerId, formData) => {
  const response = await axiosInstance.post(
    `/vehicle/fleetOwner/${fleetOwnerId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return response.data;
};

const updateVehiclebyfleetower = async (id, formData) => {
  const response = await axiosInstance.put(
    `/vehicle/fleetOwner/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data.data;
};
const deleteVehiclbyfleetower = async (id) => {
  const res = await axiosInstance.delete(`/vehicle/fleetOwner/${id}`);
  return res.data.data;
};

const uploadVehicleCSVByFleetOwner = async (vehicles, fleetOwnerId) => {
  const response = await axiosInstance.post(
    `/vehicle/fleetOwner/upload/${fleetOwnerId}`,
    vehicles, // send array of objects directly
    { headers: { "Content-Type": "application/json" } },
  );
  return response.data;
};

const vehicleService = {
  getAllVehicles,
  addVehicle,
  gatVehicalDetails,
  uploadCsvData,
  updateVehicle,
  deleteVehicle,
  approveVehicle,
  getVehiclesbyfleetower,
  createVehiclebyfleetower,
  updateVehiclebyfleetower,
  deleteVehiclbyfleetower,
  uploadVehicleCSVByFleetOwner,
};
export default vehicleService;
