import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import bannersRouter from "./banners";
import offersRouter from "./offers";
import couponsRouter from "./coupons";
import ordersRouter from "./orders";
import adminRouter from "./admin";
import settingsRouter from "./settings";
import testimonialsRouter from "./testimonials";
import faqsRouter from "./faqs";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/banners", bannersRouter);
router.use("/offers", offersRouter);
router.use("/coupons", couponsRouter);
router.use("/orders", ordersRouter);
router.use("/admin", adminRouter);
router.use("/settings", settingsRouter);
router.use("/testimonials", testimonialsRouter);
router.use("/faqs", faqsRouter);
router.use("/upload", uploadRouter);

export default router;
