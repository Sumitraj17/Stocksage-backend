import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { Company } from "../models/company.model.js";
import {Employee} from "../models/employee.model.js"

config();

const validateUser = async (req, res, next) => {
  try {
    // Extract token from cookies or headers
    const token =
      req.cookies?.accessToken || // Use req.cookies if cookie-parser is configured
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ status: "Unauthorized", message: "Access token missing" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (!decoded || !decoded.id) {
      return res
        .status(401)
        .json({ status: "Unauthorized", message: "Invalid token" });
    }

    // Check if the user exists in the database
    const user = await Company.findById(decoded.id).select("-Password"); // Exclude password

    if (!user) {
      return res
        .status(401)
        .json({ status: "Unauthorized", message: "User not found" });
    }

    // console.log("Valid user:", user);

    // Attach user information to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in validateUser middleware:", error.message);

    // Handle token verification errors gracefully
    res.status(401).json({
      status: "Unauthorized",
      message: "Invalid or expired token",
    });
  }
};

const validateEmployee = async(req,res,next)=>{
  try {
    const token =
      req.cookies?.accessToken || // Use req.cookies if cookie-parser is configured
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ status: "Unauthorized", message: "Access token missing" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    // console.log(decoded)
    if (!decoded || !decoded.id) {
      return res
        .status(401)
        .json({ status: "Unauthorized", message: "Invalid token" });
    }

    const user = await Employee.findOne({_id:decoded.id});
    // console.log(user)
    if (!user) {
      return res
        .status(401)
        .json({ status: "Unauthorized", message: "User not found" });
    }

    // console.log("Valid user:", user);

    // Attach user information to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in validateUser middleware:", error.message);

    // Handle token verification errors gracefully
    res.status(401).json({
      status: "Unauthorized",
      message: "Invalid or expired token",
    });
  }
}

export { validateUser,validateEmployee};
