import { pgTable, serial, varchar, timestamp, boolean, text } from 'drizzle-orm/pg-core';

/**
 * Tabla de usuarios.
 * passwordHash ahora es opcional: las cuentas creadas por Google/GitHub
 * no tienen contraseña propia, solo autenticación por proveedor externo.
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  role: varchar('role', { length: 20 }).notNull().default('user'), // 'user' | 'admin'

  // Proveedor de autenticación: 'local' | 'google' | 'github'
  provider: varchar('provider', { length: 20 }).notNull().default('local'),
  providerId: varchar('provider_id', { length: 255 }),

  // Verificación de correo (solo aplica a cuentas 'local'; Google/GitHub llegan pre-verificadas)
  emailVerified: boolean('email_verified').notNull().default(false),
  verificationTokenHash: text('verification_token_hash'),
  verificationTokenExpiresAt: timestamp('verification_token_expires_at'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  userId: serial('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  revoked: boolean('revoked').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;