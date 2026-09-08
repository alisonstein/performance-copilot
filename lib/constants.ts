import type { Platform } from "@/types/database";

export const PLATFORM_LABELS: Record<Platform, string> = {
  meta_ads: "Meta Ads",
  google_ads: "Google Ads",
};

export const PLATFORM_OPTIONS: Array<{ value: Platform; label: string }> = [
  { value: "meta_ads", label: "Meta Ads" },
  { value: "google_ads", label: "Google Ads" },
];

export const MAX_CSV_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
