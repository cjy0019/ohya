-- 오늘야장 초기 스키마 마이그레이션
-- PostgreSQL 16 + PostGIS 3.4

BEGIN;

-- PostGIS 확장 활성화
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────
-- users 테이블 (소셜 로그인 확장 대비)
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider    TEXT NOT NULL,                -- 'kakao' | 'google' | 'anonymous'
  provider_id TEXT,                         -- 소셜 provider의 사용자 ID
  nickname    TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_provider
  ON users (provider, provider_id)
  WHERE provider_id IS NOT NULL;

-- ────────────────────────────────────────
-- spots 테이블 (야장 장소)
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS spots (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  description      TEXT,
  address          TEXT,
  lat              DOUBLE PRECISION NOT NULL,
  lng              DOUBLE PRECISION NOT NULL,
  location         GEOMETRY(Point, 4326) GENERATED ALWAYS AS (
                     ST_SetSRID(ST_MakePoint(lng, lat), 4326)
                   ) STORED,
  -- 비로그인 등록 지원
  created_by_user  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by_token TEXT,                    -- 비로그인 사용자 fingerprint
  -- 장소 속성
  has_heater       BOOLEAN NOT NULL DEFAULT FALSE,
  has_shelter      BOOLEAN NOT NULL DEFAULT FALSE,
  pet_friendly     BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified      BOOLEAN NOT NULL DEFAULT FALSE,
  -- 집계 (denormalized, 리뷰 write 시 업데이트)
  review_count     INTEGER NOT NULL DEFAULT 0,
  avg_rating       NUMERIC(2,1),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 공간 인덱스 (반경 검색)
CREATE INDEX IF NOT EXISTS idx_spots_location ON spots USING GIST (location);

-- 최근 등록순 인덱스
CREATE INDEX IF NOT EXISTS idx_spots_created_at ON spots (created_at DESC);

-- ────────────────────────────────────────
-- reviews 테이블
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spot_id          UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  author_user      UUID REFERENCES users(id) ON DELETE SET NULL,
  author_token     TEXT,                    -- 비로그인 작성자 fingerprint
  rating           SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body             TEXT,
  visited_at       DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_spot_id ON reviews (spot_id);

-- ────────────────────────────────────────
-- updated_at 자동 갱신 트리거
-- ────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_spots_updated_at
  BEFORE UPDATE ON spots
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ────────────────────────────────────────
-- avg_rating 자동 갱신 트리거
-- ────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_spot_stats()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_spot_id UUID;
BEGIN
  v_spot_id := COALESCE(NEW.spot_id, OLD.spot_id);
  UPDATE spots
  SET
    review_count = (SELECT COUNT(*) FROM reviews WHERE spot_id = v_spot_id),
    avg_rating   = (SELECT ROUND(AVG(rating)::NUMERIC, 1) FROM reviews WHERE spot_id = v_spot_id)
  WHERE id = v_spot_id;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_spot_stats
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_spot_stats();

COMMIT;
