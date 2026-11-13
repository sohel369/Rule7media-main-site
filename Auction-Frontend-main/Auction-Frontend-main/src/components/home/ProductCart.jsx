import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProductCart = () => {
  const [cart, setCart] = useState(() => {
    return JSON.parse(localStorage.getItem("cart")) || [];
  });

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const increaseQuantity = (productId) => {
    setCart(
      cart.map((item) =>
        item._id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  };

  const decreaseQuantity = (productId) => {
    setCart(
      cart.map((item) =>
        item._id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item._id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="container mx-auto px-5 py-10">
      <h2 className="text-3xl font-bold text-gray-800 text-center">
        Your Cart 🛒
      </h2>

      {cart.length === 0 ? (
        <div className="text-center mt-10">
          <p className="text-lg text-gray-600">Your cart is empty!</p>
          <button
            onClick={() => navigate("/")}
            className="mt-5 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex justify-between items-center p-4 bg-white shadow-md rounded-lg"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-md"
                />
                <div>
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-600">
                    ${item.price} x {item.quantity}
                  </p>
                  <div className="flex items-center mt-2">
                    <button
                      onClick={() => decreaseQuantity(item._id)}
                      className="bg-gray-300 px-2 py-1 rounded"
                    >
                      -
                    </button>
                    <span className="mx-3">{item.quantity}</span>
                    <button
                      onClick={() => increaseQuantity(item._id)}
                      className="bg-gray-300 px-2 py-1 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item._id)}
                className="text-red-600 hover:text-red-800"
              >
                ❌ Remove
              </button>
            </div>
          ))}

          <div className="text-right">
            <h3 className="text-xl font-bold">
              Total: ${calculateTotal().toFixed(2)}
            </h3>
            <button
              onClick={() => alert("Proceeding to checkout...")}
              className="mt-4 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCart;
