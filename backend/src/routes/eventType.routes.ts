import { Router } from 'express';
import {
  getAllEventTypes,
  getEventTypeById,
  createEventType,
  updateEventType,
  deleteEventType,
  getPublicEventType,
} from '../controllers/eventType.controller';
import {
  validateCreateEventType,
  validateUpdateEventType,
} from '../validators/eventType.validator';
import { authGuard } from '../middlewares/authGuard';

const router = Router();

// Public route for public guest booking calendar view
router.get('/public/:slug', getPublicEventType);

// Admin / host operations secured under active session
router.use(authGuard);

router.get('/', getAllEventTypes);
router.get('/:id', getEventTypeById);
router.post('/', validateCreateEventType, createEventType);
router.put('/:id', validateUpdateEventType, updateEventType);
router.delete('/:id', deleteEventType);

export default router;
