import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import blogRoute from "./routes/blog.route.js";
import commentRoute from "./routes/comment.route.js";
import adminRoute from "./routes/admin.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

connectDB();

// default middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const _dirname = path.resolve();

// APIs
app.use("/api/v1/user", userRoute);
app.use("/api/v1/blog", blogRoute);
app.use("/api/v1/comment", commentRoute);
app.use("/api/v1/admin", adminRoute);

// Serve frontend build
app.use(express.static(path.join(_dirname, "/frontend/dist")));
app.get('/api/v1/ping', (_, res) => {
  res.json({ message: 'pong Test' });
});

export default app;