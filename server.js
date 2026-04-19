import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { User, Transaction } from "./src/models/index.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!MONGODB_URI) {
  console.warn("CRITICAL WARNING: MONGODB_URI is not defined. Database features will be disabled.");
}

async function startServer() {
  try {
    const app = express();

    app.use(express.json());

    // Basic diagnostics endpoint (bypasses all middleware)
    app.get("/api/diagnostics", (req, res) => {
      res.json({
        ok: true,
        env: process.env.NODE_ENV || 'development',
        hasMongo: !!MONGODB_URI,
        mongoStatus: mongoose.connection.readyState,
        port: PORT
      });
    });
   
    // Institutional Integrity Middleware (Database Security Gate)
    app.use('/api', (req, res, next) => {
      // Diagnostic and system routes must always be accessible to check status
      const isStatusRoute = ['/health', '/test', '/system/status', '/diagnostics'].includes(req.path);
      
      if (mongoose.connection.readyState !== 1 && !isStatusRoute) {
        console.warn(`[INTEGRITY-GATE] Blocked ${req.method} ${req.url}: Database link is currently offline (Status: ${mongoose.connection.readyState})`);
        return res.status(503).json({ 
          error: "Institutional Database is recalibrating secure link. Re-synchronizing signals...",
          status: "initializing"
        });
      }
      next();
    });

    // Nodemailer configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const sendWithdrawalEmail = async (user, amount, details) => {
      const adminEmail = process.env.ADMIN_EMAIL || 'armcaleb1@gmail.com';
      const mailOptions = {
        from: `"Profit Wavy Protocol" <${process.env.SMTP_USER}>`,
        to: adminEmail, // Strictly to the admin for manual processing
        subject: `[ACTION REQUIRED] Manual Withdrawal Prompt: GH₵ ${amount}`,
        text: `URGENT WITHDRAWAL REQUEST\n\nA user has requested a withdrawal that requires manual processing.\n\nInvestor: ${user.displayName || user.email}\nUser UID: ${user.uid}\nAmount: GH₵ ${amount}\nMethod: ${details.method}\nDestination: ${details.details}\n\nPlease verify the user's standing and process the payment manually via your preferred institutional terminal.`,
        html: `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #ff4444; border-radius: 24px; background-color: #050505; color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ff4444; font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase; font-style: italic; margin: 0;">Manual <span style="color: #4b5563;">Withdrawal.</span></h1>
              <p style="font-size: 10px; color: #4b5563; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3em; margin-top: 5px;">Action Required by Admin</p>
            </div>
            
            <div style="border-left: 4px solid #ff4444; padding-left: 20px; margin-bottom: 30px;">
              <h2 style="font-size: 18px; font-weight: 900; text-transform: uppercase; margin: 0;">Institutional Payout Prompt</h2>
              <p style="font-size: 12px; color: #9ca3af; margin: 5px 0 0 0;">Transaction Status: <span style="color: #ff4444;">WAITING FOR ADMIN</span></p>
            </div>

            <div style="background: rgba(255,255,255,0.03); padding: 25px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #9ca3af; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Investor</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 700;">${user.displayName || user.email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #9ca3af; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Amount</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 900; color: #ff4444; font-size: 18px;">GH₵ ${amount}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #9ca3af; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Method</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 700;">${details.method.toUpperCase()} (${details.network || 'TERM'})</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #9ca3af; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Target Destination</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 700;">${details.details}</td>
                </tr>
              </table>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: rgba(255, 68, 68, 0.05); border-radius: 12px; border: 1px solid rgba(255, 68, 68, 0.2);">
              <p style="font-size: 11px; color: #ff4444; font-weight: 700; margin: 0; line-height: 1.5; text-transform: uppercase; text-align: center;">
                Prompt: Please process this transaction manually. The system has paused automatic disbursement per protocol.
              </p>
            </div>

            <div style="margin-top: 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); pt: 20px;">
              <p style="font-size: 9px; color: #4b5563; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em;">
                Profit Wavy Securities • Institutional Clearing House • v2.4.0
              </p>
            </div>
          </div>
        `
      };

      try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
          console.warn("[MAIL-GATE] SMTP credentials missing. Notification logged but not sent.");
          return;
        }
        await transporter.sendMail(mailOptions);
        console.log(`[MAIL-GATE] Withdrawal notification sent for user ${user.uid}`);
      } catch (error) {
        console.error("[MAIL-GATE] Failed to send email:", error.message);
      }
    };

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

        // Track referral institutional stats
        if (referredBy) {
          await User.updateOne({ referralCode: referredBy }, { $inc: { referralCount: 1 } });
        }

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

  // Update User Profile
  app.put("/api/users/:uid", async (req, res) => {
    const { uid } = req.params;
    const { phone, displayName } = req.body;

    try {
      const user = await User.findOne({ uid });
      if (!user) return res.status(404).json({ error: "User not found" });

      if (phone !== undefined) user.phone = phone;
      if (displayName !== undefined) user.displayName = displayName;

      await user.save();
      res.json(user);
    } catch (error) {
      console.error("[UPDATE-USER-ERROR]", error);
      res.status(500).json({ error: "Failed to update user profile" });
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

    // Paystack Transfer Helper removed - Manual processing enabled

  // Create Transaction
  app.post("/api/transactions", async (req, res) => {
    const { userId, type, amount, planName, metadata } = req.body;
    try {
      // For withdrawals, check balance FIRST
      let user = await User.findOne({ uid: userId });
      if (!user) return res.status(404).json({ error: "User not found" });

      if (type === 'withdrawal') {
        const minWithdrawal = 100;
        if (amount < minWithdrawal) {
          return res.status(400).json({ error: `Minimum withdrawal is GH₵ ${minWithdrawal}` });
        }
        if (user.balance < minWithdrawal) {
          return res.status(400).json({ error: "Insufficient amount" });
        }
        if (user.balance < amount) {
          return res.status(400).json({ error: "Insufficient balance" });
        }

        // Institutional Lock: 5 Referral Requirement (Checked AFTER balance)
        if (user.referralCount < 5) {
          return res.status(403).json({ error: "Institutional Security: You must refer 5 active members to unlock withdrawals." });
        }
      }

      // NO AUTOMATIC PAYOUTS: Manual processing required per institutional protocol
      if (type === 'withdrawal') {
        console.log(`[WITHDRAWAL-REQUEST] User ${userId} requested manual payout of GH₵ ${amount}`);
        await sendWithdrawalEmail(user, amount, metadata);
      }

      const transaction = await Transaction.create({ 
        userId, 
        type, 
        amount, 
        planName,
        status: type === 'withdrawal' ? 'pending' : 'completed'
      });
      
      // Update user stats
      if (type === 'investment') {
          // Institutional Purchase Limit: Max 2 purchases per plan
          const currentCount = user.planPurchases?.get(planName) || 0;
          if (currentCount >= 2) {
            return res.status(403).json({ error: `Institutional Limit: You have reached the maximum purchase limit (2) for the ${planName}.` });
          }

          user.totalInvested += amount;
          user.balance -= amount;

          // Update plan purchase count
          if (!user.planPurchases) user.planPurchases = new Map();
          user.planPurchases.set(planName, currentCount + 1);

          // Institutional Level Escalation
          const planLevels = {
            'Starter Plan': 1, 'Bronze Plan': 1, 'Silver Plan': 1,
            'Gold Plan': 2, 'Platinum Plan': 2,
            'Diamond Plan': 3, 'Executive Plan': 3, 'Premium Plan': 3,
            'Elite Plan': 4,
            'Legacy Plan': 5
          };
          const newLevel = planLevels[planName] || 0;
          if (newLevel > (user.level || 0)) {
            console.log(`[LEVEL-UP] User ${userId} escalated to Level ${newLevel} via ${planName}`);
            user.level = newLevel;
          }

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
          } else if (planName.includes('Plan')) {
            // Institutional 15-Day Logic: 200% Payout over 15 days
            const totalDays = 15;
            const dailyPayout = Math.floor(((amount * 2) / totalDays) * 100) / 100;
            let daysElapsed = 0;
            const intervalId = setInterval(async () => {
              daysElapsed++;
              try {
                const returnUser = await User.findOne({ uid: userId });
                if (returnUser && daysElapsed <= totalDays) {
                  const updateData = {
                    $inc: { balance: dailyPayout, totalReturns: dailyPayout }
                  };
                  if (daysElapsed === totalDays) {
                    updateData.$set = { hasCompletedTerm: true };
                  }
                  
                  await User.updateOne({ uid: userId }, updateData);
                  await Transaction.create({
                    userId,
                    type: 'return',
                    amount: dailyPayout,
                    planName: `${planName} Institutional Payout (Day ${daysElapsed}/${totalDays})`
                  });
                } else {
                  clearInterval(intervalId);
                }
              } catch (err) {
                clearInterval(intervalId);
              }
            }, 24 * 60 * 60 * 1000); // Every 24 hours
          }
        } else if (type === 'return') {
          user.totalReturns += amount;
          user.balance += amount; // Assuming returns go to balance
        } else if (type === 'deposit') {
          user.balance += amount;

          // Handle Institutional Referral Bonus (2% of deposit to the referrer)
          if (user.referredBy) {
            const referrer = await User.findOne({ referralCode: user.referredBy });
            if (referrer) {
              const refBonus = Math.floor((amount * 0.02) * 100) / 100; // 2% with precision
              referrer.balance += refBonus;
              await referrer.save();
              await Transaction.create({
                userId: referrer.uid,
                type: 'referral',
                amount: refBonus,
                planName: `Referral Incentive (2%) from ${user.displayName || user.email}`
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
    console.log(`[API-MISS] ${req.method} ${req.url}`);
    res.status(404).json({ error: `Institutional Route ${req.method} ${req.url} not found` });
  });

  // Start listening EARLY (Institutional Speed Optimization)
  // This ensures the terminal is responsive for API signals while assets are still loading
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Profit Wavy Terminal ACTIVE on port ${PORT}`);
    console.log(`[SERVER] Mode: ${process.env.NODE_ENV || 'development'}`);
  });

  // Vite middleware for development (Background Initialization)
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite Middleware in background...");
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite Middleware Integrated.");
    } catch (viteErr) {
      console.error("FAILED to initialize Vite Middleware:", viteErr.message);
    }
  } else {
    console.log("Serving Static Assets (Production Mode)...");
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
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
