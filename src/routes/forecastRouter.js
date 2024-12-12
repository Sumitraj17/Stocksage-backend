import { Router } from "express";
import { validateEmployee } from "../middleware/validator.middleware.js";
import { getStoreProduct,getStoreForecast,getProdcutForecast } from "../controller/forecastController.js";
const forecast = Router();

forecast.route("/getDetails").get(validateEmployee,getStoreProduct);
forecast.route("/store-forecast").post(validateEmployee,getStoreForecast);
forecast.route("/product-forecast").post(validateEmployee,getProdcutForecast)

export default forecast;