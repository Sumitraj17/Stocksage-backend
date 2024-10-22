import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { Company } from "../models/company.model.js";
config();

const validateUser = async (req, res, next) => {
  const cookie =
    req.cookie?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!cookie)
    return res
      .status(404)
      .json({ status: "Bad Request", message: "Unauthorized access" });

  console.log(cookie);

  const decode = jwt.verify(cookie, process.env.SECRET_KEY);

  const user = await Company.findById(decode.id).select(" -Password");

  if (!user)
    return res
      .status(404)
      .json({ status: "Bad Request", message: "Unauthorized access" });

  console.log("Valid user");

  req.user = user;
  next();
};

export { validateUser };
