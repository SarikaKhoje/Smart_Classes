import StudyMaterial from '../models/StudyMaterial.js';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { access, readFile, unlink } from 'fs/promises';
import { verifyParentChildAccess } from '../utils/parentAuth.js';

const uploadsPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../uploads');

const uploadedFileMatchesType = async file => {
  const bytes = await readFile(file.path);
  if (file.mimetype === 'application/pdf') return bytes.subarray(0, 5).toString() === '%PDF-';
  if (file.mimetype === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (file.mimetype === 'image/jpeg') return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.mimetype === 'text/plain') return !bytes.subarray(0, 8192).includes(0);
  return false;
};

// @desc    Get study materials filtered by role & class
// @route   GET /api/notes
export const getStudyMaterials = async (req, res, next) => {
  try {
    const { subject, class: className, search, studentId } = req.query;
    let query = {};

    if (req.user.role === 'student') {
      query.class = req.user.class;
    } else if (req.user.role === 'parent') {
      if (studentId) {
        if (!verifyParentChildAccess(req.user, studentId)) {
          return res.status(404).json({ success: false, message: 'Linked student not found' });
        }
        const child = await User.findOne({ _id: studentId, role: 'student' }).select('class');
        if (!child) return res.status(404).json({ success: false, message: 'Linked student not found' });
        if (className && className !== child.class) {
          return res.status(403).json({ success: false, message: 'You are not authorized to view materials for this class' });
        }
        query.class = child.class;
      } else {
        const childIds = (req.user.children || []).map(child => child.studentId).filter(Boolean);
        const children = await User.find({ _id: { $in: childIds }, role: 'student' }).select('class');
        const childClasses = [...new Set(children.map(child => child.class).filter(Boolean))];
        if (className && !childClasses.includes(className)) {
          return res.status(403).json({ success: false, message: 'You are not authorized to view materials for this class' });
        }
        query.class = className || { $in: childClasses };
      }
    } else if (req.user.role === 'teacher') {
      const assignedClasses = req.user.assignedClasses || [];
      if (className && !assignedClasses.includes(className)) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this class' });
      }
      query.class = className || { $in: assignedClasses };
    } else if (className) {
      query.class = className;
    }

    if (subject) query.subject = subject;
    if (search) {
      const safeSearch = String(search).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    const materials = await StudyMaterial.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: materials.length, materials });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload new study material (Admin & Teacher only)
// @route   POST /api/notes
export const uploadStudyMaterial = async (req, res, next) => {
  let material;
  try {
    const { title, description, subject, class: className } = req.body;
    if (req.user.role === 'teacher' && !req.user.assignedClasses?.includes(className)) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this class' });
    }
    let fileUrl = req.body.fileUrl;
    let fileName = req.body.fileName;
    let fileSize = req.body.fileSize || '1.5 MB';
    let fileType = req.body.fileType || 'pdf';
    let storageName = '';
    let externalUrl = null;

    if (req.file) {
      if (!(await uploadedFileMatchesType(req.file))) {
        await unlink(req.file.path);
        return res.status(400).json({ success: false, message: 'Uploaded file content does not match its declared type' });
      }
      storageName = req.file.filename;
      fileName = req.file.originalname;
      fileType = req.file.mimetype.split('/')[1] || 'pdf';
      fileSize = `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`;
    }

    if (!req.file) {
      try {
        externalUrl = new URL(fileUrl);
      } catch {
        return res.status(400).json({ success: false, message: 'Upload a file or provide a valid HTTPS material URL' });
      }
      if (externalUrl.protocol !== 'https:') {
        return res.status(400).json({ success: false, message: 'Material URLs must use HTTPS' });
      }
    }

    material = await StudyMaterial.create({
      title,
      description,
      subject,
      class: className,
      uploadedBy: req.user._id,
      uploaderName: req.user.name,
      fileUrl: req.file ? 'pending' : externalUrl.href,
      storageName,
      fileName: fileName || `${title}.pdf`,
      fileType,
      fileSize
    });
    if (req.file) {
      material.fileUrl = `${req.baseUrl}/${material._id}/file`;
      await material.save();
    }

    res.status(201).json({ success: true, message: 'Study material uploaded successfully', material });
  } catch (error) {
    const cleanupErrors = [];
    if (req.file?.path) {
      try {
        await unlink(req.file.path);
      } catch (cleanupError) {
        if (cleanupError.code !== 'ENOENT') cleanupErrors.push(cleanupError);
      }
    }
    if (material) {
      try {
        await material.deleteOne();
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError);
      }
    }
    next(cleanupErrors.length ? new AggregateError([error, ...cleanupErrors], 'Study material upload failed and cleanup was incomplete') : error);
  }
};

export const downloadStudyMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Uploaded material file not found' });
    }

    let authorized = req.user.role === 'admin';
    if (req.user.role === 'teacher') {
      authorized = req.user.assignedClasses?.includes(material.class);
    } else if (req.user.role === 'student') {
      authorized = req.user.class === material.class;
    } else if (req.user.role === 'parent') {
      const childIds = (req.user.children || []).map(child => child.studentId).filter(Boolean);
      const linkedStudents = childIds.length
        ? await User.find({ _id: { $in: childIds }, role: 'student' }).select('class')
        : [];
      authorized = linkedStudents.some(student => student.class === material.class);
    }
    if (!authorized) {
      return res.status(403).json({ success: false, message: 'You are not authorized to download this material' });
    }

    let storageName = material.storageName;
    if (!storageName && material.fileUrl.startsWith('/uploads/')) {
      const legacyPath = new URL(material.fileUrl, 'http://localhost').pathname;
      storageName = path.basename(decodeURIComponent(legacyPath));
    }
    if (!storageName) {
      return res.status(404).json({ success: false, message: 'Uploaded material file not found' });
    }
    const filename = path.basename(storageName);
    if (filename !== storageName) {
      return res.status(404).json({ success: false, message: 'Uploaded material file not found' });
    }
    const filePath = path.join(uploadsPath, filename);
    try {
      await access(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ success: false, message: 'Uploaded material file not found' });
      }
      throw error;
    }
    res.download(filePath, material.fileName);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete study material (Owner teacher or Admin only)
// @route   DELETE /api/notes/:id
export const deleteStudyMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    if (req.user.role !== 'admin' && material.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this study material' });
    }

    let filename;
    if (material.storageName) {
      filename = path.basename(material.storageName);
      if (filename !== material.storageName) {
        return res.status(500).json({ success: false, message: 'Stored material path is invalid' });
      }
    }
    await material.deleteOne();
    if (filename) {
      await unlink(path.join(uploadsPath, filename)).catch(error => {
        if (error.code !== 'ENOENT') throw error;
      });
    }
    res.status(200).json({ success: true, message: 'Study material deleted successfully' });
  } catch (error) {
    next(error);
  }
};
