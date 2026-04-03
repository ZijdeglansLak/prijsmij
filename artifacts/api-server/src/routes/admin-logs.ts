import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import { requireAdmin } from "./auth";

const router: IRouter = Router();

type SortCol = "created_at" | "user_email" | "message" | "category";
type SortDir = "asc" | "desc";

const ALLOWED_SORT: SortCol[] = ["created_at", "user_email", "message", "category"];

router.get("/admin/logs", requireAdmin, async (req, res) => {
  try {
    const category = typeof req.query.category === "string" ? req.query.category.toUpperCase() : "";
    const page     = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit    = Math.min(200, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset   = (page - 1) * limit;

    const rawSort = (req.query.sort as string) || "created_at";
    const rawDir  = (req.query.dir as string) || "desc";
    const sortCol: SortCol = ALLOWED_SORT.includes(rawSort as SortCol) ? (rawSort as SortCol) : "created_at";
    const sortDir: SortDir = rawDir === "asc" ? "asc" : "desc";

    const VALID_CATS = ["LOGIN", "LOGOUT", "ERROR"];
    const where = VALID_CATS.includes(category) ? `WHERE category = $1` : "";
    const params: string[] = VALID_CATS.includes(category) ? [category] : [];

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM system_logs ${where}`,
      params
    );

    const dataRes = await pool.query(
      `SELECT id, category, message, user_id, user_email, error_code,
              created_at::date AS log_date,
              to_char(created_at, 'HH24:MI:SS') AS log_time,
              created_at
       FROM system_logs
       ${where}
       ORDER BY ${sortCol} ${sortDir}, id ${sortDir}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    res.json({
      total: countRes.rows[0].total,
      page,
      limit,
      logs: dataRes.rows,
    });
  } catch (err: any) {
    req.log.error({ err }, "Failed to fetch admin logs");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
