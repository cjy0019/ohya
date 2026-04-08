"use client";

import { useKakaoLoader as useLoader } from "react-kakao-maps-sdk";

export default function useKakaoLoader() {
  const [loading, loadError] = useLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY ?? "",
    libraries: ["clusterer", "drawing", "services"],
  });

  return { isLoaded: !loading, loadError };
}
