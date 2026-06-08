import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/src";

const isProd = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  trustedOrigins: isProd
    ? [
        "https://masjidsemilyartangan.com",
        "https://admin.masjidsemilyartangan.com",
      ]
    : [
        "http://lvh.me:3000",
        "http://admin.lvh.me:3000",
      ],

  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: isProd ? ".masjidsemilyartangan.com" : ".lvh.me",
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});