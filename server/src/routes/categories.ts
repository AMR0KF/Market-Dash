import { Router } from 'express';
import {
  getAllCategories,
  getCategoryWithProducts,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', getAllCategories);
router.get('/:slug', getCategoryWithProducts);

// Admin routes
router.post('/', authenticate, adminOnly, createCategory);
router.put('/:id', authenticate, adminOnly, updateCategory);
router.delete('/:id', authenticate, adminOnly, deleteCategory);

export default router;
