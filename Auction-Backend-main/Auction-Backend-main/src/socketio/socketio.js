import { io } from "../index.js";
import Auction from "../models/auction.model.js";
import Bid from "../models/bid.model.js";
import mongoose from "mongoose";
import sendPushNotification from "../firebase/firebaseAdmin.js";
import Message from "../models/Message.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import Product from "../models/Product.js";
export const socketIoConnectioin = () => {
  let users = [];
  let adminSockets = [];
  let sellerSockets = [];
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    const userType = socket.handshake.query.userType;
    socket.join(userId);
    if (userType === "admin") {
      adminSockets.push({ userId, socketId: socket.id });

    }
    if (userType === "seller") {
      sellerSockets.push({ userId, socketId: socket.id });
   
    }
    socket.on("joinAuction", (userId) => {
 
      socket.join(userId);

      const user = users.find((user) => user.userId === userId);
      if (!user) {
        users.push({ userId, socketId: socket.id });
      } else {
        user.socketId = socket.id;
      }
   
    });

    socket.on("newBid", (data) => {
      //send message to all users who are in users
     
      users.forEach((user) => {
        io.to(user.socketId).emit("newBidData", data);
      });
    });

    socket.on("sendMessage", async (messageData) => {
     
      try {
        if (messageData.senderId === messageData.receiverId) {
            console.warn("User is trying to send a message to themselves:", messageData.senderId);
            return; // Ignore self-messages unless explicitly allowed
        }

        const senderUser = await User.findById(messageData.senderId);
        const senderName = senderUser ? `${senderUser.firstName} ${senderUser.lastname}` : "Unknown User";
    
        if (messageData.fcmToken) {
          await sendPushNotification(
            messageData.fcmToken,
            messageData.text,
            senderName,
          );
        }
     

        const message = new Message({
          sender: messageData.senderId,
          receiver: messageData.receiverId,
          text: messageData.text,
          isRead: messageData.senderType === "admin",
        });

        const savedMessage = await message.save();
       
        const notification = new Notification({
          user: messageData.receiverId,
          message: `New message received`,
          type: "MESSAGE_RECEIVED",
          relatedEntity: savedMessage._id,
          isRead: false,
          link: `/messages/${savedMessage._id}`,
        });
        await notification.save();
    

        io.to(messageData.senderId).emit(
          "receiveMessage",
          savedMessage.toObject()
        );
        io.to(messageData.receiverId).emit(
          "receiveMessage",
          savedMessage.toObject()
        );

        io.to(messageData.receiverId).emit("newMessageNotification", {
          type: "GENERAL",
          count: 1,
        });
        io.to(messageData.receiverId).emit("newMessageNotification", {
          type: "SPECIFIC",
          senderId: messageData.senderId,
          messagePreview: messageData.text.substring(0, 30),
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error saving message:", error.message); // Use error.message for better clarity
        socket.emit("messageError", { error: "Failed to send message" });
      }
    });
// Add this to your existing socket.io events
socket.on("newPurchase", async (data) => {
  try {
    const { orderId, productId, buyerId, sellerId } = data;
    
 
    const product = await Product.findById(productId);
    const buyer = await User.findById(buyerId);
    const seller = await User.findById(sellerId);

    if (!product || !buyer || !seller) return;

    // Create notification for seller
    const sellerNotification = {
      user: sellerId,
      message: `Your product ${product.name} has been purchased by ${buyer.firstName}`,
      type: "PRODUCT_SOLD",
      product: productId,
      order: orderId,
      link: `/seller/orders/${orderId}`
    };

    // Create notification for buyer
    const buyerNotification = {
      user: buyerId,
      message: `Your purchase of ${product.name} has been confirmed`,
      type: "PURCHASE_CONFIRMED",
      product: productId,
      order: orderId,
      link: `/my-orders/${orderId}`
    };

    // Emit notifications to respective users
    io.to(sellerId).emit("newPurchaseNotification", sellerNotification);
    io.to(buyerId).emit("newPurchaseNotification", buyerNotification);

    // Send push notifications if FCM tokens exist
    if (seller.fcmToken) {
      await sendPushNotification(
        seller.fcmToken,
        `New sale: ${product.name}`,
        `${buyer.firstName} purchased your product`
      );
    }

    if (buyer.fcmToken) {
      await sendPushNotification(
        buyer.fcmToken,
        `Purchase confirmed: ${product.name}`,
        `Your order #${orderId} has been confirmed`
      );
    }

  } catch (error) {
    console.error("Error handling new purchase:", error);
  }
});
    socket.on("getMessages", async ({ userId1, userId2 }) => {
      try {
        const messages = await Message.find({
          $or: [
            { sender: userId1, receiver: userId2 },
            { sender: userId2, receiver: userId1 },
          ],
        })
          .sort({ createdAt: 1 })
          .lean();
        const formattedMessages = messages.map((msg) => ({
          ...msg,
          senderId: msg.sender,
          receiverId: msg.receiver,
        }));

        socket.emit("messageHistory", formattedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        socket.emit("messageHistory", []);
      }
    });
    socket.on("adminGetUnreadMessages", async (adminId) => {
      try {
        const unreadMessages = await Message.find({
          receiver: adminId,
          isRead: false,
        }).populate("sender", "firstName lastName profilePicture");

        socket.emit("unreadMessages", unreadMessages);
      } catch (error) {
        console.error("Error fetching unread messages:", error);
      }
    });
    socket.on("getMessagingUsers", async (adminId) => {
      try {
        const messagingUsers = await Message.aggregate([
          {
            $match: {
              $or: [
                { receiver: new mongoose.Types.ObjectId(adminId) },
                { sender: new mongoose.Types.ObjectId(adminId) },
              ],
            },
          },
          {
            $group: {
              _id: {
                $cond: [
                  { $eq: ["$sender", new mongoose.Types.ObjectId(adminId)] },
                  "$receiver",
                  "$sender",
                ],
              },
              lastMessage: { $last: "$$ROOT" },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          {
            $project: {
              _id: "$user._id",
              firstName: {
                $ifNull: [
                  { $concat: ["$user.firstName", " ", "$user.lastName"] },
                  "$user.email",
                ],
              },
              profilePicture: "$user.profilePicture",
              email: "$user.email",
              lastMessage: "$lastMessage.text",
              lastMessageTime: "$lastMessage.createdAt",
            },
          },
          { $sort: { lastMessageTime: -1 } },
        ]);

        socket.emit("messagingUsersList", messagingUsers);
      } catch (error) {
        console.error("Error fetching messaging users:", error);
        socket.emit("messagingUsersList", []);
      }
    });
    socket.on("markAsRead", async ({ messageId, adminId }) => {
      try {
        await Message.updateOne(
          { _id: messageId, receiver: adminId },
          { $set: { isRead: true } }
        );
        socket.emit("messageRead", { success: true });
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    });
    socket.on("sendNewBidNotification", async (data) => {
      const auctionData = await Auction.findById(data.auctionId);
      if (!auctionData) {
        return;
      }

      if (data.type === "BID_PLACED") {
        var notification = {
          user: null,
          message: `${data.firstName} has placed a ${data.newBidAmount}$ bid on ${auctionData?.name}`,
          type: "BID_PLACED",
          auction: data.auctionId,
          link: `/single-auction-detail/${data.auctionId}`,
        };
      }
      users.forEach((user) => {
        notification.message = `${
          data.id === user.userId ? "you" : data.firstName
        } placed a ${data.newBidAmount}$ bid on  ${auctionData?.name}`;

        io.to(user.socketId).emit("newBidNotification", notification);
      });
    });

    socket.on("selectWinner", async (id) => {
      const bids = await Bid.find({ auction: id });
     
      if (bids.length === 0) {
        return users.forEach((user) => {
          io.to(user.socketId).emit("winnerSelected", null);
        });
      }

      let maxBidId = bids[0]._id;
      let maxAmount = bids[0].bidAmount;
      for (let i = 1; i < bids.length; i++) {
        if (bids[i].bidAmount > maxAmount) {
          maxAmount = bids[i].bidAmount;
          maxBidId = bids[i]._id;
        }
      }

      const auction = await Auction.findById(id);
      const winnerUser = await Bid.findById(maxBidId).populate(
        "bidder",
        "firstName email phone profilePicture"
      );

  

      auction.winner = maxBidId;
      auction.status = "over";

      await auction.save();

      users.forEach((user) => {
        io.to(user.socketId).emit("winnerSelected", winnerUser);
      });
    });

    socket.on("disconnect", () => {
      adminSockets = adminSockets.filter(
        (admin) => admin.socketId !== socket.id
      );
      users = users.filter((user) => user.socketId !== socket.id);
    });
  });
};
