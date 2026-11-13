import axiosInstance from "../../axiosInstance";

export const getWrappersForOrder = async (orderId) => {
  try {
    const response = await axiosInstance.get(
      `/wrapperassingorder/${orderId}/wrappers`,
    );
    return response.data;
  } catch (error) {
    console.error("Error in getWrappersForOrder service:", error);
    throw error;
  }
};

export const getAllAssignmentsStatus = async () => {
  try {
    const response = await axiosInstance.get(`/wrapperassingorder/assignments`);
    return response.data;
  } catch (error) {
    console.error("Error in getWrapperOrders service:", error);
    throw error;
  }
};

export const getWrapperOrders = async (wrapperId) => {
  try {
    const response = await axiosInstance.get(
      `/wrapperassingorder/wrapper-assignments/${wrapperId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error in getWrapperOrders service:", error);
    throw error;
  }
};

export const getsingleassignmentsorder = async (orderId) => {
  try {
    const response = await axiosInstance.get(
      `/wrapperassingorder/order/${orderId}/assignment`,
    );
    return response.data;
  } catch (error) {
    console.error("Error in getsingleassignmentsorder service:", error);
    throw error;
  }
};

export const assignWrapperToOrder = async (orderId, wrapperId) => {
  try {
    const response = await axiosInstance.post(
      `/wrapperassingorder/${orderId}/assign-wrapper`,
      { wrapperId },
    );
    return response.data;
  } catch (error) {
    console.error("Error in assignWrapperToOrder service:", error);
    throw error;
  }
};

export const updateAssignmentStatus = async (
  assignmentId,
  { status, acceptStatus },
) => {
  try {
    const response = await axiosInstance.put(
      `/wrapperassingorder/${assignmentId}/status`,
      { status, acceptStatus },
    );
    return response.data;
  } catch (error) {
    console.error("Error in updateAssignmentStatus service:", error);
    throw error;
  }
};

const wrapperassignordersService = {
  getWrappersForOrder,
  getWrapperOrders,
  assignWrapperToOrder,
  updateAssignmentStatus,
  getsingleassignmentsorder,
  getAllAssignmentsStatus,
};

export default wrapperassignordersService;
