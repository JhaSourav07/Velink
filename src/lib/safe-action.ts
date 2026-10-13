// src/lib/safe-action.ts
import { unstable_isUnrecognizedActionError } from "next/navigation";

/**
 * Checks whether an error is caused by Next.js Server Action build/deployment skew,
 * and triggers an automatic browser reload so the client syncs with the active server build.
 */
export function handleActionError(
  error: unknown,
  fallbackMessage = "An unexpected error occurred."
): string {
  if (
    unstable_isUnrecognizedActionError(error) ||
    (error instanceof Error &&
      (error.name === "UnrecognizedActionError" ||
        error.message.includes("was not found on the server")))
  ) {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
    return "A new version of Velink was deployed. Reloading page...";
  }

  return error instanceof Error ? error.message : fallbackMessage;
}
