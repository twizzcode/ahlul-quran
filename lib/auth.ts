import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.BETTER_AUTH_URL ||
  "http://localhost:3000";
const appOrigin = new URL(appUrl);

const derivedAdminOrigin = new URL(appOrigin.toString());
derivedAdminOrigin.hostname =
  appOrigin.hostname === "localhost"
    ? "admin.localhost"
    : `admin.${appOrigin.hostname}`;

const adminOrigin = new URL(
  process.env.NEXT_PUBLIC_ADMIN_URL ||
  process.env.BETTER_AUTH_URL ||
  derivedAdminOrigin.toString()
);

const cookieDomain = process.env.BETTER_AUTH_COOKIE_DOMAIN;
const enableCrossSubdomainCookies = Boolean(cookieDomain);

const allowedHosts = Array.from(new Set([appOrigin.host, adminOrigin.host]));
const trustedOrigins = Array.from(new Set([appOrigin.origin, adminOrigin.origin]));

export const auth = betterAuth({
  baseURL: {
    fallback: appOrigin.origin,
    allowedHosts,
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "JAMAAH",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      address: {
        type: "string",
        required: false,
      },
    },
  },
  trustedOrigins,
  advanced: enableCrossSubdomainCookies
    ? {
        crossSubDomainCookies: {
          enabled: true,
          domain: cookieDomain!,
        },
      }
    : undefined,
});
