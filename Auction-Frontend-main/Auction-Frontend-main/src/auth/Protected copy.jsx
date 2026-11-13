import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useSelector, useDispatch } from "react-redux";
import { checkSubscriptionStatus } from "../store/subscription/subscriptionSlice";

const useAuth = () => {
  const token = Cookies.get("JwtToken");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) {
    localStorage.removeItem("user");
  }

  return { token, user };
};

const PublicRoute = () => {
  const { token, user } = useAuth();
  const dispatch = useDispatch();
  const subscriptionStatus = useSelector(
    (state) => state.subscription.subscriptionStatus,
  );
  const [statusChecked, setStatusChecked] = useState(false);
  useEffect(() => {
    const checkStatus = async () => {
      if (!token) return;
      try {
        await dispatch(checkSubscriptionStatus());
        setStatusChecked(true);
      } catch (error) {
        console.error("checkSubscriptionStatus failed:", error);
        setStatusChecked(true);
      }
    };
    checkStatus();
  }, [dispatch, token]);

  useEffect(() => {
    if (subscriptionStatus && user) {
      const updatedUser = {
        ...user,
        subscription: subscriptionStatus,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }, [subscriptionStatus, user]);

  if (token && user && statusChecked) {
    const effectiveStatus =
      subscriptionStatus?.status || user.subscription?.status;

    if (user.userType === "admin") {
      return <Navigate to="/admin/users" replace />;
    } else if (
      ["fleetOwner", "seller"].includes(user.userType) &&
      effectiveStatus !== "active"
    ) {
      return <Navigate to="/fleetowner-subscription" replace />;
    } else if (
      ["advertiser", "buyer"].includes(user.userType) &&
      effectiveStatus !== "active"
    ) {
      return <Navigate to="/Billboard" replace />;
    } else if (user.userType === "wrapper" && effectiveStatus !== "active") {
      return <Navigate to="/wrapper-subscription" replace />;
    } else {
      return <Navigate to="/user-profile/profile" replace />;
    }
  }

  return <Outlet />;
};

const Protected = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const subscriptionStatus = useSelector(
    (state) => state.subscription.subscriptionStatus,
  );
  const [statusChecked, setStatusChecked] = useState(false);
  useEffect(() => {
    const checkStatus = async () => {
      if (!token) return;
      try {
        await dispatch(checkSubscriptionStatus()).unwrap();
        setStatusChecked(true);
      } catch (error) {
        console.error("checkSubscriptionStatus failed:", error);
        setStatusChecked(true);
      }
    };
    checkStatus();
  }, [dispatch, token]);

  useEffect(() => {
    if (subscriptionStatus && user) {
      const updatedUser = {
        ...user,
        subscription: subscriptionStatus,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }, [subscriptionStatus, user]);

  useEffect(() => {
    if (!statusChecked || !user || !token) return;

    const effectiveStatus =
      subscriptionStatus?.status || user.subscription?.status;
    // Only redirect if subscription is NOT active
    if (effectiveStatus !== "active") {
      if (["advertiser", "buyer"].includes(user.userType)) {
        if (
          location.pathname !== "/Billboard" &&
          location.pathname !== "/pricing"
        ) {
          navigate("/Billboard");
        }
      } else if (["fleetOwner", "seller"].includes(user.userType)) {
        if (
          location.pathname !== "/fleetowner-subscription" &&
          location.pathname !== "/pricing"
        ) {
          navigate("/fleetowner-subscription");
        }
      } else if (user.userType === "wrapper") {
        if (
          location.pathname !== "/wrapper-subscription" &&
          location.pathname !== "/pricing"
        ) {
          navigate("/wrapper-subscription");
        }
      }
    }
    // If subscription is active, let user access any protected route
  }, [token, user, navigate, location, statusChecked, subscriptionStatus]);

  return token && user ? <Outlet /> : <Navigate to="/" replace />;
};

const AdminProtected = () => {
  const { token, user } = useAuth();
  return token && user && user.userType === "admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
};

const SellerRoutes = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const subscriptionStatus = useSelector(
    (state) => state.subscription.subscriptionStatus,
  );
  const [statusChecked, setStatusChecked] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (!token) return;
      try {
        await dispatch(checkSubscriptionStatus()).unwrap();
        setStatusChecked(true);
      } catch (error) {
        console.error("checkSubscriptionStatus failed:", error);
        setStatusChecked(true);
      }
    };
    checkStatus();
  }, [dispatch, token]);

  useEffect(() => {
    if (subscriptionStatus && user) {
      const updatedUser = {
        ...user,
        subscription: subscriptionStatus,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }, [subscriptionStatus, user]);

  useEffect(() => {
    if (!statusChecked || !user || !token) return;

    const effectiveStatus =
      subscriptionStatus?.status || user.subscription?.status;

    if (!["seller", "fleetOwner"].includes(user.userType)) {
      if (
        ["advertiser", "buyer"].includes(user.userType) &&
        effectiveStatus !== "active"
      ) {
        navigate("/Billboard");
      } else if (
        ["fleetOwner", "seller"].includes(user.userType) &&
        effectiveStatus !== "active"
      ) {
        navigate("/fleetowner-subscription");
      } else if (user.userType === "wrapper" && effectiveStatus !== "active") {
        navigate("/wrapper-subscription");
      } else {
        navigate("/user-profile/profile");
      }
      return;
    }
  }, [token, user, navigate, location, statusChecked, subscriptionStatus]);

  return token && user && ["seller", "fleetOwner"].includes(user.userType) ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
};

const AdminRoutes = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const subscriptionStatus = useSelector(
    (state) => state.subscription.subscriptionStatus,
  );
  const [statusChecked, setStatusChecked] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (!token) return;
      try {
        await dispatch(checkSubscriptionStatus()).unwrap();
        setStatusChecked(true);
      } catch (error) {
        console.error("checkSubscriptionStatus failed:", error);
        setStatusChecked(true);
      }
    };
    checkStatus();
  }, [dispatch, token]);

  useEffect(() => {
    if (subscriptionStatus && user) {
      const updatedUser = {
        ...user,
        subscription: subscriptionStatus,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }, [subscriptionStatus, user]);

  // useEffect(() => {
  //   if (!statusChecked || !user || !token) return;

  //   const effectiveStatus = subscriptionStatus?.status || user.subscription?.status;

  //   if (user.userType !== "admin") {
  //     if (["advertiser", "buyer"].includes(user.userType) && effectiveStatus !== "active") {
  //       navigate("/Billboard");
  //     } else if (["fleetOwner", "seller"].includes(user.userType) && effectiveStatus !== "active") {
  //       navigate("/fleetowner-subscription");
  //     } else if (user.userType === "wrapper" && effectiveStatus !== "active") {
  //       navigate("/wrapper-subscription");
  //     } else {
  //       navigate("/user-profile/profile");
  //     }
  //     return;
  //   }
  // }, [token, user, navigate, statusChecked, subscriptionStatus]);

  useEffect(() => {
    if (!statusChecked) return;

    const effectiveStatus =
      subscriptionStatus?.status || user.subscription?.status;

    // Hard subscription lock - ONLY for advertiser users
    if (user.userType !== "admin" && effectiveStatus !== "active") {
      if (user.userType === "advertiser" || "buyer") {
        navigate("/Billboard");
      } else if (user.userType === "fleetOwner" || "seller") {
        navigate("/fleetowner-subscription");
      } else if (user.userType === "wrapper") {
        navigate("/wrapper-subscription");
      }
    }
  }, [token, user, navigate, location, statusChecked, subscriptionStatus]);

  return token && user && user.userType === "admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
};

const AdminPublicRoute = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  if (token && user && user.userType === "admin") {
    return <Navigate to="/admin/users" replace />;
  }
  useEffect(() => {
    if (token && user) {
      navigate("/admin/users");
    }
  }, [token, user, navigate]);

  return !token ? <Outlet /> : <Navigate to="/admin/users" replace />;
};

