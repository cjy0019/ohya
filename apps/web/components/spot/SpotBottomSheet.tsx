"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import { useSpotStore } from "@/stores/spotStore";
import SpotCard from "./SpotCard";

const SNAP_POINTS = [0.12, 0.5, 1] as const;

const CATEGORY_EMOJI_MAP: Record<string, string> = {
  cafe: "☕",
  bar: "🍺",
  restaurant: "🍽",
  park: "🌿",
  etc: "📍",
};

const YAJANG_LABEL_MAP: Record<string, string> = {
  full_outdoor: "완전 야외",
  terrace: "테라스",
  rooftop: "루프탑",
  riverside: "강변",
  beachside: "해변",
};

const CATEGORY_FILTERS = [
  { key: "all", label: "전체", emoji: "🗺" },
  { key: "restaurant", label: "음식점", emoji: "🍽" },
  { key: "cafe", label: "카페", emoji: "☕" },
  { key: "bar", label: "술집", emoji: "🍺" },
  { key: "park", label: "공원", emoji: "🌿" },
] as const;

type CategoryKey = (typeof CATEGORY_FILTERS)[number]["key"];

export default function SpotBottomSheet() {
  const { spots, selectedSpot, setSelectedSpot, isLoading } = useSpotStore();
  const [snap, setSnap] = useState<number | string | null>(0.12);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");

  const handleSpotClick = (spotId: string) => {
    const spot = spots.find((s) => s.id === spotId);
    if (spot) {
      setSelectedSpot(spot);
      setSnap(0.5);
    }
  };

  const filteredSpots =
    activeCategory === "all"
      ? spots
      : spots.filter((s) => s.category === activeCategory);

  return (
    <Drawer.Root
      open
      snapPoints={[...SNAP_POINTS]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      modal={false}
      dismissible={false}
    >
      <Drawer.Portal>
        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[24px] bg-[var(--color-surface)] outline-none"
          style={{
            height: "96dvh",
            boxShadow: "var(--shadow-sheet)",
          }}
        >
          {/* 핸들 */}
          <div className="flex justify-center pt-3 pb-2 shrink-0">
            <div
              className="h-1.5 w-12 rounded-full"
              style={{ backgroundColor: "var(--color-border-strong)" }}
            />
          </div>

          {/* 콘텐츠 영역 */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {snap === 1 ? (
              // ── 리스트뷰 (풀 오픈) ─────────────────────────────────
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* 헤더 */}
                <div className="px-5 pt-1 pb-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <h2
                      className="text-xl font-bold"
                      style={{ color: "var(--color-text)" }}
                    >
                      주변 야장
                      <span
                        className="ml-1.5 text-sm font-normal"
                        style={{ color: "var(--color-muted-light)" }}
                      >
                        {filteredSpots.length}곳
                      </span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => setSnap(0.12)}
                      className="rounded-full p-1.5 transition-colors"
                      style={{ color: "var(--color-muted)" }}
                      aria-label="접기"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M5 12.5L10 7.5L15 12.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* 카테고리 필터 칩 */}
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {CATEGORY_FILTERS.map((f) => {
                      const isActive = activeCategory === f.key;
                      return (
                        <button
                          key={f.key}
                          type="button"
                          onClick={() => setActiveCategory(f.key)}
                          className="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all"
                          style={
                            isActive
                              ? {
                                  backgroundColor: "var(--color-primary)",
                                  color: "#FFFFFF",
                                  boxShadow: "var(--shadow-chip)",
                                }
                              : {
                                  backgroundColor: "var(--color-primary-subtle)",
                                  color: "var(--color-primary-dark)",
                                }
                          }
                        >
                          <span>{f.emoji}</span>
                          <span>{f.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 구분선 */}
                <div
                  className="h-px mx-5 shrink-0"
                  style={{ backgroundColor: "var(--color-border)" }}
                />

                {/* 목록 */}
                {isLoading ? (
                  <div className="flex flex-1 items-center justify-center">
                    <div
                      className="h-7 w-7 animate-spin rounded-full border-2 border-t-transparent"
                      style={{ borderColor: "var(--color-primary)" }}
                    />
                  </div>
                ) : filteredSpots.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center px-8">
                    <span className="text-5xl">🍺</span>
                    <p
                      className="font-medium"
                      style={{ color: "var(--color-muted)" }}
                    >
                      주변에 야장이 없어요
                    </p>
                    <p className="text-sm" style={{ color: "var(--color-muted-light)" }}>
                      반경을 넓혀서 다시 탐색해볼까요?
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto">
                    <ul className="space-y-1.5 px-4 py-3 pb-8">
                      {filteredSpots.map((spot) => (
                        <li key={spot.id}>
                          <SpotCard
                            spot={spot}
                            compact
                            onClick={() => handleSpotClick(spot.id)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : selectedSpot ? (
              // ── 선택된 spot 카드 ───────────────────────────────────
              <div className="flex flex-col gap-3 px-4 pt-1 pb-6">
                <SpotCard spot={selectedSpot} />
                <button
                  type="button"
                  onClick={() => setSnap(1)}
                  className="w-full rounded-2xl py-3 text-sm font-semibold transition-opacity active:opacity-70"
                  style={{
                    backgroundColor: "var(--color-primary-subtle)",
                    color: "var(--color-primary-dark)",
                  }}
                >
                  주변 야장 전체보기 ({spots.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpot(null);
                    setSnap(0.12);
                  }}
                  className="text-center text-sm"
                  style={{ color: "var(--color-muted-light)" }}
                >
                  닫기
                </button>
              </div>
            ) : (
              // ── 기본 (접혀있는) 상태 — 가로 스크롤 미리보기 ──────
              <div className="flex flex-col overflow-hidden">
                {/* 상단: 카운트 + 목록보기 버튼 */}
                <div className="flex items-center justify-between px-5 pb-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🌿</span>
                    <p className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>
                      {isLoading
                        ? "주변 야장 탐색 중..."
                        : `주변 야장 ${spots.length}곳`}
                    </p>
                  </div>
                  {spots.length > 0 && !isLoading && (
                    <button
                      type="button"
                      onClick={() => setSnap(1)}
                      className="flex items-center gap-1 rounded-full px-3.5 py-1 text-xs font-semibold transition-opacity active:opacity-70"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        color: "#FFFFFF",
                      }}
                    >
                      <span>목록</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M4 3L7 6L4 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>

                {/* 가로 스크롤 미리보기 카드 */}
                {spots.length > 0 && !isLoading && (
                  <div className="flex gap-2.5 overflow-x-auto px-5 pb-2 scrollbar-none">
                    {spots.slice(0, 8).map((spot) => (
                      <button
                        key={spot.id}
                        type="button"
                        onClick={() => handleSpotClick(spot.id)}
                        className="flex shrink-0 flex-col rounded-2xl p-3 text-left transition-all active:scale-[0.97]"
                        style={{
                          width: 140,
                          backgroundColor: "var(--color-surface)",
                          boxShadow: "var(--shadow-card)",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        <span className="text-2xl mb-1.5">{CATEGORY_EMOJI_MAP[spot.category] ?? "📍"}</span>
                        <p
                          className="text-xs font-semibold truncate w-full"
                          style={{ color: "var(--color-text)" }}
                        >
                          {spot.name}
                        </p>
                        <p
                          className="mt-0.5 text-[10px] truncate w-full"
                          style={{ color: "var(--color-muted-light)" }}
                        >
                          {YAJANG_LABEL_MAP[spot.yajang_type] ?? spot.yajang_type}
                        </p>
                        {spot.review_count > 0 && (
                          <div className="mt-1.5 flex items-center gap-0.5">
                            <span className="text-[10px]" style={{ color: "var(--color-warning)" }}>★</span>
                            <span className="text-[10px] font-medium" style={{ color: "var(--color-muted)" }}>
                              {spot.avg_rating}
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {isLoading && (
                  <div className="flex items-center justify-center py-2">
                    <div
                      className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
                      style={{ borderColor: "var(--color-primary)" }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
