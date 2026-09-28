import { Router } from "express";

import {
  createTransaction,
  deleteTransaction,
  getSummary,
  listTransactions,
  updateTransaction,
} from "../controllers/transactionController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const transactionRouter = Router();

transactionRouter.use(requireAuth);
transactionRouter.get("/", asyncHandler(listTransactions));
transactionRouter.post("/", asyncHandler(createTransaction));
transactionRouter.get("/summary", asyncHandler(getSummary));
transactionRouter.put("/:id", asyncHandler(updateTransaction));
transactionRouter.delete("/:id", asyncHandler(deleteTransaction));
