// routes/categoryRoutes.js
import express from 'express';
import { 
  addCategory, 
  updateCategory, 
  deleteCategory, 
  getCategories, 
  getCategory,
  restoreCategory,
  getDeletedCategories 
} from '../controllers/categoryController.js';
import { isAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';

const router = express.Router();

router.post('/', isAdmin, upload.single('image'), addCategory);
router.put('/:id', isAdmin, upload.single('image'), updateCategory);
router.delete('/:id', isAdmin, deleteCategory);
router.get('/', getCategories);
router.get('/deleted', isAdmin, getDeletedCategories);
router.get('/:id', getCategory);
router.post('/:id/restore', isAdmin, restoreCategory);

export default router;