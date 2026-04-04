import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { writeLog } from "./lib/db-log";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
// Capture raw body for Pay.nl exchange BEFORE urlencoded parser runs.
// express.raw sets req._body=true so urlencoded skips it afterwards.
app.use("/api/payments/exchange", express.raw({ type: "*/*", limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Global error handler — catches any error not handled inside a route
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const message: string = err?.message ?? "Onbekende fout";
  const url: string = req.url?.split("?")[0] ?? "unknown";

  logger.error({ err, url, method: req.method }, `Unhandled error: ${message}`);

  writeLog({
    category: "ERROR",
    message: `${req.method} ${url} — ${message}`,
    errorCode: "UNHANDLED-500",
  }).catch(() => {});

  if (res.headersSent) return;
  res.status(err?.status ?? 500).json({ error: "Internal server error" });
});

export default app;