export {
  PublicRoute,
  SellerRoutes,
  AdminRoutes,
  AdminProtected,
  AdminPublicRoute,
};
export default Protected;

// import { useEffect, useState } from "react";
// import { useNavigate, Outlet, useLocation,Navigate  } from "react-router-dom";
// import Cookies from "js-cookie";
// import { useSelector, useDispatch } from "react-redux";
// import { checkSubscriptionStatus } from "../store/subscription/subscriptionSlice";

// const useAuth = () => {
//   const token = Cookies.get("JwtToken");
//   const user = JSON.parse(localStorage.getItem("user"));

//   if (!token) {
//     localStorage.removeItem("user");
//   }

//   return { token, user };
// };

// const PublicRoute = () => {
//   const { token, user } = useAuth();
//   const dispatch = useDispatch();
//   const subscriptionStatus = useSelector((state) => state.subscription.subscriptionStatus);
//   const [statusChecked, setStatusChecked] = useState(false);

//   useEffect(() => {
//     const checkStatus = async () => {
//       if (!token) return;
//       try {
//         await dispatch(checkSubscriptionStatus()).unwrap();
//         setStatusChecked(true);
//       } catch (error) {
//         console.error("checkSubscriptionStatus failed:", error);
//         setStatusChecked(true);
//       }
//     };
//     checkStatus();
//   }, [dispatch, token]);

