/**
 * Guest identity for M2 social features.
 *
 * There is no auth yet, so follows and reviews attribute to a per-browser
 * guest creator. The guest id lives in an httpOnly cookie; the matching
 * Creator row is created on first use. When auth lands, swap this module.
 */
import { cookies } from "next/headers";
import { prisma, dbConfigured } from "./db";

const COOKIE_NAME = "mx_guest";

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** The guest handle for this browser, creating the cookie if needed. */
export async function getGuestHandle(): Promise<string> {
  const jar = cookies();
  const existing = jar.get(COOKIE_NAME)?.value;
  if (existing) return existing;
  const handle = `@guest-${randomSuffix()}`;
  jar.set(COOKIE_NAME, handle, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return handle;
}

/**
 * Ensure a Creator row exists for the guest. Returns null when no database
 * is configured (write features are disabled in seed mode).
 */
export async function ensureGuestCreator(
  displayName?: string
): Promise<{ id: string; handle: string } | null> {
  if (!dbConfigured()) return null;
  const handle = await getGuestHandle();
  try {
    const existing = await prisma.creator.findUnique({ where: { handle } });
    if (existing) {
      if (displayName && displayName.trim() && existing.displayName.startsWith("Guest")) {
        await prisma.creator.update({
          where: { id: existing.id },
          data: { displayName: displayName.trim().slice(0, 60) },
        });
        return { id: existing.id, handle: existing.handle };
      }
      return { id: existing.id, handle: existing.handle };
    }
    const created = await prisma.creator.create({
      data: {
        handle,
        displayName:
          displayName && displayName.trim()
            ? displayName.trim().slice(0, 60)
            : "Guest Explorer",
        bio: "Exploring the Exchange.",
      },
    });
    return { id: created.id, handle: created.handle };
  } catch {
    return null;
  }
}
