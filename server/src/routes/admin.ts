import express from 'express';
import { getCustomers } from '../controllers/adminController';

const router = express.Router();

// In a real app, you would have an admin middleware here as well
// router.use(protect, admin);

router.get('/customers', getCustomers);

export default router;
