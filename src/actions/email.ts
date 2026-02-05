"use server";

import nodemailer from "nodemailer";
import { z } from "zod";

// --- 1. STRICT CONFIGURATION (Security) ---
const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(50, "Name is too long"),
  email: z.string().trim().email("Invalid email format"),
  message: z.string().trim().min(10, "Message needs more detail").max(5000, "Message limit exceeded"),
});

// Generate Futuristic Ticket ID (e.g., DPX-2026-A7X9)
const generateTicketId = () => {
  const segment = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DPX-${new Date().getFullYear()}-${segment}`;
};

// --- 2. ADVANCED HTML TEMPLATE (The "Wow" Factor) ---
// Yeh template frontend ke "Terminal" look se match karega.
const createPremiumTemplate = (name: string, ticketId: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <style>
    /* RESET & BASICS */
    body { margin: 0; padding: 0; background-color: #000000; font-family: 'Courier New', Courier, monospace; color: #ffffff; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; background-color: #000000; padding: 40px 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #050505; border: 1px solid #333; border-radius: 0px; overflow: hidden; }
    
    /* HEADER (Digital Look) */
    .header { background: #0A0A0A; padding: 30px; border-bottom: 2px solid #E50914; text-align: left; }
    .brand { color: #fff; font-size: 20px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
    .brand span { color: #E50914; }
    
    /* CONTENT */
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; color: #fff; font-weight: bold; }
    .text { color: #888; font-size: 14px; line-height: 1.6; margin-bottom: 20px; font-family: 'Arial', sans-serif; }
    
    /* TICKET BOX (The Main Highlight) */
    .ticket-panel { background: #0F0F0F; border-left: 4px solid #E50914; padding: 20px; margin: 30px 0; }
    .data-row { display: block; margin-bottom: 8px; font-size: 12px; letter-spacing: 1px; color: #666; font-family: 'Courier New', monospace; }
    .data-val { color: #fff; font-weight: bold; margin-left: 10px; }
    .status-badge { display: inline-block; background: rgba(229, 9, 20, 0.2); color: #E50914; padding: 4px 8px; font-size: 10px; border-radius: 4px; border: 1px solid #E50914; text-transform: uppercase; letter-spacing: 1px; }

    /* BUTTON */
    .btn-container { text-align: center; margin-top: 40px; }
    .btn { background-color: #96161d; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; display: inline-block; transition: all 0.3s; }
    
    /* FOOTER */
    .footer { background: #0A0A0A; padding: 20px; text-align: center; border-top: 1px solid #222; }
    .footer-text { font-size: 10px; color: #444; text-transform: uppercase; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="brand">Digital Pixora<span>.</span></div>
      </div>

      <div class="content">
        <div class="greeting">Uplink Established, ${name}.</div>
        <p class="text">
          Our automated sentinels have received your transmission. This is an automated acknowledgment that your query has been logged into our secure database.
        </p>

        <div class="ticket-panel">
          <div class="data-row">TICKET ID: <span class="data-val">${ticketId}</span></div>
          <div class="data-row">TIMESTAMP: <span class="data-val">${new Date().toISOString().split('T')[0]}</span></div>
          <div class="data-row">SECTOR: <span class="data-val">Global HQ</span></div>
          <div style="margin-top: 15px;">
             <span class="status-badge">STATUS: ANALYZING</span>
          </div>
        </div>

        <p class="text">
          Our engineering team is currently decoding your requirements. Expect a high-priority response within 24 hours.
        </p>

        <div class="btn-container">
          <a href="https://digitalpixora.com" class="btn">Return to Base</a>
        </div>
      </div>

      <div class="footer">
        <p class="footer-text">Secure Transmission // ${new Date().getFullYear()} Digital Pixora</p>
        <p class="footer-text">Hyderabad, Pakistan</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// --- 3. SERVER ACTION ---
export async function sendEmail(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  // Step 1: Strict Validation
  const result = contactFormSchema.safeParse({ name, email, message });
  if (!result.success) {
    let errorMessage = "";
    result.error.issues.forEach((issue) => {
      errorMessage += issue.message + ". ";
    });
    return { success: false, message: errorMessage || "Invalid input data." };
  }

  // Step 2: Config
  const ticketId = generateTicketId();
  const SENDER_EMAIL = "hellodigitalpixora@gmail.com"; 

  // Step 3: Create Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, 
    port: Number(process.env.SMTP_PORT),
    secure: false, // True for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    // Step 4: Parallel Sending (Faster)
    await Promise.all([
      // A. Admin Email (Simple & Clean)
      transporter.sendMail({
        from: `"Digital Pixora Bot" <${SENDER_EMAIL}>`,
        to: SENDER_EMAIL,
        replyTo: email,
        subject: `🚀 New Lead: ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\nTicket: ${ticketId}`, // Fallback text
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #000;">New Project Inquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>ID:</strong> <code style="background:#eee; padding:2px 5px;">${ticketId}</code></p>
            <hr/>
            <h3>Message:</h3>
            <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
          </div>
        `,
      }),

      // B. User Auto-Reply (The Premium One)
      transporter.sendMail({
        from: `"Digital Pixora" <${SENDER_EMAIL}>`,
        to: email,
        subject: `[${ticketId}] Transmission Received`,
        html: createPremiumTemplate(name, ticketId),
      })
    ]);

    return { success: true, message: "Transmission Successful" };

  } catch (error) {
    console.error("❌ EMAIL SERVER ERROR:", error);
    return { success: false, message: "Server connection failed. Try again later." };
  }
}