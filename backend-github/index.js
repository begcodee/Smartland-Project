import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./src/routes/auth.js";
import parcelRoutes from "./src/routes/parcels.js";
import paymentRoutes from "./src/routes/payments.js";
import conversationRoutes from "./src/routes/conversations.js";
import niaRoutes from "./src/routes/nia.js";
import niaEmployeeRoutes from "./src/routes/niaEmployees.js";
import verifyRoutes from "./src/routes/verify.js";
import userRoutes from "./src/routes/usersCompat.js";
import notificationRoutes from "./src/routes/notifications.js";
import ratingRoutes from "./src/routes/ratings.js";
import transferRoutes from "./src/routes/transfers.js";

const app = express();

app.disable("x-powered-by");

app.use(
  helmet({
    // leave crossOriginResourcePolicy off for dev assets
    crossOriginResourcePolicy: false,
  })
);

const limiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
app.use(limiter);

const allowedOrigins = new Set(
  String(process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      return cb(new Error("CORS blocked"), false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

// API compatible with frontend (shadcn-ui)
app.use("/api/auth", authRoutes);
app.use("/api/parcels", parcelRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/nia", niaRoutes);
app.use("/api/nia/employees", niaEmployeeRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/transfers", transferRoutes);

app.get("/", (req, res) => {
  res.send("SmartLand API running");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "smartland-backend-github" });
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`SmartLand API running at http://localhost:${PORT}`);
});