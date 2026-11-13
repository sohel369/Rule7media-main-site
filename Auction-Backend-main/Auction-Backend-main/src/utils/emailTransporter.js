/**
 * getEmailTransporter — Dynamic Nodemailer Transporter Factory
 *
 * Loads SMTP settings from MongoDB at call-time (not from .env).
 * Decrypts the stored password only in memory, never logs or returns it.
 *
 * Usage:
 *   import { getEmailTransporter } from "../utils/emailTransporter.js";
 *
 *   const transporter = await getEmailTransporter();
 *   await transporter.sendMail({ from, to, subject, html });
 */

import nodemailer from "nodemailer";
import EmailSettings from "../models/emailSettings.model.js";
import { decryptPassword } from "./encryption.js";

/**
 * Returns a fully configured Nodemailer transporter loaded from the
 * EmailSettings MongoDB document. Decrypts the SMTP password in memory.
 *
 * @throws {Error} if no EmailSettings document exists in the database.
 * @returns {Promise<nodemailer.Transporter>}
 */
export async function getEmailTransporter() {
  const settings = await EmailSettings.findOne().lean();

  if (!settings) {
    throw new Error(
      "No SMTP email settings found in the database. " +
        "Please configure them via Admin → Email Settings."
    );
  }

  // Decrypt password only in memory — never stored or logged in plain text
  const plainPassword = decryptPassword(settings.password);
  const port = Number(settings.port) || 587;
  // In Nodemailer, secure MUST be true for port 465, and false for port 587/25/2525
  const isSecure = port === 465;

  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: port,
    secure: isSecure,
    auth: {
      user: settings.user,
      pass: plainPassword,
    },
    tls: {
      rejectUnauthorized: false,
    },
    // Generous timeout settings to handle slow SMTP servers
    connectionTimeout: 30000,  // 30 seconds to connect
    greetingTimeout: 30000,    // 30 seconds greeting
    socketTimeout: 60000,      // 60 seconds per socket operation
  });

  return transporter;
}

/**
 * Helper: build the "from" address string using DB settings.
 * Returns something like:  "Rule7 Media <support@rule7media.com>"
 *
 * @returns {Promise<string>}
 */
export async function getFromAddress() {
  const settings = await EmailSettings.findOne()
    .select("fromName user")
    .lean();

  if (!settings) {
    return process.env.EMAIL_USER || "noreply@rule7media.com";
  }

  return settings.fromName
    ? `${settings.fromName} <${settings.user}>`
    : settings.user;
}

export default { getEmailTransporter, getFromAddress };
