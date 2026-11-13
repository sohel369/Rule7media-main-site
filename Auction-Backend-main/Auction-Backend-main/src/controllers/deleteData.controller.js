// controllers/deleteData.controller.js
import User from '../models/user.model.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEmailTransporter, getFromAddress } from '../utils/emailTransporter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// ✅ Email Template Function
const sendDeleteDataOTPEmail = async (email, otp) => {
    const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Data Deletion OTP</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 40px 30px;
                }
                .otp-box {
                    background: #f8f9fa;
                    border: 2px dashed #667eea;
                    border-radius: 10px;
                    padding: 20px;
                    text-align: center;
                    margin: 20px 0;
                }
                .otp-code {
                    font-size: 48px;
                    font-weight: bold;
                    color: #667eea;
                    letter-spacing: 10px;
                    font-family: monospace;
                }
                .warning-box {
                    background: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 5px;
                }
                .footer {
                    background: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #6c757d;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⚠️ DATA DELETION REQUEST</h1>
                    <p>Critical Action Required</p>
                </div>
                <div class="content">
                    <p>Dear Admin,</p>
                    <p>You have requested to <strong>delete ALL data</strong> from the database.</p>
                    
                    <div class="otp-box">
                        <div style="font-size: 14px; color: #666; margin-bottom: 10px;">Your Verification OTP is:</div>
                        <div class="otp-code">${otp}</div>
                        <div style="font-size: 12px; color: #666; margin-top: 10px;">Valid for 10 minutes</div>
                    </div>
                    
                    <div class="warning-box">
                        <strong>⚠️ WARNING:</strong><br>
                        • This will delete ALL data from ALL collections<br>
                        • Collections and indexes will remain intact<br>
                        • This action is IRREVERSIBLE<br>
                        • Only proceed if you are absolutely sure
                    </div>
                    
                    <p>If you did not request this, please ignore this email and secure your account immediately.</p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        const transporter = await getEmailTransporter();
        const fromAddress = await getFromAddress();
        await transporter.sendMail({
            from: fromAddress,
            to: email,
            subject: '🔐 [URGENT] Data Deletion Verification OTP',
            html: emailTemplate
        });
        return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, message: error.message };
    }
};

// Generate 6-digit OTP (as string)
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Get all models dynamically
const getAllModels = async () => {
    const modelsPath = path.join(__dirname, '../models');
    const models = [];
    
    try {
        const modelFiles = fs.readdirSync(modelsPath).filter(file => 
            file.endsWith('.js') && file !== 'otp.model.js'
        );
        
        for (const file of modelFiles) {
            try {
                const module = await import(`file://${path.join(modelsPath, file)}`);
                const model = module.default;
                if (model && model.modelName && typeof model.deleteMany === 'function') {
                    models.push({
                        name: model.modelName,
                        model: model,
                        collection: model.collection.collectionName
                    });
                }
            } catch (err) {
                console.error(`Error loading model ${file}:`, err.message);
            }
        }
    } catch (error) {
        console.error('Error reading models directory:', error);
    }
    
    return models;
};

// ✅ Helper function to check if user is admin
const checkIsAdmin = async (email) => {
    const user = await User.findOne({ email });
    
    if (!user) {
        return { isAdmin: false, user: null, reason: 'User not found' };
    }
    
    const isAdminByUserType = user.userType === 'admin';
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const isAdminByEmailList = adminEmails.includes(email);
    const isAdmin = isAdminByUserType || isAdminByEmailList;
    
    return { 
        isAdmin, 
        user: isAdmin ? user : null,
        reason: !isAdmin ? 'You are not an admin' : null
    };
};

// ✅ 1. SEND OTP
export const sendDeletionOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        const { isAdmin, user, reason } = await checkIsAdmin(email);
       
        
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: '❌ You are not authorized to perform this action. Only admin  can delete all data.',
                errorType: 'UNAUTHORIZED_ADMIN'
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email address'
            });
        }

        const otp = generateOTP();
        
        
        // ✅ Store OTP as string
        user.resetOtp = otp;
        user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        const emailResult = await sendDeleteDataOTPEmail(email, otp);
        
        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP email. Please try again.'
            });
        }

        return res.status(200).json({
            success: true,
            message: `✅ OTP has been sent successfully to ${email}`,
            email: email,
            userId: user._id,
            expiresIn: 600,
            isAdmin: true
        });

    } catch (error) {
        console.error('Send OTP Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};

// ✅ 2. RESEND OTP
export const resendDeletionOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const { isAdmin, user } = await checkIsAdmin(email);
        
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: '❌ You are not authorized to perform this action.'
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const otp = generateOTP();
        
        
        user.resetOtp = otp;
        user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        const emailResult = await sendDeleteDataOTPEmail(email, otp);
        
        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to resend OTP'
            });
        }

        return res.status(200).json({
            success: true,
            message: `✅ New OTP sent to ${email}`,
            email: email,
            expiresIn: 600
        });

    } catch (error) {
        console.error('Resend OTP Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error resending OTP'
        });
    }
};

