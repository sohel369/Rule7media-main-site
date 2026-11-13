import ContactInfo from"../models/ContactInfo.model.js";
import mongoose from 'mongoose';
import User from "../models/user.model.js";
import Message from "../models/Message.js";
import { getEmailTransporter, getFromAddress } from '../utils/emailTransporter.js';

export const getContactInfo = async (req, res) => {
  try {
    const infoList = await ContactInfo.find();
    res.json(infoList);
  } catch (err) {
    res.status(500).json({ error: "Failed to get contact info" });
  }
};

export const createContactInfo = async (req, res) => {
  const {email, phone, country, officeAddress } = req.body;

  try {
    // Check for duplicate address only if address is provided and not empty
    if (officeAddress && officeAddress.trim()) {
      const existing = await ContactInfo.findOne({ 
        officeAddress: { $regex: new RegExp(`^${officeAddress.trim()}$`, 'i') } 
      });
      
      if (existing) {
        return res.status(400).json({
          message: "This address already exists"
        });
      }
    }

    // Check for duplicate email if email is provided
    if (email && email.trim()) {
      const existingEmail = await ContactInfo.findOne({ 
        email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } 
      });
      
      if (existingEmail) {
        return res.status(400).json({
          message: "This email already exists"
        });
      }
    }

    const created = await ContactInfo.create({
      email: email ? email.trim() : '',
      phone: phone ? phone.trim() : '',
      country: country ? country.trim() : '',
      officeAddress: officeAddress ? officeAddress.trim() : ''
    });

    res.status(201).json({
      message: "Contact info created successfully",
      data: created
    });
  } catch (error) {
    console.error("Create contact info error:", error);
    res.status(500).json({ message: "Failed to create contact info", error: error.message });
  }
};

// PUT update contact info
export const updateContactInfo = async (req, res) => {
  const { id } = req.params; // Get ID from URL params
  const {  email, phone, country, officeAddress } = req.body;

  try {
    const updated = await ContactInfo.findByIdAndUpdate(
      id, // Use the ID from params
      {  email, phone, country, officeAddress },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Contact info not found" });
    }

    res.json({
      message: "Contact info updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("Update contact info error:", error);
    res.status(500).json({ message: "Failed to update contact info", error });
  }
};

  // DELETE Contact Info by ID
export const deleteContactInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ContactInfo.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Contact info not found" });
    }

    res.json({ message: "Contact info deleted successfully" });
  } catch (err) {
    console.error("Delete contact error:", err);
    res.status(500).json({ error: "Failed to delete contact info" });
  }
};


export const sendMessage = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  
  // Check for required fields
  if (!name || !email || !message) {
    return res.status(400).json({
      message: 'Missing required fields',
      received: { name, email, message }
    });
  }

  try {
    let contact = await Message.findOne();
    
    if (!contact) {
      contact = new Message({
        email: [process.env.EMAIL_USER], 
        messages: []
      });
    }

    // Ensure messages array exists
    if (!contact.messages) {
      contact.messages = [];
    }

    const newMessage = {
      fullName: name,
      email,
      phone: phone || '',
      subject: subject || '',
      message,
      date: new Date()
    };

    contact.messages.push(newMessage);
    await contact.save();

    // Return immediate success to user so form is never blocked or failed
    res.status(200).json({ message: 'Message sent successfully' });

    // Send emails in background (Fail-Safe: if SMTP succeeds, emails are sent; if SMTP fails, user is not affected)
    (async () => {
      try {
        const transporter = await getEmailTransporter();
        const fromAddress = await getFromAddress();

        // Email to admin
        const adminMailOptions = {
          from: fromAddress,
          to: fromAddress,
          replyTo: email,
          subject: `New Contact Message: ${subject || 'No Subject'}`,
          html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>📩 New Message Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
          ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
          <hr />
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        </div>
      `,
        };

        // Email to user (confirmation)
        const userMailOptions = {
          from: fromAddress,
          to: email,
          subject: "Thank you for your message",
          html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>🙏 Thank You, ${name}</h2>
          <p>We have received your message and will respond shortly.</p>
          <hr />
          <p><strong>Your Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
          <p>– The Support Team</p>
        </div>
      `,
        };

        await Promise.all([
          transporter.sendMail(adminMailOptions),
          transporter.sendMail(userMailOptions)
        ]);
      } catch (emailErr) {
        console.warn('=== BACKGROUND CONTACT EMAIL NOTICE: Email delivery skipped/failed ===', emailErr.message);
      }
    })();
  } catch (err) {
    console.error('=== MESSAGE SAVE ERROR ===', err);
    return res.status(500).json({
      message: 'Error saving message',
      error: err.message
    });
  }
};