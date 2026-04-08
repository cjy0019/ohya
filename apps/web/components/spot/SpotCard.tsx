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

// 카테고리별 그라데이션 배경 (이미지 플레이스홀더용)
const CATEGORY_GRADIENT: Record<string, string> = {
  cafe: "linear-gradient(135deg, #6B4E3D 0%, #A0745A 100%)",
  bar: "linear-gradient(135deg, #2D3A4A 0%, #4A6070 100%)",
  restaurant: "linear-gradient(135deg, #7A3B1E 0%, #C4672B 100%)",
  park: "linear-gradient(135deg, #2D5A27 0%, #5A8F53 100%)",
  etc: "linear-gradient(135deg, #4A3F35 0%, #8A7060 100%)",
};

const CATEGORY_EMOJI: Record<string, string> = {
  cafe: "☕",
  bar: "🍺",
  restaurant: "🍽",
  park: "🌿",
  etc: "📍",
};

interface SpotCardProps {
  spot: Spot;
  onClick?: () => void;
  compact?: boolean;
}

export default function SpotCard({ spot, onClick, compact = false }: SpotCardProps) {
  const yajangLabel = YAJANG_LABEL[spot.yajang_type] ?? spot.yajang_type;
  const categoryLabel = CATEGORY_LABEL[spot.category] ?? spot.category;
  const gradient = CATEGORY_GRADIENT[spot.category] ?? CATEGORY_GRADIENT.etc;
  const emoji = CATEGORY_EMOJI[spot.category] ?? "📍";

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-all active:scale-[0.98]"
        style={{
          backgroundColor: "var(--color-surface)",
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* 카테고리 아이콘 */}
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
          style={{ background: gradient }}
        >
          {emoji}
        </div>

        {/* 텍스트 */}
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-semibold leading-snug"
            style={{ color: "var(--color-text)" }}
          >
            {spot.name}
          </p>
          <p
            className="mt-0.5 truncate text-xs"
            style={{ color: "var(--color-muted-light)" }}
          >
            {spot.address}
          </p>
          {/* 평점 인라인 표시 */}
          {spot.review_count > 0 && (
            <div className="mt-1 flex items-center gap-0.5">
              <span className="text-xs" style={{ color: "var(--color-warning)" }}>★</span>
              <span className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>
                {spot.avg_rating}
              </span>
              <span className="text-xs" style={{ color: "var(--color-muted-light)" }}>
                ({spot.review_count})
              </span>
            </div>
          )}
        </div>

        {/* 야장 타입 배지 + 화살표 */}
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{
              backgroundColor: "var(--color-primary-subtle)",
              color: "var(--color-primary-dark)",
            }}
          >
            {yajangLabel}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            style={{ color: "var(--color-border-strong)" }}
          >
            <path
              d="M6 4L10 8L6 12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>
    );
  }

  // ── Full 카드 ──────────────────────────────────────────────
  return (
    <div
      className="w-full overflow-hidden rounded-2xl"
      style={{
        boxShadow: "var(--shadow-card)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* 이미지 플레이스홀더 */}
      <div
        className="relative flex h-44 items-center justify-center"
        style={{ background: gradient }}
      >
        <span className="text-6xl opacity-70">{emoji}</span>

        {/* 야장 타입 배지 */}
        <span
          className="absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        >
          {yajangLabel}
        </span>

        {/* 인증 배지 */}
        {spot.is_verified && (
          <span
            className="absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: "var(--color-success)" }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M2 5L4 7L8 3"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            인증
          </span>
        )}

        {/* 평점 오버레이 (리뷰 있을 때) */}
        {spot.review_count > 0 && (
          <div
            className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1"
            style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          >
            <span className="text-xs text-yellow-300">★</span>
            <span className="text-xs font-semibold text-white">{spot.avg_rating}</span>
            <span className="text-xs text-white/70">({spot.review_count})</span>
          </div>
        )}
      </div>

      {/* 정보 영역 */}
      <div
        className="p-4"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        {/* 이름 */}
        <h2
          className="text-lg font-bold leading-tight"
          style={{
            color: "var(--color-text)",
            fontFamily: "var(--font-display)",
          }}
        >
          {spot.name}
        </h2>
        {spot.address && (
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--color-muted)" }}
          >
            {spot.address}
          </p>
        )}

        {/* 배지들 */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge label={categoryLabel} primary />
          {spot.is_outdoor && <Badge label="야외석" />}
          {spot.has_heater && <Badge label="🔥 난방기" />}
          {spot.has_shelter && <Badge label="⛱ 차양막" />}
          {spot.pet_friendly && <Badge label="🐾 반려동물" />}
        </div>
      </div>
    </div>
  );
}

function Badge({ label, primary = false }: { label: string; primary?: boolean }) {
  if (primary) {
    return (
      <span
        className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
        style={{
          backgroundColor: "var(--color-primary-subtle)",
          color: "var(--color-primary-dark)",
        }}
      >
        {label}
      </span>
    );
  }
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: "var(--color-background)",
        color: "var(--color-muted)",
        border: "1px solid var(--color-border)",
      }}
    >
      {label}
    </span>
  );
}
