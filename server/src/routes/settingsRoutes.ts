import { Router } from "express";

import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const settingsRouter = Router();

settingsRouter.use(requireAuth);
settingsRouter.get("/", asyncHandler(getSettings));
settingsRouter.patch("/", asyncHandler(updateSettings));