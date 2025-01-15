// constants.ts
export const BATCH_YEARS = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th (masters)",
] as const;
export type BatchYear = (typeof BATCH_YEARS)[number];

export const SCHOOL_OPTIONS = {
  ECSOE: {
    streams: ["CSE", "ARI", "MEC", "NAN"] as const,
    availableByBatch: {
      "1st": ["CSE", "ARI"],
      "2nd": ["CSE", "ARI", "MEC", "NAN"],
      "3rd": ["CSE", "MEC", "NAN"],
      "4th": ["CSE", "ARI"],
      "5th (masters)": [],
    } as Record<BatchYear, readonly string[]>,
  },
  SOM: {
    streams: ["DT", "EF"] as const,
    availableByBatch: {
      "1st": ["DT", "EF"],
      "2nd": ["DT", "EF"],
      "3rd": ["DT", "EF"],
      "4th": ["DT", "EF"],
      "5th (masters)": ["DT"],
    } as Record<BatchYear, readonly string[]>,
  },
  IMSOE: {
    streams: ["PHYSICS", "CHEMISTRY", "MATHEMATICS"] as const,
    availableByBatch: {
      "1st": ["PHYSICS", "CHEMISTRY"],
      "2nd": ["PHYSICS", "CHEMISTRY", "MATHEMATICS"],
      "3rd": ["PHYSICS", "CHEMISTRY", "MATHEMATICS"],
      "4th": ["PHYSICS", "CHEMISTRY"],
      "5th (masters)": ["PHYSICS"],
    } as Record<BatchYear, readonly string[]>,
  },
  SOL: {
    streams: ["PHYSICS", "CHEMISTRY", "MATHEMATICS"] as const,
    availableByBatch: {
      "1st": ["PHYSICS", "CHEMISTRY"],
      "2nd": ["PHYSICS", "CHEMISTRY", "MATHEMATICS"],
      "3rd": ["PHYSICS", "CHEMISTRY", "MATHEMATICS"],
      "4th": ["PHYSICS", "CHEMISTRY"],
      "5th (masters)": ["PHYSICS"],
    } as Record<BatchYear, readonly string[]>,
  },
};

// Define explicit types for better type safety
export type SchoolOption = keyof typeof SCHOOL_OPTIONS;

export type SchoolOptionsType = typeof SCHOOL_OPTIONS;

// Type helper for available streams
export type AvailableStreams<
  S extends SchoolOption,
  B extends BatchYear
> = (typeof SCHOOL_OPTIONS)[S]["availableByBatch"][B];