// ✅ 3. VERIFY OTP - Fixed comparison
export const verifyDeletionOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid 6-digit OTP'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }



        if (!user.resetOtp) {
            return res.status(400).json({
                success: false,
                message: 'No OTP requested. Please request OTP first.'
            });
        }

        if (Date.now() > user.resetOtpExpires) {
            user.resetOtp = null;
            user.resetOtpExpires = null;
            await user.save();
            
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new OTP.'
            });
        }

        // ✅ Fixed: Convert both to string for comparison
        if (String(user.resetOtp) !== String(otp)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP. Please try again.'
            });
        }

        const deletionToken = Buffer.from(`${email}:${Date.now()}:DELETE_DATA`).toString('base64');
        
        user.resetToken = deletionToken;
        user.resetTokenExpire = Date.now() + 5 * 60 * 1000;
        user.resetOtp = null; // Clear OTP after verification
        user.resetOtpExpires = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: '✅ OTP verified successfully! Proceed to delete data.',
            deletionToken: deletionToken,
            userId: user._id
        });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error verifying OTP'
        });
    }
};

// ✅ 4. DELETE ALL DATA
export const deleteAllData = async (req, res) => {
    try {
        const { deletionToken, confirmText, email } = req.body;

        if (!deletionToken || !email) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        if (confirmText !== 'DELETE_ALL_DATA') {
            return res.status(400).json({
                success: false,
                message: 'Please type "DELETE_ALL_DATA" to confirm deletion'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.resetToken || user.resetToken !== deletionToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid deletion token. Please request OTP again.'
            });
        }

        if (Date.now() > user.resetTokenExpire) {
            user.resetToken = null;
            user.resetTokenExpire = null;
            await user.save();
            
            return res.status(401).json({
                success: false,
                message: 'Deletion token expired. Please request OTP again.'
            });
        }

        const models = await getAllModels();
        const results = [];
        let totalDeleted = 0;

        for (const modelInfo of models) {
            try {
                let deletedCount = 0;
                
                if (modelInfo.name === 'User') {
                    const result = await modelInfo.model.deleteMany({ 
                        _id: { $ne: user._id } 
                    });
                    deletedCount = result.deletedCount;
                    results.push({
                        model: modelInfo.name,
                        collection: modelInfo.collection,
                        deletedCount: deletedCount,
                        status: 'success',
                        note: deletedCount > 0 ? `${deletedCount} users deleted (admin kept)` : 'No other users found'
                    });
                } else {
                    const result = await modelInfo.model.deleteMany({});
                    deletedCount = result.deletedCount;
                    results.push({
                        model: modelInfo.name,
                        collection: modelInfo.collection,
                        deletedCount: deletedCount,
                        status: 'success'
                    });
                }
                
                totalDeleted += deletedCount;
              
                
            } catch (error) {
                results.push({
                    model: modelInfo.name,
                    error: error.message,
                    status: 'failed'
                });
                console.error(`❌ Error clearing ${modelInfo.name}:`, error.message);
            }
        }

        user.resetToken = null;
        user.resetTokenExpire = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: `✅ Successfully deleted ${totalDeleted} documents from all collections!`,
            summary: {
                totalDeleted: totalDeleted,
                collectionsProcessed: results.length,
                successful: results.filter(r => r.status === 'success').length,
                failed: results.filter(r => r.status === 'failed').length
            },
            results: results,
            deletedBy: email,
            deletedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Delete All Data Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting data. Please try again.'
        });
    }
};

// ✅ 5. CHECK STATUS
export const checkDeletionStatus = async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(200).json({
                success: true,
                hasActiveOTP: false
            });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(200).json({
                success: true,
                hasActiveOTP: false
            });
        }

        const hasActiveOTP = user.resetOtp && user.resetOtpExpires && Date.now() < user.resetOtpExpires;
        const timeLeft = hasActiveOTP ? Math.max(0, Math.floor((user.resetOtpExpires - Date.now()) / 1000)) : 0;
        
        return res.status(200).json({
            success: true,
            hasActiveOTP: !!hasActiveOTP,
            expiresIn: timeLeft
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};