import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { connectDB } from "./utils/db.js";

const app = express();
const httpServer = http.createServer();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  }),
);

app.use(cookieParser());

try {
  await connectDB();
  const PORT = process.env.PORT;
  httpServer.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
  });
} catch (error) {
  console.error("The server failed to start", error);
  process.exit(1);
}
