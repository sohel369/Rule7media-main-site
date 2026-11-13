/**
 * AES-256-CBC Encryption / Decryption Utility
 *
 * Uses Node.js built-in `crypto` module — no additional npm package required.
 *
 * Environment variable required:
 *   SMTP_ENCRYPTION_KEY  →  exactly 32 characters (256 bits)
 *
 * Algorithm:
 *   - A fresh random 16-byte IV is generated for every encryption.
 *   - The stored ciphertext format is:  <hex-iv>:<hex-ciphertext>
 *   - This format makes decryption deterministic and replay-safe.
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // AES block size

/**
 * Returns a 32-byte Buffer derived from the encryption key env var.
 * Throws immediately if the key is missing or wrong length.
 */
function getKey() {
  const key = process.env.SMTP_ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      "SMTP_ENCRYPTION_KEY is not set in environment variables. " +
        "Please add a 32-character secret to your .env file."
    );
  }
  if (Buffer.byteLength(key, "utf8") !== 32) {
    throw new Error(
      `SMTP_ENCRYPTION_KEY must be exactly 32 bytes. Current length: ${Buffer.byteLength(key, "utf8")} bytes.`
    );
  }
  return Buffer.from(key, "utf8");
}

/**
 * Encrypts a plain-text string.
 * @param {string} plainText  - The raw password to encrypt.
 * @returns {string}          - "<hex-iv>:<hex-ciphertext>"
 */
export function encryptPassword(plainText) {
  if (!plainText || typeof plainText !== "string") {
    throw new Error("encryptPassword: plainText must be a non-empty string.");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts a previously encrypted string.
 * @param {string} cipherText - "<hex-iv>:<hex-ciphertext>" produced by encryptPassword().
 * @returns {string}          - The original plain-text password.
 */
export function decryptPassword(cipherText) {
  if (!cipherText || typeof cipherText !== "string") {
    throw new Error("decryptPassword: cipherText must be a non-empty string.");
  }

  const [ivHex, encryptedHex] = cipherText.split(":");
  if (!ivHex || !encryptedHex) {
    throw new Error(
      "decryptPassword: Invalid cipherText format. Expected '<iv>:<ciphertext>'."
    );
  }

  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export default { encryptPassword, decryptPassword };
