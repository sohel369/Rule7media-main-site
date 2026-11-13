import { MediaKit, DownloadRequest } from "../models/mediaLead.model.js";
import { getEmailTransporter, getFromAddress } from "../utils/emailTransporter.js";
import EmailSettings from "../models/emailSettings.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── 11 SUPPORTED LANGUAGES DEFINITION ───────────────────────────────────────
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", countryName: "United States / Global" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", countryName: "India" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", countryName: "Spain / Latin America" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳", countryName: "China" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", countryName: "Japan" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", countryName: "Germany" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", countryName: "France / Canada" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷", countryName: "Brazil / Portugal" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩", countryName: "Indonesia" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭", countryName: "Thailand" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳", countryName: "Vietnam" },
];

// Country to language priority mapping
export const COUNTRY_TO_LANGUAGES = {
  // India (Supports Hindi and English)
  IN: ["hi", "en"],
  IND: ["hi", "en"],
  INDIA: ["hi", "en"],

  // Canada (Supports English and French)
  CA: ["en", "fr"],
  CAN: ["en", "fr"],
  CANADA: ["en", "fr"],

  // United States (Supports English and Spanish)
  US: ["en", "es"],
  USA: ["en", "es"],
  "UNITED STATES": ["en", "es"],

  // Spain & Latin America
  ES: ["es", "en"],
  SPAIN: ["es", "en"],
  MX: ["es", "en"],
  MEXICO: ["es", "en"],
  AR: ["es", "en"],
  ARGENTINA: ["es", "en"],
  CO: ["es", "en"],
  COLOMBIA: ["es", "en"],
  CL: ["es", "en"],
  CHILE: ["es", "en"],
  PE: ["es", "en"],
  PERU: ["es", "en"],

  // France & Belgium
  FR: ["fr", "en"],
  FRANCE: ["fr", "en"],
  BE: ["fr", "en"],

  // Germany, Austria, Switzerland
  DE: ["de", "en"],
  GERMANY: ["de", "en"],
  AT: ["de", "en"],
  AUSTRIA: ["de", "en"],
  CH: ["de", "fr", "en"],
  SWITZERLAND: ["de", "fr", "en"],

  // China, Taiwan, Hong Kong, Singapore
  CN: ["zh", "en"],
  CHINA: ["zh", "en"],
  TW: ["zh", "en"],
  HK: ["zh", "en"],
  SG: ["zh", "en"],

  // Japan
  JP: ["ja", "en"],
  JAPAN: ["ja", "en"],

  // Brazil & Portugal
  BR: ["pt", "en"],
  BRAZIL: ["pt", "en"],
  PT: ["pt", "en"],
  PORTUGAL: ["pt", "en"],

  // Indonesia
  ID: ["id", "en"],
  INDONESIA: ["id", "en"],

  // Thailand
  TH: ["th", "en"],
  THAILAND: ["th", "en"],

  // Vietnam
  VN: ["vi", "en"],
  VIETNAM: ["vi", "en"],

  // Australia, UK, New Zealand
  AU: ["en"],
  AUSTRALIA: ["en"],
  GB: ["en"],
  UK: ["en"],
  "UNITED KINGDOM": ["en"],
  NZ: ["en"],
  NEWZEALAND: ["en"],

  DEFAULT: ["en"],
};

