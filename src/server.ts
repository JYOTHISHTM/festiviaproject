
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import passport from "passport";
import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

import userRoutes from "./routes/userRoute";
import adminRoutes from "./routes/adminRoute";
import creatorRoutes from "./routes/creatorRoute";
import webhookRouter from "./routes/webhookRouter";

import { handleRawBody } from "./middleware/rawBody";
import { errorLogger } from "./middleware/logger";
import { attachErrorMessage, errorHandler } from "./middleware/errorHandler";
import config from "./config/config";
import connectDB from "./config/db";
import { setupSocket } from "./socket";
import "./config/passport";

dotenv.config();

const app = express();

// Handle raw body for webhook
app.use(handleRawBody);

// Parse JSON & URL-encoded with larger size limit
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware
app.use(passport.initialize());
app.use(helmet());
app.use(cookieParser());

// CORS setup
app.use(cors({
  origin: "https://festivia.jothish.online", 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// Logger
app.use((req, res, next) => {
  console.log(`[Backend] ${req.method} ${req.url}`);
  next();
});

// Routes
app.get("/test", (req, res) => res.send("Test route working!"));
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);
app.use("/creator", creatorRoutes);
app.use("/webhook", webhookRouter);

// Error handlers
app.use(errorLogger);
app.use(attachErrorMessage);
app.use(errorHandler);

// Server setup
const PORT = process.env.PORT || 5001;
const httpServer = new HttpServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "https://festivia.jothish.online",
    credentials: true,
  },
});
setupSocket(io);

const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

startServer();
