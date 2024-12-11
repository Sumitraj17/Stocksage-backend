import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { createSaleController,getAllSalesDetails,forecasting,updatedcreateSaleController } from "../controller/salesController.js"; // Your controller to process the CSV file
import {validateEmployee} from "../middleware/validator.middleware.js"
import { highlights,productDetails } from "../controller/dashboardController.js";
const router = Router();

// Define the uploads folder with an absolute path
const uploadsFolder = path.resolve("uploads");

// Ensure the `uploads` directory exists
if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder, { recursive: true }); // Create it if it doesn't exist
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsFolder); // Save files in the `uploads` folder
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${timestamp}${ext}`);
  },
});

// File filter to allow only `.csv` files
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === ".csv") {
    cb(null, true);
  } else {
    cb(new Error("Only .csv files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

router
  .route("/create-sale")
  .post(upload.single("file"),validateEmployee, createSaleController); // Adjust as per your controller

  router
  .route("/create-csv-sales")
  .post(upload.single("file"),validateEmployee, updatedcreateSaleController);

router.route("/getAllDetails").get(validateEmployee,getAllSalesDetails);

router.route("/dashboard").get(validateEmployee,highlights)

router.route("/getDetails").get(validateEmployee,productDetails)

router.route("/forecasting").post(validateEmployee,forecasting)
export default router;
