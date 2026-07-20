const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  addTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction,
  getSummary,
} = require("../controllers/transactionController");

// ADD + GET
router.route("/").post(protect, addTransaction).get(protect, getTransactions);
router.get("/summary", protect, getSummary);

// UPDATE + DELETE
router
  .route("/:id")
  .put(protect, updateTransaction)
  .delete(protect, deleteTransaction);

module.exports = router;
