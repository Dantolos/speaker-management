import type { MetricBucket } from "@/services/speaker/dashboard";

const KNOWN_GENDER_KEYS = ["m", "f", "d"] as const;

export function translateGender(
  buckets: MetricBucket[],
  t: (key: string) => string,
): MetricBucket[] {
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  if (total === 0) return buckets;

  return buckets.map((b) => {
    const translated = (KNOWN_GENDER_KEYS as readonly string[]).includes(
      b.label,
    )
      ? t(b.label)
      : b.label;
    const pct = Math.round((b.count / total) * 100);
    return {
      label: `${translated} (${pct}%)`,
      count: b.count,
    };
  });
}
