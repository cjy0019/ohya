"use client";

import { useEffect, useRef, useState } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import useKakaoLoader from "./useKakaoLoader";
import { useSpotStore } from "@/stores/spotStore";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // 서울 시청 fallback
const DEFAULT_LEVEL = 5;

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
      center={center}
      level={DEFAULT_LEVEL}
      className="h-full w-full"
    >
      {spots.map((spot) => (
        <MapMarker
          key={spot.id}
          position={{ lat: spot.lat, lng: spot.lng }}
          title={spot.name}
          onClick={() => setSelectedSpot(spot)}
          image={
            selectedSpot?.id === spot.id
              ? {
                  // 선택된 마커는 강조 색상 (기본 마커 오버라이드)
                  src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                  size: { width: 24, height: 35 },
                }
              : undefined
          }
        />
      ))}
    </Map>
  );
}
