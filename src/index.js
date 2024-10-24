import express from "express";
import connectToDB from "./db/db.js";
import { config } from "dotenv";
import  router from "./routes/adminRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
config();

const app = express();

connectToDB();
app.use(
  cors({
    origin:['http://localhost:5173','http://localhost:5174'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/admin", router);

app.get("/", (req, res) => {
  res.send("Server working successfully");
});

app.listen(process.env.PORT, () => {
  console.log(`Listening to port ${process.env.PORT}`);
});
