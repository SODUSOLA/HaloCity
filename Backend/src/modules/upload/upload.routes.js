import { Router } from 'express';
import multer from 'multer';
import { extname } from 'path';
import authMiddleware from '../../middleware/auth.middleware.js';
import catchAsync from '../../shared/catch-async.js';
import { success } from '../../shared/response.js';
import config from '../../config/env.js';
import logger from '../../config/logger.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not allowed. Allowed: ${allowed.join(', ')}`));
    }
  },
});

const router = Router();

router.post(
  '/',
  authMiddleware,
  upload.single('file'),
  catchAsync(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const canUpload = !!(config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_UPLOAD_PRESET);

    if (canUpload) {
      const formData = new FormData();
      formData.append('file', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);
      formData.append('upload_preset', config.CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${config.CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData },
      );

      if (!response.ok) {
        const text = await response.text();
        logger.error('Cloudinary upload failed', { status: response.status, body: text });
        return res.status(502).json({ success: false, message: 'Image upload service failed' });
      }

      const result = await response.json();

      logger.info('File uploaded to Cloudinary', { url: result.secure_url });

      return success(res, 'File uploaded', {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      }, 201);
    }

    const devUrl = `https://placehold.co/600x400?text=${encodeURIComponent(req.file.originalname)}`;
    logger.warn('Cloudinary not configured, returning placeholder URL', { devUrl });

    return success(res, 'File uploaded (dev mode - placeholder)', { url: devUrl }, 201);
  })
);

export default router;
