import Franchise from "../models/franchise.model.js";
import { getEmailTransporter, getFromAddress } from "../utils/emailTransporter.js";
import SecureSpot from '../models/SecureSpot.model.js'
import EmailSettings from "../models/emailSettings.model.js";

export const submitFranchise = async (req, res) => {
  try {
    const { firstName, lastName, email, country, state, territories, territory, background, formType, region, timeline } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !formType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (formType === "enquiry" && !country) {
      return res.status(400).json({ message: "Country is required for enquiry" });
    }
    if (formType === "franchise_kit" && !territory) {
      return res.status(400).json({ message: "Territory is required for franchise kit" });
    }
    if (formType === "franchisefaq" && (!country || !state || !territories)) {
      return res.status(400).json({ message: "Country, state, and territories are required for FAQ form" });
    }
    if (formType === "risk_mitigation_inquiry" && (!region || !timeline)) {
      return res.status(400).json({ message: "Region and timeline are required for risk mitigation inquiry" });
    }

    const newEntry = await Franchise.create({
      firstName,
      lastName,
      email,
      country,
      state,
      territories,
      territory,
      background,
      region,
      timeline,
      formType,
    });
const settings = await EmailSettings.findOne().lean();


    const adminEmail = settings.user;
    const userEmail = email;

    let adminSubject = "";
    let adminHtml = "";
    let userSubject = "";
    let userHtml = "";

    // Format Territory for email subject and body
    const targetTerritory = territory || (territories ? `${territories} Territories` : "") || region || (state && country ? `${state}, ${country}` : "") || state || country || "Your Territory";

    // Common User Auto Email for All Franchise Forms
    userSubject = `Your Rule 7 Media Franchise Enquiry — Next Steps for ${targetTerritory}`;
    userHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Rule 7 Media Franchise Enquiry</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #e2e8f0; line-height: 1.6;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0a0a0a; padding: 20px 10px;">
          <tr>
            <td align="center">
              <div style="max-width: 600px; width: 100%; margin: 0 auto; background: #111827; border-radius: 16px; border: 1px solid #1f2937; overflow: hidden; text-align: left; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
                
                <!-- Brand Header -->
                <div style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 30px 25px; text-align: center; border-bottom: 1px solid #374151;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; color: #ffffff;">RULE 7 MEDIA</h1>
                  <p style="margin: 6px 0 0 0; font-size: 13px; color: #f43f5e; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Franchise Allocations</p>
                </div>

                <!-- Email Body -->
                <div style="padding: 30px 25px;">
                  <h2 style="font-size: 18px; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Hello ${firstName},</h2>
                  
                  <p style="color: #cbd5e1; font-size: 14px; line-height: 1.7; margin-bottom: 14px;">
                    Thank you for requesting the Rule 7 Media Franchise Kit for <strong>${targetTerritory}</strong>.
                  </p>
                  
                  <p style="color: #cbd5e1; font-size: 14px; line-height: 1.7; margin-bottom: 14px;">
                    We are currently receiving a high level of interest in selected franchise territories and are now prioritising the strongest candidates for the next stage of review. As each territory is limited, we are moving quickly to identify applicants who have the experience, capacity and commitment to progress.
                  </p>
                  
                  <p style="color: #cbd5e1; font-size: 14px; line-height: 1.7; margin-bottom: 14px;">
                    If you believe you are well suited to operate a Rule 7 Media franchise in <strong>${targetTerritory}</strong>, please reply within <strong>48 hours</strong> to <a href="mailto:franchiseallocations@rule7media.com" style="color: #f43f5e; text-decoration: underline; font-weight: 600;">franchiseallocations@rule7media.com</a> with the following information so we can assess your suitability and determine whether to move your enquiry forward:
                  </p>
                  
                  <p style="color: #cbd5e1; font-size: 14px; line-height: 1.7; margin-bottom: 14px;">
                    We also recognise that strong franchise operators do not always come from a traditional sales or marketing background. Rule 7 Media provides full support, proven systems and guidance; however, drive, determination, attention to detail and the ability to follow a structured process are equally important qualities we look for in suitable candidates.
                  </p>
                  
                  <!-- Criteria List -->
                  <div style="background: #1f2937; border-left: 4px solid #f43f5e; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
                    <ul style="margin: 0; padding-left: 18px; color: #f1f5f9; font-size: 14px; line-height: 1.8;">
                      <li style="margin-bottom: 8px;">Relevant business, sales, marketing, media, advertising, franchising or management experience.</li>
                      <li style="margin-bottom: 8px;">Any qualifications, licences, industry knowledge or commercial background that may support your application.</li>
                      <li style="margin-bottom: 8px;">The number of hours per week you can realistically commit to developing the territory.</li>
                      <li style="margin-bottom: 0;">Your expected timeframe for making a decision if invited to progress.</li>
                    </ul>
                  </div>
                  
                  <p style="color: #cbd5e1; font-size: 14px; line-height: 1.7; margin-bottom: 14px;">
                    Please note that submitting this information does not guarantee approval. It allows us to shortlist candidates who appear most aligned with the opportunity before available territories are allocated or placed on hold.
                  </p>
                  
                  <p style="color: #cbd5e1; font-size: 14px; line-height: 1.7; margin-bottom: 24px;">
                    In the interim you may want to browse our <a href="https://www.rule7media.com/franchise-faq" target="_blank" style="color: #f43f5e; text-decoration: underline; font-weight: 600;">Franchise FAQ section</a> to understand the pitfalls and benefits of undertaking a franchise opportunity.
                  </p>
                  
                  <p style="color: #cbd5e1; font-size: 14px; line-height: 1.7; margin-bottom: 20px;">
                    We look forward to receiving your response and will review suitable replies as a priority.
                  </p>
                  
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #374151; color: #94a3b8; font-size: 14px;">
                    Regards,<br/>
                    <strong style="color: #ffffff;">Rule 7 Media Franchise Team</strong><br/>
                    <a href="mailto:franchiseallocations@rule7media.com" style="color: #f43f5e; font-size: 13px; text-decoration: none;">franchiseallocations@rule7media.com</a> <br/><span style="
  display: inline-block;
  width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  color: #ffffff;
  font-size: 16px;
  margin-top: 8px;
">🌐</span> <a href="https://www.rule7media.com" style="color: #94a3b8; font-size: 13px; text-decoration: none;">Rule7media.com</a>
                  </div>
                </div>

                <!-- Footer -->
                <div style="background: #0b0f19; padding: 18px 25px; text-align: center; border-top: 1px solid #1f2937; font-size: 12px; color: #64748b;">
                  © ${new Date().getFullYear()} Rule 7 Media. All rights reserved.
                </div>

              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    if (formType === "enquiry") {
      adminSubject = `New Franchise Enquiry – Rule7Media (${targetTerritory})`;
      adminHtml = `
        <h2>New Franchise Enquiry from ${firstName} ${lastName}</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>Territory / Area:</strong> ${targetTerritory}</p>
        <p><strong>Form Type:</strong> Enquiry</p>
      `;
    } 
    else if (formType === "franchise_kit") {
      adminSubject = `New Franchise Kit Request – Rule7Media (${targetTerritory})`;
      adminHtml = `
        <h2>Franchise Kit Request</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Territory:</strong> ${territory}</p>
        <p><strong>Background:</strong> ${background || 'N/A'}</p>
      `;
    }
    else if (formType === "franchisefaq") {
      adminSubject = `New Franchise FAQ Submission – Rule7Media (${targetTerritory})`;
      adminHtml = `
        <h2>FAQ Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>State/Area:</strong> ${state}</p>
        <p><strong>Territories:</strong> ${territories}</p>
      `;
    }
    else if (formType === "risk_mitigation_inquiry") {
      adminSubject = `New Risk Mitigation Inquiry – Rule7Media (${targetTerritory})`;
      adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #e11d48; border-bottom: 2px solid #e11d48; padding-bottom: 10px;">⚠️ Risk Mitigation Inquiry</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr><td style="padding: 8px 0;"><strong>First Name:</strong></td><td>${firstName}</td></tr>
            <tr><td style="padding: 8px 0;"><strong>Last Name:</strong></td><td>${lastName}</td></tr>
            <tr><td style="padding: 8px 0;"><strong>Professional Email:</strong></td><td>${email}</td></tr>
            <tr><td style="padding: 8px 0;"><strong>Target Region:</strong></td><td>${region || targetTerritory}</td></tr>
            <tr><td style="padding: 8px 0;"><strong>Investment Timeline:</strong></td><td>${timeline}</td></tr>
          </table>
        </div>
      `;
    }


    // ✅ Respond immediately — don't block on email sending (prevents connection timeout)
    res.status(201).json({
      success: true,
      message: `${formType} submitted successfully`,
      data: newEntry,
    });

    // 🔥 Fire-and-forget: send emails in background after responding
    setImmediate(async () => {
      try {
        const transporter = await getEmailTransporter();
        const fromAddress = await getFromAddress();

        // Send to admin
        if (adminSubject && adminHtml) {
          await transporter.sendMail({
            from: fromAddress,
            to: adminEmail,
            subject: adminSubject,
            html: adminHtml,
          });
        }

        // Send to user
        if (userSubject && userHtml) {
          try {
            await transporter.sendMail({
              from: fromAddress,
              to: userEmail,
              subject: userSubject,
              html: userHtml,
            });
          } catch (userEmailErr) {
            console.error("⚠️ User franchise email failed:", userEmailErr.message);
          }
        }
      } catch (emailErr) {
        console.error("⚠️ Franchise background email error:", emailErr.message);
      }
    });

} catch (error) {
   if (error.code === "EAUTH") {
    return res.status(500).json({
      success: false,
      message: "Invalid SMTP credentials. Please check your SMTP email and password.",
    });
  }

  return res.status(500).json({
    success: false,
    message: error.message || "Something went wrong",
  });
}}

// AI CRM use karega — status automatically update karne ke liye
export const updateFranchiseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["new", "contacted", "qualified", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await Franchise.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Lead not found" });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const sendManualEmail = async (req, res) => {
  const { to, subject, body } = req.body;
  await transporter.sendMail({
    from: `"Rule7Media" <${process.env.EMAIL_USER}>`,
    to, subject,
    text: body,
  });
  res.status(200).json({ success: true });
};
export const getFranchises = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { formType, search } = req.query;
    let filter = {};
    if (formType && formType !== 'all') filter.formType = formType;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await Franchise.countDocuments(filter);
    const data = await Franchise.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.status(200).json({
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteFranchise = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Franchise.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



export const createSecureSpot = async (req, res) => {
  try {
    const { businessName, email, country } = req.body;

    // ✅ Validation
    if (!businessName || !email) {
      return res.status(400).json({ message: "Business name and email are required" });
    }

    // ✅ Duplicate check
    const existing = await SecureSpot.findOne({ email });
    if (existing) {
      return res.status(400).json({
        message: "You have already secured a spot",
      });
    }

    // ✅ Save in DB
    const newLead = await SecureSpot.create({
      businessName,
      email,
      country,
    });
const settings = await EmailSettings.findOne().lean();
    // ✅ Admin email
    const adminEmail = settings.user;;

    // ✅ Common Email Template
    const emailTemplate = (title, content) => `
      <div style="font-family: Arial, sans-serif; background:#0a0a0a; color:#fff; padding:30px;">
        <div style="max-width:600px; margin:auto; background:#111; border-radius:12px; overflow:hidden; border:1px solid #222;">
          
          <div style="background:#f59e0b; padding:20px; text-align:center;">
            <h1 style="margin:0; color:#000;">Rule7Media</h1>
          </div>

          <div style="padding:30px;">
            <h2 style="color:#f59e0b;">${title}</h2>

            ${content}

            <hr style="border:0; border-top:1px solid #333; margin:30px 0;" />

            <p style="font-size:12px; color:#aaa;">
              © 2026 Rule7Media. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `;

    // ✅ USER EMAIL CONFIG
    const userMail = {
      from: `"Rule7Media" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🚀 Your Spot is Reserved - Rule7Media",
      html: emailTemplate(
        `Hello ${businessName},`,
        `
        <p>Your <b>30-Mile (50 kms) territory</b> has been successfully secured.</p>
        
        <p><b>Country:</b> ${country || "N/A"}</p>

        <p>
          You are now part of our <b>Elite Network</b> connecting advertisers and fleet owners globally.
        </p>

        <div style="margin-top:20px; padding:15px; background:#f59e0b10; border:1px solid #f59e0b30; border-radius:8px;">
          <b>What’s Next?</b>
          <ul>
            <li>Our team will review your request</li>
            <li>You’ll receive onboarding details</li>
            <li>Start getting high-value leads</li>
          </ul>
        </div>

        <p style="margin-top:20px;">We’ll contact you shortly.</p>
        `
      ),
    };

    // ✅ ADMIN EMAIL CONFIG
    const adminMail = {
      from: `"Rule7Media" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: "🔥 New Secure Spot Lead - Rule7Media",
      html: emailTemplate(
        "New Lead Received",
        `
        <p><b>Business Name:</b> ${businessName}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Country:</b> ${country || "N/A"}</p>

        <div style="margin-top:20px; padding:15px; background:#10b98110; border:1px solid #10b98130; border-radius:8px;">
          🚀 A new user has secured their territory.
        </div>
        `
      ),
    };

    // ✅ Send emails in parallel (better performance)
    await Promise.all([
      transporter.sendMail(userMail),
      transporter.sendMail(adminMail),
    ]);

    // ✅ Response
    res.status(201).json({
      success: true,
      message: "Spot secured & email sent successfully",
      data: newLead,
    });

  } catch (err) {
    console.error("Secure Spot Error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while securing spot",
    });
  }
};