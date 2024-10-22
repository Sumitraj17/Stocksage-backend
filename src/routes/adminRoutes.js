import { Router } from "express";
import {
  adminLogin,
  adminRegister,
  addEmployee,
  adminLogout,
  changePassword,
} from "../controller/adminController.js";
import { validateUser } from "../middleware/validator.middleware.js";

const router = Router();

router.route("/register").post(adminRegister);
router.route("/login").post(adminLogin);
router.route("/logout").post(validateUser,adminLogout);
router.route("/changePassword").post(validateUser,changePassword)
router.route("/addEmployee").post(validateUser, addEmployee);
router.route("/getAll").get();
router.route("/report").get();


export default router;
