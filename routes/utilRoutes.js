import express from "express";
import { getLinkPreview } from "../controllers/utilController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/link-preview", authMiddleware, getLinkPreview);

export default router;
