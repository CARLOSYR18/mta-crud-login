import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '../db';
import { users, refreshTokens } from '../db/schema';
import { hashPassword, comparePassword } from '../utils/password';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  parseDurationToMs,
} from '../utils/jwt';
import { sendVerificationEmail } from '../utils/mailer';
import { env } from '../config/env';
import { AppError } from '../middleware/error.middleware';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { OAuthProfile } from './oauth.service';

function toPublicUser(user: typeof users.$inferSelect) {
  const { passwordHash: _passwordHash, verificationTokenHash: _vth, ...publicUser } = user;
  return publicUser;
}

async function issueTokenPair(userId: number, email: string, role: string) {
  const accessToken = signAccessToken({ sub: userId, email, role });

  const expiresAt = new Date(Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN));
  const [inserted] = await db
    .insert(refreshTokens)
    .values({ userId, tokenHash: 'pending', expiresAt })
    .returning();

  const refreshToken = signRefreshToken({ sub: userId, tokenId: inserted.id });

  await db
    .update(refreshTokens)
    .set({ tokenHash: hashToken(refreshToken) })
    .where(eq(refreshTokens.id, inserted.id));

  return { accessToken, refreshToken };
}

function generateVerificationToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  return { raw, tokenHash, expiresAt };
}

export async function registerUser(input: RegisterInput) {
  const existing = await db.query.users.findFirst({ where: eq(users.email, input.email) });
  if (existing) {
    throw new AppError('Ya existe una cuenta registrada con ese email', 409);
  }

  const passwordHash = await hashPassword(input.password);
  const { raw, tokenHash, expiresAt } = generateVerificationToken();

  const [user] = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      passwordHash,
      provider: 'local',
      emailVerified: false,
      verificationTokenHash: tokenHash,
      verificationTokenExpiresAt: expiresAt,
    })
    .returning();

  await sendVerificationEmail(user.email, user.name, raw);

  return { message: 'Cuenta creada. Revisa tu correo para verificarla antes de iniciar sesión.' };
}

export async function loginUser(input: LoginInput) {
  const user = await db.query.users.findFirst({ where: eq(users.email, input.email) });
  if (!user || !user.passwordHash) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const passwordMatches = await comparePassword(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new AppError('Credenciales inválidas', 401);
  }

  if (!user.emailVerified) {
    throw new AppError('Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.', 403);
  }

  const tokens = await issueTokenPair(user.id, user.email, user.role);
  return { user: toPublicUser(user), ...tokens };
}

export async function verifyEmail(rawToken: string) {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const user = await db.query.users.findFirst({ where: eq(users.verificationTokenHash, tokenHash) });
  if (!user) {
    throw new AppError('El enlace de verificación no es válido', 400);
  }
  if (!user.verificationTokenExpiresAt || user.verificationTokenExpiresAt.getTime() < Date.now()) {
    throw new AppError('El enlace de verificación expiró. Solicita uno nuevo.', 400);
  }

  await db
    .update(users)
    .set({ emailVerified: true, verificationTokenHash: null, verificationTokenExpiresAt: null })
    .where(eq(users.id, user.id));

  return { message: 'Correo verificado correctamente. Ya puedes iniciar sesión.' };
}

export async function resendVerification(email: string) {
  const user = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
  // Respuesta genérica siempre, para no revelar si un correo existe o no.
  if (!user || user.emailVerified || user.provider !== 'local') {
    return { message: 'Si el correo existe y está pendiente de verificación, te enviamos un nuevo enlace.' };
  }

  const { raw, tokenHash, expiresAt } = generateVerificationToken();
  await db
    .update(users)
    .set({ verificationTokenHash: tokenHash, verificationTokenExpiresAt: expiresAt })
    .where(eq(users.id, user.id));

  await sendVerificationEmail(user.email, user.name, raw);
  return { message: 'Si el correo existe y está pendiente de verificación, te enviamos un nuevo enlace.' };
}

export async function loginWithOAuth(provider: 'google' | 'github', profile: OAuthProfile) {
  let user = await db.query.users.findFirst({ where: eq(users.email, profile.email) });

  if (!user) {
    [user] = await db
      .insert(users)
      .values({
        name: profile.name,
        email: profile.email,
        passwordHash: null,
        provider,
        providerId: profile.providerId,
        emailVerified: true, // Google/GitHub ya verificaron el correo.
      })
      .returning();
  } else if (user.provider === 'local' && !user.providerId) {
    // Cuenta local existente con el mismo correo: la vinculamos al proveedor.
    [user] = await db
      .update(users)
      .set({ provider, providerId: profile.providerId, emailVerified: true })
      .where(eq(users.id, user.id))
      .returning();
  }

  const tokens = await issueTokenPair(user.id, user.email, user.role);
  return { user: toPublicUser(user), ...tokens };
}

export async function refreshTokenPair(rawRefreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError('Refresh token inválido o expirado', 401);
  }

  const stored = await db.query.refreshTokens.findFirst({
    where: and(eq(refreshTokens.id, payload.tokenId), eq(refreshTokens.userId, payload.sub)),
  });

  if (!stored || stored.revoked || stored.tokenHash !== hashToken(rawRefreshToken)) {
    throw new AppError('Refresh token inválido o ya utilizado', 401);
  }

  if (stored.expiresAt.getTime() < Date.now()) {
    throw new AppError('Refresh token expirado', 401);
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, payload.sub) });
  if (!user) {
    throw new AppError('Usuario no encontrado', 401);
  }

  await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.id, stored.id));

  const tokens = await issueTokenPair(user.id, user.email, user.role);
  return { user: toPublicUser(user), ...tokens };
}

export async function logoutUser(rawRefreshToken: string) {
  try {
    const payload = verifyRefreshToken(rawRefreshToken);
    await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(and(eq(refreshTokens.id, payload.tokenId), eq(refreshTokens.userId, payload.sub)));
  } catch {
    // idempotente
  }
}