import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';

const acceptedFiles = new Map([
  ['.pdf', 'application/pdf'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.txt', 'text/plain']
]);

// Disk storage setup (saves temporarily or in uploads directory)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
  }
});

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  if (acceptedFiles.get(extension) === file.mimetype.toLowerCase()) {
    return cb(null, true);
  }
  cb(new Error('Upload a PDF, PNG, JPEG, or plain-text file with a matching file type'), false);
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter
});

export default upload;
