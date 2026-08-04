import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { AppError } from '../middleware/error.middleware';

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getUserById(req.user!.sub);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

export async function listUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const usersList = await userService.listUsers();
    res.status(200).json(usersList);
  } catch (error) {
    next(error);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as unknown as { id: number };
    const user = await userService.getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as unknown as { id: number };

    // Un usuario normal solo puede editarse a sí mismo; un admin puede editar a cualquiera.
    if (req.user!.role !== 'admin' && req.user!.sub !== Number(id)) {
      throw new AppError('No puede modificar datos de otro usuario', 403);
    }

    const user = await userService.updateUser(Number(id), req.body);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as unknown as { id: number };

    if (req.user!.role !== 'admin' && req.user!.sub !== Number(id)) {
      throw new AppError('No puede eliminar la cuenta de otro usuario', 403);
    }

    await userService.deleteUser(Number(id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
