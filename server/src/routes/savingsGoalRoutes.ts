import { Router } from "express";

import {
  addGoalContribution,
  deleteSavingsGoal,
  listSavingsGoals,
  replaceSavingsGoals,
  saveSavingsGoal,
  updateSavingsGoal,
} from "../controllers/savingsGoalController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const savingsGoalRouter = Router();

savingsGoalRouter.use(requireAuth);
savingsGoalRouter.get("/", asyncHandler(listSavingsGoals));
savingsGoalRouter.post("/", asyncHandler(saveSavingsGoal));
savingsGoalRouter.put("/", asyncHandler(replaceSavingsGoals));
savingsGoalRouter.put("/:id", asyncHandler(updateSavingsGoal));
savingsGoalRouter.post("/:id/contributions", asyncHandler(addGoalContribution));
savingsGoalRouter.delete("/:id", asyncHandler(deleteSavingsGoal));