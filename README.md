# Sistema CRUD + Login — MTA Software

Proyecto de práctica: sistema de autenticación (registro e inicio de sesión con JWT +
refresh tokens, verificación de email y login social con Google/GitHub) que, una vez
validada la sesión, permite administrar la información de usuarios (CRUD). Backend en
Node.js + Express + TypeScript + PostgreSQL + Drizzle ORM. Frontend en React + TypeScript
+ Vite con un sistema de diseño propio.

**Demo en producción:** despliegue único en Vercel (frontend + backend en el mismo dominio).

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

**Infraestructura**
- Vercel (frontend estático + backend como función serverless, un solo proyecto)
- Neon (PostgreSQL en la nube) para producción

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
- **Verificación de email con confirmación explícita**: al registrarse con email/contraseña,
  se envía un correo (vía SMTP con Nodemailer) con un enlace de verificación. La página de
  verificación **no dispara la llamada a la API automáticamente**: el usuario debe presionar
  un botón. Esto evita que escáneres automáticos de los proveedores de correo (Gmail, Outlook,
  antivirus, etc.), que visitan los enlaces por seguridad antes de que el usuario le dé clic,
  consuman el token de un solo uso sin que el usuario haya hecho nada.
- **Separación de responsabilidades**: rutas → controladores (manejo de request/response)
  → servicios (lógica de negocio y acceso a datos) → esquema de base de datos. Esto facilita
  testear la lógica de negocio de forma aislada.
- **Autorización por rol simple** (`user` / `admin`): un usuario normal solo puede ver,
  editar y borrar su propia cuenta (`/users/me`, y `/users/:id` si `id` es el suyo); solo un
  `admin` puede listar a todos los usuarios (`GET /users`) o modificar cuentas ajenas.
- **Validación centralizada con Zod**, en un middleware reutilizable (`validate.middleware.ts`)
  que valida `body`, `params` o `query` según se necesite, devolviendo errores de forma
  consistente.
- **Un solo proyecto de Vercel para frontend y backend**: en vez de dos despliegues
  separados, `vercel.json` en la raíz construye ambas partes y las sirve bajo el mismo
  dominio (`/api/*` va al backend, todo lo demás al frontend), evitando problemas de CORS
  entre subdominios distintos.

## Estructura del proyecto

```
mta-crud-login/
├── backend/
│   ├── api/
│   │   └── index.ts          # entry point serverless (Vercel)
│   ├── src/
│   │   ├── config/           # Variables de entorno
│   │   ├── db/                # Esquema Drizzle, conexión y migraciones
│   │   ├── middleware/         # auth, validate, error handler
│   │   ├── controllers/        # auth.controller, user.controller
│   │   ├── services/           # auth.service, user.service, oauth.service
│   │   ├── routes/             # auth.routes, user.routes
│   │   ├── utils/               # jwt.ts, password.ts, mailer.ts
│   │   ├── validators/          # esquemas Zod
│   │   ├── app.ts
│   │   └── index.ts
│   └── tests/                 # Jest
├── frontend/
│   └── src/
│       ├── api/               # cliente axios + funciones de API
│       ├── components/         # AuthLayout, Avatar, Badge, Logo, Navbar
│       ├── config/              # branding.ts (tokens de marca)
│       ├── context/             # AuthContext (estado global de sesión)
│       ├── routes/              # ProtectedRoute
│       └── pages/               # Login, Register, Dashboard, Users, VerifyEmail,
│                                 # CheckEmail, OAuthCallback
├── postman/                    # Colección de Postman
└── vercel.json                 # Config de despliegue combinado (frontend + backend)
```

## Cómo correrlo en local

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
  autorizada (y como origen autorizado de JavaScript, `http://localhost:4000`).
