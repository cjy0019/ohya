"use client";

import { useEffect, useRef, useState } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import useKakaoLoader from "./useKakaoLoader";
import { useSpotStore } from "@/stores/spotStore";
import type { Spot } from "@/stores/spotStore";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // 서울 시청 fallback
const DEFAULT_LEVEL = 5;

// 카테고리별 아이콘 (SVG 내부 텍스트용)
const CATEGORY_EMOJI: Record<string, string> = {
  cafe: "☕",
  bar: "🍺",
  restaurant: "🍽",
  park: "🌿",
  etc: "📍",
};

/**
 * 브랜드 컬러 커스텀 맵 핀 SVG를 data URI로 반환.
 * selected: 더 크고 진한 핀 (사이즈도 달라짐)
 */
function makeMarkerDataUri(category: string, selected: boolean): string {
  const emoji = CATEGORY_EMOJI[category] ?? "📍";
  const bg = selected ? "%23B84E1F" : "%23D9622B"; // %23 = '#'
  const ringColor = selected ? "%23FFFFFF" : "%23F7EDE6";
  const w = selected ? 44 : 36;
  const h = selected ? 56 : 46;
  const cx = w / 2;
  const r = selected ? 14 : 11;
  // 핀 몸통 path (물방울 모양)
  const pinPath = `M${cx} 2 C${cx - r * 1.6} 2 ${2} ${r * 1.6 + 2} 2 ${cx + r * 0.4} C2 ${cx + r * 2.2} ${cx} ${h} ${cx} ${h} S${w - 2} ${cx + r * 2.2} ${w - 2} ${cx + r * 0.4} C${w - 2} ${r * 1.6 + 2} ${cx + r * 1.6} 2 ${cx} 2Z`;

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>
    <filter id='s' x='-20%' y='-20%' width='140%' height='140%'>
      <feDropShadow dx='0' dy='2' stdDeviation='${selected ? 3 : 2}' flood-color='rgba(0,0,0,0.28)'/>
    </filter>
    <path d='${pinPath}' fill='${bg}' filter='url(%23s)'/>
    <circle cx='${cx}' cy='${cx - 2}' r='${r - 1}' fill='${ringColor}'/>
    <text x='${cx}' y='${cx + 5}' text-anchor='middle' font-size='${selected ? 13 : 10}' font-family='system-ui'>${emoji}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${svg.replace(/\s+/g, " ").trim()}`;
}

export default function KakaoMap() {
  const { isLoaded, loadError } = useKakaoLoader();
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const didGeolocate = useRef(false);

  const { spots, selectedSpot, fetchSpots, setUserLocation, setSelectedSpot } =
    useSpotStore();

  // 현재 위치 요청 및 spots 로드
  useEffect(() => {
    if (!isLoaded || didGeolocate.current) return;
    didGeolocate.current = true;

    if (!navigator.geolocation) {
      fetchSpots(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(loc);
        setUserLocation(loc);
        fetchSpots(loc.lat, loc.lng);
      },
      () => {
        // 권한 거부 시 서울 시청 기준으로 fallback
        fetchSpots(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      },
      { timeout: 8000 }
    );
  }, [isLoaded, fetchSpots, setUserLocation]);

  // 지도 이동/줌 변경 시 현재 중심 기준으로 spots 재호출
  const handleMapMoved = (map: kakao.maps.Map) => {
    const latlng = map.getCenter();
    fetchSpots(latlng.getLat(), latlng.getLng());
  };

  if (loadError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--color-background)]">
        <p className="text-sm text-[var(--color-muted)]">
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
      center={center}
      level={DEFAULT_LEVEL}
      className="h-full w-full"
      onDragEnd={handleMapMoved}
      onZoomChanged={handleMapMoved}
    >
      {spots.map((spot: Spot) => {
        const isSelected = selectedSpot?.id === spot.id;
        const markerSrc = makeMarkerDataUri(spot.category, isSelected);
        const markerSize = isSelected
          ? { width: 44, height: 56 }
          : { width: 36, height: 46 };

        return (
          <MapMarker
            key={spot.id}
            position={{ lat: spot.lat, lng: spot.lng }}
            title={spot.name}
            onClick={() => setSelectedSpot(spot)}
            image={{
              src: markerSrc,
              size: markerSize,
              options: {
                // 핀 끝(tip)이 좌표에 닿도록 앵커 조정
                offset: { x: markerSize.width / 2, y: markerSize.height },
              },
            }}
          />
        );
      })}
    </Map>
  );
}
