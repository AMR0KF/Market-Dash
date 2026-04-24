import { Router } from 'express';
import { seedDummyData, clearDummyData } from '../controllers/devController';

const router = Router();

router.post('/seed', seedDummyData);
router.post('/clear', clearDummyData);

export default router;
