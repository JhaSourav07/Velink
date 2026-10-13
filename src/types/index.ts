// src/types/index.ts
export type UserRole = "OWNER" | "ADMIN" | "MEMBER";
export type WorkspacePlan = "FREE" | "PRO" | "ENTERPRISE";

export interface ShortLink {
  id: string;
  domain: string;
  slug: string;
  url: string;
  password?: string | null;
  expiresAt?: Date | string | null;
  archived: boolean;
  workspaceId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ClickRecord {
  id: string;
  timestamp: Date | string;
  country?: string | null;
  city?: string | null;
  device?: string | null;
  browser?: string | null;
  os?: string | null;
  referer?: string | null;
  linkId: string;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  plan: WorkspacePlan;
  createdAt: Date | string;
}
