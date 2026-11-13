import EmailSettings from "../models/emailSettings.model.js";
import { encryptPassword } from "../utils/encryption.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * Sanitise a settings document for the API response.
 * The real password is NEVER returned — only a masked placeholder.
 */
const sanitiseSettings = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.password = "********"; // mask — never expose the encrypted blob
  return obj;
};

/* -----------------------------------------------------------------------
 * GET /api/v1/admin/email-settings
 * Returns the single EmailSettings document (password masked).
 * ---------------------------------------------------------------------- */
export const getEmailSettings = asyncHandler(async (req, res) => {
  const settings = await EmailSettings.findOne().populate(
    "updatedBy",
    "name email"
  );

  if (!settings) {
    return res
      .status(404)
      .json(new ApiResponse(404, "No email settings found. Please create them first."));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Email settings fetched successfully.", sanitiseSettings(settings))
    );
});

/* -----------------------------------------------------------------------
 * POST /api/v1/admin/email-settings
 * Creates the initial EmailSettings document.
 * Fails if one already exists (use PUT to update).
 * ---------------------------------------------------------------------- */
export const createEmailSettings = asyncHandler(async (req, res) => {
  const existing = await EmailSettings.findOne();
  if (existing) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          "Email settings already exist. Use PUT to update them."
        )
      );
  }

  const { host, port, secure, user, password, fromName } = req.body;

  // Validate required fields
  if (!host || !port || !user || !password) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, "host, port, user, and password are required.")
      );
  }

  if (isNaN(Number(port)) || Number(port) < 1 || Number(port) > 65535) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Port must be a valid number between 1 and 65535."));
  }

  // Encrypt the password before persisting
  const encryptedPassword = encryptPassword(password);

  const settings = await EmailSettings.create({
    host: host.trim(),
    port: Number(port),
    secure: Boolean(secure),
    user: user.trim(),
    password: encryptedPassword,
    fromName: fromName ? fromName.trim() : "Rule7 Media",
    updatedBy: req.user?._id ?? null,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Email settings created successfully.", sanitiseSettings(settings))
    );
});

/* -----------------------------------------------------------------------
 * PUT /api/v1/admin/email-settings
 * Updates the existing EmailSettings document.
 * If password field in body is "********" or empty, keeps the current one.
 * ---------------------------------------------------------------------- */
export const updateEmailSettings = asyncHandler(async (req, res) => {
  const settings = await EmailSettings.findOne();

  if (!settings) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          "No email settings found. Use POST to create them first."
        )
      );
  }

  const { host, port, secure, user, password, fromName } = req.body;

  // Only update provided fields
  if (host !== undefined) settings.host = host.trim();
  if (port !== undefined) {
    if (isNaN(Number(port)) || Number(port) < 1 || Number(port) > 65535) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Port must be a valid number between 1 and 65535."));
    }
    settings.port = Number(port);
  }
  if (secure !== undefined) settings.secure = Boolean(secure);
  if (user !== undefined) settings.user = user.trim();
  if (fromName !== undefined) settings.fromName = fromName.trim();

  // Only re-encrypt password if a real new value was sent
  // (frontend sends "********" when user did not change the password)
  if (password && password !== "********" && password.trim() !== "") {
    settings.password = encryptPassword(password.trim());
  }

  settings.updatedBy = req.user?._id ?? null;

  await settings.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Email settings updated successfully.", sanitiseSettings(settings))
    );
});
