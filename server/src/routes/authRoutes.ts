import { Router } from "express";

import { changePassword, deactivateAccount, login, me, permanentlyDeleteAccount, register, updateProfile } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(register));
authRouter.post("/login", asyncHandler(login));
authRouter.get("/me", requireAuth, asyncHandler(me));
authRouter.patch("/me", requireAuth, asyncHandler(updateProfile));
authRouter.patch("/password", requireAuth, asyncHandler(changePassword));
authRouter.post("/deactivate", requireAuth, asyncHandler(deactivateAccount));
authRouter.delete("/me", requireAuth, asyncHandler(permanentlyDeleteAccount));
