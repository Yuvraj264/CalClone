import { Router } from 'express';
import { SlotController } from '../controllers/slotController';

const router = Router();

// Public route to calculate scheduling slots dynamically
router.get('/public', SlotController.getAvailableSlots);

export default router;
