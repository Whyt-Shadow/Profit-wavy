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
  try {
    const app = express();
    const PORT = 3000;

    app.use(express.json());
   
    // MongoDB Connection Status Middleware
    const checkMongoConnection = (req, res, next) => {
      const isPublicRoute = ['/api/health', '/api/test', '/api/system/status'].includes(req.path);
      if (mongoose.connection.readyState !== 1 && req.path.startsWith('/api/') && !isPublicRoute) {
        return res.status(503).json({ error: "Database connection is not ready. Please confirm your MONGODB_URI in Settings." });
      }
      next();
    };
    app.use(checkMongoConnection);

    // Request logging middleware
    app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[REQ] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
      });
      next();
    });

  // MongoDB Connection (non-blocking)
  if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
      .then(async () => {
        console.log("Connected to MongoDB");
        // Clean up legacy indexes
        try {
          const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
          if (collections.length > 0) {
            const indexes = await mongoose.connection.db.collection('users').indexes();
            if (indexes.some(idx => idx.name === 'phone_1')) {
              console.log("Dropping legacy 'phone_1' unique index...");
              await mongoose.connection.db.collection('users').dropIndex('phone_1');
            }
            if (indexes.some(idx => idx.name === 'accountId_1')) {
              console.log("Dropping legacy 'accountId_1' unique index...");
              await mongoose.connection.db.collection('users').dropIndex('accountId_1');
            }
          }
        } catch (err) {
          console.warn("Could not check/drop legacy indexes:", err.message);
        }
      })
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
    const { uid, email, phone, displayName, photoURL, referralCode: referredBy } = req.body;
    
    if (!uid) return res.status(400).json({ error: "UID is required" });

    try {
      // 1. Try finding by UID first (Standard login)
      let user = await User.findOne({ uid });
      
      // 2. If no user by UID, check if this email/phone already belongs to someone (Registration/Linking)
      if (!user) {
        if (email) {
          user = await User.findOne({ email });
          if (user && user.uid && user.uid !== uid) {
            console.log(`[SYNC] Linking existing email ${email} to new UID ${uid}`);
          }
        }
        
        if (!user && phone) {
          user = await User.findOne({ phone });
          if (user && user.uid && user.uid !== uid) {
             console.log(`[SYNC] Linking existing phone ${phone} to new UID ${uid}`);
          }
        }
        
        if (user) {
          // One email can only register once - we link it to the new provider UID
          user.uid = uid;
          await user.save();
        }
      }

      // 3. Create new user if still not found
      if (!user) {
        const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        user = await User.create({ 
          uid, 
          email: email || `user_${uid}@profitwavy.placeholder`,
          phone,
          displayName, 
          photoURL, 
          referralCode: newReferralCode,
          referredBy: referredBy || null,
          balance: 5
        });

        await Transaction.create({
          userId: uid,
          type: 'bonus',
          amount: 5,
          planName: 'Registration Bonus'
        });

        return res.status(201).json(user);
      } 
      
      // Update metadata if needed
      let needsSave = false;
      if (displayName && user.displayName !== displayName) {
        user.displayName = displayName;
        needsSave = true;
      }
      if (phone && user.phone !== phone) {
        user.phone = phone;
        needsSave = true;
      }
      if (photoURL && user.photoURL !== photoURL) {
        user.photoURL = photoURL;
        needsSave = true;
      }
      if (needsSave) await user.save();

      // Ensure bonus exists for existing user if missing
      const bonusExists = await Transaction.findOne({ userId: user.uid, type: 'bonus', planName: 'Registration Bonus' });
      if (!bonusExists) {
        await Transaction.create({
          userId: user.uid,
          type: 'bonus',
          amount: 5,
          planName: 'Registration Bonus'
        });
        // We don't adjust balance here to avoid double-crediting if balance was previously spent
      }

      res.json(user);
    } catch (error) {
      console.error("[SYNC-ERROR]", error);
      res.status(500).json({ error: "System failed to sync user data" });
    }
  });

  // Health check with DB status
  app.get("/api/system/status", async (req, res) => {
    console.log("[API] Hit /api/system/status");
    try {
      res.json({ 
        status: "ok", 
        db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("[API] Error in /api/system/status:", error);
      res.status(500).json({ status: "error" });
    }
  });

  // Manual Bonus Claim
  app.post("/api/users/:uid/claim-bonus", async (req, res) => {
    console.log(`[API] Hit /api/users/${req.params.uid}/claim-bonus`);
    try {
      const { uid } = req.params;
      const user = await User.findOne({ uid });
      if (!user) return res.status(404).json({ error: "User not found" });

      const bonusExists = await Transaction.findOne({ userId: uid, type: 'bonus', planName: 'Registration Bonus' });
      if (bonusExists) {
        return res.status(400).json({ error: "Registration bonus already claimed" });
      }

      await User.updateOne({ uid }, { $inc: { balance: 5 } });
      await Transaction.create({
        userId: uid,
        type: 'bonus',
        amount: 5,
        planName: 'Registration Bonus'
      });
      
      const updatedUser = await User.findOne({ uid });
      res.json({ message: "Bonus claimed successfully", balance: updatedUser.balance });
    } catch (error) {
      console.error("[API] Error in claim-bonus:", error);
      res.status(500).json({ error: "Failed to claim bonus" });
    }
  });

  // Get User Data
  app.get("/api/users/lookup", async (req, res) => {
    let { identity } = req.query;
    if (!identity) return res.status(400).json({ error: "Identity (phone, name, or email) is required" });
    
    // Normalize identity: trim and if it's a phone-like string, we could potentially strip non-digits
    // but for now let's just trim and handle it as-is.
    identity = identity.trim();

    try {
      const user = await User.findOne({ 
        $or: [
          { phone: identity },
          { phone: identity.replace(/\s+/g, '') }, // Match without spaces
          { displayName: new RegExp(`^${identity}$`, 'i') },
          { email: new RegExp(`^${identity}$`, 'i') }
        ]
      });
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ email: user.email });
    } catch (error) {
      console.error(`[API] Error in lookup ${identity}:`, error);
      res.status(500).json({ error: "Lookup failed" });
    }
  });

  // Get User Data
  app.get("/api/users/:uid", async (req, res) => {
    console.log(`[API] Hit /api/users/${req.params.uid}`);
    try {
      const user = await User.findOne({ uid: req.params.uid });
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const bonusTx = await Transaction.findOne({ userId: req.params.uid, type: 'bonus', planName: 'Registration Bonus' });
      const userObj = user.toObject();
      userObj.hasClaimedBonus = !!bonusTx;
      
      res.json(userObj);
    } catch (error) {
      console.error(`[API] Error in get user ${req.params.uid}:`, error);
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

  // Paystack Transfer Helper
  const initiatePaystackPayout = async (withdrawalData) => {
    const { amount, metadata, userId } = withdrawalData;
    const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

    if (!SECRET_KEY || SECRET_KEY.includes('YOUR_PAYSTACK_SECRET_KEY')) {
      console.log(`[PAYOUT-DEMO] Paystack Secret Key not configured for user ${userId}. Payout GH₵ ${amount} simulated.`);
      return { status: 'simulated', message: 'Demo mode: real payout skipped' };
    }

    try {
      // 1. Create Transfer Recipient
      const recipientRes = await fetch('https://api.paystack.co/transferrecipient', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: metadata.method === 'momo' ? 'mobile_money' : 'nuban',
          name: metadata.accountName || `ProfitWavy User ${userId}`,
          account_number: metadata.details,
          bank_code: metadata.network || 'MTN', // Paystack uses MTN, VOD, ATL for GH MOMO
          currency: 'GHS'
        })
      });

      const recipientData = await recipientRes.json();
      if (!recipientRes.ok || !recipientData.status) {
        throw new Error(`Paystack Recipient Error: ${recipientData.message}`);
      }

      // 2. Initiate Transfer
      const transferRes = await fetch('https://api.paystack.co/transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source: 'balance',
          amount: Math.round(amount * 100), // convert to pesewas
          recipient: recipientData.data.recipient_code,
          reason: `ProfitWavy Withdrawal - User ${userId}`,
          currency: 'GHS'
        })
      });

      const transferData = await transferRes.json();
      if (!transferRes.ok || !transferData.status) {
        throw new Error(`Paystack Payout Error: ${transferData.message}`);
      }

      console.log(`[PAYOUT-SUCCESS] Paystack Transfer initiated for user ${userId}: ${transferData.data.transfer_code}`);
      return { status: 'success', reference: transferData.data.reference };
    } catch (err) {
      console.error('[PAYOUT-FATAL]', err.message);
      throw err;
    }
  };

  // Create Transaction
  app.post("/api/transactions", async (req, res) => {
    const { userId, type, amount, planName, metadata } = req.body;
    try {
      // For withdrawals, check balance FIRST
      let user = await User.findOne({ uid: userId });
      if (!user) return res.status(404).json({ error: "User not found" });

      if (type === 'withdrawal' && user.balance < amount) {
        return res.status(400).json({ error: "Insufficient balance for withdrawal" });
      }

      // If it's a real withdrawal, try Paystack first
      let payoutStatus = null;
      if (type === 'withdrawal') {
        try {
          payoutStatus = await initiatePaystackPayout({ amount, metadata, userId });
        } catch (err) {
          return res.status(500).json({ error: `Payout failed: ${err.message}` });
        }
      }

      const transaction = await Transaction.create({ 
        userId, 
        type, 
        amount, 
        planName,
        status: payoutStatus?.status === 'success' ? 'completed' : (type === 'withdrawal' ? 'pending' : 'completed')
      });
      
      // Update user stats
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

          // Handle Referral Bonus (5% of deposit to the referrer)
          if (user.referredBy) {
            const referrer = await User.findOne({ referralCode: user.referredBy });
            if (referrer) {
              const refBonus = amount * 0.05; // 5%
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
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
  } catch (err) {
    console.error("FATAL: Failed to start server:", err);
    process.exit(1);
  }
}

// Global process error handlers
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer().catch(err => {
  console.error("CRITICAL: Unhandled error in startServer chain:", err);
});
