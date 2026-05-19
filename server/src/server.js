const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
require("dotenv").config();

const app = express();
const authRoutes = require("./routes/authRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

pool
  .connect()
  .then(() => console.log("PostgreSQL Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.json({ message: "Expense Tracker API" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
