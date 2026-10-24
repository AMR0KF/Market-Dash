import express from 'express';
import { getCustomers } from '../controllers/adminController';
import { authenticate, adminOnly } from '../middleware/auth';

const router = express.Router();

router.get('/customers', authenticate, adminOnly, getCustomers);

export default router;
