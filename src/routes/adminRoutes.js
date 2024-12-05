import { Router } from "express";
import {
  adminLogin,
  adminRegister,
  addEmployee,
  adminLogout,
  changePassword,
  updateEmployee,
  deleteEmployee,
  getAllEmployees,
  // getEmployeesFromFile,
} from "../controller/adminController.js";
import { validateUser } from "../middleware/validator.middleware.js";

const router = Router();

router.route("/register").post(adminRegister);
router.route("/login").post(adminLogin);
router.route("/logout").post(validateUser, adminLogout);
router.route("/changePassword").post(validateUser, changePassword);
router.route("/addEmployee").post(addEmployee);
router.route("/getAllEmployees").get(getAllEmployees);
router.route("/updateEmployee/:EmployeeEmail").put(updateEmployee);
router.route("/deleteEmployee/:EmployeeEmail").delete(deleteEmployee);
// router.get("/getEmployees", getEmployeesFromFile);
export default router;
