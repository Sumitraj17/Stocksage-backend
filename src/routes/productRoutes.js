import { Router } from "express";
import { validateUser } from "../middleware/validator.middleware.js";
import {
  createProductController,
  deleteProductController,
  getAllProductsController,
  getProductController,
  updateProductController,
} from "../controller/productController.js";
const router = Router();

router.route("/create-product").post(validateUser, createProductController);

router
  .route("/update-product/:productId")
  .put(validateUser, updateProductController);

router.route("/get-product/:productId").get(validateUser, getProductController);

router.route("/get-all-products").get(validateUser, getAllProductsController);

router
  .route("/delete-product/:productId")
  .delete(validateUser, deleteProductController);

export default router;
