import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { FaRegClock, FaRegCheckCircle } from "react-icons/fa";
import {
  getNotificationForUser,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../store/notification/notificationSlice";
import socket from "../socket";
import Pagination from "./Pagination";
import { FooterLeaderboard, HeaderLeaderboard } from "./AdSlots";
const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notification);
  const [notificationData, setNotificationData] = useState([]);
  const logInUser = JSON.parse(localStorage.getItem("user"));
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationsPerPage] = useState(5);

  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification =
    indexOfLastNotification - notificationsPerPage;
  const currentNotifications = notificationData?.slice(
    indexOfFirstNotification,
    indexOfLastNotification,
  );

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const prevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const hasUnreadNotifications = notificationData?.some(
    (notification) => !notification.isRead,
  );

  useEffect(() => {
    dispatch(getNotificationForUser());
    socket.emit("joinAuction", logInUser?._id);
    socket.on("connect", () => {});
    socket.on("disconnect", () => {});
    socket.on("newBidNotification", () => {
      dispatch(getNotificationForUser());
    });
    return () => socket.off("newBidNotification");
  }, [dispatch, logInUser?._id]);

  useEffect(() => {
    setNotificationData(notifications || []);
  }, [notifications]);

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllNotificationsAsRead());
    dispatch(getNotificationForUser());
  };

  const handleMarkSingleAsRead = async (id, e) => {
    e.preventDefault(); // Link navigation rokne ke liye
    e.stopPropagation(); // bubble up na ho
    await dispatch(markNotificationAsRead(id));
    dispatch(getNotificationForUser());
  };

  return (
    <div className="overflow-auto flex flex-col w-full px-7 py-4 bg-theme-bg text-body-text-color rounded-2xl">
      <div className="flex items-center justify-between mb-5 border-b border-border-info-color pb-3">
        <h2 className="text-white font-bold text-xl">Notifications</h2>

        <HeaderLeaderboard />
      </div>
      {hasUnreadNotifications && (
        <button
          className="flex items-center gap-2 rounded-xl px-4 py-3 text-white cursor-pointer font-bold tracking-wide w-fit bg-theme-color hover:bg-color-danger transition-all"
          onClick={() => handleMarkAllAsRead()}
        >
          <FaRegCheckCircle className="mt-[-2px]" />
          <span>Mark all as read</span>
        </button>
      )}

      {notificationData?.length > 0 ? (
        <div className="overflow-auto no-scrollbar p-5 border border-border-info-color rounded-2xl flex flex-col gap-4 mt-10">
          {currentNotifications?.map((notification) => (
            <Link
              to={notification?.link || "#"}
              key={notification?._id}
              // onClick hataya gaya hai → ab auto read nahi hoga
              className={`text-white p-5 rounded-2xl border border-border-info-color [&_span]:text-white hover:border-theme-color transition-all relative ${
                notification?.isRead === false
                  ? "bg-theme-color hover:bg-color-primary"
                  : "bg-theme-bg2"
              }`}
            >
              <div className="flex gap-3 flex-wrap object-cover">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">
                    {notification?.auction?.name}
                  </h1>
                  <p>{notification?.message}</p>
                  <span className="flex items-center gap-2 mt-3 text-body-text-color">
                    <FaRegClock
                      size={18}
                      className={`mt-[-2px] text-theme-color ${
                        notification?.isRead === false ? "text-white" : ""
                      }`}
                    />
                    {new Date(notification?.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Individual Mark Read button - sirf unread ke liye */}
                {!notification?.isRead && (
                  <button
                    onClick={(e) => handleMarkSingleAsRead(notification._id, e)}
                    className="absolute top-1 right-4 bg-white/20 hover:bg-white/40 text-white text-xs px-3 py-1 rounded-full transition-all flex items-center gap-1"
                  >
                    <span>Mark read</span>
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[500px]">
          <h1 className="text-white">No Notifications</h1>
        </div>
      )}

      {notificationData?.length > 0 && (
        <Pagination
          totalPosts={notificationData?.length}
          postsPerPage={notificationsPerPage}
          paginate={paginate}
          currentPage={currentPage}
          nextPage={nextPage}
          prevPage={prevPage}
        />
      )}
      <FooterLeaderboard />
    </div>
  );
};

export default Notifications;