//   useEffect(() => {
//     if (subscriptionStatus && user) {
//       const updatedUser = {
//         ...user,
//         subscription: subscriptionStatus,
//       };
//       localStorage.setItem("user", JSON.stringify(updatedUser));
//     }
//   }, [subscriptionStatus, user]);

//   //  FIX: differentiate by userType
//   if (token && user) {
//     if (user.userType === "admin") {
//       return <Navigate to="/admin/users" replace />;
//     } else {
//       return <Navigate to="/user-profile/profile" replace />;
//     }
//   }

//   return <Outlet />;
// };

// const Protected = () => {
//   const { token, user } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const subscriptionStatus = useSelector((state) => state.subscription.subscriptionStatus);
//   const [statusChecked, setStatusChecked] = useState(false);

//   useEffect(() => {
//     const checkStatus = async () => {
//       if (!token) return;
//       try {
//         await dispatch(checkSubscriptionStatus()).unwrap();
//         setStatusChecked(true);
//       } catch (error) {
//         console.error("checkSubscriptionStatus failed:", error);
//         setStatusChecked(true);
//       }
//     };
//     checkStatus();
//   }, [dispatch]);

//   useEffect(() => {
//     if (subscriptionStatus && user) {
//       const updatedUser = {
//         ...user,
//         subscription: subscriptionStatus,
//       };
//       localStorage.setItem("user", JSON.stringify(updatedUser));
//     }
//   }, [subscriptionStatus, user]);

//   useEffect(() => {
//     if (!statusChecked) return;

//     const effectiveStatus = subscriptionStatus?.status || user.subscription?.status;

//     // Hard subscription lock - ONLY for advertiser users
//     if (user.userType === "advertiser" && effectiveStatus !== "active") {
//       if (location.pathname !== "/Billboard" && location.pathname !== "/pricing") {
//         navigate("/Billboard");
//       }
//     }
//   }, [token, user, navigate, location, statusChecked, subscriptionStatus]);

//   return token && user ? <Outlet /> : null;
// };

// const AdminProtected = () => {
//   const { token, user } = useAuth();
//   const navigate = useNavigate();

//   return token && user ? <Outlet /> : null;
// };

// const SellerRoutes = () => {
//   const { token, user } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const subscriptionStatus = useSelector((state) => state.subscription.subscriptionStatus);
//   const [statusChecked, setStatusChecked] = useState(false);

//   useEffect(() => {
//     const checkStatus = async () => {
//       if (!token) return;
//       try {
//         await dispatch(checkSubscriptionStatus()).unwrap();
//         setStatusChecked(true);
//       } catch (error) {
//         console.error("checkSubscriptionStatus failed:", error);
//         setStatusChecked(true);
//       }
//     };
//     checkStatus();
//   }, [dispatch]);

