import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  createsubscriptionCheckoutSession,
  fetchSubscriptionPlanes,
  checkSubscriptionStatus,
} from "../store/subscription/subscriptionSlice";
import {
  fetchPlansForUser,
  upgradeSubscription,
} from "../store/subscriptionplans/subscriptionPlanSlice";
import { fetchUserCountry } from "../store/countary/countrySlice";
import { toast, ToastContainer } from "react-toastify";
import { logout } from "../store/auth/authSlice";

const countryNameToCode = {
  "United States": "US",
  India: "IN",
  Canada: "CA",
  Australia: "AU",
  China: "CN",
  Thailand: "TH",
  Japan: "JP",
  France: "FR",
  Indonesia: "ID",
  "United Kingdom": "GB",
  Spain: "ES",
};

const PricingOptions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    checkoutUrl,
    subscriptionPlanes,
    subscriptionStatus,
    loading: subLoading,
    error: subError,
    upgradeMessage,
    upgradeError,
  } = useSelector((state) => state.subscription);

  const { country } = useSelector((state) => state.country);
  const { user, isLoading } = useSelector((state) => state.auth);
  const userEmail = user?.email || "";
  const userType = user?.userType?.toLowerCase() || "";

  const [current, setCurrent] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [errorMessage, setErrorMessage] = useState(null);
  const [processingPlanId, setProcessingPlanId] = useState(null);
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPriceId, setSelectedPriceId] = useState(null);
  const [processingUpgrade, setProcessingUpgrade] = useState(false);
  const [upgradeErrorMessage, setUpgradeErrorMessage] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const userTypeToStatementDescriptor = {
    fleetowner: "Fleet Owner",
    seller: "Fleet Owner",
    advertiser: "Advertiser",
    buyer: "Advertiser",
    wrapper: "Wrapper",
  };

  const filteredPlanes = subscriptionPlanes.filter(
    (plan) =>
      plan.statement_descriptor === userTypeToStatementDescriptor[userType],
  );

  const { userplans, loading, error } = useSelector(
    (state) => state.subscriptionPlan,
  );

  useEffect(() => {
    if (user?._id) {
      dispatch(checkSubscriptionStatus(user._id)).then((action) => {
        // ✅ Handle both response structures
        const subscriptionData = action.payload?.subscription || action.payload;

        const status = subscriptionData?.status;
        setHasActiveSubscription(status === "active" || status === "trialing");

        if (subscriptionData) {
        }
      });
    }
  }, [dispatch, user?._id]);

  useEffect(() => {
    if (upgradeMessage) {
      toast.success(upgradeMessage);
      //dispatch(clearUpgradeMessage());
    }

    if (upgradeError) {
      toast.error(upgradeError);
      //dispatch(clearUpgradeMessage());
    }
  }, [upgradeMessage, upgradeError, dispatch]);

  useEffect(() => {
    if (
      !isLoading &&
      !subLoading &&
      !loading &&
      userType &&
      filteredPlanes.length > 0
    ) {
      setIsPageLoading(false);
    }
  }, [isLoading, subLoading, loading, userType, filteredPlanes]);

  const reorderedPlanes = (() => {
    if (filteredPlanes.length === 0) return filteredPlanes;

    const newArray = [...filteredPlanes];

    const getDuration = (plan) => {
      let duration = 3;
      if (plan.description) {
        if (plan.description.includes("12-month")) return 12;
        if (plan.description.includes("6-month")) return 6;
        if (plan.description.includes("3-month")) return 3;
      }
      if (plan.prices[0]?.recurring?.interval_count) {
        const intervalCount = plan.prices[0].recurring.interval_count;
        if (
          plan.prices[0].recurring.interval === "year" &&
          intervalCount === 1
        ) {
          return 12;
        }
        return intervalCount;
      }
      return duration;
    };

    newArray.sort((a, b) => getDuration(a) - getDuration(b));
    return newArray;
  })();

  const getMatchingUserPlan = (stripePlan) => {
    if (!userplans || !Array.isArray(userplans) || userplans.length === 0) {
      return null;
    }

    // Method 1: Match by planCode
    const matchedByPlanCode = userplans.find((userPlan) => {
      return userPlan.planCode === stripePlan.planCode;
    });

    if (matchedByPlanCode) {
      return matchedByPlanCode;
    }

    // Method 2: Match by description keywords
    const matchedByDescription = userplans.find((userPlan) => {
      if (!stripePlan.description) return false;

      const stripeDesc = stripePlan.description.toLowerCase();
      const userPlanName = (userPlan.name || "").toLowerCase();

      // Check for duration keywords
      const durations = {
        12: 12,
        year: 12,
        annual: 12,
        6: 6,
        half: 6,
        3: 3,
        quarter: 3,
      };

      // Extract duration from stripe description
      let stripeDuration = 3;
      for (const [key, duration] of Object.entries(durations)) {
        if (stripeDesc.includes(key)) {
          stripeDuration = duration;
          break;
        }
      }

      // Extract duration from user plan
      let userPlanDuration = userPlan.planDuration || 3;
      const userPlanDesc = (userPlan.description || "").toLowerCase();
      for (const [key, duration] of Object.entries(durations)) {
        if (userPlanDesc.includes(key)) {
          userPlanDuration = duration;
          break;
        }
      }

      return stripeDuration === userPlanDuration;
    });

    return matchedByDescription || null;
  };

  useEffect(() => {
    dispatch(fetchPlansForUser());
  }, [dispatch]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  useEffect(() => {
    dispatch(fetchSubscriptionPlanes()).then(() => {
      setPlansLoaded(true);
    });
  }, [dispatch]);

  useEffect(() => {
    if (
      plansLoaded &&
      filteredPlanes.length === 0 &&
      !subLoading &&
      !subError
    ) {
      const retryFetch = setTimeout(() => {
        dispatch(fetchSubscriptionPlanes());
      }, 2000);
      return () => clearTimeout(retryFetch);
    }
  }, [plansLoaded, filteredPlanes.length, subLoading, subError, dispatch]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (checkoutUrl) window.location.href = checkoutUrl;
  }, [checkoutUrl]);

  // useEffect(() => {
  //   const allowedPaths = ["/Billboard", "/pricing", "/subscription-checkout", "/SubsriptionPaymentSuccess"];
  //   const preventNavigation = (e) => {
  //     if (subscriptionStatus?.status !== "active" && !allowedPaths.includes(window.location.pathname)) {
  //       e.preventDefault();
  //       toast.error("Please select a subscription plan to continue.", { autoClose: 1000 });
  //       navigate("/Billboard", { replace: true });
  //       window.history.pushState(null, null, "/Billboard");
  //     }
  //   };

  //   if (subscriptionStatus?.status !== "active" && !allowedPaths.includes(location.pathname)) {
  //     toast.error("Please select a subscription plan to continue.", { autoClose: 1000 });
  //     navigate("/Billboard", { replace: true });
  //     window.history.pushState(null, null, "/Billboard");
  //   }

  //   window.addEventListener("popstate", preventNavigation);
  //   if (subscriptionStatus?.status !== "active") {
  //     window.history.pushState(null, null, "/Billboard");
  //   }

  //   return () => window.removeEventListener("popstate", preventNavigation);
  // }, [navigate, subscriptionStatus, location.pathname]);

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? reorderedPlanes.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev === reorderedPlanes.length - 1 ? 0 : prev + 1));
  };

  const handleCheckout = (plan) => {
    const priceObj = plan.prices[0];

    if (!priceObj || !plan.id || !userEmail) {
      setErrorMessage(
        "Unable to process this plan. Price, ID, or Email missing.",
      );
      console.error("Validation failed:", {
        priceObj,
        planId: plan.id,
        userEmail,
      });
      return;
    }

    let planDuration;
    if (plan.description) {
      if (
        plan.description.includes("12-month") ||
        plan.description.includes("12 month")
      ) {
        planDuration = 12;
      } else if (
        plan.description.includes("6-month") ||
        plan.description.includes("6 month")
      ) {
        planDuration = 6;
      } else if (
        plan.description.includes("3-month") ||
        plan.description.includes("3 month")
      ) {
        planDuration = 3;
      } else {
        planDuration = 3;
      }
    } else {
      planDuration = 3;
    }

    if (![3, 6, 12].includes(planDuration)) {
      setErrorMessage(
        `Invalid plan duration: ${planDuration}. Must be 3, 6, or 12 months.`,
      );
      console.error("Invalid planDuration:", planDuration, "Full plan:", plan);
      return;
    }

    const payload = {
      priceId: priceObj.id,
      campaignId: plan.id,
      price: priceObj.unit_amount,
      currency: priceObj.currency || "aud",
      recurring: {
        interval: priceObj.recurring?.interval || "month",
        interval_count: priceObj.recurring?.interval_count || 1,
      },
      email: userEmail,
      planDuration,
      country,
    };

    setErrorMessage(null);
    setProcessingPlanId(plan.id);
    dispatch(createsubscriptionCheckoutSession(payload)).finally(() => {
      setProcessingPlanId(null);
    });
  };

  const handleUpgradeClick = (plan, priceId) => {
    if (!hasActiveSubscription) {
      toast.error("You need an active subscription to upgrade");
      return;
    }

    setSelectedPlan(plan);
    setSelectedPriceId(priceId);
    setShowUpgradeModal(true);
    setUpgradeErrorMessage(null);
  };

  const confirmUpgrade = async () => {
    if (!selectedPlan || !selectedPriceId || !userEmail) return;

    setProcessingUpgrade(true);
    setUpgradeErrorMessage(null);

    try {
      const result = await dispatch(
        upgradeSubscription({
          newPriceId: selectedPriceId,
          userEmail,
        }),
      ).unwrap();

      toast.success(result.message || "Subscription upgraded successfully!");

      // Refresh subscription status
      dispatch(checkSubscriptionStatus());

      // Refresh plan details
      dispatch(fetchPlansForUser());

      setShowUpgradeModal(false);
      setSelectedPlan(null);
      setSelectedPriceId(null);
    } catch (error) {
      setUpgradeErrorMessage(error.message || "Failed to upgrade subscription");
      toast.error(error.message || "Failed to upgrade subscription");
    } finally {
      setProcessingUpgrade(false);
    }
  };

  const cancelUpgrade = () => {
    setShowUpgradeModal(false);
    setSelectedPlan(null);
    setSelectedPriceId(null);
    setUpgradeErrorMessage(null);
  };

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const handleDashboard = () => {
    if (dashboardLoading) return;

    setDashboardLoading(true);

    if (user?.subscription?.status === "active") {
      navigate("/user-profile/profile");
    } else {
      navigate("/subscriberonly");
    }

    setTimeout(() => setDashboardLoading(false), 1500);
  };
  const handleLogout = async () => {
    try {
      await dispatch(logout());
      toast.success("Logged out successfully!");
      setTimeout(() => navigate("/login", { replace: true }), 200);
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Logout failed!");
    }
  };

  const formatDescription = (desc) => {
    if (!desc) return "";

    return desc
      .replace(/\\n/g, " ") // \n ko space banao
      .replace(/\n/g, " ") // actual newline ko space
      .replace(/\s+/g, " ") // multiple spaces ko single karo
      .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase ko space karo
      .replace(/(PLAN)([a-z])/gi, "$1 $2") // PLAN ke baad space
      .replace(/per month/gi, "per month") // case fix
      .trim(); // starting/ending spaces hatao
  };

  const isCurrentPlan = (priceObj, plan) => {
    if (!hasActiveSubscription || !subscriptionStatus || !priceObj)
      return false;

    // Method 1: Direct priceId match (if available)
    if (
      subscriptionStatus.priceId &&
      subscriptionStatus.priceId === priceObj.id
    ) {
      return true;
    }

    // Method 2: Match by duration (fallback)
    const currentDuration =
      parseInt(subscriptionStatus.planDuration) ||
      parseInt(subscriptionStatus.durationMonths) ||
      3;

    // Get card duration from description
    let cardDuration = 3;
    if (plan?.description) {
      if (
        plan.description.includes("12-month") ||
        plan.description.includes("12 month")
      ) {
        cardDuration = 12;
      } else if (
        plan.description.includes("6-month") ||
        plan.description.includes("6 month")
      ) {
        cardDuration = 6;
      } else if (
        plan.description.includes("3-month") ||
        plan.description.includes("3 month")
      ) {
        cardDuration = 3;
      }
    }

    const isMatch = currentDuration === cardDuration;

    return isMatch;
  };

  const isUpgradePlan = (plan, priceObj) => {
    if (!hasActiveSubscription || !subscriptionStatus || !priceObj)
      return false;

    // Don't show upgrade on current plan
    if (isCurrentPlan(priceObj, plan)) return false;

    // Get current duration
    const currentDuration =
      parseInt(subscriptionStatus.planDuration) ||
      parseInt(subscriptionStatus.durationMonths) ||
      3;

    // Get card duration
    let cardDuration = 3;
    if (plan?.description) {
      if (
        plan.description.includes("12-month") ||
        plan.description.includes("12 month")
      ) {
        cardDuration = 12;
      } else if (
        plan.description.includes("6-month") ||
        plan.description.includes("6 month")
      ) {
        cardDuration = 6;
      } else if (
        plan.description.includes("3-month") ||
        plan.description.includes("3 month")
      ) {
        cardDuration = 3;
      }
    }

    const isUpgrade = cardDuration > currentDuration;

    return isUpgrade;
  };

  const renderPlan = (plan, index) => {
    const priceObj = plan.prices[0];
    const price = priceObj ? priceObj.unit_amount / 100 : "N/A";
    const billingCycle = priceObj?.recurring?.interval || "one-time";
    const matchingUserPlan = getMatchingUserPlan(plan, index);

    const currentPlan = isCurrentPlan(priceObj, plan);
    const upgradePlan = isUpgradePlan(plan, priceObj);

    return (
      <div className="bg-gray-900 rounded-xl border border-purple-500 p-6 shadow-xl relative flex flex-col h-full">
        {/* Current Plan Badge */}
        {currentPlan && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
            <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
              Current Plan
            </span>
          </div>
        )}

        {/* Upgrade Available Badge */}
        {upgradePlan && !currentPlan && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              Upgrade Available
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {matchingUserPlan?.discountLabel && (
          <span className="absolute -top-1 -right-4 px-4 py-2 text-white font-bold text-lg bg-green-500 rounded-full shadow-lg transform rotate-12">
            Save {matchingUserPlan.discountLabel}%
          </span>
        )}

        <h2 className="text-xl font-bold mb-2 text-white">
          {matchingUserPlan?.planCode && (
            <span className="inline-block px-4 py-2 text-white text-lg font-semibold bg-orange-500 rounded-full border border-orange-600">
              {matchingUserPlan.planCode}
            </span>
          )}
        </h2>

        {/* Plan Name */}
        {matchingUserPlan?.planCode && (
          <h2 className="text-xl font-bold mb-2 text-white">
            {" "}
            {matchingUserPlan.name}
          </h2>
        )}

        {/* Description */}
        <p className="text-purple-400 font-medium mb-3 whitespace-normal break-words">
          {formatDescription(matchingUserPlan.description)}
        </p>

        {/* Price Display */}
        <div className="text-2xl font-bold text-white mb-4">
          {price !== "N/A" ? `$${price}` : "Price not available"}
          <span className="text-sm text-gray-400 ml-2">
            /{billingCycle === "year" ? "year" : "month"}
          </span>
        </div>

        {/* Features List */}
        <ul className="text-sm space-y-2 mb-4 flex-1">
          {matchingUserPlan?.marketingFeatures ? (
            matchingUserPlan.marketingFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                {feature}
              </li>
            ))
          ) : matchingUserPlan ? (
            <li className="text-gray-400">
              No features available for this plan
            </li>
          ) : loading ? (
            <li className="text-gray-400">Loading features...</li>
          ) : (
            <li className="text-gray-400">Features not available</li>
          )}
        </ul>

        {/* Action Buttons */}
        <div className="mt-auto">
          {hasActiveSubscription ? (
            currentPlan ? (
              <div className="text-center py-3">
                <span className="text-green-400 font-semibold">
                  ✓ Active Plan
                </span>
                {/* <p className="text-gray-400 text-sm mt-1">
                Renewal: {subscriptionStatus.currentPeriodEnd ? 
                  new Date(subscriptionStatus.currentPeriodEnd * 1000).toLocaleDateString() : 
                  "N/A"}
              </p> */}
              </div>
            ) : upgradePlan ? (
              <button
                onClick={() => handleUpgradeClick(plan, priceObj?.id)}
                disabled={processingUpgrade}
                className={`w-full px-5 py-3 rounded-full font-bold text-white text-center transition-all duration-200 ${
                  processingUpgrade
                    ? "bg-yellow-600 cursor-wait"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {processingUpgrade ? "Upgrading..." : "Upgrade Now"}
              </button>
            ) : (
              <button
                disabled
                className="w-full px-5 py-3 rounded-full font-bold bg-gray-600 text-gray-400 text-center cursor-not-allowed"
              >
                Upgrade Unavailable
              </button>
            )
          ) : (
            <button
              onClick={() => handleCheckout(plan)}
              disabled={processingPlanId === plan.id || price === "N/A"}
              className={`w-full px-5 py-3 rounded-full font-bold text-white text-center transition-all duration-200 ${
                processingPlanId === plan.id
                  ? "bg-gray-500 cursor-wait"
                  : "bg-purple-700 hover:bg-purple-600"
              }`}
            >
              {processingPlanId === plan.id
                ? "Processing..."
                : "Start Your Campaign"}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="is-pricing bg-black p-2 sm:p-4 text-white min-h-screen flex flex-col">
        {/* <div className="relative right-4 flex gap-3 pointer-events-auto p-3 flex justify-end">
       {user?.subscription?.status === "active" ? (
    <button
  onClick={handleDashboard}
  disabled={dashboardLoading}
  className={`w-28 ${
    user?.subscription?.status === "active" 
      ? "bg-green-700 hover:bg-green-600" 
      : "bg-gray-700 hover:bg-gray-600"
  } px-4 py-2 rounded-full text-sm font-semibold shadow-md text-center transition duration-200 ${
    dashboardLoading ? "opacity-60 cursor-not-allowed" : ""
  }`}
>
  {dashboardLoading ? "Wait..." : "Dashboard"}
</button>
  ) : (
    <button
      onClick={() => navigate("/subscriberonly")}
      className="w-28 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-full text-sm font-semibold shadow-md text-center transition duration-200"
    >
      
      Dashboard
    </button>
  )}

        <button
          onClick={handleLogout}
          className="w-28 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm font-semibold shadow-md text-center transition duration-200"
        >
          Logout
        </button>
      </div> */}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto relative flex-grow">
          {/* Current Subscription Status */}
          {/* {hasActiveSubscription && subscriptionStatus && (
          <div className="mb-8 bg-gradient-to-r from-purple-900 to-blue-900 rounded-xl p-6 border border-purple-500">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Your Current Plan</h2>
                <p className="text-gray-300">
                  {subscriptionStatus.planName || "Premium Plan"} • 
                  {subscriptionStatus.planDuration || 3} months
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Renewal Date: {subscriptionStatus.currentPeriodEnd ? 
                    new Date(subscriptionStatus.currentPeriodEnd * 1000).toLocaleDateString() : 
                    "N/A"}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center gap-4">
                <span className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {subscriptionStatus.status === "active" ? "Active" : 
                   subscriptionStatus.status === "trialing" ? "Trial" : 
                   subscriptionStatus.status}
                </span>
                
                {subscriptionStatus.discount && subscriptionStatus.discount !== "0%" && (
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs">
                    {subscriptionStatus.discount} OFF
                  </span>
                )}
              </div>
            </div>
          </div>
        )} */}

          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-purple-400">
            {hasActiveSubscription ? "Upgrade Your Plan" : "Choose Your Plan"}
          </h1>
          {isPageLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
              <p className="text-gray-400">Loading pricing options...</p>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="text-red-500 text-center mb-4">
                  {errorMessage}
                </div>
              )}
              {subLoading && (
                <div className="text-center">Loading plans...</div>
              )}
              {subError && (
                <div className="text-red-500 text-center">{subError}</div>
              )}
              {loading && (
                <div className="text-center">Loading plan details...</div>
              )}

              {/* Mobile/Tablet View */}
              {(isMobile || isTablet) && reorderedPlanes.length > 0 && (
                <div className="relative overflow-hidden">
                  <div
                    className="flex transition-transform duration-300"
                    style={{ transform: `translateX(-${current * 100}%)` }}
                  >
                    {reorderedPlanes.map((plan, index) => (
                      <div key={plan.id} className="w-full flex-shrink-0 px-2">
                        {renderPlan(plan, index)}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-70 rounded-full p-2 text-xl text-purple-400 hover:text-purple-200"
                  >
                    ❮
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-70 rounded-full p-2 text-xl text-purple-400 hover:text-purple-200"
                  >
                    ❯
                  </button>
                </div>
              )}

              {/* Desktop View */}
              {!isMobile && !isTablet && reorderedPlanes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  {reorderedPlanes.map((plan, index) => (
                    <div key={plan.id}>{renderPlan(plan, index)}</div>
                  ))}
                </div>
              )}

              {reorderedPlanes.length === 0 && !subLoading && (
                <div className="text-center text-gray-400">
                  No plans available for your user type.
                </div>
              )}
            </>
          )}
          {!subLoading &&
            !loading &&
            (userType === "fleetowner" || userType === "seller") && (
              <div className="w-full max-w-5xl mx-auto mt-12 mb-8">
                <div className="bg-theme-bg2 backdrop-blur-sm rounded-xl p-6 shadow-2xl text-center">
                  <p className="text-white font-bold text-lg md:text-xl leading-relaxed">
                    Savings* are annual savings based on final value campaign of
                    only $24,000. If final values are greater the savings will
                    be proportionately greater.
                  </p>
                </div>
              </div>
            )}
        </div>

        {showUpgradeModal && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-purple-500">
              <h3 className="text-xl font-bold text-white mb-4">
                Confirm Upgrade
              </h3>

              <p className="text-gray-300 mb-4">
                Are you sure you want to upgrade to{" "}
                <strong>{selectedPlan.name}</strong>?
              </p>

              <div className="bg-gray-700 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-400">Upgrade Details:</p>
                <ul className="text-white text-sm space-y-1 mt-2">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Prorated charges will apply immediately</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>New billing cycle starts now</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Previous subscription benefits continue</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>No interruption in service</span>
                  </li>
                </ul>
              </div>

              {upgradeErrorMessage && (
                <p className="text-red-400 text-sm mb-4">
                  {upgradeErrorMessage}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={cancelUpgrade}
                  disabled={processingUpgrade}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUpgrade}
                  disabled={processingUpgrade}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition duration-200"
                >
                  {processingUpgrade ? "Processing..." : "Confirm Upgrade"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PricingOptions;

// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   createsubscriptionCheckoutSession,
//   fetchSubscriptionPlanes,
//   checkSubscriptionStatus,
// } from "../store/subscription/subscriptionSlice";
// import { fetchPlansForUser } from "../store/subscriptionplans/subscriptionPlanSlice";
// import { fetchUserCountry } from "../store/countary/countrySlice";
// import { toast, ToastContainer } from "react-toastify";
// import { logout } from "../store/auth/authSlice";

// const countryNameToCode = {
//   "United States": "US",
//   India: "IN",
//   Canada: "CA",
//   Australia: "AU",
//   China: "CN",
//   Thailand: "TH",
//   Japan: "JP",
//   France: "FR",
//   Indonesia: "ID",
//   "United Kingdom": "GB",
//   Spain: "ES",
// };

// const PricingOptions = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { checkoutUrl, subscriptionPlanes, subscriptionStatus, loading: subLoading, error: subError } =
//     useSelector((state) => state.subscription);
//   const { country } = useSelector((state) => state.country);
//  const { user, isLoading } = useSelector((state) => state.auth);
//   const userEmail = user?.email || "";
//   const userType = user?.userType?.toLowerCase() || "";
//   const [current, setCurrent] = useState(0);
//   const [windowWidth, setWindowWidth] = useState(window.innerWidth);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [processingPlanId, setProcessingPlanId] = useState(null);
//   const [plansLoaded, setPlansLoaded] = useState(false);
//   const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

//   const userTypeToStatementDescriptor = {
//     fleetowner: "Fleet Owner",
//     seller: "Fleet Owner",
//     advertiser: "Advertiser",
//     buyer: "Advertiser",
//     wrapper: "Wrapper",
//   };

//   const filteredPlanes = subscriptionPlanes.filter(
//     (plan) => plan.statement_descriptor === userTypeToStatementDescriptor[userType]
//   );

//   const { userplans, loading, error } = useSelector((state) => state.subscriptionPlan);

// useEffect(() => {
//   if (user?._id) {
//     dispatch(checkSubscriptionStatus(user._id)).then((action) => {
//       const status = action.payload?.status;
//       setHasActiveSubscription(status === "active" || status === "trialing");
//     });
//   }
// }, [dispatch, user?._id]);
//   const reorderedPlanes = (() => {
//     if (filteredPlanes.length === 0) return filteredPlanes;

//     const newArray = [...filteredPlanes];

//     const getDuration = (plan) => {
//       let duration = 3;
//       if (plan.description) {
//         if (plan.description.includes("12-month")) return 12;
//         if (plan.description.includes("6-month")) return 6;
//         if (plan.description.includes("3-month")) return 3;
//       }
//       if (plan.prices[0]?.recurring?.interval_count) {
//         const intervalCount = plan.prices[0].recurring.interval_count;
//         if (plan.prices[0].recurring.interval === "year" && intervalCount === 1) {
//           return 12;
//         }
//         return intervalCount;
//       }
//       return duration;
//     };

//     newArray.sort((a, b) => getDuration(a) - getDuration(b));
//     return newArray;
//   })();

//   const getMatchingUserPlan = (stripePlan, index) => {
//     if (!userplans || !Array.isArray(userplans) || userplans.length === 0) {
//       return null;
//     }

//     if (userplans[index]) {
//       return userplans[index];
//     }

//     // If index matching fails, try by planCode
//     const matchedByPlanCode = userplans.find(userPlan => {
//       const match = userPlan.planCode === stripePlan.planCode;
//       return match;
//     });

//     if (matchedByPlanCode) {
//       return matchedByPlanCode;
//     }

//     const matchedByName = userplans.find(userPlan => {
//       const nameMatch = stripePlan.name?.includes(userPlan.name) || userPlan.name?.includes(stripePlan.name);
//       if (nameMatch) {
//       }
//       return nameMatch;
//     });

//     return matchedByName || null;
//   };

//   useEffect(() => {
//     dispatch(fetchPlansForUser());
//   }, [dispatch]);

//   useEffect(() => {
//     if (!country) {
//       dispatch(fetchUserCountry());
//     }
//   }, [dispatch, country]);

//   useEffect(() => {
//     dispatch(fetchSubscriptionPlanes()).then(() => {
//       setPlansLoaded(true);
//     });
//   }, [dispatch]);

//   useEffect(() => {
//     if (plansLoaded && filteredPlanes.length === 0 && !subLoading && !subError) {
//       const retryFetch = setTimeout(() => {
//         dispatch(fetchSubscriptionPlanes());
//       }, 2000);
//       return () => clearTimeout(retryFetch);
//     }
//   }, [plansLoaded, filteredPlanes.length, subLoading, subError, dispatch]);

//   useEffect(() => {
//     const handleResize = () => setWindowWidth(window.innerWidth);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//     if (checkoutUrl) window.location.href = checkoutUrl;
//   }, [checkoutUrl]);

//   useEffect(() => {
//     const allowedPaths = ["/Billboard", "/pricing", "/subscription-checkout", "/SubsriptionPaymentSuccess"];
//     const preventNavigation = (e) => {
//       if (subscriptionStatus?.status !== "active" && !allowedPaths.includes(window.location.pathname)) {
//         e.preventDefault();
//         toast.error("Please select a subscription plan to continue.", { autoClose: 1000 });
//         navigate("/Billboard", { replace: true });
//         window.history.pushState(null, null, "/Billboard");
//       }
//     };

//     if (subscriptionStatus?.status !== "active" && !allowedPaths.includes(location.pathname)) {
//       toast.error("Please select a subscription plan to continue.", { autoClose: 1000 });
//       navigate("/Billboard", { replace: true });
//       window.history.pushState(null, null, "/Billboard");
//     }

//     window.addEventListener("popstate", preventNavigation);
//     if (subscriptionStatus?.status !== "active") {
//       window.history.pushState(null, null, "/Billboard");
//     }

//     return () => window.removeEventListener("popstate", preventNavigation);
//   }, [navigate, subscriptionStatus, location.pathname]);

//   const handlePrev = () => {
//     setCurrent((prev) => (prev === 0 ? reorderedPlanes.length - 1 : prev - 1));
//   };

//   const handleNext = () => {
//     setCurrent((prev) => (prev === reorderedPlanes.length - 1 ? 0 : prev + 1));
//   };

//   const handleCheckout = (plan) => {
//     const priceObj = plan.prices[0];

//     if (!priceObj || !plan.id || !userEmail) {
//       setErrorMessage("Unable to process this plan. Price, ID, or Email missing.");
//       console.error("Validation failed:", { priceObj, planId: plan.id, userEmail });
//       return;
//     }

//     let planDuration;
//     if (plan.description) {
//       if (plan.description.includes("12-month") || plan.description.includes("12 month")) {
//         planDuration = 12;
//       } else if (plan.description.includes("6-month") || plan.description.includes("6 month")) {
//         planDuration = 6;
//       } else if (plan.description.includes("3-month") || plan.description.includes("3 month")) {
//         planDuration = 3;
//       } else {
//         planDuration = 3;
//       }
//     } else {
//       planDuration = 3;
//     }

//     if (![3, 6, 12].includes(planDuration)) {
//       setErrorMessage(`Invalid plan duration: ${planDuration}. Must be 3, 6, or 12 months.`);
//       console.error("Invalid planDuration:", planDuration, "Full plan:", plan);
//       return;
//     }

//     const payload = {
//       priceId: priceObj.id,
//       campaignId: plan.id,
//       price: priceObj.unit_amount,
//       currency: priceObj.currency || "aud",
//       recurring: {
//         interval: priceObj.recurring?.interval || "month",
//         interval_count: priceObj.recurring?.interval_count || 1,
//       },
//       email: userEmail,
//       planDuration,
//       country,
//     };

//     setErrorMessage(null);
//     setProcessingPlanId(plan.id);
//     dispatch(createsubscriptionCheckoutSession(payload)).finally(() => {
//       setProcessingPlanId(null);
//     });
//   };

//   const isMobile = windowWidth < 768;
//   const isTablet = windowWidth >= 768 && windowWidth < 1024;

//   const handleLogout = async () => {
//     try {
//       await dispatch(logout());f
//       toast.success("Logged out successfully!");
//       setTimeout(() => navigate("/login", { replace: true }), 200);
//     } catch (err) {
//       console.error("Logout error:", err);
//       toast.error("Logout failed!");
//     }
//   };

//   const renderPlan = (plan, index) => {
//     const priceObj = plan.prices[0];
//     const price = priceObj ? priceObj.unit_amount / 100 : "N/A";
//     const billingCycle = priceObj?.recurring?.interval || "one-time";

//     // Get matching user plan for marketing features
//     const matchingUserPlan = getMatchingUserPlan(plan, index);
//  const formatDescription = (desc) => {
//     if (!desc) return '';
//     return desc
//       .replace(/([a-z])([A-Z])/g, '$1 $2')
//       .replace(/(PLAN)([a-z])/gi, '$1 $2')
//       .replace(/\s+/g, ' ');
//   };
//     return (
//       <div className="bg-gray-900 rounded-xl border border-purple-500 p-6 shadow-xl relative flex flex-col h-full">
//        {matchingUserPlan?.discountLabel && (
//   <span className="absolute -top-1 -right-4 px-4 py-2 text-white font-bold text-lg bg-green-500 rounded-full shadow-lg transform rotate-12">
//     Save {matchingUserPlan.discountLabel}%
//   </span>
// )}

//         <h2 className="text-xl font-bold mb-2 text-white">

//            {matchingUserPlan?.planCode && (
//          <span className="inline-block px-4 py-2 text-white text-lg font-semibold bg-orange-500 rounded-full border border-orange-600">
//             {matchingUserPlan.planCode}
//           </span>
//         )}

//         </h2>
//          {matchingUserPlan?.planCode && (
//         <h2 className="text-xl font-bold mb-2 text-white"> {matchingUserPlan.name}</h2>
//            )}
//       <p className="text-purple-400 font-medium mb-3 whitespace-normal break-words">
//   {formatDescription(plan.description)}
// </p>

//         {/* Price Display Fix */}
//         <div className="text-2xl font-bold text-white mb-4">
//           {price !== "N/A" ? `$${price}` : "Price not available"}
//           <span className="text-sm text-gray-400 ml-2">
//             /{billingCycle === "year" ? "year" : "month"}
//           </span>
//         </div>

//         <ul className="text-sm space-y-2 mb-4 flex-1">
//           {/* Use matching user plan features or fallback */}
//           {matchingUserPlan?.marketingFeatures ? (
//             matchingUserPlan.marketingFeatures.map((feature, idx) => (
//               <li key={idx} className="flex items-start">
//                 <span className="text-green-400 mr-2">✓</span>
//                 {feature}
//               </li>
//             ))
//           ) : matchingUserPlan ? (
//             // If we have matching user plan but no marketingFeatures
//             <li className="text-gray-400">No features available for this plan</li>
//           ) : loading ? (
//             <li className="text-gray-400">Loading features...</li>
//           ) : (
//             <li className="text-gray-400">Features not available</li>
//           )}
//         </ul>

//        {/* {hasActiveSubscription && (
//           <div className="absolute inset-0 bg-black bg-opacity-70 rounded-xl flex items-center justify-center z-10">
//             <div className="text-center">
//               <div className="bg-green-600 text-white px-6 py-3 rounded-full text-xl font-bold shadow-2xl">
//                 Subscription Active
//               </div>
//               <p className="text-gray-300 mt-3 text-sm">Your plan is already active</p>
//             </div>
//           </div>
//         )} */}

//         <button
//           onClick={() => handleCheckout(plan)}
//           disabled={processingPlanId === plan.id || price === "N/A" || hasActiveSubscription}
//           className={`mt-auto w-full px-5 py-3 rounded-full font-bold text-white text-center transition-all duration-200 ${
//             hasActiveSubscription
//               ? "bg-gray-600 cursor-not-allowed opacity-70"
//               : processingPlanId === plan.id
//               ? "bg-gray-500 cursor-wait"
//               : "bg-purple-700 hover:bg-purple-600"
//           }`}
//         >
//           {hasActiveSubscription
//             ? "Already Subscribed"
//             : processingPlanId === plan.id
//             ? "Processing..."
//             : "Start Your Campaign"}
//         </button>
//       </div>
//     );
//   };

//   return (
//     <div className="is-pricing bg-black p-2 sm:p-4 text-white  z-50 overflow-auto">
//       <div className="relative right-4 z-[9999] flex gap-3 pointer-events-auto p-3 flex justify-end">
//         <button
//           onClick={() => navigate("/")}
//           className="w-28 bg-green-700 hover:bg-green-600 px-4 py-2 rounded-full text-sm font-semibold shadow-md text-center transition duration-200"
//         >
//           Home
//         </button>

//         <button
//           onClick={handleLogout}
//           className="w-28 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm font-semibold shadow-md text-center transition duration-200"
//         >
//           Logout
//         </button>
//       </div>

//       <div className="max-w-7xl mx-auto relative">
//         <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-purple-400">
//           Choose Your Plan
//         </h1>

//         {errorMessage && <div className="text-red-500 text-center mb-4">{errorMessage}</div>}
//         {subLoading && <div className="text-center">Loading plans...</div>}
//         {subError && <div className="text-red-500 text-center">{subError}</div>}
//         {loading && <div className="text-center">Loading plan details...</div>}

//         {(isMobile || isTablet) && reorderedPlanes.length > 0 && (
//           <div className="relative overflow-hidden">
//             <div
//               className="flex transition-transform duration-300"
//               style={{ transform: `translateX(-${current * 100}%)` }}
//             >
//               {reorderedPlanes.map((plan, index) => (
//                 <div key={plan.id} className="w-full flex-shrink-0 px-2">
//                   {renderPlan(plan, index)}
//                 </div>
//               ))}
//             </div>
//             <button
//               onClick={handlePrev}
//               className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-70 rounded-full p-2 text-xl text-purple-400 hover:text-purple-200"
//             >
//               ❮
//             </button>
//             <button
//               onClick={handleNext}
//               className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-70 rounded-full p-2 text-xl text-purple-400 hover:text-purple-200"
//             >
//               ❯
//             </button>
//           </div>
//         )}

//         {!isMobile && !isTablet && reorderedPlanes.length > 0 && (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
//             {reorderedPlanes.map((plan, index) => (
//               <div key={plan.id}>{renderPlan(plan, index)}</div>
//             ))}
//           </div>
//         )}

//         {reorderedPlanes.length === 0 && !subLoading && (
//           <div className="text-center text-gray-400">
//             No plans available for your user type.
//           </div>
//         )}
//       </div>

//       <ToastContainer />
//     </div>
//   );
// };

// export default PricingOptions;
