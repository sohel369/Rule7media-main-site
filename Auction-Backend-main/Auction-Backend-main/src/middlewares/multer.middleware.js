import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directory exists
const uploadDir = "public/uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

// ✅ File filter - allow standard image formats (PNG, JPEG, JPG, GIF, WEBP, SVG)
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    
    if (file.mimetype.startsWith('image/') || allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPG, JPEG, PNG, GIF, WEBP, SVG) are allowed!'), false);
    }
};

// ✅ Media Kit file filter — PDF, DOC, DOCX, PPT, PPTX
const pdfFileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
    const allowedMimeTypes = [
        'application/pdf',
        'application/msword',                                                     // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-powerpoint',                                          // .ppt
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    ];

    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, DOC, DOCX, PPT, or PPTX files are allowed!'), false);
    }
};

// ✅ Configure multer for Media Kit files (PDF / DOC / DOCX / PPT / PPTX)
export const uploadPdf = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB — handles large media kits
        files: 1
    },
    fileFilter: pdfFileFilter
});

// ✅ Configure multer with proper limits
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 10 // Max 10 files per request
    },
    fileFilter: fileFilter
});

// ✅ Error handler middleware for multer errors
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                success: false,
                message: '❌ File too large! Maximum file size is 100MB for media kits and 10MB per image.',
                error: '413 Request Entity Too Large',
                details: {
                    maxSizeMediaKit: '100MB',
                    maxSizeImage: '10MB'
                }
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: '❌ Too many files! Maximum 10 images allowed per request.',
                error: err.message
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: '❌ Unexpected file field.',
                error: err.message
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message,
            error: err.code
        });
    }
    
    // Other errors
    if (err.message?.includes('Only image files') || err.message === 'Only GIF files are allowed!') {
        return res.status(400).json({
            success: false,
            message: '❌ Only image files (JPG, JPEG, PNG, GIF, WEBP, SVG) are allowed!',
            error: err.message
        });
    }
    
    next(err);
};