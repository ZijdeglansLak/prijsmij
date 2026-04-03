import { pool } from "@workspace/db";
import { logger } from "./logger";

export type LogCategory = "LOGIN" | "LOGOUT" | "ERROR";

export interface WriteLogOptions {
  category: LogCategory;
  message: string;
  userId?: number | null;
  userEmail?: string | null;
  errorCode?: string | null;
}

export async function writeLog(opts: WriteLogOptions): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO system_logs (category, message, user_id, user_email, error_code)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        opts.category,
        opts.message,
        opts.userId ?? null,
        opts.userEmail ?? null,
        opts.errorCode ?? null,
      ]
    );
  } catch (err) {
    logger.error({ err }, "Failed to write system log");
  }
}
