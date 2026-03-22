// Shared TypeScript types for Collab World
// Re-export Prisma types + define API response types

export type ApiResponse<T> = {
  data: T;
  error?: never;
} | {
  data?: never;
  error: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type AccountType = "fan" | "creator" | "influencer" | "brand" | "admin";

export type ContestStatus = "draft" | "upcoming" | "active" | "voting" | "completed" | "archived";

export type EntryStatus = "pending" | "approved" | "rejected" | "winner";

export type EngagementType = "like" | "vote" | "comment" | "share";
