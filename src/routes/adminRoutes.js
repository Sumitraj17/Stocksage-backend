import { Router } from "express";
import { adminLogin, adminRegister,addEmployee } from "../controller/adminController.js";
import { validateUser } from "../middleware/validator.middleware.js";

const router = Router();

router.route('/register').post(adminRegister);
router.route('/login').post(adminLogin);
router.route('/addEmployee').post(validateUser,addEmployee);
router.route('/getAll').get();
router.route('/report').get();

export default router;