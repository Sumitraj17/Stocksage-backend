import { Router } from "express";
import { validateUser } from "../middleware/validator.middleware.js";
import {
  createProductController,
  deleteProductController,
  getAllProductsController,
  getProductController,
  // getProductsFromFile,
  updateProductController,
} from "../controller/productController.js";
const router = Router();

router.route("/createProduct").post(createProductController);

router.route("/updateProduct/:productId").put(updateProductController);

router.route("/getProduct/:productId").get(getProductController);

router.route("/getAllProducts").get(getAllProductsController);

router.route("/deleteProduct/:productId").delete(deleteProductController);

// router.get("/getProducts", getProductsFromFile);

export default router;
