import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import requestsRouter from "./requests";
import adminRouter from "./admin";
import supplierRouter from "./supplier";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(requestsRouter);
router.use(adminRouter);
router.use(authRouter);
router.use(supplierRouter);

export default router;
