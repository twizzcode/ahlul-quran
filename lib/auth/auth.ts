import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/src";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  
  trustedOrigins: [
    "http://lvh.me:3000",
    "http://admin.lvh.me:3000",
    "https://masjidsemilyartangan.com",
    "https://admin.masjidsemilyartangan.com",
  ],

  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: ".lvh.me",
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
