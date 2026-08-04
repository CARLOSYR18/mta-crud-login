# Sistema CRUD + Login — MTA Software

Proyecto de práctica: sistema de autenticación (registro e inicio de sesión con JWT +
refresh tokens, verificación de email y login social con Google/GitHub) que, una vez
validada la sesión, permite administrar la información de usuarios (CRUD). Backend en
Node.js + Express + TypeScript + PostgreSQL + Drizzle ORM. Frontend en React + TypeScript
+ Vite con un sistema de diseño propio.

## Stack usado

**Backend**
- Node.js + Express + TypeScript
- PostgreSQL
- Drizzle ORM (+ drizzle-kit para migraciones)
- JWT (access token + refresh token rotativo)
- Middleware de autenticación (`requireAuth`) y autorización por rol (`requireRole`)
- bcrypt para hashing de contraseñas
- Zod para validación de datos de entrada
- OAuth 2.0 con Google y GitHub (login social)
- Nodemailer (SMTP) para verificación de email
- dotenv para variables de entorno
- Jest + Supertest para tests
- ESLint + Prettier

**Frontend**
- React + TypeScript + Vite
- React Router (ruteo del lado del cliente + rutas protegidas)
- Axios como cliente HTTP (con interceptor de refresh automático)
- Sistema de diseño propio (layout de auth en split-screen, componentes reutilizables:
  Avatar, Badge, Navbar, Logo)

**Documentación**
- Este README
- Colección de Postman en `postman/MTA-CRUD-Login.postman_collection.json`

## Decisiones de diseño

- **Refresh tokens rotativos y revocables**: cada refresh token se guarda en la base de
  datos como hash SHA-256 (nunca en texto plano), asociado a una fila con `expiresAt` y
  `revoked`. Al usarse, se marca como revocado y se emite uno nuevo (rotación), lo que
  limita el daño si un refresh token se filtra.
- **Access token de vida corta (15 min)** para minimizar la ventana de uso si se filtra,
  y **refresh token de vida larga (7 días)** para no forzar logins constantes.
- **Login social (OAuth 2.0) con Google y GitHub**, además del login tradicional con
  email/contraseña: el backend expone endpoints de redirección (`/api/auth/google`,
  `/api/auth/github`) y de callback que intercambian el código de autorización por el
  perfil del usuario, crean o vinculan la cuenta, y redirigen al frontend con los tokens
  de sesión ya emitidos.
- **Verificación de email**: al registrarse con email/contraseña, se envía un correo
  (vía SMTP con Nodemailer) con un enlace de verificación antes de dar acceso completo
  a la cuenta.
- **Separación de responsabilidades**: rutas → controladores (manejo de request/response)
  → servicios (lógica de negocio y acceso a datos) → esquema de base de datos. Esto facilita
  testear la lógica de negocio de forma aislada.
- **Autorización por rol simple** (`user` / `admin`): un usuario normal solo puede ver,
  editar y borrar su propia cuenta (`/users/me`, y `/users/:id` si `id` es el suyo); solo un
  `admin` puede listar a todos los usuarios (`GET /users`) o modificar cuentas ajenas.
- **Validación centralizada con Zod**, en un middleware reutilizable (`validate.middleware.ts`)
  que valida `body`, `params` o `query` según se necesite, devolviendo errores de forma
  consistente.

## Estructura del proyecto
mta-crud-login/
├── backend/
│ ├── src/
│ │ ├── config/ # Variables de entorno
│ │ ├── db/ # Esquema Drizzle, conexión y migraciones
│ │ ├── middleware/ # auth, validate, error handler
│ │ ├── controllers/ # auth.controller, user.controller
│ │ ├── services/ # auth.service, user.service, oauth.service
│ │ ├── routes/ # auth.routes, user.routes
│ │ ├── utils/ # jwt.ts, password.ts, mailer.ts
│ │ ├── validators/ # esquemas Zod
│ │ ├── app.ts
│ │ └── index.ts
│ └── tests/ # Jest
├── frontend/
│ └── src/
│ ├── api/ # cliente axios + funciones de API
│ ├── components/ # AuthLayout, Avatar, Badge, Logo, Navbar
│ ├── config/ # branding.ts (tokens de marca)
│ ├── context/ # AuthContext (estado global de sesión)
│ ├── routes/ # ProtectedRoute
│ └── pages/ # Login, Register, Dashboard, Users, VerifyEmail,
│ # CheckEmail, OAuthCallback
└── postman/ # Colección de Postman


