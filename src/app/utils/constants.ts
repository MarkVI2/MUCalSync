// constants.ts
export const BATCH_YEARS = ["2023", "2024", "2025", "2026"] as const;
export type BatchYear = (typeof BATCH_YEARS)[number];

export const SCHOOL_OPTIONS = {
  ECSOE: {
    streams: ["CSE", "ARI", "MEC", "NAN"] as const,
    availableByBatch: {
      "2023": ["CSE", "ARI"],
      "2024": ["CSE", "ME", "NAN"],
      "2025": [],
      "2026": [],
    } as Record<BatchYear, readonly string[]>,
  },
  SOM: {
    streams: ["DT", "EF"] as const,
    availableByBatch: {
      "2023": ["DT", "EF"],
      "2024": ["DT", "EF"],
      "2025": [],
      "2026": [],
    } as Record<BatchYear, readonly string[]>,
  },
  IMSOE: {
    streams: ["PHYSICS", "CHEMISTRY", "MATHEMATICS"] as const,
    availableByBatch: {
      "2023": ["PHYSICS", "CHEMISTRY"],
      "2024": ["PHYSICS", "CHEMISTRY", "MATHEMATICS"],
      "2025": [],
      "2026": [],
    } as Record<BatchYear, readonly string[]>,
  },
  SOL: {
    streams: ["PHYSICS", "CHEMISTRY", "MATHEMATICS"] as const,
    availableByBatch: {
      "2023": ["PHYSICS", "CHEMISTRY"],
      "2024": ["PHYSICS", "CHEMISTRY", "MATHEMATICS"],
      "2025": [],
      "2026": [],
    } as Record<BatchYear, readonly string[]>,
  },
  SOD: {
    streams: ["PHYSICS", "CHEMISTRY", "MATHEMATICS"] as const,
    availableByBatch: {
      "2023": ["PHYSICS", "CHEMISTRY"],
      "2024": ["PHYSICS", "CHEMISTRY", "MATHEMATICS"],
      "2025": [],
      "2026": [],
    } as Record<BatchYear, readonly string[]>,
  },
} as const;

// Define explicit types for better type safety
export type SchoolOption = keyof typeof SCHOOL_OPTIONS;

export type SchoolOptionsType = typeof SCHOOL_OPTIONS;

// Type helper for available streams
export type AvailableStreams<
  S extends SchoolOption,
  B extends BatchYear
> = (typeof SCHOOL_OPTIONS)[S]["availableByBatch"][B];
