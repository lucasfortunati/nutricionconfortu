# Nutricionista Virtual

Calculadora de requerimiento calórico, distribución de macronutrientes y generador
de planes alimentarios personalizados, con una base de alimentos versionada.

Ver el detalle funcional completo en la conversación/PR original. Stack: Next.js
(App Router) + TypeScript + Tailwind CSS + Prisma + PostgreSQL.

## Desarrollo local

Necesitás Node.js y una base PostgreSQL (local o remota).

```bash
npm install
cp .env.example .env   # y completá DATABASE_URL con tu conexión a Postgres
npx prisma migrate dev
npm run db:seed
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). Desde el menú de arriba se
navega entre la Calculadora, Perfiles (favoritos/exclusiones/planes) y el panel
de Administración de alimentos.

### Tests

```bash
npm run test
```

## Deploy en Vercel

1. Importá el repo en [vercel.com](https://vercel.com/new) (conectando tu cuenta
   de GitHub).
2. En el proyecto, andá a **Storage → Create Database → Postgres** (Neon) y
   conectalo — Vercel inyecta la variable `DATABASE_URL` automáticamente.
3. Una vez desplegado, corré la migración y el seed contra esa base (podés
   hacerlo desde tu compu apuntando `DATABASE_URL` a la base de Vercel, o desde
   la terminal que ofrece el dashboard de Neon):
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

Sin este paso 2 (una base Postgres real), el deploy funciona pero no persiste
datos: cada función serverless de Vercel no comparte disco, así que un archivo
SQLite local no sirve en producción.
