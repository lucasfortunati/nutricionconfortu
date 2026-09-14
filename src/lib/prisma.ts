import { PrismaClient } from "@prisma/client";

/**
 * En Vercel, conectar una base vía "Storage" a veces deja la variable
 * `DATABASE_URL` vacía mientras el valor real queda en otra variable con
 * prefijo (ej. `POSTGRES_URL`, `<proyecto>_DATABASE_URL`). En vez de depender
 * de que esa variable puntual esté bien enlazada, buscamos cualquier
 * variable de entorno que sea una URL de Postgres válida y la usamos.
 */
function isPlainPostgresUrl(value: string | undefined): value is string {
  return !!value && (value.startsWith("postgres://") || value.startsWith("postgresql://"));
}

function resolveDatabaseUrl(): string | undefined {
  if (isPlainPostgresUrl(process.env.DATABASE_URL)) {
    return process.env.DATABASE_URL;
  }

  const preferredNames = ["POSTGRES_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL_NON_POOLING"];
  for (const name of preferredNames) {
    if (isPlainPostgresUrl(process.env[name])) {
      return process.env[name];
    }
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (/DATABASE_URL|POSTGRES_URL/i.test(key) && isPlainPostgresUrl(value)) {
      return value;
    }
  }

  return undefined;
}

const resolvedUrl = resolveDatabaseUrl();
if (resolvedUrl) {
  process.env.DATABASE_URL = resolvedUrl;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
