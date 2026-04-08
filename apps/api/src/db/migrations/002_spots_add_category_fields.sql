-- spots 테이블 — Phase 1 필터링 필드 추가
-- category, yajang_type, is_outdoor, data_source, source_id

BEGIN;

-- category: 장소 카테고리
-- 예: 'restaurant' | 'cafe' | 'bar' | 'park' | 'beach' | 'etc'
ALTER TABLE spots
  ADD COLUMN IF NOT EXISTS category     TEXT NOT NULL DEFAULT 'etc',
  ADD COLUMN IF NOT EXISTS yajang_type  TEXT NOT NULL DEFAULT 'full_outdoor',
  -- 'full_outdoor'  : 완전 야외 (테라스 없음)
  -- 'terrace'       : 테라스/데크
  -- 'rooftop'       : 옥상
  -- 'riverside'     : 강변/호숫가
  -- 'beachside'     : 해변
  ADD COLUMN IF NOT EXISTS is_outdoor   BOOLEAN NOT NULL DEFAULT TRUE,
  -- 데이터 출처 (사용자 등록 vs 크롤링 vs 공공 API)
  ADD COLUMN IF NOT EXISTS data_source  TEXT NOT NULL DEFAULT 'user',
  -- 'user' | 'kakao_place' | 'naver_place' | 'public_data'
  ADD COLUMN IF NOT EXISTS source_id    TEXT;
  -- 외부 시스템의 원본 ID (중복 방지용)

-- source_id 중복 방지 인덱스 (외부 데이터 시딩 시 사용)
CREATE UNIQUE INDEX IF NOT EXISTS uq_spots_source
  ON spots (data_source, source_id)
  WHERE source_id IS NOT NULL;

-- category 필터 인덱스 (Phase 1: GET /spots?category=)
CREATE INDEX IF NOT EXISTS idx_spots_category ON spots (category);

-- yajang_type 필터 인덱스
CREATE INDEX IF NOT EXISTS idx_spots_yajang_type ON spots (yajang_type);

COMMIT;
