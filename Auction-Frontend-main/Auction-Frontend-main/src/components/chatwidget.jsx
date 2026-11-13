import { useState, useEffect, useRef } from "react";
import { FaComments, FaTimes, FaPaperPlane, FaUser } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import baseUrl from "../config.js";
import {
  getAllAdmin,
  setMessagingUsers,
  getSellerById,
} from "../store/user/userSlice";
import {
  getAuctionsBySellerWithBids,
  reset,
} from "../store/auction/auctionSlice";
import { messaging, generateToken, onMessageListener } from "../firebase";
import { current } from "@reduxjs/toolkit";

const ChatWidget = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineAdmins, setOnlineAdmins] = useState([]);
  const [typingStatus, setTypingStatus] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bidderContacts, setBidderContacts] = useState([]);
  const chatRef = useRef(null);
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const userId = user?._id;
  const userType = user?.userType;
  const { allAdmin, messagingUsers } = useSelector((state) => state.user);
  const { getseller } = useSelector((state) => state.user);
  const { singleAuction } = useSelector((state) => state.auction);

  useEffect(() => {
    if (!userId) return;

    const newSocket = io(baseUrl, {
      transports: ["websocket"],
      query: { userId, userType },
    });

    const handleReceiveMessage = (message) => {
      // Enhanced relevance check
      const isRelevantMessage =
        message.sender === userId ||
        message.receiver === userId ||
        (selectedContact &&
          (message.sender === selectedContact._id ||
            message.receiver === selectedContact._id));

      if (isRelevantMessage) {
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some(
            (m) =>
              m._id === message._id ||
              (m.isOptimistic &&
                m.text === message.text &&
                m.senderId === message.sender),
          );

          if (!exists) {
            return [
              ...prev,
              {
                ...message,
                senderId: message.sender,
                receiverId: message.receiver,
                text: message.text,
                timestamp: message.createdAt || new Date().toISOString(),
                senderType:
                  message.senderType ||
                  (message.sender === userId
                    ? userType
                    : selectedContact?.userType),
              },
            ];
          }
          return prev;
        });

        // Mark as read if we're the receiver
        if (message.receiver === userId) {
          setContacts((prev) =>
            prev.map((contact) =>
              contact._id === message.sender
                ? { ...contact, unread: 0 }
                : contact,
            ),
          );
        }
      }
    };

    const handleAdminStatus = ({ userId, status }) => {
      setOnlineAdmins((prev) => {
        if (status) {
          return [...new Set([...prev, userId])];
        } else {
          return prev.filter((id) => id !== userId);
        }
      });
    };

    const handleTypingStatus = (data) => {
      if (
        data.receiverId === userId &&
        data.senderId === selectedContact?._id
      ) {
        setTypingStatus(
          data.isTyping ? `${selectedContact.firstName} is typing...` : "",
        );
      }
    };

    const handleNotification = (data) => {
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }

      setContacts((prev) =>
        prev.map((contact) =>
          contact._id === data.senderId
            ? { ...contact, unread: (contact.unread || 0) + 1 }
            : contact,
        ),
      );
    };

    newSocket.on("connect", () => {
      if (userType === "admin") {
        newSocket.emit("getMessagingUsers", userId);
      }
      newSocket.emit("getOnlineStatus");
    });

    newSocket.on("onlineStatus", (onlineUsers) => {
      setOnlineAdmins(onlineUsers);
    });

    newSocket.on("receiveMessage", handleReceiveMessage);
    newSocket.on("adminOnline", handleAdminStatus);
    newSocket.on("typingStatus", handleTypingStatus);
    newSocket.on("newMessageNotification", handleNotification);
    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });
    newSocket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        newSocket.connect();
      }
    });
    newSocket.on("reconnect_attempt", (attemptNumber) => {});
    newSocket.on("reconnect", (attemptNumber) => {
      if (userType === "admin") {
        newSocket.emit("getMessagingUsers", userId);
      }
    });

    setSocket(newSocket);
    setIsLoading(false);

    return () => {
      newSocket.off("receiveMessage", handleReceiveMessage);
      newSocket.off("adminOnline", handleAdminStatus);
      newSocket.off("typingStatus", handleTypingStatus);
      newSocket.off("newMessageNotification", handleNotification);
      newSocket.off("connect");
      newSocket.off("error");
      newSocket.off("disconnect");
      newSocket.off("reconnect_attempt");
      newSocket.off("reconnect");
      newSocket.disconnect();
    };
  }, [userId, userType, selectedContact?._id, isOpen]);

  // In your useEffect for room management
  useEffect(() => {
    if (!socket || !userId || !selectedContact) return;

    const roomId = [userId, selectedContact._id].sort().join("_");

    socket.emit(
      "joinConversation",
      {
        userId1: userId,
        userId2: selectedContact._id,
      },
      (ack) => {},
    );

    return () => {
      socket.emit("leaveConversation", roomId);
    };
  }, [socket, userId, selectedContact]);
  useEffect(() => {
    if (userType === "admin" && socket && userId) {
      const handleMessagingUsers = (users) => {
        if (users && users.length > 0) {
          dispatch(setMessagingUsers(users));
          setContacts(
            users.map((user) => ({
              ...user,
              unread: user.unread || 0,
              profilePicture: user.profilePicture || "/default-avatar.png",
            })),
          );
          if (!selectedContact && users[0]) {
            setSelectedContact(users[0]);
          }
        } else {
          dispatch(setMessagingUsers([]));
          setContacts([]);
        }
      };

      socket.on("messagingUsersList", handleMessagingUsers);
      socket.emit("getMessagingUsers", userId);

      return () => {
        socket.off("messagingUsersList", handleMessagingUsers);
      };
    }
  }, [socket, userType, userId, dispatch, selectedContact]);

  const sellerId = useSelector((state) => state.auth.user?._id);
  useEffect(() => {
    if (
      (userType === "user" || userType === "seller" || userType === "buyer") &&
      !allAdmin?.data?.length
    ) {
      dispatch(getAllAdmin());
    }
    if (
      userType === "seller" &&
      sellerId // ensure sellerId exists
    ) {
      dispatch(getAuctionsBySellerWithBids(sellerId));
    }
  }, [userType, allAdmin, sellerId, dispatch]);
  useEffect(() => {
    if (
      (userType === "user" || userType === "seller" || userType === "buyer") &&
      !allAdmin?.data?.length
    ) {
      dispatch(getAllAdmin());
    }
    if (
      userType === "seller" &&
      sellerId // ensure sellerId exists
    ) {
      dispatch(getAuctionsBySellerWithBids(sellerId));
    }
  }, [userType, allAdmin, sellerId, dispatch]);
  useEffect(() => {
    if (sellerId) {
      dispatch(getSellerById(sellerId));
    } else {
      console.error("Seller ID is missing.");
    }
  }, [sellerId, dispatch]);

  // Update the useEffect that handles getseller
  useEffect(() => {
    if (getseller) {
      setContacts((prev) => {
        // Check if seller already exists in contacts
        const existingSeller = prev.find((c) => c._id === getseller._id);
        if (!existingSeller) {
          return [
            ...prev,
            {
              _id: getseller._id,
              firstName: getseller.name || "Seller",
              lastName: getseller.lastname || "",
              profilePicture: getseller.profilePicture || "/default-avatar.png",
              userType: "seller",
            },
          ];
        }
        return prev.map((contact) =>
          contact._id === getseller._id
            ? {
                ...contact,
                firstName: getseller.name || "Seller",
                lastName: getseller.lastname || "",
                profilePicture:
                  getseller.profilePicture || "/default-avatar.png",
              }
            : contact,
        );
      });
    }
  }, [getseller]);

  useEffect(() => {
    if (singleAuction?.bidders) {
      const contacts = singleAuction.bidders
        .filter((bidder) => bidder?._id)
        .map((bidder) => ({
          _id: bidder._id,
          firstName: bidder.name || "Bidder",
          profilePicture: bidder.profilePicture || "/default-avatar.png",
          userType: "bidder",
          isBidder: true,
        }));

      setBidderContacts(contacts);
    }
  }, [singleAuction]);

  useEffect(() => {
    let baseList = [];

    if (userType === "admin") {
      baseList = messagingUsers || [];
    } else if (userType === "seller") {
      const bidderContacts =
        singleAuction?.bids?.map((bid) => ({
          _id: bid.bidder?._id,
          firstName: bid.bidder?.name || "Bidder",
          profilePicture: bid.bidder?.profilePicture || "/default-avatar.png",
          userType: "bidder",
          isBidder: true,
        })) || [];
      baseList = [...(allAdmin?.data || []), ...bidderContacts];
    } else if (userType === "user") {
      // For regular users, show both admin and seller contacts
      baseList = [...(allAdmin?.data || [])];
      // Add seller if available
      if (getseller) {
        baseList.push({
          _id: getseller._id,
          firstName: getseller.name || "Seller",
          profilePicture: getseller.profilePicture || "/default-avatar.png",
          userType: "seller",
        });
      }
    } else if (userType === "buyer") {
      const sellerContact = singleAuction?.seller
        ? {
            _id: singleAuction.seller._id,
            firstName: singleAuction.seller.name || "Seller",
            profilePicture:
              singleAuction.seller.profilePicture || "/default-avatar.png",
            userType: "seller",
          }
        : null;

      baseList = [
        ...(sellerContact ? [sellerContact] : []),
        ...(allAdmin?.data || []),
      ].filter(Boolean);
    }

    setContacts(
      baseList
        .filter((user) => user && user._id)
        .map((contact) => ({
          ...contact,
          unread: contact.unread || 0,
          profilePicture: contact.profilePicture || "/default-avatar.png",
        })),
    );
  }, [allAdmin, messagingUsers, userType, singleAuction, getseller]);

  // Fetch message history when contact is selected
  useEffect(() => {
    if (isOpen && selectedContact && socket) {
      setIsLoading(true);
      socket.emit("getMessages", {
        userId1: userId,
        userId2: selectedContact._id,
      });

      // Mark messages as read
      setContacts((prev) =>
        prev.map((contact) =>
          contact._id === selectedContact._id
            ? { ...contact, unread: 0 }
            : contact,
        ),
      );
      setUnreadCount(0);

      const handleMessageHistory = (history) => {
        setMessages(
          history.map((msg) => ({
            _id: msg._id,
            senderId: msg.sender,
            receiverId: msg.receiver,
            text: msg.text,
            timestamp: msg.createdAt,
            createdAt: msg.createdAt,
          })),
        );
        setIsLoading(false);
      };

      socket.on("messageHistory", handleMessageHistory);

      return () => {
        socket.off("messageHistory", handleMessageHistory);
      };
    }
  }, [isOpen, selectedContact, socket, userId]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, typingStatus]);

  const handleInputChange = (e) => {
    const text = e.target.value;
    if (text.length <= 500) {
      setInput(text);
      if (socket && selectedContact) {
        socket.emit("typing", {
          senderId: userId,
          receiverId: selectedContact._id,
          isTyping: text.length > 0,
        });
      }
    }
  };
  const sendMessage = async () => {
    if (!input.trim() || !selectedContact || !socket || !userId) {
      console.error("Missing required data for sending message");
      return;
    }
    const fcmToken = await generateToken();

    if (userType === "buyer" && !selectedContact.initiatedBySeller) {
      alert("Seller needs to initiate the chat first.");
      return;
    }
    if (!fcmToken) {
      console.error("FCM Token is missing.");
      return;
    }

    const messageData = {
      senderId: userId,
      receiverId: selectedContact._id,
      senderType: userType,
      text: input.trim(),
      fcmToken: fcmToken,
      sellerId: sellerId,
      timestamp: new Date().toISOString(),
    };

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      sender: userId,
      receiver: selectedContact._id,
      senderId: userId,
      receiverId: selectedContact._id,
      text: input.trim(),
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInput("");

    socket.emit("sendMessage", messageData, (ack) => {
      if (ack?.error) {
        console.error("Message send error:", ack.error);
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
        alert("Failed to send message");
      }
    });
  };

  useEffect(() => {
    generateToken()
      .then((token) => {
        if (token) {
        }
      })
      .catch((error) => {
        console.error("Error generating token:", error);
      });

    onMessageListener().then((payload) => {
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("New message received", {
            body: payload.notification.body,
            icon: "/path/to/icon.png",
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification("New message received", {
                body: payload.notification.body,
                icon: "/path/to/icon.png",
              });
            }
          });
        }
      } else {
        alert(`New Notification: ${payload.notification.body}`);
      }
    });
  }, []);

  // useEffect(() => {
  //   if (!singleAuction || !contacts.length || userType !== "seller") return;

  //   const bidderIds = singleAuction?.bids?.map((b) => b.bidder?._id);
  //   const filtered = contacts.filter(
  //     (contact) =>
  //       contact.userType === "admin" || bidderIds.includes(contact._id)
  //   );
  //   const sortedContacts = contacts.sort((a, b) => {
  //     if (a.userType === "admin") return -1;
  //     if (b.userType === "admin") return 1;
  //     return 0;
  //   });

  //   setContacts(sortedContacts);
  // }, [singleAuction, contacts, userType]);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-theme-color text-white p-3 rounded-full shadow-lg hover:bg-white hover:text-theme-color transition-all relative"
        >
          <FaComments size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="flex gap-4">
          {/* Contacts List Panel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="shadow-xl bg-theme-bg rounded-2xl border-200 w-80 h-[500px] flex flex-col"
          >
            <div className="p-4 text-white bg-theme-bg rounded-2xl border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg text-white font-semibold">
                {userType === "admin" ? "User Messages" : "Admin Messages"}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="flex-1 text-white rounded-lg shadow-md h-fit bg-theme-bg2 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : contacts.length > 0 ? (
                <>
                  {contacts.map((contact) => {
                    return (
                      <div key={contact._id} className="mb-2">
                        {contact.userType === "seller" && (
                          <p className="text-xs text-gray-400 px-3">Seller</p>
                        )}
                        <div
                          onClick={() => {
                            setSelectedContact(contact);
                            setMessages([]);
                          }}
                          className={`flex items-center gap-3 p-3 transition-colors cursor-pointer hover:bg-blue-300 relative ${
                            selectedContact?._id === contact._id
                              ? "bg-blue-400"
                              : "bg-theme-bg"
                          }`}
                        >
                          <div className="relative">
                            <img
                              src={contact.profilePicture}
                              alt={contact.firstName}
                              className="w-8 h-8 text-white rounded-full"
                            />
                            {(userType === "user" ||
                              onlineAdmins.includes(contact._id)) && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {userType === "admin" && (
                              <p className="font-medium text-white truncate">
                                {contact.fullName ||
                                  `${contact.firstName || ""} ${
                                    contact.lastname || ""
                                  }`}
                              </p>
                            )}
                            <p className="text-xs text-white-500 truncate">
                              {userType === "admin" ? "User" : "Admin"}
                              {onlineAdmins.includes(contact._id) &&
                                " • Online"}
                            </p>
                          </div>
                          {contact.unread > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {contact.unread > 9 ? "9+" : contact.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {userType === "user" && getseller && (
                    <>
                      <hr className="my-2 border-gray-500" />
                      <p className="px-3 text-sm text-gray-300">Sellers</p>
                      {Array.isArray(getseller)
                        ? // Handle when getseller is an array
                          getseller.map((seller) => (
                            <div
                              key={seller._id}
                              onClick={() => {
                                setSelectedContact(seller);
                                setMessages([]);
                              }}
                              className={`flex items-center gap-3 p-3 transition-colors cursor-pointer hover:bg-blue-300 relative ${
                                selectedContact?._id === seller._id
                                  ? "bg-blue-400"
                                  : "bg-theme-bg"
                              }`}
                            >
                              <div className="relative">
                                <img
                                  src={seller.profilePicture}
                                  alt={seller.firstName || seller.email}
                                  className="w-8 h-8 rounded-full"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">
                                  {seller.firstName || seller.email}
                                </p>
                                <p className="text-xs text-white-500 truncate">
                                  Seller
                                </p>
                              </div>
                              {seller.unread > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                  {seller.unread > 9 ? "9+" : seller.unread}
                                </span>
                              )}
                            </div>
                          ))
                        : // Handle when getseller is a single object
                          getseller._id && (
                            <div
                              onClick={() => {
                                setSelectedContact(getseller);
                                setMessages([]);
                              }}
                              className={`flex items-center gap-3 p-3 transition-colors cursor-pointer hover:bg-blue-300 relative ${
                                selectedContact?._id === getseller._id
                                  ? "bg-blue-400"
                                  : "bg-theme-bg"
                              }`}
                            >
                              <div className="relative">
                                <img
                                  src={getseller.profilePicture}
                                  alt={getseller.firstName || getseller.email}
                                  className="w-8 h-8 rounded-full"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">
                                  {getseller.firstName ||
                                    getseller.name ||
                                    getseller.email}
                                </p>
                                <p className="text-xs text-white-500 truncate">
                                  Seller
                                </p>
                              </div>
                              {getseller.unread > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                  {getseller.unread > 9
                                    ? "9+"
                                    : getseller.unread}
                                </span>
                              )}
                            </div>
                          )}
                    </>
                  )}

                  {userType === "seller" && bidderContacts.length > 0 && (
                    <>
                      <hr className="my-2 border-gray-500" />
                      <p className="px-3 text-sm text-gray-300">Bidders</p>
                      {bidderContacts.map((bidderContacts) => (
                        <div
                          key={bidderContacts._id}
                          onClick={() => {
                            setSelectedContact(bidderContacts);
                            setMessages([]);
                          }}
                          className={`flex items-center gap-3 p-3 transition-colors cursor-pointer hover:bg-blue-300 relative ${
                            selectedContact?._id === bidderContacts._id
                              ? "bg-blue-400"
                              : "bg-theme-bg"
                          }`}
                        >
                          <div className="relative">
                            <img
                              src={user.profilePicture}
                              alt={user.firstName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">
                              {bidderContacts.firstName}
                            </p>
                            <p className="text-xs text-white-500 truncate">
                              Bidder
                            </p>
                          </div>
                          {bidderContacts.unread > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {bidderContacts.unread > 9
                                ? "9+"
                                : bidderContacts.unread}
                            </span>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </>
              ) : (
                <p className="p-3 text-gray-400">No contacts found.</p>
              )}
            </div>
          </motion.div>

          {/* Chat Panel */}
          {selectedContact && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-theme-bg shadow-xl rounded-xl border border-gray-200 w-80 h-[500px] flex flex-col"
            >
              <div className="p-3 border-b bg-theme-bg rounded-2xl border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img
                    src={selectedContact.profilePicture}
                    alt={selectedContact.firstName}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-white">
                      {selectedContact.firstName} {selectedContact.lastName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {selectedContact.userType === "admin"
                        ? "Admin"
                        : selectedContact.userType === "seller"
                          ? "Seller"
                          : selectedContact.userType === "bidder"
                            ? "Bidder"
                            : "Seller"}
                      {onlineAdmins.includes(selectedContact._id) &&
                        " • Online"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-500 hover:text-blue-700"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {/* Messages */}
              <div
                ref={chatRef}
                className="flex-1 bg-theme-bg2 overflow-y-auto p-4"
              >
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                      {userType === "admin" ? <FaUser /> : <FaComments />}
                    </div>
                    <h4 className="font-medium text-white-700">
                      No messages yet
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Start a conversation with {selectedContact.firstName}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 bg-theme-bg2">
                    {messages.map((msg) => {
                      const isCurrentUser = msg.senderId === userId;
                      const contactName = isCurrentUser
                        ? "You"
                        : selectedContact?.firstName ||
                          (msg.senderType === "admin"
                            ? "Admin"
                            : msg.senderType === "seller"
                              ? "Seller"
                              : msg.senderType === "bidder"
                                ? "Bidder"
                                : "User");

                      // Cleaner display name without parentheses
                      const displayName = isCurrentUser
                        ? "You"
                        : `${selectedContact?.firstName || contactName}`;

                      return (
                        <div
                          key={msg._id || msg.timestamp}
                          className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg p-3 ${
                              isCurrentUser
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-gray-200 text-gray-800 rounded-bl-none"
                            }`}
                          >
                            {!isCurrentUser && (
                              <p className="font-semibold text-xs">
                                {displayName}
                              </p>
                            )}
                            <p>{msg.text}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isCurrentUser
                                  ? "text-blue-100"
                                  : "text-gray-500"
                              }`}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {typingStatus && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none p-3 max-w-[75%]">
                          <p className="italic">{typingStatus}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-3 border-t bg-theme-bg border-gray-200">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="flex-1 bg-theme-bg2 text-white border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type a message..."
                    value={input}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaPaperPlane size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
