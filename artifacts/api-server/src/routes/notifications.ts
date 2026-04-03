import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import { requireAuth } from "./auth";

const router: IRouter = Router();

router.get("/notifications/counts", requireAuth, async (req, res) => {
  try {
    const userId    = (req as any).userId as number;
    const userEmail = ((req as any).userEmail as string).toLowerCase();
    const userRole  = (req as any).userRole as string;

    if (userRole === "seller") {
      const { rows } = await pool.query<{ cnt: number }>(
        `SELECT COUNT(*)::int AS cnt
         FROM bids
         WHERE LOWER(supplier_email) = $1
           AND buyer_interest_email IS NOT NULL`,
        [userEmail]
      );
      res.json({ count: rows[0]?.cnt ?? 0, role: "seller" });
    } else if (userRole === "buyer") {
      const { rows } = await pool.query<{ cnt: number }>(
        `SELECT COUNT(*)::int AS cnt
         FROM bids b
         JOIN requests r ON r.id = b.request_id
         WHERE LOWER(r.consumer_email) = $1`,
        [userEmail]
      );
      res.json({ count: rows[0]?.cnt ?? 0, role: "buyer" });
    } else {
      res.json({ count: 0, role: userRole });
    }
  } catch (err) {
    req.log.error({ err }, "Failed to get notification counts");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
