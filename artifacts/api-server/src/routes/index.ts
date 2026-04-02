import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import requestsRouter from "./requests";
import adminRouter from "./admin";
import supplierRouter from "./supplier";
import authRouter from "./auth";
import adminUsersRouter from "./admin-users";
import adminSettingsRouter from "./admin-settings";
import paymentsRouter from "./payments";
import adminBundlesRouter from "./admin-bundles";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db/schema";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(requestsRouter);
router.use(adminRouter);
router.use(authRouter);
router.use(supplierRouter);
router.use(adminUsersRouter);
router.use("/admin", adminSettingsRouter);
router.use(paymentsRouter);
router.use(adminBundlesRouter);

router.get("/site-status", async (_req, res) => {
  try {
    const rows = await db.select().from(siteSettingsTable).limit(1);
    const offlineMode = rows.length > 0 ? rows[0].offlineMode : false;
    res.json({ offlineMode });
  } catch {
    res.json({ offlineMode: false });
  }
});

export default router;
