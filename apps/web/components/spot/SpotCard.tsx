"use client";

import type { Spot } from "@/stores/spotStore";

const YAJANG_LABEL: Record<string, string> = {
  full_outdoor: "완전 야외",
  terrace: "테라스",
  rooftop: "루프탑",
  riverside: "강변",
  beachside: "해변",
};

const CATEGORY_LABEL: Record<string, string> = {
  restaurant: "음식점",
  cafe: "카페",
  bar: "술집",
  park: "공원",
  etc: "기타",
};

interface SpotCardProps {
  spot: Spot;
  onClick?: () => void;
  compact?: boolean;
}

export default function SpotCard({ spot, onClick, compact = false }: SpotCardProps) {
  const yajangLabel = YAJANG_LABEL[spot.yajang_type] ?? spot.yajang_type;
  const categoryLabel = CATEGORY_LABEL[spot.category] ?? spot.category;

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-xl bg-[var(--color-surface)] px-4 py-3 text-left active:scale-[0.98] transition-transform"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-lg">
          {spot.category === "cafe" ? "☕" : spot.category === "bar" ? "🍻" : "🍽"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-[var(--color-text)]">{spot.name}</p>
          <p className="truncate text-xs text-[var(--color-muted)]">{spot.address}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
          {yajangLabel}
        </span>
      </button>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-[var(--color-surface)] p-4">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text)]">{spot.name}</h2>
          {spot.address && (
            <p className="mt-0.5 text-sm text-[var(--color-muted)]">{spot.address}</p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
          {yajangLabel}
        </span>
      </div>

      {/* 배지들 */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge label={categoryLabel} />
        {spot.is_outdoor && <Badge label="야외석" />}
        {spot.has_heater && <Badge label="난방기" />}
        {spot.has_shelter && <Badge label="차양막" />}
        {spot.pet_friendly && <Badge label="반려동물" />}
        {spot.is_verified && <Badge label="인증" accent />}
      </div>

      {/* 평점 */}
      {spot.review_count > 0 && (
        <div className="mt-3 flex items-center gap-1 text-sm text-[var(--color-muted)]">
          <span className="text-amber-400">★</span>
          <span>{spot.avg_rating ?? "—"}</span>
          <span>({spot.review_count})</span>
        </div>
      )}
    </div>
  );
}

function Badge({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <span
      className={[
        "rounded-full px-2.5 py-0.5 text-xs font-medium",
        accent
          ? "bg-amber-400/20 text-amber-600"
          : "bg-[var(--color-background)] text-[var(--color-muted)]",
      ].join(" ")}
    >
      {label}
    </span>
  );
}
