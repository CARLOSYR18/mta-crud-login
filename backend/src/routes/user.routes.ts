import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateUserSchema, idParamSchema } from '../validators/user.validator';

const router = Router();

// Todas las rutas de este router requieren un access token válido.
router.use(requireAuth);

router.get('/me', userController.getMe);

router.get('/', requireRole('admin'), userController.listUsers);
router.get('/:id', validate(idParamSchema, 'params'), userController.getUser);
router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateUserSchema, 'body'),
  userController.updateUser,
);
router.delete('/:id', validate(idParamSchema, 'params'), userController.deleteUser);

export default router;
