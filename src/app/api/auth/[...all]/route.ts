// src/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// This securely exposes the Better Auth endpoints to the frontend
export const { GET, POST } = toNextJsHandler(auth);