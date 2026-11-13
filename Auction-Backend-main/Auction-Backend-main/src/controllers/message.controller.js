import Message from "../models/Message.js";
import User from "../models/user.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user.id;

    const message = new Message({ sender: senderId, receiver: receiverId, text });

    await message.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const senderId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: userId },
        { sender: userId, receiver: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
