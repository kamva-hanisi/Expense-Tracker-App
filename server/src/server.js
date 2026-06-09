const express = require("express");
const cors = require("cors");
require("dotenv").config({
  path: require("path").join(__dirname, "../.env"),
  quiet: true,
});
const pool = require("./config/db");

const app = express();
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => {
      const trimmedOrigin = origin.trim();

      try {
        return new URL(trimmedOrigin).origin;
      } catch {
        return trimmedOrigin;
      }
    })
  : true;

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins === true || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

pool
  .query("SELECT 1")
  .then(() => console.log("PostgreSQL Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.json({ message: "Expense Tracker API" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