## Cómo correrlo

### 1. Base de datos

Crea una base de datos PostgreSQL local (o usa Docker):

```bash
docker run --name mta-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=mta_crud_login -p 5432:5432 -d postgres:16
```

### 2. Backend

```bash
cd backend
cp .env.example .env       # ajusta DATABASE_URL, secretos JWT, OAuth y SMTP (ver abajo)
npm install
npm run db:generate         # genera los archivos SQL de migración a partir del esquema
npm run db:migrate          # aplica las migraciones a la base de datos
npm run dev                 # levanta el servidor en http://localhost:4000
```

Tests:

```bash
npm test
```

Linter:

```bash
npm run lint
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env        # ajusta VITE_API_URL si es necesario
npm install
npm run dev                 # http://localhost:5173
```

### 4. Configurar login social y correo (opcional para probar OAuth/verificación)

Para que el login con Google/GitHub y el envío de correos de verificación funcionen,
completa en `backend/.env`:

- **Google**: crea credenciales OAuth 2.0 en [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
  y registra `http://localhost:4000/api/auth/google/callback` como URI de redirección
  autorizada.
- **GitHub**: crea una OAuth App en [github.com/settings/developers](https://github.com/settings/developers)
  con `http://localhost:4000/api/auth/github/callback` como Authorization callback URL.
- **SMTP**: usa una cuenta de correo con contraseña de aplicación (ej. Gmail) para
  `SMTP_USER` / `SMTP_PASS`.

Ninguno de estos valores debe subirse nunca al repositorio — `backend/.env` está
excluido vía `.gitignore`; solo `backend/.env.example` (con placeholders) se versiona.

### 5. Postman

Importa `postman/MTA-CRUD-Login.postman_collection.json`. Las peticiones de `Register` y
`Login` guardan automáticamente `accessToken`, `refreshToken` y `userId` como variables de
la colección, para que el resto de peticiones ya lleguen autenticadas.

## Endpoints principales

| Método | Ruta                          | Auth requerida  | Descripción                                |
|--------|-------------------------------|-----------------|---------------------------------------------|
| POST   | `/api/auth/register`          | No              | Crea una cuenta y envía email de verificación |
| POST   | `/api/auth/login`             | No              | Autentica y devuelve tokens                  |
| GET    | `/api/auth/verify-email`      | No (token)      | Verifica el email a partir del enlace enviado |
| POST   | `/api/auth/resend-verification`| No             | Reenvía el correo de verificación            |
| GET    | `/api/auth/google`            | No              | Redirige al login de Google                  |
| GET    | `/api/auth/google/callback`   | No (OAuth)      | Callback de Google, emite tokens de sesión   |
| GET    | `/api/auth/github`            | No              | Redirige al login de GitHub                  |
| GET    | `/api/auth/github/callback`   | No (OAuth)      | Callback de GitHub, emite tokens de sesión   |
| POST   | `/api/auth/refresh`           | No (refresh)    | Rota el refresh token y da un nuevo par      |
| POST   | `/api/auth/logout`            | No (refresh)    | Revoca el refresh token                      |
| GET    | `/api/users/me`               | Sí              | Perfil del usuario autenticado                |
| GET    | `/api/users`                  | Sí (admin)      | Lista todos los usuarios                      |
| GET    | `/api/users/:id`               | Sí              | Obtiene un usuario por id                     |
| PUT    | `/api/users/:id`               | Sí (dueño/admin)| Actualiza nombre/email/contraseña             |
| DELETE | `/api/users/:id`               | Sí (dueño/admin)| Elimina un usuario                            |

## Posibles mejoras futuras

- Límite de intentos de login (rate limiting) para mitigar fuerza bruta.
- Paginación en el listado de usuarios.
- Roles más granulares (permisos por recurso en lugar de solo `user`/`admin`).
- Autenticación de dos factores (2FA).