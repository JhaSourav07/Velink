// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    database: {
      // Override the default ID generator to produce valid MongoDB ObjectIDs (24 hex characters)
      generateId: () => {
        const hex = "0123456789abcdef";
        return Array.from({ length: 24 })
          .map(() => hex[Math.floor(Math.random() * 16)])
          .join("");
      },
    },
  },
});