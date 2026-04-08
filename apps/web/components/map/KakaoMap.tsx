"use client";

import { useEffect, useRef, useState } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import useKakaoLoader from "./useKakaoLoader";
import { useSpotStore } from "@/stores/spotStore";
import type { Spot } from "@/stores/spotStore";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // 서울 시청 fallback
const DEFAULT_LEVEL = 5;

// 카테고리별 이모지
const CATEGORY_EMOJI: Record<string, string> = {
  cafe: "☕",
  bar: "🍺",
  restaurant: "🍽",
  park: "🌿",
  etc: "📍",
};

// 카테고리별 컬러 (hex, URL-encoded '#' → '%23')
const CATEGORY_COLOR: Record<string, string> = {
  cafe: "%23A0522D",       // 브라운
  bar: "%232D3561",        // 딥 네이비
  restaurant: "%23D9622B", // 브랜드 오렌지
  park: "%232D7D4F",       // 그린
  etc: "%236B7280",        // 그레이
};

/**
 * 현대적인 pill(말풍선) 스타일 마커 SVG를 data URI로 반환.
 * - 기본: 흰 배경 + 카테고리 컬러 테두리 + 이모지
 * - selected: 카테고리 컬러 배경 + 흰 테두리 + 이모지 + 강한 그림자
 */
function makeMarkerDataUri(category: string, selected: boolean): string {
  const emoji = CATEGORY_EMOJI[category] ?? "📍";
  const color = CATEGORY_COLOR[category] ?? "%236B7280";

  if (selected) {
    // 선택됨: 컬러 pill + 흰 테두리 + 꼬리
    const w = 56;
    const h = 46; // pill 높이 38 + 꼬리 8
    const pillH = 38;
    const r = 19; // border-radius (=pillH/2 → 완전 pill)
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>
      <filter id='sh' x='-30%' y='-30%' width='160%' height='160%'>
        <feDropShadow dx='0' dy='3' stdDeviation='4' flood-color='rgba(0,0,0,0.32)'/>
      </filter>
      <g filter='url(%23sh)'>
        <rect x='2' y='2' width='${w - 4}' height='${pillH - 4}' rx='${r - 2}' fill='${color}'/>
        <polygon points='${w / 2 - 6},${pillH - 2} ${w / 2 + 6},${pillH - 2} ${w / 2},${h - 1}' fill='${color}'/>
      </g>
      <rect x='2' y='2' width='${w - 4}' height='${pillH - 4}' rx='${r - 2}' fill='none' stroke='%23FFFFFF' stroke-width='2'/>
      <text x='${w / 2}' y='${(pillH - 4) / 2 + 7}' text-anchor='middle' font-size='16' font-family='system-ui'>${emoji}</text>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${svg.replace(/\s+/g, " ").trim()}`;
  }

  // 기본: 흰 pill + 컬러 테두리 + 꼬리
  const w = 44;
  const h = 38; // pill 30 + 꼬리 8
  const pillH = 30;
  const r = 15;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>
    <filter id='sh' x='-30%' y='-30%' width='160%' height='160%'>
      <feDropShadow dx='0' dy='2' stdDeviation='2.5' flood-color='rgba(0,0,0,0.18)'/>
    </filter>
    <g filter='url(%23sh)'>
      <rect x='2' y='2' width='${w - 4}' height='${pillH - 4}' rx='${r - 2}' fill='%23FFFFFF'/>
      <polygon points='${w / 2 - 5},${pillH - 2} ${w / 2 + 5},${pillH - 2} ${w / 2},${h - 1}' fill='%23FFFFFF'/>
    </g>
    <rect x='2' y='2' width='${w - 4}' height='${pillH - 4}' rx='${r - 2}' fill='none' stroke='${color}' stroke-width='2'/>
    <text x='${w / 2}' y='${(pillH - 4) / 2 + 6}' text-anchor='middle' font-size='13' font-family='system-ui'>${emoji}</text>
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
        // 선택됨: 56×46, 기본: 44×38
        const markerSize = isSelected
          ? { width: 56, height: 46 }
          : { width: 44, height: 38 };

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
                // pill 꼬리 끝이 좌표에 닿도록 앵커 조정
                offset: { x: markerSize.width / 2, y: markerSize.height },
              },
            }}
          />
        );
      })}
    </Map>
  );
}
