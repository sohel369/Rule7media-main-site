import axiosInstance from "../../axiosInstance";

export const getCartItems = async () => {
  const response = await axiosInstance.get(`/cart`);
  return response.data;
};
export const getWinningBid = async (userId) => {
  // Remove any spaces around userId
  const response = await axiosInstance.get(`/cart/winning-bid/${userId}`);
  return response.data;
};
export const addToCart = async (cartItem) => {
  const response = await axiosInstance.post(`/cart/add`, cartItem);
  return response.data;
};
export const clearCart = async () => {
  const response = await axiosInstance.delete(`/cart/clear`);
  return response.data;
};

export const deleteCartItem = async (id) => {
  const response = await axiosInstance.delete(`/cart/${id}`);

  return response.data.data;
};
const cartService = {
  getCartItems,
  getWinningBid,
  deleteCartItem,
  addToCart,
  clearCart,
};

export default cartService;
