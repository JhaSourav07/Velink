// src/features/links/verify-password.ts
"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function unlockLink(formData: FormData) {
  const password = formData.get("password") as string;
  const slug = formData.get("slug") as string;
  const domain = formData.get("domain") as string;

  if (!password) return { error: "Password is required" };

  try {
    // 1. Fetch the specific link
    const link = await prisma.link.findFirst({
      where: { slug, domain },
    });

    if (!link || !link.password) {
      return { error: "Link not found or is not protected." };
    }

    // 2. Verify the bcrypt hash securely
    const isValid = await bcrypt.compare(password, link.password);

    if (!isValid) {
      return { error: "Incorrect password. Please try again." };
    }

    const reqHeaders = await headers();
    const userAgentStr = reqHeaders.get("user-agent") || "";
    
    await prisma.click.create({
      data: {
        linkId: link.id,
        country: reqHeaders.get("x-vercel-ip-country") || "Unknown",
        city: reqHeaders.get("x-vercel-ip-city") || "Unknown",
        device: userAgentStr.includes("Mobile") ? "Mobile" : "Desktop",
        browser: "Unlocked via Gateway",
        os: "Unknown",
        referer: "Protected Page",
      }
    });

    // 4. Redirect them to their actual destination
    redirect(link.url);

  } catch (error) {
    // Next.js redirect() throws a specific error we must catch and re-throw
    if ((error as Error).message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Unlock Error:", error);
    return { error: "An unexpected error occurred." };
  }
}