//   useEffect(() => {
//     if (subscriptionStatus && user) {
//       const updatedUser = {
//         ...user,
//         subscription: subscriptionStatus,
//       };
//       localStorage.setItem("user", JSON.stringify(updatedUser));
//     }
//   }, [subscriptionStatus, user]);

//   useEffect(() => {
//     if (!statusChecked) return;

//     const effectiveStatus = subscriptionStatus?.status || user.subscription?.status;

//     if (user.userType !== "seller") {
//       if (user.userType === "advertiser" && effectiveStatus !== "active") {
//         navigate("/Billboard");
//       } else {
//         navigate("/user-profile/profile");
//       }
//       return;
//     }
//   }, [token, user, navigate, location, statusChecked, subscriptionStatus]);

//   return token && user && user.userType === "seller" ? <Outlet /> : null;
// };

// const AdminRoutes = () => {
//   const { token, user } = useAuth();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const subscriptionStatus = useSelector((state) => state.subscription.subscriptionStatus);
//   const [statusChecked, setStatusChecked] = useState(false);

//   useEffect(() => {
//     const checkStatus = async () => {
//       if (!token) return;
//       try {
//         await dispatch(checkSubscriptionStatus()).unwrap();
//         setStatusChecked(true);
//       } catch (error) {
//         console.error("checkSubscriptionStatus failed:", error);
//         setStatusChecked(true);
//       }
//     };
//     checkStatus();
//   }, [dispatch]);

//   useEffect(() => {
//     if (subscriptionStatus && user) {
//       const updatedUser = {
//         ...user,
//         subscription: subscriptionStatus,
//       };
//       localStorage.setItem("user", JSON.stringify(updatedUser));
//     }
//   }, [subscriptionStatus, user]);

//   useEffect(() => {
//     if (!statusChecked) return;

//     const effectiveStatus = subscriptionStatus?.status || user.subscription?.status;

//     if (user.userType !== "admin") {
//       if (user.userType === "advertiser" && effectiveStatus !== "active") {
//         navigate("/Billboard");
//       } else {
//         navigate("/user-profile/profile");
//       }
//       return;
//     }
//   }, [token, user, navigate, statusChecked, subscriptionStatus]);

//   return token && user && user.userType === "admin" ? <Outlet /> : null;
// };

// const AdminPublicRoute = () => {
//   const { token, user } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (token && user) {
//       navigate("/admin/dashboard");
//     }
//   }, [token, user, navigate]);

//   return !token ? <Outlet /> : null;
// };

// export { PublicRoute, SellerRoutes, AdminRoutes, AdminProtected, AdminPublicRoute };
// export default Protected;

// import { useEffect } from "react";
// import { useNavigate, Outlet,useLocation  } from "react-router-dom";
// import Cookies from "js-cookie";
// import { useSelector, useDispatch } from "react-redux";
// const useAuth = () => {
//   const token = Cookies.get("JwtToken");

//   const user = JSON.parse(localStorage.getItem("user"));

//   if(!token){
//     localStorage.removeItem("user")
//   }

//   return { token, user };
// };

// const PublicRoute = () => {
//   const { token, user } = useAuth();
//   const navigate = useNavigate();

// useEffect(() => {
//     if (token && user) {
//       if (user.userType === "admin") {
//         navigate("/admin/users");
//       } else if (user.userType === "advertiser" && user.subscription?.status !== "active") {
//         navigate("/Billboard");
//       } else {
//         navigate("/user-profile/profile");
//       }
//     }
//   }, [token, user, navigate]);

//   return !token ? <Outlet /> : null;
// };

