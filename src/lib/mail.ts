import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

// --- 1. 🛡️ GLOBAL TYPES & CONFIG ---
export interface MailResult {
  success: boolean;
  messageId?: string;
  error?: any;
}

const SMTP_LOGIN = process.env.SMTP_USER;
const SMTP_KEY = process.env.SMTP_PASSWORD;
const SENDER_IDENTITY = process.env.MY_EMAIL || "hellodigitalpixora@gmail.com";

// --- 2. 🔐 SECURITY LAYER ---
const escapeHtml = (unsafe: string): string => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
};

// --- 3. 🧠 INTELLIGENCE LAYER ---

// A. Lead Scoring
const calculateLeadScore = (text: string): number => {
    let score = 30; 
    const lower = text.toLowerCase();
    
    if (lower.includes('budget') || lower.includes('quote') || lower.includes('retainer')) score += 20;
    if (lower.includes('urgent') || lower.includes('launch') || lower.includes('deadline')) score += 25;
    if (lower.includes('hire') || lower.includes('contract') || lower.includes('proposal')) score += 20;
    if (text.length > 250) score += 15; 

    if (lower.includes('free') || lower.includes('intern') || lower.includes('guest post')) score -= 25;
    if (lower.includes('seo service') || lower.includes('ranking')) score -= 30; 

    return Math.min(Math.max(score, 0), 100);
};

// B. Smart Link Generator
const generateSmartLinks = (contact: string) => {
    const digits = contact.replace(/\D/g, '');
    const emailMatch = contact.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    
    let waLink = "#";
    if (digits.length >= 10) {
        let finalNumber = digits;
        if (digits.startsWith('03')) finalNumber = '92' + digits.substring(1);
        if (digits.startsWith('0')) finalNumber = '92' + digits.substring(1); 
        waLink = `https://wa.me/${finalNumber}`;
    }

    return {
        wa: waLink,
        call: digits.length > 5 ? `tel:${digits}` : "#",
        mail: emailMatch ? `mailto:${emailMatch[0]}?subject=Re: Digital Pixora Project` : "#"
    };
};

// --- 4. 🎨 GOD-TIER TEMPLATES (PREMIUM UI - NO QR) ---

