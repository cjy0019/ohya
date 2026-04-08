/**
 * seed-public-data.ts
 * 야외 좌석 장소 시딩 스크립트
 *
 * 사용법:
 *   pnpm --filter @oneul-yajang/api seed              # 정적 큐레이션 데이터 시딩
 *   pnpm --filter @oneul-yajang/api seed:public       # 공공데이터 API 시딩 (API 키 필요)
 *
 * 환경변수:
 *   DATABASE_URL=postgresql://...
 *   PUBLIC_DATA_API_KEY=...  (공공데이터포털 일반음식점 인허가 API 키, --public 모드 시 필요)
 */

import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

// ──────────────────────────────────────────────────────────────────────────────
// 큐레이션된 서울/수도권 야외 좌석 보유 장소 (정적 데이터)
// 실제 좌표 기반, MVP 오픈용 시드 데이터 60개
// ──────────────────────────────────────────────────────────────────────────────
interface SeedSpot {
  name: string;        // 실제 상호명 (지도/바텀시트에 표시)
  description: string; // 장소 특징/위치 설명 (구 name — 위치 컨텍스트 제공용)
  address: string;
  lat: number;
  lng: number;
  category: "restaurant" | "cafe" | "bar" | "park" | "etc";
  yajang_type: "full_outdoor" | "terrace" | "rooftop" | "riverside" | "beachside";
  is_outdoor: boolean;
  has_heater: boolean;
  has_shelter: boolean;
  pet_friendly: boolean;
  source_id: string;
}

