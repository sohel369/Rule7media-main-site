import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";
import socket from "../socket";

const SingleProduct = ({
  id,
  name,
  category,
  image,
  price,
  quantity,
  status,
}) => {
  const navigate = useNavigate();
  const [statusData, setStatusData] = useState(status);

  const { categories } = useSelector((state) => state.category);

  const categoryList = categories?.data || [];

  const categoryName =
    categoryList.find((cat) => cat._id === category)?.name ||
    "Unknown Category";

  useEffect(() => {
    const handleStatusChange = () => {
      setStatusData("over");
    };

    socket.on("setStatus", handleStatusChange);

    return () => {
      socket.off("setStatus", handleStatusChange);
    };
  }, []);
  const handleProductClick = () => {
    if (!id) {
      console.error("❌ Product ID undefined!");
      return;
    }
    navigate(`/ProductDetails/${id}`);
  };
  return (
    <div
      className="h-full justify-between bg-white rounded-lg flex flex-col p-3 text-white border-2 cursor-pointer hover:shadow-lg transition-shadow duration-300"
      onClick={handleProductClick}
    >
      <div>
        <div className="w-full rounded-md relative bg-white overflow-hidden">
          <img
            className="w-full sm:h-[300px] rounded-md object-cover hover:scale-105 transition-all duration-300"
            src={image}
            alt="item image"
          />
        </div>
        <h3 className="my-3 text-[19px] font-Barlow text-black">{name}</h3>
      </div>

      <div>
        <div className="flex justify-start items-center">
          <div className="ml-3">
            <h3 className="text-sm text-black">Category: {categoryName}</h3>
          </div>
        </div>

        <div className="flex justify-start items-center">
          <div className="ml-3">
            <h3 className="text-sm text-black">Price: ${price}</h3>
          </div>
        </div>

        <div className="flex justify-start items-center">
          <div className="ml-3">
            <h3 className="text-sm text-black">Quantity: {quantity}</h3>
          </div>
        </div>

        {statusData && (
          <div className="flex justify-start items-center">
            <div className="ml-3">
              <h3 className="text-sm text-black">Status: {statusData}</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleProduct;
