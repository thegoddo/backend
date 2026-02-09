import express from "express";
import { upload, uploadImage } from "../controllers/uploadController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/image", authMiddleware, upload.single("image"), uploadImage);

export default router;
