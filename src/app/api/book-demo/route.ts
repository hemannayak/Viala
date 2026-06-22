import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import path from "path";
import {
  getCustomerConfirmationHtml,
  getInternalNotificationHtml,
} from "@/lib/email-templates";

// Server-side Supabase client (uses env vars directly — no client bundle exposure)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

// Check if credentials are using the default build fallback values or empty
const isConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder-project.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Nodemailer transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "viala.health@gmail.com",
    pass: process.env.GMAIL_PASS || "pdep btql ibna ibqn",
  },
});

export async function POST(req: Request) {
  try {
    if (!isConfigured) {
      console.error("[book-demo] Supabase integration is not configured.");
      return NextResponse.json(
        { 
          success: false, 
          error: "Supabase integration is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel Project Settings and trigger a redeploy." 
        },
        { status: 500 }
      );
    }

    const body = await req.json();

    // Basic validation
    const required = ["full_name", "work_email", "organization_name"];
    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === "") {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const submittedAtDate = new Date();
    const formattedDate = submittedAtDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });

    const { error } = await supabase.from("demo_requests").insert([
      {
        full_name: body.full_name,
        work_email: body.work_email,
        phone: body.phone ?? null,
        organization_name: body.organization_name,
        organization_type: body.organization_type ?? null,
        locations: body.locations ?? null,
        message: body.message ?? null,
        status: "new",
      },
    ]);

    if (error) {
      console.error("[book-demo] Supabase insert error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Send emails (fail-safe wrapper)
    try {
      const customerHtml = getCustomerConfirmationHtml({
        full_name: body.full_name,
        organization_name: body.organization_name,
        organization_type: body.organization_type ?? "N/A",
        work_email: body.work_email,
        submitted_date: formattedDate,
      });

      const internalHtml = getInternalNotificationHtml({
        full_name: body.full_name,
        work_email: body.work_email,
        phone: body.phone ?? "",
        organization_name: body.organization_name,
        organization_type: body.organization_type ?? "N/A",
        locations: body.locations ?? "",
        message: body.message ?? "",
        submitted_at: submittedAtDate.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      });

      const mailUser = process.env.GMAIL_USER || "viala.health@gmail.com";
      const logoPath = path.join(process.cwd(), "public", "logo", "viala_logo_white.png");

      // 1. Send customer confirmation
      await transporter.sendMail({
        from: `"VIALA" <${mailUser}>`,
        to: body.work_email,
        subject: "Your VIALA Demo Booking Confirmed",
        html: customerHtml,
        attachments: [
          {
            filename: "viala_logo.png",
            path: logoPath,
            cid: "vialalogo",
          }
        ]
      });

      // 2. Send internal notification
      await transporter.sendMail({
        from: `"VIALA Lead System" <${mailUser}>`,
        to: "viala.health@gmail.com",
        subject: "New VIALA Demo Request Received",
        html: internalHtml,
        attachments: [
          {
            filename: "viala_logo.png",
            path: logoPath,
            cid: "vialalogo",
          }
        ]
      });

      console.log("[book-demo] Notification emails sent successfully via Gmail SMTP.");
    } catch (emailErr) {
      // Log the failure, but do not fail the API request!
      console.error("[book-demo] Email automation failed:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[book-demo] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
