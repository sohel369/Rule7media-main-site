import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCommission,
  updateCommission,
  reset,
} from "../../store/commission/commissionSlice";
import { toast } from "react-toastify";
const CommissionAdmin = () => {
  const [newRates, setNewRates] = useState({
    threeMonth: "",
    sixMonth: "",
    twelveMonth: "",
  });

  const dispatch = useDispatch();
  const { commission, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.commission,
  );

  useEffect(() => {
    if (isSuccess && message) {
      toast.success(message);
      dispatch(reset());
    }
    if (isError && message) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isSuccess, isError, message, dispatch]);

  useEffect(() => {
    dispatch(fetchCommission());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const handleUpdate = (subscriptionType) => {
    const rateValue = newRates[subscriptionType];
    if (rateValue) {
      dispatch(
        updateCommission({
          planDuration: subscriptionType,
          commissionRate: parseFloat(rateValue),
        }),
      );
      setNewRates((prev) => ({ ...prev, [subscriptionType]: "" }));
    }
  };

  // Get current rates from commission object
  const getCurrentRate = (planType) => {
    if (!commission) return 0;
    return commission[planType] || 0;
  };

  const subscriptionPlans = [
    {
      key: "threeMonth",
      label: "3 Month Subscription",
      currentRate: getCurrentRate("threeMonth"),
      color: "text-green-600",
    },
    {
      key: "sixMonth",
      label: "6 Month Subscription",
      currentRate: getCurrentRate("sixMonth"),
      color: "text-blue-600",
    },
    {
      key: "twelveMonth",
      label: "12 Month Subscription",
      currentRate: getCurrentRate("twelveMonth"),
      color: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-theme-bg rounded-2xl p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Subscription Commission Settings
          </h1>
          <p className="text-white">
            Manage commission rates for different subscription periods
          </p>
        </div>

        {/* Individual Subscription Plan Cards */}
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.key}
            className="bg-theme-bg2 rounded-lg shadow-md p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              {plan.label} Commission
            </h2>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <p className="text-white mb-1">Current Commission Rate</p>
                <p className={`text-2xl font-bold ${plan.color}`}>
                  {plan.currentRate}%
                </p>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  value={newRates[plan.key]}
                  onChange={(e) =>
                    setNewRates({ ...newRates, [plan.key]: e.target.value })
                  }
                  placeholder="Enter new rate"
                  className="w-full p-2 border bg-theme-bg2 text-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              <button
                onClick={() => handleUpdate(plan.key)}
                className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !newRates[plan.key]}
              >
                {isLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        ))}

        {/* Commission Summary Card */}
        <div className="bg-theme-bg2 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            Current Commission Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-theme-bg rounded-lg">
              <p className="text-white font-semibold">3 Month Plan</p>
              <p className="text-2xl font-bold text-white">
                {getCurrentRate("threeMonth")}%
              </p>
            </div>
            <div className="text-center p-4 bg-theme-bg rounded-lg">
              <p className="text-white font-semibold">6 Month Plan</p>
              <p className="text-2xl font-bold text-white">
                {getCurrentRate("sixMonth")}%
              </p>
            </div>
            <div className="text-center p-4 bg-theme-bg rounded-lg">
              <p className="text-white font-semibold">12 Month Plan</p>
              <p className="text-2xl font-bold text-white">
                {getCurrentRate("twelveMonth")}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionAdmin;

// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchCommission, updateCommission, reset } from "../../store/commission/commissionSlice";

// const CommissionAdmin = () => {
//   const [newRate, setNewRate] = useState({Buyerrate:"",SelerRate:""});
//   const dispatch = useDispatch();
//   const { Buyerrate, SelerRate, isLoading, isSuccess, isError, message } = useSelector((state) => state.commission);

//   useEffect(() => {
//     dispatch(fetchCommission());
//     return () => {
//       dispatch(reset());
//     };
//   }, [dispatch]);

//   const handleUpdate = () => {
//     if (newRate) {
//       dispatch(updateCommission(newRate));

//     }
//   };

//   // Format date to readable format
//   const formatDate = (dateString) => {
//     const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
//     return new Date(dateString).toLocaleDateString('en-US', options);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Commission Rate Update Card */}
//         <div className="bg-theme-bg rounded-lg shadow-md p-6 mb-6">
//           <h2 className="text-xl font-bold text-white mb-4 ">Commission Settings For Buyer</h2>
//           <div className="flex flex-col md:flex-row md:items-center gap-4">
//             <div className="flex-1">
//               <p className="text-white mb-1">Current Commission Rate</p>
//               <p className="text-2xl font-bold text-blue-600">{Buyerrate}%</p>
//             </div>
//             <div className="flex-1">
//               <input
//                 type="number"
//                 value={newRate.Buyerrate}
//                 onChange={(e) => setNewRate({ ...newRate, Buyerrate: e.target.value })}
//                 placeholder="Enter new rate"
//                 className="w-full p-2 border bg-theme-bg2 text-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <button
//               onClick={handleUpdate}
//               className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition duration-300"
//               disabled={isLoading}
//             >
//               {isLoading ? "Updating..." : "Update"}
//             </button>
//           </div>
//           {isError && <p className="mt-2 text-red-600 font-semibold">{message}</p>}
//           {isSuccess && <p className="mt-2 text-green-600 font-semibold">{message}</p>}
//         </div>
//         <div className="bg-theme-bg rounded-lg shadow-md p-6 mb-6">
//           <h2 className="text-xl font-bold text-white mb-4">Commission Settings For Seller</h2>
//           <div className="flex flex-col md:flex-row md:items-center gap-4">
//             <div className="flex-1">
//               <p className="text-white mb-1">Current Commission Rate</p>
//               <p className="text-2xl font-bold text-blue-600">{SelerRate}%</p>
//             </div>
//             <div className="flex-1">
//               <input
//                 type="number"
//                 value={newRate.SelerRate}
//                 onChange={(e) => setNewRate({ ...newRate, SelerRate: e.target.value })}
//                 placeholder="Enter new rate"
//                 className="w-full p-2 border bg-theme-bg2 text-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <button
//               onClick={handleUpdate}
//               className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition duration-300"
//               disabled={isLoading}
//             >
//               {isLoading ? "Updating..." : "Update"}
//             </button>
//           </div>
//           {isError && <p className="mt-2 text-red-600 font-semibold">{message}</p>}
//           {isSuccess && <p className="mt-2 text-green-600 font-semibold">{message}</p>}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default CommissionAdmin;
