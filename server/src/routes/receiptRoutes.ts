import { Router } from "express";

import { createReceipt, deleteReceipt, getReceiptImage, listReceipts } from "../controllers/receiptController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const receiptRouter = Router();

receiptRouter.use(requireAuth);
receiptRouter.get("/", asyncHandler(listReceipts));
receiptRouter.post("/", asyncHandler(createReceipt));
receiptRouter.get("/:id/image", asyncHandler(getReceiptImage));
receiptRouter.delete("/:id", asyncHandler(deleteReceipt));