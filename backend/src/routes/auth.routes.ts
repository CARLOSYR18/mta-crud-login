import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', validate(refreshSchema), authController.logout);

router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

router.get('/google', authController.googleRedirect);
router.get('/google/callback', authController.googleCallback);
router.get('/github', authController.githubRedirect);
router.get('/github/callback', authController.githubCallback);

export default router;