"use server";

import { revalidatePath } from "next/cache";
import { prisma, dbConfigured } from "@/lib/db";
import { ensureGuestCreator } from "@/lib/identity";

export interface ReviewState {
  ok: boolean;
  errors: string[];
}

export interface FollowState {
  ok: boolean;
  following: boolean;
  count: number;
  error?: string;
}

async function recomputeRating(agentId: string) {
  const agg = await prisma.review.aggregate({
    where: { agentId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.agent.update({
    where: { id: agentId },
    data: {
      rating: agg._avg.rating ?? 0,
      ratingCount: agg._count.rating,
    },
  });
}

/**
 * Submit or update a review for an agent. One review per guest per agent.
 */
export async function submitReview(
  slug: string,
  _prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  if (!dbConfigured()) {
    return { ok: false, errors: ["Reviews need a database. Set DATABASE_URL to enable them."] };
  }

  const rating = parseInt(String(formData.get("rating") ?? ""), 10);
  const text = String(formData.get("text") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();

  const errors: string[] = [];
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.push("Pick a rating from 1 to 5 stars.");
  }
  if (text.length < 10 || text.length > 1000) {
    errors.push("Review text must be 10 to 1000 characters.");
  }
  if (errors.length > 0) return { ok: false, errors };

  try {
    const agent = await prisma.agent.findUnique({ where: { slug } });
    if (!agent) return { ok: false, errors: ["Agent not found."] };

    const guest = await ensureGuestCreator(displayName || undefined);
    if (!guest) {
      return { ok: false, errors: ["Could not identify you. Try again in a moment."] };
    }

    await prisma.review.upsert({
      where: { agentId_authorId: { agentId: agent.id, authorId: guest.id } },
      update: { rating, text },
      create: { agentId: agent.id, authorId: guest.id, rating, text },
    });
    await recomputeRating(agent.id);
  } catch (e) {
    console.error("submitReview failed:", e);
    return { ok: false, errors: ["Could not save your review. Try again in a moment."] };
  }

  revalidatePath(`/agents/${slug}`);
  return { ok: true, errors: [] };
}

/** Toggle following an agent for the guest identity. */
export async function toggleAgentFollow(slug: string): Promise<FollowState> {
  if (!dbConfigured()) {
    return { ok: false, following: false, count: 0, error: "Follows need a database." };
  }
  try {
    const agent = await prisma.agent.findUnique({ where: { slug } });
    if (!agent) return { ok: false, following: false, count: 0, error: "Agent not found." };

    const guest = await ensureGuestCreator();
    if (!guest) {
      return { ok: false, following: false, count: agent.followerCount, error: "Could not identify you." };
    }

    const existing = await prisma.follow.findUnique({
      where: { followerId_agentId: { followerId: guest.id, agentId: agent.id } },
    });

    let following: boolean;
    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      following = false;
    } else {
      await prisma.follow.create({
        data: { followerId: guest.id, agentId: agent.id },
      });
      following = true;
    }

    const count = await prisma.follow.count({ where: { agentId: agent.id } });
    await prisma.agent.update({ where: { id: agent.id }, data: { followerCount: count } });

    revalidatePath(`/agents/${slug}`);
    return { ok: true, following, count };
  } catch (e) {
    console.error("toggleAgentFollow failed:", e);
    return { ok: false, following: false, count: 0, error: "Try again in a moment." };
  }
}

/** Toggle following a creator for the guest identity. */
export async function toggleCreatorFollow(handle: string): Promise<FollowState> {
  const normalized = handle.startsWith("@") ? handle : `@${handle}`;
  if (!dbConfigured()) {
    return { ok: false, following: false, count: 0, error: "Follows need a database." };
  }
  try {
    const creator = await prisma.creator.findUnique({ where: { handle: normalized } });
    if (!creator) return { ok: false, following: false, count: 0, error: "Creator not found." };

    const guest = await ensureGuestCreator();
    if (!guest) {
      return { ok: false, following: false, count: 0, error: "Could not identify you." };
    }

    const existing = await prisma.follow.findUnique({
      where: { followerId_creatorId: { followerId: guest.id, creatorId: creator.id } },
    });

    let following: boolean;
    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      following = false;
    } else {
      await prisma.follow.create({
        data: { followerId: guest.id, creatorId: creator.id },
      });
      following = true;
    }

    const count = await prisma.follow.count({ where: { creatorId: creator.id } });
    revalidatePath(`/creators/${normalized.slice(1)}`);
    return { ok: true, following, count };
  } catch (e) {
    console.error("toggleCreatorFollow failed:", e);
    return { ok: false, following: false, count: 0, error: "Try again in a moment." };
  }
}

/** Check whether the guest follows an agent. Null when DB is unavailable. */
export async function agentFollowStatus(
  slug: string,
  guestHandle: string | null
): Promise<boolean | null> {
  if (!dbConfigured() || !guestHandle) return null;
  try {
    const agent = await prisma.agent.findUnique({ where: { slug } });
    if (!agent) return null;
    const guest = await prisma.creator.findUnique({ where: { handle: guestHandle } });
    if (!guest) return false;
    const existing = await prisma.follow.findUnique({
      where: { followerId_agentId: { followerId: guest.id, agentId: agent.id } },
    });
    return !!existing;
  } catch {
    return null;
  }
}

/** Check whether the guest follows a creator. Null when DB is unavailable. */
export async function creatorFollowStatus(
  handle: string,
  guestHandle: string | null
): Promise<{ following: boolean | null; count: number | null }> {
  const normalized = handle.startsWith("@") ? handle : `@${handle}`;
  if (!dbConfigured()) return { following: null, count: null };
  try {
    const creator = await prisma.creator.findUnique({ where: { handle: normalized } });
    if (!creator) return { following: null, count: null };
    const count = await prisma.follow.count({ where: { creatorId: creator.id } });
    if (!guestHandle) return { following: false, count };
    const guest = await prisma.creator.findUnique({ where: { handle: guestHandle } });
    if (!guest) return { following: false, count };
    const existing = await prisma.follow.findUnique({
      where: { followerId_creatorId: { followerId: guest.id, creatorId: creator.id } },
    });
    return { following: !!existing, count };
  } catch {
    return { following: null, count: null };
  }
}
