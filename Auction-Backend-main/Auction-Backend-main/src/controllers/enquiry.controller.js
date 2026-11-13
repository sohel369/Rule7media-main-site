import Enquiry from '../models/enquiry.model.js';
import dotenv from 'dotenv';
import { getEmailTransporter, getFromAddress } from '../utils/emailTransporter.js';

dotenv.config();
const getCountryCode = (countryName) => {
  if (!countryName) return null;
  
  const countryVariations = {
    'UNITED STATES': 'US',
    'USA': 'US',
    'US': 'US',
    'AMERICA': 'US',
    'INDIA': 'IN',
    'CANADA': 'CA',
    'AUSTRALIA': 'AU',
    'UNITED KINGDOM': 'GB',
    'UK': 'GB',
    'ENGLAND': 'GB',
    'BRITAIN': 'GB'
  };
  
  const normalizedName = countryName.toUpperCase().trim();
  if (countryVariations[normalizedName]) {
    return countryVariations[normalizedName];
  }
  
  const firstTwoLetters = normalizedName.slice(0, 2);
  return firstTwoLetters;
};

const sendAdminEmail = async (enquiryData) => {
  const { firstName, surname, company, email, country, industry } = enquiryData;
  
  let transporter;
  let fromAddress;
  try {
    transporter = await getEmailTransporter();
    fromAddress = await getFromAddress();
  } catch (error) {
    console.error('Error creating email transporter:', error);
    return { success: false, error: error.message };
  }
  
  const mailOptions = {
    from: fromAddress,
    to: fromAddress,
    replyTo: email,
    subject: `🌍 New Enquiry from ${country} - Rule 7 Media`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
        <title>New Enquiry - Rule 7 Media</title>
        <style>
          @media only screen and (max-width: 480px) {
            .container { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
            .inner-padding { padding: 20px 15px !important; }
            .grid-2col { grid-template-columns: 1fr !important; }
            .grid-label { font-size: 12px !important; }
            .grid-value { font-size: 14px !important; }
            .badge { padding: 6px 15px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0a;">
        
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0a0a0a;">
          <tr>
            <td align="center" style="padding: 10px;">
              
              <div class="container" style="max-width: 560px; width: 100%; margin: 10px auto; background: #111111; border-radius: 24px; overflow: hidden; border: 1px solid #2a2a2a;">
                
                <!-- Header -->
                <div style="padding: 35px 25px 20px 25px; text-align: center; border-bottom: 1px solid #2a2a2a;">
                  <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(145deg, #2a2a2a, #1a1a1a); border-radius: 16px; margin-bottom: 15px;">
                    <span style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 28px; font-weight: 800; color: #ffffff;">R7</span>
                  </div>
                  <h1 style="margin: 0; font-size: 28px; color: #ffffff;">RULE 7 MEDIA</h1>
                  <p style="margin: 8px 0 0 0; font-size: 14px; color: #9ca3af;">New Business Enquiry</p>
                </div>
                
                <!-- Country Badge -->
                <div style="padding: 20px 25px 0 25px;">
                  <div class="badge" style="background: #1f1f1f; border-radius: 100px; padding: 8px 20px; display: inline-block; border: 1px solid #333;">
                    <span style="font-size: 14px; color: #9ca3af;">📍 Enquiry from </span>
                    <span style="font-size: 16px; font-weight: 600; color: #22c55e;">${country}</span>
                  </div>
                </div>
                
                <!-- Details Card -->
                <div class="inner-padding" style="padding: 20px 25px;">
                  <div style="background: #0f0f0f; border-radius: 20px; padding: 25px; border: 1px solid #2a2a2a;">
                    
                    <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #ffffff; display: flex; align-items: center;">
                      <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; margin-right: 10px;"></span>
                      Enquiry Details
                    </h2>
                    
                    <!-- Responsive Grid -->
                    <div class="grid-2col" style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px;">
                      <div class="grid-label" style="color: #9ca3af; font-size: 14px;">Full Name</div>
                      <div class="grid-value" style="color: #ffffff; font-size: 16px; font-weight: 500;">${firstName} ${surname}</div>
                      
                      <div style="color: #9ca3af; font-size: 14px;">Company</div>
                      <div style="color: #ffffff; font-size: 16px;">${company}</div>
                      
                      <div style="color: #9ca3af; font-size: 14px;">Industry</div>
                      <div style="color: #ffffff; font-size: 16px;">${industry}</div>
                      
                      <div style="color: #9ca3af; font-size: 14px;">Email</div>
                      <div style="color: #ffffff; font-size: 16px;">
                        <a href="mailto:${email}" style="color: #22c55e; text-decoration: none;">${email}</a>
                      </div>
                      
                      <div style="color: #9ca3af; font-size: 14px;">Country</div>
                      <div style="color: #ffffff; font-size: 16px;">${country}</div>
                      
                      <div style="color: #9ca3af; font-size: 14px;">State/Region</div>
                      <div style="color: #ffffff; font-size: 16px;">${enquiryData.state || 'N/A'}</div>
                    </div>
                    
                    <!-- Sender Info -->
                    <div style="margin-top: 20px; padding: 12px; background: #1a1a1a; border-radius: 8px;">
                      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                        <span style="font-size: 14px;">📧</span> Sent via: <span style="color: #22c55e;">${fromAddress}</span>
                      </p>
                    </div>
                    
                    <!-- Action Button -->
                    <div style="margin-top: 25px; text-align: center;">
                      <a href="mailto:${email}" style="background: #1f1f1f; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 40px; font-size: 14px; font-weight: 600; display: inline-block; border: 1px solid #333;">
                        <span style="font-size: 16px;">✉️</span> Reply to ${firstName}
                      </a>
                    </div>
                    
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="padding: 25px; background: #0a0a0a; border-top: 1px solid #2a2a2a; text-align: center;">
                 
                  <p style="margin: 0; font-size: 12px; color: #6b7280;">© ${new Date().getFullYear()} Rule 7 Media</p>
                </div>
                
              </div>
              
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendUserConfirmationEmail = async (enquiryData) => {
  const { firstName, email, country } = enquiryData;
  
  let transporter;
  let fromAddress;
  try {
    transporter = await getEmailTransporter();
    fromAddress = await getFromAddress();
  } catch (error) {
    console.error('Error creating email transporter:', error);
    return { success: false, error: error.message };
  }
  
  const mailOptions = {
    from: fromAddress,
    to: email,
    subject: `Thank you for your enquiry - Rule 7 Media`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Thank You - Rule 7 Media</title>
        <style>
          /* Mobile-specific styles */
          @media only screen and (max-width: 480px) {
            .container {
              width: 100% !important;
              margin: 0 !important;
              border-radius: 0 !important;
            }
            .inner-padding {
              padding: 20px 15px !important;
            }
            .logo {
              width: 50px !important;
              height: 50px !important;
            }
            .logo-text {
              font-size: 24px !important;
            }
            h1 {
              font-size: 24px !important;
            }
            h2 {
              font-size: 20px !important;
            }
            .profile-circle {
              width: 45px !important;
              height: 45px !important;
            }
            .profile-emoji {
              font-size: 20px !important;
            }
            .step-circle {
              width: 22px !important;
              height: 22px !important;
              font-size: 13px !important;
            }
            .step-text {
              font-size: 14px !important;
            }
            .step-desc {
              font-size: 12px !important;
            }
            .footer-links {
              flex-wrap: wrap !important;
              gap: 15px !important;
            }
            .social-icon {
              font-size: 18px !important;
            }
          }
          
          /* Outlook-specific fixes */
          .ExternalClass, .ReadMsgBody {
            width: 100%;
            background-color: #0a0a0a;
          }
          
          /* Responsive table fix */
          table {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
          }
          
          img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0a; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
        
        <!-- Outlook Background Color Fix -->
        <table width="100%" height="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0a0a0a; width: 100%; height: 100%;">
          <tr>
            <td align="center" valign="top" style="padding: 10px;">
              
              <!-- Main Container - Responsive -->
              <div class="container" style="max-width: 560px; width: 100%; margin: 10px auto; background: #111111; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.6); border: 1px solid #2a2a2a;">
                
                <!-- Header with Logo -->
                <div style="padding: 35px 25px 20px 25px; text-align: center; border-bottom: 1px solid #2a2a2a;">
                  <div class="logo" style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(145deg, #2a2a2a, #1a1a1a); border-radius: 16px; margin-bottom: 15px; box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.5);">
                    <span class="logo-text" style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 28px; font-weight: 800; color: #ffffff;">R7</span>
                  </div>
                  <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; color: #ffffff; line-height: 1.2;">RULE 7 MEDIA</h1>
                  <p style="margin: 8px 0 0 0; font-size: 14px; color: #9ca3af; font-weight: 400;">Thank You for Reaching Out</p>
                </div>
                
                <!-- Main Content -->
                <div class="inner-padding" style="padding: 30px 25px;">
                  
                  <!-- Welcome Card -->
                  <div style="background: #0f0f0f; border-radius: 20px; padding: 25px; border: 1px solid #2a2a2a; margin-bottom: 25px;">
                    
                    <!-- Profile Section - Mobile Optimized -->
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                      <div class="profile-circle" style="width: 50px; height: 50px; background: #1f1f1f; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #22c55e;">
                        <span class="profile-emoji" style="font-size: 24px;">👋</span>
                      </div>
                      <div style="flex: 1; min-width: 150px;">
                        <h2 style="margin: 0; font-size: 22px; font-weight: 600; color: #ffffff; line-height: 1.2;">Hello ${firstName}!</h2>
                        <p style="margin: 4px 0 0 0; font-size: 14px; color: #22c55e; font-weight: 500;">from ${country}</p>
                      </div>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #d1d5db; margin: 0 0 20px 0;">
                      Thank you for your interest in <strong style="color: #ffffff;">Rule 7 Media</strong>. We have received your enquiry and our global team will get back to you within <strong style="color: #22c55e;">24-48 hours</strong>.
                    </p>
                    
                    <!-- Next Steps Section - Mobile Optimized -->
                    <div style="background: #1a1a1a; border-radius: 16px; padding: 20px; margin-top: 25px;">
                      <h3 style="margin: 0 0 20px 0; font-size: 16px; color: #ffffff; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 20px;">📋</span> What happens next?
                      </h3>
                      
                      <!-- Step 1 -->
                      <div style="display: flex; gap: 12px; margin-bottom: 20px; align-items: flex-start;">
                        <div class="step-circle" style="width: 24px; height: 24px; background: #2a2a2a; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #22c55e; font-size: 14px; font-weight: bold; flex-shrink: 0;">1</div>
                        <div style="flex: 1;">
                          <p class="step-text" style="margin: 0; color: #ffffff; font-size: 15px; font-weight: 500;">Review Requirements</p>
                          <p class="step-desc" style="margin: 4px 0 0 0; color: #9ca3af; font-size: 13px; line-height: 1.5;">Our team will carefully analyze your business needs</p>
                        </div>
                      </div>
                      
                      <!-- Step 2 -->
                      <div style="display: flex; gap: 12px; margin-bottom: 20px; align-items: flex-start;">
                        <div class="step-circle" style="width: 24px; height: 24px; background: #2a2a2a; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #22c55e; font-size: 14px; font-weight: bold; flex-shrink: 0;">2</div>
                        <div style="flex: 1;">
                          <p class="step-text" style="margin: 0; color: #ffffff; font-size: 15px; font-weight: 500;">Schedule Consultation</p>
                          <p class="step-desc" style="margin: 4px 0 0 0; color: #9ca3af; font-size: 13px; line-height: 1.5;">We'll arrange a call to discuss your marketing goals</p>
                        </div>
                      </div>
                      
                      <!-- Step 3 -->
                      <div style="display: flex; gap: 12px; align-items: flex-start;">
                        <div class="step-circle" style="width: 24px; height: 24px; background: #2a2a2a; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #22c55e; font-size: 14px; font-weight: bold; flex-shrink: 0;">3</div>
                        <div style="flex: 1;">
                          <p class="step-text" style="margin: 0; color: #ffffff; font-size: 15px; font-weight: 500;">Platform Demo</p>
                          <p class="step-desc" style="margin: 4px 0 0 0; color: #9ca3af; font-size: 13px; line-height: 1.5;">Experience our decreasing-bid auction platform</p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Contact Info Card -->
                    <div style="margin-top: 25px; padding: 16px; background: #1f1f1f; border-radius: 12px; border-left: 4px solid #22c55e;">
                      <p style="margin: 0; color: #d1d5db; font-size: 14px; line-height: 1.5;">
                        <span style="color: #22c55e; font-weight: 500;">📧</span> In the meantime, if you have any questions, feel free to reply to this email. Our team is here to help!
                      </p>
                    </div>
                    
                    <!-- Quick Stats -->
                    <div style="margin-top: 25px; display: flex; gap: 15px; justify-content: space-around; flex-wrap: wrap;">
                      <div style="text-align: center; background: #1a1a1a; padding: 12px; border-radius: 12px; flex: 1; min-width: 80px;">
                        <div style="font-size: 20px; color: #22c55e; margin-bottom: 4px;">⏱️</div>
                        <div style="color: #ffffff; font-size: 14px; font-weight: 600;">24-48h</div>
                        <div style="color: #9ca3af; font-size: 11px;">Response Time</div>
                      </div>
                      <div style="text-align: center; background: #1a1a1a; padding: 12px; border-radius: 12px; flex: 1; min-width: 80px;">
                        <div style="font-size: 20px; color: #22c55e; margin-bottom: 4px;">🌍</div>
                        <div style="color: #ffffff; font-size: 14px; font-weight: 600;">Global</div>
                        <div style="color: #9ca3af; font-size: 11px;">Coverage</div>
                      </div>
                      <div style="text-align: center; background: #1a1a1a; padding: 12px; border-radius: 12px; flex: 1; min-width: 80px;">
                        <div style="font-size: 20px; color: #22c55e; margin-bottom: 4px;">🤝</div>
                        <div style="color: #ffffff; font-size: 14px; font-weight: 600;">Expert</div>
                        <div style="color: #9ca3af; font-size: 11px;">Support</div>
                      </div>
                    </div>
                    
                  </div>
                  
                </div>
                
                <!-- Footer - Mobile Optimized -->
                <div style="padding: 25px; background: #0a0a0a; border-top: 1px solid #2a2a2a; text-align: center;">
            
                  
                  <!-- Text links as fallback -->
                  <div style="margin-bottom: 15px; font-size: 12px;">
                    <a href="https://www.facebook.com/rule7media" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Facebook</a> 
                    <span style="color: #374151;">|</span>
                    <a href="https://www.instagram.com/rule.7media" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Instagram</a> 
                    <span style="color: #374151;">|</span>
                    <a href="https://www.youtube.com/@Rule7Media" style="color: #6b7280; text-decoration: none; margin: 0 8px;">YouTube</a>
                  </div>
                  
                  <p style="margin: 0 0 5px 0; font-size: 12px; color: #6b7280; line-height: 1.5;">© ${new Date().getFullYear()} Rule 7 Media. All rights reserved.</p>
                  <p style="margin: 0; font-size: 11px; color: #4b5563;">Empowering global advertising through collaboration.</p>
                  
                  <!-- Country Info -->
                  <p style="margin: 15px 0 0 0; font-size: 10px; color: #374151;">
                    This enquiry was processed for <span style="color: #6b7280;">${country}</span> via <span style="color: #6b7280;">${senderDetails.email}</span>
                  </p>
                </div>
                
              </div>
              
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending user email:`, error.message);
    return { success: false, error: error.message };
  }
};

export const submitEnquiry = async (req, res) => {
  try {
    const enquiryData = req.body;
    
    const countryCode = getCountryCode(enquiryData.country);

    const enquiry = new Enquiry({
      ...enquiryData,
      countryCode: countryCode || 'DEFAULT',
      emailUsed: 'dynamic-smtp'
    });
    
    await enquiry.save();
    
    let emailResults = {
      admin: { success: false },
      user: { success: false }
    };
    
    try {
      emailResults.admin = await sendAdminEmail(enquiryData);
    } catch (error) {
      console.error('Admin email error:', error);
    }
    try {
      emailResults.user = await sendUserConfirmationEmail(enquiryData);
    } catch (error) {
      console.error('User email error:', error);
    }
    const message = emailResults.admin.success && emailResults.user.success
      ? 'Enquiry submitted successfully with email notifications'
      : 'Enquiry saved successfully (email notifications partially sent)';
    
    res.status(201).json({
      success: true,
      message: message,
      data: {
        id: enquiry._id,
        country: enquiryData.country,
        countryCode: countryCode || 'DEFAULT',
        emailUsed: 'dynamic-smtp'
      },
      emailStatus: {
        admin: emailResults.admin.success,
        user: emailResults.user.success
      }
    });
    
  } catch (error) {
    console.error('❌ Enquiry submission error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error submitting enquiry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all enquiries
export const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching enquiries'
    });
  }
};

// @desc    Update enquiry status
export const updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: enquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating enquiry'
    });
  }
};

export const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: enquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching enquiry'
    });
  }
};