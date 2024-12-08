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
import { validateUser,validateEmployee } from "../middleware/validator.middleware.js";

const router = Router();

router.route("/register").post(adminRegister);
router.route("/login").post(adminLogin);
router.route("/logout").get(validateEmployee, adminLogout);
router.route("/changePassword").post(validateEmployee, changePassword);
router.route("/addEmployee").post(validateEmployee,addEmployee);
router.route("/getAllEmployees").get(validateEmployee,getAllEmployees);
router.route("/updateEmployee/:EmployeeEmail").put(validateEmployee,updateEmployee);
router.route("/deleteEmployee/:EmployeeEmail").delete(validateEmployee,deleteEmployee);
export default router;
