import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/crm";
const pool = new Pool({ connectionString });

pool.on('error', (err) => {
  console.error('Postgres pool error:', err);
});

app.post("/bins", async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const id = nanoid(8);
    await pool.query(
      `INSERT INTO crm_bins(id, data, updated_at) VALUES($1, $2, now())
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
      [id, JSON.stringify(payload)],
    );
    res.json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to save bin" });
  }
});

app.get("/bins/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT data FROM crm_bins WHERE id = $1", [id]);
    if (!rows.length) return res.status(404).json({ error: "not found" });
    const data = rows[0].data;
    try {
      return res.json(typeof data === 'string' ? JSON.parse(data) : data);
    } catch (e) {
      return res.json(data);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch bin" });
  }
});

const port = Number(process.env.PORT) || 4000;
const server = app.listen(port, () => {
  console.log(`CRM server listening on http://localhost:${port}`);
});

process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  server.close(async () => {
    try {
      await pool.end();
      console.log('Postgres pool ended');
      process.exit(0);
    } catch (err) {
      console.error('Error ending pool:', err);
      process.exit(1);
    }
  });
});
