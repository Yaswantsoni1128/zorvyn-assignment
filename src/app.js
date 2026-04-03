import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import {errorMiddleware} from "./middlewares/error.middleware.js";
import { rateLimiter } from "./middlewares/rateLimiter.middleware.js";

const app = express();

// External middlewares
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("dev"));
app.use(cors());

// rate limiters 
app.use(rateLimiter.global);
app.use("/api/v1/auth", rateLimiter.auth, authRoutes);
app.use("/api/v1/records", rateLimiter.record, recordRoutes);
app.use("/api/v1/categories", rateLimiter.category, categoryRoutes);
app.use("/api/v1/dashboard", rateLimiter.dashboard, dashboardRoutes);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// health route
app.get("/", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Routes
import authRoutes from "../src/routes/auth.route.js"
import recordRoutes from "../src/routes/record.routes.js";
import categoryRoutes from "../src/routes/category.routes.js";
import dashboardRoutes from "../src/routes/dashboard.routes.js";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/records", recordRoutes);
app.use("/api/v1/categories", categoryRoutes)
app.use("/api/v1/dashboard", dashboardRoutes);

app.use(errorMiddleware);

export default app;