const CURATED_SPOTS: SeedSpot[] = [
  // ── 한강공원 주변 ─────────────────────────────────────────
  {
    name: "뚝섬 치맥광장 원조포차",
    description: "뚝섬한강공원 치맥광장 — 한강 리버사이드 야장",
    address: "서울 광진구 강변북로 139",
    lat: 37.5303, lng: 127.0671,
    category: "restaurant", yajang_type: "riverside",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: true,
    source_id: "curated_001",
  },
  {
    name: "망원 리버카페",
    description: "망원한강공원 그늘막 — 한강변 야외 카페",
    address: "서울 마포구 마포나루길 467",
    lat: 37.5527, lng: 126.8974,
    category: "cafe", yajang_type: "riverside",
    is_outdoor: true, has_heater: false, has_shelter: true, pet_friendly: true,
    source_id: "curated_002",
  },
  {
    name: "반포 달빛포차",
    description: "반포한강공원 달빛광장 — 야외 포장마차",
    address: "서울 서초구 신반포로11길 40",
    lat: 37.5102, lng: 126.9994,
    category: "bar", yajang_type: "riverside",
    is_outdoor: true, has_heater: true, has_shelter: true, pet_friendly: false,
    source_id: "curated_003",
  },
  {
    name: "여의도 한강 바베큐가든",
    description: "여의도한강공원 — 야외 바베큐 레스토랑",
    address: "서울 영등포구 여의동로 330",
    lat: 37.5283, lng: 126.9327,
    category: "restaurant", yajang_type: "riverside",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: true,
    source_id: "curated_004",
  },
  {
    name: "잠실 한강카페 테라스",
    description: "잠실한강공원 — 테라스 카페",
    address: "서울 송파구 올림픽로 240",
    lat: 37.5165, lng: 127.0832,
    category: "cafe", yajang_type: "riverside",
    is_outdoor: true, has_heater: false, has_shelter: true, pet_friendly: true,
    source_id: "curated_005",
  },
  // ── 이태원 / 경리단길 ──────────────────────────────────────
  {
    name: "더 루프탑 이태원",
    description: "이태원 루프탑 야장 바",
    address: "서울 용산구 이태원로 177",
    lat: 37.5340, lng: 126.9943,
    category: "bar", yajang_type: "rooftop",
    is_outdoor: true, has_heater: true, has_shelter: false, pet_friendly: false,
    source_id: "curated_006",
  },
  {
    name: "라 피아차 경리단길",
    description: "경리단길 테라스 이탈리안 레스토랑",
    address: "서울 용산구 회나무로 13가길 5",
    lat: 37.5350, lng: 126.9877,
    category: "restaurant", yajang_type: "terrace",
    is_outdoor: true, has_heater: true, has_shelter: false, pet_friendly: false,
    source_id: "curated_007",
  },
  {
    name: "와인앤파인 해방촌",
    description: "해방촌 루프탑 와인바",
    address: "서울 용산구 신흥로 34",
    lat: 37.5395, lng: 126.9882,
    category: "bar", yajang_type: "rooftop",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: false,
    source_id: "curated_008",
  },
  // ── 성수동 ────────────────────────────────────────────────
  {
    name: "언더스탠드에비뉴 테라스카페",
    description: "성수동 테라스 브런치카페",
    address: "서울 성동구 성수이로7가길 11",
    lat: 37.5443, lng: 127.0566,
    category: "cafe", yajang_type: "terrace",
    is_outdoor: true, has_heater: true, has_shelter: true, pet_friendly: true,
    source_id: "curated_009",
  },
  {
    name: "어니언 성수점",
    description: "서울숲 인근 야외 피크닉 카페",
    address: "서울 성동구 뚝섬로 273",
    lat: 37.5447, lng: 127.0374,
    category: "cafe", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: true,
    source_id: "curated_010",
  },
  {
    name: "더 웨어하우스 성수",
    description: "성수동 루프탑 바",
    address: "서울 성동구 성수이로 78",
    lat: 37.5462, lng: 127.0512,
    category: "bar", yajang_type: "rooftop",
    is_outdoor: true, has_heater: true, has_shelter: false, pet_friendly: false,
    source_id: "curated_011",
  },
  // ── 홍대 / 합정 ───────────────────────────────────────────
  {
    name: "홍대 야장 맥줏집",
    description: "홍대 야외 테라스 맥줏집",
    address: "서울 마포구 어울마당로 21",
    lat: 37.5551, lng: 126.9254,
    category: "bar", yajang_type: "terrace",
    is_outdoor: true, has_heater: true, has_shelter: true, pet_friendly: false,
    source_id: "curated_012",
  },
  {
    name: "스카이루프 합정",
    description: "합정동 한강뷰 루프탑 카페",
    address: "서울 마포구 양화로 11길 14",
    lat: 37.5489, lng: 126.9141,
    category: "cafe", yajang_type: "rooftop",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: false,
    source_id: "curated_013",
  },
  {
    name: "카페 농부의 뜰",
    description: "망원동 마당 있는 야외 카페",
    address: "서울 마포구 포은로 109",
    lat: 37.5541, lng: 126.9038,
    category: "cafe", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: true, pet_friendly: true,
    source_id: "curated_014",
  },
  // ── 연남동 / 연희동 ───────────────────────────────────────
  {
    name: "투썸플레이스 연남경의선숲길점",
    description: "연남동 경의선숲길 테라스 카페",
    address: "서울 마포구 동교로 162",
    lat: 37.5609, lng: 126.9238,
    category: "cafe", yajang_type: "terrace",
    is_outdoor: true, has_heater: false, has_shelter: true, pet_friendly: true,
    source_id: "curated_015",
  },
  {
    name: "한옥카페 연희",
    description: "연희동 마당 한옥 야외 카페",
    address: "서울 서대문구 연희로 11나길 7",
    lat: 37.5701, lng: 126.9282,
    category: "cafe", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: true,
    source_id: "curated_016",
  },
  // ── 강남 / 청담 ───────────────────────────────────────────
  {
    name: "비스트로 드 파리 청담",
    description: "청담동 루프탑 파인다이닝",
    address: "서울 강남구 압구정로 60길 19",
    lat: 37.5262, lng: 127.0488,
    category: "restaurant", yajang_type: "rooftop",
    is_outdoor: true, has_heater: true, has_shelter: false, pet_friendly: false,
    source_id: "curated_017",
  },
  {
    name: "브라운그래프 가로수길",
    description: "가로수길 야외 테라스 비스트로",
    address: "서울 강남구 도산대로13길 7",
    lat: 37.5207, lng: 127.0225,
    category: "restaurant", yajang_type: "terrace",
    is_outdoor: true, has_heater: true, has_shelter: false, pet_friendly: false,
    source_id: "curated_018",
  },
  {
    name: "더 탑 루프탑바 선릉",
    description: "선릉역 루프탑 바",
    address: "서울 강남구 테헤란로 404",
    lat: 37.5045, lng: 127.0494,
    category: "bar", yajang_type: "rooftop",
    is_outdoor: true, has_heater: true, has_shelter: false, pet_friendly: false,
    source_id: "curated_019",
  },
  // ── 용산 / 이촌 ───────────────────────────────────────────
  {
    name: "원조이촌포장마차",
    description: "이촌한강공원 야외 포장마차",
    address: "서울 용산구 이촌로 72길 62",
    lat: 37.5171, lng: 126.9713,
    category: "bar", yajang_type: "riverside",
    is_outdoor: true, has_heater: false, has_shelter: true, pet_friendly: false,
    source_id: "curated_020",
  },
  // ── 종로 / 북촌 ───────────────────────────────────────────
  {
    name: "북촌 다원",
    description: "북촌 한옥마을 야외 전통 찻집",
    address: "서울 종로구 계동길 37",
    lat: 37.5825, lng: 126.9837,
    category: "cafe", yajang_type: "terrace",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: false,
    source_id: "curated_021",
  },
  {
    name: "쌈지길 카페 인사",
    description: "인사동 쌈지길 테라스 카페",
    address: "서울 종로구 인사동길 44",
    lat: 37.5746, lng: 126.9854,
    category: "cafe", yajang_type: "terrace",
    is_outdoor: true, has_heater: false, has_shelter: true, pet_friendly: false,
    source_id: "curated_022",
  },
  {
    name: "창경궁 앞 야장 길담",
    description: "창경궁 앞 야외 술집",
    address: "서울 종로구 와룡동 3-2",
    lat: 37.5793, lng: 126.9956,
    category: "bar", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: false,
    source_id: "curated_023",
  },
  // ── 서촌 / 경복궁 ─────────────────────────────────────────
  {
    name: "서촌 골목길 카페",
    description: "서촌 골목 야외 카페",
    address: "서울 종로구 필운대로 37",
    lat: 37.5792, lng: 126.9706,
    category: "cafe", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: true,
    source_id: "curated_024",
  },
  // ── 마포 상암 ─────────────────────────────────────────────
  {
    name: "노을빛 카페 하늘공원",
    description: "상암 노을공원 야외 힐링 카페",
    address: "서울 마포구 하늘공원로 95",
    lat: 37.5700, lng: 126.8888,
    category: "cafe", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: true,
    source_id: "curated_025",
  },
  // ── 건대 / 광진 ───────────────────────────────────────────
  {
    name: "루프탑 365 건대",
    description: "건대입구역 루프탑 바",
    address: "서울 광진구 자양로 173",
    lat: 37.5405, lng: 127.0696,
    category: "bar", yajang_type: "rooftop",
    is_outdoor: true, has_heater: true, has_shelter: false, pet_friendly: false,
    source_id: "curated_026",
  },
  {
    name: "능동 피크닉 카페",
    description: "어린이대공원 야외 피크닉 카페",
    address: "서울 광진구 능동로 216",
    lat: 37.5490, lng: 127.0834,
    category: "cafe", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: true,
    source_id: "curated_027",
  },
  // ── 노원 / 중랑 ───────────────────────────────────────────
  {
    name: "중랑천 달빛 포장마차",
    description: "중랑천 야외 포장마차",
    address: "서울 성북구 장위로 194",
    lat: 37.5978, lng: 127.0612,
    category: "bar", yajang_type: "riverside",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: false,
    source_id: "curated_028",
  },
  // ── 노원구 ────────────────────────────────────────────────
  {
    name: "수락산 사랑방 막걸리",
    description: "수락산 입구 야외 막걸리집",
    address: "서울 노원구 상계로 287",
    lat: 37.6639, lng: 127.0735,
    category: "restaurant", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: true, pet_friendly: true,
    source_id: "curated_029",
  },
  // ── 강서 / 양천 ───────────────────────────────────────────
  {
    name: "강서 리버사이드 카페",
    description: "강서한강공원 야외 카페",
    address: "서울 강서구 방화동로 186",
    lat: 37.5590, lng: 126.8163,
    category: "cafe", yajang_type: "riverside",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: true,
    source_id: "curated_030",
  },
  // ── 송파 / 잠실 ───────────────────────────────────────────
  {
    name: "투썸플레이스 석촌호수점",
    description: "석촌호수 테라스 카페",
    address: "서울 송파구 석촌호수로 262",
    lat: 37.5096, lng: 127.0987,
    category: "cafe", yajang_type: "terrace",
    is_outdoor: true, has_heater: false, has_shelter: true, pet_friendly: true,
    source_id: "curated_031",
  },
  {
    name: "스카이31 풋바 롯데월드타워",
    description: "롯데월드타워 야외 루프탑 바",
    address: "서울 송파구 올림픽로 300",
    lat: 37.5126, lng: 127.1026,
    category: "bar", yajang_type: "rooftop",
    is_outdoor: true, has_heater: true, has_shelter: false, pet_friendly: false,
    source_id: "curated_032",
  },
  // ── 은평 / 서대문 ─────────────────────────────────────────
  {
    name: "은평 카페 숲",
    description: "불광천 야외 테라스 카페",
    address: "서울 은평구 진관길 44",
    lat: 37.6144, lng: 126.9318,
    category: "cafe", yajang_type: "riverside",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: true,
    source_id: "curated_033",
  },
  // ── 동대문 / 중구 ─────────────────────────────────────────
  {
    name: "디자이너스라운지 DDP",
    description: "동대문디자인플라자 야외 카페",
    address: "서울 중구 을지로 281",
    lat: 37.5671, lng: 127.0097,
    category: "cafe", yajang_type: "terrace",
    is_outdoor: true, has_heater: false, has_shelter: true, pet_friendly: false,
    source_id: "curated_034",
  },
  {
    name: "청계천 야장 포차거리",
    description: "청계천 야외 포장마차촌",
    address: "서울 중구 청계천로 55",
    lat: 37.5698, lng: 126.9849,
    category: "bar", yajang_type: "riverside",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: false,
    source_id: "curated_035",
  },
  // ── 마포 / 당인리 ─────────────────────────────────────────
  {
    name: "문화비축기지 야외카페",
    description: "당인리 발전소(문화비축기지) 야외 카페",
    address: "서울 마포구 마포대로 217",
    lat: 37.5466, lng: 126.9286,
    category: "cafe", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: true,
    source_id: "curated_036",
  },
  // ── 광화문 ────────────────────────────────────────────────
  {
    name: "세종 야외카페 광화문",
    description: "광화문광장 야외 카페",
    address: "서울 종로구 세종대로 172",
    lat: 37.5720, lng: 126.9769,
    category: "cafe", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: false,
    source_id: "curated_037",
  },
  // ── 분당 / 판교 ───────────────────────────────────────────
  {
    name: "카카오스페이스닷원 카페테리아",
    description: "판교 카카오 사옥 야외 카페테리아",
    address: "경기 성남시 분당구 판교역로 166",
    lat: 37.4019, lng: 127.1088,
    category: "cafe", yajang_type: "terrace",
    is_outdoor: true, has_heater: true, has_shelter: true, pet_friendly: false,
    source_id: "curated_038",
  },
  {
    name: "분당 파크뷰 카페",
    description: "분당 중앙공원 야외 카페",
    address: "경기 성남시 분당구 성남대로 550",
    lat: 37.3753, lng: 127.1216,
    category: "cafe", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: true,
    source_id: "curated_039",
  },
  // ── 수원 ──────────────────────────────────────────────────
  {
    name: "행궁동 야외카페 화성",
    description: "수원화성 행궁동 야외 테라스 카페",
    address: "경기 수원시 팔달구 행궁로 96",
    lat: 37.2836, lng: 127.0127,
    category: "cafe", yajang_type: "terrace",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: true,
    source_id: "curated_040",
  },
  // ── 인천 ──────────────────────────────────────────────────
  {
    name: "월미도 원조 해산물포장마차",
    description: "인천 월미도 야외 해산물 포장마차",
    address: "인천 중구 월미로 183",
    lat: 37.4745, lng: 126.5979,
    category: "restaurant", yajang_type: "beachside",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: false,
    source_id: "curated_041",
  },
  {
    name: "센트럴파크 카페 송도",
    description: "인천 송도 센트럴파크 야외 카페거리",
    address: "인천 연수구 센트럴로 160",
    lat: 37.3909, lng: 126.6388,
    category: "cafe", yajang_type: "terrace",
    is_outdoor: true, has_heater: true, has_shelter: true, pet_friendly: true,
    source_id: "curated_042",
  },
  // ── 추가 서울 지역 ────────────────────────────────────────
  {
    name: "암사 야외 갈비 한마당",
    description: "강동 암사동 야외 갈비집",
    address: "서울 강동구 올림픽로 617",
    lat: 37.5507, lng: 127.1337,
    category: "restaurant", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: true, pet_friendly: false,
    source_id: "curated_043",
  },
  {
    name: "신림 야장 포차촌",
    description: "관악 신림동 야외 포장마차",
    address: "서울 관악구 신림로 227",
    lat: 37.4840, lng: 126.9293,
    category: "bar", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: false,
    source_id: "curated_044",
  },
  {
    name: "창동 아트센터 야외카페",
    description: "도봉 창동 야외 카페",
    address: "서울 도봉구 창동 1-1",
    lat: 37.6529, lng: 127.0483,
    category: "cafe", yajang_type: "terrace",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: true,
    source_id: "curated_045",
  },
  {
    name: "용마폭포 야외 막걸리",
    description: "중랑구 용마산 야외 막걸리집",
    address: "서울 중랑구 망우로 376",
    lat: 37.5849, lng: 127.0983,
    category: "restaurant", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: true, pet_friendly: false,
    source_id: "curated_046",
  },
  {
    name: "사당 이자카야 야외석",
    description: "동작 사당동 테라스 이자카야",
    address: "서울 동작구 사당로 236",
    lat: 37.4767, lng: 126.9803,
    category: "bar", yajang_type: "terrace",
    is_outdoor: true, has_heater: true, has_shelter: false, pet_friendly: false,
    source_id: "curated_047",
  },
  {
    name: "파미에스테이션 루프탑카페",
    description: "서초 반포동 한강뷰 루프탑 카페",
    address: "서울 서초구 반포대로 201",
    lat: 37.5039, lng: 127.0057,
    category: "cafe", yajang_type: "rooftop",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: false,
    source_id: "curated_048",
  },
  {
    name: "방이동 전통 야외치킨",
    description: "송파 방이동 야외 치킨집",
    address: "서울 송파구 방이동 45-5",
    lat: 37.5145, lng: 127.1216,
    category: "restaurant", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: true, pet_friendly: false,
    source_id: "curated_049",
  },
  {
    name: "핸드앤몰트 합정",
    description: "마포 합정 야외 크래프트 브루어리",
    address: "서울 마포구 양화로 147",
    lat: 37.5494, lng: 126.9107,
    category: "bar", yajang_type: "terrace",
    is_outdoor: true, has_heater: true, has_shelter: true, pet_friendly: false,
    source_id: "curated_050",
  },
  {
    name: "에이블 루프탑카페 녹사평",
    description: "용산 녹사평 루프탑 카페",
    address: "서울 용산구 녹사평대로 150",
    lat: 37.5384, lng: 126.9888,
    category: "cafe", yajang_type: "rooftop",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: false,
    source_id: "curated_051",
  },
  {
    name: "익선다다 야외마당",
    description: "종로 익선동 야외 한식 주점",
    address: "서울 종로구 돈화문로11다길 3",
    lat: 37.5728, lng: 126.9960,
    category: "bar", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: false,
    source_id: "curated_052",
  },
  {
    name: "정릉 마당깊은 카페",
    description: "성북 정릉 야외 카페",
    address: "서울 성북구 정릉로 134",
    lat: 37.6033, lng: 127.0054,
    category: "cafe", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: true,
    source_id: "curated_053",
  },
  {
    name: "우이동 계곡 장작구이",
    description: "강북 우이동 계곡 야외 음식점",
    address: "서울 강북구 우이동 275-1",
    lat: 37.6597, lng: 127.0173,
    category: "restaurant", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: true, pet_friendly: true,
    source_id: "curated_054",
  },
  {
    name: "고척 스카이뷰바",
    description: "구로 고척 야외 루프탑 스카이바",
    address: "서울 구로구 고척로 76",
    lat: 37.4971, lng: 126.8671,
    category: "bar", yajang_type: "rooftop",
    is_outdoor: true, has_heater: true, has_shelter: false, pet_friendly: false,
    source_id: "curated_055",
  },
  {
    name: "독산동 연탄 삼겹살 야외",
    description: "금천 독산동 야외 삼겹살집",
    address: "서울 금천구 독산로 234",
    lat: 37.4656, lng: 126.8927,
    category: "restaurant", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: true, pet_friendly: false,
    source_id: "curated_056",
  },
  {
    name: "한강주점 여의도점",
    description: "영등포 여의도 한강뷰 야장 바",
    address: "서울 영등포구 여의대방로 330",
    lat: 37.5230, lng: 126.9280,
    category: "bar", yajang_type: "riverside",
    is_outdoor: true, has_heater: true, has_shelter: false, pet_friendly: false,
    source_id: "curated_057",
  },
  {
    name: "목동 허브정원 카페",
    description: "양천 목동 야외 허브정원 카페",
    address: "서울 양천구 목동로 233",
    lat: 37.5269, lng: 126.8747,
    category: "cafe", yajang_type: "terrace",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: true,
    source_id: "curated_058",
  },
  {
    name: "고덕 그라운드 오픈카페",
    description: "강동 고덕 야외 카페",
    address: "서울 강동구 고덕로 201",
    lat: 37.5571, lng: 127.1529,
    category: "cafe", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: true,
    source_id: "curated_059",
  },
  {
    name: "회기 야외 포차 경희대앞",
    description: "동대문 회기동 야외 포차",
    address: "서울 동대문구 경희대로 4",
    lat: 37.5923, lng: 127.0563,
    category: "bar", yajang_type: "full_outdoor",
    is_outdoor: true, has_heater: false, has_shelter: false, pet_friendly: false,
    source_id: "curated_060",
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// 공공데이터 API 시딩 (data.go.kr 일반음식점 인허가 API)
// ──────────────────────────────────────────────────────────────────────────────
const OUTDOOR_KEYWORDS = [
  "야외", "테라스", "루프탑", "옥상", "강변", "해변", "공원", "마당",
  "야장", "가든", "garden", "terrace", "rooftop",
];

interface PublicDataRow {
  bplcnm: string;      // 사업장명
  rdnwhladdr: string;  // 도로명 주소
  x: string;           // 경도 (lng)
  y: string;           // 위도 (lat)
  sitearea: string;    // 부지면적 (야외 판단 힌트)
  uptaenm: string;     // 업태명
}

async function fetchPublicDataSpots(apiKey: string, pageNo = 1, numRows = 100): Promise<PublicDataRow[]> {
  const url = new URL("https://openapi.foodsafetykorea.go.kr/api/" + apiKey + "/FCBIG_0001/json/" + ((pageNo - 1) * numRows + 1) + "/" + (pageNo * numRows));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json() as { FCBIG_0001?: { row?: PublicDataRow[] } };
  return data?.FCBIG_0001?.row ?? [];
}

function isOutdoorRestaurant(row: PublicDataRow): boolean {
  const searchText = [row.bplcnm, row.uptaenm].join(" ").toLowerCase();
  return OUTDOOR_KEYWORDS.some((kw) => searchText.includes(kw.toLowerCase()));
}

// ──────────────────────────────────────────────────────────────────────────────
// 메인 시딩 함수
// ──────────────────────────────────────────────────────────────────────────────
async function seedCurated(pool: InstanceType<typeof Pool>): Promise<number> {
  let count = 0;
  for (const spot of CURATED_SPOTS) {
    await pool.query(
      `INSERT INTO spots
         (name, description, address, lat, lng,
          category, yajang_type, is_outdoor,
          has_heater, has_shelter, pet_friendly,
          data_source, source_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'public_data',$12)
       ON CONFLICT (data_source, source_id) WHERE source_id IS NOT NULL
       DO UPDATE SET
         name        = EXCLUDED.name,
         description = EXCLUDED.description`,
      [
        spot.name, spot.description, spot.address, spot.lat, spot.lng,
        spot.category, spot.yajang_type, spot.is_outdoor,
        spot.has_heater, spot.has_shelter, spot.pet_friendly,
        spot.source_id,
      ]
    );
    count++;
  }
  return count;
}

async function seedFromPublicApi(pool: InstanceType<typeof Pool>, apiKey: string): Promise<number> {
  let inserted = 0;
  let page = 1;

  while (inserted < 200) {
    const rows = await fetchPublicDataSpots(apiKey, page++, 100);
    if (rows.length === 0) break;

    for (const row of rows) {
      if (!isOutdoorRestaurant(row)) continue;
      const lat = parseFloat(row.y);
      const lng = parseFloat(row.x);
      if (isNaN(lat) || isNaN(lng)) continue;

      const sourceId = `public_fcbig_${row.rdnwhladdr}_${row.bplcnm}`.slice(0, 255);

      await pool.query(
        `INSERT INTO spots
           (name, address, lat, lng,
            category, yajang_type, is_outdoor,
            data_source, source_id)
         VALUES ($1,$2,$3,$4,'restaurant','terrace',true,'public_data',$5)
         ON CONFLICT (data_source, source_id) WHERE source_id IS NOT NULL DO NOTHING`,
        [row.bplcnm, row.rdnwhladdr, lat, lng, sourceId]
      );
      inserted++;
    }
  }
  return inserted;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL 환경변수가 설정되지 않았습니다.");
    process.exit(1);
  }

  const usePublicApi = process.argv.includes("--public");
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    console.log("🌱 시딩 시작...");

    if (usePublicApi) {
      const apiKey = process.env.PUBLIC_DATA_API_KEY;
      if (!apiKey) {
        console.error("❌ PUBLIC_DATA_API_KEY 환경변수가 필요합니다.");
        process.exit(1);
      }
      console.log("📡 공공데이터 API에서 데이터 가져오는 중...");
      const count = await seedFromPublicApi(pool, apiKey);
      console.log(`✅ 공공데이터 API 시딩 완료: ${count}개 삽입`);
    } else {
      console.log("📋 큐레이션된 정적 데이터 시딩 중...");
      const count = await seedCurated(pool);
      console.log(`✅ 정적 데이터 시딩 완료: ${count}개 처리 (중복 제외)`);
    }

    // 결과 확인
    const { rows } = await pool.query("SELECT COUNT(*) FROM spots WHERE data_source = 'public_data'");
    console.log(`📊 현재 public_data spots 총 개수: ${rows[0].count}개`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("시딩 실패:", err);
  process.exit(1);
});
