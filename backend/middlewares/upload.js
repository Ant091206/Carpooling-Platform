const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { errorResponse } = require('../utils/responseFormat');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/vehicles');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// Middleware wrapper to handle multer errors gracefully
const uploadMiddleware = (req, res, next) => {
    const uploadSingle = upload.single('vehicle_image');
    
    uploadSingle(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json(errorResponse(`Upload error: ${err.message}`));
        } else if (err) {
            return res.status(400).json(errorResponse(err.message));
        }
        next();
    });
};

module.exports = uploadMiddleware;
