import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary
} from '../controllers/cartController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/items/:cartItemId', updateCartItem);
router.delete('/items/:cartItemId', removeFromCart);
router.delete('/', clearCart);
router.get('/summary', getCartSummary);

export default router;
