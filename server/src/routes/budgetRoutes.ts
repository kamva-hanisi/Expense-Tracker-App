import { Router } from "express";

import { deleteBudget, listBudgets, replaceBudgets, saveBudget } from "../controllers/budgetController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const budgetRouter = Router();

budgetRouter.use(requireAuth);
budgetRouter.get("/", asyncHandler(listBudgets));
budgetRouter.post("/", asyncHandler(saveBudget));
budgetRouter.put("/", asyncHandler(replaceBudgets));
budgetRouter.delete("/:id", asyncHandler(deleteBudget));