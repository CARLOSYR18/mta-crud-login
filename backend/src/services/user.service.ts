import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { hashPassword } from '../utils/password';
import { AppError } from '../middleware/error.middleware';
import { UpdateUserInput } from '../validators/user.validator';

function toPublicUser(user: typeof users.$inferSelect) {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export async function listUsers() {
  const all = await db.query.users.findMany({ orderBy: (u, { asc }) => [asc(u.id)] });
  return all.map(toPublicUser);
}

export async function getUserById(id: number) {
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }
  return toPublicUser(user);
}

export async function updateUser(id: number, input: UpdateUserInput) {
  const existing = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!existing) {
    throw new AppError('Usuario no encontrado', 404);
  }

  if (input.email && input.email !== existing.email) {
    const emailTaken = await db.query.users.findFirst({ where: eq(users.email, input.email) });
    if (emailTaken) {
      throw new AppError('Ese email ya está en uso por otra cuenta', 409);
    }
  }

  const dataToUpdate: Partial<typeof users.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (input.name) dataToUpdate.name = input.name;
  if (input.email) dataToUpdate.email = input.email;
  if (input.password) dataToUpdate.passwordHash = await hashPassword(input.password);

  const [updated] = await db
    .update(users)
    .set(dataToUpdate)
    .where(eq(users.id, id))
    .returning();

  return toPublicUser(updated);
}

export async function deleteUser(id: number) {
  const existing = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!existing) {
    throw new AppError('Usuario no encontrado', 404);
  }
  await db.delete(users).where(eq(users.id, id));
}
