import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User, Transaction } from "./src/models/index.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("CRITICAL: MONGODB_URI is not defined in environment variables.");
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());
 
  // MongoDB Connection Status Middleware
  const checkMongoConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1 && req.path.startsWith('/api/') && !['/api/health', '/api/test'].includes(req.path)) {
      return res.status(503).json({ error: "Database connection is not ready. Please check MONGODB_URI." });
    }
    next();
  };
  app.use(checkMongoConnection);

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // MongoDB Connection (non-blocking)
  if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
      .then(() => console.log("Connected to MongoDB"))
      .catch(error => console.error("MongoDB connection error:", error));
  } else {
    console.warn("Skipping MongoDB connection: MONGODB_URI is missing.");
  }

  // API routes
  app.get("/api/test", (req, res) => {
    res.json({ message: "API is working" });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Get or Create User
  app.post("/api/users/sync", async (req, res) => {
    const { uid, email, displayName, photoURL, referralCode: referredBy } = req.body;
    try {
      let user = await User.findOne({ uid });
      if (!user) {
        // Generate a unique referral code for the new user
        const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        user = await User.create({ 
          uid, 
          email, 
          displayName, 
          photoURL, 
          referralCode: newReferralCode,
          referredBy: referredBy || null,
          balance: 5 // Initial registration bonus
        });

        // Create bonus transaction
        await Transaction.create({
          userId: uid,
          type: 'bonus',
          amount: 5,
          planName: 'Registration Bonus'
        });
      }
      res.json(user);
    } catch (error) {
      console.error("Sync error:", error);
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

  // Add Payment Method
  app.post("/api/users/:uid/payment-methods", async (req, res) => {
    const { type, details, provider, isDefault } = req.body;
    try {
      const user = await User.findOne({ uid: req.params.uid });
      if (!user) return res.status(404).json({ error: "User not found" });
      
      if (isDefault) {
        user.paymentMethods.forEach(pm => pm.isDefault = false);
      }
      
      user.paymentMethods.push({ type, details, provider, isDefault });
      await user.save();
      res.json(user.paymentMethods);
    } catch (error) {
      res.status(500).json({ error: "Failed to add payment method" });
    }
  });

  // Remove Payment Method
  app.delete("/api/users/:uid/payment-methods/:id", async (req, res) => {
    try {
      const user = await User.findOne({ uid: req.params.uid });
      if (!user) return res.status(404).json({ error: "User not found" });
      
      user.paymentMethods = user.paymentMethods.filter(pm => pm._id.toString() !== req.params.id);
      await user.save();
      res.json(user.paymentMethods);
    } catch (error) {
      res.status(500).json({ error: "Failed to remove payment method" });
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
          user.balance -= amount;

          // Automated recurring return for Flash Plan (30% every 5 minutes)
          if (planName === 'Flash Plan') {
            const profitRate = 0.30; // 30% profit
            const profitAmount = amount * profitRate;
            
            console.log(`Starting 5-minute recurring returns for user ${userId} on Flash Plan`);
            
            // We use an interval for recurring returns
            const intervalId = setInterval(async () => {
              try {
                const returnUser = await User.findOne({ uid: userId });
                if (returnUser) {
                  // Update balance and total returns
                  await User.updateOne(
                    { uid: userId },
                    { 
                      $inc: { 
                        balance: profitAmount,
                        totalReturns: profitAmount
                      } 
                    }
                  );

                  await Transaction.create({
                    userId,
                    type: 'return',
                    amount: profitAmount,
                    planName: 'Flash Plan Recurring Return (30%)'
                  });
                  console.log(`Processed recurring 5-minute 30% Flash Plan return for user ${userId}`);
                } else {
                  console.log(`User ${userId} not found, clearing interval`);
                  clearInterval(intervalId);
                }
              } catch (err) {
                console.error("Error processing Flash Plan recurring return:", err);
                clearInterval(intervalId);
              }
            }, 5 * 60 * 1000); // Every 5 minutes
          }
        } else if (type === 'return') {
          user.totalReturns += amount;
          user.balance += amount; // Assuming returns go to balance
        } else if (type === 'deposit') {
          user.balance += amount;

          // Handle Referral Bonus (0.05% of deposit to the referrer)
          if (user.referredBy) {
            const referrer = await User.findOne({ referralCode: user.referredBy });
            if (referrer) {
              const refBonus = amount * 0.0005; // 0.05%
              referrer.balance += refBonus;
              await referrer.save();
              await Transaction.create({
                userId: referrer.uid,
                type: 'referral',
                amount: refBonus,
                planName: `Referral Bonus from ${user.displayName || user.email}`
              });
            }
          }
        } else if (type === 'withdrawal') {
          user.balance -= amount;
        }
        await user.save();
      }
      
      res.json(transaction);
    } catch (error) {
      console.error("Transaction error:", error);
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
