import { Router } from 'express';
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAdminOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderStats
} from '../controllers/orderController';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Customer routes
router.post('/', placeOrder);
router.get('/my-orders', getMyOrders);
router.get('/my-orders/:orderId', getOrderById);
router.post('/my-orders/:orderId/cancel', cancelOrder);

// Admin routes
router.get('/admin/all', adminOnly, getAllOrders);
router.get('/admin/stats', adminOnly, getOrderStats);
router.get('/admin/:orderId', adminOnly, getAdminOrderById);
router.put('/admin/:orderId/status', adminOnly, updateOrderStatus);

export default router;
