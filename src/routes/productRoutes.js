import { Router } from "express";
import { validateUser,validateEmployee } from "../middleware/validator.middleware.js";
import {
  createProductController,
  deleteProductController,
  getAllProductsController,
  getProductController,
  // getProductsFromFile,
  updateProductController,
  uploadCSVController
} from "../controller/productController.js";
import multer from "multer";
import Papa from "papaparse";


const router = Router();

router.route("/createProduct").post(validateEmployee ,createProductController);

router.route("/updateProduct/:productId").put(validateEmployee ,updateProductController);

router.route("/getProduct/:productId").get(getProductController);

router.route("/getAllProducts").get(validateEmployee,getAllProductsController);

router.route("/deleteProduct/:productId").delete(validateEmployee ,deleteProductController);

const upload = multer({ dest: "uploads/" }); // Adjust destination as needed

router.post("/uploadCSV", upload.single("file"),validateEmployee, uploadCSVController);

export default router;
