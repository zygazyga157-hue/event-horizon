/**
 * Email SMTP Service
 * 
 * Sends emails via SMTP using nodemailer.
 * Supports admin passkey emails and auction notifications.
 */

import nodemailer from 'nodemailer';
import { formatPasskey } from '@/lib/auth/passkey';

// SMTP configuration from environment variables
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const FROM_ADDRESS = process.env.SMTP_FROM || 'noreply@zyga.dev';
const FROM_NAME = 'Event Horizon Gallery';

// Create transporter lazily
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
      throw new Error('SMTP credentials not configured');
    }
    transporter = nodemailer.createTransport(SMTP_CONFIG);
  }
  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email via SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transport = getTransporter();
    
    await transport.sendMail({
      from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    });
    
    return true;
  } catch (error) {
    console.error('[SMTP] Failed to send email:', error);
    return false;
  }
}

/**
 * Send admin passkey email
 */
export async function sendAdminPasskeyEmail(
  email: string,
  passkey: string
): Promise<boolean> {
  const formattedPasskey = formatPasskey(passkey);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; background: #FAFAFA; margin: 0; padding: 40px; }
        .container { max-width: 480px; margin: 0 auto; background: #0B0B0B; color: #FAFAFA; padding: 40px; }
        .logo { font-size: 14px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin-bottom: 32px; }
        h1 { font-size: 24px; font-weight: 400; margin: 0 0 16px 0; }
        .passkey { font-family: 'SF Mono', 'Monaco', monospace; font-size: 32px; letter-spacing: 4px; background: #1a1a1a; padding: 24px 32px; margin: 24px 0; text-align: center; border: 1px solid #333; }
        p { color: #888; line-height: 1.6; margin: 16px 0; }
        .warning { font-size: 12px; color: #666; margin-top: 32px; padding-top: 16px; border-top: 1px solid #333; }
        .footer { margin-top: 32px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">Event Horizon Gallery</div>
        <h1>Admin Access Passkey</h1>
        <p>Use this passkey to complete your admin sign-in:</p>
        <div class="passkey">${formattedPasskey}</div>
        <p>This passkey expires in <strong>10 minutes</strong>.</p>
        <div class="warning">
          If you didn't request admin access, you can safely ignore this email.
          Someone may have entered your email address by mistake.
        </div>
        <div class="footer">
          Event Horizon Gallery — zyga.dev
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Event Horizon Gallery - Admin Access Passkey

Use this passkey to complete your admin sign-in:

${formattedPasskey}

This passkey expires in 10 minutes.

If you didn't request admin access, you can safely ignore this email.
  `.trim();
  
  return sendEmail({
    to: email,
    subject: 'Event Horizon Gallery - Admin Passkey',
    html,
    text,
  });
}

/**
 * Send auction winner notification email
 */
export async function sendAuctionWinnerEmail(
  email: string,
  winnerName: string,
  exhibitTitle: string,
  winningBid: string,
  currency: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; background: #FAFAFA; margin: 0; padding: 40px; }
        .container { max-width: 480px; margin: 0 auto; background: #0B0B0B; color: #FAFAFA; padding: 40px; }
        .logo { font-size: 14px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin-bottom: 32px; }
        h1 { font-size: 24px; font-weight: 400; margin: 0 0 16px 0; }
        .highlight { background: #1a1a1a; padding: 24px; margin: 24px 0; border: 1px solid #333; }
        .bid-amount { font-size: 28px; font-weight: 600; color: #4ade80; }
        p { color: #888; line-height: 1.6; margin: 16px 0; }
        .footer { margin-top: 32px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">Event Horizon Gallery</div>
        <h1>Congratulations, ${winnerName}!</h1>
        <p>You've won the auction for:</p>
        <div class="highlight">
          <strong>${exhibitTitle}</strong>
          <div class="bid-amount">${currency} ${winningBid}</div>
        </div>
        <p>We'll be in touch shortly with payment instructions and next steps.</p>
        <div class="footer">
          Event Horizon Gallery — zyga.dev
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: email,
    subject: `You won the auction for ${exhibitTitle}!`,
    html,
  });
}

/**
 * Queue an email for async sending (stores in EmailOutbox)
 */
export async function queueEmail(
  prisma: import('@prisma/client').PrismaClient,
  options: EmailOptions
): Promise<string> {
  const email = await prisma.emailOutbox.create({
    data: {
      toAddress: options.to,
      subject: options.subject,
      htmlBody: options.html,
      textBody: options.text,
      status: 'PENDING',
    },
  });
  
  return email.id;
}
