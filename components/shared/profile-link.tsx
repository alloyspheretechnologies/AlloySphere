"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface ProfileLinkProps {
  profileId: string;
  role?: string | null;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps children in a <Link> that routes to the correct role-based profile page.
 * - investor → /investor/[id]
 * - talent   → /talent/[id]
 * - founder  → /profile/[id]
 * - default  → /profile/[id]
 */
export function ProfileLink({ profileId, role, children, className }: ProfileLinkProps) {
  const href = getProfileHref(profileId, role);

  return (
    <Link href={href} className={className} onClick={(e) => e.stopPropagation()}>
      {children}
    </Link>
  );
}

export function getProfileHref(profileId: string, role?: string | null): string {
  if (role === "investor") return `/investor/${profileId}`;
  if (role === "talent") return `/talent/${profileId}`;
  return `/profile/${profileId}`;
}