- **GitHub**: crea una OAuth App en [github.com/settings/developers](https://github.com/settings/developers)
  con `http://localhost:4000/api/auth/github/callback` como Authorization callback URL.
- **SMTP**: usa una cuenta de correo con contraseña de aplicación (ej. Gmail) para
  `SMTP_USER` / `SMTP_PASS`.

Ninguno de estos valores debe subirse nunca al repositorio — `backend/.env` y
`frontend/.env` están excluidos vía `.gitignore`; solo los `.env.example` (con
placeholders) se versionan. **Quien clone este repo debe crear sus propios `.env`
a partir de los `.env.example` y llenarlos con sus propias credenciales** (su propia
base de datos, sus propios secretos JWT, sus propias apps de OAuth, su propia cuenta SMTP).

### 5. Postman

Importa `postman/MTA-CRUD-Login.postman_collection.json`. Las peticiones de `Register` y
`Login` guardan automáticamente `accessToken`, `refreshToken` y `userId` como variables de
la colección, para que el resto de peticiones ya lleguen autenticadas.

## Despliegue en Vercel (frontend + backend en un solo proyecto)

Este repo está pensado para desplegarse como **un único proyecto de Vercel** que sirve
el frontend estático y el backend como función serverless en el mismo dominio.

### 1. Base de datos en la nube

Vercel no puede conectarse a un Postgres local (`localhost`). Crea una base de datos
en un servicio como [Neon](https://neon.tech) o Supabase y obtén su cadena de conexión
(algo como `postgresql://usuario:pass@host.neon.tech/basedatos?sslmode=require`).

Corre las migraciones **una vez** contra esa base de datos en la nube desde tu máquina:

```bash
cd backend
# temporalmente, cambia DATABASE_URL en tu .env por la de Neon
npm run db:migrate
# luego regresa DATABASE_URL a tu valor local
```

### 2. Crear el proyecto en Vercel

1. Importa el repo en [vercel.com/new](https://vercel.com/new)
2. **Root Directory**: déjalo en la raíz del repo (no lo cambies a `backend` ni `frontend`)
3. En "Build and Output Settings", deja todos los toggles apagados — el `vercel.json`
   de la raíz controla el build de ambas partes:

```json
{
  "builds": [
    { "src": "backend/api/index.ts", "use": "@vercel/node" },
    { "src": "frontend/package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/backend/api/index.ts" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/frontend/index.html" }
  ]
}
```

4. En `frontend/vite.config.ts`, el build debe generar rutas de assets con el prefijo
   `/frontend/`, ya que así es como quedan montados dentro del despliegue combinado:

```typescript
export default defineConfig({
  base: '/frontend/',
  plugins: [react()],
});
```

### 3. Variables de entorno en Vercel

En Settings → Environment Variables, agrega (usando tu dominio real de Vercel en vez
de `TU-DOMINIO.vercel.app`):

| Variable | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | tu cadena de conexión de Neon (con `?sslmode=require`) |
| `JWT_ACCESS_SECRET` | genera uno con `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | genera otro distinto con `openssl rand -hex 32` |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | `https://TU-DOMINIO.vercel.app` |
| `FRONTEND_URL` | `https://TU-DOMINIO.vercel.app` |
| `VITE_API_URL` | `/api` (ruta relativa, mismo dominio) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | de tu app en Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | `https://TU-DOMINIO.vercel.app/api/auth/google/callback` |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | de tu OAuth App en GitHub |
| `GITHUB_CALLBACK_URL` | `https://TU-DOMINIO.vercel.app/api/auth/github/callback` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | de tu cuenta SMTP |

No hace falta configurar `PORT`, Vercel maneja el puerto automáticamente.

### 4. Registrar las URLs de producción en Google y GitHub

- **Google Cloud Console** → tu Client ID → agrega (sin borrar las de localhost):
  - Orígenes autorizados de JavaScript: `https://TU-DOMINIO.vercel.app`
  - URI de redirección autorizado: `https://TU-DOMINIO.vercel.app/api/auth/google/callback`
- **GitHub** → tu OAuth App → agrega el nuevo Authorization callback URL:
  `https://TU-DOMINIO.vercel.app/api/auth/github/callback`

### 5. Deploy

Con las variables y el `vercel.json` en su lugar, cada push a `main` dispara un deploy
automático. Para forzar uno manual (por ejemplo, tras cambiar variables de entorno):
Deployments → menú `...` del último deployment → **Redeploy**.

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
