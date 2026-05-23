import { Router } from 'express';
import {
  getAllAvailabilities,
  getAvailabilityById,
  createAvailability,
  updateAvailability,
  deleteAvailability,
} from '../controllers/availability.controller';
import {
  validateCreateAvailability,
  validateUpdateAvailability,
} from '../validators/availability.validator';
import { authGuard } from '../middlewares/authGuard';

const router = Router();

// Availability admin CRUD routes (all secured under active host session)
router.use(authGuard);

router.get('/', getAllAvailabilities);
router.get('/:id', getAvailabilityById);
router.post('/', validateCreateAvailability, createAvailability);
router.put('/:id', validateUpdateAvailability, updateAvailability);
router.delete('/:id', deleteAvailability);

export default router;
