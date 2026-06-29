import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "whsec_Nq9gJ72kVT1f8eZ7P6bQ4w2x";
const GOOGLE_SHEETS_URL = Deno.env.get("GOOGLE_SHEETS_WEBHOOK_URL") || "https://script.google.com/macros/s/AKfycbxz-7gHowiQ7B-MLiSHOO3U6qclqm7Hr4oKaChr8a8Wqw31Y2Y9TBBDBIaExXKGwJNl/exec";

serve(async (req) => {
  // Handle CORS Preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, x-razorpay-signature",
      }
    });
  }

  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    console.error("Missing signature header.");
    return new Response("Missing signature header", { status: 400 });
  }

  const rawBody = await req.text();

  // Cryptographically verify signature using Web Crypto API
  const encoder = new TextEncoder();
  const keyData = encoder.encode(WEBHOOK_SECRET);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(rawBody)
  );

  // Convert binary signature to hex representation
  const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (generatedSignature !== signature) {
    console.error("Signature verification failed. Expected: " + generatedSignature + ", Got: " + signature);
    return new Response("Signature verification failed", { status: 400 });
  }

  console.log("Razorpay Signature Verified Successfully.");

  // Parse webhook payload
  const payload = JSON.parse(rawBody);

  if (payload.event === "payment.captured") {
    const payment = payload.payload.payment.entity;
    const notes = payment.notes;

    if (notes && notes.email) {
      console.log(`Processing captured registration payment for: ${notes.email}`);

      // 1. Sync to Google Sheets Webhook
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

      try {
        const sheetRes = await fetch(GOOGLE_SHEETS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formDetails.toString(),
        });
        console.log(`Google Sheets sync status: ${sheetRes.status}`);
      } catch (sheetError) {
        console.error("Failed to sync to Google Sheets:", sheetError);
      }

      // 2. Write to Supabase Database (if environment variables exist)
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (supabaseUrl && supabaseKey) {
        try {
          const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.0");
          const supabase = createClient(supabaseUrl, supabaseKey);

          const { error } = await supabase
            .from("registrations")
            .insert({
              full_name: notes.name,
              email: notes.email,
              phone: notes.phone,
              college: notes.college,
              year: notes.year,
              id_type: notes.pin ? "pin" : "hallticket",
              id_value: notes.pin || notes.hallticket,
              role: notes.role || "leader",
              event_name: notes.eventName,
              team_name: notes.teamName || "",
              team_size: parseInt(notes.teamSize) || 1,
              payment_id: payment.id,
              payment_status: "captured",
              amount_paid: payment.amount / 100,
              created_at: new Date().toISOString()
            });

          if (error) {
            console.error("Failed to write to Supabase Database table:", error);
          } else {
            console.log("Saved payment capture successfully inside Supabase Database.");
          }
        } catch (dbError) {
          console.error("Supabase Database connection error:", dbError);
        }
      }
    }
  }

  return new Response(JSON.stringify({ status: "ok" }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
