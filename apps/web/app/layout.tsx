import type { Metadata } from "next";
import localFont from "next/font/local";
import { Fraunces } from "next/font/google";
import "./globals.css";

const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://oneul-yajang.vercel.app";

export const metadata: Metadata = {
  title: "오늘야장 — 야외 외식 장소 탐색",
  description: "따뜻한 날씨에 즐기는 야외 외식 장소를 발견하세요. 전국의 야장 맛집을 지도로 탐색하세요.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "오늘야장 — 야외 외식 장소 탐색",
    description: "따뜻한 날씨에 즐기는 야외 외식 장소를 발견하세요. 전국의 야장 맛집을 지도로 탐색하세요.",
    url: siteUrl,
    siteName: "오늘야장",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "오늘야장 — 야외 외식 장소 탐색",
    description: "따뜻한 날씨에 즐기는 야외 외식 장소를 발견하세요. 전국의 야장 맛집을 지도로 탐색하세요.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
