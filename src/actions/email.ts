"use server";

import nodemailer from "nodemailer";
import { z } from "zod";

// --- 1. CONFIGURATION ---
const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(50, "Name is too long"),
  email: z.string().trim().email("Invalid email format"),
  message: z.string().trim().min(10, "Please provide more details").max(5000, "Message limit exceeded"),
});

const generateTicketId = () => {
  const segment = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DPX-${new Date().getFullYear()}-${segment}`;
};

// --- 2. THE "ARCHITECT" ULTRA-PREMIUM TEMPLATE ---
const createPremiumTemplate = (name: string, ticketId: string, messagePreview: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <title>Digital Pixora | Project Status</title>
  <style>
    /* RESET & BASE */
    body { margin: 0; padding: 0; background-color: #000000; color: #e5e5e5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; width: 100%; }
    
    /* LAYOUT */
    .wrapper { width: 100%; padding: 40px 0; background-color: #000000; }
    .container { max-width: 600px; margin: 0 auto; background-color: #050505; border: 1px solid #1f1f1f; border-radius: 12px; overflow: hidden; }
    
    /* ACCENT BAR */
    .accent-bar { height: 4px; background: linear-gradient(90deg, #E50914, #ff4d4d); width: 100%; }

    /* HEADER */
    .header { padding: 30px 40px; border-bottom: 1px solid #1f1f1f; background: #080808; display: flex; align-items: center; justify-content: space-between; }
    .brand { color: #fff; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; text-decoration: none; }
    .meta { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; float: right; }

    /* CONTENT BODY */
    .content { padding: 40px; }
    .h1 { font-size: 22px; font-weight: 600; color: #fff; margin: 0 0 10px; letter-spacing: -0.3px; line-height: 1.3; }
    .p { font-size: 14px; color: #888; line-height: 1.6; margin: 0 0 25px; }

    /* THE GRID SYSTEM (Dashboard Look) */
    .grid { display: table; width: 100%; border: 1px solid #1f1f1f; border-radius: 8px; margin-bottom: 30px; background: #0A0A0A; }
    .grid-row { display: table-row; }
    .grid-cell { display: table-cell; padding: 15px 20px; border-bottom: 1px solid #1f1f1f; border-right: 1px solid #1f1f1f; width: 50%; vertical-align: top; }
    .grid-cell:last-child { border-right: none; }
    .grid-row:last-child .grid-cell { border-bottom: none; }
    
    .label { font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 5px; font-weight: 600; }
    .value { font-size: 13px; color: #fff; font-family: 'SF Mono', 'Menlo', monospace; font-weight: 500; }
    .status-active { color: #22c55e; display: inline-block; position: relative; padding-left: 12px; }
    .status-active::before { content: ''; position: absolute; left: 0; top: 5px; width: 6px; height: 6px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 8px rgba(34, 197, 94, 0.4); }

    /* MESSAGE BLOCK (Terminal Style) */
    .terminal { background: #0d0d0d; border-radius: 6px; border: 1px solid #1f1f1f; padding: 20px; font-family: 'SF Mono', 'Menlo', monospace; font-size: 12px; color: #aaa; margin-bottom: 30px; position: relative; }
    .terminal::before { content: 'Brief Snapshot'; position: absolute; top: -10px; left: 15px; background: #050505; padding: 0 8px; font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px; }

    /* TIMELINE (Visual Progress) */
    .timeline { margin-bottom: 30px; }
    .step { display: flex; align-items: center; margin-bottom: 12px; }
    .step-icon { width: 16px; height: 16px; border-radius: 50%; background: #1f1f1f; margin-right: 12px; position: relative; display: flex; align-items: center; justify-content: center; }
    .step-icon.active { background: #E50914; box-shadow: 0 0 10px rgba(229, 9, 20, 0.3); }
    .step-icon.active::after { content: '✓'; color: white; font-size: 10px; font-weight: bold; }
    .step-text { font-size: 12px; color: #444; font-weight: 500; }
    .step-text.active { color: #fff; }
    .line { height: 15px; width: 1px; background: #1f1f1f; margin-left: 8px; margin-top: -8px; margin-bottom: 4px; }

    /* CTA BUTTON */
    .btn-wrap { text-align: center; }
    .btn { display: inline-block; background-color: #fff; color: #000; font-size: 13px; font-weight: 700; padding: 14px 30px; border-radius: 50px; text-decoration: none; transition: 0.2s; box-shadow: 0 4px 20px rgba(255,255,255,0.1); }
    .btn:hover { background-color: #e6e6e6; transform: translateY(-1px); }

    /* FOOTER */
    .footer { padding: 30px; background: #030303; border-top: 1px solid #1f1f1f; text-align: center; }
    .footer-text { font-size: 11px; color: #444; line-height: 1.5; margin: 0; }
    .footer-link { color: #666; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="accent-bar"></div>
      
      <div class="header">
        <span class="brand">Digital Pixora<span>.</span></span>
        <span class="meta">${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </div>

      <div class="content">
        <h1 class="h1">We’ve secured your request, ${name}.</h1>
        <p class="p">
          This is an automated acknowledgment. Your inquiry has been logged into our central workspace and assigned to a Senior Architect.
        </p>

        <div class="grid">
          <div class="grid-row">
            <div class="grid-cell">
              <span class="label">Reference ID</span>
              <span class="value" style="color: #E50914;">${ticketId}</span>
            </div>
            <div class="grid-cell">
              <span class="label">Current Status</span>
              <span class="value status-active">In Queue</span>
            </div>
          </div>
          <div class="grid-row">
            <div class="grid-cell">
              <span class="label">Priority Level</span>
              <span class="value">High</span>
            </div>
            <div class="grid-cell">
              <span class="label">Est. Response</span>
              <span class="value">~24 Hours</span>
            </div>
          </div>
        </div>

        <div class="terminal">
          <span style="color: #666;">></span> ${messagePreview.substring(0, 140)}${messagePreview.length > 140 ? '...' : ''}
        </div>

        <div class="timeline">
          <div class="step">
            <div class="step-icon active"></div>
            <div class="step-text active">Inquiry Received</div>
          </div>
          <div class="line"></div>
          <div class="step">
            <div class="step-icon"></div>
            <div class="step-text">Engineering Review</div>
          </div>
          <div class="line"></div>
          <div class="step">
            <div class="step-icon"></div>
            <div class="step-text">Strategic Proposal</div>
          </div>
        </div>

        <div class="btn-wrap">
          <a href="https://digitalpixora.com" class="btn">View Workspace</a>
        </div>
      </div>

      <div class="footer">
        <p class="footer-text">
          &copy; ${new Date().getFullYear()} Digital Pixora Inc. • Hyderabad, Pakistan<br>
          <span style="opacity: 0.5;">Automated System Notification // Do not reply directly to this bot.</span>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// --- 3. SERVER ACTION (Brevo Configured) ---
export async function sendEmail(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  // 1. Validation
  const result = contactFormSchema.safeParse({ name, email, message });
  if (!result.success) {
    let errorMessage = "";
    result.error.issues.forEach((issue) => { errorMessage += issue.message + ". "; });
    return { success: false, message: errorMessage || "Invalid input data." };
  }

  // 2. Env Config (CHECK YOUR .ENV.LOCAL)
  const SMTP_LOGIN = process.env.SMTP_USER;
  const SMTP_KEY = process.env.SMTP_PASSWORD;
  const SENDER_IDENTITY = process.env.MY_EMAIL; 

  if (!SMTP_LOGIN || !SMTP_KEY || !SENDER_IDENTITY) {
      return { success: false, message: "Server misconfiguration. Contact Admin." };
  }

  // 3. Transporter
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // TLS
    auth: { user: SMTP_LOGIN, pass: SMTP_KEY },
  });

  const ticketId = generateTicketId();

  try {
    await Promise.all([
      // A. Admin Notification
      transporter.sendMail({
        from: `"Pixora Bot" <${SENDER_IDENTITY}>`,
        to: SENDER_IDENTITY,
        replyTo: email,
        subject: `⚡ Lead: ${name}`,
        html: `
            <div style="font-family: -apple-system, sans-serif; padding: 20px;">
                <h3 style="margin-top:0;">New Inquiry</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <hr style="border:0; border-top:1px solid #eee; margin: 20px 0;">
                <p style="white-space: pre-wrap;">${message}</p>
            </div>
        `
      }),

      // B. Client Auto-Reply (The Architect Template)
      transporter.sendMail({
        from: `"Digital Pixora" <${SENDER_IDENTITY}>`,
        to: email,
        subject: `Received: Project Inquiry [${ticketId}]`,
        html: createPremiumTemplate(name, ticketId, message),
      })
    ]);

    return { success: true, message: "Transmission Successful" };

  } catch (error: any) {
    console.error("❌ EMAIL ERROR:", error);
    return { success: false, message: "Email Service Failed." };
  }
}