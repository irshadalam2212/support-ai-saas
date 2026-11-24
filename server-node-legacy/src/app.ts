import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./module/auth/auth.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Support AI API is running",
  });
});

app.use("/api/v1/auth", authRoutes);

app.use(errorMiddleware);

export default app;
