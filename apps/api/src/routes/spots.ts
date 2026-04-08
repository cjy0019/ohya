import type { FastifyPluginAsync } from "fastify";
import { pool } from "../db/pool.js";

export const spotsRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/spots?lat=&lng=&radius=3000
  app.get<{
    Querystring: { lat?: string; lng?: string; radius?: string };
  }>("/spots", async (req, reply) => {
    const lat = parseFloat(req.query.lat ?? "37.5665");
    const lng = parseFloat(req.query.lng ?? "126.978");
    const radius = parseInt(req.query.radius ?? "3000", 10); // 단위: 미터

    const { rows } = await pool.query(
      `SELECT
         id, name, description, address, lat, lng,
         has_heater, has_shelter, pet_friendly, is_verified,
         review_count, avg_rating, created_at
       FROM spots
       WHERE ST_DWithin(
         location::geography,
         ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
         $3
       )
       ORDER BY ST_Distance(
         location::geography,
         ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
       )
       LIMIT 100`,
      [lng, lat, radius]
    );

    return reply.send({ spots: rows });
  });

  // GET /api/v1/spots/:id
  app.get<{ Params: { id: string } }>("/spots/:id", async (req, reply) => {
    const { rows } = await pool.query(
      `SELECT
         id, name, description, address, lat, lng,
         has_heater, has_shelter, pet_friendly, is_verified,
         review_count, avg_rating, created_at, updated_at
       FROM spots WHERE id = $1`,
      [req.params.id]
    );

    if (rows.length === 0) return reply.notFound("Spot not found");
    return reply.send({ spot: rows[0] });
  });

  // POST /api/v1/spots
  app.post<{
    Body: {
      name: string;
      description?: string;
      address?: string;
      lat: number;
      lng: number;
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
      has_heater = false,
      has_shelter = false,
      pet_friendly = false,
      created_by_token,
    } = req.body;

    if (!name || !lat || !lng) {
      return reply.badRequest("name, lat, lng are required");
    }

    const { rows } = await pool.query(
      `INSERT INTO spots
         (name, description, address, lat, lng, has_heater, has_shelter, pet_friendly, created_by_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, description, address, lat, lng,
                 has_heater, has_shelter, pet_friendly, created_at`,
      [name, description, address, lat, lng, has_heater, has_shelter, pet_friendly, created_by_token]
    );

    return reply.status(201).send({ spot: rows[0] });
  });

  // PATCH /api/v1/spots/:id
  app.patch<{
    Params: { id: string };
    Body: {
      name?: string;
      description?: string;
      address?: string;
      has_heater?: boolean;
      has_shelter?: boolean;
      pet_friendly?: boolean;
    };
  }>("/spots/:id", async (req, reply) => {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.entries(updates)
      .filter(([, v]) => v !== undefined)
      .map(([k], i) => `${k} = $${i + 2}`)
      .join(", ");
    const values = Object.values(updates).filter((v) => v !== undefined);

    if (fields.length === 0) return reply.badRequest("No fields to update");

    const { rows } = await pool.query(
      `UPDATE spots SET ${fields} WHERE id = $1
       RETURNING id, name, description, address, lat, lng, updated_at`,
      [id, ...values]
    );

    if (rows.length === 0) return reply.notFound("Spot not found");
    return reply.send({ spot: rows[0] });
  });

  // DELETE /api/v1/spots/:id
  app.delete<{ Params: { id: string } }>("/spots/:id", async (req, reply) => {
    const { rowCount } = await pool.query("DELETE FROM spots WHERE id = $1", [
      req.params.id,
    ]);
    if (!rowCount) return reply.notFound("Spot not found");
    return reply.status(204).send();
  });
};