// // const AdminPublicRoute = () => {
// //   const auth = useAuth();
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     if (auth) {
// //       navigate("/admin/users");
// //     }
// //   }, [auth, navigate]);

// //   return auth ? null : <Outlet />;
// // };

// const Protected = () => {
//   const { token, user } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation(); // CHANGE: to detect URL
// const dispatch = useDispatch();
//   useEffect(() => {
//     if (!token || !user) {
//       navigate("/login");
//       return;
//     }

//     // CHANGE: Hard subscription lock
//      if (user.userType !== "admin") {
//     if (user.subscription?.status !== "active" && location.pathname !== "/Billboard" && location.pathname !== "/pricing") {
//       return;
//     }

//   }
//   }, [token, user, navigate, location]);

//   return token && user ? <Outlet /> : null;
// };

// const AdminProtected = () => {
//   const auth = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!auth) {
//       navigate("/admin/login");
//     }
//   }, [auth, navigate]);

//   return auth ? <Outlet /> : null;
// };

// const SellerRoutes=()=>{
// const {user}=useSelector((state)=>state.auth);
//   const auth = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   useEffect(() => {
//     if (!token || !user) {
//       navigate("/login");
//       return;
//     }

//     if (user.userType !== "seller") {
//       navigate("/user-profile/profile");
//       return;
//     }

//     // CHANGE: Hard subscription lock for seller
//      if (user.subscription?.status !== "active" && location.pathname !== "/Billboard" && location.pathname !== "/pricing") {
//     }
//   }, [token, user, navigate, location]);

//    return token && user && user.userType === "seller" ? <Outlet /> : null;
// }

// const AdminRoutes = () => {
//   const { user } = useSelector((state) => state.auth);
//   const { token } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!token || !user) {
//       navigate("/admin/login");
//       return;
//     }

//     if (user.userType !== "admin") {
//       navigate("/Billboard");
//       return;
//     }
//   }, [token, user, navigate]);

//   return token && user && user.userType === "admin" ? <Outlet /> : null;
// };

// // Admin public route
// const AdminPublicRoute = () => {
//   const { token, user } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (token && user) {
//       navigate("/admin/dashboard");
//     }
//   }, [token, user, navigate]);

//   return !token ? <Outlet /> : null;
// };

// export { PublicRoute,SellerRoutes, AdminRoutes,AdminProtected , AdminPublicRoute};
// export default Protected;

// import { useEffect } from "react";
// import { useNavigate, Outlet } from "react-router-dom";
// import Cookies from "js-cookie";
// import { useSelector} from "react-redux";

// const useAuth = () => {
//   const token = Cookies.get("JwtToken");

//   const user = JSON.parse(localStorage.getItem("user"));

//   if(!token){
//     localStorage.removeItem("user")
//   }

//   return token && user;
// };

// const PublicRoute = () => {
//   const auth = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (auth) {
//       navigate("/admin/users");
//     }
//   }, [auth, navigate]);

//   return auth ? null : <Outlet />;
// };

// const AdminPublicRoute = () => {
//   const auth = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (auth) {
//       navigate("/admin/users");
//     }
//   }, [auth, navigate]);

//   return auth ? null : <Outlet />;
// };

// const Protected = () => {
//   const auth = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!auth) {
//       navigate("/login");
//     }
//   }, [auth, navigate]);

//   return auth ? <Outlet /> : null;
// };

// const AdminProtected = () => {
//   const auth = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!auth) {
//       navigate("/admin/login");
//     }
//   }, [auth, navigate]);

//   return auth ? <Outlet /> : null;
// };

// const SellerRoutes=()=>{
// const {user}=useSelector((state)=>state.auth);
//   const auth = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (auth && user.userType !== "seller") {
//       navigate("/user-profile/profile");
//     }
//   }, [auth, navigate]);

//   return auth && user.userType === "seller" ? <Outlet /> : null;
// }

// const AdminRoutes=()=>{
//   const {user}=useSelector((state)=>state.auth);
//     const auth = useAuth();
//     const navigate = useNavigate();

//   if (auth && user.userType !== "admin") {
//     navigate("/user-profile/profile");
//   }
//     useEffect(() => {
//       if (auth && user.userType !== "admin") {
//         navigate("/user-profile/profile");
//       }
//     }, [auth, navigate]);

//     return auth && user.userType === "admin" ? <Outlet /> : null;
//   }

// export { PublicRoute,SellerRoutes, AdminRoutes,AdminProtected , AdminPublicRoute};
// export default Protected;
