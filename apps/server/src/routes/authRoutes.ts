import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authGuard } from '../middlewares/authGuard';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/oauth-sync', AuthController.oauthSync);
router.post('/google-callback', AuthController.googleCallback);

// Protected routes (require valid JWT)
router.get('/me', authGuard, AuthController.getMe);

export default router;
