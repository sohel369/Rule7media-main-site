import mongoose from "mongoose";

const emailSettingsSchema = new mongoose.Schema(
  {
    host: {
      type: String,
      required: [true, "SMTP host is required"],
      trim: true,
    },
    port: {
      type: Number,
      required: [true, "SMTP port is required"],
      default: 465,
    },
    secure: {
      type: Boolean,
      default: false,
      // true → port 465 (SSL/TLS), false → STARTTLS
    },
    user: {
      type: String,
      required: [true, "SMTP user (email address) is required"],
      trim: true,
    },
    // Stored as AES-256-CBC encrypted ciphertext — NEVER in plain text
    password: {
      type: String,
      required: [true, "SMTP password is required"],
    },
    fromName: {
      type: String,
      trim: true,
      default: "Rule7 Media",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const EmailSettings = mongoose.model("EmailSettings", emailSettingsSchema);

export default EmailSettings;
