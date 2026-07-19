import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import { UserController } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { updateProfileValidator, savedPlaceValidator, preferencesValidator } from '../validators/userValidator.js';

const router = Router();

// Configure specialized Multer for user avatar upload
const avatarUploadDirectory = path.join(process.cwd(), 'uploads', 'profile');

// Ensure destination exists
if (!fs.existsSync(avatarUploadDirectory)) {
  fs.mkdirSync(avatarUploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarUploadDirectory);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const uniqueName = `avatar-${uuidv4()}${fileExt}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png'];
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image file format or extension. Only JPG, JPEG, and PNG are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
});

// Protect all routes within this module using the authentication middleware
router.use(authMiddleware);

// Profile API Routes
router.get('/profile', asyncHandler(UserController.getProfile));
router.put('/profile', updateProfileValidator, validateRequest, asyncHandler(UserController.updateProfile));

// Avatar Upload API Route
router.post(
  '/avatar',
  (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'Upload failed: Image exceeds maximum size of 2 MB' });
        }
        return res.status(400).json({ success: false, message: `Upload failed: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  asyncHandler(UserController.uploadAvatar)
);

// Alias Avatar Upload Route
router.post(
  '/profile/image',
  (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'Upload failed: Image exceeds maximum size of 2 MB' });
        }
        return res.status(400).json({ success: false, message: `Upload failed: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  asyncHandler(UserController.uploadAvatar)
);

// User Preferences API Routes
router.get('/preferences', asyncHandler(UserController.getPreferences));
router.put('/preferences', preferencesValidator, validateRequest, asyncHandler(UserController.updatePreferences));

// Saved Places API Routes
router.get('/saved-places', asyncHandler(UserController.getSavedPlaces));
router.post('/saved-places', savedPlaceValidator, validateRequest, asyncHandler(UserController.createSavedPlace));
router.put('/saved-places/:id', savedPlaceValidator, validateRequest, asyncHandler(UserController.updateSavedPlace));
router.delete('/saved-places/:id', asyncHandler(UserController.deleteSavedPlace));

export default router;