const getClientTemplate = (safeName: string, ticketId: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { background-color: #000000; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif; color: #ffffff; }
    .container { max-width: 600px; margin: 40px auto; background: #080808; border: 1px solid #1a1a1a; border-radius: 24px; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.9); }
    .header { background: #000; padding: 40px 20px; text-align: center; border-bottom: 1px solid #E50914; }
    .logo { color: #fff; font-weight: 800; letter-spacing: 6px; font-size: 22px; text-transform: uppercase; }
    .logo span { color: #E50914; }
    .content { padding: 50px 40px; }
    .h1 { font-size: 26px; font-weight: 700; margin-bottom: 20px; color: #fff; letter-spacing: -0.5px; }
    .text { color: #a0a0a0; font-size: 16px; line-height: 1.8; margin-bottom: 40px; }
    
    .ticket-card { background: linear-gradient(145deg, #111 0%, #050505 100%); border: 1px solid #222; padding: 30px; border-radius: 20px; text-align: left; position: relative; }
    .ticket-label { font-size: 10px; color: #444; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; margin-bottom: 10px; }
    .ticket-id { font-family: 'Courier New', monospace; font-size: 18px; color: #E50914; font-weight: bold; letter-spacing: 3px; }
    .status-dot { display: inline-block; width: 8px; height: 8px; background: #22c55e; border-radius: 50%; margin-right: 8px; }
    
    .btn { display: inline-block; background: #fff; color: #000; text-decoration: none; padding: 18px 45px; border-radius: 12px; font-weight: 700; text-transform: uppercase; font-size: 13px; letter-spacing: 1px; transition: 0.3s; margin-top: 20px; }
    .footer { background: #000; padding: 30px; text-align: center; font-size: 11px; color: #444; border-top: 1px solid #111; text-transform: uppercase; letter-spacing: 2px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><div class="logo">DIGITAL <span>PIXORA</span></div></div>
    <div class="content">
      <div class="h1">Greetings, ${safeName}.</div>
      <p class="text">
        Your request has been securely received. Our architects are currently analyzing your project parameters to ensure a high-impact execution.
      </p>
      <div class="ticket-card">
        <div class="ticket-label">Project Tracking ID</div>
        <div class="ticket-id">${ticketId}</div>
        <div style="margin-top: 15px; font-size: 12px; color: #666;">
          <span class="status-dot"></span> STATUS: VERIFIED & ACTIVE
        </div>
      </div>
      <center><a href="https://digitalpixora.com" class="btn">Enter Portal</a></center>
    </div>
    <div class="footer">SECURE UPLINK ESTABLISHED // ${new Date().getFullYear()}</div>
  </div>
</body>
</html>
`;

const getAdminTemplate = (data: any, score: number, type: "FORM" | "CHAT", context: any) => {
    const isHighValue = score > 65;
    const accent = isHighValue ? "#22c55e" : "#E50914"; 
    const links = generateSmartLinks(data.email || "000");
    const safeMsg = escapeHtml(data.message);
    const safeName = escapeHtml(data.name);

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { background: #000; font-family: 'Courier New', monospace; color: ${accent}; margin: 0; padding: 20px; }
        .hud { max-width: 650px; margin: 0 auto; border: 2px solid ${accent}; background: #050505; border-radius: 4px; overflow: hidden; box-shadow: 0 0 30px ${accent}33; }
        .top-bar { background: ${accent}; color: #000; padding: 10px 20px; font-weight: bold; font-size: 12px; display: flex; justify-content: space-between; }
        .grid { padding: 30px; }
        .row { margin-bottom: 15px; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px; }
        .key { font-size: 10px; color: #444; text-transform: uppercase; margin-bottom: 4px; }
        .val { font-size: 14px; color: #fff; }
        .msg-box { background: #0a0a0a; border: 1px solid #222; padding: 20px; color: #ddd; font-family: sans-serif; margin: 20px 0; line-height: 1.6; border-left: 4px solid ${accent}; }
        .score-fill { height: 4px; background: ${accent}; width: ${score}%; box-shadow: 0 0 10px ${accent}; }
        .actions { display: flex; gap: 10px; margin-top: 30px; }
        .act-btn { flex: 1; text-align: center; padding: 15px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
        .wa { background: #22c55e; color: #000; }
        .em { background: #fff; color: #000; }
      </style>
    </head>
    <body>
      <div class="hud">
        <div class="top-bar">
          <span>/// ${type} INTELLIGENCE REPORT ///</span>
          <span>SCORE: ${score}%</span>
        </div>
        <div class="grid">
          <div class="row"><div class="key">Identity</div><div class="val">${safeName}</div></div>
          <div class="row"><div class="key">Origin</div><div class="val">${context.location}</div></div>
          <div class="row"><div class="key">Lead Potential</div><div class="score-fill"></div></div>
          <div class="msg-box">${safeMsg}</div>
          <div class="actions">
            <a href="${links.wa}" class="act-btn wa">WhatsApp</a>
            <a href="${links.mail}" class="act-btn em">Reply Email</a>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
};

// --- 5. 🚀 TRANSPORT ENGINE (OPTIMIZED FOR INBOX) ---
const sendWithRetry = async (mailOptions: nodemailer.SendMailOptions, retries = 2): Promise<MailResult> => {
  if (!SMTP_LOGIN || !SMTP_KEY) {
      console.error("❌ SMTP CREDENTIALS MISSING");
      return { success: false, error: "Config Error" };
  }

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, 
    auth: { user: SMTP_LOGIN, pass: SMTP_KEY },
  });

  // 🛡️ SPAM FIX: Create a text-only fallback from HTML
  const plainText = mailOptions.html 
    ? (mailOptions.html as string).replace(/<[^>]*>?/gm, '').trim() 
    : "";

  const enhancedMailOptions = {
      ...mailOptions,
      text: plainText, // ✅ CRITICAL FOR INBOX DELIVERY
      headers: {
          ...mailOptions.headers,
          'X-Entity-Ref-ID': `DPX-${Date.now()}`, 
          'X-Priority': '1',
          'Importance': 'high'
      }
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail(enhancedMailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      if (attempt === retries) return { success: false, error };
      await new Promise(res => setTimeout(res, 1000));
    }
  }
  return { success: false, error: "Unknown Error" };
};

// --- 6. 🌟 EXPORTED API FUNCTIONS ---

export async function sendWelcomePack(clientEmail: string) {
  const ticketId = `DPX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const nameRaw = clientEmail.split('@')[0];
  const name = nameRaw ? nameRaw.charAt(0).toUpperCase() + nameRaw.slice(1).replace(/[0-9._-]/g, ' ') : "Visionary";
  const safeName = escapeHtml(name);

  return await sendWithRetry({
    from: `"Digital Pixora HQ" <${SENDER_IDENTITY}>`,
    to: clientEmail,
    subject: `⚡ Project Analysis Initiated: [Ref ${ticketId}]`,
    html: getClientTemplate(safeName, ticketId),
  });
}

export async function sendAdminNotification(data: { name: string; email: string; message: string }, context: any) {
  const score = calculateLeadScore(data.message);
  return await sendWithRetry({
    from: `"Pixora Intelligence" <${SENDER_IDENTITY}>`,
    to: SENDER_IDENTITY,
    replyTo: data.email,
    subject: `📩 [${score}%] NEW FORM LEAD: ${data.name}`,
    html: getAdminTemplate(data, score, "FORM", context),
  });
}

export async function sendSpyAlert(transcript: string, contact: string, location: string) {
  const score = calculateLeadScore(transcript);
  const data = { name: contact, email: "Chat Visitor", message: transcript };
  const context = { location, localTime: new Date().toLocaleTimeString() };

  return await sendWithRetry({
    from: `"Pixora Intelligence" <${SENDER_IDENTITY}>`,
    to: SENDER_IDENTITY,
    subject: `🔥 [${score}%] HOT CHAT LEAD: ${contact}`,
    html: getAdminTemplate(data, score, "CHAT", context),
  });
}