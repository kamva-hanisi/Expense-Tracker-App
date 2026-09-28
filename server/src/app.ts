import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { authRouter } from "./routes/authRoutes.js";
import { budgetRouter } from "./routes/budgetRoutes.js";
import { savingsGoalRouter } from "./routes/savingsGoalRoutes.js";
import { transactionRouter } from "./routes/transactionRoutes.js";

export const app = express();

app.disable("x-powered-by");
app.use(cors({
  origin(origin, callback) {
    const isLocalDevelopmentOrigin = env.nodeEnv !== "production" &&
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin ?? "");
    if (!origin || env.clientUrls.includes(origin) || isLocalDevelopmentOrigin) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin is not allowed by CORS"));
  },
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});
app.use("/api/auth", authRouter);
app.use("/api/budgets", budgetRouter);
app.use("/api/savings-goals", savingsGoalRouter);
app.use("/api/transactions", transactionRouter);

app.use(notFound);
app.use(errorHandler);
