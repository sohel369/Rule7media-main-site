import { useEffect, useState,useMemo  } from "react";
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

  // ✅ State ki jagah direct compute — no race condition
  const redirectPath = useMemo(() => {
    if (!token || !user) return null;

    if (user.userType === "admin") return "/admin/users";

    const status = user.subscription?.status;

    if (user.userType === "advertiser" || user.userType === "buyer") {
      return status === "active" ? "/user-profile/profile" : "/Billboard";
    }
    if (user.userType === "fleetOwner" || user.userType === "seller") {
      return status === "active"
        ? "/user-profile/profile"
        : "/fleetowner-subscription";
    }
    if (user.userType === "wrapper") {
      return status === "active"
        ? "/user-profile/profile"
        : "/wrapper-subscription";
    }
    return "/user-profile/profile";
  }, [token, user]);

  // Background verify (state update ke liye nahi, sirf localStorage sync ke liye)
  useEffect(() => {
    if (!token || !user) return;
    dispatch(checkSubscriptionStatus())
      .unwrap()
      .then((result) => {
        const updatedUser = { ...user, subscription: result };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      })
      .catch(() => {});
  }, [token, user, dispatch]);

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
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
    if (!statusChecked || !user) return;

    const effectiveStatus =
      subscriptionStatus?.status || user.subscription?.status;

    // Hard subscription lock - ONLY for users without active subscription
    if (user.userType === "advertiser" || user.userType === "buyer") {
      if (effectiveStatus !== "active") {
        if (
          location.pathname !== "/Billboard" &&
          location.pathname !== "/pricing"
        ) {
          navigate("/Billboard", { replace: true });
        }
      }
    } else if (user.userType === "fleetOwner" || user.userType === "seller") {
      if (effectiveStatus !== "active") {
        if (
          location.pathname !== "/fleetowner-subscription" &&
          location.pathname !== "/pricing"
        ) {
          navigate("/fleetowner-subscription", { replace: true });
        }
      }
    } else if (user.userType === "wrapper") {
      if (effectiveStatus !== "active") {
        if (
          location.pathname !== "/wrapper-subscription" &&
          location.pathname !== "/pricing"
        ) {
          navigate("/wrapper-subscription", { replace: true });
        }
      }
    }
  }, [token, user, navigate, location, statusChecked, subscriptionStatus]);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const AdminProtected = () => {
  const { token, user } = useAuth();

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
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
    if (!statusChecked || !user) return;

    const effectiveStatus =
      subscriptionStatus?.status || user.subscription?.status;

    if (user.userType !== "seller" && user.userType !== "fleetOwner") {
      if (user.userType === "advertiser" || user.userType === "buyer") {
        if (effectiveStatus !== "active") {
          navigate("/Billboard", { replace: true });
        } else {
          navigate("/user-profile/profile", { replace: true });
        }
      } else {
        navigate("/user-profile/profile", { replace: true });
      }
      return;
    }
  }, [token, user, navigate, location, statusChecked, subscriptionStatus]);

  if (
    !token ||
    !user ||
    (user.userType !== "seller" && user.userType !== "fleetOwner")
  ) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
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

  useEffect(() => {
    if (!statusChecked || !user) return;

    const effectiveStatus =
      subscriptionStatus?.status || user.subscription?.status;

    if (user.userType !== "admin") {
      if (user.userType === "advertiser" || user.userType === "buyer") {
        if (effectiveStatus !== "active") {
          navigate("/Billboard", { replace: true });
        } else {
          navigate("/user-profile/profile", { replace: true });
        }
      } else {
        navigate("/user-profile/profile", { replace: true });
      }
      return;
    }
  }, [token, user, navigate, statusChecked, subscriptionStatus]);

  if (!token || !user || user.userType !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

const AdminPublicRoute = () => {
  const { token, user } = useAuth();

  if (token && user && user.userType === "admin") {
    return <Navigate to="/admin/users" replace />;
  }

  return <Outlet />;
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
//     if ((user.userType === "advertiser"|| user.userType === "buyer" ) && effectiveStatus !== "active") {
//       if (location.pathname !== "/Billboard" && location.pathname !== "/pricing") {
//         navigate("/Billboard");
//       }
//     }
//       else if ((user.userType === "fleetOwner"|| user.userType === "seller" ) && effectiveStatus !== "active") {
//       if (location.pathname !== "/fleetowner-subscription" && location.pathname !== "/pricing") {
//         navigate("/fleetowner-subscription");
//       }
//     }
//     else if (user.userType === "wrapper" && effectiveStatus !== "active") {
//       if (location.pathname !== "/wrapper-subscription" && location.pathname !== "/pricing") {
//         navigate("/wrapper-subscription");
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
