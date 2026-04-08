import type { FastifyPluginAsync } from "fastify";
import { pool } from "../db/pool.js";

export const spotsRoutes: FastifyPluginAsync = async (app) => {
  // ────────────────────────────────────────────────────────
  // GET /api/v1/spots?lat=&lng=&radius=3000&category=&yajang_type=
  // ────────────────────────────────────────────────────────
  app.get<{
    Querystring: {
      lat?: string;
      lng?: string;
      radius?: string;
      category?: string;
      yajang_type?: string;
    };
  }>("/spots", async (req, reply) => {
    const lat = parseFloat(req.query.lat ?? "37.5665");
    const lng = parseFloat(req.query.lng ?? "126.978");
    const radius = parseInt(req.query.radius ?? "3000", 10);
    const category = req.query.category;
    const yajang_type = req.query.yajang_type;

    const conditions: string[] = [
      `ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)`,
    ];
    const params: (number | string)[] = [lng, lat, radius];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    if (yajang_type) {
      params.push(yajang_type);
      conditions.push(`yajang_type = $${params.length}`);
    }

    const where = conditions.join(" AND ");

    const { rows } = await pool.query(
      `SELECT
         id, name, description, address, lat, lng,
         category, yajang_type, is_outdoor,
         has_heater, has_shelter, pet_friendly, is_verified,
         review_count, avg_rating, created_at
       FROM spots
       WHERE ${where}
       ORDER BY ST_Distance(
         location::geography,
         ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
       )
       LIMIT 100`,
      params
    );

    return reply.send({ spots: rows });
  });

  // ────────────────────────────────────────────────────────
  // GET /api/v1/spots/:id
  // ────────────────────────────────────────────────────────
  app.get<{ Params: { id: string } }>("/spots/:id", async (req, reply) => {
    const { rows } = await pool.query(
      `SELECT
         id, name, description, address, lat, lng,
         category, yajang_type, is_outdoor, data_source,
         has_heater, has_shelter, pet_friendly, is_verified,
         review_count, avg_rating, created_at, updated_at
       FROM spots WHERE id = $1`,
      [req.params.id]
    );

    if (rows.length === 0) return reply.notFound("Spot not found");
    return reply.send({ spot: rows[0] });
  });

  // ────────────────────────────────────────────────────────
  // POST /api/v1/spots
  // ────────────────────────────────────────────────────────
  app.post<{
    Body: {
      name: string;
      description?: string;
      address?: string;
      lat: number;
      lng: number;
      category?: string;
      yajang_type?: string;
      is_outdoor?: boolean;
      has_heater?: boolean;
      has_shelter?: boolean;
      pet_friendly?: boolean;
      created_by_token?: string;
    };
  }>("/spots", async (req, reply) => {
    const {
      name,
      description,
      address,
      lat,
      lng,
      category = "etc",
      yajang_type = "full_outdoor",
      is_outdoor = true,
      has_heater = false,
      has_shelter = false,
      pet_friendly = false,
      created_by_token,
    } = req.body;

    if (!name || lat == null || lng == null) {
      return reply.badRequest("name, lat, lng are required");
    }

    const { rows } = await pool.query(
      `INSERT INTO spots
         (name, description, address, lat, lng,
          category, yajang_type, is_outdoor,
          has_heater, has_shelter, pet_friendly,
          created_by_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING
         id, name, description, address, lat, lng,
         category, yajang_type, is_outdoor,
         has_heater, has_shelter, pet_friendly, created_at`,
      [
        name, description, address, lat, lng,
        category, yajang_type, is_outdoor,
        has_heater, has_shelter, pet_friendly,
        created_by_token,
      ]
    );

    return reply.status(201).send({ spot: rows[0] });
  });

  // ────────────────────────────────────────────────────────
  // PATCH /api/v1/spots/:id
  // created_by_token 헤더 검증: X-Client-Token
  // ────────────────────────────────────────────────────────
  app.patch<{
    Params: { id: string };
    Body: {
      name?: string;
      description?: string;
      address?: string;
      category?: string;
      yajang_type?: string;
      is_outdoor?: boolean;
      has_heater?: boolean;
      has_shelter?: boolean;
      pet_friendly?: boolean;
    };
  }>("/spots/:id", async (req, reply) => {
    const { id } = req.params;
    const clientToken = req.headers["x-client-token"] as string | undefined;

    // token 소유권 검증
    const { rows: existing } = await pool.query(
      `SELECT created_by_token, created_by_user FROM spots WHERE id = $1`,
      [id]
    );
    if (existing.length === 0) return reply.notFound("Spot not found");

    const spot = existing[0] as {
      created_by_token: string | null;
      created_by_user: string | null;
    };
    // created_by_token이 있는 장소 → 토큰 일치 필요
    if (spot.created_by_token && spot.created_by_token !== clientToken) {
      return reply.forbidden("Token mismatch: not the creator");
    }

    const updates = req.body;
    const entries = Object.entries(updates).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return reply.badRequest("No fields to update");

    const fields = entries.map(([k], i) => `${k} = $${i + 2}`).join(", ");
    const values = entries.map(([, v]) => v);

    const { rows } = await pool.query(
      `UPDATE spots SET ${fields} WHERE id = $1
       RETURNING id, name, description, address, lat, lng,
                 category, yajang_type, is_outdoor, updated_at`,
      [id, ...values]
    );

    return reply.send({ spot: rows[0] });
  });

  // ────────────────────────────────────────────────────────
  // DELETE /api/v1/spots/:id
  // created_by_token 헤더 검증: X-Client-Token
  // ────────────────────────────────────────────────────────
  app.delete<{ Params: { id: string } }>("/spots/:id", async (req, reply) => {
    const { id } = req.params;
    const clientToken = req.headers["x-client-token"] as string | undefined;

    const { rows: existing } = await pool.query(
      `SELECT created_by_token, created_by_user FROM spots WHERE id = $1`,
      [id]
    );
    if (existing.length === 0) return reply.notFound("Spot not found");

    const spot = existing[0] as {
      created_by_token: string | null;
      created_by_user: string | null;
    };
    if (spot.created_by_token && spot.created_by_token !== clientToken) {
      return reply.forbidden("Token mismatch: not the creator");
    }

    await pool.query("DELETE FROM spots WHERE id = $1", [id]);
    return reply.status(204).send();
  });
};
