import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"
import { env } from "process";

const LEGACY_SSL_MODE_ALIASES = new Set(["prefer", "require", "verify-ca"]);

function normalizePgConnectionString(connectionString: string | undefined): string {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  try {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get("sslmode");
    const useLibpqCompat = url.searchParams.get("uselibpqcompat") === "true";

    if (sslmode && LEGACY_SSL_MODE_ALIASES.has(sslmode) && !useLibpqCompat) {
      // Keep current secure behavior and silence pg-connection-string deprecation warning.
      url.searchParams.set("sslmode", "verify-full");
      return url.toString();
    }
  } catch {
    return connectionString;
  }

  return connectionString;
}

const adapter = new PrismaPg({
  connectionString: normalizePgConnectionString(env.DATABASE_URL),
});
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma =
  process.env.NODE_ENV === "production"
    ? global.prisma || new PrismaClient({ adapter })
    : new PrismaClient({ adapter });

if (process.env.NODE_ENV === "production" && !global.prisma) {
  global.prisma = prisma;
}

export default prisma;
