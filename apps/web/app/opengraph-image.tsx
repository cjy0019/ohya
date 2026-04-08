import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  const fontData = await readFile(
    join(
      process.cwd(),
      "node_modules/pretendard/dist/public/static/Pretendard-Bold.otf"
    )
  );
  const fontDataRegular = await readFile(
    join(
      process.cwd(),
      "node_modules/pretendard/dist/public/static/Pretendard-Regular.otf"
    )
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          background: "linear-gradient(145deg, #D9622B 0%, #A8461A 100%)",
          padding: "72px 80px",
          fontFamily: "Pretendard",
          position: "relative",
        }}
      >
        {/* 배경 원형 장식 */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "520px",
            height: "520px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "60px",
            right: "120px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            display: "flex",
          }}
        />

        {/* 날씨/야외 아이콘 영역 */}
        <div
          style={{
            position: "absolute",
            top: "72px",
            right: "80px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: "96px",
              display: "flex",
            }}
          >
            🌤️
          </div>
        </div>

        {/* 태그라인 */}
        <div
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: "28px",
            marginBottom: "20px",
            letterSpacing: "0.04em",
            display: "flex",
            fontFamily: "Pretendard",
          }}
        >
          야외 외식 장소 탐색 서비스
        </div>

        {/* 서비스명 */}
        <div
          style={{
            color: "#FFFFFF",
            fontSize: "88px",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: "32px",
            display: "flex",
            fontFamily: "Pretendard",
          }}
        >
          오늘야장
        </div>

        {/* 설명 */}
        <div
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: "32px",
            lineHeight: 1.6,
            maxWidth: "700px",
            display: "flex",
            fontFamily: "Pretendard",
          }}
        >
          따뜻한 날씨에 즐기는 전국의 야외 외식 장소를 지도로 탐색하세요.
        </div>

        {/* 하단 구분선 + URL */}
        <div
          style={{
            position: "absolute",
            bottom: "56px",
            left: "80px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "3px",
              background: "rgba(255,255,255,0.5)",
              display: "flex",
            }}
          />
          <div
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "22px",
              letterSpacing: "0.02em",
              display: "flex",
              fontFamily: "Pretendard",
            }}
          >
            oneul-yajang.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Pretendard",
          data: fontDataRegular,
          weight: 400,
        },
        {
          name: "Pretendard",
          data: fontData,
          weight: 700,
        },
      ],
    }
  );
}
