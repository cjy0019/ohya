"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import { useSpotStore } from "@/stores/spotStore";
import SpotCard from "./SpotCard";

const SNAP_POINTS = [0.12, 0.5, 1] as const;

export default function SpotBottomSheet() {
  const { spots, selectedSpot, setSelectedSpot, isLoading } = useSpotStore();
  const [snap, setSnap] = useState<number | string | null>(0.12);

  const handleSpotClick = (spotId: string) => {
    const spot = spots.find((s) => s.id === spotId);
    if (spot) {
      setSelectedSpot(spot);
      setSnap(0.5);
    }
  };

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
          className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[20px] bg-white outline-none"
          style={{ height: "96dvh" }}
        >
          {/* 핸들 */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="h-1 w-10 rounded-full bg-gray-300" />
          </div>

          {/* 콘텐츠 영역 */}
          <div className="flex flex-1 flex-col overflow-hidden px-4 pb-6">
            {snap === 1 ? (
              // ── 리스트뷰 (풀 오픈) ─────────────────────────────────
              <div className="flex flex-1 flex-col">
                <div className="flex items-center justify-between py-2">
                  <h2 className="text-lg font-bold text-gray-900">
                    주변 야장
                    <span className="ml-1.5 text-sm font-normal text-gray-400">
                      {spots.length}개
                    </span>
                  </h2>
                </div>

                {isLoading ? (
                  <div className="flex flex-1 items-center justify-center">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
                  </div>
                ) : spots.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                    <p className="text-4xl">🍺</p>
                    <p className="font-medium text-gray-500">주변에 야장이 없어요</p>
                    <p className="text-sm text-gray-400">반경을 넓혀서 다시 탐색해볼까요?</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto">
                    <ul className="space-y-2 pb-4">
                      {spots.map((spot) => (
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
              <div className="flex flex-col gap-3 pt-1">
                <SpotCard spot={selectedSpot} />
                <button
                  type="button"
                  onClick={() => {
                    setSnap(1);
                  }}
                  className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 active:bg-gray-50"
                >
                  주변 야장 전체보기 ({spots.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpot(null);
                    setSnap(0.12);
                  }}
                  className="text-center text-sm text-gray-400"
                >
                  닫기
                </button>
              </div>
            ) : (
              // ── 기본 (접혀있는) 상태 ──────────────────────────────
              <div className="flex items-center justify-between pt-1">
                <p className="text-sm text-gray-500">
                  {isLoading
                    ? "주변 야장 탐색 중..."
                    : `주변 야장 ${spots.length}개`}
                </p>
                {spots.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSnap(1)}
                    className="text-sm font-medium text-orange-500"
                  >
                    목록보기
                  </button>
                )}
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
