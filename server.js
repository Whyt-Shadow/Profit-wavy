import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User, Transaction } from "./src/models/index.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://profitwavy:Arm1bhixion@cluster0.xc3fumg.mongodb.net/?appName=Cluster0";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // MongoDB Connection (non-blocking)
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(error => console.error("MongoDB connection error:", error));

  // API routes
  app.get("/api/test", (req, res) => {
    res.json({ message: "API is working" });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Get or Create User
  app.post("/api/users/sync", async (req, res) => {
    const { uid, email, displayName, photoURL } = req.body;
    try {
      let user = await User.findOne({ uid });
      if (!user) {
        user = await User.create({ uid, email, displayName, photoURL });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to sync user" });
    }
  });

  // Get User Data
  app.get("/api/users/:uid", async (req, res) => {
    console.log(`Fetching user data for UID: ${req.params.uid}`);
    try {
      const user = await User.findOne({ uid: req.params.uid });
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Get Transactions
  app.get("/api/transactions/:uid", async (req, res) => {
    try {
      const transactions = await Transaction.find({ userId: req.params.uid }).sort({ timestamp: -1 });
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Create Transaction
  app.post("/api/transactions", async (req, res) => {
    const { userId, type, amount, planName } = req.body;
    try {
      const transaction = await Transaction.create({ userId, type, amount, planName });
      
      // Update user stats
      const user = await User.findOne({ uid: userId });
      if (user) {
        if (type === 'investment') {
          user.totalInvested += amount;
        } else if (type === 'return') {
          user.totalReturns += amount;
        }
        await user.save();
      }
      
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  // Catch-all for unmatched API routes
  app.all("/api/*", (req, res) => {
    console.log(`Unmatched API route: ${req.method} ${req.url}`);
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
