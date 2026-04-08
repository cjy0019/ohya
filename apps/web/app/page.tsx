import KakaoMap from "@/components/map/KakaoMap";
import SpotBottomSheet from "@/components/spot/SpotBottomSheet";

export default function Home() {
  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <KakaoMap />
      <SpotBottomSheet />
    </main>
  );
}