// Helper: Normalize country string to code/key
const normalizeCountryKey = (country) => {
  if (!country) return "DEFAULT";
  const trimmed = country.trim().toUpperCase();
  return trimmed;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Helper: Resolve physical PDF file on disk
// pdfPath in DB is stored as "uploads/filename.pdf" (no "public/" prefix)
const findExistingPdfPath = (storedPath) => {
  if (!storedPath) return null;

  // Normalize separators
  const normalized = storedPath.replace(/\\/g, "/");

  const possiblePaths = [
    // Direct OS paths (absolute)
    normalized,
    // Relative to CWD: "public/uploads/filename.pdf"
    path.join(process.cwd(), "public", normalized),
    // In case it already has "public/" prefix stored (legacy)
    path.join(process.cwd(), normalized),
    // Just the basename in uploads folder
    path.join(process.cwd(), "public/uploads", path.basename(normalized)),
  ];

  for (const tryPath of possiblePaths) {
    if (fs.existsSync(tryPath)) {
      return tryPath;
    }
  }
  return null;
};

// Helper: Ensure a valid professional Rule 7 Media Kit PDF always exists on disk
export const ensureMediaKitPdfExists = async (langCode = "en", country = "Global") => {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const safeLang = (langCode || "en").toLowerCase().trim();
  const filename = `Rule7_MediaKit_${safeLang}.pdf`;
  const filePath = path.join(uploadsDir, filename);

  // If already exists and size > 1KB, return existing
  if (fs.existsSync(filePath)) {
    try {
      const stats = fs.statSync(filePath);
      if (stats.size > 1000) {
        return { filePath, filename };
      }
    } catch (e) {}
  }

  // Generate a valid, professional Rule 7 Media Kit PDF using pdfkit
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // --- Header Banner ---
      doc.rect(0, 0, 595, 115).fill("#0f172a");
      doc.rect(0, 112, 595, 3).fill("#e11d48");

      doc.fontSize(26).fillColor("#ffffff").font("Helvetica-Bold")
         .text("RULE 7 MEDIA", 40, 32);
      doc.fontSize(11).fillColor("#93c5fd").font("Helvetica")
         .text(`Global Fleet & High-Impact Wrap Advertising Network • ${country || "Global"} Edition`, 40, 68);

      // Section: Overview
      doc.moveDown(3);
      doc.fontSize(18).fillColor("#0f172a").font("Helvetica-Bold")
         .text("Official Media Kit & Advertising Rate Card 2026", 40, 140);

      doc.fontSize(10).fillColor("#475569").font("Helvetica")
         .text(
           "Rule 7 Media connects automotive brands, tier-1 suppliers, and aftermarket leaders with over 500,000+ monthly verified commercial vehicle owners, fleet operators, and certified wrapping shops worldwide.",
           40,
           170,
           { width: 515, lineGap: 3 }
         );

      // Stat Cards
      const cardY = 225;
      // Box 1
      doc.roundedRect(40, cardY, 160, 70, 8).fillAndStroke("#f8fafc", "#cbd5e1");
      doc.fontSize(20).fillColor("#2563eb").font("Helvetica-Bold").text("92%", 55, cardY + 12);
      doc.fontSize(9).fillColor("#64748b").font("Helvetica").text("Decision Makers Reach", 55, cardY + 38);

      // Box 2
      doc.roundedRect(215, cardY, 160, 70, 8).fillAndStroke("#f8fafc", "#cbd5e1");
      doc.fontSize(20).fillColor("#059669").font("Helvetica-Bold").text("7.4x", 230, cardY + 12);
      doc.fontSize(9).fillColor("#64748b").font("Helvetica").text("Avg. Monthly Impressions", 230, cardY + 38);

      // Box 3
      doc.roundedRect(390, cardY, 165, 70, 8).fillAndStroke("#f8fafc", "#cbd5e1");
      doc.fontSize(20).fillColor("#9333ea").font("Helvetica-Bold").text("50 Km", 405, cardY + 12);
      doc.fontSize(9).fillColor("#64748b").font("Helvetica").text("Hyper-Local Geofencing", 405, cardY + 38);

      // Section: Key Advertising Solutions
      doc.fontSize(15).fillColor("#0f172a").font("Helvetica-Bold").text("Targeted Advertising Solutions", 40, 315);

      const packages = [
        {
          title: "1. Premium Fleet Wrap Sponsorship",
          desc: "Full & partial commercial vehicle wrap campaigns with verified GPS route tracking and hyper-local route density.",
        },
        {
          title: "2. Live Decreasing-Bid Auction Placement",
          desc: "Real-time automated ad unit placement across our proprietary live bidding exchange for maximum ROI at market rates.",
        },
        {
          title: "3. Direct B2B Workshop & Installer Network",
          desc: "Reach 12,000+ certified wrapping specialists, mechanics, and commercial fleet decision-makers directly.",
        },
        {
          title: "4. Gotta Scan Them All™ Sweepstakes Integration",
          desc: "Interactive QR scan gamification that delivers direct consumer engagements and verifiable lead capture.",
        },
      ];

      let py = 345;
      packages.forEach((pkg) => {
        doc.fontSize(10.5).fillColor("#1e40af").font("Helvetica-Bold").text(pkg.title, 40, py);
        doc.fontSize(8.5).fillColor("#475569").font("Helvetica").text(pkg.desc, 40, py + 14, { width: 515 });
        py += 40;
      });

      // Section: Contact & Booking Box
      doc.roundedRect(40, 525, 515, 80, 8).fillAndStroke("#0f172a", "#1e293b");
      doc.fontSize(12).fillColor("#ffffff").font("Helvetica-Bold").text("Book Your Campaign Today", 55, 538);
      doc.fontSize(9).fillColor("#94a3b8").font("Helvetica")
         .text("Contact our global media sales desk for customized rate cards, territory availability, and fleet booking.", 55, 556, { width: 485 });
      doc.fontSize(9.5).fillColor("#38bdf8").font("Helvetica-Bold")
         .text("Email: support@rule7media.com  |  Web: www.rule7media.com", 55, 578);

      // Footer
      doc.fontSize(8).fillColor("#94a3b8").font("Helvetica")
         .text(`© 2026 Rule 7 Media. All Rights Reserved. Document Language: ${safeLang.toUpperCase()}`, 40, 750, { align: "center", width: 515 });

      doc.end();

      writeStream.on("finish", () => {
        resolve({ filePath, filename });
      });

      writeStream.on("error", (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};

// Helper: Find best matching media kit by language & country
// Helper: Find best matching media kit by Country and Language
const resolveBestMediaKit = async (requestedLang, userCountry) => {
  let targetLang = requestedLang ? requestedLang.toLowerCase().trim() : "en";
  let countryName = userCountry ? userCountry.trim() : "Global";

  // 1. Priority 1: Exact Country + Exact Language (e.g. India + English, India + Hindi, US + English)
  if (countryName && countryName !== "Global") {
    const exactCountryKit = await MediaKit.findOne({
      country: { $regex: new RegExp(`^${escapeRegex(countryName)}$`, "i") },
      language: targetLang,
      isActive: true,
    });
    if (exactCountryKit) {
      const validPath = findExistingPdfPath(exactCountryKit.pdfPath);
      if (validPath) {
        return { kit: exactCountryKit, pdfPath: validPath, language: targetLang, country: countryName, isFallback: false };
      }
    }
  }

  // 2. Priority 2: Global + Requested Language (e.g. Global + English, Global + Hindi)
  const globalLangKit = await MediaKit.findOne({
    $or: [{ country: "Global" }, { country: { $exists: false } }, { country: "" }],
    language: targetLang,
    isActive: true,
  });
  if (globalLangKit) {
    const validPath = findExistingPdfPath(globalLangKit.pdfPath);
    if (validPath) {
      return { kit: globalLangKit, pdfPath: validPath, language: targetLang, country: "Global", isFallback: false };
    }
  }

  // 3. Priority 3: Country's prioritized alternative languages (e.g. if requested language not found, try alternative for that country)
  if (countryName && countryName !== "Global") {
    const normKey = normalizeCountryKey(countryName);
    const countryLangs = COUNTRY_TO_LANGUAGES[normKey] || COUNTRY_TO_LANGUAGES.DEFAULT;
    for (const altLang of countryLangs) {
      if (altLang === targetLang) continue;
      const altKit = await MediaKit.findOne({
        country: { $regex: new RegExp(`^${countryName}$`, "i") },
        language: altLang,
        isActive: true,
      }) || await MediaKit.findOne({
        $or: [{ country: "Global" }, { country: { $exists: false } }],
        language: altLang,
        isActive: true,
      });

      if (altKit) {
        const validPath = findExistingPdfPath(altKit.pdfPath);
        if (validPath) {
          return { kit: altKit, pdfPath: validPath, language: altLang, country: countryName, isFallback: true };
        }
      }
    }
  }

  // 4. Priority 4: Any active English kit
  const anyEnKit = await MediaKit.findOne({ language: "en", isActive: true });
  if (anyEnKit) {
    const validPath = findExistingPdfPath(anyEnKit.pdfPath);
    if (validPath) {
      return { kit: anyEnKit, pdfPath: validPath, language: "en", country: countryName, isFallback: true };
    }
  }

  // 5. Priority 5: Any active kit in database
  const anyActiveKit = await MediaKit.findOne({ isActive: true });
  if (anyActiveKit) {
    const validPath = findExistingPdfPath(anyActiveKit.pdfPath);
    if (validPath) {
      return { kit: anyActiveKit, pdfPath: validPath, language: anyActiveKit.language || "en", country: countryName, isFallback: true };
    }
  }

  // 6. Check static disk files
  const defaultPdfPath = findExistingPdfPath("public/rule7_media_kit.pdf") ||
    findExistingPdfPath("rule7_media_kit.pdf") ||
    findExistingPdfPath("public/uploads/1780632671531-rule7_media_kit.pdf") ||
    findExistingPdfPath("src/Letterhead With Emails.pdf");

  if (defaultPdfPath) {
    return {
      kit: {
        _id: null,
        language: targetLang,
        languageName: "English",
        country: countryName,
        pdfFilename: path.basename(defaultPdfPath),
        pdfPath: defaultPdfPath,
      },
      pdfPath: defaultPdfPath,
      language: targetLang,
      country: countryName,
      isFallback: true,
    };
  }

  // 7. Dynamic PDF Generation with exact Country + Language customized!
  try {
    const generated = await ensureMediaKitPdfExists(targetLang, countryName);
    return {
      kit: {
        _id: null,
        language: targetLang,
        languageName: "English",
        country: countryName,
        pdfFilename: generated.filename,
        pdfPath: generated.filePath,
      },
      pdfPath: generated.filePath,
      language: targetLang,
      country: countryName,
      isFallback: true,
    };
  } catch (genErr) {
    console.error("❌ Error generating fallback PDF:", genErr);
    return { kit: null, pdfPath: null, language: targetLang, country: countryName, isFallback: false };
  }
};

// ─── PUBLIC: Get available language kits and country suggestions ─────────────
export const getAvailableKits = async (req, res) => {
  try {
    const { country } = req.query;
    const activeKits = await MediaKit.find({ isActive: true });
    const activeLangSet = new Set(activeKits.map((k) => k.language));

    const normKey = normalizeCountryKey(country);
    const suggestedLangCodes = COUNTRY_TO_LANGUAGES[normKey] || COUNTRY_TO_LANGUAGES.DEFAULT;

    const languages = SUPPORTED_LANGUAGES.map((lang) => {
      const kit = activeKits.find((k) => k.language === lang.code);
      return {
        ...lang,
        isAvailable: activeLangSet.has(lang.code),
        isSuggestedForCountry: suggestedLangCodes.includes(lang.code),
        kitId: kit?._id || null,
        pdfFilename: kit?.pdfFilename || null,
        fileSize: kit?.fileSize || null,
        uploadedAt: kit?.uploadedAt || null,
      };
    });

    // Check kits for this country (kits with isAvailable or suggested)
    let countryKits = languages.filter((l) => l.isSuggestedForCountry);
    // If specific uploaded kits exist for this country, prioritize uploaded ones
    const uploadedCountryKits = countryKits.filter((l) => l.isAvailable);
    if (uploadedCountryKits.length > 0) {
      countryKits = uploadedCountryKits;
    }

    // Default to at least English if empty
    if (countryKits.length === 0) {
      const en = languages.find((l) => l.code === "en");
      if (en) countryKits = [en];
    }

    res.status(200).json({
      success: true,
      detectedCountry: country || "Unknown",
      suggestedLanguages: suggestedLangCodes,
      hasMultipleSuggestedLanguages: countryKits.length > 1,
      hasMultipleKits: countryKits.length > 1,
      availableKitsForCountry: countryKits,
      defaultLanguage: countryKits[0]?.code || suggestedLangCodes[0] || "en",
      languages,
    });
  } catch (error) {
    console.error("Error in getAvailableKits:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUBLIC: Download media kit (Localized) ──────────────────────────────────
export const downloadMediaKit = async (req, res) => {
  try {
    const { name, email, industry, company, country, language } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    // IP detection fallback
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    const userCountry = country || req.headers["cf-ipcountry"] || "";

    // Find best localized kit
    const { kit, pdfPath, language: resolvedLang, isFallback } = await resolveBestMediaKit(
      language,
      userCountry
    );

    const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === resolvedLang) || {
      name: resolvedLang || "English",
      nativeName: "English",
    };

    // Save download request record
    const downloadRecord = await DownloadRequest.create({
      name,
      email,
      company: company || "",
      industry: industry || "",
      country: userCountry,
      language: resolvedLang,
      languageName: langInfo.name,
      mediaKitId: kit?._id || null,
      ipAddress: String(clientIp),
      status: "sent",
      downloadedAt: new Date(),
    });

    // Determine file basename and API download URL
    const actualFileName = kit?.pdfPath ? path.basename(kit.pdfPath) : (pdfPath ? path.basename(pdfPath) : "rule7_media_kit.pdf");
    const downloadUrl = `/api/v1/media-leads/file/${encodeURIComponent(actualFileName)}`;

    // ✅ Send immediate response to user (0ms wait, no connection timeout)
    res.status(200).json({
      success: true,
      message: `Media Kit (${langInfo.name}) sent to your email! Starting download...`,
      downloadUrl,
      filename: kit?.pdfFilename || `Rule7_MediaKit_${resolvedLang}.pdf`,
      language: resolvedLang,
      languageName: langInfo.name,
      isFallback,
      leadId: downloadRecord._id,
    });

    // 🔥 Fire-and-forget: Send localized email in background (never blocks user)
    setImmediate(async () => {
      try {
        const transporter = await getEmailTransporter();
        const fromAddress = await getFromAddress();
        const settings = await EmailSettings.findOne().lean();
        const adminEmail = settings?.user || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
            <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 0.5px;">Rule 7 Media</h1>
              <p style="color: #93c5fd; margin: 5px 0 0; font-size: 14px;">Global Advertising & Fleet Network</p>
            </div>
            <div style="padding: 25px; border: 1px solid #e2e8f0; border-top: none; background: #ffffff; border-radius: 0 0 8px 8px;">
              <h2 style="color: #0f172a; margin-top: 0;">Thank You, ${name}!</h2>
              <p style="font-size: 15px; line-height: 1.6;">
                Your request for the <strong>Rule 7 Media Kit (${langInfo.name} Edition)</strong> has been processed successfully.
              </p>
              ${userCountry ? `<p style="font-size: 14px; margin: 4px 0;"><strong>Country:</strong> ${userCountry}</p>` : ""}
              ${company ? `<p style="font-size: 14px; margin: 4px 0;"><strong>Company:</strong> ${company}</p>` : ""}
              ${industry ? `<p style="font-size: 14px; margin: 4px 0;"><strong>Industry:</strong> ${industry}</p>` : ""}
              <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0 0 8px; font-weight: bold; color: #1e40af;">📎 Attached Media Kit:</p>
                <p style="margin: 0; font-size: 14px; color: #475569;">
                  <strong>Language:</strong> ${langInfo.name} (${langInfo.nativeName})<br>
                  <strong>File:</strong> ${kit?.pdfFilename || "Rule7_Media_Kit.pdf"}
                </p>
              </div>
              <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0 0 5px; font-weight: bold;">Next Steps:</p>
                <ul style="margin: 5px 0 0; padding-left: 20px; font-size: 14px; color: #334155;">
                  <li>Review our high-impact vehicle wrap advertising packages</li>
                  <li>Explore decreasing-bid live auction campaigns</li>
                  <li>Connect with our media buying team for tailored rates</li>
                </ul>
              </div>
              <p style="font-size: 14px; color: #64748b; margin-top: 25px;">
                Best regards,<br>
                <strong style="color: #0f172a;">Rule 7 Media Team</strong>
              </p>
            </div>
          </div>
        `;

        // 1. Send user email (with attachment if available)
        try {
          const mailOptions = {
            from: fromAddress,
            to: email,
            subject: `Your Rule 7 Media Kit (${langInfo.name}) - Request Received`,
            html: emailHtml,
          };

          if (pdfPath && fs.existsSync(pdfPath)) {
            mailOptions.attachments = [
              {
                filename: kit?.pdfFilename || `Rule7_Media_Kit_${langInfo.name}.pdf`,
                path: pdfPath,
                contentType: "application/pdf",
              },
            ];
          }

          await transporter.sendMail(mailOptions);
          console.log(`✅ Media Kit email sent to ${email}`);
        } catch (userMailErr) {
          console.warn("⚠️ Retrying user email without attachment:", userMailErr.message);
          try {
            await transporter.sendMail({
              from: fromAddress,
              to: email,
              subject: `Your Rule 7 Media Kit (${langInfo.name}) - Request Received`,
              html: emailHtml,
            });
            console.log(`✅ Media Kit email sent without attachment to ${email}`);
          } catch (retryErr) {
            console.error("❌ Media Kit email retry failed:", retryErr.message);
          }
        }

        // 2. Notify Admin
        if (adminEmail) {
          try {
            await transporter.sendMail({
              from: fromAddress,
              to: adminEmail,
              subject: `📊 New Media Kit Download (${langInfo.name}) - ${name}`,
              html: `
                <div style="font-family: Arial, sans-serif;">
                  <h2>New Multilingual Media Kit Download Request</h2>
                  <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${name}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${email}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Language:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${langInfo.name} (${resolvedLang})</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Country:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${userCountry || "Not detected"}</td></tr>
                    ${company ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Company:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${company}</td></tr>` : ""}
                    ${industry ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Industry:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${industry}</td></tr>` : ""}
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Kit File:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${kit?.pdfFilename || "Default Kit"}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Time:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td></tr>
                  </table>
                </div>
              `,
            });
          } catch (adminMailErr) {
            console.warn("⚠️ Admin notification email warning:", adminMailErr.message);
          }
        }
      } catch (emailErr) {
        console.warn("⚠️ Media Kit background email error:", emailErr.message);
      }
    });
  } catch (error) {
    console.error("❌ Error in downloadMediaKit:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process request. Please try again.",
    });
  }
};

// ─── PUBLIC: Direct Stream/Download file endpoint ────────────────────────────
export const streamMediaKitFile = async (req, res) => {
  try {
    const { filename } = req.params;
    if (!filename) {
      return res.status(400).send("Filename is required");
    }

    const safeFilename = path.basename(filename);

    // Try all possible disk locations where the file may be
    let resolvedPath =
      findExistingPdfPath(`uploads/${safeFilename}`) ||
      findExistingPdfPath(safeFilename) ||
      findExistingPdfPath(`public/uploads/${safeFilename}`);

    // Log what we tried (helps debugging)
    if (!resolvedPath) {
      console.warn(`❌ streamMediaKitFile: file not found for "${safeFilename}"`);
      console.warn(`   Tried: uploads/${safeFilename}, public/uploads/${safeFilename}`);
      return res.status(404).json({
        success: false,
        message: `Media kit file not found: ${safeFilename}. Please re-upload the kit from admin.`,
      });
    }

    const ext = path.extname(safeFilename).toLowerCase();
    let contentType = "application/pdf";
    if (ext === ".doc") contentType = "application/msword";
    else if (ext === ".docx") contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if (ext === ".ppt") contentType = "application/vnd.ms-powerpoint";
    else if (ext === ".pptx") contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="${safeFilename}"`);
    res.setHeader("Cache-Control", "public, max-age=86400");

    
    const stream = fs.createReadStream(resolvedPath);
    stream.pipe(res);
  } catch (error) {
    console.error("❌ Error streaming media kit file:", error);
    res.status(500).send("Failed to stream file");
  }
};
// ─── ADMIN: Get all languages with their kit status for a Country ─────────────
export const getAdminLanguageKits = async (req, res) => {
  try {
    const selectedCountry = req.query.country || "Global";
    const filter = { isActive: true };
    if (selectedCountry && selectedCountry !== "all") {
      filter.country = { $regex: new RegExp(`^${selectedCountry}$`, "i") };
    }

    const allActiveKits = await MediaKit.find(filter).sort({ updatedAt: -1 });

    const languageMatrix = SUPPORTED_LANGUAGES.map((lang) => {
      const activeKit = allActiveKits.find((k) => k.language === lang.code);
      return {
        ...lang,
        country: selectedCountry,
        hasKit: !!activeKit,
        activeKit: activeKit || null,
      };
    });

    const totalActiveLanguages = languageMatrix.filter((l) => l.hasKit).length;
    const totalDownloads = await DownloadRequest.countDocuments();
    const allUniqueCountries = await MediaKit.distinct("country");

    res.status(200).json({
      success: true,
      selectedCountry,
      totalSupported: SUPPORTED_LANGUAGES.length,
      totalActiveLanguages,
      totalDownloads,
      languages: languageMatrix,
      uploadedCountries: allUniqueCountries.filter(Boolean),
    });
  } catch (error) {
    console.error("Error in getAdminLanguageKits:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN: Upload/Replace active kit for a specific Country + Language ──────
export const uploadActiveKit = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const targetCountry = (req.body.country || "Global").trim();
    const languageCode = (req.body.language || "en").toLowerCase().trim();
    const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === languageCode) || {
      code: languageCode,
      name: req.body.languageName || languageCode.toUpperCase(),
    };

    // Store clean path: "uploads/filename.ext" (forward slashes, no "public/" prefix)
    const normalizedPath = req.file.path
      .replace(/\\/g, "/")
      .replace(/^public\//, "");

    // Deactivate previous active kit for this specific country + language combo
    const oldKits = await MediaKit.find({
      country: { $regex: new RegExp(`^${targetCountry}$`, "i") },
      language: languageCode,
      isActive: true,
    });
    for (const oldKit of oldKits) {
      oldKit.isActive = false;
      await oldKit.save();
    }

    // Create new active kit for this country + language
    const newKit = await MediaKit.create({
      country: targetCountry,
      language: languageCode,
      languageName: langConfig.name,
      pdfPath: normalizedPath,
      pdfFilename: req.file.originalname,
      fileSize: req.file.size,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      message: `Media kit for ${targetCountry} (${langConfig.name}) uploaded and activated successfully`,
      kit: newKit,
    });
  } catch (error) {
    console.error("Error in uploadActiveKit:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN: Delete/Deactivate kit for a Country + Language ───────────────────
export const deleteLanguageKit = async (req, res) => {
  try {
    const { language } = req.params;
    const { country } = req.query;
    const langCode = language.toLowerCase().trim();

    const filter = { language: langCode, isActive: true };
    if (country && country !== "all") {
      filter.country = { $regex: new RegExp(`^${country}$`, "i") };
    }

    const activeKit = await MediaKit.findOne(filter);

    if (!activeKit) {
      return res.status(404).json({
        success: false,
        message: `No active media kit found for ${country || "Global"} - ${langCode}`,
      });
    }

    // Delete physical file if exists
    const validPath = findExistingPdfPath(activeKit.pdfPath);
    if (validPath && fs.existsSync(validPath)) {
      try {
        fs.unlinkSync(validPath);
      } catch (err) {
        console.warn("Could not delete file from disk:", err.message);
      }
    }

    await MediaKit.findByIdAndDelete(activeKit._id);

    res.status(200).json({
      success: true,
      country: activeKit.country,
      language: langCode,
      message: `Media kit for ${activeKit.country || "Global"} (${langCode.toUpperCase()}) deleted successfully`,
    });
  } catch (error) {
    console.error("Error in deleteLanguageKit:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN: Legacy Delete Active Kit ─────────────────────────────────────────
export const deleteActiveKit = async (req, res) => {
  try {
    const activeKit = await MediaKit.findOne({ isActive: true });
    if (!activeKit) {
      return res.status(404).json({ success: false, message: "No active kit found" });
    }

    const validPath = findExistingPdfPath(activeKit.pdfPath);
    if (validPath && fs.existsSync(validPath)) {
      try {
        fs.unlinkSync(validPath);
      } catch (err) {
        console.warn("Could not delete file from disk:", err.message);
      }
    }

    await MediaKit.findByIdAndDelete(activeKit._id);
    res.status(200).json({ success: true, message: "Kit deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN: Get single active kit (Legacy support) ───────────────────────────
export const getActiveKit = async (req, res) => {
  try {
    const { language } = req.query;
    const query = { isActive: true };
    if (language) query.language = language.toLowerCase().trim();

    const activeKit = await MediaKit.findOne(query);
    res.status(200).json({
      success: true,
      kit: activeKit,
      isActive: !!activeKit,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN: Get all download requests with search/filter & PAGINATION ────────
export const getAllDownloads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const language = req.query.language ? req.query.language.trim() : null;
    const search = req.query.search ? req.query.search.trim() : null;
    const skip = (page - 1) * limit;

    const filter = {};
    if (language && language !== "all") {
      filter.language = language.toLowerCase();
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ];
    }

    const downloads = await DownloadRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalDownloads = await DownloadRequest.countDocuments(filter);

    res.status(200).json({
      success: true,
      downloads,
      totalDownloads,
      currentPage: page,
      totalPages: Math.ceil(totalDownloads / limit) || 1,
      limit,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN: Delete download record ──────────────────────────────────────────
export const deleteDownload = async (req, res) => {
  try {
    const { id } = req.params;
    await DownloadRequest.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Download record deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN: Get kit history with pagination and language filter ──────────────
export const getKitHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const language = req.query.language ? req.query.language.trim() : null;
    const skip = (page - 1) * limit;

    const filter = {};
    if (language && language !== "all") {
      filter.language = language.toLowerCase();
    }

    const kits = await MediaKit.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalKits = await MediaKit.countDocuments(filter);

    res.status(200).json({
      success: true,
      kits,
      totalKits,
      currentPage: page,
      totalPages: Math.ceil(totalKits / limit) || 1,
      limit,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};