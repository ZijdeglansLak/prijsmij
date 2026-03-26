import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import requestsRouter from "./requests";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(requestsRouter);
router.use(adminRouter);

export default router;
