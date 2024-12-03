import { Router } from "express";
import { createSaleController } from "../controller/salesController.js";
import { validateUser } from "../middleware/validator.middleware.js";

const router = Router();

router.route("/create-sale").post(validateUser, createSaleController);

export default router;
