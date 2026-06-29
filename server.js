/* ============================================================
   CodeMiners Hackathon — Node.js/Express Backend Server
   Razorpay Webhook verification & Data synchronization
   ============================================================ */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Initialize Firebase App
const firebaseConfig = {
  apiKey:            process.env.FIREBASE_API_KEY || "AIzaSyBPXWdCMkXUtubyOx5OGR6iPxcmqJDqex8",
  authDomain:        process.env.FIREBASE_AUTH_DOMAIN || "codeminer.firebaseapp.com",
  projectId:         process.env.FIREBASE_PROJECT_ID || "codeminer",
  storageBucket:     process.env.FIREBASE_STORAGE_BUCKET || "codeminer.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "904581344425",
  appId:             process.env.FIREBASE_APP_ID || "1:904581344425:web:37ae619d7d8403957f8db8",
  measurementId:     process.env.FIREBASE_MEASUREMENT_ID || "G-1P9T3KN8VJ"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration variables
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "whsec_Nq9gJ72kVT1f8eZ7P6bQ4w2x";
const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbxz-7gHowiQ7B-MLiSHOO3U6qclqm7Hr4oKaChr8a8Wqw31Y2Y9TBBDBIaExXKGwJNl/exec";

// Enable CORS
app.use(cors());

// Middleware to parse raw body buffer for cryptographical validation
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Razorpay Webhook listener endpoint
app.post('/api/razorpay-webhook', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  
  if (!signature) {
    console.warn("Unauthorized webhook request: Missing signature header.");
    return res.status(400).send("Missing signature header.");
  }

  // Cryptographically verify signature matches secret
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  hmac.update(req.rawBody);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature !== signature) {
    console.error("Signature verification failed. Potential spoof attack.");
    return res.status(400).send("Signature verification failed.");
  }

  const payload = req.body;
  console.log(`Razorpay webhook verified. Event: ${payload.event}`);

  // Handle captured payments
  if (payload.event === 'payment.captured') {
    const payment = payload.payload.payment.entity;
    const notes = payment.notes;

    if (!notes || !notes.email) {
      console.warn("Payment captured event missing required registration notes.");
      return res.status(200).send("Payment processed (no notes).");
    }

    console.log(`Processing successful registration payment ID: ${payment.id} for ${notes.email}`);

    try {
      // 1. Write registration record to Firestore
      const regId = `REG-CM-HACK-${Date.now()}`;
      const regDocRef = doc(db, 'registrations', regId);
      
      const registrationData = {
        registrationId: regId,
        fullName:       notes.name,
        email:          notes.email,
        phone:          notes.phone,
        college:        notes.college,
        year:           notes.year,
        idType:         notes.pin ? 'pin' : 'hallticket',
        idValue:        notes.pin || notes.hallticket,
        role:           notes.role || 'leader',
        eventName:      notes.eventName,
        teamName:       notes.teamName || '',
        teamSize:       parseInt(notes.teamSize) || 1,
        paymentId:      payment.id,
        paymentStatus:  'captured',
        amountPaid:     payment.amount / 100, // in INR
        createdAt:      new Date().toISOString()
      };

      await setDoc(regDocRef, registrationData);
      console.log(`Firestore registration document ${regId} saved successfully.`);

      // 2. Post registration details to Google Sheets Webhook
      const formDetails = new URLSearchParams();
      formDetails.append('Name',       notes.name);
      formDetails.append('Email',      notes.email);
      formDetails.append('Phone',      notes.phone);
      formDetails.append('College',    notes.college);
      formDetails.append('Year',       notes.year);
      formDetails.append('ID',         notes.pin || notes.hallticket);
      formDetails.append('Role',       notes.role || 'leader');
      formDetails.append('TeamName',   notes.teamName || '');
      formDetails.append('Event',      notes.eventName);
      formDetails.append('PaymentID',  payment.id);
      formDetails.append('Status',     'Paid');

      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formDetails.toString()
      });

      if (response.ok) {
        console.log("Google Sheets spreadsheet registration sync succeeded.");
      } else {
        console.error(`Google Sheets sync status failed: ${response.status}`);
      }

      // 3. (Optional) Trigger email notification to the user here
      // e.g., sendEmail(notes.email, notes.name, payment.id);

    } catch (dbError) {
      console.error("Error saving webhook payload records: ", dbError);
      return res.status(500).send("Database sync error.");
    }
  }

  // Acknowledge receipt of the webhook to Razorpay
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`CodeMiners Backend Server running on port ${PORT}`);
});
