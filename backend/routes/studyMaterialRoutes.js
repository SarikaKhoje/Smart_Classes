import express from 'express';
import {
  getStudyMaterials,
  uploadStudyMaterial,
  downloadStudyMaterial,
  deleteStudyMaterial
} from '../controllers/studyMaterialController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.get('/', getStudyMaterials);
router.get('/:id/file', downloadStudyMaterial);
router.post('/', authorize('admin', 'teacher'), upload.single('file'), uploadStudyMaterial);
router.delete('/:id', authorize('admin', 'teacher'), deleteStudyMaterial);

export default router;
