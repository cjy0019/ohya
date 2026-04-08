"use client";

import { Map } from "react-kakao-maps-sdk";
import useKakaoLoader from "./useKakaoLoader";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // 서울 시청
const DEFAULT_LEVEL = 5;

export default function KakaoMap() {
  const { isLoaded, loadError } = useKakaoLoader();

  if (loadError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--color-background)]">
        <p className="text-[var(--color-muted)] text-sm">
          지도를 불러올 수 없습니다. 카카오맵 앱 키를 확인해주세요.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--color-background)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <Map
      center={DEFAULT_CENTER}
      level={DEFAULT_LEVEL}
      className="h-full w-full"
    />
  );
}
