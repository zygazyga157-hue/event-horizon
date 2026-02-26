import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface ContactFormData {
  name: string;
  email: string;
  organization?: string;
  interestType: string;
  budgetRange?: string;
  timeline?: string;
  message: string;
  honeypot?: string;
}

/**
 * POST /api/contact
 * Sends contact form email via SMTP
 */
export async function POST(request: Request) {
  try {
    const body: ContactFormData = await request.json();

    // Honeypot bot trap - if filled, silently succeed but don't send
    if (body.honeypot) {
      return NextResponse.json({ success: true });
    }

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, message" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check SMTP configuration
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
    
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.error("SMTP configuration missing");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 503 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || "587", 10),
      secure: parseInt(SMTP_PORT || "587", 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Build email content
    const emailSubject = `[Event Horizon] New inquiry from ${body.name}`;
    
    const emailHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0a0a0a; border-bottom: 1px solid #e5e5e5; padding-bottom: 12px;">
          New Contact Form Submission
        </h2>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 0; color: #737373; width: 140px;">Name</td>
            <td style="padding: 8px 0; color: #0a0a0a; font-weight: 500;">${body.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #737373;">Email</td>
            <td style="padding: 8px 0; color: #0a0a0a;">
              <a href="mailto:${body.email}" style="color: #0a0a0a;">${body.email}</a>
            </td>
          </tr>
          ${body.organization ? `
          <tr>
            <td style="padding: 8px 0; color: #737373;">Organization</td>
            <td style="padding: 8px 0; color: #0a0a0a;">${body.organization}</td>
          </tr>
          ` : ''}
          ${body.interestType ? `
          <tr>
            <td style="padding: 8px 0; color: #737373;">Interest Type</td>
            <td style="padding: 8px 0; color: #0a0a0a;">${body.interestType}</td>
          </tr>
          ` : ''}
          ${body.budgetRange ? `
          <tr>
            <td style="padding: 8px 0; color: #737373;">Budget Range</td>
            <td style="padding: 8px 0; color: #0a0a0a;">${body.budgetRange}</td>
          </tr>
          ` : ''}
          ${body.timeline ? `
          <tr>
            <td style="padding: 8px 0; color: #737373;">Timeline</td>
            <td style="padding: 8px 0; color: #0a0a0a;">${body.timeline}</td>
          </tr>
          ` : ''}
        </table>

        <div style="background: #fafafa; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="color: #737373; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
            Message
          </p>
          <p style="color: #0a0a0a; margin: 0; white-space: pre-wrap; line-height: 1.6;">
            ${body.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </p>
        </div>

        <p style="color: #a3a3a3; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5;">
          Sent via Event Horizon Gallery contact form
        </p>
      </div>
    `;

    const emailText = `
New Contact Form Submission
===========================

Name: ${body.name}
Email: ${body.email}
${body.organization ? `Organization: ${body.organization}\n` : ''}${body.interestType ? `Interest Type: ${body.interestType}\n` : ''}${body.budgetRange ? `Budget Range: ${body.budgetRange}\n` : ''}${body.timeline ? `Timeline: ${body.timeline}\n` : ''}
Message:
${body.message}

---
Sent via Event Horizon Gallery contact form
    `.trim();

    // Send email
    await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to: SMTP_USER, // Send to the SMTP user (your email)
      replyTo: body.email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    });

    console.log(`Contact email sent from ${body.email}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
