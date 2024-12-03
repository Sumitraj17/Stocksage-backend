import { Router } from "express";
import {
  adminLogin,
  adminRegister,
  addEmployee,
  adminLogout,
  changePassword,
  updateEmployee,
  deleteEmployee,
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
router.route("/updateEmployee/:EmployeeEmail").put(updateEmployee);
router.route("/deleteEmployee/:EmployeeEmail").delete(deleteEmployee);

export default router;
